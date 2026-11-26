import { delimitedFields, measurementNumber } from "./instrumentData.js";
import { summarize } from "./resultData.js";

export const fpTimings = {
  study: { O: 0.02, K: 0.3, J: 2, I: 30 },
  manual: { O: 0.05, K: 0.3, J: 2, I: 60 },
};

export const fpMetrics = [
  "Fv/Fm",
  "Mo",
  "VJ",
  "VI",
  "ΦPo",
  "ΨEo",
  "ΦEo",
  "ΦDo",
  "δRo",
  "ΦRo",
  "ABS/RC",
  "TRo/RC",
  "ETo/RC",
  "DIo/RC",
  "REo/RC",
  "RC/CSm",
  "ABS/CSm",
  "TRo/CSm",
  "ETo/CSm",
  "DIo/CSm",
  "REo/CSm",
];

export const phaseBounds = {
  WOP: ["O", "P"],
  WOK: ["O", "K"],
  WOJ: ["O", "J"],
  WJI: ["J", "I"],
  WIP: ["I", "P"],
};
const valid = Number.isFinite;
const ratio = (a, b) =>
  valid(a) && valid(b) && b > 0 && valid(a / b) ? a / b : null;
const product = (...values) =>
  values.every(valid) ? values.reduce((a, b) => a * b, 1) : null;
const minus = (a, b) => (valid(a) && valid(b) ? a - b : null);
function normalizedTime(time) {
  return Number(time.toPrecision(12));
}

const timeHeaders = {
  timems: 1,
  tus: 0.001,
  timeus: 0.001,
  tms: 1,
  times: 1000,
  ts: 1000,
  시간ms: 1,
  시간us: 0.001,
  시간s: 1000,
};
function headerKey(cell) {
  return cell
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[µμ]/g, "u")
    .replace(/[\s_[\]().-]/g, "");
}

// FluorPen ASCII exports may be saved again by regional spreadsheet software.
export function decodeFp100Text(data) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  if ((bytes[0] === 0xff && bytes[1] === 0xfe) ||
      (bytes[1] === 0 && bytes[3] === 0 && bytes[0] && bytes[2]))
    return new TextDecoder("utf-16le").decode(bytes);
  if ((bytes[0] === 0xfe && bytes[1] === 0xff) ||
      (bytes[0] === 0 && bytes[2] === 0 && bytes[1] && bytes[3]))
    return new TextDecoder("utf-16be").decode(bytes);
  for (const encoding of ["utf-8", "euc-kr"]) {
    try {
      return new TextDecoder(encoding, { fatal: true }).decode(bytes);
    } catch {
      // Try the next encoding when a byte sequence is invalid.
    }
  }
  return new TextDecoder("windows-1252").decode(bytes);
}

function fpNumber(cell, decimalComma) {
  return measurementNumber(decimalComma && typeof cell === "string"
    ? cell.replace(/^(\s*[+-]?\d*),(\d+(?:[Ee][+-]?\d+)?\s*)$/, "$1.$2") : cell);
}

function nativeTable(lines, findHeader) {
  const rows = lines.map((line) => delimitedFields(line, "\t"));
  const index = rows.findIndex(([first]) => findHeader(headerKey(first)));
  if (index < 0) return null;
  const header = rows[index];
  const data = rows.slice(index + 1);
  const timestamps = data[0]?.[0] === "" ? data.shift() : [];
  const columns = header.flatMap((traceId, col) => col && traceId
    ? [{ col, traceId, recordedAt: timestamps[col] || "" }] : []);
  return { header, columns, rows: data.filter(([first]) => first && !/^-+$/.test(first)) };
}

const nativeTimeUnits = { us: 0.001, ms: 1, s: 1000, ...timeHeaders };

function readNativeBlock(block, group, result) {
  const raw = nativeTable(block.source, (key) => Object.hasOwn(nativeTimeUnits, key));
  if (!raw?.columns.length) return;
  result.header = true;
  const scale = nativeTimeUnits[headerKey(raw.header[0])];
  const firmware = nativeTable(block.computed, (key) => key === "name");
  for (const { traceId, col, recordedAt } of raw.columns) {
    const points = new Map();
    let duplicate = false;
    for (const row of raw.rows) {
      const time = fpNumber(row[0], true);
      const signal = fpNumber(row[col], true);
      if (time === null || time <= 0 || signal === null || signal < 0) {
        result.skipped++;
        continue;
      }
      const ms = normalizedTime(time * scale);
      if (points.has(ms)) {
        duplicate = true;
        result.duplicates++;
      } else points.set(ms, signal);
    }
    if (duplicate || !points.size) continue;
    // The summary may reorder trace columns. An ambiguous ID with no clock
    // must not assign one firmware result to more than one acquisition.
    const byId = firmware?.columns.filter((column) => column.traceId === traceId) || [];
    const exact = recordedAt ? byId.filter((column) => column.recordedAt === recordedAt) : [];
    const rawIds = raw.columns.filter((column) => column.traceId === traceId);
    let summaryCol;
    if (exact.length === 1 && rawIds.filter((column) => column.recordedAt === recordedAt).length === 1)
      summaryCol = exact[0].col;
    else if (rawIds.length === 1 && byId.length === 1 && (!recordedAt || !byId[0].recordedAt))
      summaryCol = byId[0].col;
    const reported = summaryCol === undefined ? {} : Object.fromEntries(
      firmware.rows.map((row) => [row[0], fpNumber(row[summaryCol], true)]),
    );
    result.leaves.push({
      name: traceId, group, traceId, recordedAt, block: block.number, traceColumn: col,
      traceKey: JSON.stringify([block.number, traceId, col]),
      protocol: block.protocol, reported,
      points: [...points].sort((a, b) => a[0] - b[0]),
    });
  }
}

function parseFluorPen(lines, group) {
  const result = { leaves: [], skipped: 0, duplicates: 0, header: false, format: "fluorpen" };
  const blocks = [];
  let protocol = "", block, section;
  for (const line of lines) {
    const first = line.split("\t", 1)[0].trim();
    const measuring = /^Measuring\s*[-–:]\s*(.+)$/i.exec(first);
    if (measuring) {
      protocol = measuring[1].trim();
      block = null;
      section = null;
    } else if (/^SOURCE DATA$/i.test(first)) {
      block = null;
      section = null;
      if (/\bOJIP\b/i.test(protocol)) {
        block = { number: blocks.length + 1, protocol, source: [], computed: [] };
        blocks.push(block);
        section = block.source;
      }
    } else if (/^COMPUTED VALUES$/i.test(first)) {
      section = block?.computed;
    } else if (section) section.push(line);
  }
  for (const entry of blocks) readNativeBlock(entry, group, result);
  const counts = new Map();
  for (const { traceId } of result.leaves) counts.set(traceId, (counts.get(traceId) || 0) + 1);
  for (const leaf of result.leaves) {
    if (counts.get(leaf.traceId) > 1)
      leaf.name = leaf.traceId + " [" + leaf.block + "." + leaf.traceColumn + "]";
  }
  return result;
}

// Each time series belongs to one leaf within its treatment.
export function parseFp100(text = "", { group: nativeGroup = "Unassigned" } = {}) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r\n|[\r\n]/)
    .filter((line) => line.trim());
  if (/^FluorPen ASCII Export File\s*$/i.test(lines[0]?.trim()))
    return parseFluorPen(lines, nativeGroup || "Unassigned");
  const empty = { leaves: [], skipped: 0, duplicates: 0, header: false, format: "table" };
  if (!lines.length) return empty;
  const delimiter = lines[0].includes("\t")
    ? "\t"
    : lines[0].includes(";")
      ? ";"
      : ",";
  const headers = delimitedFields(lines[0], delimiter).map(headerKey);
  const sample = headers.findIndex((h) =>
    ["sample", "leaf", "sampleid", "시료", "시료명"].includes(h),
  );
  const group = headers.findIndex((h) =>
    ["group", "treatment", "처리구", "그룹"].includes(h),
  );
  const time = headers.findIndex((h) => Object.hasOwn(timeHeaders, h));
  const signal = headers.findIndex((h) =>
    ["ft", "fluorescence", "fluorescenceau", "ftau", "형광"].includes(h),
  );
  if ([sample, group, time, signal].includes(-1)) return empty;

  const leaves = new Map();
  let skipped = 0,
    duplicates = 0;
  for (const line of lines.slice(1)) {
    const cells = delimitedFields(line, delimiter);
    const t = fpNumber(cells[time], delimiter !== ","),
      f = fpNumber(cells[signal], delimiter !== ",");
    const name = cells[sample],
      treatment = cells[group];
    if (!name || !treatment || t === null || t <= 0 || f === null || f < 0) {
      skipped++;
      continue;
    }
    const id = JSON.stringify([treatment, name]);
    if (!leaves.has(id))
      leaves.set(id, {
        name,
        group: treatment,
        points: new Map(),
        duplicate: false,
      });
    const leaf = leaves.get(id),
      ms = normalizedTime(t * timeHeaders[headers[time]]);
    if (leaf.points.has(ms)) {
      leaf.duplicate = true;
      duplicates++;
      continue;
    }
    leaf.points.set(ms, f);
  }
  return {
    leaves: [...leaves.values()]
      .filter((leaf) => !leaf.duplicate)
      .map((leaf) => ({
        group: leaf.group,
        name: leaf.name,
        points: [...leaf.points].sort((a, b) => a[0] - b[0]),
      })),
    skipped,
    duplicates,
    header: true,
    format: "table",
  };
}

export function analyzeLeaf(leaf, protocol = "study") {
  const times = fpTimings[protocol] || fpTimings.study;
  const signal = new Map(leaf.points);
  // Require a measured maximum reached after I and a post-I observation.
  // Early or incomplete traces can still contribute to their observed phase windows.
  let peak = null;
  for (const point of leaf.points)
    if (!peak || point[1] > peak[1]) peak = point;
  if (!peak || peak[0] <= times.I) peak = null;
  const bounds = Object.fromEntries(
    Object.entries(times).map(([label, time]) => [
      label,
      [time, signal.get(time) ?? null],
    ]),
  );
  bounds.P = peak || [null, null];
  const fo = bounds.O[1],
    fm = bounds.P[1],
    fv = minus(fm, fo),
    f50 = signal.get(0.05);
  const vj = ratio(minus(bounds.J[1], fo), fv),
    vi = ratio(minus(bounds.I[1], fo), fv);
  const phi = ratio(fv, fm),
    psi = minus(1, vj),
    delta = ratio(minus(1, vi), psi);
  // Supplementary Table S1 explicitly uses F50 for Mo in both numerator and denominator.
  const mo = product(4, ratio(minus(bounds.K[1], f50), minus(fm, f50)));
  const trapped = ratio(mo, vj),
    absorb = ratio(trapped, phi),
    transported = product(trapped, psi);
  const dissipation = minus(absorb, trapped),
    end = product(transported, delta);
  const density = product(phi, ratio(vj, mo), fm);
  const metrics = {
    "Fv/Fm": phi,
    Mo: mo,
    VJ: vj,
    VI: vi,
    ΦPo: phi,
    ΨEo: psi,
    ΦEo: product(phi, psi),
    ΦDo: minus(1, phi),
    δRo: delta,
    ΦRo: product(phi, psi, delta),
    "ABS/RC": absorb,
    "TRo/RC": trapped,
    "ETo/RC": transported,
    "DIo/RC": dissipation,
    "REo/RC": end,
    "RC/CSm": density,
  };
  for (const prefix of ["ABS", "TRo", "ETo", "DIo", "REo"])
    metrics[prefix + "/CSm"] = product(metrics[prefix + "/RC"], density);
  return { ...leaf, bounds, metrics };
}

export function fpCurves(
  leaves,
  phase = "Ft",
  control = "",
  difference = false,
) {
  const grouped = new Map();
  for (const leaf of leaves) {
    let starts, ends;
    if (phase !== "Ft")
      [starts, ends] = phaseBounds[phase].map((id) => leaf.bounds[id]);
    for (const [t, ft] of leaf.points) {
      let value = ft;
      if (phase !== "Ft") {
        if (
          !valid(starts[1]) ||
          !valid(ends[1]) ||
          t < starts[0] ||
          t > ends[0]
        )
          continue;
        value = ratio(ft - starts[1], ends[1] - starts[1]);
      }
      if (!valid(value)) continue;
      if (!grouped.has(t)) grouped.set(t, new Map());
      const groups = grouped.get(t);
      if (!groups.has(leaf.group)) groups.set(leaf.group, []);
      groups.get(leaf.group).push(value);
    }
  }
  return [...grouped]
    .sort((a, b) => a[0] - b[0])
    .map(([t, groupValues]) => {
      const baseline = difference
        ? summarize(groupValues.get(control) || [])
        : null;
      const series = [...groupValues].map(([group, values]) => {
        const { mean, count, se } = summarize(values);
        return {
          group,
          count,
          mean: difference ? minus(mean, baseline.mean) : mean,
          se: difference ? null : se,
          controlCount: baseline?.count ?? null,
        };
      });
      return { t, series };
    });
}

export function fpGroups(leaves, metric, control) {
  const byGroup = new Map();
  for (const { group, metrics } of leaves) {
    if (!byGroup.has(group)) byGroup.set(group, []);
    byGroup.get(group).push(metrics[metric]);
  }
  const reference = summarize(byGroup.get(control) || []).mean;
  return [...byGroup].map(([group, values]) => {
    const summary = summarize(values);
    return { group, ...summary, relative: ratio(summary.mean, reference) };
  });
}
