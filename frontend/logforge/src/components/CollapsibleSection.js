import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const CollapsibleSection = ({ title, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="mb-6 shadow-lg rounded-lg p-3 bg-white">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-xl font-bold">{title}</h3>
        <span className="text-2xl transition-transform duration-300 ease-in-out" style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>
          {isCollapsed ? <FiChevronDown /> : <FiChevronUp />}
        </span>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out`}
        style={{
          maxHeight: isCollapsed ? '0px' : '1000px', // Arbitrary large value for maxHeight
          opacity: isCollapsed ? 0 : 1,
        }}
      >
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;