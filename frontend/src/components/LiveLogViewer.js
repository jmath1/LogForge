import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import Filters from './Filters';
import LogList from './LogList';
import AttributeSelector from './AttributeSelector';
import StatusIndicator from './StatusIndicator';

const LiveLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [filters, setFilters] = useState({ level: "All", service: "All", logger: "All" });
  const [availableFilters, setAvailableFilters] = useState({ levels: [], services: [], loggers: [] });
  const [visibleAttributes, setVisibleAttributes] = useState([
    "id",
    "level",
    "logger",
    "message",
    "timestamp",
  ]);
  const wsRef = useRef(null);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await axios.get(`https://${process.env.REACT_APP_BACKEND}/filters`);
        setAvailableFilters({
          levels: ["All", ...response.data.levels],
          services: ["All", ...response.data.services],
          loggers: ["All", ...response.data.loggers],
        });
      } catch (err) {
        console.error("Error fetching filters:", err);
        setError("Failed to fetch filter options");
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchPreviousLogs = async () => {
      try {
        const response = await axios.get(`https://${process.env.REACT_APP_BACKEND}/logs`);
        setLogs((prev) => {
          const uniqueLogs = [...prev, ...response.data].reduce((acc, log) => {
            acc[log.id] = log; // Use `id` as the unique key
            return acc;
          }, {});
          return Object.values(uniqueLogs); // Return unique logs
        });
      } catch (err) {
        console.error("Error fetching previous logs:", err);
        setError("Failed to fetch previous logs");
      }
    };

    fetchPreviousLogs();
  }, []);

  useEffect(() => {
    const ws = new WebSocket(`wss://${process.env.REACT_APP_BACKEND}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection established");
      setIsConnected(true);
      setError(null);
      sendFilters();
    };

    ws.onmessage = (event) => {
      try {
        const log = JSON.parse(event.data);
        console.log("Received log:", log);
        setLogs((prev) => {
          const uniqueLogs = [log, ...prev].reduce((acc, log) => {
            acc[log.id] = log; // Use `id` as the unique key
            return acc;
          }, {});
          return Object.values(uniqueLogs); // Return unique logs
        });
      } catch (err) {
        console.error("Error parsing WebSocket message:", err, "Data:", event.data);
        setError("Failed to parse log data");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("WebSocket connection failed");
      setIsConnected(false);
    };

    ws.onclose = (event) => {
      console.log("WebSocket closed:", event);
      setIsConnected(false);
      setError("WebSocket connection closed");
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        console.log("WebSocket cleanup triggered");
      }
    };
  }, []);

  
  const applyFilters = useCallback((logsToFilter) => {
    return logsToFilter.filter((log) => {
      const levelMatch = filters.level === "All" || log.level === filters.level;
      const serviceMatch = filters.service === "All" || log.service === filters.service;
      const loggerMatch = filters.logger === "All" || log.logger === filters.logger;
      return levelMatch && serviceMatch && loggerMatch;
    });
  }, [filters]);

  // Update filtered logs when logs or filters change
  useEffect(() => {
    const filtered = applyFilters(logs);
    setFilteredLogs(filtered);
  }, [logs, applyFilters]);

  const getActiveFilters = () => {
    return Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== "All")
    );
  };

  // Function to send filters to the WebSocket server
  const sendFilters = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ filters: getActiveFilters() }));
      console.log("Sent filters:", getActiveFilters());
    } else {
      console.warn("WebSocket not open, filters not sent");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    sendFilters();
  };

  const toggleAttributeVisibility = (attribute) => {
    setVisibleAttributes((prev) =>
      prev.includes(attribute)
        ? prev.filter((attr) => attr !== attribute)
        : [...prev, attribute]
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Live View</h2>
      <StatusIndicator isConnected={isConnected} error={error} />
      <Filters
        availableFilters={availableFilters}
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      <AttributeSelector
        logs={logs}
        visibleAttributes={visibleAttributes}
        toggleAttributeVisibility={toggleAttributeVisibility}
      />
      <LogList logs={filteredLogs} visibleAttributes={visibleAttributes} />
    </div>
  );
};

export default LiveLogViewer;