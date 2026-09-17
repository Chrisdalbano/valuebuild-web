import { writeFile, copyFile, readFile } from "node:fs/promises";
const manifest = {
  name: "@chrisdalbano/forza-ui",
  version: "0.2.0-preview.0",
  private: true,
  type: "module",
  license: "UNLICENSED",
  description: "Forza UI: typed Vue components for focused web applications.",
  main: "./forza.js",
  module: "./forza.js",
  types: "./types/index.d.ts",
  exports: {
    ".": { types: "./types/index.d.ts", import: "./forza.js" },
    "./style.css": "./forza.css",
  },
  files: [
    "forza.js",
    "forza.css",
    "types",
    "README.md",
    "THIRD_PARTY_NOTICES.txt",
  ],
  sideEffects: ["**/*.css"],
  peerDependencies: {
    vue: "^3.5.0",
    "reka-ui": "^2.10.4",
    "@lucide/vue": "^1.47.0",
    "@formkit/auto-animate": "^0.10.0",
    "embla-carousel-vue": "^8.6.0",
  },
};
await writeFile(
  "dist-kit/package.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
await copyFile("FORZA.md", "dist-kit/README.md");
await copyFile(
  "src/forza/THIRD_PARTY_NOTICES.txt",
  "dist-kit/THIRD_PARTY_NOTICES.txt",
);
const output = await readFile("dist-kit/forza.js", "utf8");
if (/gsap|ScrollTrigger/.test(output))
  throw new Error("Landing motion leaked into library");
console.log("Prepared private Forza package; GSAP excluded.");
