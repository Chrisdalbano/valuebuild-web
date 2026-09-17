import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/kit",
  use: { baseURL: "http://127.0.0.1:5195", browserName: "chromium" },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5195 --strictPort",
    url: "http://127.0.0.1:5195/ui-kit.html",
    reuseExistingServer: true,
  },
  reporter: "list",
});
