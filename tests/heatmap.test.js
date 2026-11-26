import test from 'node:test';
import assert from 'node:assert/strict';
import { heatmapColour, heatmapPalette, heatmapScales, heatmapText, wrapHeatmapText } from '../src/components/results/heatmapData.js';

test('heatmap uses independent per-column ranges and distinguishes zero, flat and missing cells', () => {
  const columns = ['pigment','activity','fixed','empty'].map(key => ({key}));
  const rows = [{values:{pigment:0,activity:-100,fixed:1}}, {values:{pigment:1,activity:100,fixed:1,empty:Infinity}}, {values:{pigment:null,activity:0}}];
  const scales = heatmapScales(columns,rows);
  assert.deepEqual(scales, [{min:0,max:1},{min:-100,max:100},{min:1,max:1},null]);
  assert.deepEqual(heatmapColour(0,scales[0]), heatmapPalette[0]);
  assert.deepEqual(heatmapColour(0,scales[1]), heatmapPalette[2]);
  assert.deepEqual(heatmapColour(1,scales[2]), heatmapPalette[2]);
  assert.deepEqual(heatmapColour(1,scales[0]), heatmapPalette[4]);
  assert.notDeepEqual(heatmapColour(null,scales[0]), heatmapColour(0,scales[0]));
  assert.deepEqual(heatmapColour(0,{min:-1e308,max:1e308}),heatmapPalette[2]);
});

test('long identifiers wrap without truncation and downloaded labels are XML-safe', () => {
  const name='온실처리구실험반복1';
  const lines=wrapHeatmapText(name,4,text => Array.from(text).length);
  assert.equal(lines.join(''),name);
  assert.ok(lines.every(s => s.length <= 4));
  assert.equal(heatmapText('A\u0000\ud800B'),'A  B');
});
