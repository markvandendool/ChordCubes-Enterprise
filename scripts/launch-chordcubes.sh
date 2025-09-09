#!/bin/bash

# ChordCubes V1.55 Enterprise Launch Script
# This script launches different versions of ChordCubes Enterprise

echo "==============================================="
echo "  ChordCubes V1.55 Enterprise Launch Tool"
echo "  Version 1.0 - Created $(date +%Y-%m-%d)"
echo "==============================================="
echo ""

# Define color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Define version paths
CURRENT_VERSION_PATH="/Users/markvandendool/ChordCubes-Enterprise/development/src"
HIGH_SCORE_VERSION_PATH="/Users/markvandendool/ChordCubes6.0_Enterprise/ChordCubes-Enterprise/development/src"
RESTORED_VERSION_PATH="/Users/markvandendool/ChordCubes-Enterprise/restored_project/development/src"

# Function to check if a port is available
port_is_available() {
  local port=$1
  nc -z localhost $port > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    return 1 # Port is in use
  else
    return 0 # Port is available
  fi
}

# Function to launch the app
launch_app() {
  local path=$1
  local port=$2
  local version_name=$3
  
  if [ ! -d "$path" ]; then
    echo -e "${RED}Error: Directory $path does not exist.${NC}"
    return 1
  fi
  
  if ! port_is_available $port; then
    echo -e "${YELLOW}Warning: Port $port is already in use. Trying alternate port...${NC}"
    port=$((port + 1))
    if ! port_is_available $port; then
      echo -e "${RED}Error: Alternate port $port is also in use. Please close other applications and try again.${NC}"
      return 1
    fi
    echo -e "${YELLOW}Using alternate port $port${NC}"
  fi
  
  echo -e "${BLUE}Launching $version_name on port $port...${NC}"
  echo -e "${BLUE}URL: http://localhost:$port${NC}"
  echo -e "${BLUE}ChordCubes V1.55 Enterprise Edition${NC}"
  echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
  
  cd "$path" && python3 -m http.server $port
  
  return $?
}

# Main menu function
show_menu() {
  echo -e "${GREEN}Please select an option:${NC}"
  echo "1) Launch Current Version V1.55 (Port 8080)"
  echo "2) Launch High-Score Version V1.55 (Port 9002)"
  echo "3) Launch Restored Version V1.55 (Port 9003)"
  echo "4) Launch All Versions (Different Ports)"
  echo "5) Exit"
  echo ""
  read -p "Enter your choice (1-5): " choice
  
  case $choice in
    1)
      launch_app "$CURRENT_VERSION_PATH" 8080 "Current Version"
      ;;
    2)
      launch_app "$HIGH_SCORE_VERSION_PATH" 9002 "High-Score Version"
      ;;
    3)
      launch_app "$RESTORED_VERSION_PATH" 9003 "Restored Version"
      ;;
    4)
      echo -e "${YELLOW}This will launch all versions in separate terminal windows.${NC}"
      echo -e "${YELLOW}You will need to close each window separately.${NC}"
      read -p "Continue? (y/n): " confirm
      if [ "$confirm" == "y" ] || [ "$confirm" == "Y" ]; then
        # Launch each version in a new terminal window
        osascript -e "tell application \"Terminal\" to do script \"cd '$CURRENT_VERSION_PATH' && python3 -m http.server 8080 && echo 'Current Version stopped'\""
        sleep 1
        osascript -e "tell application \"Terminal\" to do script \"cd '$HIGH_SCORE_VERSION_PATH' && python3 -m http.server 9002 && echo 'High-Score Version stopped'\""
        sleep 1
        osascript -e "tell application \"Terminal\" to do script \"cd '$RESTORED_VERSION_PATH' && python3 -m http.server 9003 && echo 'Restored Version stopped'\""
        echo -e "${GREEN}All versions of ChordCubes V1.55 Enterprise launched in separate terminal windows.${NC}"
        echo -e "${BLUE}Current Version V1.55: http://localhost:8080${NC}"
        echo -e "${BLUE}High-Score Version V1.55: http://localhost:9002${NC}"
        echo -e "${BLUE}Restored Version V1.55: http://localhost:9003${NC}"
      fi
      ;;
    5)
      echo -e "${GREEN}Goodbye!${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid option. Please try again.${NC}"
      ;;
  esac
}

# Start the script
show_menu
