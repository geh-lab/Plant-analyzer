import test from "node:test";
import assert from "node:assert/strict";
import { buildPlatePreview, buildPlateSamples } from "../src/utils/plateImport.js";
import { analyzeSample, effectiveSampleParams } from "../src/utils/resultCalculations.js";

function channel(label, wavelength, values, repeat=1, kind="raw") {
  return {label,key:label,kind,wavelength,values,repeat,flags:{},cells:{}};
}
const config={selectedWells:new Set(["A1","A2"]),groups:{},names:{},defaultGroup:"Trial",fileName:"reader.xlsx",sheetName:"Plate",useCalibration:true};

test("plate curve uses the selected channel, original standards and sample-only scope",()=>{
  const sheet={layout:{A1:{label:"SPL1"},A2:{label:"SPL2"},B1:{label:"STD1",concentration:0},B2:{label:"STD2",concentration:1},B3:{label:"STD3",concentration:2}},
    metadata:{},blocks:[channel("415",415,{A1:.7,A2:1.2,B1:.1,B2:.5,B3:.9})]};
  const preview=buildPlatePreview(sheet,"total_flavonoid");
  assert.equal(preview.calibration.overrides.std_a,.4);
  const samples=buildPlateSamples(preview,config);
  assert.equal(samples.length,2);
  const workspace={std_a:2,std_b:0,extractVolume:2,dryMass:.02};
  assert.ok(Math.abs(analyzeSample(samples[0],workspace).result-.15)<1e-10);
  assert.equal(analyzeSample(samples[1],workspace).issue,"outside_plate_curve");
  assert.equal(effectiveSampleParams(samples[0],workspace).extractVolume,2);
  assert.equal(workspace.std_a,2);
  assert.equal(analyzeSample({...samples[1],plate_import:null},workspace).result,.06);
});

test("DPPH pairs sample blanks only on explicit selection and excludes control wells",()=>{
  const sheet={layout:{A1:{label:"SPL1"},A2:{label:"SPLC1"},A3:{label:"CTL1"}},blocks:[channel("517",517,{A1:.4,A2:.1,A3:.6})]};
  const raw=buildPlatePreview(sheet,"dpph_scavenging");
  assert.equal(raw.rows[0].values.sample_blank,undefined);
  const paired=buildPlatePreview(sheet,"dpph_scavenging",{pairSampleBlanks:true});
  const [record]=buildPlateSamples(paired,config);
  assert.equal(record.absorbance_values.sample_blank,.1);
  assert.equal(paired.sampleBlankPairs,1);
  assert.equal(buildPlateSamples(paired,config).length,1);
  assert.ok(Math.abs(analyzeSample(record).result-50)<1e-10);
  assert.equal(record.plate_import.channels[1].well,"A2");
  sheet.layout.B1={label:"SPLC1"};
  const ambiguous=buildPlatePreview(sheet,"dpph_scavenging",{pairSampleBlanks:true});
  assert.equal(ambiguous.rows[0].valid,false);
});

test("nominal wavelengths require review and corrected outputs are kept distinct from raw AU",()=>{
  const sheet={layout:{A1:{label:"SPL1"}},blocks:[channel("665",665,{A1:.5}),channel("652",652,{A1:.3}),channel("470",470,{A1:.4}),
    channel("Corrected [470]",470,{A1:.64},1,"corrected")]};
  const preview=buildPlatePreview(sheet,"chlorophyll_a_b");
  assert.equal(preview.needsWavelengthConsent,true);
  assert.deepEqual(preview.signals,["raw"]);
  const [sample]=buildPlateSamples(preview,config);
  assert.equal(sample.absorbance_values["665.2"],.5);
  assert.equal(sample.plate_import.channels[0].wavelength,665);
  assert.equal(buildPlatePreview(sheet,"mda").compatible,false);
  assert.deepEqual(buildPlateSamples(buildPlatePreview(sheet,"mda"),config),[]);
});

test("averaging technical repeats keeps zeros and withholds wells missing a chosen read",()=>{
  const sheet={layout:{A1:{label:"SPL1"},A2:{label:"SPL2"}},
    blocks:[channel("560",560,{A1:0,A2:.4}),channel("560[2]",560,{A1:.2},2)]};
  const preview=buildPlatePreview(sheet,"sod",{repeat:"mean"});
  assert.equal(preview.rows[0].values["560"],.1);
  assert.equal(preview.rows[1].valid,false);
  assert.deepEqual(preview.rows[0].source.map(c=>c.reading),[0,.2]);
});

test("identifies the compatible assay for a file dropped in a different workspace",async()=>{
  const {identifyPlateAssays}=await import("../src/utils/plateImport.js");
  const cat={blocks:[],kinetics:[{kind:"raw",wavelength:240}]};
  assert.deepEqual(identifyPlateAssays(cat),["cat"]);
  assert.deepEqual(identifyPlateAssays({blocks:[channel("530",530,{}),channel("600",600,{})]}),["anthocyanin"]);
  assert.deepEqual(identifyPlateAssays({blocks:[]}),[]);
});

function standardPlate(wavelength, xs, values, metadata={}) {
  const layout={A1:{label:"SPL1"}}, wells={A1:.2};
  xs.forEach((x,i)=>{
    const well="B"+(i+1);
    layout[well]={label:"STD"+(i+1),concentration:x};
    wells[well]=values[i];
  });
  return {layout,metadata,blocks:[channel(String(wavelength),wavelength,wells)],curves:[]};
}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} ≠ ${b}`);

test("Epoch phenol, flavonoid and peroxide standards match independent fits from the exported readings",()=>{
  for(const [method,nm,x,y,a,b,r2] of [
    ["total_phenol",765,[0,20,40,60,80,100],[.04,.086,.128,.174,.248,.285],.00251,.034666667,.991810757],
    ["total_flavonoid",415,[0,10,20,40,60,80,100],[.042,.064,.114,.16,.233,.315,.342],.003160410,.041467577,.989300636],
    ["h2o2",390,[.05,.1,.2,.4,.6,.8,1],[.056,.067,.083,.117,.151,.186,.219],.170754717,.048731806,.999837754]
  ]) {
    const sheet=standardPlate(nm,x,y,method==="h2o2"?{concentrationUnit:"mM"}:{});
    const {calibration,calibrationStatus}=buildPlatePreview(sheet,method);
    assert.equal(calibrationStatus.state,"ready");assert.equal(calibration.points.length,x.length);
    assert.equal(calibration.curve.source,"standards");assert.equal(calibration.curve.unitAssumed,method!=="h2o2");
    near(calibration.curve.a,a);near(calibration.curve.b,b);near(calibration.curve.r2,r2);
    if (method==="h2o2") {
      const blanked=[.006,.017,.033,.068,.102,.136,.169];
      sheet.blocks.push(channel("Blank 390",390,Object.fromEntries(blanked.map((v,i)=>["B"+(i+1),v])),1,"blanked"));
      const blank=buildPlatePreview(sheet,method,{signal:"blank"}).calibration;
      near(blank.curve.a,.170880503);near(blank.curve.b,-.001039084);near(blank.curve.r2,.999795822);
      assert.deepEqual(blank.curve.range,[.05,1]);
    }
  }
});

test("sinigrin and anthocyanin curves use normalized concentrations and the selected optical signal",()=>{
  const gsl=standardPlate(425,[0,.01,.02],[.1,.4,.7],{concentrationUnit:"mg/mL"});
  const {curve}=buildPlatePreview(gsl,"glucosinolate").calibration;
  assert.deepEqual(curve.range,[0,20]);near(curve.a,.03);assert.equal(curve.unitAssumed,false);
  const antho=standardPlate(530,[0,10,20],[.2,.45,.55],{concentrationUnit:"mg/L"});
  antho.blocks.push(channel("600",600,{A1:.08,B1:.1,B2:.25,B3:.25}));
  const cal=buildPlatePreview(antho,"anthocyanin").calibration;
  assert.equal(cal.curve.key,"530");assert.equal(cal.curve.subtractKey,"600");
  near(cal.curve.a,.01);near(cal.curve.b,.1);
  assert.deepEqual(cal.wells,["B1","B2","B3"]);
  gsl.metadata.concentrationUnit="mM";
  const rejected=buildPlatePreview(gsl,"glucosinolate");
  assert.equal(rejected.calibration,null); assert.match(rejected.calibrationStatus.reason.en,/unit/);
});

test("reported-only linear curves require an unambiguous signal and preserve missing bounds and fit quality",()=>{
  const sheet=standardPlate(415,[],[]);
  const reported={name:"StdCurve",formula:"Y=A*X+B",slope:.4,intercept:.02,unit:"mg/mL"};
  sheet.curves=[reported];
  const outcome=()=>buildPlatePreview(sheet,"total_flavonoid");
  assert.equal(outcome().calibration.curve.source,"reader");near(outcome().calibration.curve.a,.0004);
  assert.equal(outcome().calibration.curve.unitAssumed,false);
  assert.equal(outcome().calibration.curve.range,null);assert.equal(outcome().calibration.curve.r2,null);
  assert.deepEqual(outcome().calibration.points,[]);
  reported.signal="A765";assert.equal(outcome().calibration,null);delete reported.signal;
  sheet.blocks.push(channel("415[2]",415,{A1:.21},2));
  assert.equal(outcome().calibration,null);reported.signal="415";assert.equal(outcome().calibration,null);
  reported.signal="415[2]";assert.equal(outcome().calibration,null);
  assert.equal(buildPlatePreview(sheet,"total_flavonoid",{repeat:2}).calibration.curve.source,"reader");
  assert.equal(buildPlatePreview(sheet,"total_flavonoid",{repeat:"mean"}).calibration,null);
  reported.formula="Y=A*X^2+B";assert.equal(buildPlatePreview(sheet,"total_flavonoid",{repeat:2}).calibration,null);
});

test("standards absent from a raw/corrected GSL or anthocyanin plate do not produce a calibration",()=>{
  const gsl=standardPlate(425,[],[]);gsl.blocks.push(channel("Corrected [425]",425,{A1:.4},1,"corrected"));
  for(const signal of ["raw","corrected"]) {
    const p=buildPlatePreview(gsl,"glucosinolate",{signal});
    assert.equal(p.calibration,null);assert.equal(p.calibrationStatus.state,"unavailable");assert.ok(p.calibrationStatus.reason.ko);
  }
  const antho=standardPlate(530,[],[]);antho.blocks.push(channel("600",600,{A1:.08}));
  antho.curves=[{name:"StdCurve",formula:"Y=A*X+B",slope:.1,intercept:.2}];
  assert.equal(buildPlatePreview(antho,"anthocyanin").calibration,null);
  antho.curves[0].signal="A530 − A600";
  assert.equal(buildPlatePreview(antho,"anthocyanin").calibration.curve.subtractKey,"600");
});
