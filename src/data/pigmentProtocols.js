const sources = {
  chlorophyll: ["Lichtenthaler HK, Buschmann C (2001). Chlorophylls and carotenoids: measurement and characterization by UV-VIS spectroscopy.", "10.1002/0471142913.faf0403s01"],
  phenols: ["Ainsworth EA, Gillespie KM (2007). Estimation of total phenolic content and other oxidation substrates in plant tissues using Folin–Ciocalteu reagent.", "10.1038/nprot.2007.102"],
  flavonoids: ["Chang CC et al. (2002). Estimation of total flavonoid content in propolis by two complementary colorimetric methods.", "10.38212/2224-6614.2748"],
  selectivity: ["Pękal A, Pyrzynska K (2014). Evaluation of aluminium complexation reaction for flavonoid content assay.", "10.1007/s12161-014-9814-x"],
  sinigrin: ["Montaner C et al. (2023). Bioactive compounds, antioxidant activity, and mineral content of bróquil.", "10.3389/fnut.2022.1006012"],
  leaves: ["Guarise M, Borgonovo G, Bassoli A, Ferrante A (2019). Effect of fertilization on yield and quality of Sisymbrium officinale (L.) Scop. grown as leafy vegetable crop.", "10.3390/agronomy9070401"],
  anthocyanins: ["Taghavi T, Patel H, Rafie R (2022). Comparing pH differential and methanol-based methods for anthocyanin assessments of strawberries.", "10.1002/fsn3.2065"],
  aoac: ["Lee J, Durst RW, Wrolstad RE (2005). Determination of total monomeric anthocyanin pigment content by the pH differential method.", "10.1093/jaoac/88.5.1269"],
  dpph: ["Blois MS (1958). Antioxidant determinations by the use of a stable free radical.", "10.1038/1811199a0"],
  dpphBlank: ["Tsai CE, Lin LH (2019). DPPH scavenging capacity of extracts from Camellia seed dregs using polyol compounds as solvents.", "10.1016/j.heliyon.2019.e02315"]
};

export function pigmentProtocols(lang) {
  const t = (ko, en) => lang === "en" ? en : ko;
  const ref = (id, ko, en) => ({ citation: sources[id][0], doi: sources[id][1], note: t(ko, en) });
  const methanol = t("90% (v/v) 메탄올", "90% (v/v) methanol");
  const water = t("증류수", "Distilled water");
  const extraction = [
    t("건조 시료 20 mg에 90% 메탄올 2 mL를 넣고 혼합합니다.", "Mix 20 mg dry tissue with 2 mL of 90% methanol."),
    t("20 °C에서 20분간 초음파 추출합니다. 4 °C, 15,000 rpm에서 10분간 원심분리한 뒤 상층액을 회수합니다.", "Sonicate at 20 °C for 20 min. Centrifuge at 15,000 rpm and 4 °C for 10 min and collect the supernatant.")
  ];
  const localCalibration = t("시료와 같은 방식으로 블랭크를 보정한 표준액 신호를 시약 혼합 전 표준액 농도(µg/mL)에 대해 직선 회귀합니다. a는 기울기, b는 절편입니다. 검증한 직선 범위에서 정량하고 추출액의 추가 희석은 DF에 반영합니다.",
    "Fit the standard signal against the pre-reaction standard concentration (µg/mL), using the same blank correction as for samples. Use slope a and intercept b within the verified linear range. DF is any additional dilution of the extract.");
  const calibrated = ["C (μg/mL) = (S − b) / a", "mg eq./g DW = C × V (mL) × DF / (1,000 × m (g))"];
  const planner = (concs) => ({ stock_name: "1 mg/mL stock", solvent_name: "90% MeOH", stock_conc: 1000, unit: "μg/mL", default_total_vol: 1, default_concs: concs });
  const plate = t("플레이트로 옮긴 200 μL는 측정용 분취량입니다. 건물중 환산에는 실제 총 추출 부피 V와 투입한 건조 질량 m을 사용합니다.", "The 200 μL plate aliquot is the read volume. For the dry-weight result, use the full extract volume V and the dry sample mass m.");
  return {
    chlorophyll_a_b: {
      title: t("엽록소 및 카로티노이드", "Chlorophyll & carotenoids"), subtitle: "Chlorophyll a, b & total carotenoids", wavelengths: ["665.2", "652.4", "470"], unit: "mg/g DW",
      reagents: [
        methanol
      ],
      protocol: [
        ...extraction,
        t("추출액을 밀봉·차광하고, 추출에 사용한 90% 메탄올로 장비의 블랭크를 맞춥니다. 추가 희석에는 같은 용매를 쓰고 희석배수를 기록합니다.", "Cap and shield the extract from light. Blank the instrument with the same 90% methanol used for extraction. Use this solvent for further dilution and record the dilution factor."),
        t("추출액을 200 µL씩 분주해 665.2, 652.4, 470 nm에서 측정합니다. 장비의 광경로 보정 여부를 기록합니다.", "Dispense 200 µL aliquots and measure at 665.2, 652.4 and 470 nm. Record whether the instrument applied path-length correction.")
      ],
      formulas: ["A′λ = Aλ / l (cm)", "Ca = 16.82 × A′665.2 − 9.28 × A′652.4", "Cb = 36.92 × A′652.4 − 16.54 × A′665.2", "Cx+c = (1,000 × A′470 − 1.91 × Ca − 95.15 × Cb) / 225", "mg/g DW = C (μg/mL) × V (mL) × DF / (1,000 × m (g))"],
      interpretation: t("Ca, Cb, Cx+c는 각각 측정액의 엽록소 a, 엽록소 b, 총 카로티노이드 농도입니다. 이 계수는 90% (v/v) 메탄올에 해당합니다. 장비에서 1 cm 기준으로 보정했다면 l = 1을, 보정 전 흡광도에는 실제 광경로(cm)를 사용합니다. 추출·플레이트 조건은 실험실 적용 조건입니다.", "Ca, Cb and Cx+c are chlorophyll a, chlorophyll b and total carotenoids in the measured solution. These coefficients apply to 90% (v/v) methanol. Use l = 1 for readings normalized to 1 cm, or the measured optical path (cm) for raw absorbance. Extraction and plate handling are local adaptations."),
      references: [ref("chlorophyll","90% 메탄올의 파장·계수와 추출액 농도 단위(μg/mL)의 근거입니다.","Provides wavelengths, coefficients and extract concentration units (μg/mL) for methanol containing 10% water.")]
    },
    total_phenol: {
      title: t("총 페놀 함량", "Total Phenolic Content"), subtitle: "Folin–Ciocalteu · Gallic acid equivalents", wavelengths: ["765"], unit: "mg GAE/g DW",
      reagents: [
        methanol,
        t("Folin–Ciocalteu 시약", "Folin–Ciocalteu reagent"),
        t("7.5% (w/v) 탄산나트륨", "7.5% (w/v) sodium carbonate"),
        t("갈산 표준액", "Gallic acid standards"),
        water
      ],
      protocol: [
        ...extraction,
        t("추출액 또는 갈산 표준액 100 µL, Folin–Ciocalteu 시약 100 µL와 물 1.5 mL를 혼합합니다. 시약 블랭크에는 추출액 대신 같은 용매를 넣습니다.", "Mix 100 µL extract or gallic acid standard with 100 µL Folin–Ciocalteu reagent and 1.5 mL water. Substitute the extraction solvent for the extract in the reagent blank."),
        t("5분 후 7.5% 탄산나트륨 300 µL를 넣고 상온에서 40분간 반응시킵니다. 블랭크·표준·시료를 각각 200 µL씩 분주해 765 nm에서 측정합니다.", "After 5 min, add 300 µL of 7.5% sodium carbonate and incubate for 40 min at room temperature. Transfer 200 µL of each blank, standard and sample to the plate and measure at 765 nm.")
      ],
      formulas: ["S = A765", ...calibrated], standard_curve_config: planner([0,20,40,60,80,100]),
      interpretation: t("갈산 당량으로 표시하는 환원성 지표이며 다른 환원성 물질도 신호에 기여합니다. 위 추출·반응 조건은 실험실 변형입니다.", "This reducing-capacity assay reports gallic acid equivalents. Other reducing compounds can contribute. The extraction and reaction conditions above are laboratory adaptations.")+" "+localCalibration+" "+plate,
      references: [ref("phenols","식물 시료의 Folin–Ciocalteu 반응, 갈산 검량선, 765 nm 판독 및 비특이적 환원 반응을 다룹니다.","Supports the Folin–Ciocalteu reaction, gallic acid calibration, 765 nm microplate reading and nonspecific reducing response in plants.")]
    },
    total_flavonoid: {
      title: t("총 플라보노이드", "Total flavonoids"), subtitle: "Aluminium chloride · Quercetin equivalents", wavelengths: ["415"], unit: "mg QE/g DW",
      reagents: [
        methanol,
        t("95% (v/v) 에탄올", "95% (v/v) ethanol"),
        "10% (w/v) AlCl₃",
        t("1 M 아세트산칼륨", "1 M potassium acetate"),
        t("퀘르세틴 표준액", "Quercetin standards"),
        water
      ],
      protocol: [
        ...extraction,
        t("추출액 또는 퀘르세틴 표준액 100 µL에 95% 에탄올 300 µL, 10% AlCl₃ 20 µL, 1 M 아세트산칼륨 20 µL, 물 600 µL를 넣고 혼합합니다.", "Combine 100 µL extract or quercetin standard with 300 µL of 95% ethanol, 20 µL of 10% AlCl₃, 20 µL of 1 M potassium acetate and 600 µL water."),
        t("시료별 색 블랭크에는 AlCl₃ 대신 증류수 20 µL를 넣습니다. 블랭크·표준·시료를 상온에서 40분 반응시킨 뒤 각각 200 µL씩 분주해 415 nm에서 측정합니다.", "For each colour blank, substitute 20 µL distilled water for AlCl₃. Incubate blanks, standards and samples at room temperature for 40 min. Dispense 200 µL each and measure at 415 nm.")
      ],
      formulas:["S = A415", ...calibrated], standard_curve_config: planner([0,10,20,40,60,80,100]),
      interpretation: t("AlCl₃에 반응하는 성분의 퀘르세틴 당량입니다. 플라보노이드 종류에 따라 발색 감도가 다릅니다.", "The result is the quercetin-equivalent response of AlCl₃-reactive compounds. Flavonoid classes differ in their colour response.")+" "+t("A415는 해당 색 블랭크를 뺀 값입니다.", "A415 is the reading after subtraction of its matched colour blank.")+" "+localCalibration,
      references:[ref("flavonoids","원문은 프로폴리스의 AlCl₃ 반응을 퀘르세틴 표준액으로 검량하고 상온 30분 후 415 nm에서 판독했습니다. 본 실험실의 메탄올 추출·40분 반응과 다릅니다.","The AlCl₃ arm used quercetin calibration and a 415 nm reading after 30 min at ambient temperature in propolis. The local methanol extraction and 40 min endpoint differ."),ref("selectivity","410–430 nm 발색의 구조 선택성과 정량 한계를 실험적으로 비교했습니다.","Experimental comparison of structural selectivity and limits of the 410–430 nm AlCl₃ response.")]
    },
    glucosinolate: {
      title: t("잎채소 글루코시놀레이트", "Glucosinolates in leafy greens"),
      subtitle: t("잎 추출액 · 시니그린 검량선", "Leaf extract · sinigrin calibration"),
      wavelengths: ["425"], unit: "mg SnE/g DW",
      reagents: [
        methanol,
        "2 mM Na₂PdCl₄",
        t("시니그린 표준액", "Sinigrin standards"),
        water
      ],
      protocol: [
        t("건조 잎 분말 20 mg에 90% 메탄올 2.00 mL를 넣고 20 °C에서 20분간 초음파 추출합니다. 4 °C, 15,000 rpm에서 10분간 원심분리한 뒤 상층액을 회수합니다.", "Sonicate 20 mg dry leaf powder in 2.00 mL of 90% methanol at 20 °C for 20 min. Centrifuge at 15,000 rpm and 4 °C for 10 min and collect the supernatant."),
        t("잎 추출액 또는 시니그린 표준액 50 µL에 증류수 150 µL와 2 mM Na₂PdCl₄ 1.50 mL를 넣습니다. 시약 블랭크에는 추출액 대신 추출 용매 50 µL를 넣습니다.", "Combine 50 µL leaf extract or sinigrin standard with 150 µL distilled water and 1.50 mL of 2 mM Na₂PdCl₄. Substitute 50 µL extraction solvent for the extract in the reagent blank."),
        t("상온에서 1시간 반응시킨 뒤 각각 200 µL씩 분주해 425 nm에서 측정합니다. 잎 색소 간섭을 확인할 때는 시료 색 블랭크와 시니그린 첨가 시료를 함께 측정합니다.", "After 1 h at room temperature, transfer 200 µL of each reaction to the plate and read at 425 nm. For a leaf pigment interference check, run a sample colour blank and a sinigrin-spiked extract alongside the samples.")
      ],
      formulas: ["A425 = a × C + b", "C (µg/mL) = (A425 − b) / a", "mg SnE/g DW = C × V (mL) × DF / (1,000 × m (g))"],
      interpretation: t("A425는 블랭크 보정 흡광도이고 C는 측정한 잎 추출액의 시니그린 환산 농도입니다. 실제 총 추출 부피 V, 추출한 잎의 건조 질량 m, 반응 전 추가 희석배수 DF로 건조 잎 1 g당 시니그린 당량을 계산합니다.",
        "A425 is blank-corrected absorbance and C is the sinigrin-equivalent concentration in the measured leaf extract. Use total extraction volume V, dry leaf mass m and pre-assay dilution factor DF to report mg sinigrin equivalents per gram of dry leaf.")+" "+localCalibration,
      references: [
        ref("leaves", "재배한 S. officinale의 생잎에서 산성 팔라듐 시약으로 1시간 발색하고 A425를 시니그린으로 검량했습니다. 원문은 생체중당 µmol을 보고합니다. 이 실험실의 수용성 시약과 건물중 환산은 별도 조건입니다.",
          "Demonstrates the 1 h palladate reaction and sinigrin calibration at 425 nm in fresh S. officinale leaves. The authors used an acidified reagent and reported µmol/g fresh material. This laboratory uses aqueous palladate and dry-mass normalization."),
        ref("sinigrin", "어린 잎과 미성숙 꽃차례를 포함한 브로킬 가식부에서 시니그린 검량 후 mg SnE/g DW로 보고했습니다. 추출 용매는 80% 메탄올이었고 반응액 배합도 이 실험실 조건과 다릅니다.",
          "Reports mg SnE/g DW from sinigrin calibration in edible bróquil tissue containing young leaves and immature inflorescences. The original extraction used 80% methanol and different reaction proportions.")
      ]
    },
    dpph_scavenging: {
      title:t("DPPH 라디칼 소거능", "DPPH radical scavenging"), subtitle:"DPPH · 517 nm",wavelengths:["517"],unit:"% inhibition",
      reagents: [
        methanol,
        t("DPPH 4 mg/mL 원액(반응 최종 0.200 mg/mL)", "DPPH, 4 mg/mL stock (0.200 mg/mL final)")
      ],
      protocol: [
        ...extraction,
        t("90% 메탄올 170 µL, DPPH 원액(4 mg/mL) 10 µL와 추출액 20 µL를 혼합합니다. DPPH 대조구에는 추출액 대신 같은 부피의 용매를 넣습니다.", "Mix 170 µL of 90% methanol, 10 µL of 4 mg/mL DPPH stock and 20 µL extract. For the DPPH control, replace the extract with the same volume of solvent."),
        t("착색 시료는 DPPH 원액 10 µL를 같은 부피의 용매로 바꾼 시료 블랭크를 함께 준비합니다. 용매 블랭크를 포함해 동일 조건에서 1시간 차광 반응시키고 517 nm에서 측정합니다.", "For coloured extracts, replace 10 µL DPPH stock with 10 µL solvent in the matched sample blank. Include a solvent blank. Keep the plate in the dark for 1 h and measure at 517 nm.")
      ],
      formulas:["S = A517,sample − A517,sample blank", "Inhibition (%) = 100 × (1 − S / A517,control)"],
      interpretation:t("시료 흡광도에서 해당 시료 블랭크를 뺍니다. 이미 보정한 값은 블랭크를 비워 두면 0이 적용됩니다. 대조구는 용매 블랭크를 뺀 값입니다. 같은 농도와 반응 시간에서 비교합니다. 대조구의 흡광도가 장비의 선형 범위에 드는지 확인하세요. 0–100%를 벗어나는 결과는 표시를 보류합니다.","Subtract the matched sample blank. For previously corrected readings, leave the blank empty to apply zero. Use a solvent-blank-corrected DPPH control. Compare samples at the same concentration and endpoint. Check that the control reading is in the instrument’s linear range. Results outside 0–100% are withheld for blank/control review."),
      references:[ref("dpph","안정 자유라디칼을 이용한 항산화 측정의 원리입니다. 200 μL·1시간 반응은 실험실 조건입니다.","Foundational stable-radical assay. The 200 μL, 1 h endpoint is a laboratory adaptation."),ref("dpphBlank","517 nm의 시료·시료 블랭크·DPPH 대조구 측정 설계를 뒷받침합니다.","Supports measuring sample, sample blank and DPPH control at 517 nm.")]
    },
    anthocyanin: {
      title:t("안토시아닌", "Anthocyanins"), subtitle:"Cyanidin-3-glucoside equivalents",wavelengths:["530","600"],unit:"mg C3G eq./g DW",
      reagents: [
        t("1% (v/v) 농염산–메탄올", "Methanol containing 1% (v/v) concentrated HCl"),
        t("시아니딘-3-글루코시드(C3G) 표준액", "Cyanidin-3-glucoside (C3G) standards")
      ],
      protocol: [
        t("건조 시료 20 mg에 1% (v/v) 농염산–메탄올 2 mL를 넣고 40 °C에서 1시간 초음파 추출합니다.", "Sonicate 20 mg dry tissue for 1 h at 40 °C in 2 mL methanol containing 1% (v/v) concentrated HCl."),
        t("4 °C, 15,000 rpm에서 10분간 원심분리한 뒤 상층액을 회수해 차광합니다.", "Centrifuge at 15,000 rpm and 4 °C for 10 min. Collect the supernatant and protect it from light."),
        t("같은 산성 용매로 준비한 용매 블랭크와 C3G 표준액, 시료를 200 µL씩 분주합니다. 같은 광경로에서 530 nm와 600 nm를 측정합니다.", "Dispense 200 µL each of the acidified solvent blank, C3G standards in the same solvent and sample extracts. Measure at 530 and 600 nm with the same optical path.")
      ],
      formulas:["S = A530 − A600", ...calibrated],
      interpretation:t("두 파장 모두 용매 블랭크를 뺀 뒤 A530 − A600을 검량 신호 S로 사용합니다. 시료 매질의 간섭과 회수율을 확인한 검량선으로 C3G 당량을 구합니다. pH 차등법의 몰 흡광계수 26,900은 이 단일 추출액에 적용하지 않습니다.","After solvent blank subtraction at each wavelength, use A530 − A600 as the calibration signal S. Report C3G equivalents only with a calibration checked for matrix interference and recovery. The pH-differential coefficient of 26,900 does not apply to a single acidified extract.")+" "+localCalibration,
      references:[ref("anthocyanins","딸기 추출액의 방법 의존성과 C3G의 530 nm 흡수 극대를 확인했습니다. 논문의 메탄올법 보조 파장은 657 nm로, 이 화면의 600 nm 보정과 다릅니다.","Confirms method dependence and a C3G maximum at 530 nm in strawberry work. Its methanol method used 657 nm, distinct from the laboratory’s 600 nm correction."),ref("aoac","비교용 pH 차등법은 pH 1.0 및 4.5에서 520·700 nm의 네 측정값을 요구합니다. 이 화면은 해당 방법의 결과를 산출하지 않습니다.","Comparison method only. The collaborative pH-differential procedure requires four readings at 520 and 700 nm across pH 1.0 and 4.5.")]
    }
  };
}
