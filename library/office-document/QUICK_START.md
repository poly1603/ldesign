# Quick Start Guide

Get up and running with @ldesign/office-document in 5 minutes!

## Installation

```bash
npm install @ldesign/office-document
# or
yarn add @ldesign/office-document
```

## Basic Setup

### 1. HTML Structure

Create a container element for your document viewer:

```html
<div id="viewer" style="width: 100%; height: 600px;"></div>
```

### 2. Import and Initialize

```javascript
import { OfficeDocument } from '@ldesign/office-document';

// Create viewer instance
const viewer = new OfficeDocument({
  container: '#viewer',  // or document.getElementById('viewer')
  toolbar: true,
  zoom: true,
  search: true
});
```

### 3. Load a Document

#### From File Upload

```javascript
const fileInput = document.querySelector('#fileInput');

fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  
  try {
    await viewer.load({ file });
    console.log('Document loaded successfully!');
  } catch (error) {
    console.error('Failed to load document:', error);
  }
});
```

#### From URL

```javascript
try {
  await viewer.load({
    url: 'https://example.com/document.docx'
  });
} catch (error) {
  console.error('Failed to load document:', error);
}
```

#### From Base64

```javascript
const base64Data = 'data:application/vnd.openxmlformats-officedocument...';

await viewer.load({
  base64: base64Data
});
```

## Complete Example

### HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Office Document Viewer</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
    }
    .controls {
      margin-bottom: 20px;
    }
    #viewer {
      width: 100%;
      height: 600px;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div class="controls">
    <input type="file" id="fileInput" accept=".docx,.xlsx,.pptx">
    <button id="loadBtn" disabled>Load Document</button>
  </div>
  
  <div id="viewer"></div>
  
  <script type="module" src="/main.js"></script>
</body>
</html>
```

### JavaScript (main.js)

```javascript
import { OfficeDocument } from '@ldesign/office-document';

// DOM elements
const fileInput = document.getElementById('fileInput');
const loadBtn = document.getElementById('loadBtn');
const viewerContainer = document.getElementById('viewer');

// Create viewer instance
const viewer = new OfficeDocument({
  container: viewerContainer,
  toolbar: true,
  zoom: true,
  search: true,
  theme: {
    primary: '#4CAF50',
    background: '#ffffff',
    text: '#333333'
  },
  onLoad: (docInfo) => {
    console.log('Document loaded:', docInfo);
    alert(`Loaded ${docInfo.name} (${docInfo.type})`);
  },
  onError: (error) => {
    console.error('Error:', error);
    alert(`Error loading document: ${error.message}`);
  }
});

// Enable load button when file is selected
fileInput.addEventListener('change', () => {
  loadBtn.disabled = !fileInput.files[0];
});

// Load document on button click
loadBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) return;
  
  loadBtn.textContent = 'Loading...';
  loadBtn.disabled = true;
  
  try {
    await viewer.load({ file });
  } catch (error) {
    console.error('Failed to load document:', error);
  } finally {
    loadBtn.textContent = 'Load Document';
    loadBtn.disabled = false;
  }
});
```

## Framework Examples

### React

```jsx
import { useEffect, useRef, useState } from 'react';
import { OfficeDocument } from '@ldesign/office-document';

function DocumentViewer() {
  const viewerRef = useRef(null);
  const docRef = useRef(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    // Initialize viewer
    docRef.current = new OfficeDocument({
      container: viewerRef.current,
      toolbar: true,
      onLoad: (info) => console.log('Loaded:', info)
    });

    return () => {
      if (docRef.current) {
        docRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (file && docRef.current) {
      docRef.current.load({ file });
    }
  }, [file]);

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])} 
        accept=".docx,.xlsx,.pptx"
      />
      <div ref={viewerRef} style={{ height: '600px' }} />
    </div>
  );
}
```

### Vue 3

```vue
<template>
  <div>
    <input 
      type="file" 
      @change="handleFileChange" 
      accept=".docx,.xlsx,.pptx"
    />
    <div ref="viewerRef" style="height: 600px"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { OfficeDocument } from '@ldesign/office-document';

const viewerRef = ref(null);
let viewer = null;

onMounted(() => {
  viewer = new OfficeDocument({
    container: viewerRef.value,
    toolbar: true,
    onLoad: (info) => console.log('Loaded:', info)
  });
});

onUnmounted(() => {
  if (viewer) {
    viewer.destroy();
  }
});

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (file && viewer) {
    await viewer.load({ file });
  }
};
</script>
```

## Configuration Options

### Common Options

```javascript
const viewer = new OfficeDocument({
  // Required
  container: '#viewer',
  
  // UI Options
  toolbar: true,
  zoom: true,
  search: true,
  print: true,
  download: true,
  
  // Dimensions
  width: '100%',
  height: '600px',
  
  // Theme
  theme: {
    primary: '#4CAF50',
    background: '#ffffff',
    text: '#333333',
    border: '#dddddd'
  },
  
  // Performance
  virtualScrolling: true,
  lazyLoad: true,
  cache: true,
  
  // Callbacks
  onLoad: (docInfo) => console.log('Loaded:', docInfo),
  onError: (error) => console.error('Error:', error),
  onPageChange: (page) => console.log('Page:', page),
  onZoomChange: (zoom) => console.log('Zoom:', zoom)
});
```

### Document Type Specific

#### Word Documents

```javascript
const viewer = new OfficeDocument({
  container: '#viewer',
  preserveStyles: true,
  showComments: true,
  showTrackedChanges: false
});
```

#### Excel Spreadsheets

```javascript
const viewer = new OfficeDocument({
  container: '#viewer',
  activeSheet: 0,
  showGridLines: true,
  editable: false,
  enableFiltering: true,
  enableSorting: true
});
```

#### PowerPoint Presentations

```javascript
const viewer = new OfficeDocument({
  container: '#viewer',
  slideshow: false,
  autoPlay: false,
  slideDuration: 5,
  showNotes: false,
  thumbnailNav: true
});
```

## Control the Viewer

After loading a document, you can control it programmatically:

```javascript
const result = viewer.getRenderResult();

// Navigate
result.goToPage(3);
result.getCurrentPage();  // Returns current page number
result.getTotalPages();   // Returns total pages

// Zoom
result.setZoom(150);      // Set to 150%

// Search (for Word documents)
result.search('keyword');
result.clearSearch();

// Display
result.enterFullscreen();
result.exitFullscreen();

// Actions
result.print();
result.download();

// Cleanup
result.destroy();
```

## Styling

The plugin includes default styles, but you can customize them:

```css
/* Custom toolbar colors */
.od-word-toolbar,
.od-excel-toolbar {
  background-color: #2196F3 !important;
}

/* Custom button styles */
.od-toolbar-button {
  background-color: #fff !important;
  border-radius: 8px !important;
}

/* Custom content area */
.od-word-content {
  font-family: 'Georgia', serif !important;
  line-height: 1.8 !important;
}
```

## Next Steps

- Check out the [full API documentation](./README.md#api-reference)
- Explore the [example project](./example)
- Learn about [performance optimization](./README.md#performance-optimization)
- Read about [advanced configuration](./README.md#advanced-configuration)

## Need Help?

- 📖 [Full Documentation](./README.md)
- 🐛 [Report Issues](https://github.com/your-org/office-document/issues)
- 💬 [Community Discussions](https://github.com/your-org/office-document/discussions)