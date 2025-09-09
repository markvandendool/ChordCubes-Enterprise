# ChordCubes V1.55 Deployment Guidelines

## CRITICAL: Proper Version Deployment Protocol

This document outlines the MANDATORY procedures for deploying and verifying ChordCubes Enterprise. Following these steps is **NON-NEGOTIABLE** to prevent service disruptions.

## Pre-Deployment Checklist

Before ANY deployment, verify the following:

1. **Version Consistency**
   - Ensure ALL version references match (V1.55) in:
     - index.html title: `<title>ChordCubes V1.55 Gold (DEVELOPMENT)</title>`
     - main.js header: `// 🎼 CHORDCUBES 6.0 V1.55 - ENTERPRISE EDITION`
     - Version display in UI: `V1.55`
     - All documentation files

2. **Resource Query Parameters**
   - CRITICAL: All JS file references MUST use query parameters matching the current version
   - Current values (MUST match exactly):
     ```html
     <script type="module" src="./main.js?v=1055"></script>
     <script type="module" src="./chords.js?v=1055"></script>
     <link rel="stylesheet" href="./styles.css?v=2" />
     ```
   - When updating version (e.g., V1.55 → V1.56), update ALL query parameters

3. **File Integrity**
   - Verify ALL required files exist in the deployment directory
   - Required files:
     - index.html
     - main.js
     - chords.js
     - styles.css
     - All supporting JS modules

## Deployment Protocol

1. **Server Launch**
   ```bash
   cd "/Users/markvandendool/ChordCubes-Enterprise/restored_project/development/src" && python3 -m http.server 8082
   ```

2. **MANDATORY Verification Steps**
   - After server launch, IMMEDIATELY run these commands:
   
   ```bash
   # Check if server is responding
   curl -s -o /dev/null -w "%{http_code}" "http://localhost:8082"
   # Expected output: 200
   
   # Verify HTML title has correct version
   curl -s "http://localhost:8082" | grep -A1 -B1 title
   # Expected output: <title>ChordCubes V1.55 Gold (DEVELOPMENT)</title>
   
   # Verify main.js loads correctly
   curl -s -o /dev/null -w "%{http_code}" "http://localhost:8082/main.js?v=1055"
   # Expected output: 200
   
   # Verify chords.js loads correctly
   curl -s -o /dev/null -w "%{http_code}" "http://localhost:8082/chords.js?v=1055"
   # Expected output: 200
   
   # Verify styles.css loads correctly
   curl -s -o /dev/null -w "%{http_code}" "http://localhost:8082/styles.css?v=2"
   # Expected output: 200
   ```

3. **Browser Verification**
   - Open application in browser
   - Check browser console for errors (MUST be zero errors)
   - Verify version displayed in UI matches expected version

## Version Update Protocol

When updating from V1.55 to a new version:

1. **Increment Version Numbers**
   - Increment ALL version references by 0.01 (e.g., V1.55 → V1.56)
   - Update ALL files with version references:
     ```bash
     # Example commands (DO NOT COPY VERBATIM - USE PROPER TOOLS)
     # Update index.html title
     # Update main.js header
     # Update all documentation
     ```

2. **Update Query Parameters**
   - CRITICAL: Update ALL JavaScript query parameters to match new version
   - Example for V1.56:
     ```html
     <script type="module" src="./main.js?v=1056"></script>
     <script type="module" src="./chords.js?v=1056"></script>
     ```

3. **Create Version Marker**
   - Create a new VERSION_V1.xx.md file (e.g., VERSION_V1.56.md)
   - Document all changes made in this version

4. **Follow Full Verification Protocol**
   - Complete ALL steps in the verification section

## Troubleshooting

If ANY verification step fails:

1. **IMMEDIATELY HALT DEPLOYMENT**
2. Check server logs for 404 errors
3. Verify file paths and query parameters
4. Verify all files exist in the correct location
5. Check for file permission issues
6. Only resume after fixing ALL issues

## Previous Failure Analysis

Recent deployment failures were caused by:

1. **Resource Mismatch**: Query parameters in HTML didn't match actual resource paths
2. **Inadequate Verification**: Deployment declared successful without proper verification
3. **Port Conflicts**: Server ports already in use, causing connection failures
4. **Premature Success Declaration**: Work marked complete before verifying functionality

## UNBREAKABLE RULES

1. **NEVER skip verification steps** - 100% verification is MANDATORY
2. **NEVER declare success** until ALL verification steps pass
3. **ALWAYS check console for errors** - Zero errors is the only acceptable state
4. **ALWAYS update query parameters** when changing version numbers
5. **ALWAYS document ALL changes** in version marker files

By strictly following these protocols, we will prevent deployment failures and ensure ChordCubes Enterprise maintains consistent functionality across all deployments.
