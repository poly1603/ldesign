# Core API

## createQRCode()

Creates a QR code instance.

```typescript
function createQRCode(config: GenerateOptions): QRCodeInstance
```

### Parameters

- `config`: Configuration object with the following properties:
  - `content` (string, required): The content to encode
  - `container` (HTMLElement, optional): Target container element
  - `renderType` ('canvas' | 'svg', optional): Render type, default: 'canvas'
  - `errorCorrectionLevel` ('L' | 'M' | 'Q' | 'H', optional): Error correction level, default: 'M'
  - `style` (QRCodeStyle, optional): Style configuration
  - `logo` (LogoConfig, optional): Logo configuration
  - `typeNumber` (number, optional): QR code version (1-40)

### Returns

Returns a `QRCodeInstance` object with the following methods:

- `update(config: Partial<QRCodeConfig>): Promise<void>` - Update QR code
- `toDataURL(format?: 'png' | 'jpeg', quality?: number): string` - Get data URL (canvas only)
- `download(options?: DownloadOptions): void` - Download as image
- `toSVGString(): string` - Get SVG string (SVG only)
- `destroy(): void` - Destroy instance
- `getElement(): HTMLCanvasElement | SVGSVGElement | null` - Get rendered element

### Example

```typescript
import { createQRCode } from '@ldesign/qrcode';

const qr = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr'),
  style: {
    size: 200,
    fgColor: '#000000',
    bgColor: '#ffffff',
  },
});

// Update content
await qr.update({ content: 'https://new-url.com' });

// Download
qr.download({ fileName: 'my-qrcode', format: 'png' });

// Clean up
qr.destroy();
```

## generateQRCode()

Generates a QR code and appends to a container.

```typescript
function generateQRCode(
  container: HTMLElement,
  config: QRCodeConfig
): QRCodeInstance
```

### Example

```typescript
import { generateQRCode } from '@ldesign/qrcode';

const qr = generateQRCode(
  document.getElementById('qr-container'),
  {
    content: 'https://example.com',
    style: { size: 200 },
  }
);
```

## toDataURL()

Generates a QR code as a data URL.

```typescript
function toDataURL(
  content: string,
  config?: Omit<QRCodeConfig, 'content'>,
  format?: 'png' | 'jpeg',
  quality?: number
): Promise<string>
```

### Example

```typescript
import { toDataURL } from '@ldesign/qrcode';

const dataUrl = await toDataURL('https://example.com', {
  style: { size: 300, fgColor: '#0066cc' },
}, 'png');

console.log(dataUrl); // data:image/png;base64,...
```

## toSVGString()

Generates a QR code as an SVG string.

```typescript
function toSVGString(
  content: string,
  config?: Omit<QRCodeConfig, 'content'>
): string
```

### Example

```typescript
import { toSVGString } from '@ldesign/qrcode';

const svg = toSVGString('https://example.com', {
  style: { size: 300 },
});

console.log(svg); // <svg xmlns="http://www.w3.org/2000/svg"...
```

## Configuration

### QRCodeStyle

Style configuration for QR code appearance.

```typescript
interface QRCodeStyle {
  fgColor?: string;      // Foreground color, default: '#000000'
  bgColor?: string;      // Background color, default: '#ffffff'
  size?: number;         // Size in pixels, default: 200
  margin?: number;       // Margin in modules, default: 4
  cornerRadius?: number; // Corner radius (0-0.5), default: 0
}
```

### LogoConfig

Configuration for logo integration.

```typescript
interface LogoConfig {
  src: string;                              // Logo image URL or base64
  width?: number | string;                  // Width (px or %), default: '20%'
  height?: number | string;                 // Height (px or %), default: '20%'
  border?: boolean;                         // Show border, default: false
  borderColor?: string;                     // Border color, default: '#ffffff'
  borderWidth?: number;                     // Border width in px, default: 2
  borderRadius?: number;                    // Corner radius in px, default: 0
  crossOrigin?: 'anonymous' | 'use-credentials'; // CORS setting
}
```

### ErrorCorrectionLevel

QR code error correction levels:

- `L`: Low (7% of codewords can be restored)
- `M`: Medium (15% of codewords can be restored) - **Default**
- `Q`: Quartile (25% of codewords can be restored)
- `H`: High (30% of codewords can be restored)

Higher levels allow for more data recovery but result in denser QR codes.

### DownloadOptions

Options for downloading QR codes.

```typescript
interface DownloadOptions {
  fileName?: string;      // File name, default: 'qrcode'
  format?: 'png' | 'jpeg' | 'svg'; // Format, default: 'png'
  quality?: number;       // JPEG quality (0-1), default: 1
}
```
