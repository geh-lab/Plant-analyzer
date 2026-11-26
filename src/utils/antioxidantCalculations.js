import { numeric } from './resultData.js';

export const enzymeDefaults = {
  extractMl: 2,
  dryMassMg: 20,
  reactionUl: 200,
  catAliquotUl: 3,
  podAliquotUl: 20
};
const activityUnit = 'μmol/min/mg DW';
const inhibitionUnit = '% inhibition';

// Keep aliases used by saved runs and imported instrument tables.
function firstValue(source, keys) {
  for (const key of keys) {
    const value = source[key];
    if (value != null && value !== '') return value;
  }
}
function setting(local, shared, keys, fallback) {
  return numeric(firstValue(local, keys) ?? firstValue(shared, keys), fallback);
}

function kineticActivity(type, values, params) {
  const cat = type === 'cat';
  const p = params[type] || {};
  const issue = code => ({ result: null, unit: activityUnit, correctedDeltaA: null, issue: code });
  const sampleKeys = ['sample_slope', type + '_sample_slope', cat ? '240' : '470', 'dA_min', 'delta_A', 'slope'];
  const blankKeys = cat ? ['h2o2_control_slope', 'H2O2_control_slope', 'control_slope'] : ['blank_slope', 'Blank_slope'];
  const sample = numeric(firstValue(values, sampleKeys));
  const blank = setting(values, p, blankKeys, 0);
  if (sample === null) return issue('missing_reading');
  if (blank === null) return issue('invalid_control');
  const path = setting(p, params, ['pathlength', 'path_length', 'l'], 1);
  const df = setting(p, params, ['dilutionFactor', 'df', 'DF'], 1);
  const extract = numeric(p.extractMl, enzymeDefaults.extractMl);
  const mass = numeric(p.dryMassMg, enzymeDefaults.dryMassMg);
  const volume = numeric(p.reactionUl, enzymeDefaults.reactionUl);
  const aliquot = numeric(p.aliquotUl, cat ? enzymeDefaults.catAliquotUl : enzymeDefaults.podAliquotUl);
  if (![path, df, extract, mass, volume, aliquot].every(n => n > 0) || aliquot > volume) return issue('invalid_params');
  const correctedDeltaA = cat ? blank - sample : sample - blank;
  if (correctedDeltaA < 0) return { ...issue('wrong_slope'), correctedDeltaA };
  // ε in mM⁻¹ cm⁻¹ yields µmol/mL/min. Both reaction volume and aliquot are in µL.
  const epsilon = cat ? 0.0436 : 26.6;
  const result = correctedDeltaA / (epsilon * path) * (volume / aliquot) * extract / mass * df;
  return Number.isFinite(result) ? { result, correctedDeltaA, unit: activityUnit } : issue('invalid_params');
}
export const calculateCatActivity = (values = {}, params = {}) => kineticActivity('cat', values, params);
export const calculatePodActivity = (values = {}, params = {}) => kineticActivity('pod', values, params);

export function calculateSodActivity(values = {}, params = {}) {
  const p = params.sod || {};
  const empty = { result: null, unit: inhibitionUnit, inhibition: null, endpointActivity: null };
  const light = numeric(firstValue(p, ['light_control_abs', 'control_abs', 'light_control']));
  const dark = numeric(firstValue(p, ['dark_blank_abs', 'dark_blank']), 0);
  const sample = numeric(firstValue(values, ['560', 'sample_abs', 'sample_a560', 'A560']));
  const sampleDark = numeric(firstValue(values, ['sample_dark_blank', '560_dark_blank', 'sample_dark', 'sample_dark_abs', 'sample_dark_a560']), dark);
  if (light === null || dark === null || light <= dark) return { ...empty, issue: 'invalid_control' };
  if (sample === null || sampleDark === null) return { ...empty, issue: 'missing_reading' };
  const controlCorr = light - dark, sampleCorr = sample - sampleDark;
  const inhibition = 100 * (controlCorr - sampleCorr) / controlCorr;
  const diagnostics = { ...empty, controlCorr, sampleCorr, inhibition };
  if (!Number.isFinite(inhibition) || inhibition < 0 || inhibition > 100) return { ...diagnostics, issue: 'invalid_inhibition' };
  const endpoint = firstValue(values, ['endpoint_ul', 'V50']);
  if (endpoint === undefined) return { ...diagnostics, result: inhibition };
  const v50 = numeric(endpoint), extract = numeric(p.extractMl, enzymeDefaults.extractMl), mass = numeric(p.dryMassMg, enzymeDefaults.dryMassMg);
  if (!(v50 > 0 && extract > 0 && mass > 0)) return { ...diagnostics, result: inhibition, issue: 'invalid_endpoint' };
  const endpointActivity = extract * 1000 / (v50 * mass);
  return { ...diagnostics, result: inhibition, endpointActivity, issue: null };
}
