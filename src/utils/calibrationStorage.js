import { readStored } from "./resultData.js";

export const hplcParameterKey = (type) => "hplc_calc_params_" + type;
export const absorbanceParameterKey = (type) =>
  (type === "glucosinolate" ? "absorbance_calc_params_" : "calc_params_") +
  type;

function isHplcGlucosinolate(params) {
  return (
    params?.method === "desulfo-is" ||
    ["standardArea", "molecularWeight", "conversionFactor"].some((key) =>
      Object.hasOwn(params || {}, key),
    )
  );
}

const hplcGslKeys = new Set([
  "method",
  "sampleInputs",
  "standardCompound",
  "responseFactors",
  "standardArea",
  "molecularWeight",
  "conversionFactor",
  "sampleWeight",
]);

function legacyFields(params, hplc) {
  return Object.fromEntries(
    Object.entries(params).filter(([key]) => hplcGslKeys.has(key) === hplc),
  );
}

// Both methods treat the formerly shared key as a read-only migration source.
// This also preserves the older record when absorbance is opened before HPLC.
export function readHplcParameters(type, read = readStored) {
  const saved = read(hplcParameterKey(type), null);
  if (saved !== null) return saved;
  const legacy = read("calc_params_" + type, {});
  if (type === "glucosinolate")
    return isHplcGlucosinolate(legacy) ? legacyFields(legacy, true) : {};
  return legacy;
}

export function readAbsorbanceParameters(type, read = readStored) {
  const key = absorbanceParameterKey(type);
  if (type !== "glucosinolate") return read(key, {});
  const saved = read(key, null);
  const legacy = saved ?? read("calc_params_" + type, {});
  const params = saved === null && isHplcGlucosinolate(legacy) ? legacyFields(legacy, false) : legacy;
  if (!Object.hasOwn(params, "glucosinolateMode")) return params;
  const { glucosinolateMode, ...current } = params;
  if (glucosinolateMode === "mustard_meal") {
    // Calibration coefficients saved while the retired regression was selected were inactive.
    delete current.std_a;
    delete current.std_b;
  }
  return current;
}
