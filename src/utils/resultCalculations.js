import { getMeasurementFields } from './analysisFields.js';
import { calculateCatActivity, calculatePodActivity, calculateSodActivity } from './antioxidantCalculations.js';
import { calculateMda } from './mda.js';
import { isCalibrationCurveHplcType } from '../data/hplcProtocols.js';
import { numeric } from './resultData.js';

const units = {
  chlorophyll_a_b: 'mg/g DW', carotenoid: 'mg/g DW', total_phenol: 'mg GAE/g DW',
  total_flavonoid: 'mg QE/g DW', h2o2: 'μmol/g DW', glucosinolate: 'mg SnE/g DW',
  dpph_scavenging: '% inhibition', anthocyanin: 'mg C3G eq./g DW', cat: 'μmol/min/mg DW',
  pod: 'μmol/min/mg DW', sod: '% inhibition', mda: 'μM'
};

export function mergeCalibrationParams(type, workspace = {}, overrides) {
  if (!overrides) return workspace;
  const merged = { ...workspace, ...overrides };
  if (overrides[type]) merged[type] = { ...workspace[type], ...overrides[type] };
  return merged;
}

// Loading a new plate must not assign its standards to previously saved samples.
// Keep only the curve, so changing extraction volume or dilution still works.
export function snapshotSampleCalibration(sample, type, oldParams = {}) {
  if (sample.analysis_type !== type || sample.calibration_snapshot || sample.plate_import?.overrides) return sample;
  const snapshot = type === 'h2o2'
    ? { h2o2: { a: oldParams.h2o2?.a ?? null, b: oldParams.h2o2?.b ?? 0 } }
    : { std_a: oldParams.std_a ?? null, std_b: oldParams.std_b ?? 0 };
  if (oldParams.plateCalibrationSource) snapshot.plateCalibrationSource = oldParams.plateCalibrationSource;
  return { ...sample, calibration_snapshot: snapshot };
}

export function effectiveSampleParams(sample, workspace = {}) {
  const plate = sample.plate_import;
  const overrides = plate?.overrides || sample.calibration_snapshot;
  if (!overrides) return workspace;
  const merged = mergeCalibrationParams(sample.analysis_type, workspace, overrides);
  // A workspace may now point to another workbook. Keep the source paired with the coefficients.
  if (plate?.overrides && plate.curve) {
    merged.plateCalibrationSource = {fileName:plate.file, sheetName:plate.sheet, signal:plate.signal, curve:plate.curve};
  } else if (!overrides.plateCalibrationSource) {
    delete merged.plateCalibrationSource;
  }
  return merged;
}

export function analyzeSample(sample, workspace = {}) {
  const params = effectiveSampleParams(sample, workspace);
  const type = sample.analysis_type;
  const values = { ...sample.absorbance_values };
  const unit = units[type] || '';
  const invalid = issue => ({
    result: null, unit, issue,
    ...(type === 'chlorophyll_a_b' && { chl_a: null, chl_b: null, total_chl: null, carotenoid: null }),
    ...(type === 'h2o2' && { result_dw: null, result_fw: null })
  });
  if (type === 'mda') return calculateMda(values, params);
  for (const field of getMeasurementFields(type)) {
    const input = [field.key, ...(field.aliases || [])].map(k => values[k]).find(v => v != null && v !== '');
    if (input === undefined && field.optional) continue;
    values[field.key] = numeric(input);
    if (values[field.key] === null) return invalid('missing_reading');
  }

  const calibration = params.plateCalibrationSource?.curve;
  if (calibration && Array.isArray(calibration.range)) {
    const signal = values[calibration.key] - (calibration.subtractKey ? values[calibration.subtractKey] : 0);
    const x = (signal - calibration.b) / calibration.a;
    const [low,high] = calibration.range;
    if (x < low - 1e-9 || x > high + 1e-9) return invalid('outside_plate_curve');
  }

  switch (type) {
    case 'chlorophyll_a_b':
    case 'carotenoid': {
      const df = numeric(params.dilutionFactor, 1), path = numeric(params.pathlength, 1);
      const volume = numeric(params.extractVolume, 2), mass = numeric(params.dryMass, 0.02);
      if (![df, path, volume, mass].every(value => value > 0)) return invalid('invalid_params');
      const a = (16.82 * values['665.2'] - 9.28 * values['652.4']) / path;
      const b = (36.92 * values['652.4'] - 16.54 * values['665.2']) / path;
      const c = (1000 * values['470'] / path - 1.91 * a - 95.15 * b) / 225;
      const toDryWeight = df * volume / (1000 * mass);
      if (type === 'carotenoid') return c >= 0 ? { result: c * toDryWeight, unit } : invalid('negative_signal');
      return {
        result: a >= 0 ? a * toDryWeight : null, chl_a: a >= 0 ? a * toDryWeight : null,
        chl_b: b >= 0 ? b * toDryWeight : null, total_chl: a >= 0 && b >= 0 ? (a + b) * toDryWeight : null,
        carotenoid: c >= 0 ? c * toDryWeight : null, unit, issue: Math.min(a, b, c) < 0 ? 'negative_pigment' : null
      };
    }
    case 'glucosinolate':
    case 'anthocyanin':
    case 'total_phenol':
    case 'total_flavonoid': {
      const slope = numeric(params.std_a), intercept = numeric(params.std_b, 0);
      if (!(slope > 0) || intercept === null) return invalid('invalid_curve');
      const prior = type === 'anthocyanin' ? params.anthocyanin || {} : {};
      const volume = numeric(params.extractVolume ?? prior.V, 2), mass = numeric(params.dryMass ?? prior.m, 0.02);
      const df = numeric(params.dilutionFactor ?? prior.n, 1);
      if (![volume, mass, df].every(value => value > 0)) return invalid('invalid_params');
      const signal = type === 'anthocyanin' ? values['530'] - values['600'] :
        values[{ total_phenol: '765', total_flavonoid: '415', glucosinolate: '425' }[type]];
      const concentration = (signal - intercept) / slope;
      if (concentration < 0) return invalid('below_calibration');
      return { result: concentration * volume * df / (1000 * mass), unit };
    }
    case 'h2o2': {
      const p = params.h2o2 || {};
      const a = numeric(p.a), b = numeric(p.b, 0), vol = numeric(p.vol, 2), dw = numeric(p.dw, 0.02);
      if (!(a > 0) || b === null) return invalid('invalid_curve');
      if (!(vol > 0 && dw > 0)) return invalid('invalid_params');
      const corrected = (values['390'] - b) / a;
      if (corrected < 0) return invalid('below_calibration');
      const df = numeric(p.dilutionFactor, 1);
      if (!(df > 0)) return invalid('invalid_params');
      const amount = corrected * vol * df;
      const fw = numeric(sample.weight);
      return { result: amount / dw, unit, result_dw: amount / dw, result_fw: fw > 0 ? amount / fw : null };
    }
    case 'dpph_scavenging': {
      const control = numeric(params.dpph_control);
      if (!(control > 0)) return invalid('invalid_control');
      const corrected = values['517'] - (values.sample_blank ?? 0);
      const result = 100 * (1 - corrected / control);
      return result < 0 || result > 100 ? invalid('inhibition_range') : { result, unit };
    }
    case 'cat': return calculateCatActivity(values, params);
    case 'pod': return calculatePodActivity(values, params);
    case 'sod': return calculateSodActivity(values, params);
    default: return invalid('invalid_params');
  }
}

export { hplcConcentration } from './hplcQuantification.js';

export function resultIssue(issue, lang) {
  const terms = {
    outside_plate_curve: ['플레이트 표준 농도 범위 밖', 'Outside plate standard range'],
    negative_pigment: ['음수로 추정된 색소 항목 확인', 'Check negative pigment estimates'],
    inhibition_range: ['0–100% 범위 밖 · 블랭크 확인', 'Outside 0–100% · check blanks'],
    wrong_slope: ['보정 기울기의 방향 확인', 'Check direction of corrected slope'],
    below_calibration: ['측정값이 검량선의 0 농도 응답보다 낮습니다', 'Reading below zero-concentration calibration response'],
    invalid_inhibition: ['억제율 범위와 블랭크 확인', 'Check inhibition range and blanks'],
    invalid_endpoint: ['50% 억제점 부피·질량 확인', 'Check endpoint volume and tissue mass'],
    missing_reading: ['측정값 확인', 'Check readings'], negative_signal: ['보정 흡광도가 음수입니다', 'Negative corrected absorbance'],
    invalid_pathlength: ['광경로 길이 확인', 'Check path length'], invalid_curve: ['검량선 기울기와 절편 확인', 'Check calibration slope and intercept'],
    invalid_params: ['계산 조건 확인', 'Check parameters'], invalid_control: ['대조구 측정값 확인', 'Check control readings']
  };
  return (terms[issue] || terms.invalid_params)[lang === 'en' ? 1 : 0];
}

export function absorbanceMetrics(type, unit, lang) {
  const en = lang === 'en';
  if (type === 'glucosinolate') return [['result', en ? 'Sinigrin equivalents' : '시니그린 당량', unit]];
  if (type === 'anthocyanin') return [['result', en ? 'C3G equivalents' : 'C3G 당량', unit]];
  if (type === 'chlorophyll_a_b') return [
    ['chl_a', en ? 'Chlorophyll a' : '엽록소 a', unit], ['chl_b', en ? 'Chlorophyll b' : '엽록소 b', unit],
    ['total_chl', en ? 'Total chlorophyll' : '총 엽록소', unit], ['carotenoid', en ? 'Carotenoids' : '카로티노이드', unit]
  ];
  if (type === 'h2o2') return [
    ['result', en ? 'Dry weight basis' : '건물중 기준', 'μmol/g DW'], ['result_fw', en ? 'Fresh weight basis' : '생체중 기준', 'μmol/g FW']
  ];
  if (type === 'sod') return [
    ['result', en ? 'NBT inhibition' : 'NBT 광환원 억제율', '% inhibition'],
    ['endpointActivity', en ? 'Activity from the 50% endpoint' : '50% 억제점 기준 활성', 'U/mg DW']
  ];
  if (type === 'cat' || type === 'pod') return [
    ['result', type === 'cat' ? (en ? 'H₂O₂ decomposition' : 'H₂O₂ 분해 속도') : (en ? 'Tetraguaiacol formation' : '테트라구아이아콜 생성 속도'), 'μmol/min/mg DW']
  ];
  if (type === 'mda') return [
    ['result', en ? 'MDA-equivalent concentration' : 'MDA 환산 농도', 'μM'],
    ['correctedAbsorbance', en ? 'Corrected absorbance' : '보정 흡광도', 'ΔA']
  ];
  return [['result', en ? 'Calculated value' : '계산값', unit]];
}

export function hplcUnit(type) { return isCalibrationCurveHplcType(type) ? 'mg/g DW' : 'μmol/g DW'; }

