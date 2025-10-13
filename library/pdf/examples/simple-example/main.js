// Import PDF plugin from src directory using Vite alias
import { PDFViewer } from '@pdf-plugin';
import '@pdf-plugin/styles/pdf-viewer-modern.css';

// Sample PDF URL
const SAMPLE_PDF = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const welcomeScreen = document.getElementById('welcome-screen');
  const loadingOverlay = document.getElementById('loading-overlay');
  const fileInput = document.getElementById('file-input');
  const loadSampleBtn = document.getElementById('load-sample');
  const viewerContainer = document.getElementById('pdf-viewer-container');
  
  let viewer = null;
  
  // Initialize viewer
  async function initViewer() {
    try {
      viewer = new PDFViewer({
        container: viewerContainer,
        enableSearch: true,
        enableAnnotations: true,
        enableBookmarks: true,
        enablePrint: true,
        enableThumbnails: true,
        toolbar: true,
        sidebar: true,
        theme: 'modern',
        defaultScale: 'page-width',
        onInit: (v) => {
          console.log('✨ PDF Viewer initialized!');
        },
        onDocumentLoad: (doc) => {
          console.log(`📄 Document loaded: ${doc.numPages} pages`);
          hideWelcomeScreen();
          hideLoading();
        },
        onError: (error) => {
          console.error('❌ Error:', error);
          hideLoading();
          alert(`Error: ${error.message}`);
        }
      });
      
      await viewer.init();
    } catch (error) {
      console.error('Failed to initialize viewer:', error);
      hideLoading();
    }
  }
  
  // Load PDF from file
  async function loadPDFFromFile(file) {
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file');
      return;
    }
    
    showLoading();
    
    try {
      if (!viewer) await initViewer();
      
      const arrayBuffer = await file.arrayBuffer();
      await viewer.loadDocument(arrayBuffer);
    } catch (error) {
      console.error('Failed to load PDF:', error);
      hideLoading();
    }
  }
  
  // Load sample PDF
  async function loadSamplePDF() {
    showLoading();
    
    try {
      if (!viewer) await initViewer();
      
      const response = await fetch(SAMPLE_PDF);
      const arrayBuffer = await response.arrayBuffer();
      await viewer.loadDocument(arrayBuffer);
    } catch (error) {
      console.error('Failed to load sample:', error);
      hideLoading();
    }
  }
  
  // UI helpers
  function showLoading() {
    if (loadingOverlay) loadingOverlay.classList.add('active');
  }
  
  function hideLoading() {
    if (loadingOverlay) loadingOverlay.classList.remove('active');
  }
  
  function hideWelcomeScreen() {
    if (welcomeScreen) welcomeScreen.classList.add('hidden');
  }
  
  // Event listeners
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) loadPDFFromFile(file);
    });
  }
  
  if (loadSampleBtn) {
    loadSampleBtn.addEventListener('click', loadSamplePDF);
  }
  
  // Drag and drop support
  document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  
  document.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      await loadPDFFromFile(files[0]);
    }
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (!viewer || !viewer.document) return;
    
    // Navigation
    if (e.key === 'ArrowLeft') viewer.previousPage();
    if (e.key === 'ArrowRight') viewer.nextPage();
    
    // Zoom
    if ((e.ctrlKey || e.metaKey) && e.key === '+') {
      e.preventDefault();
      viewer.zoomIn();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === '-') {
      e.preventDefault();
      viewer.zoomOut();
    }
  });
  
  console.log('=== Modern PDF Viewer Ready ===');
  console.log('🎨 Beautiful UI with gradient design');
  console.log('⚡ All features from src/ plugin');
  console.log('📱 Drag & drop supported');
  console.log('⌨️ Keyboard shortcuts enabled');
});
