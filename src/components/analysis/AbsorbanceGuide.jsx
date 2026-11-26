import { useEffect, useRef } from "react";
import { Activity, ArrowUpRight, ChevronDown } from "lucide-react";
import { absorbanceBands, absorbanceScope } from "@/data/absorbanceRanges";
import "./absorbanceGuide.css";

const sources = [
  ["Epoch 장비 사양", "Epoch specifications", "https://www.agilent.com/cs/library/specifications/public/Epoch-technical-details-5994-5373EN-agilent.pdf"],
  ["Merck 검량 범위", "Merck on working range", "https://www.merckmillipore.com/deepweb/assets/sigmaaldrich/product/documents/326/405/173028ug-en-ms.pdf"],
  ["반복 정밀도 연구", "Study of measurement precision", "https://doi.org/10.1016/j.aca.2024.343393"],
];

export default function AbsorbanceGuide({ en = false, analysisType, compact = false }) {
  const lang = Number(en);
  const scope = absorbanceScope(analysisType);
  const section = useRef(null);
  const details = useRef(null);
  useEffect(() => {
    function revealGuide() {
      if (window.location.hash !== "#absorbance-reliability") return;
      if (details.current) details.current.open = true;
      section.current?.scrollIntoView();
    }
    revealGuide();
    window.addEventListener("hashchange", revealGuide);
    return () => window.removeEventListener("hashchange", revealGuide);
  }, []);
  const ranges = <>
    <table><thead><tr><th scope="col">{en ? "Range (AU)" : "범위 (AU)"}</th><th scope="col">{en ? "Lab guide" : "실험실 참고"}</th><th scope="col">{en ? "What to check" : "확인 사항"}</th></tr></thead>
      <tbody>{absorbanceBands.map(b => <tr key={b.tone} data-tone={b.tone}><th scope="row">{b.range}</th><td><span className="au-badge">{b.label[lang]}</span></td><td>{b.action[lang]}</td></tr>)}</tbody>
    </table>
    <footer><p>{en ? "For example, the BioTek Epoch reads 0–4 OD. Its specified accuracy and linearity are ±1% ±0.010 OD at 0–2 OD and ±3% ±0.010 OD at 2–2.5 OD." : "예를 들어 BioTek Epoch의 판독 범위는 0–4 OD입니다. 제조사가 명시한 정확도·직선성은 0–2 OD에서 ±1% ±0.010 OD, 2–2.5 OD에서 ±3% ±0.010 OD입니다."}</p>
      {(scope.source ? [scope.source, ...sources] : sources).map(source => <a key={source[2]} href={source[2]} target="_blank" rel="noreferrer">{source[lang]} <ArrowUpRight size={13} aria-hidden="true"/></a>)}
    </footer>
  </>;
  const title = compact ? (en ? "Measurement reliability · all assays" : "측정 신뢰도 · 전체 분석 공통") : (en ? "Absorbance measurement reliability guide" : "흡광도 측정 신뢰성 가이드");
  const guidance = en ? "These bands are lab examples for individual wavelength readings across absorbance assays. For differences, rates, percentages and concentrations, use the method’s criteria, the instrument’s verified range and replicate precision."
    : "아래 구간은 모든 흡광도 분석에서 개별 파장 판독을 점검하기 위한 실험실 예시입니다. 파장 차이·반응속도·억제율·농도는 각 분석법의 기준, 장비의 검증 범위와 반복 정밀도로 판단하세요.";
  const context = <p><strong>{scope.label[lang]}</strong>{" · "}{scope.note[lang]}</p>;
  return <section ref={section} id="absorbance-reliability" tabIndex={-1} className={compact ? "au-guide method-quality" : "au-guide"} aria-label={title}>
    {compact ? <details ref={details}>
      <summary><h3>
        <span className="method-quality-name"><Activity size={17} aria-hidden="true"/>{title}</span>
        <span className="method-quality-range">{scope.label[lang]}<ChevronDown size={15} aria-hidden="true"/></span>
      </h3></summary>
      <div className="method-quality-body"><p>{scope.note[lang]}</p><p>{guidance}</p>{ranges}</div>
    </details> : <>
      <header><Activity size={22} aria-hidden="true"/><h3>{title}</h3></header>
      {context}<p>{guidance}</p>{ranges}
    </>}
  </section>;
}
