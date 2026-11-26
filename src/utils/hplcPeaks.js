import { delimitedFields, measurementNumber } from "./instrumentData.js";

function peakColumns(header) {
  const fields = header.map((value) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[()[\]]/g, " ")
      .replace(/[._]/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
  return {
    rt: fields.findIndex((h) =>
      /^(?:ret(?:ention)?\s*time|rt)(?: min(?:utes?)?)?$/.test(h),
    ),
    area: fields.findIndex((h) =>
      /^(?:peak )?area(?: (?:m?au|pa|counts?|mv).*)?$/.test(h),
    ),
  };
}

export function parsePeakTable(text) {
  const peaks = [];
  let delimiter,
    columns,
    skipped = 0;
  for (const line of text.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    if (!line.trim()) continue;
    const sep =
      delimiter ||
      (line.includes("\t") ? "\t" : line.includes(";") ? ";" : ",");
    const cells = delimitedFields(line, sep);
    const possible = peakColumns(cells);
    if (possible.rt >= 0 && possible.area >= 0) {
      columns = possible;
      delimiter = sep;
      continue;
    }
    if (!columns) continue;
    const rt = measurementNumber(cells[columns.rt]),
      area = measurementNumber(cells[columns.area]);
    if (rt !== null && rt > 0 && area !== null && area >= 0)
      peaks.push({ rt, area });
    else skipped++;
  }
  return { peaks, skipped };
}

// Use the printed header order to identify peak columns. Reject irregular rows
// rather than inferring areas from arbitrary numbers elsewhere on the report.
export function parsePeakPdfLines(lines) {
  let columns = null,
    count = 0,
    skipped = 0;
  const peaks = [];
  for (const raw of lines) {
    const tokens = raw
      .trim()
      .replace(/ret(?:ention)?[.\s]+time/gi, "RT")
      .replace(/peak\s+(no\.?|number|#)/gi, "PeakNo")
      .replace(
        /(RT|Area|Height)\s*(?:\[[^\]]*\]|\([^)]*\))/gi,
        (_, label, offset, all) => {
          const suffix = all.slice(offset + label.length).trimStart();
          return /^[[(]\s*%/.test(suffix) ? label + "Percent" : label;
        },
      )
      .replace(/(Area|Height)\s*%/gi, "$1Percent")
      .replace(/peak\s+area/gi, "Area")
      .replace(/(\d)[eE]\s*([+-])\s*(\d+)/g, "$1e$2$3")
      .split(/\s+/);
    const possible = peakColumns(tokens);
    if (possible.rt >= 0 && possible.area >= 0) {
      columns = possible;
      count = tokens.length;
      continue;
    }
    if (!columns || !tokens.some((t) => measurementNumber(t) !== null))
      continue;
    // Leading numeric fields and column count must agree with the report header.
    if (measurementNumber(tokens[0]) === null) {
      columns = null;
      continue;
    }
    const rt = measurementNumber(tokens[columns.rt]),
      area = measurementNumber(tokens[columns.area]);
    if (
      tokens.length === count &&
      rt !== null &&
      rt > 0 &&
      area !== null &&
      area >= 0
    )
      peaks.push({ rt, area });
    else skipped++;
  }
  return { peaks, skipped };
}

export function hplcFileInfo(name) {
  const bare = name.replace(/\.(pdf|csv|tsv|txt)$/i, "");
  const [factor, treatment, replicate] = bare.split("_");
  return {
    name,
    factor: factor || bare,
    treatment: treatment || "N/A",
    replicate: replicate || "1",
  };
}

export function rematchHplcFile(file, standards) {
  if (!Array.isArray(file.rawPeaks)) return file;
  const tolerance = file.tolerance ?? 0.1;
  const matches = Object.entries(standards).map(([compound, standardRT]) => {
    const candidates = file.rawPeaks
      .map((peak, index) => ({
        index,
        distance: Math.abs(peak.rt - standardRT),
      }))
      .filter((candidate) => candidate.distance <= tolerance + 1e-10)
      .sort((a, b) => a.distance - b.distance);
    const tied =
      candidates.length > 1 &&
      Math.abs(candidates[0].distance - candidates[1].distance) < 1e-10;
    return {
      compound,
      standardRT,
      index: tied ? null : candidates[0]?.index,
      ambiguous: tied,
    };
  });
  const used = new Map();
  matches.forEach(({ index }) => {
    if (index != null) used.set(index, (used.get(index) || 0) + 1);
  });
  const processedResults = matches.map(
    ({ compound, standardRT, index, ambiguous }) => {
      const shared = used.get(index) > 1,
        peak = shared ? null : file.rawPeaks[index];
      return {
        sampleName: file.name,
        factor: file.factor,
        treatment: file.treatment,
        replicate: file.replicate,
        compound,
        standardRT,
        matchedRT: peak?.rt ?? null,
        area: peak?.area ?? null,
        matchStatus:
          ambiguous || shared ? "ambiguous" : peak ? "matched" : "unmatched",
      };
    },
  );
  return { ...file, processedResults };
}
