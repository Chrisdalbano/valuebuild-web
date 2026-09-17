import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  server: {
    proxy: {
      "/backend": {
        target: "https://valuebuild-web.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend/, ""),
      },
    },
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["brand/favicon.svg"],
      manifest: {
        name: "BuildValue | Forza UI",
        short_name: "BuildValue",
        description: "Explore items, compare tradeoffs, and save builds.",
        theme_color: "#101416",
        background_color: "#101416",
        display: "standalone",
        icons: [
          {
            src: "/brand/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/brand/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern:
              /^https:\/\/ddragon\.leagueoflegends\.com\/.*\.(png|jpg)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "buildvalue-images-v2",
              expiration: { maxEntries: 600, maxAgeSeconds: 604800 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
