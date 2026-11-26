import { Beaker, Calculator, FlaskConical, Microscope } from 'lucide-react';

export function oxidativeProtocols(lang) {
  const t = (ko, en) => lang === 'en' ? en : ko;
  const extractionBuffer = t('추출용 50 mM 인산칼륨 완충액(pH 7.0)', 'Extraction buffer, 50 mM potassium phosphate (pH 7.0)');
  const extract = [
    t('차가운 조직(실험실 기준 건물중 상당량 20 mg)을 차가운 50 mM 인산칼륨 완충액(pH 7.0) 2 mL에서 균질화합니다. 추출에 사용한 조직량과 부피를 기록합니다.',
      'Homogenize cold tissue in 2 mL cold 50 mM potassium phosphate (pH 7.0). The laboratory portion corresponds to 20 mg dry tissue. Record tissue mass and extraction volume.'),
    t('저온에서 원심분리한 뒤 침전물이 섞이지 않게 상층액을 옮겨 얼음 위에 둡니다.', 'Centrifuge cold, transfer the supernatant without disturbing the pellet and keep it on ice.'),
    t('맑은 상층액은 바로 사용합니다. 입자가 남아 탁할 때만 수용액용 저단백질결합 0.45 µm 주사기 필터(예: 친수성 PES)로 여과할 수 있습니다. 처음 적용할 때는 같은 추출액을 나누어 여과한 분획과 여과 없이 다시 원심분리한 분획의 효소 활성을 비교합니다.',
      'Use clear supernatant directly. If residual particles make it cloudy, an aqueous-compatible, low-protein-binding 0.45 µm syringe filter (e.g. hydrophilic PES) is an option. Before adopting it, compare enzyme activity in paired aliquots of the same extract, one filtered and the other clarified by a second centrifugation.')
  ];
  const enzymeFilter = {
    citation: 'Merck. Millex-GP/HP filter unit user guide.',
    href: 'https://www.merckmillipore.com/deepweb/assets/sigmaaldrich/product/documents/421/015/pr06217-0325-mk.pdf',
    note: t('0.45 µm 친수성 PES 필터의 수용액 적용 및 저단백질결합 특성에 관한 제품 자료입니다. 식물 추출액의 활성 회수율은 효소별로 확인합니다.',
      'Manufacturer specifications for a hydrophilic, low-protein-binding 0.45 µm PES filter for aqueous samples. Activity recovery is specific to each enzyme and extract.')
  };
  const avocadoFilter = {
    citation: 'Chung SW et al. (2022). Photosynthetic response and antioxidative activity of ‘Hass’ avocado cultivar treated with short-term low temperature. Scientific Reports 12, 11593.',
    doi: '10.1038/s41598-022-15821-3',
    note: t('아보카도 잎의 CAT·POD 추출액을 0.45 µm PES로 여과한 뒤 원심분리했습니다. 이 페이지의 원심분리 후 선택 여과는 실험실 변형입니다.',
      'Avocado leaf extracts for CAT and POD were filtered through 0.45 µm PES before centrifugation. Optional filtration after centrifugation is a laboratory adaptation.')
  };
  const storage = t('효소 추출액은 얼음 위에서 유지하고 같은 날 분석합니다. 보관한 시료는 사용한 온도·기간과 활성 회수율을 기록합니다.', 'Keep extracts on ice and assay the same day. For stored extracts, record storage conditions and assess activity recovery.');
  const path = t('l은 실제 광경로(cm)이며 1 cm로 보정한 판독값은 l = 1입니다. DF는 분주 전 추출액의 추가 희석배수입니다. V반응과 V분주는 같은 단위, V추출은 mL, m은 추출한 조직의 건물중 상당량(mg)입니다. 생시료도 같은 조직량의 건물중을 기준으로 환산합니다.',
    'Use the measured path length l (cm), or l = 1 for readings normalized to 1 cm. DF is the additional extract dilution before dispensing. Use matching units for reaction and aliquot volumes, mL for total extract and mg for the dry-mass equivalent of the extracted tissue, including fresh-tissue assays.');
  const kinetic = 'v = (ΔA/min) × (Vreaction / Valiquot) × Vextract × DF / (ε × l × m)';
  return {
    cat: {
      title: t('카탈라아제 활성', 'Catalase activity'), subtitle: t('Catalase · H₂O₂ 분해', 'H₂O₂ decomposition rate'),
      wavelengths: ['240'], unit: 'μmol/min/mg DW', icon: <FlaskConical/>,
      formulas: ['ΔA/min = slope(control) − slope(sample)', 'ε₂₄₀(H₂O₂) = 0.0436 mM⁻¹ cm⁻¹ = 43.6 M⁻¹ cm⁻¹', kinetic],
      interpretation: t("시료와 대조구의 같은 초기 선형 구간에서 부호 있는 A240 기울기(분당)를 구합니다. 보정 속도는 대조구 기울기에서 시료 기울기를 뺀 값입니다. 결과는 조직 건물중 1 mg당 분당 분해한 H₂O₂의 µmol입니다.", "Fit signed A240 slopes per minute over the same initial linear interval for sample and control. Subtract the sample slope from the control slope. Activity is µmol H₂O₂ decomposed per minute per mg tissue DW.") + ' ' + path,
      reagents: [
        extractionBuffer,
        t("H₂O₂ 기질액(실험실 반응 최종 약 15 mM)", "H₂O₂ substrate (about 15 mM final in the laboratory reaction)")
      ],
      protocol: [
        ...extract,
        t("UV 투과 플레이트에서 H₂O₂ 반응 혼합액 197 µL에 추출액 3 µL를 넣어 반응을 시작합니다. 대조구에는 추출액 대신 같은 부피의 인산 완충액을 넣습니다.", "In a UV-compatible plate, add 3 µL extract to 197 µL H₂O₂ reaction mix to start the reaction. Substitute an equal volume of phosphate buffer for the extract in the control."),
        t("반응 직후 240 nm에서 시료와 대조구의 흡광도 감소를 연속 측정합니다. 실제 시간 간격, 온도, 최종 H₂O₂ 농도와 광경로를 기록합니다. 큐벳 측정에는 석영 큐벳을 사용합니다.", "Record A240 continuously for sample and control immediately after mixing. Record the actual time intervals, temperature, final H₂O₂ concentration and path length. For cuvette measurements, use quartz.")
      ],
      storage_conditions: [storage],
      references:[
        {citation:'Aebi H. (1984). Catalase in vitro. Methods in Enzymology 105, 121–126.',doi:'10.1016/S0076-6879(84)05016-3',note:t('H₂O₂ 분해를 이용한 CAT 분석의 근거입니다. 플레이트 부피와 건물중 환산은 이 앱의 실험실 조건입니다.', 'Basis for the catalase assay. Plate volumes and dry-mass normalization are laboratory adaptations.')},
        {citation:'Hadwan MH & Abed HN (2016). Data supporting the spectrophotometric method for the estimation of catalase activity. Data in Brief 6, 194–199.',doi:'10.1016/j.dib.2015.12.012',note:t('H₂O₂ 표준화에 사용한 240 nm 흡광계수 43.6 M⁻¹ cm⁻¹의 근거입니다. 논문의 별도 374 nm 종말점 분석은 적용하지 않습니다.', 'Source for ε₂₄₀ = 43.6 M⁻¹ cm⁻¹ in H₂O₂ standardization. The paper also describes a separate 374 nm endpoint assay.')},
        avocadoFilter, enzymeFilter
      ]
    },
    pod:{
      title:t('구아이아콜 퍼옥시다아제 활성', 'Guaiacol peroxidase activity'),subtitle:t('Peroxidase · 테트라구아이아콜 생성', 'Tetraguaiacol formation rate'),
      wavelengths:['470'],unit:'μmol/min/mg DW',icon:<Beaker/>,
      formulas:['ΔA/min = slope(sample) − slope(blank)', 'ε₄₇₀(tetraguaiacol) = 26.6 mM⁻¹ cm⁻¹', kinetic],
      interpretation: t("동일한 초기 선형 구간의 A470 분당 증가 기울기에서 화학 블랭크 기울기를 뺍니다. 결과는 조직 건물중 1 mg당 분당 생성된 테트라구아이아콜의 µmol입니다.", "Fit the increase in A470 per minute over the same initial linear interval and subtract the chemical blank slope. Activity is µmol tetraguaiacol formed per minute per mg tissue DW.") + ' ' + path,
      reagents: [
        extractionBuffer,
        t("구아이아콜(반응 최종 8.26 mM)", "Guaiacol (8.26 mM final)"),
        t("H₂O₂(반응 최종 8.8 mM)", "H₂O₂ (8.8 mM final)"),
        t("반응용 아세트산 완충액(최종 25 mM, pH 5.0)", "Acetate assay buffer (25 mM final, pH 5.0)")
      ],
      protocol: [
        ...extract,
        t("플레이트에서 구아이아콜·H₂O₂ 반응액 180 µL에 추출액 20 µL를 넣습니다. 화학 블랭크에는 추출액 대신 같은 부피의 추출 완충액을 넣습니다.", "Combine 180 µL guaiacol/H₂O₂ reaction mixture with 20 µL extract in the plate. Prepare a chemical blank with extraction buffer in place of the extract."),
        t("아세트산 조건의 플레이트 예시는 최종 구아이아콜 8.26 mM, H₂O₂ 8.8 mM, 아세트산 완충액 25 mM(pH 5.0)입니다. 사용한 기질 농도, pH, 온도와 광경로를 기록합니다.", "For the acetate plate adaptation, use final concentrations of 8.26 mM guaiacol, 8.8 mM H₂O₂ and 25 mM acetate (pH 5.0). Record substrate concentrations, pH, temperature and path length."),
        t("반응 직후 시료와 블랭크의 470 nm 흡광도를 연속 측정합니다. 시간에 따른 초기 증가가 선형인지 확인합니다.", "Record sample and blank A470 continuously from the start of the reaction. Check that the initial increase is linear with time.")
      ],
      storage_conditions: [storage],
      references:[
        {citation:'Mika A & Lüthje S (2003). Properties of guaiacol peroxidase activities isolated from corn root plasma membranes. Plant Physiology 132, 1489–1498.',doi:'10.1104/pp.103.020396',note:t('1 mL 반응에서 A470 증가와 화학 블랭크, 기질 농도 및 ε = 26.6 mM⁻¹ cm⁻¹의 직접적인 근거입니다. 앱은 조직 추출액·플레이트 부피로 환산합니다.', 'Supports A470 kinetics, chemical controls, substrate levels and ε = 26.6 mM⁻¹ cm⁻¹ in a 1 mL reaction. The app scales the rate for the laboratory tissue extract and plate geometry.')},
        {citation:'Rao MV, Paliyath G & Ormrod DP (1996). Ultraviolet-B- and ozone-induced biochemical changes in antioxidant enzymes of Arabidopsis thaliana. Plant Physiology 110, 125–136.',doi:'10.1104/pp.110.1.125',note:t('구아이아콜을 이용한 식물 퍼옥시다아제 연구의 예입니다.', 'Example of a plant study of guaiacol peroxidases.')},
        avocadoFilter, enzymeFilter
      ]
    },
    sod:{
      title:t('SOD · NBT 광환원 억제', 'SOD · NBT photoreduction inhibition'),subtitle:'Superoxide dismutase',wavelengths:['560'],unit:'% inhibition',icon:<Microscope/>,
      formulas:['C = A(light control) − A(dark blank)', 'S = A(sample) − A(sample dark blank)', 'Inhibition (%) = 100 × (C − S) / C', 'U/mg DW = 1000 × Vextract (mL) / [V₅₀ (µL) × mDW (mg)]'],
      interpretation: t("단일 희석 시료의 NBT 억제율(%)은 해당 희석 상태의 값입니다. 보정 광 대조구 C는 양수여야 하며, 0–100% 밖의 억제율은 블랭크와 희석을 다시 확인합니다. U/mg DW에는 50% 억제점에서 분주한 희석 추출액의 부피를 희석배수로 나눈 V₅₀(원추출액 상당 µL)를 사용합니다. SOD로 억제되지 않는 배경이 있으면 억제 가능한 신호를 기준으로 종말점을 구합니다.", "A single dilution gives inhibition (%) at the measured extract concentration. The corrected light control C must be positive. Check blanks and dilutions for values outside 0–100%. For U/mg DW, divide the dispensed extract volume at 50% inhibition by its dilution factor to obtain V₅₀ in µL undiluted extract. Where a non-inhibitable background is present, use the SOD-inhibitable signal for the endpoint."),
      reagents: [
        extractionBuffer,
        t("반응용 인산나트륨 완충액(100 mM 원액, pH 7.0)", "Sodium phosphate assay buffer (100 mM stock, pH 7.0)"),
        t("L-메티오닌 100 mM 원액", "L-methionine, 100 mM stock"),
        t("NBT 2.5 mM 원액", "NBT, 2.5 mM stock"),
        t("EDTA 이나트륨 이수화물 10 mM 원액", "Disodium EDTA dihydrate, 10 mM stock"),
        t("리보플라빈 0.10 mM 원액", "Riboflavin, 0.10 mM stock")
      ],
      protocol: [
        ...extract,
        t("추출액 20 µL와 메티오닌·NBT·EDTA·리보플라빈 반응액 180 µL를 혼합합니다. 같은 배치에 추출액을 완충액으로 바꾼 광 대조구와 암 블랭크를 준비합니다. 착색 시료는 각 추출액의 암 블랭크도 준비합니다.", "Mix 20 µL extract with 180 µL methionine/NBT/EDTA/riboflavin reaction mixture. Prepare an illuminated control and a dark blank with buffer in place of extract. Include a separate extract-containing dark blank for coloured samples."),
        t("시료와 광 대조구에 같은 온도에서 50 µmol m⁻² s⁻¹의 빛을 15분간 조사합니다. 암 블랭크는 차광합니다. 조사 직후 빛을 차단하고 모두 560 nm에서 측정합니다.", "Illuminate samples and light controls for 15 min at 50 µmol m⁻² s⁻¹ and the same temperature. Protect dark blanks from light. Stop illumination and measure all wells at 560 nm."),
        t("활성 단위가 필요하면 50% 억제점을 포함하도록 추출액 희석계열을 준비해 동일 조건에서 측정합니다.", "For activity units, measure an extract dilution series under the same conditions, with doses spanning the 50% inhibition endpoint.")
      ],
      storage_conditions: [storage],
      references:[
        {citation:'Giannopolitis CN & Ries SK (1977). Superoxide dismutases. I. Occurrence in higher plants. Plant Physiology 59, 309–314.',doi:'10.1104/pp.59.2.309',note:t('식물 추출물의 리보플라빈·메티오닌·NBT 광화학 분석 근거입니다. LED와 플레이트 설정은 실험실 변형입니다.', 'Basis for the plant methionine/riboflavin/NBT photochemical assay. The LED and plate setup are laboratory adaptations.')},
        {citation:'Fryer MJ et al. (1998). Relationship between CO₂ assimilation, photosynthetic electron transport, and active O₂ metabolism in leaves of maize in the field during periods of low temperature. Plant Physiology 116, 571–580.',doi:'10.1104/pp.116.2.571',note:t('추출액 부피에 따른 억제 곡선에서 50% 억제에 필요한 추출액량을 1 U로 정의합니다.', 'Defines one unit from the extract volume producing 50% inhibition of the SOD-inhibitable fraction on an inhibition curve.')},
        {citation:'Gupta AS et al. (1993). Overexpression of superoxide dismutase protects plants from oxidative stress. Plant Physiology 103, 1067–1073.',doi:'10.1104/pp.103.4.1067',note:t('식물 산화 스트레스 연구의 적용 사례입니다.', 'Plant oxidative-stress application.')},
        enzymeFilter
      ]
    },
    h2o2:{
      title:t('과산화수소 함량', 'Hydrogen peroxide content'), subtitle:'KI · A390', wavelengths:['390'],unit:'μmol/g DW',icon:<Calculator/>,
      formulas:['Cextract (mM) = (A₃₉₀ − b) × DF / a', 'H₂O₂ (µmol/g) = Cextract (mM) × Vextract (mL) / m (g)'],
      interpretation: t("A390은 표준과 같은 방식으로 블랭크 보정한 값입니다. 시약 혼합 전 표준액 농도(mM)에 대해 회귀한 기울기 a와 절편 b를 사용합니다. 표준과 시료의 반응 희석은 검량선에 반영됩니다. DF는 추출액의 추가 희석배수입니다. 생체중당 함량에는 추출한 조직 자체의 생체중을 사용합니다.", "A390 is corrected for the blank in the same way as the standards. Use slope a and intercept b from the fit to pre-reaction standard concentrations (mM). The calibration incorporates the common reaction dilution. DF is the additional extract dilution. A fresh-weight result requires the fresh mass of the extracted tissue."),
      reagents: [
        "0.1% (w/v) TCA",
        t("10 mM 인산칼륨 완충액(pH 7.0)", "10 mM potassium phosphate (pH 7.0)"),
        "1 M KI",
        t("H₂O₂ 표준액(1 mM 원액)", "H₂O₂ standards (1 mM stock)")
      ],
      protocol: [
        t("차가운 0.1% TCA 2 mL에서 조직(실험실 기준 건물중 상당량 20 mg)을 균질화합니다. 원심분리해 상층액을 회수하고 실제 조직량과 추출액 부피를 기록합니다.", "Homogenize tissue in 2 mL cold 0.1% TCA. The laboratory portion corresponds to 20 mg dry tissue. Centrifuge, collect the supernatant and record the actual tissue mass and extraction volume."),
        t("맑은 상층액은 바로 사용합니다. 입자가 남아 탁할 때만 KI를 넣기 전에 0.45 µm 주사기 필터로 여과할 수 있습니다. 필터막과 하우징이 0.1% TCA와 호환되는지 확인합니다. 처음 적용할 때는 같은 추출액에 H₂O₂ 표준을 첨가한 시료와 무첨가 시료를 각각 나누어, 여과 여부에 따른 첨가 회수율을 같은 시간 조건에서 비교합니다.",
          "Use clear supernatant directly. If residual particles make it cloudy, optional filtration with a 0.45 µm syringe filter precedes KI addition. Check that the membrane and housing are compatible with 0.1% TCA. On first use, split both H₂O₂-spiked and unspiked extract into filtered and unfiltered aliquots and compare spike recovery with matched timing."),
        t("상층액 또는 H₂O₂ 표준액 50 µL, 10 mM 인산칼륨 완충액(pH 7.0) 50 µL, 1 M KI 100 µL를 플레이트에 혼합합니다. 영점 표준에는 상층액 대신 0.1% TCA 50 µL를 넣습니다.", "Combine 50 µL extract or H₂O₂ standard, 50 µL of 10 mM potassium phosphate (pH 7.0) and 100 µL of 1 M KI in the plate. For the zero standard, substitute 50 µL of 0.1% TCA for the extract."),
        t("시료·표준·블랭크를 차광하여 1시간 반응시킨 뒤 390 nm에서 측정합니다. 검량 범위를 넘은 시료는 희석해 다시 측정합니다. 착색 시료의 매트릭스 블랭크와 첨가 회수율을 확인합니다.", "Incubate samples, standards and blanks in the dark for 1 h and measure at 390 nm. Dilute and remeasure samples beyond the calibration range. For coloured extracts, include a matrix blank and a spike-recovery check.")
      ],
      standard_curve_config:{title:t('H₂O₂ 표준액 희석', 'H₂O₂ standard dilutions'),stock_name:'1 mM H₂O₂',solvent_name:'0.1% TCA',stock_conc:1,unit:'mM',default_total_vol:2,default_concs:[0,.05,.10,.20,.40,.60,.80,1]},
      storage_conditions:[t('추출액은 차갑게 유지하고 지체 없이 반응시킵니다. H₂O₂ 표준액의 농도는 사용 시 확인합니다.', 'Keep extracts cold and assay promptly. Confirm the concentration of the H₂O₂ standard at use.')],
      references:[
        {citation:'Velikova V, Yordanov I & Edreva A (2000). Oxidative stress and some antioxidant systems in acid rain-treated bean plants. Plant Science 151, 59–66.',doi:'10.1016/S0168-9452(99)00197-1',note:t('원문의 추출액·10 mM 완충액·1 M KI 혼합비 1:1:2 및 A390 검량법을 플레이트에 축소 적용했습니다. 원문과 조직량·추출 부피는 다릅니다.', 'Source of the 1:1:2 extract/buffer/KI ratio, 10 mM phosphate, 1 M KI and A390 calibration. The plate and tissue-to-extract ratio are local adaptations.')},
        {citation:'Alexieva V et al. (2001). The effect of drought and ultraviolet radiation on growth and stress markers in pea and wheat. Plant, Cell & Environment 24, 1337–1344.',doi:'10.1046/j.1365-3040.2001.00778.x',note:t('1시간 암반응 후 A390을 측정합니다. 이 논문의 완충액 농도와 혼합비는 Velikova 조건과 다릅니다.', 'Support for the 1 h dark incubation and A390 readout. Its buffer concentration and reagent proportions differ from Velikova’s.')},
        {citation:'Junglee S et al. (2014). Optimized assay for hydrogen peroxide determination in plant tissue using potassium iodide. American Journal of Analytical Chemistry 5, 730–736.',doi:'10.4236/ajac.2014.511081',note:t('350 nm 단일 단계 KI법에서 식물 추출물의 색·항산화 물질 간섭과 H₂O₂ 첨가 회수율을 검토했습니다. 이 페이지의 390 nm 선택 여과는 시료별 검증이 필요합니다.', 'Assesses matrix colour, antioxidant interference and H₂O₂ spike recovery in a one-step A350 KI assay. Optional filtration for the A390 procedure needs local validation.')}]
    }
  };
}
