import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { displayNumber as fmt } from '@/utils/resultData';
import { chartFont, distributionData, makeLineWrapper, xmlLabel } from '@/utils/distributionPlot';
import './chartCanvas.css';

const ink = '#205f43', muted = '#496255', rule = '#d4e1d7';

function Extent({ x1, x2, y, color = ink }) {
  return <g stroke={color} strokeWidth="1.8" fill="none">
    <line x1={x1} x2={x2} y1={y} y2={y}/>
    <path d={`M${x1} ${y - 5}v10 M${x2} ${y - 5}v10`}/>
  </g>;
}

function Mark({ kind, row, x, y }) {
  if (kind === 'box') {
    const box = row.box;
    return <g>
      <Extent x1={x(box.whiskerLow)} x2={x(box.whiskerHigh)} y={y}/>
      <rect x={x(box.q1)} width={Math.max(0, x(box.q3) - x(box.q1))} y={y-9} height="18" fill="#ccdfce" stroke={ink} strokeWidth="1.5"/>
      <line x1={x(box.median)} x2={x(box.median)} y1={y-11} y2={y+11} stroke="#113c2d" strokeWidth="2.5"/>
      {box.outliers.map((v, i) => <circle key={i} cx={x(v)} cy={y} r="3.5" fill="#fff" stroke={ink} strokeWidth="1.6"><title>{fmt(v)}</title></circle>)}
    </g>;
  }
  return <g>
    {kind === 'bar' && (row.mean === 0
      ? <line x1={x(0)} x2={x(0)} y1={y-7} y2={y+7} stroke={ink} strokeWidth="2.5"/>
      : <rect x={Math.min(x(0),x(row.mean))} y={y-7} width={Math.abs(x(row.mean)-x(0))} height="14" rx="2" fill="#6b997a"/>)}
    {row.se !== null && <Extent x1={x(row.mean-row.se)} x2={x(row.mean+row.se)} y={y} color="#153e2d"/>}
    {kind === 'point' && <circle cx={x(row.mean)} cy={y} r="5" fill={ink}/>}
  </g>;
}

function TextLines({ lines, x, y, size = 14, weight = 400, color = '#203b2b', leading = 19 }) {
  return lines.map((line,i) => <text key={i} x={x} y={y+i*leading} fontSize={size} fontWeight={weight} fill={color}>{line}</text>);
}

function ChartValues({ rows, kind, lang, unit }) {
  const en = lang === 'en';
  const box = kind === 'box';
  const columns = box
    ? [en ? 'Treatment' : '처리구', 'n', en ? 'Lower whisker' : '아래 수염', 'Q1', en ? 'Median' : '중앙값', 'Q3', en ? 'Upper whisker' : '위 수염', en ? 'Outliers' : '이상치']
    : [en ? 'Sample' : '시료', en ? 'Treatment' : '처리구', unit || (en ? 'Value' : '값')];
  return <details className="ra-details">
    <summary>{box ? (en ? 'Box plot values' : '상자 그림 통계표') : (en ? 'Plotted sample values' : '그래프에 표시된 시료값')}</summary>
    <div className="ra-scroll"><table><thead><tr>{columns.map((c,i) => <th key={i}>{c}</th>)}</tr></thead><tbody>
      {rows.map((r,i) => <tr key={i}><th scope="row">{r.name}</th>{box ? <><td>{r.count}</td>
        {[r.box.whiskerLow,r.box.q1,r.box.median,r.box.q3,r.box.whiskerHigh].map((v,n) => <td key={n}>{fmt(v)}</td>)}
        <td>{r.box.outliers.map(fmt).join(' · ') || '—'}</td></> : <><td>{r.detail}</td><td>{fmt(r.mean)}</td></>}</tr>)}
    </tbody></table></div>
  </details>;
}

export default function DistributionPlot({ kind = 'point', view = 'group', observations = [], metric, unit, lang = 'ko', assayTitle, svgRef }) {
  const en = lang === 'en';
  const t = (ko,english) => en ? english : ko;
  const outer = useRef(null);
  const [width,setWidth] = useState(800);
  const id = useId();
  useEffect(() => {
    const host = outer.current;
    if (!host) return;
    const update = () => {
      const measured = Math.floor(host.clientWidth);
      if (measured) setWidth(Math.max(300,Math.min(1260,measured)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);
  const {rows,grouped,low,high} = useMemo(() => distributionData(observations,kind,view,lang),[observations,kind,view,lang]);
  const wrap = useMemo(() => makeLineWrapper(lang),[lang]);
  const box = kind === 'box';
  const small = width < 620;
  const margin = small ? 16 : 24;
  const left = small ? margin + 10 : Math.min(230,Math.floor(width * .27));
  const right = small ? width - margin - 10 : width - 145;
  const x = v => left + (v - low) / (high - low) * (right - left);
  const rawTitle = [assayTitle,metric].filter((v,i,a) => v && a.indexOf(v) === i).join(' · ');
  const title = xmlLabel(rawTitle);
  const mode = box ? t('처리구별 상자 그림','Group box plot') : grouped ? t('처리구 평균','Group means') : t('개별 시료','Individual samples');
  const kindName = kind === 'bar' ? t('막대','Bars') : t('점','Points');
  const subtitle = [box ? mode : mode+' · '+kindName, unit].filter(Boolean).join(' · ');
  const legend = box
    ? t('상자는 Q1~Q3, 가운데 선은 중앙값입니다. 수염은 Q1 − 1.5×IQR부터 Q3 + 1.5×IQR 안의 가장 바깥 관측값까지이며, 원은 이상치입니다.', 'Boxes span Q1 to Q3. The central line is the median. Whiskers end at observations within 1.5 × IQR of the box. Open circles mark outliers.')
    : grouped ? t('처리구별 평균을 표시합니다. 오차 막대는 n ≥ 2일 때 평균 ± 1 표준오차(SE)입니다.', 'Values are group means. Error bars show ±1 standard error (SE) for groups with at least two observations.')
    : t('각 행은 시료 하나의 계산값입니다.', 'Each row shows the calculated value of one sample.');
  const titleLines = wrap(title, width-2*margin,small?18:22,650);
  const subtitleLines = wrap(subtitle,width-2*margin,14);
  const subY = 28 + titleLines.length * 26;
  const axisY = subY + subtitleLines.length * 19 + 25;
  const firstRowY = axisY + 10;
  let bottom = firstRowY;
  const laidRows = rows.map(row => {
    const names = wrap(row.name,small ? width-2*margin : left-margin-20,14,650);
    const suffix = box ? fmt(row.box.median) : fmt(row.mean) + (row.se !== null ? ' ± '+fmt(row.se) : '');
    const detail = small ? row.detail + '  ·  ' + (box ? t('중앙값 ','Median ') : '') + suffix : row.detail;
    const details = wrap(detail,small ? width-2*margin : left-margin-20,12);
    const textHeight = names.length*19 + details.length*17;
    const height = textHeight + (small ? 40 : 18);
    const y = bottom;
    bottom += height;
    return {row,names,details,suffix,y,markY:small ? bottom-18 : y+height/2};
  });
  const legendLines = wrap(legend,width-2*margin,13);
  const height = bottom + 32 + legendLines.length*18;
  const ticks = Array.from({length:small ? 3 : 5},(_,i) => {
    const f=i/(small?2:4);
    return (1-f)*low+f*high;
  });
  return <figure className="distribution-figure">
    <div className="distribution-scroll" ref={outer} tabIndex={0} aria-label={xmlLabel([title,subtitle].join(' · '))}>
      <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`}
        lang={lang} role="img" aria-labelledby={id+'-title '+id+'-desc'} fontFamily={chartFont} fill="#203b2b">
        <title id={id+'-title'}>{title+' · '+subtitle}</title>
        <desc id={id+'-desc'}>{legend}</desc>
        <rect width={width} height={height} fill="#ffffff"/>
        <TextLines lines={titleLines} x={margin} y={30} size={small?18:22} weight={650} leading={26}/>
        <TextLines lines={subtitleLines} x={margin} y={subY} color={muted} leading={19}/>
        {!small && <><text x={margin} y={axisY} fontSize="12" fontWeight="600">{grouped?t('처리구','Treatment'):t('시료','Sample')}</text>
          <text x={width-margin} y={axisY} textAnchor="end" fontSize="12" fontWeight="600">{box?t('중앙값','Median'):grouped?t('평균 ± SE','Mean ± SE'):t('계산값','Value')}</text></>}
        {ticks.map((v,i) => <g key={i}><text x={x(v)} y={axisY} textAnchor={small && i===0?'start':small && i===ticks.length-1?'end':'middle'} fontSize="12" fill={muted}>{fmt(v)}</text>
          <line x1={x(v)} x2={x(v)} y1={axisY+4} y2={axisY+9} stroke={rule}/></g>)}
        {laidRows.map(({row,names,details,suffix,y,markY},i) => <g key={i} data-observation={i}>
          <title>{xmlLabel(row.name+' · '+row.detail+' · '+suffix+' '+unit)}</title>
          <line x1={margin} x2={width-margin} y1={y} y2={y} stroke={rule}/>
          <TextLines lines={names} x={margin} y={y+19} weight={650}/>
          <TextLines lines={details} x={margin} y={y+18+names.length*19} size={12} color={muted} leading={17}/>
          <line x1={left} x2={right} y1={markY} y2={markY} stroke={rule}/>
          {kind === 'bar' && <line x1={x(0)} x2={x(0)} y1={markY-11} y2={markY+11} stroke="#859a8b"/>}
          <Mark kind={kind} row={row} x={x} y={markY}/>
          {!small && <text x={width-margin} y={markY+4} textAnchor="end" fontSize="13" fontWeight="650">{suffix}</text>}
        </g>)}
        <line x1={margin} x2={width-margin} y1={bottom} y2={bottom} stroke={rule}/>
        <TextLines lines={legendLines} x={margin} y={bottom+23} size={13} leading={18} color={muted}/>
      </svg>
    </div>
    {(box || !grouped) && rows.length>0 && <ChartValues rows={rows} kind={kind} lang={lang} unit={unit}/>}
  </figure>;
}
