import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: "dist-kit",
    lib: {
      entry: "src/forza/index.ts",
      name: "ForzaUI",
      formats: ["es"],
      fileName: "forza",
    },
    rollupOptions: { external: ["vue", "reka-ui", "@lucide/vue", "@formkit/auto-animate"] },
  },
});
