from fastapi import WebSocket
from collections import deque

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.recent_logs: deque = deque(maxlen=10)  # Store last 10 logs

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"New WebSocket connection. Total connections: {len(self.active_connections)}")
        # Send recent logs to new client
        for log in self.recent_logs:
            try:
                await websocket.send_json(log)
                print(f"Sent recent log to new connection: {log}")
            except Exception as e:
                print(f"Failed to send recent log: {e}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        print(f"Broadcasting log to {len(self.active_connections)} connections: {message}")
        self.recent_logs.append(message)  # Store log
        for connection in self.active_connections[:]:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Failed to send to connection: {e}")
                self.disconnect(connection)

manager = ConnectionManager()