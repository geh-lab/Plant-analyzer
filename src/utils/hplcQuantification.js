import { isCalibrationCurveHplcType } from "../data/hplcProtocols.js";
import { numeric } from "./resultData.js";

export const desulfoFactors = {
  Sinigrin: 1,
  Glucotropaeolin: 0.95,
  Progoitrin: 1.09,
  Glucoalyssin: 0.9,
  Gluconapoleiferin: 1,
  Gluconapin: 1.11,
  "4-Hydroxyglucobrassicin": 0.28,
  Glucobrassicanapin: 1.15,
  Glucoerucin: 0.9,
  Glucobrassicin: 0.29,
  "4-Methoxyglucobrassicin": 0.25,
  Gluconasturtiin: 0.95,
  Neoglucobrassicin: 0.2,
};

export function hplcConcentration(row, params, type) {
  const area = numeric(row.area);
  if (
    area === null ||
    area < 0 ||
    !row.compound ||
    row.compound === "4-Hydroxy-3-benzoic acid" ||
    !params
  )
    return null;
  if (isCalibrationCurveHplcType(type)) {
    const slope = numeric(params[row.compound + "_a"]),
      intercept = numeric(params[row.compound + "_b"], 0);
    const dryMass = numeric(params.sampleWeight),
      volume = numeric(params.extractionVolume),
      dilution = numeric(params.dilutionFactor, 1);
    if (
      !(slope > 0 && dryMass > 0 && volume > 0 && dilution > 0) ||
      intercept === null ||
      area < intercept
    )
      return null;
    return numeric(
      (((area - intercept) / slope) * volume * dilution) / dryMass / 1000,
    );
  }
  if (
    type !== "glucosinolate" ||
    params.method !== "desulfo-is" ||
    row.compound === params.standardCompound
  )
    return null;
  const standard = params.standardCompound;
  if (standard !== "Sinigrin" && standard !== "Glucotropaeolin") return null;
  const sample = params.sampleInputs?.find((s) => s.name === row.sampleName);
  const areaIS = numeric(sample?.area),
    spike = numeric(sample?.amount),
    dryMass = numeric(sample?.mass);
  const factor = numeric(params.responseFactors?.[row.compound]),
    factorIS = numeric(params.responseFactors?.[standard]);
  if (!(areaIS > 0 && spike > 0 && dryMass > 0 && factor > 0 && factorIS > 0))
    return null;
  return numeric(((area / areaIS) * spike * (factor / factorIS)) / dryMass);
}
