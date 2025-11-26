import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { TestTube, FlaskConical, Home, Leaf, ActivitySquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// 👇 PAGE_TITLES를 import 해야 제목을 가져올 수 있습니다.
import { createPageUrl, PAGE_TITLES } from "@/utils"; 

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  // 🟢 [핵심 수정] 페이지가 바뀔 때마다 브라우저 탭 제목을 변경하는 코드
  useEffect(() => {
    // 1. utils에서 현재 페이지 이름에 맞는 제목을 가져옴
    const targetTitle = PAGE_TITLES ? PAGE_TITLES[currentPageName] : null;

    // 2. 제목 설정
    if (location.pathname === '/' || currentPageName === 'MainHome') {
      // 메인 홈일 경우 무조건 "Plant Analyzer"
      document.title = "Plant Analyzer";
    } else if (targetTitle) {
      // 다른 페이지는 매핑된 제목 사용 (예: Instrumental Analysis)
      document.title = targetTitle;
    } else {
      // 매핑된게 없으면 기본값
      document.title = "Plant Analyzer";
    }
  }, [currentPageName, location.pathname]);


  // 현재 페이지 상태 확인
  const isHomePage = location.pathname === "/";
  // ... (기존 변수들 유지)

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .ios-blur {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        
        .ios-shadow {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 20px rgba(0, 0, 0, 0.03);
        }
        
        .ios-button {
          background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
          border: none;
          border-radius: 12px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        
        /* Navigation buttons */
        .nav-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.05);
          color: #6B7280;
          transition: all 0.3s ease;
        }
        
        .nav-button:hover {
          background: rgba(0, 122, 255, 0.1);
          color: #007AFF;
        }
        
        .nav-button.active {
          background: #007AFF;
          color: white;
        }
      `}</style>

      <header className="relative z-10">
        <div className="bg-white/80 backdrop-blur-lg ios-shadow border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link 
                to="/" 
                className="flex items-center space-x-3 group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FlaskConical className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Plant Analyzer
                </span>
              </Link>
              
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2">

                  <Link
                    to="/"
                    className={`nav-button ${location.pathname === "/" ? "active" : ""}`}
                    title="홈"
                  >
                    <Home className="h-4 w-4" />
                  </Link>

                  <Link
                    to={createPageUrl("Home")}
                    className={`nav-button ${location.pathname.toLowerCase().startsWith("/home") ? "active" : ""}`}
                    title="기기 분석"
                  >
                    <TestTube className="h-4 w-4" />
                  </Link>

                  <Link
                    to={createPageUrl("Physiological")}
                    className={`nav-button ${location.pathname.toLowerCase().startsWith("/physiological") ? "active" : ""}`}
                    title="생리 계측"
                  >
                    <Leaf className="h-4 w-4" />
                  </Link>

                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}