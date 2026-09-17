import catalog from "../../../../tools/resonance-engine/catalog.json";

export type FormVector = (typeof catalog)["formVectors"][number];
export type AffinityCadence = (typeof catalog)["affinityCadences"][number];
export type MutatorNode = (typeof catalog)["mutatorNodes"][number];
export type CostBand = "low" | "moderate" | "severe" | "critical";

export type InscriptionReport = {
  form: FormVector;
  cadence: AffinityCadence;
  node: MutatorNode | null;
  title: string;
  description: string;
  costs: {
    caloric: { score: number; band: CostBand; summary: string };
    tearing: { summary: string };
    hypothermia: { score: number; band: CostBand; summary: string };
    drift: { score: number; band: CostBand; summary: string };
  };
  illustrative: boolean;
};

export { catalog };

export function bandFor(score: number): CostBand {
  if (score <= 2) return "low";
  if (score <= 4) return "moderate";
  if (score <= 6) return "severe";
  return "critical";
}

const BAND_COPY: Record<CostBand, string> = {
  low: "payable in food and an hour of shaking",
  moderate: "a night of hunger and a body that will not warm on its own",
  severe: "visible wasting; names come back slower than the cold",
  critical: "lethal if stacked or held too long — this is how Drift gets a vote",
};

export function buildInscription(
  formId: string,
  cadenceId: string,
  nodeId: string | null,
): InscriptionReport | null {
  const form = catalog.formVectors.find((item) => item.id === formId);
  const cadence = catalog.affinityCadences.find((item) => item.id === cadenceId);
  if (!form || !cadence) return null;

  const node = nodeId
    ? (catalog.mutatorNodes.find((item) => item.id === nodeId) ?? null)
    : null;
  if (nodeId && !node) return null;

  const caloricScore =
    form.caloricWeight + cadence.caloricWeight + (node?.caloricModifier ?? 0);
  const driftScore =
    form.driftWeight + cadence.driftWeight + (node?.driftModifier ?? 0);
  const hypothermiaScore =
    cadence.hypothermiaWeight + (node?.hypothermiaModifier ?? 0);

  const caloricBand = bandFor(caloricScore);
  const driftBand = bandFor(driftScore);
  const hypothermiaBand = bandFor(hypothermiaScore);

  const nodeClause = node
    ? ` The ${node.name} then ${node.effect}.`
    : " No Mutator Node is locked; the triad is Form and Cadence only.";

  const description = [
    `${form.name} writes the scaffold: ${form.skeletalScaffold}.`,
    `${cadence.name} writes the breath: ${cadence.elementalBreath}. ${cadence.thermalProfile}.`,
    nodeClause.trim(),
    "The Shift is still a tearing, not a costume. Unlocking the cores does not put the old body back on a hook; aftermath is paid in food, heat, and time.",
  ].join(" ");

  const title = node
    ? `${form.name} · ${cadence.name} · ${node.name}`
    : `${form.name} · ${cadence.name}`;

  return {
    form,
    cadence,
    node,
    title,
    description,
    costs: {
      caloric: {
        score: caloricScore,
        band: caloricBand,
        summary: `Caloric debt ${caloricBand} (${caloricScore}): ${BAND_COPY[caloricBand]}. Fat and muscle go first.`,
      },
      tearing: {
        summary: `Tissue stress concentrates at ${form.tissueStress}. Expect torn skin, cracked nails, a voice gone raw.`,
      },
      hypothermia: {
        score: hypothermiaScore,
        band: hypothermiaBand,
        summary: `Post-Shift hypothermia ${hypothermiaBand} (${hypothermiaScore}): ${cadence.thermalProfile}.`,
      },
      drift: {
        score: driftScore,
        band: driftBand,
        summary: node?.id === "feral"
          ? `Atavistic Drift ${driftBand} (${driftScore}): ${node.name} brings predatory instinct forward in the order of operations. Characters drift; they do not level up.`
          : `Atavistic Drift ${driftBand} (${driftScore}): repeated or prolonged Shifting erodes toward predatory instinct. Characters drift; they do not level up.`,
      },
    },
    illustrative: form.illustrative || cadence.illustrative || Boolean(node?.illustrative),
  };
}
