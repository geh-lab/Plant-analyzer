import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FlaskConical, ArrowRight, ArrowLeft, Beaker, CheckCircle2, Play, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils"; 

// --- [Reusable Glass Components] ---
const GlassCard = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const hplcAnalysisTypes = {
  // ... (기존 데이터 유지)
  phenol: {
    title: "페놀 화합물",
    subtitle: "Phenolic Compounds",
    compounds: [
      "Arbutin", "Gallic acid", "Catechin hydrate", "4-Hydroxybenzoic acid", 
      "Chlorogenic acid", "Caffeic acid", "(-)-Epicatechin", "4-Hydroxy-3-benzoic acid",
      "p-Coumaric acid", "trans-Ferulic acid", "Benzoic acid", "Rutin",
      "trans-Cinnamic acid", "Quercetin", "Kaempferol"
    ],
    icon: <FlaskConical className="h-5 w-5" />
  },
  glucosinolate: {
    title: "글루코시놀레이트",
    subtitle: "Glucosinolates",
    compounds: [
      "Progoitrin", "Sinigrin", "Glucoalyssin", "Gluconapoleiferin",
      "Gluconapin", "4-Hydroxyglucobrassicin", "Glucobrassicanapin", "Glucoerucin",
      "Glucobrassicin", "4-Methoxyglucobrassicin", "Gluconasturtiin", "Neoglucobrassicin"
    ],
    icon: <Beaker className="h-5 w-5" />
  },
  acacetin: {
    title: "아카세틴",
    subtitle: "Acacetin",
    compounds: ["Acacetin", "Acacetin-7-O-glucoside"],
    icon: <FlaskConical className="h-5 w-5" />
  },
  rosmarinic_acid: {
    title: "로즈마린산",
    subtitle: "Rosmarinic Acid",
    compounds: ["Rosmarinic acid", "Caffeic acid", "Salvianolic acid B"],
    icon: <FlaskConical className="h-5 w-5" />
  },
  tilianin: {
    title: "틸리아닌",
    subtitle: "Tilianin",
    compounds: ["Tilianin", "Acacetin-7-O-rutinoside"],
    icon: <FlaskConical className="h-5 w-5" />
  }
};

export default function HPLC() {
  const [selectedAnalysis, setSelectedAnalysis] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // --------------------------------------------------------------------------------
  // 🖼️ [추가됨] 이미지 경로 헬퍼 함수
  // --------------------------------------------------------------------------------
  // 설명: 현재 파일 위치 기준 상위폴더(../)의 images 폴더 안의 파일을 찾습니다.
  const img = (file) => {
    try {
      return new URL(`../images/${file}`, import.meta.url).href;
    } catch (e) {
      return `/images/${file}`;
    }
  };

  // URL 파라미터에서 선택된 분석 타입 확인
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selected = params.get("selected");
    if (selected && hplcAnalysisTypes[selected]) {
      setSelectedAnalysis(selected);
    } else {
      setSelectedAnalysis("");
    }
  }, [location.search]);

  const handleAnalyzeClick = () => {
    if (selectedAnalysis) {
      const targetPath = typeof createPageUrl === 'function' ? createPageUrl("HPLC_Results") : "/hplc-results";
      navigate(`${targetPath}?analysis_type=${selectedAnalysis}`);
    }
  };

  const handleBack = () => {
    navigate('/home'); 
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900 text-gray-100 font-sans">
        
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 w-full h-full">
         {/* [수정됨] 헬퍼 함수를 사용하여 로컬 이미지 불러오기 */}
         {/* 주의: 'hplc_background.jpg' 부분을 실제 파일명으로 변경해주세요. */}
         <img 
            src={img("hplc_background.jpg")} 
            alt="Lab Background"
            className="w-full h-full object-cover opacity-20"
            
         />
         
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-12 space-y-8">
        
        {/* Back Navigation */}
        <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleBack} 
            className="flex items-center text-gray-400 hover:text-white transition-colors group"
        >
            <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 mr-3">
                 <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">돌아가기</span>
        </motion.button>

        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 drop-shadow-lg">
             HPLC 분석 프로토콜 선택
          </h1>
          <p className="text-sm sm:text-base text-gray-300">
             RT 기준을 입력하고 정량 분석을 수행할 항목을 선택하세요.
          </p>
        </motion.div>

        {/* Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {Object.entries(hplcAnalysisTypes).map(([key, analysis]) => (
              <button
                key={key}
                onClick={() => setSelectedAnalysis(key)}
                className={`p-4 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden group flex flex-col items-start gap-2 ${
                  selectedAnalysis === key
                    ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${selectedAnalysis === key ? 'bg-blue-500/20 text-blue-300' : 'bg-white/10 text-gray-400'}`}>
                    {React.cloneElement(analysis.icon, { className: "h-5 w-5" })}
                </div>
                <div>
                    <h3 className={`font-bold text-sm leading-tight ${selectedAnalysis === key ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                        {analysis.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{analysis.subtitle}</p>
                </div>
                
                {/* Visual Indicator for Selection */}
                {selectedAnalysis === key && (
                    <div className="absolute inset-0 bg-blue-500/5 z-0 animate-pulse"></div>
                )}
              </button>
            ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedAnalysis && (
            <motion.div
              key={selectedAnalysis}
              className="space-y-6 sm:space-y-8"
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <GlassCard>
                <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/5">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                       {React.cloneElement(hplcAnalysisTypes[selectedAnalysis].icon, { className: "h-7 w-7 text-blue-300" })}
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">
                        {hplcAnalysisTypes[selectedAnalysis].title}
                      </h2>
                      <p className="text-blue-200 text-sm font-medium">
                        {hplcAnalysisTypes[selectedAnalysis].subtitle}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleAnalyzeClick}
                    className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/50 hover:shadow-blue-600/50"
                  >
                    <span>분석 시작하기</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="p-6 lg:p-8">
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-white font-bold mb-4 flex items-center space-x-2 text-lg">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span>분석 가능한 화합물 (Target Compounds)</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {hplcAnalysisTypes[selectedAnalysis].compounds.map((compound, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span className="text-gray-200 text-sm font-medium">{compound}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
                        <Play className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-100 leading-relaxed">
                            <strong>Note:</strong> 분석을 시작하면 RT(Retention Time) 데이터 입력 또는 엑셀 파일 업로드를 통해 정량 분석을 수행할 수 있습니다.
                        </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}