# Getting Started

Welcome to @ldesign/qrcode! This guide will help you get up and running quickly.

## What is @ldesign/qrcode?

@ldesign/qrcode is a powerful and flexible QR code generator for web applications. It provides:

- **Multiple rendering methods**: Canvas and SVG support
- **Framework integration**: Native components for Vue and React
- **Rich styling options**: Colors, corner radius, margins, and more
- **Logo integration**: Add your brand logo to QR codes
- **TypeScript support**: Fully typed API
- **Lightweight**: Small bundle size with no unnecessary dependencies

## Installation

Install the package using your preferred package manager:

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

## Your First QR Code

Here's how to create your first QR code:

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>QR Code Demo</title>
</head>
<body>
  <div id="qr-container"></div>

  <script type="module">
    import { createQRCode } from '@ldesign/qrcode';

    createQRCode({
      content: 'Hello, World!',
      container: document.getElementById('qr-container'),
    });
  </script>
</body>
</html>
```

### Vue 3

```vue
<template>
  <div>
    <h1>My QR Code</h1>
    <QRCode content="Hello, World!" />
  </div>
</template>

<script setup>
import { QRCode } from '@ldesign/qrcode/vue';
</script>
```

### React

```tsx
import { QRCode } from '@ldesign/qrcode/react';

function App() {
  return (
    <div>
      <h1>My QR Code</h1>
      <QRCode content="Hello, World!" />
    </div>
  );
}

export default App;
```

## Basic Configuration

Customize your QR code with configuration options:

```typescript
import { createQRCode } from '@ldesign/qrcode';

const qrCode = createQRCode({
  // Content to encode
  content: 'https://example.com',

  // Container element
  container: document.getElementById('qr-container'),

  // Render type: 'canvas' or 'svg'
  renderType: 'canvas',

  // Error correction level: 'L', 'M', 'Q', 'H'
  errorCorrectionLevel: 'M',

  // Style configuration
  style: {
    size: 200,           // Size in pixels
    margin: 4,           // Margin in modules
    fgColor: '#000000',  // Foreground color
    bgColor: '#ffffff',  // Background color
    cornerRadius: 0,     // Corner radius (0-0.5)
  },
});
```

## Next Steps

Now that you have a basic QR code working, explore more features:

- [Styling Guide](/guide/styling) - Learn about styling options
- [Logo Integration](/guide/logo) - Add logos to your QR codes
- [Vue Integration](/guide/vue) - Deep dive into Vue usage
- [React Integration](/guide/react) - Deep dive into React usage
- [API Reference](/api/core) - Complete API documentation

## Need Help?

- Check the [Examples](/examples/) section for more use cases
- Read the [API documentation](/api/core) for detailed information
- Report issues on [GitHub](https://github.com)
