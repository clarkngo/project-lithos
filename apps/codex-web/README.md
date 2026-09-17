# Codex web

Astro + Tailwind static site for *The Last Lithoi*. Lore is **not hardcoded** here — pages render Markdown from `docs/` at build time, and the Inscription calculator imports `tools/resonance-engine/catalog.json`.

## Scripts

```bash
cd apps/codex-web
npm install
npm run dev      # http://localhost:4321
npm run lint     # astro check
npm run build    # static output in dist/
npm run preview
```

GitHub Pages deploys `dist/` via `.github/workflows/static.yml`. In CI, `base` is `/project-lithos/`.
