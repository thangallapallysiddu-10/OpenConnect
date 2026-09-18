#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/.."
[ -f .env ] || cp .env.example .env
npm install
docker compose up -d postgres redis
sleep 5
npm run migrate
npm run seed
echo 'Setup complete. Run npm run dev; docs: http://localhost:4000/api-docs'
