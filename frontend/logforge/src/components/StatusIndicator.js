import React from 'react';

const StatusIndicator = ({ isConnected, error }) => {
    return (
        <div className="mb-4 p-2 flex items-center">
            <div
                className={`w-4 h-4 rounded-full mr-2 ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                }`}
            ></div>
            <span className="ml-2">Websocket Status: {isConnected ? "Connected" : "Disconnected "}</span>
            {error && <div className="mt-2 text-red-500 font-semibold">{error}</div>}
        </div>
    );
};

export default StatusIndicator;
