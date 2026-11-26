import { useSearchParams } from "react-router-dom";
import {
  InstrumentFrame,
  ExternalLink,
  GuideDetails,
} from "@/components/instruments/InstrumentFrame";
import GasExchangePlot from "@/components/instruments/GasExchangePlot";
import HempStudy from "@/components/instruments/HempStudy";
import GuideVideo from "@/components/instruments/GuideVideo";
import guide from "@/data/li6800Guide.json";

function Guide({ en, selected, onSelect }) {
  const sections = en ? guide.en : guide.ko;
  const item = sections[selected],
    steps = item.steps,
    video = item.videoId;
  return (
    <div className="inst-grid">
      <aside className="inst-side">
        <h2>{en ? "Instrument guide" : "장비 사용 가이드"}</h2>
        {Object.entries(sections).map(([key, section]) => (
          <button
            key={key}
            aria-pressed={selected === key}
            onClick={() => onSelect(key)}
          >
            {section.title}
          </button>
        ))}
      </aside>
      <article key={selected} className="inst-panel">
        <h2>{item.title}</h2>
        <GuideVideo id={video} title={item.title} english={en} />
        <p className="inst-muted">{item.desc}</p>
        <GuideDetails
          title={en ? "Procedure" : "절차와 확인 사항"}
          ordered
          items={steps?.map((s) =>
            typeof s === "string" ? (
              s
            ) : (
              <>
                <strong>{s.title}</strong> · {s.desc}
              </>
            ),
          )}
          open
        />
        <GuideDetails
          title={en ? "Archived lab settings" : "기존 실험실 설정 예시"}
          items={
            item.settings || item.config?.map((c) => c.label + " · " + c.value)
          }
        />
        {(item.tip || item.caution) && (
          <p className="inst-note">{item.tip || item.caution}</p>
        )}
        {selected === "spot" && <HempStudy en={en} current="li6800" />}
        <section className="inst-method-sources">
          <h3>{en ? "Manufacturer reference" : "제조사 원문"}</h3>
          <ExternalLink href={item.url}>
            {en ? "LI-COR manual · " : "LI-COR 매뉴얼 · "}
            {item.title}
          </ExternalLink>
        </section>
        <div className="inst-links">
          <ExternalLink href="https://drive.google.com/file/d/1nrqk1GON1FsIoPysQtQOGgkiUXJOy0KG/view?usp=sharing">
            {en ? "Lab manual" : "실험실 매뉴얼"}
          </ExternalLink>
          <ExternalLink href="https://notebooklm.google.com/notebook/2cc4cefa-4bb6-405d-b83f-49d74ce5c188">
            {en ? "Guide notebook" : "가이드 노트북"}
          </ExternalLink>
        </div>
      </article>
    </div>
  );
}
export default function Li6800({ lang = "ko" }) {
  const en = lang === "en";
  const [params, setParams] = useSearchParams();
  const sections = en ? guide.en : guide.ko;
  const tab = params.get("tab") === "guide" ? "guide" : "plot";
  const selected = Object.hasOwn(sections, params.get("topic")) ? params.get("topic") : Object.keys(sections)[0];
  function updateTab(nextTab, topic = selected) {
    const next = new URLSearchParams(params);
    next.set("tab", nextTab);
    if (nextTab === "guide") next.set("topic", topic);
    setParams(next, { replace: true, preventScrollReset: true });
  }
  return (
    <InstrumentFrame
      parent={en ? "Plant physiology" : "식물 생리 측정"}
      parentPath={en ? "/physiological_en" : "/physiological"}
      title="LI-6800"
      image="/instruments/li6800.webp"
      summary={
        en
          ? "Plot light and CO₂ response measurements or consult the gas-exchange instrument guide."
          : "측정 로그로 빛과 CO₂에 대한 반응을 그려보고, 장비 설정부터 기록까지 필요한 절차를 확인하세요."
      }
    >
      <div className="inst-tabs">
        <button aria-pressed={tab === "plot"} onClick={() => updateTab("plot")}>
          {en ? "Response curves" : "반응 곡선"}
        </button>
        <button aria-pressed={tab === "guide"} onClick={() => updateTab("guide")}>
          {en ? "Instrument guide" : "장비 가이드"}
        </button>
      </div>
      <div hidden={tab !== "plot"}>
        <GasExchangePlot en={en} />
      </div>
      {tab === "guide" && <Guide en={en} selected={selected} onSelect={key => updateTab("guide", key)} />}
    </InstrumentFrame>
  );
}
