/** Shapes of GET /api/tft/set and the bundled snapshot (backend/tft). */
export interface TftUnit {
  id: string;
  name: string;
  cost: number;
  traits: string[];
  icon: string | null;
  /** Base unit's name when this entry is a form of another unit. */
  variantOf: string | null;
  ability: string;
  stats: {
    hp: number;
    ad: number;
    attackSpeed: number;
    armor: number;
    magicResist: number;
    mana: number;
    initialMana: number;
    range: number;
    critChance: number;
    critMultiplier: number;
  };
}
export interface TftTrait {
  id: string;
  name: string;
  icon: string | null;
  breakpoints: { units: number; style: number }[];
}
export interface TftComponent {
  id: string;
  name: string;
  icon: string | null;
  text: string;
  stat: string | null;
  amount: number | null;
}
export interface TftStatLine {
  key: string;
  label: string;
  unit: "flat" | "percent" | "percent_fraction";
  amount: number;
  components: number;
}
export interface TftItem {
  id: string;
  name: string;
  icon: string | null;
  text: string;
  composition: string[];
  statBreakdown: TftStatLine[];
  statComponents: number;
  componentsSpent: number;
  statEfficiency: number | null;
  unpricedEffects: string[];
}
export interface TftSource {
  label: string;
  url: string;
  checked: string;
}
export interface TftEconomy {
  set: number;
  verified: boolean;
  note: string;
  /** Percent chance per shop slot of each cost tier, by player level. */
  shopOdds: Record<string, number[]>;
  /** Copies of each unit in the shared pool, by cost tier (index 0 = 1-cost). */
  poolSize: number[];
  /** XP needed to go from level N to N+1, keyed by N. */
  xpToNext: Record<string, number>;
  xpPurchase: { gold: number; xp: number };
  rerollCost: number;
  shopSlots: number;
  /** Unit slots per shop, repeating (a set mechanic can take a slot). */
  slotPattern: number[];
  slotPatternNote: string;
  setName: string;
  unmodelled: string[];
  copiesPerStar: number[];
  starScaling: { hp: number; ad: number };
  interest: { per: number; cap: number };
  sources: Record<string, TftSource>;
}
export interface TftSet {
  set: { number: number; name: string };
  patch: string | null;
  fetchedAt: string;
  source: string;
  units: TftUnit[];
  traits: TftTrait[];
  components: TftComponent[];
  items: TftItem[];
  statRates: Record<
    string,
    {
      perComponent: number;
      component: string;
      componentName: string;
      label: string;
      unit: TftStatLine["unit"];
    }
  >;
  economy: TftEconomy;
}
