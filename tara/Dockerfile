FROM python:3.11-slim

# Install system audio and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install uv for rapid package installations
RUN pip install --no-cache-dir uv

# Copy dependencies first for build caching
COPY backend/pyproject.toml backend/uv.lock ./backend/

# Install Python dependencies into global Python environment
WORKDIR /app/backend
RUN uv pip install --system -r pyproject.toml

# Copy knowledge and backend code
WORKDIR /app
COPY knowledge/ ./knowledge/
COPY backend/ ./backend/

# Download Silero VAD and voice model assets at build time so cold starts are instant
WORKDIR /app/backend
RUN python -m app.agent download-files || true

# Make start script executable
RUN chmod +x start.sh

EXPOSE 8000

ENV PORT=8000
ENV PYTHONUNBUFFERED=1

CMD ["./start.sh"]
