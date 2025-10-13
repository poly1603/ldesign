import './style.css'

// 模拟 UniversalPDFViewer 插件（实际使用时从构建后的插件导入）
// import UniversalPDFViewer from '../../../dist/pdf-viewer.js'

class UniversalPDFViewer {
  constructor(options) {
    this.options = options;
    this.container = typeof options.container === 'string' 
      ? document.querySelector(options.container)
      : options.container;
    
    this.currentPage = 1;
    this.totalPages = 0;
    this.scale = options.defaultScale || 1.0;
    this.pdfDoc = null;
    this.pageRendering = false;
    this.pageNumPending = null;
    this.canvas = null;
    this.ctx = null;
    this.events = {};
    
    this.init();
  }

  init() {
    // 创建 PDF 查看器结构
    this.container.innerHTML = `
      <div class="pdf-viewer-wrapper" data-theme="light">
        <div class="pdf-viewer-toolbar">
          <div class="toolbar-group">
            <button class="toolbar-btn" id="toggleThumbnails" title="切换缩略图">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
            </button>
          </div>
          <div class="toolbar-group">
            <button class="toolbar-btn" id="prevPage" title="上一页">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <span class="page-info">
              <input type="number" id="pageNum" value="1" min="1"> / 
              <span id="pageCount">0</span>
            </span>
            <button class="toolbar-btn" id="nextPage" title="下一页">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
          <div class="toolbar-separator"></div>
          <div class="toolbar-group">
            <button class="toolbar-btn" id="zoomOut" title="缩小">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </button>
            <span class="zoom-info" id="zoomLevel">100%</span>
            <button class="toolbar-btn" id="zoomIn" title="放大">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </button>
            <button class="toolbar-btn" id="fitWidth" title="适应宽度">适应宽度</button>
            <button class="toolbar-btn" id="fitPage" title="适应页面">适应页面</button>
          </div>
          <div class="toolbar-separator"></div>
          <div class="toolbar-group">
            <button class="toolbar-btn" id="rotate" title="旋转">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>
            <button class="toolbar-btn" id="print" title="打印">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
            </button>
            <button class="toolbar-btn" id="download" title="下载">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="pdf-viewer-body">
          <aside class="pdf-thumbnails" id="thumbnailsPanel">
            <div class="thumbnails-header">
              <h3>页面缩略图</h3>
            </div>
            <div class="thumbnails-container" id="thumbnailsContainer">
              <!-- 缩略图将动态生成 -->
            </div>
          </aside>
          <div class="pdf-viewer-content">
            <canvas id="pdfCanvas"></canvas>
            <div id="textLayer" class="textLayer"></div>
          </div>
        </div>
        <div class="pdf-status" id="pdfStatus"></div>
      </div>
    `;
    
    this.canvas = this.container.querySelector('#pdfCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.setupEventListeners();
    this.loadPdfJs();
  }

  async loadPdfJs() {
    // 等待 PDF.js 加载
    await this.waitForPdfJs();
    
    if (this.options.pdfUrl) {
      this.loadPDF(this.options.pdfUrl);
    }
  }

  async waitForPdfJs() {
    // 如果已经加载，直接返回
    if (typeof window.pdfjsLib !== 'undefined') {
      return;
    }

    // 检查是否正在加载
    if (window.pdfjsLoading) {
      // 等待加载完成
      while (window.pdfjsLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    // 标记正在加载
    window.pdfjsLoading = true;

    // 动态加载 PDF.js
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    
    await new Promise((resolve, reject) => {
      script.onload = () => {
        // 设置 worker
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          window.pdfjsLoading = false;
          resolve();
        } else {
          reject(new Error('PDF.js 加载失败'));
        }
      };
      script.onerror = () => {
        window.pdfjsLoading = false;
        reject(new Error('PDF.js 脚本加载失败'));
      };
      document.head.appendChild(script);
    });
  }

  setupEventListeners() {
    const toggleThumbnailsBtn = this.container.querySelector('#toggleThumbnails');
    const prevBtn = this.container.querySelector('#prevPage');
    const nextBtn = this.container.querySelector('#nextPage');
    const pageNumInput = this.container.querySelector('#pageNum');
    const zoomInBtn = this.container.querySelector('#zoomIn');
    const zoomOutBtn = this.container.querySelector('#zoomOut');
    const fitWidthBtn = this.container.querySelector('#fitWidth');
    const fitPageBtn = this.container.querySelector('#fitPage');
    const rotateBtn = this.container.querySelector('#rotate');
    const printBtn = this.container.querySelector('#print');
    const downloadBtn = this.container.querySelector('#download');
    
    toggleThumbnailsBtn?.addEventListener('click', () => this.toggleThumbnails());
    
    prevBtn?.addEventListener('click', () => this.previousPage());
    nextBtn?.addEventListener('click', () => this.nextPage());
    pageNumInput?.addEventListener('change', (e) => this.goToPage(parseInt(e.target.value)));
    zoomInBtn?.addEventListener('click', () => this.zoomIn());
    zoomOutBtn?.addEventListener('click', () => this.zoomOut());
    fitWidthBtn?.addEventListener('click', () => this.fitToWidth());
    fitPageBtn?.addEventListener('click', () => this.fitToPage());
    rotateBtn?.addEventListener('click', () => this.rotate());
    printBtn?.addEventListener('click', () => this.print());
    downloadBtn?.addEventListener('click', () => this.download());
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  handleKeyboard(e) {
    if (!this.pdfDoc) return;
    
    switch(e.key) {
      case 'ArrowLeft':
        this.previousPage();
        break;
      case 'ArrowRight':
        this.nextPage();
        break;
      case '+':
        if (e.ctrlKey) {
          e.preventDefault();
          this.zoomIn();
        }
        break;
      case '-':
        if (e.ctrlKey) {
          e.preventDefault();
          this.zoomOut();
        }
        break;
    }
  }

  async loadPDF(url) {
    try {
      // 确保 PDF.js 已加载
      await this.waitForPdfJs();
      
      this.showStatus('正在加载 PDF...');
      this.emit('loading', { url });
      
      const loadingTask = window.pdfjsLib.getDocument(url);
      this.pdfDoc = await loadingTask.promise;
      this.totalPages = this.pdfDoc.numPages;
      
      // 更新页数显示
      const pageCount = this.container.querySelector('#pageCount');
      if (pageCount) pageCount.textContent = this.totalPages;
      
      // 渲染第一页
      this.renderPage(1);
      
      // 生成缩略图
      this.generateThumbnails();
      
      this.emit('loaded', { totalPages: this.totalPages });
      this.hideStatus();
      
      // 记录到事件日志
      this.logEvent(`PDF 加载成功，共 ${this.totalPages} 页`);
    } catch (error) {
      this.showStatus('加载 PDF 失败: ' + error.message);
      this.emit('error', error);
      this.logEvent('PDF 加载失败: ' + error.message, 'error');
    }
  }

  async renderPage(num) {
    if (!this.pdfDoc) return;
    
    this.pageRendering = true;
    
    try {
      const page = await this.pdfDoc.getPage(num);
      const viewport = page.getViewport({ scale: this.scale });
      
      this.canvas.height = viewport.height;
      this.canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: this.ctx,
        viewport: viewport
      };
      
      const renderTask = page.render(renderContext);
      await renderTask.promise;
      
      this.pageRendering = false;
      
      if (this.pageNumPending !== null) {
        this.renderPage(this.pageNumPending);
        this.pageNumPending = null;
      }
      
      // 更新页码输入框
      const pageNumInput = this.container.querySelector('#pageNum');
      if (pageNumInput) pageNumInput.value = num;
      
      this.emit('pageChanged', { currentPage: num, totalPages: this.totalPages });
      this.logEvent(`切换到第 ${num} 页`);
    } catch (error) {
      this.pageRendering = false;
      this.emit('error', error);
    }
  }

  queueRenderPage(num) {
    if (this.pageRendering) {
      this.pageNumPending = num;
    } else {
      this.renderPage(num);
    }
  }

  previousPage() {
    if (this.currentPage <= 1) return;
    this.currentPage--;
    this.queueRenderPage(this.currentPage);
  }

  nextPage() {
    if (this.currentPage >= this.totalPages) return;
    this.currentPage++;
    this.queueRenderPage(this.currentPage);
  }

  goToPage(pageNum) {
    if (pageNum < 1 || pageNum > this.totalPages) return;
    this.currentPage = pageNum;
    this.queueRenderPage(this.currentPage);
  }

  zoomIn() {
    this.scale = Math.min(this.scale * 1.2, 5.0);
    this.updateZoomDisplay();
    this.queueRenderPage(this.currentPage);
    this.logEvent(`放大到 ${Math.round(this.scale * 100)}%`);
  }

  zoomOut() {
    this.scale = Math.max(this.scale * 0.8, 0.25);
    this.updateZoomDisplay();
    this.queueRenderPage(this.currentPage);
    this.logEvent(`缩小到 ${Math.round(this.scale * 100)}%`);
  }

  setScale(scale) {
    this.scale = Math.max(0.25, Math.min(5.0, scale));
    this.updateZoomDisplay();
    this.queueRenderPage(this.currentPage);
  }

  fitToWidth() {
    if (!this.pdfDoc) return;
    // 简化实现
    this.scale = 1.0;
    this.updateZoomDisplay();
    this.queueRenderPage(this.currentPage);
    this.logEvent('适应宽度');
  }

  fitToPage() {
    if (!this.pdfDoc) return;
    // 简化实现
    this.scale = 0.8;
    this.updateZoomDisplay();
    this.queueRenderPage(this.currentPage);
    this.logEvent('适应页面');
  }

  rotate() {
    // 简化实现 - 仅记录事件
    this.logEvent('旋转页面 90°');
    alert('旋转功能演示');
  }

  print() {
    if (this.pdfDoc) {
      window.print();
      this.logEvent('打印 PDF');
    }
  }

  download() {
    if (this.options.pdfUrl) {
      const a = document.createElement('a');
      a.href = this.options.pdfUrl;
      a.download = 'document.pdf';
      a.click();
      this.logEvent('下载 PDF');
    }
  }

  updateZoomDisplay() {
    const zoomLevel = this.container.querySelector('#zoomLevel');
    if (zoomLevel) {
      zoomLevel.textContent = Math.round(this.scale * 100) + '%';
    }
  }

  showStatus(message) {
    const status = this.container.querySelector('#pdfStatus');
    if (status) {
      status.textContent = message;
      status.style.display = 'block';
    }
  }

  hideStatus() {
    const status = this.container.querySelector('#pdfStatus');
    if (status) {
      status.style.display = 'none';
    }
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  logEvent(message, type = 'info') {
    const eventLog = document.querySelector('#eventLog');
    if (eventLog) {
      const entry = document.createElement('div');
      entry.className = `log-entry log-${type}`;
      const time = new Date().toLocaleTimeString();
      entry.innerHTML = `<span class="log-time">[${time}]</span> ${message}`;
      eventLog.appendChild(entry);
      eventLog.scrollTop = eventLog.scrollHeight;
    }
  }

  setTheme(theme) {
    const wrapper = this.container.querySelector('.pdf-viewer-wrapper');
    if (wrapper) {
      wrapper.setAttribute('data-theme', theme);
    }
    this.logEvent(`切换到${theme === 'dark' ? '深色' : theme === 'sepia' ? '护眼' : '浅色'}主题`);
  }

  toggleThumbnails() {
    const panel = this.container.querySelector('#thumbnailsPanel');
    if (panel) {
      panel.classList.toggle('hidden');
      this.logEvent(panel.classList.contains('hidden') ? '隐藏缩略图' : '显示缩略图');
    }
  }

  async generateThumbnails() {
    if (!this.pdfDoc) return;
    
    const container = this.container.querySelector('#thumbnailsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 1; i <= this.totalPages; i++) {
      const page = await this.pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 0.3 });
      
      const thumbnailItem = document.createElement('div');
      thumbnailItem.className = 'thumbnail-item';
      if (i === this.currentPage) {
        thumbnailItem.classList.add('active');
      }
      
      const canvas = document.createElement('canvas');
      canvas.className = 'thumbnail-canvas';
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      const label = document.createElement('div');
      label.className = 'thumbnail-label';
      label.textContent = `页 ${i}`;
      
      thumbnailItem.appendChild(canvas);
      thumbnailItem.appendChild(label);
      thumbnailItem.addEventListener('click', () => this.goToPage(i));
      
      container.appendChild(thumbnailItem);
    }
  }

  updateActiveThumbnail() {
    const thumbnails = this.container.querySelectorAll('.thumbnail-item');
    thumbnails.forEach((thumb, index) => {
      if (index + 1 === this.currentPage) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });
  }

  destroy() {
    this.pdfDoc = null;
    this.container.innerHTML = '';
  }
}

// 初始化应用
let pdfViewer = null;

// 示例 PDF URLs
const samplePDFs = [
  'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 
  'https://www.africau.edu/images/default/sample.pdf'
];

// 全局函数，供 HTML 中的按钮调用
window.loadSamplePDF = function(index) {
  const url = samplePDFs[index - 1];
  if (url) {
    loadPDFUrl(url);
  }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  setupDemoControls();
  
  // 填充示例 PDF 选择器
  const pdfSelect = document.getElementById('pdfSelect');
  if (pdfSelect) {
    pdfSelect.options[1].value = samplePDFs[0];
    pdfSelect.options[2].value = samplePDFs[1];
    pdfSelect.options[3].value = samplePDFs[2];
  }
});

function setupDemoControls() {
  // PDF 选择器
  const pdfSelect = document.getElementById('pdfSelect');
  pdfSelect?.addEventListener('change', (e) => {
    if (e.target.value) {
      loadPDFUrl(e.target.value);
    }
  });
  
  // 文件上传
  const fileInput = document.getElementById('fileInput');
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      loadPDFFile(file);
    }
  });
  
  // URL 加载
  const loadUrlBtn = document.getElementById('loadUrlBtn');
  loadUrlBtn?.addEventListener('click', () => {
    const urlInput = document.getElementById('urlInput');
    if (urlInput.value) {
      loadPDFUrl(urlInput.value);
    }
  });
  
  // 查看器选项
  const options = ['showToolbar', 'showThumbnails', 'showAnnotations', 'enableSearch', 'enablePrint', 'enableDownload'];
  options.forEach(option => {
    const checkbox = document.getElementById(option);
    checkbox?.addEventListener('change', (e) => {
      updateViewerOption(option, e.target.checked);
    });
  });
  
  // 主题按钮
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const theme = e.target.dataset.theme;
      applyTheme(theme);
    });
  });
  
  // 清除日志按钮
  const clearLogBtn = document.getElementById('clearLog');
  clearLogBtn?.addEventListener('click', () => {
    const eventLog = document.getElementById('eventLog');
    if (eventLog) {
      eventLog.innerHTML = '<div class="log-entry">日志已清除</div>';
    }
  });
  
  // API 示例标签页
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      
      e.target.classList.add('active');
      const tabId = e.target.dataset.tab + '-tab';
      document.getElementById(tabId)?.classList.add('active');
    });
  });
}

window.loadPDFUrl = function(url) {
  // 销毁现有查看器
  if (pdfViewer) {
    pdfViewer.destroy();
  }
  
  // 创建新查看器
  pdfViewer = new UniversalPDFViewer({
    container: '#pdfViewerContainer',
    pdfUrl: url,
    theme: document.body.getAttribute('data-theme') || 'light',
    defaultScale: 1.0,
    enableToolbar: document.getElementById('showToolbar')?.checked,
    enableSearch: document.getElementById('enableSearch')?.checked,
    enablePrint: document.getElementById('enablePrint')?.checked,
    enableDownload: document.getElementById('enableDownload')?.checked
  });
  
  // 监听事件
  pdfViewer.on('loaded', (data) => {
    console.log('PDF loaded:', data);
  });
  
  pdfViewer.on('pageChanged', (data) => {
    console.log('Page changed:', data);
  });
}

function loadPDFFile(file) {
  const fileReader = new FileReader();
  
  fileReader.onload = function() {
    const typedArray = new Uint8Array(this.result);
    
    // 销毁现有查看器
    if (pdfViewer) {
      pdfViewer.destroy();
    }
    
    // 创建新查看器
    pdfViewer = new UniversalPDFViewer({
      container: '#pdfViewerContainer',
      theme: document.body.getAttribute('data-theme') || 'light'
    });
    
    // 加载 PDF 数据
    pdfViewer.loadPDF(typedArray);
  };
  
  fileReader.readAsArrayBuffer(file);
}

function updateViewerOption(option, value) {
  console.log(`Option ${option} set to ${value}`);
  // 这里可以更新查看器选项
  if (pdfViewer) {
    pdfViewer.logEvent(`选项 ${option} 设置为 ${value}`);
  }
}

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  if (pdfViewer) {
    pdfViewer.setTheme(theme);
  }
  
  // 更新按钮状态
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === theme) {
      btn.classList.add('active');
    }
  });
}

// 导出全局变量供控制台调试
window.pdfViewer = pdfViewer;