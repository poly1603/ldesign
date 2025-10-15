# @ldesign/qrcode

A beautiful, powerful, and flexible QR code generator for web applications. Generate stunning QR codes with gradients, custom styles, and logo integration. Supports Vue 3, React, and vanilla JavaScript.

## Features

- 🎨 **7+ Dot Styles** - square, rounded, dots, diamond, star, classy, classy-rounded, extra-rounded, hexagon, liquid, smooth-dots
- 🌈 **Gradient Colors** - Linear and radial gradients with multiple colors
- 👁️ **Custom Eye Styles** - Customize the three finder patterns independently
- 🖼️ **Smart Logo Integration** - Shapes, aspect ratios, backgrounds, and borders
- 🎭 **Visual Effects** - Shadows, strokes, background gradients and images
- 🔄 **Transform Effects** - Perspective transformation (X/Y) and scale effects
- 🎯 **Selective Rendering** - Render only specific module types (function/data/guide/marker)
- ✨ **Margin Noise** - Decorative noise in margin area with seeded randomness
- 🎭 **Mask Patterns** - Custom mask pattern selection (0-7 or auto)
- 🔄 **Rotation** - Rotate QR codes (0°, 90°, 180°, 270°)
- ⚛️ **Framework Support** - Vue 3, React, and vanilla JavaScript with full TypeScript support
- 📦 **Multiple Formats** - Canvas/SVG rendering, download as PNG/JPEG/SVG
- ⚡ **Performance Optimized** - Built-in caching, lazy loading support
- 🛡️ **TypeScript First** - Comprehensive type definitions

## Installation

```bash
npm install @ldesign/qrcode
# or
yarn add @ldesign/qrcode
# or
pnpm add @ldesign/qrcode
```

## Quick Start

### Basic Usage

```typescript
import { createQRCode } from '@ldesign/qrcode';

createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 300,
    fgColor: '#2563eb',
    bgColor: '#ffffff',
  },
});
```

### With Gradient

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 300,
    dotStyle: 'rounded',
    gradient: {
      type: 'linear',
      colors: ['#667eea', '#764ba2'],
      direction: 45,
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

## Advanced Features

### 7 Dot Styles

```typescript
// Choose from: square, rounded, dots, diamond, star, classy, classy-rounded
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    dotStyle: 'dots',  // Creates circular modules
    size: 300,
  },
});
```

### Custom Eye Styles

```typescript
// Style each finder pattern independently
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

### Visual Effects

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 300,
    dotStyle: 'rounded',
    fgColor: '#7c3aed',
    // Add shadow
    shadow: {
      blur: 10,
      color: 'rgba(124, 58, 237, 0.3)',
      offsetX: 3,
      offsetY: 3,
    },
    // Add stroke
    stroke: {
      width: 2,
      color: '#ffffff',
    },
  },
});
```

### Smart Logo Integration

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  style: { size: 300 },
  logo: {
    src: '/logo.png',
    width: '25%',
    height: '25%',
    logoShape: 'circle',        // square | circle | rounded | auto
    aspectRatio: 'keep',         // keep | fill | cover | contain
    logoBackground: true,
    logoBackgroundColor: '#ffffff',
    logoBackgroundPadding: 10,
    border: true,
    borderColor: '#e5e7eb',
    borderWidth: 2,
    borderRadius: 8,
  },
});
```

### Combined Effects

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  style: {
    size: 300,
    dotStyle: 'dots',
    gradient: {
      type: 'radial',
      colors: ['#f97316', '#dc2626'],
      position: { x: 0.5, y: 0.5 },
    },
    eyeStyle: {
      outer: {
        style: 'rounded',
        gradient: {
          type: 'linear',
          colors: ['#8b5cf6', '#ec4899'],
          direction: 45,
        },
      },
      inner: { style: 'dots', color: '#ffffff' },
    },
    shadow: {
      blur: 8,
      color: 'rgba(0, 0, 0, 0.2)',
      offsetY: 4,
    },
  },
  logo: {
    src: '/logo.png',
    width: '25%',
    height: '25%',
    logoShape: 'circle',
    logoBackground: true,
  },
});
```

### Transform Effects (NEW ✨)

Apply perspective transformation and scaling:

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 300,
    dotStyle: 'classy-rounded',
    gradient: {
      type: 'linear',
      colors: ['#667eea', '#764ba2'],
      direction: 45,
    },
    transform: {
      perspectiveX: -0.05,  // X-axis perspective (-1 to 1)
      perspectiveY: -0.09,  // Y-axis perspective (-1 to 1)
      scale: 0.89,          // Scale factor (0.1 to 2)
    },
  },
});
```

### Selective Rendering (NEW ✨)

Render only specific module types:

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 300,
    fgColor: '#2563eb',
    renderLayer: 'function',  // 'all' | 'function' | 'data' | 'guide' | 'marker'
  },
});

// Different render layers:
// - 'all': Render all modules (default)
// - 'function': Only function modules (finder patterns, timing patterns, alignment patterns)
// - 'data': Only data modules (encoded data and error correction)
// - 'guide': Only timing patterns
// - 'marker': Only finder patterns (position markers)
```

### Margin Noise (NEW ✨)

Add decorative noise in margin area:

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 300,
    dotStyle: 'rounded',
    fgColor: '#f59e0b',
    margin: 6,
    marginNoise: true,     // Enable margin noise
    seed: 12345,           // Random seed for reproducible noise
  },
});
```

### Mask Pattern Selection (NEW ✨)

Choose specific mask patterns:

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  maskPattern: 4,  // -1 (auto) or 0-7
  style: {
    size: 300,
    dotStyle: 'dots',
  },
});
```

### Rotation & Invert

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 300,
    rotate: 90,      // 0, 90, 180, or 270
    invert: true,    // Swap foreground and background colors
  },
});
```

## Download & Export

### Download as Image

```typescript
const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
});

// Download as PNG
qrCode.download({ fileName: 'qrcode', format: 'png' });

// Download as JPEG
qrCode.download({ fileName: 'qrcode', format: 'jpeg', quality: 0.95 });

// Download as SVG (for SVG render type)
qrCode.download({ fileName: 'qrcode', format: 'svg' });
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
  onProgress: (current, total) => {
    console.log(`Progress: ${current}/${total}`);
  },
});
```

### Get Data URL

```typescript
const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
});

const dataUrl = qrCode.toDataURL('png');
// Use in img tag, clipboard, etc.
```

## Instance Methods

```typescript
const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
});

// Update content or style
await qrCode.update({
  content: 'New content',
  style: { fgColor: '#10b981' },
});

// Download
qrCode.download({ fileName: 'qrcode', format: 'png' });

// Get Data URL
const dataUrl = qrCode.toDataURL('png');

// Get current config
const config = qrCode.getConfig();

// Destroy instance
qrCode.destroy();
```

## Content Types & Templates

### Using Content Templates (NEW ✨)

```typescript
import { QRContentHelper } from '@ldesign/qrcode/templates';

// WiFi Network
const wifiContent = QRContentHelper.wifi({
  ssid: 'MyNetwork',
  password: 'MyPassword123',
  encryption: 'WPA',
  hidden: false,
});

// vCard Contact
const vcardContent = QRContentHelper.vCard({
  name: 'John Doe',
  organization: 'Example Company',
  phones: [{ type: 'mobile', number: '+1234567890' }],
  emails: [{ type: 'work', address: 'john@example.com' }],
  url: 'https://example.com',
});

// Calendar Event
const eventContent = QRContentHelper.event({
  title: 'Team Meeting',
  start: new Date('2024-12-25T10:00:00'),
  end: new Date('2024-12-25T11:00:00'),
  location: 'Conference Room A',
  description: 'Quarterly review meeting',
});

// Payment (UPI, Bitcoin, etc.)
const paymentContent = QRContentHelper.payment({
  type: 'upi',
  address: 'user@bank',
  amount: 100,
  currency: 'USD',
  note: 'Payment for services',
});

// Social Media
const socialContent = QRContentHelper.socialMedia('twitter', 'username');

// WhatsApp
const whatsappContent = QRContentHelper.whatsapp('+1234567890', 'Hello!');

// Generate QR code with template
createQRCode({
  content: wifiContent,
  container: el,
});
```

### Manual Content (Traditional Way)

```typescript
// URL
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
});

// Email, Phone, SMS
createQRCode({ content: 'mailto:contact@example.com', container: el });
createQRCode({ content: 'tel:+1234567890', container: el });
createQRCode({ content: 'sms:+1234567890?body=Hello', container: el });
```

## Presets (NEW ✨)

Use beautiful pre-configured styles:

```typescript
import { QRCodePresets } from '@ldesign/qrcode/presets';

// Use a preset
createQRCode({
  content: 'https://example.com',
  container: el,
  style: QRCodePresets.modern.style,
});

// Available presets:
// modern, minimal, neon, ocean, sunset, forest, monochrome,
// cyberpunk, pastel, gold, cherry, arctic, corporate, retro, galaxy
```

## QR Code Scanner (NEW ✨)

Scan QR codes from camera or images:

```typescript
import { QRCodeScanner } from '@ldesign/qrcode/scanner';

// Scan from camera
const scanner = new QRCodeScanner({
  onSuccess: (result) => {
    console.log('Scanned:', result.data);
  },
  onError: (error) => {
    console.error('Scan error:', error);
  },
  continuous: true,
});

await scanner.start();

// Scan from image file
const result = await scanner.scanImage(imageFile);
console.log('Scanned:', result.data);

// Stop scanning
scanner.stop();
```

### React Scanner Hook

```typescript
import { useQRCodeScanner } from '@ldesign/qrcode/scanner/react';

function ScannerComponent() {
  const { videoRef, result, error, startScan, stopScan, isScanning } = useQRCodeScanner({
    onScan: (result) => console.log(result.data),
  });

  return (
    <div>
      <video ref={videoRef} />
      <button onClick={startScan}>Start</button>
      <button onClick={stopScan}>Stop</button>
      {result && <p>Result: {result.data}</p>}
    </div>
  );
}
```

### Vue Scanner Composable

```vue
<template>
  <div>
    <video ref="videoRef" />
    <button @click="startScan">Start</button>
    <button @click="stopScan">Stop</button>
    <p v-if="result">Result: {{ result.data }}</p>
  </div>
</template>

<script setup lang="ts">
import { useQRCodeScanner } from '@ldesign/qrcode/scanner/vue';

const { videoRef, result, error, startScan, stopScan } = useQRCodeScanner({
  onScan: (result) => console.log(result.data),
});
</script>
```

## Validation & Optimization (NEW ✨)

```typescript
import { QRCodeValidator, QRCodeOptimizer } from '@ldesign/qrcode';

// Validate configuration
const validation = QRCodeValidator.validateConfig({
  content: 'https://example.com',
  style: { size: 300, fgColor: '#000', bgColor: '#fff' },
  logo: { src: '/logo.png' },
});

console.log(validation.warnings); // ['Consider using error correction level H with logo']
console.log(validation.recommendations);

// Optimize content
const optimized = QRCodeOptimizer.compressContent('https://www.example.com?utm_source=test');
console.log(optimized.optimizedContent); // Removes tracking params and unnecessary parts
console.log(`Saved ${optimized.compressionRatio * 100}%`);

// Get optimal size
const size = QRCodeOptimizer.calculateOptimalSize(contentLength);
```

## Error Correction Levels

```typescript
createQRCode({
  content: 'https://example.com',
  errorCorrectionLevel: 'H', // 'L' | 'M' | 'Q' | 'H'
  container: document.getElementById('qr')!,
});
```

| Level | Recovery Capacity | Use Case |
|-------|-------------------|----------|
| `L`   | ~7%              | Clean environment |
| `M`   | ~15%             | General use (default) |
| `Q`   | ~25%             | With small logo |
| `H`   | ~30%             | With large logo |

## TypeScript Support

Full TypeScript definitions included:

```typescript
import type {
  QRCodeConfig,
  QRCodeInstance,
  StyleConfig,
  LogoConfig,
  DotStyle,
  ErrorCorrectionLevel,
} from '@ldesign/qrcode';

const config: QRCodeConfig = {
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
  },
};
```

## Performance

### Caching

```typescript
import { enableCache, clearCache, getCacheStats } from '@ldesign/qrcode';

// Enable caching (default: true)
enableCache(true);

// Clear cache
clearCache();

// Get cache statistics
const stats = getCacheStats();
console.log(`Hit rate: ${stats.hitRate}%`);
```

### Lazy Loading

```typescript
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const container = entry.target as HTMLElement;
      createQRCode({
        content: container.dataset.qrContent!,
        container,
      });
      observer.unobserve(container);
    }
  });
});

document.querySelectorAll('.qr-lazy').forEach(el => observer.observe(el));
```

## Examples

Run the interactive demo:

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run examples
cd examples/vite-demo
npm install
npm run dev
```

Open http://localhost:3333 to see all features in action.

## Documentation

📚 **[Full Documentation](https://your-docs-url.com)**

- [Getting Started](https://your-docs-url.com/guide/basic-usage)
- [Styling Guide](https://your-docs-url.com/guide/styling)
- [Logo Integration](https://your-docs-url.com/guide/logo)
- [Advanced Features](https://your-docs-url.com/guide/advanced-features)
- [Vue Integration](https://your-docs-url.com/guide/vue)
- [React Integration](https://your-docs-url.com/guide/react)
- [API Reference](https://your-docs-url.com/api/types)

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

## What's New in v2.0

### Generation Features
- 🎨 10+ different dot styles (square, rounded, dots, diamond, star, classy, classy-rounded, extra-rounded, hexagon, liquid, smooth-dots)
- 🌈 Linear and radial gradients with custom colors
- 👁️ Custom eye (finder pattern) styles with gradients
- 🖼️ Advanced logo features (shapes, aspect ratios, backgrounds, borders)
- 🎭 Visual effects (shadows, strokes, background gradients and images)
- 🔄 Transform effects - Perspective transformation (X/Y) and scaling
- 🎯 Selective rendering - Render only specific module types
- ✨ Margin noise - Decorative patterns in margin area with seeded randomness
- 🎭 Mask pattern selection - Custom mask patterns (0-7 or auto)
- 🔄 Rotation support - Rotate QR codes (0°, 90°, 180°, 270°)

### New Features
- 📷 **QR Code Scanner** - Scan QR codes from camera or images using native BarcodeDetector API
- 📝 **Content Templates** - Easy helpers for WiFi, vCard, Calendar events, payments, and more
- 🎨 **15+ Presets** - Beautiful pre-configured styles (Modern, Neon, Ocean, Cyberpunk, etc.)
- 🎬 **Animation System** - Built-in animations (fade, scale, rotate, scan, reveal, pulse, bounce)
- ⚡ **Performance Optimizations** - LRU cache manager and Web Worker batch generation
- ✅ **Validation Tools** - QR code configuration validation and optimization recommendations
- 🧪 **Unit Tests** - Comprehensive test coverage with Vitest
- 📦 Batch download with ZIP support
- 📚 Comprehensive documentation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License © 2024-present

## Credits

Built with:
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) - QR code generation algorithm
- TypeScript - Type-safe development
- Rollup - Module bundler
- Vite - Development server
- VitePress - Documentation

---

<div align="center">
  <sub>Made with ❤️ by the @ldesign team</sub>
</div>
