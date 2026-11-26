import { getFieldValueFromRow, getMeasurementFields } from "./analysisFields.js";

import { makeCsv } from "./resultData.js";

const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

function csvRows(text, en) {
  const content = text.replace(/^\uFEFF/, "").trim();
  const firstLine = content.split(/[\r\n]/, 1)[0];
  const delimiter = [",", ";", "\t"].sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
  const rows = [];
  let cells = [], value = "", quoted = false, closed = false;
  const syntaxError = () => new Error(en ? "Invalid CSV quotation." : "CSV의 따옴표 형식을 확인하세요.");
  const finishCell = () => { cells.push(value.trim()); value = ""; closed = false; };
  const finishRow = () => {
    finishCell();
    if (cells.some(Boolean) || cells.length > 1) rows.push(cells);
    cells = [];
  };
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (quoted) {
      if (ch !== '"') value += ch;
      else if (content[i + 1] === '"') { value += '"'; i++; }
      else { quoted = false; closed = true; }
    } else if (ch === delimiter) finishCell();
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && content[i + 1] === "\n") i++;
      finishRow();
    } else if (ch === '"' && !value && !closed) quoted = true;
    else if (ch === '"' || (closed && ch.trim())) throw syntaxError();
    else value += ch;
  }
  if (quoted) throw syntaxError();
  finishRow();
  return rows;
}

export function readAssayCsv(text, type, lang = "ko") {
  const en = lang === "en";
  const [headers = [], ...rows] = csvRows(text, en);
  if (!rows.length) throw new Error(en ? "Include a header and at least one sample." : "머리글과 한 개 이상의 시료 행을 넣으세요.");
  if (new Set(headers).size !== headers.length || headers.includes("")) throw new Error(en ? "Each column needs a unique header." : "열마다 서로 다른 머리글이 필요합니다.");
  const fields = getMeasurementFields(type, lang);
  return rows.map((cells, index) => {
    const line = en ? `Row ${index + 2}` : `${index + 2}행`;
    if (cells.length !== headers.length) throw new Error(`${line} · ${en ? "Column count differs from header." : "머리글과 열 수가 다릅니다."}`);
    const row = Object.fromEntries(headers.map((header, n) => [header, cells[n]]));
    const treatment = row.treatment_name || row["Treatment Name"];
    const name = row.sample_name || row["Sample Name"];
    if (!treatment || !name) throw new Error(`${line} · ${en ? "Enter treatment_name and sample_name." : "treatment_name과 sample_name을 입력하세요."}`);
    const absorbance_values = {};
    for (const field of fields) {
      const str = String(getFieldValueFromRow(row, field)).trim().replace(",", ".");
      if (!str && field.optional) continue;
      if (!decimal.test(str) || !Number.isFinite(Number(str))) throw new Error(`${line} · ${field.label} · ${en ? "A numeric reading is required." : "숫자로 된 측정값이 필요합니다."}`);
      absorbance_values[field.key] = Number(str);
    }
    const sample = { treatment_name: treatment, sample_name: name, absorbance_values, analysis_type: type };
    if (row.Description || row.description) sample.description = row.Description || row.description;
    if (row.Replicate || row.replicate) sample.replicate = row.Replicate || row.replicate;
    if (type === "h2o2" && (row.Weight || row.weight)) {
      const str = (row.Weight || row.weight).replace(",", ".");
      if (!decimal.test(str) || !Number.isFinite(Number(str)) || Number(str) <= 0) throw new Error(`${line} · ${en ? "Fresh weight must be positive." : "생체중은 양수로 입력하세요."}`);
      sample.weight = Number(str);
    }
    return sample;
  });
}

export function assayTemplate(type) {
  const fields = getMeasurementFields(type);
  const sampleRows = Array.from({ length: 4 }, (_, n) => {
    const group = n < 2 ? "Control" : "Treatment";
    const readings = fields.map(field => {
      if (field.optional) return "";
      if (type === "mda") return field.key === "532" ? [0.205, 0.236, 0.360, 0.391][n] : "0.050";
      if (type === "cat") return [-0.048, -0.052, -0.044, -0.046][n];
      return [0.123, 0.145, 0.198, 0.210][n];
    });
    return [group, `Rep${(n % 2) + 1}`, ...readings];
  });
  const headers = ["treatment_name", "sample_name", ...fields.map(field => field.key)];
  return makeCsv([headers, ...sampleRows]);
}
