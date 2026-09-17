import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const cwd=fileURLToPath(new URL('../gold-league/',import.meta.url));
const cli=fileURLToPath(new URL('../gold-league/node_modules/@playwright/test/cli.js',import.meta.url));
const result=spawnSync(process.execPath,[cli,'test','-c','playwright.app.config.ts','--grep','overlay and select'],{cwd,stdio:'inherit',env:{...process.env,BV_BASE_URL:process.argv[2]||'http://localhost:4173'}});
process.exit(result.status??1);
