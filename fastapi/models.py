
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
from datetime import datetime


Base = declarative_base()
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
