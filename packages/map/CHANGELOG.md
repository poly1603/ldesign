# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of @ldesign/map
- Core map functionality with Mapbox GL JS engine
- Multi-framework support (Vue 3, React, Vanilla JS)
- Comprehensive feature modules:
  - Routing and navigation
  - Geofencing with event detection
  - Heatmap visualization
  - Address search and geocoding
  - Measurement tools (distance and area)
  - Layer management
  - 3D building rendering
  - Administrative boundaries
- Complete TypeScript support with type definitions
- LDESIGN design system integration
- Performance optimizations for large datasets
- Comprehensive test suite (unit, integration, performance)
- Complete documentation with VitePress
- Example projects for all supported frameworks

### Features
- **Map Types**: 2D, 3D, administrative boundaries, custom regions
- **Framework Support**: Vue 3, React, Vanilla JavaScript
- **Routing**: Multi-modal routing with navigation
- **Geofencing**: Real-time location monitoring
- **Visualization**: Heatmaps and data overlays
- **Search**: Address search and geocoding
- **Measurement**: Interactive distance and area tools
- **3D**: Building rendering and custom 3D objects
- **Performance**: Optimized for large datasets
- **Accessibility**: Full keyboard and screen reader support

### Technical
- Built with TypeScript and ESM modules
- Uses @ldesign/builder for packaging
- Comprehensive Vitest test coverage
- Performance benchmarks included
- Memory leak prevention
- Tree-shaking support
- Multiple output formats (ES, CJS, UMD)

## [1.0.0] - 2024-12-XX

### Added
- Initial stable release
- All core features implemented and tested
- Production-ready performance
- Complete documentation
- Framework adapters for Vue 3, React, and Vanilla JS
- Comprehensive example projects

### Security
- No known security vulnerabilities
- Regular dependency updates
- Secure coding practices followed

---

## Release Process

1. Update version in `package.json`
2. Update this changelog
3. Run tests: `npm run test`
4. Build package: `npm run build`
5. Publish: `npm publish`

## Contributing

Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
