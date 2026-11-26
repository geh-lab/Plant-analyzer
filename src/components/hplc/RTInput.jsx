import { useEffect, useState } from "react";
import { getHplcCompounds, hplcCompoundLabel } from "@/data/hplcProtocols";
import { measurementNumber } from "@/utils/instrumentData";
import "@/components/instruments/instruments.css";

const empty = {};
export default function RTInput({
  analysisType,
  onRTStandardsChange,
  initialValues = empty,
  lang = "ko",
}) {
  const en = lang === "en",
    compounds = getHplcCompounds(analysisType, lang);
  const [values, setValues] = useState(initialValues);
  const [message, setMessage] = useState("");
  useEffect(() => {
    setValues(initialValues);
    setMessage("");
  }, [initialValues, analysisType]);
  const apply = (e) => {
    e.preventDefault();
    const parsed = Object.fromEntries(
      Object.entries(values)
        .filter(([, v]) => v !== "")
        .map(([k, v]) => [k, measurementNumber(v)]),
    );
    if (
      !Object.keys(parsed).length ||
      Object.values(parsed).some((v) => v === null || v <= 0)
    ) {
      setMessage(
        en
          ? "Enter at least one positive retention time."
          : "하나 이상의 양수 머무름 시간을 입력하세요.",
      );
      return;
    }
    onRTStandardsChange(parsed);
  };
  return (
    <form className="inst-form" onSubmit={apply}>
      <h3>{en ? "Reference retention times" : "표준물질 머무름 시간"}</h3>
      <p className="inst-muted">
        {en
          ? "Enter a retention time in minutes for each compound measured with this method."
          : "측정할 화합물의 표준물질 머무름 시간(RT)을 분 단위로 입력하세요."}
      </p>
      <div className="inst-labels">
        {compounds.map((c) => (
          <label className="inst-field" key={c}>
            {hplcCompoundLabel(c, lang)} (min)
            <input
              type="number"
              step="any"
              min="0"
              value={values[c] ?? ""}
              onChange={(e) => {
                setMessage("");
                setValues({ ...values, [c]: e.target.value });
              }}
            />
          </label>
        ))}
      </div>
      <button className="inst-button">
        {en ? "Apply RT standards" : "RT 기준 적용"}
      </button>
      {Object.keys(initialValues).length > 0 && (
        <p className="inst-muted" role="status">
          {en
            ? `${Object.keys(initialValues).length} applied standards`
            : `적용한 표준물질 ${Object.keys(initialValues).length}개`}
        </p>
      )}
      {message && (
        <p role="alert" className="inst-req">
          {message}
        </p>
      )}
    </form>
  );
}
