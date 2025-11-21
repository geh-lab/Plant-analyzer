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

    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
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