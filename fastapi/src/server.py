from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from fastapi.responses import JSONResponse

from websocket import manager
from models import LogCreate, LogResponse
import uvicorn
from pymongo import MongoClient
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = MongoClient(MONGO_URL)
db = client["logforge"]

API_PASSWORD = os.getenv("API_PASSWORD", "defaultpassword")

def authenticate(password: str = Depends(lambda: os.getenv("API_PASSWORD", "defaultpassword"))):
    def dependency(x_password: str = Depends(lambda: os.getenv("API_PASSWORD", "defaultpassword"))):
        if x_password != password:
            raise HTTPException(status_code=401, detail="Invalid password")
        return x_password
    return dependency

def get_db():
    return db

@app.post("/logs", response_model=LogResponse)
async def receive_log(log: LogCreate, db=Depends(get_db), _: str = Depends(authenticate)):
    print(f"Received log: {log.dict()}")
    log_data = log.dict()
    log_data["created_at"] = datetime.utcnow()
    result = db.logs.insert_one(log_data)
    log_data["id"] = str(result.inserted_id)
    print(f"Saved log to database with ID: {log_data['id']}")

    response = LogResponse(**log_data)
    await manager.broadcast(response.dict())
    return response

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, _: str = Depends(authenticate)):
    await manager.connect(websocket)
    websocket.filters = {}
    try:
        while True:
            data = await websocket.receive_json()
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

@app.get("/filters")
async def get_filters(db=Depends(get_db), _: str = Depends(authenticate)):
    try:
        levels = db.logs.distinct("level")
        services = db.logs.distinct("service")
        loggers = db.logs.distinct("logger")

        filters = {
            "levels": levels,
            "services": services,
            "loggers": loggers,
        }
        return JSONResponse(content=filters)
    except Exception as e:
        print(f"Error retrieving filters: {e}")
        return JSONResponse(content={"error": "Failed to retrieve filters"}, status_code=500)

if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)