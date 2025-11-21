import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { 
  Leaf, Sun, Activity, Settings, AlertTriangle, Wrench, 
  Info, Video, Thermometer, Wind, CheckCircle2, Timer, Droplet, Zap, Moon, Play, Scale, FileSpreadsheet, Ruler, MonitorPlay, Beaker, Plug, Gauge, Stethoscope, XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Li6800() {
  const [activeProtocol, setActiveProtocol] = useState("spot_meas");
  const [plantTypeTab, setPlantTypeTab] = useState("c3");
  const [hardwareTab, setHardwareTab] = useState("part1");

  // ----------------------------------------------------------------
  // 📹 사용자 유튜브 영상 ID 관리
  // ----------------------------------------------------------------
  const YOUTUBE_VIDEO_IDS = {
    hardware: {
      part1: "5sZ6T5nwIko", // Part 1: 장비 명칭 및 원리
      part2: "0cBmQYEbLaw", // Part 2: 약품 교체
      part3: "xUOHknO_tBA", // Part 3: 연결 및 워밍업
      part4: "5Zo2NzJTGaY"  // Part 4: 제로잉
    },
    protocols: {
      spot_meas: "0tN7VzwNprs",
      light_response: "LIGHT_VIDEO_ID",
      aci_curve: "v12OdvKQEUg"
    },
    troubleshooting: "TROUBLESHOOTING_VIDEO_ID" 
  };

  // ----------------------------------------------------------------
  // 1. 🚨 필수 체크리스트
  // ----------------------------------------------------------------
  const criticalChecks = [
    {
      title: "Warm-up (예열)",
      desc: "전원 ON 후 20분 대기",
      detail: "IRGA 온도 50℃ 도달 및 'Ready' 상태 확인.",
      icon: <Timer className="h-5 w-5 text-orange-600" />,
      color: "bg-orange-50 border-orange-200 text-orange-900"
    },
    {
      title: "Chemicals (약품)",
      desc: "변색 시 즉시 교체",
      detail: "소다라임(보라색 X), 드라이라이트(분홍색 X).",
      icon: <Droplet className="h-5 w-5 text-blue-600" />,
      color: "bg-blue-50 border-blue-200 text-blue-900"
    },
    {
      title: "Leaf Area (엽면적)",
      desc: "S값 설정 필수",
      detail: "잎이 챔버(3x3=9㎠)를 꽉 채우지 못하면 면적 수정 필수.",
      icon: <Ruler className="h-5 w-5 text-green-600" />,
      color: "bg-green-50 border-green-200 text-green-900"
    }
  ];

  // ----------------------------------------------------------------
  // 2. ⚙️ 기본 하드웨어 세팅 데이터
  // ----------------------------------------------------------------
  const hardwareGuideData = {
    part1: {
      title: "Part 1. 장비 명칭 및 원리",
      icon: <Info className="w-4 h-4" />,
      videoKey: "part1",
      steps: [
        { title: "Console & Head", desc: "본체(Console)와 분석기(Head)의 역할 이해. Head에는 IRGA(적외선 가스 분석기) 2개가 내장됨." },
        { title: "IRGA 원리", desc: "Reference(기준)와 Sample(챔버 거친 공기)의 CO₂/H₂O 차이(Delta)를 측정하여 광합성을 계산함." },
        { title: "거울(Mirror) 관리", desc: "분석기 내부 거울이 오염되면 빛이 산란되므로 깨끗한 증류수 사용 필수." }
      ],
      tip: "IRGA는 온도에 민감하므로 충분한 워밍업이 없으면 정확도가 떨어집니다."
    },
    part2: {
      title: "Part 2. 약품(Chemicals) 교체",
      icon: <Beaker className="w-4 h-4" />,
      videoKey: "part2",
      steps: [
        { title: "소다라임 (Soda Lime)", desc: "CO₂ 제거용. 보라색으로 변하면 교체. 꽉 채우지 말고 90%만 채울 것." },
        { title: "드라이라이트 (Drierite)", desc: "수분 제거용. 분홍색으로 변하면 교체. 가루가 날리지 않게 털어내고 장착." },
        { title: "장착 주의사항", desc: "통을 수직으로 세워서 잠글 것. 기울이면 나사선에 가루가 껴서 고장의 원인이 됨." }
      ],
      tip: "고무 O-ring에 먼지가 묻으면 미세 누수가 발생하므로 항상 깨끗이 닦아주세요."
    },
    part3: {
      title: "Part 3. 연결 및 워밍업",
      icon: <Plug className="w-4 h-4" />,
      videoKey: "part3",
      steps: [
        { title: "케이블 연결", desc: "Head Cable의 빨간 점을 12시 방향으로 맞춰 '딸깍' 소리가 나게 체결." },
        { title: "Flow On & Wait", desc: "전원을 켜고 Flow를 켠 상태로 10~20분 대기 (IRGA 온도 50℃ 도달까지)." },
        { title: "챔버 관리", desc: "보관 시 챔버를 닫아두면 가스켓이 눌려 변형됨. 반드시 열어서(Open) 보관." }
      ],
      tip: "아침에 장비 켜고 바로 측정하지 마시고, Flow 켜두고 10분 정도 다른 준비를 하세요."
    },
    part4: {
      title: "Part 4. 제로잉 및 환경설정",
      icon: <Gauge className="w-4 h-4" />,
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
  // 3. 📊 실험 프로토콜 데이터
  // ----------------------------------------------------------------
  const protocols = {
    spot_meas: {
      id: "spot_meas",
      title: "일반 광합성 측정 (Spot)",
      icon: <Leaf className="h-5 w-5" />,
      desc: "현재 상태의 광합성률을 정확하게 측정하기 위한 표준 시퀀스입니다.",
      sequence: [
        { text: "7/7 Check: Flow, Temp, CO2 등 7가지 항목 제어 상태 확인 (녹색불)", highlight: "System OK" },
        { text: "Delta CO2 Check: 빈 챔버 상태에서 Ref/Sample 차이가 0에 수렴하는지 확인", highlight: "Zero Check" },
        { text: "Pre-Match: 빈 챔버 상태에서 Match 실행 (IRGA 0점 보정)", highlight: "1차 Match" },
        { text: "Leaf Clamping: 잎을 물림 (잎맥 피하기, 가스켓 밀착 확인)", highlight: "잎 올리기" },
        { text: "Stabilization: 그래프 기울기가 평탄해질 때까지 대기 (Induction)", highlight: "1차 안정화" },
        { text: "Mid-Match: 잎이 있는 상태에서 다시 Match 실행 (Drift 제거)", highlight: "2차 Match" },
        { text: "Re-Stabilization: Match 후 튀는 값이 가라앉을 때까지 잠시 대기", highlight: "2차 안정화" },
        { text: "Logging: 데이터 저장 (Log 버튼)", highlight: "Logging" }
      ],
      config: [
        "Constants > Leaf Area (S): 기본 9㎠ (잎이 작으면 반드시 수정!)",
        "Flow: 500 µmol s⁻¹ / Fan: 10,000 RPM",
        "Match: 수동 실행 (안정화 후)"
      ],
      caution: "Leaf Area(S)를 수정하지 않으면 광합성 값(A)이 실제보다 낮게 계산됩니다. (A = Flow × ΔCO2 / Area)"
    },
    light_response: {
      id: "light_response",
      title: "Light Response Curve",
      icon: <Sun className="h-5 w-5" />,
      desc: "빛의 세기에 따른 광합성 반응(LCP, LSP)을 분석합니다.",
      sequence: [
        { text: "광원 설정: Red 90% : Blue 10% (기공 개폐 유도)", highlight: "파장 비율" },
        { text: "시퀀스: 1500(고광도) → 0(암흑) 순서 (High to Low)", highlight: "반응 속도 ↑" },
        { text: "환경 제어: Reference가 아닌 Sample CO₂를 400으로 고정", highlight: "CO2_S 고정" },
        { text: "Match 설정: 광도 변화마다 'Always Match' 설정", highlight: "자동 매치" }
      ],
      config: [
        "Target: CO₂_S 400",
        "Temp: T_leaf 고정",
        "Match: Every Log"
      ],
      caution: "Sample CO₂를 고정하지 않으면 광합성으로 인해 챔버 내 CO₂가 고갈되어 데이터가 왜곡됩니다."
    },
    aci_curve: {
      id: "aci_curve",
      title: "A-Ci Curve Analysis",
      icon: <Activity className="h-5 w-5" />,
      desc: "CO₂ 농도 변화에 따른 식물 생리 기작(Rubisco 등)을 분석합니다.",
      sequence: [
        { text: "유도: 400ppm에서 충분히 안정화 (기공 열림 확인)", highlight: "Induction" },
        { text: "시퀀스: 400 → 50(Down) → 400 → 1200(Up)", highlight: "Hysteresis 방지" },
        { text: "Match: 농도 급변 구간이 많으므로 매 포인트 Match 필수", highlight: "Drift 방지" },
        { text: "후처리: 챔버 밖으로 나간 잎 면적 제외하고 재계산", highlight: "Re-calc" }
      ],
      config: [
        "Ref CO₂ Start: 400",
        "Wait: 60s ~ 120s",
        "Match: Every Log"
      ],
      caution: "0ppm으로 내리는 이유는 세포 내 CO₂를 털어내어(Clear) 반응 속도를 높이고 정확한 루비스코 활성을 보기 위함입니다."
    }
  };

  // ----------------------------------------------------------------
  // 4. 🌿 식물 유형별 가이드
  // ----------------------------------------------------------------
  const plantGuide = {
    c3: {
      type: "C3 식물",
      examples: "벼, 밀, 콩, 감자",
      features: "일반적 광합성. 고온/건조 시 효율 저하.",
      settings: "Standard (Flow 500, CO2 400)",
      tip: "가장 표준적인 설정입니다. 광호흡 영향이 있으므로 온도 제어에 신경 쓰세요."
    },
    c4: {
      type: "C4 식물",
      examples: "옥수수, 사탕수수",
      features: "고효율(CO₂ 농축). 광호흡 거의 없음.",
      settings: "High Flow (600~700), High Light",
      tip: "광합성 속도가 빨라 챔버 내 CO₂가 급격히 줍니다. 유량을 높여 공급을 원활하게 하세요."
    },
    cam: {
      type: "CAM 식물",
      examples: "선인장, 다육식물",
      features: "밤에 기공 오픈, 낮에 닫힘.",
      settings: "Low Flow (200~300), 야간 측정",
      tip: "낮에는 기공이 닫혀 있어 A-Ci 측정이 어렵습니다. 잎이 두꺼우니 폼 가스켓을 사용하세요."
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 flex items-center justify-center gap-3">
            <Leaf className="text-green-600 w-10 h-10" /> 
            LI-6800 마스터 가이드
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            기본 측정부터 문제 해결까지, 완벽한 데이터 측정을 위한 매뉴얼
          </p>
        </motion.div>

        {/* 1. 사용 전 필수 체크리스트 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-500 w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-800">
              1. 사용 전 필수 체크리스트 (Pre-Flight Check)
            </h2>
          </div>
          
          <Card className="border-l-4 border-red-500 shadow-sm bg-white">
            <div className="p-6 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {criticalChecks.map((check, idx) => (
                  <div key={idx} className={`p-5 rounded-xl border flex flex-col items-start gap-3 bg-white shadow-sm transition-all hover:shadow-md hover:border-slate-300`}>
                    <div className={`p-3 rounded-full ${check.color.split(' ')[0]}`}>
                      {check.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg mb-1">{check.title}</h3>
                      <p className="text-sm font-bold text-slate-600 mb-2">{check.desc}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{check.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* 2. 기본 하드웨어 세팅 (통일된 박스 디자인 + 영상) */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Settings className="text-slate-700 w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-800">2. 기본 하드웨어 세팅 (Step-by-Step)</h2>
          </div>

          <Card className="border-slate-200 shadow-md overflow-hidden">
            <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
              {Object.keys(hardwareGuideData).map((key) => (
                <button
                  key={key}
                  onClick={() => setHardwareTab(key)}
                  className={`px-6 py-4 text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap border-b-2 ${
                    hardwareTab === key 
                      ? "bg-white text-blue-600 border-blue-500" 
                      : "text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  {hardwareGuideData[key].icon}
                  <span>{hardwareGuideData[key].title.split(". ")[1]}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={hardwareTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-black aspect-video lg:aspect-auto relative"
                >
                  <iframe
                    className="w-full h-full object-cover min-h-[350px]"
                    src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_IDS.hardware[hardwareGuideData[hardwareTab].videoKey]}`}
                    title={hardwareGuideData[hardwareTab].title}
                    allowFullScreen
                  ></iframe>
                  <div className="absolute top-3 left-3 bg-blue-600/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1 shadow-sm backdrop-blur-sm">
                    <Video className="w-3 h-3" /> {hardwareGuideData[hardwareTab].title}
                  </div>
                </motion.div>
              </AnimatePresence>

              <CardContent className="p-6 lg:p-8 bg-white flex flex-col justify-center h-full min-h-[350px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={hardwareTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-slate-500" /> {hardwareGuideData[hardwareTab].title}
                    </h3>
                    <ul className="space-y-4">
                      {hardwareGuideData[hardwareTab].steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-200 mt-0.5">
                            {i + 1}
                          </span>
                          <div>
                            <strong className="block text-slate-900 text-sm mb-1">{step.title}</strong>
                            <span className="text-sm text-slate-600 leading-relaxed">{step.desc}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-900 shadow-sm flex items-start gap-3">
                      <Info className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block mb-1 text-yellow-800">Expert Tip</strong>
                        {hardwareGuideData[hardwareTab].tip}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </div>
          </Card>
        </section>

        {/* 3. 실험 프로토콜 선택 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-blue-600 w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-800">3. 실험 프로토콜 선택</h2>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.values(protocols).map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProtocol(p.id)}
                className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2
                  ${activeProtocol === p.id 
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" 
                    : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-slate-50"}`}
              >
                {p.icon} {p.title}
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
                <div className="w-full aspect-[21/9] bg-black relative border-b border-slate-100">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_IDS.protocols[activeProtocol]}`}
                    title={`${protocols[activeProtocol].title} Video`}
                    allowFullScreen
                  ></iframe>
                   <div className="absolute top-4 left-4 bg-blue-600/90 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-md backdrop-blur-sm">
                      <Play className="w-3 h-3 fill-current" /> 
                      <span className="font-bold">{protocols[activeProtocol].title} 가이드</span>
                    </div>
                </div>

                <CardContent className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
                      <FileSpreadsheet className="w-5 h-5 text-blue-600" /> 측정 시퀀스 (Sequence)
                    </h4>
                    <ol className="space-y-6 relative border-l-2 border-slate-100 ml-3 pl-8">
                      {protocols[activeProtocol].sequence.map((step, idx) => (
                        <li key={idx} className="relative">
                          <div className="absolute -left-[39px] top-1 w-3 h-3 rounded-full bg-white border-4 border-blue-500"></div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                              Step {idx + 1} : {step.highlight}
                            </span>
                            <p className="text-sm font-medium text-slate-700 leading-relaxed">
                              {step.text.split(step.highlight)[0]}
                              {step.text.split(step.highlight)[1]}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="space-y-6 flex flex-col h-full">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Wrench className="w-4 h-4" /> 필수 설정값 (Config)
                      </h4>
                      <ul className="space-y-3">
                        {protocols[activeProtocol].config.map((conf, i) => (
                          <li key={i} className="text-sm font-medium text-slate-600 flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            {conf}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
                      <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                        <MonitorPlay className="w-4 h-4" /> Logging 방법
                      </h4>
                      <div className="text-sm text-blue-700 space-y-2">
                        <p>1. <strong>Stability Criteria</strong> 만족 확인 (초록색)</p>
                        <p>2. 기기 우측 하단 물리 버튼 <strong>[Log]</strong> 누르기</p>
                        <p>3. 'Beep' 소리 확인 후 다음 단계 진행</p>
                      </div>
                    </div>

                    <div className="mt-auto bg-red-50 p-5 rounded-2xl border border-red-100">
                      <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> 주의사항 (Caution)
                      </h4>
                      <p className="text-sm text-red-700 font-medium leading-relaxed">
                        {protocols[activeProtocol].caution}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* 4. 🚨 문제 해결 및 데이터 검증 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope className="text-slate-700 w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-800">4. 문제 해결 및 데이터 검증</h2>
          </div>

          <Card className="bg-white border-slate-200 shadow-md overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="bg-black aspect-video relative">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_IDS.troubleshooting}`}
                  title="Troubleshooting Video"
                  allowFullScreen
                ></iframe>
                <div className="absolute top-3 left-3 bg-slate-800/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Video className="w-3 h-3" /> 오류 사례 분석
                </div>
              </div>

              <CardContent className="p-6 lg:p-8 bg-white flex flex-col justify-center">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" /> 데이터 신뢰성 체크리스트
                </h3>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  측정값이 이상하다면 다음 사항을 반드시 점검하세요. 
                  특히 <strong>Calibration(교정)</strong>이 틀어지면 모든 데이터가 무의미해집니다.
                </p>
                
                <div className="space-y-4">
                  <div className="flex gap-4 items-start p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="bg-red-100 p-2 rounded-full shrink-0">
                      <Gauge className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <strong className="text-sm text-slate-800 block mb-1">표준 가스 수치 불일치</strong>
                      <p className="text-xs text-slate-600 leading-tight">
                        예: 437ppm 표준 가스를 주입했는데 기기가 144ppm으로 표시됨. 
                        <br/>➡ <strong>Zero/Span Calibration</strong>이 시급한 상태입니다.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="bg-orange-100 p-2 rounded-full shrink-0">
                      <Droplet className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <strong className="text-sm text-slate-800 block mb-1">RH(습도) 값 오류</strong>
                      <p className="text-xs text-slate-600 leading-tight">
                        습도가 안 올라가는 것처럼 보인다면 센서 고장보다는 Calibration 문제일 가능성이 높습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </section>

        {/* 5. 🌿 참고: 식물 유형별 가이드 */}
        <section className="pt-10 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-2">
              <Info className="text-purple-600 w-6 h-6" />
              <h2 className="text-xl font-bold text-slate-800">참고: 식물 유형별 특성</h2>
            </div>
            <div className="flex p-1 bg-slate-200 rounded-lg self-start">
              {["c3", "c4", "cam"].map((type) => (
                <button
                  key={type}
                  onClick={() => setPlantTypeTab(type)}
                  className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                    plantTypeTab === type
                      ? "bg-white text-purple-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white shadow-sm border-slate-200 md:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  {plantTypeTab === 'c3' && <Leaf className="text-green-500" />}
                  {plantTypeTab === 'c4' && <Zap className="text-yellow-500" />}
                  {plantTypeTab === 'cam' && <Moon className="text-indigo-500" />}
                  <CardTitle className="text-lg">{plantGuide[plantTypeTab].type}</CardTitle>
                </div>
                <CardDescription>{plantGuide[plantTypeTab].examples}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Features</span>
                    <p className="text-slate-700 font-medium mt-1">{plantGuide[plantTypeTab].features}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Optimal Settings</span>
                    <p className="text-blue-600 font-bold mt-1 bg-blue-50 inline-block px-3 py-1 rounded-lg">
                      {plantGuide[plantTypeTab].settings}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                  <Info className="w-5 h-5" /> Expert Tip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-800 font-medium leading-relaxed">
                  {plantGuide[plantTypeTab].tip}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

      </div>
    </div>
  );
}
