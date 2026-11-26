import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { pageUrl } from "@/data/workspaces";

const methods = [
  ["li6800", "?tab=guide&topic=spot", "LI-6800 · 잎 가스 교환", "LI-6800 · gas exchange"],
  ["fp100", "", "FP100 · 엽록소 형광", "FP100 · chlorophyll fluorescence"],
  ["analysis", "?selected=chlorophyll_a_b", "엽록소·카로티노이드", "Chlorophylls and carotenoids"],
  ["analysis", "?selected=h2o2", "과산화수소", "Hydrogen peroxide"]
];

export default function HempStudy({ en, current }) {
  return <section className="hemp-study">
    <h3>{en ? "Measurements in the GEH Lab hemp study" : "GEH Lab 헴프 논문에서 측정한 항목"}</h3>
    <p>{en ? "Hahm et al. studied ‘Queen Dream’ cuttings. They measured gas exchange and chlorophyll fluorescence on the same leaves, and assayed pigments and hydrogen peroxide. The paper reports no HPLC cannabinoid concentrations." : "Hahm 등의 ‘Queen Dream’ 삽수 연구는 같은 잎에서 가스 교환과 엽록소 형광을 측정하고, 색소와 과산화수소를 분석했습니다. 이 논문에는 HPLC 칸나비노이드 정량 결과가 없습니다."}</p>
    <ul>{methods.filter(([id]) => id !== current).map(([id, query, ko, english]) => <li key={id+query}><Link to={pageUrl(id,en)+query}>{en ? english : ko}<ArrowUpRight size={14}/></Link></li>)}</ul>
    <a href="https://doi.org/10.1016/j.indcrop.2026.123307" target="_blank" rel="noreferrer">Hahm et al. (2026) · §§ 2.3–2.6 <ArrowUpRight size={13}/></a>
  </section>;
}
