#!/bin/bash

# Banking App - Docker Start Script
# This script starts all backend services using Docker

echo "🚀 Starting Banking App Backend Services..."
echo ""

# Stop any existing containers
echo "📦 Stopping existing containers..."
docker compose down

# Build and start services
echo "🔨 Building and starting services..."
docker compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to initialize..."
sleep 10

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
echo "   • PostgreSQL Database:  localhost:5432"
echo "   • pgAdmin UI:          http://localhost:5050"
echo "   • Backend API:         http://localhost:5200"
echo "   • Swagger UI:          http://localhost:5200/swagger"
echo ""
echo "🔑 Credentials:"
echo "   • Database:   bankinguser / (from .env)"
echo "   • pgAdmin:    (from .env)"
echo "   • Test User:  john.doe@example.com / Test123!"
echo ""
echo "📊 View Logs:"
echo "   docker compose logs -f backend"
echo ""
echo "🛑 Stop Services:"
echo "   docker compose down"
echo ""
