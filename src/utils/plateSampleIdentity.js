import { effectiveSampleParams } from './resultCalculations.js';
import { numeric } from './resultData.js';

// Object field order can change after a parser upgrade or a JSON round trip.
function stableJson(value) {
  return JSON.stringify(value, (_, entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return entry;
    return Object.fromEntries(Object.keys(entry).sort().map(key => [key, entry[key]]));
  });
}

function curveIdentity(curve) {
  if (!curve) return null;
  // Before reader-reported fits were supported, every stored curve was fitted
  // from this plate's standards; neither source nor unitAssumed was recorded.
  return [curve.source ?? "standards", curve.key, curve.subtractKey ?? null,
    curve.a, curve.b, curve.r2 ?? null, curve.range ?? null, String(curve.unit ?? "").replace(/[µμ]/g, "u")];
}

function workspaceCurve(row, workspace) {
  const type = row.analysis_type;
  if (row.plate_import.overrides || !["h2o2", "total_phenol", "total_flavonoid", "anthocyanin", "glucosinolate"].includes(type)) return null;
  const params = effectiveSampleParams(row, workspace);
  const a = type === "h2o2" ? params.h2o2?.a : params.std_a;
  const b = type === "h2o2" ? params.h2o2?.b : params.std_b;
  return [numeric(a), numeric(b, 0), curveIdentity(params.plateCalibrationSource?.curve)];
}

export function plateSampleIdentity(row, workspace) {
  const plate = row?.plate_import;
  if (!plate?.file || !plate.sheet || !plate.well) return null;
  const channels = (plate.channels || []).map(ch =>
    JSON.stringify([ch.field, ch.channel, ch.wavelength, ch.cell, ch.well ?? plate.well, ch.reading])
  ).sort();
  const fit = plate.fit;
  const kinetic = fit ? [fit.wavelength, fit.unit, fit.startSeconds, fit.endSeconds, fit.n, fit.slope, fit.intercept, fit.rSquared] : null;
  // SOD records the light controls followed by dark controls. Keep that role
  // order; for the other methods the controls or standards form one set.
  const referenceWells = [...(plate.controlWells || [])];
  if (row.analysis_type !== "sod") referenceWells.sort();
  return stableJson([
    row.analysis_type, plate.file, plate.sheet, plate.plate ?? null, plate.well, plate.label ?? "", plate.signal,
    channels, kinetic, row.absorbance_values, referenceWells, plate.overrides ?? null,
    curveIdentity(plate.curve), workspaceCurve(row, workspace),
  ]);
}
