import assert from "node:assert/strict";
import { createServer } from "vite";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { default: Showcase } = await server.ssrLoadModule(
    "/src/ui-kit/Showcase.vue",
  );
  const html = await renderToString(
    createSSRApp({ render: () => h(Showcase) }),
  );
  assert.ok(html.includes("FORZA."));
  assert.ok(html.includes("Sunbreaker"));
  assert.ok(html.includes("aria-labelledby"));
  assert.ok(!html.includes("[object Object]"));
  console.log("SSR passed: full showcase renders without browser globals.");
} finally {
  await server.close();
}
