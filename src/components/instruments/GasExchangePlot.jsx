import { useRef, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FileUp, ClipboardList } from "lucide-react";
import { parseGasExchange } from "@/utils/instrumentData";

const example =
  "Qin,Ci,A\n0,345,-0.9\n50,318,1.5\n100,305,3.4\n250,276,7.8\n500,257,12.6\n1000,240,16.4\n1500,233,17.1";

export default function GasExchangePlot({ en }) {
  const [values, setValues] = useState("");
  const [data, setData] = useState(null);
  const [axis, setAxis] = useState("Q");
  const [notice, setNotice] = useState("");
  const fileInput = useRef(null);
  const readText = (raw, name) => {
    const parsed = parseGasExchange(raw);
    if (!parsed.records.length) {
      setNotice(
        en
          ? "Could not find numeric rows. Include A and at least one of Qin or Ci."
          : "수치 행을 찾을 수 없습니다. A와 Qin 또는 Ci 열 이름을 확인하세요.",
      );
      return;
    }
    setAxis(parsed.records.some((r) => r.Q !== null) ? "Q" : "Ci");
    setData({ ...parsed, name });
    setNotice("");
  };
  const loadFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      readText(await file.text(), file.name);
    } catch {
      setNotice(
        en ? "The file could not be read." : "파일을 읽을 수 없습니다.",
      );
    }
  };
  const rows = data?.records.filter((row) => row[axis] !== null) || [];
  const unit = axis === "Q" ? "µmol photons m⁻² s⁻¹" : "µmol CO₂ mol⁻¹";
  const xLabel = axis === "Q" ? "PPFD" : "Ci";
  return (
    <article className="inst-panel">
      <h2>{en ? "Gas-exchange plot" : "가스 교환 반응도"}</h2>
      <p className="inst-muted">
        {en
          ? "Load one response series per file. Include assimilation (A) and incident light (Qin or PPFD) or intercellular CO₂ (Ci). Each point is a logged measurement."
          : "반응 곡선 한 개에 해당하는 로그를 불러오세요. 순광합성률(A)과 입사 광량(Qin 또는 PPFD)이나 잎 내부 CO₂ 농도(Ci)가 필요합니다. 점 하나가 측정 한 건입니다."}
      </p>
      <a
        className="inst-link"
        href="https://www.licor.com/support/LI-6800/topics/symbols.html"
        target="_blank"
        rel="noreferrer"
      >
        {en
          ? "LI-COR data dictionary · A, light and Ci"
          : "LI-COR 변수·단위표 · A, 광량, Ci"}
      </a>
      <div className="inst-actions">
        <button
          className="inst-button"
          onClick={() => fileInput.current.click()}
        >
          <FileUp size={16} />
          {en ? "Open CSV / TSV" : "CSV / TSV 열기"}
        </button>
        <button
          className="inst-outline"
          onClick={() =>
            readText(
              example,
              en ? "Example · light response" : "예시 · 광 반응",
            )
          }
        >
          <ClipboardList size={15} />
          {en ? "Load example" : "예시 불러오기"}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".csv,.tsv,.txt"
          onChange={loadFile}
          hidden
        />
      </div>
      <details className="inst-details">
        <summary>
          {en ? "Paste a measurement table" : "측정표 붙여넣기"}
        </summary>
        <label className="inst-field">
          {en ? "Column names and measurements" : "열 이름과 측정값"}
          <textarea
            rows={4}
            placeholder={"Qin,Ci,A\n100,290,4.2"}
            value={values}
            onChange={(e) => setValues(e.target.value)}
          />
        </label>
        <div className="inst-actions">
          <button
            className="inst-outline"
            disabled={!values.trim()}
            onClick={() =>
              readText(values, en ? "Pasted measurements" : "붙여넣은 측정값")
            }
          >
            {en ? "Plot measurements" : "그래프 그리기"}
          </button>
        </div>
      </details>
      {notice && (
        <p role="alert" className="inst-req">
          {notice}
        </p>
      )}
      {data && (
        <div className="inst-section">
          <h3>{data.name}</h3>
          <p className="inst-muted">
            {en
              ? `${rows.length} plotted measurements · ${data.skipped} nonnumeric or incomplete lines skipped`
              : `측정값 ${rows.length}개 표시 · 수치가 없거나 불완전한 행 ${data.skipped}개 제외`}
          </p>
          <div className="inst-tabs">
            {["Q", "Ci"].map((key) => (
              <button
                key={key}
                disabled={!data.records.some((r) => r[key] !== null)}
                aria-pressed={axis === key}
                onClick={() => setAxis(key)}
              >
                A/{key}
              </button>
            ))}
          </div>
          <div
            className="inst-chart"
            role="img"
            aria-label={
              en
                ? `Assimilation versus ${xLabel} scatter plot. Values in the table below.`
                : `순광합성률과 ${xLabel} 산점도. 아래 표에서 수치를 확인할 수 있습니다.`
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 8, right: 20, bottom: 24, left: 10 }}
              >
                <CartesianGrid stroke="#dbe3d9" strokeDasharray="3 5" />
                <XAxis
                  type="number"
                  dataKey={axis}
                  name={xLabel}
                  unit=""
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11 }}
                  label={{
                    value: `${xLabel} (${unit})`,
                    position: "insideBottom",
                    offset: -15,
                    style: { fontSize: 12 },
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="A"
                  name="A"
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "A (µmol CO₂ m⁻² s⁻¹)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 12 },
                  }}
                />
                <Tooltip cursor={{ strokeDasharray: "2 4" }} />
                <Scatter data={rows} fill="#296748" isAnimationActive={false} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <details className="inst-details">
            <summary>{en ? "Measurement table" : "측정값 표"}</summary>
            <div className="inst-table">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>
                      {xLabel} ({unit})
                    </th>
                    <th>A (µmol CO₂ m⁻² s⁻¹)</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{row[axis]}</td>
                      <td>{row.A}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}
    </article>
  );
}
