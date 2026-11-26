import { useEffect, useMemo, useRef, useState } from "react";
import { Download, FileUp } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { InstrumentFrame } from "@/components/instruments/InstrumentFrame";
import StudioSelect from "@/components/StudioSelect";
import Fp100Profile from "@/components/instruments/Fp100Profile";
import Fp100Chart from "@/components/instruments/Fp100Chart";
import Fp100Guide from "@/components/instruments/Fp100Guide";
import Fp100Native from "@/components/instruments/Fp100Native";
import Fp100Workbook from "@/components/instruments/Fp100Workbook";
import {
  analyzeLeaf,
  decodeFp100Text,
  fpCurves,
  fpGroups,
  fpMetrics,
  parseFp100,
  phaseBounds,
} from "@/utils/fp100";
import { displayNumber as fmt, downloadCsv } from "@/utils/resultData";
import "./fp100.css";

const storageKey = "geh-fp100-traces-v1";
const header = "sample,group,time_ms,Ft";
function initialData() {
  try {
    const data = JSON.parse(sessionStorage.getItem(storageKey));
    return typeof data?.text === "string" ? data : { text: "" };
  } catch {
    return { text: "" };
  }
}
function exampleData() {
  const points = [
    [0.02, 220],
    [0.05, 245],
    [0.1, 276],
    [0.15, 311],
    [0.3, 363],
    [1, 454],
    [2, 515],
    [10, 592],
    [30, 694],
    [60, 741],
    [100, 806],
    [300, 865],
    [500, 859],
    [1000, 842],
  ];
  const rows = [header];
  for (const [group, factor] of [
    ["Control", 1],
    ["Treatment", 1.12],
  ]) {
    for (const [sample, offset] of [
      ["A", 0],
      ["B", 13],
    ]) {
      for (const [t, f] of points)
        rows.push(
          [
            sample,
            group,
            t,
            Math.round(
              f * factor +
                (group === "Control" ? 0 : 18 * Math.sin(Math.log(t) + 1)) +
                offset,
            ),
          ].join(","),
        );
    }
  }
  return rows.join("\n");
}

export default function Fp100({ lang = "ko" }) {
  const en = lang === "en",
    t = (ko, eng) => (en ? eng : ko);
  const [data, setData] = useState(initialData);
  const [draft, setDraft] = useState(data.text);
  const [importId, setImportId] = useState(0);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [params, setParams] = useSearchParams();
  const guide = params.get("view") === "guide";
  function setGuide(show) {
    const next = new URLSearchParams(params);
    if (show) next.set("view", "guide");
    else next.delete("view");
    setParams(next, { replace: true });
  }
  const [protocol, setProtocol] = useState(
    data.protocol === "manual" ? "manual" : "study",
  );
  const [phase, setPhase] = useState("WOP"),
    [difference, setDifference] = useState(false);
  const [reference, setReference] = useState(data.control || ""),
    [metric, setMetric] = useState("Fv/Fm");
  const [error, setError] = useState(""),
    [storageWarning, setStorageWarning] = useState(false);
  const readToken = useRef(0),
    fileInput = useRef(null);
  const workbookSummary = useRef(null);
  useEffect(() => {
    if (importId && data.workbook && workbookSummary.current) {
      workbookSummary.current.focus({preventScroll:true});
      workbookSummary.current.scrollIntoView({block:"start", behavior:"instant"});
    }
  }, [importId, data.workbook]);
  const parsed = useMemo(() => parseFp100(data.text), [data.text]);
  const leaves = useMemo(
    () => parsed.format === "fluorpen" ? [] : parsed.leaves.map((leaf) => analyzeLeaf(leaf, protocol)),
    [parsed, protocol],
  );
  const groups = useMemo(
    () => [...new Set(leaves.map((leaf) => leaf.group))],
    [leaves],
  );
  const control = groups.includes(reference)
    ? reference
    : groups.find((g) => /^(control|ctrl|대조구)$/i.test(g)) || groups[0] || "";
  const curves = useMemo(
    () => fpCurves(leaves, phase, control, difference),
    [leaves, phase, control, difference],
  );
  const summaries = useMemo(
    () => fpGroups(leaves, metric, control),
    [leaves, metric, control],
  );
  const study = protocol === "study";
  const isNative = parsed.format === "fluorpen";
  const loadedNative = isNative && parsed.leaves.length > 0;
  const acquisitionCount = parsed.leaves.length;
  const signalCount = loadedNative ? parsed.leaves.reduce((total, leaf) => total + leaf.points.length, 0) : 0;
  const protocolNames = loadedNative ? [...new Set(parsed.leaves.map(leaf => leaf.protocol))].join(", ") : "";
  const opts = (values) => values.map((value) => ({ value, label: value }));
  function persist(next) {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(next));
      setStorageWarning(false);
    } catch {
      setStorageWarning(true);
    }
  }
  function accept(next) {
    setData(next);
    setImportId(id => id + 1);
    setPasteOpen(false);
    setDraft(next.text);
    setError("");
    persist(next);
  }
  function apply(text, source = "") {
    readToken.current++;
    const input = parseFp100(text);
    if (!input.header || !input.leaves.length) {
      setError(
        t(
          "가져올 측정값이 없습니다. FluorPen OJIP 파일의 SOURCE DATA와 시간 단위, 또는 표의 sample, group, time_ms(또는 time_us, time_s), Ft 열과 중복 시각을 확인하세요.",
          "No usable traces. Check SOURCE DATA and its time unit in the FluorPen OJIP export, or verify the sample, group, time_ms (or time_us, time_s), and Ft columns and check for duplicate times.",
        ),
      );
      return;
    }
    accept({ text, source, protocol, control: reference });
  }
  async function loadFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const token = ++readToken.current;
    try {
      if (/\.xlsx$/i.test(file.name)) {
        const { readFp100Workbook } = await import("@/utils/fp100Workbook");
        const workbook = await readFp100Workbook(file);
        if (token === readToken.current) accept({text: "", source: file.name, workbook});
        return;
      }
      const text = decodeFp100Text(await file.arrayBuffer());
      if (token === readToken.current) apply(text, file.name);
    } catch {
      if (token === readToken.current)
        setError(/\.xlsx$/i.test(file.name) ? t(
          "이 Excel에서 지원하는 LC·NPQ 측정 블록을 읽을 수 없습니다. FluorPen의 Measuring, SOURCE DATA 또는 COMPUTED VALUES를 포함한 .xlsx인지 확인하세요.",
          "Could not read a supported LC or NPQ block. Use a FluorPen .xlsx export with a Measuring header and SOURCE DATA or COMPUTED VALUES.",
        ) : t("파일을 읽을 수 없습니다.", "The file could not be read."));
    }
  }
  function updateAssignments(assignments) {
    const next = { ...data, assignments };
    setData(next);
    persist(next);
  }
  function selectProtocol(value) {
    setProtocol(value);
    persist({ ...data, protocol: value, control: reference });
  }
  function chooseControl(value) {
    setReference(value);
    persist({ ...data, protocol, control: value });
  }
  const chartTitle =
    (difference ? "Δ" : "") +
    phase +
    (phase === "Ft" && !difference ? " (a.u.)" : "");
  function exportCurves() {
    downloadCsv("fp100-" + (difference ? "delta-" : "") + phase, [
      [
        "timing_preset",
        "time_ms",
        "group",
        "metric",
        "value",
        "leaf_n",
        "SE",
        "control",
        "control_n",
      ],
      ...curves.flatMap(({ t, series }) =>
        series.map(({ group, count, mean, se, controlCount }) => [
          protocol,
          t,
          group,
          chartTitle,
          mean,
          count,
          se,
          difference ? control : "",
          controlCount,
        ]),
      ),
    ]);
  }
  function exportMetrics() {
    downloadCsv("fp100-leaf-jip", [
      [
        "timing_preset",
        "sample",
        "group",
        "Fo",
        "FK",
        "FJ",
        "FI",
        "Fm_observed",
        "P_time_ms",
        ...fpMetrics,
      ],
      ...leaves.map((l) => [
        protocol,
        l.name,
        l.group,
        ...["O", "K", "J", "I", "P"].map((k) => l.bounds[k][1]),
        l.bounds.P[0],
        ...fpMetrics.map((key) => l.metrics[key]),
      ]),
    ]);
  }
  function exportSummary() {
    downloadCsv("fp100-group-jip", [
      [
        "timing_preset",
        "metric",
        "group",
        "n",
        "mean",
        "SD",
        "SE",
        "control",
        "ratio_to_control",
      ],
      ...fpMetrics.flatMap((k) =>
        fpGroups(leaves, k, control).map((row) => [
          protocol,
          k,
          row.group,
          row.count,
          row.mean,
          row.sd,
          row.se,
          control,
          row.relative,
        ]),
      ),
    ]);
  }
  return (
    <InstrumentFrame
      parent={t("생리 계측", "Plant physiology")}
      parentPath={en ? "/physiological_en" : "/physiological"}
      title={t("FP100 엽록소 형광", "FP100 chlorophyll fluorescence")}
      image="/specimens/hemp-geh.webp"
      summary={t(
        "FluorPen의 LC3 광반응, NPQ2 광소광·암회복, OJIP 형광 유도를 측정별로 살펴보세요. 원시 형광과 장비 산출값을 비교하고 시료별 표에서 JIP 지표를 계산할 수 있습니다.",
        "Explore LC3 light responses, NPQ2 quenching and dark recovery, and OJIP induction by measurement. Compare raw fluorescence with FluorPen readouts or calculate JIP parameters from a labeled sample table.",
      )}
    >
      <div className="inst-tabs">
        <button
          type="button"
          aria-pressed={!guide}
          onClick={() => setGuide(false)}
        >
          {t("데이터 분석", "Analyze data")}
        </button>
        <button
          type="button"
          aria-pressed={guide}
          onClick={() => setGuide(true)}
        >
          {t("장비 및 연구 프로토콜", "Instrument & study protocol")}
        </button>
      </div>
      {guide ? (
        <Fp100Guide en={en} />
      ) : (
        <div className="fp-workflow">
          <section className="inst-panel fp-import">
            <p className="inst-caption">FluorPen FP100 · OJIP / LC / NPQ</p>
            <h2>{t("형광 시계열 불러오기", "Import fluorescence traces")}</h2>
            <p>
              {t(
                "LC·NPQ 측정은 FluorPen Excel(.xlsx), OJIP는 원본 TXT를 여세요. 시료별 표는 CSV·TSV 또는 붙여넣기로 가져올 수 있습니다.",
                "Open a FluorPen Excel workbook (.xlsx) for LC or NPQ, or an OJIP ASCII export (.txt). For labeled sample tables, open a CSV or TSV, or paste the data.",
              )}
            </p>
            <div className="inst-actions">
              <button type="button" className="inst-button" onClick={() => fileInput.current?.click()}>
                <FileUp size={16} />
                {t("측정 파일 열기", "Open measurement file")}
              </button>
              <input type="file" ref={fileInput} accept=".xlsx,.csv,.tsv,.txt,text/plain,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={loadFile} hidden />
              <button type="button" className="inst-button alt" aria-expanded={pasteOpen}
                aria-controls="fp-paste-data" onClick={() => setPasteOpen(!pasteOpen)}>
                {t("측정값 붙여넣기", "Paste measurements")}
              </button>
              <button type="button" className="inst-link" onClick={() => apply(exampleData(), ":example")}>
                {t("예시 데이터", "Example data")}
              </button>
            </div>
            <div id="fp-paste-data" className="fp-paste-area" hidden={!pasteOpen}>
              <label className="fp-paste">
                {t("FluorPen TXT 원문 또는 시료별 표", "FluorPen export or labeled sample table")}
                <textarea value={draft} rows={4} onChange={e => setDraft(e.target.value)}
                  spellCheck={false} placeholder={header + "\nLeaf-1,Control,0.02,220"} />
              </label>
              <p className="fp-note">
                {t(
                  "시료별 표는 잎마다 시료 ID를 지정하고 sample, group, time_ms(또는 time_us, time_s), Ft 열에 측정값을 입력하세요. 각 잎의 최고점까지 포함하세요. 같은 시각이 두 번 있는 측정 계열은 제외됩니다.",
                  "For labeled tables, give each leaf a sample ID and include sample, group, time_ms (or time_us, time_s), and Ft. Include the rise through the peak. Traces with duplicate timestamps are excluded.",
                )}
              </p>
              <button type="button" className="inst-button" disabled={!draft.trim()} onClick={() => apply(draft)}>
                {t("붙여넣은 값 적용", "Apply pasted data")}
              </button>
            </div>
            {error && (
              <p role="alert" className="fp-status">
                {error}
              </p>
            )}
            {storageWarning && (
              <p role="status" className="fp-status">
                {t(
                  "이 브라우저의 탭 저장 공간이 부족합니다. 새로고침 전 CSV를 저장하세요.",
                  "Tab storage is unavailable. Save a CSV before refreshing.",
                )}
              </p>
            )}
            {data.workbook?.runs?.length > 0 && <div className="fp-status" role="status">
              {data.source} · {data.workbook.runs.map(run => run.protocol).filter((p, i, names) => names.indexOf(p) === i).join(", ")}
            </div>}
            {parsed.leaves.length > 0 && (
              <div className="fp-status" role="status">
                {data.source === ":example"
                  ? t("가상 측정값 예시", "Synthetic example")
                  : data.source ||
                    t("붙여넣은 측정값", "Pasted measurements")}{" "}
                {loadedNative ? (
                  <>· {protocolNames} · {t("측정 기록", "Measurements")} {acquisitionCount} · {t("Ft 측정값", "Ft readings")} {signalCount.toLocaleString(en ? "en-US" : "ko-KR")}</>
                ) : (
                  <>· {t("시료", "Leaves")} {leaves.length} · {t("처리구", "Groups")} {groups.length}</>
                )}
                {parsed.skipped > 0 &&
                  " · " + (isNative ? t("제외된 측정값", "Skipped readings") : t("제외된 행", "Skipped rows")) + " " + parsed.skipped}
                {parsed.duplicates > 0 &&
                  " · " +
                    t("중복 시각", "Repeated timestamps") +
                    " " +
                    parsed.duplicates}
              </div>
            )}
          </section>
          {data.workbook?.runs?.length > 0 && (
            <Fp100Workbook key={importId} workbook={data.workbook} assignments={data.assignments || {}}
              onAssignmentsChange={updateAssignments} en={en} summaryRef={workbookSummary}
              onOpenFile={() => fileInput.current?.click()}/>
          )}
          {loadedNative && (
            <Fp100Native key={importId} leaves={parsed.leaves} assignments={data.assignments || {}}
              onAssignmentsChange={updateAssignments} en={en}/>
          )}
          {leaves.length > 0 && (
            <>
              <section className="inst-panel fp-results">
                <h2>{t("형광 유도 곡선", "Fluorescence induction")}</h2>
                <div className="fp-inputs">
                  <label>
                    {t("기준 시점", "Landmark timings")}
                    <StudioSelect
                      value={protocol}
                      onValueChange={selectProtocol}
                      aria-label={t("기준 시점", "Landmark timings")}
                      options={[
                        {
                          value: "study",
                          label: t(
                            "헴프 논문 · O 20 µs / I 30 ms",
                            "Cannabis study · O 20 µs / I 30 ms",
                          ),
                        },
                        {
                          value: "manual",
                          label: t(
                            "FP 100 설명서 · O 50 µs / I 60 ms",
                            "FP 100 manual · O 50 µs / I 60 ms",
                          ),
                        },
                      ]}
                    />
                  </label>
                  <label>
                    {t("곡선", "Curve")}
                    <StudioSelect
                      value={phase}
                      onValueChange={(value) => {
                        setPhase(value);
                        if (value === "Ft") setDifference(false);
                      }}
                      aria-label={t("곡선", "Curve")}
                      options={opts(["Ft", ...Object.keys(phaseBounds)])}
                    />
                  </label>
                  <label>
                    {t("대조구", "Control group")}
                    <StudioSelect
                      value={control}
                      onValueChange={chooseControl}
                      aria-label={t("대조구", "Control group")}
                      options={opts(groups)}
                    />
                  </label>
                  {phase !== "Ft" && (
                    <label className="fp-check">
                      <input
                        type="checkbox"
                        checked={difference}
                        onChange={(e) => setDifference(e.target.checked)}
                      />
                      {t("대조구 차이 (ΔW)", "Subtract control (ΔW)")}
                    </label>
                  )}
                </div>
                <Fp100Chart
                  curves={curves}
                  groups={groups}
                  label={chartTitle}
                  en={en}
                />
                <p className="fp-note">
                  {t(
                    "같은 시각에 실제 측정된 잎의 평균을 표시합니다. W는 잎별로 정규화한 뒤 평균을 계산하며, ΔW는 대조구와 시각이 일치할 때 표시합니다.",
                    "Each point averages leaves measured at that time. W is normalized within each leaf before averaging. ΔW uses shared measurement times with the control.",
                  )}
                </p>
                <button
                  type="button"
                  className="inst-button alt"
                  onClick={exportCurves}
                >
                  <Download size={15} />
                  {t("곡선 CSV", "Curve CSV")}
                </button>
              </section>
              <section className="inst-panel fp-results">
                <h2>{t("JIP 지표 비교", "JIP parameter comparison")}</h2>
                <Fp100Profile
                  leaves={leaves}
                  groups={groups}
                  control={control}
                  en={en}
                />
                <div className="fp-inputs">
                  <label>
                    {t("지표", "Parameter")}
                    <StudioSelect
                      value={metric}
                      onValueChange={setMetric}
                      aria-label={t("지표", "Parameter")}
                      options={opts(fpMetrics)}
                    />
                  </label>
                </div>
                <div className="fp-table">
                  <table>
                    <caption>
                      {metric} · {t("처리구별 요약", "Group summary")}
                    </caption>
                    <thead>
                      <tr>
                        {[
                          t("처리구", "Group"),
                          "n",
                          t("평균", "Mean"),
                          "SE",
                          t("대조구 대비 배수", "Fold of control"),
                        ].map((s) => (
                          <th key={s} scope="col">
                            {s}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {summaries.map((row) => (
                        <tr key={row.group}>
                          <th scope="row">{row.group}</th>
                          <td>{row.count}</td>
                          <td>{fmt(row.mean)}</td>
                          <td>{fmt(row.se)}</td>
                          <td>{fmt(row.relative)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="fp-note">
                  {t(
                    "n은 유효한 잎 수입니다. SE는 잎이 2개 이상일 때 표시합니다. 기준 시각이 누락되거나 분모가 0이면 해당 지표는 비워 둡니다.",
                    "n counts leaves with an available result. SE requires at least two leaves. A missing landmark or zero denominator leaves the affected parameter blank.",
                  )}{" "}
                  {study &&
                    t(
                      "이 연구에서 Mo는 20 µs와 별도로 50 µs 값이 필요합니다.",
                      "The study’s Mo calculation requires an additional reading at 50 µs.",
                    )}
                </p>
                <div className="inst-actions">
                  <button
                    type="button"
                    className="inst-button alt"
                    onClick={exportMetrics}
                  >
                    <Download size={15} />
                    {t("잎별 지표 CSV", "Leaf parameters CSV")}
                  </button>
                  <button
                    type="button"
                    className="inst-button alt"
                    onClick={exportSummary}
                  >
                    <Download size={15} />
                    {t("처리구 통계 CSV", "Group statistics CSV")}
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      )}
    </InstrumentFrame>
  );
}
