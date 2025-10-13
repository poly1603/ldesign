# 📚 Universal PDF Viewer

[![npm version](https://img.shields.io/npm/v/universal-pdf-viewer.svg)](https://www.npmjs.com/package/universal-pdf-viewer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A beautiful, feature-rich, and framework-agnostic PDF viewer plugin for web applications. Works seamlessly with React, Vue, Angular, or vanilla JavaScript.

![PDF Viewer Demo](https://via.placeholder.com/800x400.png?text=Universal+PDF+Viewer+Demo)

## ✨ Features

- 📖 **Page Navigation** - Easy navigation with keyboard shortcuts
- 🔍 **Zoom & Search** - Powerful zoom controls and text search
- 🎨 **Theme Support** - Beautiful light and dark themes
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- ⚡ **Fast** - Optimized performance with PDF.js
- 🔧 **Customizable** - Highly customizable UI components
- 🌍 **Framework Agnostic** - Works with any framework
- 📝 **Text Selection** - Select and copy text from PDFs
- 🖨️ **Print & Download** - Built-in print and download support
- 🔄 **Rotation** - Rotate pages in any direction
- 📐 **Fit Options** - Fit to width, height, or page
- ⌨️ **Keyboard Shortcuts** - Full keyboard navigation support

## 📦 Installation

```bash
npm install universal-pdf-viewer
```

or

```bash
yarn add universal-pdf-viewer
```

## 🚀 Quick Start

### Vanilla JavaScript

```javascript
import UniversalPDFViewer from 'universal-pdf-viewer';
import 'universal-pdf-viewer/dist/styles.css';

const viewer = new UniversalPDFViewer({
  container: '#pdf-viewer',
  pdfUrl: 'path/to/document.pdf',
  theme: 'light'
});
```

### React

```jsx
import React from 'react';
import { PDFViewer } from 'universal-pdf-viewer/react';
import 'universal-pdf-viewer/dist/styles.css';

function App() {
  return (
    <PDFViewer
      pdfUrl="path/to/document.pdf"
      enableToolbar={true}
      theme="light"
      onPageChange={(page, total) => console.log(`Page ${page} of ${total}`)}
      style={{ height: '600px' }}
    />
  );
}
```

### Vue 3

```vue
<template>
  <PDFViewer
    :pdf-url="pdfUrl"
    :enable-toolbar="true"
    theme="light"
    @page-change="onPageChange"
    height="600px"
  />
</template>

<script>
import { PDFViewer } from 'universal-pdf-viewer/vue';
import 'universal-pdf-viewer/dist/styles.css';

export default {
  components: { PDFViewer },
  data() {
    return {
      pdfUrl: 'path/to/document.pdf'
    };
  },
  methods: {
    onPageChange({ currentPage, totalPages }) {
      console.log(`Page ${currentPage} of ${totalPages}`);
    }
  }
};
</script>
```

### Angular

```typescript
// app.module.ts
import { PDFViewerModule } from 'universal-pdf-viewer/angular';

@NgModule({
  imports: [PDFViewerModule]
})
export class AppModule { }

// app.component.ts
@Component({
  template: `
    <pdf-viewer
      [pdfUrl]="pdfUrl"
      [enableToolbar]="true"
      theme="light"
      (pageChange)="onPageChange($event)"
    ></pdf-viewer>
  `
})
export class AppComponent {
  pdfUrl = 'path/to/document.pdf';
  
  onPageChange(event: any) {
    console.log(`Page ${event.currentPage} of ${event.totalPages}`);
  }
}
```

## 🎛️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | string \| HTMLElement | required | Container element or selector |
| `pdfUrl` | string | - | URL or path to the PDF file |
| `defaultScale` | number | 1.0 | Initial zoom scale |
| `minScale` | number | 0.25 | Minimum zoom scale |
| `maxScale` | number | 5.0 | Maximum zoom scale |
| `viewMode` | 'single' \| 'continuous' \| 'double' | 'single' | Page view mode |
| `enableToolbar` | boolean | true | Show/hide toolbar |
| `enableNavigation` | boolean | true | Enable page navigation |
| `enableZoom` | boolean | true | Enable zoom functionality |
| `enableSearch` | boolean | true | Enable text search |
| `enablePrint` | boolean | true | Enable print functionality |
| `enableDownload` | boolean | true | Enable download functionality |
| `enableFullscreen` | boolean | true | Enable fullscreen mode |
| `enableRotation` | boolean | true | Enable page rotation |
| `enableAnnotations` | boolean | true | Enable annotations |
| `theme` | 'light' \| 'dark' | 'light' | Color theme |

## 📋 API Methods

### Navigation

```javascript
viewer.nextPage();           // Go to next page
viewer.previousPage();       // Go to previous page
viewer.goToPage(5);         // Jump to specific page
```

### Zoom

```javascript
viewer.zoomIn();            // Increase zoom
viewer.zoomOut();           // Decrease zoom
viewer.setScale(1.5);       // Set specific scale
viewer.resetZoom();         // Reset to default scale
viewer.fitToWidth();        // Fit page to width
viewer.fitToHeight();       // Fit page to height
```

### Rotation

```javascript
viewer.rotate(90);          // Rotate by angle
viewer.rotateClockwise();   // Rotate 90° clockwise
viewer.rotateCounterClockwise(); // Rotate 90° counter-clockwise
```

### Search

```javascript
viewer.search('keyword');    // Search for text
viewer.nextSearchResult();   // Go to next result
viewer.previousSearchResult(); // Go to previous result
viewer.clearSearch();        // Clear search highlights
```

### Other

```javascript
viewer.print();             // Print document
viewer.download('file.pdf'); // Download PDF
viewer.setTheme('dark');    // Change theme
viewer.toggleFullscreen();  // Toggle fullscreen
viewer.destroy();           // Cleanup viewer
```

## 🎯 Events

```javascript
viewer.on('initialized', (state) => {
  console.log('Viewer initialized', state);
});

viewer.on('loading', ({ source }) => {
  console.log('Loading PDF from', source);
});

viewer.on('loaded', ({ totalPages, metadata }) => {
  console.log(`PDF loaded with ${totalPages} pages`);
});

viewer.on('pageChanged', ({ currentPage, totalPages }) => {
  console.log(`Page ${currentPage} of ${totalPages}`);
});

viewer.on('scaleChanged', ({ scale }) => {
  console.log(`Scale changed to ${scale}`);
});

viewer.on('searchComplete', ({ query, results, totalResults }) => {
  console.log(`Found ${totalResults} results for "${query}"`);
});

viewer.on('error', (error) => {
  console.error('PDF viewer error:', error);
});
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `←` / `PageUp` | Previous page |
| `→` / `PageDown` | Next page |
| `Home` | First page |
| `End` | Last page |
| `Ctrl/Cmd + +` | Zoom in |
| `Ctrl/Cmd + -` | Zoom out |
| `Ctrl/Cmd + 0` | Reset zoom |
| `Ctrl/Cmd + F` | Search |
| `Ctrl/Cmd + P` | Print |

## 🎨 Custom Styling

You can customize the appearance using CSS variables:

```css
:root {
  --pdf-primary-color: #3498db;
  --pdf-secondary-color: #2c3e50;
  --pdf-bg-color: #ffffff;
  --pdf-text-color: #333333;
  --pdf-border-color: #ddd;
  --pdf-toolbar-height: 50px;
}

[data-theme="dark"] {
  --pdf-bg-color: #1a1a1a;
  --pdf-text-color: #e0e0e0;
  --pdf-border-color: #404040;
}
```

## 🔧 Advanced Usage

### Custom Toolbar Configuration

```javascript
const viewer = new UniversalPDFViewer({
  container: '#pdf-viewer',
  toolbarConfig: {
    position: 'top',
    items: [
      {
        type: 'button',
        icon: '📁',
        tooltip: 'Open File',
        action: 'openFile'
      },
      { type: 'separator' },
      {
        type: 'group',
        items: [
          { type: 'button', action: 'previousPage' },
          { type: 'input', id: 'page-input' },
          { type: 'button', action: 'nextPage' }
        ]
      }
    ]
  }
});
```

### React Hook Usage

```jsx
import { usePDFViewer } from 'universal-pdf-viewer/react';

function App() {
  const { viewer, state, handleReady, actions } = usePDFViewer();

  return (
    <div>
      <PDFViewer onReady={handleReady} />
      <div>
        <button onClick={actions?.nextPage}>Next</button>
        <span>Page {state.currentPage} of {state.totalPages}</span>
      </div>
    </div>
  );
}
```

### Loading Different PDF Sources

```javascript
// Load from URL
viewer.loadPDF('https://example.com/document.pdf');

// Load from ArrayBuffer
fetch('document.pdf')
  .then(res => res.arrayBuffer())
  .then(data => viewer.loadPDF(data));

// Load from Base64
const base64Data = 'JVBERi0xLjcKCjEgMCBvYmo...';
const binaryData = atob(base64Data);
const arrayBuffer = new ArrayBuffer(binaryData.length);
const uint8Array = new Uint8Array(arrayBuffer);
for (let i = 0; i < binaryData.length; i++) {
  uint8Array[i] = binaryData.charCodeAt(i);
}
viewer.loadPDF(uint8Array);
```

## 📱 Mobile Support

The viewer is fully responsive and supports touch gestures:

- **Pinch to zoom** - Use two fingers to zoom in/out
- **Swipe navigation** - Swipe left/right to change pages
- **Double tap** - Double tap to zoom in
- **Touch selection** - Select text with touch and hold

## 🌐 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on top of [PDF.js](https://mozilla.github.io/pdf.js/) by Mozilla
- Icons from [Emoji](https://unicode.org/emoji/charts/full-emoji-list.html)
- Inspired by modern PDF viewer interfaces

## 💬 Support

For issues, questions, or suggestions, please:

- Check the [FAQ](https://github.com/yourusername/universal-pdf-viewer/wiki/FAQ)
- Open an [issue](https://github.com/yourusername/universal-pdf-viewer/issues)
- Start a [discussion](https://github.com/yourusername/universal-pdf-viewer/discussions)

## 🚧 Roadmap

- [ ] Annotation tools (highlight, underline, notes)
- [ ] Form filling support
- [ ] Digital signatures
- [ ] Side-by-side comparison
- [ ] OCR support
- [ ] Multi-language support
- [ ] Bookmark management
- [ ] Page thumbnails sidebar
- [ ] Advanced printing options
- [ ] Collaborative features

---

Made with ❤️ by the Universal PDF Viewer Team