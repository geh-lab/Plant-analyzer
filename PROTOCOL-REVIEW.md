# 분석 프로토콜과 참고자료 검토

2026년 11월 26일 기준으로 한국어·영어 흡광도 11종, HPLC 5종, 켈달 질소, LI-6800과 FP100 가이드를 검토했습니다. Exa로 문헌을 찾고 원 논문·시험법·장비 설명서·첨부 MDA 문서를 대조했습니다. 아래 표는 화면의 수치나 해석을 바꾼 근거를 정리한 것입니다. 각 분석 화면의 참고 자료에는 해당 방법의 출처가 있습니다.

## 흡광도

| 분석 항목 | 확인한 내용과 적용 범위 |
| --- | --- |
| 엽록소와 카로티노이드 | 665.2·652.4·470 nm의 계수는 90% 메탄올 추출액용입니다. 추출액 농도를 건물 기준 함량으로 환산할 때 광경로, 추출 부피, 희석배수와 건물중을 반영합니다. [Lichtenthaler & Buschmann](https://doi.org/10.1002/0471142913.faf0403s01) |
| 총 페놀 | Folin–Ciocalteu 반응의 765 nm 판독과 갈산 검량선을 확인했습니다. 다른 환원성 물질도 발색하므로 갈산 환산값으로 보고합니다. [Ainsworth & Gillespie](https://doi.org/10.1038/nprot.2007.102) |
| 플라보노이드 | AlCl₃ 발색은 화합물 구조에 따라 달라집니다. 415 nm에서 측정한 퀘르세틴 환산값과 적용한 실험실 반응 조건을 표시합니다. [Chang 등](https://doi.org/10.38212/2224-6614.2748) · [Pękal & Pyrzynska](https://doi.org/10.1007/s12161-014-9814-x) |
| 글루코시놀레이트 | 엽채류의 건조 잎 추출액을 팔라듐 시약으로 발색하고 425 nm에서 판독합니다. 같은 조건에서 측정한 시니그린 검량선, 실제 추출 부피와 잎 건물중으로 mg SnE/g DW를 구합니다. Guarise 등은 생잎에서 425 nm 발색과 시니그린 검량을 검증했고, Montaner 등은 어린 잎과 꽃차례의 함량을 건물중 기준으로 보고했습니다. 추출 및 발색 조건은 각 문헌과 실험실 방법에 차이가 있습니다. [Guarise 등](https://doi.org/10.3390/agronomy9070401) · [Montaner 등](https://doi.org/10.3389/fnut.2022.1006012) |
| 안토시아닌 | 530·600 nm 두 값은 실험실 측정법으로 유지하고, 같은 조건에서 검증한 cyanidin-3-glucoside(C3G) 검량선으로 환산합니다. AOAC pH 차등법은 pH 1.0과 4.5 각각에서 520·700 nm를 측정하는 별도 방법입니다. [Taghavi 등](https://doi.org/10.1002/fsn3.2065) · [Lee 등](https://doi.org/10.1093/jaoac/88.5.1269) |
| DPPH | 517 nm에서 DPPH 대조구를 기준으로 소거율을 계산합니다. 유색 추출액의 자체 흡광도를 별도로 입력할 수 있습니다. 화면의 반응 부피와 시간은 실험실 조건으로 구분했습니다. [Blois](https://doi.org/10.1038/1811199a0) · [Tsai & Lin](https://doi.org/10.1016/j.heliyon.2019.e02315) |
| MDA | 첨부 문서 1쪽과 대조해 532·600 nm, 흡광계수 155 mM⁻¹ cm⁻¹, 반응 부피, 가열 조건을 확인했습니다. 결과는 최종 반응액의 MDA 환산 농도입니다. 안토시아닌 등 공존 물질은 두 파장으로 보정한 뒤에도 영향을 줄 수 있습니다. [첨부 실험법](public/protocols/mda.pdf) · [Jambunathan](https://doi.org/10.1007/978-1-60761-702-0_18) · [Hodges 등](https://doi.org/10.1007/s004250050524) |
| 과산화수소 | KI법의 390 nm 판독, 검량선과 암반응 조건을 대조했습니다. 별도 논문의 350 nm 단일 단계법은 매트릭스 간섭을 설명하는 비교 자료입니다. [Velikova 등](https://doi.org/10.1016/S0168-9452(99)00197-1) · [Alexieva 등](https://doi.org/10.1046/j.1365-3040.2001.00778.x) · [Junglee 등](https://doi.org/10.4236/ajac.2014.511081) |
| CAT | 240 nm에서 블랭크를 보정한 H₂O₂ 감소 속도를 사용합니다. 광경로와 흡광계수, 실제 분주량·반응량·추출량·건물중을 계산에 반영합니다. [Aebi](https://doi.org/10.1016/S0076-6879(84)05016-3) · [흡광계수 근거](https://pmc.ncbi.nlm.nih.gov/articles/PMC4707181/) |
| POD | 470 nm에서 블랭크를 보정한 테트라구아이아콜 생성 속도를 사용합니다. 생성물의 흡광계수 26.6 mM⁻¹ cm⁻¹와 검체량을 반영합니다. [Mika & Lüthje](https://pmc.ncbi.nlm.nih.gov/articles/PMC167087/) |
| SOD | 단일 반응액에서 얻는 값은 NBT 광환원 억제율입니다. U/mg DW는 희석계열에서 얻은 50% 억제점의 원추출액 상당 부피와 건물중으로 계산합니다. [Giannopolitis & Ries](https://doi.org/10.1104/pp.59.2.309) · [Fryer 등](https://doi.org/10.1104/pp.116.2.571) |

## HPLC와 장비

| 분석 항목 | 확인한 내용과 적용 범위 |
| --- | --- |
| HPLC 페놀 화합물 | 원문은 체리 추출물에서 검증한 성분별 검출 파장과 검량선을 뒷받침합니다. 다른 성분이나 식물 조직은 표준품과 매트릭스 확인이 필요합니다. [Gonçalves 등](https://doi.org/10.1007/s42452-019-0680-4) |
| HPLC 글루코시놀레이트 | 탈황한 성분의 피크를 같은 시료의 내부표준 면적과 비교하고, 첨가량·응답계수·건물중을 반영합니다. 내부표준 계산은 유럽공동체의 기존 시험법을, 229 nm 성분별 응답계수는 Grosser와 van Dam의 표 3을 따릅니다. ISO 9167:2019는 유채 종자와 유채박에서 검증되었으며, 다른 식물에서는 미리 동정한 성분이 표준에 수록되어 있어야 합니다. [내부표준 계산식](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A31990R1864) · [성분별 응답계수](https://pmc.ncbi.nlm.nih.gov/articles/PMC5409297/) · [ISO 적용 범위](https://www.iso.org/standard/72207.html) |
| HPLC 배초향 지표성분 | 첨부 논문 13쪽에서 로즈마린산·아카세틴·틸리아닌의 기관별 동결건조 분말 200 mg, 순수 메탄올 10 mL, 초음파 30분, 1,358 × g 원심분리 20분, 0.45 µm 여과와 330 nm 검출 조건을 확인했습니다. 성분별 실측 표준곡선으로 mg/g DW를 계산합니다. 14쪽 식 (1)은 기관별 값을 건물중으로 가중한 식물 전체 농도입니다. 기존 275 nm 방법은 과거 자료용으로 구분했습니다. [Lam 등, 2026, 13–14쪽](https://doi.org/10.1038/s41598-025-34712-x) · [Lam 등, 2020, §2.6](https://doi.org/10.3390/agronomy10010076) |
| 개똥쑥 HPLC | 제공 논문 §2.5.6의 동결건조 조직 0.5 g, 메탄올 10 mL, 60 °C 초음파 1시간, 842 × g 원심분리 및 0.45 µm 여과를 확인했습니다. 197 nm에서 네 성분을 각각 외부 표준품으로 정량합니다. 기존 260 nm Q260법은 과거 측정값에 대한 참고 항목에 남겼습니다. [Kim 등](https://doi.org/10.1016/j.indcrop.2026.124025) · [Qian 등](https://doi.org/10.1081/JLC-200048890) |
| HPLC 칸나비노이드 | LC–DAD 원 시험법의 성분·시료 범위와 건물 기준으로 환산하는 후속 적용법을 구분했습니다. [Václavík 등](https://doi.org/10.1093/jaoac/102.6.1822) · [건물 기준 수정법](https://cdnmedia.eurofins.com/eurofins-us/media/1713016/modification-of-aoac-official-methods-201811-for-quantification-of-cannabinoids-in-plant-materials-concentrates-and-oils.pdf) |
| 켈달 질소 | 붕산에 포집한 증류액을 표준산으로 직접 적정할 때의 공시험 보정, 산 노르말 농도, 건조시료 질량을 확인했습니다. 기본 켈달법에서 질산태·아질산태 질소의 회수는 보장되지 않습니다. [Labconco 원리 가이드](https://www.labconco.com/download/a-guide-to-kjeldahl-nitrogen-determination-metho/179) · [장치 설명서](https://www.labconco.com/download/open-kjeldahl-apparatus-manual/456) |
| LI-6800 | 기준·시료 분석기의 매칭과 장비 교정을 구분했습니다. 광 반응과 CO₂ 반응 측정은 해당 제조사 절차에 연결했고 결과에는 측정 로그의 실제 점을 표시합니다. [LI-COR 매칭](https://www.licor.com/support/LI-6800/topics/matching-the-analyzers.html) · [광 반응](https://www.licor.com/support/LI-6800/topics/light-response-curves.html) · [CO₂ 반응](https://www.licor.com/support/LI-6800/topics/co2-response-curves.html) |
| FP100 | 헴프 논문 §2.4의 O·K·J·I(0.02·0.3·2·30 ms), 측정 최고값 Fm과 제조사 설명서 §8.D의 O·I(0.05·60 ms)를 별도 선택으로 제공합니다. 보충표 S1에서 Mo는 F50µs와 F300µs를 사용합니다. 필요한 시점이 없으면 해당 지표를 비워 둡니다. [Hahm 등 본문·보충표 S1–S2](https://doi.org/10.1016/j.indcrop.2026.123307) · [PSI FP100 설명서](https://fs.kswe.ch/bio/wp-content/uploads/sites/10/2020/05/FluorPen_Manual.pdf) |

## 헴프 연구 및 흡광도 판독

‘Queen Dream’ 삽수 연구는 LI-6800 가스 교환(§2.3), 같은 잎의 FP100 형광(§2.4), 광합성 색소(§2.5) 및 과산화수소(§2.6)를 보고했습니다. 색소 판독 파장은 논문에 665·652·470 nm로 기재돼 있습니다. 과산화수소는 건물중 기준(µmol/g DW)으로 보고했습니다. 앱의 ‘건물중 기준’ 결과에서 계산 조건에 입력한 건물중을 확인하고 비교하세요. 시료별 생체중을 추가하면 FW 기준값도 별도로 표시됩니다. [Hahm 등](https://doi.org/10.1016/j.indcrop.2026.123307)

시약 표에는 각 실험법의 용매와 완충액을 표시했습니다. 효소 추출액, 산성 과산화수소·MDA 추출액, 색소 및 DPPH 추출액은 분석법에 맞춰 준비합니다. 첨부 MDA 자료에 명시되지 않은 TBA 원액 용매·보관기한은 원문에 미기재로 표시했습니다.

CAT·POD·SOD는 원심분리 후 입자가 남은 추출액에 한해 수용액용 저단백질결합 0.45 µm 주사기 필터를 사용할 수 있습니다. 아보카도 잎 연구에서는 CAT·POD 추출액을 여과한 뒤 원심분리했습니다. 앱에서는 순서를 바꾼 선택 전처리이므로 같은 추출액의 여과 분획과 재원심분리 분획에서 효소별 활성을 비교하도록 안내합니다. [Chung 등](https://doi.org/10.1038/s41598-022-15821-3) · [Merck PES 필터 설명서](https://www.merckmillipore.com/deepweb/assets/sigmaaldrich/product/documents/421/015/pr06217-0325-mk.pdf)

H₂O₂는 맑은 상층액을 바로 KI 반응에 사용합니다. 입자가 남아 여과할 때는 필터막·하우징의 0.1% TCA 호환성을 확인하고, 여과 전 표준을 첨가한 시료와 무첨가 시료를 각각 나누어 여과·비여과 분획의 첨가 회수율을 비교합니다. 식물 시료의 색·항산화 물질 간섭과 첨가 회수율을 검토한 연구는 350 nm 조건이므로, 앱의 390 nm 필터 전처리는 각 시료에서 확인해야 합니다. [Junglee 등](https://doi.org/10.4236/ajac.2014.511081)

**흡광도 신뢰성 안내의 적용 범위.** 0.1·0.5·1.0·1.5·2.0 AU는 개별 파장 판독을 검토하는 실험실 예시 경계입니다. 실제 정밀도는 파장, 장비와 신호 크기에 따라 달라지며, 분광광도계 실측 연구에서는 반복 측정의 상대 표준편차가 1 AU를 넘는 곳에서 가장 작은 사례도 있었습니다. 2 AU를 넘으면 투과율은 1% 미만입니다. BioTek Epoch의 판독 범위는 0–4 OD이며 정확도·직선성 명세는 0–2 OD에서 ±1% ±0.010 OD, 2–2.5 OD에서 ±3% ±0.010 OD입니다. [정밀도 실측 연구](https://doi.org/10.1016/j.aca.2024.343393) · [Agilent 분광광도계 가이드 §3.7–3.8](https://www.agilent.com/cs/library/primers/public/primer-uv-vis-basics-5980-1397en-agilent.pdf) · [Epoch 기기 사양](https://www.agilent.com/cs/library/specifications/public/Epoch-technical-details-5994-5373EN-agilent.pdf)

잎 색소 큐벳법에는 별도의 문헌 권장 범위인 0.3–0.85 AU가 있습니다. 저자는 특히 낮은 적색부 흡광도에 주의하도록 안내합니다. 표준액을 사용하는 발색법은 시료·표준의 블랭크를 일치시키고 검증한 검량 범위 안에서 정량합니다. MDA·안토시아닌은 개별 파장의 판독과 보정 차이를 구분합니다. A600은 낮아도 의미 있는 배경 판독일 수 있으며, MDA에서는 유색 조직의 532 nm 간섭도 점검합니다. CAT·POD는 각 시간점의 판독과 초기 반응의 직선성, SOD·DPPH는 블랭크 보정 후 대조구 대비 억제율을 확인합니다. [잎 색소 원법](https://doi.org/10.1002/0471142913.faf0403s01) · [Merck 측정 범위 §2.2.1](https://www.merckmillipore.com/deepweb/assets/sigmaaldrich/product/documents/326/405/173028ug-en-ms.pdf) · [MDA 색소 간섭](https://doi.org/10.1007/s004250050524)

## 검증 범위

이번 검토는 문헌의 적용 범위, 화면에서 안내하는 실험 조건, 소프트웨어 계산과 단위의 일치 여부를 확인한 것입니다. 각 연구실에서 사용하는 시료와 장비의 회수율·직선성·검출한계는 해당 시료의 표준품과 품질관리 측정으로 확인해야 합니다.
