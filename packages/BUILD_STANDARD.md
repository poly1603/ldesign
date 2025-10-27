# Package Build Standard

## Overview

All @ldesign packages use a standardized build configuration to ensure consistency, maintainability, and optimal output across the ecosystem.

## Standard Configuration

Every package uses the following minimal configuration pattern:

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  
  output: {
    format: ['esm', 'cjs', 'umd'],
    esm: {
      dir: 'es',
      preserveStructure: true,
    },
    cjs: {
      dir: 'lib',
      preserveStructure: true,
    },
    umd: {
      dir: 'dist',
      name: 'LDesignPackageName',
    },
  },
  
  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,
  
  external: [
    'vue',
    'react',
    'react-dom',
    /^@ldesign\//,
    /^lodash/,
  ],
})
```

## Output Structure

Each package produces three build formats:

### ESM (ES Modules)
- **Directory**: `es/`
- **Features**:
  - Preserves source directory structure
  - Generates `.d.ts` type declarations
  - Includes sourcemaps
  - Modern JavaScript for tree-shaking

### CJS (CommonJS)
- **Directory**: `lib/`
- **Features**:
  - Preserves source directory structure
  - Files use `.cjs` extension
  - Generates `.d.ts` type declarations
  - Includes sourcemaps
  - Compatible with Node.js

### UMD (Universal Module Definition)
- **Directory**: `dist/`
- **Features**:
  - Single bundled file
  - Browser-compatible
  - Includes minified version
  - Includes sourcemaps

## Package-Specific Configurations

### CSS Handling (menu, tabs)
```typescript
css: {
  extract: true,
  modules: false,
},
copy: {
  patterns: [
    { from: 'src/styles/**/*.css', to: 'es/styles' },
    { from: 'src/styles/**/*.css', to: 'lib/styles' },
  ],
}
```

### Custom External Dependencies (shared)
```typescript
external: [
  'vue',
  'lodash-es',
  'raf',
]
```

### Alternative UMD Entry (animation, notification, websocket, shared)
```typescript
output: {
  // ...
  umd: {
    dir: 'dist',
    name: 'LDesignPackageName',
    entry: 'src/index-lib.ts', // Custom entry point
  },
}
```

### Vue Globals (cache)
```typescript
output: {
  name: 'LDesignCache',
  globals: {
    vue: 'Vue'
  },
  // ...
}
```

### Additional External Patterns
Some packages include additional external patterns for framework-specific dependencies:

```typescript
external: [
  'vue',
  'react',
  'react-dom',
  /^@ldesign\//,
  /^lodash/,
  /^@vue\//,      // Vue packages (i18n, icons, router, template)
  /^@babel\//,    // Babel packages (animation)
  'nanoid',       // Utility packages (menu, tabs)
]
```

## Build Scripts

All packages include these standard npm scripts:

```json
{
  "scripts": {
    "build": "ldesign-builder build",
    "build:watch": "ldesign-builder build --watch",
    "dev": "ldesign-builder build --mode development --watch",
    "clean": "rimraf es lib dist coverage"
  }
}
```

## Package.json Exports

Each package exports its modules using the exports field:

```json
{
  "type": "module",
  "exports": {
    ".": {
      "types": "./es/index.d.ts",
      "import": "./es/index.js",
      "require": "./lib/index.cjs"
    }
  },
  "main": "./lib/index.cjs",
  "module": "./es/index.js",
  "types": "./es/index.d.ts",
  "unpkg": "./dist/index.min.js",
  "jsdelivr": "./dist/index.min.js",
  "files": [
    "es",
    "lib",
    "dist"
  ]
}
```

## Configuration Principles

### ✅ Do Include
- Minimal necessary configuration
- Package-specific requirements only
- Clear, readable structure

### ❌ Don't Include
- `libraryType: 'typescript'` - Auto-detected by builder
- `typescript.declaration` - Handled by `dts: true`
- `typescript.declarationMap` - Handled by `dts: true`
- Duplicate UMD configurations
- Excessive explanatory comments
- Builder internal options

## Verification Checklist

After making configuration changes, verify:

- [ ] All three formats build successfully
- [ ] ESM files are in `es/` directory
- [ ] CJS files are in `lib/` directory with `.cjs` extension
- [ ] UMD files are in `dist/` directory
- [ ] DTS files exist alongside source files in `es/` and `lib/`
- [ ] Package.json exports align with actual output
- [ ] No duplicate configurations
- [ ] No unnecessary options

## Migration from Old Configs

If migrating from an older configuration:

1. **Remove redundant settings**:
   - Remove `libraryType` if set to `'typescript'`
   - Remove `typescript.declaration` and `typescript.declarationMap`
   - Remove duplicate `umd` top-level configuration

2. **Consolidate UMD config**:
   - Merge any top-level `umd` settings into `output.umd`
   - Ensure only one UMD entry point is specified

3. **Simplify structure**:
   - Remove excessive comments
   - Use standard external patterns
   - Follow the template structure

## Tools and Validation

### Config Normalizer
The builder includes a config normalizer that detects and fixes common issues:

```typescript
import { normalizeConfig } from '@ldesign/builder'

const result = normalizeConfig(config)
// Automatically detects and warns about:
// - Duplicate UMD configurations
// - Redundant libraryType declarations
// - Unnecessary TypeScript settings
// - Conflicting entry points
```

### LDesign Package Preset
Use the preset for quick setup:

```typescript
import { ldesignPackage } from '@ldesign/builder'

export default ldesignPackage({
  // Only specify what's different from defaults
  external: ['vue', 'custom-dep'],
})
```

## Support

For questions or issues with build configuration:
- See `packages/PACKAGE_CONFIG_GUIDE.md` for detailed examples
- Check `packages/ldesign.config.template.ts` for the standard template
- Use the config normalizer to detect issues automatically
