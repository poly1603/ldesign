# Installation

## Package Manager

Install @ldesign/qrcode using your preferred package manager:

::: code-group

```bash [npm]
npm install @ldesign/qrcode
```

```bash [yarn]
yarn add @ldesign/qrcode
```

```bash [pnpm]
pnpm add @ldesign/qrcode
```

:::

## CDN

You can also use @ldesign/qrcode via CDN:

```html
<!-- UMD build -->
<script src="https://unpkg.com/@ldesign/qrcode"></script>

<!-- ES Module -->
<script type="module">
  import { createQRCode } from 'https://unpkg.com/@ldesign/qrcode/dist/index.esm.js';
</script>
```

## TypeScript

The package includes TypeScript definitions out of the box. No additional @types packages are needed.

```typescript
import type { QRCodeConfig, QRCodeInstance } from '@ldesign/qrcode';
```

## Framework-Specific Installation

### Vue 3

The Vue adapter is included in the main package:

```typescript
import { QRCode, useQRCode } from '@ldesign/qrcode/vue';
```

**Note**: Vue 3 is a peer dependency. Make sure you have Vue 3 installed:

```bash
npm install vue@^3.0.0
```

### React

The React adapter is also included:

```typescript
import { QRCode, useQRCode } from '@ldesign/qrcode/react';
```

**Note**: React 16.8+ is a peer dependency:

```bash
npm install react@^16.8.0
```

## Build Tools

### Vite

No additional configuration needed. Just import and use:

```typescript
import { createQRCode } from '@ldesign/qrcode';
```

### Webpack

Works out of the box with Webpack 4+:

```javascript
// webpack.config.js
module.exports = {
  // ... your config
};
```

### Rollup

If you're using Rollup, make sure you have the necessary plugins:

```bash
npm install @rollup/plugin-node-resolve @rollup/plugin-commonjs
```

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  plugins: [resolve(), commonjs()],
};
```

## Verifying Installation

Create a simple test file to verify the installation:

```typescript
// test.ts
import { createQRCode } from '@ldesign/qrcode';

console.log('QRCode library loaded successfully!');

// Create a simple QR code
createQRCode({
  content: 'Installation verified!',
  container: document.body,
});
```

## Troubleshooting

### Module not found

If you see "Module not found" errors, ensure:

1. The package is installed: `npm list @ldesign/qrcode`
2. Your node_modules is up to date: `npm install`
3. Clear your build cache

### TypeScript errors

If you encounter TypeScript errors:

1. Ensure you're using TypeScript 4.0+
2. Check your tsconfig.json has `"moduleResolution": "node"`
3. Try: `npm install --save-dev @types/node`

### Build errors

For build errors:

1. Clear your build cache
2. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check your bundler configuration

## Next Steps

Once installed, head over to the [Getting Started](/guide/getting-started) guide to create your first QR code!
