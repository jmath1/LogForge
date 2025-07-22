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
    timestamp: float
    pathname: str
    lineno: int
    user: str | None = None
    request: Request | None = None

class LogResponse(LogCreate):
    id: str
