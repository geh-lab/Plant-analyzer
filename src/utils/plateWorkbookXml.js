import { unzipSync, strFromU8 } from 'fflate';
import { SaxesParser } from 'saxes';

const maxXmlBytes = 48 * 1024 * 1024;
const maxRows = 100000;
const maxColumns = 4096;

function parseXml(bytes, handlers) {
  const parser = new SaxesParser();
  const local = name => name.split(':').pop();
  parser.on('doctype', () => { throw new Error('Unsupported workbook XML declaration.'); });
  parser.on('opentag', node => handlers.open?.(local(node.name), node.attributes));
  parser.on('closetag', node => handlers.close?.(local(node.name)));
  if (handlers.text) {
    parser.on('text', handlers.text);
    parser.on('cdata', handlers.text);
  }
  parser.write(strFromU8(bytes)).close();
}

function resolvePart(base, target) {
  const parts = target.startsWith('/') ? [] : base.split('/').slice(0, -1).filter(Boolean);
  for (const part of target.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') {
      if (!parts.length) return null;
      parts.pop();
    } else parts.push(part);
  }
  return parts.join('/');
}

function relationships(files, path, owner) {
  const rels = new Map();
  if (files[path]) parseXml(files[path], {
    open(tag, attrs) {
      if (tag === 'Relationship' && attrs.TargetMode !== 'External') {
        rels.set(attrs.Id, { type: attrs.Type.split('/').pop(), path: resolvePart(owner, attrs.Target) });
      }
    }
  });
  return rels;
}

function sharedStrings(bytes) {
  const strings = [];
  if (!bytes) return strings;
  let current = '', active = false, inText = false, phonetic = false;
  parseXml(bytes, {
    open(tag) {
      if (tag === 'si') { current = ''; active = true; }
      if (tag === 'rPh') phonetic = true;
      if (tag === 't') inText = active && !phonetic;
    },
    text(text) { if (inText) current += text; },
    close(tag) {
      if (tag === 't') inText = false;
      if (tag === 'rPh') phonetic = false;
      if (tag === 'si') { strings.push(current); active = false; }
    }
  });
  return strings;
}

function timeStyles(bytes) {
  const result = new Set();
  if (!bytes) return result;
  const formats = new Map();
  const clockFormats = new Set([18, 19, 20, 21, 45, 46, 47]);
  let inStyles = false, index = 0;
  parseXml(bytes, {
    open(tag, attrs) {
      if (tag === 'numFmt') formats.set(Number(attrs.numFmtId), attrs.formatCode);
      if (tag === 'cellXfs') inStyles = true;
      if (tag === 'xf' && inStyles) {
        const id = Number(attrs.numFmtId);
        const code = (formats.get(id) || '').replace(/"[^"]*"|\\./g, '');
        if (clockFormats.has(id) || /\[[hms]+\]|(?:h+|m+):(?:m+|s+)/i.test(code)) result.add(index);
        index += 1;
      }
    },
    close(tag) { if (tag === 'cellXfs') inStyles = false; }
  });
  return result;
}

const numericCell = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;
export function measurementNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || !numericCell.test(value.trim())) return null;
  const number = Number(value.trim());
  return Number.isFinite(number) ? number : null;
}

function position(address) {
  const match = /^([A-Z]+)([1-9]\d*)$/.exec(address || '');
  if (!match) return null;
  let column = 0;
  for (const letter of match[1]) column = column * 26 + letter.charCodeAt(0) - 64;
  return [Number(match[2]) - 1, column - 1];
}

export function cellAddress(row, column) {
  let name = '';
  for (let n = column + 1; n; n = Math.floor((n - 1) / 26)) {
    name = String.fromCharCode(65 + (n - 1) % 26) + name;
  }
  return name + (row + 1);
}

function readSheet(bytes, strings, clockStyles) {
  const tableIds = [];
  const rows = [], clockCells = new Set(), formulas = Object.create(null), errors = Object.create(null);
  let cell = null, field = '', inSheet = false, phonetic = false, rowNo = -1, nextCol = 0, count = 0;
  parseXml(bytes, {
    open(tag, a) {
      if (tag === 'tablePart') {
        const key = Object.keys(a).find(k => k.endsWith(':id'));
        if (key) tableIds.push(a[key]);
      }
      if (tag === 'sheetData') inSheet = true;
      if (!inSheet) return;
      if (tag === 'row') { rowNo = a.r ? Number(a.r) - 1 : rowNo + 1; nextCol = 0; }
      if (tag === 'c') {
        const [r, c] = position(a.r) || [rowNo, nextCol];
        if (r < 0 || c < 0 || r >= maxRows || c >= maxColumns || ++count > 500000) throw new Error('Worksheet exceeds supported dimensions.');
        nextCol = c + 1;
        cell = { r, c, t: a.t, style: Number(a.s || 0), v: '', tValue: '', f: null };
      }
      if (!cell) return;
      if (tag === 'rPh') phonetic = true;
      if (tag === 'v') field = 'v';
      if (tag === 'f') { field = 'f'; cell.f = ''; }
      if (tag === 't' && !phonetic) field = 'tValue';
    },
    text(text) { if (cell && field) cell[field] += text; },
    close(tag) {
      if (tag === 'sheetData') inSheet = false;
      if (tag === 'rPh') phonetic = false;
      if (['f', 't', 'v'].includes(tag)) field = '';
      if (tag !== 'c' || !cell) return;
      const { r, c, t, style, v, tValue, f } = cell;
      const addr = cellAddress(r, c);
      if (f !== null) formulas[addr] = f;
      if (t === 'e') errors[addr] = v || '#ERROR!';
      let value;
      if (t === 's') value = v === '' ? null : strings[Number(v)] ?? null;
      else if (t === 'inlineStr') value = tValue;
      else if (t === 'b') value = v === '1' ? 'TRUE' : 'FALSE';
      else if (t === 'str' || t === 'e' || t === 'd') value = v;
      else value = measurementNumber(v) ?? (v || null);
      if (value !== null || f !== null) {
        const row = rows[r] || (rows[r] = []);
        row[c] = value;
        if (clockStyles.has(style)) clockCells.add(addr);
      }
      cell = null;
    }
  });
  return { rows, formulas, errors, clockCells, tableIds };
}

function sheetTables(files, sheetPath, ids) {
  if (!ids.length) return [];
  const parts = sheetPath.split('/');
  const filename = parts.pop();
  const rels = relationships(files, [...parts, '_rels', filename + '.rels'].join('/'), sheetPath);
  const tables = [];
  for (const id of ids) {
    const part = rels.get(id);
    if (part?.type !== 'table' || !files[part.path]) continue;
    let table = null;
    parseXml(files[part.path], { open(tag, attrs) {
      if (tag === 'table') table = { name: attrs.displayName || attrs.name, range: attrs.ref, columns: [] };
      if (tag === 'tableColumn' && table) table.columns.push(attrs.name);
    } });
    if (table) tables.push(table);
  }
  return tables;
}

export function decodeWorkbook(bytes) {
  if (!bytes.length || bytes.length > 24 * 1024 * 1024) throw new Error('Unsupported workbook size.');
  let total = 0;
  const files = unzipSync(bytes, { filter(entry) {
    const use = /(?:\.xml|\.rels)$/i.test(entry.name) && !/(?:^|\/)(?:charts|drawings|theme|printerSettings|media|pivotCache|externalLinks)\//i.test(entry.name);
    if (use && (total += entry.originalSize) > maxXmlBytes) throw new Error('Worksheet XML is too large.');
    return use;
  } });
  const root = relationships(files, '_rels/.rels', '');
  const bookPath = [...root.values()].find(x => x.type === 'officeDocument')?.path ?? 'xl/workbook.xml';
  if (!files[bookPath]) throw new Error('This is not an Excel workbook.');
  const dir = bookPath.split('/').slice(0,-1).join('/');
  const rels = relationships(files, [dir, '_rels', bookPath.split('/').pop() + '.rels'].filter(Boolean).join('/'), bookPath);
  const lookup = type => files[[...rels.values()].find(x => x.type === type)?.path];
  const strings = sharedStrings(lookup('sharedStrings'));
  const clocks = timeStyles(lookup('styles'));
  const sheets = [];
  parseXml(files[bookPath], { open(tag, a) {
    if (tag !== 'sheet') return;
    const rid = Object.keys(a).find(key => key.endsWith(':id'));
    const target = rels.get(a[rid]);
    if (target?.type !== 'worksheet' || !files[target.path]) return;
    const { tableIds, ...data } = readSheet(files[target.path], strings, clocks);
    sheets.push({ name: a.name, ...data, tables: sheetTables(files, target.path, tableIds) });
  } });
  if (!sheets.length) throw new Error('No worksheets were found.');
  return sheets;
}
