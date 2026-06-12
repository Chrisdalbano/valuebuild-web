// Headless screenshot QA for BuildValue routes.
// Usage: node scripts/screenshot-qa.mjs <outDir> [baseUrl]
// Assumes a server (vite preview/dev) is already running at baseUrl.
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const CHROME =
  process.env.CHROME_PATH ||
  'C:/Program Files/Google/Chrome/Application/chrome.exe'
const outDir = process.argv[2] || 'screenshots'
const base = (process.argv[3] || 'http://localhost:4173').replace(/\/$/, '')
const routes = { home: '/', compare: '/compare', builds: '/builds', about: '/about' }

mkdirSync(outDir, { recursive: true })
for (const [name, route] of Object.entries(routes)) {
  const out = path.resolve(outDir, `${name}.png`)
  execFileSync(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--window-size=1440,2000',
      '--virtual-time-budget=20000',
      // QA-only: the prod API's CORS allowlist doesn't include localhost,
      // so let this throwaway profile fetch real data anyway.
      '--disable-web-security',
      `--user-data-dir=${mkdtempSync(path.join(os.tmpdir(), 'qa-chrome-'))}`,
      `--screenshot=${out}`,
      base + route,
    ],
    { stdio: 'pipe', timeout: 120000 }
  )
  console.log(`captured ${name} -> ${out}`)
}
