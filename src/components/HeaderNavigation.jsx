import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { pageUrl, workspaces } from "@/data/workspaces";

const sections = [
  { id: "home", family: "instrument", title: ["기기 분석", "Instruments"], overview: ["기기 분석 목록", "All instruments"] },
  { id: "physiological", family: "physiology", title: ["생리 계측", "Physiology"], overview: ["생리 계측 목록", "All physiology tools"] }
];
const resultParents = { results: "analysis", hplc_results: "hplc" };

export default function HeaderNavigation({ page, english }) {
  const lang = Number(english);
  const currentTool = resultParents[page] || page;
  const [expanded, setExpanded] = useState(null);
  const nav = useRef(null);
  const closeTimer = useRef(null);
  const buttons = useRef({});
  const focusFirstLink = useRef(false);
  const isDesktopHover = event => event.pointerType === "mouse" && window.matchMedia("(min-width: 691px) and (hover: hover) and (pointer: fine)").matches;

  function close() {
    window.clearTimeout(closeTimer.current);
    setExpanded(null);
  }

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);
  useLayoutEffect(() => {
    if (expanded && focusFirstLink.current) {
      focusFirstLink.current = false;
      document.getElementById("nav-directory-" + expanded.id)?.querySelector("a")?.focus();
    }
  }, [expanded]);
  useEffect(() => {
    if (!expanded) return;
    function onOutside(event) {
      if (!nav.current?.contains(event.target)) close();
    }
    function onEscape(event) {
      if (event.key !== "Escape") return;
      if (nav.current?.contains(document.activeElement)) buttons.current[expanded.id]?.focus();
      close();
    }
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [expanded]);

  function onEnter(event, id) {
    window.clearTimeout(closeTimer.current);
    if (isDesktopHover(event)) setExpanded(previous => previous?.id === id ? previous : { id, hover: true });
  }
  function onLeave(event) {
    if (!isDesktopHover(event) || event.currentTarget.querySelector(".nav-directory")?.contains(document.activeElement)) return;
    closeTimer.current = window.setTimeout(() => setExpanded(previous => previous?.hover ? null : previous), 170);
  }
  function toggle(id) {
    window.clearTimeout(closeTimer.current);
    setExpanded(previous => previous?.id === id && !previous.hover ? null : { id, hover: false });
  }
  function onArrow(event, id) {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    window.clearTimeout(closeTimer.current);
    focusFirstLink.current = true;
    setExpanded({ id, hover: false });
  }

  return <nav className="studio-nav" aria-label={english ? "Main menu" : "주 메뉴"} ref={nav}>
    <Link className={"studio-nav-root" + (page === "mainhome" ? " is-current" : "")} to={pageUrl("mainhome", english)}
      aria-current={page === "mainhome" ? "page" : undefined} onClick={close} onFocus={close}
      onPointerEnter={event => { if (isDesktopHover(event)) close(); }}>{english ? "Home" : "홈"}</Link>
    {sections.map(section => {
      const { id, family, title, overview } = section;
      const items = workspaces.filter(item => item.family === family);
      const active = page === id || items.some(item => item.id === currentTool);
      const open = expanded?.id === id;
      return <div key={id} className="studio-nav-group" data-current={active || undefined}
        onPointerEnter={event => onEnter(event, id)} onPointerLeave={onLeave}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget) && open) close(); }}>
        <Link className="studio-nav-parent" to={pageUrl(id, english)} onClick={close}
          aria-current={active ? (page === id ? "page" : "location") : undefined}
          onKeyDown={event => onArrow(event, id)}>{title[lang]}</Link>
        <button type="button" className="studio-nav-toggle" ref={el => { buttons.current[id] = el; }}
          aria-label={english ? title[lang] + " menu" : title[lang] + " 메뉴"} aria-controls={"nav-directory-" + id}
          aria-expanded={open} onClick={() => toggle(id)} onKeyDown={event => onArrow(event, id)}>
          <span>{title[lang]}</span><ChevronDown size={15} aria-hidden="true"/>
        </button>
        <div id={"nav-directory-" + id} className="nav-directory" hidden={!open}>
          <ul>
            <li><Link className="nav-directory-all" to={pageUrl(id, english)} onClick={close}
              aria-current={page === id ? "page" : undefined}>{overview[lang]}<ArrowRight size={15} aria-hidden="true"/></Link></li>
            {items.map(item => <li key={item.id}><Link to={pageUrl(item.id, english)} onClick={close}
              aria-current={currentTool === item.id ? (page === item.id ? "page" : "location") : undefined}>
              {item.id === "li6800" ? "LI-6800 " : ""}{item.name[lang]}
            </Link></li>)}
          </ul>
        </div>
      </div>;
    })}
  </nav>;
}
