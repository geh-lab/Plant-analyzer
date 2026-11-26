import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSample, effectiveSampleParams, hplcConcentration, mergeCalibrationParams, snapshotSampleCalibration } from '../src/utils/resultCalculations.js';
import { summarize, makeCsv } from '../src/utils/resultData.js';

test('MDA concentrations use both readings and measured path length', () => {
  const mda = (a, b, pathlength = 1) => analyzeSample({
    analysis_type: 'mda', absorbance_values: { 532: a, 600: b }
  }, { mda: { pathlength } });
  assert.equal(mda(.32, .01).result, 2);
  assert.equal(mda(.32, .01, .5).result, 4);
  assert.equal(mda(.01, .01).result, 0);
  assert.equal(mda(.01, .32).result, null);
  assert.equal(mda(.01, .32).issue, 'negative_signal');
  assert.equal(mda('', .01).result, null);
  assert.equal(mda(.32, .01, 0).result, null);
});

test('absorbance requires measured inputs and a valid calibration', () => {
  const sample = { analysis_type: 'total_phenol', absorbance_values: { 765: .5 } };
  assert.equal(analyzeSample(sample).result, null);
  assert.equal(analyzeSample(sample, { std_a: .2, std_b: .1 }).result, .2);
  assert.equal(analyzeSample({ ...sample, absorbance_values: {} }, { std_a: .2 }).result, null);
  assert.ok(Math.abs(analyzeSample({ analysis_type: 'cat', absorbance_values: { 240: -.05 } }, { cat: { h2o2_control_slope: -.01 } }).result - (.04 / .0436) * (200 / 3) * (2 / 20)) < 1e-10);
  assert.equal(analyzeSample({ analysis_type: 'h2o2', absorbance_values: { 390: .5 } }, { h2o2: { a: .5 } }).result_fw, null);
});

test('workbook calibration merges only the supplied coefficients into flat or nested settings', () => {
  const flat = {std_a: 2, std_b: .1, extractVolume: 3, dryMass: .02};
  assert.deepEqual(mergeCalibrationParams('total_phenol', flat, {std_a: 3, std_b: 0}), {...flat, std_a: 3, std_b: 0});
  const nested = {h2o2: {a: 2, b: .1, vol: 3, dw: .02, dilutionFactor: 4}, preference: 'retained'};
  assert.deepEqual(mergeCalibrationParams('h2o2', nested, {h2o2: {a: 4, b: 0}}),
    {h2o2: {a: 4, b: 0, vol: 3, dw: .02, dilutionFactor: 4}, preference: 'retained'});
  assert.equal(nested.h2o2.a, 2);
  assert.equal(flat.std_a, 2);
  assert.equal(mergeCalibrationParams('h2o2', nested, null), nested);
});

test('saved source and tested concentration range follow the coefficients used for each sample', () => {
  const manual = {analysis_type:'total_phenol', absorbance_values:{765:.7}};
  const oldCurve = {a:.1, b:0, key:'765', range:[0,10]};
  const newCurve = {a:.02, b:0, key:'765', range:[0,5]};
  const previous = {std_a:.1, std_b:0, plateCalibrationSource:{fileName:'first.xlsx',curve:oldCurve}};
  const current = {std_a:.02, std_b:0, plateCalibrationSource:{fileName:'second.xlsx',curve:newCurve}};
  const saved = snapshotSampleCalibration(manual, 'total_phenol', previous);
  assert.equal(effectiveSampleParams(saved,current).plateCalibrationSource.fileName, 'first.xlsx');
  assert.equal(analyzeSample(saved,current).result, analyzeSample(manual,previous).result);
  assert.equal(analyzeSample(manual,current).issue,'outside_plate_curve');
  const manualSource = snapshotSampleCalibration(manual,'total_phenol',{std_a:2});
  assert.equal(effectiveSampleParams(manualSource,current).plateCalibrationSource,undefined);
});

test('previous manual samples keep their curve across imports while extraction settings remain editable', () => {
  const sample = {analysis_type: 'h2o2', absorbance_values: {390: 1}};
  const old = {h2o2: {a: 2, b: 0, vol: 2, dw: .25, dilutionFactor: 1}};
  const updated = mergeCalibrationParams('h2o2', old, {h2o2: {a: 4, b: .5}});
  const frozen = snapshotSampleCalibration(sample, 'h2o2', old);
  assert.deepEqual(frozen.calibration_snapshot, {h2o2: {a: 2, b: 0}});
  assert.equal(analyzeSample(frozen, updated).result, analyzeSample(sample, old).result);
  assert.equal(analyzeSample(frozen, {...updated, h2o2: {...updated.h2o2, vol: 4}}).result, 8);
  assert.equal(snapshotSampleCalibration(frozen, 'h2o2', updated), frozen);
  assert.equal(snapshotSampleCalibration(sample, 'total_flavonoid', updated), sample);

  const priorPlate = {...sample, plate_import: {overrides: {h2o2: {a: 5, b: 0}}}};
  assert.equal(snapshotSampleCalibration(priorPlate, 'h2o2', updated), priorPlate);
  assert.equal(effectiveSampleParams({...priorPlate, calibration_snapshot: frozen.calibration_snapshot}, updated).h2o2.a, 5);
});

test('legacy records missing a slope stay unquantified after a valid file curve becomes the workspace default', () => {
  const entries = [
    [{analysis_type:'total_phenol', absorbance_values:{765:1}}, {std_a:2, std_b:0}, {std_a:null, std_b:0}],
    [{analysis_type:'h2o2', absorbance_values:{390:1}}, {h2o2:{a:2,b:0}}, {h2o2:{a:null,b:0}}],
  ];
  for (const [sample, next, expected] of entries) {
    const frozen = snapshotSampleCalibration(sample, sample.analysis_type, {});
    assert.deepEqual(frozen.calibration_snapshot, expected);
    assert.equal(analyzeSample(frozen, next).issue, 'invalid_curve');
    assert.ok(Number.isFinite(analyzeSample(sample, next).result));
  }
});

test('HPLC handles external calibration, reference ratios and invalid mass', () => {
  const params = { X_a: 10, X_b: 200, extractionVolume: 10, sampleWeight: .2, dilutionFactor: 2 };
  const row = { compound: 'X', area: 1200 };
  assert.equal(hplcConcentration(row, params, 'phenol'), 10);
  assert.equal(hplcConcentration({ ...row, area: 0 }, params, 'phenol'), null);
  assert.equal(hplcConcentration({ ...row, area: null }, params, 'phenol'), null);
  assert.equal(hplcConcentration(row, { ...params, sampleWeight: 0 }, 'phenol'), null);
  assert.equal(hplcConcentration({ ...row, area: 12 }, { standardArea: 24, molecularWeight: 125, sampleWeight: 1 }, 'glucosinolate'), null);
});

test('summary counts real zeroes, omits unavailable readings and reports sample uncertainty', () => {
  const r = summarize([null, '', NaN, Infinity, 1, 3]);
  assert.equal(r.count, 2);
  assert.equal(r.mean, 2);
  assert.equal(r.variance, 2);
  assert.equal(r.sd, Math.sqrt(2));
  assert.equal(r.se, 1);
  assert.equal(summarize([0]).se, null);
  assert.equal(summarize([0, 0]).cv, null);
  assert.equal(summarize([0, 0]).mean, 0);
  assert.equal(summarize([]).mean, null);
});

test('CSV distinguishes zero from missing values and quotes arbitrary sample names', () => {
  assert.equal(makeCsv([['a,",b', 'f\ng', '=1+1', 0, null]]), '\uFEFF"a,"",b","f\ng","\'=1+1",0,');
});

test('oxidative assays retain calibration basis, mass balance and endpoint semantics', () => {
  const calc = (type, values, p = {}, extra = {}) => analyzeSample({
    analysis_type: type, absorbance_values: values, ...extra
  }, { [type]: p });
  const close = (observed, wanted) => assert.ok(Math.abs(observed - wanted) < 1e-9, String(observed));
  close(calc('cat', {240: -.0536}, {control_slope: -.01, l: 1, DF: 1}).result, 200 / 3 * 2 / 20);
  close(calc('pod', {'470': .276, blank_slope: .01}, {aliquotUl: 10, reactionUl: 200, extractMl: 3, dryMassMg: 30, pathlength: .5, dilutionFactor: 2}).result, .08);
  assert.equal(calc('cat', {240: .1}).issue, 'wrong_slope');
  const sod = {'560': .425, sample_dark_blank: .05};
  const sq = {light_control_abs: .8, dark_blank_abs: .05, dilutionFactor: 3};
  close(calc('sod', sod, sq).result, 50);
  assert.equal(calc('sod', sod, sq).endpointActivity, null);
  close(calc('sod', {...sod,endpoint_ul:10}, sq).endpointActivity, 10);
  assert.equal(calc('sod', {560:.9}, sq).issue, 'invalid_inhibition');
  assert.equal(calc('sod', {560:.7}, {light_control_abs:.05, dark_blank_abs:.05}).issue, 'invalid_control');
  const h = calc('h2o2', {390:.3}, {a:.5, b:.1, vol:2, dw:.02, dilutionFactor:2}, {weight:.2});
  close(h.result,80);
  close(h.result_fw,8);
  assert.equal(calc('h2o2',{390:.01},{a:.5,b:.1}).issue,'below_calibration');
});
