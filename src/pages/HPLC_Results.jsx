import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Database, BarChart3, ArrowLeft, FileText, Settings2,
  Upload, PieChart, FlaskConical
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";

// 실제 기능 컴포넌트 Import
import RTInput from "@/components/hplc/RTInput";
import CalculationInput from "@/components/hplc/CalculationInput";
import PDFUpload from "@/components/hplc/PDFUpload";
import ResultsTable from "@/components/hplc/ResultsTable";
import ResultsChart from "@/components/hplc/ResultsChart";
import StatisticsResults from "@/components/hplc/StatisticsResults";

// --- [Visual Components: Transparent Liquid Glass System] ---

// 1. SVG 필터
const LiquidFilter = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }}>
    <defs>
      <filter id="liquid-filter">
        <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation={0.5} />
      </filter>
    </defs>
  </svg>
);

// 2. Liquid Glass 스코프 스타일
const LiquidScopeStyles = () => (
  <style>{`
    /* =========================
       Liquid Scope Base
    ========================== */
    .liquid-scope {
      color-scheme: dark;
      color: rgba(248,250,252,0.92);
    }
    .liquid-scope ::selection {
      background: rgba(59,130,246,0.35);
      color: rgba(255,255,255,0.95);
    }

    /* =========================
       1) 배경 요소 유리화
    ========================== */
    .liquid-scope :where(
      [class*="bg-white"],
      [class*="bg-slate-"], [class*="bg-gray-"], [class*="bg-zinc-"],
      [class*="bg-neutral-"], [class*="bg-stone-"],
      [class*="bg-muted"], [class*="bg-card"], [class*="bg-background"], [class*="bg-secondary"]
    ){
      background-color: rgba(33, 42, 63, 0.18) !important;
      border-color: rgba(255,255,255,0.12) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.05) !important;
    }

    /* 인라인 스타일 커버 */
    .liquid-scope :where([style*="background-color: rgb(255, 255, 255)"], [style*="background-color:#fff"], [style*="background: #fff"]){
      background-color: rgba(15,23,42,0.18) !important;
      border-color: rgba(255,255,255,0.12) !important;
    }

    /* =========================
       2) Global Text Fix
    ========================== */
    .liquid-scope :where(.text-black, .text-gray-900, .text-slate-900, .text-foreground, .text-card-foreground){
      color: rgba(248,250,252,0.95) !important;
      text-shadow: 0 1px 2px rgba(0,0,0,0.55);
    }
    .liquid-scope :where(.text-muted-foreground, .text-gray-500, .text-slate-500){
      color: rgba(226,232,240,0.85) !important;
    }
    .liquid-scope label { color: rgba(226,232,240,0.92) !important; }

    /* =========================
       3) 입력폼/버튼/테이블
    ========================== */
    .liquid-scope :where(input, textarea, select){
      background-color: rgba(15,23,42,0.22) !important;
      border: 1px solid rgba(255,255,255,0.15) !important;
      color: rgba(248,250,252,0.95) !important;
      caret-color: rgba(255,255,255,0.9) !important;
    }
    .liquid-scope :where(input::placeholder, textarea::placeholder){ color: rgba(148,163,184,0.7) !important; }
    .liquid-scope table, .liquid-scope tr, .liquid-scope td, .liquid-scope th{ background-color: transparent !important; }

    /* =========================================================
       ✅ 4) Force Readable (계산공식/일반 텍스트 가독성)
    ========================================================== */
    .liquid-scope .force-readable :where(pre, code){
      color: rgba(248,250,252,0.95) !important;
      -webkit-text-fill-color: rgba(248,250,252,0.95) !important;
      text-shadow: none !important;
    }
    .liquid-scope .force-readable :where(
      .text-gray-700, .text-gray-800, .text-gray-900, .text-gray-950,
      .text-slate-700, .text-slate-800, .text-slate-900, .text-slate-950,
      .text-zinc-700, .text-zinc-800, .text-zinc-900, .text-zinc-950,
      .text-neutral-700, .text-neutral-800, .text-neutral-900, .text-neutral-950,
      .text-stone-700, .text-stone-800, .text-stone-900, .text-stone-950
    ){
      color: rgba(248,250,252,0.95) !important;
      -webkit-text-fill-color: rgba(248,250,252,0.95) !important;
    }
    .liquid-scope .force-readable :where(
      [style*="color: rgb(0, 0, 0)"],
      [style*="color:rgb(0,0,0)"],
      [style*="color:#000"], [style*="color: #000"],
      [style*="color: rgb(15, 23, 42)"],
      [style*="color:rgb(15,23,42)"],
      [style*="color:#0f172a"], [style*="color: #0f172a"]
    ){
      color: rgba(248,250,252,0.95) !important;
      -webkit-text-fill-color: rgba(248,250,252,0.95) !important;
      text-shadow: none !important;
    }

    /* ✅ 계산식 "파란 강조"는 계산식 영역에서만 살아있게 (요약 박스에서는 아래 applied-summary가 덮어씀) */
    .liquid-scope .force-readable :where(
      .text-blue-500, .text-blue-600, .text-blue-700,
      .text-indigo-500, .text-indigo-600, .text-indigo-700,
      .text-sky-500, .text-sky-600, .text-sky-700
    ){
      color: rgba(147,197,253,0.98) !important;
      -webkit-text-fill-color: rgba(147,197,253,0.98) !important;
    }

    /* =========================================================
       ✅ [핵심 FIX] 적용된 RT / 적용된 변수 박스만 Liquid Glass로
       - 통계요약(stats-ux)은 건드리지 않음
    ========================================================== */

    /* 1) 적용 박스(컨테이너) 유리화 */
    .liquid-scope :where(.rt-ux, .calc-ux) .applied-summary{
      background-color: rgba(15,23,42,0.22) !important;
      border: 1px solid rgba(255,255,255,0.14) !important;
      backdrop-filter: blur(14px) !important;
      -webkit-backdrop-filter: blur(14px) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.05) !important;
    }

    /* 2) 적용 박스 내부 '칩/서브카드'(밝은 bg-blue-100류)가 있으면 같이 유리화 */
    .liquid-scope :where(.rt-ux, .calc-ux) .applied-summary :where(
      .bg-blue-100, .bg-sky-100, .bg-indigo-100,
      .bg-cyan-100, .bg-teal-100, .bg-emerald-100, .bg-green-100,
      .bg-slate-100, .bg-gray-100, .bg-zinc-100, .bg-neutral-100, .bg-stone-100
    ){
      background-color: rgba(255,255,255,0.06) !important;
      border: 1px solid rgba(255,255,255,0.12) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.04) !important;
    }

    /* 3) 적용 박스 내부 텍스트는 전부 흰색(파란 글자 강조 포함) */
    .liquid-scope :where(.rt-ux, .calc-ux) .applied-summary :where(*){
      color: rgba(248,250,252,0.95) !important;
      -webkit-text-fill-color: rgba(248,250,252,0.95) !important;
      text-shadow: none !important;
    }

    /* =========================================================
       ✅ 5) [Results ONLY] 삭제/경고 버튼, 결과영역 가독성
    ========================================================== */
    .liquid-scope .results-ux .bulk-delete-btn,
    .liquid-scope .results-ux :where(button[class*="destructive"], button[class*="text-red"]) {
      background-color: rgba(239,68,68,0.22) !important;
      border-color: rgba(239,68,68,0.55) !important;
      color: rgba(255,255,255,0.96) !important;
    }
    .liquid-scope .results-ux :where(.bulk-delete-btn svg, button[class*="destructive"] svg) {
      color: #ffffff !important;
      stroke: #ffffff !important;
    }
    .liquid-scope .results-ux :where(.bulk-delete-btn:hover, button[class*="destructive"]:hover) {
      background-color: rgba(239,68,68,0.35) !important;
    }

    .liquid-scope .upload-hint,
    .liquid-scope .force-readable p[class*="text-gray"],
    .liquid-scope .force-readable p[class*="text-slate"] {
      color: rgba(226,232,240,0.92) !important;
      text-shadow: 0 1px 2px rgba(0,0,0,0.55) !important;
      opacity: 1 !important;
    }

/* ✅ [FIX] force-readable 영역: p 뿐 아니라 div/span/small도 같이 밝게 */
.liquid-scope .force-readable :where(span, div, small)[class*="text-gray"],
.liquid-scope .force-readable :where(span, div, small)[class*="text-slate"],
.liquid-scope .force-readable :where(span, div, small)[class*="text-zinc"],
.liquid-scope .force-readable :where(span, div, small)[class*="text-neutral"] {
  color: rgba(226,232,240,0.92) !important;
  -webkit-text-fill-color: rgba(226,232,240,0.92) !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.55) !important;
  opacity: 1 !important;
}





    .liquid-scope .force-readable button:not([role="tab"])[class*="bg-blue"] {
      background-color: rgba(37, 99, 235, 0.85) !important;
      color: white !important;
      border: 1px solid rgba(59, 130, 246, 0.5) !important;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3) !important;
    }
    .liquid-scope .force-readable button:not([role="tab"]):not([class*="bg-blue"]):not([class*="bg-red"]):not(.bulk-delete-btn) {
      background-color: rgba(15,23,42,0.4) !important;
      border: 1px solid rgba(255,255,255,0.2) !important;
      color: rgba(226,232,240,0.95) !important;
    }

    .liquid-scope .recharts-cartesian-axis-tick-value { fill: rgba(248,250,252,0.88) !important; }
    .liquid-scope .recharts-cartesian-axis line { stroke: rgba(255,255,255,0.18) !important; }

    .liquid-scope .results-ux :where(
      .text-black, .text-gray-900, .text-slate-900, .text-zinc-900,
      .text-gray-800, .text-slate-800, .text-zinc-800
    ),
    .liquid-scope .results-ux :where(
      [class*="text-black/"], [class*="text-gray-900/"], [class*="text-slate-900/"], [class*="text-zinc-900/"],
      [class*="text-gray-800/"], [class*="text-slate-800/"], [class*="text-zinc-800/"],
      [class*="text-[#0f172a"], [class*="text-[rgb(15,23,42"]
    ){
      color: rgba(255,255,255,0.95) !important;
      -webkit-text-fill-color: rgba(255,255,255,0.95) !important;
      opacity: 1 !important;
      text-shadow: none !important;
    }

    /* =========================================================
       🚨 [CRITICAL FIX] Modal/Dialog Force Visibility
    ========================================================== */
    div[role="dialog"],
    div[data-state="open"][class*="fixed"][class*="inset-0"],
    div[class*="DialogOverlay"],
    div[class*="DialogContent"] {
      pointer-events: auto !important;
    }

    div[data-state="open"][class*="fixed"][class*="inset-0"][class*="bg-black/80"],
    div[data-state="open"][class*="fixed"][class*="inset-0"][class*="backdrop-blur"] {
      z-index: 9998 !important;
      background-color: rgba(0, 0, 0, 0.75) !important;
      backdrop-filter: blur(8px) !important;
    }

    div[role="dialog"],
    div[class*="DialogContent"],
    div[class*="modal-content"],
    .liquid-scope div[role="dialog"] {
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      background-color: #0f172a !important;
      border: 1px solid rgba(255,255,255,0.2) !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7) !important;
      color: white !important;
      z-index: 9999 !important;
      min-width: 300px !important;
      opacity: 1 !important;
      visibility: visible !important;
    }

    div[role="dialog"] label,
    div[role="dialog"] h2,
    div[role="dialog"] h3,
    div[role="dialog"] p,
    div[role="dialog"] span {
      color: rgba(255,255,255,0.95) !important;
      text-shadow: none !important;
    }
    div[role="dialog"] input,
    div[role="dialog"] select {
      background-color: rgba(255,255,255,0.08) !important;
      border: 1px solid rgba(255,255,255,0.2) !important;
      color: white !important;
    }
    div[role="dialog"] button[type="submit"],
    div[role="dialog"] button[class*="primary"] {
      background-color: rgba(37, 99, 235, 1) !important;
      color: white !important;
    }

    div[role="dialog"] button[class*="absolute"] { color: rgba(255,255,255,0.6) !important; }
    div[role="dialog"] button[class*="absolute"]:hover { color: white !important; }

/* ✅ [FIX] ResultsTable 선(경계) 번짐 제거: table 계층 blur/filter 차단 + border 선명화 */
.liquid-scope .results-ux :where(table, thead, tbody, tr, th, td) {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  filter: none !important;           /* SVG filter/blur 전파 차단 */
  box-shadow: none !important;       /* glow/번짐 차단 */
}

.liquid-scope .results-ux table {
  border-collapse: collapse !important;
  border-spacing: 0 !important;
}


.liquid-scope .results-ux tbody td {
  border-bottom: 1px solid rgba(255,255,255,0.12) !important;
}

.liquid-scope .results-ux tbody tr:last-child td {
  border-bottom: none !important;
}

/* ✅ [UPLOAD] 아이콘 박스: 파란 배경 + 흰색 아이콘 */
.liquid-scope .upload-ux :where(
  [class*="bg-blue-50"], [class*="bg-blue-100"], [class*="bg-blue-200"],
  [class*="bg-sky-50"],  [class*="bg-sky-100"],  [class*="bg-sky-200"],
  [class*="bg-indigo-50"], [class*="bg-indigo-100"], [class*="bg-indigo-200"]
){
  background-color: rgba(37,99,235,0.88) !important;   /* 파란색 */
  border: 1px solid rgba(59,130,246,0.55) !important;
}

/* 아이콘/텍스트를 흰색으로 */
.liquid-scope .upload-ux :where(
  [class*="bg-blue-50"], [class*="bg-blue-100"], [class*="bg-blue-200"],
  [class*="bg-sky-50"],  [class*="bg-sky-100"],  [class*="bg-sky-200"],
  [class*="bg-indigo-50"], [class*="bg-indigo-100"], [class*="bg-indigo-200"]
) :where(svg, span, p){
  color: rgba(255,255,255,0.98) !important;
  -webkit-text-fill-color: rgba(255,255,255,0.98) !important;
  stroke: rgba(255,255,255,0.98) !important;
}



  `}</style>
);

// 3. 메인 컨테이너
const LiquidCard = ({ children, className = "" }) => (
  <div className={`relative rounded-3xl border border-white/10 shadow-2xl overflow-visible ${className}`}>
    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-black/14 backdrop-blur-xl" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
    </div>
    <div className="relative z-10 w-full h-full overflow-visible">
      {children}
    </div>
  </div>
);

// 4. 내부 패널
const InnerGlass = ({ children, className = "" }) => (
  <div className={`relative rounded-2xl border border-white/10 shadow-inner ring-1 ring-inset ring-white/12 ${className}`}>
    <div className="absolute inset-0 rounded-2xl bg-slate-900/18 backdrop-blur-2xl overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.10] via-transparent to-transparent" />
    </div>
    <div className="relative z-10 w-full h-full">
      {children}
    </div>
  </div>
);

// 5. 커스텀 탭 버튼
const LiquidTab = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 overflow-hidden group ${
      active
        ? "text-white bg-white/10 shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-white/10"
        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
    }`}
  >
    <span className="relative z-10 flex items-center gap-2">
      {icon && React.cloneElement(icon, { className: `w-4 h-4 ${active ? "text-blue-300" : "text-current"}` })}
      {label}
    </span>
  </button>
);

export default function HPLC_Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysisType, setAnalysisType] = useState("");
  const [rtStandards, setRtStandards] = useState({});
  const [calculationParams, setCalculationParams] = useState({});
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState("data_input");

  const uploadedFilesRef = useRef([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // --- [Initialize] ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("analysis_type");
    if (type) {
      setAnalysisType(type);
      try {
        const savedRT = localStorage.getItem(`rt_standards_${type}`);
        const savedCalc = localStorage.getItem(`calc_params_${type}`);
        const savedFiles = localStorage.getItem(`uploaded_files_${type}`);
        const savedResults = localStorage.getItem(`analysis_results_${type}`);

        if (savedRT) setRtStandards(JSON.parse(savedRT));
        if (savedCalc) setCalculationParams(JSON.parse(savedCalc));
        if (savedFiles) {
          const files = JSON.parse(savedFiles);
          uploadedFilesRef.current = files;
          setUploadedFiles(files);
        }
        if (savedResults) setResults(JSON.parse(savedResults));
      } catch (e) {
        console.error("Error loading local storage data:", e);
      }
    }
  }, [location.search]);

  // --- [Handlers] ---
  const handleBackToHPLC = () => {
    const targetPath = typeof createPageUrl === "function" ? createPageUrl("HPLC") : "/hplc";
    navigate(targetPath);
  };

  const calculateConcentration = (sampleArea, compound, calcParams, analysisType) => {
    if (!sampleArea || !compound || !calcParams) return null;

    if (analysisType === "phenol") {
      const a = calcParams[`${compound}_a`];
      const b = calcParams[`${compound}_b`];
      const sampleWeight = calcParams.sampleWeight;

      if (!a || !b || !sampleWeight) return null;

      const ugPerMl = (parseFloat(sampleArea) + parseFloat(b)) / parseFloat(a);
      const mgPerG = ugPerMl * 2 / parseFloat(sampleWeight);
      return mgPerG;
    } else {
      const { standardArea, molecularWeight, sampleWeight, conversionFactor } = calcParams;
      if (!standardArea || !molecularWeight || !sampleWeight) return null;

      const result =
        (parseFloat(sampleArea) / parseFloat(standardArea)) *
        0.5 /
        parseFloat(molecularWeight) *
        1000 /
        parseFloat(sampleWeight) *
        parseFloat(conversionFactor || 1);

      return result;
    }
  };

  const regenerateResults = (newCalcParams) => {
    const updatedResults = results.map((result) => ({
      ...result,
      concentration: calculateConcentration(result.area, result.compound, newCalcParams, analysisType),
    }));
    setResults(updatedResults);
    localStorage.setItem(`analysis_results_${analysisType}`, JSON.stringify(updatedResults));
  };

  const handleRTStandardsChange = (standards) => {
    setRtStandards(standards);
    localStorage.setItem(`rt_standards_${analysisType}`, JSON.stringify(standards));
  };

  const handleCalculationParamsChange = (params) => {
    setCalculationParams(params);
    localStorage.setItem(`calc_params_${analysisType}`, JSON.stringify(params));
    if (results.length > 0) regenerateResults(params);
  };

  const handleResultsGenerated = (generatedResults) => {
    const calculatedResults = generatedResults.map((res) => ({
      ...res,
      concentration: calculateConcentration(res.area, res.compound, calculationParams, analysisType),
    }));
    setResults(calculatedResults);
    localStorage.setItem(`analysis_results_${analysisType}`, JSON.stringify(calculatedResults));
  };

  const handleFilesUploaded = (newFiles, isReplacement = false) => {
    if (isReplacement) {
      uploadedFilesRef.current = newFiles;
      setUploadedFiles(newFiles);
    } else {
      const updatedFiles = [...uploadedFilesRef.current, ...newFiles];
      uploadedFilesRef.current = updatedFiles;
      setUploadedFiles(updatedFiles);
    }
    localStorage.setItem(`uploaded_files_${analysisType}`, JSON.stringify(uploadedFilesRef.current));
  };

  // 이미지 경로 헬퍼
  const img = (file) => {
    try {
      return new URL(`../images/${file}`, import.meta.url).href;
    } catch (e) {
      return `/images/${file}`;
    }
  };

  const getAnalysisTitle = () => {
    const titles = {
      phenol: "페놀 화합물 분석",
      glucosinolate: "글루코시놀레이트 분석",
      acacetin: "아카세틴 분석",
      rosmarinic_acid: "로즈마린산 분석",
      tilianin: "틸리아닌 분석",
    };
    return titles[analysisType] || "HPLC 분석";
  };

  if (!analysisType) {
    return (
      <div className="liquid-scope min-h-screen bg-slate-900 flex items-center justify-center text-white p-4">
        <LiquidScopeStyles />
        <LiquidCard className="text-center p-10 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">분석 항목을 선택해주세요</h1>
          <button
            onClick={handleBackToHPLC}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 w-full transition-all font-bold shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>HPLC 분석으로 돌아가기</span>
          </button>
        </LiquidCard>
      </div>
    );
  }

  return (
    <div className="liquid-scope relative min-h-screen overflow-hidden bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Styles & Filters */}
      <LiquidScopeStyles />
      <LiquidFilter />

      {/* Background Layer */}
      <div className="absolute inset-0 z-0 w-full h-full pointer-events-none">
        <img
          src={img("hplc_background.jpg")}
          alt="Background"
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-12 flex flex-col gap-8 h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToHPLC}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 drop-shadow-sm">
                {getAnalysisTitle()}
              </h1>
              <p className="text-slate-400 text-sm font-medium">HPLC Quantification Analysis</p>
            </div>
          </div>

          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg">
            <LiquidTab
              active={activeTab === "data_input"}
              onClick={() => setActiveTab("data_input")}
              icon={<Database />}
              label="데이터 입력"
            />
            <LiquidTab
              active={activeTab === "visualization"}
              onClick={() => setActiveTab("visualization")}
              icon={<BarChart3 />}
              label="시각화"
            />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "data_input" ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Top Row: RT & Calc Inputs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* RT Standards Section */}
<LiquidCard className="p-1">
  <div className="bg-gradient-to-r from-blue-900/20 to-transparent px-6 py-4 border-b border-white/5 flex items-center gap-2 rounded-t-3xl overflow-hidden">
    <Settings2 className="w-5 h-5 text-blue-300" />
    <h2 className="text-lg font-bold text-white">RT 기준 설정</h2>
  </div>
  <div className="p-6">
    <InnerGlass className="p-4 force-readable rt-ux">
      <RTInput
        analysisType={analysisType}
        onRTStandardsChange={handleRTStandardsChange}
        initialValues={rtStandards}
      />
    </InnerGlass>
  </div>
</LiquidCard>

                {/* Calculation Params Section */}
<LiquidCard className="p-1">
  <div className="bg-gradient-to-r from-green-900/20 to-transparent px-6 py-4 border-b border-white/5 flex items-center gap-2 rounded-t-3xl overflow-hidden">
    <FlaskConical className="w-5 h-5 text-green-300" />
    <h2 className="text-lg font-bold text-white">계산 변수 설정</h2>
  </div>
  <div className="p-6">
    <InnerGlass className="p-4 force-readable calc-ux">
      <CalculationInput
        analysisType={analysisType}
        onCalculationParamsChange={handleCalculationParamsChange}
        initialValues={calculationParams}
      />
    </InnerGlass>
  </div>
</LiquidCard>
              </div>

              {/* Middle Row: Upload & Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Section */}
                {/* Upload Section */}
<LiquidCard className="lg:col-span-1 p-1 flex flex-col h-full">
  <div className="bg-gradient-to-r from-orange-900/20 to-transparent px-6 py-4 border-b border-white/5 flex items-center gap-2 rounded-t-3xl overflow-hidden">
    <Upload className="w-5 h-5 text-orange-300" />
    <h2 className="text-lg font-bold text-white">PDF 파일 업로드</h2>
  </div>
  <div className="p-6 flex-1">
    <InnerGlass className="p-4 h-full force-readable upload-ux">
      <PDFUpload
        onFilesUploaded={handleFilesUploaded}
        rtStandards={rtStandards}
        onResultsGenerated={handleResultsGenerated}
        analysisType={analysisType}
        calculationParams={calculationParams}
        uploadedFiles={uploadedFiles}
      />
    </InnerGlass>
  </div>
</LiquidCard>

                {/* Stats Section */}
                <LiquidCard className="lg:col-span-2 p-1 flex flex-col h-full">
  <div className="bg-gradient-to-r from-purple-900/20 to-transparent px-6 py-4 border-b border-white/5 flex items-center gap-2 rounded-t-3xl overflow-hidden">
    <PieChart className="w-5 h-5 text-purple-300" />
    <h2 className="text-lg font-bold text-white">통계 요약</h2>
  </div>
  <div className="p-6 flex-1">
    <InnerGlass className="p-4 h-full flex items-center justify-center force-readable stats-ux">
      <StatisticsResults results={results} />
    </InnerGlass>
  </div>
</LiquidCard>
              </div>

              {/* Results Table */}
<LiquidCard className="p-1">
  <div className="bg-gradient-to-r from-indigo-900/20 to-transparent px-6 py-4 border-b border-white/5 flex items-center justify-between rounded-t-3xl overflow-hidden">
    <div className="flex items-center gap-2">
      <FileText className="w-5 h-5 text-indigo-300" />
      <h2 className="text-lg font-bold text-white">분석 상세 결과</h2>
    </div>
    <div className="px-3 py-1 rounded-full bg-white/10 text-xs text-gray-300 font-medium border border-white/10">
      {results.length} Rows
    </div>
  </div>
  <div className="p-6">
    <InnerGlass className="p-2 overflow-hidden min-h-[300px] results-ux force-readable">
      {results.length > 0 ? (
        <ResultsTable results={results} analysisType={analysisType} />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400 py-10">
          데이터가 없습니다.
        </div>
      )}
    </InnerGlass>
  </div>
</LiquidCard>




            </motion.div>
          ) : (
            <motion.div
              key="visualization"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Visualization Tab Card */}
<LiquidCard className="min-h-[600px] p-1">
  <div className="bg-gradient-to-r from-pink-900/20 to-transparent px-6 py-4 border-b border-white/5 flex items-center gap-2 rounded-t-3xl overflow-hidden">
    <BarChart3 className="w-5 h-5 text-pink-400" />
    <h2 className="text-lg font-bold text-white">데이터 시각화</h2>

  </div>
  <div className="p-6">
    <InnerGlass className="min-h-[500px] p-6 flex items-center justify-center force-readable">
      {results.length > 0 ? (
        <ResultsChart results={results} analysisType={analysisType} />
      ) : (
        <div className="text-gray-400">시각화할 데이터가 없습니다.</div>
      )}
    </InnerGlass>
  </div>
</LiquidCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
