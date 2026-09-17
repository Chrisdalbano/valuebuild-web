import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/kit",
  use: { baseURL: "http://127.0.0.1:5194", browserName: "chromium" },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5194 --strictPort",
    url: "http://127.0.0.1:5194/ui-kit.html",
    reuseExistingServer: true,
  },
  reporter: "list",
});
