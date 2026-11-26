import { useEffect, useState } from "react";
import {
  getHplcCompounds, hplcCompoundLabel,
  isCalibrationCurveHplcType,
} from "@/data/hplcProtocols";
import { measurementNumber } from "@/utils/instrumentData";
import "@/components/instruments/instruments.css";
const empty = {};
export default function CalculationInput({
  analysisType,
  onCalculationParamsChange,
  initialValues = empty,
  lang = "ko",
}) {
  const en = lang === "en",
    curve = isCalibrationCurveHplcType(analysisType),
    compounds = getHplcCompounds(analysisType, lang);
  const [values, setValues] = useState(initialValues),
    [message, setMessage] = useState("");
  useEffect(() => {
    setValues(initialValues);
    setMessage("");
  }, [initialValues, analysisType]);
  const label = (ko, english) => (en ? english : ko);
  const fields = [
    ["sampleWeight", label("건조 시료 무게 (g)", "Dry sample mass (g)")],
    ["extractionVolume", analysisType === "artemisinin"
      ? label("재용해 부피 (mL)", "Reconstitution volume (mL)")
      : label("추출 부피 (mL)", "Extraction volume (mL)")],
    ["dilutionFactor", label("희석 배수", "Dilution factor"), 1],
  ];
  const input = (key, name, fallback = "", min) => (
    <label className="inst-field" key={key}>
      {name}
      <input
        type="number"
        aria-label={
          key.endsWith("_a") || key.endsWith("_b")
            ? hplcCompoundLabel(key.slice(0, -2), lang) + " " + name
            : undefined
        }
        min={min}
        step="any"
        value={values[key] ?? fallback}
        onChange={(e) => {
          setMessage("");
          setValues({ ...values, [key]: e.target.value });
        }}
      />
    </label>
  );
  const apply = (e) => {
    e.preventDefault();
    const parameters = {};
    for (const [key, , fallback] of fields) {
      const value = measurementNumber(values[key] ?? fallback);
      if (value === null || value <= 0) {
        setMessage(
          label(
            "공통 변수에 양수를 입력하세요.",
            "Enter positive values for all sample parameters.",
          ),
        );
        return;
      }
      parameters[key] = value;
    }
    if (curve) {
      for (const compound of compounds) {
        const aKey = compound + "_a",
          bKey = compound + "_b";
        if ((values[aKey] ?? "") === "" && (values[bKey] ?? "") === "")
          continue;
        const a = measurementNumber(values[aKey]),
          b = measurementNumber(values[bKey] === "" ? 0 : (values[bKey] ?? 0));
        if (a === null || a <= 0 || b === null) {
          setMessage(
            compound +
              " · " +
              label(
                "양수 기울기와 유효한 절편을 입력하세요.",
                "Enter a positive slope and a numeric intercept.",
              ),
          );
          return;
        }
        parameters[aKey] = a;
        parameters[bKey] = b;
      }
      if (!compounds.some((c) => c + "_a" in parameters)) {
        setMessage(
          label(
            "하나 이상의 화합물에 표준곡선을 입력하세요.",
            "Enter a calibration curve for at least one compound.",
          ),
        );
        return;
      }
    }
    onCalculationParamsChange(parameters);
  };
  return (
    <form className="inst-form" onSubmit={apply}>
      <h3>{label("정량 계산 조건", "Quantification settings")}</h3>
      <p className="inst-muted">
        {label(
          "표준곡선의 농도 단위는 µg/mL입니다. 절편을 비우면 0을 사용합니다. 같은 배치의 질량·추출 부피·희석 배수를 사용합니다. 시료의 조건이 다르면 별도로 계산하세요. 결과는 검량 범위와 정량한계를 확인한 뒤 보고하세요.",
          "Use concentrations in µg/mL. A blank intercept uses zero. These sample conditions apply across this batch. Calculate separately when mass, extract volume or dilution differs. Check each result against the validated range and LOQ.",
        )}
      </p>
      <div className="inst-labels">
        {fields.map(([k, n, v]) => input(k, n, v, "0"))}
      </div>
      {analysisType === "artemisinin" && <p className="inst-muted">{label(
        "197 nm 방법에서는 농축 후 메탄올로 재용해한 실제 부피를 입력하세요. 10,000에서 1,000 mg/L로 희석했으면 희석배수는 10입니다. 원 여과액의 일부만 취했으면 전체 대비 분취량도 환산에 반영하세요.",
        "For the 197 nm method, enter the volume after reconstitution in methanol. Diluting from 10,000 to 1,000 mg/L gives a factor of 10. If only an aliquot of the filtrate was concentrated, also account for its fraction of the original extract."
      )}</p>}
      {curve && (
        <div className="inst-calibrations">
          {compounds.map((c) => (
            <fieldset key={c}>
              <legend>{hplcCompoundLabel(c, lang)}</legend>
              <div className="inst-labels">
                {input(c + "_a", label("기울기 a", "Slope a"), "", "0")}
                {input(c + "_b", label("절편 b", "Intercept b"))}
              </div>
            </fieldset>
          ))}
        </div>
      )}
      <p className="inst-note">
        C (µg/mL) = (Area − b) / a · mg/g DW = C × V × DF / (m × 1000)
      </p>
      <button className="inst-button">
        {label("계산 조건 적용", "Apply parameters")}
      </button>
      {Object.keys(initialValues).length > 0 && (
        <p className="inst-muted" role="status">
          {label(
            "계산 조건이 적용되어 있습니다.",
            "Calculation parameters are applied.",
          )}
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
