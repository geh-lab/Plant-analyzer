import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readingFeedback } from "@/data/absorbanceRanges";
import { getMeasurementFields } from "@/utils/analysisFields";
import "@/pages/assay.css";

export default function ManualInput({ analysisType, onSaveSample, lang = "ko" }) {
  const en = lang === "en";
  const [group, setGroup] = useState("");
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [readings, setReadings] = useState({});
  const [feedback, setFeedback] = useState("");
  const fields = getMeasurementFields(analysisType, lang);
  function save(e) {
    e.preventDefault();
    if (!group.trim() || !name.trim()) {
      setFeedback(en ? "Enter a treatment and sample name." : "처리구와 시료명을 입력하세요.");
      return;
    }
    const values = {};
    for (const field of fields) {
      const value = readings[field.key] ?? "";
      if (value === "" && field.optional) continue;
      if (value === "" || !Number.isFinite(Number(value))) return;
      values[field.key] = Number(value);
    }
    const sample = { treatment_name: group.trim(), sample_name: name.trim(), analysis_type: analysisType, absorbance_values: values };
    if (analysisType === "h2o2" && weight) {
      if (Number(weight) <= 0) { setFeedback(en ? "Enter a positive fresh weight." : "생체중을 양수로 입력하세요."); return; }
      sample.weight = Number(weight);
    }
    onSaveSample(sample, false);
    setFeedback(en ? `Added ${name.trim()}.` : `${name.trim()} 시료를 추가했습니다.`);
    setName("");
    setReadings({});
    setWeight("");
  }
  return (
    <form className="assay-form" onSubmit={save}>
      <div className="assay-form-fields">
        <label>{en ? "Treatment" : "처리구"}<Input required value={group} onChange={e => setGroup(e.target.value)} placeholder="Control" /></label>
        <label>{en ? "Sample / replicate" : "시료명 / 반복"}<Input required value={name} onChange={e => setName(e.target.value)} placeholder="Rep1" /></label>
      </div>
      <div className="assay-form-fields">
        {fields.map(field => {
          const band = readingFeedback(analysisType, field.key, readings[field.key], en);
          const hintId = "measurement-band-" + field.key;
          return <div key={field.key}><label>{field.label}<Input required={!field.optional} type="number" step="any" inputMode="decimal" placeholder={field.placeholder} value={readings[field.key] ?? ""} aria-describedby={band ? hintId : undefined} onChange={e => setReadings({ ...readings, [field.key]: e.target.value })}/></label>
            {band && <small id={hintId} className="au-feedback" data-tone={band.tone}>{band.text}</small>}
          </div>;
        })}
        {analysisType === "h2o2" && <label>{en ? "Fresh weight (g, optional)" : "생체중 (g, 선택)"}<Input type="number" step="any" min="0" value={weight} onChange={e => setWeight(e.target.value)} /></label>}
      </div>
      {analysisType === "sod" && <p>{en ? "An empty sample dark blank uses the reagent dark blank. Enter V₅₀ only from a dilution series, expressed as µL of undiluted extract." : "시료 암 블랭크를 비워 두면 공통 암 블랭크를 사용합니다. V₅₀에는 희석계열에서 얻은 원추출액 상당 부피(µL)를 입력하세요."}</p>}
      <Button type="submit" className="assay-form-submit"><Plus/>{en ? "Add sample" : "시료 추가"}</Button>
      {feedback && <p role="status">{feedback}</p>}
    </form>
  );
}
