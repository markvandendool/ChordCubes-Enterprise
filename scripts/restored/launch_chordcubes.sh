#!/bin/bash
# Launch script for ChordCubes 6.0 V1.50 Enterprise
# This script launches the highest-scoring version of ChordCubes Enterprise

# Define directory paths
REPO_DIR="/Users/markvandendool/ChordCubes6.0_Enterprise"
APP_DIR="$REPO_DIR/ChordCubes-Enterprise/development/src"

# Check if application directory exists
if [ ! -d "$APP_DIR" ]; then
  echo "Error: Application directory not found at $APP_DIR"
  exit 1
fi

# Change to the application directory
cd "$APP_DIR" || exit 1

# Start a Python HTTP server on port 8080
echo "Starting ChordCubes 6.0 V1.50 Enterprise on http://localhost:8080"
echo "Press Ctrl+C to stop the server"
python3 -m http.server 8080
