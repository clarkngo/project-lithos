# Resonance engine

JSON Schema definitions and validation for **Inscriptions** — the three-slot brass conduit system used by Lithosomatic Resonance.

The Codex web app (`apps/codex-web`) imports `catalog.json` directly. Keep this folder as the single source of truth; do not fork the list inside the app.

## Layout

| Path | Purpose |
|---|---|
| `schemas/` | Form Vector, Affinity Cadence, Mutator Node, catalog, and inscription schemas |
| `catalog.json` | Illustrative working set consumed by the Inscription calculator |
| `examples/valid/` | Inscription instances that must pass |
| `examples/invalid/` | Instances that must fail, with expected failure mode in `manifest.json` |
| `validate.mjs` | Ajv-backed checker used in CI |

Every catalog entry is still `"illustrative": true` (physiology is not locked). `"attested": true` means the **name** is in the project lexicon (Talon, Barrow, Ember, Marsh, Gross, Feral). Ridge, Gale, and Hollow are extras — do not speak them on the page until the manuscript does.

Field practice (hold duration, unassisted transformation, Drift) lives in `docs/magic-system/field-manual.md`, not in this JSON.

## Run

```bash
cd tools/resonance-engine
npm install
npm run validate
```

Requires Node 20+.
