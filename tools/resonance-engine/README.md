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

Every catalog entry is flagged `"illustrative": true`. Named lexicon examples (Talon, Barrow, Ember, Marsh, Gross, Feral) plus a few extras (Ridge, Gale, Hollow) are working placeholders — confirm against the manuscript before treating them as canon.

## Run

```bash
cd tools/resonance-engine
npm install
npm run validate
```

Requires Node 20+.
