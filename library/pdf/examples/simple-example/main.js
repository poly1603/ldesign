// Import PDF plugin from src directory using Vite alias
import { PDFViewer, SimpleToolbar } from '@pdf-plugin';

// ✅ 导入优化后的样式
import '@pdf-plugin/styles/pdf-viewer.css';

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
  
  // Initialize viewer with URL
  async function initViewerWithURL(url) {
    try {
      // Clean up previous viewer if exists
      if (viewer) {
        viewer.destroy();
        viewerContainer.innerHTML = '';
      }
      
      // Create viewer container
      const viewerDiv = document.createElement('div');
      viewerDiv.style.height = '100%';
      viewerDiv.style.display = 'flex';
      viewerDiv.style.flexDirection = 'column';
      
      // Create toolbar container
      const toolbarDiv = document.createElement('div');
      viewerDiv.appendChild(toolbarDiv);
      
      // Create canvas container
      const canvasDiv = document.createElement('div');
      canvasDiv.style.flex = '1';
      canvasDiv.style.overflow = 'hidden';
      viewerDiv.appendChild(canvasDiv);
      
      viewerContainer.appendChild(viewerDiv);
      
      // Create PDF viewer with enhanced features
      viewer = new PDFViewer({
        container: canvasDiv,
        pdfUrl: url,
        initialScale: 1.5,
        fitMode: 'auto',
        enableSearch: true,
        enableDownload: true,
        enablePrint: true,
        enableSidebar: true,     // ✅ 启用侧边栏
        enableThumbnails: true,    // ✅ 启用缩略图
        sidebarConfig: {       // ✅ 缩略图配置
          defaultPanel: 'thumbnails',
          width: 280
        },
        pageMode: 'single',
        pageTransition: {      // ✅ 页面切换动画配置
          enabled: true,       // 启用动画
          type: 'fade',        // 动画类型: fade, slide, flip, zoom, none
          duration: 400,       // 动画时长 (毫秒)
          easing: 'ease-in-out' // 动画缓动函数
        }
      });
      
      // Create toolbar
      const toolbar = new SimpleToolbar({
        viewer: viewer,
        container: toolbarDiv,
        showSearch: true,
        showDownload: true,
        showPrint: true
      });
      
      // Listen to events
      viewer.on('document-loaded', (data) => {
        console.log(`📄 Document loaded: ${data.numPages} pages`);
        hideWelcomeScreen();
        hideLoading();
      });
      
      viewer.on('error', (error) => {
        console.error('❌ Error:', error);
        hideLoading();
        alert(`Error loading PDF`);
      });
      
      console.log('✨ PDF Viewer initialized!');
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
      const url = URL.createObjectURL(file);
      await initViewerWithURL(url);
    } catch (error) {
      console.error('Failed to load PDF:', error);
      hideLoading();
    }
  }
  
  // Load sample PDF
  async function loadSamplePDF() {
    showLoading();
    
    try {
      await initViewerWithURL(SAMPLE_PDF);
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
    if (!viewer) return;
    
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
