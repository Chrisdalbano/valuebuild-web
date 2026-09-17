import { writeFile } from 'node:fs/promises';
const versions = await fetch('https://ddragon.leagueoflegends.com/api/versions.json').then(r => r.json());
const data = await fetch(`https://ddragon.leagueoflegends.com/cdn/${versions[0]}/data/en_US/item.json`).then(r => r.json());
const filtered = Object.fromEntries(Object.entries(data.data).filter(([,i])=>i.maps?.['11'] && i.gold?.purchasable && i.gold.total>0 && i.inStore!==false && !i.hideFromAll && !i.requiredChampion && !i.requiredAlly));
await writeFile('src/data/items.snapshot.json', JSON.stringify({ version:data.version, data:filtered, fetchedAt:new Date().toISOString() }));
console.log(`Snapshot: ${data.version}, ${Object.keys(filtered).length} items`);
