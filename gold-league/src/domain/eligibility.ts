import type { Item } from "./items";

const BASIC_BOOTS_ID = "1001";
const NOT_BUILD_TAGS = ["Consumable", "Trinket", "GoldPer"];

/** Tier-two boots build directly from basic Boots. */
export function isTierTwoBoots(item: Item): boolean {
  return item.tags.includes("Boots") && !!item.from?.includes(BASIC_BOOTS_ID);
}

/** Tier-three boots are conditional upgrades of a tier-two boot. */
export function isTierThreeBoots(item: Item): boolean {
  return (
    item.tags.includes("Boots") &&
    !!item.from?.length &&
    !item.from.includes(BASIC_BOOTS_ID)
  );
}

/**
 * A finished item a build can end on. Mirrors `select_build_items` in
 * backend/ai/enrich.py: built from components, not a component itself, not a
 * consumable or support income item, and not a tier-three boot upgrade.
 * Tier-two boots count as finished even though they upgrade further.
 */
export function isBuildTarget(item: Item): boolean {
  if (!item.from?.length) return false;
  if (item.tags.some((tag) => NOT_BUILD_TAGS.includes(tag))) return false;
  if (isTierThreeBoots(item)) return false;
  if (item.into?.length && !isTierTwoBoots(item)) return false;
  return true;
}
