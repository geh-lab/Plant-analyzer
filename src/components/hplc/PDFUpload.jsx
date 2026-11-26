import { useRef, useState } from "react";
import { FileUp, Trash2 } from "lucide-react";
import {
  hplcFileInfo,
  parsePeakTable,
  rematchHplcFile,
} from "@/utils/hplcPeaks";
import { measurementNumber } from "@/utils/instrumentData";
import "@/components/instruments/instruments.css";

export default function PDFUpload({
  onFilesUploaded,
  rtStandards,
  onResultsGenerated,
  uploadedFiles = [],
  lang = "ko",
}) {
  const en = lang === "en",
    t = (ko, english) => (en ? english : ko);
  const [tolerance, setTolerance] = useState("0.10"),
    [drag, setDrag] = useState(false),
    [busy, setBusy] = useState(false);
  const [notices, setNotices] = useState([]),
    [pending, setPending] = useState([]);
  const [sample, setSample] = useState(""),
    [table, setTable] = useState("");
  const [unreadPdfs, setUnreadPdfs] = useState([]);
  const picker = useRef(null),
    reading = useRef(false);
  const hasStandards = Object.keys(rtStandards || {}).length > 0;
  function stage(parsed, name) {
    const tol = measurementNumber(tolerance);
    if (tol === null || tol < 0)
      throw new Error(
        t(
          "RT 허용 오차는 0 이상이어야 합니다.",
          "RT tolerance must be zero or greater.",
        ),
      );
    if (!parsed.peaks.length)
      throw new Error(
        t(
          "RT와 Area가 포함된 수치 표가 필요합니다. 스캔 또는 복잡한 PDF는 CSV로 내보내거나 표를 붙여넣으세요.",
          "No readable RT/Area table. For scans or complex reports, export CSV or paste the table.",
        ),
      );
    return {
      ...hplcFileInfo(name),
      rawPeaks: parsed.peaks,
      peaks: parsed.peaks.length,
      tolerance: tol,
      skipped: parsed.skipped,
    };
  }
  function nameUsed(name, staged) {
    return [...uploadedFiles, ...staged].some((f) => f.name === name);
  }
  async function loadFiles(fileList) {
    if (reading.current || !hasStandards) return;
    reading.current = true;
    setBusy(true);
    const staged = [...pending],
      messages = [],
      unread = [...unreadPdfs];
    try {
      for (const file of fileList) {
        try {
          if (nameUsed(file.name, staged))
            throw new Error(
              t(
                "같은 이름의 시료가 있습니다.",
                "A sample with this name already exists.",
              ),
            );
          let parsed;
          if (/\.pdf$/i.test(file.name)) {
            try {
              const { readPeakPdf } = await import("@/utils/localPeakPdf");
              parsed = await readPeakPdf(file);
              if (!parsed.peaks.length) throw new Error("NO_PEAKS");
            } catch {
              const same = unread.findIndex((item) => item.name === file.name);
              if (same === -1) unread.push(file);
              else unread[same] = file;
              throw new Error(
                t(
                  "이 PDF에서 피크 표를 읽지 못했습니다. 표를 붙여넣거나 아래에서 외부 추출을 선택할 수 있습니다.",
                  "Could not read a peak table in this PDF. Paste a table or choose external extraction below.",
                ),
              );
            }
          } else if (/\.(csv|txt|tsv)$/i.test(file.name)) {
            parsed = parsePeakTable(await file.text());
          } else
            throw new Error(
              t(
                "PDF, CSV 또는 TSV 파일을 선택하세요.",
                "Choose a PDF, CSV or TSV file.",
              ),
            );
          staged.push(stage(parsed, file.name));
        } catch (error) {
          messages.push(file.name + " · " + error.message);
        }
      }
      setPending(staged);
      setNotices(messages);
      setUnreadPdfs(unread.filter((file) => !nameUsed(file.name, staged)));
    } finally {
      reading.current = false;
      setBusy(false);
    }
  }
  async function extractRemotely(file) {
    if (reading.current || !hasStandards) return;
    if (nameUsed(file.name, pending)) {
      setNotices([
        t(
          "같은 이름의 시료가 있습니다.",
          "A sample with this name already exists.",
        ),
      ]);
      return;
    }
    reading.current = true;
    setBusy(true);
    setNotices([]);
    try {
      const { readRemotePeakPdf } = await import("@/utils/remotePeakPdf");
      const parsed = await readRemotePeakPdf(file);
      const next = stage(parsed, file.name);
      setPending((previous) => [...previous, { ...next, source: "base44" }]);
      setUnreadPdfs((previous) =>
        previous.filter((candidate) => candidate !== file),
      );
    } catch {
      setNotices([
        file.name +
          " · " +
          t(
            "외부 서비스가 응답하지 않거나 읽을 수 있는 피크가 없습니다. CSV 또는 표 붙여넣기를 사용할 수 있습니다.",
            "The external service is unavailable or returned no readable peaks. You can use CSV or paste the table.",
          ),
      ]);
    } finally {
      reading.current = false;
      setBusy(false);
    }
  }
  const paste = () => {
    const name = sample.trim();
    try {
      if (!name)
        throw new Error(t("시료명을 입력하세요.", "Enter a sample name."));
      if (nameUsed(name, pending))
        throw new Error(
          t(
            "같은 이름의 시료가 있습니다.",
            "A sample with this name already exists.",
          ),
        );
      setPending([...pending, stage(parsePeakTable(table), name)]);
      setNotices([]);
      setSample("");
      setTable("");
    } catch (e) {
      setNotices([e.message]);
    }
  };
  function replaceFiles(next) {
    onFilesUploaded(next, true);
    onResultsGenerated(next.flatMap((file) => file.processedResults || []));
  }
  const commit = () => {
    const matched = pending.map((file) => rematchHplcFile(file, rtStandards));
    replaceFiles([...uploadedFiles, ...matched]);
    setPending([]);
    setNotices([
      t(
        `시료 ${matched.length}개를 결과에 추가했습니다.`,
        `Added ${matched.length} samples to results.`,
      ),
    ]);
  };
  return (
    <section className="inst-form">
      <h3>{t("피크 표 불러오기", "Import peak tables")}</h3>
      <p className="inst-muted">
        {t(
          "브라우저에서 파일을 읽습니다. RT(min)와 Area 열을 포함한 표를 시료별로 준비하세요. 파일명을 요인_처리_반복 형식으로 지정하면 처리군을 비교할 수 있습니다.",
          "Files are read in your browser. Provide one table per sample with RT (min) and Area columns. Use Factor_Treatment_Replicate filenames to group your results.",
        )}
      </p>
      <label className="inst-field" style={{ maxWidth: 250, margin: "12px 0" }}>
        {t("RT 허용 오차 (± min)", "RT tolerance (± min)")}
        <input
          type="number"
          step="any"
          min="0"
          value={tolerance}
          onChange={(e) => setTolerance(e.target.value)}
        />
      </label>
      <p className="inst-muted">
        {t(
          "새로 읽는 시료에 적용합니다. 범위 안에서 가장 가까운 피크를 찾고, 같은 거리이거나 여러 화합물이 공유하는 피크는 미확정으로 남깁니다.",
          "Applies to incoming samples. The closest peak within range is matched. Equidistant peaks or peaks shared by multiple compounds remain unassigned.",
        )}
      </p>
      {!hasStandards && (
        <p className="inst-req">
          {t(
            "먼저 표준물질 RT를 입력하고 적용하세요.",
            "Apply reference RT values first.",
          )}
        </p>
      )}
      <div
        className="inst-drop"
        data-dragging={drag}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          loadFiles(Array.from(e.dataTransfer.files));
        }}
      >
        <button
          className="inst-button"
          disabled={!hasStandards || busy}
          onClick={() => picker.current.click()}
        >
          <FileUp size={15} />
          {busy
            ? t("읽는 중…", "Reading…")
            : t("PDF / CSV / TSV 선택", "Choose PDF / CSV / TSV")}
        </button>
        <input
          type="file"
          ref={picker}
          accept=".pdf,.csv,.tsv,.txt"
          hidden
          multiple
          onChange={(e) => {
            loadFiles(Array.from(e.target.files));
            e.target.value = "";
          }}
        />
      </div>
      <details className="inst-details">
        <summary>{t("피크 표 직접 입력", "Paste peak table")}</summary>
        <label className="inst-field">
          {t("시료명", "Sample name")}
          <input
            value={sample}
            placeholder="Light_Control_1"
            onChange={(e) => setSample(e.target.value)}
          />
        </label>
        <label className="inst-field" style={{ margin: "10px 0" }}>
          {t("열 이름과 값", "Headers and values")}
          <textarea
            value={table}
            rows={3}
            placeholder={"RT,Area\n4.32,1800"}
            onChange={(e) => setTable(e.target.value)}
          />
        </label>
        <button
          className="inst-outline"
          disabled={!hasStandards || busy}
          onClick={paste}
        >
          {t("미리보기", "Preview peaks")}
        </button>
      </details>
      {notices.length > 0 && (
        <div className="inst-note" role="status">
          {notices.map((n, i) => (
            <p key={i}>{n}</p>
          ))}
        </div>
      )}
      {unreadPdfs.length > 0 && (
        <div className="inst-drop">
          <h3>{t("읽지 못한 PDF", "Unreadable PDF reports")}</h3>
          <p className="inst-muted">
            {t(
              "버튼을 누르면 해당 PDF 원본을 외부 서비스 Base44에 전송해 피크 표 추출을 요청합니다. 서비스 상태에 따라 처리가 제한될 수 있습니다. 추출 후 원본과 대조하세요.",
              "Choosing an upload below sends that original PDF to the external Base44 service to extract its peak table. Availability may vary. Compare the extracted values with your report before analysis.",
            )}
          </p>
          <ul className="inst-filelist">
            {unreadPdfs.map((file) => (
              <li key={file.name}>
                <span>{file.name}</span>
                <div className="inst-actions">
                  <button
                    className="inst-outline"
                    disabled={busy || !hasStandards}
                    onClick={() => extractRemotely(file)}
                    aria-label={
                      t("이 PDF를 Base44에 전송", "Send this PDF to Base44") +
                      " · " +
                      file.name
                    }
                  >
                    {t("이 PDF를 Base44에 전송", "Send this PDF to Base44")}
                  </button>
                  <button
                    className="inst-outline"
                    disabled={busy}
                    onClick={() =>
                      setUnreadPdfs(
                        unreadPdfs.filter((candidate) => candidate !== file),
                      )
                    }
                  >
                    {t("제외", "Dismiss")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!!pending.length && (
        <div className="inst-section">
          <h3>{t("피크 확인", "Review imported peaks")}</h3>
          {pending.map((f) => (
            <details key={f.name} className="inst-details" open>
              <summary>
                {f.name} · {f.peaks} {t("피크", "peaks")} · ±{f.tolerance} min
              </summary>
              {f.source === "base44" && (
                <p className="inst-note">
                  {t(
                    "Base44 추출값입니다. 분석 전에 RT와 Area를 원본 PDF와 대조하세요.",
                    "Values extracted by Base44. Check RT and area against the original PDF before applying.",
                  )}
                </p>
              )}
              {f.skipped > 0 && (
                <p className="inst-req">
                  {t(
                    `읽지 못한 행 ${f.skipped}개. 원본 표를 확인하세요.`,
                    `${f.skipped} lines were skipped. Check the source table.`,
                  )}
                </p>
              )}
              <div className="inst-table">
                <table>
                  <thead>
                    <tr>
                      <th>RT (min)</th>
                      <th>Area</th>
                    </tr>
                  </thead>
                  <tbody>
                    {f.rawPeaks.map((p, i) => (
                      <tr key={i}>
                        <td>{p.rt}</td>
                        <td>{p.area}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                className="inst-outline"
                disabled={busy}
                onClick={() =>
                  setPending(pending.filter((p) => p.name !== f.name))
                }
              >
                {t("제외", "Discard")}
              </button>
            </details>
          ))}
          <button
            className="inst-button"
            style={{ marginTop: 12 }}
            disabled={busy || !hasStandards}
            onClick={commit}
          >
            {t("확인한 피크로 분석", "Use reviewed peaks")}
          </button>
        </div>
      )}
      {!!uploadedFiles.length && (
        <ul className="inst-filelist">
          {uploadedFiles.map((file, index) => (
            <li key={file.name + "-" + index}>
              <span>
                {file.name} · {file.peaks} {t("피크", "peaks")}
              </span>
              <button
                className="inst-outline"
                disabled={busy}
                aria-label={t("시료 제거 ", "Remove sample ") + file.name}
                onClick={() =>
                  replaceFiles(uploadedFiles.filter((_, i) => i !== index))
                }
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
