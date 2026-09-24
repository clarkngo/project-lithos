# Art

Visual development for *The Last Lithoi*. These images are **companion concept art**, not manuscript canon. Where a look is unconfirmed on the page, treat it as a working hypothesis and keep it marked illustrative.

The Codex (`apps/codex-web`) displays this folder as the site's main art: series key art on home, volume covers on the novel index, portraits on the cast, world plates on the map, conduit/cores/Shift on Resonance. `/novel` is not the place for art files.

## Layout

| Path | Purpose |
|---|---|
| [visual-direction.md](visual-direction.md) | Palette, materials, bans, how Lithoi and cores should look |
| [prompts.md](prompts.md) | Reusable generation prompts |
| `world/` | Places: mine, forest, Hollow Cut, Glass Wastes, Vault, Spire, Kesh Hollow |
| `lithoi/` | The extinct lineage — remains, reconstruction |
| `characters/` | Cast portraits and the series key-art poster |
| `covers/` | Volume covers (`book-N.png` art; `book-N-authored.png` with Clark Ngo for export/Codex) |
| `artifacts/` | Aethel-Cores, marrow-glass, brass conduits |
| `resonance/` | Shifts and system plates |
| `chapters/` | Per-chapter plates (`book-N/act-N/chapter-NN.png`), no overlay type |


## Illustration style

**Locked: late-90s JRPG painted-cel** (`explorations/jrpg-v2/`). Current working files live in `world/`, `characters/`, `covers/`, `lithoi/`, `artifacts/`, `resonance/`.

Other labeled tests stay in `explorations/` (cinematic, cel-jrpg, bande dessinée). Do not copy Breath of Fire's cast.

See [visual-direction.md](visual-direction.md) for palette, bans, and JRPG rules.

## Current set

**World:** deep-strata seam, forest above the mine, Hollow Cut, Glass Wastes, the Vault, the Spire (illustrative), Kesh Hollow.

**Cast:** Caelen (child and adult), Varrick. **Book Two:** Kell, Voss, Fenn, Orell. **Book Three:** Reth, Ilvane, Maren, Corwin. **Speculative** (likeness not confirmed on the page): Rook, Malakar, Seraphina. Character portraits have no overlay type.

**Covers:** place posters for Books One–Three (`covers/book-N.png`); authored variants (`book-N-authored.png`) add **CLARK NGO** for EPUB/PDF and the Codex novel pages. Series key art (`characters/key-art-cast.png`) is the Codex home poster — Caelen, Varrick, and a costly Shift — not a volume box.

**Artifacts / system:** Aethel-Cores, brass conduit, Lithoi reconstruction (illustrative), a costly Shift.

**Chapters:** Books One–Three, Acts 1–2 — letterless painted-cel plates at `chapters/book-N/`.

## Rules

1. Match [visual-direction.md](visual-direction.md). If a prompt fights the bible, the bible wins.
2. Do not contradict `/docs` or `/novel`. Unconfirmed anatomy, architecture, and costume stay labeled illustrative.
3. Transformations are never clean. If you draw a Shift, draw the tearing and the cold.
4. No open-source relic dumps into the Codex `public/` folder until a piece is chosen on purpose.
