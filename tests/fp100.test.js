import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzeLeaf,
  decodeFp100Text,
  fpCurves,
  fpGroups,
  fpMetrics,
  parseFp100,
} from "../src/utils/fp100.js";
const points = [
  [0.02, 10],
  [0.05, 12],
  [0.15, 20],
  [0.3, 30],
  [2, 50],
  [30, 70],
  [60, 75],
  [300, 90],
  [900, 88],
];
const sample = (name, group, values = points) =>
  analyzeLeaf({ name, group, points: values });
const near = (actual, expected) =>
  assert.ok(Math.abs(actual - expected) < 1e-10);

test("FP100 paper timings, S1 F50 slope, and dependent RC / CSm fluxes", () => {
  const { metrics: m } = sample("s", "g");
  near(m["Fv/Fm"], 80 / 90);
  near(m.Mo, (4 * (30 - 12)) / (90 - 12));
  near(m.VJ, 0.5);
  near(m.VI, 0.75);
  near(m["δRo"], 0.5);
  near(m["ΦRo"], (80 / 90) * 0.5 * 0.5);
  near(m["ABS/CSm"], 90);
  near(m["REo/CSm"], m["ΦRo"] * 90);
  assert.ok(fpMetrics.every((k) => Number.isFinite(m[k])));
  const manual = analyzeLeaf({ name: "s", group: "g", points }, "manual");
  near(manual.metrics.VI, (75 - 12) / (90 - 12));
  near(manual.metrics["Fv/Fm"], 78 / 90);
});
test("FP100 incomplete acquisition and missing denominator leave estimates empty", () => {
  const no50 = sample(
    "a",
    "b",
    points.filter(([t]) => t !== 0.05),
  ).metrics;
  assert.equal(no50.Mo, null);
  assert.equal(no50["ABS/CSm"], null);
  near(no50["Fv/Fm"], 80 / 90);
  assert.equal(sample("a", "b", points.slice(0, 6)).metrics["Fv/Fm"], null);
  const flat = sample(
    "a",
    "b",
    points.map(([t]) => [t, 0]),
  );
  assert.ok(Object.values(flat.metrics).every((v) => v === null));
  assert.equal(fpCurves([flat], "WOK").length, 0);
});
test("FP100 import requires named time units, drops ambiguous runs and normalizes µs & s", () => {
  const parsed = parseFp100(
    "group;sample;time (µs);Ft\nC;1;20;0\nC;2;20;10\nC;2;20;12\nC;1;;10",
  );
  assert.deepEqual(parsed.leaves, [
    { group: "C", name: "1", points: [[0.02, 0]] },
  ]);
  assert.equal(parsed.skipped, 1);
  assert.equal(parsed.duplicates, 1);
  assert.equal(parseFp100("sample,group,time,Ft\na,b,0.02,10").header, false);
  assert.deepEqual(
    parseFp100("sample,group,time_s,Ft\ns,g,0.00002,1").leaves[0].points,
    [[0.02, 1]],
  );
});
test("FP100 group Δ at common times uses per-leaf normalization and n; only complete observed phases contribute", () => {
  const control = sample("1", "C");
  const treatment = sample(
    "1",
    "T",
    points.map(([t, f]) => [t, t === 0.15 ? 23 : f]),
  );
  const missing = sample(
    "2",
    "T",
    points.filter(([t]) => t !== 0.15),
  );
  const curves = fpCurves([control, treatment, missing], "WOK", "C", true);
  const row = curves.find((r) => r.t === 0.15).series;
  near(row.find((x) => x.group === "T").mean, 0.15);
  assert.equal(row.find((x) => x.group === "T").count, 1);
  assert.equal(fpCurves([treatment], "WOK", "C", true)[0].series[0].mean, null);
  const summary = fpGroups([control, treatment, missing], "VJ", "C");
  assert.equal(summary[1].count, 2);
  near(summary[1].relative, 1);
  assert.equal(summary[0].se, null);
});

// Miniature two-acquisition export. Values and dates are synthetic.
const nativeFile = [
  "FluorPen ASCII Export File",
  "-----------------------------------",
  "File Name: Example",
  "Measuring - OJIP-455\t",
  "SOURCE DATA\t",
  " DESCR \t\t",
  "[us]\t1\t2\t",
  "\t10:04:00  2.5.2024\t10:09:30  2.5.2024\t",
  "-----\t-----\t-----",
  "11\t110\t0\t",
  "21\t125\t259\t",
  "301\t177,5\t321\t",
  "2021\t200\t480\t",
  "30321\t300\t650\t",
  "280621\t410\t700\t",
  "-----\t-----\t-----",
  "COMPUTED VALUES\t",
  " DESCR \t\t",
  "name\t2\t1\t",
  "\t10:09:30  2.5.2024\t10:04:00  2.5.2024\t",
  "-----\t-----\t-----",
  "Bckg\t0\t10\t",
  "Fm\t700\t400\t",
  "Fv/Fm\t0,710\t0,680\t",
  "-----\t-----\t-----",
].join("\r\n");

test("FluorPen native traces keep real times, raw readings, instrument labels and firmware values separate", () => {
  const result = parseFp100("\ufeff" + nativeFile, { group: "A" });
  assert.equal(result.format, "fluorpen");
  assert.equal(result.header, true);
  assert.equal(result.skipped, 0);
  assert.equal(result.duplicates, 0);
  assert.equal(result.leaves.length, 2);
  const [a, b] = result.leaves;
  assert.equal(a.group, "A");
  assert.equal(a.name, "1");
  assert.equal(a.traceId, "1");
  assert.equal(a.protocol, "OJIP-455");
  assert.equal(a.recordedAt, "10:04:00  2.5.2024");
  assert.notEqual(a.traceKey, b.traceKey);
  assert.deepEqual(a.points, [[0.011, 110], [0.021, 125], [0.301, 177.5], [2.021, 200], [30.321, 300], [280.621, 410]]);
  assert.deepEqual(a.reported, { Bckg: 10, Fm: 400, "Fv/Fm": 0.68 });
  assert.equal(b.reported.Bckg, 0);
  assert.equal(b.reported["Fv/Fm"], 0.71);
  assert.equal(b.points[0][1], 0);
  const calculated = analyzeLeaf(a);
  assert.deepEqual(calculated.bounds.P, [280.621, 410]);
  assert.equal(calculated.bounds.O[1], null);
  assert.equal(calculated.metrics["Fv/Fm"], null);
  assert.equal(fpCurves([calculated], "Ft")[0].t, 0.011);
});

test("FluorPen runs remain distinct across blocks and reject mismatched clocks and ambiguous raw times", () => {
  const secondBlock = nativeFile.slice(nativeFile.indexOf("Measuring"));
  const otherProtocol = secondBlock.replace("OJIP-455", "QY");
  const result = parseFp100([nativeFile, otherProtocol, secondBlock].join("\n"));
  assert.deepEqual(result.leaves.map((leaf) => leaf.block), [1, 1, 2, 2]);
  assert.equal(new Set(result.leaves.map((leaf) => leaf.traceKey)).size, 4);
  assert.equal(new Set(result.leaves.map((leaf) => leaf.name)).size, 4);
  assert.ok(result.leaves.every((leaf) => leaf.group === "Unassigned"));

  const mismatch = nativeFile.replace("10:09:30  2.5.2024\t10:04:00", "10:08:30  2.5.2024\t10:04:00");
  assert.deepEqual(parseFp100(mismatch).leaves[1].reported, {});
  const duplicate = nativeFile.replace("21\t125", "11\t125");
  assert.equal(parseFp100(duplicate).duplicates, 2);
  assert.equal(parseFp100(duplicate).leaves.length, 0);
  const missing = nativeFile.replace("110\t0", "\t0");
  assert.equal(parseFp100(missing).skipped, 1);
  assert.equal(parseFp100(missing).leaves[0].points.length, 5);
  assert.equal(parseFp100(missing).leaves[1].points.length, 6);
  const unsupported = nativeFile.replace("OJIP-455", "QY");
  assert.equal(parseFp100(unsupported).header, false);
});

test("FP100 decoding and decimal conventions preserve unit and Unicode sample labels", () => {
  const text = "시료;처리구;시간 [µs];형광\r잎 A;대조;20,5;12,75";
  const utf16le = Buffer.from("\ufeff" + text, "utf16le");
  const utf16be = Buffer.from(utf16le).swap16();
  for (const bytes of [utf16le, utf16be, Buffer.from("\ufeff" + text, "utf8")]) {
    const raw = decodeFp100Text(bytes);
    const parsed = parseFp100(raw);
    assert.equal(parsed.format, "table");
    assert.deepEqual(parsed.leaves, [{ group: "대조", name: "잎 A", points: [[0.0205, 12.75]] }]);
  }
  const nativeWindows = Buffer.from(nativeFile.replace("[us]", "[µs]"), "latin1");
  assert.equal(parseFp100(decodeFp100Text(nativeWindows)).leaves[0].points.length, 6);
});
