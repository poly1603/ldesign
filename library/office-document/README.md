# @ldesign/office-document

🚀 A high-performance, framework-agnostic plugin for rendering Word, Excel, and PowerPoint files in web browsers.

## ✨ Features

- 📄 **Multi-format Support**: Render Word (.docx, .doc), Excel (.xlsx, .xls), and PowerPoint (.pptx, .ppt) files
- 🎯 **Framework Agnostic**: Works with any JavaScript framework or vanilla JS
- ⚡ **High Performance**: Optimized rendering with virtual scrolling and lazy loading
- 🎨 **Rich Customization**: Extensive configuration options and theming support
- 🔧 **TypeScript Support**: Full TypeScript definitions included
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🛠️ **Developer Friendly**: Simple API with comprehensive documentation

## 📦 Installation

```bash
npm install @ldesign/office-document
```

or

```bash
yarn add @ldesign/office-document
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { OfficeDocument } from '@ldesign/office-document';

// Create a new instance
const doc = new OfficeDocument({
  container: '#viewer', // or HTMLElement
  toolbar: true,
  zoom: true,
  search: true
});

// Load a document from file
const fileInput = document.querySelector('#fileInput');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  await doc.load({ file });
});

// Load a document from URL
await doc.load({
  url: 'https://example.com/document.docx',
  headers: {
    'Authorization': 'Bearer token'
  }
});
```

### Framework-specific Examples

#### React

```tsx
import React, { useRef, useEffect } from 'react';
import { OfficeDocument } from '@ldesign/office-document';

function DocumentViewer({ file }) {
  const containerRef = useRef(null);
  const docRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && file) {
      docRef.current = new OfficeDocument({
        container: containerRef.current,
        toolbar: true,
        onLoad: (info) => {
          console.log('Document loaded:', info);
        }
      });

      docRef.current.load({ file });
    }

    return () => {
      if (docRef.current) {
        docRef.current.destroy();
      }
    };
  }, [file]);

  return <div ref={containerRef} style={{ height: '600px' }} />;
}
```

#### Vue 3

```vue
<template>
  <div ref="viewer" class="document-viewer"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { OfficeDocument } from '@ldesign/office-document';

const props = defineProps(['file']);
const viewer = ref(null);
let docInstance = null;

onMounted(() => {
  docInstance = new OfficeDocument({
    container: viewer.value,
    toolbar: true
  });
});

watch(() => props.file, async (newFile) => {
  if (newFile && docInstance) {
    await docInstance.load({ file: newFile });
  }
});

onUnmounted(() => {
  if (docInstance) {
    docInstance.destroy();
  }
});
</script>

<style>
.document-viewer {
  height: 600px;
}
</style>
```

## 📋 API Reference

### Constructor Options

```typescript
interface RenderOptions {
  container: HTMLElement | string;  // Container element or selector
  width?: string | number;          // Viewer width
  height?: string | number;         // Viewer height
  toolbar?: boolean;                // Show toolbar
  toolbarOptions?: ToolbarOptions;  // Toolbar configuration
  theme?: ThemeOptions;             // Theme configuration
  zoom?: boolean;                   // Enable zoom
  search?: boolean;                 // Enable search
  print?: boolean;                  // Enable print
  download?: boolean;               // Enable download
  virtualScrolling?: boolean;       // Enable virtual scrolling
  lazyLoad?: boolean;              // Enable lazy loading
  useWebWorker?: boolean;          // Use Web Worker for rendering
  onError?: (error: Error) => void;
  onLoad?: (doc: DocumentInfo) => void;
  onPageChange?: (page: number) => void;
  onZoomChange?: (zoom: number) => void;
}
```

### Load Options

```typescript
interface LoadOptions {
  file?: File | Blob;              // File object
  url?: string;                    // URL to load from
  arrayBuffer?: ArrayBuffer;       // Direct ArrayBuffer
  base64?: string;                // Base64 encoded string
  headers?: Record<string, string>; // HTTP headers for URL loading
  credentials?: RequestCredentials; // Fetch credentials
}
```

### Methods

```typescript
class OfficeDocument {
  // Load and render a document
  async load(options: LoadOptions): Promise<RenderResult>;
  
  // Destroy the viewer and cleanup
  destroy(): void;
  
  // Get current render result
  getRenderResult(): RenderResult | null;
}
```

### Static Methods

```typescript
// Render specific document types
OfficeDocument.renderWord(loadOptions, renderOptions): Promise<RenderResult>;
OfficeDocument.renderExcel(loadOptions, renderOptions): Promise<RenderResult>;
OfficeDocument.renderPowerPoint(loadOptions, renderOptions): Promise<RenderResult>;
```

### Render Result

```typescript
interface RenderResult {
  destroy: () => void;
  refresh: () => void;
  goToPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  getCurrentPage: () => number;
  getTotalPages: () => number;
  search?: (query: string) => void;
  clearSearch?: () => void;
  print?: () => void;
  download?: () => void;
  enterFullscreen?: () => void;
  exitFullscreen?: () => void;
}
```

## 🎨 Theming

Customize the appearance with theme options:

```typescript
const doc = new OfficeDocument({
  container: '#viewer',
  theme: {
    primary: '#4CAF50',
    background: '#ffffff',
    text: '#333333',
    border: '#dddddd',
    toolbar: {
      background: '#f5f5f5',
      text: '#333333',
      hover: '#e0e0e0'
    }
  }
});
```

## ⚙️ Advanced Configuration

### Word Documents

```typescript
const doc = new OfficeDocument({
  container: '#viewer',
  // Word-specific options
  preserveStyles: true,
  showComments: true,
  showTrackedChanges: false
});
```

### Excel Spreadsheets

```typescript
const doc = new OfficeDocument({
  container: '#viewer',
  // Excel-specific options
  activeSheet: 0,
  showGridLines: true,
  showHeaders: true,
  editable: true,
  enableFiltering: true,
  enableSorting: true
});
```

### PowerPoint Presentations

```typescript
const doc = new OfficeDocument({
  container: '#viewer',
  // PowerPoint-specific options
  slideshow: true,
  autoPlay: true,
  slideDuration: 5,
  showNotes: true,
  thumbnailNav: true
});
```

## 🔧 Performance Optimization

### Virtual Scrolling

Enable virtual scrolling for large documents:

```typescript
const doc = new OfficeDocument({
  container: '#viewer',
  virtualScrolling: true,
  pageSize: 10 // Number of pages to render at once
});
```

### Web Worker

Use Web Worker for heavy rendering tasks:

```typescript
const doc = new OfficeDocument({
  container: '#viewer',
  useWebWorker: true // Automatically falls back if not supported
});
```

### Lazy Loading

Enable lazy loading for images and resources:

```typescript
const doc = new OfficeDocument({
  container: '#viewer',
  lazyLoad: true,
  cache: true // Cache rendered pages
});
```

## 🧪 Development

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/office-document.git

# Install dependencies
npm install

# Build the library
npm run build

# Run the example
cd example
npm install
npm run dev
```

### Scripts

```bash
npm run dev    # Development mode with watch
npm run build  # Build for production
npm run test   # Run tests
npm run lint   # Lint code
```

## 📄 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 🐛 Bug Reports

Please use the [GitHub Issues](https://github.com/your-org/office-document/issues) to report bugs.

## 🙏 Acknowledgments

- [mammoth.js](https://github.com/mwilliamson/mammoth.js) for Word document conversion
- [SheetJS](https://sheetjs.com/) for Excel file handling
- [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) for PowerPoint support

## 📮 Contact

For questions and support, please contact: support@ldesign.com

---

Made with ❤️ by the LDesign Team