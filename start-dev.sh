#!/bin/bash
# start-dev.sh — starts Docker, backend ngrok tunnel, and Expo in one command

echo "🐳 Starting Docker containers..."
docker compose up -d
echo "✅ Docker started"

echo "🌐 Starting ngrok tunnel for backend (port 5200)..."
ngrok http 5200 --log stdout > /tmp/ngrok-backend.log 2>&1 &
sleep 3

URL=$(cat /tmp/ngrok-backend.log | grep "url=" | head -1 | sed 's/.*url=//')
echo "✅ Backend tunnel: $URL"

# Update .env with the new URL
if [ -n "$URL" ]; then
  sed -i '' "s|EXPO_PUBLIC_API_URL=.*|EXPO_PUBLIC_API_URL=$URL|" .env
  echo "✅ .env updated with: $URL"
fi

echo ""
echo "📱 Starting Expo (with tunnel)..."
echo "   Scan QR in Expo Go when it appears."
echo ""
npx expo start --tunnel --clear
