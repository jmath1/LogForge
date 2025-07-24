import React, { useEffect, useState } from 'react';
import LogRecord from './LogRecord';

const LogList = ({ logs, visibleAttributes }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white shadow rounded p-4 max-h-96 overflow-y-auto">
      {logs.length > 0 ? (
        <table className="table-auto w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {visibleAttributes.map((attr) => (
                <th key={attr} className="p-2 text-sm font-semibold text-gray-700 border-b">
                  {attr}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <LogRecord
                key={log.id}
                log={log}
                visibleAttributes={visibleAttributes}
                currentTime={currentTime}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-2 text-gray-500">No logs available</div>
      )}
    </div>
  );
};

export default LogList;