#!/bin/bash

# ChordCubes Version Verification Script
# This script verifies that ChordCubes is properly deployed and all resources are accessible

# Define color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Define the expected version
EXPECTED_VERSION="V1.55"
EXPECTED_VERSION_QUERY="1055"

# Current server port
PORT="8082"

# Print header
echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}  ChordCubes ${EXPECTED_VERSION} Deployment Verification Tool  ${NC}"
echo -e "${BLUE}  $(date)                               ${NC}"
echo -e "${BLUE}=========================================================${NC}"
echo ""

# Function to check if server is running on the specified port
check_server() {
    echo -e "${BLUE}Checking if server is running on port ${PORT}...${NC}"
    
    # Try to connect to the server
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${PORT}")
    
    if [ "$HTTP_CODE" == "200" ]; then
        echo -e "${GREEN}✅ Server is running on port ${PORT}${NC}"
        return 0
    else
        echo -e "${RED}❌ Server is NOT running on port ${PORT}${NC}"
        echo -e "${YELLOW}Starting server...${NC}"
        
        # Try to start the server
        cd "/Users/markvandendool/ChordCubes-Enterprise/restored_project/development/src" && 
        python3 -m http.server ${PORT} > /tmp/chordcubes_server.log 2>&1 &
        SERVER_PID=$!
        
        # Wait for server to start
        sleep 2
        
        # Check if server started successfully
        if kill -0 $SERVER_PID 2>/dev/null; then
            echo -e "${GREEN}✅ Server started successfully on port ${PORT}${NC}"
            return 0
        else
            echo -e "${RED}❌ Failed to start server on port ${PORT}${NC}"
            return 1
        fi
    fi
}

# Function to verify HTML content
verify_html() {
    echo -e "${BLUE}Verifying HTML content...${NC}"
    
    # Get the HTML title
    TITLE=$(curl -s "http://localhost:${PORT}" | grep -o "<title>[^<]*</title>")
    
    if [[ "$TITLE" == *"${EXPECTED_VERSION}"* ]]; then
        echo -e "${GREEN}✅ HTML title contains correct version: ${TITLE}${NC}"
    else
        echo -e "${RED}❌ HTML title does not contain expected version ${EXPECTED_VERSION}${NC}"
        echo -e "${RED}   Found: ${TITLE}${NC}"
        return 1
    fi
    
    return 0
}

# Function to verify JavaScript resources
verify_js_resources() {
    echo -e "${BLUE}Verifying JavaScript resources...${NC}"
    
    # Check main.js
    MAIN_JS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${PORT}/main.js?v=${EXPECTED_VERSION_QUERY}")
    if [ "$MAIN_JS_CODE" == "200" ]; then
        echo -e "${GREEN}✅ main.js loaded successfully${NC}"
    else
        echo -e "${RED}❌ main.js failed to load (HTTP ${MAIN_JS_CODE})${NC}"
        return 1
    fi
    
    # Check chords.js
    CHORDS_JS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${PORT}/chords.js?v=${EXPECTED_VERSION_QUERY}")
    if [ "$CHORDS_JS_CODE" == "200" ]; then
        echo -e "${GREEN}✅ chords.js loaded successfully${NC}"
    else
        echo -e "${RED}❌ chords.js failed to load (HTTP ${CHORDS_JS_CODE})${NC}"
        return 1
    fi
    
    # Check styles.css
    CSS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${PORT}/styles.css?v=2")
    if [ "$CSS_CODE" == "200" ]; then
        echo -e "${GREEN}✅ styles.css loaded successfully${NC}"
    else
        echo -e "${RED}❌ styles.css failed to load (HTTP ${CSS_CODE})${NC}"
        return 1
    fi
    
    return 0
}

# Function to verify JavaScript content
verify_js_content() {
    echo -e "${BLUE}Verifying JavaScript content...${NC}"
    
    # Get the first few lines of main.js
    MAIN_JS_HEADER=$(curl -s "http://localhost:${PORT}/main.js?v=${EXPECTED_VERSION_QUERY}" | head -n 5)
    
    if [[ "$MAIN_JS_HEADER" == *"${EXPECTED_VERSION}"* ]]; then
        echo -e "${GREEN}✅ main.js contains correct version header:${NC}"
        echo "$MAIN_JS_HEADER" | head -n 3
    else
        echo -e "${RED}❌ main.js does not contain expected version ${EXPECTED_VERSION}${NC}"
        echo -e "${RED}   Found:${NC}"
        echo "$MAIN_JS_HEADER" | head -n 3
        return 1
    fi
    
    return 0
}

# Function to verify all required files exist
verify_files_exist() {
    echo -e "${BLUE}Verifying all required files exist...${NC}"
    
    REQUIRED_FILES=(
        "index.html"
        "main.js"
        "chords.js"
        "styles.css"
        "musical-staves-3d.js"
        "staves-integration.js"
        "instrumentManager.js"
        "transport-bridge.js"
        "raycastRouter.js"
        "shelfMapService.js"
        "interactionFSM.js"
        "textureConfig.js"
        "diagnosticsOverlay.js"
        "stateStore.js"
    )
    
    MISSING_FILES=0
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "/Users/markvandendool/ChordCubes-Enterprise/restored_project/development/src/${file}" ]; then
            echo -e "${GREEN}✅ ${file} exists${NC}"
        else
            echo -e "${RED}❌ ${file} is MISSING${NC}"
            MISSING_FILES=$((MISSING_FILES + 1))
        fi
    done
    
    if [ $MISSING_FILES -eq 0 ]; then
        echo -e "${GREEN}✅ All required files exist${NC}"
        return 0
    else
        echo -e "${RED}❌ ${MISSING_FILES} required files are missing${NC}"
        return 1
    fi
}

# Function to verify version consistency
verify_version_consistency() {
    echo -e "${BLUE}Verifying version consistency across files...${NC}"
    
    # Check index.html
    INDEX_VERSION=$(grep -o "V1\.[0-9]\{2\}" "/Users/markvandendool/ChordCubes-Enterprise/restored_project/development/src/index.html" | head -n 1)
    
    # Check main.js
    MAIN_VERSION=$(grep -o "V1\.[0-9]\{2\}" "/Users/markvandendool/ChordCubes-Enterprise/restored_project/development/src/main.js" | head -n 1)
    
    # Check docs
    DOC_VERSION=$(grep -o "V1\.[0-9]\{2\}" "/Users/markvandendool/ChordCubes-Enterprise/VERSION_V1.55.md" | head -n 1)
    
    echo -e "index.html version: ${YELLOW}${INDEX_VERSION}${NC}"
    echo -e "main.js version: ${YELLOW}${MAIN_VERSION}${NC}"
    echo -e "Documentation version: ${YELLOW}${DOC_VERSION}${NC}"
    
    if [[ "$INDEX_VERSION" == "$EXPECTED_VERSION" && "$MAIN_VERSION" == "$EXPECTED_VERSION" && "$DOC_VERSION" == "$EXPECTED_VERSION" ]]; then
        echo -e "${GREEN}✅ All version references are consistent${NC}"
        return 0
    else
        echo -e "${RED}❌ Version references are inconsistent${NC}"
        return 1
    fi
}

# Run all verification functions
run_verification() {
    echo -e "${BLUE}Running full verification suite...${NC}"
    echo ""
    
    # Track overall success
    OVERALL_SUCCESS=true
    
    # Check if server is running
    if ! check_server; then
        OVERALL_SUCCESS=false
    fi
    
    echo ""
    
    # Verify HTML content
    if ! verify_html; then
        OVERALL_SUCCESS=false
    fi
    
    echo ""
    
    # Verify JavaScript resources
    if ! verify_js_resources; then
        OVERALL_SUCCESS=false
    fi
    
    echo ""
    
    # Verify JavaScript content
    if ! verify_js_content; then
        OVERALL_SUCCESS=false
    fi
    
    echo ""
    
    # Verify files exist
    if ! verify_files_exist; then
        OVERALL_SUCCESS=false
    fi
    
    echo ""
    
    # Verify version consistency
    if ! verify_version_consistency; then
        OVERALL_SUCCESS=false
    fi
    
    echo ""
    
    # Print final result
    if [ "$OVERALL_SUCCESS" = true ]; then
        echo -e "${GREEN}==============================================${NC}"
        echo -e "${GREEN}  ✅ VERIFICATION SUCCESSFUL                  ${NC}"
        echo -e "${GREEN}  ChordCubes ${EXPECTED_VERSION} is properly deployed     ${NC}"
        echo -e "${GREEN}  Access at: http://localhost:${PORT}         ${NC}"
        echo -e "${GREEN}==============================================${NC}"
        return 0
    else
        echo -e "${RED}==============================================${NC}"
        echo -e "${RED}  ❌ VERIFICATION FAILED                       ${NC}"
        echo -e "${RED}  ChordCubes ${EXPECTED_VERSION} has deployment issues    ${NC}"
        echo -e "${RED}  Fix the issues before proceeding             ${NC}"
        echo -e "${RED}==============================================${NC}"
        return 1
    fi
}

# Main function
main() {
    run_verification
    exit_code=$?
    
    echo ""
    echo -e "${BLUE}Verification completed at $(date)${NC}"
    
    return $exit_code
}

# Run the main function
main
