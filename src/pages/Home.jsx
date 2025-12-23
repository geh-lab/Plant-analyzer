import React, { useState } from 'react'; // [수정] useState 추가 필수
import { motion } from 'framer-motion';
import { TestTube, FlaskConical, Beaker, Play, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import LiquidGlass from "@/components/LiquidGlass.jsx";    

// [수정] 4개의 분할된 비디오 파일 import
// (이미지 파일명: IA_background_1.mp4 ~ 4.mp4)
import videoPart1 from "@/videos/IA_background_1.mp4"; 
import videoPart2 from "@/videos/IA_background_2.mp4"; 
import videoPart3 from "@/videos/IA_background_3.mp4"; 
import videoPart4 from "@/videos/IA_background_4.mp4"; 

// 재생 목록 배열 생성
const VIDEO_PLAYLIST = [videoPart1, videoPart2, videoPart3, videoPart4];

const CardContent = ({ icon, title, description }) => (
  <div className="flex flex-col h-full text-left">
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.15)]">
        {React.cloneElement(icon, { className: 'h-6 w-6 text-blue-200' })}
      </div>
      <h3 className="text-xl font-bold text-white drop-shadow-sm">{title}</h3>
    </div>
    <p className="text-sm leading-relaxed text-gray-200 mb-6 font-medium">
      {description}
    </p>
    
    <div className="mt-auto pt-4 flex items-center text-blue-300 text-sm font-semibold group-hover:text-white transition-colors">
      <span>분석 시작하기</span>
      <Play className="w-3 h-3 ml-2 fill-current" />
    </div>
  </div>
);

export default function Home() {
  const navigate = useNavigate();

  // [추가] 현재 재생 중인 영상 번호 (0 ~ 3)
  const [currentIndex, setCurrentIndex] = useState(0);

  // [추가] 영상 종료 시 다음 영상으로 넘어가는 핸들러
  const handleVideoEnded = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % VIDEO_PLAYLIST.length);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900">
        
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <video
          // key값이 바뀌면 React가 새 영상으로 인식하여 즉시 로드함
          key={currentIndex}
          src={VIDEO_PLAYLIST[currentIndex]}
          
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnded} // 영상 끝나면 다음으로
          
          className="object-cover w-full h-full opacity-60 transition-opacity duration-300"
        />
        {/* 영상 위 어두운 오버레이 */}
        <div className="absolute inset-0 bg-black/40" /> 
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        
        {/* Back Navigation */}
        <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/')} 
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
            Instrumental Analysis
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto font-light drop-shadow">
            복잡한 식물 생화학 분석, 이제는 간편하게.
            <br className="hidden sm:block" />
            원하는 분석 항목을 클릭하면 프로토콜을 확인할 수 있습니다.
          </p>
        </motion.div>

        {/* Liquid Glass Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* 1. 흡광도 카드 */}
          <div 
            onClick={() => navigate('/analysis')} 
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
                  icon={<TestTube />}
                  title="흡광도"
                  description="분광광도계를 이용한 다양한 생화학 분석 방법들을 제공합니다."
               />
            </LiquidGlass>
          </div>
          
          {/* 2. HPLC 카드 */}
          <div 
            onClick={() => navigate('/hplc')} 
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
                  icon={<FlaskConical />}
                  title="HPLC"
                  description="고성능 액체 크로마토그래피를 이용한 정밀 분석 방법들을 제공합니다."
               />
            </LiquidGlass>
          </div>

          {/* 3. Kjeldahl 카드 */}
          <div 
            onClick={() => navigate('/kjeldahl')} 
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
                  icon={<Beaker />}
                  title="Kjeldahl 질소 분석"
                  description="시료의 단백질 및 총 질소 함량을 정량적으로 측정하는 표준 분석법입니다."
               />
            </LiquidGlass>
          </div>

        </div>
      </div>
    </div>
  );
}