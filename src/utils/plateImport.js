import { getMeasurementFields } from "./analysisFields.js";
import { kineticFits, selectKineticSeries, sodControlSettings } from "./plateKinetics.js";

const text = (ko,en) => ({ko,en});
const roles = new Set(["sample","unassigned","standard","blank","control","light","dark","sample_blank"]);
const nominal = { "665.2":665, "652.4":652 };
const signalKinds = {raw:"raw",blank:"blanked",corrected:"corrected"};
const cmpWell = (a,b) => a.localeCompare(b,"en",{numeric:true});
const mean = values => values.reduce((sum,value) => sum+value,0)/values.length;
const short = value => Number(value.toPrecision(5)).toString();

function wellRole(label, type) {
  if (type==="dpph_scavenging" && /^SPLC\s*\d+$/i.test(label)) return "sample_blank";
  if (/^SPL\s*\d+$/i.test(label)) return "sample";
  if (/^(?:STD|Standard)\s*\d*$/i.test(label)) return "standard";
  if (/^(?:BLK|Blank)\s*\d*$/i.test(label)) return "blank";
  if (/^(?:CTL|CTRL|Control)\s*\d*$/i.test(label)) return "control";
  if (/^Light\s*\d*$/i.test(label)) return "light";
  if (/^Dark\s*\d*$/i.test(label)) return "dark";
  return "unassigned";
}

function endpointChannels(blocks, keys, kind) {
  return keys.map(key => {
    const available = blocks.filter(b=>b.kind===kind);
    const exact = available.filter(b=>b.wavelength===Number(key));
    const channels = (exact.length ? exact : available.filter(b=>nominal[key] !== undefined && b.wavelength===nominal[key])).sort((a,b)=>a.repeat-b.repeat);
    return {key,channels};
  });
}

const curveUnits = {
  total_phenol: "µg/mL", total_flavonoid: "µg/mL", glucosinolate: "µg/mL",
  anthocyanin: "µg/mL", h2o2: "mM"
};
const concentrationFactors = {
  "µg/mL": {"ug/ml":1, "mg/l":1, "mg/ml":1000, "g/l":1000, "ng/ml":.001, "ug/l":.001},
  mM: {mm:1, "mmol/l":1, um:.001, "umol/l":.001, nm:1e-6, "nmol/l":1e-6, m:1000, "mol/l":1000}
};

function resolveCurveUnit(sheet, expected, readerUnits) {
  const labels = [...new Set([...(sheet.metadata?.concentrationUnits || []), sheet.metadata?.concentrationUnit, ...readerUnits].filter(Boolean))];
  const factors = labels.map(label => concentrationFactors[expected][String(label).replace(/[µμ]/g,"u").replace(/\s/g,"").toLowerCase()]);
  if (factors.some(f => !Number.isFinite(f)) || new Set(factors).size > 1) return { error: labels.join(" / ") };
  return { factor:factors[0] ?? 1, assumed:labels.length === 0, input:labels.join(" / ") };
}

function regressStandards(points) {
  const mx = mean(points.map(p => p.x)), my = mean(points.map(p => p.y));
  const xx = points.reduce((sum,p) => sum + (p.x - mx) ** 2, 0);
  const yy = points.reduce((sum,p) => sum + (p.y - my) ** 2, 0);
  const xy = points.reduce((sum,p) => sum + (p.x - mx) * (p.y - my), 0);
  const a = xy / xx, b = my - a * mx, r2 = xy ** 2 / (xx * yy);
  if (!(a > 0) || ![a,b,r2].every(Number.isFinite)) return null;
  const xs = points.map(p => p.x);
  return {a,b,r2,range:[Math.min(...xs), Math.max(...xs)],source:"standards"};
}

const normalizedSignal = label => String(label ?? "").normalize("NFKC").toLowerCase().replace(/[−–]/g,"-").replace(/\babsorbance\b|\bnm\b|\s+/g,"").replace(/a(?=\d)/g,"");

// A generic single-channel reader curve can be mapped only if the plate has one
// optical signal. Multichannel/repeat exports need an explicit source label.
function readerSignalMatches(curve, sheet, chosen) {
  if (chosen.some(field => field.channels.length !== 1)) return false;
  const selection = chosen.map(field => field.channels[0]);
  const selected = selection.map(block => normalizedSignal(block.label)).join("-");
  const physical = (sheet.blocks || []).filter(block => ["raw","blanked","corrected","reference"].includes(block.kind));
  if (selection.some(block => physical.filter(b => b.label === block.label).length !== 1)) return false;
  const from = normalizedSignal(curve.signal || curve.name);
  const numbered = selection.map(block => block.kind === "raw" ? String(block.wavelength) + "[" + block.repeat + "]" : normalizedSignal(block.label)).join("-");
  if (from === numbered) return true;
  if (from === selected) return selection.every(block => block.kind !== "raw" ||
    physical.filter(b => b.kind === "raw" && b.wavelength === block.wavelength).length === 1);
  if (curve.signal || /\d{3}|blank|corrected|delta/.test(from)) return false;
  return chosen.length === 1 && physical.length === 1 && (sheet.metadata?.wavelengths?.length ?? 0) <= 1;
}

function standardCalibration(type, rows, sheet, chosen, compatible) {
  const unavailable = (ko,en) => ({ calibration:null, calibrationStatus:{state:"unavailable",reason:text(ko,en)} });
  if (!compatible) return unavailable("선택한 분석의 측정 파장이 없습니다.","The sheet does not contain the required signal.");
  const unit = curveUnits[type], key = chosen[0].key;
  const subtractKey = type === "anthocyanin" ? "600" : null;
  const standards = rows.filter(row => row.valid && row.role === "standard" && Number.isFinite(sheet.layout?.[row.well]?.concentration));
  const measured = standards.map(row => ({
    well:row.well, x:sheet.layout[row.well].concentration,
    y:row.values[key] - (subtractKey ? row.values[subtractKey] : 0)
  })).filter(point => Number.isFinite(point.y) && point.x >= 0);
  const enough = new Set(measured.map(p => p.x)).size >= 3;
  let reader = null;
  if (!enough) {
    const curves = sheet.curves || [];
    if (!curves.length) return unavailable("농도가 다른 유효한 표준점 3개 또는 장비의 선형 검량식이 필요합니다.","Provide three distinct valid standard concentrations or a linear curve from the reader.");
    const matches = curves.filter(c => readerSignalMatches(c, sheet, chosen));
    if (matches.length !== 1) return unavailable("검량식의 파장·반복 판독·보정 신호를 선택한 신호와 일치시킬 수 없습니다.","The reader curve cannot be uniquely matched to the selected wavelength, repeat and correction.");
    reader = matches[0];
    if (!/^y=a\*x\+b$/i.test(String(reader.formula).replace(/\s/g,"")) || !(reader.slope > 0) ||
        !Number.isFinite(reader.slope) || !Number.isFinite(reader.intercept) ||
        (reader.r2 != null && (!Number.isFinite(reader.r2) || reader.r2 < 0 || reader.r2 > 1))) {
      return unavailable("장비의 양의 기울기와 유효한 선형 검량식을 확인하세요.","The reader must supply a valid linear equation with a positive slope.");
    }
  }
  const declared = reader ? [reader] : (sheet.curves || []).filter(c => c.unit && readerSignalMatches(c,sheet,chosen));
  const scale = resolveCurveUnit(sheet, unit, declared.map(c => c.unit).filter(Boolean));
  if (scale.error) return unavailable("표준 농도 단위를 확인하세요 (" + scale.error + "). 이 분석에는 " + unit + "가 필요합니다.",
    "Check the calibration unit (" + scale.error + "). This assay requires " + unit + ".");
  const points = measured.map(p => ({...p,x:p.x * scale.factor}));
  const fit = enough ? regressStandards(points) : {a:reader.slope / scale.factor,b:reader.intercept,r2:reader.r2 ?? null,range:null,source:"reader"};
  if (!fit) return unavailable("표준점에서 양의 선형 기울기를 구할 수 없습니다.","The measured standards do not yield a positive linear fit.");
  const curve = {...fit,key,...(subtractKey ? {subtractKey} : {}),unit,unitAssumed:scale.assumed};
  let ko = enough ? "선택 신호로 표준 웰 " + points.length + "개를 회귀했습니다." : "선택 신호에 해당하는 장비 선형 검량식을 사용합니다. 검증 범위는 파일에 없습니다.";
  let en = enough ? "Refit " + points.length + " standard wells using the selected signal." : "Using the reader’s linear fit for the selected signal. Its validated range is unavailable.";
  if (fit.range) {
    const bounds = fit.range.join("–") + " " + unit + " · R² " + short(fit.r2);
    ko += " " + bounds + "."; en += " " + bounds + ".";
  }
  if (scale.assumed) {
    ko += " 파일에 농도 단위가 없어 " + unit + "로 가정했습니다. 실험 기록에서 확인하세요.";
    en += " The workbook omits the concentration unit. Confirm the assumed " + unit + " in your records.";
  } else if (scale.factor !== 1) {
    ko += " " + scale.input + " 농도를 " + unit + "로 환산했습니다.";
    en += " Converted " + scale.input + " to " + unit + ".";
  }
  const {a,b} = curve;
  return {calibration:{curve,points:enough ? points : [],wells:enough ? points.map(p=>p.well) : [],
    overrides:type === "h2o2" ? {h2o2:{a,b}} : {std_a:a,std_b:b},
    label:["이 플레이트의 검량선 사용","Use this plate’s standard curve"],basis:[ko,en]},
    calibrationStatus:{state:"ready",reason:text(ko,en)}};
}

function controlCalibration(type,rows) {
  const byRole = role=>rows.filter(r=>r.role===role);
  if (type==="sod") {
    const lightWells=byRole("light").map(r=>r.well),darkWells=byRole("dark").map(r=>r.well);
    const values=Object.fromEntries(rows.map(r=>[r.well,r.values["560"]]));
    const fit=sodControlSettings(values,{lightWells,darkWells});
    if (!fit.params) return null;
    const p=fit.params;
    const summary=`Light (${lightWells.length}) ${short(p.light_control_abs)} AU · Dark (${darkWells.length}) ${short(p.dark_blank_abs)} AU`;
    return {overrides:{sod:p},label:["플레이트의 광·암 대조 평균 사용","Use plate light and dark control means"],basis:[summary,summary],wells:[...lightWells,...darkWells]};
  }
  const descriptions={
    dpph_scavenging:["control","517","DPPH 대조 흡광도","DPPH control absorbance"],
    cat:["control","sample_slope","CAT 대조 기울기","CAT control slope"],
    pod:["blank","sample_slope","POD 블랭크 기울기","POD blank slope"]
  };
  if (!Object.hasOwn(descriptions,type)) return null;
  const [role,key,ko,en]=descriptions[type],chosen=byRole(role);
  if (!chosen.length || chosen.some(r=>!r.valid)) return null;
  const value=mean(chosen.map(r=>r.values[key]));
  if (type==="dpph_scavenging" && !(value>0)) return null;
  const overrides=type==="cat"?{cat:{h2o2_control_slope:value}}:type==="pod"?{pod:{blank_slope:value}}:{dpph_control:value};
  const result=short(value)+(key==="sample_slope"?" ΔA/min":" AU");
  return {overrides,label:[ko+" 사용","Use "+en],basis:[chosen.length+"개 웰 평균 · "+result,chosen.length+" wells, mean · "+result],wells:chosen.map(r=>r.well)};
}

export function buildPlatePreview(sheet, analysisType, options={}) {
  const layout=sheet?.layout || {}, blocks=sheet?.blocks || [];
  const kinetic=analysisType==="cat" || analysisType==="pod";
  const keys=getMeasurementFields(analysisType).filter(f=>!f.optional).map(f=>f.key);
  const rawSeries=kinetic ? selectKineticSeries(sheet,analysisType) : [];
  const series=rawSeries.length===1 ? rawSeries[0] : null;
  const signals=kinetic ? ["raw"] : Object.entries(signalKinds).filter(([,kind])=>
    keys.length && endpointChannels(blocks,keys,kind).every(f=>f.channels.length)).map(([signal])=>signal);
  const signal=options.signal || "raw";
  const repeat=options.repeat ?? 1;
  const channels=kinetic ? [] : endpointChannels(blocks,keys,signalKinds[signal]);
  const repeats=channels.length ? Math.min(...channels.map(f=>f.channels.length)) : 1;
  const compatible=kinetic ? Boolean(series) : signals.includes(signal) && !(sheet?.kinetics?.length);
  const chosen=channels.map(f=>({...f,channels:repeat==="mean"?f.channels:f.channels.filter(b=>b.repeat===Number(repeat))}));
  const fields=kinetic ? [{key:"sample_slope",source:series ? series.wavelength+" nm · ΔA/min" : "ΔA/min"}] : chosen.map(f=>({
    key:f.key,source:f.channels.map(b=>b.label).join(" + ")+(f.channels.length && f.channels[0].wavelength!==Number(f.key)?" → "+f.key+" nm":"")
  }));
  const needsWavelengthConsent=chosen.some(f=>f.channels.length && f.channels[0].wavelength!==Number(f.key));
  const notices=[];
  if (!compatible) notices.push(text("이 분석에 필요한 파장 또는 시간별 측정값이 없습니다. 파일과 분석 항목을 확인하세요.","This assay requires other wavelengths or a kinetic time series. Check the file and the chosen assay."));
  if (needsWavelengthConsent) notices.push(text("파일의 665·652 nm를 665.2·652.4 nm 계수에 대응하면 근사 계산입니다. 실제 판독 파장은 가져온 시료에 기록됩니다.","Mapping 665/652 nm to coefficients for 665.2/652.4 nm is an approximation. The measured wavelengths stay in each imported record."));
  if (signal==="corrected") notices.push(text("장비가 광경로를 보정한 신호입니다. 검량선도 같은 보정 기준인지 확인하세요.","The reader normalized these signals for path length. Use a calibration with the same normalization."));
  const fits=series?kineticFits(series,options):{};
  const measured=kinetic ? Object.keys(fits) : chosen.flatMap(f=>f.channels.flatMap(b=>[...Object.keys(b.values),...Object.keys(b.flags||{})]));
  const wells=[...new Set([...Object.keys(layout).filter(w=>layout[w]?.label),...measured])].sort(cmpWell);
  const rows=wells.map(well=>{
    const label=layout[well]?.label || "",assigned=options.roles?.[well];
    const role=roles.has(assigned)?assigned:wellRole(label,analysisType);
    const values={},source=[],fit=fits[well];
    let issue=null;
    if (kinetic) {
      if (fit && Number.isFinite(fit.slope)) values.sample_slope=fit.slope;
      else issue=text("선택한 시간 구간의 기울기를 계산할 수 없습니다.","No signed slope for the selected time window.");
    } else for (const {key,channels:list} of chosen) {
      if (!list.length || list.some(b=>!Number.isFinite(b.values[well]))) {
        const flagged=list.map(b=>b.flags?.[well]).filter(Boolean).join(", ");
        issue=text(key+" nm 판독 누락 또는 장비 표시 "+flagged,key+" nm missing or flagged "+flagged);
        continue;
      }
      values[key]=mean(list.map(b=>b.values[well]));
      for(const b of list) source.push({field:key,channel:b.label,wavelength:b.wavelength,cell:b.cells?.[well],reading:b.values[well]});
    }
    return {well,label,role,values,source,fit,issue,valid:compatible&&!issue};
  });
  let sampleBlankPairs=0;
  if (analysisType==="dpph_scavenging") {
    const pairs=new Map();
    for (const blank of rows.filter(r=>r.role==="sample_blank")) {
      const number=/^SPLC\s*(\d+)$/i.exec(blank.label)?.[1];
      if(number) pairs.set(number,[...(pairs.get(number)||[]),blank]);
    }
    for (const row of rows.filter(r=>r.role==="sample")) {
      const number=/^SPL\s*(\d+)$/i.exec(row.label)?.[1];
      const matches=pairs.get(number)||[];
      const blank=matches.length===1 && matches[0].valid ? matches[0]:null;
      if (blank) sampleBlankPairs++;
      if (!options.pairSampleBlanks) continue;
      if (blank) {
        row.values.sample_blank=blank.values["517"];
        row.source.push(...blank.source.map(ch=>({...ch,field:"sample_blank",well:blank.well})));
      } else {
        row.valid=false;
        row.issue=text("같은 번호의 유효한 시료 블랭크가 하나 필요합니다.","Exactly one valid sample blank with this sample number is required.");
      }
    }
    if(options.pairSampleBlanks) fields.push({key:"sample_blank",source:"SPL ↔ SPLC · 517 nm"});
  }
  const timeRange=series?.times.length?[Math.min(...series.times),Math.max(...series.times)]:null;
  const {calibration,calibrationStatus} = Object.hasOwn(curveUnits,analysisType)
    ? standardCalibration(analysisType,rows,sheet,chosen,compatible)
    : {calibration:compatible ? controlCalibration(analysisType,rows) : null};
  const counts={};for(const r of rows)counts[r.role]=(counts[r.role]||0)+1;
  return {analysisType,fields,rows,counts,signals,repeats,compatible,needsWavelengthConsent,calibration,calibrationStatus,reportedCurve:sheet?.curves?.[0]||null,sampleBlankPairs,notices,kinetic,timeRange,signal,repeat,plate:sheet?.metadata?.plate};
}

export function buildPlateSamples(preview, config) {
  if (!preview.compatible) return [];
  const {selectedWells,groups={},names={},defaultGroup,fileName,sheetName,useCalibration}=config;
  const calibration=useCalibration ? preview.calibration : null;
  return preview.rows.filter(row=>row.valid && ["sample","unassigned"].includes(row.role) && selectedWells.has(row.well)).map(row=>{
    const provenance={file:fileName,sheet:sheetName,plate:preview.plate,well:row.well,label:row.label,signal:preview.signal,channels:row.source};
    if(row.fit) provenance.fit={...row.fit,wavelength:preview.analysisType==="cat"?240:470,unit:"ΔA/min"};
    if(calibration) {
      provenance.overrides=calibration.overrides;
      provenance.controlWells=calibration.wells;
      if(calibration.curve) provenance.curve=calibration.curve;
    }
    return {analysis_type:preview.analysisType,treatment_name:String(groups[row.well]||defaultGroup||"—").trim(),
      sample_name:String(names[row.well]||row.label||row.well).trim(),absorbance_values:{...row.values},plate_import:provenance};
  });
}

// Only offer workspaces whose input fields are present in the selected sheet.
export function identifyPlateAssays(sheet) {
  if (sheet?.kinetics?.length) return ["cat","pod"].filter(type=>selectKineticSeries(sheet,type).length===1);
  const candidates=["chlorophyll_a_b","total_phenol","total_flavonoid","anthocyanin","glucosinolate","dpph_scavenging","sod","h2o2","mda"];
  return candidates.filter(type=>{
    const keys=getMeasurementFields(type).filter(field=>!field.optional).map(field=>field.key);
    return Object.values(signalKinds).some(kind=>endpointChannels(sheet?.blocks||[],keys,kind).every(field=>field.channels.length));
  });
}
