import { hplcCompoundLabel } from '@/data/hplcProtocols';
import { displayNumber as fmt, summarize } from '@/utils/resultData';
import { hplcUnit } from '@/utils/resultCalculations';

export default function StatisticsResults({ results, analysisType, lang = 'ko' }) {
  if (!results.length) return null;
  const grouped = new Map();
  for (const r of results) {
    if (!grouped.has(r.compound)) grouped.set(r.compound, []);
    grouped.get(r.compound).push(r.concentration);
  }
  const en = lang === 'en';
  return <section className="ra-panel"><div className="ra-panel-head"><div>
    <h2>{en ? 'Compound summary' : '화합물별 요약'}</h2><p>{en ? 'Across all samples' : '전체 시료 기준'} · {hplcUnit(analysisType)}</p>
    </div></div><div className="ra-scroll"><table>
      <thead><tr>{[en ? 'Compound' : '화합물', en ? 'Valid n' : '유효 n', en ? 'Excluded' : '제외', en ? 'Mean' : '평균', 'SD', 'SE'].map(h => <th key={h}>{h}</th>)}</tr></thead>
      <tbody>{Array.from(grouped, ([compound, values]) => {
        const s = summarize(values);
        return <tr key={compound}><th scope="row">{hplcCompoundLabel(compound, lang)}</th>{[s.count, values.length - s.count, s.mean, s.sd, s.se].map((v, i) => <td key={i}>{fmt(v)}</td>)}</tr>;
      })}</tbody>
    </table></div></section>;
}
