// -----------------------------------------------------------------------------
// 📦 Imports
// -----------------------------------------------------------------------------
import React, { useEffect, useState } from "react"; // 🟢 useState 추가
import { Link, useLocation } from "react-router-dom";
import { TestTube, FlaskConical, Home, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl, PAGE_TITLES } from "@/utils";


// -----------------------------------------------------------------------------
// 🧩 Layout Component
// -----------------------------------------------------------------------------
export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false); // 🟢 스크롤 상태 관리

  // ---------------------------------------------------------------------------
  // 📜 Scroll Detection Logic (스크롤 감지)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleScroll = () => {
      // 스크롤이 10px 이상 내려가면 true 설정
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  // ---------------------------------------------------------------------------
  // 🏷️ Document Title Controller
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const targetTitle = PAGE_TITLES
      ? PAGE_TITLES[currentPageName]
      : null;

    if (location.pathname === "/" || currentPageName === "MainHome") {
      document.title = "Plant Analyzer";
    } else if (targetTitle) {
      document.title = targetTitle;
    } else {
      document.title = "Plant Analyzer";
    }
  }, [currentPageName, location.pathname]);


  // ---------------------------------------------------------------------------
  // 🖥️ Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen text-white bg-gray-900"> {/* 배경색 임시 지정 (필요 시 수정) */}

      {/* --------------------------------------------------------------------- */}
      {/* 🎨 Global Style (Font + Glass Button) */}
      {/* --------------------------------------------------------------------- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@400;500;600;700&display=swap');

        * {
          font-family: 'SF Pro Display',
            -apple-system,
            BlinkMacSystemFont,
            'Segoe UI',
            Roboto,
            sans-serif;
        }

        /* Glass Button Style */
        .glass-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          color: #9ca3af;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-button:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
        }

        .glass-button.active {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(59, 130, 246, 0.5);
          color: white;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }
      `}</style>


      {/* --------------------------------------------------------------------- */}
      {/* 🧭 Header (스크롤 시 스타일 변경) */}
      {/* --------------------------------------------------------------------- */}
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        
        {/* 🟢 [핵심] 조건부 스타일링 
            - transition-all duration-300: 부드러운 전환 효과
            - isScrolled가 true일 때: 배경색/블러/테두리 추가, 패딩 축소
            - isScrolled가 false일 때: 투명 그라데이션, 패딩 넉넉히
        */}
        <div 
          className={`w-full pointer-events-auto transition-all duration-300 ease-in-out ${
            isScrolled 
              ? "bg-black/40 backdrop-blur-md border-b border-white/10 shadow-lg py-3" 
              : "bg-gradient-to-b from-black/50 to-transparent py-6"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">

              {/* --------------------------------------------------------------- */}
              {/* 🧪 Logo */}
              {/* --------------------------------------------------------------- */}
              <Link
                to="/"
                className="flex items-center space-x-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  <FlaskConical className="h-5 w-5 text-green-300 group-hover:text-green-200 transition-colors" />
                </div>

                <span className="text-xl font-bold text-white tracking-tight group-hover:text-green-300 transition-colors drop-shadow-md">
                  Plant Analyzer
                </span>
              </Link>


              {/* --------------------------------------------------------------- */}
              {/* 🧭 Navigation */}
              {/* --------------------------------------------------------------- */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-3">

                  <Link
                    to="/"
                    className={`glass-button ${location.pathname === "/" ? "active" : ""}`}
                    title="홈"
                  >
                    <Home className="h-5 w-5" />
                  </Link>

                  <Link
                    to={createPageUrl("Home")}
                    className={`glass-button ${location.pathname.toLowerCase().startsWith("/home") ? "active" : ""}`}
                    title="기기 분석"
                  >
                    <TestTube className="h-5 w-5" />
                  </Link>

                  <Link
                    to={createPageUrl("Physiological")}
                    className={`glass-button ${location.pathname.toLowerCase().startsWith("/physiological") ? "active" : ""}`}
                    title="생리 계측"
                  >
                    <Leaf className="h-5 w-5" />
                  </Link>

                </div>
              </div>

            </div>
          </div>
        </div>
      </header>


      {/* --------------------------------------------------------------------- */}
      {/* 📄 Main Content */}
      {/* --------------------------------------------------------------------- */}
      <main className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}