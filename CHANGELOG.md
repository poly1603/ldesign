# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial project setup with monorepo architecture
- Core engine package with plugin system
- Color management system with theme support
- Enhanced router with caching and guards
- HTTP client with interceptors and caching
- Internationalization support with dynamic loading
- Device detection and sensor support
- Crypto tools and security utilities
- Template engine with SSR support
- Comprehensive development toolchain
- CI/CD workflows with GitHub Actions
- Quality assurance tools and checks
- Package management automation
- Documentation and contribution guidelines

### Changed

- Project renamed from "scaffold" to "ldesign"
- Updated package structure and naming conventions
- Enhanced build configuration with Rollup
- Improved testing setup with Vitest and Playwright
- Optimized TypeScript configuration
- Updated ESLint rules and code standards

### Fixed

- Path aliases updated to use @ldesign/\* namespace
- Build configuration standardized across packages
- Test coverage thresholds increased to 90%
- Security audit integration in CI pipeline

### Security

- Added security audit checks in CI/CD
- Implemented dependency vulnerability scanning
- Added license compliance checking

## [0.1.0] - 2024-01-XX

### Added

- Initial release of LDesign Vue Engine
- Core packages: engine, color, router, http, i18n, device, crypto, template
- Development tools and build configuration
- Testing framework and quality assurance
- Documentation and examples

---

## Release Notes

### Version 0.1.0

This is the initial release of LDesign Vue Engine, a modern frontend development engine based on Vue
3 with monorepo architecture.

#### Key Features

- **🚀 Engine Core**: Plugin system, middleware, and global state management
- **🎨 Color Management**: Dynamic theming and color generation
- **🛣️ Enhanced Router**: Vue Router with caching and advanced guards
- **🌐 HTTP Client**: Request library with interceptors and caching
- **🌍 Internationalization**: Multi-language support with dynamic loading
- **📱 Device Detection**: Smart device information and sensor support
- **🔐 Crypto Tools**: Encryption algorithms and security utilities
- **📄 Template Engine**: Template compilation with SSR support

#### Development Experience

- **TypeScript First**: Full TypeScript support with strict type checking
- **Modern Build Tools**: Vite for development, Rollup for production
- **Testing**: Vitest for unit tests, Playwright for E2E tests
- **Code Quality**: ESLint, Prettier, and automated quality checks
- **CI/CD**: GitHub Actions with comprehensive testing and deployment

#### Package Structure

All packages follow a consistent structure and naming convention:

- `@ldesign/engine` - Core engine and plugin system
- `@ldesign/color` - Color management and theming
- `@ldesign/router` - Enhanced Vue Router
- `@ldesign/http` - HTTP client and utilities
- `@ldesign/i18n` - Internationalization support
- `@ldesign/device` - Device detection and sensors
- `@ldesign/crypto` - Cryptographic utilities
- `@ldesign/template` - Template engine and SSR

#### Getting Started

```bash
# Install the core engine
npm install @ldesign/engine

# Or install specific packages
npm install @ldesign/color @ldesign/router @ldesign/http
```

#### Breaking Changes

This is the initial release, so there are no breaking changes from previous versions.

#### Migration Guide

For users migrating from other Vue frameworks or libraries, please refer to our
[Migration Guide](./docs/migration.md).

#### Known Issues

- None at this time

#### Roadmap

See our [Roadmap](./docs/roadmap.md) for planned features and improvements.

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## Support

If you encounter any issues or have questions, please:

1. Check the [documentation](./docs/)
2. Search [existing issues](https://github.com/ldesign/ldesign/issues)
3. Create a [new issue](https://github.com/ldesign/ldesign/issues/new)
4. Join our [discussions](https://github.com/ldesign/ldesign/discussions)

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
