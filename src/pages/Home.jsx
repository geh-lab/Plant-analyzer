import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { pageUrl, workspaces } from "@/data/workspaces";
import "./assay.css";

const instruments = workspaces.filter(item => item.family === "instrument");
const instrumentNames = {
  analysis: ["분광광도계", "Spectrophotometer"],
  hplc: ["액체 크로마토그래프", "Liquid chromatograph"],
  kjeldahl: ["켈달 분석기", "Kjeldahl analyzer"]
};

export default function Home({ lang = "ko" }) {
  const en = lang === "en";
  const index = en ? 1 : 0;
  return (
    <section className="assay-page">
      <div className="assay-wrap">
        <nav className="assay-crumb" aria-label={en ? "Breadcrumb" : "현재 위치"}>
          <Link to={en ? "/mainhome_en" : "/"}>Plant Analyzer</Link><span aria-hidden="true">/</span>
          <span>{en ? "Instrumental analysis" : "기기 분석"}</span>
        </nav>
        <header className="assay-head">
          <h1>{en ? "Instrumental analysis" : "기기 분석"}</h1>
          <p>{en ? "Choose your instrument to browse laboratory methods and analyze sample readings." : "사용한 장비를 선택해 실험 방법을 확인하고 측정 데이터를 분석하세요."}</p>
        </header>
        <div className="assay-instruments">
          {instruments.map(({ id, image, name, description }) => (
            <Link key={id} className="assay-instrument" to={pageUrl(id, en)}>
              <div className="assay-photo"><img src={image} alt="" /></div>
              <div className="assay-instrument-body">
                <span className="assay-kicker">{instrumentNames[id][index]}</span>
                <h2>{name[index]} <ArrowUpRight size={22} aria-hidden="true" /></h2>
                <p>{description[index]}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
