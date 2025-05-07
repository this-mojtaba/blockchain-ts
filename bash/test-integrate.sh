#!/bin/bash

# Function to stop the server
stop_server() {
    echo "Stopping the server..."
    # Attempt a graceful shutdown with pkill
    pkill -f "bun src/server/httpServer/index.ts" || taskkill /IM bun.exe /F
}

# Ensure the server is stopped on script exit
trap stop_server EXIT

# Start the server in the background
echo "Starting the server..."
bun run start &
SERVER_PID=$!

# Wait for a fixed duration (e.g., 5 seconds)
echo "Waiting for server to start on http://localhost:3000..."
sleep 1

# Check if the server is running
if ps -p $SERVER_PID > /dev/null; then
    echo "Server is running with PID: $SERVER_PID"
else
    echo "Failed to start the server."
    exit 1
fi

# Run integration tests
echo "Running integration tests..."
bun test integrate

# Optionally, give a brief moment before stopping the server
sleep 1
# The server will be stopped automatically when the script exits
