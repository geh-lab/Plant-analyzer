import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Calculator, BarChart3, Database, ArrowLeft, Download,
  Settings2, Table, LayoutDashboard, FileSpreadsheet, Keyboard,
  TrendingUp, RefreshCw, MessageSquare, BookOpen
} from "lucide-react";
import _ from "lodash";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";

// 실제 컴포넌트 Import
import ManualInput from "@/components/analysis/ManualInput";
import ExcelUpload from "@/components/analysis/ExcelUpload";
import CalculationEngine from "@/components/analysis/CalculationEngine";
import ChartVisualization from "@/components/analysis/ChartVisualization";
import SampleResults from "@/components/analysis/SampleResults";
import CalculationParams from "@/components/analysis/CalculationParams";

// --- [Visual Components: Transparent Liquid Glass System] ---

// 1. SVG 필터
const LiquidFilter = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <defs>
      <filter id="liquid-filter">
        <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation="0.5" />
      </filter>
    </defs>
  </svg>
);

// 2. Liquid Glass 스코프 스타일 (모달 CSS 대폭 강화)
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
       ✅ 4) [Force Readable] 검정/투명 텍스트 강제 가독성 보정
    ========================================================== */
    .liquid-scope .force-readable :where([class*="text-black"], [style*="color: black"], .text-foreground) {
      color: rgba(248,250,252,0.95) !important;
      text-shadow: 0 1px 2px rgba(0,0,0,0.55) !important;
    }
    .liquid-scope .force-readable :where([class*="text-transparent"]) {
      color: rgba(226,232,240,0.95) !important;
      -webkit-text-fill-color: rgba(226,232,240,0.95) !important;
    }
    .liquid-scope .force-readable :where([class*="opacity-0"], [class*="invisible"], [class*="hover:opacity-100"]){
      opacity: 1 !important;
      visibility: visible !important;
    }

    /* =========================================================
       ✅ 5) [Specific UX Fixes]
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

    /* 버튼 스타일 */
    .liquid-scope .force-readable button[class*="bg-blue"] {
      background-color: rgba(37, 99, 235, 0.85) !important;
      color: white !important;
      border: 1px solid rgba(59, 130, 246, 0.5) !important;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3) !important;
    }
    .liquid-scope .force-readable button:not([class*="bg-blue"]):not([class*="bg-red"]):not(.bulk-delete-btn) {
      background-color: rgba(15,23,42,0.4) !important;
      border: 1px solid rgba(255,255,255,0.2) !important;
      color: rgba(226,232,240,0.95) !important;
    }

    /* 차트 스타일 */
    .liquid-scope .recharts-cartesian-axis-tick-value { fill: rgba(248,250,252,0.88) !important; }
    .liquid-scope .recharts-cartesian-axis line { stroke: rgba(255,255,255,0.18) !important; }

    /* =========================================================
       ✅ 6) [Results ONLY] 텍스트 가독성
    ========================================================== */
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

    .liquid-scope .results-ux :where(span, div, p, small, b, strong)[style*="color: rgb(0, 0, 0)"],
    .liquid-scope .results-ux :where(span, div, p, small, b, strong)[style*="color:#000"],
    .liquid-scope .results-ux :where(span, div, p, small, b, strong)[style*="color: #000"],
    .liquid-scope .results-ux :where(span, div, p, small, b, strong)[style*="color: rgb(15, 23, 42)"],
    .liquid-scope .results-ux :where(span, div, p, small, b, strong)[style*="color:#0f172a"],
    .liquid-scope .results-ux :where(span, div, p, small, b, strong)[style*="color: #0f172a"]{
      color: rgba(255,255,255,0.95) !important;
      -webkit-text-fill-color: rgba(255,255,255,0.95) !important;
      opacity: 1 !important;
      text-shadow: none !important;
    }

    /* C 칩(박스)만 파란색으로 */
    .liquid-scope .results-ux :where(span, div)[class*="inline-flex"][class*="bg-white"][class*="rounded"],
    .liquid-scope .results-ux :where(span, div)[class*="inline-flex"][class*="bg-white/"][class*="rounded"],
    .liquid-scope .results-ux :where(span, div)[class*="inline-flex"][class*="bg-slate-50"][class*="rounded"],
    .liquid-scope .results-ux :where(span, div)[class*="inline-flex"][class*="bg-gray-50"][class*="rounded"]{
      background-color: rgba(37, 99, 235, 0.90) !important;
      border-color: rgba(147, 197, 253, 0.55) !important;
      color: rgba(255,255,255,0.98) !important;
      -webkit-text-fill-color: rgba(255,255,255,0.98) !important;
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

    div[role="dialog"] button[class*="absolute"] {
      color: rgba(255,255,255,0.6) !important;
    }
    div[role="dialog"] button[class*="absolute"]:hover {
      color: white !important;
    }
  `}</style>
);

// 3. 메인 컨테이너
const LiquidCard = ({ children, className = "" }) => (
  <div
    className={`relative rounded-3xl border border-white/10 shadow-2xl overflow-visible ${className}`}
  >
    {/* ✅ 배경만 코너 클리핑 */}
    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-black/14 backdrop-blur-xl" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
    </div>

    {/* 콘텐츠는 잘리지 않게 */}
    <div className="relative z-10 w-full h-full overflow-visible">
      {children}
    </div>
  </div>
);

// 4. 내부 패널
const InnerGlass = ({ children, className = "" }) => (
  <div
    className={`relative rounded-2xl border border-white/10 shadow-inner ring-1 ring-inset ring-white/12 ${className}`}
  >
    {/* 배경 Layer */}
    <div className="absolute inset-0 rounded-2xl bg-slate-900/18 backdrop-blur-2xl overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.10] via-transparent to-transparent" />
      <div className="absolute inset-0 bg-black/[0.03]" />
    </div>

    {/* 콘텐츠 Layer */}
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

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysisType, setAnalysisType] = useState("");
  const [samples, setSamples] = useState([]);
  const [selectedSampleIds, setSelectedSampleIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState("data_input_analysis");
  const [calculationParams, setCalculationParams] = useState({});
  const [inputMethod, setInputMethod] = useState("manual");

  // ✅ 이미지 경로 헬퍼 (추가)
  const img = (file) => {
    try {
      return new URL(`../images/${file}`, import.meta.url).href;
    } catch (e) {
      return `/images/${file}`;
    }
  };

  // --- [초기화 및 URL 처리] ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) setActiveTab(tab);

    const type = params.get("analysis_type");
    if (type) {
      setAnalysisType(type);
      setSamples(getSamplesFromStorage(type));
      setCalculationParams(loadCalculationParams(type));
    }
  }, [location.search]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(location.search);
    params.set("tab", newTab);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  // --- [LocalStorage 관리] ---
  const saveCalculationParams = (params) => {
    try { localStorage.setItem(`calc_params_${analysisType}`, JSON.stringify(params)); }
    catch (e) { console.error(e); }
  };
  const loadCalculationParams = (type) => {
    try { return JSON.parse(localStorage.getItem(`calc_params_${type}`) || "{}"); }
    catch (e) { return {}; }
  };
  const getSamplesFromStorage = (type) => {
    try { return JSON.parse(localStorage.getItem("phyto_samples") || "[]").filter(s => s.analysis_type === type); }
    catch (e) { return []; }
  };
  const saveSamplesToStorage = (newSamples) => {
    try {
      const all = JSON.parse(localStorage.getItem("phyto_samples") || "[]");
      const others = all.filter(s => s.analysis_type !== analysisType);
      localStorage.setItem("phyto_samples", JSON.stringify([...others, ...newSamples]));
    } catch (e) { console.error(e); }
  };

  // --- [이벤트 핸들러] ---
  const loadSamples = () => setSamples(getSamplesFromStorage(analysisType));

  const handleCalculationParamsChange = (params) => {
    setCalculationParams(params);
    saveCalculationParams(params);
  };

  const handleAddOrUpdateSample = (data, isEdit) => {
    const current = getSamplesFromStorage(analysisType);
    let updated;
    if (isEdit) updated = current.map(s => s.id === data.id ? { ...s, ...data, updated_date: new Date().toISOString() } : s);
    else updated = [...current, { ...data, id: Date.now().toString(), created_date: new Date().toISOString(), analysis_type: analysisType }];
    saveSamplesToStorage(updated);
    loadSamples();
  };

  const handleRemoveSample = (id) => {
    saveSamplesToStorage(getSamplesFromStorage(analysisType).filter(s => s.id !== id));
    loadSamples();
    setSelectedSampleIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const handleRemoveMultipleSamples = (ids) => {
    saveSamplesToStorage(getSamplesFromStorage(analysisType).filter(s => !ids.includes(s.id)));
    loadSamples();
    setSelectedSampleIds(new Set());
  };

  const handleSamplesUploaded = (uploaded) => {
    const newS = uploaded.map(s => ({ ...s, id: `${Date.now()}-${Math.random()}`, created_date: new Date().toISOString(), analysis_type: analysisType }));
    saveSamplesToStorage([...getSamplesFromStorage(analysisType), ...newS]);
    loadSamples();
  };

  // --- [템플릿 다운로드 기능] ---
  const getTemplateHeaders = (type) => {
    const commonHeaders = ["Sample Name", "Description", "Treatment Name", "Replicate"];
    const typeSpecificAbsorbanceHeaders = {
      chlorophyll_a_b: ["665.2", "652.4", "470"],
      carotenoid: ["470", "665.2", "652.4"],
      total_phenol: ["Absorbance"],
      total_flavonoid: ["Absorbance"],
      h2o2: ["390", "Weight"],
      glucosinolate: ["425"],
      dpph_scavenging: ["517"],
      anthocyanin: ["530", "600"],
      sod: ["560"],
      cat: ["240"],
      pod: ["470"],
    };
    return [...commonHeaders, ...(typeSpecificAbsorbanceHeaders[type] || [])];
  };

  const handleDownloadTemplate = () => {
    if (!analysisType) {
      alert("먼저 분석 항목을 선택해주세요.");
      return;
    }
    const headers = getTemplateHeaders(analysisType);
    let csvContent = headers.map(header => `"${header}"`).join(",") + "\n";
    for (let i = 1; i <= 3; i++) {
      const exampleRow = headers.map(header => {
        if (header === "Sample Name") return `"Sample ${i}"`;
        if (header === "Description") return `"Description for Sample ${i}"`;
        if (header === "Treatment Name") return `"Control"`;
        if (header === "Replicate") return `""`;
        if (header === "Weight") return `"0.2"`;
        return `"0.000"`;
      }).join(",");
      csvContent += exampleRow + "\n";
    }
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${analysisType}_template.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("다운로드가 지원되지 않는 환경입니다.");
    }
  };

  // --- [계산 로직] ---
  const calculateSingleResult = (sample) => {
    const p = calculationParams;
    const values = sample.absorbance_values;
    if (!values) return { result: 0, unit: "N/A" };

switch (sample.analysis_type) {
      case "chlorophyll_a_b": {
        const a665 = values["665.2"] || 0; const a652 = values["652.4"] || 0; const a470 = values["470"] || 0;
        const dF = parseFloat(p?.dilutionFactor) || 1;

        // [Step 1] 먼저 액체 농도(μg/mL)를 계산합니다. (공식 깨짐 방지)
        // raw_ 변수는 화면에 보여주진 않지만 계산을 위해 필요한 중간 값입니다.
        const raw_ca = (16.82 * a665 - 9.28 * a652) * dF;
        const raw_cb = (36.92 * a652 - 16.54 * a665) * dF;
        
        // Carotenoid 공식에는 희석 전 농도(raw값)가 들어가야 정확합니다.
        const raw_car = (1000 * a470 - 1.91 * (raw_ca / dF) - 95.15 * (raw_cb / dF)) / 225 * dF;

        // [Step 2] 최종 결과(mg/g)로 변환합니다. (나누기 10)
        const ca = raw_ca / 10;
        const cb = raw_cb / 10;
        const car = raw_car / 10;

        // unit을 "mg/g"으로 변경했습니다.
        return { result: ca, unit: "mg/g", chl_a: ca, chl_b: cb, carotenoid: car };
      }

      case "carotenoid": {
        const a470 = values["470"] || 0; const a665 = values["665.2"] || 0; const a652 = values["652.4"] || 0;
        
        // 여기도 마찬가지로 계산 후 마지막에 10을 나눕니다.
        const raw_ca = 16.82 * a665 - 9.28 * a652; 
        const raw_cb = 36.92 * a652 - 16.54 * a665;
        const raw_car = (1000 * a470 - 1.91 * raw_ca - 95.15 * raw_cb) / 225;

        return { result: raw_car / 10, unit: "mg/g" };
      }
      case "total_phenol":
      case "total_flavonoid": {
        // 기울기(a)나 절편(b)이 없으면 계산 불가 처리
        if (!p.std_a || !p.std_b) return { result: 0, unit: "N/A" };
        
        // 흡광도 값 가져오기
        const y = values[Object.keys(values)[0]] || 0;
        
        // [수정] 액체농도(μg/mL)를 구한 뒤 10으로 나누어 최종 함량(mg/g)으로 변환
        const result_val = ((y - parseFloat(p.std_b)) / parseFloat(p.std_a)) / 10;

        return {
          result: result_val,
          unit: sample.analysis_type === "total_phenol" ? "mg GAE/g DW" : "mg QE/g DW"
        };
      }
      case "h2o2": {
        const { a, b, vol = 2, dw = 0.02 } = p.h2o2 || {};
        if (!a || !b) return { result: 0, unit: "Check Params" };
        const abs = values["390"] || 0;
        const mM = (abs - parseFloat(b)) / parseFloat(a);
        const r_dw = (mM * parseFloat(vol)) / parseFloat(dw);
        const fw = sample.weight ? parseFloat(sample.weight) : parseFloat(dw);
        const r_fw = r_dw * (parseFloat(dw) / fw);
        return { result: Math.max(0, r_fw), unit: "μmol/g DW", result_dw: Math.max(0, r_dw), result_fw: Math.max(0, r_fw) };
      }
      case "glucosinolate":
        return { result: 1.40 + 118.86 * (values["425"] || 0), unit: "μmol/g DW" };
      case "dpph_scavenging": {
        if (!p.dpph_control) return { result: 0, unit: "% inhibition" };
        return { result: ((parseFloat(p.dpph_control) - (values["517"] || 0)) / parseFloat(p.dpph_control)) * 100, unit: "% inhibition" };
      }
      case "anthocyanin": {
        const { V = 2, n = 1, Mw = 449.2, epsilon = 26900, m = 0.02 } = p.anthocyanin || {};
        return {
          result: ((values["530"] || 0) - (values["600"] || 0)) * parseFloat(V) * parseFloat(n) * parseFloat(Mw) / (parseFloat(epsilon) * parseFloat(m)),
          unit: "mg/g DW"
        };
      }
case "cat": {
        // [1] 측정값(변수): 샘플마다 다른 값 (ΔA/min)
        // 사용자가 "240" 컬럼이나 "dA_min" 컬럼에 입력한 값을 찾습니다.
        const delta_A = parseFloat(values["240"] || values["dA_min"] || 0);

        // [2] 설정값(상수): UI에서 설정한 파라미터 가져오기
        // ★ 수정됨: UI 코드(Analysis.js)와 변수명을 맞췄습니다. (volume -> vol)
        const total_vol = parseFloat(p?.total_vol) || 200;    
        const enzyme_vol = parseFloat(p?.enzyme_vol) || 3;    
        const enzyme_conc = parseFloat(p?.enzyme_conc) || 10; 

        // ΔA 값이 없으면 0 반환
        if (!delta_A) return { result: 0, unit: "μmol/min/mg DW" };

        // [3] 계산 수행
        // 공식: (ΔA * Total_Vol * 1000) / (43.6 * Enzyme_Vol)
        const vol_activity = (delta_A * total_vol * 1000) / (43.6 * enzyme_vol);
        
        // 최종: Unit/mL / (mg/mL) = Unit/mg DW
        const specific_activity = vol_activity / enzyme_conc;

        return { 
            result: specific_activity, 
            unit: "μmol/min/mg DW" 
        };
      }
case "pod": {
        // [1] 측정값(변수): 샘플마다 다른 값
        // UI 데이터 입력창의 라벨이 "470 nm"이므로 values["470"]을 가져옵니다.
        const delta_A = parseFloat(values["470"] || values["dA_min"] || 0);

        // [2] 설정값(상수): 공통 설정
        // 값이 없으면 기본값 (200, 20, 10) 적용
        const total_vol = parseFloat(p.pod?.total_vol) || 200;
        const enzyme_vol = parseFloat(p.pod?.enzyme_vol) || 20; // POD는 20uL
        const enzyme_conc = parseFloat(p.pod?.enzyme_conc) || 10; 

        if (!delta_A) return { result: 0, unit: "μmol/min/mg DW" };

        // [3] 계산 수행 (계수 26.6)
        // 공식: (ΔA * Total_Vol * 1000) / (26.6 * Enzyme_Vol)
        const act = (delta_A * total_vol * 1000) / (26.6 * enzyme_vol);
        
        // 최종: Unit/mL / (mg/mL) = Unit/mg DW
        return { 
            result: act / enzyme_conc, 
            unit: "μmol/min/mg DW" 
        };
      }
case "sod": {
        // [1] 측정값: 샘플의 흡광도 (560 nm)
        const sample_abs = parseFloat(values["560"] || values["abs"] || 0);

        // [2] 설정값: Control 흡광도 및 부피 설정
        const control_abs = parseFloat(p.sod?.control_abs) || 0; // ★ 가장 중요!
        const total_vol = parseFloat(p.sod?.total_vol) || 200;
        const enzyme_vol = parseFloat(p.sod?.enzyme_vol) || 20;
        const enzyme_conc = parseFloat(p.sod?.enzyme_conc) || 10;

        // Control 값이 없거나 0이면 계산 불가 (분모가 0이 됨)
        if (!control_abs || control_abs <= 0) return { result: 0, unit: "Unit/mg DW (Check Control)" };

        // [3] Inhibition (%) 계산
        // 공식: (Control - Sample) / Control * 100
        let inhibition = ((control_abs - sample_abs) / control_abs) * 100;
        
        // (혹시 샘플 흡광도가 더 높아서 음수가 나오면 0으로 보정)
        if (inhibition < 0) inhibition = 0;

        // [4] Unit/mL 계산 (제공해주신 공식 따름)
        // 공식: (inhibition% * total_vol) / (50 * enzyme_vol)
        // (참고: 50% 저해를 1 Unit으로 정의하는 식입니다)
        const unit_per_ml = (inhibition * total_vol) / (50 * enzyme_vol);

        // [5] 최종 결과: Unit/mg DW
        const result_val = unit_per_ml / enzyme_conc;

        return { 
            result: result_val, 
            unit: "Unit/mg DW" 
        };
      }
      default:
        return { result: 0, unit: "N/A" };
    }
  };

  const allCalculatedSamples = useMemo(
    () => samples.map(s => ({ ...s, ...calculateSingleResult(s) })),
    [samples, calculationParams]
  );
  const selectedSamples = useMemo(
    () => allCalculatedSamples.filter(s => selectedSampleIds.has(s.id)),
    [allCalculatedSamples, selectedSampleIds]
  );
  const groupedAndSortedSamples = useMemo(() => {
    const grouped = _.groupBy(allCalculatedSamples, 'treatment_name');
    return Object.keys(grouped).sort().flatMap(g => _.sortBy(grouped[g], ['replicate', 'sample_name']));
  }, [allCalculatedSamples]);

  const getAnalysisTitle = () => {
    const t = {
      chlorophyll_a_b: "엽록소 & 카로티노이드",
      total_phenol: "총 페놀",
      total_flavonoid: "총 플라보노이드",
      h2o2: "과산화수소",
      glucosinolate: "글루코시놀레이트",
      dpph_scavenging: "DPPH",
      anthocyanin: "안토시아닌",
      cat: "CAT 활성",
      pod: "POD 활성",
      sod: "SOD 활성"
    };
    return t[analysisType] || "분석 결과";
  };

  if (!analysisType) {
    return (
      <div className="liquid-scope min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <LiquidScopeStyles />
        <LiquidCard className="max-w-md w-full p-8 text-center">
          <h1 className="text-xl font-bold text-white mb-4">분석 항목을 선택해주세요</h1>
          <button
            onClick={() => navigate(createPageUrl("Analysis"))}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 mx-auto transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>분석 프로토콜로 돌아가기</span>
          </button>
        </LiquidCard>
      </div>
    );
  }

  return (
    <div className="liquid-scope relative min-h-screen overflow-hidden bg-slate-900 text-gray-100 font-sans selection:bg-blue-500/30">

      {/* Scope Styles & Filters */}
      <LiquidScopeStyles />
      <LiquidFilter />

      {/* ✅ Background Layer (교체) */}
      <div className="absolute inset-0 z-0 w-full h-full pointer-events-none">
        <img
          src={img("spectrophotometer_results.jpg")}
          alt="Background"
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-12 flex flex-col gap-8 h-full">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(createPageUrl("Analysis"))}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 drop-shadow-sm">
                {getAnalysisTitle()}
              </h1>
              <p className="text-slate-400 text-sm font-medium">Real-time Data Analysis</p>
            </div>
          </div>

          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <LiquidTab
              active={activeTab === "data_input_analysis"}
              onClick={() => handleTabChange("data_input_analysis")}
              icon={<LayoutDashboard />}
              label="데이터 및 결과"
            />
            <LiquidTab
              active={activeTab === "visualization"}
              onClick={() => handleTabChange("visualization")}
              icon={<BarChart3 />}
              label="시각화"
            />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "data_input_analysis" ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* 1. Parameters Section */}
              <LiquidCard className="p-1">
                <div className="bg-gradient-to-r from-blue-900/20 to-transparent px-6 py-4 border-b border-white/5 flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-blue-300" />
                  <h2 className="text-lg font-bold text-white">분석 변수 설정</h2>
                </div>
                <div className="p-6">
                  <InnerGlass className="p-6 force-readable">
                    <div className="params-scope">
                      <CalculationParams
                        analysisType={analysisType}
                        onParamsChange={handleCalculationParamsChange}
                        initialParams={calculationParams}
                      />
                    </div>
                  </InnerGlass>
                </div>
              </LiquidCard>

              {/* 2. Main Content Grid (1:1 비율 적용) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* Left: Input & Engine (절반) */}
                <div className="space-y-6">
                  <LiquidCard className="p-1 flex flex-col h-full">
                    <div className="bg-gradient-to-r from-green-900/20 to-transparent px-6 py-4 border-b border-white/5 flex items-center justify-between">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Database className="w-5 h-5 text-green-400" /> 데이터 입력
                      </h2>
                      <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                        <button
                          onClick={() => setInputMethod('manual')}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${inputMethod === 'manual' ? 'bg-green-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                          <Keyboard className="w-3 h-3" /> 직접
                        </button>
                        <button
                          onClick={() => setInputMethod('excel')}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${inputMethod === 'excel' ? 'bg-green-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                          <FileSpreadsheet className="w-3 h-3" /> 엑셀
                        </button>
                      </div>
                    </div>

                    <div className="p-6 flex-1">
                      <InnerGlass className="h-full min-h-[400px] force-readable">
                        <div className="p-4">
                          {inputMethod === 'manual' ? (
                            <ManualInput analysisType={analysisType} onSaveSample={handleAddOrUpdateSample} />
                          ) : (
                            <ExcelUpload
                              analysisType={analysisType}
                              onSamplesUploaded={handleSamplesUploaded}
                              onDownloadTemplate={handleDownloadTemplate}
                            />
                          )}
                        </div>
                      </InnerGlass>
                    </div>
                  </LiquidCard>

                  <LiquidCard className="p-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Calculation Status</h3>
                    <InnerGlass className="p-4">
                      <CalculationEngine samples={selectedSamples} />
                    </InnerGlass>
                  </LiquidCard>
                </div>

                {/* Right: Results Table (절반) */}
                <div className="h-full">
                  <LiquidCard className="h-full min-h-[600px] flex flex-col">
                    <div className="bg-gradient-to-r from-indigo-900/20 to-transparent px-6 py-4 border-b border-white/5 flex items-center justify-between rounded-t-3xl overflow-hidden">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Table className="w-5 h-5 text-indigo-400" /> 분석 결과
                      </h2>
                      <div className="px-3 py-1 rounded-full bg-white/10 text-xs text-gray-300 font-medium border border-white/10">
                        {samples.length} Samples
                      </div>
                    </div>
                    <div className="p-6 flex-1 bg-transparent">
                      <InnerGlass className="h-full shadow-inner">
                        <div className="p-2 h-full overflow-hidden rounded-xl results-ux force-readable">
                          <SampleResults
                            samples={groupedAndSortedSamples}
                            selectedIds={selectedSampleIds}
                            onSelectionChange={setSelectedSampleIds}
                            onEdit={handleAddOrUpdateSample}
                            onRemove={handleRemoveSample}
                            onRemoveMultiple={handleRemoveMultipleSamples}
                            analysisType={analysisType}
                          />
                        </div>
                      </InnerGlass>
                    </div>
                  </LiquidCard>
                </div>

              </div>
            </motion.div>
          ) : (
            <motion.div
              key="visualization"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <LiquidCard className="min-h-[600px] p-1">
                <div className="bg-gradient-to-r from-purple-900/20 to-transparent px-6 py-4 border-b border-white/5 flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" /> 데이터 시각화
                  </h2>
                </div>

                <div className="p-6">
                  <InnerGlass className="min-h-[500px] force-readable">
                    <div className="p-6">
                      <ChartVisualization samples={allCalculatedSamples} />
                    </div>
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
