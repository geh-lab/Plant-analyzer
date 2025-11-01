// src/pages/Kjeldahl.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FlaskConical, Beaker, Microscope, Video, Calculator, AlertTriangle } from "lucide-react";



export default function Kjeldahl() {
  const [selectedStep, setSelectedStep] = useState("");

// 이미지 경로 헬퍼 함수 (Vite 기준)
// 실제 경로: /src/images/Step_1-1.png 형식
const img = (file) => new URL(`../images/${file}`, import.meta.url).href;



  // 단계별 사진 + 설명
const stepDetails = {
step1: [
  {
    title: "시료 준비",
    image: img("Step_1-1.png"),
    text: "건조된 식물체를 마쇄하여 0.1g(채 300μm)을 계량한 뒤 라벨링된 시험관에 넣습니다.",
  },
  {
    title: "히트블록 설정 및 농황산 첨가",
    image: img("Step_1-2.png"),
    text: "히트블록 모드로 300℃ 이상 설정해 270℃에 빨리 도달시킵니다. 농황산은 벽면 타고 천천히 넣습니다. 넣은 시료는 즉시 히트블록에 삽입합니다. 270℃ 초과 시 전원 차단 후 농황산 넣고 다 넣어갈 때 재가동합니다.",
  },
  {
    title: "270°C 예열 및 주의사항",
    image: img("Step_1-3.png"),
    text: "270℃ 히트블록에 시료를 5분간 넣을 때 전원은 켜거나 꺼도 됩니다. 황산 증기 위험으로 머리를 넣지 않습니다. 켈텍 알약 4g을 가볍게 쳐서 2g씩 반으로 나눕니다. 재삽입 시 430℃로 설정해 빠르게 370℃로 올립니다.",
  },
  {
    title: "400°C 분해 과정",
    image: img("Step_1-4.png"),
    text: "재삽입 시 400℃에서 넣되 370℃쯤 켈텍을 넣기 시작합니다. 390℃부터 히트블록에 삽입하며 설정은 430℃ 유지합니다. 이후 설정온도를 400℃로 변경합니다. 블록에서 시료 빼는 데 15~30분 소요됩니다.",
  },
  {
    title: "색 변화 확인",
    image: img("Step_1-5.png"),
    text: "시료 색상이 검정 → 짙은 갈색 → 투명한 초록 → 파란색으로 변하면 꺼냅니다. 15분쯤에 꺼내 색상을 확인합니다.",
  },
  {
    title: "냉각 및 안정화",
    image: img("Step_1-6.png"),
    text: "완성된 시료는 상온 방치 시 하늘색으로 변합니다. 꺼내 상온에 두어도 되며, 연기 빠진 후 밖에 꺼내 식히고 알루미늄 호일로 먼지 방지합니다. 2~3일 상온 방치 괜찮습니다.",
  },
],


step2: [
    {
      title: "시료 용해 및 준비",
      image: img("Step_2-1.png"),
      text: "준비한 분해 시료에 증류수 20 mL를 넣고 완전히 녹여 균질하게 만듭니다.",
    },
    {
      title: "증류장치 세팅 및 붕산 포집 준비",
      image: img("Step_2-2.png"),
      text: "둥근 플라스크에 증류수를 2/3 이상 채우고 코크를 잠가 증기가 새지 않게 합니다. 증류수가 부족하면 전자레인지로 데운 증류수를 추가합니다. 냉각관에 수돗물을 흐르게 합니다. 2% 지시약이 든 붕산용액 50 mL를 삼각플라스크에 넣고 주둥이가 용액에 잠기도록 배치합니다.",
    },
    {
      title: "NaOH 주입 및 증류 시작",
      image: img("Step_2-3.png"),
      text: "분해된 켈달 플라스크를 증류장치에 장착하고 NaOH 깔때기 코크를 닫아 45% NaOH 15 mL를 넣습니다. 코크를 열어 모두 내려가면 다시 닫습니다. 삼각플라스크가 약 100 mL 되면 둥근 플라스크 위 코크를 열어 압력을 제거한 후 플라스크들을 제거합니다. 유리관 부피로 넘쳐 보일 수 있으니 살짝 빼고 넣기를 반복하여 100 mL로 맞춥니다.",
    },
    {
      title: "증류 종료 및 분리",
      image: img("Step_2-4.png"),
      text: "대략 90 mL가 되면 높이 조절기를 최대한 낮추고 한 손으로 삼각플라스크를 들고 빼낼 준비를 합니다. 실험이 끝나면 기기의 열이 모두 식은 후 냉각수를 끕니다.",
    },
  ],
// 단계별 사진 + 설명 중 step3 수정
step3: [
  {
    title: "장비 세팅 및 적정 준비",
    image: img("Step_3-1.png"),
    text: "On/Off는 기기를 켜고 끌 때 사용합니다. 영점조절은 용량을 재고 0으로 맞출 때 사용합니다. Fill은 하단 탱크에서 황산을 기계에 채울 때 사용합니다."
  },
  {
    title: "용액 주입 및 공기층 제거",
    image: img("Step_3-2.png"),
    text: "Fill로 기계에 용액을 채울 때 공기가 들어갈 수 있으므로 용액을 조금씩 빼면서 공기층을 제거합니다."
  },
  {
    title: "자석 교반 설정 및 적정 시작",
    image: img("Step_3-3.png"),
    text: "삼각플라스크에 자석바를 넣고 황산을 조금씩 주입하며 색 변화 지점을 관찰합니다. 자석바 강도는 5~6으로 설정합니다. 황산 주입 시 오른쪽 바퀴를 시계 반대 방향으로만 돌립니다."
  },
  {
    title: "1차 색 변화 관찰",
    image: img("Step_3-4.png"),
    text: "황산 주입 중 1차 색 변화 시 해당 수치값을 기록합니다."
  },
  {
    title: "2차 색 변화 및 종말점 기록",
    image: img("Step_3-5.png"),
    text: "이후 더 밝은 주황색으로 변하면 해당 수치값을 기록합니다. 이 수치가 전질소 함량 계산에 사용됩니다."
  },
  {
    title: "색 비교 및 질소 함량 계산",
    image: img("Step_3-6.png"),
    text: "최초 삼각플라스크를 옆에 두고 색을 비교하며 황산을 주입합니다. 더 밝은 주황색으로 변하는 시점의 수치 × 0.7 = 시료 0.1 g당 전질소 함량(%)입니다."
  }
],

};

const stepInfo = {
  step1: {
    icon: <FlaskConical className="h-5 w-5 text-blue-700" />,
    titleKo: "1단계: 분해",
    titleEn: "Digestion",
    description:
      "농황산과 촉매로 유기질소를 암모늄(황산암모늄)으로 전환하는 단계입니다.",
  },
  step2: {
    icon: <Beaker className="h-5 w-5 text-green-700" />,
    titleKo: "2단계: 증류",
    titleEn: "Distillation",
    description: "강알칼리(45% NaOH)로 암모니아를 유리시켜 증류하고 붕산 용액에 포집하는 단계입니다.",
  },
  step3: {
    icon: <Microscope className="h-5 w-5 text-purple-700" />,
    titleKo: "3단계: 적정",
    titleEn: "Titration",
    description:
      "붕산에 포집된 암모늄보레이트를 표준 황산(0.05 N)으로 적정해 전질소 함량을 계산하는 단계입니다.",
  },
};


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* 제목 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Kjeldahl 질소 분석
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            시약 및 준비물, 단계별 실험 절차와 계산 방법을 확인하세요.
          </p>
        </motion.div>

       {/* 🧪 공통 시약 및 장비 (예시와 동일 톤의 2열 카드) */}
<Card className="bg-white/90 backdrop-blur-lg border border-gray-100 shadow-lg rounded-2xl overflow-hidden mb-10">
  {/* 헤더: 아이콘 + 제목(가로), 영문 부제 */}
  <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4 sm:p-6 border-b border-gray-100">
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
      <Beaker className="h-5 w-5 text-blue-700" />
    </div>
    <div className="text-left">
      <CardTitle className="text-gray-900 text-lg sm:text-xl font-bold leading-tight">
        공통 시약 및 장비
      </CardTitle>
      <p className="text-gray-600 text-sm sm:text-base mt-1 leading-relaxed">
        Common reagents &amp; equipment
      </p>
    </div>
  </CardHeader>

  {/* 본문: 2열 그리드 — 래퍼 삭제, 패딩을 그리드에 직접 부여 */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 px-4 sm:px-6 py-4 sm:py-6">
    {/* 왼쪽: 실험 프로토콜 + 계산 공식 */}
    <div className="space-y-6">
      {/* 실험 프로토콜 */}
      <div className="bg-white/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-0">
        <h3 className="text-gray-900 font-semibold mb-4 flex items-center space-x-2 text-sm sm:text-base">
          <FlaskConical className="h-4 w-4" />
          <span>실험 프로토콜</span>
        </h3>
        <ol className="space-y-3">
          {[
            "건조 시료(0.3 g) 기준, 소화 → 증류 → 적정 순으로 진행합니다.",
            "살리실산 혼합은 후드 내에서 손으로 천천히 1–2시간 교반합니다.",
            "분해 완료 후 알루미늄 포일로 덮어 안정화한 뒤, 증류 및 적정을 수행합니다.",
            "적정 결과(황산 주입량)를 이용해 전질소 함량(%)을 계산합니다."
          ].map((t, i) => (
            <li key={i} className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                {i + 1}
              </span>
              <span className="text-gray-700 text-sm leading-relaxed">{t}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* 계산 공식 */}
      <div className="bg-white/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-0">
        <h3 className="text-gray-900 font-semibold mb-4 flex items-center space-x-2 text-sm sm:text-base">
          <Calculator className="h-4 w-4" />
          <span>계산 공식</span>
        </h3>
        <div className="space-y-3">
          <p className="text-gray-800 text-sm leading-relaxed">
            0.05N 황산으로 청색 → 분홍색(또는 주황색)으로 변하는 시점을 종말점으로 기록합니다.
          </p>
          <p className="text-gray-800 text-sm leading-relaxed">
            더 밝은 주황색 시점의 황산 주입 부피(mL) × <strong>0.7</strong> = 전질소 함량(%) (시료 0.1 g 기준)
          </p>
          <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
            <p className="text-gray-900 font-mono font-semibold text-center text-sm">
              전질소 함량(%) = 황산 주입량 × 0.7
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* 오른쪽: 시약별 보관조건 주의 */}
    <div className="space-y-4">
      <div className="bg-white/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-0">
        <h3 className="text-gray-900 font-semibold mb-4 flex items-center space-x-2 text-sm sm:text-base">
          <AlertTriangle className="h-4 w-4" />
          <span>시약별 보관조건 주의</span>
        </h3>

        <div className="space-y-3">
          <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg sm:rounded-xl border border-yellow-200">
            <p className="text-gray-800 text-sm leading-relaxed"><strong>농황산(H₂SO₄):</strong> 갈색병·밀봉 보관, 후드 취급, 열·습기 차단</p>
          </div>
          <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg sm:rounded-xl border border-yellow-200">
            <p className="text-gray-800 text-sm leading-relaxed"><strong>NaOH 용액:</strong> CO₂ 흡수 방지 위해 밀봉, 건냉소 보관, 후드 취급</p>
          </div>
          <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg sm:rounded-xl border border-yellow-200">
            <p className="text-gray-800 text-sm leading-relaxed"><strong>혼합지시약:</strong> 4℃ 냉장, 갈색병 또는 호일 차광, 500 mL 이상 제조 권장</p>
          </div>
          <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg sm:rounded-xl border border-yellow-200">
            <p className="text-gray-800 text-sm leading-relaxed"><strong>붕산(Boric acid) 용액:</strong> 냉장(4℃), 장기보관 지양 — 필요 시 신선 제조</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</Card>


{/* 단계 선택 버튼 */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
  {Object.keys(stepInfo).map((key) => (
    <motion.button
      key={key}
      onClick={() => setSelectedStep(selectedStep === key ? "" : key)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`p-6 sm:p-8 text-left rounded-3xl border transition-all duration-300 ${
        selectedStep === key
          ? "bg-blue-600 text-white border-blue-600 shadow-xl"
          : "bg-white/80 text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300"
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            selectedStep === key ? "bg-white/20" : "bg-blue-100"
          }`}
        >
          {stepInfo[key].icon}
        </div>

        {/* 제목 블록: 한글(위, bold) + 영어(아래, smaller) */}
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-bold leading-tight">
            {stepInfo[key].titleKo}
          </h3>
          <p
            className={`text-xs sm:text-sm ${
              selectedStep === key ? "text-blue-100/90" : "text-gray-500"
            }`}
          >
            {stepInfo[key].titleEn}
          </p>
        </div>
      </div>

      {/* 기존 설명은 유지 (원하면 지워도 됨) */}
      <p
        className={`text-sm ${
          selectedStep === key ? "text-blue-100" : "text-gray-600"
        }`}
      >
        {stepInfo[key].description}
      </p>
    </motion.button>
  ))}
</div>


        {/* 단계별 세부 내용 */}
        <AnimatePresence mode="wait">
          {selectedStep && (
            <motion.div
              key={selectedStep}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { duration: 0.4 },
              }}
              exit={{
                opacity: 0,
                scale: 0.98,
                y: -10,
                transition: { duration: 0.3 },
              }}
            >
              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
<CardHeader className="p-6 border-b">
  <div className="flex items-center gap-2">
    {/* 단계 아이콘 */}
    {stepInfo[selectedStep].icon}

    {/* 제목 */}
    <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
      세부 프로토콜 과정
    </CardTitle>
  </div>
</CardHeader>

<CardContent className="p-6">
  <div
    className={`grid gap-6 ${
      selectedStep === "step1"
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" // ✅ Step1 → 3×2
        : selectedStep === "step2"
        ? "grid-cols-1 sm:grid-cols-2" // ✅ Step2 → 2×2
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" // ✅ 나머지 동일
    }`}
  >
    {stepDetails[selectedStep].map((item, idx) => (
      <div
        key={idx}
        className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm"
      >
        <div className="aspect-[4/3] w-full">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4 text-center">
          <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
        </div>
      </div>
    ))}
  </div>


                  {/* 참고 영상 */}
                  <div className="mt-10">
                    <h4 className="flex items-center text-gray-900 font-semibold mb-3">
                      <Video className="h-5 w-5 mr-2 text-blue-700" />
                      참고 영상
                    </h4>
                    <div className="aspect-video rounded-xl overflow-hidden border">
                      <iframe
                        src={
                          selectedStep === "step1"
                            ? "https://www.youtube.com/embed/example_digestion"
                            : selectedStep === "step2"
                            ? "https://www.youtube.com/embed/example_distillation"
                            : "https://www.youtube.com/embed/example_titration"
                        }
                        title="reference-video"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
