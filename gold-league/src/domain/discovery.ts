import type { Item } from './items';
export const roles = ['all', 'marksman', 'mage', 'tank', 'fighter', 'assassin', 'support'].map(value => ({value, label: value === 'all' ? 'All roles' : value[0]!.toUpperCase() + value.slice(1)}));
export function matchesRole(item: Item, role: string) {
  const s = item.stats;
  switch (role) {
    case 'marksman': return !!(s.FlatPhysicalDamageMod || s.FlatCritChanceMod || s.PercentAttackSpeedMod);
    case 'mage': return !!(s.FlatMagicDamageMod || s.FlatMPRegenMod);
    case 'tank': return !!(s.FlatHPPoolMod || s.FlatArmorMod || s.FlatSpellBlockMod);
    case 'fighter': return !!((s.FlatPhysicalDamageMod && s.FlatHPPoolMod) || s.PercentLifeStealMod);
    case 'assassin': return !!(s.FlatPhysicalDamageMod && !s.FlatCritChanceMod);
    case 'support': return !!(s.FlatMPRegenMod || s.FlatHPRegenMod);
    default: return true;
  }
}
const aliases: Record<string, string[]> = {
 ad: ['FlatPhysicalDamageMod'], ap: ['FlatMagicDamageMod'], hp: ['FlatHPPoolMod'],
 mr: ['FlatSpellBlockMod'], crit: ['FlatCritChanceMod', 'PercentCritChanceMod'],
 as: ['PercentAttackSpeedMod'], ms: ['FlatMovementSpeedMod'],
 lifesteal: ['PercentLifeStealMod'], haste: ['AbilityHaste'],
};
export function matchesQuery(item: Item, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (aliases[q]) return aliases[q]!.some(key => (item.stats[key] || 0) > 0);
  return `${item.name} ${item.plaintext} ${item.colloq} ${item.breakdown.map(s => s.label).join(' ')}`.toLowerCase().includes(q);
}
export function matchesTier(item: Item, tier: string) {
  if (tier === 'legendary') return item.cost >= 2500 && !item.into?.length;
  if (tier === 'epic') return item.cost >= 1200 && item.cost < 2500;
  if (tier === 'component') return !!item.into?.length && item.cost < 1200;
  if (tier === 'basic') return item.cost < 500;
  return true;
}
