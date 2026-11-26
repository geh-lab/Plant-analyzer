import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import StudioSelect from "@/components/StudioSelect";
import { fpMethods } from "@/data/fp100Methods";
import { downloadCsv, summarize } from "@/utils/resultData";
import Fp100Native, { NativeTable } from "./Fp100Native";
import Fp100Chart from "./Fp100Chart";

const traceName = leaf => "ID " + leaf.name;
const unique = values => [...new Set(values)];
const methodSettings = new Map(fpMethods("en").map(method => [method.id, method.settings]));

function Field({ label, value, options, onChange }) {
  return <label className="fp-native-select">
    {label}<StudioSelect aria-label={label} value={value} options={options} onValueChange={onChange}/>
  </label>;
}

function StagePanel({ run, en, fileName }) {
  const t = (ko, eng) => en ? eng : ko;
  const lightCurve = run.kind === "lc";
  const groupedKeys = useMemo(() => {
    const result = new Map();
    for (const key of run.metrics) {
      const match = /^(.*)_((?:L|D)(?:\d+|ss))$/i.exec(key);
      if (!match) continue;
      const [, parameter, stage] = match;
      if (!result.has(parameter)) result.set(parameter, []);
      result.get(parameter).push({key, stage});
    }
    return result;
  }, [run.metrics]);
  const [metric, setMetric] = useState(lightCurve ? "QY" : "NPQ");
  const [mode, setMode] = useState("id");
  const [description, setDescription] = useState("");
  const selectedMetric = groupedKeys.has(metric) ? metric : groupedKeys.keys().next().value;
  const stages = groupedKeys.get(selectedMetric) || [];
  const levels = methodSettings.get(run.methodId)?.levels;
  const useLevels = lightCurve && levels?.length && stages.length &&
    stages.every(({stage}) => /^L[1-9]\d*$/.test(stage) && Number(stage.slice(1)) <= levels.length);
  const xValue = stage => useLevels ? levels[Number(stage.slice(1)) - 1] : stage;
  const descriptions = unique(run.leaves.map(leaf => leaf.description).filter(Boolean));
  const chosen = description ? run.leaves.filter(leaf => leaf.description === description) : run.leaves;
  const meanMode = mode === "description";
  const groupFor = leaf => meanMode ? leaf.description : traceName(leaf);
  const members = new Map();
  for (const leaf of chosen) {
    const group = groupFor(leaf);
    if (!group) continue;
    if (!members.has(group)) members.set(group, []);
    members.get(group).push(leaf);
  }
  const groups = [...members.keys()];
  const rows = stages.map(({key, stage}) => ({
    t: xValue(stage), key, stage,
    series: groups.map(group => {
      const values = members.get(group).map(leaf => leaf.reported[key]);
      return {group, ...summarize(values)};
    }),
  }));
  const fluorescence = /^(?:Fm|Ft|Fo|Fp)$/i.test(selectedMetric);
  const chartLabel = selectedMetric + (fluorescence ? " (a.u.)" : "");
  const source = meanMode ? t("시료 설명별 평균 ± SE", "Mean by description ± SE") : t("측정 ID", "Measurement ID");
  const ref = lightCurve ? 30 : 28;
  const hasNegative = rows.some(row => chosen.some(leaf => Number.isFinite(leaf.reported[row.key]) && leaf.reported[row.key] < 0));
  function exportStages() {
    downloadCsv(run.protocol + "-stages", [
      ["source_file", "worksheet", "block", "protocol", "source_parameter", "stage", "nominal_ppfd_umol_m2_s", "series_basis", "series", "measurements", "value", "SD", "SE"],
      ...rows.flatMap(row => row.series.map(point => [
        fileName, run.sheetName, run.block, run.protocol, row.key, row.stage, useLevels ? row.t : null,
        mode, point.group, point.count, point.mean, meanMode ? point.sd : null, meanMode ? point.se : null,
      ])),
    ]);
  }
  return <section className="inst-panel fp-results fp-native fp-stage-panel">
    <p className="inst-caption">COMPUTED VALUES · {run.protocol}</p>
    <h2>{lightCurve ? t("광량 단계별 반응", "Response by light level") : t("광조사와 암회복", "Illumination and dark recovery")}</h2>
    {stages.length ? <>
      <div className="fp-stage-controls">
        <Field label={t("단계 지표", "Reported parameter")} value={selectedMetric} onChange={setMetric}
          options={[...groupedKeys.keys()].map(value => ({value, label:value}))}/>
        <Field label={t("계열 구분", "Series grouping")} value={mode} onChange={setMode}
          options={[{value:"id", label:t("측정 ID", "Measurement ID")},
            ...(descriptions.length ? [{value:"description", label:t("시료 설명별 평균", "Mean by description")}] : [])]}/>
        {descriptions.length > 0 && <Field label={t("시료 설명", "Sample description")} value={description} onChange={setDescription}
          options={[{value:"", label:t("전체 설명", "All descriptions")}, ...descriptions.map(value => ({value,label:value}))]}/>}
      </div>
      <Fp100Chart curves={rows} groups={groups} label={chartLabel + " · " + source} en={en} showError={meanMode}
        paletteOrder={meanMode ? descriptions : run.leaves.map(traceName)}
        axis={useLevels ? {label:t("명목 PPFD (µmol m⁻² s⁻¹)", "Nominal PPFD (µmol m⁻² s⁻¹)"), ticks:rows.map(r => r.t), unit:"µmol m⁻² s⁻¹"}
          : {label:t("장비 기록 단계", "Reported stage"), type:"category"}}/>
      <p className="fp-note">{useLevels ? t(
        "가로축은 매뉴얼에 명시된 프로토콜의 단계별 명목 광량입니다. 세로축은 파일에 저장된 값입니다.",
        "The x-axis uses the protocol’s nominal light levels from the manual. The y-axis uses values recorded in the workbook.",
      ) : t(
        "L은 작용광, D는 암회복 단계입니다. ss는 장비가 기록한 정상상태입니다. 가로축은 측정 순서입니다.",
        "L denotes actinic light, D marks dark recovery, and ss is the reported steady state. The horizontal axis shows acquisition order.",
      )}{" "}<a href={"/protocols/fluorpen-fp100-manual.pdf#page=" + ref} target="_blank" rel="noreferrer">{t("매뉴얼", "Manual")} · p. {ref}</a></p>
      {meanMode && <p className="fp-note">{t(
        "DESCR가 같은 측정 기록으로 평균을 구합니다. SE는 유효한 측정 기록이 2개 이상일 때 계산합니다.",
        "Means use acquisitions with the same DESCR. SE uses the available acquisitions and requires at least two.",
      )}</p>}
      {hasNegative && <p className="fp-stage-flag">{t(
        "이 지표에는 장비가 보고한 음수가 있습니다. 해당 측정 ID의 원시 형광과 대조하세요.",
        "This parameter includes negative readings reported by the instrument. Compare the corresponding IDs with their raw fluorescence traces.",
      )}</p>}
      <details className="fp-native-detail">
        <summary>{t("단계별 값 보기", "View stage values")}</summary>
        <NativeTable title={chartLabel + " · " + source} headers={[t("원본 항목", "Source parameter"), ...groups]}>
          {rows.map(row => <tr key={row.key}><th scope="row">{row.key}</th>{row.series.map(point =>
            <td key={point.group}>{point.mean === null ? "—" : (meanMode ? Number(point.mean.toPrecision(6)) : point.mean)}
              {meanMode && <small>n={point.count} · SE {point.se === null ? "—" : Number(point.se.toPrecision(5))}</small>}</td>)}</tr>)}
        </NativeTable>
      </details>
      <button type="button" className="inst-button alt" onClick={exportStages}><Download size={15}/>{t("단계별 CSV", "Stage values CSV")}</button>
    </> : <p className="fp-note">{t("이 블록에는 그래프로 표시할 단계별 산출값이 없습니다.", "This block contains no stage-specific values to plot.")}</p>}
  </section>;
}

export default function Fp100Workbook({ workbook, en, assignments, onAssignmentsChange, summaryRef, onOpenFile }) {
  const t = (ko, eng) => en ? eng : ko;
  const [runId, setRunId] = useState(workbook.runs[0].id);
  const run = workbook.runs.find(item => item.id === runId) || workbook.runs[0];
  const leaves = useMemo(() => run.leaves.map(leaf => ({...leaf, block:run.block, protocol:run.protocol})), [run]);
  const readings = leaves.reduce((sum, leaf) => sum + leaf.points.length, 0);
  return <>
    <div className="fp-run-overview" ref={summaryRef} tabIndex={-1} role="region" aria-label={t("불러온 FluorPen 측정", "Imported FluorPen measurements")}>
      <div><strong>{run.protocol}</strong><span>{workbook.fileName} · {run.sheetName} · {t("블록", "Block")} {run.block}</span></div>
      <dl>{[[t("측정 기록", "Measurements"), leaves.length],[t("Ft 측정값", "Ft readings"), readings],[t("장비 지표", "Reported parameters"),run.metrics.length]].map(([label,value]) =>
        <div key={label}><dt>{label}</dt><dd>{value.toLocaleString()}</dd></div>)}</dl>
      {workbook.runs.length > 1 && <Field label={t("측정 블록", "Measurement block")} value={run.id} onChange={setRunId}
        options={workbook.runs.map(r => ({value:r.id,label:r.sheetName + " · " + r.protocol + " · " + r.block}))}/>}
      <button type="button" className="inst-button alt" onClick={onOpenFile}>{t("다른 파일 열기", "Open another file")}</button>
      {(run.skipped > 0 || run.duplicates > 0 || run.unmatchedReported > 0) && <p className="fp-note">{t("제외한 판독", "Skipped readings")} {run.skipped} · {t("중복 시각", "Duplicate times")} {run.duplicates} · {t("연결되지 않은 기기 산출 열", "Unmatched reported columns")} {run.unmatchedReported}</p>}
    </div>
    <div className="fp-workbook-grid" key={run.id}>
      <StagePanel run={run} en={en} fileName={workbook.fileName}/>
      <Fp100Native leaves={leaves} run={run} fileName={workbook.fileName} assignments={assignments} en={en}
        onAssignmentsChange={onAssignmentsChange}/>
    </div>
  </>;
}
