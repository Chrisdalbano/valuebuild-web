"""
DDragon ETL Pipeline
Extracts item data from DDragon API, transforms it, and loads into MongoDB
Runs weekly to keep data fresh and filters deprecated items at source
"""

import asyncio
import requests
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReplaceOne
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import os
from typing import List, Dict, Optional

# Import our efficiency calculation and deprecated items filter
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from efficiency import calculate_efficiency
from etl.deprecated_items import is_item_deprecated, DEPRECATED_ITEM_IDS


class DDragonETL:
    """ETL Pipeline for DDragon item data"""
    
    def __init__(self, mongo_uri: str = "mongodb://localhost:27017"):
        self.client = AsyncIOMotorClient(mongo_uri)
        self.db = self.client['gold_league']
        self.items_collection = self.db['items_cache']
        self.metadata_collection = self.db['etl_metadata']
        self.ddragon_base = "https://ddragon.leagueoflegends.com"
    
    async def fetch_latest_patch(self) -> str:
        """Get latest patch version from DDragon"""
        try:
            url = f"{self.ddragon_base}/api/versions.json"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            versions = response.json()
            latest = versions[0]
            print(f"📦 Latest patch: {latest}")
            return latest
        except Exception as e:
            print(f"❌ Error fetching patch version: {e}")
            return "14.20.1"  # Fallback
    
    async def validate_image(self, item_id: str, patch: str) -> bool:
        """
        STRICT image validation - ensures image exists and is valid
        This prevents frontend from showing broken images
        """
        image_url = f"{self.ddragon_base}/cdn/{patch}/img/item/{item_id}.png"
        try:
            # First try HEAD request
            response = requests.head(image_url, timeout=5, allow_redirects=True)
            
            if response.status_code != 200:
                print(f"⚠️  Image validation failed for item {item_id}: HTTP {response.status_code}")
                return False
            
            # Check content-type to ensure it's actually an image
            content_type = response.headers.get('Content-Type', '')
            if not content_type.startswith('image/'):
                print(f"⚠️  Image validation failed for item {item_id}: Invalid content-type '{content_type}'")
                return False
            
            # If HEAD doesn't provide enough info, do a GET request to verify
            # Check file size - valid images should be > 500 bytes
            content_length = response.headers.get('Content-Length')
            if content_length:
                size = int(content_length)
                if size < 500:  # Too small to be a real item image
                    print(f"⚠️  Image validation failed for item {item_id}: File too small ({size} bytes)")
                    return False
            else:
                # No content-length header, do a partial GET to verify
                get_response = requests.get(image_url, timeout=5, stream=True)
                if get_response.status_code != 200:
                    print(f"⚠️  Image validation failed for item {item_id}: GET request failed")
                    return False
                
                # Read first 1KB to verify it's a valid PNG
                chunk = next(get_response.iter_content(1024))
                if not chunk.startswith(b'\x89PNG'):
                    print(f"⚠️  Image validation failed for item {item_id}: Not a valid PNG file")
                    return False
            
            return True
            
        except Exception as e:
            print(f"⚠️  Image validation error for item {item_id}: {e}")
            return False
    
    def should_include_item(self, item: Dict) -> bool:
        """
        Determine if item should be included based on Riot's data
        Matches backend/riot_client.py logic
        """
        name = item.get("name", "")
        gold = item.get("gold", {})
        maps_data = item.get("maps", {})
        stats = item.get("stats", {})
        item_id = str(item.get("id", ""))
        description = item.get("description", "")
        
        # Check against deprecated items blacklist
        if item_id in DEPRECATED_ITEM_IDS:
            return False
        
        # Exclude items with "mythic" in description
        if "mythic" in description.lower():
            return False
        
        # Exclude items with specific deprecated keywords
        # NOTE: Removed "old" keyword - causes false positives (e.g., items with "gold" in description)
        deprecated_keywords = ["removed", "mythic", "deprecated", "legacy"]
        name_lower = name.lower()
        if any(keyword in name_lower for keyword in deprecated_keywords):
            return False
        
        # Exclude Arena mode items (special ID prefixes for 5+ digit IDs)
        # Arena items: 223094, 326672, etc. (5+ digits)
        # Regular items: 3094, 6672, etc. (4 digits or less)
        if len(item_id) >= 5 and (
            item_id.startswith("22") or 
            item_id.startswith("32") or 
            item_id.startswith("44") or
            item_id.startswith("88") or
            item_id.startswith("99")
        ):
            return False
        
        # Must be available on Summoner's Rift (map ID "11")
        if not maps_data.get("11", False):
            return False
        
        # Must be purchasable
        if not gold.get("purchasable", False):
            return False
        
        # Must have a total cost > 0
        if gold.get("total", 0) <= 0:
            return False
        
        # Include if it has any stats OR effects (description)
        if stats or (description and len(description) > 20):
            return True
        
        return False
    
    async def extract_and_transform(self) -> int:
        """
        Main ETL process: Extract from DDragon, Transform, Load to MongoDB
        Returns: Number of items successfully loaded
        """
        print("\n" + "="*60)
        print("🔄 Starting DDragon ETL Pipeline...")
        print("="*60 + "\n")
        
        start_time = datetime.utcnow()
        
        try:
            # 1. EXTRACT: Get latest data from DDragon
            patch = await self.fetch_latest_patch()
            url = f"{self.ddragon_base}/cdn/{patch}/data/en_US/item.json"
            
            print(f"📥 Fetching items from: {url}")
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            raw_data = response.json()
            raw_items = raw_data.get('data', {})
            
            print(f"✅ Fetched {len(raw_items)} raw items from DDragon\n")
            
            # 2. TRANSFORM: Filter, validate, and enrich
            valid_items = []
            filtered_counts = {
                'deprecated': 0,
                'no_image': 0,
                'riot_filter': 0,
                'total': 0
            }
            
            print("🔍 Processing items...")
            for item_id, item_data in raw_items.items():
                item_data['id'] = item_id
                
                # Check Riot's inclusion criteria
                if not self.should_include_item(item_data):
                    filtered_counts['riot_filter'] += 1
                    continue
                
                # Check if deprecated (our custom filter)
                if is_item_deprecated(item_data):
                    print(f"  ⛔ Filtered deprecated: {item_data.get('name')} (ID: {item_id})")
                    filtered_counts['deprecated'] += 1
                    continue
                
                # Validate image exists
                has_image = await self.validate_image(item_id, patch)
                if not has_image:
                    print(f"  🖼️  Filtered (no image): {item_data.get('name')} (ID: {item_id})")
                    filtered_counts['no_image'] += 1
                    continue
                
                # Calculate gold efficiency using existing backend logic
                try:
                    efficiency_result = calculate_efficiency(item_data)
                    
                    # Prepare item for MongoDB storage
                    valid_item = {
                        '_id': item_id,
                        'id': item_id,  # Keep for compatibility
                        'name': item_data.get('name', ''),
                        'cost': efficiency_result.get('cost', 0),
                        'goldEfficiency': efficiency_result.get('goldEfficiency', 0),
                        'totalGoldValue': efficiency_result.get('totalGoldValue', 0),
                        'statBreakdown': efficiency_result.get('statBreakdown', {}),
                        'description': item_data.get('description', ''),
                        'stats': item_data.get('stats', {}),
                        'tags': item_data.get('tags', []),
                        'from': item_data.get('from', []),  # Component items
                        'into': item_data.get('into', []),  # Builds into
                        'imageUrl': f"{self.ddragon_base}/cdn/{patch}/img/item/{item_id}.png",
                        'imageValidated': True,
                        'isDeprecated': False,
                        'patch': patch,
                        'lastUpdated': datetime.utcnow(),
                        'maps': item_data.get('maps', {}),
                        'gold': item_data.get('gold', {})
                    }
                    
                    valid_items.append(valid_item)
                    
                except Exception as e:
                    print(f"  ⚠️  Error processing {item_data.get('name')}: {e}")
                    continue
            
            filtered_counts['total'] = (
                filtered_counts['deprecated'] + 
                filtered_counts['no_image'] + 
                filtered_counts['riot_filter']
            )
            
            print(f"\n📊 Processing Summary:")
            print(f"  ✅ Valid items: {len(valid_items)}")
            print(f"  ⛔ Filtered (deprecated): {filtered_counts['deprecated']}")
            print(f"  🖼️  Filtered (no image): {filtered_counts['no_image']}")
            print(f"  🎮 Filtered (Riot criteria): {filtered_counts['riot_filter']}")
            print(f"  📉 Total filtered: {filtered_counts['total']}\n")
            
            # 3. LOAD: Bulk write to MongoDB
            if valid_items:
                print(f"💾 Writing {len(valid_items)} items to MongoDB...")
                
                # Use bulk operations for efficiency
                operations = [
                    ReplaceOne({'_id': item['_id']}, item, upsert=True)
                    for item in valid_items
                ]
                
                result = await self.items_collection.bulk_write(operations)
                
                print(f"  ✅ Upserted: {result.upserted_count}")
                print(f"  ✅ Modified: {result.modified_count}")
                
                # Update metadata
                next_update = datetime.utcnow() + timedelta(days=7)
                metadata = {
                    '_id': 'latest',
                    'patch': patch,
                    'lastUpdated': datetime.utcnow(),
                    'processingTime': (datetime.utcnow() - start_time).total_seconds(),
                    'itemCount': len(valid_items),
                    'filteredCounts': filtered_counts,
                    'nextScheduledUpdate': next_update,
                    'status': 'success'
                }
                
                await self.metadata_collection.replace_one(
                    {'_id': 'latest'},
                    metadata,
                    upsert=True
                )
                
                print(f"\n✅ ETL Pipeline Complete!")
                print(f"⏱️  Processing time: {metadata['processingTime']:.2f}s")
                print(f"📅 Next update scheduled: {next_update.strftime('%Y-%m-%d %H:%M UTC')}")
                print("="*60 + "\n")
                
                return len(valid_items)
            else:
                print("❌ No valid items to store!")
                return 0
                
        except Exception as e:
            print(f"\n❌ ETL Pipeline Failed: {e}")
            
            # Store error in metadata
            await self.metadata_collection.replace_one(
                {'_id': 'latest'},
                {
                    '_id': 'latest',
                    'lastUpdated': datetime.utcnow(),
                    'status': 'error',
                    'error': str(e)
                },
                upsert=True
            )
            
            raise


class ETLScheduler:
    """Manages scheduled ETL jobs"""
    
    def __init__(self, mongo_uri: str = "mongodb://localhost:27017"):
        self.etl = DDragonETL(mongo_uri)
        self.scheduler = AsyncIOScheduler()
    
    async def run_etl_job(self):
        """Wrapper to run ETL job"""
        try:
            await self.etl.extract_and_transform()
        except Exception as e:
            print(f"❌ Scheduled ETL job failed: {e}")
    
    def start(self):
        """Start the scheduler with weekly job"""
        # Schedule: Every Monday at 2:00 AM UTC
        self.scheduler.add_job(
            self.run_etl_job,
            CronTrigger(day_of_week='mon', hour=2, minute=0),
            id='weekly_ddragon_update',
            name='Weekly DDragon Data Update',
            replace_existing=True
        )
        
        print("📅 ETL Scheduler configured:")
        print("  ⏰ Schedule: Every Monday at 2:00 AM UTC")
        print("  🔄 Job: Update DDragon item data")
        
        self.scheduler.start()
        print("✅ ETL Scheduler started!\n")
    
    def stop(self):
        """Stop the scheduler"""
        self.scheduler.shutdown()
        print("🛑 ETL Scheduler stopped")


# Convenience function for manual runs
async def run_etl_now(mongo_uri: str = "mongodb://localhost:27017"):
    """Run ETL pipeline immediately (for testing or manual refresh)"""
    etl = DDragonETL(mongo_uri)
    return await etl.extract_and_transform()


if __name__ == "__main__":
    # Allow running ETL directly for testing
    import asyncio
    print("🚀 Running ETL Pipeline (Manual Execution)...\n")
    result = asyncio.run(run_etl_now())
    print(f"\n🎉 ETL Complete! Processed {result} items.")

