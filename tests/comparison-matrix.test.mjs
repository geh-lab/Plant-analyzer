import test from 'node:test';
import assert from 'node:assert/strict';
import {hplcMatrix} from '../src/utils/comparisonMatrix.js';

test('HPLC heatmap preserves scope, zero/missing cells and ambiguous duplicate injections', () => {
  const row = (compound, concentration, replicate='1') => ({ sampleName:'leaf', factor:'light', treatment:'A', replicate, compound, concentration });
  const matrix = hplcMatrix([row('X',0), row('Y',null), row('X',3, '2'), row('X',4,'2'), row('Y',2,'2')], 'mg/g DW', 'en');
  assert.deepEqual(matrix.columns.map(c=>c.label), ['X','Y']);
  assert.equal(matrix.rows.length, 4);
  assert.deepEqual(matrix.rows[0].values, {c0:0,c1:null});
  assert.deepEqual(matrix.rows.slice(1).map(r=>r.values), [{c1:2}, {c0:3}, {c0:4}]);
  assert.equal(matrix.rows[1].group, 'light / A · Rep 2');
});
