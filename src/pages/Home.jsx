import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, TestTube, FlaskConical, Beaker } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';


const AnalysisCard = ({ icon, title, description, onClick }) => (
  <motion.button
    onClick={onClick}
    className="p-6 sm:p-8 rounded-3xl border transition-all duration-300 text-left w-full bg-white/80 text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-xl"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-100">
        {React.cloneElement(icon, { className: 'h-6 w-6 text-blue-600' })}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
    <p className="text-sm leading-relaxed text-gray-600">{description}</p>
  </motion.button>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* 제목 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
            Instrumental Analysis
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            복잡한 식물 생화학 분석, 이제는 간편하게.
            <br />
            원하는 분석 항목을 클릭하면 해당 프로토콜 페이지로 이동합니다.
          </p>
        </motion.div>

        {/* 한 줄 3컬럼: 흡광도 | HPLC | Kjeldahl */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <AnalysisCard
            icon={<TestTube />}
            title="흡광도"
            description="분광광도계를 이용한 다양한 생화학 분석 방법들을 제공합니다."
            onClick={() => (window.location.href = createPageUrl('Analysis'))}
          />
          <AnalysisCard
            icon={<FlaskConical />}
            title="HPLC"
            description="고성능 액체 크로마토그래피를 이용한 정밀 분석 방법들을 제공합니다."
            onClick={() => (window.location.href = createPageUrl('HPLC'))}
          />
          <AnalysisCard
            icon={<Beaker />}
            title="Kjeldahl 질소 분석"
            description="시료의 단백질 및 총 질소 함량을 정량적으로 측정하는 표준 Kjeldahl 분석법을 제공합니다."
            onClick={() => (window.location.href = createPageUrl('Kjeldahl'))}
          />
        </div>
      </div>
    </div>
  );
}
