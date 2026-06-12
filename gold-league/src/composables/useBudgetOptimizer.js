import { isItemDeprecated } from '@/utils/deprecatedItems'
import { ROLE_MATCHERS } from './useBuildSuggestions'

const STEP = 25 // gold granularity (item costs are multiples of 25)
const MAX_SLOTS = 6

function candidatePool(items, role) {
  let pool = items.filter(item => {
    if (isItemDeprecated(item)) return false
    if (!item.id || !/^\d+$/.test(item.id.toString())) return false
    if (!item.cost || item.cost <= 0) return false
    if (item.into && item.into.length > 0) return false // completed items only
    if (!item.totalGoldValue || item.totalGoldValue <= 0) return false
    return item.statBreakdown && Object.keys(item.statBreakdown).length > 0
  })
  const matcher = ROLE_MATCHERS[role]
  if (role && role !== 'all' && matcher) {
    pool = pool.filter(item => matcher(item.statBreakdown || {}))
  }
  return pool
}

// Exact 0/1 knapsack: maximize Σ totalGoldValue (backend-computed — we only
// ever SUM backend numbers) subject to Σ cost ≤ budget and ≤6 items.
// ~80 candidates × 6 slots × budget/25 states → instant at this scale.
export function optimizeBuild(items, budget, role = 'all') {
  const pool = candidatePool(items, role)
  const W = Math.floor(budget / STEP)
  if (W <= 0 || pool.length === 0) return []

  // dp[k][w] = { v: best value, pick: linked list of chosen items }
  const dp = Array.from({ length: MAX_SLOTS + 1 }, () => new Array(W + 1).fill(null))
  for (let w = 0; w <= W; w++) dp[0][w] = { v: 0, pick: null }

  for (const item of pool) {
    const wc = Math.ceil(item.cost / STEP)
    if (wc > W) continue
    // iterate k high→low and w high→low so each item is used at most once
    for (let k = MAX_SLOTS; k >= 1; k--) {
      for (let w = W; w >= wc; w--) {
        const base = dp[k - 1][w - wc]
        if (!base) continue
        const cand = base.v + item.totalGoldValue
        if (!dp[k][w] || cand > dp[k][w].v) {
          dp[k][w] = { v: cand, pick: { item, prev: base.pick } }
        }
      }
    }
  }

  // cells are exact-cost-reachable; the optimum can sit at any w ≤ W
  let best = { v: 0, pick: null }
  for (let k = 1; k <= MAX_SLOTS; k++) {
    for (let w = 0; w <= W; w++) {
      const cell = dp[k][w]
      if (cell && cell.v > best.v) best = cell
    }
  }

  const result = []
  for (let node = best.pick; node; node = node.prev) result.push(node.item)
  return result.sort((a, b) => b.goldEfficiency - a.goldEfficiency)
}
