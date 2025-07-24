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

    const level = log.level || 'DEFAULT';
    const bgRgb = baseColors[level] || baseColors.DEFAULT;
    const bgOpacity = isHovered ? 1 : Math.max(0.3, 1 - ageInSeconds / 300);

    return {
      backgroundColor: `rgba(${bgRgb.join(',')}, ${bgOpacity})`
    };
  };

  const style = getLogStyle();

  return (
    <tr
      className="transition duration-300 border-b border-gray-200 hover:bg-gray-100"
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {visibleAttributes.map((attr) => {
        const value = log[attr];
        return (
          <td key={attr} className="p-2 text-sm text-gray-800">
            {value !== undefined ? (
              attr === "timestamp" ? (
                <>
                  {new Date(value * 1000).toLocaleString()}{" "}
                  <span className="ml-2 text-gray-500 text-xs">
                    ({formatAge(ageInSeconds)})
                  </span>
                </>
              ) : (
                typeof value === "object" ? JSON.stringify(value) : value
              )
            ) : (
              "-"
            )}
          </td>
        );
      })}
    </tr>
  );
};

export default LogRecord;
