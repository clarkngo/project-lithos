# Book Four art brief

Inventory of what exists, what is missing, and a ready-to-run prompt for every missing piece. Follow [visual-direction.md](visual-direction.md): late-90s JRPG painted-cel, original designs only, **no overlay text on portraits or plates**, Shifts never clean. Scenes below are taken from the manuscript in `novel/book-4/`; where a look is not on the page, keep it labeled illustrative.

## What exists (checked)

| Set | Present | Notes |
|---|---|---|
| Chapter plates, Books 1–3 | 66 of 66 | `chapters/book-N/act-N/chapter-NN.png`, 1280×720, letterless |
| Covers, Books 1–3 | 6 of 6 | `covers/book-N.png` and `book-N-authored.png`, 864×1152 |
| World plates | 7 | seam, forest, Hollow Cut, Wastes, Vault, Spire, Kesh Hollow |
| Cast portraits | 14 | Caelen (2), Varrick, Rook, Malakar, Seraphina, Kell, Voss, Fenn, Orell, Reth, Ilvane, Maren, Corwin, plus key-art poster |
| Artifacts, Lithoi, Resonance | 4 | cores, conduit, Lithoi reconstruction, the Shift |

## Status

**Filled.** Cover + authored, 22 chapter plates, five cast portraits, three world plates, and the cradle system plate are on disk and wired in `apps/codex-web/src/lib/art.ts`. Scene prompts below remain the generation brief for regenerations.

## Cover

Ink-wash, parchment ground with soft smoke edges, place not party. The third harbor seen from the water: a black cliff banded with honey stone, a stair of whitewashed houses climbing it, the tide-house on stilts at the head, a long row of tiny lit lamps along the clifftop, a grey ship at anchor beyond a raised iron boom chain. A few small figures on the quay. Vertical 3:4. **Authored variant** adds, in the established layout: *The* / **LAST LITHOI** / rule / **THE SLEEPING SHORE**, and **CLARK NGO** at the foot.

## Chapter plates (1280×720, 16:9, no text)

| File | Scene |
|---|---|
| act-1/ch01 | The hall ship's deck in grey swell; Rook green-faced on the companionway step with a bucket, Caelen crouched offering a strip of dried meat |
| act-1/ch02 | The tide-house: walls of oiled-sailcloth ledgers, Vesh in a dark blue coat with tally buttons, an open Ledger with a blank "Name" line |
| act-1/ch03 | A whitewashed room painted with gold stars; handprints pressed into the wall; a thin girl low on all fours, gold cat-eyes on Caelen's chest |
| act-1/ch04 | Seraphina reading at night by a steady lamp, a stilted room that leans with the tide, tally strokes in a page margin |
| act-1/ch05 | Caelen sitting cross-legged facing a wall, burned hand wrapped, a strip of dried meat on the floor, a small figure watching from blankets |
| act-1/ch06 | Moonlit floor: Tamsin sitting by the door with a tray, the girl standing over her eating bread |
| act-1/ch07 | A window onto the banded cliff; the girl's palm flat on Caelen's chest |
| act-1/ch08 | A swept cliff road edged with white stones; tin-hooded lamps in niches below the lip; Caelen lying at the edge, hand on the rock |
| act-1/ch09 | Reth at the rail of a grey three-master at dawn, leather ledger in hand, headland ahead with tiny lamps |
| act-1/ch10 | The girl on the white house threshold, mouth open in song; the town below, the cliff lamps flaring all at once |
| act-2/ch01 | The raised boom chain, men along the quay with boathooks and a rusted lance, a skiff and a grey ship beyond |
| act-2/ch02 | The council chamber at dusk, Hask at the window, empty horseshoe of chairs |
| act-2/ch03 | The Honey Chapel's amber chamber, the girl with both palms on a carved spiral, Seraphina and Caelen beside her |
| act-2/ch04 | A wind-bent thorn on a knoll at dawn, Caelen on his back, the lit headland below |
| act-2/ch05 | Malakar at a lamp, loose Guild pages spread on a table, one finger on a clause |
| act-2/ch06 | A ledge at low tide; a boy curled in honey stone in a niche; Caelen and the girl singing, Nessa with a lamp |
| act-2/ch07 | Hask among forty-three unmarked grey slabs on a salt-bitten plateau at night |
| act-2/ch08 | A council table, a small lead-lined box open on it, a grey stick of waxed paper in the felt |
| act-2/ch09 | The cliff road in a gale, forty-one lamps burning through the rain, a red fuse bead in the grass |
| act-2/ch10 | A half-drowned sea cave; a ring of lanterns on the shelf; Caelen holding a naked child in the surf |
| act-2/ch11 | The quay in thin morning light: Vesh at the tide-house door with the Ledger open, strokes crossed out |
| act-2/ch12 | The girl on the end of the harbor wall at dusk in a blue dress, Caelen beside her, a grey ship's lights beyond the boom |

## Cast portraits (864×1152, plain ground, no text)

- **The girl:** about nine, thin, honey-tinted skin, short dark hair with a gleam of gold, large green-gold cat-eyes, a cut-down grey smock or a plain blue dress, a wooden horse missing one ear. Not a child-warrior, not glowing.
- **Tamsin Orre:** twenty-two, short dark braid with a pencil stuck through it, ink to the second knuckle, a blue tide-clerk's sash tied too tight, narrow freckled stubborn face.
- **Ondrei Vesh:** about fifty-five, spare, spectacles on a cord, close grey beard, dark blue harbor coat with tally-stamped brass buttons, hands that shake.
- **Brine-Reeve Hask:** sixty, broad, heavy-lidded, salt-stiffened coat, a face the weather has worked on.
- **Nessa:** old, leather-folded face, white hair cut straight at the jaw, net-needle in hand, ring of keys, oil-can.

## World and system plates

- **The third harbor:** the stair-town from the quay, boom chain, tarred boats, cliff with lamp row. 16:9.
- **The Honey Chapel:** low whitewashed passage opening on a round natural chamber, veined walls glowing amber, a carved spiral. 16:9.
- **Cliff road at night:** swept gravel, white edge-stones, a string of small gold lamps, sea beyond. 16:9.
- **The cradle:** a small curled child inside honey-colored stone, edge softening like wax, a lamp beside it. Illustrative. 3:4.

## Codex wiring (after the cover exists)

`apps/codex-web/src/lib/art.ts` lists covers for Books 1–3 explicitly (around lines 156–166). Add a Book Four entry pointing at `covers/book-4-authored.png` only once that file is present, or the build will reference a missing image.
