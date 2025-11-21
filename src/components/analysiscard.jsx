// src/components/AnalysisCard.jsx
import React from "react";
import { motion } from "framer-motion";

export default function AnalysisCard({ icon, title, description, onClick, color="blue" }) {
  return (
    <motion.button
      onClick={onClick}
      className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 text-left w-full bg-white/80 
                  text-gray-700 border-gray-200 hover:bg-${color}-50 hover:border-${color}-300 hover:shadow-xl`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center space-x-4 mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${color}-100`}>
          {React.cloneElement(icon, { className: `h-6 w-6 text-${color}-600` })}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-gray-600">{description}</p>
    </motion.button>
  );
}
