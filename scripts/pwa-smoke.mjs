import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require=createRequire(new URL('../gold-league/package.json',import.meta.url));
const {chromium}=require('@playwright/test');
const browser=await chromium.launch(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{});
const context=await browser.newContext();const page=await context.newPage();const base=process.argv[2]||'http://localhost:4173';
try{
 await page.goto(base+'/items');await page.waitForSelector('.catalog-item');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready});
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await context.setOffline(true);await page.reload();await page.waitForSelector('.catalog-item');
 await page.getByRole('button',{name:'Add Infinity Edge to build',exact:true}).click();await page.getByRole('link',{name:'Open build lab',exact:true}).click();await page.waitForSelector('.build-slot');
 console.log('PASS: installed app shell and backend snapshot work offline');
}finally{await browser.close()}
