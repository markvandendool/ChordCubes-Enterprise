#!/bin/bash

# ChordCubes Version Update Helper
# This script safely updates ChordCubes to a new version

# Define color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Current version
CURRENT_VERSION="V1.55"
CURRENT_VERSION_NUM="1055"

# Print header
echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}  ChordCubes Version Update Helper                      ${NC}"
echo -e "${BLUE}  Current Version: ${CURRENT_VERSION}                               ${NC}"
echo -e "${BLUE}=========================================================${NC}"
echo ""

# Get new version from user
read -p "Enter new version (e.g., V1.56): " NEW_VERSION

# Validate version format
if [[ ! $NEW_VERSION =~ ^V1\.[0-9]{2}$ ]]; then
    echo -e "${RED}Invalid version format. Must be in format V1.XX (e.g., V1.56)${NC}"
    exit 1
fi

# Extract version number for query parameters
NEW_VERSION_NUM=${NEW_VERSION/V/}
NEW_VERSION_NUM=${NEW_VERSION_NUM/.}

# Confirm with user
echo -e "${YELLOW}You are about to update ChordCubes from ${CURRENT_VERSION} to ${NEW_VERSION}${NC}"
echo -e "${YELLOW}This will update all version references and query parameters.${NC}"
read -p "Continue? (y/n): " CONFIRM

if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
    echo -e "${RED}Update cancelled.${NC}"
    exit 0
fi

# Define paths
SRC_PATH="/Users/markvandendool/ChordCubes-Enterprise/restored_project/development/src"
DOCS_PATH="/Users/markvandendool/ChordCubes-Enterprise"

# Check if source directory exists
if [ ! -d "$SRC_PATH" ]; then
    echo -e "${RED}ERROR: Source directory not found at ${SRC_PATH}${NC}"
    exit 1
fi

# Create backup
echo -e "${BLUE}Creating backup before update...${NC}"
BACKUP_DIR="${DOCS_PATH}/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -R "$SRC_PATH" "$BACKUP_DIR/"
echo -e "${GREEN}Backup created at ${BACKUP_DIR}${NC}"

# Update version references
echo -e "${BLUE}Updating version references...${NC}"

# Update index.html title
echo "  - Updating index.html title..."
sed -i '' "s/<title>ChordCubes ${CURRENT_VERSION} Gold/<title>ChordCubes ${NEW_VERSION} Gold/g" "${SRC_PATH}/index.html"

# Update version display in index.html
echo "  - Updating version display in index.html..."
sed -i '' "s/>V1\.55</>V1\.${NEW_VERSION:3:2}</g" "${SRC_PATH}/index.html"

# Update main.js header
echo "  - Updating main.js header..."
sed -i '' "s/CHORDCUBES 6.0 ${CURRENT_VERSION}/CHORDCUBES 6.0 ${NEW_VERSION}/g" "${SRC_PATH}/main.js"
sed -i '' "s/MAIN.JS ${CURRENT_VERSION}/MAIN.JS ${NEW_VERSION}/g" "${SRC_PATH}/main.js"

# Update query parameters
echo -e "${BLUE}Updating query parameters...${NC}"
echo "  - Updating main.js query parameter..."
sed -i '' "s/main\.js?v=${CURRENT_VERSION_NUM}/main.js?v=${NEW_VERSION_NUM}/g" "${SRC_PATH}/index.html"

echo "  - Updating chords.js query parameter..."
sed -i '' "s/chords\.js?v=${CURRENT_VERSION_NUM}/chords.js?v=${NEW_VERSION_NUM}/g" "${SRC_PATH}/index.html"

# Create new version marker file
echo -e "${BLUE}Creating version marker file...${NC}"
NEW_VERSION_FILE="${DOCS_PATH}/VERSION_${NEW_VERSION}.md"
cp "${DOCS_PATH}/VERSION_${CURRENT_VERSION}.md" "$NEW_VERSION_FILE"
sed -i '' "s/${CURRENT_VERSION}/${NEW_VERSION}/g" "$NEW_VERSION_FILE"

# Update documentation files
echo -e "${BLUE}Updating documentation files...${NC}"
find "$DOCS_PATH" -name "*.md" -not -path "*/backups/*" -exec sed -i '' "s/ChordCubes ${CURRENT_VERSION}/ChordCubes ${NEW_VERSION}/g" {} \;

# Update launch scripts
echo -e "${BLUE}Updating launch scripts...${NC}"
sed -i '' "s/VERSION=\"${CURRENT_VERSION}\"/VERSION=\"${NEW_VERSION}\"/g" "${DOCS_PATH}/scripts/safeguard_launch.sh"
sed -i '' "s/EXPECTED_VERSION=\"${CURRENT_VERSION}\"/EXPECTED_VERSION=\"${NEW_VERSION}\"/g" "${DOCS_PATH}/scripts/verify_deployment.sh"
sed -i '' "s/EXPECTED_VERSION_QUERY=\"${CURRENT_VERSION_NUM}\"/EXPECTED_VERSION_QUERY=\"${NEW_VERSION_NUM}\"/g" "${DOCS_PATH}/scripts/verify_deployment.sh"

echo -e "${GREEN}=========================================================${NC}"
echo -e "${GREEN}  Update Completed Successfully!                        ${NC}"
echo -e "${GREEN}  ChordCubes has been updated from ${CURRENT_VERSION} to ${NEW_VERSION}         ${NC}"
echo -e "${GREEN}=========================================================${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Run the verification script to ensure everything is updated correctly:"
echo "   ${DOCS_PATH}/scripts/verify_deployment.sh"
echo ""
echo "2. Use the safeguard launch script to start ChordCubes ${NEW_VERSION}:"
echo "   ${DOCS_PATH}/scripts/safeguard_launch.sh"
echo ""
echo -e "${YELLOW}A backup of the previous version has been created at:${NC}"
echo "   ${BACKUP_DIR}"

exit 0
