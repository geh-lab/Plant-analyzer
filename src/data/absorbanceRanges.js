// Laboratory discussion bands for individual wavelength readings. The boundaries
// describe signal size, not instrument specifications or assay acceptance limits.
export const absorbanceBands = [
  { max: .1, range: "A < 0.1", tone: "low", label: ["낮은 신호", "Low signal"], action: ["시료 신호가 블랭크 변동과 구분되는지 확인하세요. 배경 파장은 낮게 읽힐 수 있습니다.", "Compare the signal with blank variability. A background wavelength may legitimately read low."] },
  { max: .5, range: "0.1 ≤ A ≤ 0.5", tone: "preferred", label: ["목표 구간 예시", "Example target"], action: ["반복 판독의 편차를 확인하세요. 분석법에 별도 기준이 있으면 그 기준을 따릅니다.", "Check replicate precision. Use the assay’s own working range where one is specified."] },
  { max: 1, range: "0.5 < A ≤ 1.0", tone: "good", label: ["중간 신호", "Moderate signal"], action: ["같은 파장과 광경로에서 검증한 범위인지 확인하세요.", "Check the verified working range at this wavelength and optical path."] },
  { max: 1.5, range: "1.0 < A ≤ 1.5", tone: "check", label: ["직선성 확인", "Check linearity"], action: ["이 신호 크기에서 장비의 직선성과 반복 정밀도를 확인하세요.", "Verify instrument linearity and replicate precision at this signal level."] },
  { max: 2, range: "1.5 < A ≤ 2.0", tone: "dilute", label: ["희석 검토", "Review dilution"], action: ["검증 범위를 벗어나면 분석법에 맞게 시료를 희석해 다시 반응·측정하고 희석배수를 기록하세요.", "If outside the verified range, rerun the assay with an appropriate sample dilution and record the factor."] },
  { max: Infinity, range: "A > 2.0", tone: "high", label: ["고흡광 확인", "High absorbance"], action: ["투과율이 1% 미만입니다. 이 범위의 장비 성능과 분석법이 확인되어야 정량할 수 있습니다.", "Transmittance is below 1%. Check instrument performance and assay validity here before quantifying."] }
];

function readingNumber(raw) {
  if (typeof raw !== "number" && (typeof raw !== "string" || !raw.trim())) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function absorbanceBand(raw) {
  const a = readingNumber(raw);
  if (a === null) return null;
  return a < .1 ? absorbanceBands[0] : absorbanceBands.slice(1).find(band => a <= band.max);
}

const pigmentMethod = {
  label: ["엽록소·카로티노이드 · 3개 파장", "Pigments · three wavelengths"],
  note: ["665.2·652.4·470 nm를 각각 확인하세요. 잎 색소 큐벳법의 문헌 권장값은 0.3–0.85 AU이며 낮은 적색부 신호에 특히 주의합니다. 플레이트에서는 용매와 실제 광경로를 확인하세요.",
    "Inspect 665.2, 652.4 and 470 nm separately. The leaf-pigment cuvette method recommends 0.3–0.85 AU and flags low red-band readings. For plates, check the solvent and actual optical path."],
  source: ["잎 색소 원법", "Leaf pigment method", "https://doi.org/10.1002/0471142913.faf0403s01"],
};

function standardCurve(label, wavelength, standard, blank) {
  return {
    label: [label[0] + " · A" + wavelength, label[1] + " · A" + wavelength],
    note: ["A" + wavelength + " 판독을 확인한 뒤 " + blank[0] + "로 표준액과 시료를 같은 방식으로 보정하세요. 보정 신호가 " + standard[0] + " 검량선의 검증 범위 안에 있을 때 정량합니다.",
      "Inspect each A" + wavelength + " reading. Apply the same " + blank[1] + " correction to standards and samples, then quantify within the verified " + standard[1] + " calibration range."],
  };
}
const scopes = {
  chlorophyll_a_b: pigmentMethod,
  carotenoid: pigmentMethod,
  total_phenol: standardCurve(["총 페놀", "Phenolics"], "765", ["갈산", "gallic acid"], ["시약 블랭크", "reagent blank"]),
  total_flavonoid: standardCurve(["플라보노이드", "Flavonoids"], "415", ["퀘르세틴", "quercetin"], ["발색 시약을 뺀 색 블랭크", "matched colour blank"]),
  glucosinolate: standardCurve(["글루코시놀레이트", "Glucosinolates"], "425", ["시니그린", "sinigrin"], ["시약 블랭크", "reagent blank"]),
  h2o2: standardCurve(["과산화수소", "Peroxide"], "390", ["같은 KI 조건의 H₂O₂", "matched H₂O₂/KI"], ["시약 블랭크", "reagent blank"]),
  mda: {
    label: ["MDA · A532와 A600 각각", "MDA · individual A532 and A600"],
    note: ["각 파장을 따로 확인하세요. 배경 파장인 A600은 낮을 수 있습니다. A532 − A600은 광경로를 반영해 MDA 당량으로 환산하고, 유색 시료는 532 nm에서 색소 간섭도 확인합니다.",
      "Check each wavelength separately. The background reading A600 may be low. Use A532 − A600 and the optical path for MDA equivalents. Check pigmented extracts for interference at 532 nm."],
    source: ["MDA 색소 간섭 연구", "MDA pigment interference", "https://doi.org/10.1007/s004250050524"],
  },
  anthocyanin: {
    label: ["안토시아닌 · A530과 A600 각각", "Anthocyanins · individual A530 and A600"],
    note: ["두 판독을 각 파장의 용매 블랭크로 보정하세요. 이 실험실 방법은 A530 − A600을 같은 산성 용매의 C3G 검량선에 대입합니다. A600은 배경 판독입니다.",
      "Blank both wavelengths against the solvent. This local method calibrates A530 − A600 against C3G standards in the same acidified solvent. A600 measures background."],
  },
  cat: {
    label: ["CAT · 시간별 A240", "CAT · A240 over time"],
    note: ["각 시간점의 A240과 초기 감소 구간의 직선성을 확인하세요. 같은 시간 구간에서 대조구 기울기 − 시료 기울기(ΔA/min)로 H₂O₂ 분해 속도를 구합니다.",
      "Inspect A240 at each time and check that the initial decrease is linear. Use the control slope minus the sample slope (ΔA/min) over the same time window."],
  },
  pod: {
    label: ["POD · 시간별 A470", "POD · A470 over time"],
    note: ["각 시간점의 A470과 초기 증가 구간의 직선성을 확인하세요. 같은 시간 구간에서 시료 기울기 − 블랭크 기울기(ΔA/min)로 생성 속도를 구합니다.",
      "Inspect A470 at each time and check that the initial rise is linear. Use the sample slope minus the blank slope (ΔA/min) over the same time window."],
  },
  sod: {
    label: ["SOD · 광·암조건 A560", "SOD · light and dark A560"],
    note: ["시료·광 대조구·암 블랭크의 A560을 확인하세요. 암 배경을 뺀 광 대조구가 충분히 커야 억제율(%)을 해석할 수 있습니다. 50% 억제점은 희석계열에서 확인합니다.",
      "Inspect sample, illuminated control and dark-blank A560. The dark-corrected light control must be distinguishable from background to interpret inhibition (%). Locate the 50% endpoint with a dilution series."],
  },
  dpph_scavenging: {
    label: ["DPPH · 시료·대조구 A517", "DPPH · sample and control A517"],
    note: ["동일한 반응 시간에 시료·대조구의 A517을 확인하세요. 시료 색 블랭크를 보정하고 용매 블랭크를 뺀 DPPH 대조구와 비교합니다. 소거율(%)은 이 비율로 평가합니다.",
      "Inspect sample and control A517 at the same endpoint. Correct for sample colour and compare with the solvent-blanked DPPH control. This ratio determines scavenging (%)."],
  },
};
const genericScope = {
  label: ["개별 파장 판독 (AU)", "Individual wavelength readings (AU)"],
  note: ["블랭크 변동과 반복 판독의 정밀도를 확인하고 분석법에서 검증한 범위로 정량하세요.",
    "Check blank variability, replicate precision and the working range established for the assay."],
};

export function absorbanceScope(analysisType) {
  return Object.hasOwn(scopes, analysisType) ? scopes[analysisType] : genericScope;
}

// Inline feedback describes the entered reading only. Blanks, slopes and volumes
// are separate fields; the 600 nm reference can legitimately approach zero.
export function readingFeedback(analysisType, fieldKey, raw, en = false) {
  if (!/^\d+(?:\.\d+)?$/.test(fieldKey)) return null;
  const band = absorbanceBand(raw);
  if (!band) return null;
  if (fieldKey === "600" && ["mda", "anthocyanin"].includes(analysisType) && band.tone === "low") {
    return { tone: "low", text: en ? "Background wavelength · compare with the blank" : "배경 파장 · 블랭크와 비교" };
  }
  if (["chlorophyll_a_b", "carotenoid"].includes(analysisType) && ["665.2", "652.4"].includes(fieldKey)) {
    return { tone: "low", text: en ? "Red band · cuvette guide 0.3–0.85 AU. Check plate path length." : "적색부 · 큐벳법 참고 0.3–0.85 AU, 플레이트 광경로 확인" };
  }
  return { tone: band.tone, text: (en ? "Lab guide · " : "실험실 참고 · ") + band.label[Number(en)] + " · " + band.range + " AU" };
}
