import StudioSelect from "@/components/StudioSelect";
import { useEffect, useState } from "react";
import { desulfoFactors } from "@/utils/hplcQuantification";
import { measurementNumber } from "@/utils/instrumentData";
import { ExternalLink } from "@/components/instruments/InstrumentFrame";

export default function DesulfoCalibration({
  sampleNames,
  initialValues,
  onApply,
  lang,
}) {
  const en = lang === "en",
    t = (ko, eng) => (en ? eng : ko);
  const [draft, setDraft] = useState(initialValues),
    [error, setError] = useState("");
  useEffect(() => {
    setDraft(initialValues);
    setError("");
  }, [initialValues]);
  const standard = draft.standardCompound || "Sinigrin",
    factors = draft.responseFactors || {};
  const getSample = (name) =>
    draft.sampleInputs?.find((row) => row.name === name) || {
      name,
      area: "",
      mass: "",
      amount: "",
    };
  const updateSample = (name, key, value) => {
    const rows = sampleNames.map((n) => ({
      ...getSample(n),
      ...(n === name ? { [key]: value } : {}),
    }));
    setDraft({ ...draft, sampleInputs: rows });
  };
  const apply = (e) => {
    e.preventDefault();
    const rows = sampleNames
      .map(getSample)
      .filter((s) => [s.amount, s.area, s.mass].some((v) => v !== ""));
    const valid = (v) => measurementNumber(v) > 0;
    if (
      !rows.length ||
      rows.some((s) => ![s.amount, s.area, s.mass].every(valid))
    ) {
      setError(
        t(
          "계산할 시료마다 면적·첨가량·건조질량을 모두 양수로 입력하세요.",
          "Enter positive area, spike amount and dry mass for each sample being quantified.",
        ),
      );
      return;
    }
    if (
      !valid(factors[standard]) ||
      !Object.entries(factors).some(
        ([name, v]) => name !== standard && valid(v),
      ) ||
      Object.values(factors).some((v) => v !== "" && !valid(v))
    ) {
      setError(
        t(
          "내부표준과 하나 이상의 분석물에 양의 보정계수가 필요합니다.",
          "Enter a positive correction factor for the internal standard and at least one analyte.",
        ),
      );
      return;
    }
    setError("");
    onApply({
      method: "desulfo-is",
      standardCompound: standard,
      responseFactors: factors,
      sampleInputs: rows,
    });
  };
  return (
    <form className="inst-form" onSubmit={apply}>
      <h3>
        {t("탈황체 내부표준 정량", "Desulfo internal-standard quantification")}
      </h3>
      <p className="inst-muted">
        {t(
          "시료와 함께 탈황한 내부표준을 선택하세요. 각 표준 피크 면적은 같은 시료의 크로마토그램에서 가져옵니다.",
          "Choose the internal standard desulfated with the samples. Enter each standard area from that sample’s own chromatogram.",
        )}
      </p>
      {initialValues.standardArea && !initialValues.method && (
        <p className="inst-note">
          {t(
            "이전에 저장한 공통 면적·분자량 방식에는 시료별 표준 첨가량과 보정계수가 없습니다. 기존 피크를 유지했으며 아래 조건을 입력하면 다시 계산합니다.",
            "Earlier settings used one shared area and molecular weight. The original peaks are retained. Enter the sample-specific spike and factors below to recalculate.",
          )}
        </p>
      )}
      <label className="inst-field">
        {t("내부표준", "Internal standard")}
        <StudioSelect aria-label={t("내부표준", "Internal standard")} value={standard}
          onValueChange={standardCompound => setDraft({...draft,standardCompound})}
          options={["Sinigrin","Glucotropaeolin"].map(value=>({value,label:value}))}/>
      </label>
      <details className="inst-details" open>
        <summary>{t("229 nm 보정계수", "229 nm correction factors")}</summary>
        <p className="inst-muted">
          {t(
            "sinigrin을 1로 둔 곱셈형 보정계수입니다. 표의 값을 불러온 뒤 실험실 검증값으로 수정할 수 있습니다.",
            "Multiplicative factors relative to sinigrin = 1. Load the published table or enter factors validated in your lab.",
          )}
        </p>
        <button
          type="button"
          className="inst-outline"
          onClick={() =>
            setDraft({ ...draft, responseFactors: { ...desulfoFactors } })
          }
        >
          {t("문헌 표 3 값 적용", "Load Table 3 factors")}
        </button>
        <div className="inst-labels">
          {Object.keys(desulfoFactors).map((c) => (
            <label className="inst-field" key={c}>
              {c}
              <input
                type="number"
                step="any"
                min="0"
                value={factors[c] ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    responseFactors: { ...factors, [c]: e.target.value },
                  })
                }
              />
            </label>
          ))}
        </div>
        <ExternalLink href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5409297/">
          {t("Grosser & van Dam · 표 3", "Grosser & van Dam · Table 3")}
        </ExternalLink>
      </details>
      <h4>{t("시료별 추출 조건", "Per-sample measurements")}</h4>
      {sampleNames.length === 0 && (
        <p className="inst-note">
          {t(
            "아래에서 피크를 불러오면 시료별 입력란이 열립니다.",
            "Import peaks below to open the per-sample fields.",
          )}
        </p>
      )}
      {sampleNames.map((name) => (
        <fieldset key={name}>
          <legend>{name}</legend>
          <div className="inst-labels">
            {[
              ["area", t("내부표준 피크 면적", "Internal-standard area")],
              [
                "amount",
                t("내부표준 첨가량 (µmol)", "Internal standard added (µmol)"),
              ],
              ["mass", t("추출한 건조질량 (g)", "Extracted dry mass (g)")],
            ].map(([key, label]) => (
              <label key={key} className="inst-field">
                {label}
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={getSample(name)[key] ?? ""}
                  onChange={(e) => updateSample(name, key, e.target.value)}
                />
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <p className="inst-note">µmol/g DW = (Aᵢ / Aᵢₛ) × nᵢₛ × (Fᵢ / Fᵢₛ) / m</p>
      <button className="inst-button" disabled={!sampleNames.length}>
        {t("계산 조건 적용", "Apply parameters")}
      </button>
      {initialValues.method === "desulfo-is" && (
        <p role="status" className="inst-muted">
          {t(
            "내부표준 계산 조건이 적용되어 있습니다.",
            "Internal-standard parameters are applied.",
          )}
        </p>
      )}
      {error && (
        <p role="alert" className="inst-req">
          {error}
        </p>
      )}
    </form>
  );
}
