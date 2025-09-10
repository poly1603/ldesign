# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-09-10

### Fixed
- Stabilized core instance implementation: removed duplicate/garbled code in src/core/instance.ts, added resilient getOptions fallback to work with mocks, and ensured optionsChanged emits consistent data.
- Vue component (src/vue/QRCode.vue): reliably emits generated and error events, triggers generation even with empty data to surface validation errors, and synchronizes error events via a watcher to avoid timing issues.
- Vue hook (src/vue/useQRCode.ts): added size validation (INVALID_SIZE), improved error clearing on successful generation, and kept result reference changes for reactivity.
- Test stability: restored QRCodeGenerator mock between tests in __tests__/vue/useQRCode.test.ts to prevent cross-test interference.
- Build usability in Node: default to SVG when DOM is unavailable and avoid DOMParser usage in Node (src/simple-index.ts), making dist usable in non-DOM environments.

### Tests
- All tests now pass: 131/131 under Vitest.
- Verified packaged build with `npm run test:build` works in Node (SVG output).

---

## [1.0.0] - 2025-09-08

### Added
- 🎉 Initial release of @ldesign/qrcode
- ✨ Core QR code generation functionality using qrcode library
- 🎯 Simple and intuitive API with QRCodeGenerator class
- 📦 Multiple output formats: Canvas (Data URL) and SVG
- 🎨 Customizable colors (foreground and background)
- ⚙️ Configurable options: size, margin, error correction level
- 🔧 Utility functions: generateQRCode and downloadQRCode
- 📝 Complete TypeScript type definitions
- 🏗️ ESM and CommonJS module support
- 🧪 Comprehensive test coverage
- 📚 Complete documentation with VitePress
- 🚀 Performance optimized with real QR code generation
- 🔒 Secure and reliable implementation

### Features
- **QRCodeGenerator Class**: Main class for creating QR code instances
- **generateQRCode Function**: Simple function for one-off QR code generation
- **downloadQRCode Function**: Browser utility for downloading QR codes
- **TypeScript Support**: Full type safety with detailed interfaces
- **Multiple Formats**: Support for canvas (data URL) and SVG output
- **Customization**: Configurable size, colors, margin, and error correction
- **Cross-platform**: Works in browser and Node.js environments
- **Modern Build**: ESM and CJS outputs with proper module resolution

### Technical Details
- Built with TypeScript for type safety
- Uses qrcode library for reliable QR code generation
- Compiled with TypeScript compiler for optimal output
- Supports tree-shaking for minimal bundle size
- Includes source maps for debugging
- Comprehensive error handling and validation

### Package Information
- Package name: @ldesign/qrcode
- Version: 1.0.0
- License: MIT
- Author: LDesign Team
- Repository: https://github.com/ldesign/qrcode
