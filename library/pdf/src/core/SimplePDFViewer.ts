import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
import { EventEmitter } from '../utils/EventEmitter';

// 配置 PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export interface SimplePDFViewerOptions {
  theme?: 'light' | 'dark' | 'sepia';
  showToolbar?: boolean;
  showThumbnails?: boolean;
  enableSearch?: boolean;
  enablePrint?: boolean;
  enableDownload?: boolean;
  defaultScale?: number;
}

export class SimplePDFViewer extends EventEmitter {
  private container: HTMLElement;
  private options: SimplePDFViewerOptions;
  private pdfDoc: PDFDocumentProxy | null = null;
  private currentPage: number = 1;
  private totalPages: number = 0;
  private scale: number = 1.0;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private pageRendering: boolean = false;
  private pageNumPending: number | null = null;
  private thumbnailsVisible: boolean = true;

  constructor(container: string | HTMLElement, options: SimplePDFViewerOptions = {}) {
    super();
    this.container = typeof container === 'string' 
      ? document.querySelector(container) as HTMLElement
      : container;
    
    this.options = {
      theme: 'light',
      showToolbar: true,
      showThumbnails: true,
      enableSearch: true,
      enablePrint: true,
      enableDownload: true,
      defaultScale: 1.0,
      ...options
    };

    this.scale = this.options.defaultScale || 1.0;
    this.thumbnailsVisible = this.options.showThumbnails !== false;
    this.init();
  }

  private init(): void {
    this.createStructure();
    this.setupEventListeners();
    this.applyTheme(this.options.theme || 'light');
  }

  private createStructure(): void {
    this.container.innerHTML = `
      <div class="spv-wrapper" data-theme="${this.options.theme}">
        ${this.options.showToolbar !== false ? this.createToolbar() : ''}
        <div class="spv-body">
          ${this.options.showThumbnails !== false ? this.createThumbnailsPanel() : ''}
          <div class="spv-content">
            <canvas class="spv-canvas"></canvas>
            <div class="spv-text-layer"></div>
          </div>
        </div>
        <div class="spv-status"></div>
      </div>
    `;

    this.canvas = this.container.querySelector('.spv-canvas');
    this.ctx = this.canvas?.getContext('2d') || null;

    // 添加样式
    this.injectStyles();
  }

  private createToolbar(): string {
    return `
      <div class="spv-toolbar">
        <div class="spv-toolbar-group">
          <button class="spv-btn" data-action="toggle-thumbnails" title="切换缩略图">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </button>
        </div>
        <div class="spv-toolbar-group">
          <button class="spv-btn" data-action="prev-page" title="上一页">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span class="spv-page-info">
            <input type="number" class="spv-page-input" value="1" min="1"> / 
            <span class="spv-page-count">0</span>
          </span>
          <button class="spv-btn" data-action="next-page" title="下一页">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
        <div class="spv-toolbar-separator"></div>
        <div class="spv-toolbar-group">
          <button class="spv-btn" data-action="zoom-out" title="缩小">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <span class="spv-zoom-info">100%</span>
          <button class="spv-btn" data-action="zoom-in" title="放大">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <button class="spv-btn" data-action="fit-width" title="适应宽度">适应宽度</button>
          <button class="spv-btn" data-action="fit-page" title="适应页面">适应页面</button>
        </div>
        ${this.createAdditionalButtons()}
      </div>
    `;
  }

  private createAdditionalButtons(): string {
    let buttons = '';
    
    if (this.options.enablePrint !== false) {
      buttons += `
        <div class="spv-toolbar-separator"></div>
        <button class="spv-btn" data-action="print" title="打印">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
        </button>
      `;
    }

    if (this.options.enableDownload !== false) {
      buttons += `
        <button class="spv-btn" data-action="download" title="下载">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
      `;
    }

    return buttons;
  }

  private createThumbnailsPanel(): string {
    return `
      <aside class="spv-thumbnails ${!this.thumbnailsVisible ? 'hidden' : ''}">
        <div class="spv-thumbnails-header">
          <h3>页面缩略图</h3>
        </div>
        <div class="spv-thumbnails-container"></div>
      </aside>
    `;
  }

  private setupEventListeners(): void {
    // 工具栏按钮事件
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('[data-action]') as HTMLElement;
      if (btn) {
        const action = btn.dataset.action;
        this.handleAction(action);
      }
    });

    // 页码输入
    const pageInput = this.container.querySelector('.spv-page-input') as HTMLInputElement;
    pageInput?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      this.goToPage(parseInt(target.value));
    });

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
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
    });
  }

  private handleAction(action: string | undefined): void {
    switch(action) {
      case 'toggle-thumbnails':
        this.toggleThumbnails();
        break;
      case 'prev-page':
        this.previousPage();
        break;
      case 'next-page':
        this.nextPage();
        break;
      case 'zoom-in':
        this.zoomIn();
        break;
      case 'zoom-out':
        this.zoomOut();
        break;
      case 'fit-width':
        this.fitToWidth();
        break;
      case 'fit-page':
        this.fitToPage();
        break;
      case 'print':
        this.print();
        break;
      case 'download':
        this.download();
        break;
    }
  }

  public async loadPDF(source: string | ArrayBuffer | Uint8Array): Promise<void> {
    try {
      this.showStatus('正在加载 PDF...');
      this.emit('loading', { source });

      const loadingTask = pdfjsLib.getDocument(source);
      this.pdfDoc = await loadingTask.promise;
      this.totalPages = this.pdfDoc.numPages;

      // 更新页数显示
      const pageCount = this.container.querySelector('.spv-page-count');
      if (pageCount) pageCount.textContent = String(this.totalPages);

      // 渲染第一页
      await this.renderPage(1);

      // 生成缩略图
      if (this.options.showThumbnails !== false) {
        this.generateThumbnails();
      }

      this.emit('loaded', { totalPages: this.totalPages });
      this.hideStatus();

    } catch (error) {
      this.showStatus('加载 PDF 失败: ' + (error as Error).message);
      this.emit('error', error);
    }
  }

  private async renderPage(num: number): Promise<void> {
    if (!this.pdfDoc || !this.canvas || !this.ctx) return;

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

      await page.render(renderContext).promise;

      this.pageRendering = false;
      this.currentPage = num;

      if (this.pageNumPending !== null) {
        this.renderPage(this.pageNumPending);
        this.pageNumPending = null;
      }

      // 更新页码输入框
      const pageInput = this.container.querySelector('.spv-page-input') as HTMLInputElement;
      if (pageInput) pageInput.value = String(num);

      // 更新活动缩略图
      this.updateActiveThumbnail();

      this.emit('pageChanged', { currentPage: num, totalPages: this.totalPages });

    } catch (error) {
      this.pageRendering = false;
      this.emit('error', error);
    }
  }

  private queueRenderPage(num: number): void {
    if (this.pageRendering) {
      this.pageNumPending = num;
    } else {
      this.renderPage(num);
    }
  }

  public previousPage(): void {
    if (this.currentPage <= 1) return;
    this.currentPage--;
    this.queueRenderPage(this.currentPage);
  }

  public nextPage(): void {
    if (this.currentPage >= this.totalPages) return;
    this.currentPage++;
    this.queueRenderPage(this.currentPage);
  }

  public goToPage(pageNum: number): void {
    if (pageNum < 1 || pageNum > this.totalPages) return;
    this.currentPage = pageNum;
    this.queueRenderPage(this.currentPage);
  }

  public zoomIn(): void {
    this.scale = Math.min(this.scale * 1.2, 5.0);
    this.updateZoomDisplay();
    this.queueRenderPage(this.currentPage);
  }

  public zoomOut(): void {
    this.scale = Math.max(this.scale * 0.8, 0.25);
    this.updateZoomDisplay();
    this.queueRenderPage(this.currentPage);
  }

  public fitToWidth(): void {
    // 简化实现
    this.scale = 1.0;
    this.updateZoomDisplay();
    this.queueRenderPage(this.currentPage);
  }

  public fitToPage(): void {
    // 简化实现
    this.scale = 0.8;
    this.updateZoomDisplay();
    this.queueRenderPage(this.currentPage);
  }

  public print(): void {
    if (this.pdfDoc) {
      window.print();
      this.emit('print');
    }
  }

  public download(): void {
    this.emit('download');
  }

  public setTheme(theme: 'light' | 'dark' | 'sepia'): void {
    const wrapper = this.container.querySelector('.spv-wrapper') as HTMLElement;
    if (wrapper) {
      wrapper.setAttribute('data-theme', theme);
      this.emit('themeChanged', { theme });
    }
  }

  private toggleThumbnails(): void {
    const panel = this.container.querySelector('.spv-thumbnails');
    if (panel) {
      panel.classList.toggle('hidden');
      this.thumbnailsVisible = !panel.classList.contains('hidden');
      this.emit('thumbnailsToggled', { visible: this.thumbnailsVisible });
    }
  }

  private async generateThumbnails(): Promise<void> {
    if (!this.pdfDoc) return;

    const container = this.container.querySelector('.spv-thumbnails-container');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 1; i <= Math.min(this.totalPages, 50); i++) {
      const page = await this.pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 0.2 });

      const thumbnailItem = document.createElement('div');
      thumbnailItem.className = 'spv-thumbnail-item';
      if (i === this.currentPage) {
        thumbnailItem.classList.add('active');
      }

      const canvas = document.createElement('canvas');
      canvas.className = 'spv-thumbnail-canvas';
      const context = canvas.getContext('2d');
      if (!context) continue;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;

      const label = document.createElement('div');
      label.className = 'spv-thumbnail-label';
      label.textContent = `页 ${i}`;

      thumbnailItem.appendChild(canvas);
      thumbnailItem.appendChild(label);
      thumbnailItem.addEventListener('click', () => this.goToPage(i));

      container.appendChild(thumbnailItem);
    }
  }

  private updateActiveThumbnail(): void {
    const thumbnails = this.container.querySelectorAll('.spv-thumbnail-item');
    thumbnails.forEach((thumb, index) => {
      if (index + 1 === this.currentPage) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });
  }

  private updateZoomDisplay(): void {
    const zoomInfo = this.container.querySelector('.spv-zoom-info');
    if (zoomInfo) {
      zoomInfo.textContent = Math.round(this.scale * 100) + '%';
    }
  }

  private showStatus(message: string): void {
    const status = this.container.querySelector('.spv-status') as HTMLElement;
    if (status) {
      status.textContent = message;
      status.style.display = 'block';
    }
  }

  private hideStatus(): void {
    const status = this.container.querySelector('.spv-status') as HTMLElement;
    if (status) {
      status.style.display = 'none';
    }
  }

  private applyTheme(theme: 'light' | 'dark' | 'sepia'): void {
    const wrapper = this.container.querySelector('.spv-wrapper') as HTMLElement;
    if (wrapper) {
      wrapper.setAttribute('data-theme', theme);
    }
  }

  private injectStyles(): void {
    const styleId = 'simple-pdf-viewer-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .spv-wrapper {
        height: 100%;
        display: flex;
        flex-direction: column;
        --spv-bg: #f5f5f5;
        --spv-toolbar-bg: #ffffff;
        --spv-toolbar-border: #e0e0e0;
        --spv-btn-bg: transparent;
        --spv-btn-hover: #f0f0f0;
        --spv-btn-active: #e0e0e0;
        --spv-text: #333333;
        --spv-border: #ddd;
        --spv-thumbnails-bg: #fafafa;
        --spv-thumbnail-active: #646cff;
      }

      .spv-wrapper[data-theme="dark"] {
        --spv-bg: #1e1e1e;
        --spv-toolbar-bg: #2d2d2d;
        --spv-toolbar-border: #444;
        --spv-btn-hover: #3a3a3a;
        --spv-btn-active: #4a4a4a;
        --spv-text: #e0e0e0;
        --spv-border: #444;
        --spv-thumbnails-bg: #252525;
        --spv-thumbnail-active: #7480ff;
      }

      .spv-wrapper[data-theme="sepia"] {
        --spv-bg: #f4ecd8;
        --spv-toolbar-bg: #ede0c8;
        --spv-toolbar-border: #d4c4a8;
        --spv-btn-hover: #e4d4b8;
        --spv-btn-active: #d4c4a8;
        --spv-text: #5c4b37;
        --spv-border: #d4c4a8;
        --spv-thumbnails-bg: #ede0c8;
        --spv-thumbnail-active: #8b7355;
      }

      .spv-toolbar {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: var(--spv-toolbar-bg);
        border-bottom: 1px solid var(--spv-toolbar-border);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .spv-toolbar-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .spv-btn {
        padding: 0.5rem;
        background: var(--spv-btn-bg);
        color: var(--spv-text);
        border: 1px solid transparent;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
      }

      .spv-btn:hover {
        background: var(--spv-btn-hover);
        border-color: var(--spv-border);
      }

      .spv-btn:active {
        background: var(--spv-btn-active);
      }

      .spv-btn svg {
        width: 20px;
        height: 20px;
      }

      .spv-toolbar-separator {
        width: 1px;
        height: 24px;
        background: var(--spv-border);
        margin: 0 0.5rem;
      }

      .spv-page-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--spv-text);
        font-size: 0.9rem;
      }

      .spv-page-input {
        width: 50px;
        padding: 0.25rem 0.5rem;
        border: 1px solid var(--spv-border);
        background: var(--spv-toolbar-bg);
        color: var(--spv-text);
        border-radius: 4px;
        text-align: center;
        font-size: 0.9rem;
      }

      .spv-zoom-info {
        min-width: 60px;
        text-align: center;
        color: var(--spv-text);
        font-size: 0.9rem;
      }

      .spv-body {
        flex: 1;
        display: flex;
        overflow: hidden;
        background: var(--spv-bg);
      }

      .spv-thumbnails {
        width: 200px;
        background: var(--spv-thumbnails-bg);
        border-right: 1px solid var(--spv-border);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: margin-left 0.3s;
      }

      .spv-thumbnails.hidden {
        margin-left: -200px;
      }

      .spv-thumbnails-header {
        padding: 1rem;
        border-bottom: 1px solid var(--spv-border);
        background: var(--spv-toolbar-bg);
      }

      .spv-thumbnails-header h3 {
        font-size: 0.9rem;
        color: var(--spv-text);
        margin: 0;
      }

      .spv-thumbnails-container {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .spv-thumbnail-item {
        cursor: pointer;
        border: 2px solid transparent;
        border-radius: 4px;
        overflow: hidden;
        transition: all 0.2s;
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .spv-thumbnail-item:hover {
        border-color: var(--spv-border);
        transform: translateX(5px);
      }

      .spv-thumbnail-item.active {
        border-color: var(--spv-thumbnail-active);
        box-shadow: 0 2px 8px rgba(100, 108, 255, 0.3);
      }

      .spv-thumbnail-canvas {
        width: 100%;
        height: auto;
        display: block;
      }

      .spv-thumbnail-label {
        text-align: center;
        padding: 0.5rem;
        font-size: 0.85rem;
        color: var(--spv-text);
        background: var(--spv-thumbnails-bg);
      }

      .spv-content {
        flex: 1;
        overflow: auto;
        position: relative;
        background: var(--spv-bg);
        display: flex;
        justify-content: center;
        padding: 2rem;
      }

      .spv-canvas {
        max-width: 100%;
        height: auto;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        background: white;
      }

      .spv-status {
        display: none;
        padding: 1rem;
        background: #f0ad4e;
        color: white;
        text-align: center;
      }

      .spv-text-layer {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        overflow: hidden;
        opacity: 0.2;
        line-height: 1.0;
      }
    `;
    document.head.appendChild(style);
  }

  public destroy(): void {
    this.pdfDoc = null;
    this.container.innerHTML = '';
  }
}

export default SimplePDFViewer;