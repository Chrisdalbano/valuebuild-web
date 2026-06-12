import path from 'node:path'
import { createRequire } from 'node:module'
const require = createRequire(path.join(process.cwd(), 'noop.js'))
const { chromium } = require('playwright-core')
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, args: ['--disable-web-security'],
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
let failures = 0
const check = async (name, fn) => {
  try { await fn(); console.log('PASS ', name) } catch (e) { failures++; console.log('FAIL ', name, '-', e.message.split('\n')[0]) }
}

const base = (process.argv[2] || 'http://localhost:4173').replace(/\/$/, '')
await page.goto(`${base}/`)
await page.waitForSelector('.item-card', { timeout: 30000 })

await check('grid icons lazy-load through ItemIcon on scroll', async () => {
  await page.locator('.item-card').first().scrollIntoViewIfNeeded()
  await page.waitForSelector('.item-card .item-icon.loaded', { timeout: 8000 })
})

await check('hovering a grid icon floats THE stats card to <body>', async () => {
  await page.locator('.item-card .item-icon').first().hover()
  await page.waitForSelector('body > .floating-card .item-stats-card', { timeout: 3000 })
  const name = await page.locator('.item-stats-card h4').textContent()
  if (!name.trim()) throw new Error('empty card')
})

await check('card hides on mouse leave', async () => {
  await page.mouse.move(10, 700)
  await page.waitForSelector('.floating-card', { state: 'detached', timeout: 3000 })
})

await check('table-view icon hover floats card (no clipping container)', async () => {
  await page.locator('.view-btn[title="Table view"]').click()
  await page.waitForSelector('.items-table tbody tr', { timeout: 3000 })
  await page.locator('.items-table .item-icon').first().hover()
  await page.waitForSelector('body > .floating-card', { timeout: 3000 })
  await page.mouse.move(10, 700)
})

await check('swap-modal icon hover card stacks ABOVE the modal', async () => {
  await page.locator('.view-btn[title="Grid view"]').click()
  await page.locator('.item-card').nth(0).click()
  await page.locator('.item-card').nth(1).click()
  await page.locator('.btn-compare-now').click()
  await page.waitForURL('**/compare', { timeout: 5000 })
  await page.locator('.add-item-card').click()
  await page.waitForSelector('.swap-modal', { timeout: 3000 })
  await page.locator('.swap-item .item-icon').first().hover()
  await page.waitForSelector('body > .floating-card', { timeout: 3000 })
  const z = await page.evaluate(() => {
    const card = document.querySelector('.floating-card')
    const modal = document.querySelector('.swap-modal').closest('.modal-overlay')
    return [getComputedStyle(card).zIndex, getComputedStyle(modal).zIndex].map(Number)
  })
  if (!(z[0] > z[1])) throw new Error(`popover z ${z[0]} not above modal z ${z[1]}`)
})

await check('build slot hover shows stats card', async () => {
  await page.keyboard.press('Escape')
  await page.goto(`${base}/builds`)
  await page.waitForSelector('.suggestion-card', { timeout: 30000 })
  await page.locator('.btn-add-suggestion').first().click()
  await page.waitForSelector('.build-slot.filled', { timeout: 3000 })
  await page.locator('.build-slot.filled .item-icon').first().hover()
  await page.waitForSelector('body > .floating-card', { timeout: 3000 })
})

await browser.close()
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`)
process.exit(failures ? 1 : 0)
