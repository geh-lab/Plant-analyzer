import assert from 'node:assert/strict';
import test from 'node:test';
import { plateSampleIdentity } from '../src/utils/plateSampleIdentity.js';

function legacyPlateRow() {
  return {
    analysis_type: 'h2o2', sample_name: 'first', treatment_name: 'A',
    absorbance_values: { '390': 0.37 },
    plate_import: {
      file: 'export.xlsx', sheet: 'Sheet 1', plate: 'Plate 1', well: 'H2', label: 'SPL1', signal: 'raw',
      channels: [{ field: '390', channel: '390', wavelength: 390, cell: 'D38', reading: 0.37 }],
      overrides: { h2o2: { a: 0.2, b: 0.02 } }, controlWells: ['A11', 'B11', 'C11'],
      curve: { key: '390', a: 0.2, b: 0.02, r2: 0.995, unit: 'mM', range: [0, 2] }
    }
  };
}

test('the same standard-curve measurement survives parser upgrades and sample renaming', () => {
  const saved = legacyPlateRow();
  const imported = structuredClone(saved);
  Object.assign(imported, { sample_name: 'renamed', treatment_name: 'B' });
  const plate = imported.plate_import;
  plate.controlWells.reverse();
  plate.curve = { source: 'standards', unitAssumed: false, range: [0, 2], unit: 'mM', r2: 0.995, b: 0.02, a: 0.2, key: '390' };
  plate.overrides = { h2o2: { b: 0.02, a: 0.2 } };
  plate.channels[0].well = 'H2';
  assert.equal(plateSampleIdentity(saved), plateSampleIdentity(imported));
  plate.curve.unit = 'μM';
  saved.plate_import.curve.unit = 'µM';
  assert.equal(plateSampleIdentity(saved), plateSampleIdentity(imported));
});

test('keep distinct raw reads, chosen reference wells, controls and fitted curves', () => {
  const saved = legacyPlateRow();
  const base = plateSampleIdentity(saved);
  for (const change of [
    p => { p.sheet = 'Sheet 2'; },
    p => { p.signal = 'blank'; },
    p => { p.channels[0].channel = '390[2]'; },
    p => { p.channels[0].reading = 0.39; },
    p => { p.channels[0].well = 'H3'; },
    p => { p.controlWells[0] = 'A12'; },
    p => { p.overrides.h2o2.b = 0.03; },
    p => { p.curve.a = 0.4; },
    p => { p.curve.unit = 'µM'; },
    p => { p.curve.range = [0, 3]; },
    p => { p.curve.subtractKey = '600'; },
    p => { p.curve.source = 'reader'; },
  ]) {
    const imported = structuredClone(saved);
    change(imported.plate_import);
    assert.notEqual(base, plateSampleIdentity(imported), String(change));
  }
});

test('kinetic windows and SOD light/dark reference assignments remain distinct', () => {
  const saved = legacyPlateRow();
  saved.analysis_type = 'cat';
  saved.plate_import.fit = { wavelength: 240, unit: 'ΔA/min', startSeconds: 0, endSeconds: 120, n: 25, slope: -0.1, intercept: 0.5, rSquared: 1 };
  const differentWindow = structuredClone(saved);
  differentWindow.plate_import.fit.endSeconds = 60;
  assert.notEqual(plateSampleIdentity(saved), plateSampleIdentity(differentWindow));
  saved.analysis_type = 'sod';
  const swapped = structuredClone(saved);
  swapped.plate_import.controlWells.reverse();
  assert.notEqual(plateSampleIdentity(saved), plateSampleIdentity(swapped));
});

test('a pinned workspace fit deduplicates only when the effective calibration matches', () => {
  const incoming = legacyPlateRow();
  const plate = incoming.plate_import;
  const curve = plate.curve;
  delete plate.curve;
  delete plate.overrides;
  delete plate.controlWells;
  const pinned = { ...incoming, calibration_snapshot: { h2o2: { a: 0.4, b: 0 }, plateCalibrationSource: { curve } } };
  const params = { h2o2: { a: '0.40', b: 0, vol: 2 }, plateCalibrationSource: { curve: { ...curve, source: 'standards' } } };
  assert.equal(plateSampleIdentity(incoming, params), plateSampleIdentity(pinned, params));
  const nextParams = { ...params, h2o2: { a: 0.5, b: 0 } };
  assert.notEqual(plateSampleIdentity(incoming, nextParams), plateSampleIdentity(pinned, nextParams));
  assert.notEqual(plateSampleIdentity(incoming, { ...params, plateCalibrationSource: undefined }), plateSampleIdentity(pinned, params));
  assert.equal(plateSampleIdentity({ analysis_type: 'h2o2', absorbance_values: { '390': 0.37 } }), null);
});
