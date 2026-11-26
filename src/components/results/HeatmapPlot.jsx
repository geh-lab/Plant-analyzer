import { useId, useMemo } from 'react';
import { displayNumber } from '@/utils/resultData';
import { heatmapColour, heatmapPalette, heatmapScales, heatmapText, wrapHeatmapText } from './heatmapData.js';
import './heatmap.css';

const font = 'Arial, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
const pad = 22;
const labelWidth = 170;

function prepareLayout(matrix, assayTitle) {
  const { columns, rows } = matrix;
  const scales = heatmapScales(columns, rows);
  const ctx = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
  const measure = (value, size = 13, weight = 400) => {
    if (!ctx) return Array.from(value).length * size;
    ctx.font = weight + ' ' + size + 'px ' + font;
    return ctx.measureText(value).width;
  };
  const wrap = (value, width, size, weight) => wrapHeatmapText(value, width, text => measure(text, size, weight));
  let x = pad + labelWidth;
  const cells = columns.map((column, i) => {
    let width = Math.max(116, Math.min(202, Math.ceil(measure(heatmapText(column.label), 13, 600)) + 20));
    for (const row of rows) {
      const value = row.values?.[column.key];
      if (Number.isFinite(value)) width = Math.max(width, Math.ceil(measure(displayNumber(value), 13, 600)) + 18);
    }
    const cell = {
      ...column, x, width, scale: scales[i],
      names: wrap(column.label, width - 16, 13, 600),
      units: column.unit ? wrap(column.unit, width - 16, 11, 400) : []
    };
    x += width;
    return cell;
  });
  const width = Math.max(540, x + pad);
  const titleLines = wrap(assayTitle, width - 2 * pad, 18, 600);
  const legendY = pad + titleLines.length * 23 + 28;
  const columnY = legendY + 51;
  const headHeight = cells.reduce((height, c) => Math.max(height, c.names.length * 17 + c.units.length * 15 + 10), 35);
  let y = columnY + headHeight;
  const bands = rows.map(row => {
    const names = wrap(row.name, labelWidth - 15, 13, 600);
    const groups = row.group ? wrap(row.group, labelWidth - 15, 11, 400) : [];
    const height = Math.max(43, names.length * 17 + groups.length * 15 + 10);
    const band = { row, names, groups, height, y };
    y += height;
    return band;
  });
  return { cells, bands, width, height: y + pad, titleLines, legendY, columnY };
}

function TextLines({ lines, x, y, lineHeight, ...props }) {
  return <text x={x} y={y} {...props}>{lines.map((text, i) =>
    <tspan key={i} x={x} dy={i ? lineHeight : 0}>{text}</tspan>
  )}</text>;
}

export default function HeatmapPlot({ matrix, lang = 'ko', assayTitle, svgRef }) {
  const en = lang === 'en';
  const id = useId();
  const title = en ? 'Sample heatmap' : '시료 히트맵';
  const context = assayTitle ? heatmapText(assayTitle) + ' · ' + title : title;
  const description = en
    ? 'Each column has its own colour scale. Cells show measured or calculated values in the column unit. Constant columns use the middle colour.'
    : '색은 각 열의 최솟값과 최댓값을 기준으로 정합니다. 숫자는 열에 표시한 단위의 측정값 또는 계산값입니다. 값이 모두 같은 열은 중간색입니다.';
  const unavailable = en ? 'No value' : '값 없음';
  const layout = useMemo(() => matrix && prepareLayout(matrix, context), [matrix, context]);
  if (!layout || !layout.cells.length || !layout.bands.length) {
    return <p className="heatmap-empty" role="status">{en ? 'Add samples and at least one metric to display a heatmap.' : '시료와 비교 지표가 있으면 히트맵이 표시됩니다.'}</p>;
  }
  const { cells, bands, width, height, titleLines, legendY, columnY } = layout;
  return (
    <figure className="heatmap-figure">
      <div className="heatmap-scroll" role="region" tabIndex={0} aria-label={context}>
        <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`}
          fontFamily={font} fontSize={13} fill="#223b2d" role="img" aria-labelledby={id + '-title ' + id + '-desc'}>
          <title id={id + '-title'}>{context}</title><desc id={id + '-desc'}>{description}</desc>
          <rect width={width} height={height} fill="#ffffff"/>
          <TextLines lines={titleLines} x={pad} y={pad + 14} lineHeight={23} fontSize={18} fontWeight={600}/>
          <g fontSize={12} fill="#425b4b" transform={`translate(${pad} ${legendY})`}>
            <text y={1}>{en ? 'Lower' : '낮음'}</text>
            {heatmapPalette.map(([colour], i) => <rect key={colour} x={43 + 25 * i} y={-10} width={24} height={12} fill={colour}/>)}
            <text x={178} y={1}>{en ? 'Higher' : '높음'}</text>
            <rect x={247} y={-13} width={24} height={18} rx={2} fill={heatmapColour(null,null)[0]}/>
            <text x={259} y={1} textAnchor="middle">—</text>
            <text x={277} y={1}>{unavailable}</text>
            <text y={23} fontSize={11}>{en ? 'Colours are scaled per column. A constant column uses the middle shade.' : '열마다 색상 범위가 다릅니다. 값이 같은 열은 중간색으로 표시합니다.'}</text>
          </g>
          <text x={pad} y={columnY + 13} fontWeight={600}>{en ? 'Sample / treatment' : '시료 / 처리구'}</text>
          {cells.map(c => <g key={c.key} textAnchor="middle">
            <TextLines lines={c.names} x={c.x + c.width / 2} y={columnY + 13} lineHeight={17} fontSize={13} fontWeight={600}/>
            <TextLines lines={c.units} x={c.x + c.width / 2} y={columnY + c.names.length * 17 + 11} lineHeight={15} fontSize={11} fill="#476050"/>
          </g>)}
          {bands.map(({row, names, groups, height: h, y}, n) => <g key={n}>
            <line x1={pad} x2={width - pad} y1={y} y2={y} stroke="#dfe7df" />
            <TextLines lines={names} x={pad} y={y + 18} lineHeight={17} fontWeight={600}/>
            <TextLines lines={groups} x={pad} y={y + 16 + names.length * 17} lineHeight={15} fontSize={11} fill="#496351"/>
            {cells.map(c => {
              const value = row.values?.[c.key];
              const raw = Number.isFinite(value) ? String(value) : null;
              const [fill, ink] = heatmapColour(value, c.scale);
              return <g key={c.key}>
                <title>{[row.name, row.group, c.label, raw === null ? unavailable : raw + (c.unit ? ' ' + c.unit : '')].map(heatmapText).filter(Boolean).join(' · ')}</title>
                <rect x={c.x + 2} y={y + 2} width={c.width - 4} height={h - 4} rx={3} fill={fill}/>
                <text x={c.x + c.width / 2} y={y + h / 2 + 4} textAnchor="middle" fontSize={13} fontWeight={600} fill={ink}>{raw === null ? '—' : displayNumber(value)}</text>
              </g>;
            })}
          </g>)}
        </svg>
      </div>
      <figcaption>{description}</figcaption>
      <details className="heatmap-data">
        <summary>{en ? 'Heatmap data table' : '히트맵 원자료 표'}</summary>
        <div className="heatmap-table-scroll"><table>
          <caption className="heatmap-sr-only">{context}</caption>
          <thead><tr><th scope="col">{en ? 'Sample' : '시료'}</th><th scope="col">{en ? 'Treatment' : '처리구'}</th>
            {cells.map(c => <th key={c.key} scope="col">{c.label}{c.unit ? ' (' + c.unit + ')' : ''}</th>)}</tr></thead>
          <tbody>{bands.map(({row}, n) => <tr key={n}><th scope="row">{row.name}</th><td>{row.group}</td>
            {cells.map(c => <td key={c.key}>{Number.isFinite(row.values?.[c.key]) ? String(row.values[c.key]) : unavailable}</td>)}</tr>)}</tbody>
        </table></div>
      </details>
    </figure>
  );
}
