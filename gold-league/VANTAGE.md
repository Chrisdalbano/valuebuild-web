# Vantage UI: approval preview

An original Vue 3 design-system study for Christian D'Albano, explored inside BuildValue. Working name only. No new repository, registry publication, production deployment, or BuildValue styling migration is approved by this preview.

## Review

From `gold-league`, run `npm ci` and `npm run dev -- --host 127.0.0.1 --port 5194`. Open `/ui-kit.html`. The existing app remains at `/` with its own HTML entry and styles. The kit page makes no API requests and imports no existing app CSS, router, analytics, or private vault data.

Explore Ink/Paper themes, button states, input validation, switches, keyboard tabs, save dialog, fictional item search/category filters, and up to three-item comparison. Demo selection resets on reload. Nothing is persisted or sent.

## Research and design rationale

- [Riot: Complementary Visual Design in Spirit Blossom](https://www.riotgames.com/en/news/complementary-visual-design-in-spirit-blossom): shared identity adapts to different products; player information determines visual hierarchy. Applied here as readable controls inside an expressive frame.
- [Stink Studios: Riot Games Brand Evolution](https://www.stinkstudios.com/work/riot-games-brand-evolution): a spectrum from core to expressive. Applied as a restrained component layer and more assertive display typography and geometry in the showcase.
- [Riot: Under the hood of the League Client's Hextech UI](https://www.riotgames.com/en/news/under-hood-league-client%E2%80%99s-hextech-ui): self-contained UI units. Applied as independent primitives, with product data confined to examples.
- [Vue: Props](https://vuejs.org/guide/components/props.html) and [Nuxt: Styling](https://nuxt.com/docs/4.x/getting-started/styling) inform typed one-way contracts and explicit stylesheet integration.

These are public articles and a commissioned brand case study, not an official Riot Vue design system. Vantage's split-blade illustration, token values, components, and compositions are original implementation. No Riot logos, proprietary fonts, game art, or copied code. The typography is self-hosted Barlow Condensed, Manrope, and IBM Plex Mono via Fontsource; preserve their OFL notices when distributing.

## Architecture and component map

`src/vantage/` is the reusable library. It depends only on Vue 3.5+. `src/ui-kit/` is the demonstration application. `ui-kit.html` is a separate entry. The existing BuildValue app is not a library dependency.

Tokens have three layers: primitives (palette, spacing, type), semantics (background, action, feedback), and components (button, field, panel). Everything is scoped to `.vg-theme`. Put `data-theme="paper"` on the wrapper for the alternate theme. Host applications own fonts; the showcase imports self-hosted Latin subsets.

| Component | Responsibility | Public contract |
| --- | --- | --- |
| VgButton | Action and busy/disabled states | variant: primary/secondary/ghost; size: sm/md; type; disabled; loading; default/trailing slots; native attributes/events |
| VgBadge | Labeled status | tone: neutral/positive/warning/accent; default slot |
| VgPanel | Content container | title; eyebrow; default/action/footer slots |
| VgField | Labeled text entry | required string v-model; label; hint; error; placeholder; disabled; text/search/email type; native attributes forwarded to input |
| VgSwitch | Binary preference | required boolean v-model; label; disabled; role=switch |
| VgTabs | Related content navigation | required string v-model; label; options with unique value/label; scoped default slot; arrows/Home/End |
| VgMeter | Bounded quantity | value; max; label; positive/accent/warning tone; clamped accessible value |
| VgStat | Labeled number | label; formatted value; optional detail |
| VgDialog | Modal interaction | required boolean v-model; title; default/footer slots; Escape, focus loop, native focus restoration |

Composition boundaries: Showcase owns theme and section assembly. Hero/Foundations explain identity. Controls owns control demo state. BuildLab owns search/category/selection and computed derived totals. ItemCard accepts a typed fixture and emits its id on toggle. Docs owns framework example selection. No shared store is necessary. ItemCard and fictional data are not library exports.

Use nonempty options and a matching model value with VgTabs. Dialog uses native HTML dialog in current evergreen browsers; body scroll lock and nested modal coordination are not implemented. Test consumer-specific validation, screen-reader workflows, and complex modal content before production adoption.

## Vue integration

Copy `src/vantage` into the consuming application, then:

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'
import { VgButton, VgField } from './vantage'
const name = shallowRef('')
</script>
<template>
  <div class="vg-theme">
    <VgField v-model="name" label="Build name" />
    <VgButton :disabled="!name.trim()">Save build</VgButton>
  </div>
</template>
```

The barrel imports tokens; individual SFC imports require an explicit tokens.css import. The host loads its desired fonts or overrides `--vg-font-body`, `--vg-font-display`, and `--vg-font-mono`.

## Nuxt integration

Copy `src/vantage` into `app/components/vantage`. Explicitly import from `~/components/vantage` in pages/components. Wrap the application layout in `.vg-theme` and add `~/components/vantage/tokens.css` to `nuxt.config.ts`'s css array. No plugin, ClientOnly wrapper, or Tailwind module is required. IDs use Vue useId; browser operations occur only after mounting or in user event handlers.

SSR is verified through Vue's server renderer. An end-to-end Nuxt consumer build is still a release gate, not a completed check. A Nuxt auto-registration module and published package are future deliverables after approval.

## Build and verification

- `npm run typecheck:kit`: strict Vue/TypeScript validation of library and showcase.
- `npm run build`: existing app and independent kit page.
- `npm run build:kit`: ES module library with external Vue, token/component CSS, and TypeScript declarations under `dist-kit/types`.
- `npm run test:kit:ssr`: render the full showcase without browser globals.
- `npm run test:kit`: five Chromium tests. Interactions, comparison math, focus restoration/containment, and axe WCAG A/AA checks at 390, 768, and 1440px in both themes. Screenshots land in ignored `test-results/`.

Automated scans are not accessibility certification. Manual screen-reader and cross-browser checks remain release gates. Existing dependency audit reports seven advisories (one moderate, six high); this task does not update the legacy app's dependency ranges. Review and remediate them before deploying the existing application. The library runtime only imports Vue.

## Proposed approval sequence

1. Review the visual identity, density, interaction feel, and component boundaries.
2. Once approved, create the independent open-source project, settle its public name/license, add Nuxt consumer CI, cross-browser and screen-reader testing, and package metadata/versioning.
3. Audit BuildValue's workflows and data correctness, then implement agreed feature improvements and migrate its styling in tested slices. Remove old CSS only after every dependent screen has migrated.

Nothing in the current preview represents approval of steps 2 or 3.
