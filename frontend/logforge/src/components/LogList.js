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
    <div className="bg-gray-200 shadow rounded p-4 max-h-96 overflow-y-auto">
      <ul className="space-y-2">
        {logs.length > 0 ? (
          logs.map((log, idx) => (
            <LogRecord
              key={idx}
              log={log}
              visibleAttributes={visibleAttributes}
              currentTime={currentTime}
            />
          ))
        ) : (
          <li className="p-2 text-gray-500">No logs available</li>
        )}
      </ul>
    </div>
  );
};

export default LogList;