import { useState } from 'react';
import RTInput from '@/components/hplc/RTInput';
import CalculationInput from '@/components/hplc/CalculationInput';
import DesulfoCalibration from '@/components/hplc/DesulfoCalibration';
import PDFUpload from '@/components/hplc/PDFUpload';
import ResultsChart from '@/components/hplc/ResultsChart';
import ResultsTable from '@/components/hplc/ResultsTable';
import StatisticsResults from '@/components/hplc/StatisticsResults';
import { useResultsRoute } from '@/components/results/useResultsRoute';
import { AssayMissing, WorkspaceFrame } from '@/components/results/WorkspaceFrame';
import { getHplcProtocol } from '@/data/hplcProtocols';
import { rematchHplcFile } from '@/utils/hplcPeaks';
import { hplcConcentration } from '@/utils/resultCalculations';
import { readStored, numeric } from '@/utils/resultData';
import { readHplcParameters, hplcParameterKey } from '@/utils/calibrationStorage';

function HplcWorkspace({ type, protocol, back, lang, tab, setTab }) {
  const en = lang === 'en';
  const [standards, setStandards] = useState(() => readStored('rt_standards_' + type, {}));
  const [params, setParams] = useState(() => readHplcParameters(type));
  const [files, setFiles] = useState(() => readStored('uploaded_files_' + type, []));
  const [results, setResults] = useState(() => {
    const stored = readStored('analysis_results_' + type, []);
    if (Object.keys(params).length || type === 'glucosinolate') return quantify(stored, params);
    return stored.map(r => ({ ...r, concentration: numeric(r.concentration) }));
  });
  const [storageError, setStorageError] = useState(false);

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { setStorageError(true); }
  }
  function quantify(rows, currentParams) {
    return rows.map(r => ({ ...r, concentration: numeric(r.matchedRT) === null ? null : hplcConcentration(r, currentParams, type) }));
  }
  function storeRows(rows, currentParams = params) {
    const updated = quantify(rows, currentParams);
    setResults(updated);
    save('analysis_results_' + type, updated);
  }
  function applyParams(next) {
    setParams(next);
    save(hplcParameterKey(type), next);
    storeRows(results, next);
  }
  function storeFiles(incoming, replace = false) {
    const updated = replace ? incoming : files.concat(incoming);
    setFiles(updated);
    save('uploaded_files_' + type, updated);
  }
  function applyStandards(next) {
    setStandards(next);
    save('rt_standards_' + type, next);
    if (files.some(f => Array.isArray(f.rawPeaks))) {
      const matched = files.map(f => Array.isArray(f.rawPeaks) ? rematchHplcFile(f, next) : f);
      const rematchedNames = new Set(matched.filter(f => Array.isArray(f.rawPeaks)).map(f => f.name));
      const unchangedRows = results.filter(r => !rematchedNames.has(r.sampleName));
      storeFiles(matched, true);
      storeRows(unchangedRows.concat(matched.filter(f => Array.isArray(f.rawPeaks)).flatMap(f => f.processedResults || [])));
    }
  }
  const legacyFiles = files.filter(f => !Array.isArray(f.rawPeaks));
  return <WorkspaceFrame back={back} backLabel={en ? 'HPLC protocols' : 'HPLC 분석 방법'} title={protocol.title}
    lang={lang} image="/instruments/hplc.webp" description={en ? 'Match peak retention times to standards and quantify each compound.' : '표준품의 머무름 시간과 피크를 대조하고 화합물별 함량을 계산합니다.'}
    activeTab={tab} inputKey="data_input" onTabChange={setTab}>
    {storageError && <p role="alert" className="ra-warning">{en ? 'Browser storage is unavailable. Export your results before leaving.' : '브라우저 저장 공간을 사용할 수 없습니다. 페이지를 떠나기 전에 결과를 내보내세요.'}</p>}
    {legacyFiles.length > 0 && <p className="ra-warning">{en ? 'Earlier files retain their original peak matches. Reimport to apply new retention times.' : '이전 버전에서 저장한 파일은 기존 피크 대응을 유지합니다. 새 RT 기준을 적용하려면 원본 파일을 다시 불러오세요.'}</p>}
    {tab === 'visualization' ? <ResultsChart results={results} analysisType={type} assayTitle={protocol.title} lang={lang}/> : <>
      <div className="ra-settings-grid">
        <RTInput analysisType={type} initialValues={standards} onRTStandardsChange={applyStandards} lang={lang}/>
        {type === 'glucosinolate' ? <DesulfoCalibration sampleNames={[...new Set([...files.map(f=>f.name),...results.map(r=>r.sampleName)])]} initialValues={params} onApply={applyParams} lang={lang}/> :
          <CalculationInput analysisType={type} initialValues={params} onCalculationParamsChange={applyParams} lang={lang}/>}
      </div>
      <PDFUpload analysisType={type} rtStandards={standards} calculationParams={params} uploadedFiles={files} onFilesUploaded={storeFiles} onResultsGenerated={storeRows} lang={lang}/>
      <ResultsTable results={results} analysisType={type} lang={lang} params={params}/>
      <StatisticsResults results={results} analysisType={type} lang={lang}/>
    </>}
  </WorkspaceFrame>;
}

export default function HPLCResults({ lang = 'ko' }) {
  const route = useResultsRoute('data_input');
  const protocol = getHplcProtocol(route.type, lang);
  const base = '/hplc' + (lang === 'en' ? '_en' : '');
  if (!protocol?.title) return <AssayMissing lang={lang} back={base}/>;
  return <HplcWorkspace key={route.type} {...route} lang={lang} protocol={protocol} back={base + '?selected=' + encodeURIComponent(route.type)}/>;
}
