import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { pageUrl, workspaces } from "@/data/workspaces";
import "./workspace.css";

const specimens = [
  { photo: "basil-closeup", ko: "바질", en: "Sweet basil", latin: "Ocimum basilicum" },
  { photo: "hemp-geh", ko: "대마", en: "Hemp", latin: "Cannabis sativa" },
  { photo: "agastache-geh", ko: "배초향", en: "Korean mint", latin: "Agastache rugosa" },
  { photo: "field-geh", ko: "노지 재배", en: "Field cultivation", caption: ["두둑을 따라 자라는 작물", "Crops growing in open field rows"] },
  { photo: "lettuce-closeup", ko: "상추", en: "Lettuce", latin: "Lactuca sativa" },
  { photo: "artemisia-closeup", ko: "쑥속 식물", en: "Artemisia", latin: "Artemisia sp." }
];

const toolDetails = {
  fp100: { hint: ["OJIP·LC·NPQ 형광 곡선 비교", "Compare OJIP, LC and NPQ fluorescence curves."] },
  analysis: { hint: ["색소 함량과 항산화 효소 활성 계산", "Measure pigments and enzyme activity."] },
  hplc: { hint: ["피크 면적을 이용한 성분 정량", "Quantify compounds from peak areas."] },
  kjeldahl: { hint: ["적정량으로 건물 기준 질소 함량 계산", "Calculate nitrogen from titrations."] },
  li6800: { hint: ["LI-6800 광·CO₂ 반응 곡선 비교", "Plot LI-6800 light and CO₂ responses."] }
};

function SpecimenGallery({ english }) {
  const [index, setIndex] = useState(0);
  const touchStart = useRef(null);
  const [playing, setPlaying] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [visible, setVisible] = useState(() => !document.hidden);
  const specimen = specimens[index];

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => { if (preference.matches) setPlaying(false); };
    const syncVisibility = () => setVisible(!document.hidden);
    preference.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      preference.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  useEffect(() => {
    if (!playing || !visible) return;
    const timer = window.setTimeout(() => setIndex(current => (current + 1) % specimens.length), 6000);
    return () => window.clearTimeout(timer);
  }, [playing, visible, index]);

  function change(direction) {
    setIndex(current => (current + direction + specimens.length) % specimens.length);
  }

  function finishSwipe(event) {
    if (!touchStart.current) return;
    const dx = event.changedTouches[0].clientX - touchStart.current.x;
    const dy = event.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > 52 && Math.abs(dx) > Math.abs(dy) * 1.4) change(dx < 0 ? 1 : -1);
    touchStart.current = null;
  }

  return (
    <figure className="home-specimen" aria-label={english ? "GEH Lab photo gallery" : "GEH Lab 사진 갤러리"}
      onFocusCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget) && event.target.matches(":focus-visible")) setPlaying(false);
      }}>
      <div className="home-specimen-image"
        onTouchStart={event => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
        onTouchEnd={finishSwipe} onTouchCancel={() => { touchStart.current = null; }}>
        {specimens.map((item, position) => (
          <img key={item.photo} className={position === index ? "is-current" : undefined}
            src={"/specimens/" + item.photo + ".webp"} alt="" width="1672" height="941"
            loading={position === 0 ? "eager" : "lazy"} decoding="async" />
        ))}
      </div>
      <button type="button" className="home-rotation" onClick={() => setPlaying(current => !current)}
        aria-label={playing ? (english ? "Pause automatic photo rotation" : "사진 자동 전환 일시정지") : (english ? "Start automatic photo rotation" : "사진 자동 전환 재생")}>
        {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
        {playing ? (english ? "Pause" : "일시정지") : (english ? "Play" : "재생")}
      </button>
      <figcaption className="home-photo-deck">
      <div className="home-specimen-caption">
        <div aria-live={playing ? "off" : "polite"} aria-atomic="true">
          <span>{english ? specimen.en : specimen.ko}</span>
          {specimen.latin ? <i lang="la">{specimen.latin}</i> : <span className="home-field-caption">{specimen.caption[Number(english)]}</span>}
        </div>
        <div className="home-specimen-pager">
          <button type="button" aria-label={english ? "Previous plant photo" : "이전 식물 사진"} onClick={() => change(-1)}><ChevronLeft size={17} aria-hidden="true" /></button>
          <span aria-hidden="true">{index + 1} / {specimens.length}</span>
          <button type="button" aria-label={english ? "Next plant photo" : "다음 식물 사진"} onClick={() => change(1)}><ChevronRight size={17} aria-hidden="true" /></button>
        </div>
      </div>
      <div className="home-filmstrip" role="group" aria-label={english ? "Choose a photo" : "사진 선택"}>
        {specimens.map((item, position) => (
          <button key={item.photo} type="button" onClick={() => setIndex(position)}
            aria-label={english ? "Show " + item.en : item.ko + " 사진 보기"} aria-pressed={position === index}>
            <img src={"/specimens/" + item.photo + ".webp"} alt="" loading="lazy" width="84" height="48"/>
          </button>
        ))}
      </div>
      </figcaption>
    </figure>
  );
}

export default function MainHome({ english = false }) {
  const lang = Number(english);
  return (
    <div className="home-workspace">
      <section className="home-launcher" aria-labelledby="launcher-title">
        <header className="home-heading">
          <h1 id="launcher-title">{english ? "Start an analysis" : "분석 시작하기"}</h1>
          <p>{english ? "Choose the instrument you used to collect your data." : "측정에 사용한 장비를 선택하세요."}</p>
        </header>
        <ul className="home-tool-list">
          {workspaces.map(({ id, name, image, description }) => {
            const hint = toolDetails[id]?.hint || description;
            return (
              <li key={id}>
                <Link to={pageUrl(id, english)} className="home-tool-link">
                  <span className="home-tool-image"><img src={image} alt="" width="76" height="52" /></span>
                  <span className="home-tool-copy"><strong>{name[lang]}</strong><span>{hint[lang]}</span></span>
                  <ArrowRight size={20} strokeWidth={1.6} className="home-tool-arrow" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      <SpecimenGallery english={english} />
    </div>
  );
}
