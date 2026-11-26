import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dilutionPlan } from '../src/utils/dilutionPlan.js';

test('C1V1=C2V2 uses µL per tube and shares one sorted, deduplicated series',()=>{
  const {rows}=dilutionPlan(2,'1, .40, 0, .4',1);
  assert.deepEqual(rows.map(r=>[r.target,r.stockUl,r.diluentUl]),[[0,0,2000],[.4,800,1200],[1,2000,0]]);
  const phenol=dilutionPlan(1,'20,100',1000);
  assert.equal(phenol.rows[0].stockUl,20);
  assert.equal(phenol.rows[1].diluentUl,900);
  assert.equal(dilutionPlan(1,'.4',1).rows[0].stockUl,400);
});
test('rejects invalid concentrations or volumes instead of showing a misleading graph',()=>{
  for(const [input,error] of [['0,1.1','range'],['-.1','range'],['2x','targets'],['0,','targets'],['','targets'],['0x01','targets']])assert.equal(dilutionPlan(1,input,1).error,error);
  for(const vol of [0,-2,'','1e308','Infinity'])assert.equal(dilutionPlan(vol,'0,1',1).error,'volume');
  assert.equal(dilutionPlan(1,'0',0).error,'stock');
});
