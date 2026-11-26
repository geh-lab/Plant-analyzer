import { numeric } from './resultData.js';
import { hplcCompoundLabel } from '../data/hplcProtocols.js';

export function treatmentLabel(row, lang) {
  return [row.factor, row.treatment].filter(Boolean).join(' / ') || (lang === 'en' ? 'Unassigned' : '미지정');
}

export function hplcMatrix(results, unit, lang, compounds = [...new Set(results.map(row => row.compound).filter(Boolean))].sort()) {
  const columns = compounds.map((name, i) => ({ key: 'c' + i, label: hplcCompoundLabel(name, lang), unit }));
  const keys = new Map(compounds.map((name, i) => [name, columns[i].key]));
  const samples = new Map();
  for (const row of results) {
    if (!keys.has(row.compound)) continue;
    const id = JSON.stringify([row.sampleName, row.factor, row.treatment, row.replicate]);
    if (!samples.has(id)) samples.set(id, { name: row.sampleName, group: treatmentLabel(row, lang), replicate: row.replicate, readings: new Map() });
    const { readings } = samples.get(id);
    const key = keys.get(row.compound);
    if (!readings.has(key)) readings.set(key, []);
    readings.get(key).push(numeric(row.concentration));
  }
  const rows = [];
  for (const sample of samples.values()) {
    const group = sample.group + (sample.replicate ? ' · ' + (lang === 'en' ? 'Rep ' : '반복 ') + sample.replicate : '');
    const singles = {}, separate = [];
    for (const [key, values] of sample.readings) {
      if (values.length === 1) singles[key] = values[0];
      // Duplicate records have no shared injection ID. Keep them separate rather than pairing peaks from unknown runs.
      else values.forEach((value, i) => separate.push({ name: sample.name + ' · ' + (i + 1), group, values: { [key]: value } }));
    }
    if (Object.keys(singles).length) rows.push({ name: sample.name, group, values: singles });
    rows.push(...separate);
  }
  return { columns, rows };
}
