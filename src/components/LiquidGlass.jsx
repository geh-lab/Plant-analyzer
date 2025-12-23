import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * This component mimics the "Liquid Glass" effect.
 * Since we cannot install the specific 'liquid-glass-react' package in this environment,
 * we recreate the visual effect using Framer Motion and CSS Backdrop Filters.
 * 
 * It implements a magnetic/liquid hover effect where the background distorts slightly
 * towards the mouse cursor.
 */
export default function LiquidGlass({
  children,
  displacementScale = 64,
  blurAmount = 10,
  saturation = 100,
  aberrationIntensity = 2,
  elasticity = 0.35,
  cornerRadius = 24,
  padding = "0px",
  onClick,
  className = "",
}) {
  const ref = useRef(null);

  // Mouse position state for the liquid effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring physics for the "elastic" feel
  const springConfig = { damping: 15, stiffness: 150, mass: 0.5 + elasticity }; 
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Transform the mouse position into a slight tilt/displacement
  const rotateX = useTransform(springY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    
    // Calculate normalized position (-0.5 to 0.5)
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        rotateX: rotateX,
        rotateY: rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative group cursor-pointer overflow-hidden ${className}`}
    >
      {/* 
        The Glass Background Layer 
        Using standard Tailwind classes to mimic the library's output
      */}
      <div
        className="absolute inset-0 z-0 transition-all duration-300"
        style={{
          backdropFilter: `blur(${blurAmount}px) saturate(${saturation}%)`,
          WebkitBackdropFilter: `blur(${blurAmount}px) saturate(${saturation}%)`, // Safari support
          backgroundColor: "rgba(255, 255, 255, 0.15)", // Translucent white base
          borderRadius: cornerRadius,
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        }}
      />

      {/* 
        "Aberration" or Highlight Layer 
        Moves opposite to mouse to create depth 
      */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          borderRadius: cornerRadius,
          background: "radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)",
          x: useTransform(springX, [-0.5, 0.5], [-displacementScale, displacementScale]),
          y: useTransform(springY, [-0.5, 0.5], [-displacementScale, displacementScale]),
        }}
      />

      {/* Content Layer */}
      <div 
        className="relative z-10 h-full"
        style={{ padding: padding }}
      >
        {children}
      </div>
    </motion.div>
  );
}