# LDesign Package Configuration Guide

## Standard Configuration

All @ldesign packages should use the minimal configuration defined in `ldesign.config.template.ts`. Only add extra configuration when necessary.

## Standard Format

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs', 'umd'],
    esm: { dir: 'es', preserveStructure: true },
    cjs: { dir: 'lib', preserveStructure: true },
    umd: { dir: 'dist', name: 'LDesignPackageName' }
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
    /^lodash/
  ]
})
```

## Package-Specific Requirements

### Packages with CSS Files
**Packages:** menu, tabs

Add CSS handling configuration:
```typescript
css: {
  extract: true,
  modules: false,
}
```

### Packages with Custom External Dependencies
**Package:** shared

Override the external array:
```typescript
external: [
  'vue',
  'lodash-es',
  'raf',
]
```

### Packages with Alternative UMD Entry Points
**Packages:** animation, notification, websocket, shared

Specify custom entry in UMD config:
```typescript
output: {
  // ... other configs
  umd: {
    dir: 'dist',
    name: 'LDesignPackageName',
    entry: 'src/index-lib.ts', // Alternative entry point
  }
}
```

### Packages with Vue-Specific Globals
**Package:** cache

Add globals mapping:
```typescript
output: {
  name: 'LDesignCache',
  globals: {
    vue: 'Vue'
  },
  // ... other configs
}
```

### Packages with Additional External Patterns
**Packages:** i18n, icons, router, template, animation, menu

Add additional patterns:
```typescript
external: [
  'vue',
  'react',
  'react-dom',
  /^@ldesign\//,
  /^lodash/,
  /^@vue\//, // For Vue-related packages
  /^@babel\//, // For animation package
  'nanoid', // For menu, tabs packages
]
```

## What NOT to Include

❌ **Don't include these (handled automatically by builder):**
- `libraryType: 'typescript'` - Auto-detected
- `typescript.declaration: true` - Handled by `dts: true`
- `typescript.declarationMap: true` - Handled by `dts: true`
- Duplicate `umd` configurations (both top-level and in output)
- `postBuildValidation` config - Use builder defaults
- Excessive comments explaining each option

## Build Scripts

All packages should have these standard scripts in `package.json`:

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

## Output Structure

Standard build output:
```
package/
├── es/              # ESM format (preserves directory structure)
│   ├── index.js
│   ├── index.d.ts
│   └── ...
├── lib/             # CJS format (preserves directory structure)
│   ├── index.cjs
│   ├── index.d.ts
│   └── ...
└── dist/            # UMD format (bundled)
    ├── index.js
    └── index.min.js
```

## Verification

After configuration changes, verify:
1. ✅ All three formats build successfully
2. ✅ DTS files are generated in `es/` and `lib/`
3. ✅ Package exports in `package.json` point to correct files
4. ✅ No duplicate configurations
5. ✅ No unnecessary options


