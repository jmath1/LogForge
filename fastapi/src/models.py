from pydantic import BaseModel
from datetime import datetime


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
    timestamp: float | None = None
    pathname: str
    lineno: int
    user: str | None = None
    request: Request | None = None
    
    def __init__(self, **data):
            # Set default timestamp if not provided
            if 'timestamp' not in data or data['timestamp'] is None:
                data['timestamp'] = datetime.now().timestamp()
            super().__init__(**data)

class LogResponse(LogCreate):
    id: str
