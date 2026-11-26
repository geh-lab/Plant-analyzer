import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { InstrumentFrame } from "@/components/instruments/InstrumentFrame";
export default function PhysiologicalMeasurement({ lang = "ko" }) {
  const en = lang === "en";
  return (
    <InstrumentFrame
      parent={en ? "Plant Analyzer" : "분석 홈"}
      parentPath={en ? "/mainhome_en" : "/"}
      title={en ? "Plant physiology" : "식물 생리 측정"}
      summary={
        en
          ? "Explore leaf gas exchange and chlorophyll fluorescence."
          : "잎의 가스 교환과 엽록소 형광을 측정한 장비를 선택하세요."
      }
    >
      <article className="inst-figure-card">
        <img
          src="/instruments/li6800.webp"
          alt={
            en
              ? "Greenhouse growing area"
              : "온실 재배 시설"
          }
        />
        <div>
          <p className="inst-caption">LI-COR</p>
          <h2>LI-6800</h2>
          <p className="inst-muted">
            {en
              ? "Plot measured A/Q and A/Ci response curves. The instrument guide covers chamber setup, matching and data logging."
              : "측정 로그를 불러와 A/Q와 A/Ci 반응을 비교하세요. 장비 안내에서 챔버 설정, 매칭, 데이터 기록 절차도 확인할 수 있습니다."}
          </p>
          <div className="inst-actions" style={{ marginTop: 20 }}>
            <Link className="inst-button" to={en ? "/li6800_en" : "/li6800"}>
              {en ? "Open gas exchange" : "가스 교환 분석 열기"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </article>
      <article className="inst-figure-card" style={{marginTop:20}}>
        <img src="/specimens/hemp-geh.webp" alt={en ? "Cannabis plants in the GEH Lab collection" : "GEH Lab의 헴프 식물"} />
        <div>
          <p className="inst-caption">Photon Systems Instruments</p>
          <h2>FluorPen FP100</h2>
          <p className="inst-muted">{en ? "Open an OJIP text file or a FluorPen LC or NPQ workbook to compare fluorescence traces and instrument-reported values." : "OJIP 텍스트나 LC·NPQ 엑셀을 열어 시료별 형광 곡선과 장비가 기록한 지표를 비교하세요."}</p>
          <div className="inst-actions" style={{marginTop:20}}><Link className="inst-button" to={en ? "/fp100_en" : "/fp100"}>{en ? "Open fluorescence analysis" : "형광 분석 열기"}<ArrowRight size={16}/></Link></div>
        </div>
      </article>
    </InstrumentFrame>
  );
}
