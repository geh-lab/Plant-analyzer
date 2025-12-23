import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FlaskConical, Beaker, Microscope, Video, Calculator, AlertTriangle, Settings, Wrench, ArrowLeft, CheckCircle2 } from "lucide-react";

// --- [Reusable Glass Components] ---
const GlassCard = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const GlassBadge = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${className}`}>
    {children}
  </span>
);

export default function Kjeldahl() {
  const navigate = useNavigate();
  const [selectedProtocol, setSelectedProtocol] = useState("");

  // --------------------------------------------------------------------------------
  // 🖼️ 이미지 경로 헬퍼 함수 (로컬/배포 호환)
  // --------------------------------------------------------------------------------
  // 설명: src/images 폴더 내의 파일을 동적으로 가져오며, 실패 시 public/images 경로를 반환합니다.
  const img = (file) => {
    try {
      return new URL(`../images/${file}`, import.meta.url).href;
    } catch (e) {
      return `/images/${file}`;
    }
  };

  // ----------------------------------------------------------------
  // 📊 데이터 구조
  // ----------------------------------------------------------------
  const kjeldahlProtocols = {
    step1: {
      title: "1단계: 분해 (Digestion)",
      subtitle: "Organic N → Ammonium",
      tags: ["Heat Block", "H₂SO₄", "270℃→400℃"],
      icon: <FlaskConical className="h-5 w-5" />,
      protocol: [
        "건조 시료 0.1g(채 300μm)을 켈달 튜브에 넣고 라벨링",
        "농황산(H₂SO₄)을 벽면을 타고 흘러내리도록 천천히 주입",
        "270℃ 예열된 히트블록에 5분간 삽입 (탄화 과정, 튀는 것 방지)",
        "꺼내서 식힌 후 촉매(Kjeltab) 2g 투입",
        "400℃로 온도 올려서 15~30분간 분해 (맑은 초록색/파란색 될 때까지)"
      ],
      configurations: [
        "설정 온도 1: 270℃ (초기 탄화, 5분)",
        "설정 온도 2: 400℃ (본 분해, 15~30분)",
        "시료량: 0.1g / 촉매: 2g / 농황산: 적당량"
      ],
      notes: [
        "히트블록 온도를 400℃로 올릴 때, 설정 온도를 430℃로 해두면 더 빨리 도달함",
        "색 변화: 검정 → 짙은 갈색 → 투명한 초록(완료) → 파랑(냉각 시)",
        "황산 증기가 매우 위험하므로 반드시 후드 내에서 진행하고 머리를 넣지 말 것"
      ],
      visualSteps: [
        {
          title: "시료 및 장비 준비",
          image: img("Step_1-1.png"), 
          text: "건조된 시료 0.1g을 튜브에 넣습니다. 히트블록은 미리 예열합니다."
        },
        {
          title: "온도 설정 (Heat Block)",
          image: img("Step_1-2.png"),
          text: "Mode 버튼을 눌러 목표 온도를 설정합니다. 270℃ 도달을 위해 300℃ 이상으로 설정해두면 빠릅니다."
        },
        {
          title: "270℃ 탄화 과정",
          image: img("Step_1-3.png"),
          text: "시료를 270℃ 블록에 5분간 넣어 탄화시킵니다. 이때 끓어넘치지 않도록 주의합니다."
        },
        {
          title: "400℃ 본 분해",
          image: img("Step_1-4.png"),
          text: "촉매를 넣고 400℃에서 분해합니다. 검은색에서 맑은 색이 될 때까지 가열합니다."
        },
        {
          title: "색 변화 확인 (완료)",
          image: img("Step_1-5.png"),
          text: "검붉은색에서 맑은 초록색(청록색)으로 변하면 분해가 완료된 것입니다."
        },
        {
          title: "냉각 및 보관",
          image: img("Step_1-6.png"),
          text: "상온에서 식히면 하늘색으로 변합니다. 먼지가 들어가지 않게 호일로 덮어 보관합니다."
        }
      ],
      videoId: "9oXqw1Umg8o"
    },

    step2: {
      title: "2단계: 증류 (Distillation)",
      subtitle: "Ammonium → Ammonia Gas",
      tags: ["NaOH", "Steam", "Boric Acid"],
      icon: <Beaker className="h-5 w-5" />,
      protocol: [
        "분해된 시료에 증류수 20mL를 넣고 흔들어 완전히 녹임 (굳어있을 수 있음)",
        "증류 장치 세팅: 둥근 플라스크 증류수 확인, 냉각수(수돗물) ON",
        "삼각플라스크(포집액)에 2% 붕산+지시약 50mL 준비하여 냉각관 아래 배치",
        "켈달 튜브 장착 후 45% NaOH 15mL 주입 (코크 조작 주의)",
        "증류 시작: 포집액이 약 100mL가 될 때까지 진행 (약 90mL 시점부터 주시)"
      ],
      configurations: [
        "NaOH 농도: 45% (강알칼리 환경 조성)",
        "NaOH 주입량: 15mL",
        "포집 목표량: 100mL (삼각플라스크 눈금 확인)"
      ],
      notes: [
        "NaOH 주입 시 코크를 다 열어두면 증기가 새어나올 수 있으므로 용액이 다 들어가면 즉시 잠글 것",
        "삼각플라스크 안의 유리관 끝부분이 용액에 잠겨 있어야 암모니아 가스 포집 가능",
        "증류수 부족 시 전자레인지로 데워서 추가 (찬물 넣으면 압력 때문에 넘침)"
      ],
      visualSteps: [
        {
          title: "시료 용해",
          image: img("Step_2-1.png"),
          text: "분해된 시료에 증류수 20mL를 넣고 흔들어 녹입니다."
        },
        {
          title: "증류 장치 및 포집 준비",
          image: img("Step_2-2.png"),
          text: "냉각수를 틀고, 붕산 용액이 담긴 삼각플라스크를 냉각관 출구에 배치합니다."
        },
        {
          title: "NaOH 주입 및 증류",
          image: img("Step_2-3.png"),
          text: "NaOH 15mL를 넣고 코크를 닫습니다. 증류가 시작되면 포집액 색이 변하며 양이 늘어납니다."
        },
        {
          title: "증류 종료 (100mL)",
          image: img("Step_2-4.png"),
          text: "약 100mL가 되면 받침대를 낮춰 플라스크를 빼내고 냉각수를 끕니다."
        }
      ],
      videoId: "m_c3lnD0kn0"
    },

    step3: {
      title: "3단계: 적정 (Titration)",
      subtitle: "Quantification of Nitrogen",
      tags: ["0.05N H₂SO₄", "Color Change"],
      icon: <Microscope className="h-5 w-5" />,
      protocol: [
        "자동 적정기(Burette) 전원 ON 및 영점 조절",
        "탱크의 0.05N 황산 용액을 기기에 채움 (Fill 버튼, 공기 방울 제거 필수)",
        "삼각플라스크에 마그네틱 바를 넣고 교반 시작 (강도 5~6)",
        "황산을 조금씩 적하하며 색 변화 관찰 (청색 → 옅은 분홍/주황색)",
        "종말점의 황산 주입량을 기록하여 함량 계산"
      ],
      configurations: [
        "표준 용액: 0.05N H₂SO₄",
        "교반 속도: 5~6 (튀지 않을 정도)",
        "계산식: 황산 주입량(mL) × 0.7 = 전질소 함량(%) (시료 0.1g 기준)"
      ],
      notes: [
        "Fill 작업 시 호스에 공기가 차면 정량 주입이 안 되므로 용액을 버리면서 공기 빼기",
        "오른쪽 조절 바퀴는 반드시 '시계 반대 방향'으로만 돌려야 함",
        "비교군(Reference) 색상을 옆에 두고 비교하며 적정하면 정확함"
      ],
      visualSteps: [
        {
          title: "적정기 세팅",
          image: img("Step_3-1.png"),
          text: "On/Off 및 영점 조절. Fill 버튼으로 용액을 채웁니다."
        },
        {
          title: "공기 방울 제거",
          image: img("Step_3-2.png"),
          text: "노즐 끝의 공기를 완전히 제거해야 정확한 부피 측정이 가능합니다."
        },
        {
          title: "교반 및 적정 시작",
          image: img("Step_3-3.png"),
          text: "마그네틱 바를 넣고 교반하며 황산을 천천히 주입합니다."
        },
        {
          title: "1차 색 변화",
          image: img("Step_3-4.png"),
          text: "청색에서 1차적으로 색이 변하는 시점을 주시합니다."
        },
        {
          title: "종말점 확인",
          image: img("Step_3-5.png"),
          text: "더 밝은 주황색(붉은색)으로 변하는 순간의 수치를 기록합니다."
        },
        {
          title: "결과 계산",
          image: img("Step_3-6.png"),
          text: "최종 주입량에 0.7을 곱하여 전질소 함량을 계산합니다."
        }
      ],
      videoId: "aRHpBCz7R18"
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900 text-gray-100 font-sans">
      
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 w-full h-full">
         {/* [수정됨] 헬퍼 함수를 사용하여 배경 이미지 호출 */}
         {/* 파일명이 없다면 'kjeldahl_bg.jpg' 등을 images 폴더에 넣어주세요 */}
         <img 
            src={img("kjeldahl_background.jpg")}
            alt="Lab Background"
            className="w-full h-full object-cover opacity-20"

         />
 
      </div>

      {/* Main Content Container 
          - pt-32: 상단 고정 헤더와 겹치지 않게 여백 추가
      */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-12 space-y-8">
        
        {/* Back Navigation */}
        <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/home')} 
            className="flex items-center text-gray-400 hover:text-white transition-colors group"
        >
            <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 mr-3">
                 <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">돌아가기</span>
        </motion.button>
        
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 flex items-center justify-center gap-3 drop-shadow-lg">
             Kjeldahl 질소 분석
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            시약 준비부터 적정까지, 단계별 실험 절차 및 시각적 가이드
          </p>
        </motion.div>

        {/* Common Reagents Card */}
        <GlassCard>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 border-b border-white/10 bg-white/5">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
              <Beaker className="h-6 w-6 text-blue-300" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-white leading-tight">
                필수 시약 및 안전 수칙
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Reagents Preparation & Safety
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
                  <Calculator className="h-4 w-4 text-blue-300" />
                  <span>시약 제조 레시피</span>
                </h3>
                <ul className="space-y-4 list-disc pl-4 text-sm text-gray-300 leading-relaxed marker:text-blue-500">
                  <li>
                    <strong className="text-white">농황산+살리실산:</strong> 농황산 200mL + 살리실산 10g. (기계 교반 금지, 손으로 천천히 흔들어 1~2시간 용해)
                  </li>
                  <li>
                    <strong className="text-white">45% NaOH:</strong> 증류수에 NaOH 450g 용해 후 1L Mass up. (발열 심함, 후드 내 제조, 조금씩 투입)
                  </li>
                  <li>
                    <strong className="text-white">2% 붕산용액:</strong> 붕산 20g + 증류수 + 혼합지시약 5mL → 1L Mass up.
                  </li>
                  <li>
                    <strong className="text-white">혼합지시약:</strong> Bromocresol green 0.5g + Methyl red 0.1g in 95% EtOH (100mL).
                  </li>
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  <span>안전 주의사항</span>
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-sm text-yellow-100 leading-relaxed">
                    <strong className="block text-yellow-300 mb-1">후드 사용</strong>
                     황산 증기 및 NaOH 가스 발생 시 절대 흡입 금지.
                  </div>
                  <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 text-sm text-red-100 leading-relaxed">
                    <strong className="block text-red-300 mb-1">폭발/화상 주의</strong>
                     물에 산/알칼리를 넣어야 함 (반대 금지). 반응열 주의.
                  </div>
                  <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-sm text-blue-100 leading-relaxed">
                    <strong className="block text-blue-300 mb-1">보관</strong>
                     혼합지시약은 냉장/차광 보관, 붕산 용액은 사용 직전 제조 권장.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 3. 단계 선택 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(kjeldahlProtocols).map(([key, protocol]) => (
            <button
              key={key}
              onClick={() => setSelectedProtocol(selectedProtocol === key ? "" : key)}
              className={`p-5 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden group ${
                selectedProtocol === key
                  ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2 relative z-10">
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${selectedProtocol === key ? 'bg-blue-500/20 text-blue-300' : 'bg-white/10 text-gray-400 group-hover:text-white'}`}>
                  {React.cloneElement(protocol.icon, { 
                    className: `h-5 w-5` 
                  })}
                </div>
                <span className={`font-bold text-lg leading-tight ${selectedProtocol === key ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>{protocol.title}</span>
              </div>
              <p className={`text-xs ml-14 ${selectedProtocol === key ? 'text-blue-200' : 'text-gray-500 group-hover:text-gray-400'}`}>
                {protocol.subtitle}
              </p>
              {selectedProtocol === key && (
                 <div className="absolute inset-0 bg-blue-500/5 animate-pulse z-0"></div>
              )}
            </button>
          ))}
        </div>

        {/* 4. 상세 내용 영역 */}
        <AnimatePresence mode="wait">
          {selectedProtocol && (
            <motion.div
              key={selectedProtocol}
              className="space-y-8"
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <GlassCard>
                <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                       {React.cloneElement(kjeldahlProtocols[selectedProtocol].icon, { className: "h-6 w-6 text-blue-300" })}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {kjeldahlProtocols[selectedProtocol].title}
                      </h2>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {kjeldahlProtocols[selectedProtocol].tags.map(tag => (
                          <GlassBadge key={tag} className="bg-white/10 text-gray-300 border-white/10">
                            {tag}
                          </GlassBadge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 lg:p-10 space-y-10">
                  
                  {/* 텍스트 프로토콜 & 설정 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10 h-full">
                        <h3 className="font-bold text-white flex items-center gap-2 mb-6 text-lg border-b border-white/10 pb-3">
                            <Wrench className="h-5 w-5 text-gray-400" /> 실험 절차 (Protocol)
                        </h3>
                        <ol className="space-y-6 ml-2">
                            {kjeldahlProtocols[selectedProtocol].protocol.map((step, index) => (
                            <li key={index} className="relative pl-8">
                                <span className="absolute left-0 top-0.5 flex items-center justify-center w-5 h-5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold border border-blue-500/30">
                                {index + 1}
                                </span>
                                <span className="text-sm text-gray-300 leading-relaxed block">{step}</span>
                            </li>
                            ))}
                        </ol>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                       {kjeldahlProtocols[selectedProtocol].configurations && (
                          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <h3 className="font-bold text-white flex items-center gap-2 mb-4 text-lg">
                              <Settings className="h-5 w-5 text-gray-400" /> 설정값 (Configuration)
                            </h3>
                            <div className="grid gap-3">
                              {kjeldahlProtocols[selectedProtocol].configurations.map((config, i) => (
                                <div key={i} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-200 font-medium flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                                  {config}
                                </div>
                              ))}
                            </div>
                          </div>
                       )}
                       {kjeldahlProtocols[selectedProtocol].notes && (
                          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <h3 className="font-bold text-white flex items-center gap-2 mb-4 text-lg">
                              <AlertTriangle className="h-5 w-5 text-yellow-400" /> 주의사항
                            </h3>
                            <div className="grid gap-3">
                              {kjeldahlProtocols[selectedProtocol].notes.map((note, i) => (
                                <div key={i} className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-yellow-100 leading-relaxed">
                                  <strong className="text-yellow-300 mr-1">Check:</strong> {note}
                                </div>
                              ))}
                            </div>
                          </div>
                       )}
                    </div>
                  </div>

                  {/* Visual Guide 섹션 */}
                  {kjeldahlProtocols[selectedProtocol].visualSteps.length > 0 && (
                    <div className="pt-6 border-t border-white/10">
                       <div className="flex items-center gap-4 mb-8">
                          <span className="text-gray-400 text-sm font-bold uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full bg-white/5">Visual Guide</span>
                          <div className="h-px bg-white/10 flex-1"></div>
                       </div>

                       <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${
                          selectedProtocol === 'step2' ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
                       }`}>
                          {kjeldahlProtocols[selectedProtocol].visualSteps.map((item, idx) => (
                            <div key={idx} className="group rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-lg hover:border-white/20 transition-all">
                              <div className="aspect-[4/3] bg-black/50 overflow-hidden relative border-b border-white/5">
                                {/* [이미지 표시] helper 함수 사용 */}
                                <img 
                                  src={item.image} 
                                  alt={item.title} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                                  onError={(e) => { 
                                    e.target.style.display = 'none'; // 이미지가 없으면 숨김
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                              </div>
                              <div className="p-5">
                                <h4 className="font-bold text-white mb-2 text-sm">{item.title}</h4>
                                <p className="text-xs text-gray-400 leading-relaxed">{item.text}</p>
                              </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {/* 참고 영상 (YouTube) */}
                  {kjeldahlProtocols[selectedProtocol].videoId && (
                    <div className="mt-8 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                      <div className="bg-white/5 p-4 flex items-center text-white gap-2 border-b border-white/10">
                        <Video className="h-5 w-5 text-blue-400" />
                        <span className="font-bold text-sm">실험 가이드 영상 (Video Tutorial)</span>
                      </div>
                      <div className="aspect-video bg-black">
                        <iframe
                          src={`https://www.youtube.com/embed/${kjeldahlProtocols[selectedProtocol].videoId}?rel=0`}
                          title="Tutorial Video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        ></iframe>
                      </div>
                    </div>
                  )}

                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}