import { hplcCompoundLabel } from '@/data/hplcProtocols';
import { Download } from 'lucide-react';
import { downloadCsv, numeric, displayNumber as fmt } from '@/utils/resultData';
import { hplcUnit } from '@/utils/resultCalculations';

function status(row, en, params) {
  if(row.compound === '4-Hydroxy-3-benzoic acid') return en?'Confirm old compound identity':'기존 화합물명 확인';
  if (row.matchStatus === 'ambiguous') return en ? 'Ambiguous peak match' : '피크 식별 불확실';
  if (numeric(row.area) === null || numeric(row.matchedRT) === null) return en ? 'No peak match' : '대응 피크 없음';
  if(params?.method==='desulfo-is' && row.compound===params.standardCompound) return en ? 'Internal-standard peak' : '내부표준 피크';
  const intercept=numeric(params?.[row.compound+'_b'],0);
  if(numeric(params?.[row.compound+'_a'])>0 && numeric(row.area)<intercept) return en?'Below calibration intercept':'검량선 절편 미만';
  if (numeric(row.concentration) === null) return en ? 'Check parameters' : '계산 조건 확인';
  return en ? 'Calculated' : '계산됨';
}

export default function ResultsTable({ results, analysisType, lang = 'ko', params = {} }) {
  const en = lang === 'en';
  const unit = hplcUnit(analysisType);
  function exportData() {
    const rows = results.map(r => [r.sampleName, r.factor, r.treatment, r.replicate, r.compound,
      numeric(r.standardRT), numeric(r.matchedRT), numeric(r.area), numeric(r.concentration), unit, status(r, en, params), JSON.stringify(params)]);
    downloadCsv('hplc-' + analysisType, [['Sample', 'Factor', 'Treatment', 'Replicate', 'Compound', 'Standard RT (min)', 'Matched RT (min)', 'Peak area', 'Concentration', 'Unit', 'QC', 'Calculation parameters'], ...rows]);
  }
  return <section className="ra-panel"><div className="ra-panel-head"><div>
    <h2>{en ? 'Peak results' : '피크별 결과'}</h2><p>{results.length}{en ? ' rows' : '개 행'} · {unit}</p></div>
    {results.length > 0 && <button className="ra-action" type="button" onClick={exportData}><Download size={15}/>{en ? 'Export CSV' : 'CSV 내보내기'}</button>}</div>
    {results.length ? <div className="ra-scroll"><table><thead><tr>{[en ? 'Sample' : '시료', en ? 'Factor' : '요인', en ? 'Treatment' : '처리구', en ? 'Replicate' : '반복', en ? 'Compound' : '화합물', en ? 'Standard RT (min)' : '표준 RT (min)', en ? 'Matched RT (min)' : '피크 RT (min)', en ? 'Area' : '면적', unit, en ? 'Status' : '상태'].map(h => <th key={h}>{h}</th>)}</tr></thead>
    <tbody>{results.map((r, i) => <tr key={i}><th scope="row">{r.sampleName}</th><td>{r.factor}</td><td>{r.treatment}</td><td>{r.replicate}</td><td>{hplcCompoundLabel(r.compound, lang)}</td>
      {[r.standardRT, r.matchedRT, r.area, r.concentration].map((v, k) => <td key={k}>{fmt(v)}</td>)}<td className={r.concentration == null ? 'ra-warning-text' : ''}>{status(r, en, params)}</td></tr>)}</tbody></table></div> :
      <p className="ra-empty">{en ? 'Import peak data to see retention times, peak areas and concentrations.' : '피크 데이터를 불러오면 머무름 시간, 피크 면적과 농도가 표시됩니다.'}</p>}
  </section>;
}
