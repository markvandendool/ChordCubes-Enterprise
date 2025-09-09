#!/bin/bash

# Quick Launch for ChordCubes V1.55 Enterprise
# This script provides quick access to the ChordCubes launch options

# Path to the main launch script
LAUNCH_SCRIPT="/Users/markvandendool/ChordCubes-Enterprise/scripts/launch-chordcubes.sh"

# Check if the launch script exists
if [ ! -f "$LAUNCH_SCRIPT" ]; then
  echo "Error: Launch script not found at $LAUNCH_SCRIPT"
  exit 1
fi

# Launch the script
"$LAUNCH_SCRIPT"
