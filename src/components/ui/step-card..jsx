import React from "react";
import { AlertTriangle } from "lucide-react";

export default function StepCard({
  title,
  videoUrl = null,
  description = "",
  tips = [],
  warnings = [],
}) {
  return (
    <div className="p-6 rounded-2xl bg-white/80 border border-gray-200 shadow-sm mb-8">
      <h3 className="text-xl font-bold mb-4 text-gray-900">{title}</h3>

      {videoUrl && (
        <div className="w-full aspect-video bg-gray-200 rounded-xl mb-4">
          <iframe
            src={videoUrl}
            title="Step video"
            className="w-full h-full rounded-xl"
            allowFullScreen
          />
        </div>
      )}

      {description && (
        <p className="text-gray-700 leading-relaxed mb-4">{description}</p>
      )}

      {tips.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2 text-gray-800">💡 팁</h4>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            {tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2 text-red-600 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" /> 주의사항
          </h4>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
