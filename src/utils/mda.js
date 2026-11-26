import { numeric } from "./resultData.js";

export const MDA_EXTINCTION_COEFFICIENT = 155; // mM⁻¹ cm⁻¹
export const DEFAULT_MDA_PATHLENGTH = 1; // cm, standard cuvette

export function calculateMda(values = {}, params = {}) {
  const a532 = numeric(values["532"]);
  const a600 = numeric(values["600"]);
  const pathlength = numeric(params.mda?.pathlength === undefined ? DEFAULT_MDA_PATHLENGTH : params.mda.pathlength);
  const data = { unit: "μM", result: null, correctedAbsorbance: null, issue: null };
  if (!Number.isFinite(a532) || !Number.isFinite(a600)) return { ...data, issue: "missing_reading" };
  data.correctedAbsorbance = a532 - a600;
  if (!Number.isFinite(pathlength) || pathlength <= 0) return { ...data, issue: "invalid_pathlength" };
  if (data.correctedAbsorbance < 0) return { ...data, issue: "negative_signal" };
  // Beer–Lambert yields mM. Report the measured reaction mixture in μM.
  const result = (data.correctedAbsorbance / MDA_EXTINCTION_COEFFICIENT / pathlength) * 1000;
  return Number.isFinite(result) ? { ...data, result } : { ...data, issue: "invalid_pathlength" };
}
