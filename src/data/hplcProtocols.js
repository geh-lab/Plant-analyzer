export const HPLC_PROTOCOLS = {
  phenol: {
    group: "general",
    ko: {
      title: "페놀 화합물",
      subtitle: "Phenolic compounds",
      badge: "DAD/UV",
      overview:
        "개별 페놀산·플라보노이드의 피크 면적을 물질별 표준곡선으로 환산합니다.",
      matrix: "건조 식물 분말. 문헌 검증은 체리 과실 추출물 기준입니다.",
      compounds: [
        "Arbutin",
        "Gallic acid",
        "Catechin hydrate",
        "4-Hydroxybenzoic acid",
        "Chlorogenic acid",
        "Caffeic acid",
        "(-)-Epicatechin",
        "p-Coumaric acid",
        "trans-Ferulic acid",
        "Benzoic acid",
        "Rutin",
        "trans-Cinnamic acid",
        "Quercetin",
        "Kaempferol",
      ],
      samplePrep: [
        "건조질량과 최종 추출액 부피를 기록하세요. 건조 분말로 옮겨 적용할 때는 용매 조성, 추출 회수율과 매트릭스 간섭을 확인해야 합니다.",
      ],
      chromatographic: [
        "체리 분석법의 C18-DAD 검출 파장은 gallic acid·epicatechin 280 nm, chlorogenic acid·p-coumaric acid 320 nm, rutin·quercetin 360 nm입니다.",
        "다른 표적은 자체 표준품의 흡수 스펙트럼과 분리도를 확인한 채널에서 분석하세요.",
      ],
      calculation: [
        "화합물마다 해당 인증 표준품의 검량선 Area = a × C + b를 사용합니다. C의 단위는 µg/mL입니다.",
        "측정 피크의 C = (Area − b)/a입니다. 원 추출액 부피 V(mL), 주입 용액까지의 총 희석 배수 DF, 건조질량 m(g)을 사용하면 함량(mg/g DW) = C × V × DF / (1000 × m)입니다.",
        "검량 범위와 정량한계는 표준품 및 매트릭스 검증값으로 확인하세요. 절편보다 작은 면적은 정량값을 표시하지 않습니다.",
      ],
      storage: [
        "표준품은 인증서의 온도·유효기간을 따르고, 분석용 추출액은 해당 매트릭스에서 확인한 안정 시간 안에 측정하세요.",
      ],
      notes: [
        "머무름 시간만으로 동정하기 어려운 피크는 개별 표준품의 스펙트럼 또는 첨가 시험을 확인하세요.",
      ],
      sources: [
        {
          name: "Gonçalves et al. (2019) · HPLC–DAD",
          url: "https://doi.org/10.1007/s42452-019-0680-4",
          scope:
            "체리에서 검증한 화합물별 검출 파장과 면적 검량선. 이 목록 전체를 검증한 문헌은 아닙니다.",
        },
      ],
      archiveNotes: [
        "기존 프로젝트는 건조 시료 0.1 g에 메탄올 수용액 10 mL를 사용하는 실험실 예시를 제시했습니다. 체리 문헌과 매트릭스·추출 조건이 다릅니다.",
      ],
    },
    en: {
      title: "Phenolic Compounds",
      subtitle: "Phenolic compounds",
      badge: "DAD/UV",
      overview:
        "Quantify individual phenolic acids and flavonoids against compound-specific calibration curves.",
      matrix:
        "Dry plant powder. The cited validation used sweet cherry extracts.",
      compounds: [
        "Arbutin",
        "Gallic acid",
        "Catechin hydrate",
        "4-Hydroxybenzoic acid",
        "Chlorogenic acid",
        "Caffeic acid",
        "(-)-Epicatechin",
        "p-Coumaric acid",
        "trans-Ferulic acid",
        "Benzoic acid",
        "Rutin",
        "trans-Cinnamic acid",
        "Quercetin",
        "Kaempferol",
      ],
      samplePrep: [
        "Record dry mass and final extract volume. Verify solvent composition, recovery and matrix interference when transferring the cherry method to dry powder.",
      ],
      chromatographic: [
        "In the cherry C18-DAD method, gallic acid and epicatechin used 280 nm, chlorogenic and p-coumaric acids 320 nm, and rutin and quercetin 360 nm.",
        "Choose the detector channel for each additional analyte from its own standard spectrum and verify separation.",
      ],
      calculation: [
        "Use a separate certified reference standard for each compound. Fit Area = a × C + b with C in µg/mL.",
        "C = (Area − b)/a. Using the original extract volume V (mL), cumulative dilution to the injected vial DF and dry mass m (g), content (mg/g DW) = C × V × DF / (1000 × m).",
        "Compare with the laboratory calibration range and LOQ. Areas below the intercept yield no reportable concentration.",
      ],
      storage: [
        "Follow certified standard storage conditions and expiry. Use the extract within its demonstrated stability period for the sample matrix.",
      ],
      notes: [
        "Confirm uncertain assignments with the individual standard spectrum or a spike experiment.",
      ],
      sources: [
        {
          name: "Gonçalves et al. (2019) · HPLC–DAD",
          url: "https://doi.org/10.1007/s42452-019-0680-4",
          scope:
            "Compound-specific detection wavelengths and area calibration in sweet cherries. Its validation covers a subset of this list.",
        },
      ],
      archiveNotes: [
        "The earlier lab worksheet used 10 mL of aqueous methanol per 0.1 g of dry sample. Its matrix and extraction differ from the published cherry method.",
      ],
    },
  },
  glucosinolate: {
    group: "general",
    ko: {
      title: "글루코시놀레이트",
      subtitle: "Glucosinolates",
      badge: "HPLC-UV",
      overview:
        "탈황 유도체의 UV 피크를 내부표준과 비교해 원래 글루코시놀레이트의 몰 함량을 계산합니다.",
      matrix: "건조질량을 확인한 십자화과 식물 시료",
      compounds: [
        "Progoitrin",
        "Sinigrin",
        "Glucoalyssin",
        "Gluconapoleiferin",
        "Gluconapin",
        "4-Hydroxyglucobrassicin",
        "Glucobrassicanapin",
        "Glucoerucin",
        "Glucobrassicin",
        "4-Methoxyglucobrassicin",
        "Gluconasturtiin",
        "Neoglucobrassicin",
      ],
      samplePrep: [
        "미로시나아제에 의한 분해를 억제하는 조건으로 시료를 추출합니다. 시료에 원래 없거나 공시험으로 보정한 내부표준을 정량 첨가하여 처음부터 시료와 함께 처리하세요.",
        "음이온 교환 컬럼에서 포집한 글루코시놀레이트에 설파타아제를 적용합니다. 이 계산에는 탈황된 분석물과 탈황된 내부표준의 피크를 사용합니다.",
      ],
      chromatographic: [
        "탈황 유도체를 역상 C18에서 분리하고 229 nm에서 검출합니다. 머무름 시간, UV 스펙트럼과 표준품으로 피크를 확인하고 혼재 피크는 제외하세요.",
      ],
      calculation: [
        "함량(µmol/g DW) = (분석물 면적 / 동일 크로마토그램의 내부표준 면적) × 첨가한 내부표준량(µmol) × (분석물 보정계수 / 내부표준 보정계수) / 추출한 건조질량(g).",
        "완전 탈황을 전제로 원물질 1 mol과 탈황 유도체 1 mol이 대응합니다. 원물질과 유도체는 분자량이 다르므로 피크 면적 또는 질량을 서로 직접 대입하지 않습니다.",
      ],
      storage: [
        "표준품은 인증서의 온도·유효기간을 따르고, 분석용 추출액은 해당 매트릭스에서 확인한 안정 시간 안에 측정하세요.",
      ],
      notes: [
        "ISO 계열 내부표준 면적비와 외부 sinigrin 검량선은 서로 다른 계산법입니다. 이 화면은 내부표준법을 사용합니다. 시료별 첨가량과 표준 피크 면적이 필요합니다.",
      ],
      sources: [
        {
          name: "ISO 9167:2019 · scope",
          url: "https://www.iso.org/standard/72207.html",
          scope:
            "공개 적용 범위. 유채·유채박 검증 및 다른 식물에서 기동정된 규격 수록 성분에 대한 제한.",
        },
        {
          name: "Commission Regulation (EEC) 1864/90 · Annex VIII §§4.5, 7",
          url: "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A31990R1864",
          scope: "유채 종자 내부표준법의 면적비, 첨가량, 건조질량 보정 원리.",
        },
        {
          name: "Grosser & van Dam (2017) · Table 3",
          url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5409297/",
          scope:
            "탈황 유도체의 229 nm 상대 보정계수. 이 논문의 정량 절차는 외부 sinigrin 표준곡선을 사용합니다.",
        },
      ],
      archiveNotes: [
        "기존 계산기의 고정값 0.5와 공통 분자량·피크 면적만으로는 시료별 첨가량과 각 물질의 보정계수를 확인할 수 없습니다. 기존 피크를 유지하고 새 계산 조건을 입력할 수 있습니다.",
      ],
    },
    en: {
      title: "Glucosinolates",
      subtitle: "Glucosinolates",
      badge: "HPLC-UV",
      overview:
        "Compare desulfated analyte peaks with an internal standard to report the molar content of parent glucosinolates.",
      matrix: "Brassicaceae sample of known dry mass",
      compounds: [
        "Progoitrin",
        "Sinigrin",
        "Glucoalyssin",
        "Gluconapoleiferin",
        "Gluconapin",
        "4-Hydroxyglucobrassicin",
        "Glucobrassicanapin",
        "Glucoerucin",
        "Glucobrassicin",
        "4-Methoxyglucobrassicin",
        "Gluconasturtiin",
        "Neoglucobrassicin",
      ],
      samplePrep: [
        "Use extraction conditions that suppress myrosinase. Add a known amount of an internal standard absent from the sample or corrected for its native contribution, and carry it through preparation.",
        "Capture glucosinolates by anion exchange and desulfate with sulfatase. This calculator uses the desulfated analyte and desulfated internal-standard peaks.",
      ],
      chromatographic: [
        "Separate desulfated analytes on reversed-phase C18 and measure at 229 nm. Confirm assignments against standards, retention times and UV spectra, excluding unresolved peaks.",
      ],
      calculation: [
        "Content (µmol/g DW) = (analyte area / IS area in the same chromatogram) × IS added (µmol) × (analyte correction factor / IS correction factor) / extracted dry mass (g).",
        "Complete desulfation yields one mole of derivative per mole of parent. Parent and derivative have different molecular masses. Use the amount of the actual standard added, including its certified salt or hydrate form.",
      ],
      storage: [
        "Follow certified standard storage conditions and expiry. Use the extract within its demonstrated stability period for the sample matrix.",
      ],
      notes: [
        "This worksheet uses the internal-standard ratio approach. An external sinigrin calibration is a separate procedure. Supply the spike amount and measured standard peak for each sample.",
      ],
      sources: [
        {
          name: "ISO 9167:2019 · scope",
          url: "https://www.iso.org/standard/72207.html",
          scope:
            "Public scope. Tested on rapeseed and rapeseed meals. Other matrices require previously identified glucosinolates covered by the standard.",
        },
        {
          name: "Commission Regulation (EEC) 1864/90 · Annex VIII §§4.5, 7",
          url: "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A31990R1864",
          scope:
            "Historical rapeseed internal-standard procedure, spike amount, peak-area ratio and dry-mass correction.",
        },
        {
          name: "Grosser & van Dam (2017) · Table 3",
          url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5409297/",
          scope:
            "229 nm correction factors of desulfo forms. The paper itself uses an external sinigrin calibration.",
        },
      ],
      archiveNotes: [
        "The old fixed 0.5 and shared molecular weight/area do not identify each sample’s added standard amount or each analyte’s factor. Saved peaks remain available for recalculation.",
      ],
    },
  },
  lamiaceae_markers: {
    group: "new",
    ko: {
      title: "배초향 로즈마린산·아카세틴·틸리아닌",
      subtitle: "Rosmarinic acid / Acacetin / Tilianin",
      badge: "HPLC · 330 nm",
      overview: "배초향의 뿌리·줄기·잎·꽃에서 로즈마린산, 아카세틴, 틸리아닌을 추출하고 성분별 외부 표준품으로 정량합니다.",
      matrix: "동결건조한 배초향 기관별 분말",
      compounds: ["Rosmarinic acid", "Acacetin", "Tilianin"],
      samplePrep: [
        "기관별로 동결한 시료를 −50 °C에서 4일간 동결건조한 뒤 분쇄해 체로 칩니다.",
        "분말 200 mg에 순수 메탄올 10 mL를 넣어 30분간 초음파 추출합니다. 1,358 × g에서 20분간 원심분리한 뒤 상층액을 0.45 µm 필터로 여과합니다.",
      ],
      chromatographic: [
        "이동상 A는 0.1% 포름산 수용액, B는 아세토니트릴입니다. 논문에 보고된 B 조성은 0–5분 20%, 5–20분 50%, 20–22분 100%입니다.",
        "유속 0.8 mL/min, 주입량 10 µL, 검출 파장 330 nm입니다. 논문의 머무름 시간은 로즈마린산 11.655분, 아카세틴 19.659분, 틸리아닌 12.542분입니다. 각 배치의 표준품과 대조해 피크를 배정하세요.",
      ],
      calculation: [
        "성분별 표준품의 농도 C(µg/mL)와 피크 면적으로 검량선 Area = a × C + b를 구합니다. 시료 농도는 (Area − b)/a입니다.",
        "기관별 함량(mg/g DW) = C × V × DF / (1000 × m). V는 실제 추출액 부피(mL), DF는 주입 전 희석 배수, m은 동결건조 분말 질량(g)입니다. 10 mL와 0.200 g을 썼다면 C × 0.05 × DF입니다.",
      ],
      storage: ["채취 시료는 액체질소로 동결해 −70 °C에 보관했습니다. 여과한 추출액의 보관기한은 원문에 제시되지 않았습니다."],
      notes: [
        "논문은 표준액 0.1–100 µg/mL를 사용했습니다. 결과를 보고할 때는 해당 배치와 성분의 검량 범위·정량한계를 확인하세요.",
        "기관 전체에 포함된 양(mg)은 기관별 함량(mg/g DW)에 해당 기관의 건물중(g)을 곱합니다. 식물 전체 농도는 기관별 농도를 건물중 비율로 가중한 평균입니다.",
      ],
      sources: [
        { name: "Lam 등 (2026) · Scientific Reports 16, 9632",
          url: "https://doi.org/10.1038/s41598-025-34712-x",
          scope: "첨부 논문 13쪽의 세 지표성분 추출·330 nm 검출법과 14쪽 식 (1)의 기관별 건물중 환산. 12쪽의 280 nm 분석은 별도의 페놀성분 다섯 종에 해당합니다." },
        { name: "Lam 등 (2020) · Agronomy 10, 76, §2.6",
          url: "https://doi.org/10.3390/agronomy10010076",
          scope: "과거 275 nm 분석 자료를 해석할 때 참조하는 별도 시험법입니다." },
      ],
      archiveNotes: [
        "2020년 시험법은 건조 분말 0.1 g을 80% 메탄올 1.5 mL로 추출해 275 nm로 측정했습니다. 기존 실험실 기록에는 0.1 g당 10 mL와 330 nm를 사용한 경우도 있습니다. 과거 자료에는 당시의 시료량·부피·검량선을 적용하세요.",
      ],
    },
    en: {
      title: "Korean mint · Rosmarinic acid, acacetin and tilianin",
      subtitle: "Rosmarinic acid / Acacetin / Tilianin",
      badge: "HPLC · 330 nm",
      overview: "Quantify rosmarinic acid, acacetin and tilianin in Korean mint (Agastache rugosa) roots, stems, leaves and flowers using separate external standards.",
      matrix: "Freeze-dried A. rugosa organ powder",
      compounds: ["Rosmarinic acid", "Acacetin", "Tilianin"],
      samplePrep: [
        "Freeze-dry each organ separately at −50 °C for four days, then grind and sieve the powder.",
        "Sonicate 200 mg powder in 10 mL neat methanol for 30 min. Centrifuge at 1,358 × g for 20 min and pass the supernatant through a 0.45 µm filter.",
      ],
      chromatographic: [
        "Use aqueous 0.1% formic acid as A and acetonitrile as B. The paper reports 20% B for 0–5 min, 50% B for 5–20 min and 100% B for 20–22 min.",
        "Inject 10 µL at 0.8 mL/min and monitor 330 nm. Reported retention times were 11.655 min for rosmarinic acid, 19.659 min for acacetin and 12.542 min for tilianin. Verify peak assignments against the standards for the run.",
      ],
      calculation: [
        "Fit Area = a × C + b for each analyte using its reference standard concentration C in µg/mL. Calculate C for the sample as (Area − b)/a.",
        "Organ concentration (mg/g DW) = C × V × DF / (1000 × m). Use actual extract volume V (mL), dilution before injection DF and dry powder mass m (g). For 10 mL and 0.200 g the result is C × 0.05 × DF.",
      ],
      storage: ["The authors froze harvested material in liquid nitrogen and stored it at −70 °C. They did not specify a holding time for the filtered extract."],
      notes: [
        "Published standards spanned 0.1–100 µg/mL. Check each batch’s calibration range and each analyte’s LOQ before reporting.",
        "Multiply the organ concentration (mg/g DW) by its dry mass (g) to obtain mg per organ. Whole-plant concentration is the dry-mass-weighted mean of the organ concentrations.",
      ],
      sources: [
        { name: "Lam et al. (2026) · Scientific Reports 16, 9632",
          url: "https://doi.org/10.1038/s41598-025-34712-x",
          scope: "Target-marker extraction and 330 nm detection on p. 13 of the supplied paper. Equation (1) on p. 14 weights organs by dry mass. The 280 nm method on p. 12 covers five other phenolics." },
        { name: "Lam et al. (2020) · Agronomy 10, 76, §2.6",
          url: "https://doi.org/10.3390/agronomy10010076",
          scope: "Separate method for interpreting archived 275 nm analyses." },
      ],
      archiveNotes: [
        "The 2020 method extracted 0.1 g powder in 1.5 mL of 80% methanol and measured at 275 nm. Older laboratory records also used 10 mL per 0.1 g at 330 nm. Use each run’s recorded mass, volume and calibration for reanalysis.",
      ],
    },
  },
  artemisinin: {
    group: "new",
    ko: {
      title: "개똥쑥 아르테미시닌",
      subtitle: "Artemisia annua · artemisinin pathway",
      badge: "RP-HPLC · 197 nm",
      overview: "개똥쑥 동결건조 조직에서 메탄올로 추출한 뒤, 역상 HPLC로 아르테미시닌과 관련 대사산물 세 종을 함께 정량합니다.",
      matrix: "개똥쑥 동결건조 분말 · 반복당 0.5 g",
      compounds: ["Artemisinin", "Arteannuin B", "Dihydroartemisinic acid", "Artemisinic acid"],
      samplePrep: [
        "동결건조한 조직을 균일하게 분쇄합니다. 분말 0.5 g에 HPLC급 메탄올 10 mL를 넣고 60 °C에서 1시간 초음파 추출합니다.",
        "842 × g에서 20분간 원심분리한 뒤 상층액을 0.45 µm 시린지 필터로 여과합니다.",
        "여과액을 농축한 뒤 메탄올에 재용해해 추출물 농도를 10,000 mg/L로 맞춥니다. 주입 전 1,000 mg/L로 10배 희석합니다.",
      ],
      chromatographic: [
        "Optimapak C18 컬럼(4.6 × 250 mm)을 30 °C로 유지합니다. 이동상은 아세토니트릴과 물 60:40(v/v), 유속은 1.0 mL/min, 검출 파장은 197 nm입니다.",
        "각 성분의 외부 표준액 10–100 mg/L로 피크 면적 검량선을 작성합니다. 같은 조건에서 측정한 표준품의 머무름 시간으로 피크를 확인합니다.",
      ],
      calculation: [
        "표준품별로 Area = a × C + b를 적용합니다. C = (Area − b)/a이며, 표준액의 1 mg/L는 1 µg/mL입니다.",
        "여과액 전량을 농축했다면 건물중당 함량(mg/g DW) = C(µg/mL) × 주입 전 희석배수 × 재용해 부피(mL) / [1,000 × 건조질량(g)]입니다. 일부만 농축했다면 분취 비율도 반영합니다.",
      ],
      storage: [
        "논문은 수확 조직을 액체질소로 급속 동결하고 드라이아이스로 운반한 뒤, 동결건조 전까지 −80 °C에 보관했습니다.",
      ],
      notes: [
        "10,000 및 1,000 mg/L는 전체 추출물의 농도입니다. 아르테미시닌 표준액 농도와 구분해 기록하세요. 농축·재용해한 시료의 정량에는 실제 재용해 부피가 필요합니다.",
      ],
      sources: [
        { name: "Kim et al. (2026) · §§2.5, 2.5.6", url: "https://doi.org/10.1016/j.indcrop.2026.124025", scope: "시료 보관, 추출·재용해, 197 nm 분리 조건과 네 성분의 외부 표준 검량 범위." },
        { name: "Qian et al. (2005) · Q260", url: "https://doi.org/10.1081/JLC-200048890", scope: "기존 260 nm 유도체화법으로 측정한 데이터의 참고 문헌." },
      ],
      archiveNotes: [
        "기존 Q260 방식은 NaOH와 아세트산으로 유도체화한 뒤 260 nm에서 검출합니다. 이 방식으로 측정한 데이터에는 당시의 표준품, 검량선과 희석배수를 사용하세요.",
      ],
    },
    en: {
      title: "Artemisinin in sweet wormwood",
      subtitle: "Artemisia annua · artemisinin pathway",
      badge: "RP-HPLC · 197 nm",
      overview: "Extract freeze-dried Artemisia annua tissue with methanol and quantify artemisinin and three related metabolites by reversed-phase HPLC.",
      matrix: "Freeze-dried A. annua powder · 0.5 g per replicate",
      compounds: ["Artemisinin", "Arteannuin B", "Dihydroartemisinic acid", "Artemisinic acid"],
      samplePrep: [
        "Grind the freeze-dried tissue to a uniform powder. Sonicate 0.5 g in 10 mL of HPLC-grade methanol at 60 °C for 1 hour.",
        "Centrifuge at 842 × g for 20 minutes and pass the supernatant through a 0.45 µm syringe filter.",
        "Concentrate the filtrate and reconstitute in methanol at 10,000 mg/L of extract. Dilute tenfold to 1,000 mg/L before injection.",
      ],
      chromatographic: [
        "Use an Optimapak C18 column (4.6 × 250 mm) at 30 °C. Run acetonitrile/water (60:40, v/v) at 1.0 mL/min and detect at 197 nm.",
        "Calibrate peak area with external standards of each compound at 10–100 mg/L. Identify peaks by matching retention times against standards run under the same conditions.",
      ],
      calculation: [
        "For each standard, fit Area = a × C + b and obtain C = (Area − b)/a. A standard at 1 mg/L is equivalent to 1 µg/mL.",
        "When the entire filtrate is concentrated, content (mg/g DW) = C (µg/mL) × pre-injection dilution factor × reconstitution volume (mL) / [1,000 × dry mass (g)]. Account for the aliquot fraction if only part of the filtrate was concentrated.",
      ],
      storage: [
        "The study flash-froze harvested tissue in liquid nitrogen, transported it on dry ice and stored it at −80 °C before freeze-drying.",
      ],
      notes: [
        "The 10,000 and 1,000 mg/L values describe the whole extract. Use separate analyte concentrations for calibration. Dry-weight calculations require the actual reconstitution volume.",
      ],
      sources: [
        { name: "Kim et al. (2026) · §§2.5, 2.5.6", url: "https://doi.org/10.1016/j.indcrop.2026.124025", scope: "Tissue storage, extraction and reconstitution, 197 nm separation and the external standard range for the four compounds." },
        { name: "Qian et al. (2005) · Q260", url: "https://doi.org/10.1081/JLC-200048890", scope: "Reference for historical measurements made using the 260 nm derivatization method." },
      ],
      archiveNotes: [
        "The earlier Q260 method uses NaOH and acetic acid for derivatization and detection at 260 nm. Process its runs using the corresponding standards, calibration and dilution.",
      ],
    },
  },
  cannabinoid: {
    group: "new",
    ko: {
      title: "대마 성분",
      subtitle: "Cannabinoid profiling",
      badge: "HPLC-DAD/LC-MS",
      overview:
        "건조 식물 시료의 산성형과 중성형 칸나비노이드를 개별 피크로 정량합니다.",
      matrix: "허가된 Cannabis/Hemp 건조 분말",
      compounds: ["CBDA", "CBD", "THCA", "Δ9-THC", "CBN", "CBG", "CBC"],
      samplePrep: [
        "분쇄한 대표 시료의 추출량과 희석 배수를 기록하고, 건조질량은 검증한 수분 측정 절차로 확인합니다. 산성형이 탈탄산되지 않도록 분석 시료와 건조질량 측정용 분취 시료를 구분하세요.",
      ],
      chromatographic: [
        "AOAC 2018.11 단일 실험실 검증은 건조 Cannabis 등에서 12종을 LC–DAD로 정량했으며, 질량분석 검출기를 동정 확인에 사용했습니다. 해당 장비·컬럼에 검증한 분리조건과 화합물별 검량 범위를 적용하세요.",
      ],
      calculation: [
        "화합물마다 해당 인증 표준품의 검량선 Area = a × C + b를 사용합니다. C의 단위는 µg/mL입니다.",
        "측정 피크의 C = (Area − b)/a입니다. 원 추출액 부피 V(mL), 주입 용액까지의 총 희석 배수 DF, 건조질량 m(g)을 사용하면 함량(mg/g DW) = C × V × DF / (1000 × m)입니다.",
        "검량 범위와 정량한계는 표준품 및 매트릭스 검증값으로 확인하세요. 절편보다 작은 면적은 정량값을 표시하지 않습니다.",
      ],
      storage: [
        "표준품은 인증서의 온도·유효기간을 따르고, 분석용 추출액은 해당 매트릭스에서 확인한 안정 시간 안에 측정하세요.",
      ],
      notes: [
        "현재 결과표는 각 성분의 mg/g DW를 별도로 표시합니다. THCA와 Δ9-THC, CBDA와 CBD의 피크를 각각 확인하세요.",
      ],
      sources: [
        {
          name: "Václavík et al. (2019) · AOAC 2018.11",
          url: "https://doi.org/10.1093/jaoac/102.6.1822",
          scope: "LC–DAD 정량법의 매트릭스·성분별 검증 범위.",
        },
        {
          name: "Václavík et al. (2020) · dry-weight modification",
          url: "https://cdnmedia.eurofins.com/eurofins-us/media/1713016/modification-of-aoac-official-methods-201811-for-quantification-of-cannabinoids-in-plant-materials-concentrates-and-oils.pdf",
          scope: "건조질량 환산에 사용한 별도 분취와 수분 측정.",
        },
      ],
      archiveNotes: [
        "기존 프로젝트의 C18·220 nm 설정은 장비별 실험실 예시입니다. 인용 논문이 이 프로젝트의 컬럼, 구배와 모든 보관 조건을 검증한 것은 아닙니다.",
      ],
    },
    en: {
      title: "Cannabinoid Profiling",
      subtitle: "Cannabinoid profiling",
      badge: "HPLC-DAD/LC-MS",
      overview:
        "Quantify acidic and neutral cannabinoids individually in dry plant material.",
      matrix: "Authorized dried Cannabis/Hemp powder",
      compounds: ["CBDA", "CBD", "THCA", "Δ9-THC", "CBN", "CBG", "CBC"],
      samplePrep: [
        "Record the representative ground sample, extract volume and dilution. Determine dry mass with a validated moisture procedure on a separate portion to preserve acidic analytes in the analytical aliquot.",
      ],
      chromatographic: [
        "The single-laboratory validation for AOAC 2018.11 quantified 12 cannabinoids by LC–DAD and used MS for additional identity confirmation. Use separation settings and calibration ranges verified on your own column and system.",
      ],
      calculation: [
        "Use a separate certified reference standard for each compound. Fit Area = a × C + b with C in µg/mL.",
        "C = (Area − b)/a. Using the original extract volume V (mL), cumulative dilution to the injected vial DF and dry mass m (g), content (mg/g DW) = C × V × DF / (1000 × m).",
        "Compare with the laboratory calibration range and LOQ. Areas below the intercept yield no reportable concentration.",
      ],
      storage: [
        "Follow certified standard storage conditions and expiry. Use the extract within its demonstrated stability period for the sample matrix.",
      ],
      notes: [
        "Results are reported separately as mg/g DW per analyte. Resolve THCA from Δ9-THC and CBDA from CBD and verify their identities.",
      ],
      sources: [
        {
          name: "Václavík et al. (2019) · AOAC 2018.11",
          url: "https://doi.org/10.1093/jaoac/102.6.1822",
          scope:
            "Single-laboratory LC–DAD validation and analyte/matrix scope.",
        },
        {
          name: "Václavík et al. (2020) · dry-weight modification",
          url: "https://cdnmedia.eurofins.com/eurofins-us/media/1713016/modification-of-aoac-official-methods-201811-for-quantification-of-cannabinoids-in-plant-materials-concentrates-and-oils.pdf",
          scope:
            "Modification for moisture determination and dry-weight reporting.",
        },
      ],
      archiveNotes: [
        "The archived C18, 220 nm setup was a lab example. The cited study has a defined scope and does not establish performance for the earlier instrument, gradient or storage conditions.",
      ],
    },
  },
};

const LEGACY_ALIASES = {
  rosmarinic_acid: "lamiaceae_markers",
  acacetin: "lamiaceae_markers",
  tilianin: "lamiaceae_markers",
  cannabis: "cannabinoid",
  cannabinoids: "cannabinoid",
};

export const resolveHplcType = (analysisType) =>
  LEGACY_ALIASES[analysisType] || analysisType;

export const getHplcProtocol = (analysisType, lang = "ko") => {
  const resolved = resolveHplcType(analysisType);
  const protocol = HPLC_PROTOCOLS[resolved];
  if (!protocol) return null;
  return protocol[lang] || protocol.ko;
};

export const getHplcCompounds = (analysisType, lang = "ko") => {
  const protocol = getHplcProtocol(analysisType, lang);
  return protocol?.compounds || [];
};

const mintCompoundNames = {
  "Rosmarinic acid": "로즈마린산",
  Acacetin: "아카세틴",
  Tilianin: "틸리아닌",
};
export const hplcCompoundLabel = (compound, lang) =>
  lang === "ko" && Object.hasOwn(mintCompoundNames, compound) ? mintCompoundNames[compound] : compound;

export const calibrationCurveHplcTypes = new Set([
  "phenol",
  "lamiaceae_markers",
  "artemisinin",
  "cannabinoid",
  "rosmarinic_acid",
  "acacetin",
  "tilianin",
  "cannabis",
  "cannabinoids",
]);

export const isCalibrationCurveHplcType = (analysisType) =>
  calibrationCurveHplcTypes.has(analysisType);

export const getHplcProtocolEntries = (lang = "ko") =>
  Object.entries(HPLC_PROTOCOLS).map(([key, value]) => ({
    key,
    ...(value[lang] || value.ko),
    group: value.group,
  }));
