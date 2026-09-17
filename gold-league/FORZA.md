# BuildValue uses Forza UI

The isolated approval preview has graduated into the standalone Forza UI library and is now used by BuildValue with Christian's explicit approval.

- Package: `@chrisdalbano/forza-ui@0.3.3`
- Library: https://forzaui.chrisdalbano.com
- Usage guide: https://forzaui.chrisdalbano.com/guide/buildvalue
- Migration: `../docs/design/FORZA-MIGRATION.md`

The application imports the published package and its stylesheet. The old `src/forza` copy and `ui-kit.html` preview were removed to prevent API and styling drift. Game-specific components belong to BuildValue. Reusable controls belong to Forza.
