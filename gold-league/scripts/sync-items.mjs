import { writeFile } from "node:fs/promises";
const api = "https://valuebuild-web.onrender.com/api";
const get = async (path) => {
  const r = await fetch(api + path);
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json();
};
const [response, metadata] = await Promise.all([
  get("/items"),
  get("/metadata"),
]);
if (!response.items?.length || !metadata.patch)
  throw new Error("Empty snapshot");
await writeFile(
  "src/data/items.snapshot.json",
  JSON.stringify({
    version: metadata.patch,
    fetchedAt: metadata.lastUpdated,
    data: Object.fromEntries(response.items.map((item) => [item.id, item])),
  }),
);
console.log(
  `Saved ${response.items.length} backend-calculated items from patch ${metadata.patch}`,
);
