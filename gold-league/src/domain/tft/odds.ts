/**
 * What does rolling buy?
 *
 * A shop has `slots` slots. Each slot first picks a cost tier from the level's
 * odds, then a unit of that tier in proportion to the copies left in the
 * shared pool. So the chance one slot shows the unit you want is
 *
 *   tier odds at your level x copies of it left / copies of that tier left
 *
 * Everything below follows from that one line and the constants the backend
 * sends (shop odds, pool sizes, reroll and XP prices). Nothing is simulated
 * with random numbers: the distributions are exact for the model.
 *
 * The model's simplifications, stated in the interface too:
 * - you buy every copy you see and can afford;
 * - other players' pools do not change while you roll;
 * - units sitting in your own unbought shop are not returned mid-roll.
 */
export interface RollInput {
  /** Chance (0..1) that a slot rolls the unit's cost tier at this level. */
  tierOdds: number;
  /** Gold cost of one copy. */
  unitCost: number;
  /** Copies of the wanted unit still in the pool. */
  copiesLeft: number;
  /** Copies of every unit of that tier still in the pool, the wanted one included. */
  tierLeft: number;
  /** Copies still needed. */
  need: number;
  rerollCost: number;
  /** Unit slots per shop. A list repeats, one entry per reroll in order. */
  slots: number | readonly number[];
}
const slotsAt = (input: RollInput, roll: number) =>
  typeof input.slots === "number"
    ? input.slots
    : (input.slots[roll % input.slots.length] ?? 5);
const meanSlots = (input: RollInput) =>
  typeof input.slots === "number"
    ? input.slots
    : input.slots.reduce((sum, value) => sum + value, 0) /
      Math.max(1, input.slots.length);
export interface RollResult {
  /** Index g: chance of holding every needed copy after spending at most g gold. */
  hitByGold: number[];
  /** Index k: chance of ending with exactly k new copies when the gold runs out. */
  copies: number[];
  /** Expected new copies from a single shop, bought or not. */
  perShop: number;
  /** Chance a single shop shows at least one copy. */
  seenPerShop: number;
}
/** Chance one slot shows the wanted unit after `taken` copies were bought. */
export function slotChance(input: RollInput, taken: number): number {
  const left = input.copiesLeft - taken,
    pool = input.tierLeft - taken;
  if (left <= 0 || pool <= 0 || input.tierOdds <= 0) return 0;
  return Math.min(1, input.tierOdds * (left / pool));
}
/**
 * Exact distribution of the roll-down. State is (gold spent, copies bought).
 * One step pays for a reroll and then walks the slots in order; a copy is
 * bought when it appears and the remaining gold covers it.
 */
export function rollDown(input: RollInput, gold: number): RollResult {
  const budget = Math.max(0, Math.floor(gold));
  const need = Math.max(0, Math.floor(input.need));
  const cap = Math.min(need, Math.max(0, Math.floor(input.copiesLeft)));
  // reach[g][k]: probability of being about to act with g gold spent, k copies.
  const reach: number[][] = Array.from({ length: budget + 1 }, () =>
    new Array(cap + 1).fill(0),
  );
  const done: number[][] = Array.from({ length: budget + 1 }, () =>
    new Array(cap + 1).fill(0),
  );
  reach[0]![0] = 1;
  for (let spent = 0; spent <= budget; spent++)
    for (let have = 0; have <= cap; have++) {
      const mass = reach[spent]![have]!;
      if (!mass) continue;
      const canRoll = spent + input.rerollCost <= budget;
      if (have >= need || have >= cap || !canRoll || input.rerollCost <= 0) {
        done[spent]![have]! += mass;
        continue;
      }
      // Walk the slots of one shop: slotState[extra copies] -> probability.
      let shop = new Map<number, number>([[0, mass]]);
      const afterRoll = spent + input.rerollCost;
      // Every reroll costs the same and every copy costs the same, so the
      // number of rerolls so far follows from the gold spent and copies held.
      const rolls = Math.round(
        (spent - have * input.unitCost) / input.rerollCost,
      );
      for (let slot = 0; slot < slotsAt(input, rolls); slot++) {
        const next = new Map<number, number>();
        for (const [extra, p] of shop) {
          const held = have + extra;
          const goldAfter = afterRoll + extra * input.unitCost;
          const affordable =
            held < cap && goldAfter + input.unitCost <= budget;
          const hit = affordable ? slotChance(input, held) : 0;
          if (hit) next.set(extra + 1, (next.get(extra + 1) || 0) + p * hit);
          next.set(extra, (next.get(extra) || 0) + p * (1 - hit));
        }
        shop = next;
      }
      for (const [extra, p] of shop)
        reach[afterRoll + extra * input.unitCost]![have + extra]! += p;
    }
  const hitByGold: number[] = [];
  let running = 0;
  for (let spent = 0; spent <= budget; spent++) {
    if (need <= cap) running += done[spent]![need] ?? 0;
    hitByGold.push(need === 0 ? 1 : Math.min(1, running));
  }
  const copies = new Array(cap + 1).fill(0);
  for (let spent = 0; spent <= budget; spent++)
    for (let have = 0; have <= cap; have++) copies[have] += done[spent]![have]!;
  const first = slotChance(input, 0);
  return {
    hitByGold,
    copies,
    perShop: meanSlots(input) * first,
    seenPerShop: 1 - Math.pow(1 - first, meanSlots(input)),
  };
}
/** Smallest gold at which the chance of finishing reaches `target`, or null. */
export function goldFor(curve: readonly number[], target: number): number | null {
  const index = curve.findIndex((chance) => chance >= target);
  return index < 0 ? null : index;
}
/** Gold to buy enough XP to gain `levels` levels, starting `xpInto` XP in. */
export function levelCost(
  level: number,
  xpInto: number,
  levels: number,
  xpToNext: Record<string, number>,
  purchase: { gold: number; xp: number },
): number | null {
  let xp = -Math.max(0, xpInto);
  for (let step = 0; step < levels; step++) {
    const needed = xpToNext[String(level + step)];
    if (!needed) return null;
    xp += needed;
  }
  return Math.max(0, Math.ceil(xp / purchase.xp)) * purchase.gold;
}
/** Copies of one unit needed for a star level, e.g. [1, 3, 9]. */
export function copiesFor(star: number, perStar: readonly number[]): number {
  return perStar[Math.max(0, Math.min(perStar.length - 1, star - 1))] ?? 1;
}
