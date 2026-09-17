# Project Lithos

Monorepo for ***The Last Lithoi*** — a speculative fantasy novel (structurally inspired by *Breath of Fire III*, fully original; no shared IP), its worldbuilding bible, a companion Codex site, and supporting tools.

The manuscript lives in `/novel` and is drafted separately. Do not treat this README, `docs/`, or the Codex as a license to rewrite chapters.

## Directory map

```
project-lithos/
├── .github/workflows/   CI/CD — Pages deploy + lint/build/schema checks
├── apps/codex-web/      Astro + Tailwind lore/docs site
├── art/                 Concept art (world, Lithoi, cast, artifacts)
├── docs/                Canonical worldbuilding & lore bible
│   ├── characters/
│   ├── factions/
│   ├── magic-system/
│   └── timeline/
├── novel/               Manuscript (managed separately; off-limits to scaffolding work)
├── tools/
│   ├── resonance-engine/   JSON schemas + Inscription catalog
│   └── export-manuscript.py
└── README.md
```

## Codex site (`apps/codex-web`)

Renders Markdown from `docs/` and `/novel` at build time, plus the locked jrpg-v2 plates from `art/` (home key art, cast, map, Resonance). The Inscription calculator imports `tools/resonance-engine/catalog.json` — lore is not duplicated inside the app.

Public chapter URLs follow the manuscript folders, e.g. `https://clarkngo.github.io/project-lithos/novel/book-1/act-1/chapter-01/`.

```bash
cd apps/codex-web
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in apps/codex-web/dist
```

GitHub Pages builds this app and deploys `dist/` (see `.github/workflows/static.yml`). It no longer uploads the repository root.

## Resonance engine

```bash
cd tools/resonance-engine
npm install
npm run validate
```

## Manuscript export

Reads `/novel/book-*/act-*/chapter-*.md` (front-matter first, then acts, numeric filenames). Matching plates in `art/chapters/` are inserted at export time; `/novel` is never rewritten. Writes EPUB/PDF under `exports/` (never into `/novel`).

Requires [pandoc](https://pandoc.org/) on `PATH`. PDF also needs a PDF engine (`typst`, `weasyprint`, `xelatex`, `lualatex`, `pdflatex`, or `wkhtmltopdf`).

```bash
python3 tools/export-manuscript.py
python3 tools/export-manuscript.py --format epub
python3 tools/export-manuscript.py --book 1
```

## License

[All rights reserved](LICENSE). The manuscript, worldbuilding bible, Codex site, and tools are proprietary original work. This is not an open-source license.
