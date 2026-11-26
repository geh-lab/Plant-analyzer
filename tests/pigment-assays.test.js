import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeSample, absorbanceMetrics } from '../src/utils/resultCalculations.js';
import { readAbsorbanceParameters } from '../src/utils/calibrationStorage.js';
import { pigmentProtocols } from '../src/data/pigmentProtocols.js';

const measure = (type, readings, p) => analyzeSample({ analysis_type: type, absorbance_values: readings }, p);
function near(actual, expected) { assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) < 1e-9, String(actual) + ' vs ' + expected); }

test('90% methanol Chl a/b and carotenoid coefficients use 1 cm readings and dry mass', () => {
  const v = { '665.2': 0.5, '652.4': 0.3, '470': 0.4 };
  const a = 5.626, b = 2.806, c = (400 - 1.91 * a - 95.15 * b) / 225;
  const p = { pathlength: 0.5, dilutionFactor: 2, extractVolume: 3, dryMass: 0.04 };
  const factor = 2 * 2 * 3 / 40;
  const r = measure('chlorophyll_a_b',v,p);
  near(r.chl_a, a * factor); near(r.chl_b, b * factor); near(r.total_chl, (a + b) * factor); near(r.carotenoid, c * factor);
  near(measure('carotenoid',v,p).result, c * factor);
  near(measure('chlorophyll_a_b',v,{}).result, a / 10);
  assert.equal(measure('chlorophyll_a_b',v,{pathlength:0}).result,null);
});

test('matched pre-reaction standard curves convert μg/mL to mg equivalents/g DW', () => {
  for (const [type,values,unit] of [
    ['total_phenol', {765: 0.6}, 'mg GAE/g DW'], ['total_flavonoid', {415: 0.6}, 'mg QE/g DW'],
    ['glucosinolate',{425:0.6},'mg SnE/g DW'], ['anthocyanin',{530:0.65,600:0.05},'mg C3G eq./g DW']
  ]) {
    const r=measure(type,values,{std_a:0.01,std_b:0.1,extractVolume:4,dryMass:0.1,dilutionFactor:2});
    near(r.result,4); assert.equal(r.unit,unit);
    assert.equal(measure(type,values,{}).issue,'invalid_curve');
    assert.equal(measure(type,values,{std_a:0.01,std_b:0.8}).issue,'below_calibration');
  }
});

test('leaf calibration does not reuse dormant coefficients from a retired workspace setting', () => {
  for (const key of ['calc_params_glucosinolate','absorbance_calc_params_glucosinolate']) {
    const previous={glucosinolateMode:'mustard_meal',std_a:.5,std_b:.02,dryMass:.1};
    const read=(k,fallback)=>k===key ? previous : fallback;
    const current=readAbsorbanceParameters('glucosinolate',read);
    assert.deepEqual(current,{dryMass:.1});
    const result=measure('glucosinolate',{425:.5},current);
    assert.equal(result.issue,'invalid_curve');
    assert.equal(result.result,null);
    assert.deepEqual(absorbanceMetrics('glucosinolate',result.unit,'en')[0],['result','Sinigrin equivalents','mg SnE/g DW']);
    assert.equal(previous.std_a,.5);
  }
  const saved={glucosinolateMode:'calibration',std_a:.01,std_b:.1};
  assert.deepEqual(readAbsorbanceParameters('glucosinolate',()=>saved),{std_a:.01,std_b:.1});
});

test('DPPH includes the measured extract blank only once and flags impossible inhibition', () => {
  near(measure('dpph_scavenging',{517:0.5,sample_blank:0.1},{dpph_control:0.8}).result,50);
  near(measure('dpph_scavenging',{517:0.4},{dpph_control:0.8}).result,50);
  assert.equal(measure('dpph_scavenging',{517:0.5},{dpph_control:0}).result,null);
  assert.equal(measure('dpph_scavenging',{517:0.9},{dpph_control:0.8}).issue,'inhibition_range');
});

test('all six protocols describe the publication coverage and local interpretation in each language',()=>{
  for(const lang of ['ko','en']) for(const method of Object.values(pigmentProtocols(lang))) {
    assert.ok(method.interpretation);
    assert.ok(method.references.every(ref => ref.doi && ref.note));
  }
});
