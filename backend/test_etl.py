"""
Quick test script for ETL pipeline
Run this to test the ETL without starting the full server
"""

import asyncio
from etl.data_pipeline import run_etl_now

async def main():
    print("Testing ETL Pipeline...\n")
    
    try:
        result = await run_etl_now()
        print(f"\n[SUCCESS] Test successful! Processed {result} items.")
        print("\nNext steps:")
        print("   1. Start MongoDB: docker run -d -p 27017:27017 mongo")
        print("   2. Run backend: python app.py")
        print("   3. Check data: http://localhost:8000/api/metadata")
        
    except Exception as e:
        print(f"\n[ERROR] Test failed: {e}")
        print("\nMake sure MongoDB is running:")
        print("   docker run -d -p 27017:27017 mongo")

if __name__ == "__main__":
    asyncio.run(main())

