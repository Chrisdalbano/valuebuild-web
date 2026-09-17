import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: "dist-kit",
    lib: {
      entry: "src/vantage/index.ts",
      name: "VantageUI",
      formats: ["es"],
      fileName: "vantage",
    },
    rollupOptions: { external: ["vue"] },
  },
});
