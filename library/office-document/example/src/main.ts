import { OfficeViewer } from '../../src/index';
import type { DocumentType } from '../../src/types';

let viewer: OfficeViewer | null = null;

// Get file input element
const fileInput = document.getElementById('fileInput') as HTMLInputElement;

// Load document function
async function loadDocument(file: File) {
 // Destroy existing viewer
 if (viewer) {
  viewer.destroy();
 }

 try {
  // Create new viewer
  viewer = new OfficeViewer({
   container: '#viewer',
   source: file,
   width: '100%',
   height: '100%',
   enableZoom: true,
   enableDownload: true,
   enablePrint: true,
   enableFullscreen: true,
   showToolbar: true,
   theme: 'light',
   onLoad: () => {
    console.log('Document loaded successfully');
   },
   onError: (error) => {
    console.error('Error loading document:', error);
    alert(`Error loading document: ${error.message}`);
   },
   excel: {
    showSheetTabs: true,
    showFormulaBar: true,
    showGridLines: true,
    enableEditing: false
   },
   powerpoint: {
    autoPlay: false,
    showNavigation: true,
    showThumbnails: true
   },
   word: {
    pageView: 'continuous'
   }
  });
 } catch (error) {
  console.error('Failed to create viewer:', error);
  alert(`Failed to create viewer: ${error}`);
 }
}

// Auto-load document when file is selected
fileInput.addEventListener('change', async () => {
 const file = fileInput.files?.[0];
 if (!file) return;

 console.log('File selected:', file.name);
 await loadDocument(file);
});

// Show initial message
console.log('Office Viewer Example loaded');
console.log('Select a document to preview it!');
