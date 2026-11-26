import { useEffect, useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { assayTemplate, readAssayCsv } from "@/utils/assayCsv";
import { getMeasurementFields } from "@/utils/analysisFields";
import PlateImport from "./PlateImport";
import "@/pages/assay.css";
import "./plateImport.css";

export default function ExcelUpload({ analysisType, onSamplesUploaded, onCalibrationPreview, params, initialWorkbook, onSwitchAssay, lang = "ko" }) {
  const en = lang === "en";
  const t = (ko, eng) => en ? eng : ko;
  const input = useRef(null);
  const readId = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [workbookFile, setWorkbookFile] = useState(initialWorkbook || null);

  useEffect(() => () => { readId.current++; }, []);

  function added(samples, calibration) {
    const counts = onSamplesUploaded(samples, calibration);
    const imported = counts?.added ?? samples.length;
    const skipped = counts?.skipped ?? 0;
    setWorkbookFile(null);
    const message = t(`시료 ${imported}개를 추가했습니다.`, `Added ${imported} samples.`);
    setStatus({ message: skipped ? message + " " + t(`이미 등록한 측정값 ${skipped}개를 건너뛰었습니다.`, `Skipped ${skipped} previously added readings.`) : message });
  }
  async function importFile(file) {
    if (!file) return;
    const request = ++readId.current;
    setLoading(true);
    setStatus(null);
    setWorkbookFile(null);
    const xlsx = /\.xlsx$/i.test(file.name);
    try {
      if (xlsx) {
        const { readPlateWorkbook } = await import("@/utils/plateWorkbook");
        const workbook = await readPlateWorkbook(file);
        if (request === readId.current) setWorkbookFile({ fileName: file.name, workbook });
      } else if (/\.csv$/i.test(file.name)) {
        const csv = await file.text();
        if (request === readId.current) added(readAssayCsv(csv, analysisType, lang));
      } else {
        throw new Error(t("장비의 .xlsx 파일 또는 시료 양식의 .csv 파일을 선택하세요.", "Choose a reader .xlsx workbook or a .csv sample template."));
      }
    } catch (error) {
      if (request !== readId.current) return;
      let message = error.message;
      if (xlsx) {
        message = /size|large|dimensions/i.test(error.message)
          ? t("이 통합문서의 크기나 시트 범위가 지원 한도를 넘습니다. 필요한 플레이트 시트만 새 .xlsx 파일로 저장하세요.", "The workbook exceeds the supported size or sheet dimensions. Save the required plate worksheet in a smaller .xlsx file.")
          : t("엑셀을 읽을 수 없습니다. 장비에서 내보낸 .xlsx 파일인지 확인하세요.", "Could not read this workbook. Check that it is an .xlsx file exported by your plate reader.");
      }
      setStatus({ error: true, message });
    } finally {
      if (request === readId.current) {
        setLoading(false);
        if (input.current) input.current.value = "";
      }
    }
  }

  function downloadTemplate() {
    try {
      const blob = new Blob([assayTemplate(analysisType)], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sample_template_${analysisType}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setStatus({ error: true, message: t("CSV 양식을 저장하지 못했습니다. 다시 시도하세요.", "Could not save the CSV template. Try again.") });
    }
  }

  return <div className="plate-import-shell" data-dragging={dragging}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length > 1) {
          setStatus({error:true,message:t("파일은 한 번에 하나씩 선택하세요. 각 파일에서 추가할 시료를 확인할 수 있습니다.", "Choose one file at a time so you can review its samples.")});
          return;
        }
        importFile(e.dataTransfer.files[0]);
      }}>
    <input ref={input} hidden type="file" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
      aria-label={t("플레이트 Excel 또는 시료 CSV", "Plate Excel or sample CSV")} onChange={e => importFile(e.target.files?.[0])}/>
    {!workbookFile && <div className="assay-form assay-form-drop plate-file-drop" data-dragging={dragging}>
      <div className="plate-file-intro"><FileSpreadsheet size={24} aria-hidden="true"/><div>
        <strong>{t("플레이트 리더 Excel 또는 시료 CSV", "Plate reader Excel or sample CSV")}</strong>
        <p>{t("파일을 놓으면 Excel의 검량선과 시료를 확인할 수 있습니다.", "Drop a workbook to review its calibration and samples.")}</p>
      </div></div>
      <div className="assay-form-tools">
        <Button type="button" className="assay-form-submit" onClick={() => input.current?.click()} disabled={loading}><Upload aria-hidden="true"/>{loading ? t("파일 읽는 중…", "Reading file…") : t("Excel / CSV 선택", "Choose Excel / CSV")}</Button>
        <Button type="button" variant="outline" onClick={downloadTemplate}><Download aria-hidden="true"/>{t("CSV 양식 다운로드", "Download CSV template")}</Button>
      </div>
      <details className="plate-csv-help"><summary>{t("CSV 양식의 열", "CSV template columns")}</summary>
        <p>{t("필수 열", "Required columns")} · treatment_name, sample_name, {getMeasurementFields(analysisType, lang).filter(f => !f.optional).map(f => f.key).join(", ")}</p>
        {analysisType === "mda" && <p>{t("흡광도는 현재 설정한 광경로 길이로 다시 계산합니다.", "Readings are recalculated with the current optical path length.")}</p>}
      </details>
    </div>}
    {status && <p role={status.error ? "alert" : "status"} className={status.error ? "plate-error" : "plate-note"}>{status.message}</p>}
    {workbookFile && <PlateImport key={workbookFile.fileName} {...workbookFile} analysisType={analysisType} lang={lang} params={params}
      onReplace={() => input.current?.click()} onSwitchAssay={onSwitchAssay} onCalibrationPreview={onCalibrationPreview} onSamplesUploaded={added} onCancel={() => setWorkbookFile(null)}/>}
  </div>;
}
