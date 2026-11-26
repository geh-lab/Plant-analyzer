import assert from 'node:assert/strict';
import { test } from 'node:test';
import { distributionData, makeLineWrapper, tukeySummary, xmlLabel } from '../src/utils/distributionPlot.js';

test('box plot uses interpolated quartiles, Tukey fences and all outliers', () => {
  const stats = tukeySummary([1,2,3,4,5,6,100,null,'']);
  assert.deepEqual(stats,{q1:2.5,median:4,q3:5.5,whiskerLow:1,whiskerHigh:6,outliers:[100]});
  assert.deepEqual(tukeySummary([0,0,0,0,-5,0,9]).outliers,[-5,9]);
  assert.deepEqual(tukeySummary([3]),{q1:3,median:3,q3:3,whiskerLow:3,whiskerHigh:3,outliers:[]});
  assert.equal(tukeySummary([]),null);
  const atFence=tukeySummary([0,2,2,3,4,4,7]);
  assert.equal(atFence.whiskerHigh,7);
  assert.equal(atFence.outliers.length,0);
});
test('chart data keeps signed samples and genuine zeroes, discards missing readings, and forces grouping for boxes', () => {
  const obs=[{group:'G',name:'A',value:-2},{group:'G',name:'B',value:0},{group:'A',name:'C',value:8},{group:'A',name:'D',value:null}];
  const grouped=distributionData(obs,'bar','group');
  assert.deepEqual(grouped.rows.map(r=>[r.name,r.mean,r.count,r.se]),[['A',8,1,null],['G',-1,2,1]]);
  assert.equal(grouped.low,-2);
  assert.equal(grouped.high,8);
  const samples=distributionData(obs,'point','sample');
  assert.deepEqual(samples.rows.map(r=>r.name),['A','B','C']);
  assert.equal(samples.rows[1].mean,0);
  assert.equal(distributionData(obs,'box','sample').rows.length,2);
  assert.equal(distributionData(obs.slice(2,3),'bar','sample').low,0);
  assert.equal(distributionData(obs.slice(0,1),'bar','sample').high,0);
  assert.deepEqual(distributionData([],'point','group'),{rows:[],grouped:true,low:0,high:1});
});
test('formatting preserves complete names and chart data is not sliced', () => {
  const name='긴 이름🌱 <A & B> '.repeat(25);
  assert.equal(makeLineWrapper('ko')(name,120,14).join(''),name);
  assert.equal(xmlLabel('A\u0001B'),'A B');
  const many=Array.from({length:6000},(_,i)=>({group:'A',name:'S'+i,value:i}));
  assert.equal(distributionData(many,'point','sample').rows.length,6000);
  assert.equal(distributionData(many,'box','group').rows[0].box.median,2999.5);
});
