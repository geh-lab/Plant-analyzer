import test from "node:test";
import assert from "node:assert/strict";
import {
  parseGasExchange,
  kjeldahlNitrogen,
} from "../src/utils/instrumentData.js";
import {
  parsePeakPdfLines,
  parsePeakTable,
  rematchHplcFile,
  hplcFileInfo,
} from "../src/utils/hplcPeaks.js";

test("Kjeldahl corrects for the blank, accepts a measured zero and rejects invalid denominators", () => {
  const sample = { sample: 2.1, blank: 0.1, normality: 0.05, mass: 0.1 };
  assert.ok(Math.abs(kjeldahlNitrogen(sample) - 1.4007) < 1e-9);
  assert.equal(kjeldahlNitrogen({ ...sample, sample: 0.1 }), 0);
  for (const invalid of [
    { blank: 3 },
    { blank: "" },
    { mass: 0 },
    { normality: -1 },
  ]) {
    assert.equal(kjeldahlNitrogen({ ...sample, ...invalid }), null);
  }
});
test("LI-6800 reads tab-separated instrument columns and retains negative and zero assimilation", () => {
  const file =
    "metadata\nGasEx:A\tGasEx:Ci\tLight:Qin\nµmol\tµmol\tµmol\n-2\t380\t0\n0\tNA\t40\n4\t200\t100";
  const { records, skipped } = parseGasExchange(file);
  assert.deepEqual(records, [
    { A: -2, Ci: 380, Q: 0 },
    { A: 0, Q: 40, Ci: null },
    { A: 4, Q: 100, Ci: 200 },
  ]);
  assert.equal(skipped, 1);
  assert.equal(parseGasExchange("A,E\n2,4").records.length, 0);
});
test("peak imports distinguish absolute area from area percent and ignore invalid rows", () => {
  const csv = "RT,Area%,Area\n4.99,95,1.2e3\ninvalid,4,33\n5.7,5,0";
  assert.deepEqual(parsePeakTable(csv), {
    peaks: [
      { rt: 4.99, area: 1200 },
      { rt: 5.7, area: 0 },
    ],
    skipped: 1,
  });
  const pdf = [
    "Peak No. Ret. Time [min] Area Area % Height",
    "1 4.32 320 80 454",
    "2 4.82 80 20 20",
  ];
  assert.deepEqual(parsePeakPdfLines(pdf).peaks, [
    { rt: 4.32, area: 320 },
    { rt: 4.82, area: 80 },
  ]);
  assert.equal(
    parsePeakPdfLines(["Peak RT Area % Height", "1 4.32 80 454"]).peaks.length,
    0,
  );
});
test("RT window crosses minute boundaries, excludes unmatched and ambiguous peaks, retains zero area", () => {
  const sample = {
    ...hplcFileInfo("light_blue_1.csv"),
    rawPeaks: [
      { rt: 4.99, area: 0 },
      { rt: 5.8, area: 35 },
    ],
    tolerance: 0.1,
  };
  const match = (standards) =>
    rematchHplcFile(sample, standards).processedResults;
  assert.equal(match({ x: 5 })[0].matchedRT, 4.99);
  assert.equal(match({ x: 5 })[0].area, 0);
  assert.equal(match({ x: 6 })[0].area, null);
  assert.ok(
    match({ x: 5, y: 5.01 }).every(
      (row) => row.matchStatus === "ambiguous" && row.matchedRT === null,
    ),
  );
  const tie = {
    ...sample,
    rawPeaks: [
      { rt: 4.99, area: 12 },
      { rt: 5.01, area: 16 },
    ],
  };
  assert.equal(
    rematchHplcFile(tie, { x: 5 }).processedResults[0].matchStatus,
    "ambiguous",
  );
  assert.equal(
    rematchHplcFile({ name: "legacy", peaks: 2 }, { x: 5 }).name,
    "legacy",
  );
});

import {
  hplcConcentration,
  desulfoFactors,
} from "../src/utils/hplcQuantification.js";
import { HPLC_PROTOCOLS } from "../src/data/hplcProtocols.js";

test("desulfated peaks use a sample-specific internal-standard amount, dry mass and analyte-to-standard factors", () => {
  const params = {
    method: "desulfo-is",
    standardCompound: "Glucotropaeolin",
    responseFactors: desulfoFactors,
    sampleInputs: [{ name: "leaf", area: 200, amount: 0.1, mass: 0.05 }],
  };
  const row = { sampleName: "leaf", compound: "Glucobrassicin", area: 100 };
  assert.ok(
    Math.abs(hplcConcentration(row, params, "glucosinolate") - 0.29 / 0.95) <
      1e-10,
  );
  assert.equal(
    hplcConcentration(
      { ...row, sampleName: "unknown" },
      params,
      "glucosinolate",
    ),
    null,
  );
  assert.equal(
    hplcConcentration(
      { ...row, compound: "Glucotropaeolin" },
      params,
      "glucosinolate",
    ),
    null,
  );
  assert.equal(
    hplcConcentration(
      row,
      { ...params, responseFactors: { Glucotropaeolin: 0.95 } },
      "glucosinolate",
    ),
    null,
  );
  assert.equal(
    hplcConcentration(
      row,
      { standardArea: 12, sampleWeight: 1, molecularWeight: 300 },
      "glucosinolate",
    ),
    null,
  );
});
test("compound-specific calibration resolves individual slopes, intercepts and sample dilution", () => {
  const params = {
    Arbutin_a: 2,
    Arbutin_b: 100,
    Rutin_a: 10,
    Rutin_b: 10,
    extractionVolume: 1.5,
    sampleWeight: 0.1,
    dilutionFactor: 2,
  };
  const get = (c, a) =>
    hplcConcentration({ area: a, compound: c }, params, "phenol");
  assert.ok(Math.abs(get("Arbutin", 200) - 1.5) < 1e-10);
  assert.ok(Math.abs(get("Rutin", 200) - 0.57) < 1e-10);
  assert.equal(get("Arbutin", 100), 0);
  assert.equal(get("Arbutin", 99), null);
  assert.equal(get("Another", 200), null);
});
test("all HPLC method families expose the same primary references in Korean and English", () => {
  assert.equal(Object.keys(HPLC_PROTOCOLS).length, 5);
  for (const p of Object.values(HPLC_PROTOCOLS)) {
    assert.ok(p.ko.sources.length >= 1);
    assert.deepEqual(
      p.ko.sources.map((s) => s.url),
      p.en.sources.map((s) => s.url),
    );
    assert.ok(
      p.ko.sources.every((s) => s.scope && s.url.startsWith("https://")),
    );
  }
});

import {
  absorbanceParameterKey,
  hplcParameterKey,
  readAbsorbanceParameters,
  readHplcParameters,
} from "../src/utils/calibrationStorage.js";
test("HPLC and absorbance GSL calibrations cannot overwrite one another or their legacy source", () => {
  const type = "glucosinolate",
    legacy = { standardArea: 100, molecularWeight: 300 };
  const store = new Map([["calc_params_" + type, legacy]]);
  const read = (key, fallback) => (store.has(key) ? store.get(key) : fallback);
  assert.deepEqual(readHplcParameters(type, read), legacy);
  assert.deepEqual(readAbsorbanceParameters(type, read), {});
  const color = { std_a: 2, std_b: 0 },
    desulfo = { method: "desulfo-is", standardCompound: "Sinigrin" };
  store.set(absorbanceParameterKey(type), color);
  assert.deepEqual(readHplcParameters(type, read), legacy);
  store.set(hplcParameterKey(type), desulfo);
  assert.deepEqual(readAbsorbanceParameters(type, read), color);
  assert.deepEqual(readHplcParameters(type, read), desulfo);
  assert.deepEqual(store.get("calc_params_" + type), legacy);
  store.clear();
  store.set("calc_params_" + type, { ...legacy, ...color });
  assert.deepEqual(readHplcParameters(type, read), legacy);
  assert.deepEqual(readAbsorbanceParameters(type, read), color);
  store.clear();
  store.set("calc_params_" + type, color);
  assert.deepEqual(readHplcParameters(type, read), {});
  assert.deepEqual(readAbsorbanceParameters(type, read), color);
});
