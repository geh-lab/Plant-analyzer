import { parsePeakPdfLines } from "./hplcPeaks.js";

export async function readPeakPdf(file) {
  const libraryPath = new URL(
    import.meta.env.BASE_URL + "vendor/pdfjs/",
    window.location.origin,
  ).href;
  const { getDocument, GlobalWorkerOptions } = await import(
    /* @vite-ignore */ libraryPath + "pdf.min.mjs"
  );
  GlobalWorkerOptions.workerSrc = libraryPath + "pdf.worker.min.mjs";
  const document = await getDocument({
    data: await file.arrayBuffer(),
    isEvalSupported: false,
    useSystemFonts: false,
  }).promise;
  const peaks = [];
  let skipped = 0;
  try {
    for (let pageNo = 1; pageNo <= document.numPages; pageNo++) {
      const page = await document.getPage(pageNo);
      const { items } = await page.getTextContent();
      const rows = [];
      for (const item of items
        .filter((item) => item.str?.trim())
        .sort((a, b) => b.transform[5] - a.transform[5])) {
        const y = item.transform[5];
        const line = rows.at(-1);
        if (!line || Math.abs(line.y - y) > 1.8)
          rows.push({ y, items: [item] });
        else line.items.push(item);
      }
      const lines = rows.map((row) =>
        row.items
          .sort((a, b) => a.transform[4] - b.transform[4])
          .map((i) => i.str)
          .join(" "),
      );
      const parsed = parsePeakPdfLines(lines);
      peaks.push(...parsed.peaks);
      skipped += parsed.skipped;
    }
  } finally {
    await document.destroy();
  }
  return { peaks, skipped };
}
