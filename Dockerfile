FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend/ ./backend/

# Set working directory to backend
WORKDIR /app/backend

# Expose the port
EXPOSE 8000

# Run the application directly from backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 