export const workspaces = [
  {
    id: "analysis", family: "instrument", image: "/instruments/absorbance.webp",
    name: ["흡광도 분석", "Absorbance"], english: "Spectrophotometry",
    description: ["파장별 흡광도로 식물 색소 함량과 항산화 효소 활성 분석", "Measure plant pigment content and antioxidant enzyme activity from absorbance."],
    keywords: "분광광도계 UV VIS spectrophotometer"
  },
  {
    id: "hplc", family: "instrument", image: "/instruments/hplc.webp",
    name: ["HPLC 분석", "HPLC"], english: "Chromatography",
    description: ["머무름 시간으로 피크를 찾고 성분별 함량 정량", "Match peaks by retention time and quantify compounds."],
    keywords: "고성능 액체 크로마토그래피 chromatography peaks"
  },
  {
    id: "kjeldahl", family: "instrument", image: "/instruments/kjeldahl.webp",
    name: ["켈달 질소 분석", "Kjeldahl nitrogen"], english: "Nitrogen analysis",
    description: ["공시험을 보정한 적정값으로 건물 기준 켈달 질소 함량 계산", "Calculate dry-mass Kjeldahl nitrogen from blank-corrected titrations."],
    keywords: "Kjeldahl nitrogen total N 켈달 질소"
  },
  {
    id: "li6800", family: "physiology", image: "/instruments/li6800.webp",
    name: ["광합성 측정", "Photosynthesis"], english: "LI-6800",
    description: ["LI-6800 측정값으로 광·이산화탄소 반응 곡선 비교", "Explore photosynthetic light and CO₂ response curves."],
    keywords: "LI-6800 LI6800 photosynthesis 생리 계측 광합성 gas exchange"
  },
  {
    id: "fp100", family: "physiology", image: "/specimens/hemp-geh.webp",
    name: ["FP100 엽록소 형광", "FP100 fluorescence"], english: "FluorPen FP100",
    description: ["OJIP 형광 유도, 광반응(LC), 비광화학적 소광(NPQ) 곡선 비교", "Compare OJIP fluorescence transients, light curves and non-photochemical quenching."],
    keywords: "FP100 FP 100 PSI FluorPen fluorescence 엽록소 형광 OJIP JIP PSII Fv/Fm WOP LC1 LC2 LC3 NPQ1 NPQ2 광반응 소광 hemp 헴프 대마"
  }
];

export function pageUrl(id, english = false) {
  if (id === "mainhome") return english ? "/mainhome_en" : "/";
  return "/" + id + (english ? "_en" : "");
}
