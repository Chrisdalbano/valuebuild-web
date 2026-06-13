// Regression test: every route must render real content (not a blank
// <main> of comment nodes) across navigation sequences — guards the
// <transition mode="out-in"> + router-view against stalls.
// Usage: node ../scripts/nav-smoke.mjs [baseUrl]   (run from gold-league/)
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(path.join(process.cwd(), 'noop.js'))
const { chromium } = require('playwright-core')

const base = (process.argv[2] || 'http://localhost:4173').replace(/\/$/, '')
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const ROOTS = {
  Items: '.item-browser',
  Compare: '.compare-container, .empty-state',
  Builds: '.builds-section',
  Research: '.research-board',
  About: '.about-landing',
}

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--disable-web-security'],
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

let failures = 0
function fail(msg) { failures++; console.log(`FAIL  ${msg}`) }
function pass(msg) { console.log(`PASS  ${msg}`) }

async function clickTab(name) {
  await page.locator('.navbar-nav .nav-item', { hasText: name }).first().click()
  await page.waitForTimeout(500)
}

async function expectRoute(name) {
  const sel = ROOTS[name]
  try {
    await page.waitForSelector(sel, { timeout: 4000, state: 'attached' })
    // also assert <main> is not just comment nodes
    const real = await page.locator('main.app-main *').count()
    if (real === 0) throw new Error('main empty')
    return true
  } catch {
    return false
  }
}

// load the items page first (the trigger condition the user described)
await page.goto(`${base}/`)
await page.waitForSelector('.item-card', { timeout: 30000 })

// every from→to sequence through the nav tabs
const tabs = ['Items', 'About', 'Compare', 'Builds', 'Research']
for (const from of tabs) {
  for (const to of tabs) {
    if (from === to) continue
    await clickTab(from)
    const okFrom = await expectRoute(from)
    await clickTab(to)
    const okTo = await expectRoute(to)
    if (okFrom && okTo) pass(`${from} -> ${to}`)
    else fail(`${from} -> ${to}  (from rendered=${okFrom}, to rendered=${okTo})`)
  }
}

await browser.close()
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
