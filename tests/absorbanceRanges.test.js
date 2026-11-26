import test from "node:test";
import assert from "node:assert/strict";
import { absorbanceBand, absorbanceScope, readingFeedback } from "../src/data/absorbanceRanges.js";

test("AU guide resolves exact endpoints without gaps and ignores missing readings", () => {
  const examples = [[-.01,"low"],[.099,"low"],[.1,"preferred"],[.5,"preferred"],[.501,"good"],[1,"good"],[1.5,"check"],[1.501,"dilute"],[2,"dilute"],[2.001,"high"]];
  for (const [value, tone] of examples) assert.equal(absorbanceBand(value).tone, tone);
  for (const value of ["", " ", null, undefined, "abc", Infinity, false, []]) assert.equal(absorbanceBand(value), null);
});

test("AU guidance covers every assay and distinguishes pigment cuvettes, blanks, rates and calibration", () => {
  const scopes = {chlorophyll_a_b: "0.3–0.85", total_phenol: "gallic acid", total_flavonoid: "quercetin", glucosinolate: "sinigrin", h2o2: "H₂O₂/KI", anthocyanin: "C3G", mda: "A532 − A600", cat: "control slope minus the sample", pod: "sample slope minus the blank", sod: "50%", dpph_scavenging: "scavenging (%)"};
  for (const [id, term] of Object.entries(scopes)) {
    const scope = absorbanceScope(id);
    assert.ok(scope.note[1].includes(term));
    assert.ok(scope.label[0] && scope.label[1] && scope.note[0]);
    const onlyPigments = id === "chlorophyll_a_b";
    assert.equal(scope.note[1].includes("0.3–0.85"), onlyPigments);
  }
  assert.deepEqual(absorbanceScope("carotenoid"), absorbanceScope("chlorophyll_a_b"));
  assert.ok(absorbanceScope("unknown").note[0]);
});

test("manual input guidance covers only measured channels and interprets a low background correctly", () => {
  for (const [id, key] of [["pod","sample_slope"],["cat","sample_slope"],["sod","endpoint_ul"],["sod","sample_dark_blank"],["dpph_scavenging","sample_blank"],["mda","difference"]]) {
    assert.equal(readingFeedback(id, key, 0.3), null);
  }
  assert.equal(readingFeedback("mda", "532", ""), null);
  for (const assay of ["mda", "anthocyanin"]) {
    assert.match(readingFeedback(assay, "600", 0, true).text, /background wavelength/i);
    assert.equal(readingFeedback(assay, "600", 3, true).tone, "high");
  }
  for (const assay of ["chlorophyll_a_b", "carotenoid"]) assert.match(readingFeedback(assay, "665.2", 0.2, true).text, /cuvette/i);
  assert.match(readingFeedback("mda", "532", 0.2).text, /실험실 참고/);
});
