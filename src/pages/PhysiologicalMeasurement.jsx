import React from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { createPageUrl } from "@/utils";
import AnalysisCard from "@/components/analysiscard";

// ← Home.jsx에서 사용한 동일한 카드 컴포넌트 재사용

export default function Physiological() {
  return (
    // 배경색 변경: to-green-50 -> to-blue-50
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        
        {/* 페이지 타이틀 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
            Physiological Measurement
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            식물 생리·광합성 특성 분석을 위한 장비 사용법을 제공합니다.
            <br />
            확인하고 싶은 항목을 선택하면 해당 가이드 페이지로 이동합니다.
          </p>
        </motion.div>

        {/* 카드 리스트 (AnalysisCard로 통일) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">

          <AnalysisCard
            icon={<Activity />}
            title="Li-6800"
            description="광합성(A/Q, A/Ci), 기공전도도, leaf chamber 설정 가이드"
            onClick={() => (window.location.href = createPageUrl("Li6800"))}
          />

        </div>

      </div>
    </div>
  );
}
