#!/usr/bin/env node
/**
 * Validate the Resonance catalog, JSON Schema files, and example instances.
 *
 * Usage: node validate.mjs
 * Exit 0 on success, 1 on unexpected pass/fail.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv/dist/2020.js";

const root = dirname(fileURLToPath(import.meta.url));
const schemasDir = join(root, "schemas");
const examplesDir = join(root, "examples");

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

const schemaFiles = {
  "form-vector": "form-vector.schema.json",
  "affinity-cadence": "affinity-cadence.schema.json",
  "mutator-node": "mutator-node.schema.json",
  catalog: "catalog.schema.json",
  inscription: "inscription.schema.json",
};

const ajv = new Ajv({ allErrors: true, strict: true });

for (const file of Object.values(schemaFiles)) {
  ajv.addSchema(loadJson(join(schemasDir, file)));
}

const validators = {
  "form-vector": ajv.getSchema("https://project-lithos.local/schemas/form-vector.json"),
  "affinity-cadence": ajv.getSchema(
    "https://project-lithos.local/schemas/affinity-cadence.json",
  ),
  "mutator-node": ajv.getSchema("https://project-lithos.local/schemas/mutator-node.json"),
  catalog: ajv.getSchema("https://project-lithos.local/schemas/catalog.json"),
  inscription: ajv.getSchema("https://project-lithos.local/schemas/inscription.json"),
};

for (const [name, validator] of Object.entries(validators)) {
  if (!validator) {
    console.error(`Failed to compile schema: ${name}`);
    process.exit(1);
  }
}

let failures = 0;

function report(ok, label, extra = "") {
  const mark = ok ? "ok" : "FAIL";
  if (!ok) failures += 1;
  console.log(`  [${mark}] ${label}${extra ? ` — ${extra}` : ""}`);
}

function formatErrors(validator) {
  return (validator.errors ?? [])
    .map((err) => `${err.instancePath || "/"} ${err.message}`)
    .join("; ");
}

function catalogIds(catalog) {
  return {
    formVectors: new Set(catalog.formVectors.map((item) => item.id)),
    affinityCadences: new Set(catalog.affinityCadences.map((item) => item.id)),
    mutatorNodes: new Set(catalog.mutatorNodes.map((item) => item.id)),
  };
}

function referentialCheck(inscription, ids) {
  const problems = [];
  if (!ids.formVectors.has(inscription.formVectorId)) {
    problems.push(`unknown formVectorId: ${inscription.formVectorId}`);
  }
  if (!ids.affinityCadences.has(inscription.affinityCadenceId)) {
    problems.push(`unknown affinityCadenceId: ${inscription.affinityCadenceId}`);
  }
  if (
    inscription.mutatorNodeId != null &&
    !ids.mutatorNodes.has(inscription.mutatorNodeId)
  ) {
    problems.push(`unknown mutatorNodeId: ${inscription.mutatorNodeId}`);
  }
  return problems;
}

console.log("Catalog");
const catalog = loadJson(join(root, "catalog.json"));
const catalogOk = validators.catalog(catalog);
report(catalogOk, "catalog.json matches catalog schema", catalogOk ? "" : formatErrors(validators.catalog));

const ids = catalogOk ? catalogIds(catalog) : { formVectors: new Set(), affinityCadences: new Set(), mutatorNodes: new Set() };

if (catalogOk) {
  for (const item of catalog.formVectors) {
    const ok = validators["form-vector"](item);
    report(ok, `form vector ${item.id}`, ok ? "" : formatErrors(validators["form-vector"]));
  }
  for (const item of catalog.affinityCadences) {
    const ok = validators["affinity-cadence"](item);
    report(ok, `affinity cadence ${item.id}`, ok ? "" : formatErrors(validators["affinity-cadence"]));
  }
  for (const item of catalog.mutatorNodes) {
    const ok = validators["mutator-node"](item);
    report(ok, `mutator node ${item.id}`, ok ? "" : formatErrors(validators["mutator-node"]));
  }
}

console.log("\nValid inscription examples (expect schema + referential pass)");
const validDir = join(examplesDir, "valid");
for (const file of readdirSync(validDir).filter((name) => name.endsWith(".json"))) {
  const instance = loadJson(join(validDir, file));
  const schemaOk = validators.inscription(instance);
  const refProblems = schemaOk ? referentialCheck(instance, ids) : [];
  const ok = schemaOk && refProblems.length === 0;
  report(
    ok,
    file,
    ok
      ? ""
      : schemaOk
        ? refProblems.join("; ")
        : formatErrors(validators.inscription),
  );
}

console.log("\nInvalid examples (expect the documented failure)");
const invalidDir = join(examplesDir, "invalid");
const manifest = loadJson(join(invalidDir, "manifest.json"));

for (const [file, spec] of Object.entries(manifest)) {
  const instance = loadJson(join(invalidDir, file));
  const validator = validators[spec.schema];
  if (!validator) {
    report(false, file, `unknown schema ${spec.schema}`);
    continue;
  }
  const schemaOk = validator(instance);

  if (spec.expect === "schema-fail") {
    report(!schemaOk, file, schemaOk ? "schema unexpectedly passed" : formatErrors(validator));
    continue;
  }

  if (spec.expect === "ref-fail") {
    if (!schemaOk) {
      report(false, file, `schema failed before referential check: ${formatErrors(validator)}`);
      continue;
    }
    const refProblems = referentialCheck(instance, ids);
    report(
      refProblems.length > 0,
      file,
      refProblems.length > 0 ? refProblems.join("; ") : "referential check unexpectedly passed",
    );
    continue;
  }

  report(false, file, `unknown expect: ${spec.expect}`);
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}

console.log("\nAll resonance-engine checks passed.");
