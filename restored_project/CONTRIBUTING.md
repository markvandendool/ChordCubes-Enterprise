# Contributing to ChordCubes Enterprise

Thank you for your interest in contributing to ChordCubes Enterprise! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Pull Request Process](#pull-request-process)
7. [Release Process](#release-process)
8. [Documentation](#documentation)
9. [Community](#community)

## Code of Conduct

This project adheres to a Code of Conduct that all team members, contributors, and participants are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details.

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Git
- Modern browser with WebGL support (Chrome recommended for development)
- VS Code (recommended IDE)

### Setting Up Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/markvandendool/Christian-Developer-Package.git
   cd Christian-Developer-Package/ChordCubes-Enterprise
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Run tests:
   ```bash
   npm test
   ```

## Development Workflow

### Branching Strategy

We follow a modified GitFlow workflow:

- `main`: Production-ready code
- `develop`: Integration branch for new features
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `release/*`: Release preparation branches
- `hotfix/*`: Hotfix branches

### Branch Naming Convention

- Feature branches: `feature/issue-number-short-description`
- Bug fix branches: `bugfix/issue-number-short-description`
- Release branches: `release/vX.Y.Z`
- Hotfix branches: `hotfix/vX.Y.Z`

### Working on Features

1. Create a new feature branch from `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/123-add-stop-button
   ```

2. Make your changes, following the coding standards.

3. Commit your changes using conventional commits:
   ```bash
   git commit -m "feat: add stop button to chord instrument stack"
   ```

4. Push your branch and create a pull request to `develop`.

## Coding Standards

### JavaScript Style Guide

We follow Airbnb JavaScript Style Guide with some modifications:

- Use ES6+ features
- 2 spaces for indentation
- Semicolons are required
- Maximum line length is 100 characters
- Prefer arrow functions for anonymous functions
- Use `const` and `let` instead of `var`

### ESLint and Prettier

The project uses ESLint and Prettier for code formatting and linting. Configuration files are provided in the repository.

To lint your code:
```bash
npm run lint
```

To format your code:
```bash
npm run format
```

### Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files

Examples:
```
feat: add stop button to chord instrument stack
fix: resolve issue with chord movement animation
docs: update README with new features
```

## Testing

### Types of Tests

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete user workflows

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run end-to-end tests only
npm run test:e2e

# Run tests with coverage report
npm run test:coverage
```

### Writing Tests

- Place test files in the `__tests__` directory next to the module being tested
- Name test files with `.test.js` or `.spec.js` suffix
- Use Jest for unit and integration tests
- Use Cypress for end-to-end tests

## Pull Request Process

1. Ensure your code follows the coding standards and passes all tests.
2. Update documentation if necessary.
3. Fill out the pull request template with all required information.
4. Request review from at least one team member.
5. Address any feedback from reviewers.
6. Once approved, a maintainer will merge your pull request.

## Release Process

1. Create a release branch from `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b release/vX.Y.Z
   ```

2. Update version numbers in package.json and other relevant files.
3. Update CHANGELOG.md with the new version's changes.
4. Make any final adjustments and commit them.
5. Create a pull request to `main`.
6. Once approved and merged, tag the release:
   ```bash
   git checkout main
   git pull
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   git push origin vX.Y.Z
   ```

7. Merge changes back to `develop`:
   ```bash
   git checkout develop
   git pull
   git merge --no-ff main
   git push
   ```

## Documentation

### Code Documentation

- Use JSDoc comments for functions, classes, and methods
- Document parameters, return values, and thrown exceptions
- Include examples for complex functions

Example:
```javascript
/**
 * Adds a chord to the front row
 * @param {Object} chord - The chord to add
 * @param {string} chord.roman - Roman numeral notation
 * @param {string} chord.root - Root note
 * @param {Array<number>} chord.intervals - Intervals in semitones
 * @param {string} chord.quality - Chord quality
 * @returns {Object} The added chord object with position information
 * @throws {Error} If the chord is invalid
 * 
 * @example
 * const chord = addChordToFrontRow({
 *   roman: 'I',
 *   root: 'C',
 *   intervals: [0, 4, 7],
 *   quality: 'major'
 * });
 */
function addChordToFrontRow(chord) {
  // Implementation
}
```

### Project Documentation

- Update README.md with new features and changes
- Keep architecture documentation up-to-date
- Document API changes

## Community

### Reporting Bugs

Report bugs by opening an issue on GitHub. Please use the bug report template and provide as much information as possible.

### Requesting Features

Request features by opening an issue on GitHub. Please use the feature request template and provide detailed information about the feature.

### Getting Help

If you need help, you can:
- Open an issue with the "question" label
- Contact the project maintainers directly
- Join our community chat or forum

---

Thank you for contributing to ChordCubes Enterprise! Your efforts help make this project better for everyone.
