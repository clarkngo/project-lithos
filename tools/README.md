# Tools

Supporting scripts for Project Lithos. Nothing here writes into `/novel`.

| Path | Purpose |
|---|---|
| [resonance-engine/](resonance-engine/) | JSON Schema + catalog + validation for Inscriptions |
| [export-manuscript.py](export-manuscript.py) | Compile `/novel/book-*/…/chapter-*.md` to EPUB/PDF via pandoc |

## Manuscript export

Requires [pandoc](https://pandoc.org/) on `PATH`. EPUB always. PDF needs a PDF engine (`xelatex`, `lualatex`, `pdflatex`, `wkhtmltopdf`, or `weasyprint`).

```bash
python3 tools/export-manuscript.py
python3 tools/export-manuscript.py --format epub
python3 tools/export-manuscript.py --book 1 --outdir dist/manuscript
```

Output defaults to `dist/manuscript/` at the repo root.
