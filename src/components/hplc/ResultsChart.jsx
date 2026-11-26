import { getHplcCompounds, hplcCompoundLabel } from '@/data/hplcProtocols';
import { useState } from 'react';
import StudioSelect from '@/components/StudioSelect';
import { useChartExample } from '@/components/results/useResultsRoute';
import ComparisonPlot from '@/components/results/ComparisonPlot';
import { exampleHplc } from '@/components/results/exampleReadings';
import { hplcUnit } from '@/utils/resultCalculations';
import { hplcMatrix, treatmentLabel } from '@/utils/comparisonMatrix';

export default function ResultsChart({ results, analysisType, assayTitle, lang = 'ko' }) {
  const en = lang === 'en';
  const [compoundChoice, setCompound] = useState('');
  const [factorChoice, setFactor] = useState('');
  const [treatmentChoice, setTreatment] = useState('');
  const { previewing, onPreview } = useChartExample(results.length > 0);
  const source = previewing ? exampleHplc(lang) : results;
  const optionsFor = (key, rows = source) => [...new Set(rows.map(r => r[key]).filter(Boolean))].sort();
  const factors = optionsFor('factor'), treatments = optionsFor('treatment');
  const factor = factors.includes(factorChoice) ? factorChoice : '';
  const treatment = treatments.includes(treatmentChoice) ? treatmentChoice : '';
  const scoped = source.filter(r => (!factor || r.factor === factor) && (!treatment || r.treatment === treatment));
  const available = optionsFor('compound', scoped);
  const preferred = analysisType === 'lamiaceae_markers' ? getHplcCompounds(analysisType) : [];
  const compounds = [...preferred.filter(name => available.includes(name)), ...available.filter(name => !preferred.includes(name))];
  const compound = compounds.includes(compoundChoice) ? compoundChoice : compounds[0] || '';
  const unit = hplcUnit(analysisType);
  const filePrefix = (previewing ? 'example-' : '') + 'hplc-' + analysisType;
  return <section className="ra-panel">
    <div className="ra-panel-head"><div><h2>{en ? 'Concentration by compound' : '화합물별 농도 비교'}</h2>
      <p>{en ? 'Compare concentrations across compounds, factors and treatments.' : '화합물별 농도와 처리구 간 차이를 비교하세요.'}</p></div></div>
    <ComparisonPlot matrix={hplcMatrix(scoped, unit, lang, compounds)} unit={unit} metric={hplcCompoundLabel(compound, lang)} lang={lang} assayTitle={previewing ? (en ? 'HPLC · Example data' : 'HPLC · 예시 데이터') : assayTitle}
      fileName={filePrefix + '-' + compound} matrixFileName={filePrefix} previewing={previewing} onPreview={onPreview}
      metricControl={compounds.length > 0 && <label className="ra-label">{en ? 'Compound' : '화합물'}
        <StudioSelect aria-label={en ? 'Compound' : '화합물'} value={compound} onValueChange={setCompound} options={compounds.map(value => ({ value, label: hplcCompoundLabel(value, lang) }))}/>
      </label>}
      filters={[[en ? 'Factor' : '요인', factor, setFactor, factors], [en ? 'Treatment' : '처리구', treatment, setTreatment, treatments]]
        .filter(([, , , options]) => options.length).map(([label, value, change, options]) =>
          <label key={label} className="ra-label">{label}<StudioSelect aria-label={label} value={value} onValueChange={change}
            options={[{ value: '', label: en ? 'All' : '전체' }, ...options.map(v => ({ value: v, label: v }))]}/></label>)}
      observations={scoped.filter(r => r.compound === compound).map(r => ({ group: treatmentLabel(r, lang), name: r.sampleName, value: r.concentration }))}/>
  </section>;
}
