const palette = [
  ['#edf5ec', '#173627'],
  ['#c6e1c5', '#173627'],
  ['#8cbc96', '#142d20'],
  ['#4b7857', '#ffffff'],
  ['#25583e', '#ffffff']
];
const missing = ['#f1f1ee', '#586157'];

export { palette as heatmapPalette };

export function heatmapScales(columns, rows) {
  return columns.map(({ key }) => {
    let min = Infinity, max = -Infinity;
    for (const row of rows) {
      const value = row.values?.[key];
      if (Number.isFinite(value)) {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }
    return min === Infinity ? null : { min, max };
  });
}

export function heatmapColour(value, scale) {
  if (!Number.isFinite(value) || !scale) return missing;
  const { min, max } = scale;
  if (min === max) return palette[2];
  const range = max - min;
  const fraction = Number.isFinite(range)
    ? (value - min) / range
    : (value / 2 - min / 2) / (max / 2 - min / 2);
  return palette[Math.max(0, Math.min(4, Math.floor(fraction * 5)))];
}

// Labels can come from imported instrument files. Keep the downloaded SVG valid XML.
export function heatmapText(input) {
  return Array.from(String(input ?? ''), ch => {
    const code = ch.codePointAt(0);
    return code < 32 || (code >= 0xd800 && code <= 0xdfff) || code === 0xfffe || code === 0xffff ? ' ' : ch;
  }).join('');
}

export function wrapHeatmapText(value, maxWidth, measure) {
  const lines = [];
  let line = '';
  for (const word of heatmapText(value).split(/\s+/).filter(Boolean)) {
    const candidate = line ? line + ' ' + word : word;
    if (measure(candidate) <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = '';
    for (const ch of word) {
      if (line && measure(line + ch) > maxWidth) {
        lines.push(line);
        line = '';
      }
      line += ch;
    }
  }
  if (line || !lines.length) lines.push(line);
  return lines;
}
