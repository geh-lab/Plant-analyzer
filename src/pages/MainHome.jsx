import React from "react";
import { motion } from "framer-motion";
import { Beaker, Activity } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function MainHome() {
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
            Plant Analyzer
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            실험실 분석부터 생리계측까지 한 번에 모아보는 통합 프로토콜 플랫폼
          </p>
        </motion.div>

        {/* 두 개의 대분류 박스 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* 기기 분석 */}
          <motion.button
            onClick={() => (window.location.href = createPageUrl("Home"))}
            className="p-10 rounded-3xl bg-white border border-gray-200 hover:bg-blue-50 hover:shadow-xl transition-all text-left"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Beaker className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold">Instrumental Analysis</h3>
            </div>
            <p className="text-gray-600">
              흡광도, HPLC, Kjeldahl 등 Wet-lab 기반 생화학 분석
            </p>
          </motion.button>

          {/* 생리계측 */}
          <motion.button
            onClick={() => (window.location.href = createPageUrl("Physiological"))}
            className="p-10 rounded-3xl bg-white border border-gray-200 hover:bg-blue-50 hover:shadow-xl transition-all text-left"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold">Physiological Measurement</h3>
            </div>
            <p className="text-gray-600">
              Li-6800, Li-600, SPAD 등 생리·광합성 장비 측정 매뉴얼
            </p>
          </motion.button>

        </div>
      </div>
    </div>
  );
}
