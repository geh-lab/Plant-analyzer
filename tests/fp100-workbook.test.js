import { test } from "node:test";
import assert from "node:assert/strict";
import { zipSync, strToU8 } from "fflate";
import { parseFp100WorkbookSheets, readFp100Workbook } from "../src/utils/fp100Workbook.js";

const raw = [
  ["Measuring - LC3-455"], ["SOURCE DATA"], [" DESCR ", "Leaf A", "Leaf B"],
  ["[µs]", 1, 2], [null, "12:20:00  1.6.2025", "12:28:00  1.6.2025"], ["-------"],
  [1, 100, 0], [200000, 230, null], [1050000, 180, 350], ["-------"],
];
const firmware = [
  ["COMPUTED VALUES"], [" DESCR "], ["name", 2, 1],
  [null, "12:28:00  1.6.2025", "12:20:00  1.6.2025"], ["-------"],
  ["Fo", 0, 101], ["Fm", 510, 350], ["QY_max", "0,70", 0.71], ["QY_L7", 0, 0.045], ["-------"],
];
const runOf = (rows, name = "Acquisitions") => parseFp100WorkbookSheets([{ name, rows }]).runs[0];

test("LC tables preserve real times and DESCR labels and match reordered firmware columns by acquisition identity", () => {
  const run = runOf([["FluorPen ASCII Export File"], ...raw, ...firmware]);
  const [a,b] = run.leaves;
  assert.equal(run.methodId, "lc3");
  assert.equal(run.protocol, "LC3-455");
  assert.equal(run.sourceUnit, "us");
  assert.deepEqual(run.metrics, ["Fo", "Fm", "QY_max", "QY_L7"]);
  assert.deepEqual(a.points, [[0.001,100],[200,230],[1050,180]]);
  assert.deepEqual(b.points, [[0.001,0],[1050,350]]);
  assert.equal(a.recordedAt, "12:20:00  1.6.2025");
  assert.equal(a.group, "Leaf A");
  assert.equal(b.description, "Leaf B");
  assert.equal(run.skipped, 1);
  assert.equal(run.unmatchedReported, 0);
  assert.deepEqual(a.reported, {Fo:101,Fm:350,QY_max:0.71,QY_L7:0.045});
  assert.deepEqual(b.reported, {Fo:0,Fm:510,QY_max:0.7,QY_L7:0});
});

test("NPQ retains signed reported values, Lss and D7, and never replaces blank fields with zeros", () => {
  const run = runOf([
    ["Measuring - NPQ2-455"], ["SOURCE DATA"], ["DESCR","B"], ["[s]",1], [0,7],[0.001,12],[60.5,20],
    ["COMPUTED VALUES"],["name",1],["Fo",8],["QY_L1",-0.04],["NPQ_Lss",1.84],["Qp_D7","#DIV/0!"],
    ["QY_D7",0.72],["Not in this export",null],
  ]);
  assert.equal(run.methodId, "npq2");
  assert.equal(run.kind, "npq");
  assert.deepEqual(run.leaves[0].points, [[0,7],[1,12],[60500,20]]);
  assert.deepEqual(run.leaves[0].reported, {Fo:8,QY_L1:-0.04,NPQ_Lss:1.84,Qp_D7:null,QY_D7:0.72,"Not in this export":null});
});

test("independent blocks and sheets can repeat trace IDs without merging acquisitions", () => {
  const unknown = [["Measuring - QY"],["SOURCE DATA"],["[us]",1],[1,123]];
  const {runs} = parseFp100WorkbookSheets([
    {name:"One",rows:[...raw,...firmware,...unknown,...raw,...firmware]},
    {name:"Two",rows:[["Measuring - NPQ1-455"],...firmware]},
  ]);
  assert.deepEqual(runs.map(r=>[r.sheetName,r.block,r.methodId]), [["One",1,"lc3"],["One",2,"lc3"],["Two",1,"npq1"]]);
  assert.equal(new Set(runs.flatMap(r=>r.leaves.map(l=>l.traceKey))).size,6);
  assert.deepEqual(runs[2].leaves[0].points,[]);
  assert.equal(runs[2].leaves[0].group,"Unassigned");
  assert.equal(runs[2].leaves[0].reported.QY_L7,0);
  assert.deepEqual(runOf(raw).leaves[0].reported,{});
});

test("mismatched clocks, repeated timestamps and ambiguous metric names cannot overwrite a measurement", () => {
  const run = runOf([
    ...raw.slice(0,-1),[200000,240,450],
    ["COMPUTED VALUES"],["name",1,2],[null,"12:20:00  1.6.2025","22:20:00  1.6.2025"],
    ["QY_L1",0.5,0.3],["QY_L1",0.6,0.4],["QY_L2",0,0],
  ]);
  assert.equal(run.duplicates,1);
  assert.deepEqual(run.leaves[0].points, [[0.001,100],[1050,180]]);
  assert.equal(run.leaves[0].reported.QY_L1,null);
  assert.equal(run.leaves[0].reported.QY_L2,0);
  assert.deepEqual(run.leaves[1].reported,{});
  assert.equal(run.unmatchedReported,1);
  assert.throws(()=>runOf([["LC3"],["[us]",1],[1,99]],"LC3"),{code:"unsupported_fp100_workbook"});
  assert.throws(()=>runOf([["Measuring - LC3-455"],["SOURCE DATA"],["time",1],[1,99]]),{code:"unsupported_fp100_workbook"});
});

test("the production file entry point decodes actual XLSX cells without retaining guessed values", async () => {
  const rowXML = [['Measuring - NPQ2-455'],['SOURCE DATA'],['DESCR','Test'],['[ms]',1],[0,3],[1,9],
    ['COMPUTED VALUES'],['name',1],['QY_Lss',-0.01]].map((row,r)=>'<row r="'+(r+1)+'">'+row.map((value,c)=>{
      const a=String.fromCharCode(65+c)+(r+1);
      return typeof value === 'number' ? '<c r="'+a+'"><v>'+value+'</v></c>'
        : '<c r="'+a+'" t="inlineStr"><is><t>'+value+'</t></is></c>';
    }).join('')+'</row>').join('');
  const xml={
    'xl/workbook.xml':'<workbook xmlns:r="urn:relationships"><sheets><sheet name="Native" r:id="sheet1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels':'<Relationships><Relationship Id="sheet1" Type="urn:test/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    'xl/worksheets/sheet1.xml':'<worksheet><sheetData>'+rowXML+'</sheetData></worksheet>',
  };
  const buffer = zipSync(Object.fromEntries(Object.entries(xml).map(([k,v])=>[k,strToU8(v)])));
  const parsed=await readFp100Workbook(new File([buffer],"test-observations.xlsx"));
  assert.equal(parsed.fileName,"test-observations.xlsx");
  assert.equal(parsed.format,"fluorpen-workbook");
  assert.deepEqual(parsed.runs[0].leaves[0].points,[[0,3],[1,9]]);
  assert.equal(parsed.runs[0].leaves[0].reported.QY_Lss,-0.01);
  await assert.rejects(()=>readFp100Workbook(new Uint8Array([1,2,3])));
});
