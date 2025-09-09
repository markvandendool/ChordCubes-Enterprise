#!/bin/bash

# ChordCubes Recovery Launch Script
# This script launches the recovered and fixed ChordCubes application

echo "======================================================"
echo "🚀 ChordCubes Enterprise - Post-Recovery Launch"
echo "======================================================"
echo ""
echo "✅ Recovery Status:"
echo "  - Restored from CHRISTIAN-VERIFIED-V150 clean backup"
echo "  - Applied 40% cube face lightening for visibility"
echo "  - Enhanced font configuration (Fontdec13Upgraded)"
echo "  - Fixed memory leaks with DisposalManager"
echo "  - Fixed audio race conditions with AudioSystemV2"
echo "  - Added null safety with SafeAccessUtils"
echo "  - Implemented atomic state management"
echo ""
echo "📊 Code Quality Improvements:"
echo "  - Reduced main.js from 12,262 to ~3,436 lines"
echo "  - Added proper error boundaries"
echo "  - Implemented resource cleanup"
echo "  - Fixed event listener leaks"
echo ""
echo "======================================================"
echo ""

# Navigate to the development directory
cd "$(dirname "$0")/restored_project/development/src"

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Error: Python is not installed. Please install Python to run the web server."
    exit 1
fi

# Start the web server
echo "🌐 Starting web server on http://localhost:8080"
echo "📝 Test suite available at: http://localhost:8080/test-recovery.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo "======================================================"

# Start the server
$PYTHON_CMD -m http.server 8080
