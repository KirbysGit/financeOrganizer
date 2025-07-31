FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend/ ./backend/

# Copy the startup script
COPY start.sh ./start.sh

# Make startup script executable
RUN chmod +x ./start.sh

# Set working directory to backend
WORKDIR /app/backend

# Expose the port
EXPOSE 8000

# Run the application using the startup script
CMD ["./start.sh"] 