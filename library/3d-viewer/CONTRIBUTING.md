# Contributing Guide

Thank you for considering contributing to the 3D Panorama Viewer project!

## Development Setup

### Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Build all packages:
   ```bash
   pnpm build
   ```
4. Run an example to test:
   ```bash
   cd examples/vue-demo
   pnpm dev
   ```

## Project Structure

```
3d-viewer/
├── packages/
│   ├── core/           # Core library
│   ├── vue/            # Vue wrapper
│   ├── react/          # React wrapper
│   └── lit/            # Lit wrapper
└── examples/           # Demo applications
    ├── vue-demo/
    ├── react-demo/
    └── lit-demo/
```

## Making Changes

### Core Package

The core package (`packages/core`) contains the framework-agnostic implementation:

- `src/PanoramaViewer.ts` - Main viewer class
- `src/controls/` - Control implementations (touch, gyroscope)
- `src/types.ts` - TypeScript type definitions

After making changes, rebuild:
```bash
cd packages/core
pnpm build
```

### Framework Wrappers

The framework wrappers are thin layers around the core package. When updating:

1. Make sure the core package is built first
2. Update the wrapper component
3. Rebuild the wrapper package
4. Test in the corresponding example

## Testing Your Changes

Test your changes in all three examples to ensure cross-framework compatibility:

```bash
# Terminal 1 - Vue
cd examples/vue-demo && pnpm dev

# Terminal 2 - React
cd examples/react-demo && pnpm dev

# Terminal 3 - Lit
cd examples/lit-demo && pnpm dev
```

## Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Add JSDoc comments for public APIs
- Keep functions focused and small

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all packages build successfully
4. Test your changes in the examples
5. Update documentation if needed
6. Submit a pull request

## Reporting Issues

When reporting issues, please include:

- Browser and version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

Thank you for contributing!


