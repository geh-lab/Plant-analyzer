import { test } from 'node:test';
import assert from 'node:assert/strict';
import { strToU8, zipSync } from 'fflate';
import { readPlateWorkbook } from '../src/utils/plateWorkbook.js';

const inline = (a, value) => '<c r="'+a+'" t="inlineStr"><is><t>'+value+'</t></is></c>';
const number = (a, value, style = 0) => '<c r="'+a+'" s="'+style+'"><v>'+value+'</v></c>';
const row = (n, ...cells) => '<row r="'+n+'">'+cells.join('')+'</row>';
const header = n => row(n,...Array.from({length:12},(_,i)=>number(String.fromCharCode(67+i)+n,i+1)));
const matrix = (n, well, label, ...cells) => row(n,well ? inline('B'+n,well) : '',...cells,inline('O'+n,label));
function workbook(rows) {
  const rel = (id,type,target) => '<Relationship Id="'+id+'" Type="https://example.test/'+type+'" Target="'+target+'"/>';
  const xml = {
    '_rels/.rels':'<Relationships>'+rel('r1','officeDocument','xl/workbook.xml')+'</Relationships>',
    'xl/workbook.xml':'<workbook xmlns:r="urn:relationships"><sheets><sheet name="Plate A" r:id="r1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels':'<Relationships>'+rel('r1','worksheet','worksheets/sheet1.xml')+rel('r2','sharedStrings','sharedStrings.xml')+rel('r3','styles','styles.xml')+'</Relationships>',
    'xl/sharedStrings.xml':'<sst><si><r><t>ST</t></r><r><t>D1</t></r><rPh><t>Ignored phonetic</t></rPh></si></sst>',
    'xl/styles.xml':'<styleSheet><cellXfs count="2"><xf numFmtId="0"/><xf numFmtId="21"/></cellXfs></styleSheet>',
    'xl/worksheets/sheet1.xml':'<worksheet xmlns:r="urn:relationships"><sheetData>'+rows.join('')+'</sheetData><tableParts><tablePart r:id="t1"/></tableParts></worksheet>',
    'xl/worksheets/_rels/sheet1.xml.rels':'<Relationships>'+rel('t1','table','../tables/table1.xml')+'</Relationships>',
    'xl/tables/table1.xml':'<table name="Readings" ref="B21:C23"><tableColumns><tableColumn name="A"/><tableColumn name="B"/></tableColumns></table>'
  };
  return zipSync(Object.fromEntries(Object.entries(xml).map(([key,v])=>[key,strToU8(v)])));
}

test('native plate layout and endpoint channels retain physical cells, missing values, formula provenance and curve units',async()=>{
  const rows=[
    row(1,inline('A1','Reader Type:'),inline('B1','Epoch')),row(2,inline('B2','Wavelengths:  390, 390')),
    row(3,inline('A3','Layout')),header(4),
    matrix(5,'A','Well ID',inline('C5','SPL1'),'<c r="D5" t="s"><v>0</v></c>'),
    matrix(6,'','Conc/Dil',number('D6',0)),
    row(8,inline('A8','Results')),row(9,inline('A9','Actual Temperature:'),number('B9',0)),header(10),
    matrix(11,'A','390',number('C11',0),inline('D11','OVER'),'<c r="E11"><f>1+1</f><v>2</v></c>'),
    matrix(12,'','390[2]',number('C12',-0.003),number('D12',0.064)),
    matrix(13,'','Blank 390',number('C13',0.001)),matrix(14,'','H2O2 mM',number('C14',0.4)),
    matrix(15,'','Corrected [390]',number('C15',0.005)),matrix(16,'','977 [Test]',number('C16',0.1)),
    matrix(17,'','Pathlength',number('C17',0.6)),
    row(20,inline('A20','StdCurve Fitting Results')),
    row(21,...['Curve Name','Curve Formula','A','B','R2'].map((v,i)=>inline(String.fromCharCode(66+i)+'21',v))),
    row(22,inline('B22','StdCurve'),inline('C22','Y=A*X+B'),number('D22',0.002),number('E22',0.03),number('F22',0.98))
  ];
  const file=new File([workbook(rows)],'plate.xlsx');
  const {fileName,sheets:[s]}=await readPlateWorkbook(file);
  assert.equal(fileName,'plate.xlsx');
  assert.equal(s.name,'Plate A');
  assert.deepEqual(s.metadata.wavelengths,[390,390]);
  assert.deepEqual(s.layout.A2,{label:'STD1',concentration:0});
  assert.equal(s.metadata.concentrationUnit,'mM');
  assert.deepEqual(s.blocks.map(c=>c.kind),['raw','raw','blanked','derived','corrected','reference','derived']);
  const [first,second]=s.blocks;
  assert.deepEqual({...first.values},{A1:0});
  assert.equal(first.flags.A2,'OVER');assert.match(first.flags.A3,/Formula/);
  assert.equal(first.cells.A2,'D11');assert.equal(second.values.A1,-0.003);
  assert.equal(second.repeat,2);assert.equal(s.rows[10][4],2);assert.equal(s.formulas.E11,'1+1');
  assert.deepEqual(s.curves,[{name:'StdCurve',formula:'Y=A*X+B',slope:0.002,intercept:0.03,r2:0.98}]);
  assert.deepEqual(s.tables,[{name:'Readings',range:'B21:C23',columns:['A','B']}]);
});

test('kinetic elapsed time uses Excel formats or explicit units, excluding reader metric summaries',async()=>{
  const series=(n,label,timeLabel,style,times)=>[
    row(n,inline('A'+n,label)),row(n+2,inline('B'+(n+2),timeLabel),inline('C'+(n+2),'A1')),
    ...times.map((v,i)=>row(n+3+i,number('B'+(n+3+i),v,style),i===0 ? inline('C'+(n+3+i),'OVRFLW') : number('C'+(n+3+i),0.12)))
  ];
  const input=workbook([...series(1,'240','Time',1,[0,47/86400]),...series(10,'Blank 240','Time (min)',0,[0,.5]),...series(20,'Max V [240]','Time',1,[0,1/86400]),...series(30,'470','Time',0,[0,10])]);
  const {sheets:[s]}=await readPlateWorkbook(input);
  assert.equal(s.kinetics.length,3);
  const [raw,blank,unknown]=s.kinetics;
  assert.deepEqual(raw.times,[0,47]);assert.deepEqual(raw.values.A1,[null,.12]);
  assert.deepEqual(raw.flags.A1,[{cell:'C4',flag:'OVRFLW'}]);
  assert.equal(blank.kind,'blanked');assert.deepEqual(blank.times,[0,30]);
  assert.deepEqual(unknown.times,[]);assert.equal(unknown.issues[0].code,'time_unit');
  assert.equal(s.metadata.concentrationUnit,null);
});

test('an ordinary worksheet keeps its cached table cells without manufacturing plate measurements',async()=>{
  const input=workbook([row(1,inline('A1','Sample Name'),number('B1',532)),row(2,inline('A2','Leaf 01'),number('B2',.21))]);
  const {sheets:[s]}=await readPlateWorkbook(input);
  assert.equal(s.rows[1][1],.21);assert.deepEqual(s.blocks,[]);assert.deepEqual(s.kinetics,[]);
  await assert.rejects(()=>readPlateWorkbook(new Uint8Array([1,2,3])));
});

test('layout and explicit reader curve headers preserve actual concentration units and signal identity',async()=>{
  const encoded=workbook([
    row(1,inline('A1','Layout')),header(2),matrix(3,'A','Well ID',inline('C3','STD1')),
    matrix(4,'','Conc/Dil (µM)',number('C4',50)),
    row(6,inline('A6','Results')),header(7),matrix(8,'A','390[2]',number('C8',.043)),
    row(10,...['Curve Name','Curve Formula','A','B','R2','Signal','X Unit'].map((v,i)=>inline(String.fromCharCode(66+i)+'10',v))),
    row(11,inline('B11','StdCurve'),inline('C11','Y=A*X+B'),number('D11',.01),number('E11',.005),inline('G11','390[2]'),inline('H11','µM'))
  ]);
  const {sheets:[sheet]}=await readPlateWorkbook(encoded);
  assert.deepEqual(sheet.layout.A1,{label:'STD1',concentration:50});
  assert.equal(sheet.metadata.concentrationUnit,'µM');assert.equal(sheet.curves[0].signal,'390[2]');
  assert.equal(sheet.curves[0].unit,'µM');assert.equal(sheet.curves[0].r2,null);
});
