FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
WORKDIR /app/src
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
