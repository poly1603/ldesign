# Advanced Image Cropper

A comprehensive, feature-rich image cropping and editing solution with modern UI, advanced export options, cloud integration, and beautiful animations.

## 🚀 Features

### ✨ Core Features
- **AI-Powered Smart Cropping** - Intelligent crop suggestions using machine learning
- **Real-time Filters & Effects** - Instagram-style filter system with live preview
- **Multi-layer Support** - Text overlays, stickers, borders, and decorative elements
- **Complete Undo/Redo System** - Full history management with 20-step memory
- **Batch Processing** - Process multiple images simultaneously
- **Cloud Storage Integration** - Direct save to Google Drive, Dropbox, and social sharing

### 🎨 Advanced Export Options
- **Multiple Formats** - JPEG, PNG, WebP, AVIF, GIF, BMP, TIFF, PDF
- **Smart Compression** - Intelligent optimization with quality presets
- **Watermark Support** - Text and image watermarks with positioning options
- **Social Media Presets** - One-click export for Instagram, Facebook, Twitter
- **Print Optimization** - High-quality presets for 4x6, 8x10 prints
- **Custom Dimensions** - Flexible sizing with aspect ratio preservation

### 🎬 Smooth Animations
- **60fps Animations** - Hardware-accelerated transitions using Web Animations API
- **Spring Physics** - Natural motion with tension and friction controls  
- **Micro-interactions** - Hover effects, button feedback, loading states
- **Page Transitions** - Smooth navigation between different views
- **Staggered Animations** - Sequential element animations for polished feel
- **Custom Easing** - Cubic bezier and spring-based timing functions

### 🎨 Complete Theme System
- **Dark/Light Mode** - Automatic system preference detection
- **8 Color Schemes** - Blue, Green, Purple, Red, Orange, Teal, Pink, Indigo
- **Custom Themes** - Full customization of colors, typography, spacing
- **CSS Variables** - Dynamic theme switching without page reload
- **Local Storage** - Theme preferences saved across sessions
- **Theme API** - Programmatic theme control and event subscriptions

### ☁️ Cloud Integration
- **Google Drive** - Direct upload and folder organization
- **Dropbox** - Seamless file sync and sharing
- **Social Media** - Facebook, Twitter, Instagram direct posting
- **OAuth Authentication** - Secure login and permission handling
- **Upload Progress** - Real-time progress tracking with cancel support
- **Error Handling** - Graceful failure recovery and retry logic

## 📦 Installation

```bash
npm install @ldesign/advanced-cropper
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { createAdvancedImageCropper } from '@ldesign/advanced-cropper';

// Initialize the cropper
const container = document.getElementById('cropper-container');
const cropper = createAdvancedImageCropper(container);

// Load an image
const file = event.target.files[0];
await cropper.loadImage(file);
```

### With Custom Theme

```typescript
import { 
  createAdvancedImageCropper,
  ThemeManager,
  ThemeMode,
  ColorScheme 
} from '@ldesign/advanced-cropper';

const cropper = createAdvancedImageCropper(container);

// Apply custom theme
const themeManager = new ThemeManager();
themeManager.setTheme(ThemeMode.DARK, ColorScheme.PURPLE);
```

### Export with Advanced Options

```typescript
import { 
  AdvancedExportManager,
  ExportFormat,
  CompressionLevel,
  WatermarkPosition 
} from '@ldesign/advanced-cropper/export';

const exportManager = new AdvancedExportManager();

const result = await exportManager.exportImage(imageElement, {
  format: ExportFormat.WEBP,
  dimensions: { maxWidth: 1920, maxHeight: 1080 },
  compression: { level: CompressionLevel.MEDIUM, quality: 0.85 },
  watermark: {
    type: 'text',
    content: 'My Watermark',
    position: WatermarkPosition.BOTTOM_RIGHT,
    opacity: 0.8,
    scale: 0.1
  }
});

// Download the result
const url = URL.createObjectURL(result.blob);
const link = document.createElement('a');
link.href = url;
link.download = result.filename;
link.click();
```

### Batch Processing

```typescript
const files = Array.from(fileInput.files);
const imageSources = await Promise.all(
  files.map(file => loadImageFromFile(file))
);

const results = await exportManager.exportBatch(
  imageSources,
  {
    format: ExportFormat.JPEG,
    dimensions: { maxWidth: 1200, maxHeight: 800 },
    compression: { level: CompressionLevel.HIGH },
    namePattern: 'processed_{index}_{timestamp}'
  },
  (progress) => {
    console.log(`${progress.current}/${progress.total} processed`);
  }
);
```

### Cloud Upload

```typescript
import { 
  CloudManager,
  CloudService,
  SocialMediaService 
} from '@ldesign/advanced-cropper/cloud';

const cloudManager = new CloudManager();

// Register services
cloudManager.registerCloudService(CloudService.GOOGLE_DRIVE, {
  clientId: 'your-google-client-id'
});

cloudManager.registerSocialService(SocialMediaService.FACEBOOK, {
  appId: 'your-facebook-app-id'
});

// Upload to cloud
await cloudManager.uploadToCloud(
  CloudService.GOOGLE_DRIVE, 
  imageBlob, 
  'my-image.jpg',
  { folder: 'My Photos' }
);

// Share on social media
await cloudManager.shareOnSocial(
  SocialMediaService.FACEBOOK,
  imageBlob,
  { caption: 'Check out my edited photo!' }
);
```

### Custom Animations

```typescript
import { 
  AnimationManager,
  AnimationPresets,
  AnimationUtilities 
} from '@ldesign/advanced-cropper/animations';

const animationManager = new AnimationManager();

// Simple animation
animationManager.animate(element, AnimationPresets.fadeIn);

// Custom animation with callback
animationManager.animate(element, {
  type: AnimationType.SCALE,
  duration: 500,
  easing: EasingFunctions.spring,
  fillMode: 'both'
}, () => {
  console.log('Animation complete!');
});

// Staggered animation
AnimationUtilities.staggerAnimation(
  elements,
  AnimationPresets.slideInFromLeft,
  100, // 100ms delay between each
  animationManager
);
```

## 🎨 Theming

### Built-in Themes

The cropper comes with several built-in themes:

- **Light Mode** - Clean, bright interface
- **Dark Mode** - Modern dark interface  
- **System** - Follows OS preference
- **Custom** - Fully customizable

### Color Schemes

Choose from 8 beautiful color schemes:
- Blue (default)
- Green
- Purple  
- Red
- Orange
- Teal
- Pink
- Indigo

### CSS Variables

All themes use CSS custom properties for easy customization:

```css
:root {
  --color-background-primary: #ffffff;
  --color-text-primary: #0f172a;
  --color-brand-primary: #3b82f6;
  --spacing-4: 1rem;
  --border-radius-lg: 0.5rem;
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

## 📱 Responsive Design

The cropper is fully responsive and works on:
- **Desktop** - Full-featured interface with all tools
- **Tablet** - Optimized layout with touch controls
- **Mobile** - Streamlined UI for small screens

## ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` - Redo  
- `Ctrl/Cmd + S` - Quick save
- `Ctrl/Cmd + E` - Export options
- `Ctrl/Cmd + T` - Toggle theme

## 🎯 Export Presets

### Social Media
- Instagram Square (1080×1080)
- Instagram Story (1080×1920)
- Facebook Post (1200×630)
- Twitter Post (1200×675)

### Print
- 4×6 Print (1800×1200)
- 8×10 Print (3000×2400)

### Web
- Large (1920×1080 max)
- Medium (1200×800 max)
- Thumbnail (400×300 max)

## 📚 API Reference

### Core Classes

#### `AdvancedImageCropper`
Main cropper class with all features integrated.

**Methods:**
- `loadImage(file: File): Promise<void>` - Load an image file
- `exportImage(options: ExportOptions): Promise<ExportResult>` - Export current image
- `undo(): void` - Undo last action
- `redo(): void` - Redo last undone action
- `dispose(): void` - Clean up resources

#### `AdvancedExportManager`
Handles advanced export functionality.

**Methods:**
- `exportImage(source, options): Promise<ExportResult>` - Export single image
- `exportBatch(sources, options, onProgress?): Promise<ExportResult[]>` - Batch export
- `getSupportedFormats(): ExportFormat[]` - Get supported formats
- `dispose(): void` - Clean up resources

#### `AnimationManager`
Manages animations and transitions.

**Methods:**
- `animate(element, config, onComplete?): string` - Create animation
- `transition(element, config, styles): void` - Apply transition
- `spring(element, from, to, config, property): string` - Spring animation
- `cancelAnimation(id): void` - Cancel specific animation
- `cancelAllAnimations(): void` - Cancel all animations

#### `ThemeManager`
Handles theme switching and customization.

**Methods:**
- `setTheme(mode, colorScheme): void` - Set theme
- `toggleTheme(): void` - Toggle dark/light mode
- `setCustomTheme(config): void` - Apply custom theme
- `subscribe(observer): () => void` - Subscribe to theme changes
- `getCurrentTheme(): ThemeConfig` - Get current theme

#### `CloudManager`
Manages cloud storage and social media integration.

**Methods:**
- `registerCloudService(service, config): void` - Register cloud service
- `uploadToCloud(service, blob, filename, options?): Promise<string>` - Upload file
- `shareOnSocial(service, blob, options?): Promise<void>` - Share on social media
- `on(event, handler): void` - Listen to events
- `dispose(): void` - Clean up resources

## 🛠️ Development

### Building from Source

```bash
git clone https://github.com/ldesign/advanced-cropper.git
cd advanced-cropper
npm install
npm run build
```

### Running Tests

```bash
npm test
npm run test:coverage
```

### Development Server

```bash
npm run dev
```

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 🗺️ Roadmap

### v2.0 (Coming Soon)
- [ ] WebGL acceleration for filters
- [ ] Advanced AI features (background removal, object detection)
- [ ] Video cropping support
- [ ] Mobile app integration
- [ ] Plugin system for custom tools

### v2.1
- [ ] Collaborative editing
- [ ] Real-time sync across devices  
- [ ] Advanced shape tools
- [ ] Vector graphics support

## 📄 License

MIT License © 2024 LDesign Team

---

Built with ❤️ by the LDesign team
