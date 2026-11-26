import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getProtocols } from '@/data/absorbanceProtocols';
import AbsorbanceGuide from "@/components/analysis/AbsorbanceGuide";
import ManualInput from '@/components/analysis/ManualInput';
import ManualInputEn from '@/components/analysis_en/ManualInput';
import ExcelUpload from '@/components/analysis/ExcelUpload';
import ExcelUploadEn from '@/components/analysis_en/ExcelUpload';
import CalculationParams from '@/components/analysis/CalculationParams';
import CalculationParamsEn from '@/components/analysis_en/CalculationParams';
import SampleResults from '@/components/analysis/SampleResults';
import ChartVisualization from '@/components/analysis/ChartVisualization';
import { useResultsRoute } from '@/components/results/useResultsRoute';
import { AssayMissing, WorkspaceFrame } from '@/components/results/WorkspaceFrame';
import { analyzeSample, mergeCalibrationParams, snapshotSampleCalibration } from '@/utils/resultCalculations';
import { readStored } from '@/utils/resultData';
import { plateSampleIdentity } from '@/utils/plateSampleIdentity';
import { absorbanceParameterKey, readAbsorbanceParameters } from '@/utils/calibrationStorage';

const sampleKey = 'phyto_samples';
const getAssayRows = type => readStored(sampleKey, []).filter(s => s?.analysis_type === type);

function AbsorbanceWorkspace({ type, lang, protocol, back, tab, setTab, transfer, consumeTransfer, switchAssay }) {
  const en = lang === 'en';
  const [samples, setSamples] = useState(() => getAssayRows(type));
  const [params, setParams] = useState(() => readAbsorbanceParameters(type));
  const [platePreview, setPlatePreview] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [received, setReceived] = useState(() => transfer?.type === type ? transfer.payload : null);
  const [urlParams, setUrlParams] = useSearchParams();
  const input = urlParams.get('input') === 'file' ? 'csv' : 'manual';
  function chooseInput(next) {
    setReceived(null);
    setUrlParams(previous => {
      const updated = new URLSearchParams(previous);
      if (next === 'csv') updated.set('input','file');
      else updated.delete('input');
      return updated;
    }, {replace:true,preventScrollReset:true});
  }
  useEffect(() => {
    if (received) consumeTransfer.current = null;
  }, [received, consumeTransfer]);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    function sync(e) {
      if (!e.key || e.key === sampleKey) setSamples(getAssayRows(type));
      if (!e.key || e.key === absorbanceParameterKey(type) || e.key === 'calc_params_' + type) setParams(readAbsorbanceParameters(type));
    }
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [type]);
  function persist(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); setStorageError(false); return true; }
    catch { setStorageError(true); return false; }
  }
  function changeRows(update) {
    const saved = readStored(sampleKey, []);
    const own = storageError ? samples : saved.filter(s => s?.analysis_type === type);
    const next = update(own);
    const stored = persist(sampleKey, saved.filter(s => s?.analysis_type !== type).concat(next));
    setSamples(next);
    return stored;
  }
  function add(rows, staged = null) {
    let count = 0;
    const activeCurve = staged?.applied && staged.calibration?.curve;
    const oldParams = storageError ? params : readAbsorbanceParameters(type);
    const stored = changeRows(current => {
      const seen = new Set(current.map(row => plateSampleIdentity(row, oldParams)).filter(Boolean));
      const incoming = [];
      for (const row of rows) {
        const key = plateSampleIdentity(row, oldParams);
        if (key && seen.has(key)) continue;
        if (key) seen.add(key);
        incoming.push({ ...row, id: crypto.randomUUID(), analysis_type: type, created_date: new Date().toISOString() });
      }
      count = incoming.length;
      const previous = activeCurve && count ? current.map(s => snapshotSampleCalibration(s, type, oldParams)) : current;
      return previous.concat(incoming);
    });
    if (activeCurve && count) {
      const next = mergeCalibrationParams(type, oldParams, staged.calibration.overrides);
      next.plateCalibrationSource = { fileName:staged.fileName, sheetName:staged.sheetName, signal:staged.signal, repeat:staged.repeat, curve:activeCurve, savedAt:new Date().toISOString() };
      // If row storage failed, keep the change in memory. Old records on disk still
      // depend on their prior global coefficients until their snapshots are saved.
      if (stored) persist(absorbanceParameterKey(type), next);
      setParams(next);
    }
    return { added: count, skipped: rows.length - count };
  }
  function edit(row, isEdit) {
    if (!isEdit) return add([row]);
    changeRows(current => current.map(s => s.id === row.id ? { ...s, ...row, updated_date: new Date().toISOString() } : s));
  }
  function remove(ids) {
    const removed = new Set(ids);
    changeRows(current => current.filter(s => !removed.has(s.id)));
    setSelectedIds(prev => new Set([...prev].filter(id => !removed.has(id))));
  }
  const calculated = useMemo(() => samples.map(s => ({ ...s, issue: null, ...analyzeSample(s, params) })).sort((a, b) =>
    String(a.treatment_name || '').localeCompare(String(b.treatment_name || ''), lang, { numeric: true }) ||
    String(a.sample_name || '').localeCompare(String(b.sample_name || ''), lang, { numeric: true })), [samples, params, lang]);
  const picked = calculated.filter(s => selectedIds.has(s.id));
  const Manual = en ? ManualInputEn : ManualInput;
  const Upload = en ? ExcelUploadEn : ExcelUpload;
  const Params = en ? CalculationParamsEn : CalculationParams;
  return <WorkspaceFrame lang={lang} back={back} backLabel={en ? 'Absorbance protocols' : '흡광도 분석 방법'} title={protocol.title} image="/instruments/absorbance.webp"
    description={type === 'mda' ? (en ? 'Measure MDA equivalents in the reaction mixture from the difference between A532 and A600.' : '532 nm와 600 nm 흡광도의 차이로 반응액의 MDA 환산 농도를 계산합니다.') :
      (en ? 'Enter absorbance readings to quantify samples and compare treatment groups.' : '흡광도 측정값으로 시료를 정량하고 처리구별 차이를 비교합니다.')}
    activeTab={tab} inputKey="data_input_analysis" onTabChange={key=>{setReceived(null);setTab(key);}}>
    {storageError && <p role="alert" className="ra-warning">{en ? 'Browser storage is unavailable. Export your results before leaving.' : '브라우저 저장 공간을 사용할 수 없습니다. 페이지를 떠나기 전에 결과를 내보내세요.'}</p>}
    {tab === 'visualization' ? <ChartVisualization assayTitle={protocol.title} samples={picked.length ? picked : calculated} analysisType={type} lang={lang} selectedCount={picked.length}/> : <>
      <section className="ra-panel ra-input">
        <div className="ra-panel-head"><h2>{en ? 'Measurement entry' : '측정값 입력'}</h2>
          <div className="ra-switch">{[['manual', en ? 'Manual' : '직접 입력'], ['csv', en ? 'Upload file' : '파일 업로드']].map(([k, label]) =>
            <button type="button" key={k} aria-pressed={input === k} onClick={() => chooseInput(k)}>{label}</button>)}</div>
        </div>
        {input === 'manual' ? <Manual analysisType={type} onSaveSample={edit}/> : <Upload analysisType={type} initialWorkbook={received} onSwitchAssay={switchAssay} params={params} onCalibrationPreview={setPlatePreview} onSamplesUploaded={add}/>}
      </section>
      <section id="assay-calculation-params" tabIndex={-1} className="ra-panel ra-input">
        <div className="ra-panel-head"><h2>{en ? 'Calculation parameters' : '계산 조건'}</h2></div>
        <Params analysisType={type} initialParams={params} platePreview={platePreview} onParamsChange={p => { persist(absorbanceParameterKey(type), p); setParams(p); }}/>
      </section>
      <AbsorbanceGuide en={en} analysisType={type} />
      <SampleResults samples={calculated} selectedIds={selectedIds} onSelectionChange={setSelectedIds} onEdit={edit} onRemoveMultiple={remove} analysisType={type} lang={lang} params={params}/>
    </>}
  </WorkspaceFrame>;
}

export default function Results({ lang = 'ko' }) {
  const route = useResultsRoute('data_input_analysis');
  const navigate = useNavigate();
  const transfer = useRef(null);
  function switchAssay(type, payload) {
    transfer.current = {type,payload};
    navigate({search:'?analysis_type='+encodeURIComponent(type)+'&input=file'});
  }
  const protocols = getProtocols(lang);
  const legacyCarotenoid = { title: lang === 'en' ? 'Carotenoids' : '카로티노이드' };
  const protocol = route.type === 'carotenoid' ? legacyCarotenoid : Object.hasOwn(protocols, route.type) && protocols[route.type];
  const base = '/analysis' + (lang === 'en' ? '_en' : '');
  if (!protocol) return <AssayMissing lang={lang} back={base}/>;
  const selected = route.type === 'carotenoid' ? 'chlorophyll_a_b' : route.type;
  return <AbsorbanceWorkspace key={route.type} transfer={transfer.current} consumeTransfer={transfer} switchAssay={switchAssay} {...route} protocol={protocol} lang={lang} back={base + '?selected=' + encodeURIComponent(selected)}/>;
}
