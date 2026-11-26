import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, House, Search, X } from "lucide-react";
import { pageUrl } from "@/data/workspaces";
import { getProtocols } from "@/data/absorbanceProtocols";
import { Button } from "@/components/ui/button";
import StudioSelect from "@/components/StudioSelect";
import AssayDiagram from "@/components/assay/AssayDiagram";
import { ReagentInventory, ReagentPreparation, ReagentStorage } from "@/components/assay/AssayReagents";
import { getAssayReagents } from "@/data/assayReagents";
import SpecimenDiagram from "@/components/assay/SpecimenDiagram";
import { assayFigures, specimenSources } from "@/components/assay/assayFigures";
import AbsorbanceGuide from "@/components/analysis/AbsorbanceGuide";
import DilutionPlanner from "@/components/analysis/DilutionPlanner";
import "./assay.css";

const groups = [
  { ko: "색소 및 대사산물", en: "Pigments & metabolites", keys: ["chlorophyll_a_b", "total_phenol", "total_flavonoid", "glucosinolate", "anthocyanin"] },
  { ko: "산화 스트레스", en: "Oxidative stress", keys: ["dpph_scavenging", "sod", "pod", "cat", "h2o2", "mda"] }
];

const assayName = (id, protocol, en) => assayFigures[id].title?.[Number(en)] || protocol.title;
const searchKey = text => String(text).normalize("NFKC").toLowerCase().replace(/[\s_·–-]+/g, "");

function ProtocolDetails({ id, protocol: p, en }) {
  const figure = assayFigures[id];
  const reagents = getAssayReagents(id, en ? "en" : "ko");
  const references = [...(p.references || [])];
  if (specimenSources[id]) references.push({
    ...specimenSources[id], note: en ? "Source for the plant material diagram." : "식물 시료 모식도의 근거 자료입니다."
  });
  return (
    <article style={{ "--method-ink": figure.ink, "--method-tint": figure.tint }} className="assay-detail" aria-labelledby="protocol-title">
      <header className="assay-detail-head">
        <div className="assay-detail-intro">
          <h2 id="protocol-title"><span className="assay-detail-code">{id === "h2o2" ? <>H<sub>2</sub>O<sub>2</sub></> : figure.code}</span><span className="assay-detail-name">{assayName(id, p, en)}</span></h2>
          <div className="assay-detail-tools">
            <dl className="assay-detail-measure">
              <div><dt>{en ? "Wavelength" : "측정 파장"}</dt><dd>{p.wavelengths.join(" / ")} nm</dd></div>
              <div><dt>{en ? "Output" : "결과 단위"}</dt><dd>{p.unit}</dd></div>
            </dl>
            <Button asChild className="assay-start"><Link to={`/results${en ? "_en" : ""}?analysis_type=${id}`}>{en ? "Analyze samples" : "시료 분석하기"} <ArrowRight size={16} aria-hidden="true"/></Link></Button>
            <nav className="method-quick-links" aria-label={en ? "On this assay page" : "이 분석의 바로가기"}>
              <a className="method-jump" href="#method-procedure">{en ? "Measurement steps" : "실험 방법"}<ChevronDown size={13} aria-hidden="true"/></a>
              <a className="method-jump" href="#absorbance-reliability" onClick={() => {
                const ranges = document.querySelector("#absorbance-reliability details");
                if (ranges) ranges.open = true;
              }}>{en ? "Reliability guide" : "측정 신뢰도"}<ChevronDown size={13} aria-hidden="true"/></a>
            </nav>
          </div>
        </div>
        <div className="assay-plates">
          <AssayDiagram id={id} en={en}/>
          <SpecimenDiagram id={id} en={en}/>
        </div>
      </header>
      <div className="method-panels">
        <div className="method-layout">
          <AbsorbanceGuide en={en} analysisType={id} compact/>
          <div className="method-stack">
            <section id="method-procedure" tabIndex={-1} className="method-block method-procedure" aria-labelledby="method-procedure-heading">
              <h3 id="method-procedure-heading">{en ? "Measurement procedure" : "실험 방법"}</h3>
              <ol>{p.protocol.map((step, i) => <li key={i}>{step}</li>)}</ol>
            </section>
            <ReagentPreparation guide={reagents} en={en}/>
          </div>
          <div className="method-stack">
            <ReagentInventory reagents={p.reagents} en={en}/>
            <ReagentStorage handling={reagents?.handling || p.storage_conditions} en={en}/>
            <section className="method-block method-calculations" aria-labelledby="method-calculations-heading">
              <h3 id="method-calculations-heading">{en ? "Calculations and interpretation" : "계산식과 결과 해석"}</h3>
              <div className="assay-equations">{p.formulas.map((item, i) => <div key={i}>{item}</div>)}</div>
              {p.interpretation && <p>{p.interpretation}</p>}
            </section>
          </div>
        </div>
      </div>
      {p.standard_curve_config && <details className="method-planner">
        <summary><h3>{en ? "Standard dilution planner" : "표준액 희석 계산기"}</h3><ChevronDown size={17} aria-hidden="true"/></summary>
        <DilutionPlanner key={id} config={p.standard_curve_config} en={en}/>
      </details>}
      <div className="assay-appendix">
        {p.writing_guide && <details><summary>{p.writing_guide.title}<ChevronDown size={16} aria-hidden="true"/></summary>{p.writing_guide.content.map((entry, i) => <p key={i}>{entry.text} {entry.note}</p>)}</details>}
        {references.length > 0 && <details className="assay-references">
          <summary>{en ? "References" : "참고 자료"}<ChevronDown size={16} aria-hidden="true"/></summary>
          <ul>{references.map(ref => (
            <li key={ref.citation}>
              <span>{ref.citation}</span>
              {ref.note && <p>{ref.note}</p>}
              <div>
                {ref.href && <a href={ref.href} target="_blank" rel="noreferrer">{/\.pdf$/i.test(ref.href) ? "PDF" : en ? "Source" : "원문"}<ArrowUpRight size={12} aria-hidden="true"/></a>}
                {ref.doi && <a href={`https://doi.org/${ref.doi}`} target="_blank" rel="noreferrer">DOI<ArrowUpRight size={12} aria-hidden="true"/></a>}
              </div>
            </li>
          ))}</ul>
        </details>}
      </div>
    </article>
  );
}

export default function Analysis({ lang = "ko" }) {
  const en = lang === "en";
  const protocols = getProtocols(lang);
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [mobileSearch, setMobileSearch] = useState(false);
  const searchInput = useRef(null);
  const searchToggle = useRef(null);
  const library = useRef(null);
  useEffect(() => {
    if (mobileSearch) searchInput.current?.focus();
  }, [mobileSearch]);
  const requested = params.get("selected");
  const selected = Object.hasOwn(protocols, requested) ? requested : groups[0].keys[0];
  const term = searchKey(query);
  const entries = groups.map(group => ({ ...group, keys: group.keys.filter(id => {
    const p = protocols[id];
    return [id, assayFigures[id].code, p.title, assayName(id, p, en), p.subtitle, p.unit,
      ...p.wavelengths.map(n => n + " nm")].some(text => searchKey(text).includes(term));
  })})).filter(group => group.keys.length);
  function select(id) {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      next.set("selected", id);
      return next;
    }, { preventScrollReset: true });
    if (mobileSearch) {
      setMobileSearch(false);
      setQuery("");
      searchToggle.current?.focus();
    }
    if (id !== selected && library.current?.getBoundingClientRect().top < 0) {
      library.current.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }
  function toggleSearch() {
    setMobileSearch(!mobileSearch);
    setQuery("");
  }
  return (
    <section className="assay-page assay-method-page">
      <div className="assay-wrap">
        <header className="assay-page-location">
          <h1>{en ? "Absorbance assays" : "흡광도 분석"}</h1>
          <nav className="assay-return-links" aria-label={en ? "Return to" : "상위 페이지로 이동"}>
            <Link to={pageUrl("mainhome", en)}><House size={16} aria-hidden="true"/>{en ? "Home" : "홈"}</Link>
            <Link to={pageUrl("home", en)}><ArrowLeft size={16} aria-hidden="true"/>{en ? "Back to instruments" : "기기 분석 목록으로"}</Link>
          </nav>
        </header>
        <div className="assay-library" ref={library}>
          <aside className="assay-shelf" aria-label={en ? "Assay index" : "분석 항목"}>
            <div className="assay-mobile-picker"><label htmlFor="assay-picker">{en ? "Choose an assay" : "분석 항목 선택"}</label>
              <div className="assay-mobile-tools"><StudioSelect id="assay-picker" aria-label={en ? "Choose an assay" : "분석 항목 선택"}
                value={selected} onValueChange={select}
                options={groups.flatMap(group => group.keys.map(id => ({
                  value: id, label: assayFigures[id].code + " · " + assayName(id, protocols[id], en), group: group[lang]
                })))}/>
                <button className="assay-search-toggle" type="button" ref={searchToggle} aria-label={mobileSearch ? (en ? "Close search" : "검색 닫기") : (en ? "Search assays" : "분석 검색")} aria-expanded={mobileSearch} aria-controls="assay-method-index" onClick={toggleSearch}>
                  {mobileSearch ? <X size={18}/> : <Search size={18}/>}
                </button>
              </div>
            </div>
            <div id="assay-method-index" className="assay-index" data-searching={mobileSearch}>
              <label className="assay-search"><Search size={17} aria-hidden="true"/><input ref={searchInput} type="search" value={query} onChange={e => setQuery(e.target.value)} aria-label={en ? "Find assay or wavelength" : "분석명 또는 파장 검색"} placeholder={en ? "Assay or wavelength" : "분석명 또는 파장 검색"}/></label>
              {entries.map(group => <section key={group.en}>
                <h2>{group[lang]}</h2>
                {group.keys.map(id => <button key={id} className="assay-index-entry" aria-pressed={selected === id} title={assayName(id, protocols[id], en)} onClick={() => select(id)} style={{ "--method-ink": assayFigures[id].ink, "--method-tint": assayFigures[id].tint }}>
                  <span className="assay-index-code">{assayFigures[id].code}</span>
                  <span className="assay-index-label">{assayName(id, protocols[id], en)}</span>
                </button>)}
              </section>)}
              {!entries.length && <p role="status">{en ? "No matching assays." : "일치하는 분석 항목이 없습니다."}</p>}
            </div>
          </aside>
          <ProtocolDetails key={selected} id={selected} protocol={protocols[selected]} en={en} />
        </div>
      </div>
    </section>
  );
}
