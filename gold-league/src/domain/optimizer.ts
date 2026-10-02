import type { Item } from "./items";
import { isBuildTarget } from "./eligibility";
export function optimizeBuild(
  items: readonly Item[],
  budget: number,
  category = "all",
): Item[] {
  const limit = Math.min(30000, Math.max(0, Math.floor(budget / 25) * 25));
  const pool = items.filter(
    (i) =>
      i.cost > 0 &&
      i.value > 0 &&
      isBuildTarget(i) &&
      (category === "all" || i.tags.includes(category)),
  );
  type Cell = { value: number; items: Item[] };
  const dp: (Cell | undefined)[][] = Array.from({ length: 7 }, () =>
    Array(limit / 25 + 1),
  );
  for (let w = 0; w <= limit / 25; w++) dp[0]![w] = { value: 0, items: [] };
  for (const item of pool) {
    const cost = Math.ceil(item.cost / 25);
    for (let k = 6; k >= 1; k--)
      for (let w = limit / 25; w >= cost; w--) {
        const base = dp[k - 1]![w - cost];
        if (base && (!dp[k]![w] || base.value + item.value > dp[k]![w]!.value))
          dp[k]![w] = {
            value: base.value + item.value,
            items: [...base.items, item],
          };
      }
  }
  let best: Cell = { value: 0, items: [] };
  for (const row of dp)
    for (const cell of row) if (cell && cell.value > best.value) best = cell;
  return best.items;
}
