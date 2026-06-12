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

// Riot description → display HTML (v-html target; trusted DDragon data,
// script tags stripped, Riot's semantic tags mapped to styled spans)
export function formatRiotDescription(html) {
  if (!html) return ''
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '<br>')
    .replace(/<\/?passive>/gi, '')
    .replace(/<\/?active>/gi, '')
    .replace(/<\/?unique>/gi, '<span class="unique-tag">')
    .replace(/<\/?stats>/gi, '<span class="stats-tag">')
    .replace(/<\/?attention>/gi, '<strong class="attention">')
    .replace(/<\/?li>/gi, '• ')
    .replace(/<\/?ul>/gi, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '<br><br>')
    .trim()
}

// Recipe lookups — resolve an item's component build path against the full list
export function getComponents(item, allItems) {
  if (!item.from || !allItems) return []
  return item.from.map(id => allItems.find(i => i.id === id)).filter(Boolean)
}

export function getComponentsCost(item, allItems) {
  return getComponents(item, allItems).reduce((sum, comp) => sum + (comp.cost || 0), 0)
}

export function getCombineCost(item) {
  if (!item.gold) return 0
  return item.gold.base || 0
}



