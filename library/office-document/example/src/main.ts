import { OfficeDocument } from '@ldesign/office-document';
import type { RenderOptions, RenderResult, DocumentInfo } from '@ldesign/office-document';
import './style.css';

let currentDocument: OfficeDocument | null = null;
let currentResult: RenderResult | null = null;

// Get DOM elements
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const loadFileBtn = document.getElementById('loadFileBtn') as HTMLButtonElement;
const urlInput = document.getElementById('urlInput') as HTMLInputElement;
const loadUrlBtn = document.getElementById('loadUrlBtn') as HTMLButtonElement;
const documentViewer = document.getElementById('documentViewer') as HTMLElement;
const documentInfo = document.getElementById('documentInfo') as HTMLElement;

// Options
const toolbarOption = document.getElementById('toolbarOption') as HTMLInputElement;
const paginationOption = document.getElementById('paginationOption') as HTMLInputElement;
const searchOption = document.getElementById('searchOption') as HTMLInputElement;
const virtualScrollOption = document.getElementById('virtualScrollOption') as HTMLInputElement;
const themeSelect = document.getElementById('themeSelect') as HTMLSelectElement;

// File input handler
fileInput.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  loadFileBtn.disabled = !file;
});

// Load file button handler
loadFileBtn.addEventListener('click', async () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  await loadDocument({ file });
});

// Load URL button handler
loadUrlBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  if (!url) {
    alert('Please enter a valid URL');
    return;
  }

  await loadDocument({ url });
});

// Sample document buttons
document.querySelectorAll('.sample-btn').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const type = (e.target as HTMLElement).getAttribute('data-type');
    await loadSampleDocument(type!);
  });
});

// Get render options from UI
function getRenderOptions(): RenderOptions {
  const theme = getTheme(themeSelect.value);
  
  return {
    container: documentViewer,
    toolbar: toolbarOption.checked,
    pagination: paginationOption.checked,
    search: searchOption.checked,
    virtualScrolling: virtualScrollOption.checked,
    width: '100%',
    height: '600px',
    theme,
    toolbarOptions: {
      items: ['zoom-in', 'zoom-out', 'zoom-fit', 'print', 'download', 'search', 'fullscreen', 'page-nav'],
      position: 'top'
    },
    onLoad: (doc: DocumentInfo) => {
      displayDocumentInfo(doc);
    },
    onError: (error: Error) => {
      console.error('Document render error:', error);
      alert(`Error loading document: ${error.message}`);
    },
    onPageChange: (page: number) => {
      console.log('Page changed to:', page);
    },
    onZoomChange: (zoom: number) => {
      console.log('Zoom changed to:', zoom + '%');
    }
  };
}

// Get theme configuration
function getTheme(themeName: string) {
  switch (themeName) {
    case 'dark':
      return {
        primary: '#4CAF50',
        background: '#1e1e1e',
        text: '#ffffff',
        border: '#444444',
        toolbar: {
          background: '#2d2d2d',
          text: '#ffffff',
          hover: '#3d3d3d'
        }
      };
    case 'custom':
      return {
        primary: '#FF6B6B',
        background: '#F7F7F7',
        text: '#2C3E50',
        border: '#BDC3C7',
        toolbar: {
          background: '#ECF0F1',
          text: '#34495E',
          hover: '#D5DBDB'
        }
      };
    default: // light
      return {
        primary: '#1976D2',
        background: '#ffffff',
        text: '#333333',
        border: '#dddddd',
        toolbar: {
          background: '#f5f5f5',
          text: '#333333',
          hover: '#e0e0e0'
        }
      };
  }
}

// Load document
async function loadDocument(loadOptions: any) {
  try {
    // Show loading state
    documentViewer.innerHTML = '<div class="loading">Loading document...</div>';

    // Destroy previous document if exists
    if (currentResult) {
      currentResult.destroy();
      currentResult = null;
    }

    // Create new document instance
    currentDocument = new OfficeDocument(getRenderOptions());
    
    // Load and render
    currentResult = await currentDocument.load(loadOptions);
    
    console.log('Document loaded successfully');
  } catch (error) {
    console.error('Failed to load document:', error);
    documentViewer.innerHTML = `
      <div class="error">
        <h3>Error Loading Document</h3>
        <p>${(error as Error).message}</p>
      </div>
    `;
  }
}

// Load sample document
async function loadSampleDocument(type: string) {
  // Create sample data based on type
  let sampleData: ArrayBuffer;
  
  switch (type) {
    case 'word':
      // Create a simple Word document sample
      const wordContent = `
        <html>
          <body>
            <h1>Sample Word Document</h1>
            <p>This is a sample paragraph in the Word document.</p>
            <h2>Features</h2>
            <ul>
              <li>Headings and paragraphs</li>
              <li>Lists and tables</li>
              <li>Images and formatting</li>
            </ul>
            <h2>Table Example</h2>
            <table border="1">
              <tr><th>Header 1</th><th>Header 2</th></tr>
              <tr><td>Cell 1</td><td>Cell 2</td></tr>
              <tr><td>Cell 3</td><td>Cell 4</td></tr>
            </table>
          </body>
        </html>
      `;
      sampleData = new TextEncoder().encode(wordContent).buffer;
      
      // For demo purposes, show HTML content directly
      documentViewer.innerHTML = `
        <div class="od-word-viewer">
          ${getRenderOptions().toolbar ? createSampleToolbar() : ''}
          <div class="od-word-content" style="padding: 20px; background: white;">
            ${wordContent}
          </div>
        </div>
      `;
      
      displayDocumentInfo({
        type: 'word',
        name: 'sample.docx',
        size: sampleData.byteLength,
        pageCount: 1
      });
      break;

    case 'excel':
      // Create a simple Excel table sample
      const excelContent = `
        <div class="od-excel-viewer">
          ${getRenderOptions().toolbar ? createSampleToolbar() : ''}
          <div class="od-sheet-tabs">
            <button class="od-sheet-tab" style="background: white;">Sheet1</button>
            <button class="od-sheet-tab">Sheet2</button>
          </div>
          <div class="od-excel-content" style="padding: 10px; background: white; overflow: auto;">
            <table style="border-collapse: collapse; width: 100%;">
              <thead>
                <tr>
                  <th style="border: 1px solid #ddd; padding: 8px; background: #f0f0f0;">A</th>
                  <th style="border: 1px solid #ddd; padding: 8px; background: #f0f0f0;">B</th>
                  <th style="border: 1px solid #ddd; padding: 8px; background: #f0f0f0;">C</th>
                  <th style="border: 1px solid #ddd; padding: 8px; background: #f0f0f0;">D</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">Product</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">Quantity</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">Price</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">Total</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">Item 1</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">10</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">$5.00</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">$50.00</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">Item 2</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">5</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">$10.00</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">$50.00</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">Item 3</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">8</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">$7.50</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">$60.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
      
      documentViewer.innerHTML = excelContent;
      
      displayDocumentInfo({
        type: 'excel',
        name: 'sample.xlsx',
        size: 1024,
        metadata: {
          sheetCount: 2,
          sheets: ['Sheet1', 'Sheet2']
        }
      });
      break;

    case 'powerpoint':
      // PowerPoint sample
      documentViewer.innerHTML = `
        <div class="od-ppt-viewer">
          ${getRenderOptions().toolbar ? createSampleToolbar() : ''}
          <div style="padding: 20px; background: white; text-align: center;">
            <h1 style="font-size: 48px; margin: 50px 0;">Sample Presentation</h1>
            <p style="font-size: 24px;">Slide 1 of 3</p>
            <div style="margin-top: 50px;">
              <button onclick="alert('Previous slide')">◀ Previous</button>
              <button onclick="alert('Next slide')">Next ▶</button>
            </div>
          </div>
        </div>
      `;
      
      displayDocumentInfo({
        type: 'powerpoint',
        name: 'sample.pptx',
        size: 2048,
        pageCount: 3
      });
      break;
  }
}

// Create sample toolbar
function createSampleToolbar(): string {
  return `
    <div style="padding: 10px; border-bottom: 1px solid #ddd; background: #f5f5f5; display: flex; gap: 10px;">
      <button onclick="alert('Zoom In')">🔍+</button>
      <button onclick="alert('Zoom Out')">🔍-</button>
      <button onclick="alert('Print')">🖨️</button>
      <button onclick="alert('Download')">💾</button>
      <button onclick="alert('Search')">🔍</button>
      <button onclick="alert('Fullscreen')">⛶</button>
    </div>
  `;
}

// Display document info
function displayDocumentInfo(doc: DocumentInfo) {
  let infoHtml = `
    <p><strong>Type:</strong> ${doc.type.toUpperCase()}</p>
    <p><strong>Name:</strong> ${doc.name}</p>
    <p><strong>Size:</strong> ${formatFileSize(doc.size)}</p>
  `;

  if (doc.pageCount) {
    infoHtml += `<p><strong>Pages:</strong> ${doc.pageCount}</p>`;
  }

  if (doc.metadata) {
    if (doc.metadata.sheetCount) {
      infoHtml += `<p><strong>Sheets:</strong> ${doc.metadata.sheetCount}</p>`;
    }
    if (doc.metadata.sheets) {
      infoHtml += `<p><strong>Sheet Names:</strong> ${doc.metadata.sheets.join(', ')}</p>`;
    }
  }

  documentInfo.innerHTML = infoHtml;
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Initialize
console.log('Office Document Renderer Example - Ready');