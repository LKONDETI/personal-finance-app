#!/bin/bash

# Banking App - Docker Start Script
# Starts PostgreSQL + .NET Backend API

echo "🚀 Starting Banking App Backend Services..."
echo ""

# Stop any existing containers
echo "📦 Stopping existing containers..."
docker compose down

# Build and start services
echo "🔨 Building and starting services..."
docker compose up -d --build

# Wait for backend to be healthy
echo "⏳ Waiting for services to be ready..."
MAX_WAIT=60
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
  if curl -s http://localhost:5200/health > /dev/null 2>&1; then
    break
  fi
  sleep 2
  WAITED=$((WAITED + 2))
  echo "   Waiting... (${WAITED}s)"
done

if [ $WAITED -ge $MAX_WAIT ]; then
  echo "⚠️  Backend didn't respond within ${MAX_WAIT}s. Check logs:"
  echo "   docker compose logs backend"
  exit 1
fi

# Check service status
echo ""
echo "✅ Service Status:"
docker compose ps

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Backend Services Started Successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Available Services:"
echo "   • PostgreSQL:   localhost:5432"
echo "   • Backend API:  http://localhost:5200"
echo "   • Swagger UI:   http://localhost:5200/swagger"
echo ""
echo "🔑 Test Credentials:"
echo "   • john.doe@example.com / Test123!"
echo ""
echo "📊 View Logs:   docker compose logs -f backend"
echo "🛑 Stop:        docker compose down"
echo ""
