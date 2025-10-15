# @ldesign/qrcode v2.0 - Installation & Setup Guide

## 📦 Installation

```bash
npm install @ldesign/qrcode
# or
yarn add @ldesign/qrcode
# or
pnpm add @ldesign/qrcode
```

## 🚀 Quick Start (5 minutes)

### 1. Basic QR Code Generation

```typescript
import { createQRCode } from '@ldesign/qrcode';

// Generate a simple QR code
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr-container')!,
  style: {
    size: 300,
    fgColor: '#000000',
    bgColor: '#ffffff',
  }
});
```

### 2. Use a Beautiful Preset

```typescript
import { createQRCode } from '@ldesign/qrcode';
import { QRCodePresets } from '@ldesign/qrcode/presets';

createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr-container')!,
  style: QRCodePresets.neon.style, // Use neon preset
});
```

### 3. Generate WiFi QR Code

```typescript
import { createQRCode } from '@ldesign/qrcode';
import { QRContentHelper } from '@ldesign/qrcode/templates';

const wifiContent = QRContentHelper.wifi({
  ssid: 'MyNetwork',
  password: 'MyPassword',
  encryption: 'WPA'
});

createQRCode({
  content: wifiContent,
  container: document.getElementById('qr-container')!,
});
```

### 4. Scan QR Codes

```typescript
import { QRCodeScanner } from '@ldesign/qrcode/scanner';

const scanner = new QRCodeScanner({
  onSuccess: (result) => {
    console.log('Scanned:', result.data);
  },
  continuous: true,
});

// Start scanning
await scanner.start();
```

## 🎯 Framework-Specific Setup

### React

```bash
npm install @ldesign/qrcode react
```

```tsx
import { QRCode } from '@ldesign/qrcode/react';
import { useQRCodeScanner } from '@ldesign/qrcode/scanner/react';

// Generate QR code
function App() {
  return (
    <QRCode
      content="https://example.com"
      styleConfig={{ size: 300 }}
    />
  );
}

// Scan QR code
function Scanner() {
  const { videoRef, result, startScan } = useQRCodeScanner();

  return (
    <div>
      <video ref={videoRef} />
      <button onClick={startScan}>Start Scanning</button>
      {result && <p>{result.data}</p>}
    </div>
  );
}
```

### Vue 3

```bash
npm install @ldesign/qrcode vue
```

```vue
<template>
  <!-- Generate QR code -->
  <QRCode
    content="https://example.com"
    :style-config="{ size: 300 }"
  />

  <!-- Scan QR code -->
  <div>
    <video ref="videoRef" />
    <button @click="startScan">Start Scanning</button>
    <p v-if="result">{{ result.data }}</p>
  </div>
</template>

<script setup lang="ts">
import { QRCode } from '@ldesign/qrcode/vue';
import { useQRCodeScanner } from '@ldesign/qrcode/scanner/vue';

const { videoRef, result, startScan } = useQRCodeScanner();
</script>
```

## 📝 TypeScript Configuration

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["@ldesign/qrcode"]
  }
}
```

## 🛠️ Development Setup

If you want to contribute or modify the library:

### 1. Clone and Install

```bash
git clone https://github.com/ldesign/qrcode.git
cd qrcode
npm install
```

### 2. Build the Library

```bash
npm run build
```

### 3. Run Tests

```bash
npm test
# or with UI
npm run test:ui
# or with coverage
npm run test:coverage
```

### 4. Run Examples

```bash
npm run example
```

### 5. Start Documentation

```bash
npm run docs:dev
```

## 📚 Package Exports

The library provides multiple entry points:

```typescript
// Core library
import { createQRCode } from '@ldesign/qrcode';

// Vue adapter
import { QRCode } from '@ldesign/qrcode/vue';

// React adapter
import { QRCode } from '@ldesign/qrcode/react';

// Scanner
import { QRCodeScanner } from '@ldesign/qrcode/scanner';
import { useQRCodeScanner } from '@ldesign/qrcode/scanner/react';
import { useQRCodeScanner } from '@ldesign/qrcode/scanner/vue';

// Presets
import { QRCodePresets } from '@ldesign/qrcode/presets';

// Templates
import { QRContentHelper } from '@ldesign/qrcode/templates';
```

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Modern mobile browsers

**Note:** QR code scanning requires the BarcodeDetector API (available in Chromium-based browsers) or a polyfill.

## ⚠️ Common Issues

### Issue: Module not found

```bash
# Make sure you installed the package
npm install @ldesign/qrcode

# Clear cache if needed
rm -rf node_modules package-lock.json
npm install
```

### Issue: Scanner not working

The scanner requires HTTPS or localhost for camera access:

```bash
# Use HTTPS in production
# Use localhost in development
```

### Issue: TypeScript errors

```bash
# Make sure TypeScript is installed
npm install -D typescript
```

## 🔧 Configuration Options

### QR Code Generation

```typescript
interface QRCodeConfig {
  content: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  renderType?: 'canvas' | 'svg';
  style?: QRCodeStyle;
  logo?: LogoConfig;
  typeNumber?: number;
  maskPattern?: -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
}
```

### Scanner Configuration

```typescript
interface QRCodeScannerOptions {
  videoElement?: HTMLVideoElement;
  onSuccess?: (result: QRCodeScanResult) => void;
  onError?: (error: Error) => void;
  continuous?: boolean;
  scanInterval?: number;
  videoConstraints?: MediaTrackConstraints;
}
```

## 📖 Next Steps

1. Check out the [full documentation](./README.md)
2. Explore the [examples](./examples)
3. Browse the [API reference](./docs)
4. View [available presets](./FEATURES.md#presets)
5. Learn about [content templates](./FEATURES.md#content-templates)

## 💬 Need Help?

- 📚 [Documentation](./README.md)
- 🐛 [Report Issues](https://github.com/ldesign/qrcode/issues)
- 💡 [Feature Requests](https://github.com/ldesign/qrcode/issues)
- 📧 Contact: support@ldesign.com

## 📄 License

MIT License © 2024-present @ldesign

---

**Happy coding! 🎉**
