import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlignEndHorizontal, CandlestickChart, ChartNoAxesCombined, Download, Grid2X2, ScatterChart } from 'lucide-react';
import StudioSelect from '@/components/StudioSelect';
import { displayNumber as fmt, downloadCsv, numeric, summarize } from '@/utils/resultData';
import DistributionPlot from './DistributionPlot';
import HeatmapPlot from './HeatmapPlot';
import { downloadPlot } from './exportPlot';

const types = [
  { id: 'bar', icon: AlignEndHorizontal, names: ['막대그래프', 'Bar chart'] },
  { id: 'point', icon: ScatterChart, names: ['점그래프', 'Dot plot'] },
  { id: 'box', icon: CandlestickChart, names: ['박스플롯', 'Box plot'] },
  { id: 'heatmap', icon: Grid2X2, names: ['히트맵', 'Heatmap'] }
];

export default function ComparisonPlot({ observations, matrix, unit, lang, metric, fileName, matrixFileName, assayTitle, metricControl, filters, onPreview, previewing }) {
  const en = lang === 'en';
  const t = (ko, eng) => en ? eng : ko;
  const [params, setParams] = useSearchParams();
  const chart = types.find(type => type.id === params.get('chart'))?.id || 'bar';
  const heatmap = chart === 'heatmap';
  const [view, setView] = useState('group');
  const svgRef = useRef(null);
  const groups = new Map();
  const valid = [];
  for (const reading of observations) {
    const value = numeric(reading.value);
    if (value === null) continue;
    valid.push(value);
    if (!groups.has(reading.group)) groups.set(reading.group, []);
    groups.get(reading.group).push(value);
  }
  const byGroup = Array.from(groups, ([name, values]) => ({ name, ...summarize(values) }))
    .sort((a, b) => a.name.localeCompare(b.name, lang, { numeric: true }));
  const stats = summarize(valid);
  const cellCount = matrix.rows.length * matrix.columns.length;
  const filled = matrix.rows.reduce((sum, row) =>
    sum + matrix.columns.filter(c => numeric(row.values[c.key]) !== null).length, 0);
  const showChart = heatmap ? cellCount > 0 : valid.length > 0;

  const kpis = heatmap ? [
    [t('시료 행', 'Sample rows'), matrix.rows.length], [t('비교 항목', 'Variables'), matrix.columns.length],
    [t('유효 측정값', 'Valid readings'), filled], [t('결측값', 'Missing values'), cellCount - filled]
  ] : [
    [t('유효 측정값', 'Valid readings'), stats.count], [t('처리구', 'Groups'), groups.size],
    [t('전체 평균', 'Overall mean'), fmt(stats.mean)], [t('전체 표준편차', 'Overall SD'), fmt(stats.sd)]
  ];
  function selectChart(id) {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      next.set('chart', id);
      return next;
    }, { replace: true });
  }
  function exportCsv() {
    if (heatmap) {
      downloadCsv(matrixFileName + '-heatmap', [
        ['Sample', 'Group', ...matrix.columns.map(c => c.label + (c.unit ? ' (' + c.unit + ')' : ''))],
        ...matrix.rows.map(row => [row.name, row.group, ...matrix.columns.map(c => numeric(row.values[c.key]))])
      ]);
    } else {
      downloadCsv(fileName + '-groups', [
        ['Treatment', 'Metric', 'Unit', 'Valid n', 'Mean', 'Sample SD', 'SE', 'Sample variance', 'CV (%)', 'Min', 'Max'],
        ...byGroup.map(r => [r.name, metric, unit, r.count, r.mean, r.sd, r.se, r.variance, r.cv, r.min, r.max])
      ]);
    }
  }
  const exportName = heatmap ? matrixFileName + '-heatmap' : [fileName, chart, chart === 'box' ? 'group' : view].join('-');
  return <div className="ra-comparison">
    <div className="ra-chart-choices" role="group" aria-label={t('그래프 종류', 'Chart type')}>
      {types.map(({ id, icon: Icon, names }) => <button type="button" key={id} aria-pressed={chart === id} onClick={() => selectChart(id)}>
        <Icon size={18} strokeWidth={1.7} aria-hidden="true" />{names[Number(en)]}
      </button>)}
    </div>
    {previewing && <p className="ra-preview-note">{t('예시 데이터로 보고 있습니다.', 'Showing example data.')} <button onClick={onPreview} type="button">{t('내 데이터로 돌아가기', 'Return to my data')}</button></p>}
    <div className="ra-chart-fields">
      {!heatmap && metricControl}
      {filters}
      {(chart === 'point' || chart === 'bar') && <label className="ra-label">{t('표시 단위', 'Display by')}
        <StudioSelect value={view} onValueChange={setView} aria-label={t('표시 단위', 'Display by')} options={[
          { value: 'group', label: t('처리구 평균', 'Group means') }, { value: 'sample', label: t('개별 시료', 'Individual samples') }
        ]}/>
      </label>}
    </div>
    <div className="ra-kpis">
      {kpis.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
    </div>
    {!heatmap && observations.length > valid.length && <p className="ra-warning">{t('계산값이 없어 제외한 측정 수', 'Readings excluded for unavailable values')} · {observations.length - valid.length}</p>}
    {showChart ? <>
      <div key={chart} className="ra-chart-stage">{heatmap ? <HeatmapPlot matrix={matrix} lang={lang} assayTitle={assayTitle} svgRef={svgRef} /> :
        <DistributionPlot kind={chart} view={view} observations={observations} metric={metric} unit={unit} lang={lang} assayTitle={assayTitle} svgRef={svgRef} />}</div>
      <div className="ra-actions ra-chart-downloads">
        <button type="button" className="ra-action" onClick={() => downloadPlot(svgRef.current, exportName)}><Download size={15}/>{t('그래프 저장 (SVG)', 'Download plot (SVG)')}</button>
        <button type="button" className="ra-action" onClick={exportCsv}><Download size={15}/>{heatmap ? t('히트맵 데이터 CSV', 'Heatmap data CSV') : t('처리구 통계 CSV', 'Group statistics CSV')}</button>
      </div>
      {!heatmap && <details className="ra-details"><summary>{t('처리구별 통계표', 'Group statistics table')}</summary><div className="ra-scroll">
        <table><thead><tr>{[t('처리구', 'Treatment'), 'n', t('평균', 'Mean'), 'SD', 'SE', 'CV (%)', t('최솟값', 'Minimum'), t('최댓값', 'Maximum')].map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{byGroup.map(r => <tr key={r.name}><th scope="row">{r.name}</th>{[r.count, r.mean, r.sd, r.se, r.cv, r.min, r.max].map((v, i) => <td key={i}>{fmt(v)}</td>)}</tr>)}</tbody></table>
      </div></details>}
    </> : <div className="ra-empty ra-chart-empty"><ChartNoAxesCombined size={28} aria-hidden="true"/>
      <p>{t('이 조건에서 표시할 측정값이 없습니다. 데이터를 입력하거나 비교 조건을 확인하세요.', 'No readings for this selection. Enter measurements or check your filters.')}</p>
      {onPreview && !previewing && <button type="button" className="ra-action" onClick={onPreview}>{t('예시 데이터로 보기', 'Preview with example data')}</button>}
    </div>}
  </div>;
}
