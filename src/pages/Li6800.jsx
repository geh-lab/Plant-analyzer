import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Card, CardContent
} from "@/components/ui/card";
import { 
  Leaf, Sun, Activity, Settings, AlertTriangle, Wrench, 
  Info, Video, Timer, Droplet, Zap, Play, Ruler, MonitorPlay, Beaker, Plug, Gauge, Stethoscope, XCircle, ArrowRight, Scan, Usb, FileText, Edit3, HelpCircle, Database, CheckCircle2, FileSpreadsheet, Wind, BookOpen, MessageSquare, ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Li6800() {
  const [activeProtocol, setActiveProtocol] = useState("spot_meas");
  const [hardwareTab, setHardwareTab] = useState("part1");
  const [troubleTab, setTroubleTab] = useState("calibration");

  // ----------------------------------------------------------------
  // 🔗 외부 링크 설정 (사용자 제공 링크 적용)
  // ----------------------------------------------------------------
  const EXTERNAL_LINKS = {
    // 구글 드라이브 PDF 링크
    manualPdf: "https://drive.google.com/file/d/1nrqk1GON1FsIoPysQtQOGgkiUXJOy0KG/view?usp=sharing",
    // NotebookLM AI 채팅 링크
    aiChat: "https://notebooklm.google.com/notebook/2cc4cefa-4bb6-405d-b83f-49d74ce5c188"
  };

  // ----------------------------------------------------------------
  // 📹 사용자 유튜브 영상 ID 관리
  // ----------------------------------------------------------------
  const YOUTUBE_VIDEO_IDS = {
    hardware: {
      part1: "5sZ6T5nwIko", 
      part2: "0cBmQYEbLaw", 
      part3: "xUOHknO_tBA", 
      part4: "5Zo2NzJTGaY"  
    },
    protocols: {
      spot_meas: "0tN7VzwNprs", 
      light_response: "uE7qvL1k99g", 
      aci_curve: "v12OdvKQEUg",     
      range_match: "7fwDaFZEwLE"    
    }
  };

  // ----------------------------------------------------------------
  // 1. 🚨 필수 체크리스트 데이터
  // ----------------------------------------------------------------
  const criticalChecks = [
    {
      title: "Warm-up (예열)",
      desc: "전원 ON 후 20분 대기",
      detail: "IRGA 온도 50℃ 도달 및 'Ready' 상태 확인.",
      icon: <Timer className="h-6 w-6 text-orange-600" />,
      color: "bg-orange-50 border-orange-200 text-orange-900"
    },
    {
      title: "Chemicals (약품)",
      desc: "변색 시 즉시 교체",
      detail: "소다라임(보라색 X), 드라이라이트(분홍색 X).",
      icon: <Droplet className="h-6 w-6 text-blue-600" />,
      color: "bg-blue-50 border-blue-200 text-blue-900"
    },
    {
      title: "Leaf Area (엽면적)",
      desc: "S값 설정 필수",
      detail: "잎이 챔버(3x3=9㎠)를 꽉 채우지 못하면 면적 수정 필수.",
      icon: <Ruler className="h-6 w-6 text-green-600" />,
      color: "bg-green-50 border-green-200 text-green-900"
    }
  ];

  // ----------------------------------------------------------------
  // 2. ⚙️ 기본 하드웨어 세팅 데이터
  // ----------------------------------------------------------------
  const hardwareGuideData = {
    part1: {
      id: "part1",
      title: "장비 명칭 및 원리",
      icon: <Info className="w-5 h-5" />,
      videoKey: "part1",
      steps: [
        { title: "Console & Head", desc: "본체(Console)와 분석기(Head)의 역할 이해. Head에는 IRGA(적외선 가스 분석기) 2개가 내장됨." },
        { title: "IRGA 원리", desc: "Reference(기준)와 Sample(챔버 거친 공기)의 CO₂/H₂O 차이(Delta)를 측정하여 광합성을 계산함." },
        { title: "거울(Mirror) 관리", desc: "분석기 내부 거울이 오염되면 빛이 산란되므로 깨끗한 증류수 사용 필수." }
      ],
      tip: "IRGA는 온도에 민감하므로 충분한 워밍업이 없으면 정확도가 떨어집니다."
    },
    part2: {
      id: "part2",
      title: "약품(Chemicals) 교체",
      icon: <Beaker className="w-5 h-5" />,
      videoKey: "part2",
      steps: [
        { title: "소다라임 (Soda Lime)", desc: "CO₂ 제거용. 보라색으로 변하면 교체. 꽉 채우지 말고 90%만 채울 것." },
        { title: "드라이라이트 (Drierite)", desc: "수분 제거용. 분홍색으로 변하면 교체. 가루가 날리지 않게 털어내고 장착." },
        { title: "장착 주의사항", desc: "통을 수직으로 세워서 잠글 것. 기울이면 나사선에 가루가 껴서 고장의 원인이 됨." }
      ],
      tip: "고무 O-ring에 먼지가 묻으면 미세 누수가 발생하므로 항상 깨끗이 닦아주세요."
    },
    part3: {
      id: "part3",
      title: "연결 및 워밍업",
      icon: <Plug className="w-5 h-5" />,
      videoKey: "part3",
      steps: [
        { title: "케이블 연결", desc: "Head Cable의 빨간 점을 12시 방향으로 맞춰 '딸깍' 소리가 나게 체결." },
        { title: "Flow On & Wait", desc: "전원을 켜고 Flow를 켠 상태로 10~20분 대기 (IRGA 온도 50℃ 도달까지)." },
        { title: "챔버 관리", desc: "보관 시 챔버를 닫아두면 가스켓이 눌려 변형됨. 반드시 열어서(Open) 보관." }
      ],
      tip: "아침에 장비 켜고 바로 측정하지 마시고, Flow 켜두고 10분 정도 다른 준비를 하세요."
    },
    part4: {
      id: "part4",
      title: "제로잉 및 환경설정",
      icon: <Gauge className="w-5 h-5" />,
      videoKey: "part4",
      steps: [
        { title: "H₂O Zero", desc: "H₂O Scrub을 켜고 15~20분 후 수치가 안정되면 Zero 버튼 클릭." },
        { title: "CO₂ Zero", desc: "H₂O가 끝나면 CO₂ Scrub을 켜고 5~10분 후 Zero 버튼 클릭." },
        { title: "환경 제어 설정", desc: "Flow(500~700), Fan(10,000rpm), Temp(T_air 제어 권장)." }
      ],
      tip: "제로잉은 정확한 측정을 위한 기준점을 잡는 과정이므로 시간이 걸리더라도 꼭 수행하세요."
    }
  };

  // ----------------------------------------------------------------
  // 3. 📊 분석 프로토콜 데이터
  // ----------------------------------------------------------------
  const protocols = {
    spot_meas: {
      id: "spot_meas",
      title: "일반 광합성 측정 (Spot)",
      icon: <Leaf className="w-5 h-5" />,
      desc: "현재 상태의 광합성률을 정확하게 측정하기 위한 표준 시퀀스입니다.",
      sequence: [
        { title: "7/7 Check", desc: "Flow, Temp 등 7가지 항목 제어 상태 확인 (녹색불)", highlight: "System OK" },
        { title: "Delta CO₂ Check", desc: "빈 챔버에서 Ref/Sample 차이가 0에 수렴 확인", highlight: "Zero Check" },
        { title: "Pre-Match", desc: "빈 챔버 상태에서 Match 실행 (IRGA 0점 보정)", highlight: "1차 Match" },
        { title: "Leaf Clamping", desc: "잎을 물림 (잎맥 피하기, 가스켓 밀착)", highlight: "잎 올리기" },
        { title: "Stabilization", desc: "그래프 기울기 평탄화 대기 (Induction)", highlight: "1차 안정화" },
        { title: "Mid-Match", desc: "잎이 있는 상태에서 다시 Match 실행 (Drift 제거)", highlight: "2차 Match" },
        { title: "Re-Stabilization", desc: "Match 후 튀는 값이 가라앉을 때까지 대기", highlight: "2차 안정화" },
        { title: "Logging", desc: "데이터 저장 (Log 버튼)", highlight: "Logging" }
      ],
      config: [
        { label: "Leaf Area (S)", value: "기본 9㎠ (수정 필수)" },
        { label: "Flow", value: "500 µmol s⁻¹" },
        { label: "Fan Speed", value: "10,000 RPM" },
        { label: "Match", value: "수동 실행" }
      ],
      caution: "Leaf Area(S)를 수정하지 않으면 광합성 값(A)이 실제보다 낮게 계산됩니다. (A = Flow × ΔCO₂ / Area)"
    },
    light_response: {
      id: "light_response",
      title: "Light Response Curve",
      icon: <Sun className="w-5 h-5" />,
      desc: "빛의 세기에 따른 광합성 반응(LCP, LSP)을 분석합니다.",
      sequence: [
        { title: "광원 설정", desc: "Red 90% : Blue 10% (기공 개폐 유도)", highlight: "파장 비율" },
        { title: "시퀀스 설정", desc: "1500(고광도) → 0(암흑) 순서 (High to Low)", highlight: "반응 속도 ↑" },
        { title: "환경 제어", desc: "Reference가 아닌 Sample CO₂를 400으로 고정", highlight: "CO2_S 고정" },
        { title: "Match 설정", desc: "광도 변화마다 'Always Match' 설정", highlight: "자동 매치" }
      ],
      config: [
        { label: "Target", value: "CO₂_S 400" },
        { label: "Temp", value: "T_leaf 고정" },
        { label: "Match", value: "Every Log" }
      ],
      caution: "Sample CO₂를 고정하지 않으면 광합성으로 인해 챔버 내 CO₂가 고갈되어 데이터가 왜곡됩니다."
    },
    aci_curve: {
      id: "aci_curve",
      title: "A-Ci Curve Analysis",
      icon: <Activity className="w-5 h-5" />,
      desc: "CO₂ 농도 변화에 따른 생화학적 능력(Vcmax, Jmax)을 분석합니다.",
      sequence: [
        { title: "유도 (Induction)", desc: "400ppm, 포화광에서 20분간 안정화 (기공 활짝 열기)", highlight: "Start 400" },
        { title: "시퀀스 방향", desc: "400 → 50(Down) → 400 → 1200(Up) 순서로 진행", highlight: "Hysteresis 방지" },
        { title: "대기 시간 (Wait)", desc: "Min 60s / Max 120s (너무 길면 식물 스트레스)", highlight: "Timing" },
        { title: "Match 설정", desc: "농도 급변 구간이므로 매 포인트 'Always Match' 필수", highlight: "Drift 제거" }
      ],
      config: [
        { label: "Light", value: "1200~1500 (Saturating)" },
        { label: "Wait Time", value: "60s ~ 120s" },
        { label: "Match", value: "Every Log" }
      ],
      caution: "고농도(1200)에서 시작하면 기공이 닫히는 '이력 현상(Hysteresis)'이 발생해 저농도 데이터가 왜곡됩니다. 반드시 400에서 내려갔다가 올라가세요."
    },
    range_match: {
      id: "range_match",
      title: "Range Match (고급 기능)",
      icon: <Scan className="w-5 h-5" />,
      desc: "Fast A-Ci(고속 측정)를 위해 0~2000ppm 전 구간을 미리 매칭하는 고급 기능입니다.",
      sequence: [
        { title: "안정화 (Stability)", desc: "기본 상태에서 장비를 충분히 안정화시킵니다.", highlight: "Stable" },
        { title: "Point Match", desc: "일반적인 Point Match(단타 매치)를 먼저 수행합니다.", highlight: "Pre-check" },
        { title: "H₂O Range Match", desc: "습도 전 구간에 대한 매칭을 수행합니다. (약 5분 소요)", highlight: "H2O Match" },
        { title: "CO₂ Range Match", desc: "CO₂ 0~2000ppm 전 구간을 매칭합니다. (약 5~10분 소요)", highlight: "CO₂ Match" }
      ],
      config: [
        { label: "Frequency", value: "월 1회 권장" },
        { label: "Target", value: "Rapid A-Ci" },
        { label: "Tool", value: "BP Program" }
      ],
      caution: "일반적인 Light Curve나 Spot 측정만 한다면 굳이 할 필요 없습니다. Rapid A-Ci (DAT) 기술을 사용할 때만 수행하세요."
    }
  };

  // ----------------------------------------------------------------
  // 4. 🚨 문제 해결 및 데이터 관리 데이터
  // ----------------------------------------------------------------
  const troubleData = {
    calibration: {
      id: "calibration",
      title: "데이터 검증 (Data Check)",
      icon: <XCircle className="w-5 h-5" />,
      items: [
        {
          title: "표준 가스 수치 불일치",
          desc: "예: 437.6ppm 표준 가스를 주입했는데 144ppm이 나옴. ➡ Zero/Span Calibration 필수!",
          icon: <Gauge className="w-6 h-6 text-red-600" />,
          bg: "bg-red-50 border-red-200"
        },
        {
          title: "RH(습도) 값 반응 없음",
          desc: "습도가 올라가지 않는다면 센서 고장보다는 Calibration 설정(Zeroing) 문제일 가능성이 높습니다.",
          icon: <Droplet className="w-6 h-6 text-orange-600" />,
          bg: "bg-orange-50 border-orange-200"
        }
      ]
    },
    hardware: {
      id: "hardware",
      title: "하드웨어 유지보수",
      icon: <Stethoscope className="w-5 h-5" />,
      items: [
        {
          title: "USB 인식 문제",
          desc: "파일명에 한글/특수문자 금지. 헤드(Head)가 연결되어 있어야 콘솔이 USB를 인식합니다.",
          icon: <Usb className="w-6 h-6 text-blue-600" />,
          bg: "bg-blue-50 border-blue-200"
        },
        {
          title: "챔버 누수 (Leak)",
          desc: "가스켓이 눌려있거나 O-ring에 먼지가 끼었는지 확인하세요. Delta P를 낮추는 것도 방법입니다.",
          icon: <Wind className="w-6 h-6 text-slate-600" />,
          bg: "bg-slate-50 border-slate-200"
        }
      ]
    },
    tips: {
      id: "tips",
      title: "실무 꿀팁 (Tips)",
      icon: <HelpCircle className="w-5 h-5" />,
      items: [
        {
          title: "데이터 확인 (View Log)",
          desc: "엑셀(.xls) 말고 일반 로그 파일을 열면 기기에서 바로 그래프(Plot)를 그려볼 수 있습니다.",
          icon: <FileText className="w-6 h-6 text-green-600" />,
          bg: "bg-green-50 border-green-200"
        },
        {
          title: "엽면적(S) 재계산",
          desc: "측정 시 면적을 잘못 입력했더라도, 엑셀 수식에서 Area(S) 값만 수정하면 데이터가 자동 보정됩니다.",
          icon: <Edit3 className="w-6 h-6 text-purple-600" />,
          bg: "bg-purple-50 border-purple-200"
        }
      ]
    },
    knowhow: {
      id: "knowhow",
      title: "현장 노하우 (Know-how)",
      icon: <Database className="w-5 h-5" />,
      items: [
        {
          title: "배터리 관리",
          desc: "장시간 야외 측정 시 여분 배터리는 필수이며, 겨울철에는 보온에 신경 써야 방전이 덜 됩니다.",
          icon: <Zap className="w-6 h-6 text-yellow-600" />,
          bg: "bg-yellow-50 border-yellow-200"
        },
        {
          title: "측정 시간대",
          desc: "일반적으로 오전 10시 ~ 오후 2시 사이가 광합성이 가장 활발하여 데이터가 안정적입니다.",
          icon: <Sun className="w-6 h-6 text-orange-600" />,
          bg: "bg-orange-50 border-orange-200"
        }
      ]
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-10 font-sans relative">
      
      {/* ---------------------------------------------------------- */}
      {/* ✨ [NEW] 우측 하단 플로팅 버튼 (Floating Widget) */}
      {/* ---------------------------------------------------------- */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50 items-end">
        
        {/* 1. AI 질문하기 버튼 */}
        <motion.a
          href={EXTERNAL_LINKS.aiChat}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all font-bold group border border-white/20"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="hidden sm:inline">AI에게 질문하기</span>
          <span className="sm:hidden">AI 질문</span>
        </motion.a>

        {/* 2. PDF 매뉴얼 버튼 */}
        <motion.a
          href={EXTERNAL_LINKS.manualPdf}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-5 py-3 rounded-full shadow-md hover:bg-gray-50 transition-all font-bold"
        >
          <BookOpen className="w-5 h-5 text-red-600" />
          <span className="hidden sm:inline">공식 매뉴얼(PDF)</span>
          <span className="sm:hidden">매뉴얼</span>
        </motion.a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
            LI-6800 마스터 가이드
          </h1>
          
          {/* ✨ [NEW] 헤더 AI 배너 */}
          <div className="mt-4 mb-4 flex flex-wrap justify-center gap-3">
              <a 
                href={EXTERNAL_LINKS.aiChat} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-bold hover:bg-purple-200 transition-colors border border-purple-200 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" /> 궁금한 점은 NotebookLM AI에게 물어보세요 &rarr;
              </a>
          </div>

          <p className="text-gray-600 mt-2 font-medium text-sm sm:text-base">
            기본 측정부터 문제 해결까지, 완벽한 데이터 측정을 위한 매뉴얼
          </p>
        </motion.div>

        {/* 1. 사용 전 필수 체크리스트 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              1. 사용 전 필수 체크리스트 (Pre-Flight Check)
            </h2>
          </div>
          
          <Card className="border-l-4 border-red-500 shadow-sm bg-white overflow-hidden">
            <div className="p-6 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {criticalChecks.map((check, idx) => (
                  <div key={idx} className={`p-6 rounded-xl border flex flex-col items-start gap-4 bg-white shadow-sm transition-all hover:shadow-md hover:border-slate-300`}>
                    <div className={`p-3 rounded-full ${check.color.split(' ')[0]}`}>
                      {check.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{check.title}</h3>
                      <p className="text-base font-bold text-gray-700 mb-2">{check.desc}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{check.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* 2. 기본 하드웨어 세팅 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-gray-800">2. 기본 하드웨어 세팅 (Step-by-Step)</h2>
          </div>

          <Card className="border-gray-200 shadow-md overflow-hidden bg-white">
            <div className="grid grid-cols-2 md:grid-cols-4 bg-slate-50 border-b border-gray-200">
              {Object.values(hardwareGuideData).map((data) => (
                <button
                  key={data.id}
                  onClick={() => setHardwareTab(data.id)}
                  className={`py-4 px-2 text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-2 transition-all border-r border-slate-200 last:border-r-0 hover:bg-white
                    ${hardwareTab === data.id 
                      ? "bg-white text-blue-700 shadow-inner border-b-4 border-b-blue-600" 
                      : "text-gray-500 border-b-4 border-b-transparent"}`}
                >
                  <span className="p-1.5 rounded-full bg-blue-50 text-blue-600">{data.icon}</span>
                  <span>{data.title}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col">
              {/* 상단: 영상 영역 */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={hardwareTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full bg-black aspect-video relative"
                >
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_IDS.hardware[hardwareGuideData[hardwareTab].videoKey]}`}
                    title={hardwareGuideData[hardwareTab].title}
                    allowFullScreen
                  ></iframe>
                  <div className="absolute top-4 left-4 bg-blue-600/90 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-md backdrop-blur-sm">
                    <Video className="w-4 h-4" /> <span className="font-bold">{hardwareGuideData[hardwareTab].title}</span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* 하단: 설명 텍스트 영역 */}
              <CardContent className="p-8 lg:p-10 bg-white">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={hardwareTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3 border-b border-gray-100 pb-3">
                      <Wrench className="w-6 h-6 text-gray-500" /> {hardwareGuideData[hardwareTab].title} 상세 설명
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ul className="space-y-6">
                        {hardwareGuideData[hardwareTab].steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-5 p-5 rounded-xl border border-gray-100 bg-slate-50/50 hover:bg-slate-50 transition-colors shadow-sm">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-base font-bold border border-blue-200 mt-0.5">
                                {i + 1}
                            </span>
                            <div>
                                <strong className="block text-gray-900 text-base mb-1.5">{step.title}</strong>
                                <span className="text-sm text-gray-700 leading-relaxed font-medium">{step.desc}</span>
                            </div>
                            </li>
                        ))}
                        </ul>
                        
                        <div className="h-full">
                            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-base text-yellow-900 shadow-sm flex flex-col gap-4 h-full">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-yellow-100 rounded-full">
                                        <Info className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <strong className="text-xl text-yellow-800">Expert Tip</strong>
                                </div>
                                <p className="leading-relaxed font-medium text-sm">
                                    {hardwareGuideData[hardwareTab].tip}
                                </p>
                            </div>
                        </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </div>
          </Card>
        </section>

        {/* 3. 분석 프로토콜 및 고급 기능 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-gray-800">3. 분석 프로토콜 및 고급 기능</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Object.values(protocols).map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProtocol(p.id)}
                className={`py-5 px-3 rounded-2xl border-2 font-bold text-base transition-all flex flex-col items-center justify-center gap-3 hover:shadow-md
                  ${activeProtocol === p.id 
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200" 
                    : "border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:bg-slate-50"}`}
              >
                <span className={`p-2.5 rounded-full shadow-sm ${activeProtocol === p.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}>
                  {p.icon}
                </span>
                <span>{p.title}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeProtocol}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-blue-100 shadow-lg overflow-hidden bg-white">
                <div className="w-full aspect-[21/9] bg-black relative border-b border-gray-100">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_IDS.protocols[activeProtocol]}`}
                    title={`${protocols[activeProtocol].title} Video`}
                    allowFullScreen
                  ></iframe>
                   <div className="absolute top-4 left-4 bg-blue-600/90 text-white text-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-md backdrop-blur-sm">
                      <Play className="w-4 h-4 fill-current" /> 
                      <span className="font-bold">{protocols[activeProtocol].title} 가이드</span>
                    </div>
                </div>

                <CardContent className="p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                  
                  {/* 측정 시퀀스 */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-8 flex items-center gap-3 text-xl border-b border-gray-100 pb-3">
                      <FileSpreadsheet className="w-6 h-6 text-blue-600" /> 측정 시퀀스 (Sequence)
                    </h4>
                    <ol className="relative border-l-2 border-blue-100 ml-3 space-y-8">
                      {protocols[activeProtocol].sequence.map((step, idx) => (
                        <li key={idx} className="ml-8">
                          <span className="absolute flex items-center justify-center w-9 h-9 bg-blue-100 rounded-full -left-[19px] ring-4 ring-white">
                            <span className="text-sm font-bold text-blue-600">{idx + 1}</span>
                          </span>
                          <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <h5 className="text-base font-bold text-gray-900 mb-2 flex items-center justify-between">
                              {step.title}
                              <Badge variant="outline" className="text-sm px-3 py-1 border-blue-200 text-blue-700 bg-blue-50">
                                {step.highlight}
                              </Badge>
                            </h5>
                            <p className="text-sm text-gray-700 leading-relaxed font-medium">
                              {step.desc}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* 설정값 & Logging & 주의사항 */}
                  <div className="space-y-8 flex flex-col h-full">
                    
                    {/* 설정값 */}
                    <div className="bg-white p-7 rounded-2xl border border-gray-200 shadow-sm">
                      <h4 className="font-bold text-gray-800 mb-6 flex items-center gap-3 text-xl border-b border-gray-100 pb-3">
                        <Wrench className="w-6 h-6 text-gray-600" /> 필수 설정값 (Config)
                      </h4>
                      <div className="grid grid-cols-1 gap-5">
                        {protocols[activeProtocol].config.map((conf, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-sm font-bold text-gray-700 flex items-center gap-3">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              {conf.label}
                            </span>
                            <span className="text-sm font-bold text-blue-700 bg-blue-50 px-4 py-1.5 rounded-lg border border-blue-100">
                              {conf.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Logging Method */}
                    {activeProtocol !== 'range_match' && (
                      <div className="bg-blue-50 p-7 rounded-2xl border border-blue-100 shadow-sm">
                        <h4 className="font-bold text-blue-900 mb-5 flex items-center gap-3 text-xl border-b border-blue-200/50 pb-3">
                          <MonitorPlay className="w-6 h-6" /> Logging 방법
                        </h4>
                        <div className="flex flex-col sm:flex-row items-stretch justify-between text-base text-blue-800 font-bold gap-4">
                          <div className="flex flex-col items-center text-center flex-1 bg-white/80 p-4 rounded-xl border border-blue-100 shadow-sm">
                            <div className="w-9 h-9 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-2 text-sm border border-green-200">1</div>
                            <span>안정화 확인<br/><span className="text-sm font-normal text-blue-600">(초록색 신호)</span></span>
                          </div>
                          <div className="hidden sm:flex items-center justify-center">
                            <ArrowRight className="w-6 h-6 text-blue-300" />
                          </div>
                          <div className="flex flex-col items-center text-center flex-1 bg-white/80 p-4 rounded-xl border border-blue-100 shadow-sm">
                            <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-2 text-sm border border-blue-200">2</div>
                            <span>Log 버튼<br/><span className="text-sm font-normal text-blue-600">(물리/터치)</span></span>
                          </div>
                          <div className="hidden sm:flex items-center justify-center">
                            <ArrowRight className="w-6 h-6 text-blue-300" />
                          </div>
                          <div className="flex flex-col items-center text-center flex-1 bg-white/80 p-4 rounded-xl border border-blue-100 shadow-sm">
                            <div className="w-9 h-9 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center mb-2 text-sm border border-orange-200">3</div>
                            <span>Beep 소리<br/><span className="text-sm font-normal text-blue-600">(저장 확인)</span></span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-auto bg-red-50 p-6 rounded-2xl border border-red-100 flex items-start gap-5 shadow-sm">
                      <AlertTriangle className="w-7 h-7 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-red-900 text-lg mb-2">주의사항 (Caution)</h4>
                        <p className="text-base text-red-800 leading-relaxed font-medium">
                          {protocols[activeProtocol].caution}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* 4. 문제 해결 및 데이터 관리 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-gray-800">4. 문제 해결 및 데이터 관리</h2>
          </div>
          
          <Card className="bg-white border-gray-200 shadow-md overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 bg-slate-50 border-b border-gray-200">
              {Object.values(troubleData).map((data) => (
                <button
                  key={data.id}
                  onClick={() => setTroubleTab(data.id)}
                  className={`py-4 px-2 text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-2 transition-all border-r border-slate-200 last:border-r-0 hover:bg-white
                    ${troubleTab === data.id 
                      ? "bg-white text-blue-700 shadow-inner border-b-4 border-b-blue-600" 
                      : "text-gray-500 border-b-4 border-b-transparent"}`}
                >
                  <span className="p-1.5 rounded-full bg-blue-50 text-blue-600">{data.icon}</span>
                  <span>{data.title}</span>
                </button>
              ))}
            </div>

            <div className="p-6 lg:p-10 bg-white">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={troubleTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {troubleData[troubleTab].items.map((item, idx) => (
                      <div key={idx} className={`h-full p-6 rounded-2xl border ${item.bg} flex items-start gap-5 shadow-sm hover:shadow-md transition-shadow`}>
                        <div className="p-3 rounded-full bg-white shadow-sm shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-base mb-3">{item.title}</h4>
                          <p className="text-sm text-gray-700 leading-relaxed font-medium">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ✨ [NEW] 해결책을 못 찾았을 때 유도하는 AI 섹션 */}
                  <div className="mt-8 p-8 bg-indigo-50 border border-indigo-100 rounded-2xl text-center flex flex-col items-center justify-center gap-4">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-indigo-900 mb-1">원하는 해결책을 찾지 못하셨나요?</h3>
                      <p className="text-indigo-700 text-sm">
                        LI-6800 공식 매뉴얼을 학습한 AI가 복잡한 에러 코드와 증상에 대해 답변해 드립니다.
                      </p>
                    </div>
                    <a
                      href={EXTERNAL_LINKS.aiChat}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                    >
                      AI 채팅으로 정밀 진단하기 <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>
          </Card>
        </section>

      </div>
    </div>
  );
}