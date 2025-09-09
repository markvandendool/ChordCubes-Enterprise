#!/bin/bash

# ChordCubes V1.55 Safeguard Launch Script
# This script launches ChordCubes ONLY after thorough verification

# Define color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Define paths
VERIFICATION_SCRIPT="/Users/markvandendool/ChordCubes-Enterprise/scripts/verify_deployment.sh"
SRC_PATH="/Users/markvandendool/ChordCubes-Enterprise/restored_project/development/src"
VERSION="V1.55"
PORT=8082

# Print header
echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}  ChordCubes ${VERSION} Safeguard Launch Tool             ${NC}"
echo -e "${BLUE}  $(date)                                   ${NC}"
echo -e "${BLUE}=========================================================${NC}"
echo ""

# Check if verification script exists
if [ ! -f "$VERIFICATION_SCRIPT" ]; then
    echo -e "${RED}ERROR: Verification script not found at ${VERIFICATION_SCRIPT}${NC}"
    echo -e "${RED}Cannot proceed without verification!${NC}"
    exit 1
fi

# Check if source directory exists
if [ ! -d "$SRC_PATH" ]; then
    echo -e "${RED}ERROR: Source directory not found at ${SRC_PATH}${NC}"
    echo -e "${RED}Cannot proceed without source files!${NC}"
    exit 1
fi

# Function to check if port is available
port_is_available() {
    local port=$1
    nc -z localhost $port > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        return 1 # Port is in use
    else
        return 0 # Port is available
    fi
}

# Check if port is available
if ! port_is_available $PORT; then
    echo -e "${YELLOW}WARNING: Port $PORT is already in use.${NC}"
    echo -e "${YELLOW}Trying to find next available port...${NC}"
    
    # Try next 10 ports
    for i in {1..10}; do
        NEW_PORT=$((PORT + i))
        if port_is_available $NEW_PORT; then
            echo -e "${GREEN}Found available port: $NEW_PORT${NC}"
            PORT=$NEW_PORT
            break
        fi
        
        # If we've tried 10 ports and none are available
        if [ $i -eq 10 ]; then
            echo -e "${RED}ERROR: Could not find an available port in range $PORT-$((PORT+10))${NC}"
            echo -e "${RED}Please close other services using these ports and try again.${NC}"
            exit 1
        fi
    done
fi

# Run verification script
echo -e "${BLUE}Running pre-launch verification...${NC}"
"$VERIFICATION_SCRIPT"
VERIFICATION_RESULT=$?

if [ $VERIFICATION_RESULT -ne 0 ]; then
    echo -e "${RED}=========================================================${NC}"
    echo -e "${RED}  CRITICAL ERROR: Pre-launch verification failed!        ${NC}"
    echo -e "${RED}  ChordCubes cannot be launched until issues are fixed.  ${NC}"
    echo -e "${RED}=========================================================${NC}"
    
    # Ask if user wants to attempt fixes
    read -p "Do you want to attempt automatic fixes? (y/n): " attempt_fix
    
    if [[ "$attempt_fix" == "y" || "$attempt_fix" == "Y" ]]; then
        echo -e "${YELLOW}Attempting to fix common issues...${NC}"
        
        # Common fix 1: Check and update version query parameters
        echo "Checking query parameters in index.html..."
        sed -i '' 's/main\.js?v=[0-9]*/main.js?v=1055/g' "$SRC_PATH/index.html"
        sed -i '' 's/chords\.js?v=[0-9]*/chords.js?v=1055/g' "$SRC_PATH/index.html"
        
        echo "Running verification again after fixes..."
        "$VERIFICATION_SCRIPT"
        VERIFICATION_RESULT=$?
        
        if [ $VERIFICATION_RESULT -ne 0 ]; then
            echo -e "${RED}Automatic fixes were not successful.${NC}"
            echo -e "${RED}Please manually fix the issues and try again.${NC}"
            exit 1
        else
            echo -e "${GREEN}Automatic fixes were successful!${NC}"
        fi
    else
        echo -e "${RED}Launch aborted. Please fix verification issues and try again.${NC}"
        exit 1
    fi
fi

# Launch ChordCubes
echo -e "${GREEN}=========================================================${NC}"
echo -e "${GREEN}  Verification successful! Launching ChordCubes ${VERSION}  ${NC}"
echo -e "${GREEN}  URL: http://localhost:${PORT}                         ${NC}"
echo -e "${GREEN}  Press Ctrl+C to stop the server                       ${NC}"
echo -e "${GREEN}=========================================================${NC}"

# Launch the server with version environment variable
cd "$SRC_PATH" && CHORDCUBES_VERSION="$VERSION" python3 -m http.server $PORT

# Keep this exit code for the script
exit 0
