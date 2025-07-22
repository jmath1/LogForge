import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import Filters from './Filters';

const LiveLogViewer = () => {
  const [logs, setLogs] = useState([]); // All received logs
  const [filteredLogs, setFilteredLogs] = useState([]); // Filtered subset of logs
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [filters, setFilters] = useState({ level: "All", service: "All", logger: "All" }); // Default to "All"
  const [availableFilters, setAvailableFilters] = useState({ levels: [], services: [], loggers: [] });
  const wsRef = useRef(null);

  // Fetch available filters from the server
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await axios.get("http://localhost:8000/filters");
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

  // Initialize WebSocket only once
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection established");
      setIsConnected(true);
      setError(null);
      // Send initial filters to the server
      sendFilters();
    };

    ws.onmessage = (event) => {
      try {
        const log = JSON.parse(event.data);
        console.log("Received log:", log);
        setLogs((prev) => [log, ...prev].slice(0, 100)); // Limit to 100 logs
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
  }, []); // Empty dependency array for one-time setup

  // Filter logs based on current filters
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

    // Send updated filters to the WebSocket server
    sendFilters();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Live Logs</h2>
      <div className={`mb-4 p-2 rounded ${isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
        Status: {isConnected ? "Connected" : "Disconnected"}
      </div>
      {error && <div className="mb-4 text-red-500 font-semibold">{error}</div>}

      {/* Filters Section with Feedback */}
      <Filters
        availableFilters={availableFilters}
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      <div className="mb-4 text-sm text-gray-600">
        Active Filters: {Object.entries(getActiveFilters()).length > 0
          ? Object.entries(getActiveFilters()).map(([key, value]) => `${key}: ${value}`).join(", ")
          : "None"}
      </div>

      {/* Logs Section */}
      <div className="bg-white shadow rounded p-4 max-h-96 overflow-y-auto">
        <ul className="space-y-2">
          {filteredLogs.map((log, idx) => (
            <li key={idx} className="bg-gray-50 p-2 rounded shadow-sm">
              <code className="text-sm text-gray-700">
                [{log.level}] {log.logger}: {log.message} (Time: {new Date(log.created_at * 1000).toLocaleString()})
              </code>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LiveLogViewer;