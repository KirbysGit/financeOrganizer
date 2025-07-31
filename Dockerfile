FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend/ ./backend/

# Copy the main entry point
COPY main.py .

# Expose the port
EXPOSE 8000

# Run the application
CMD ["python", "main.py"] 