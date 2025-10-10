---
layout: home

hero:
  name: "@ldesign/qrcode"
  text: "Beautiful QR Code Generator"
  tagline: "Generate stunning, fully customizable QR codes with gradients, custom styles, and logo integration. Works with Vue, React, or vanilla JavaScript."
  actions:
    - theme: brand
      text: Get Started
      link: /guide/basic-usage
    - theme: alt
      text: View Examples
      link: /examples/
    - theme: alt
      text: GitHub
      link: https://github.com

features:
  - icon: 🎨
    title: 7 Dot Styles
    details: Choose from square, rounded, dots, diamond, star, classy, and classy-rounded styles for unique QR codes.

  - icon: 🌈
    title: Gradient Colors
    details: Apply linear or radial gradients with multiple colors for eye-catching designs.

  - icon: 👁️
    title: Custom Eye Styles
    details: Customize the three finder patterns (eyes) with independent colors and styles.

  - icon: 🖼️
    title: Smart Logo Integration
    details: Add logos with shape control (square/circle/rounded), aspect ratio handling, and background support.

  - icon: 🎭
    title: Visual Effects
    details: Add shadows, strokes, background gradients, and images for professional results.

  - icon: ⚛️
    title: Framework Support
    details: First-class support for Vue 3, React, and vanilla JavaScript with components and hooks.

  - icon: 📦
    title: Multiple Formats
    details: Generate as Canvas or SVG, download as PNG/JPEG/SVG, or get Data URLs.

  - icon: 🛡️
    title: TypeScript Support
    details: Fully typed API with comprehensive TypeScript definitions and IntelliSense support.

  - icon: ⚡
    title: Performance Optimized
    details: Built-in caching, lazy loading support, and optimized rendering for smooth performance.
---

## Quick Start

### Installation

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

### Basic Usage

```typescript
import { createQRCode } from '@ldesign/qrcode';

const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 300,
    fgColor: '#2563eb',
    bgColor: '#ffffff',
  },
});
```

### With Gradient & Effects

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  style: {
    size: 300,
    dotStyle: 'rounded',
    gradient: {
      type: 'linear',
      colors: ['#667eea', '#764ba2'],
      direction: 45,
    },
    shadow: {
      blur: 10,
      color: 'rgba(0, 0, 0, 0.2)',
      offsetY: 4,
    },
  },
});
```

### With Logo

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  style: {
    size: 300,
    dotStyle: 'dots',
  },
  logo: {
    src: '/logo.png',
    width: '25%',
    height: '25%',
    logoShape: 'circle',
    logoBackground: true,
    logoBackgroundPadding: 8,
  },
});
```

## Framework Integration

### Vue 3

```vue
<template>
  <QRCode
    content="https://example.com"
    error-correction-level="H"
    :style-config="{
      size: 300,
      dotStyle: 'rounded',
      gradient: {
        type: 'linear',
        colors: ['#667eea', '#764ba2'],
        direction: 45,
      },
    }"
  />
</template>

<script setup lang="ts">
import { QRCode } from '@ldesign/qrcode/vue';
</script>
```

[Learn more about Vue integration →](/guide/vue)

### React

```tsx
import { QRCode } from '@ldesign/qrcode/react';

function App() {
  return (
    <QRCode
      content="https://example.com"
      errorCorrectionLevel="H"
      styleConfig={{
        size: 300,
        dotStyle: 'rounded',
        gradient: {
          type: 'linear',
          colors: ['#667eea', '#764ba2'],
          direction: 45,
        },
      }}
    />
  );
}
```

[Learn more about React integration →](/guide/react)

## Advanced Features

### Custom Eye Styles

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 300,
    eyeStyle: [
      { outer: { style: 'rounded', color: '#ef4444' }, inner: { style: 'dots', color: '#dc2626' } },
      { outer: { style: 'rounded', color: '#3b82f6' }, inner: { style: 'dots', color: '#2563eb' } },
      { outer: { style: 'rounded', color: '#10b981' }, inner: { style: 'dots', color: '#059669' } },
    ],
  },
});
```

### Radial Gradient

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 300,
    dotStyle: 'dots',
    gradient: {
      type: 'radial',
      colors: ['#f97316', '#dc2626'],
      position: { x: 0.5, y: 0.5 },
    },
  },
});
```

### Batch Download

```typescript
import { batchDownload } from '@ldesign/qrcode';

await batchDownload({
  items: [
    { content: 'https://example.com/1', fileName: 'qr-1' },
    { content: 'https://example.com/2', fileName: 'qr-2' },
    { content: 'https://example.com/3', fileName: 'qr-3' },
  ],
  format: 'png',
  zipFileName: 'qrcodes.zip',
  style: { size: 300 },
});
```

[Explore all features →](/guide/advanced-features)

## Key Features

### 🎨 Rich Styling Options

- **7 Dot Styles**: square, rounded, dots, diamond, star, classy, classy-rounded
- **Gradients**: Linear and radial gradients with multiple colors
- **Custom Colors**: Foreground, background, and eye colors
- **Corner Radius**: Adjustable corner radius for softer edges
- **Visual Effects**: Shadows, strokes, background images

### 🖼️ Smart Logo Integration

- **Multiple Shapes**: square, circle, rounded, or auto
- **Aspect Ratio Control**: keep, fill, cover, or contain
- **Background Support**: Optional background with padding
- **Border Options**: Customizable border color and width
- **Error Handling**: Fallback logo support

### 👁️ Eye Customization

- **Independent Styling**: Style each finder pattern separately
- **Gradient Support**: Apply gradients to eyes
- **Multi-Color Eyes**: Use different colors for each eye
- **Flexible Patterns**: Choose from all dot styles

### ⚡ Performance

- **Built-in Caching**: Automatic caching for repeated content
- **Lazy Loading**: IntersectionObserver support
- **Optimized Rendering**: Fast Canvas/SVG rendering
- **Memory Efficient**: Smart resource management

### 🛠️ Developer Experience

- **TypeScript First**: Full type definitions
- **Framework Adapters**: Vue, React, and vanilla JS
- **Comprehensive Docs**: Detailed guides and examples
- **Error Messages**: Clear, actionable error messages

## Use Cases

- **Marketing Materials**: Eye-catching QR codes for campaigns
- **Business Cards**: Professional QR codes with logo
- **Event Tickets**: Unique codes for check-in systems
- **Product Packaging**: Brand-consistent codes
- **WiFi Sharing**: Beautiful QR codes for network access
- **Payment Systems**: Secure payment QR codes
- **Contact Information**: vCard QR codes

## Why Choose @ldesign/qrcode?

- ✅ **Most Feature-Rich**: 7 dot styles, gradients, custom eyes, and more
- ✅ **Beautiful by Default**: Professional-looking QR codes out of the box
- ✅ **Easy to Use**: Intuitive API with sensible defaults
- ✅ **Production Ready**: Battle-tested in real applications
- ✅ **Well Documented**: Comprehensive guides and examples
- ✅ **Active Development**: Regular updates and improvements
- ✅ **MIT Licensed**: Free for personal and commercial use

## Browser Support

Works in all modern browsers:

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

## What's New

### Version 2.0

- 🎨 7 different dot styles
- 🌈 Linear and radial gradients
- 👁️ Custom eye (finder pattern) styles
- 🖼️ Advanced logo features (shapes, aspect ratios, backgrounds)
- 🎭 Visual effects (shadows, strokes)
- 📦 Batch download with ZIP support
- ⚡ Performance improvements
- 📚 Comprehensive documentation

## Getting Help

- 📖 [Read the Documentation](/guide/basic-usage)
- 💡 [Browse Examples](/examples/)
- 🐛 [Report Issues](https://github.com)
- 💬 [Discussions](https://github.com)

## License

MIT License © 2024-present

---

<div style="text-align: center; margin-top: 40px;">
  <a href="/guide/basic-usage" style="font-size: 1.2em; font-weight: 600;">Get Started →</a>
</div>
