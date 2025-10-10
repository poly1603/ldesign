# Contributing to @ldesign/cropper

Thank you for your interest in contributing to @ldesign/cropper! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Git

### Setup Development Environment

1. Fork and clone the repository:
```bash
git clone https://github.com/your-username/cropper.git
cd cropper
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Run tests:
```bash
npm test
```

## Project Structure

```
cropper/
├── src/                  # Source code
│   ├── core/            # Core cropper functionality
│   ├── adapters/        # Framework adapters
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   └── styles/          # CSS styles
├── examples/            # Example projects
├── docs/                # Documentation
├── __tests__/           # Tests
└── dist/                # Build output
```

## Development Workflow

### Making Changes

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes

3. Write or update tests

4. Run tests:
```bash
npm test
```

5. Build the project:
```bash
npm run build
```

6. Commit your changes:
```bash
git commit -m "feat: add your feature"
```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions or changes
- `chore:` - Build process or auxiliary tool changes

Examples:
```
feat: add pinch-to-zoom support
fix: resolve crop box resize issue on mobile
docs: update installation guide
```

### Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Create a pull request with a clear description

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Export public types

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Use ES6+ features
- Follow existing code patterns

### Naming Conventions

- Classes: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_CASE`
- Types/Interfaces: `PascalCase`
- Files: `kebab-case.ts`

## Testing

### Writing Tests

- Write unit tests for new functionality
- Use descriptive test names
- Test edge cases
- Aim for high coverage

```typescript
describe('Cropper', () => {
  it('should initialize with default options', () => {
    const cropper = new Cropper('#container')
    expect(cropper).toBeDefined()
  })

  it('should load image from URL', async () => {
    const cropper = new Cropper('#container', {
      src: 'image.jpg'
    })
    await cropper.ready
    expect(cropper.getImageData()).toBeDefined()
  })
})
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e
```

## Documentation

### Updating Docs

- Update relevant documentation for changes
- Add examples for new features
- Keep API reference up to date
- Check for broken links

### Building Docs

```bash
npm run docs:dev    # Development server
npm run docs:build  # Production build
```

## Release Process

Maintainers will handle releases:

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag
4. Publish to npm
5. Create GitHub release

## Questions or Issues?

- Check existing issues on GitHub
- Join discussions
- Ask in pull request comments

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Thank You!

Your contributions make @ldesign/cropper better for everyone. We appreciate your time and effort!
