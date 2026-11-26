import { lazy, Suspense } from "react";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./Layout";
import MainHome from "./MainHome";
import { pageUrl } from "@/data/workspaces";

const routes = {
  analysis: [lazy(() => import("./Analysis")), lazy(() => import("./Analysis_en"))],
  results: [lazy(() => import("./Results")), lazy(() => import("./Results_en"))],
  home: [lazy(() => import("./Home")), lazy(() => import("./Home_en"))],
  hplc: [lazy(() => import("./HPLC")), lazy(() => import("./HPLC_en"))],
  hplc_results: [lazy(() => import("./HPLC_Results")), lazy(() => import("./HPLC_Results_en"))],
  kjeldahl: [lazy(() => import("./Kjeldahl")), lazy(() => import("./Kjeldahl_en"))],
  physiological: [lazy(() => import("./PhysiologicalMeasurement")), lazy(() => import("./PhysiologicalMeasurement_en"))],
  fp100: [lazy(() => import("./Fp100")), lazy(() => import("./Fp100_en"))],
  li6800: [lazy(() => import("./Li6800")), lazy(() => import("./Li6800_en"))]
};

function PagesContent() {
  const location = useLocation();
  const path = location.pathname.replace(/^\/|\/$/g, "").toLowerCase();
  const english = path.endsWith("_en");
  const page = path.replace(/_en$/, "") || "mainhome";

  return (
    <Layout page={page} english={english}>
      <Suspense fallback={<div className="route-loading" role="status">{english ? "Loading analysis…" : "분석 화면을 불러오는 중…"}</div>}>
        <Routes>
          <Route path="/" element={<MainHome/>}/>
          <Route path="/mainhome" element={<MainHome/>}/>
          <Route path="/mainhome_en" element={<MainHome english/>}/>
          {Object.entries(routes).flatMap(([name, pages]) => pages.map((Page, index) => (
            <Route key={name + index} path={pageUrl(name, Boolean(index))} element={<Page/>}/>
          )))}
          <Route path="*" element={<div className="route-loading"><h1>{english ? "Page unavailable" : "페이지를 찾을 수 없습니다"}</h1><Link to={pageUrl("mainhome", english)}>{english ? "Back to workspace" : "워크스페이스로 돌아가기"}</Link></div>}/>
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default function Pages() {
  return <BrowserRouter><PagesContent/></BrowserRouter>;
}
