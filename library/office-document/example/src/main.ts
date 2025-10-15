import { OfficeViewer } from '../../src/index';
import type { DocumentType } from '../../src/types';

let viewer: OfficeViewer | null = null;

// Sample files mapping
const SAMPLE_FILES: Record<string, string> = {
 word: './samples/sample.docx',
 excel: './samples/sample.xlsx',
 powerpoint: './samples/sample.pptx'
};

// Get elements
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const documentTypeSelect = document.getElementById('documentType') as HTMLSelectElement;
const themeSelect = document.getElementById('theme') as HTMLSelectElement;
const loadBtn = document.getElementById('loadBtn') as HTMLButtonElement;
const reloadBtn = document.getElementById('reloadBtn') as HTMLButtonElement;
const metadataBtn = document.getElementById('metadataBtn') as HTMLButtonElement;
const destroyBtn = document.getElementById('destroyBtn') as HTMLButtonElement;
const exampleLinks = document.querySelectorAll('[data-file]');

// Load document function
async function loadDocument(source: File | string, type?: DocumentType) {
 const theme = themeSelect.value as 'light' | 'dark';

 // Destroy existing viewer
 if (viewer) {
  viewer.destroy();
 }

 try {
  // Create new viewer
  viewer = new OfficeViewer({
   container: '#viewer',
   source,
   type,
   theme,
   enableZoom: true,
   enableDownload: true,
   enablePrint: true,
   enableFullscreen: true,
   showToolbar: true,
   onLoad: () => {
    console.log('Document loaded successfully');
   },
   onError: (error) => {
    console.error('Error loading document:', error);
    alert(`Error loading document: ${error.message}`);
   },
   onProgress: (progress) => {
    console.log(`Loading progress: ${progress}%`);
   },
   excel: {
    showSheetTabs: true,
    showFormulaBar: true,
    showGridLines: true,
    enableEditing: false
   },
   powerpoint: {
    autoPlay: false,
    autoPlayInterval: 3000,
    showNavigation: true,
    showThumbnails: true
   },
   word: {
    showOutline: false,
    pageView: 'continuous'
   }
  });

  // Listen to events
  viewer.on('load', () => {
   console.log('Viewer loaded event');
  });

  viewer.on('zoom', (level) => {
   console.log('Zoom level changed:', level);
  });

  viewer.on('error', (error) => {
   console.error('Viewer error event:', error);
  });
 } catch (error) {
  console.error('Failed to create viewer:', error);
  alert(`Failed to create viewer: ${error}`);
 }
}

// Load button handler
loadBtn.addEventListener('click', async () => {
 const file = fileInput.files?.[0];
 if (!file) {
  alert('Please select a file first');
  return;
 }

 const type = documentTypeSelect.value as DocumentType | '';
 await loadDocument(file, type || undefined);
});

// Reload button handler
reloadBtn.addEventListener('click', async () => {
 if (!viewer) {
  alert('No viewer instance found');
  return;
 }

 try {
  await viewer.reload();
  console.log('Document reloaded successfully');
 } catch (error) {
  console.error('Failed to reload document:', error);
  alert(`Failed to reload: ${error}`);
 }
});

// Metadata button handler
metadataBtn.addEventListener('click', async () => {
 if (!viewer) {
  alert('No viewer instance found');
  return;
 }

 try {
  const metadata = await viewer.getMetadata();
  console.log('Document metadata:', metadata);
  alert(`Document Metadata:\n${JSON.stringify(metadata, null, 2)}`);
 } catch (error) {
  console.error('Failed to get metadata:', error);
  alert(`Failed to get metadata: ${error}`);
 }
});

// Destroy button handler
destroyBtn.addEventListener('click', () => {
 if (!viewer) {
  alert('No viewer instance found');
  return;
 }

 viewer.destroy();
 viewer = null;
 console.log('Viewer destroyed');
 alert('Viewer destroyed successfully');
});

// Example links handler
exampleLinks.forEach(link => {
 link.addEventListener('click', async (e) => {
  e.preventDefault();
  const fileType = (e.target as HTMLElement).dataset.file as string;

  if (!fileType || !SAMPLE_FILES[fileType]) {
   alert('Sample file not found');
   return;
  }

  // Load sample file
  await loadDocument(SAMPLE_FILES[fileType], fileType as DocumentType);
 });
});

// Auto-load demo when file is selected
fileInput.addEventListener('change', () => {
 if (fileInput.files?.[0]) {
  console.log('File selected:', fileInput.files[0].name);
 }
});

// Theme change handler
themeSelect.addEventListener('change', () => {
 if (viewer && fileInput.files?.[0]) {
  // Reload with new theme
  loadBtn.click();
 }
});

// Show initial message
console.log('Office Viewer Example loaded');
console.log('Upload a document to get started!');
