import { measurementNumber } from "./instrumentData.js";

const wellId = /^[A-P](?:[1-9]|1\d|2[0-4])$/;

export function selectKineticSeries(sheet, assay) {
  const wavelength = { cat: 240, pod: 470 }[assay];
  if (!wavelength) return [];
  return (sheet?.kinetics ?? []).filter(
    (series) =>
      series.kind === "raw" &&
      measurementNumber(series.wavelength) === wavelength,
  );
}

// Times are elapsed seconds, already normalized from the spreadsheet's declared unit.
// Report the ordinary least-squares slope in absorbance/min; CAT normally decreases.
export function fitKineticWell(points, { startSeconds, endSeconds } = {}) {
  const start = measurementNumber(startSeconds);
  const end = measurementNumber(endSeconds);
  const incomplete = (issue, n = 0, first = null, last = null) => ({
    slope: null,
    rSquared: null,
    intercept: null,
    n,
    startSeconds: first,
    endSeconds: last,
    issue,
  });
  const supplied = (value) =>
    value !== undefined && value !== null && value !== "";
  if (
    (supplied(startSeconds) && (start === null || start < 0)) ||
    (supplied(endSeconds) && (end === null || end < 0)) ||
    (start !== null && end !== null && end <= start)
  )
    return incomplete("invalid_window");

  const times = new Set();
  let n = 0,
    meanTime = 0,
    meanReading = 0;
  let sumTT = 0,
    sumAA = 0,
    sumTA = 0;
  let first = Infinity,
    last = -Infinity;
  let repeated = false;
  for (const point of points ?? []) {
    const t = measurementNumber(point?.seconds),
      reading = measurementNumber(point?.absorbance);
    // Excel day fractions can differ from their displayed second by a few ULPs.
    const timeTolerance = 8 * Number.EPSILON * Math.max(1, Math.abs(t ?? 0));
    if (
      t === null ||
      reading === null ||
      t < 0 ||
      (start !== null && t < start - timeTolerance) ||
      (end !== null && t > end + timeTolerance)
    )
      continue;
    if (times.has(t)) repeated = true;
    times.add(t);
    n++;
    first = Math.min(t, first);
    last = Math.max(t, last);
    const dt = t - meanTime,
      da = reading - meanReading;
    meanTime += dt / n;
    meanReading += da / n;
    sumTT += dt * (t - meanTime);
    sumAA += da * (reading - meanReading);
    sumTA += dt * (reading - meanReading);
  }
  if (repeated) return incomplete("duplicate_times", n, first, last);
  if (n < 3)
    return incomplete(
      "insufficient_points",
      n,
      n ? first : null,
      n ? last : null,
    );
  const slopePerSecond = sumTA / sumTT;
  const slope = slopePerSecond * 60;
  const intercept = meanReading - slopePerSecond * meanTime;
  const rSquared =
    sumAA > 0
      ? Math.max(0, Math.min(1, (sumTA / sumTT) * (sumTA / sumAA)))
      : null;
  if (
    !Number.isFinite(slope) ||
    !Number.isFinite(intercept) ||
    (rSquared !== null && !Number.isFinite(rSquared))
  )
    return incomplete("invalid_fit", n, first, last);
  return {
    slope,
    rSquared,
    intercept,
    n,
    startSeconds: first,
    endSeconds: last,
    issue: null,
  };
}

export function kineticFits(series, options = {}) {
  if (series?.kind !== "raw" || !Array.isArray(series.times)) return {};
  return Object.fromEntries(
    Object.entries(series.values ?? {})
      .filter(([id, values]) => wellId.test(id) && Array.isArray(values))
      .map(([id, values]) => [
        id,
        fitKineticWell(
          series.times.map((seconds, i) => ({
            seconds,
            absorbance: values[i],
          })),
          options,
        ),
      ]),
  );
}

// Only suggest roles printed in the reader layout. These remain editable in the preview.
export function suggestPlateRoles(layout = {}) {
  const roles = {
    samples: [],
    controls: [],
    blanks: [],
    lightWells: [],
    darkWells: [],
  };
  const codes = {
    ctl: "controls",
    ctrl: "controls",
    control: "controls",
    blk: "blanks",
    blank: "blanks",
    light: "lightWells",
    dark: "darkWells",
  };
  for (const [id, cell] of Object.entries(layout)) {
    if (!wellId.test(id)) continue;
    const label = String(cell?.label ?? "")
      .trim()
      .toLowerCase();
    if (/^spl\s*\d+$/.test(label)) roles.samples.push(id);
    else if (Object.hasOwn(codes, label)) roles[codes[label]].push(id);
  }
  return roles;
}

function checkedMean(values, wells) {
  if (
    !Array.isArray(wells) ||
    !wells.length ||
    new Set(wells).size !== wells.length
  )
    return null;
  let mean = 0;
  for (const [i, id] of wells.entries()) {
    if (!wellId.test(id) || !Object.hasOwn(values, id)) return null;
    const reading = measurementNumber(values[id]);
    if (reading === null) return null;
    mean += (reading - mean) / (i + 1);
  }
  return Number.isFinite(mean) ? mean : null;
}

export function meanKineticSlope(fits, wells) {
  const slopes = Object.fromEntries(
    Object.entries(fits ?? {}).map(([id, fit]) => [
      id,
      fit && !fit.issue ? fit.slope : null,
    ]),
  );
  return checkedMean(slopes, wells);
}

// "560[2]" in a Gen5 endpoint export is a repeat reading, not a dark sample.
// A selected technical-repeat mean requires a finite value in every selected channel.
export function sodEndpointValues(blocks, keys) {
  const raw = (blocks ?? []).filter(
    (b) => b.kind === "raw" && measurementNumber(b.wavelength) === 560,
  );
  if (
    !Array.isArray(keys) ||
    !keys.length ||
    new Set(keys).size !== keys.length
  )
    return { values: {}, issue: "select_560_reads" };
  const selected = keys.map((key) => raw.filter((block) => block.key === key));
  if (selected.some((matches) => matches.length !== 1))
    return { values: {}, issue: "invalid_560_read" };
  const reads = selected.map(([block]) => block.values ?? {});
  const values = {};
  for (const id of Object.keys(reads[0])) {
    if (!wellId.test(id)) continue;
    let mean = 0,
      count = 0;
    for (const read of reads) {
      const v = measurementNumber(read[id]);
      if (v === null) break;
      count++;
      mean += (v - mean) / count;
    }
    if (count === reads.length) values[id] = mean;
  }
  return {
    values,
    issue: Object.keys(values).length ? null : "no_common_readings",
  };
}

export function sodControlSettings(
  valuesByWell,
  { lightWells = [], darkWells = [] } = {},
) {
  const failed = (issue) => ({
    params: null,
    issue,
    lightN: lightWells?.length || 0,
    darkN: darkWells?.length || 0,
  });
  if (
    !Array.isArray(lightWells) ||
    !Array.isArray(darkWells) ||
    !lightWells.length ||
    !darkWells.length
  )
    return failed("select_light_and_dark");
  const distinct = new Set([...lightWells, ...darkWells]);
  if (distinct.size !== lightWells.length + darkWells.length)
    return failed("overlapping_controls");
  const light = checkedMean(valuesByWell ?? {}, lightWells);
  const dark = checkedMean(valuesByWell ?? {}, darkWells);
  if (light === null || dark === null) return failed("missing_control_reading");
  if (light <= dark) return failed("invalid_control");
  return {
    params: { light_control_abs: light, dark_blank_abs: dark },
    issue: null,
    lightN: lightWells.length,
    darkN: darkWells.length,
  };
}
