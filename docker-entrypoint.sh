#!/bin/sh
set -e

mkdir -p /app/data/db /app/data/uploads

echo "Applying database migrations..."
npx prisma migrate deploy

echo "Starting Wiederladen..."
exec "$@"
