export function numeric(value, fallback = null) {
  if (value == null || (typeof value === 'string' && !value.trim())) return fallback;
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function displayNumber(value) {
  const n = numeric(value);
  if (n === null) return '—';
  if (n !== 0 && (Math.abs(n) < 0.001 || Math.abs(n) >= 1e7)) return n.toExponential(2);
  return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 5 }).format(n);
}

export function summarize(values) {
  const numbers = values.map(n => numeric(n)).filter(n => n !== null);
  const count = numbers.length;
  const empty = { count, mean: null, sd: null, se: null, variance: null, cv: null, min: null, max: null };
  if (!count) return empty;
  let mean = 0, m2 = 0, min = Infinity, max = -Infinity;
  numbers.forEach((value, index) => {
    const delta = value - mean;
    mean += delta / (index + 1);
    m2 += delta * (value - mean);
    min = Math.min(min, value);
    max = Math.max(max, value);
  });
  const variance = count > 1 ? Math.max(0, m2 / (count - 1)) : null;
  const sd = variance === null ? null : Math.sqrt(variance);
  return { count, mean, sd, variance, se: sd === null ? null : sd / Math.sqrt(count),
    cv: sd !== null && mean > 0 ? 100 * sd / mean : null, min, max };
}

// Spreadsheet users can keep commas, quotes and line breaks inside sample names.
export function makeCsv(rows) {
  const cell = value => {
    if (value == null) return '';
    if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
    const raw = String(value);
    const safe = /^[\s]*[=+@-]/.test(raw) && !Number.isFinite(Number(raw)) ? "'" + raw : raw;
    return '"' + safe.replaceAll('"', '""') + '"';
  };
  return '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n');
}

export function downloadCsv(name, rows) {
  downloadFile(name + '.csv', new Blob([makeCsv(rows)], { type: 'text/csv;charset=utf-8' }));
}

export function downloadFile(name, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function readStored(key, fallback) {
  try {
    const raw = JSON.parse(localStorage.getItem(key));
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) !== Array.isArray(fallback)) return fallback;
    return raw;
  } catch {
    return fallback;
  }
}
