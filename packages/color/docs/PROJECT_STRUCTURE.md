# @ldesign/color - Project Structure

## Overview

The `@ldesign/color` library is organized into a modular, feature-based structure that promotes maintainability, scalability, and clear separation of concerns.

## Directory Structure

```
@ldesign/color/
├── src/                        # Source code
│   ├── core/                   # Core color functionality
│   │   ├── Color.ts           # Main Color class
│   │   ├── conversions.ts     # Color format conversions
│   │   ├── manipulations.ts   # Color manipulation functions
│   │   ├── analysis.ts        # Color analysis & WCAG
│   │   └── index.ts           # Core module exports
│   │
│   ├── advanced/              # Advanced color spaces (planned)
│   │   ├── ColorAdvanced.ts   # Advanced color class
│   │   ├── lab.ts            # LAB color space
│   │   ├── lch.ts            # LCH color space
│   │   ├── xyz.ts            # XYZ color space
│   │   ├── oklab.ts          # OKLAB color space
│   │   └── oklch.ts          # OKLCH color space
│   │
│   ├── animation/             # Animation system (planned)
│   │   ├── ColorAnimation.ts  # Animation controller
│   │   ├── easing.ts         # Easing functions
│   │   ├── keyframes.ts      # Keyframe animations
│   │   └── transitions.ts    # Color transitions
│   │
│   ├── plugins/               # Plugin system (planned)
│   │   ├── PluginManager.ts  # Plugin management
│   │   ├── base.ts           # Base plugin interface
│   │   └── built-in/         # Built-in plugins
│   │
│   ├── visualization/         # Visualization tools (planned)
│   │   ├── ColorWheel.ts     # Color wheel generator
│   │   ├── Gradient.ts       # Gradient generator
│   │   └── Palette.ts        # Palette visualization
│   │
│   ├── utils/                 # Utility functions
│   │   ├── cache.ts          # LRU cache implementation
│   │   ├── math.ts           # Math utilities
│   │   └── validators.ts     # Input validators
│   │
│   ├── constants/             # Constants and data
│   │   └── namedColors.ts    # CSS named colors
│   │
│   ├── types.ts               # TypeScript type definitions
│   └── index.ts               # Main entry point
│
├── tests/                      # Test files
│   ├── core/                  # Core module tests
│   ├── advanced/              # Advanced module tests
│   ├── animation/             # Animation tests
│   ├── plugins/               # Plugin tests
│   └── visualization/         # Visualization tests
│
├── examples/                   # Usage examples
│   ├── vanilla/               # Vanilla JS examples
│   └── vue/                   # Vue.js examples
│
├── docs/                       # Documentation
│   ├── PROJECT_STRUCTURE.md  # This file
│   ├── API.md                 # API documentation
│   └── CONTRIBUTING.md        # Contribution guidelines
│
├── dist/                       # UMD builds (generated)
├── es/                         # ES module builds (generated)
├── lib/                        # CommonJS builds (generated)
│
├── package.json               # Package configuration
├── tsconfig.json              # TypeScript configuration
├── tsconfig.build.json        # Build TypeScript config
├── README.md                  # Project readme
├── CHANGELOG.md               # Version changelog
└── LICENSE                    # MIT license
```

## Module Organization

### Core Module (`src/core/`)
The heart of the library containing the basic `Color` class and fundamental operations:
- **Color.ts**: Main color class with basic manipulation methods
- **conversions.ts**: Functions for converting between color formats (RGB, HSL, HSV, HEX)
- **manipulations.ts**: Color manipulation functions (mix, blend, tint, shade)
- **analysis.ts**: Color analysis functions (luminance, contrast, WCAG compliance)

### Advanced Module (`src/advanced/`) - Planned
Professional color space support:
- LAB, LCH, XYZ color spaces
- OKLAB, OKLCH perceptually uniform spaces
- Delta E color difference calculations
- Color temperature analysis

### Animation Module (`src/animation/`) - Planned
Smooth color transitions and animations:
- Frame-based interpolation
- Easing functions
- Keyframe animations
- Spring physics

### Plugin System (`src/plugins/`) - Planned
Extensible architecture for custom functionality:
- Plugin registration and management
- Built-in plugins (CMYK, effects, etc.)
- Hook system for lifecycle events

### Visualization Module (`src/visualization/`) - Planned
Tools for visualizing colors:
- SVG color wheel generation
- Gradient builders
- Palette visualizations
- 3D color space representations

### Utilities (`src/utils/`)
Shared utility functions:
- **cache.ts**: LRU cache for expensive operations
- **math.ts**: Mathematical utility functions
- **validators.ts**: Input validation and parsing

### Constants (`src/constants/`)
Static data and configurations:
- **namedColors.ts**: CSS named color definitions

## Build Outputs

The library is built into multiple formats for different use cases:

- **`es/`**: ES modules for modern bundlers
- **`lib/`**: CommonJS for Node.js
- **`dist/`**: UMD builds for browser usage

## Type Definitions

All TypeScript type definitions are centralized in `src/types.ts`, providing:
- Color format interfaces (RGB, HSL, HSV, etc.)
- Configuration options
- Plugin interfaces
- Animation types

## Testing Strategy

Tests are organized to mirror the source structure:
- Unit tests for each module
- Integration tests for cross-module functionality
- Performance benchmarks
- Visual regression tests for visualization

## Development Workflow

1. **Source Code**: All development happens in `src/`
2. **Building**: Run `npm run build:all` to generate all output formats
3. **Testing**: Run `npm test` to execute the test suite
4. **Type Checking**: Run `npm run type-check` for TypeScript validation

## Best Practices

1. **Modularity**: Each module should be self-contained with clear exports
2. **Tree-Shaking**: Structure allows unused code to be eliminated
3. **Type Safety**: Full TypeScript coverage with strict mode
4. **Performance**: Use caching and optimization where appropriate
5. **Documentation**: Each module has inline JSDoc comments

## Future Enhancements

- WebAssembly modules for performance-critical operations
- Web Worker support for heavy computations
- React/Vue component libraries
- CLI tool for color operations
- Visual Studio Code extension