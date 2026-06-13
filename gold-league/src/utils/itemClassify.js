// Item categorisation driven by Riot's own `tags` array + statBreakdown, NOT by
// loose champion-role inference. The old role matchers guessed a champion class
// from stat presence with pure OR logic (e.g. "has HP" => support), so nearly
// every item matched every role — Death's Dance landed in "support". These rules
// are tag-primary with AND/exclusion logic so categories stay honest.

const tags = item => (Array.isArray(item.tags) ? item.tags : [])
const stat = (item, key) => item.statBreakdown && item.statBreakdown[key]

export function isBoots(item) {
  return tags(item).includes('Boots')
}

// Tier-3 boot upgrades (Crimson Lucidity, Swiftmarch, Spellslinger's Shoes, …)
// are conditional late-game upgrades, not items you build directly, so they
// shouldn't appear in build suggestions. Tell: tier-2 boots build FROM basic
// Boots (1001); the tier-3 upgrades build from a tier-2 boot, so their `from`
// does NOT include 1001.
export function isTier3Boots(item) {
  if (!isBoots(item)) return false
  const from = Array.isArray(item.from) ? item.from : []
  return from.length > 0 && !from.includes('1001')
}

// The real support items (World Atlas line) carry Riot's `GoldPer` tag. They are
// purchasable:true (the non-purchasable IDs are turret/dummy entities the ETL
// already drops), so detection is the tag, never the purchasable flag.
export function isSupport(item) {
  return tags(item).includes('GoldPer')
}

export function isConsumable(item) {
  const t = tags(item)
  return t.includes('Consumable') || t.includes('Trinket')
}

export function isStarter(item) {
  if (isBoots(item) || isSupport(item) || isConsumable(item)) return false
  return item.cost <= 500 && Array.isArray(item.into) && item.into.length > 0
}

// category -> predicate. Tag-first; falls back to statBreakdown for stat buckets
// that Riot doesn't always tag consistently.
const MATCHERS = {
  boots: isBoots,
  support: isSupport,
  consumable: isConsumable,
  starter: isStarter,
  ad: item => !!stat(item, 'FlatPhysicalDamageMod'),
  ap: item => !!stat(item, 'FlatMagicDamageMod'),
  // tank is the only class-ish bucket that's honestly derivable: real resist + HP
  tank: item =>
    (!!stat(item, 'FlatArmorMod') || !!stat(item, 'FlatSpellBlockMod')) && !!stat(item, 'FlatHPPoolMod'),
  crit: item => tags(item).includes('CriticalStrike') || !!stat(item, 'FlatCritChanceMod'),
  attackSpeed: item => tags(item).includes('AttackSpeed') || !!stat(item, 'PercentAttackSpeedMod'),
  lethality: item => tags(item).includes('ArmorPenetration'),
  magicPen: item => tags(item).includes('MagicPenetration'),
  onHit: item => tags(item).includes('OnHit'),
  abilityHaste: item => !!stat(item, 'AbilityHaste') || tags(item).includes('CooldownReduction'),
}

export function matchesCategory(item, category) {
  if (!category || category === 'all') return true
  const fn = MATCHERS[category]
  return fn ? fn(item) : true
}

export function classifyItem(item) {
  const categories = new Set()
  for (const [key, fn] of Object.entries(MATCHERS)) {
    if (fn(item)) categories.add(key)
  }
  return {
    categories,
    isSupport: isSupport(item),
    isBoots: isBoots(item),
    isStarter: isStarter(item),
    isConsumable: isConsumable(item),
  }
}
