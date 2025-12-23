import React, { useState } from "react";
import { motion } from "framer-motion";
import { Beaker, Activity, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LiquidGlass from "@/components/LiquidGlass.jsx";

// 1. 파일명에 맞춰서 영상을 import 합니다.
// (경로는 파일이 저장된 위치에 맞춰주세요. 예: @/videos/ 또는 @/assets/videos/)
import videoPart1 from "@/videos/main_background_1.mp4";
import videoPart2 from "@/videos/main_background_2.mp4";
import videoPart3 from "@/videos/main_background_3.mp4";

// 2. 영상을 순서대로 배열에 담습니다.
const VIDEO_PLAYLIST = [videoPart1, videoPart2, videoPart3];

export default function MainHome() {
  const navigate = useNavigate();
  
  // 현재 재생 중인 영상의 번호 (0, 1, 2)
  const [currentIndex, setCurrentIndex] = useState(0);

  // 영상이 끝나면 다음 번호로 넘기는 함수
  const handleVideoEnded = () => {
    setCurrentIndex((prevIndex) => {
      // 다음 인덱스가 배열 길이(3)가 되면 다시 0으로 돌아감 (무한 루프)
      return (prevIndex + 1) % VIDEO_PLAYLIST.length;
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900">
      
      {/* 1. Background Video Layer */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <video
          // key값이 바뀌면 리액트가 "새로운 영상"으로 인식해 바로 다시 로드합니다.
          key={currentIndex}
          
          src={VIDEO_PLAYLIST[currentIndex]}
          
          autoPlay
          muted
          playsInline
          // 영상이 끝나면(handleVideoEnded) 다음 영상으로 넘어감
          onEnded={handleVideoEnded} 
          
          className="object-cover w-full h-full opacity-60 transition-opacity duration-300" 
        />
        {/* 영상 위 어두운 오버레이 */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* 2. Main Content Layer (기존 내용 유지) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 flex flex-col items-center justify-center min-h-screen">
        
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 drop-shadow-2xl">
            Plant Analyzer
          </h1>
          <p className="text-xl sm:text-2xl text-gray-100 max-w-3xl mx-auto drop-shadow-md font-light">
            실험실 분석부터 생리계측까지 한 번에 모아보는 통합 프로토콜 플랫폼
          </p>
        </motion.div>

        {/* 3. Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">

          {/* Instrumental Analysis Card */}
          <div 
            onClick={() => navigate('/home')} 
            className="h-full cursor-pointer group"
          >
            <LiquidGlass
              displacementScale={64}
              blurAmount={12}
              saturation={110}
              elasticity={0.3}
              cornerRadius={32}
              padding="40px"
              className="h-full pointer-events-none md:pointer-events-auto"
            >
              <div className="flex flex-col h-full text-left">
                <div className="flex items-center space-x-5 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                    <Beaker className="h-8 w-8 text-blue-300" />
                  </div>
                  <h3 className="text-3xl font-bold text-white drop-shadow-md">
                    Instrumental
                    <span className="block text-blue-200">Analysis</span>
                  </h3>
                </div>
                <p className="text-lg text-gray-100 font-medium leading-relaxed">
                  흡광도, HPLC, Kjeldahl 등 <br/>
                  Wet-lab 기반 생화학 분석
                </p>
                
                <div className="mt-auto pt-8 flex items-center text-blue-200 font-semibold group-hover:text-white transition-colors">
                  <span>프로토콜 보기</span>
                  <Play className="w-4 h-4 ml-2 fill-current" />
                </div>
              </div>
            </LiquidGlass>
          </div>

          {/* Physiological Measurement Card */}
          <div 
            onClick={() => navigate('/physiological')}
            className="h-full cursor-pointer group"
          >
            <LiquidGlass
              displacementScale={64}
              blurAmount={12}
              saturation={110}
              elasticity={0.3}
              cornerRadius={32}
              padding="40px"
              className="h-full pointer-events-none md:pointer-events-auto"
            >
              <div className="flex flex-col h-full text-left">
                <div className="flex items-center space-x-5 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                    <Activity className="h-8 w-8 text-green-300" />
                  </div>
                  <h3 className="text-3xl font-bold text-white drop-shadow-md">
                    Physiological
                    <span className="block text-green-200">Measurement</span>
                  </h3>
                </div>
                <p className="text-lg text-gray-100 font-medium leading-relaxed">
                  Li-6800, Li-600, SPAD 등 <br/>
                  생리·광합성 장비 측정 매뉴얼
                </p>

                <div className="mt-auto pt-8 flex items-center text-green-200 font-semibold group-hover:text-white transition-colors">
                  <span>매뉴얼 확인하기</span>
                  <Play className="w-4 h-4 ml-2 fill-current" />
                </div>
              </div>
            </LiquidGlass>
          </div>

        </div>
      </div>
    </div>
  );
}