// Pixel-diff two screenshot directories produced by screenshot-qa.mjs.
// Usage: node scripts/screenshot-diff.mjs <beforeDir> <afterDir> [diffOutDir]
// Run from gold-league/ (or anywhere pixelmatch+pngjs resolve).
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

// Deps live in gold-league/node_modules — resolve from the cwd so this
// works when run from gold-league/ (or repo root via gold-league/../).
const require = createRequire(path.join(process.cwd(), 'gold-league', 'noop.js'))
const require2 = createRequire(path.join(process.cwd(), 'noop.js'))
function load(name) {
  try { return require(name) } catch { return require2(name) }
}
const { PNG } = load('pngjs')
const pixelmatch = (load('pixelmatch').default ?? load('pixelmatch'))

const [beforeDir, afterDir, diffDir] = process.argv.slice(2)
if (!beforeDir || !afterDir) {
  console.error('usage: node screenshot-diff.mjs <beforeDir> <afterDir> [diffOutDir]')
  process.exit(2)
}
if (diffDir) mkdirSync(diffDir, { recursive: true })

let failed = false
for (const file of readdirSync(beforeDir).filter(f => f.endsWith('.png'))) {
  const a = PNG.sync.read(readFileSync(path.join(beforeDir, file)))
  const b = PNG.sync.read(readFileSync(path.join(afterDir, file)))
  if (a.width !== b.width || a.height !== b.height) {
    console.log(`${file}: SIZE MISMATCH ${a.width}x${a.height} vs ${b.width}x${b.height}`)
    failed = true
    continue
  }
  const diff = new PNG({ width: a.width, height: a.height })
  const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.05 })
  const pct = ((n / (a.width * a.height)) * 100).toFixed(3)
  console.log(`${file}: ${n} differing pixels (${pct}%)`)
  if (n > 0 && diffDir) writeFileSync(path.join(diffDir, file), PNG.sync.write(diff))
  if (n > 0) failed = true
}
process.exit(failed ? 1 : 0)
