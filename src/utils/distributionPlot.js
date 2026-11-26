import { numeric, summarize } from './resultData.js';

function quantile(sorted, fraction) {
  const position = (sorted.length - 1) * fraction;
  const lower = Math.floor(position), upper = Math.ceil(position);
  const share = position - lower;
  return sorted[lower] * (1 - share) + sorted[upper] * share;
}

// Quartiles use linear interpolation at (n − 1) p. Whiskers stop at observed values.
export function tukeySummary(values) {
  const sorted = values.map(v => numeric(v)).filter(v => v !== null).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const q1 = quantile(sorted, .25), median = quantile(sorted, .5), q3 = quantile(sorted, .75);
  const iqr = q3 - q1;
  const fenceLow = q1 - 1.5 * iqr, fenceHigh = q3 + 1.5 * iqr;
  let first = 0, last = sorted.length - 1;
  while (sorted[first] < fenceLow) first++;
  while (sorted[last] > fenceHigh) last--;
  return { q1, median, q3, whiskerLow: sorted[first], whiskerHigh: sorted[last],
    outliers: sorted.slice(0, first).concat(sorted.slice(last + 1)) };
}

export function distributionData(observations, kind, view, lang = 'ko') {
  const rows = [];
  const groups = new Map();
  const grouped = kind === 'box' || view !== 'sample';
  let low = kind === 'box' ? Infinity : 0, high = kind === 'box' ? -Infinity : 0;
  for (const item of observations) {
    const value = numeric(item.value);
    if (value === null) continue;
    const group = String(item.group || (lang === 'en' ? 'Unassigned' : '미지정'));
    if (grouped) {
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(value);
    } else {
      rows.push({ name: String(item.name ?? ''), detail: group, count: 1, mean: value, se: null, min: value, max: value });
    }
    low = Math.min(low, value);
    high = Math.max(high, value);
  }
  for (const [name, values] of groups) {
    const stats = summarize(values);
    const box = kind === 'box' ? tukeySummary(values) : null;
    rows.push({ name, detail: 'n = ' + stats.count, ...stats, box });
    if (!box && stats.se !== null) {
      low = Math.min(low, stats.mean - stats.se);
      high = Math.max(high, stats.mean + stats.se);
    }
  }
  if (grouped) rows.sort((a,b) => a.name.localeCompare(b.name, lang, { numeric: true }));
  if (!rows.length || (low === 0 && high === 0)) return { rows, grouped, low: 0, high: 1 };
  if (low === high) {
    const padding = Math.max(Math.abs(low) * .05, Number.MIN_VALUE);
    low -= padding;
    high += padding;
  }
  return { rows, grouped, low, high };
}

export function xmlLabel(value) {
  return Array.from(String(value ?? ''), c => {
    const n = c.codePointAt(0);
    if ((n < 32 && n !== 9 && n !== 10 && n !== 13) || (n >= 0xd800 && n <= 0xdfff) || n === 0xfffe || n === 0xffff) return ' ';
    return c;
  }).join('');
}

export const chartFont = 'Arial, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';

export function makeLineWrapper(lang) {
  const ctx = typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');
  const segments = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(lang, { granularity: 'grapheme' }) : null;
  return function wrap(text, width, size, weight = 400) {
    if (ctx) ctx.font = weight + ' ' + size + 'px ' + chartFont;
    const lines = [];
    for (const paragraph of xmlLabel(text).split(/\r\n|[\r\n]/)) {
      const chars = segments ? Array.from(segments.segment(paragraph), c => c.segment) : Array.from(paragraph);
      let line = '';
      for (const c of chars) {
        const candidate = line + c;
        if (line && (ctx ? ctx.measureText(candidate).width : candidate.length * size) > width) {
          lines.push(line);
          line = '';
        }
        line += c;
      }
      lines.push(line);
    }
    return lines;
  };
}
