// Import PDF plugin from src directory using Vite alias
import { PDFViewer, SimpleToolbar } from '@pdf-plugin';

// ✅ 导入优化后的样式
import '@pdf-plugin/styles/pdf-viewer.css';

// Sample PDF URLs - 提供多个备用源
const SAMPLE_PDFS = [
  'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  '/sample.pdf' // 本地文件作为最后备用
];

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
      viewer.on('document-loaded', async (data) => {
        console.log(`📄 Document loaded: ${data.numPages} pages`);
        hideWelcomeScreen();
        await hideLoading();
      });
      
      viewer.on('error', (error) => {
        console.error('❌ Error:', error);
        hideLoading();
        // 更友好的错误提示
        if (error?.message?.includes('CORS') || error?.message?.includes('fetch')) {
          alert('Unable to load PDF due to CORS policy. Please upload a local PDF file instead.');
        } else {
          alert(`Error loading PDF: ${error?.message || 'Unknown error'}`);
        }
      });
      
      console.log('✨ PDF Viewer initialized!');
    } catch (error) {
      console.error('Failed to initialize viewer:', error);
      await hideLoading();
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
      await hideLoading();
    }
  }
  
  // Load sample PDF with fallback URLs
  async function loadSamplePDF() {
    showLoading();
    
    let loaded = false;
    let lastError = null;
    
    // 尝试按顺序加载每个备用URL
    for (const url of SAMPLE_PDFS) {
      try {
        console.log(`Trying to load PDF from: ${url}`);
        await initViewerWithURL(url);
        loaded = true;
        break;
      } catch (error) {
        console.error(`Failed to load from ${url}:`, error);
        lastError = error;
      }
    }
    
    if (!loaded) {
      console.error('Failed to load sample PDF from all sources:', lastError);
      hideLoading();
      alert('Unable to load sample PDF. Please try uploading your own PDF file.');
    }
  }
  
  // UI helpers
  let loadingStartTime = 0;
  const MIN_LOADING_TIME = 500; // 最小显示时间（毫秒）
  
  function showLoading() {
    if (loadingOverlay) {
      loadingOverlay.classList.add('active');
      loadingStartTime = Date.now();
    }
  }
  
  async function hideLoading() {
    if (loadingOverlay) {
      const elapsed = Date.now() - loadingStartTime;
      const remaining = MIN_LOADING_TIME - elapsed;
      
      // 如果加载时间太短，等待一下再隐藏
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
      }
      
      loadingOverlay.classList.remove('active');
    }
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
