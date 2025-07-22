import React from 'react';

const Filters = ({ availableFilters, filters, onFilterChange }) => {
  return (
    <div className="mb-4 bg-white shadow rounded p-4">
      <h3 className="text-lg font-semibold mb-2">Filters</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Log Level</label>
          <select
            name="level"
            className="p-2 border rounded w-full"
            onChange={onFilterChange}
            value={filters.level || ""}
          >
            {availableFilters.levels.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
          <select
            name="service"
            className="p-2 border rounded w-full"
            onChange={onFilterChange}
            value={filters.service || ""}
          >
            {availableFilters.services.map((service) => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logger</label>
          <select
            name="logger"
            className="p-2 border rounded w-full"
            onChange={onFilterChange}
            value={filters.logger || ""}
          >
            {availableFilters.loggers.map((logger) => (
              <option key={logger} value={logger}>{logger}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Filters;
