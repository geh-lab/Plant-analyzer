import { test } from "node:test";
import assert from "node:assert/strict";
import { getAssayReagents } from "../src/data/assayReagents.js";

const methods = ["chlorophyll_a_b", "total_phenol", "total_flavonoid", "glucosinolate", "anthocyanin",
  "dpph_scavenging", "mda", "cat", "pod", "sod", "h2o2"];

test("each assay has complete bilingual preparation and handling, with identical source coverage", () => {
  for (const method of methods) {
    const ko = getAssayReagents(method, "ko");
    const en = getAssayReagents(method, "en");
    assert.equal(en.recipes.length, ko.recipes.length, method);
    assert.equal(ko.handling.length, en.handling.length, method);
    assert.ok(ko.recipes.length >= 1 && ko.handling.length >= 2, method);
    assert.deepEqual(en.sources.map(s => s.url), ko.sources.map(s => s.url), method);
    for (const guide of [ko, en]) {
      assert.equal(guide.recipes.length, new Set(guide.recipes.map(r => r.name)).size);
      assert.ok(guide.recipes.every(r => r.name && r.prep), method);
    }
    assert.ok(ko.recipes.every(r => /[가-힣]/.test(r.prep)), method);
    assert.ok(en.recipes.every(r => !/[가-힣]/.test(r.prep)), method);
    assert.equal(ko.sources.some(s => s.name.includes("Hahm")), false);
  }
  assert.equal(getAssayReagents("__proto__"), undefined);
});

test("stock and reaction quantities retain the documented assay concentrations", () => {
  for (const lang of ["ko", "en"]) {
    const rowText = (method, n) => getAssayReagents(method, lang).recipes[n].prep;
    // 2 mM sodium tetrachloropalladate, 0.100 L, MW 294.2 g/mol.
    assert.ok(rowText("glucosinolate", 1).includes((0.002 * 0.100 * 294.2 * 1000).toFixed(1) + " mg"));
    // Distinct stocks combine to retain total phosphate molarity.
    assert.match(rowText("cat", 0), /0.680 g.+0.871 g/);
    assert.match(rowText("h2o2", 1), /0.1361 g.+0.1742 g/);
    const volumes = str => Array.from(str.matchAll(/(\d+(?:\.\d+)?) µL/g), M => Number(M[1]));
    const [guaiacol, peroxide, acetate, water] = volumes(rowText("pod", 4));
    assert.equal(guaiacol + peroxide + acetate + water, 180);
    assert.equal(guaiacol * 20 / 200, 8.26);
    assert.equal(peroxide * 100 / 200, 8.8);
    assert.equal(acetate * 100 / 200, 25);
    const [buffer, met, nbt, edta, riboflavin, solvent] = volumes(rowText("sod", 6));
    assert.equal(buffer + met + nbt + edta + riboflavin + solvent, 180);
    assert.equal(riboflavin * 0.1 / 200, 8 * 0.5 / 200);
    assert.equal(buffer * 100 / 200, 93.5 * 50 / 200);
  }
});
