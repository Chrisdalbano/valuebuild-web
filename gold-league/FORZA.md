# Forza UI: approval preview

An original Vue 3 design-system study for Christian D'Albano, explored inside BuildValue. Christian selected the name Forza UI. No new repository, registry publication, production deployment, or BuildValue styling migration is approved by this preview.

## Review

From `gold-league`, run `npm ci` and `npm run dev -- --host 127.0.0.1 --port 5194`. Open `/ui-kit.html`. The existing app remains at `/` with its own HTML entry and styles. The kit page makes no API requests and imports no existing app CSS, router, analytics, or private vault data.

Explore Ink/Paper themes, button states, input validation, switches, keyboard tabs, save dialog, fictional item search/category filters, and up to three-item comparison. Demo selection resets on reload. Nothing is persisted or sent.

## Research and design rationale

- [Riot: Complementary Visual Design in Spirit Blossom](https://www.riotgames.com/en/news/complementary-visual-design-in-spirit-blossom): shared identity adapts to different products; player information determines visual hierarchy. Applied here as readable controls inside an expressive frame.
- [Stink Studios: Riot Games Brand Evolution](https://www.stinkstudios.com/work/riot-games-brand-evolution): a spectrum from core to expressive. Applied as a restrained component layer and more assertive display typography and geometry in the showcase.
- [Riot: Under the hood of the League Client's Hextech UI](https://www.riotgames.com/en/news/under-hood-league-client%E2%80%99s-hextech-ui): self-contained UI units. Applied as independent primitives, with product data confined to examples.
- [Vue: Props](https://vuejs.org/guide/components/props.html) and [Nuxt: Styling](https://nuxt.com/docs/4.x/getting-started/styling) inform typed one-way contracts and explicit stylesheet integration.

These are public articles and a commissioned brand case study, not an official Riot Vue design system. Forza's F monogram, token values, components, and compositions are original implementation. No Riot logos, proprietary fonts, game art, or copied code. The typography is self-hosted Barlow Condensed, Manrope, and IBM Plex Mono via Fontsource; preserve their OFL notices when distributing.

## Architecture and component map

`src/forza/` is the reusable library. Its runtime dependencies are Vue 3.5+, Reka UI, @lucide/vue, and @formkit/auto-animate. `src/ui-kit/` is the demonstration application. `ui-kit.html` is a separate entry. The existing BuildValue app is not a library dependency.

Tokens have three layers: primitives (palette, spacing, type), semantics (background, action, feedback), and components (button, field, panel). Everything is scoped to `.fz-theme`. Put `data-theme="paper"` on the wrapper for the alternate theme. Host applications own fonts; the showcase imports self-hosted Latin subsets.

| Component | Responsibility | Public contract |
| --- | --- | --- |
| FzButton | Action and busy/disabled states | variant: primary/secondary/ghost; size: sm/md; type; disabled; loading; default/trailing slots; native attributes/events |
| FzBadge | Labeled status | tone: neutral/positive/warning/accent; default slot |
| FzPanel | Content container | title; eyebrow; default/action/footer slots |
| FzField | Labeled text entry | required string v-model; label; hint; error; placeholder; disabled; text/search/email type; native attributes forwarded to input |
| FzSwitch | Binary preference | required boolean v-model; label; disabled; role=switch |
| FzTabs | Related content navigation | required string v-model; label; options with unique value/label; scoped default slot; arrows/Home/End |
| FzMeter | Bounded quantity | value; max; label; positive/accent/warning tone; clamped accessible value |
| FzStat | Labeled number | label; formatted value; optional detail |
| FzDialog | Modal interaction | required boolean v-model; title; default/footer slots; Escape, focus loop, focus restoration; optional description and closeOnOutside; scoped close callback |

Composition boundaries: Showcase owns theme and section assembly. Hero/Foundations explain identity. Controls owns control demo state. BuildLab owns search/category/selection and computed derived totals. ItemCard accepts a typed fixture and emits its id on toggle. Docs owns framework example selection. No shared store is necessary. ItemCard and fictional data are not library exports.

Use nonempty options and a matching model value with FzTabs. Dialog uses Reka UI for modal focus, Escape, outside interaction, and scroll locking. It renders within its theme scope; place dialogs outside transformed or clipped ancestors. Nested dialogs and custom scroll containers need consumer testing. Test consumer-specific validation, screen-reader workflows, and complex modal content before production adoption.

## Vue integration

Install `reka-ui`, `@lucide/vue`, and `@formkit/auto-animate`. Copy `src/forza` into the consuming application, then:

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'
import { FzButton, FzField } from './forza'
const name = shallowRef('')
</script>
<template>
  <div class="fz-theme">
    <FzField v-model="name" label="Build name" />
    <FzButton :disabled="!name.trim()">Save build</FzButton>
  </div>
</template>
```

The barrel imports tokens; individual SFC imports require an explicit tokens.css import. The host loads its desired fonts or overrides `--fz-font-body`, `--fz-font-display`, and `--fz-font-mono`.

## Nuxt integration

Copy `src/forza` into `app/components/forza`. Explicitly import from `~/components/forza` in pages/components. Wrap the application layout in `.fz-theme` and add `~/components/forza/tokens.css` to `nuxt.config.ts`'s css array. No plugin, ClientOnly wrapper, or Tailwind module is required. IDs use Vue useId; browser operations occur only after mounting or in user event handlers.

SSR is verified through Vue's server renderer. An end-to-end Nuxt consumer build is still a release gate, not a completed check. A Nuxt auto-registration module and published package are future deliverables after approval.

## Build and verification

- `npm run typecheck:kit`: strict Vue/TypeScript validation of library and showcase.
- `npm run build`: existing app and independent kit page.
- `npm run build:kit`: ES module library with external Vue, Reka UI, Lucide, and AutoAnimate, token/component CSS, and TypeScript declarations under `dist-kit/types`.
- `npm run test:kit:ssr`: render the full showcase without browser globals.
- `npm run test:kit`: nine Chromium tests. Interactions, comparison math, focus restoration/containment, and axe WCAG A/AA checks at 390, 768, and 1440px in both themes. Screenshots land in ignored `test-results/`.

Automated scans are not accessibility certification. Manual screen-reader and cross-browser checks remain release gates. Existing dependency audit reports seven advisories (one moderate, six high); this task does not update the legacy app's dependency ranges. Review and remediate them before deploying the existing application. The new runtime dependency licenses are recorded in src/forza/THIRD_PARTY_NOTICES.txt.

## Proposed approval sequence

1. Review the visual identity, density, interaction feel, and component boundaries.
2. Once approved, create the independent open-source project, settle its public package name/license, add Nuxt consumer CI, cross-browser and screen-reader testing, and package metadata/versioning.
3. Audit BuildValue's workflows and data correctness, then implement agreed feature improvements and migrate its styling in tested slices. Remove old CSS only after every dependent screen has migrated.

Nothing in the current preview represents approval of steps 2 or 3.

## Motion and icon revision

The former Vantage preview is now Forza UI. Components use Fz names, CSS uses --fz tokens, and the library lives in src/forza. No compatibility aliases are kept for this unpublished prototype.

The revision follows [shadcn-vue Dialog](https://www.shadcn-vue.com/docs/components/dialog) and [Reka animation guidance](https://reka-ui.com/docs/guides/animation): modal content stays mounted through exit, with independent overlay and content keyframes. Reka handles accessibility behavior; Forza owns styling and timings. This is dependency composition, not a fork or copied shadcn theme.

[AutoAnimate](https://auto-animate.formkit.com/) handles additions, removals, and reordering. Its measured-layout technique does real layout work, so use it for modest lists. Virtualize large collections and set motionDisabled where appropriate. Dialogs and selector indicators animate transform/opacity; no full-screen blur animation is added. Selector measurements happen after selection, resize, and font loading.

| Token | Default | Purpose |
| --- | --- | --- |
| --fz-motion-fast | 160ms | Focus, local feedback |
| --fz-motion-layout | 260ms | List changes and selector movement |
| --fz-motion-enter | 320ms | Dialog/overlay appearance |
| --fz-motion-exit | 180ms | Dialog/overlay dismissal |
| --fz-ease-out | cubic-bezier(.16,1,.3,1) | Responsive start, soft settle |
| --fz-ease-in | cubic-bezier(.4,0,1,1) | Short departure |

FzField uses one pseudo-element at the control edge for focus. The native input has no border, shadow, or outline; a forced-colors fallback preserves focus visibility. Search icons sit in a fixed flex frame. Lucide icons are inline SVGs with a common viewBox, stroke width, and explicit dimensions. FzIcon defaults to decorative aria-hidden; pass label for informative icons and label icon-only buttons on the button itself.

| Addition | Contract |
| --- | --- |
| FzIcon | Typed name union; size; strokeWidth; optional accessible label |
| FzList<T> | items with unique stable ids; label; motionDisabled; duration in ms; scoped item/index slot and empty slot |
| FzSegmented | Controlled string v-model; labeled options; accessible pressed states |
| useForzaMotion | Parent element ref; reactive disabled/duration options; reduced state; cleanup on unmount |

All list operations remain in the consumer. The saved-build example uses useSavedBuilds as the owner, with readonly state and add/remove/undo/reorder actions. SavedBuildList receives props and emits intent. Removed rows become inert during their exit. Deleting a row moves focus to the next available action. No event bus or hidden global state.

OS reduced-motion is honored by CSS and the AutoAnimate wrapper, including preference changes while the page is open. Caller duration and disabled props are reactive. Entry/exit does not delay model updates. Selection updates immediately while its indicator catches up visually.

The browser tests cover dialog exit retention and reopening, save/delete/undo/reorder operations, icon bounds, single input focus styling, and reduced motion. Manual cross-browser performance profiling and a Nuxt consumer build remain release gates.
