// Page numbers refer to the supplied 40-page FluorPen FP 100 Series Operation Manual.
const lcSettings = {
  lc1: { levels: [10, 20, 50, 100, 300, 500], secondsPerLevel: 60 },
  lc2: { levels: [100, 200, 300, 500, 1000], secondsPerLevel: 30 },
  lc3: { levels: [10, 20, 50, 100, 300, 500, 1000], secondsPerLevel: 60 },
};

// 'first' is measured from the phase start; 'interval' is the time between pulses.
const npqSettings = {
  npq1: {
    light: { seconds: 60, pulses: 5, first: 7, interval: 12 },
    dark: { seconds: 88, pulses: 3, first: 11, interval: 26 },
  },
  npq2: {
    light: { seconds: 200, pulses: 10, first: 10, interval: 20 },
    dark: { seconds: 390, pulses: 7, first: 20, interval: 60 },
  },
};

function lightCurve(id, t) {
  const settings = lcSettings[id];
  const { levels, secondsPerLevel } = settings;
  const sequence = levels.join(" → ") + " µmol photons m⁻² s⁻¹";
  return {
    id,
    title: t(id.toUpperCase() + " · " + levels.length + "단계 광반응",
      id.toUpperCase() + " · " + levels.length + "-step light curve"),
    principle: t("같은 잎에 작용광을 단계적으로 높여 광량에 따른 광계 II의 유효 양자수율 변화를 측정합니다.",
      "Increase actinic light in steps on one leaf to measure how effective PSII quantum yield changes with irradiance."),
    steps: [
      t("암적응한 잎을 클립에 고정하고 기기에서 이 광반응 프로토콜을 선택합니다. 시작할 때 최소 형광 Fo와 포화 펄스에서 최대 형광 Fm을 측정합니다.",
        "Clip the dark-adapted leaf in place and select this light curve on the instrument. Record initial Fo and maximum fluorescence Fm from the first saturating pulse."),
      t("광량을 " + sequence + " 순으로 높입니다. 각 단계를 " + secondsPerLevel + "초 유지합니다.",
        "Apply " + sequence + " in sequence. Hold each level for " + secondsPerLevel + " s."),
      t("각 단계에서 작용광 아래의 Ft와 포화 펄스의 최대 형광 Fm′를 짝지어 그 광량에서의 수율을 계산합니다.",
        "At each level, pair Ft under actinic light with Fm′ from the saturating pulse to calculate yield at that irradiance."),
    ],
    outputs: [
      t("암적응 수율 QYmax = (Fm − Fo) / Fm", "Dark-adapted QYmax = (Fm − Fo) / Fm"),
      t("단계별 실측 형광 Ft_Ln과 Fm_Ln", "Fluorescence readings Ft_Ln and Fm_Ln at each light level"),
      t("광량별 유효 수율 QY_Ln = (Fm_Ln − Ft_Ln) / Fm_Ln", "Effective QY_Ln = (Fm_Ln − Ft_Ln) / Fm_Ln versus irradiance"),
    ],
    page: 30, settings,
  };
}

function quenching(id, t) {
  const settings = npqSettings[id];
  const { light, dark } = settings;
  return {
    id,
    title: t(id.toUpperCase() + " · " + light.seconds + "초 광조사와 회복",
      id.toUpperCase() + " · " + light.seconds + " s illumination and recovery"),
    principle: t("같은 잎에서 빛을 켰을 때 비광화학적 소광이 생기고 빛을 끈 뒤 얼마나 풀리는지 포화 펄스로 추적합니다.",
      "Saturating pulses track how non-photochemical quenching develops during illumination and relaxes after the actinic light is switched off."),
    steps: [
      t("암적응한 잎에서 약한 측정광으로 Fo를 읽고 첫 포화 펄스로 Fm을 읽습니다. 짧은 암회복 후 작용광을 켭니다.",
        "Measure Fo on the dark-adapted leaf, then Fm with the first saturating pulse. Allow a short dark relaxation before switching on actinic light."),
      t("광조사 " + light.seconds + "초 동안 시작 후 " + light.first + "초에 첫 펄스를 주고, " + light.interval + "초 간격으로 총 " + light.pulses + "회 조사합니다.",
        "During " + light.seconds + " s of actinic light, deliver the first pulse at " + light.first + " s and the rest every " + light.interval + " s, for " + light.pulses + " pulses in total."),
      t("작용광을 끄고 " + dark.seconds + "초 동안 회복시킵니다. 끈 뒤 " + dark.first + "초에 첫 펄스를 주고 " + dark.interval + "초 간격으로 총 " + dark.pulses + "회 조사합니다.",
        "Switch off actinic light for " + dark.seconds + " s of recovery. Deliver the first pulse " + dark.first + " s after switch-off and the rest every " + dark.interval + " s, for " + dark.pulses + " pulses in total."),
    ],
    outputs: [
      t("암적응 기준 Fo, Fm, QYmax와 빠른 형광 상승의 정점 Fp", "Dark-reference Fo, Fm and QYmax, plus the early fluorescence peak Fp"),
      t("각 펄스의 Fm′와 직전의 Ft로 계산한 유효 수율 (Fm′ − Ft) / Fm′", "Effective yield (Fm′ − Ft) / Fm′ from each pulse maximum and the preceding Ft"),
      t("NPQ = (Fm − Fm′) / Fm′. 광조사(L)와 암회복(D)의 값을 시간순으로 비교합니다.",
        "NPQ = (Fm − Fm′) / Fm′. Compare the light (L) and dark-recovery (D) series in time order."),
      t("광화학적 소광계수 qP는 그 시점의 최소 형광 Fo′도 사용합니다.", "The photochemical quenching coefficient qP also uses the phase-specific minimum Fo′."),
    ],
    page: 28, settings,
  };
}

export function fpMethods(lang = "ko") {
  const t = (ko, en) => lang === "en" ? en : ko;
  return [
    {
      id: "ojip", title: t("OJIP · 빠른 형광 유도", "OJIP · fast fluorescence induction"),
      principle: t("암적응한 잎에 강한 빛을 비추면 엽록소 형광이 O에서 J와 I를 거쳐 최고점 P에 이릅니다.",
        "In a dark-adapted leaf, strong illumination drives a rapid fluorescence rise through O, J and I to the peak P."),
      steps: [
        t("잎을 클립으로 암적응시키고 적응 시간과 잎 위치를 기록합니다.", "Dark-adapt the leaf in a clip. Record the adaptation time and sampled leaf position."),
        t("Measure에서 OJIP를 선택하고 SET을 눌러 조사 직후부터 형광을 기록합니다.", "Under Measure, select OJIP and press SET to record fluorescence from the start of illumination."),
        t("내보낸 TXT의 SOURCE DATA에서 실제 시각별 형광을 확인합니다. COMPUTED VALUES에는 기기가 산출한 지표가 담깁니다.",
          "Inspect the acquisition times and fluorescence under SOURCE DATA in the exported TXT. COMPUTED VALUES holds the instrument-reported parameters."),
      ],
      outputs: [
        t("실측 Ft 유도 곡선과 최고점의 시각", "Observed Ft transient and time of the recorded peak"),
        t("매뉴얼의 기준 시각은 Fo 50 µs, FJ 2 ms, FI 60 ms입니다.", "Manual landmarks use 50 µs for Fo, 2 ms for FJ and 60 ms for FI."),
        t("Fv/Fm, VJ, VI와 반응중심당 에너지 지표", "Fv/Fm, VJ, VI and energy flux estimates per reaction centre"),
      ], page: 27,
    },
    ...["lc1", "lc2", "lc3"].map((id) => lightCurve(id, t)),
    ...["npq1", "npq2"].map((id) => quenching(id, t)),
    {
      id: "ft", title: t("Ft · 순간 엽록소 형광", "Ft · instantaneous fluorescence"),
      principle: t("약한 측정광으로 잎의 현재 형광 세기를 읽습니다. 암적응한 잎에서 이 값은 최소 형광 Fo에 해당합니다.",
        "A measuring pulse reads the leaf’s current fluorescence. In a dark-adapted leaf this reading represents minimum fluorescence, Fo."),
      steps: [
        t("측정할 잎을 클립에 고정하고 암적응 여부와 주변 광조건을 기록합니다.", "Position the leaf in the clip and record its adaptation state and illumination."),
        t("Measure에서 Ft를 선택하고 SET을 눌러 형광값을 읽습니다.", "Select Ft under Measure and press SET to take a reading."),
      ],
      outputs: [t("측정 당시의 Ft (상대 형광 단위)", "Ft at acquisition, in relative fluorescence units"),
        t("암적응한 잎에서의 Fo", "Fo when the leaf was dark-adapted")],
      page: 11,
    },
    {
      id: "qy", title: t("QY · 광계 II 양자수율", "QY · PSII quantum yield"),
      principle: t("잎에 포화 펄스를 주어 광계 II 수율을 읽습니다. 기기가 보고하는 수율을 해석하려면 측정 전 잎의 광조건을 기록해야 합니다.",
        "Apply a saturating pulse to read PSII yield. Record the leaf’s light conditions before the reading so the reported yield can be interpreted."),
      steps: [
        t("최대 수율을 측정할 때는 잎을 암적응시킵니다. 광적응 QY를 측정할 때는 지정한 광조건에 잎을 적응시킵니다.", "Dark-adapt the leaf for maximum yield. For a light-adapted QY reading, acclimate the leaf to the specified illumination."),
        t("Measure에서 QY를 선택하고 SET을 누릅니다. 결과와 함께 잎의 광조건을 기록합니다.", "Select QY under Measure and press SET. Record the leaf’s light conditions with its yield."),
      ],
      outputs: [t("암적응 · Fv/Fm = (Fm − Fo) / Fm", "Dark-adapted · Fv/Fm = (Fm − Fo) / Fm"),
        t("광적응 · 매뉴얼의 QY 단독 측정 항목은 Fv′/Fm′로 표기합니다(5, 11쪽).", "For light-adapted leaves, the manual labels the standalone QY reading Fv′/Fm′ (pp. 5 and 11)."),
        t("LC·NPQ의 단계별 유효 수율은 (Fm′ − Ft) / Fm′로 정의됩니다(28, 30쪽). 결과에는 측정 모드도 함께 기록하세요.", "In LC and NPQ, the manual defines effective yield as (Fm′ − Ft) / Fm′ at each step (pp. 28 and 30). Include the measurement mode with the result.")],
      page: 11,
    },
    {
      id: "par", title: t("PAR · 광합성 광양자속밀도", "PAR · photosynthetic photon flux density"),
      principle: t("광센서로 식물에 입사하는 광합성 유효 복사의 광양자속밀도(PPFD)를 읽습니다. 이 매뉴얼에서 해당 센서를 갖춘 모델은 PAR-FluorPen FP 100-MAX-LM입니다.",
        "The light sensor measures incident photosynthetic photon flux density (PPFD). The model equipped with this sensor in this manual is the PAR-FluorPen FP 100-MAX-LM."),
      steps: [
        t("빛을 측정할 위치와 방향에 광센서를 놓고 센서 위에 그림자가 생기지 않도록 합니다.", "Place the sensor at the sampling position and orientation, keeping it clear of your shadow."),
        t("Measure에서 PAR를 선택하고 SET을 누릅니다. 측정 위치와 시각을 함께 기록합니다.", "Select PAR under Measure and press SET. Record the sampling position and time."),
      ],
      outputs: [t("입사 PPFD (µmol photons m⁻² s⁻¹)", "Incident PPFD (µmol photons m⁻² s⁻¹)")],
      page: 11,
    },
    {
      id: "multi", title: t("Multi와 Repeat · 반복 측정", "Multi and Repeat · repeated measurements"),
      principle: t("시간 경과를 보려면 Multi로 각 회차를 저장합니다. 짧은 간격의 여러 판독을 하나의 평균으로 기록하려면 Repeat를 설정합니다.",
        "Use Multi to retain a sequence of results over time. Use Repeat to store the mean of a short set of readings."),
      steps: [
        t("짧은 반복은 Setting의 Repeat에서 1–10회를 정합니다. 2회 이상이면 R_Delay에서 1–10초 간격을 설정합니다.",
          "For short repeats, set Repeat to 1–10 in Setting. With two or more readings, set R_Delay to an interval of 1–10 s."),
        t("시계열은 Setting의 Multi에서 M_Type(Ft, QY, OJIP, NPQ, LC), R_Inter(분), R_Count(회)를 설정합니다.",
          "For a time series, open Multi under Setting. Choose M_Type (Ft, QY, OJIP, NPQ or LC), R_Inter in minutes and the number of acquisitions in R_Count."),
        t("각 Multi 회차 안에 Repeat와 R_Delay를 적용하려면 Use RS를 YES로 설정합니다. Measure에서 Multi를 선택하고 SET을 눌러 시작합니다.",
          "Set Use RS to YES to apply Repeat and R_Delay within each Multi acquisition. Start the schedule with Measure, Multi, then SET."),
      ],
      outputs: [t("Multi · 설정한 분 간격으로 저장한 회차별 결과", "Multi · a stored result for each scheduled acquisition"),
        t("Repeat · 선택한 횟수만큼 읽은 값의 평균", "Repeat · one stored average over the selected readings")],
      page: 14,
    },
  ];
}
