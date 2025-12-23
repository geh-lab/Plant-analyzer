import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Play, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // [추가] 리액트 페이지 이동 훅
import { createPageUrl } from '@/utils';        // [수정] 경로 @/utils 로 통일
import LiquidGlass from '@/components/LiquidGlass.jsx'; // [수정] 경로 @/components/... 로 통일

// [추가] 비디오 파일 import (경로가 맞는지 확인해주세요)
import backgroundVideo from "@/videos/PM_background.mp4"; 

const CardContent = ({ icon, title, description }) => (
  <div className="flex flex-col h-full text-left">
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.15)]">
        {React.cloneElement(icon, { className: 'h-6 w-6 text-green-200' })}
      </div>
      <h3 className="text-xl font-bold text-white drop-shadow-sm">{title}</h3>
    </div>
    <p className="text-sm leading-relaxed text-gray-200 mb-6 font-medium">
      {description}
    </p>
    
    <div className="mt-auto pt-4 flex items-center text-green-300 text-sm font-semibold group-hover:text-white transition-colors">
      <span>가이드 보기</span>
      <Play className="w-3 h-3 ml-2 fill-current" />
    </div>
  </div>
);

export default function Physiological() {
  const navigate = useNavigate(); // [추가] 이동 함수 생성

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900">
        
      {/* 1. Background Video Layer */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="object-cover w-full h-full opacity-60"
          src={backgroundVideo} // [수정] import한 변수 사용
        />
        
      </div>

      {/* 2. Main Content Layer */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        
        {/* Back Navigation */}
        <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/')} // [수정] 메인으로 돌아가기 (useNavigate 사용)
            className="mb-12 flex items-center text-gray-400 hover:text-white transition-colors group"
        >
            <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 mr-3">
                 <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">메인으로 돌아가기</span>
        </motion.button>

        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg">
            Physiological Measurement
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto font-light drop-shadow">
            식물 생리·광합성 특성 분석을 위한 장비 사용법을 제공합니다.
            <br className="hidden sm:block" />
            확인하고 싶은 항목을 선택하면 해당 가이드 페이지로 이동합니다.
          </p>
        </motion.div>

        {/* Liquid Glass Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          
          {/* Li-6800 Card */}
          <div 
            onClick={() => navigate('/li6800')} // [수정] 클릭 시 이동 (경로 확인 필요)
            className="h-full cursor-pointer group"
          >
            <LiquidGlass
               displacementScale={40}
               blurAmount={12}
               saturation={110}
               elasticity={0.3}
               cornerRadius={24}
               padding="32px"
               className="h-full pointer-events-none md:pointer-events-auto"
            >
               <CardContent
                  icon={<Activity />}
                  title="Li-6800"
                  description="광합성(A/Q, A/Ci), 기공전도도, leaf chamber 설정 가이드"
               />
            </LiquidGlass>
          </div>

          {/* 추가 장비가 있다면 위 div 구조를 복사해서 경로와 내용을 수정하여 추가하세요 */}

        </div>
      </div>
    </div>
  );
}