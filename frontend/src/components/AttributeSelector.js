import React, { useState } from 'react';
import CollapsibleSection from './CollapsibleSection'; // Assuming you have a collapsible section component
const AttributeSelector = ({ logs, visibleAttributes, toggleAttributeVisibility }) => {
  const [isCollapsed, setIsCollapsed] = useState(false); // State to toggle collapse

  const attributeCount = Object.keys(logs[0] || {}).length;
  const maxHeight = isCollapsed ? '0px' : `${attributeCount * 40 + 20}px`; // Approx 40px per item + padding

return (
        <CollapsibleSection
            title="Select Attributes to Display"
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed(!isCollapsed)}
        >
            <div className="grid grid-cols-3 gap-4">
                {Object.keys(logs[0] || {}).map((attribute) => (
                    <label
                        key={attribute}
                        className="flex items-center space-x-3 bg-gray-50 text-gray-800 rounded-lg p-2 shadow-md hover:bg-gray-100 transition"
                    >
                        <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-400"
                            checked={visibleAttributes.includes(attribute)}
                            onChange={() => toggleAttributeVisibility(attribute)}
                        />
                        <span className="text-sm font-medium">{attribute}</span>
                    </label>
                ))}
            </div>
        </CollapsibleSection>

);
};

export default AttributeSelector;