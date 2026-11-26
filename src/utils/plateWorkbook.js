import { cellAddress, decodeWorkbook, measurementNumber } from './plateWorkbookXml.js';

const text = value => String(value ?? '').trim();
const physicalWell = /^[A-P](?:[1-9]|1\d|2[0-4])$/;
const numberLabel = /^(\d+(?:\.\d+)?)\s*(?:nm)?\s*(?:\[(\d+)\])?$/i;
const dict = () => Object.create(null);
const concentrationRow = /^Conc\/Dil(?:\s*\(([^)]+)\)|\s*\[([^\]]+)\]|\s+(.+))?$/i;

function identifyChannel(label) {
  let m = numberLabel.exec(label);
  if (m && Number(m[1]) >= 190 && Number(m[1]) <= 1100) return { kind: 'raw', wavelength: Number(m[1]), repeat: Number(m[2] || 1) };
  m = /^Corrected\s*\[(\d+(?:\.\d+)?)\]$/i.exec(label);
  if (m) return { kind: 'corrected', wavelength: Number(m[1]), repeat: 1 };
  m = /^Blank\s+(\d+(?:\.\d+)?)(?:\[(\d+)\])?$/i.exec(label);
  if (m) return { kind: 'blanked', wavelength: Number(m[1]), repeat: Number(m[2] || 1) };
  m = /^(\d+(?:\.\d+)?)\s*\[(?:Test|Ref)\]$/i.exec(label);
  return { kind: m ? 'reference' : 'derived', wavelength: m ? Number(m[1]) : null, repeat: 1 };
}

function gridColumns(row, next) {
  const start = row?.findIndex(v => measurementNumber(v) === 1) ?? -1;
  if (start < 1 || !/^[A-P]$/.test(text(next?.[start - 1]))) return null;
  let count = 1;
  while (measurementNumber(row[start + count]) === count + 1) count += 1;
  return [6, 12, 24].includes(count) ? { start, count } : null;
}

function readPlateGrids(sheet) {
  const { rows, formulas, errors } = sheet;
  const layout = dict(), blocks = [], usedKeys = new Set();
  let section = '';
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;
    const title = text(row[0]);
    if (title === 'Layout' || title === 'Results') { section = title; continue; }
    if (title) {
      if (!/temperature\s*:/i.test(title)) section = '';
      continue;
    }
    const grid = gridColumns(row, rows[r + 1]);
    if (!grid || !section) continue;
    const { start, count } = grid;
    const channels = new Map();
    let letter = '';
    let end = r + 1;
    for (; end < rows.length; end++) {
      const data = rows[end];
      if (!data || text(data[0]) || !text(data[start + count])) break;
      const rowName = text(data[start - 1]);
      if (rowName && !/^[A-P]$/.test(rowName)) break;
      if (rowName) letter = rowName;
      if (!letter) break;
      const label = text(data[start + count]);
      let block = null;
      if (section === 'Results') {
        block = channels.get(label);
        if (!block) {
          let key = label, version = 2;
          while (usedKeys.has(key)) key = label + ' #' + version++;
          usedKeys.add(key);
          block = { key, label, ...identifyChannel(label), values: dict(), flags: dict(), cells: dict() };
          channels.set(label, block);
          blocks.push(block);
        }
      }
      for (let j = 0; j < count; j++) {
        const well = letter + (j + 1), col = start + j;
        const addr = cellAddress(end, col), v = data[col];
        if ((v === null || v === undefined || text(v) === '') && !Object.hasOwn(formulas, addr)) continue;
        if (section === 'Layout') {
          const entry = layout[well] || (layout[well] = { label: '', concentration: null });
          if (label === 'Well ID') entry.label = text(v);
          if (concentrationRow.test(label)) entry.concentration = measurementNumber(v);
        } else {
          const n = measurementNumber(v);
          block.cells[well] = addr;
          if (Object.hasOwn(errors, addr)) block.flags[well] = errors[addr];
          else if (Object.hasOwn(formulas, addr) && block.kind === 'raw') block.flags[well] = 'Formula: ' + (formulas[addr] || 'shared formula');
          else if (n !== null) block.values[well] = n;
          else block.flags[well] = text(v) || 'No cached value';
        }
      }
    }
    r = end - 1;
  }
  return { layout, blocks };
}

function seconds(value, header, clock) {
  if (typeof value === 'string') {
    const parts = /^(\d+):(\d{2}):(\d{2}(?:\.\d+)?)$/.exec(value.trim());
    if (parts && Number(parts[2]) < 60 && Number(parts[3]) < 60) {
      return Number(parts[1]) * 3600 + Number(parts[2]) * 60 + Number(parts[3]);
    }
  }
  const n = measurementNumber(value);
  if (n === null) return null;
  if (/\b(?:s|sec(?:ond)?s?)\b/i.test(header)) return n;
  if (/\b(?:min(?:ute)?s?)\b/i.test(header)) return n * 60;
  return clock ? Math.round(n * 86400 * 1e6) / 1e6 : null;
}

function readKineticSeries(sheet) {
  const { rows, clockCells, formulas } = sheet, kinetics = [];
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;
    const timeCol = row.findIndex(value => /^Time(?:\s*\((?:s|sec(?:ond)?s?|min(?:ute)?s?)\))?$/i.test(text(value)));
    if (timeCol < 0) continue;
    const columns = [];
    row.forEach((v, c) => { if (c > timeCol && physicalWell.test(text(v))) columns.push([c, text(v)]); });
    if (!columns.length) continue;
    let before = r - 1;
    while (before >= 0 && !rows[before]?.some(v => text(v))) before--;
    const label = text(rows[before]?.[0]);
    const channel = identifyChannel(label);
    if (!['raw', 'blanked'].includes(channel.kind)) continue;
    const series = { label, ...channel, times: [], values: dict(), cells: dict(), flags: dict(), issues: [] };
    columns.forEach(([, well]) => { series.values[well] = []; series.cells[well] = []; });
    for (let n = r + 1; n < rows.length; n++) {
      const record = rows[n];
      if (!record || !text(record[timeCol])) break;
      const timeCell = cellAddress(n, timeCol);
      const t = seconds(record[timeCol], text(row[timeCol]), clockCells.has(timeCell));
      if (t === null) {
        series.issues.push({ code: 'time_unit', cell: timeCell });
        break;
      }
      if (t < 0 || (series.times.length && t <= series.times.at(-1))) {
        series.issues.push({ code: 'time_order', cell: timeCell });
        break;
      }
      series.times.push(t);
      for (const [col, well] of columns) {
        const address = cellAddress(n, col), raw = record[col], formula = Object.hasOwn(formulas, address);
        const numeric = formula ? null : measurementNumber(raw);
        series.cells[well].push(address);
        series.values[well].push(numeric);
        if ((text(raw) || formula) && numeric === null) {
          if (!series.flags[well]) series.flags[well] = [];
          series.flags[well].push({ cell: address, flag: formula ? 'Formula' : text(raw) });
        }
      }
    }
    // An unknown time base invalidates the entire series. Keep the diagnostic location.
    if (series.issues.length) {
      series.times = []; series.values = dict(); series.cells = dict();
    }
    kinetics.push(series);
  }
  return kinetics;
}

function readMetadata(rows, blocks) {
  const get = label => {
    const row = rows.find(r => text(r?.[0]).replace(/:$/, '') === label);
    return text(row?.[1]);
  };
  const wavelengths = [];
  rows.forEach(row => row?.forEach(value => {
    const m = /^Wavelengths:\s*(.*)/i.exec(text(value));
    if (m) for (const channel of m[1].split(',')) {
      const n = measurementNumber(channel);
      if (n !== null) wavelengths.push(n);
    }
  }));
  const file = key => get(key).split(/[\\/]/).pop() || '';
  const units = new Set(blocks.flatMap(b => {
    if (b.kind !== 'derived') return [];
    const declared = /^(?:\[Concentration\]|Concentration\b)(.*)$/i.exec(b.label);
    const suffix = declared?.[1].replace(/^[\s:=([\]]+|[\])\s]+$/g,'');
    const unit = /(?:^|\s|[[(])((?:[pnumµμk]?mol|[pnumµμk]?g|IU|U)\s*\/\s*(?:[dmµμu]?[lL]|[mk]?g)(?:\s+(?:DW|FW))?|[numµμ]?M|ppm|ppb|%)[\])]?$/.exec(b.label);
    return unit ? [unit[1]] : suffix ? [suffix] : [];
  }));
  for (const row of rows) {
    if (!row) continue;
    const label = text(row[0]).replace(/:$/, '');
    if (/^(?:standard |calibration )?concentration units?$/i.test(label) && text(row[1])) units.add(text(row[1]));
    for (const cell of row) {
      if (typeof cell !== 'string') continue;
      const unit = concentrationRow.exec(cell.trim())?.slice(1).find(Boolean);
      if (unit) units.add(unit.trim());
    }
  }
  return { reader: get('Reader Type'), plate: get('Plate Number'), protocol: file('Protocol File Path'),
    experiment: file('Experiment File Path'), wavelengths, readMode: get('Read'),
    concentrationUnits: [...units], concentrationUnit: units.size === 1 ? [...units][0] : null };
}

function readCurves(rows) {
  const curves = [];
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;
    const nameCol = row.indexOf('Curve Name'), formulaCol = row.indexOf('Curve Formula');
    if (nameCol < 0 || formulaCol < 0) continue;
    const a = row.indexOf('A'), b = row.indexOf('B'), r2 = row.indexOf('R2');
    for (let n = r + 1; n < rows.length && text(rows[n]?.[nameCol]) && text(rows[n]?.[formulaCol]); n++) {
      const next = rows[n], formula = text(next[formulaCol]);
      const linear = /^Y=A\*X\+B$/i.test(formula.replace(/\s/g, ''));
      const curve = { name: text(next[nameCol]), formula, slope: linear ? measurementNumber(next[a]) : null,
        intercept: linear ? measurementNumber(next[b]) : null, r2: measurementNumber(next[r2]) };
      const signalCol = row.findIndex(value => /^(?:signal|channel|y axis|y data|wavelength)$/i.test(text(value)));
      const unitCol = row.findIndex(value => /^(?:x unit|concentration unit)s?$/i.test(text(value)));
      if (text(next[signalCol])) curve.signal = text(next[signalCol]);
      if (text(next[unitCol])) curve.unit = text(next[unitCol]);
      curves.push(curve);
    }
  }
  return curves;
}

export async function readPlateWorkbook(file) {
  if (file?.size > 24 * 1024 * 1024) throw new Error('Unsupported workbook size.');
  const buffer = typeof file?.arrayBuffer === 'function' ? await file.arrayBuffer() : file;
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const sheets = decodeWorkbook(bytes).map(sheet => {
    const { layout, blocks } = readPlateGrids(sheet);
    return { name: sheet.name, rows: sheet.rows, formulas: sheet.formulas, errors: sheet.errors, tables: sheet.tables,
      metadata: readMetadata(sheet.rows, blocks), layout, blocks, kinetics: readKineticSeries(sheet), curves: readCurves(sheet.rows) };
  });
  return { fileName: file?.name || '', sheets };
}
