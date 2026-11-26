// CSV/TSV exported by instruments or pasted from a spreadsheet.
export function delimitedFields(line, delimiter) {
  const cells = [];
  let cell = "",
    quoted = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      if (quoted && line[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (!quoted && line[i] === delimiter) {
      cells.push(cell.trim());
      cell = "";
    } else cell += line[i];
  }
  cells.push(cell.trim());
  return cells;
}

export function measurementNumber(raw) {
  if (raw === null || raw === undefined) return null;
  const text = String(raw)
    .trim()
    .replace(/−/g, "-")
    .replace(/([eE])\s*([+-]?)\s*(\d+)/g, "$1$2$3");
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

const normalizeColumn = (value) =>
  value
    .toLowerCase()
    .replace(/^(?:gasex|meas|light)[:._]/, "")
    .replace(/\s*\([^)]*\)|\s*\[[^\]]*\]/g, "")
    .replace(/[^a-z0-9]/g, "");
export function parseGasExchange(text) {
  const aliases = {
    A: ["a", "photo", "assimilation"],
    Q: ["qin", "ppfd", "pari", "par", "qambin", "ppfdin"],
    Ci: ["ci"],
  };
  let indices,
    delimiter,
    skipped = 0;
  const records = [];
  for (const line of text.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    if (!line.trim()) continue;
    const separator =
      delimiter ||
      (line.includes("\t") ? "\t" : line.includes(";") ? ";" : ",");
    const cells = delimitedFields(line, separator);
    const headers = cells.map(normalizeColumn);
    if (aliases.A.some((name) => headers.includes(name))) {
      const columns = Object.fromEntries(
        Object.entries(aliases).map(([key, names]) => [
          key,
          names
            .map((name) => headers.indexOf(name))
            .find((index) => index >= 0) ?? -1,
        ]),
      );
      if (columns.Q >= 0 || columns.Ci >= 0) {
        indices = columns;
        delimiter = separator;
        continue;
      }
    }
    if (!indices) continue;
    const row = Object.fromEntries(
      Object.entries(indices).map(([key, i]) => [
        key,
        measurementNumber(cells[i]),
      ]),
    );
    if (row.A === null || (row.Q === null && row.Ci === null)) {
      skipped++;
      continue;
    }
    records.push(row);
  }
  return { records, skipped, foundHeaders: Boolean(indices) };
}

export function kjeldahlNitrogen({ sample, blank, normality, mass }) {
  const [v, b, n, w] = [sample, blank, normality, mass].map(measurementNumber);
  if (
    [v, b, n, w].includes(null) ||
    v < 0 ||
    b < 0 ||
    v < b ||
    n <= 0 ||
    w <= 0
  )
    return null;
  return ((v - b) * n * 1.4007) / w;
}
