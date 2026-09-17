export interface RawItem {
  name: string; description: string; plaintext?: string; colloq?: string;
  gold: { total: number; base: number; sell: number; purchasable: boolean };
  maps: Record<string, boolean>; stats: Record<string, number>; tags: string[];
  image: { full: string }; from?: string[]; into?: string[];
  inStore?: boolean; hideFromAll?: boolean; requiredChampion?: string; requiredAlly?: string;
}
export interface Item extends RawItem {
  id: string; cost: number; value: number; efficiency: number; imageUrl: string;
  text: string; breakdown: { key: string; label: string; amount: number; value: number }[];
}
export interface Dataset { version: string; data: Record<string, RawItem>; fetchedAt?: string }
export const statDefinitions: Record<string, { label: string; reference: string; percent?: boolean }> = {
  FlatPhysicalDamageMod: { label: 'Attack damage', reference: '1036' },
  FlatMagicDamageMod: { label: 'Ability power', reference: '1052' },
  FlatArmorMod: { label: 'Armor', reference: '1029' },
  FlatSpellBlockMod: { label: 'Magic resist', reference: '1033' },
  FlatHPPoolMod: { label: 'Health', reference: '1028' },
  FlatMPPoolMod: { label: 'Mana', reference: '1027' },
  FlatMovementSpeedMod: { label: 'Move speed', reference: '1001' },
  PercentAttackSpeedMod: { label: 'Attack speed', reference: '1042', percent: true },
  FlatCritChanceMod: { label: 'Critical chance', reference: '1051', percent: true },
};
export function plainText(html: string): string {
  return html.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/[ \t]+/g, ' ').trim();
}
export function normalizeItems(dataset: Dataset): Item[] {
  return Object.entries(dataset.data).filter(([, item]) => item.name && item.maps?.['11'] && item.gold?.purchasable && item.gold.total > 0 && item.inStore !== false && !item.hideFromAll && !item.requiredChampion && !item.requiredAlly).map(([id, item]) => {
    const breakdown = Object.entries(item.stats).flatMap(([key, amount]) => {
      const def = statDefinitions[key];
      const base = def && dataset.data[def.reference];
      const unit = base?.stats[key] ? base.gold.total / base.stats[key]! : 0;
      return def && unit && amount ? [{ key, label: def.label, amount, value: amount * unit }] : [];
    });
    const value = breakdown.reduce((sum, stat) => sum + stat.value, 0);
    return { ...item, id, cost: item.gold.total, value, efficiency: value / item.gold.total * 100, breakdown, text: plainText(item.description), imageUrl: `https://ddragon.leagueoflegends.com/cdn/${dataset.version}/img/item/${item.image.full}` };
  }).sort((a, b) => b.cost - a.cost || a.name.localeCompare(b.name));
}
export function totals(items: readonly Item[]) {
  const cost = items.reduce((sum, item) => sum + item.cost, 0);
  const value = items.reduce((sum, item) => sum + item.value, 0);
  const stats: Record<string, number> = {};
  for (const item of items) for (const stat of item.breakdown) stats[stat.key] = (stats[stat.key] || 0) + stat.amount;
  return { cost, value, efficiency: cost ? value / cost * 100 : 0, stats };
}
export const number = (value: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
export const statAmount = (key: string, value: number) => statDefinitions[key]?.percent ? `${number(value * 100)}%` : number(value);
export function parseIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is string => typeof id === 'string' && /^\d{3,6}$/.test(id)))].slice(0, 6);
}

