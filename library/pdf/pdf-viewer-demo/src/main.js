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
    this.pageCanvases = [];
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.rotation = 0;
    this.isScrollingThumbnails = false;
    
    this.init();
  }

  init() {
    // 创建 PDF 查看器结构
    this.container.innerHTML = `
      <div class="pdf-viewer-wrapper" data-theme="light" style="height: ${this.options.height || '800px'}; max-height: ${this.options.maxHeight || '90vh'}">
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
          <div class="pdf-viewer-content" id="pdfContent">
            <div class="pdf-pages-container" id="pdfPagesContainer">
              <!-- 页面画布将动态生成 -->
            </div>
          </div>
        </div>
        <div class="pdf-status" id="pdfStatus"></div>
      </div>
    `;
    
    // 不再使用单个 canvas
    this.pagesContainer = this.container.querySelector('#pdfPagesContainer');
    this.contentContainer = this.container.querySelector('#pdfContent');
    
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
    
    // 滚动事件监听
    if (this.contentContainer) {
      this.contentContainer.addEventListener('scroll', () => this.handleScroll());
    }
    
    // 为缩略图容器添加滚动事件监听器
    const thumbnailsContainer = document.getElementById('thumbnailsContainer');
    if (thumbnailsContainer) {
      let thumbnailScrollTimeout;
      thumbnailsContainer.addEventListener('scroll', () => {
        this.isScrollingThumbnails = true;
        clearTimeout(thumbnailScrollTimeout);
        thumbnailScrollTimeout = setTimeout(() => {
          this.isScrollingThumbnails = false;
        }, 150);
      });
    }
    
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
      
      // 渲染所有页面
      await this.renderAllPages();
      
      // 生成缩略图
      await this.generateThumbnails();
      
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

  async renderAllPages() {
    if (!this.pdfDoc) return;
    
    this.showStatus('正在渲染页面...');
    this.pagesContainer.innerHTML = '';
    this.pageCanvases = [];
    
    for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
      const pageContainer = document.createElement('div');
      pageContainer.className = 'pdf-page';
      pageContainer.id = `page-${pageNum}`;
      pageContainer.dataset.pageNumber = pageNum;
      
      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-page-canvas';
      
      const pageNumber = document.createElement('div');
      pageNumber.className = 'pdf-page-number';
      pageNumber.textContent = `页 ${pageNum}`;
      
      pageContainer.appendChild(canvas);
      pageContainer.appendChild(pageNumber);
      this.pagesContainer.appendChild(pageContainer);
      
      this.pageCanvases.push({ pageNum, canvas, container: pageContainer });
      
      // 异步渲染每一页
      this.renderSinglePage(pageNum, canvas);
    }
    
    this.hideStatus();
  }
  
  async renderSinglePage(pageNum, canvas) {
    if (!this.pdfDoc) return;
    
    try {
      const page = await this.pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: this.scale, rotation: this.rotation });
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const ctx = canvas.getContext('2d');
      
      // Draw loading indicator
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#666';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`加载页面 ${pageNum}...`, canvas.width / 2, canvas.height / 2);
      
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
    } catch (error) {
      console.error(`渲染页 ${pageNum} 失败:`, error);
    }
  }
  
  async renderPage(num) {
    // 保留此方法以便向后兼容，但实际上滚动到指定页
    this.scrollToPage(num);
  }

  queueRenderPage(num) {
    // 重新渲染所有页面（缩放时）
    this.renderAllPages();
  }

  previousPage() {
    if (this.currentPage <= 1) return;
    this.currentPage--;
    this.scrollToPage(this.currentPage);
    this.updateActiveThumbnail();
  }
  
  nextPage() {
    if (this.currentPage >= this.totalPages) return;
    this.currentPage++;
    this.scrollToPage(this.currentPage);
    this.updateActiveThumbnail();
  }
  
  goToPage(pageNum) {
    if (pageNum < 1 || pageNum > this.totalPages) return;
    this.currentPage = pageNum;
    this.scrollToPage(this.currentPage);
    this.updateActiveThumbnail();
  }
  
  scrollToPage(pageNum) {
    const pageElement = document.getElementById(`page-${pageNum}`);
    if (pageElement && this.contentContainer) {
      // 更新 current 类
      const pages = this.pagesContainer.querySelectorAll('.pdf-page');
      pages.forEach(page => {
        if (parseInt(page.dataset.pageNumber) === pageNum) {
          page.classList.add('current');
        } else {
          page.classList.remove('current');
        }
      });
      
      // 滚动到指定页面
      const offsetTop = pageElement.offsetTop - this.contentContainer.offsetTop;
      this.contentContainer.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      
      // 更新页码输入框
      const pageNumInput = this.container.querySelector('#pageNum');
      if (pageNumInput) pageNumInput.value = pageNum;
      
      this.emit('pageChanged', { currentPage: pageNum, totalPages: this.totalPages });
      this.logEvent(`切换到第 ${pageNum} 页`);
    }
  }
  
  handleScroll() {
    if (!this.pagesContainer || this.isScrolling) return;
    
    // 确保缩略图面板不会被意外隐藏
    const thumbnailPanel = this.container.querySelector('#thumbnailsPanel');
    if (thumbnailPanel && thumbnailPanel.classList.contains('hidden')) {
      // 如果缩略图被意外隐藏，不执行滚动处理
      return;
    }
    
    // 清除之前的超时
    clearTimeout(this.scrollTimeout);
    
    this.scrollTimeout = setTimeout(() => {
      // 获取当前可视区域的中心点
      const containerRect = this.contentContainer.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 2;
      
      // 找出在中心点的页面
      let currentVisiblePage = 1;
      const pages = this.pagesContainer.querySelectorAll('.pdf-page');
      
      // 首先移除所有 current 类
      pages.forEach(page => page.classList.remove('current'));
      
      for (let i = 0; i < pages.length; i++) {
        const pageRect = pages[i].getBoundingClientRect();
        if (pageRect.top <= centerY && pageRect.bottom >= centerY) {
          currentVisiblePage = parseInt(pages[i].dataset.pageNumber);
          pages[i].classList.add('current');
          break;
        } else if (pageRect.top > centerY) {
          // 如果页面在中心点之下，使用前一页
          currentVisiblePage = Math.max(1, parseInt(pages[i].dataset.pageNumber) - 1);
          if (i > 0) pages[i - 1].classList.add('current');
          break;
        }
      }
      
      // 更新当前页码
      if (this.currentPage !== currentVisiblePage) {
        this.currentPage = currentVisiblePage;
        
        // 更新页码显示
        const pageNumInput = this.container.querySelector('#pageNum');
        if (pageNumInput) pageNumInput.value = currentVisiblePage;
        
        // 更新缩略图高亮
        this.updateActiveThumbnail();
        
        // 触发事件
        this.emit('pageChanged', { currentPage: currentVisiblePage, totalPages: this.totalPages });
      }
    }, 100);
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
    this.rotation = (this.rotation + 90) % 360;
    this.renderAllPages();
    this.logEvent(`旋转页面 ${this.rotation}°`);
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
    
    // 保存当前滚动位置
    const currentScrollTop = container.scrollTop;
    container.innerHTML = '';
    
    // 使用 DocumentFragment 提高性能
    const fragment = document.createDocumentFragment();
    
    // 限制最大缩略图数量以提高性能
    const maxThumbnails = Math.min(this.totalPages, 100);
    
    for (let i = 1; i <= maxThumbnails; i++) {
      const page = await this.pdfDoc.getPage(i);
      
      // 计算缩略图尺寸，保持宽高比
      const desiredWidth = 180; // 缩略图容器宽度减去padding
      const pageViewport = page.getViewport({ scale: 1.0 });
      const scale = desiredWidth / pageViewport.width;
      const viewport = page.getViewport({ scale: scale });
      
      const thumbnailItem = document.createElement('div');
      thumbnailItem.className = 'thumbnail-item';
      thumbnailItem.dataset.pageNumber = i; // 添加页码数据属性
      
      if (i === this.currentPage) {
        thumbnailItem.classList.add('active');
      }
      
      const canvas = document.createElement('canvas');
      canvas.className = 'thumbnail-canvas';
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // 设置高质量渲染
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        intent: 'display'
      };
      
      await page.render(renderContext).promise;
      
      const label = document.createElement('div');
      label.className = 'thumbnail-label';
      label.textContent = `页 ${i}`;
      
      thumbnailItem.appendChild(canvas);
      thumbnailItem.appendChild(label);
      thumbnailItem.addEventListener('click', () => {
        this.goToPage(i);
      });
      
      fragment.appendChild(thumbnailItem);
    }
    
    container.appendChild(fragment);
    
    // 恢复滚动位置或滚动到当前页
    if (currentScrollTop > 0) {
      container.scrollTop = currentScrollTop;
    } else {
      this.scrollThumbnailToActive();
    }
  }

  updateActiveThumbnail() {
    const thumbnails = this.container.querySelectorAll('.thumbnail-item');
    const thumbnailsContainer = this.container.querySelector('#thumbnailsContainer');
    
    thumbnails.forEach((thumb) => {
      const pageNum = parseInt(thumb.dataset.pageNumber);
      if (pageNum === this.currentPage) {
        thumb.classList.add('active');
        
        // Auto-scroll thumbnail into view with better logic
        if (thumbnailsContainer && !this.isScrollingThumbnails) {
          this.scrollThumbnailToActive();
        }
      } else {
        thumb.classList.remove('active');
      }
    });
  }
  
  scrollThumbnailToActive() {
    // 如果用户正在滚动缩略图，不要自动滚动
    if (this.isScrollingThumbnails) return;
    
    const thumbnailsContainer = this.container.querySelector('#thumbnailsContainer');
    const activeThumbnail = this.container.querySelector('.thumbnail-item.active');
    
    if (thumbnailsContainer && activeThumbnail) {
      const thumbTop = activeThumbnail.offsetTop;
      const thumbHeight = activeThumbnail.offsetHeight;
      const containerHeight = thumbnailsContainer.clientHeight;
      const containerScrollTop = thumbnailsContainer.scrollTop;
      
      // 计算缩略图的中心位置
      const thumbCenter = thumbTop + thumbHeight / 2;
      const containerCenter = containerScrollTop + containerHeight / 2;
      
      // 如果缩略图不在视口中心附近，滚动到中心
      if (Math.abs(thumbCenter - containerCenter) > containerHeight / 4) {
        const targetScrollTop = thumbTop - (containerHeight / 2) + (thumbHeight / 2);
        
        thumbnailsContainer.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth'
        });
      }
    }
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
    height: '700px',  // 可设置固定高度
    maxHeight: '85vh', // 最大高度限制
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