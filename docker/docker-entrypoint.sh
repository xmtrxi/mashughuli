#!/bin/sh

# This script is the entrypoint for the Docker container.
# It ensures that database migrations are applied before the application starts.

# The 'set -e' command ensures that the script will exit immediately if a command fails.
set -e

echo "Running Database Migrations..."
# Run the Prisma migration deploy command. This is safe to run multiple times.
# It applies pending migrations without generating new ones or prompting for input.
npx prisma migrate deploy

echo "Starting Application..."
# The 'exec "$@"' part is important. It replaces the script process with the
# command passed to the container (which is `node .output/server/index.mjs` from the Dockerfile's CMD).
# This ensures that the Node.js process becomes the main process (PID 1) in the container,
# which is crucial for proper signal handling (like stopping the container).
exec "$@"
