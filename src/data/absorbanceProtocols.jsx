import { pigmentProtocols } from "./pigmentProtocols.js";
import { TestTube } from "lucide-react";
import { oxidativeProtocols } from "./oxidativeProtocols";

const korean = {
  ...pigmentProtocols("ko"),
  ...oxidativeProtocols("ko")
};

const english = {
  ...pigmentProtocols("en"),
  ...oxidativeProtocols("en")
};

const mdaReferences = lang => [
  { citation: "MDA.pdf · Determination and Detection of Lipid Peroxidation, p. 1.", href: "/protocols/mda.pdf", note: lang === "en" ? "Source for the reaction volumes, heating, two wavelengths and ε = 155 mM⁻¹ cm⁻¹." : "반응 부피, 가열 조건, 두 파장과 흡광계수 155 mM⁻¹ cm⁻¹의 직접 근거입니다." },
  { citation: "Jambunathan N. (2010). Determination and detection of reactive oxygen species (ROS), lipid peroxidation, and electrolyte leakage in plants. Methods in Molecular Biology 639, 291–297.", doi: "10.1007/978-1-60761-702-0_18", note: lang === "en" ? "Method chapter cited in the supplied laboratory protocol." : "첨부 실험실 프로토콜이 인용한 분석법 문헌입니다." },
  { citation: "Hodges DM et al. (1999). Improving the thiobarbituric acid-reactive-substances assay for estimating lipid peroxidation in plant tissues containing anthocyanin and other interfering compounds. Planta 207, 604–611.", doi: "10.1007/s004250050524", note: lang === "en" ? "Evidence for interference by pigments and other compounds. Its modified assay is a separate procedure." : "안토시아닌 등 공존 물질의 간섭을 보여줍니다. 이 논문의 개선법은 별도 방법입니다." }
];
const mdaBase = {
  wavelengths: ["532", "600"],
  unit: "μM",
  icon: <TestTube />,
  formulas: [
    <span key="mda-delta">ΔA = A<sub>532</sub> − A<sub>600</sub></span>,
    "MDA (μM) = 1,000 × ΔA / (155 × l)"
  ],

};

korean.mda = {
  ...mdaBase, references: mdaReferences("ko"),
  title: "MDA 지질과산화",
  subtitle: "Malondialdehyde · TBARS",
  protocol: [
    "처리구와 대조구의 식물 조직 약 200 mg을 각각 0.1% TCA 4 mL에 넣고 균질화합니다.",
    "10,000 × g에서 15분간 원심분리한 후 상층액을 회수합니다.",
    "상층액 1 mL, 20% TCA 2 mL, 0.5% TBA 2 mL를 섞어 총 5 mL로 반응시킵니다. 실험실 시약 블랭크에는 상층액 대신 0.1% TCA 1 mL를 넣습니다.",
    "흄 후드에서 95 °C로 30분간 가열한 뒤 얼음 위에서 식힙니다.",
    "반응 상층액의 흡광도를 532 nm와 600 nm에서 시료마다 같은 냉각 후 시간 간격으로 측정합니다."
  ],
  reagents: ["추출용 0.1% (w/v) TCA", "반응용 20% (w/v) TCA", "반응용 0.5% TBA"],
  interpretation: "600 nm의 비특이적 흡광을 뺀 뒤 몰 흡광계수 155 mM⁻¹ cm⁻¹와 광경로 길이 l (cm)로 나눕니다. 결과는 최종 반응액의 MDA 환산 농도입니다. 큐벳이나 플레이트에서 측정한 실제 광경로 길이를 사용하세요. A600 보정 후에도 색소 등 다른 TBA 반응성 물질의 간섭이 남을 수 있습니다."
};

english.mda = {
  ...mdaBase, references: mdaReferences("en"),
  title: "MDA lipid peroxidation",
  subtitle: "Malondialdehyde · TBARS",
  protocol: [
    "Homogenize about 200 mg of tissue from each treatment or control in 4 mL of 0.1% TCA.",
    "Centrifuge at 10,000 × g for 15 minutes and collect the supernatant.",
    "Combine 1 mL supernatant, 2 mL of 20% TCA and 2 mL of 0.5% TBA for a 5 mL reaction. For the laboratory reagent blank, substitute 1 mL of 0.1% TCA for supernatant.",
    "Heat at 95 °C for 30 minutes in a fume hood, then cool on ice.",
    "Read the reaction supernatant at 532 and 600 nm at the same interval after cooling for each sample."
  ],
  reagents: ["0.1% (w/v) TCA extraction solution", "20% (w/v) TCA reaction solution", "0.5% TBA reaction solution"],
  interpretation: "Subtract nonspecific absorbance at 600 nm, then divide by the extinction coefficient of 155 mM⁻¹ cm⁻¹ and optical path length l (cm). The result is the MDA-equivalent concentration of the final reaction mixture. Use the actual path length for your cuvette or plate. Pigments and other TBA-reactive substances may still contribute after A600 correction."
};

export const getProtocols = (lang = "ko") => lang === "en" ? english : korean;
