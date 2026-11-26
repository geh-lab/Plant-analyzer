import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import StudioSelect from "@/components/StudioSelect";
import Fp100Chart from "./Fp100Chart";
import { fpCurves, fpGroups } from "@/utils/fp100";
import { displayNumber, downloadCsv } from "@/utils/resultData";

const pageSize = 20;
const traceLabel = (leaf) => "ID " + leaf.name;
const metadataColumns = ["block", "measurement_id", "recorded_at", "protocol", "assigned_group"];
const metadata = (leaf, assignments) => [
  leaf.block, leaf.traceId, leaf.recordedAt, leaf.protocol, assignments[leaf.traceKey]?.trim() || "",
];

export function NativeTable({ title, headers, children }) {
  return (
    <div className="fp-table fp-native-table" role="region" aria-label={title} tabIndex={0}>
      <table>
        <caption>{title}</caption>
        <thead><tr>{headers.map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export default function Fp100Native({ leaves, assignments, onAssignmentsChange, en, run, fileName }) {
  const t = (ko, eng) => en ? eng : ko;
  const [selection, setSelection] = useState("");
  const [page, setPage] = useState(0);
  const [logY, setLogY] = useState(false);
  const [metric, setMetric] = useState("Fv/Fm");
  const chosen = useMemo(() => selection ? leaves.filter(leaf => leaf.traceKey === selection) : leaves, [leaves, selection]);
  const labels = chosen.map(traceLabel);
  const extent = useMemo(() => {
    let min = Infinity, max = -Infinity;
    for (const leaf of chosen) for (const [, ft] of leaf.points) {
      min = Math.min(min, ft);
      max = Math.max(max, ft);
    }
    return [min, max];
  }, [chosen]);
  const canLogY = run && Number.isFinite(extent[0]) && extent[0] > 0;
  const logYDomain = canLogY && logY ? (extent[0] === extent[1] ? [extent[0] / 2, extent[1] * 2] : extent) : undefined;
  // Use one plot series per original acquisition, even after assigning treatment labels.
  const curves = useMemo(() => fpCurves(chosen.map(leaf => ({...leaf, group: traceLabel(leaf)}))), [chosen]);
  const secondsCurves = useMemo(() => run ? curves.map(row => ({...row, t: Number((row.t / 1000).toPrecision(15))})) : curves, [run, curves]);
  const parameters = useMemo(() => Array.from(new Set(leaves.flatMap(leaf => Object.keys(leaf.reported)))), [leaves]);
  const activeMetric = parameters.includes(metric) ? metric : parameters[0];
  const assigned = leaves.flatMap(leaf => {
    const group = assignments[leaf.traceKey]?.trim();
    return group ? [{group, metrics: leaf.reported}] : [];
  });
  const summary = activeMetric ? fpGroups(assigned, activeMetric, "") : [];
  const pageCount = Math.ceil(curves.length / pageSize);
  const columns = leaves.map(traceLabel);

  const sourceHeaders = run ? [...metadataColumns, "source_file", "worksheet", "sample_description"] : metadataColumns;
  const sourceCells = leaf => run ? [...metadata(leaf, assignments), fileName, run.sheetName, leaf.description] : metadata(leaf, assignments);
  function exportRaw() {
    downloadCsv("fp100-source-data", [
      [...sourceHeaders, "time_ms", "Ft"],
      ...leaves.flatMap(leaf => leaf.points.map(point => [...sourceCells(leaf), ...point])),
    ]);
  }
  function exportParameters() {
    downloadCsv("fp100-computed-values", [
      [...sourceHeaders, ...parameters],
      ...leaves.map(leaf => [...sourceCells(leaf), ...parameters.map(key => leaf.reported[key])]),
    ]);
  }

  return (
    <>
      <section className="inst-panel fp-results fp-native" aria-labelledby="fp-native-curves">
        <p className="inst-caption">SOURCE DATA</p>
        <div className="fp-native-head">
          <h2 id="fp-native-curves">{run ? t("측정별 원시 형광", "Raw fluorescence by measurement") : t("측정별 OJIP 곡선", "OJIP traces by measurement")}</h2>
          <label className="fp-native-select">
            {t("표시할 측정", "Show measurement")}
            <StudioSelect value={selection} onValueChange={value => {setSelection(value); setPage(0);}}
              aria-label={t("표시할 측정", "Show measurement")} options={[
                {value: "", label: t("전체 측정", "All measurements")},
                ...leaves.map(leaf => ({value: leaf.traceKey, label: traceLabel(leaf)})),
              ]}/>
          </label>
        </div>
        {run && curves.length > 0 && <div className="fp-signal-settings">
          <span>{t("표시 범위", "Signal range")} · {extent[0].toLocaleString()}–{extent[1].toLocaleString()} a.u.</span>
          {canLogY && <label><input type="checkbox" checked={logY} onChange={event => setLogY(event.target.checked)}/>
            {t("형광 로그 눈금", "Log fluorescence scale")}</label>}
        </div>}
        {curves.length ? <Fp100Chart curves={secondsCurves} groups={labels} paletteOrder={columns} label={logYDomain ? t("Ft (a.u.) · 로그 눈금", "Ft (a.u.) · log scale") : "Ft (a.u.)"} en={en} logYDomain={logYDomain}
          axis={run ? {label:t("경과 시간 (s)", "Elapsed time (s)"),unit:"s"} : undefined}/>
          : <p className="fp-note">{t("이 블록에는 원시 형광 시계열이 없습니다.", "This block contains no raw fluorescence time series.")}</p>}
        <p className="fp-note">{run ? t(
          "장비 기록 시각을 초 단위로 표시합니다. 표와 CSV의 시간 단위는 ms입니다.",
          "The plot uses elapsed seconds. The data table and CSV use milliseconds.",
        ) : t(
          "선 하나가 장비의 측정 기록 하나입니다. 실제 기록 시각을 밀리초(ms)로 환산해 표시합니다.",
          "Each line follows one instrument acquisition at its recorded times, converted to milliseconds.",
        )}</p>
        {curves.length > 0 && <details className="fp-native-detail">
          <summary>{t("원시 형광값 보기", "View raw fluorescence readings")}</summary>
          <NativeTable title={t("시간별 원시 형광 Ft (a.u.)", "Raw Ft by time (a.u.)")} headers={[t("시간 (ms)", "Time (ms)"), ...labels]}>
            {curves.slice(page * pageSize, (page + 1) * pageSize).map(({ t: time, series }) => {
              const values = new Map(series.map(record => [record.group, record.mean]));
              return <tr key={time}><th scope="row">{time}</th>{labels.map(label => <td key={label}>{values.get(label) ?? "—"}</td>)}</tr>;
            })}
          </NativeTable>
          {pageCount > 1 && <nav className="fp-page-nav" aria-label={t("원시 형광 표 페이지", "Raw readings pages")}>
            <button type="button" className="inst-button alt" disabled={!page} onClick={() => setPage(page - 1)}>{t("이전", "Previous")}</button>
            <span aria-live="polite">{page + 1} / {pageCount}</span>
            <button type="button" className="inst-button alt" disabled={page + 1 === pageCount} onClick={() => setPage(page + 1)}>{t("다음", "Next")}</button>
          </nav>}
        </details>}
        <button type="button" className="inst-button alt" onClick={exportRaw} disabled={!leaves.some(leaf => leaf.points.length)}><Download size={15}/>{t("전체 원시값 CSV", "All raw readings CSV")}</button>
      </section>

      <section className="inst-panel fp-results fp-native" aria-labelledby="fp-native-parameters">
        <p className="inst-caption">COMPUTED VALUES</p>
        <h2 id="fp-native-parameters">{t("FluorPen 산출 지표", "Instrument-reported fluorescence parameters")}</h2>
        {parameters.length ? <>
          <p className="fp-note">{t(
            "FluorPen이 각 측정에 대해 내보낸 항목명과 수치입니다. 빈 값은 대시(—)로 표시합니다.",
            "Parameter names and values come directly from the FluorPen export for each measurement. A dash (—) marks a missing value.",
          )}</p>
          <NativeTable title={t("측정 ID별 장비 산출값", "Reported values by measurement ID")}
            headers={[t("지표", "Parameter"), ...columns]}>
            {parameters.map(key => <tr key={key}>
              <th scope="row">{key}</th>{leaves.map(leaf => <td key={leaf.traceKey}>{leaf.reported[key] ?? "—"}</td>)}
            </tr>)}
          </NativeTable>
          <button type="button" className="inst-button alt" onClick={exportParameters}><Download size={15}/>{t("장비 산출값 CSV", "Instrument parameters CSV")}</button>
        </> : <p className="fp-note">{t(
          "이 파일에서 측정 ID와 연결되는 장비 산출값을 찾을 수 없습니다.",
          "This file contains no instrument-reported values that can be matched to these measurement IDs.",
        )}</p>}
      </section>

      <section className="inst-panel fp-results fp-native" aria-labelledby="fp-native-log">
        <h2 id="fp-native-log">{t("측정 기록과 처리구", "Measurement log and treatments")}</h2>
        <p className="fp-note">{t(
          "측정 ID는 장비가 부여한 번호입니다. 동일한 잎을 반복 측정했을 수 있으므로, 처리구를 비교하려면 실험 기록을 확인해 직접 입력하세요.",
          "IDs identify acquisitions. An individual leaf can be measured more than once. Use your experiment log to assign treatments before comparing groups.",
        )}</p>
        <NativeTable title={t("FluorPen 측정 기록", "FluorPen acquisition log")}
          headers={[t("측정", "Measurement"), t("기록 시각", "Recorded at"), ...(run ? [t("시료 설명", "Sample description")] : []), t("프로토콜", "Protocol"), t("측정점 수", "Readings"), t("처리구 (선택)", "Treatment (optional)")]}>
          {leaves.map(leaf => <tr key={leaf.traceKey}>
            <th scope="row">{traceLabel(leaf)}</th><td>{leaf.recordedAt || "—"}</td>{run && <td>{leaf.description || "—"}</td>}<td>{leaf.protocol}</td><td>{leaf.points.length}</td>
            <td><input aria-label={traceLabel(leaf) + " " + t("처리구", "treatment")} value={assignments[leaf.traceKey] || ""}
              placeholder={t("미지정", "Unassigned")} onChange={e => onAssignmentsChange({...assignments, [leaf.traceKey]: e.target.value})}/></td>
          </tr>)}
        </NativeTable>
        {summary.length > 0 && <div className="fp-native-group">
          <label className="fp-native-select">{t("처리구 비교 지표", "Parameter for treatment comparison")}
            <StudioSelect value={activeMetric} onValueChange={setMetric} aria-label={t("처리구 비교 지표", "Parameter for treatment comparison")}
              options={parameters.map(value => ({value, label:value}))}/>
          </label>
          <NativeTable title={activeMetric + " · " + t("처리구별 장비 산출값", "Reported values by treatment")}
            headers={[t("처리구", "Treatment"), t("유효 측정 수", "Measurements with values"), t("평균", "Mean"), "SD"]}>
            {summary.map(row => <tr key={row.group}><th scope="row">{row.group}</th>
              <td>{row.count}</td><td>{displayNumber(row.mean)}</td><td>{displayNumber(row.sd)}</td></tr>)}
          </NativeTable>
          <p className="fp-note">{t("SD는 같은 처리구에서 두 번 이상 측정된 값의 표준편차입니다.", "SD describes variation across two or more acquisitions assigned to the same treatment.")}</p>
        </div>}
      </section>
    </>
  );
}
