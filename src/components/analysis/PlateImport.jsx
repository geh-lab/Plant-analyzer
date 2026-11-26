import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Download, FileSpreadsheet } from 'lucide-react';
import StudioSelect from '@/components/StudioSelect';
import { getProtocols } from '@/data/absorbanceProtocols';
import { buildPlatePreview, buildPlateSamples, identifyPlateAssays } from '@/utils/plateImport';
import { analyzeSample, absorbanceMetrics, resultIssue } from '@/utils/resultCalculations';
import { displayNumber as fmt, downloadCsv } from '@/utils/resultData';

const roleNames = {
  sample: ['시료', 'Sample'], unassigned: ['미지정', 'Unassigned'], standard: ['표준액', 'Standard'],
  blank: ['블랭크', 'Blank'], control: ['대조구', 'Control'], light: ['광조건 대조구', 'Light control'],
  dark: ['암조건 블랭크', 'Dark blank'], sample_blank: ['시료 블랭크', 'Sample blank']
};
const signalNames = {
  raw: ['원 흡광도', 'Raw absorbance'], blank: ['블랭크 보정 흡광도', 'Blank-corrected absorbance'],
  corrected: ['광경로 보정 흡광도', 'Pathlength-corrected absorbance']
};
const textFor = (value, lang) => Array.isArray(value) ? value[Number(lang === 'en')] : value?.[lang] ?? value ?? '';
const canAdd = row => row.valid && (row.role === 'sample' || row.role === 'unassigned');
const PAGE_SIZE = 12;

function resolveWells(expression, wells) {
  const source = expression.trim().toUpperCase();
  if (!source) return null;
  const result = new Set();
  for (const token of source.split(/[\s,;]+/).filter(Boolean)) {
    const range = /^([A-Z])(\d+)(?:[:-]([A-Z])(\d+))?$/.exec(token);
    if (!range) return null;
    const [,r1,c1,r2=r1,c2=c1] = range;
    if (!wells.includes(r1+Number(c1)) || !wells.includes(r2+Number(c2))) return null;
    const [firstRow,lastRow] = [r1,r2].sort();
    const low = Math.min(c1,c2), high = Math.max(c1,c2);
    for (const well of wells) {
      const [,r,c] = /^([A-Z])(\d+)$/.exec(well) || [];
      if (r >= firstRow && r <= lastRow && Number(c) >= low && Number(c) <= high) result.add(well);
    }
  }
  return result.size ? [...result] : null;
}

function Selector({ label, value, options, change }) {
  return <label className="plate-field"><span>{label}</span><StudioSelect aria-label={label} value={String(value)} onValueChange={change} options={options}/></label>;
}

function SheetPreview({ sheet, fileName, analysisType, lang, params = {}, onSamplesUploaded, onCalibrationPreview, onCancel, switchWithFile }) {
  const en = lang === 'en';
  const t = (ko, eng) => en ? eng : ko;
  const local = value => textFor(value, lang);
  const roleLabel = key => local(roleNames[key] || key);
  const [settings,setSettings] = useState({signal:'raw',repeat:1});
  const [roles,setRoles] = useState({});
  const [names,setNames] = useState({});
  const [groups,setGroups] = useState({});
  const [choices,setChoices] = useState({});
  const [defaultGroup,setDefaultGroup] = useState(t('미지정','Unassigned'));
  const [useCalibration,setUseCalibration] = useState(false);
  const [useFileCurve,setUseFileCurve] = useState(true);
  const [wavelengthConsent,setWavelengthConsent] = useState(false);
  const [scope,setScope] = useState('all');
  const [editing,setEditing] = useState(false);
  const [query,setQuery] = useState('');
  const [page,setPage] = useState(0);
  const [showAll,setShowAll] = useState(false);
  const [range,setRange] = useState('');
  const [bulkGroup,setBulkGroup] = useState('');
  const [bulkRole,setBulkRole] = useState('');
  const [rangeMessage,setRangeMessage] = useState(null);
  const [actionMessage,setActionMessage] = useState(null);
  const committing = useRef(false);

  const preview = useMemo(() => buildPlatePreview(sheet,analysisType,{...settings,roles}),[sheet,analysisType,settings,roles]);
  const curve = preview.calibration?.curve;
  const fileCurveSelected = Boolean(curve && useFileCurve);
  const staged = useMemo(() => {
    if (!preview.calibrationStatus && !preview.calibration?.curve) return null;
    return { fileName, sheetName:sheet.name, signal:preview.signal, repeat:preview.repeat,
      applied:Boolean(preview.calibration?.curve && useFileCurve), calibration:preview.calibration,
      status:preview.calibrationStatus };
  }, [fileName,sheet.name,preview,useFileCurve]);
  useLayoutEffect(() => { onCalibrationPreview?.(staged); }, [staged,onCalibrationPreview]);
  useLayoutEffect(() => () => onCalibrationPreview?.(null), [onCalibrationPreview]);
  const rows = preview.rows || [];
  const selected = new Set(rows.filter(row => canAdd(row) && (choices[row.well] ?? row.role === 'sample')).map(row => row.well));
  const eligible = useMemo(() => new Set(preview.rows.filter(canAdd).map(row => row.well)),[preview]);
  const fallbackGroup = defaultGroup.trim() || t('미지정','Unassigned');
  const cleanGroups = Object.fromEntries(Object.entries(groups).map(([well,group])=>[well,group.trim()]));
  const groupFor = well => cleanGroups[well] || fallbackGroup;
  const opts = {names,groups:cleanGroups,defaultGroup:fallbackGroup,fileName,sheetName:sheet.name,useCalibration:curve ? fileCurveSelected : !!preview.calibration && useCalibration};
  const records = buildPlateSamples(preview,{...opts,selectedWells:eligible});
  const computed = new Map(records.map(r => [r.plate_import.well,analyzeSample(r,params)]));
  const outsideRange = [...selected].filter(well => computed.get(well)?.issue === 'outside_plate_curve').length;
  const hasStandards = rows.some(r=>r.role==='standard' && Number.isFinite(sheet.layout[r.well]?.concentration));
  const firstResult = computed.values().next().value;
  const metrics = firstResult ? absorbanceMetrics(analysisType,firstResult.unit,lang) : [];
  const fields = preview.fields || [];
  const matchingAssays = useMemo(() => preview.compatible ? [] : identifyPlateAssays(sheet).filter(type => type !== analysisType),[sheet,preview.compatible,analysisType]);
  const sizes = preview.timeRange || [];
  const startSeconds = settings.startSeconds ?? sizes[0] ?? '';
  const endSeconds = settings.endSeconds ?? sizes[1] ?? '';
  const invalidWindow = preview.kinetic && sizes.length===2 && (startSeconds === '' || endSeconds === '' || Number(startSeconds) < sizes[0] ||
    Number(endSeconds) > sizes[1] || Number(startSeconds) >= Number(endSeconds));
  const invalidNames = rows.some(row => selected.has(row.well) && names[row.well] !== undefined && !names[row.well].trim());
  const compatible = preview.compatible !== false && fields.length > 0;
  const mayCommit = compatible && selected.size > 0 && !invalidWindow && !invalidNames && (!preview.needsWavelengthConsent || wavelengthConsent);
  const term = query.trim().toLowerCase();
  const visible = rows.filter(r => (scope === 'all' || (scope === 'included' ? selected.has(r.well) : !selected.has(r.well))) &&
    (!term || [r.well,r.label,names[r.well],groupFor(r.well),roleLabel(r.role)].some(v => String(v ?? '').toLowerCase().includes(term))));
  const lastPage = Math.max(0,Math.ceil(visible.length/PAGE_SIZE)-1);
  const shownPage = Math.min(lastPage,page);
  const shown = showAll ? visible : visible.slice(shownPage*PAGE_SIZE,(shownPage+1)*PAGE_SIZE);

  function updateSettings(key,value) {
    setSettings(prev => ({...prev,...(key==='signal'?{repeat:1}:{}),[key]:value}));
    setUseCalibration(false);
    setActionMessage(null);
  }
  function updateRole(well,value) {
    setRoles(prev => ({...prev,[well]:value}));
    setUseCalibration(false);
    setChoices(prev => ({...prev,[well]: value === 'sample'}));
    setActionMessage(null);
  }
  function applyRange() {
    const keys=resolveWells(range,rows.map(r=>r.well));
    if (!keys || (!bulkGroup.trim() && !bulkRole)) {
      setRangeMessage({error:true,text:t('표에 있는 웰 범위와 적용할 처리구 또는 역할을 입력하세요.','Enter a range from this plate and a treatment or role to apply.')});
      return;
    }
    const values=value=>Object.fromEntries(keys.map(key=>[key,value]));
    if (bulkGroup.trim()) setGroups(prev=>({...prev,...values(bulkGroup.trim())}));
    if (bulkRole) {
      setRoles(prev=>({...prev,...values(bulkRole)}));
      setChoices(prev=>({...prev,...values(bulkRole==='sample')}));
      setUseCalibration(false);
    }
    setRangeMessage({text:t(`웰 ${keys.length}개에 적용했습니다.`, `Updated ${keys.length} wells.`)});
  }
  function selectVisible(include) {
    setChoices(prev=>({...prev,...Object.fromEntries(visible.filter(canAdd).map(r=>[r.well,include]))}));
  }
  function add() {
    if (!mayCommit || committing.current) return;
    committing.current=true;
    try {
      const samples=buildPlateSamples(preview,{...opts,selectedWells:selected});
      if (!samples.length) throw new Error();
      onSamplesUploaded(samples, fileCurveSelected ? staged : null);
    } catch {
      setActionMessage({error:true,text:t('시료를 추가하지 못했습니다. 웰 선택과 계산 조건을 확인하세요.','Could not add samples. Check your well selection and calculation settings.')});
    } finally { committing.current=false; }
  }
  function exportPreview() {
    try {
      downloadCsv(fileName.replace(/\.xlsx$/i,'')+'-'+sheet.name.replace(/[/\\:*?"<>|]/g,'-')+'-preview',[
        ['Sheet','Well','Layout label','Role','Include','Treatment','Sample',...fields.map(f=>f.source||f.key),...metrics.map(([,label,unit])=>label+' ('+unit+')'),'Note'],
        ...rows.map(r=>{
          const result=computed.get(r.well);
          return [sheet.name,r.well,r.label,roleLabel(r.role),selected.has(r.well)?1:0,canAdd(r)?groupFor(r.well):'',canAdd(r)?names[r.well]??(r.label||r.well):'',
            ...fields.map(f=>r.values?.[f.key]),...metrics.map(([key])=>result?.[key]),local(r.issue)|| (result?.issue?resultIssue(result.issue,lang):'')];
        })
      ]);
      setActionMessage({text:t('웰 미리보기 CSV를 내보냈습니다.','Exported the well preview CSV.')});
    } catch {setActionMessage({error:true,text:t('미리보기 CSV를 저장하지 못했습니다.','Could not save the preview CSV.')});}
  }

  const roleOptions=Object.entries(roleNames).filter(([key])=>key!=='sample_blank'||analysisType==='dpph_scavenging').map(([value,label])=>({value,label:local(label)}));
  const readerCurveSummary = preview.reportedCurve && <p>{[preview.reportedCurve.name,preview.reportedCurve.formula].filter(Boolean).join(' · ')}{" · "}
    {t('장비 보고 기울기','Reader slope')} {fmt(preview.reportedCurve.slope)} · {t('절편','Intercept')} {fmt(preview.reportedCurve.intercept)} · R² {fmt(preview.reportedCurve.r2)}</p>;
  return <>
    {(preview.signals?.length > 1 || (preview.signals?.length === 1 && !preview.signals.includes(settings.signal)) || preview.repeats > 1 || preview.kinetic) && <details className="plate-details plate-read-settings">
      <summary>{t('판독 설정', 'Reading settings')} · {local(signalNames[settings.signal])}{preview.repeats > 1 && (' · ' + (settings.repeat === 'mean' ? t('평균','Mean') : t(`${settings.repeat}회차`,`Read ${settings.repeat}`)))}</summary>
      <div className="plate-options">
      {(preview.signals?.length>1 || (preview.signals?.length===1 && !preview.signals.includes(settings.signal))) && <Selector label={t('흡광도 채널','Absorbance channel')} value={settings.signal} change={v=>updateSettings('signal',v)}
        options={preview.signals.map(value=>({value,label:local(signalNames[value]||value)}))}/>}
      {preview.repeats>1 && <Selector label={t('반복 판독','Repeated reading')} value={settings.repeat} change={v=>updateSettings('repeat',v==='mean'?v:Number(v))}
        options={[...Array.from({length:preview.repeats},(_,i)=>({value:String(i+1),label:t(`${i+1}회차`,`Read ${i+1}`)})),{value:'mean',label:t('반복 판독 평균','Mean of repeated reads')}]}/>}
      {preview.kinetic && sizes.length===2 && <>
        <label className="plate-field"><span>{t('기울기 시작 (초)','Slope start (s)')}</span><input type="number" step="any" min={sizes[0]} max={sizes[1]} value={startSeconds} onChange={e=>updateSettings('startSeconds',e.target.value===''?'':Number(e.target.value))}/></label>
        <label className="plate-field"><span>{t('기울기 종료 (초)','Slope end (s)')}</span><input type="number" step="any" min={sizes[0]} max={sizes[1]} value={endSeconds} onChange={e=>updateSettings('endSeconds',e.target.value===''?'':Number(e.target.value))}/></label>
      </>}
      </div>
    </details>}
    {preview.notices?.map((note,i)=><p className="plate-notice" key={i}>{local(note)}</p>)}
    {invalidWindow && <p className="plate-error" role="alert">{t('측정 시간 범위 안에서 시작보다 늦은 종료 시점을 입력하세요.','Choose an end after the start, within the measured time range.')}</p>}
    {preview.needsWavelengthConsent && <label className="plate-choice plate-notice"><input type="checkbox" checked={wavelengthConsent} onChange={e=>setWavelengthConsent(e.target.checked)}/>
      <span>{t('장비의 652·665 nm와 계산식의 652.4·665.2 nm 차이를 확인했고, 이 대응을 적용합니다.','I have checked the reader’s 652/665 nm against the equation’s 652.4/665.2 nm and accept this mapping.')}</span></label>}
    {preview.sampleBlankPairs>0 && <label className="plate-choice plate-notice"><input type="checkbox" checked={!!settings.pairSampleBlanks} onChange={e=>updateSettings('pairSampleBlanks',e.target.checked)}/>
      <span>{t(`같은 번호의 SPLC 웰을 시료 블랭크로 사용 (${preview.sampleBlankPairs}쌍)`,`Use the matching SPLC well as the sample blank (${preview.sampleBlankPairs} pairs)`)}</span></label>}
    {preview.calibration && <div className="plate-calibration"><label className="plate-choice"><input type="checkbox" checked={curve ? useFileCurve : useCalibration} onChange={e=>curve ? setUseFileCurve(e.target.checked) : setUseCalibration(e.target.checked)}/><span><strong>{local(preview.calibration.label)}</strong></span></label>
      {curve && <p>A = {fmt(curve.a)} × C {curve.b < 0 ? '−' : '+'} {fmt(Math.abs(curve.b))} · C ({curve.unit}){curve.unitAssumed ? t(' · 표준액 단위 확인 필요',' · Verify standard units') : ''}</p>}
      {curve ? <details className="plate-details"><summary>{t('검량선 근거와 표준 웰','Curve source and standard wells')}</summary>
        <p>{local(preview.calibration.basis)}</p>
        {preview.calibration.wells?.length>0&&<p>{t('표준 웰','Standard wells')} · {preview.calibration.wells.join(', ')}</p>}
        {readerCurveSummary}
        <a className="au-jump" href="#assay-calculation-params">{t('계산 조건에서 계수 보기','View coefficients in calculation parameters')}</a>
      </details> : <><p>{local(preview.calibration.basis)}</p>
        {preview.calibration.wells?.length>0&&<p>{t('기준 웰','Reference wells')} · {preview.calibration.wells.join(', ')}</p>}
        <p>{t('선택한 대조값은 이 파일에서 추가할 시료에 저장합니다.','Selected control values are saved with samples from this file.')}</p></>}
    </div>}
    {preview.calibrationStatus?.state==='unavailable' && !curve && <div className="plate-calibration"><p role="status"><strong>{t('파일 검량선 없음','File curve unavailable')}</strong>{" · "}{local(preview.calibrationStatus.reason)}</p>
      <a className="au-jump" href="#assay-calculation-params">{t('계산 조건에서 검량선 입력','Enter calibration in calculation parameters')}</a>
      {readerCurveSummary && <details className="plate-details"><summary>{t('장비가 보고한 검량선','Calibration reported by the reader')}</summary>{readerCurveSummary}</details>}
    </div>}
    {!preview.calibrationStatus && !curve && readerCurveSummary && <details className="plate-details"><summary>{t('장비가 보고한 검량선','Calibration reported by the reader')}</summary>{readerCurveSummary}</details>}
    {matchingAssays.length>0 && switchWithFile && <div className="plate-assay-switch">
      {matchingAssays.map(type=>{
        const title=getProtocols(lang)[type]?.title || type;
        return <button type="button" className="plate-btn" key={type} onClick={()=>switchWithFile(type)}>{t(`이 파일로 ${title} 열기`,`Open ${title} with this file`)} <ArrowRight size={15}/></button>;
      })}
    </div>}
    {invalidNames&&<p className="plate-error" role="alert">{t('선택한 웰의 시료명을 입력하세요.','Enter sample names for the included wells.')}</p>}
    {!compatible && !preview.notices?.length && <p className="plate-error" role="status">{t('이 시트에는 현재 분석에 필요한 측정 파장 또는 시간별 원자료가 없습니다. 시트나 분석 항목을 확인하세요.','This sheet is missing wavelengths or time-series readings required for this assay. Check the sheet and assay selection.')}</p>}
    <div className="plate-quick-import">
      <div>
        <h4>{t('가져올 시료','Samples to import')} <strong>{selected.size}</strong></h4>
        <p className="plate-note">{compatible && !selected.size && rows.length
          ? t('아래 웰 목록에서 가져올 시료를 선택하세요.', 'Select the samples to import in the well list below.')
          : t(`전체 ${rows.length}개 웰 중 선택`, `Selected from ${rows.length} wells`)}</p>
        {outsideRange > 0 && <p className="plate-range-note">{t(
          `${outsideRange}개는 표준 농도 범위 밖입니다. 원자료만 가져오며 정량값은 비워 둡니다.`,
          `${outsideRange} outside the standard range. Raw readings will be imported with no quantitative result.`
        )}</p>}
      </div>
      <div className="plate-actions">
        <button type="button" className="plate-btn plate-primary" disabled={!mayCommit} onClick={add}><Check size={16}/>{t('시료 가져오기','Import samples')}</button>
        <button type="button" className="plate-btn plate-cancel" onClick={onCancel}>{t('취소','Cancel')}</button>
      </div>
    </div>
    {actionMessage&&<p className={actionMessage.error?'plate-error':'plate-note'} role={actionMessage.error?'alert':'status'}>{actionMessage.text}</p>}
    {rows.length>0 && <details className="plate-well-details">
      <summary>{t('웰 목록 및 처리구 편집','Review wells and edit treatments')}<ChevronDown size={17} aria-hidden="true"/></summary>
      <div className="plate-editor-body">
      <div className="plate-role-counts" aria-label={t('장비 배치 역할별 웰 수','Wells by layout role')}>
        {Object.entries(preview.counts || {}).map(([role,n])=><span key={role}>{roleLabel(role)} <strong>{n}</strong></span>)}
      </div>
      <label className="plate-field plate-default-group"><span>{t('기본 처리구','Default treatment')}</span><input value={defaultGroup} placeholder={t('미지정','Unassigned')} onChange={e=>setDefaultGroup(e.target.value)}/></label>
      <details className="plate-details"><summary>{t('웰 범위에 처리구·역할 지정','Assign a treatment or role to a well range')}</summary>
        <div className="plate-options">
          <label className="plate-field"><span>{t('웰 또는 범위','Wells or range')}</span><input value={range} onChange={e=>setRange(e.target.value)} placeholder="A1:A10, C1, D4"/></label>
          <label className="plate-field"><span>{t('적용할 처리구','Treatment to assign')}</span><input value={bulkGroup} onChange={e=>setBulkGroup(e.target.value)}/></label>
          <Selector label={t('적용할 역할','Role to assign')} value={bulkRole} change={setBulkRole} options={[{value:'',label:t('현재 역할 유지','Keep current role')},...roleOptions]}/>
          <button type="button" className="plate-btn" onClick={applyRange}>{t('범위에 적용','Apply to range')}</button>
        </div>
        {rangeMessage&&<p className={rangeMessage.error?'plate-error':'plate-note'} role={rangeMessage.error?'alert':'status'}>{rangeMessage.text}</p>}
      </details>
      <div className="plate-filters">
        <label className="plate-field"><span>{t('웰·시료 검색','Find a well or sample')}</span><input type="search" value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}} placeholder="A1, SPL1…"/></label>
        <Selector label={t('표시할 웰','Wells shown')} value={scope} change={v=>{setScope(v);setPage(0);}}
          options={['all','included','excluded'].map((value,i)=>({value,label:[t('전체 웰','All wells'),t('선택한 웰','Included wells'),t('제외한 웰','Excluded wells')][i]}))}/>
      </div>
      <div className="plate-mode" role="group" aria-label={t('미리보기 표', 'Preview table')}>
        <button type="button" aria-pressed={!editing} onClick={()=>setEditing(false)}>{t('측정값 및 계산 결과','Readings and results')}</button>
        <button type="button" aria-pressed={editing} onClick={()=>setEditing(true)}>{t('역할·시료명·처리구 편집','Edit roles, samples and treatments')}</button>
      </div>
      <div className="plate-bulk"><button type="button" onClick={()=>selectVisible(true)}>{t('검색 결과 선택','Select matching samples')}</button>
        <button type="button" onClick={()=>selectVisible(false)}>{t('검색 결과 선택 해제','Clear matching samples')}</button></div>
      <div className="plate-overflow" role="region" tabIndex={0} aria-label={t('웰별 측정값과 시료 미리보기','Well readings and sample preview')}>
        <table className="plate-grid"><thead><tr>
          {[t('포함','Include'),t('웰','Well'),...(editing
            ? [t('장비 표기','Layout label'),t('역할','Role'),t('시료명','Sample name'),t('처리구','Treatment')]
            : [t('시료 / 처리구','Sample / treatment'),...(hasStandards?[t('표준 농도 (장비 표기)','Standard (as recorded)')]:[]),
              ...fields.map(f=>f.key==='sample_slope'?'ΔA/min':f.key==='sample_blank'?t('시료 블랭크 A517','Sample blank A517'):f.key+' nm'),
              ...(preview.kinetic?['n','R²']:[]),...metrics.map(([,label,unit])=>label+' ('+unit+')'),t('확인 사항','Review')])].map((h,i)=><th scope="col" key={i}>{h}</th>)}
        </tr></thead><tbody>{shown.map(r=>{
          const result=computed.get(r.well), can=canAdd(r);
          const review=local(r.issue) || (result?.issue?resultIssue(result.issue,lang):'');
          return <tr key={r.well} data-selected={selected.has(r.well)}>
            <td><input type="checkbox" aria-label={r.well+' '+t('포함','include')} checked={selected.has(r.well)} disabled={!can}
              onChange={e=>setChoices(prev=>({...prev,[r.well]:e.target.checked}))}/></td>
            <th scope="row">{r.well}</th>{editing?<><td>{r.label||'—'}</td>
            <td><StudioSelect aria-label={r.well+' '+t('역할','role')} value={r.role} onValueChange={v=>updateRole(r.well,v)} options={roleOptions.some(o=>o.value===r.role)?roleOptions:[...roleOptions,{value:r.role,label:roleLabel(r.role)}]}/></td>
            <td>{can?<input aria-label={r.well+' '+t('시료명','sample name')} value={names[r.well]??(r.label||r.well)} onChange={e=>setNames(prev=>({...prev,[r.well]:e.target.value}))}/>: '—'}</td>
            <td>{can?<input aria-label={r.well+' '+t('처리구','treatment')} value={groups[r.well]??''} placeholder={fallbackGroup} onChange={e=>setGroups(prev=>({...prev,[r.well]:e.target.value}))}/>: '—'}</td>
            </>:<>
            <td className="plate-cell-id"><strong>{names[r.well]??(r.label||r.well)}</strong><small>{can?groupFor(r.well):roleLabel(r.role)}</small></td>
            {hasStandards && <td>{r.role==='standard'?fmt(sheet.layout[r.well]?.concentration):'—'}</td>}
            {fields.map(f=><td className="plate-number" key={f.key}>{fmt(r.values?.[f.key])}</td>)}
            {preview.kinetic&&<><td>{r.fit?.n ?? '—'}</td><td>{fmt(r.fit?.rSquared)}</td></>}
            {metrics.map(([key])=><td className="plate-number" key={key}>{fmt(result?.[key])}</td>)}
            <td className="plate-review">{review||(can?(selected.has(r.well)?'—':t('제외','Excluded')):t('참고 웰','Reference well'))}</td></>}
          </tr>;
        })}</tbody></table>
      </div>
      {!visible.length && <p className="plate-note" role="status">{t('조건에 맞는 웰이 없습니다.','No wells match this filter.')}</p>}
      {visible.length>PAGE_SIZE&&<div className="plate-pager">
        {!showAll&&<><button type="button" aria-label={t('이전 웰','Previous wells')} disabled={!shownPage} onClick={()=>setPage(shownPage-1)}><ArrowLeft size={15}/></button>
          <span>{shownPage*PAGE_SIZE+1}–{Math.min(visible.length,(shownPage+1)*PAGE_SIZE)} / {visible.length}</span>
          <button type="button" aria-label={t('다음 웰','Next wells')} disabled={shownPage===lastPage} onClick={()=>setPage(shownPage+1)}><ArrowRight size={15}/></button></>}
        <button type="button" onClick={()=>{setShowAll(!showAll);setPage(0);}}>{showAll?t('페이지로 보기','Paginate wells'):t('모두 보기','Show all wells')}</button>
      </div>}
      <button type="button" className="plate-btn plate-export-preview" onClick={exportPreview}><Download size={15}/>{t('미리보기 CSV','Download preview CSV')}</button>
      </div>
    </details>}
  </>;
}

export default function PlateImport({ workbook, fileName, sheetIndex: initialSheet=0, onReplace, onSwitchAssay, lang = 'ko', ...props }) {
  const en=lang==='en';
  const sheets=workbook.sheets||[];
  const [sheetIndex,setSheetIndex]=useState(sheets[initialSheet] ? initialSheet : 0);
  const heading = useRef(null);
  useLayoutEffect(() => {
    if (!heading.current) return;
    heading.current.focus({preventScroll:true});
    const top = heading.current.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * .4) heading.current.scrollIntoView({block:'start'});
  }, [workbook]);
  const sheet=sheets[sheetIndex];
  if (!sheet) return <p role="alert" className="plate-error">{en?'No worksheets found in this workbook.':'이 파일에서 워크시트를 찾을 수 없습니다.'}</p>;
  const metadata=sheet.metadata||{};
  return <section className="plate-import" aria-label={en?'Excel plate preview':'Excel 플레이트 미리보기'}>
    <header className="plate-heading" tabIndex={-1} ref={heading}><FileSpreadsheet size={24}/><div><h3>{en?'Excel plate preview':'Excel 플레이트 미리보기'}</h3><p>{fileName}</p></div>
      <button className="plate-btn plate-replace" type="button" onClick={onReplace}>{en?'Change file':'파일 바꾸기'}</button>
    </header>
    <div className={sheets.length > 1 ? "plate-sheet-info" : "plate-sheet-info plate-single-sheet"}>{sheets.length>1 ? <Selector label={en?'Worksheet':'워크시트'} value={sheetIndex} change={v=>setSheetIndex(Number(v))}
      options={sheets.map((s,i)=>({value:String(i),label:s.name}))}/> : <strong>{sheet.name}</strong>}
      <p>{[metadata.reader,metadata.plate,metadata.wavelengths?.length?[...new Set(metadata.wavelengths)].join(' / ')+' nm':''].filter(Boolean).join(' · ')}</p>
    </div>
    <SheetPreview key={sheetIndex} sheet={sheet} fileName={fileName} lang={lang} {...props} switchWithFile={onSwitchAssay ? type=>onSwitchAssay(type,{fileName,workbook,sheetIndex}) : undefined}/>
  </section>;
}
