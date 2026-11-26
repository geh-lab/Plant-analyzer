import GuideVideo from "@/components/instruments/GuideVideo";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  InstrumentFrame,
  ExternalLink,
  GuideDetails,
} from "@/components/instruments/InstrumentFrame";
import methods from "@/data/kjeldahlGuide.json";
import { kjeldahlNitrogen } from "@/utils/instrumentData";

function Titration({ en }) {
  const [v, setValues] = useState({
    sample: "",
    blank: "",
    normality: "0.05",
    mass: "0.1",
  });
  const value = kjeldahlNitrogen(v);
  const invalid = Object.values(v).every((x) => x !== "") && value === null;
  const fields = [
    ["sample", en ? "Sample titration (mL)" : "시료 적정량 (mL)"],
    ["blank", en ? "Blank titration (mL)" : "공시험 적정량 (mL)"],
    ["normality", en ? "Acid normality (N)" : "산의 노르말 농도 (N)"],
    ["mass", en ? "Dry sample mass (g)" : "건조 시료 무게 (g)"],
  ];
  return (
    <article className="inst-panel">
      <h2>{en ? "Kjeldahl nitrogen calculator" : "켈달 질소 함량 계산"}</h2>
      <p className="inst-muted">
        {en
          ? "Use the acid volume at the endpoint for the entire distillate collected in boric acid. Enter the blank from the same batch."
          : "붕산에 포집한 전체 증류액을 산으로 직접 적정했을 때 적용합니다. 같은 배치에서 측정한 공시험 적정량을 입력하세요."}
      </p>
      <p className="inst-note">
        {en
          ? "Use the acid normality in equivalents/L. For H₂SO₄, 0.025 mol/L corresponds to 0.05 N for this neutralization. Ordinary digestion measures Kjeldahl nitrogen; quantitative recovery of nitrate and nitrite requires a suitable pretreatment."
          : "산 농도는 당량/L(N)로 입력합니다. 이 중화 반응에서 H₂SO₄ 0.025 mol/L는 0.05 N입니다. 일반 켈달법에서 질산태·아질산태 질소를 정량적으로 회수하려면 별도 전처리가 필요합니다."}
      </p>
      <div className="inst-labels">
        {fields.map(([key, label]) => (
          <label key={key} className="inst-field">
            {label}
            <input
              type="number"
              step="any"
              min="0"
              value={v[key]}
              onChange={(e) => setValues({ ...v, [key]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <div className="inst-readout" aria-live="polite">
        <strong>
          {value === null
            ? "—"
            : value.toLocaleString(en ? "en" : "ko", {
                maximumFractionDigits: 4,
              })}
          %
        </strong>
        <span>
          {en
            ? "Kjeldahl nitrogen, dry mass basis"
            : "건물 무게 기준 켈달 질소"}
        </span>
      </div>
      {invalid && (
        <p role="alert" className="inst-req">
          {en
            ? "Mass and normality must be positive. The blank must be between zero and the sample volume."
            : "시료 무게와 농도는 양수여야 합니다. 공시험 적정량은 0 이상, 시료 적정량 이하여야 합니다."}
        </p>
      )}
      <p className="inst-note">
        N (%) = (V<sub>sample</sub> − V<sub>blank</sub>) × N<sub>acid</sub> ×
        1.4007 / m<sub>sample</sub>
      </p>
      <ExternalLink href="https://www.labconco.com/download/open-kjeldahl-apparatus-manual/456">
        {en
          ? "Labconco · dry sample equation (§8)"
          : "Labconco · 건조 시료 계산식 (§8)"}
      </ExternalLink>
    </article>
  );
}

export default function Kjeldahl({ lang = "ko" }) {
  const en = lang === "en",
    data = methods[lang];
  const [selection, setSelection] = useState("calculator");
  const method = data[selection];
  const images = en
    ? (method?.visual || []).map((name, i) => ({
        image: name,
        title: method.title + " · " + (i + 1),
      }))
    : method?.visualSteps;
  return (
    <InstrumentFrame
      parent={en ? "Instrumental analysis" : "기기 분석"}
      parentPath={en ? "/home_en" : "/home"}
      title={en ? "Kjeldahl nitrogen" : "켈달 질소 분석"}
      image="/instruments/kjeldahl.webp"
      summary={
        en
          ? "Calculate nitrogen as a percentage of dry sample mass and review the lab’s digestion, distillation and titration guide."
          : "적정량으로 건조 시료의 질소 함량을 계산하고 분해·증류·적정 단계별 실험실 가이드를 확인하세요."
      }
    >
      <div className="inst-grid">
        <aside className="inst-side">
          <h2>{en ? "Worksheet and guide" : "계산 및 실험 가이드"}</h2>
          {[
            ["calculator", en ? "Titration calculator" : "적정량 계산기"],
            ...Object.entries(data).map(([key, d]) => [key, d.title]),
          ].map(([key, title]) => (
            <button
              key={key}
              aria-pressed={selection === key}
              onClick={() => setSelection(key)}
            >
              {title}
              <ChevronRight size={14} />
            </button>
          ))}
        </aside>
        <div>
          <div hidden={selection !== "calculator"}>
            <Titration en={en} />
          </div>
          {method && (
            <article key={selection} className="inst-panel">
              <div className="inst-caption">{method.subtitle}</div>
              <p className="inst-note">
                {en
                  ? "Archived lab demonstration. Temperature, times, volumes and indicator colour are specific to the equipment, catalyst and matrix. Follow the validated settings for the experiment."
                  : "기존 실험실 장비로 촬영한 예시입니다. 온도·시간·부피·지시약 색은 장비, 촉매와 시료에 따라 달라지므로 해당 실험의 검증된 조건을 적용하세요."}
              </p>
              <h2>{method.title}</h2>
              <GuideVideo id={methods.ko[selection].videoId} title={method.title} english={en} />
              <div className="inst-chips">
                {method.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <GuideDetails
                title={en ? "Procedure" : "실험 절차"}
                ordered
                items={method.protocol}
                open
              />
              <GuideDetails
                title={en ? "Lab settings" : "실험실 설정값"}
                items={method.settings || method.configurations}
              />
              <GuideDetails
                title={en ? "Lab notes" : "실험 시 유의점"}
                items={method.notes}
              />
              <details className="inst-details">
                <summary>
                  {en ? "Step photographs" : "단계별 실험 사진"}
                </summary>
                <div className="inst-photos">
                  {images.map((item) => (
                    <figure key={item.image}>
                      <img
                        loading="lazy"
                        src={
                          "/instruments/" +
                          item.image.replace(/\.png$/, ".webp")
                        }
                        alt={item.title}
                      />
                      <figcaption>
                        <strong>{item.title}</strong>
                        {item.text && " · " + item.text}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </details>
            </article>
          )}
          <div className="inst-method-sources">
            <h3>{en ? "Method references" : "시험법 근거"}</h3>
            <ul>
              <li>
                <ExternalLink href="https://www.labconco.com/download/a-guide-to-kjeldahl-nitrogen-determination-metho/179">
                  {en
                    ? "Labconco · digestion, distillation and nitrogen recovery"
                    : "Labconco · 분해·증류 및 질소 회수 범위"}
                </ExternalLink>
              </li>
              <li>
                <ExternalLink href="https://www.labconco.com/download/open-kjeldahl-apparatus-manual/456">
                  {en
                    ? "Labconco open apparatus · boric acid titration and dry-sample equation (§§7–8)"
                    : "Labconco 개방형 장치 · 붕산 포집 적정 및 건조시료 계산식 (§§7–8)"}
                </ExternalLink>
              </li>
            </ul>
          </div>
          <details className="inst-details inst-section">
            <summary>
              {en ? "Reagents and handling" : "시약과 취급 방법"}
            </summary>
            <p className="inst-muted">
              {en
                ? "The lab method uses sulfuric acid and catalyst for digestion, sodium hydroxide for distillation, and boric acid with indicator for collection. Use the fume hood and protective equipment specified in your laboratory procedure when handling corrosives or hot glassware."
                : "분해에는 황산과 촉매, 증류에는 수산화나트륨, 포집에는 지시약이 든 붕산 용액을 사용합니다. 부식성 시약과 가열한 유리 기구는 실험실 절차에 지정된 후드와 보호구를 사용해 취급하세요."}
            </p>
          </details>
        </div>
      </div>
    </InstrumentFrame>
  );
}
