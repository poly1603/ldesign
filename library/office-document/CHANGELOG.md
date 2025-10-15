# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-01-XX

### 🚀 Major Changes

#### Word Rendering Engine Upgrade
- **BREAKING**: Replaced `mammoth.js` with `docx-preview` for Word document rendering
- Significantly improved style rendering (fonts, colors, backgrounds)
- Better layout accuracy for complex documents
- Enhanced support for tables and images

#### Excel Rendering Engine Upgrade
- **BREAKING**: Replaced basic `xlsx` rendering with `x-data-spreadsheet`
- Complete style support (cell formats, borders, background colors)
- Interactive spreadsheet experience
- Better formula display
- Optional editing capabilities (disabled by default)

#### PowerPoint Rendering Engine Upgrade
- **BREAKING**: Replaced custom implementation with `pptxjs`
- High-fidelity slide rendering
- Complete style and layout support
- Better text and image rendering
- More accurate slide reproduction

### ✨ Features

- Added new CSS styles for PowerPoint slides (`.pptxjs-container`)
- Improved dark theme support for all renderers
- Better error handling and loading states

### 📦 Dependencies

#### Added
- `docx-preview@^0.3.7` - Word document rendering
- `x-data-spreadsheet@^1.1.9` - Excel spreadsheet rendering
- `pptxjs@^1.9.0` - PowerPoint presentation rendering

#### Removed
- `mammoth@^1.6.0` - Replaced by docx-preview
- `pptxgenjs@^3.12.0` - No longer needed

### 🔧 Technical Improvements

- Updated rollup configuration to externalize new dependencies
- Enhanced TypeScript type definitions
- Improved build process

### 📚 Documentation

- Added comprehensive upgrade guide (`UPGRADE.md`)
- Updated README with new technical stack information
- Added migration instructions

### ⚠️ Breaking Changes

#### API Compatibility
✅ **All existing APIs remain compatible** - No code changes required for existing implementations.

#### Visual Changes
Rendering output may differ visually as the new engines provide more accurate style reproduction:
- Word documents will show more accurate fonts, colors, and paragraph styles
- Excel spreadsheets will display complete cell formatting, borders, and backgrounds
- PowerPoint slides will have more accurate layouts and styles

#### Known Limitations
- PowerPoint animations and transitions are not yet supported
- Excel editing is disabled by default (can be enabled via configuration)
- Large files may require more memory and processing time

### 🐛 Bug Fixes

- Fixed style rendering issues in Word documents
- Improved layout accuracy in Excel spreadsheets
- Enhanced PowerPoint slide display quality

---

## [1.0.0] - 2024-XX-XX

### 🎉 Initial Release

- Basic Word document viewer using mammoth.js
- Basic Excel spreadsheet viewer using SheetJS
- Basic PowerPoint presentation viewer
- Framework-agnostic implementation
- Support for zoom, download, print, and fullscreen
- Light and dark theme support
- Event system for document lifecycle
- TypeScript support

[2.0.0]: https://github.com/ldesign/office-viewer/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/ldesign/office-viewer/releases/tag/v1.0.0
