import HempStudy from "@/components/instruments/HempStudy";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { getHplcProtocolEntries, hplcCompoundLabel, resolveHplcType } from "@/data/hplcProtocols";
import {
  InstrumentFrame,
  GuideDetails,
  ExternalLink,
} from "@/components/instruments/InstrumentFrame";

export default function HPLC({ lang = "ko" }) {
  const en = lang === "en";
  const [params, setParams] = useSearchParams();
  const methods = getHplcProtocolEntries(lang);
  const selected =
    methods.find(
      (item) => item.key === resolveHplcType(params.get("selected")),
    ) || methods[0];
  const select = (key) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set("selected", key);
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  return (
    <InstrumentFrame
      parent={en ? "Instrumental analysis" : "기기 분석"}
      parentPath={en ? "/home_en" : "/home"}
      title={en ? "HPLC protocols" : "HPLC 분석 프로토콜"}
      image="/instruments/hplc.webp"
      summary={
        en
          ? "Choose a compound family, review the method and quantify chromatographic peaks against your standards."
          : "대상 화합물에 맞는 분석 조건을 확인하고 표준물질의 머무름 시간과 피크 면적으로 시료를 정량하세요."
      }
    >
      <div className="inst-grid">
        <aside className="inst-side">
          <h2>{en ? "Analyte family" : "분석 대상"}</h2>
          {methods.map((m) => (
            <button
              key={m.key}
              aria-pressed={selected.key === m.key}
              onClick={() => select(m.key)}
            >
              {m.title}
              <ChevronRight size={16} />
            </button>
          ))}
        </aside>
        <article key={selected.key} className="inst-panel">
          <div className="inst-caption">{selected.badge}</div>
          <h2>{selected.title}</h2>
          <p className="inst-muted">{selected.overview}</p>
          <div className="inst-actions">
            <Link
              className="inst-button"
              to={`/hplc_results${en ? "_en" : ""}?analysis_type=${selected.key}`}
            >
              {en ? "Open quantification" : "정량 분석 열기"}
              <ArrowRight size={16} />
            </Link>
          </div>
          <h3>{en ? "Target compounds" : "대상 화합물"}</h3>
          <div className="inst-chips">
            {selected.compounds.map((c) => (
              <span key={c} title={c}>{hplcCompoundLabel(c, lang)}</span>
            ))}
          </div>
          <p className="inst-note">
            <strong>{en ? "Sample matrix" : "시료 기준"}</strong> ·{" "}
            {selected.matrix}
          </p>
          <GuideDetails
            title={en ? "Sample preparation" : "시료 준비"}
            items={selected.samplePrep}
            ordered
            open
          />
          <GuideDetails
            title={en ? "Chromatographic conditions" : "분리·검출 조건"}
            items={selected.chromatographic}
          />
          <GuideDetails
            title={en ? "Quantification formula" : "정량 계산식"}
            items={selected.calculation}
          />
          <GuideDetails
            title={en ? "Storage" : "보관 방법"}
            items={selected.storage}
          />
          <GuideDetails
            title={en ? "Method notes" : "분석 시 유의점"}
            items={selected.notes}
          />
          <GuideDetails
            title={en ? "Earlier project settings" : "기존 프로젝트 설정 비교"}
            items={selected.archiveNotes}
          />
          {selected.key === "cannabinoid" && <HempStudy en={en} />}
          <section className="inst-method-sources">
            <h3>{en ? "Method references" : "시험법 근거"}</h3>
            <ul>
              {selected.sources.map((ref) => (
                <li key={ref.url}>
                  <ExternalLink href={ref.url}>{ref.name}</ExternalLink>
                  <p>{ref.scope}</p>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </div>
    </InstrumentFrame>
  );
}
