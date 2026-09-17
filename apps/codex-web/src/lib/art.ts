const files = import.meta.glob("../../../../art/{world,characters,lithoi,artifacts,resonance}/**/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

export type ArtPlate = {
  src: string;
  alt: string;
  caption?: string;
  speculative?: boolean;
};

function urlFor(relativeFromArt: string): string | undefined {
  const needle = `/art/${relativeFromArt}`;
  const match = Object.entries(files).find(([key]) => key.replaceAll("\\", "/").endsWith(needle));
  return match?.[1];
}

function plate(relativeFromArt: string, alt: string, extra: Partial<ArtPlate> = {}): ArtPlate | undefined {
  const src = urlFor(relativeFromArt);
  if (!src) return undefined;
  return { src, alt, ...extra };
}

const CHARACTER_FILES: Record<string, { file: string; alt: string; speculative?: boolean }> = {
  caelen: {
    file: "characters/caelen-after-the-seam.png",
    alt: "Caelen, a small underfed child in a ragged shift, sitting among shards of amber-dark glass.",
  },
  varrick: {
    file: "characters/varrick-forest-edge.png",
    alt: "Varrick, an older scavenger with a packed bag and a pry-bar, in wet forest.",
  },
  rook: {
    file: "characters/rook.png",
    alt: "Rook, a street-hardened youth in patched scavenger clothes.",
    speculative: true,
  },
  malakar: {
    file: "characters/malakar.png",
    alt: "Malakar, a Warden investigator in a dark coat, holding a ledger.",
    speculative: true,
  },
  seraphina: {
    file: "characters/seraphina.png",
    alt: "Seraphina, an exiled Spire noble in formal dark brass-trimmed dress.",
    speculative: true,
  },
};

const DOC_PLATES: Record<string, Record<string, { file: string; alt: string; caption?: string; speculative?: boolean }>> = {
  factions: {
    "mining-guild": {
      file: "world/deep-strata-seam.png",
      alt: "A deep-strata mine gallery with a cracked seam of amber-dark marrow-glass.",
      caption: "Extraction country. The Guild lives where the seam still pays.",
    },
    "warden-enforcers": {
      file: "world/the-vault.png",
      alt: "A sealed brass-and-stone door in a cliff above the Wastes.",
      caption: "Sealed sites. Procedure first.",
    },
    "the-synod": {
      file: "world/the-spire.png",
      alt: "A vertical stone-and-brass court structure in fog.",
      caption: "Doctrine, looking down.",
      speculative: true,
    },
  },
  "magic-system": {
    "lithosomatic-resonance": {
      file: "artifacts/brass-conduit.png",
      alt: "A forearm brass conduit with three slots, one amber-dark core locked.",
      caption: "Brass housing. Three slots. The metal is cold before a Shift.",
    },
    "inscription-triads": {
      file: "artifacts/aethel-core-still-life.png",
      alt: "Raw marrow-glass beside a cut Aethel-Core shard and a brass cutter.",
      caption: "Raw marrow-glass and a conduit-ready shard.",
    },
    costs: {
      file: "resonance/the-shift.png",
      alt: "A Resonant mid-Shift: tearing hands, brass conduit, breath steaming in the cold.",
      caption: "A Shift is a tearing, not a costume change.",
    },
    "field-manual": {
      file: "resonance/the-shift.png",
      alt: "A Resonant mid-Shift: tearing hands, brass conduit, breath steaming in the cold.",
      caption: "Hold only as long as the job. Consecutive lighting is how Drift gets a vote.",
    },
  },
  timeline: {
    "pre-culling": {
      file: "lithoi/lithoi-reconstruction.png",
      alt: "Illustrative reconstruction of a Lithoi: a heavy terrene person with amber-dark marrow in the body.",
      caption: "Lithoi reconstruction — illustrative. They are extinct.",
    },
    "the-culling": {
      file: "world/deep-strata-seam.png",
      alt: "A deep-strata mine gallery with a cracked seam of amber-dark marrow-glass.",
      caption: "Deep strata. The hunt became a ledger.",
    },
    "post-war-reconstruction": {
      file: "world/glass-wastes.png",
      alt: "Over-mined badlands of vitrified ground under a pale sun.",
      caption: "The Glass Wastes — extraction laid bare.",
    },
  },
};

export const keyArt = plate(
  "characters/key-art-cast.png",
  "Key art: Caelen and Varrick standing before a large raptorial Shift, amber-dark glass in its ribs.",
  { caption: "The Last Lithoi" },
);

export const worldPlates: ArtPlate[] = [
  plate("world/deep-strata-seam.png", "Deep-strata mine gallery and a cracked marrow-glass seam.", {
    caption: "Deep strata — Caelen's origin",
  }),
  plate("world/forest-above-the-mine.png", "Wet forest and a dark mine mouth in the hillside.", {
    caption: "Forest above the mine",
  }),
  plate("world/hollow-cut.png", "Muddy fringe settlement under dripping trees.", {
    caption: "Hollow Cut",
  }),
  plate("world/glass-wastes.png", "Over-mined vitrified badlands.", {
    caption: "The Glass Wastes",
  }),
  plate("world/the-vault.png", "A sealed brass-and-stone door in a cliff above the Wastes.", {
    caption: "The Vault",
  }),
  plate("world/the-spire.png", "A vertical stone-and-brass court structure in fog. Illustrative.", {
    caption: "The Spire (illustrative)",
    speculative: true,
  }),
].filter((item): item is ArtPlate => Boolean(item));

export function characterPlate(slug: string): ArtPlate | undefined {
  const spec = CHARACTER_FILES[slug];
  if (!spec) return undefined;
  return plate(spec.file, spec.alt, { speculative: spec.speculative });
}

export function docPlate(collection: string, slug: string): ArtPlate | undefined {
  const spec = DOC_PLATES[collection]?.[slug];
  if (!spec) return undefined;
  return plate(spec.file, spec.alt, { caption: spec.caption, speculative: spec.speculative });
}

export function thumbsFor(collection: string, slugs: string[]): Record<string, ArtPlate | undefined> {
  return Object.fromEntries(
    slugs.map((slug) => [slug, collection === "characters" ? characterPlate(slug) : docPlate(collection, slug)]),
  );
}
