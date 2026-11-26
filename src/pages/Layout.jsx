import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Globe2, Search } from "lucide-react";

import AppearanceSettings from "@/components/AppearanceSettings";
import HeaderNavigation from "@/components/HeaderNavigation";
import { pageUrl } from "@/data/workspaces";
import { copyWithAttribution, labHomepage } from "@/utils/copyAttribution";

const WorkspaceSearch = lazy(() => import("@/components/WorkspaceSearch"));

const titles = {
  mainhome: ["홈", "Home"], home: ["기기 분석", "Instrumental analysis"],
  analysis: ["흡광도 분석", "Absorbance"], results: ["흡광도 분석 결과", "Absorbance results"],
  hplc: ["HPLC 분석", "HPLC analysis"], hplc_results: ["HPLC 분석 결과", "HPLC results"],
  kjeldahl: ["켈달 질소 분석", "Kjeldahl nitrogen"], physiological: ["생리 계측", "Plant physiology"],
  fp100: ["FP100 엽록소 형광", "FP100 chlorophyll fluorescence"],
  li6800: ["LI-6800 광합성 측정", "LI-6800 photosynthesis"]
};

export default function Layout({ children, page, english }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const lang = Number(english);
  const landing = pageUrl("mainhome", english);
  const otherLanguage = pageUrl(titles[page] ? page : "mainhome", !english) + location.search + location.hash;

  useEffect(() => {
    document.documentElement.lang = english ? "en" : "ko";
    document.title = (titles[page]?.[lang] || "404") + " · Plant Analyzer | GEH Lab";
    if (!location.hash) window.scrollTo(0, 0);
  }, [page, english, lang, location.pathname, location.hash]);

  useEffect(() => {
    function handleShortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(value => !value);
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <div className="studio-shell" onCopy={event => copyWithAttribution(event, english)}>
      <a className="skip-link" href="#studio-main">{english ? "Skip to content" : "본문으로 이동"}</a>
      <header className="studio-header">
        <div className="studio-container studio-header-inner">
          <Link className="studio-brand" to={landing} aria-label={english ? "GEH Lab Plant Analyzer home" : "GEH Lab Plant Analyzer 홈"}>
            <img src="/geh-logo.webp" alt="" width="37" height="37"/><strong>GEH Lab</strong><span className="brand-divider"/><span className="brand-product">Plant Analyzer</span>
          </Link>
          <HeaderNavigation key={location.pathname} page={page} english={english}/>
          <div className="studio-utilities">
            <AppearanceSettings english={english} />
            <button ref={triggerRef} type="button" className="nav-search" onClick={() => setOpen(true)} aria-label={english ? "Search analysis tools" : "분석 도구 검색"} aria-haspopup="dialog" aria-expanded={open}><Search size={19}/></button>
            <span aria-hidden="true" className="utility-divider"/>
            <Link className="language-switch" to={otherLanguage} state={location.state} lang={english ? "ko" : "en"} hrefLang={english ? "ko" : "en"} aria-label={english ? "한국어로 보기" : "View in English"}><Globe2 size={16}/>{english ? "KO" : "EN"}</Link>
          </div>
        </div>
      </header>
      <main id="studio-main" className={page === "mainhome" ? "studio-landing" : undefined} tabIndex={-1}>{children}</main>
      <footer className="studio-footer">
        <div className="studio-container">
          <div><strong>GEH Lab</strong><span>{english ? "Greenhouse & Environmental Horticulture Lab · Chungnam National University" : "충남대학교 시설환경원예학연구실"}</span></div>
          <a href={english ? labHomepage + "en/" : labHomepage} target="_blank" rel="noreferrer">{english ? "Lab website" : "연구실 홈페이지"}<ArrowUpRight size={15}/></a>
        </div>
      </footer>
      <Suspense fallback={null}>{open && <WorkspaceSearch english={english} open onOpenChange={setOpen} triggerRef={triggerRef}/>}</Suspense>
    </div>
  );
}
