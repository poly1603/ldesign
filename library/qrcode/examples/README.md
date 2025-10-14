# QRCode Library Examples

This directory contains example applications demonstrating the usage of the QRCode library with both React and Vue frameworks.

## Project Structure

```
examples/
├── react-example/    # React example application
│   ├── src/
│   │   ├── App.tsx   # Main app with all examples
│   │   └── ...
│   └── package.json
├── vue-example/      # Vue example application
│   ├── src/
│   │   ├── App.vue   # Main app
│   │   ├── components/
│   │   │   ├── BasicExample.vue
│   │   │   ├── ComponentExample.vue
│   │   │   ├── DirectiveExample.vue
│   │   │   ├── ComposablesExample.vue
│   │   │   ├── BatchExample.vue
│   │   │   └── InteractiveExample.vue
│   │   └── ...
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 16+ 
- npm or yarn or pnpm

## Getting Started

### Build the Library First

Before running the examples, make sure to build the QRCode library:

```bash
# From the library root directory (library/qrcode)
cd ../..
npm install
npm run build
```

### Running React Example

```bash
# Navigate to React example
cd examples/react-example

# Install dependencies
npm install

# Start development server
npm run dev
```

The React example will be available at `http://localhost:3001`

### Running Vue Example

```bash
# Navigate to Vue example  
cd examples/vue-example

# Install dependencies
npm install

# Start development server
npm run dev
```

The Vue example will be available at `http://localhost:3002`

## Features Demonstrated

### React Example

1. **Basic Example**
   - Simple QR code generation
   - Download functionality
   - Dynamic content updates

2. **Advanced Styling**
   - Different dot styles
   - Custom colors
   - Logo integration
   - Animations

3. **Hooks Example**
   - `useQRCode` hook usage
   - Programmatic generation
   - State management

4. **Batch Generation**
   - Multiple QR codes
   - Progress tracking
   - Batch download

5. **Interactive**
   - Live input with debouncing
   - Theme switching
   - Real-time updates

### Vue Example

1. **Basic Component**
   - Component usage
   - Props configuration
   - Event handling

2. **Advanced Component**
   - Slots for loading/error states
   - Complex configurations
   - Logo support

3. **Directives**
   - `v-qrcode` directive
   - Modifiers (`.svg`, `.large`, `.dark`)
   - Click to download

4. **Composables**
   - `useQRCode` composable
   - Reactive state management
   - Manual generation control

5. **Batch Generation**
   - `useBatchQRCode` composable
   - Multiple QR code management
   - Progress tracking

6. **Interactive**
   - `useQRCodeInput` with debouncing
   - `useQRCodeTheme` for theming
   - `useQRCodeValidation` for content validation

## API Usage Examples

### React

```tsx
// Component
import { QRCode } from '@qrcode-lib/adapters/react'

<QRCode
  content="https://example.com"
  size={200}
  fgColor="#000000"
  bgColor="#ffffff"
/>

// Hook
import { useQRCode } from '@qrcode-lib/adapters/react'

const { containerRef, generate, download } = useQRCode()
```

### Vue

```vue
<!-- Component -->
<template>
  <QRCode
    :content="content"
    :size="200"
    fg-color="#000000"
    bg-color="#ffffff"
  />
</template>

<!-- Directive -->
<template>
  <div v-qrcode="content" />
  <div v-qrcode.svg.large.dark="content" />
</template>

<!-- Composable -->
<script setup>
import { useQRCode } from '@qrcode-lib/adapters/vue'

const { container, generate, download } = useQRCode()
</script>
```

## Building for Production

### React
```bash
cd examples/react-example
npm run build
```

### Vue
```bash
cd examples/vue-example
npm run build
```

## Troubleshooting

### Module Not Found Errors

If you encounter module resolution errors, ensure:
1. The library is built (`npm run build` in the library root)
2. Dependencies are installed in the example project
3. The path aliases in `vite.config.ts` are correctly pointing to the library source

### TypeScript Errors

The examples use TypeScript. If you see type errors:
1. Ensure TypeScript dependencies are installed
2. Check that the library's type definitions are built
3. Restart the TypeScript service in your IDE

## License

MIT