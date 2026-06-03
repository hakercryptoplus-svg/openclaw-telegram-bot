#!/bin/sh
set -e

# Start the API server in the background
node --enable-source-maps artifacts/api-server/dist/index.mjs &
API_PID=$!

# Start the OpenClaw Telegram bot in the background
node artifacts/api-server/src/openclaw-start.mjs &
BOT_PID=$!

# If either process exits, kill the other and exit
wait_for_any() {
  wait -n
  EXIT_CODE=$?
  kill $API_PID $BOT_PID 2>/dev/null || true
  exit $EXIT_CODE
}

trap 'kill $API_PID $BOT_PID 2>/dev/null || true' TERM INT

# Wait for either to exit
wait $API_PID $BOT_PID
