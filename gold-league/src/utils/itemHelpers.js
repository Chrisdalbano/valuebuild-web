// Pure helpers for the item domain — thresholds shared by badges, pills, rows.

// 4-tier efficiency verdict (excellent ≥120, good ≥100, fair ≥80, poor <80)
export function efficiencyTier(eff) {
  if (eff >= 120) return { key: 'excellent', label: 'Excellent' }
  if (eff >= 100) return { key: 'good', label: 'Good' }
  if (eff >= 80) return { key: 'fair', label: 'Fair' }
  return { key: 'poor', label: 'Poor' }
}

// Item tier taxonomy by cost/buildpath
export function itemTier(item) {
  if (item.cost >= 2500) return { key: 'legendary', label: 'Legendary' }
  if (item.cost >= 1200) return { key: 'epic', label: 'Epic' }
  if (item.into && item.into.length > 0) return { key: 'component', label: 'Component' }
  return { key: 'basic', label: 'Basic' }
}

// Strip Riot's HTML markup from item descriptions
export function sanitizeDescription(desc) {
  return desc
    .replace(/<br>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
}
