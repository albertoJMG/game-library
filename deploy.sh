#!/bin/bash
set -e

echo "Pulling latest code..."
git pull

echo "Stopping containers..."
docker compose down

echo "Building image (no cache)..."
docker compose build --build-arg CACHE_BUST=$(date +%s) --no-cache

echo "Starting containers..."
docker compose up -d

echo "Done! Checking logs..."
docker logs game-library --tail 10
