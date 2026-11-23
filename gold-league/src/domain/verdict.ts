import type { Item } from "./items";
/**
 * Reading aids over backend numbers. Nothing here recalculates efficiency;
 * it only names the band a returned value falls in.
 */
export type VerdictKey = "excellent" | "good" | "fair" | "low";
export interface Verdict {
  key: VerdictKey;
  label: string;
}
/** Four bands: 120 and up, 100 and up, 80 and up, below 80. */
export function efficiencyVerdict(efficiency: number): Verdict {
  if (efficiency >= 120) return { key: "excellent", label: "Excellent" };
  if (efficiency >= 100) return { key: "good", label: "Good" };
  if (efficiency >= 80) return { key: "fair", label: "Fair" };
  return { key: "low", label: "Low" };
}
export type TierKey = "legendary" | "epic" | "component" | "basic";
/** Item tier by cost and build path, as the catalog filter defines it. */
export function itemTier(item: Pick<Item, "cost" | "into">): {
  key: TierKey;
  label: string;
} {
  if (item.cost >= 2500) return { key: "legendary", label: "Legendary" };
  if (item.cost >= 1200) return { key: "epic", label: "Epic" };
  if (item.into?.length) return { key: "component", label: "Component" };
  return { key: "basic", label: "Basic" };
}
/** Gold paid on top of the components to finish the item. */
export const combineCost = (item: Item) => item.gold?.base ?? 0;
export function componentsOf(item: Item, catalog: readonly Item[]): Item[] {
  return (item.from || []).flatMap(
    (id) => catalog.find((entry) => entry.id === id) || [],
  );
}
/** Each priced stat's share of the item's stat value, largest first. */
export function statShares(item: Pick<Item, "breakdown" | "value">) {
  const total = item.breakdown.reduce((sum, stat) => sum + stat.value, 0);
  return [...item.breakdown]
    .sort((a, b) => b.value - a.value)
    .map((stat) => ({
      ...stat,
      share: total ? (stat.value / total) * 100 : 0,
    }));
}
/** Gold per stat summed over several items, largest first. */
export function statMix(items: readonly Item[]) {
  const mix = new Map<string, { key: string; label: string; value: number }>();
  for (const item of items)
    for (const stat of item.breakdown) {
      const entry = mix.get(stat.key) || {
        key: stat.key,
        label: stat.label,
        value: 0,
      };
      entry.value += stat.value;
      mix.set(stat.key, entry);
    }
  return [...mix.values()].sort((a, b) => b.value - a.value);
}
/** Stable series colour per stat, so a stat reads the same on every chart. */
const order = [
  "FlatPhysicalDamageMod",
  "FlatMagicDamageMod",
  "FlatHPPoolMod",
  "FlatArmorMod",
  "FlatSpellBlockMod",
  "PercentAttackSpeedMod",
  "FlatCritChanceMod",
  "AbilityHaste",
  "FlatMPPoolMod",
  "PercentLifeStealMod",
  "FlatMovementSpeedMod",
  "FlatHPRegenMod",
  "FlatMPRegenMod",
];
export function seriesColor(key: string, index = 0): string {
  const normal = key === "PercentCritChanceMod" ? "FlatCritChanceMod" : key;
  const at = order.indexOf(normal);
  return `var(--bv-series-${((at < 0 ? index : at) % 8) + 1})`;
}
export interface EffectPart {
  kind: "passive" | "active" | "text";
  name: string;
  text: string;
}
/**
 * Data Dragon marks named effects with <passive> and <active> tags. Keep that
 * structure for display instead of flattening it; the stats block is dropped
 * because it is already shown as priced stats.
 */
export function effectParts(description: string): EffectPart[] {
  if (typeof description !== "string" || !description) return [];
  const clean = (value: string) =>
    value
      .replace(/<br\s*\/?\s*>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
  const body = description.replace(/<stats>[\s\S]*?<\/stats>/gi, "");
  const parts: EffectPart[] = [];
  const marker = /<(passive|active)>([\s\S]*?)<\/\1>/gi;
  let last = 0,
    current: EffectPart | null = null,
    match: RegExpExecArray | null;
  const push = (text: string) => {
    const value = clean(text);
    if (current) {
      current.text = value;
      parts.push(current);
    } else if (value) parts.push({ kind: "text", name: "", text: value });
  };
  while ((match = marker.exec(body))) {
    push(body.slice(last, match.index));
    current = {
      kind: match[1]!.toLowerCase() as "passive" | "active",
      name: clean(match[2]!),
      text: "",
    };
    last = marker.lastIndex;
  }
  push(body.slice(last));
  return parts.filter((part) => part.name || part.text);
}
/** Tank: a resistance and health. Starter: cheap and builds into something. */
export function isTankItem(item: Item) {
  const s = item.stats;
  return !!((s.FlatArmorMod || s.FlatSpellBlockMod) && s.FlatHPPoolMod);
}
export function isStarterItem(item: Item) {
  const tags = item.tags;
  if (
    tags.includes("Boots") ||
    tags.includes("GoldPer") ||
    tags.includes("Consumable") ||
    tags.includes("Trinket")
  )
    return false;
  return item.cost <= 500 && !!item.into?.length;
}
