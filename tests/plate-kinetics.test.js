import test from "node:test";
import assert from "node:assert/strict";
import {
  fitKineticWell,
  kineticFits,
  meanKineticSlope,
  selectKineticSeries,
  sodControlSettings,
  sodEndpointValues,
  suggestPlateRoles,
} from "../src/utils/plateKinetics.js";
import {
  calculateCatActivity,
  calculatePodActivity,
  calculateSodActivity,
} from "../src/utils/antioxidantCalculations.js";

const near = (a, b, tolerance = 1e-10) =>
  assert.ok(Math.abs(a - b) < tolerance, `${a} differs from ${b}`);
const raw = (wavelength, times, values) => ({
  kind: "raw",
  label: String(wavelength),
  wavelength,
  times,
  values,
});

test("CAT and POD fit measured time in seconds and retain the signed slope in A/min", () => {
  const times = [0, 47, 94, 141, 188];
  const cat = raw(240, times, {
    A1: times.map((t) => 0.25 - t * 0.0002),
    A2: times.map((t) => 0.15 - t * 0.00005),
  });
  const sheet = {
    kinetics: [
      cat,
      { ...cat, kind: "blanked" },
      { ...cat, kind: "derived", label: "Max V [Blank 240]" },
    ],
  };
  assert.deepEqual(selectKineticSeries(sheet, "cat"), [cat]);
  assert.deepEqual(selectKineticSeries(sheet, "pod"), []);
  assert.deepEqual(kineticFits(sheet.kinetics[1]), {});
  const fits = kineticFits(cat);
  near(fits.A1.slope, -0.012);
  near(fits.A1.intercept, 0.25);
  near(fits.A1.rSquared, 1);
  assert.equal(fits.A1.n, 5);
  assert.equal(fits.A1.endSeconds, 188);
  const blank = meanKineticSlope(fits, ["A2"]);
  near(blank, -0.003);
  assert.ok(
    calculateCatActivity(
      { sample_slope: fits.A1.slope },
      { cat: { h2o2_control_slope: blank } },
    ).result > 0,
  );
  const pod = raw(470, [0, 10, 20, 30], { B1: [0, 0.01, 0.02, 0.03] });
  const { B1 } = kineticFits(pod);
  near(B1.slope, 0.06);
  assert.ok(calculatePodActivity({ sample_slope: B1.slope }, {}).result > 0);
});

test("inside a selected kinetic window exclude missing and overflow readings, retain true zero, report R² without an arbitrary cutoff", () => {
  const series = raw(240, [0, 10 - Number.EPSILON * 8, 20, 30, 40, 50, 60], {
    A1: ["OVRFLW", 0, 0.2, "", 0.1, 0.6, 1.3],
    A2: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
  });
  const fits = kineticFits(series, { startSeconds: 10, endSeconds: 50 });
  assert.equal(fits.A1.n, 4);
  assert.equal(fits.A1.issue, null);
  assert.ok(fits.A1.rSquared > 0 && fits.A1.rSquared < 1);
  assert.equal(fits.A2.slope, 0);
  assert.equal(fits.A2.rSquared, null);
  assert.equal(
    kineticFits(series, { endSeconds: 10 }).A1.issue,
    "insufficient_points",
  );
  assert.equal(
    kineticFits(series, { startSeconds: 30, endSeconds: 30 }).A1.issue,
    "invalid_window",
  );
  assert.equal(
    fitKineticWell([
      { seconds: 0, absorbance: 0.4 },
      { seconds: 0, absorbance: 0.5 },
      { seconds: 54, absorbance: 0.3 },
    ]).issue,
    "duplicate_times",
  );
  assert.equal(meanKineticSlope(fits, ["A2", "A2"]), null);
  assert.equal(meanKineticSlope(fits, ["missing"]), null);
});

test("SOD repeats are channels; roles use explicit layout and independent disjoint control wells", () => {
  const blocks = [
    {
      key: "560",
      kind: "raw",
      wavelength: 560,
      values: { A1: 0.4, A2: 0.8, A3: 0.1, A4: 0.0 },
    },
    {
      key: "560[2]",
      kind: "raw",
      wavelength: 560,
      values: { A1: 0.5, A2: 0.9, A3: 0.2, A4: null },
    },
    { key: "Blank 560", kind: "blanked", wavelength: 560, values: { A1: 0.1 } },
    { key: "other", kind: "raw", wavelength: 517, values: { A1: 0.1 } },
  ];
  assert.equal(sodEndpointValues(blocks, ["other"]).issue, "invalid_560_read");
  assert.equal(
    sodEndpointValues(blocks, ["Blank 560"]).issue,
    "invalid_560_read",
  );
  assert.equal(sodEndpointValues(blocks, []).issue, "select_560_reads");
  assert.deepEqual(sodEndpointValues(blocks, ["560"]).values, blocks[0].values);
  const { values } = sodEndpointValues(blocks, ["560", "560[2]"]);
  near(values.A1, 0.45);
  assert.ok(!Object.hasOwn(values, "A4"));
  assert.deepEqual(
    suggestPlateRoles({
      A1: { label: "SPL1" },
      A2: { label: "Light" },
      A3: { label: "Dark" },
      H11: { label: "" },
      H12: { label: "Sample 560" },
      C9: { label: "CTL" },
      D4: { label: "BLK" },
    }),
    {
      samples: ["A1"],
      controls: ["C9"],
      blanks: ["D4"],
      lightWells: ["A2"],
      darkWells: ["A3"],
    },
  );
  assert.equal(sodControlSettings(values, {}).issue, "select_light_and_dark");
  assert.equal(
    sodControlSettings(values, { lightWells: ["A2"], darkWells: ["A2"] }).issue,
    "overlapping_controls",
  );
  assert.equal(
    sodControlSettings(values, { lightWells: ["A4"], darkWells: ["A3"] }).issue,
    "missing_control_reading",
  );
  assert.equal(
    sodControlSettings(values, { lightWells: ["A3"], darkWells: ["A2"] }).issue,
    "invalid_control",
  );
  const { params } = sodControlSettings(values, {
    lightWells: ["A2"],
    darkWells: ["A3"],
  });
  assert.ok(Math.abs(params.dark_blank_abs - 0.15) < 1e-12);
  near(
    calculateSodActivity({ 560: values.A1 }, { sod: params }).result,
    100 * (1 - (0.45 - 0.15) / (0.85 - 0.15)),
  );
  assert.equal(
    calculateSodActivity({ 560: 0.1 }, { sod: params }).issue,
    "invalid_inhibition",
  );
});
