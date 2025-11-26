import Layout from "./Layout.jsx";

import Analysis from "./Analysis";

import Results from "./Results";

import Home from "./Home";

import HPLC from "./HPLC";

import HPLC_Results from "./HPLC_Results";

import Kjeldahl from "./Kjeldahl";

import MainHome from "./MainHome";

import PhysiologicalMeasurement from "./PhysiologicalMeasurement";

import Li6800 from "./Li6800";  

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    Analysis: Analysis,
    
    Results: Results,
    
    Home: Home,
    
    HPLC: HPLC,
    
    HPLC_Results: HPLC_Results,

    Kjeldahl: Kjeldahl,

    Physiological: PhysiologicalMeasurement,

    Li6800: Li6800,

    // [추가] MainHome도 PAGES 목록에 명시적으로 추가해두는 것이 안전합니다.
    MainHome: MainHome,
}

function _getCurrentPage(url) {
    // ✨ [핵심 수정] 루트 경로('/')이거나 비어있을 때 'MainHome'을 반환하도록 강제 설정
    if (url === '/' || url === '') {
        return 'MainHome';
    }

    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    // 대소문자 구분 없이 찾기
    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    
    // 페이지를 못 찾으면 기본값으로 첫 번째 페이지를 반환하는데, 
    // 루트 경로 처리를 위에서 했으므로 이제 안전합니다.
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                <Route path="/" element={<MainHome />} />
                
                <Route path="/Analysis" element={<Analysis />} />
                
                <Route path="/Results" element={<Results />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/HPLC" element={<HPLC />} />
                
                <Route path="/HPLC_Results" element={<HPLC_Results />} />

                <Route path="/Kjeldahl" element={<Kjeldahl />} />

                <Route path="/Physiological" element={<PhysiologicalMeasurement />} />

                <Route path="/Li6800" element={<Li6800 />} />

            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}