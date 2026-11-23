import type { TftSet, TftTrait, TftUnit } from "./types";
/**
 * What does a trait cost to switch on?
 *
 * For each breakpoint, the cheapest set of that trait's units at one star:
 * sort the trait's units by cost and take as many as the breakpoint needs.
 * It is a floor, not a recommendation: emblems, augments and units that count
 * twice can lower it, and cheap is not the same as good.
 */
export interface TraitStep {
  units: number;
  style: number;
  /** Gold for the cheapest units that reach this breakpoint, or null when the
   * set does not have enough units with the trait. */
  gold: number | null;
  /** Gold on top of the previous breakpoint. */
  added: number | null;
  /** Units needed beyond what the set offers (emblems or other sources). */
  short: number;
  cheapest: TftUnit[];
}
export interface TraitPrice {
  trait: TftTrait;
  members: TftUnit[];
  steps: TraitStep[];
  /** Gold per unit slot at the first breakpoint. */
  entry: number | null;
}
export function traitMembers(set: TftSet, trait: TftTrait): TftUnit[] {
  return set.units
    .filter((unit) => !unit.variantOf && unit.traits.includes(trait.name))
    .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));
}
export function priceTrait(set: TftSet, trait: TftTrait): TraitPrice {
  const members = traitMembers(set, trait);
  let previous = 0;
  const steps = trait.breakpoints.map((point) => {
    const cheapest = members.slice(0, point.units);
    const reachable = members.length >= point.units;
    const gold = reachable
      ? cheapest.reduce((sum, unit) => sum + unit.cost, 0)
      : null;
    const step: TraitStep = {
      units: point.units,
      style: point.style,
      gold,
      added: gold === null ? null : gold - previous,
      short: Math.max(0, point.units - members.length),
      cheapest,
    };
    if (gold !== null) previous = gold;
    return step;
  });
  return { trait, members, steps, entry: steps[0]?.gold ?? null };
}
export const priceTraits = (set: TftSet) =>
  set.traits
    .map((trait) => priceTrait(set, trait))
    .filter((price) => price.members.length > 0);
