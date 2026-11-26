import { measurementNumber } from "./instrumentData.js";

// Invoked only by the explicit per-file remote extraction button.
export async function readRemotePeakPdf(file) {
  const { UploadFile, ExtractDataFromUploadedFile } = await import(
    "@/api/integrations"
  );
  const uploaded = await UploadFile({ file });
  if (!uploaded?.file_url) throw new Error("UPLOAD_FAILED");
  const extracted = await ExtractDataFromUploadedFile({
    file_url: uploaded.file_url,
    json_schema: {
      type: "object",
      properties: {
        peaks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              rt: {
                type: "number",
                description: "Retention time in minutes from the peak table",
              },
              area: {
                type: "number",
                description:
                  "Integrated peak area, not area percentage or peak height",
              },
            },
            required: ["rt", "area"],
          },
        },
      },
      required: ["peaks"],
    },
  });
  if (
    extracted?.status !== "success" ||
    !Array.isArray(extracted.output?.peaks)
  )
    throw new Error("EXTRACTION_FAILED");
  const peaks = [];
  for (const peak of extracted.output.peaks) {
    const rt = measurementNumber(
      peak.rt ?? peak["Ret. Time"] ?? peak.retention_time,
    );
    const area = measurementNumber(peak.area ?? peak.Area ?? peak.peak_area);
    if (rt !== null && rt > 0 && area !== null && area >= 0)
      peaks.push({ rt, area });
  }
  return { peaks, skipped: extracted.output.peaks.length - peaks.length };
}
