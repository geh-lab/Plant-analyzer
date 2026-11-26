import { useState } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { enzymeDefaults } from "@/utils/antioxidantCalculations";
import { DEFAULT_MDA_PATHLENGTH } from "@/utils/mda";
import "@/pages/assay.css";

const field = (key, ko, en, initial, positive = false, aliases = []) => ({ key, ko, en, initial, positive, aliases });
const pathlength = field("pathlength", "광경로 길이 (cm)", "Path length (cm)", 1, true, ["path_length", "l"]);
const dilution = field("dilutionFactor", "희석배수", "Dilution factor", 1, true, ["DF", "df"]);
const slope = field("std_a", "검량선 기울기 (a)", "Calibration slope (a)", "", true);
const intercept = field("std_b", "검량선 절편 (b)", "Calibration intercept (b)", 0);
const extract = field("extractMl", "전체 추출액 부피 (mL)", "Total extract (mL)", enzymeDefaults.extractMl, true);
const mass = field("dryMassMg", "추출한 조직의 건물중 상당량 (mg)", "Dry mass equivalent of extracted tissue (mg)", enzymeDefaults.dryMassMg, true);
const reaction = field("reactionUl", "전체 반응 부피 (µL)", "Total reaction volume (µL)", enzymeDefaults.reactionUl, true);
const aliquot = size => field("aliquotUl", "반응에 넣은 추출액 (µL)", "Extract added to the reaction (µL)", size, true);
const dryNormalization = [field("extractVolume", "총 추출 부피 (mL)", "Full extract volume (mL)", 2, true), field("dryMass", "건조 시료 무게 (g)", "Dry sample mass (g)", 0.02, true), dilution];
const pigmentParams = { fields: [pathlength, ...dryNormalization] };
const calibrationParams = { fields: [slope, intercept, ...dryNormalization] };
const configs = {
  mda: { nested: true, fields: [{ ...pathlength, initial: DEFAULT_MDA_PATHLENGTH }] },
  chlorophyll_a_b: pigmentParams,
  carotenoid: pigmentParams,
  total_phenol: calibrationParams,
  total_flavonoid: calibrationParams,
  h2o2: { nested: true, fields: [{ ...slope, key: "a" }, { ...intercept, key: "b" }, field("vol", "추출 부피 (mL)", "Extract volume (mL)", 2, true), field("dw", "건물중 (g)", "Dry weight (g)", 0.02, true), dilution] },
  dpph_scavenging: { fields: [field("dpph_control", "대조구 A517", "Control A517", "", true)] },
  anthocyanin: calibrationParams,
  glucosinolate: calibrationParams,
  cat: { nested: true, fields: [field("h2o2_control_slope", "대조구 기울기 (ΔA240/min)", "Control slope (ΔA240/min)", 0, false, ["H2O2_control_slope","control_slope"]), pathlength, dilution, extract, mass, reaction, aliquot(enzymeDefaults.catAliquotUl)] },
  pod: { nested: true, fields: [field("blank_slope", "블랭크 기울기 (ΔA470/min)", "Blank slope (ΔA470/min)", 0, false, ["Blank_slope"]), pathlength, dilution, extract, mass, reaction, aliquot(enzymeDefaults.podAliquotUl)] },
  sod: { nested: true, fields: [field("light_control_abs", "광조건 대조구 A560", "Light control A560", "", false, ["control_abs", "light_control"]), field("dark_blank_abs", "암조건 블랭크 A560", "Dark blank A560", 0, false, ["dark_blank"]), extract, mass] }
};

function fieldsFromParams(type, config, params) {
  const nested = config.nested ? params[type] || {} : params;
  const entries = config.fields.map(({ key, initial, aliases }) => {
    const recognizedKeys = [key, ...aliases];
    const saved = recognizedKeys.map(k => nested[k]).find(v => v !== undefined && v !== "" && v !== null);
    const legacy = config.nested && ["cat", "pod", "sod"].includes(type) && ["dilutionFactor", "pathlength"].includes(key)
      ? recognizedKeys.map(k => params[k]).find(v => v !== undefined && v !== "" && v !== null) : undefined;
    const oldAnthocyaninKey = { extractVolume: "V", dryMass: "m", dilutionFactor: "n" }[key];
    const oldAnthocyaninValue = type === "anthocyanin" && oldAnthocyaninKey ? params.anthocyanin?.[oldAnthocyaninKey] : undefined;
    return [key, saved ?? legacy ?? oldAnthocyaninValue ?? initial];
  });
  return Object.fromEntries(entries);
}

const emptyParams = {};
export default function CalculationParams({ analysisType, onParamsChange, initialParams = emptyParams, platePreview = null, lang = "ko" }) {
  const en = lang === "en";
  const config = configs[analysisType];
  const [draft, setDraft] = useState({});
  const [status, setStatus] = useState("");
  if (!config) return null;
  const fields = config.fields;
  const defaults = fieldsFromParams(analysisType, config, initialParams);
  const curveKeys = analysisType === "h2o2" ? ["a", "b"] : ["std_a", "std_b"];
  const curve = platePreview?.applied && platePreview.calibration?.curve;
  const savedSource = initialParams.plateCalibrationSource;
  const curveVersion = JSON.stringify([defaults[curveKeys[0]], defaults[curveKeys[1]], savedSource?.savedAt ?? savedSource?.fileName]);
  const values = { ...defaults };
  for (const [key, edit] of Object.entries(draft)) {
    if (!curveKeys.includes(key) || edit.curveVersion === curveVersion) values[key] = edit.value;
  }
  if (curve) { values[curveKeys[0]] = curve.a; values[curveKeys[1]] = curve.b; }

  function apply(e) {
    e.preventDefault();
    const parsed = {};
    for (const f of fields) {
      if (curve && curveKeys.includes(f.key)) continue;
      const n = Number(values[f.key]);
      if (values[f.key] === "" || !Number.isFinite(n) || (f.positive && n <= 0)) {
        setStatus(en ? `Check ${f.en.toLowerCase()}. ${f.positive ? "Enter a value greater than zero." : "Enter a number."}` : `${f.ko} 값을 ${f.positive ? "0보다 큰 수로" : "숫자로"} 입력하세요.`);
        return;
      }
      parsed[f.key] = n;
    }
    if (["cat", "pod"].includes(analysisType) && parsed.aliquotUl > parsed.reactionUl) {
      setStatus(en ? "The extract aliquot must fit within the reaction volume." : "추출액 분주량이 전체 반응 부피를 초과합니다.");
      return;
    }
    if (analysisType === "sod" && parsed.light_control_abs <= parsed.dark_blank_abs) {
      setStatus(en ? "The light control must exceed the dark blank." : "광조건 대조구는 암조건 블랭크보다 커야 합니다.");
      return;
    }
    const next = config.nested ? { ...initialParams, [analysisType]: { ...initialParams[analysisType], ...parsed } } : { ...initialParams, ...parsed };
    if (savedSource && !curve && curveKeys.some(key => Number(defaults[key]) !== parsed[key])) delete next.plateCalibrationSource;
    onParamsChange(next);
    setDraft({});
    setStatus(curve ? (en ? "Saved the other parameters. Adding samples will save the Excel curve." : "다른 계산 조건을 저장했습니다. Excel 검량선은 시료를 추가하면 저장합니다.") : (en ? "Parameters applied." : "분석 변수에 적용했습니다."));
  }
  function inputField(f) {
    const fromFile = Boolean(curve && curveKeys.includes(f.key));
    const fieldValue = values[f.key];
    const shown = fromFile && Number.isFinite(fieldValue) ? Number(fieldValue.toPrecision(14)) : fieldValue;
    return <label key={f.key}>{f[lang]}<Input required type="number" step="any" readOnly={fromFile} value={shown ?? ""} onChange={e => {
      setDraft({ ...draft, [f.key]: {value:e.target.value, curveVersion} }); setStatus(en ? "Apply to update the results." : "결과에 반영하려면 적용을 누르세요.");
    }}/></label>;
  }
  return (
    <form className="assay-form" onSubmit={apply}>
      {analysisType === "glucosinolate" && <p>{en ? "Use the sinigrin standard curve measured at 425 nm alongside the leaf extract. Report results as mg sinigrin equivalents per gram of leaf dry weight." : "잎 추출액과 같은 조건에서 425 nm로 측정한 시니그린 표준액의 검량선을 입력하세요. 결과는 잎 건물중 1 g당 시니그린 당량(mg SnE/g DW)으로 표시합니다."}</p>}
      {config === calibrationParams && !platePreview && <p>{en ? "Fit y = a × x + b with x in μg/mL before reagents are added. Use matched sample/standard processing and your verified linear range. V is the total extract volume. DF includes extra pre-assay dilution." : "시약 반응 전 표준액 농도 x (μg/mL)에 대해 y = a × x + b를 구하세요. 같은 조건으로 처리한 표준물질·시료와 검증한 직선 범위를 사용합니다. V는 전체 추출액 부피, DF는 반응 전 추가 희석배수입니다."}</p>}
      {config === pigmentParams && <p>{en ? "Use 90% methanol. Set the optical path to 1 cm for instrument-normalized readings, or enter the actual path length of the raw readings." : "90% 메탄올 추출액용 계수입니다. 장비에서 1 cm로 보정한 측정값은 광경로 1 cm, 보정 전 측정값은 실제 광경로 길이를 입력하세요."}</p>}
      {analysisType === "mda" && <p>{en ? "The default is a 1 cm cuvette. For plate readings, use the effective path length or enter 1 cm for instrument-normalized readings. Results are μM in the measured reaction mixture." : "기본값은 1 cm 큐벳입니다. 플레이트 측정값에는 실제 광경로 길이를, 장비가 1 cm로 보정한 값에는 1 cm를 입력하세요. 결과는 측정한 반응액의 농도(μM)입니다."}</p>}
      {["cat","pod"].includes(analysisType) && <p>{en ? "Use the initial linear slope per minute. Enter the effective plate path length or 1 cm for readings normalized to 1 cm. The default volumes and tissue dry mass correspond to the laboratory plate setup." : "초기 선형 구간의 분당 기울기를 입력하세요. 실제 광경로나 장비가 1 cm로 보정한 값에 해당하는 1 cm를 사용하세요. 기본 부피와 건물중은 실험실 플레이트 조건입니다."}</p>}
      {analysisType === "h2o2" && <p>{en ? "Use a slope fitted to pre-reaction standard concentrations in mM. The dilution factor applies only to any extra dilution of the extract." : "반응 전 표준액 농도(mM)를 기준으로 구한 검량선 기울기를 입력하세요. 희석배수에는 추출액에 별도로 적용한 희석만 반영합니다."}</p>}
      {analysisType === "sod" && <p>{en ? "The measured dilution gives NBT inhibition (%). To also report U/mg DW, enter each sample’s undiluted extract equivalent at the 50% inhibition endpoint of a dilution series." : "측정한 희석액에서 NBT 광환원 억제율(%)을 구합니다. U/mg DW도 계산하려면 희석계열에서 구한 50% 억제점의 원추출액 상당 부피를 시료별로 입력하세요."}</p>}
      {platePreview ? <p role="status" className="plate-note">{curve
        ? <><strong>{en ? "Filled from Excel" : "Excel 검량선 자동 입력"}</strong>{" · "}{platePreview.fileName} / {platePreview.sheetName}{". "}{en
          ? "Adding samples saves these coefficients. To enter your own, turn off the file curve in the preview."
          : "시료를 추가하면 이 계수가 저장됩니다. 직접 입력하려면 미리보기에서 파일 검량선 사용을 해제하세요."}{curve.unitAssumed && (" " + (en ? "Confirm the standard unit ("+curve.unit+") in your records." : "표준 농도 단위("+curve.unit+")를 실험 기록과 대조하세요."))}</>
        : platePreview.calibration?.curve ? (en ? "The file curve is off. The fields below use your workspace settings." : "파일 검량선 사용을 해제했습니다. 아래 계수는 워크스페이스 계산 조건입니다.")
        : <><strong>{en ? "Excel curve unavailable. " : "Excel 검량선 없음. "}</strong>{platePreview.status?.reason?.[lang]}{" "}{en ? "Use verified coefficients here." : "검증한 기울기와 절편을 아래에 입력할 수 있습니다."}</>}</p>
        : savedSource && <p className="plate-note">{en ? "Saved Excel curve" : "저장된 Excel 검량선"} · {savedSource.fileName} / {savedSource.sheetName}</p>}
      {platePreview ? <><div className="assay-form-fields">{fields.filter(f=>curveKeys.includes(f.key)).map(inputField)}</div>
        <details className="plate-csv-help"><summary>{en ? "Extraction and dilution settings" : "추출 부피·질량·희석 설정"}</summary>
          <div className="assay-form-fields">{fields.filter(f=>!curveKeys.includes(f.key)).map(inputField)}</div>
        </details></> : <div className="assay-form-fields">{fields.map(inputField)}</div>}
      <div className="assay-form-tools">{(!curve || Object.keys(draft).some(key => !curveKeys.includes(key))) && <Button type="submit" className="assay-form-submit"><Check/>{en ? "Apply parameters" : "분석 변수 적용"}</Button>}
        {status && <p role="status">{status}</p>}
      </div>
    </form>
  );
}
