# ChordCubes V1.55 Enterprise Restoration

## Overview

This document provides details about the restoration of ChordCubes Enterprise to its highest-scoring state, along with instructions for launching and using the application.

## Repository Structure

The ChordCubes Enterprise project now has multiple versions available:

1. **Current Version** - Located in `/Users/markvandendool/ChordCubes-Enterprise/development/src`
2. **High-Score Version** - Located in `/Users/markvandendool/ChordCubes6.0_Enterprise/ChordCubes-Enterprise/development/src`
3. **Restored Version** - Located in `/Users/markvandendool/ChordCubes-Enterprise/restored_project/development/src`

## Key Improvements in High-Score Version

The high-score version includes several significant improvements over earlier versions:

1. **Proper CI/CD Integration**
   - GitHub Actions workflows for automated testing and deployment
   - Standardized build and release processes

2. **Testing Framework**
   - Jest configuration for unit and integration tests
   - Test coverage reporting

3. **Code Quality Tools**
   - ESLint configuration for consistent code style
   - Babel configuration for modern JavaScript features

4. **Documentation**
   - CONTRIBUTING.md for contributor guidelines
   - DEVELOPMENT.md for development setup instructions
   - PROJECT_STATUS.md for project status tracking

5. **Project Organization**
   - Clear separation of development, staging, and production environments
   - Well-structured source code with proper module organization

## Launching ChordCubes

A convenient launch script has been created to simplify the process of starting different versions of ChordCubes:

```bash
/Users/markvandendool/ChordCubes-Enterprise/scripts/launch-chordcubes.sh
```

This script provides options to:

1. Launch the current version on port 8080
2. Launch the high-score version on port 9002
3. Launch the restored version on port 9003
4. Launch all versions simultaneously (in separate terminal windows)

## Version Comparison

| Feature | Current Version | High-Score Version | Restored Version |
|---------|----------------|---------------------|------------------|
| CI/CD Integration | ❌ | ✅ | ✅ |
| Testing Framework | ❌ | ✅ | ✅ |
| Code Quality Tools | ❌ | ✅ | ✅ |
| Documentation | Partial | Complete | Complete |
| Project Organization | Basic | Advanced | Advanced |

## Access URLs

When launched, the different versions can be accessed at:

- Current Version: [http://localhost:8080](http://localhost:8080)
- High-Score Version: [http://localhost:9002](http://localhost:9002)
- Restored Version: [http://localhost:9003](http://localhost:9003)

## Next Steps

To fully utilize the high-score version of ChordCubes Enterprise:

1. Review the documentation in the high-score repository
2. Set up a development environment following the instructions in DEVELOPMENT.md
3. Run the test suite to ensure everything is functioning correctly
4. Make any necessary adjustments to configuration files for your local environment

## Troubleshooting

If you encounter any issues with the launch script:

1. Ensure Python 3 is installed and accessible in your PATH
2. Check that the directory paths in the script match your actual directory structure
3. Verify that the ports specified in the script (8080, 9002, 9003) are available
4. If a port is already in use, the script will attempt to use the next available port

For any other issues, consult the documentation in the respective repository or contact support.
