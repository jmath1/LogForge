import React, { useState } from 'react';
import CollapsibleSection from './CollapsibleSection';

const Filters = ({ availableFilters, filters, onFilterChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
      <CollapsibleSection title="Filters" isCollapsed={isCollapsed} onToggle={toggleCollapse}>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Log Level</label>
            <select
              name="level"
              className="p-2 border rounded w-full text-gray-800"
              onChange={onFilterChange}
              value={filters.level || ""}
            >
              {availableFilters.levels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Service</label>
            <select
              name="service"
              className="p-2 border rounded w-full text-gray-800"
              onChange={onFilterChange}
              value={filters.service || ""}
            >
              {availableFilters.services.map((service) => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Logger</label>
            <select
              name="logger"
              className="p-2 border rounded w-full text-gray-800"
              onChange={onFilterChange}
              value={filters.logger || ""}
            >
              {availableFilters.loggers.map((logger) => (
                <option key={logger} value={logger}>{logger}</option>
              ))}
            </select>
          </div>
        </div>
      </CollapsibleSection>
  );
};

export default Filters;
