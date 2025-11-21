import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FlaskConical, Beaker, Microscope, Video, Calculator, AlertTriangle, Settings, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Kjeldahl() {
  const [selectedProtocol, setSelectedProtocol] = useState("");

  // --------------------------------------------------------------------------------
  // 🖼️ 이미지 경로 헬퍼 함수
  // --------------------------------------------------------------------------------
  const img = (file) => {
    // [로컬 Vite 환경용 코드]
    // 로컬에서 이미지가 보이지 않을 경우 아래 주석을 해제하고 return 문을 활성화하세요.
    try {
      return new URL(`../images/${file}`, import.meta.url).href;
    } catch (e) {
      // [현재 미리보기 환경용 코드]
      // import.meta가 지원되지 않는 환경에서는 정적 경로를 반환합니다.
      return `/images/${file}`;
    }
  };

  // ----------------------------------------------------------------
  // 📊 통합 데이터 구조 (Protocol + Visual Guide + Settings)
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        
        {/* 1. 헤더 및 타이틀 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
             Kjeldahl 질소 분석
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            시약 준비부터 적정까지, 단계별 실험 절차 및 시각적 가이드
          </p>
        </motion.div>

        {/* 2. 공통 시약 준비 카드 */}
        <Card className="bg-white/90 backdrop-blur-lg border border-gray-100 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4 sm:p-6 border-b border-gray-100">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <Beaker className="h-5 w-5 text-blue-700" />
            </div>
            <div className="text-left">
              <CardTitle className="text-gray-900 text-lg sm:text-xl font-bold leading-tight">
                필수 시약 및 안전 수칙
              </CardTitle>
              <p className="text-gray-600 text-sm sm:text-base mt-1 leading-relaxed">
                Reagents Preparation & Safety
              </p>
            </div>
          </CardHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 px-4 sm:px-6 py-4 sm:py-6">
            <div className="space-y-6">
              <div className="bg-white/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-0">
                <h3 className="text-gray-900 font-semibold mb-4 flex items-center space-x-2 text-sm sm:text-base">
                  <Calculator className="h-4 w-4" />
                  <span>시약 제조 레시피</span>
                </h3>
                <ul className="space-y-3 list-disc pl-4 text-sm text-gray-700 leading-relaxed">
                  <li>
                    <strong>농황산+살리실산:</strong> 농황산 200mL + 살리실산 10g. (기계 교반 금지, 손으로 천천히 흔들어 1~2시간 용해)
                  </li>
                  <li>
                    <strong>45% NaOH:</strong> 증류수에 NaOH 450g 용해 후 1L Mass up. (발열 심함, 후드 내 제조, 조금씩 투입)
                  </li>
                  <li>
                    <strong>2% 붕산용액:</strong> 붕산 20g + 증류수 + 혼합지시약 5mL → 1L Mass up.
                  </li>
                  <li>
                    <strong>혼합지시약:</strong> Bromocresol green 0.5g + Methyl red 0.1g in 95% EtOH (100mL).
                  </li>
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-0">
                <h3 className="text-gray-900 font-semibold mb-4 flex items-center space-x-2 text-sm sm:text-base">
                  <AlertTriangle className="h-4 w-4" />
                  <span>안전 주의사항</span>
                </h3>
                <div className="space-y-2">
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-gray-800">
                    <strong>후드 사용:</strong> 황산 증기 및 NaOH 가스 발생 시 절대 흡입 금지.
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-sm text-red-800">
                    <strong>폭발/화상 주의:</strong> 물에 산/알칼리를 넣어야 함 (반대 금지). 반응열 주의.
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-800">
                    <strong>보관:</strong> 혼합지시약은 냉장/차광 보관, 붕산 용액은 사용 직전 제조 권장.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 3. 단계 선택 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {Object.entries(kjeldahlProtocols).map(([key, protocol]) => (
            <button
              key={key}
              onClick={() => setSelectedProtocol(selectedProtocol === key ? "" : key)}
              className={`p-4 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden ${
                selectedProtocol === key
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xl scale-[1.02]'
                  : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2 relative z-10">
                <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${selectedProtocol === key ? 'bg-white/20' : 'bg-blue-100'}`}>
                  {React.cloneElement(protocol.icon, { 
                    className: `h-6 w-6 ${selectedProtocol === key ? "text-white" : "text-blue-600"}` 
                  })}
                </div>
                <span className="font-bold text-base sm:text-lg leading-tight">{protocol.title}</span>
              </div>
              <p className={`text-xs sm:text-sm relative z-10 ${selectedProtocol === key ? 'text-blue-100' : 'opacity-80'}`}>
                {protocol.subtitle}
              </p>
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
              {/* 메인 카드 */}
              <Card className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border-0 overflow-hidden">
                <CardHeader className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                       {React.cloneElement(kjeldahlProtocols[selectedProtocol].icon, { className: "h-6 w-6 text-blue-600" })}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">
                        {kjeldahlProtocols[selectedProtocol].title}
                      </CardTitle>
                      <div className="flex gap-2 mt-1">
                        {kjeldahlProtocols[selectedProtocol].tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-10">
                  
                  {/* 텍스트 프로토콜 & 설정 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-gray-500" /> 실험 절차 (Protocol)
                      </h3>
                      <ol className="space-y-3 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        {kjeldahlProtocols[selectedProtocol].protocol.map((step, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="text-sm text-gray-700 leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    
                    <div className="space-y-6">
                       {kjeldahlProtocols[selectedProtocol].configurations && (
                          <div>
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                              <Settings className="h-4 w-4 text-gray-500" /> 설정값 (Configuration)
                            </h3>
                            <div className="grid gap-2">
                              {kjeldahlProtocols[selectedProtocol].configurations.map((config, i) => (
                                <div key={i} className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-900 font-medium">
                                  {config}
                                </div>
                              ))}
                            </div>
                          </div>
                       )}
                       {kjeldahlProtocols[selectedProtocol].notes && (
                          <div>
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                              <AlertTriangle className="h-4 w-4 text-gray-500" /> 주의사항
                            </h3>
                            <div className="grid gap-2">
                              {kjeldahlProtocols[selectedProtocol].notes.map((note, i) => (
                                <div key={i} className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl text-sm text-yellow-900">
                                  <strong className="mr-1">Check:</strong> {note}
                                </div>
                              ))}
                            </div>
                          </div>
                       )}
                    </div>
                  </div>

                  {/* Visual Guide 섹션 (이미지 그리드 - Step 2는 2x2, 나머지는 2x3) */}
                  {kjeldahlProtocols[selectedProtocol].visualSteps.length > 0 && (
                    <div>
                       <div className="flex items-center gap-4 my-6">
                          <div className="h-px bg-gray-200 flex-1"></div>
                          <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Visual Guide</span>
                          <div className="h-px bg-gray-200 flex-1"></div>
                       </div>

                       <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${
                          selectedProtocol === 'step2' ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
                       }`}>
                          {kjeldahlProtocols[selectedProtocol].visualSteps.map((item, idx) => (
                            <div key={idx} className="group rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
                              <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                                <img 
                                  src={item.image} 
                                  alt={item.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  onError={(e) => { 
                                    e.target.src = "https://placehold.co/600x400?text=No+Image"; 
                                  }}
                                />
                              </div>
                              <div className="p-4">
                                <h4 className="font-bold text-gray-900 mb-2 text-sm">{item.title}</h4>
                                <p className="text-xs text-gray-600 leading-relaxed">{item.text}</p>
                              </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {/* 참고 영상 (YouTube) */}
                  {kjeldahlProtocols[selectedProtocol].videoId && (
                    <div className="mt-8 bg-gray-900 rounded-2xl p-1 overflow-hidden shadow-xl">
                      <div className="bg-gray-800 p-4 flex items-center text-white gap-2">
                        <Video className="h-5 w-5 text-blue-400" />
                        <span className="font-bold">실험 가이드 영상 (Video Tutorial)</span>
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

                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}