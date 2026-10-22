#!/bin/bash
set -e

echo "=== Starting Tara Voice & API Services ==="

# Append FRONTEND_URL to ALLOWED_ORIGINS if set
if [ -n "$FRONTEND_URL" ]; then
    export ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-http://localhost:3000},$FRONTEND_URL"
fi

# Run knowledge ingestion if docs exist
if [ -d "../knowledge/docs" ] && [ "$(ls -A ../knowledge/docs 2>/dev/null)" ]; then
    echo "Running knowledge ingestion check..."
    python -m app.ingest || echo "Ingestion skipped or already up to date."
fi

# Start the LiveKit Voice Agent worker in the background
if [ -n "$LIVEKIT_URL" ] && [ -n "$LIVEKIT_API_KEY" ]; then
    echo "LiveKit credentials detected. Launching Voice Agent worker..."
    python -m app.agent start &
    AGENT_PID=$!
    echo "LiveKit Voice Agent running with PID $AGENT_PID"
else
    echo "Notice: LIVEKIT_URL or LIVEKIT_API_KEY not found. Voice worker will not start."
fi

# Clean shutdown trap
cleanup() {
    echo "Received stop signal. Stopping services..."
    if [ -n "$AGENT_PID" ]; then
        kill -TERM "$AGENT_PID" 2>/dev/null || true
    fi
    exit 0
}
trap cleanup SIGTERM SIGINT

# Start FastAPI server in foreground (responds to health checks and HTTP endpoints)
echo "Starting FastAPI server on 0.0.0.0:${PORT:-8000}..."
exec uvicorn app.api:app --host 0.0.0.0 --port "${PORT:-8000}"
