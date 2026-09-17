import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/app",
  fullyParallel: true,
  workers: 3,
  use: {
    baseURL: process.env.BV_BASE_URL || "http://127.0.0.1:5198",
    launchOptions: process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : {},
    browserName: "chromium",
    serviceWorkers: "block",
    reducedMotion: "reduce",
  },
  webServer: process.env.BV_BASE_URL
    ? undefined
    : {
        command: "npm run dev -- --host 127.0.0.1 --port 5198 --strictPort",
        url: "http://127.0.0.1:5198",
        reuseExistingServer: true,
      },
  reporter: "list",
});
