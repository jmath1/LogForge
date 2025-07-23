import React, { useState } from 'react';
import { formatAge } from '../utils/utils';

const LogRecord = ({ log, visibleAttributes, currentTime }) => {
  const [isHovered, setIsHovered] = useState(false);
  const ageInSeconds = Math.floor((currentTime - log.timestamp * 1000) / 1000);

  const getLogStyle = () => {
    const baseColors = {
      INFO: [147, 197, 253],   // blue-300
      WARN: [253, 224, 71],    // yellow-300
      ERROR: [252, 165, 165],  // red-300
      DEBUG: [134, 239, 172],  // green-300
      DEFAULT: [243, 244, 246] // gray-100
    };

    const textColors = {
      INFO: "text-blue-800",
      WARN: "text-yellow-800",
      ERROR: "text-red-800",
      DEBUG: "text-green-800",
      DEFAULT: "text-gray-800"
    };

    const level = log.level || 'DEFAULT';
    const bgRgb = baseColors[level] || baseColors.DEFAULT;
    const textColor = textColors[level] || textColors.DEFAULT;

    const bgOpacity = isHovered ? 1 : Math.max(0.3, 1 - ageInSeconds / 300);

    return {
      backgroundColor: `rgba(${bgRgb.join(',')}, ${bgOpacity})`,
      textColor
    };
  };

  const { backgroundColor, textColor } = getLogStyle();

  return (
    <li
      className={`p-4 rounded-lg shadow-md transition duration-300 border border-black/10 cursor-pointer ${textColor}`}
      style={{ backgroundColor }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="text-sm space-y-1">
        {visibleAttributes.length > 0 ? (
          visibleAttributes.map((attr) => {
            const value = log[attr];
            return value !== undefined ? (
              <div key={attr} className="flex items-center">
                <span className="font-semibold mr-2">{attr}:</span>
                <span>
                  {typeof value === "object" ? JSON.stringify(value) : value}
                </span>
                {attr === "timestamp" && (
                  <span className="ml-2 text-gray-500 text-xs">
                    ({formatAge(ageInSeconds)})
                  </span>
                )}
              </div>
            ) : null;
          })
        ) : (
          <div className="text-gray-500">No attributes selected</div>
        )}
      </div>
    </li>
  );
};

export default LogRecord;
