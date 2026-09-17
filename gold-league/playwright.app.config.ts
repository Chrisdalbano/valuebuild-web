import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir:'./tests/app', fullyParallel:true, workers:3, use:{baseURL:'http://127.0.0.1:5198',browserName:'chromium',reducedMotion:'reduce'}, webServer:{command:'npm run dev -- --host 127.0.0.1 --port 5198 --strictPort',url:'http://127.0.0.1:5198',reuseExistingServer:true},reporter:'list' });
