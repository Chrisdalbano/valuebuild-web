import type { TftEconomy, TftItem, TftSet, TftUnit } from "./types";
/**
 * What a component or item is worth on one unit, from that unit's own stats.
 *
 * Two things are measured, and only these two:
 *   attack output   = attack damage x attacks per second x average crit factor
 *   effective health = health x (1 + armor / 100)   against physical damage
 *                      health x (1 + magic resist / 100) against magic damage
 *
 * Armor and magic resist multiply incoming damage by 100 / (100 + value), so
 * effective health is health divided by that. Star levels multiply health and
 * attack damage (180% and 150% per star). Abilities, ability power scaling,
 * mana and item effects are not modelled; the interface says so wherever
 * these numbers appear.
 */
export interface Loadout {
  /** Fraction, 0.1 = +10%. */
  ad: number;
  ap: number;
  /** Percent points, 10 = +10%. */
  attackSpeed: number;
  armor: number;
  magicResist: number;
  health: number;
  critChance: number;
  manaRegen: number;
}
export const emptyLoadout = (): Loadout => ({
  ad: 0,
  ap: 0,
  attackSpeed: 0,
  armor: 0,
  magicResist: 0,
  health: 0,
  critChance: 0,
  manaRegen: 0,
});
const statToField: Record<string, keyof Loadout> = {
  AD: "ad",
  AP: "ap",
  AS: "attackSpeed",
  Armor: "armor",
  MagicResist: "magicResist",
  Health: "health",
  CritChance: "critChance",
  ManaRegen: "manaRegen",
};
/** Add a list of priced stats (component or item) to a loadout. */
export function withStats(
  base: Loadout,
  stats: readonly { key: string; amount: number }[],
): Loadout {
  const next = { ...base };
  for (const stat of stats) {
    const field = statToField[stat.key];
    if (field) next[field] += stat.amount;
  }
  return next;
}
export const itemStats = (item: TftItem) =>
  item.statBreakdown.map((line) => ({ key: line.key, amount: line.amount }));
export function componentStats(set: TftSet, id: string) {
  const component = set.components.find((entry) => entry.id === id);
  return component?.stat && component.amount
    ? [{ key: component.stat, amount: component.amount }]
    : [];
}
export interface UnitProfile {
  health: number;
  attackDamage: number;
  attackSpeed: number;
  critChance: number;
  armor: number;
  magicResist: number;
  /** Average damage per second from basic attacks alone. */
  attackOutput: number;
  physicalHealth: number;
  magicHealth: number;
}
export function profile(
  unit: TftUnit,
  star: number,
  loadout: Loadout,
  economy: Pick<TftEconomy, "starScaling">,
): UnitProfile {
  const steps = Math.max(0, Math.min(2, star - 1));
  const health =
    unit.stats.hp * Math.pow(economy.starScaling.hp, steps) + loadout.health;
  const attackDamage =
    unit.stats.ad * Math.pow(economy.starScaling.ad, steps) * (1 + loadout.ad);
  const attackSpeed = unit.stats.attackSpeed * (1 + loadout.attackSpeed / 100);
  const critChance = Math.min(
    1,
    unit.stats.critChance + loadout.critChance / 100,
  );
  const armor = unit.stats.armor + loadout.armor,
    magicResist = unit.stats.magicResist + loadout.magicResist;
  return {
    health,
    attackDamage,
    attackSpeed,
    critChance,
    armor,
    magicResist,
    attackOutput:
      attackDamage *
      attackSpeed *
      (1 + critChance * (unit.stats.critMultiplier - 1)),
    physicalHealth: health * (1 + armor / 100),
    magicHealth: health * (1 + magicResist / 100),
  };
}
export interface Worth {
  /** Percent change against the unit without the addition. */
  attackOutput: number;
  physicalHealth: number;
  magicHealth: number;
  /** Stats the model does not turn into either measure. */
  unmodelled: string[];
}
const change = (after: number, before: number) =>
  before > 0 ? (after / before - 1) * 100 : 0;
/** What adding these stats changes on this unit, on top of `held`. */
export function worthOn(
  unit: TftUnit,
  star: number,
  stats: readonly { key: string; amount: number }[],
  economy: Pick<TftEconomy, "starScaling">,
  held: Loadout = emptyLoadout(),
): Worth {
  const before = profile(unit, star, held, economy);
  const after = profile(unit, star, withStats(held, stats), economy);
  return {
    attackOutput: change(after.attackOutput, before.attackOutput),
    physicalHealth: change(after.physicalHealth, before.physicalHealth),
    magicHealth: change(after.magicHealth, before.magicHealth),
    unmodelled: stats
      .filter((stat) => stat.key === "AP" || stat.key === "ManaRegen")
      .map((stat) => stat.key),
  };
}
/** Units that take part in the shared pool as themselves. */
export const poolUnits = (set: TftSet) =>
  set.units.filter(
    (unit) =>
      !unit.variantOf &&
      unit.cost >= 1 &&
      unit.cost <= set.economy.poolSize.length,
  );
