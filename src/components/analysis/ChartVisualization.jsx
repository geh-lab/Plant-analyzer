import { useState } from 'react';
import StudioSelect from '@/components/StudioSelect';
import { useChartExample } from '@/components/results/useResultsRoute';
import ComparisonPlot from '@/components/results/ComparisonPlot';
import { exampleAbsorbance } from '@/components/results/exampleReadings';
import { absorbanceMetrics } from '@/utils/resultCalculations';

export default function ChartVisualization({ samples, analysisType, assayTitle, lang = 'ko', selectedCount = 0 }) {
  const en = lang === 'en';
  const [choice, setChoice] = useState('');
  const { previewing, onPreview } = useChartExample(samples.length > 0);
  const source = previewing ? exampleAbsorbance(lang) : samples;
  const type = previewing ? 'mda' : analysisType;
  const metrics = absorbanceMetrics(type, source[0]?.unit || '', lang);
  const [key, label, unit] = metrics.find(m => m[0] === choice) || metrics[0];
  const group = sample => sample.treatment_name || (en ? 'Unassigned' : '미지정');
  const matrix = {
    columns: metrics.map(([key, label, unit]) => ({ key, label, unit })),
    rows: source.map(s => ({ name: s.sample_name, group: group(s), values: Object.fromEntries(metrics.map(([key]) => [key, s[key]])) }))
  };
  const filePrefix = previewing ? 'example-mda' : type;
  return <section className="ra-panel">
    <div className="ra-panel-head"><div><h2>{en ? 'Sample comparison' : '시료 비교'}</h2>
      <p>{previewing ? (en ? 'Example MDA measurements' : 'MDA 측정 예시') : selectedCount ? (en ? 'Selected samples' : '선택한 시료') + ' · ' + selectedCount : (en ? 'All samples in this assay' : '이 분석에 등록된 전체 시료')}</p>
    </div></div>
    <ComparisonPlot assayTitle={previewing ? (en ? 'MDA · Example data' : 'MDA · 예시 데이터') : assayTitle}
      metric={label} unit={unit} matrix={matrix} lang={lang} fileName={filePrefix + '-' + key} matrixFileName={filePrefix}
      previewing={previewing} onPreview={onPreview}
      metricControl={metrics.length > 1 && <label className="ra-label">{en ? 'Metric' : '비교 지표'}
        <StudioSelect value={key} onValueChange={setChoice} aria-label={en ? 'Metric' : '비교 지표'}
          options={metrics.map(([value, label]) => ({value, label}))} />
      </label>}
      observations={source.map(s => ({ name: s.sample_name, group: group(s), value: s[key] }))}/>
  </section>;
}
