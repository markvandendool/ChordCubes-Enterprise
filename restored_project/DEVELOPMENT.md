# ChordCubes Development Environment

This document provides a complete guide to setting up and working with the ChordCubes development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **Git** (v2.30.0 or higher)
- **Modern web browser** with WebGL support

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/ChordCubes/ChordCubes-Enterprise.git
   cd ChordCubes-Enterprise
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The application will be available at http://localhost:3000

## Project Structure

```
ChordCubes-Enterprise/
├── src/                  # Source code
│   ├── engine/           # 3D rendering engine
│   ├── audio/            # Audio processing
│   ├── interaction/      # User interaction handlers
│   ├── state/            # Application state management
│   └── utils/            # Utility functions
├── tests/                # Test files
├── docs/                 # Documentation
├── .github/              # GitHub workflows
├── public/               # Static assets
└── dist/                 # Build output (generated)
```

## Development Workflow

### Development Scripts

- **Development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Run tests**: `npm test`
- **Lint code**: `npm run lint`
- **Fix linting issues**: `npm run lint:fix`
- **Generate documentation**: `npm run docs`

### Branch Strategy

- `main`: Production-ready code
- `development`: Main development branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `release/*`: Release preparation branches

### Pull Request Process

1. Create a feature branch from `development`
2. Implement your changes with tests
3. Ensure all tests pass and linting is clean
4. Submit a pull request to the `development` branch
5. Code review and approval
6. Merge to `development`

## Testing

### Unit Tests

Unit tests are written using Jest:

```bash
npm run test:unit
```

### Integration Tests

Integration tests are written using Cypress:

```bash
npm run test:integration
```

### Code Coverage

Generate code coverage reports:

```bash
npm run test:coverage
```

## Building and Deployment

### Build Process

The build process compiles and optimizes the code for production:

```bash
npm run build
```

### Deployment

Automated deployment is handled by GitHub Actions:

- Push to `development` branch: Deploys to development environment
- Push to `main` branch: Deploys to staging, then production after approval

## Continuous Integration

The CI pipeline runs automatically on pull requests and commits:

1. Build the project
2. Run tests
3. Code quality analysis
4. Deploy to appropriate environment

## Debugging

### Browser DevTools

- Use Chrome or Firefox DevTools for debugging
- WebGL inspection tools for 3D rendering issues
- Performance profiling for optimization

### Common Issues

- **WebGL not available**: Check browser compatibility and GPU drivers
- **Audio context not starting**: Ensure user interaction before starting audio
- **Performance issues**: Check frame rate and memory usage in Performance tab

## Documentation

- **Code documentation**: JSDoc comments in source code
- **API documentation**: Generated using JSDoc
- **User documentation**: Available in the `/docs` directory

## Best Practices

- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Write tests for all new features
- Document your code with JSDoc comments
- Keep pull requests focused on a single concern
- Optimize WebGL and audio performance

## Getting Help

- Check the [troubleshooting guide](./TROUBLESHOOTING.md)
- Review the [technical implementation guide](./TECHNICAL_IMPLEMENTATION_GUIDE.md)
- Submit issues for bugs or feature requests
- Contact the team for urgent matters
