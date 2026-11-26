import test from "node:test";
import assert from "node:assert/strict";
import { readAssayCsv, assayTemplate } from "../src/utils/assayCsv.js";
import { calculateMda } from "../src/utils/mda.js";
import { makeCsv } from "../src/utils/resultData.js";

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10);

test("A532 minus A600 gives μM in the reaction mixture, scaled by optical path length", () => {
  const values = { 532: 0.205, 600: 0.050 };
  const measured = calculateMda(values);
  close(measured.correctedAbsorbance, 0.155);
  close(measured.result, 1);
  assert.equal(measured.unit, "μM");
  close(calculateMda(values, { mda: { pathlength: 0.5 } }).result, 2);
  assert.equal(calculateMda({532: 0, 600: 0}).result, 0);
});

test("unusable readings retain the quality flag and never produce a numerical concentration", () => {
  for (const blank of [undefined, null, "", " ", "abc", Infinity]) {
    assert.equal(calculateMda({ 532: blank, 600: 0 }).issue, "missing_reading");
    assert.equal(calculateMda({ 532: blank, 600: 0 }).result, null);
  }
  const below = calculateMda({ 532: 0.05, 600: 0.2 });
  assert.equal(below.issue, "negative_signal");
  assert.equal(below.result, null);
  assert.ok(below.correctedAbsorbance < 0);
  for (const pathlength of [0, -1, "", null, Infinity]) {
    assert.equal(calculateMda({ 532: 0.2, 600: 0 }, { mda: { pathlength } }).issue, "invalid_pathlength");
  }
});

test("template and exported raw wavelength columns import into both locales", () => {
  for (const lang of ["ko", "en"]) {
    const example = readAssayCsv(assayTemplate("mda"), "mda", lang);
    assert.equal(example.length, 4);
    close(calculateMda(example[0].absorbance_values).result, 1);
    const name = 'Line 1, "green"\nRep 2';
    const exported = makeCsv([["treatment_name", "sample_name", "532", "600", "result", "unit"], ["Control", name, 0.205, 0.050, 1, "μM"]]);
    const [sample] = readAssayCsv(exported, "mda", lang);
    assert.equal(sample.sample_name, name);
    close(calculateMda(sample.absorbance_values).result, 1);
  }
  const [sample] = readAssayCsv("Treatment Name;Sample Name;A532;A600\nControl;R1;0,205;0,050", "mda");
  close(calculateMda(sample.absorbance_values).result, 1);
});

test("incomplete imported rows reject the entire file before rows are persisted", () => {
  const header = "treatment_name,sample_name,532,600\nControl,S1,0.205,0.050\n";
  for (const badRow of ["Control,S2,n/a,0.01", "Control,S2,,0.01", "Control,S2,0.2", "Control,,0.2,0.1"]) {
    assert.throws(() => readAssayCsv(header + badRow, "mda"));
  }
});
