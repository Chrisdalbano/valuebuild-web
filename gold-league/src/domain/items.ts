export interface RawItem {
  id?: string;
  cost?: number;
  goldEfficiency?: number;
  totalGoldValue?: number;
  statBreakdown?: Record<string, { amount: number; goldValue: number }>;
  imageUrl?: string;
  name: string;
  description: string;
  plaintext?: string;
  colloq?: string;
  gold: { total: number; base: number; sell: number; purchasable: boolean };
  maps: Record<string, boolean>;
  stats: Record<string, number>;
  tags: string[];
  image?: { full: string };
  from?: string[];
  into?: string[];
  inStore?: boolean;
  hideFromAll?: boolean;
  requiredChampion?: string;
  requiredAlly?: string;
}
export interface Item extends RawItem {
  id: string;
  cost: number;
  value: number;
  efficiency: number;
  imageUrl: string;
  text: string;
  breakdown: { key: string; label: string; amount: number; value: number }[];
}
export interface Dataset {
  version: string;
  data: Record<string, RawItem>;
  fetchedAt?: string;
}
export const statDefinitions: Record<
  string,
  { label: string; reference: string; percent?: boolean }
> = {
  FlatPhysicalDamageMod: { label: "Attack damage", reference: "1036" },
  FlatMagicDamageMod: { label: "Ability power", reference: "1052" },
  FlatArmorMod: { label: "Armor", reference: "1029" },
  FlatSpellBlockMod: { label: "Magic resist", reference: "1033" },
  FlatHPPoolMod: { label: "Health", reference: "1028" },
  FlatMPPoolMod: { label: "Mana", reference: "1027" },
  FlatMovementSpeedMod: { label: "Move speed", reference: "1001" },
  PercentAttackSpeedMod: {
    label: "Attack speed",
    reference: "1042",
    percent: true,
  },
  AbilityHaste: { label: "Ability haste", reference: "" },
  FlatHPRegenMod: {
    label: "Base health regen",
    reference: "1006",
    percent: true,
  },
  FlatMPRegenMod: {
    label: "Base mana regen",
    reference: "1004",
    percent: true,
  },
  PercentLifeStealMod: { label: "Lifesteal", reference: "1053", percent: true },
  PercentCritChanceMod: {
    label: "Critical chance",
    reference: "1051",
    percent: true,
  },
  FlatCritChanceMod: {
    label: "Critical chance",
    reference: "1051",
    percent: true,
  },
};
export function plainText(html: string): string {
  return html
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .trim();
}
const strings = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];
const finite = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
/**
 * Adapt the API's records for the interface. Values come from the backend and
 * are not recalculated, but their shape is not trusted: a record without a
 * name or a positive cost is dropped, and malformed fields fall back to empty
 * values so one bad record cannot break the catalog.
 */
export function normalizeItems(dataset: Dataset): Item[] {
  return Object.entries(record(dataset?.data) as Record<string, RawItem>)
    .filter(
      ([, item]) =>
        item &&
        typeof item.name === "string" &&
        item.name.length > 0 &&
        finite(item.cost) > 0,
    )
    .map(([id, item]) => {
      const breakdown = Object.entries(record(item.statBreakdown)).flatMap(
        ([key, raw]) => {
          const stat = record(raw);
          if (
            typeof stat.amount !== "number" ||
            !Number.isFinite(stat.amount) ||
            typeof stat.goldValue !== "number" ||
            !Number.isFinite(stat.goldValue)
          )
            return [];
          return [
            {
              key,
              label: statDefinitions[key]?.label || key,
              amount: stat.amount,
              value: stat.goldValue,
            },
          ];
        },
      );
      const description =
        typeof item.description === "string" ? item.description : "";
      const baseStats = Object.fromEntries(
        Object.entries(record(item.stats)).filter(
          (entry): entry is [string, number] =>
            typeof entry[1] === "number" && Number.isFinite(entry[1]),
        ),
      );
      return {
        ...item,
        id,
        description,
        tags: strings(item.tags),
        from: strings(item.from),
        into: strings(item.into),
        cost: finite(item.cost),
        value: finite(item.totalGoldValue),
        efficiency: finite(item.goldEfficiency),
        breakdown,
        stats: {
          ...baseStats,
          ...Object.fromEntries(breakdown.map((s) => [s.key, s.amount])),
        },
        text: plainText(description),
        imageUrl: `https://ddragon.leagueoflegends.com/cdn/${dataset.version}/img/item/${id}.png`,
      };
    })
    .sort((a, b) => b.cost - a.cost || a.name.localeCompare(b.name));
}
export function totals(items: readonly Item[]) {
  const cost = items.reduce((sum, item) => sum + item.cost, 0);
  const value = items.reduce((sum, item) => sum + item.value, 0);
  const stats: Record<string, number> = {};
  for (const item of items)
    for (const stat of item.breakdown)
      stats[stat.key] = (stats[stat.key] || 0) + stat.amount;
  return { cost, value, efficiency: cost ? (value / cost) * 100 : 0, stats };
}
export const number = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
export const statAmount = (key: string, value: number) =>
  statDefinitions[key]?.percent ? `${number(value * 100)}%` : number(value);
export function parseIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value.filter(
        (id): id is string => typeof id === "string" && /^\d{3,6}$/.test(id),
      ),
    ),
  ].slice(0, 6);
}
