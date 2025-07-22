from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Column, Integer, String, Float, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime
from collections import deque
import asyncio
import uvicorn
import os
import json
from fastapi.responses import JSONResponse

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./logs.db")

Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ------------------------
# DB Model
# ------------------------
class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String)
    level = Column(String)
    logger = Column(String)
    timestamp = Column(Float)
    pathname = Column(String)
    lineno = Column(Integer)
    service = Column(String)
    user = Column(String, nullable=True)
    request_method = Column(String, nullable=True)
    request_url = Column(String, nullable=True)
    request_headers = Column(String, nullable=True)
    request_body = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# ------------------------
# Pydantic Schemas
# ------------------------
class Request(BaseModel):
    method: str
    url: str
    headers: dict
    body: str | None = None

class LogCreate(BaseModel):
    message: str
    service: str
    level: str
    logger: str
    timestamp: float
    pathname: str
    lineno: int
    user: str | None = None
    request: Request | None = None

class LogResponse(LogCreate):
    id: int

# ------------------------
# WebSocket Manager
# ------------------------
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

# ------------------------
# FastAPI App
# ------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Log receiver endpoint
@app.post("/logs", response_model=LogResponse)
async def receive_log(log: LogCreate, db: Session = Depends(get_db)):
    print(f"Received log: {log.dict()}")
    # Create database model instance
    db_log = Log(
        message=log.message,
        service=log.service,
        level=log.level,
        logger=log.logger,
        timestamp=log.timestamp,
        pathname=log.pathname,
        lineno=log.lineno,
        user=log.user,
        request_method=log.request.method if log.request else None,
        request_url=log.request.url if log.request else None,
        request_headers=str(log.request.headers) if log.request else None,
        request_body=log.request.body if log.request else None,
    )
    
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    print(f"Saved log to database with ID: {db_log.id}")
    
    # Prepare response and broadcast
    response = LogResponse(
        id=db_log.id,
        message=db_log.message,
        service=db_log.service,
        level=db_log.level,
        logger=db_log.logger,
        timestamp=db_log.timestamp,
        pathname=db_log.pathname,
        lineno=db_log.lineno,
        user=db_log.user,
        request=log.request
    )
    
    await manager.broadcast(response.dict())
    return response

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    # Store filters for this connection
    websocket.filters = {}
    try:
        while True:
            data = await websocket.receive_json()  # Expect JSON messages for filters
            if "filters" in data:
                websocket.filters = data["filters"]
                print(f"Updated filters for connection: {websocket.filters}")
            else:
                print(f"Received unexpected message: {data}")

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("WebSocket disconnected by client")
    except Exception as e:
        manager.disconnect(websocket)
        print(f"WebSocket error: {e}")

# Endpoint to retrieve all possible filters
@app.get("/filters")
async def get_filters(db: Session = Depends(get_db)):
    try:
        # Query distinct values for filterable fields
        levels = db.query(Log.level).distinct().all()
        services = db.query(Log.service).distinct().all()
        loggers = db.query(Log.logger).distinct().all()

        # Format the response
        filters = {
            "levels": [level[0] for level in levels],
            "services": [service[0] for service in services],
            "loggers": [logger[0] for logger in loggers],
        }
        return JSONResponse(content=filters)
    except Exception as e:
        print(f"Error retrieving filters: {e}")
        return JSONResponse(content={"error": "Failed to retrieve filters"}, status_code=500)

if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)