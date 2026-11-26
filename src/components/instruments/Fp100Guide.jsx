import { ArrowUpRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { fpMethods } from "@/data/fp100Methods";
import { ExternalLink } from "./InstrumentFrame";
import Fp100MethodFigure from "./Fp100MethodFigure";
import "./fp100Methods.css";

const codes = { ojip:"OJIP", lc1:"LC1", lc2:"LC2", lc3:"LC3", npq1:"NPQ1", npq2:"NPQ2", ft:"Ft", qy:"QY", par:"PAR", multi:"Multi / Repeat" };

const followUp = {
  ojip: ["측정별 Ft를 로그 시간축에 겹쳐 O–J·J–I·I–P 구간을 비교하세요. 처리구 차이를 볼 때는 같은 기준 시점으로 정규화한 곡선과 Fv/Fm을 함께 확인합니다.", "Overlay individual Ft traces on a logarithmic time axis to compare O–J, J–I and I–P. Compare groups using the same normalization landmarks and examine Fv/Fm alongside the curves."],
  lc: ["가로축에 광량(PPFD), 세로축에 단계별 QY를 놓아 광반응 곡선을 그립니다. 처리구 간에는 조사 시간과 광량이 같은 단계끼리 비교하세요.", "Plot the yield at each step against PPFD. Compare treatments at matched irradiance and step duration."],
  npq: ["시간축에 NPQ와 유효 QY를 각각 그리고, 작용광을 켰을 때의 소광 유도와 끈 뒤의 회복을 구분해 비교하세요.", "Plot NPQ and effective QY against time. Compare quenching induction during illumination and relaxation after the actinic light is switched off."],
  ft: ["같은 측정광과 잎의 광적응 조건에서 얻은 Ft끼리 비교하고, 측정 시각과 잎 위치를 함께 기록하세요.", "Compare Ft readings under matched measuring light and leaf adaptation. Keep acquisition time and leaf position with the readings."],
  qy: ["암적응 Fv/Fm과 광적응 유효 QY는 따로 요약합니다. 처리구별로 같은 광조건에 있는 잎들의 분포를 비교하세요.", "Summarize dark-adapted Fv/Fm and light-adapted effective QY separately. Compare distributions from leaves measured under matched conditions."],
  par: ["측정 시각·위치의 PPFD를 잎 형광 기록과 연결해 처리구가 실제로 받은 광조건을 비교하세요.", "Match PPFD readings to fluorescence records by time and sampling position to compare the light actually received at each site."],
  multi: ["회차별 측정 시각을 보존해 시간에 따른 변화를 그리세요. 같은 잎에서 연속 측정한 값은 하나의 시계열로 묶습니다.", "Keep the acquisition times and plot the sequence. Treat repeated measurements on the same leaf as one time series."],
};

const supportingPages = {
  qy: [5, 28, 30],
  par: [5],
  multi: [13],
};

function ManualPage({ page, children }) {
  return (
    <a className="fp-method-source" href={"/protocols/fluorpen-fp100-manual.pdf#page=" + page}
      target="_blank" rel="noreferrer">
      {children}<ArrowUpRight size={13} aria-hidden="true"/>
    </a>
  );
}

function OjipStudy({ en }) {
  const t = (ko, english) => en ? english : ko;
  return <section className="fp-study-protocol">
      <h3>
        {t("엽록소 a 형광 유도 측정", "Chlorophyll a fluorescence induction")}
      </h3>
      <p>
        {t(
          "암적응한 잎에 강한 빛을 비추면 형광이 O에서 J, I를 거쳐 P까지 변합니다. FP100은 이 짧은 신호를 기록합니다. JIP 지표는 광계 II의 에너지 이용을 형광값에서 추정합니다.",
          "The FP100 records the rapid rise of chlorophyll fluorescence in a dark-adapted leaf under intense light. The O, J, I and P steps describe this transient. JIP parameters estimate PSII energy use from fluorescence.",
        )}
      </p>
      <h3>
        {t(
          "헴프 삽수 연구의 측정 순서",
          "Measurement in the cannabis cutting study",
        )}
      </h3>
      <ol>
        <li>
          {t(
            "정식 2주 후 처리당 삽수 6개에서 LI-6800 가스 교환에 사용한 같은 잎을 측정했습니다. 잎은 완전히 전개되었고 소엽이 5개 이상이었습니다.",
            "At two weeks after transplanting, the authors measured the same leaves used for gas exchange on six cuttings per treatment. These were fully expanded leaves with at least five leaflets.",
          )}
        </li>
        <li>
          {t(
            "잎 클립으로 30분 이상 암적응한 뒤 3,000 µmol photons m⁻² s⁻¹의 포화광을 조사했습니다.",
            "Leaves were dark-adapted in clips for at least 30 minutes before exposure to saturating light at 3,000 µmol photons m⁻² s⁻¹.",
          )}
        </li>
        <li>
          {t(
            "FluorPen 소프트웨어 1.0.5.1에서 시간별 형광을 추출했습니다. 연구 본문의 O, K, J, I는 각각 0.02, 0.3, 2, 30 ms이며 P는 측정된 최고 형광 Fm입니다.",
            "The authors extracted time-resolved fluorescence with FluorPen software 1.0.5.1. Their O, K, J and I times were 0.02, 0.3, 2 and 30 ms. P is the observed maximum, Fm.",
          )}
        </li>
      </ol>
      <details className="inst-details" open>
        <summary>
          {t("어떤 시간 기준을 선택할까요?", "Which landmark settings apply?")}
        </summary>
        <p>
          {t(
            "첨부 논문을 재현할 때는 ‘헴프 논문’을 선택하세요. FP 100 시리즈 설명서 §8.D는 O = 0.05 ms, I = 60 ms를 사용합니다. 장비 내보내기 설정을 확인한 후 일치하는 기준을 선택하세요. 두 설정 모두 보충표 S1의 Mo에 필요한 0.05 ms 실측값을 사용합니다.",
            "Select the cannabis study settings to reproduce the paper. The FP 100 series manual (§8.D) instead lists O at 0.05 ms and I at 60 ms. Match your acquisition settings to the correct landmarks. Both presets use the observed 0.05 ms signal for Mo as specified in Supplementary Table S1.",
          )}
        </p>
      </details>
      <details className="inst-details">
        <summary>
          {t("곡선과 정량 지표 계산식", "Curve and parameter equations")}
        </summary>
        <p>
          {t(
            "각 잎의 구간 A–B에서 WAB(t) = (Ft − FA)/(FB − FA). 같은 시각에서 처리구 평균 W에서 대조구 평균 W를 빼면 ΔW입니다. O–K는 L-band, O–J는 K-band 비교에 쓰입니다.",
            "Within an A–B interval, WAB(t) = (Ft − FA)/(FB − FA) for each leaf. ΔW subtracts the control mean W from the treatment mean W at the same observed time. The O–K and O–J comparisons resolve the L- and K-bands respectively.",
          )}
        </p>
        <ul>
          <li>
            Fv/Fm = ΦPo = (Fm − Fo)/Fm · VJ = (FJ − Fo)/(Fm − Fo) · VI = (FI −
            Fo)/(Fm − Fo)
          </li>
          <li>
            Mo = 4(F₃₀₀µs − F₅₀µs)/(Fm − F₅₀µs) · ΨEo = 1 − VJ · ΦEo = ΦPo × ΨEo
            · ΦDo = 1 − ΦPo
          </li>
          <li>δRo = (1 − VI)/(1 − VJ) · ΦRo = ΦPo × ΨEo × δRo</li>
          <li>
            TRo/RC = Mo/VJ · ABS/RC = (TRo/RC)/ΦPo · ETo/RC = (TRo/RC) × ΨEo ·
            DIo/RC = ABS/RC − TRo/RC · REo/RC = (ETo/RC) × δRo
          </li>
          <li>RC/CSm = ΦPo × (VJ/Mo) × Fm · X/CSm = (X/RC) × (RC/CSm)</li>
        </ul>
        <p>
          {t(
            "RC는 활성 반응 중심, CSm은 최대 형광을 기준으로 한 여기 단면입니다. 단면당 지표는 신호 스케일과 측정 설정에 따라 달라지는 상대값입니다.",
            "RC denotes an active reaction centre. CSm denotes the excited cross-section at maximum fluorescence. Per-CSm estimates depend on the signal scale and acquisition settings.",
          )}
        </p>
      </details>
  </section>;
}

export default function Fp100Guide({ en }) {
  const [params, setParams] = useSearchParams();
  const methods = fpMethods(en ? "en" : "ko");
  const selected = methods.find(method => method.id === params.get("method")) || methods[0];
  const family = selected.id.replace(/\d+$/, "");
  function selectMethod(id) {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      next.set("view", "guide");
      next.set("method", id);
      return next;
    }, { replace:true, preventScrollReset:true });
  }
  return <section className="inst-panel fp-guide">
    <p className="inst-caption">Photon Systems Instruments · FluorPen FP100</p>
    <h2>{en ? "FP100 measurement methods" : "FP100 측정 방법"}</h2>
    <p className="fp-model-scope">
      {en
        ? "OJIP, NPQ and LC require an FP 100-MAX, PAR-FP 100-MAX-LM, or a protocol-updated FP 100-B/U/S. The menu illustration lists LC1 and LC2. Check whether your unit offers LC3, which the manual describes on p. 30."
        : "OJIP·NPQ·LC는 FP 100-MAX, PAR-FP 100-MAX-LM 또는 프로토콜을 업데이트한 FP 100-B/U/S에서 지원합니다. 매뉴얼의 메뉴 그림에는 LC1·LC2가, 30쪽에는 LC3도 실려 있습니다. 사용 기기의 메뉴에서 LC3 지원 여부를 확인하세요."}{" "}
      <ManualPage page={5}>{en ? "Model support · p. 5" : "지원 모델 · 5쪽"}</ManualPage>
    </p>
    <div className="fp-method-picker" role="group" aria-label={en ? "Measurement method" : "측정 방법 선택"}>
      {methods.map(method => <button key={method.id} type="button" aria-pressed={method.id === selected.id}
        onClick={() => selectMethod(method.id)}>{codes[method.id]}</button>)}
    </div>
    <div className="fp-method-sheet">
      <div>
        <h3 className="fp-method-title">{selected.title}</h3>
        <p className="fp-method-principle">{selected.principle}</p>
        <Fp100MethodFigure key={selected.id} method={selected} en={en}/>
        <div className="fp-method-sources" aria-label={en ? "Manual pages" : "매뉴얼 해당 쪽"}>
          {[selected.page, ...(supportingPages[selected.id] || [])].map(page =>
            <ManualPage key={page} page={page}>{en ? "FluorPen manual" : "FluorPen 매뉴얼"} · p. {page}</ManualPage>
          )}
        </div>
      </div>
      <div>
        <h4 className="fp-method-heading">{en ? "Measurement steps" : "측정 순서"}</h4>
        <ol>{selected.steps.map(step=><li key={step}>{step}</li>)}</ol>
        <div className="fp-method-output">
          <h4 className="fp-method-heading">{en ? "Readouts and interpretation" : "결과와 해석"}</h4>
          <ul>{selected.outputs.map(item=><li key={item}>{item}</li>)}</ul>
        </div>
        <p className="fp-method-next"><strong>{en ? "Further analysis" : "후속 분석"}</strong> {followUp[family][Number(en)]}</p>
      </div>
    </div>
    {selected.id === "ojip" && <OjipStudy en={en}/>}
      <div className="inst-links">
        <ExternalLink href="https://fs.kswe.ch/bio/wp-content/uploads/sites/10/2020/05/FluorPen_Manual.pdf">
          PSI · FP 100 Series Operation Manual, §8.C–D
        </ExternalLink>
      </div>
  </section>;
}
