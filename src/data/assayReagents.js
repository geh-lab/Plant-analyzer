// Quantities are for the final solution volume unless a cited paper specifies otherwise.
function buildGuides(lang) {
  const t = (ko, en) => lang === "en" ? en : ko;
  const row = (name, prep) => ({ name, prep });
  const source = (name, url) => ({ name, url });
  const phosphateGuide = source(t("Merck · 인산 완충액", "Merck · phosphate buffers"), "https://www.sigmaaldrich.com/deepweb/assets/sigmaaldrich/marketing/global/documents/312/212/p8584use.pdf");
  const peroxideGuide = source(t("Merck · H₂O₂ 원액", "Merck · H₂O₂ stock"), "https://www.sigmaaldrich.com/US/en/product/sigma/h1009");
  const solvent = row(t("90% 메탄올 (v/v)", "90% methanol (v/v)"),
    t("순수 메탄올 90.0 mL를 취해 증류수로 최종 100.0 mL를 맞춥니다.",
      "Measure 90.0 mL of pure methanol and bring to 100.0 mL with distilled water."));
  const dry = t("건조 시료 분말은 차광·방습 용기에 밀봉합니다. 실험실의 −20 °C 보관 시료는 밀봉한 상태로 실온에 두어 결로를 줄입니다.",
    "Seal dried powder in a light- and moisture-resistant container. When using the laboratory’s −20 °C storage condition, let the closed container warm before opening to limit condensation.");
  const extract = t("메탄올 추출액은 갈색 또는 호일로 감싼 용기에 밀봉하고 가급적 당일 측정합니다. 냉장할 때는 인화성 용매 보관용 냉장고를 사용합니다.",
    "Cap methanolic extracts in amber or foil-wrapped containers and aim to assay the same day. Refrigerate them only in a unit rated for flammable solvents.");
  const enzyme = t("차가운 시료에서 얻은 효소 추출액은 얼음 위에 두고 바로 분석합니다. 동결 보관이 필요하면 소분하고 해당 조직에서 해동 후 활성 회수율을 확인합니다.",
    "Keep cold-prepared enzyme extract on ice and assay promptly. For frozen storage, aliquot and verify post-thaw activity recovery in that tissue.");
  const bufferStorage = t("수용성 완충액은 깨끗한 밀폐 용기에 조제일을 표시해 냉장합니다. 사용 온도에서 pH를 확인하고 침전이나 오염이 보이면 새로 조제합니다.",
    "Date aqueous buffers, refrigerate in clean closed containers and recheck pH at assay temperature. Replace visibly contaminated or precipitated buffer.");
  const peroxideStorage = t("H₂O₂ 원액은 제품 표시 온도에서 전용 원래 용기에 보관합니다. 희석액은 사용 직전 조제하고 실제 농도를 확인합니다.",
    "Store concentrated H₂O₂ in its original container at its labelled temperature. Prepare working dilutions shortly before use and verify their concentration.");
  const namedStandard = (ko, en) => row(t(ko + " 표준원액 · 1 mg/mL", en + " standard · 1 mg/mL"),
    t("표준물질 10.0 mg 상당량을 90% 메탄올에 녹여 10.0 mL로 맞춥니다. 인증 함량을 반영하고 같은 용매로 검량용 농도 계열을 만듭니다.",
      "Dissolve the equivalent of 10.0 mg standard in 90% methanol and make up to 10.0 mL. Account for the certified assay and dilute in the same solvent for the calibration series."));
  const phosphate = (mm, acid, base) => row(t(mm + " mM 인산칼륨 · pH 7.0", mm + " mM potassium phosphate · pH 7.0"),
    t("KH₂PO₄ " + acid + " g과 무수 K₂HPO₄ " + base + " g을 각각 별도 용기에 물로 100 mL씩 정용합니다. 두 등농도 원액을 섞으며 사용 온도에서 pH 7.0에 맞춥니다.",
      "Make separate 100 mL aqueous stocks of " + acid + " g KH₂PO₄ and " + base + " g anhydrous K₂HPO₄. Mix these equimolar stocks to pH 7.0 at the working temperature."));
  const extractionBuffer = phosphate(50, "0.680", "0.871");
  const tca = row(t("추출액 · 0.1% TCA (w/v)", "Extraction · 0.1% TCA (w/v)"),
    t("트라이클로로아세트산(TCA) 0.100 g을 증류수에 녹여 100.0 mL로 맞춥니다. 또는 20% (w/v) 원액 0.50 mL를 물로 100.0 mL까지 희석합니다.",
      "Dissolve 0.100 g trichloroacetic acid (TCA) in distilled water to 100.0 mL, or dilute 0.50 mL of 20% (w/v) stock to 100.0 mL with water."));
  const peroxideStock = row(t("H₂O₂ 기질 원액", "H₂O₂ substrate stock"),
    t("농도를 확인한 원액을 C₁V₁ = C₂V₂로 희석합니다. 3.00% (w/v)는 30.0 g/L, 약 0.882 M입니다. 질량% (w/w) 제품은 성적서의 역가와 밀도로 몰농도를 먼저 구합니다. 예를 들어 확인된 9.80 M 원액 9.00 mL를 물로 100.0 mL까지 희석합니다.",
      "Dilute a standardized stock using C₁V₁ = C₂V₂. A 3.00% (w/v) solution contains 30.0 g/L, about 0.882 M. For a product labelled % (w/w), convert its assayed mass fraction and density to molarity first. For example, dilute 9.00 mL of a verified 9.80 M stock to 100.0 mL with water."));
  return {
    chlorophyll_a_b: {
      recipes: [solvent],
      handling: [dry, extract],
      sources: []
    },
    total_phenol: {
      recipes: [solvent,
        row(t("탄산나트륨 · 7.5% (w/v)", "Sodium carbonate · 7.5% (w/v)"),
          t("무수 Na₂CO₃ 7.50 g을 물에 녹여 100.0 mL로 맞춥니다.", "Dissolve 7.50 g anhydrous Na₂CO₃ in water and make up to 100.0 mL.")),
        row("Folin–Ciocalteu", t("상용 시약의 표시 농도와 희석 여부를 기록합니다.",
          "Record the commercial reagent strength and any dilution.")),
        namedStandard("갈산", "Gallic acid")],
      handling: [dry, extract, t("갈산 원액은 차광하고 작업용 표준액은 측정 배치마다 조제합니다. Folin 시약은 제품 라벨을 따릅니다. 예를 들어 Merck F9252 원액의 보관 조건은 실온입니다.",
        "Protect gallic acid stock from light and prepare working standards for each run. Follow the Folin product label. Merck F9252 concentrate, for example, specifies room-temperature storage.")],
      sources: [source("Merck · F9252", "https://www.sigmaaldrich.com/US/en/product/sial/f9252")]
    },
    total_flavonoid: {
      recipes: [solvent, row(t("에탄올 · 95% (v/v)", "Ethanol · 95% (v/v)"),
        t("무수 에탄올 95.0 mL를 물로 100.0 mL까지 정용하거나 농도가 표시된 95% 시약을 사용합니다.", "Bring 95.0 mL absolute ethanol to 100.0 mL with water, or use a labelled 95% solution.")),
        row(t("염화알루미늄 · 10% (w/v)", "Aluminium chloride · 10% (w/v)"),
          t("실험실에서 검증한 시약 형태 10.0 g을 최종 100.0 mL로 조제합니다. 원본은 수화 상태를 지정하지 않습니다. 수용액용 염화알루미늄의 제품·수화형을 확인해 기록하고 표준과 시료에 동일 배치를 적용합니다.",
            "Use 10.0 g of the validated reagent form per 100.0 mL final solution. The local source omits hydration state. Confirm the product and hydrate suited to aqueous preparation, record both and use the same batch for standards and samples.")),
        row(t("아세트산칼륨 · 1 M", "Potassium acetate · 1 M"), t("무수 CH₃COOK 9.81 g을 물에 녹여 100.0 mL로 맞춥니다.", "Dissolve 9.81 g anhydrous CH₃COOK in water and bring to 100.0 mL.")),
        namedStandard("퀘르세틴", "Quercetin")],
      handling: [dry, extract, t("퀘르세틴은 차광하고 검량용 희석액은 사용 시 조제합니다. 수용액은 밀봉·표지하고 AlCl₃ 시약에 침전이 생기면 블랭크를 확인한 새 배치를 사용합니다.",
        "Protect quercetin from light and prepare calibration dilutions at use. Label and close the aqueous reagents. Replace precipitated AlCl₃ reagent and check the new batch blank.")],
      sources: [source("Chang et al. (2002)", "https://doi.org/10.38212/2224-6614.2748")]
    },
    glucosinolate: {
      recipes: [solvent,
        row(t("팔라듐 발색액 · 2 mM", "Palladate colour reagent · 2 mM"),
          t("무수 Na₂PdCl₄ 58.8 mg(294.2 g/mol)을 물에 녹여 100.0 mL로 맞춥니다. 표준과 시료에 같은 배치를 씁니다.",
            "Dissolve 58.8 mg anhydrous Na₂PdCl₄ (294.2 g/mol) in water and bring to 100.0 mL. Use one batch for standards and samples.")),
        row(t("시니그린 표준액", "Sinigrin standard"),
          t("예를 들어 시니그린 표준물질 10.0 mg 상당량을 검증한 용매로 10.0 mL까지 녹이면 1.00 mg/mL입니다. 성적서의 염·수화물·함량 기준을 기록하고 희석 표준과 시료의 최종 용매 조성을 맞춥니다.",
            "For example, dissolve the equivalent of 10.0 mg certified standard to 10.0 mL in a validated solvent for 1.00 mg/mL. Record the salt, hydrate and assigned mass basis. Match final solvent composition in working standards and samples."))],
      handling: [dry, extract, t("분쇄 후 지체 없이 추출해 미로시나아제에 의한 분해를 줄입니다. 팔라듐 용액은 빛을 차단하고 침전이나 블랭크 이상이 있으면 교체합니다. 폐액은 팔라듐 함유 폐액으로 분리합니다.",
        "Extract promptly after grinding to limit myrosinase activity. Shield palladate solution from light and replace it if it precipitates or the blank shifts. Collect palladium-containing waste separately.")],
      sources: [source("Guarise et al. (2019)", "https://doi.org/10.3390/agronomy9070401"), source("Montaner et al. (2023)", "https://doi.org/10.3389/fnut.2022.1006012")]
    },
    dpph_scavenging: {
      recipes: [solvent, row(t("DPPH · 4 mg/mL", "DPPH · 4 mg/mL"),
        t("실험실 원액은 DPPH 200 mg을 90% 메탄올에 녹여 50.0 mL로 맞춥니다.",
          "For the local stock, dissolve 200 mg DPPH in 90% methanol and make up to 50.0 mL."))],
      handling: [extract, t("DPPH 용액은 조제 직후부터 차광하고 사용일마다 대조구를 다시 측정합니다. 분말은 제품 표시 온도를 따릅니다. 예를 들어 Merck D9132 분말은 2–8 °C입니다.",
        "Protect dissolved DPPH from light immediately and remeasure its control each assay day. Keep the powder at its labelled temperature. Merck D9132 powder specifies 2–8 °C.")],
      sources: [source("Merck · D9132", "https://www.sigmaaldrich.com/US/en/product/aldrich/d9132")]
    },
    anthocyanin: {
      recipes: [row(t("추출액 · 1% (v/v) 농염산–메탄올", "Extraction · 1% (v/v) concentrated HCl in methanol"),
        t("후드에서 농염산(약 37% w/w) 1.00 mL를 메탄올에 천천히 가하고 메탄올로 최종 100.0 mL를 맞춥니다. 여기서 1%는 넣은 농염산 원액의 부피비입니다.",
          "In a hood, slowly add 1.00 mL concentrated HCl (about 37% w/w) to methanol and make up to 100.0 mL with methanol. The 1% refers to the volume fraction of the concentrated acid stock.")),
        row(t("C3G 표준액", "C3G standard"),
          t("C3G 인증 함량 기준 1.00 mg 상당량을 같은 산성 메탄올로 10.0 mL까지 녹이면 100 µg/mL입니다. 성적서가 염화물 또는 C3G 자체 중 어느 기준인지 확인합니다.",
            "Dissolve the equivalent of 1.00 mg certified cyanidin-3-glucoside (C3G) in the same acidified methanol to 10.0 mL for 100 µg/mL. Check whether the certificate assigns mass as the chloride or as C3G."))],
      handling: [dry, t("산성 메탄올과 추출액은 내산·내용매성 밀폐 용기에서 차광합니다. 추출액은 가능한 당일 측정하고 냉장 시 인화성 용매 전용 냉장고를 사용합니다. C3G 표준품은 해당 성적서의 온도를 따릅니다.",
        "Protect acidified methanol and extracts from light in acid- and solvent-compatible closed containers. Aim to measure the extract the same day. Use a flammable-solvent refrigerator if cooling is needed. Store the C3G standard at its certified temperature.")],
      sources: [source(t("PhytoLab · C3G 표준물질", "PhytoLab · C3G reference standard"), "https://phyproof.phytolab.com/en/reference-substances/details/cyanidin-3-glucoside-chloride-89616")]
    },
    cat: {
      recipes: [extractionBuffer, peroxideStock,
        row(t("H₂O₂ 기질 반응액 · 197 µL", "H₂O₂ substrate mix · 197 µL"),
          t("1회분은 3.00% (w/v) H₂O₂ 3.4 µL와 50 mM 인산칼륨 완충액 193.6 µL를 혼합합니다.",
            "Mix 3.4 µL of 3.00% (w/v) H₂O₂ with 193.6 µL of 50 mM potassium phosphate per reaction."))],
      handling: [enzyme, bufferStorage, peroxideStorage],
      sources: [phosphateGuide, peroxideGuide]
    },
    pod: {
      recipes: [extractionBuffer,
        row(t("구아이아콜 · 20 mM", "Guaiacol · 20 mM"), t("구아이아콜 248.3 mg을 물에 녹여 100.0 mL로 맞춥니다.", "Dissolve 248.3 mg guaiacol in water and bring to 100.0 mL.")),
        row(t("H₂O₂ · 100 mM", "H₂O₂ · 100 mM"), t("농도를 확인한 1.00 M 원액 10.0 mL를 물로 최종 100.0 mL까지 희석합니다. 농도가 다른 원액은 C₁V₁ = C₂V₂로 환산합니다.",
          "Dilute 10.0 mL of a standardized 1.00 M stock to 100.0 mL with water. For other stock strengths, calculate the volume using C₁V₁ = C₂V₂.")),
        row(t("아세트산 완충액 · 100 mM", "Acetate buffer · 100 mM"), t("무수 아세트산나트륨 0.820 g을 물 약 80 mL에 녹이고 묽은 염산으로 pH 5.0에 맞춥니다. 물로 100.0 mL까지 정용하고 사용 온도에서 pH를 확인합니다.",
          "Dissolve 0.820 g anhydrous sodium acetate in about 80 mL water, adjust to pH 5.0 with dilute HCl and bring to 100.0 mL with water. Recheck pH at assay temperature.")),
        row(t("구아이아콜 기질 반응액 · 180 µL", "Guaiacol substrate mix · 180 µL"),
          t("20 mM 구아이아콜 82.6 µL, 100 mM H₂O₂ 17.6 µL, 100 mM 아세트산 완충액 50.0 µL와 물 29.8 µL를 혼합합니다.",
            "Mix 82.6 µL of 20 mM guaiacol, 17.6 µL of 100 mM H₂O₂, 50.0 µL of 100 mM acetate buffer and 29.8 µL water.")),
        row(t("기존 실험실 인산 완충액 · 40 mM", "Legacy laboratory phosphate buffer · 40 mM"),
          t("기존 인산염 변형에서만 사용합니다. KH₂PO₄ 0.544 g과 무수 K₂HPO₄ 0.697 g을 물로 각각 100 mL씩 정용한 뒤 등농도 원액을 혼합해 검증한 pH에 맞춥니다. 위 아세트산 조건과 구분해 기록합니다.",
            "For the legacy phosphate variant only, separately make up 0.544 g KH₂PO₄ and 0.697 g anhydrous K₂HPO₄ to 100 mL each with water. Mix to the validated pH. Record this separately from the acetate condition above."))],
      handling: [enzyme, peroxideStorage, t("구아이아콜은 제품 용기를 닫아 차광합니다. 작업액이 이미 갈변했거나 추출액 없는 블랭크에서 A470이 빠르게 증가하면 새 시약으로 확인합니다.",
        "Keep guaiacol closed and protected from light. Replace the working reagent if it browns or if the extract-free blank shows rapid A470 drift.")],
      sources: [source("Mika & Lüthje (2003)", "https://doi.org/10.1104/pp.103.020396"), phosphateGuide, peroxideGuide]
    },
    sod: {
      recipes: [extractionBuffer,
        row(t("반응용 인산나트륨 · 100 mM", "Assay sodium phosphate · 100 mM"),
          t("무수 NaH₂PO₄ 1.200 g과 무수 Na₂HPO₄ 1.420 g을 물로 각각 100.0 mL씩 정용하고 두 원액을 혼합해 pH 7.0에 맞춥니다. 추출 완충액은 인산칼륨입니다.",
            "Make separate 100.0 mL aqueous stocks of 1.200 g anhydrous NaH₂PO₄ and 1.420 g anhydrous Na₂HPO₄. Mix to pH 7.0. The extraction buffer uses potassium phosphate.")),
        row(t("메티오닌 · 100 mM", "Methionine · 100 mM"), t("L-메티오닌 1.492 g을 물에 녹여 100.0 mL로 맞춥니다.", "Dissolve 1.492 g L-methionine in water and bring to 100.0 mL.")),
        row("NBT · 2.5 mM", t("Nitro blue tetrazolium dichloride(817.64 g/mol) 204.4 mg을 물에 녹여 100.0 mL로 맞춥니다.", "Dissolve 204.4 mg nitro blue tetrazolium dichloride (817.64 g/mol) in water to 100.0 mL.")),
        row("EDTA · 10 mM", t("EDTA 이나트륨 이수화물(372.24 g/mol) 372.2 mg을 물에 녹여 100.0 mL로 맞춥니다.", "Dissolve 372.2 mg disodium EDTA dihydrate (372.24 g/mol) in water to 100.0 mL.")),
        row(t("리보플라빈 · 0.10 mM", "Riboflavin · 0.10 mM"),
          t("리보플라빈 3.76 mg을 물에 녹여 100.0 mL로 맞춘 뒤 차광합니다. 수용해도를 고려해 원본 0.50 mM보다 묽게 조제하고 아래 배합으로 최종 농도를 유지합니다.",
            "Dissolve 3.76 mg riboflavin in water and make up to 100.0 mL under light protection. This lower stock concentration addresses limited water solubility. The mix below preserves the local reaction concentration.")),
        row(t("NBT 광반응액 · 180 µL", "NBT photoreaction mix · 180 µL"),
          t("위 인산나트륨 46.75 µL, 메티오닌 52 µL, NBT 24.5 µL, EDTA 2 µL, 리보플라빈 40 µL와 물 14.75 µL를 혼합합니다.",
            "Mix 46.75 µL sodium phosphate, 52 µL methionine, 24.5 µL NBT, 2 µL EDTA, 40 µL riboflavin and 14.75 µL water."))],
      handling: [enzyme, t("NBT와 리보플라빈 원액은 차광합니다. 리보플라빈은 사용 직전에 넣고, 혼합액은 조사 전까지 어둡게 둡니다. 암 블랭크는 판독까지 차광합니다.",
        "Protect NBT and riboflavin solutions from light. Add riboflavin just before the run and keep the mix dark until illumination. Shield the dark blanks through to the readout."), bufferStorage],
      sources: [source(t("Merck · 리보플라빈 용해도", "Merck · riboflavin solubility"), "https://www.sigmaaldrich.com/deepweb/assets/sigmaaldrich/product/documents/191/415/r9504pis.pdf")]
    },
    h2o2: {
      recipes: [tca, phosphate(10, "0.1361", "0.1742"),
        row(t("요오드화칼륨 · 1 M", "Potassium iodide · 1 M"), t("KI 16.60 g을 증류수에 녹여 100.0 mL로 맞춥니다.", "Dissolve 16.60 g KI in distilled water and bring to 100.0 mL.")),
        row(t("검량 표준액 · 1 mM H₂O₂", "Calibration standard · 1 mM H₂O₂"),
          t("농도를 확인한 100.0 mM 중간액 0.500 mL를 0.1% TCA로 최종 50.0 mL까지 희석합니다. 같은 TCA로 검량 계열과 영점 표준을 만듭니다. 진한 과산화수소의 질량%를 부피%로 읽지 않습니다.",
            "Dilute 0.500 mL of standardized 100.0 mM intermediate to 50.0 mL with 0.1% TCA. Prepare the calibration series and zero standard in the same TCA. Convert concentrated peroxide from its assayed mass fraction before making volumetric dilutions."))],
      handling: [peroxideStorage, t("TCA 추출액은 차갑게 유지해 당일 반응시키고, KI 용액과 반응 플레이트는 차광합니다. 갈변한 KI 용액은 교체하고 영점 표준을 확인합니다.",
        "Keep TCA extracts cold and assay the same day. Shield KI solution and the reaction plate from light. Replace browned KI and check the zero standard.")],
      sources: [source("Velikova et al. (2000)", "https://doi.org/10.1016/S0168-9452(99)00197-1"), peroxideGuide]
    },
    mda: {
      recipes: [tca,
        row(t("반응용 TCA · 20% (w/v)", "Reaction TCA · 20% (w/v)"),
          t("TCA 20.0 g을 일부 증류수에 녹이고 식힌 뒤 100.0 mL로 맞춥니다. 추출용 0.1% TCA와 반응용 20% TCA를 구분해 표시합니다.",
            "Dissolve 20.0 g TCA in a portion of distilled water, allow to cool and make up to 100.0 mL. Label the 0.1% extraction and 20% reaction solutions separately.")),
        row(t("반응용 TBA · 0.5%", "Reaction TBA · 0.5%"),
          t("0.5% (w/v) 기준은 티오바르비투르산(TBA) 0.50 g/최종 100 mL입니다. 첨부 자료에는 TBA 원액의 용매가 명시되어 있지 않습니다. 검증된 실험실 조제기록에서 용매를 확인한 뒤 별도 원액을 준비합니다.",
            "At 0.5% (w/v), weigh 0.50 g thiobarbituric acid (TBA) per 100 mL final volume. The supplied sheet omits the stock solvent. Confirm it in the validated laboratory preparation record before making this separate stock."))],
      handling: [t("TCA 원액은 내산성 용기에 농도·조제일을 표시하여 보관합니다. 서로 다른 TBA 용매나 보관 조건을 검증 없이 섞어 적용하지 않습니다.",
        "Label TCA stocks with concentration and preparation date and store in acid-compatible containers. Use the validated TBA solvent and storage conditions for that formulation."),
        t("조직은 차갑게 취급하고 추출 후 곧바로 반응시킵니다. 첨부 자료는 시약이나 발색액의 보관기한을 제시하지 않습니다.",
          "Keep tissue cold and react extracts promptly. The sheet gives no validated shelf life for stocks or the developed colour.")],
      sources: [source(t("MDA.pdf · 실험실 원본", "MDA.pdf · laboratory protocol"), "/protocols/mda.pdf")]
    }
  };
}
const guides = { ko: buildGuides("ko"), en: buildGuides("en") };

export function getAssayReagents(id, lang = "ko") {
  const byMethod = lang === "en" ? guides.en : guides.ko;
  return Object.hasOwn(byMethod, id) ? byMethod[id] : undefined;
}
