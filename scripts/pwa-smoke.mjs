import path from 'node:path'
import { createRequire } from 'node:module'
const require = createRequire(path.join(process.cwd(), 'noop.js'))
const { chromium } = require('playwright-core')

// PWA smoke: service worker registers, app shell + item snapshot survive
// going fully offline. Usage: node ../scripts/pwa-smoke.mjs [baseUrl]
const base = (process.argv[2] || 'http://localhost:4173').replace(/\/$/, '')
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, args: ['--disable-web-security'],
})
const context = await browser.newContext()
const page = await context.newPage()
await page.goto(`${base}/`)
await page.waitForSelector('.item-card', { timeout: 30000 })
// snapshot saved + SW controlling (for the app shell)
await page.waitForFunction(() =>
  !!localStorage.getItem('bv:item-snapshot') && !!navigator.serviceWorker.controller,
  { timeout: 30000 })
await context.setOffline(true)
try { await page.reload({ timeout: 15000 }) } catch { await page.waitForTimeout(1000); await page.reload({ timeout: 15000 }) }
const items = await page.waitForSelector('.item-card', { timeout: 20000 }).then(() => true).catch(() => false)
const banner = await page.locator('.offline-banner').count()
const hero = await page.locator('.explorer-hero').count()
let buildsOk = false
if (items) {
  await page.locator('.navbar-nav .nav-item', { hasText: 'Builds' }).click()
  buildsOk = await page.waitForSelector('.build-slot', { timeout: 10000 }).then(() => true).catch(() => false)
}
console.log(`offline: items=${items} banner=${banner === 1} hero=${hero === 1} builds=${buildsOk}`)
console.log(items && banner === 1 && hero === 1 && buildsOk ? 'OFFLINE PASS' : 'OFFLINE FAIL')
await browser.close()
process.exit(items && banner === 1 && hero === 1 && buildsOk ? 0 : 1)
