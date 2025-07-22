from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from collections import deque
import uvicorn
import os
from fastapi.responses import JSONResponse

from models import Log, LogCreate, LogResponse
from database import get_db, DATABASE_URL, Base, engine
from websocket import manager

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