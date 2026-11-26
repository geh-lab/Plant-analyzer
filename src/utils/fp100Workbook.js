import { decodeWorkbook, measurementNumber, cellAddress } from "./plateWorkbookXml.js";

const unitScale = { us: 0.001, ms: 1, s: 1000 };
const label = value => value == null ? "" : String(value).trim();
const first = row => label(row?.[0]);

function nativeUnit(value) {
  const unit = label(value).normalize("NFKC").toLowerCase().replace(/[µμ]/g, "u").replace(/^\[|\]$/g, "").trim();
  return Object.hasOwn(unitScale, unit) ? unit : null;
}

function numeric(value) {
  if (typeof value === "string" && /^[+-]?\d*,\d+(?:e[+-]?\d+)?$/i.test(value.trim()))
    return measurementNumber(value.replace(",", "."));
  return measurementNumber(value);
}

function measurementBlocks(sheet) {
  const blocks = [];
  let protocol = "", methodId = "", current, section;
  for (const [index, row] of sheet.rows.entries()) {
    if (!row) continue;
    const key = first(row);
    const header = /^Measuring\s*[-–:]\s*(.+)$/i.exec(key);
    if (header || /^FluorPen ASCII Export File$/i.test(key)) {
      protocol = header?.[1].trim() || "";
      methodId = /^(LC[123]|NPQ[12])(?:$|[\s-])/i.exec(protocol)?.[1].toLowerCase() || "";
      current = null;
      section = null;
    } else if (methodId && /^(SOURCE DATA|COMPUTED VALUES)$/i.test(key)) {
      const kind = key.toUpperCase() === "SOURCE DATA" ? "raw" : "reported";
      if (!current || kind === "raw" || current.reported.length) {
        current = { block: blocks.length + 1, methodId, protocol, raw: [], reported: [] };
        blocks.push(current);
      }
      section = current[kind];
    } else if (section) section.push({ row, index });
  }
  return blocks;
}

function table(section, sheet, reported) {
  const position = section.findIndex(({row}) => reported ? /^name$/i.test(first(row)) : Boolean(nativeUnit(first(row))));
  if (position < 0) return null;
  const unit = reported ? null : nativeUnit(first(section[position].row));
  const descriptor = section.slice(0,position).find(({row}) => /^descr$/i.test(first(row)))?.row || [];
  const columns = section[position].row.flatMap((v,col) => col && label(v)
    ? [{ col, id:label(v), description:label(descriptor[col]), clock:"" }] : []);
  if (!columns.length) return null;
  const rows = [];
  for (const {row, index} of section.slice(position + 1)) {
    const key = first(row);
    if (/^-{2,}$/.test(key)) {
      if (rows.length) break;
      continue;
    }
    const hasValues = columns.some(({col}) => label(row[col]) !== "");
    if (!key && !hasValues) continue;
    // The optional row after trace IDs contains acquisition clocks. Blank time
    // cells in the data section are never allowed to become clocks or time zero.
    if (!key && !rows.length && columns.some(({col}) =>
      /\d{1,2}:\d{2}/.test(label(row[col])) || sheet.clockCells?.has(cellAddress(index,col)))) {
      for (const column of columns) column.clock = label(row[column.col]);
      continue;
    }
    if (reported && !key) continue;
    rows.push(row);
  }
  return { unit, columns, rows };
}

function matchColumn(column, rawColumns, reportedColumns) {
  const raw = rawColumns.filter(c => c.id === column.id);
  const reported = reportedColumns.filter(c => c.id === column.id);
  if (column.clock) {
    const matches = reported.filter(c => c.clock === column.clock);
    if (matches.length === 1 && raw.filter(c => c.clock === column.clock).length === 1) return matches[0];
  }
  return raw.length === 1 && reported.length === 1 && (!column.clock || !reported[0].clock) ? reported[0] : null;
}

function tracePoints(raw, col) {
  let skipped = 0, duplicates = 0;
  const readings = new Map();
  for (const row of raw?.rows || []) {
    const elapsed = numeric(row[0]), value = numeric(row[col]);
    if (elapsed === null || elapsed < 0 || value === null) { skipped++; continue; }
    const timeMs = raw.unit === "us" ? elapsed / 1000 : elapsed * unitScale[raw.unit];
    if (readings.has(timeMs)) {
      duplicates++;
      readings.set(timeMs, null);
    } else readings.set(timeMs, value);
  }
  // Retain unambiguous times in a partial trace. Replicate observations from
  // one acquisition must not inflate the number of leaves at a shared time.
  return { points:[...readings].filter(([,v]) => v !== null).sort((a,b) => a[0]-b[0]), skipped, duplicates };
}

function readRun(sheet, block) {
  const raw = table(block.raw, sheet, false), computed = table(block.reported, sheet, true);
  if (!raw && !computed) return null;
  const parameterRows = new Map();
  for (const row of computed?.rows || []) {
    const name = first(row);
    parameterRows.set(name, parameterRows.has(name) ? null : row);
  }
  const leaves = [], matched = new Set();
  const sourceColumns = raw?.columns || computed.columns;
  let skipped = 0, duplicates = 0;
  for (const column of sourceColumns) {
    const reportColumn = raw ? matchColumn(column, raw.columns, computed?.columns || []) : column;
    if (reportColumn) matched.add(reportColumn.col);
    const reported = reportColumn ? Object.fromEntries([...parameterRows].map(([key,row]) => [key,numeric(row?.[reportColumn.col])])) : {};
    const trace = tracePoints(raw, column.col);
    skipped += trace.skipped;
    duplicates += trace.duplicates;
    if (!trace.points.length && !Object.values(reported).some(Number.isFinite)) continue;
    const id = column.id;
    const description = column.description || reportColumn?.description || "";
    const repeatedId = sourceColumns.some(c => c !== column && c.id === id);
    leaves.push({
      traceKey: JSON.stringify([sheet.name, block.block, id, column.col]), traceId:id,
      name: repeatedId ? id + " [" + column.col + "]" : id,
      group:description || "Unassigned", description,
      recordedAt:column.clock || reportColumn?.clock || "", points:trace.points, reported,
      skipped:trace.skipped, duplicates:trace.duplicates,
    });
  }
  if (!leaves.length) return null;
  return {
    id:JSON.stringify([sheet.name, block.block]), sheetName:sheet.name, block:block.block,
    kind:block.methodId.startsWith("lc") ? "lc" : "npq", methodId:block.methodId, protocol:block.protocol,
    leaves, metrics:[...parameterRows.keys()], sourceUnit:raw?.unit || null, skipped, duplicates,
    unmatchedReported:(computed?.columns.length || 0) - matched.size,
  };
}

export function parseFp100WorkbookSheets(sheets, fileName = "") {
  const runs = sheets.flatMap(sheet => measurementBlocks(sheet).map(block => readRun(sheet, block)).filter(Boolean));
  if (!runs.length) {
    const error = new Error("No usable FluorPen LC or NPQ export was found in this workbook.");
    error.code = "unsupported_fp100_workbook";
    throw error;
  }
  return { format:"fluorpen-workbook", fileName, runs,
    skipped:runs.reduce((n,r) => n + r.skipped,0), duplicates:runs.reduce((n,r) => n + r.duplicates,0) };
}

export async function readFp100Workbook(file) {
  if (file?.size > 24 * 1024 * 1024) throw new Error("Unsupported workbook size.");
  const data = typeof file?.arrayBuffer === "function" ? await file.arrayBuffer() : file;
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  return parseFp100WorkbookSheets(decodeWorkbook(bytes), file?.name || "");
}
