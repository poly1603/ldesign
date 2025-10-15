import { EventEmitter } from './EventEmitter';
import { SidebarManager } from '../ui/SidebarManager';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import type { SidebarConfig } from '../types';

export interface PDFViewerOptions {
  container: HTMLElement;
  pdfUrl?: string;
  initialScale?: number;
  fitMode?: 'width' | 'height' | 'page' | 'auto';
  pageMode?: 'single' | 'continuous';
  enableSearch?: boolean;
  enableDownload?: boolean;
  enablePrint?: boolean;
  enableThumbnails?: boolean;
  enableSidebar?: boolean;
  sidebarConfig?: SidebarConfig | boolean;
}

export interface ViewerState {
  currentPage: number;
  totalPages: number;
  scale: number;
  rotation: number;
  isLoading: boolean;
}

/**
 * PDF核心查看器 - 包含缩略图功能
 */
export class PDFViewer extends EventEmitter {
  public container: HTMLElement;
  private mainContainer: HTMLElement | null = null;
  private canvasContainer: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  public document: PDFDocumentProxy | null = null;
  private pdfDoc: PDFDocumentProxy | null = null;
  private currentPageNum: number = 1;
  private pageRendering: boolean = false;
  private pageNumPending: number | null = null;
  private scale: number = 1.5;
  private rotation: number = 0;
  private fitMode: 'width' | 'height' | 'page' | 'auto' = 'auto';
  private pageMode: 'single' | 'continuous' = 'single';
  private options: PDFViewerOptions;
  public sidebarManager: SidebarManager | null = null;
  private scrollTimeout: any = null;
  private allCanvases: HTMLCanvasElement[] = [];

  constructor(options: PDFViewerOptions) {
    super();
    this.options = {
      initialScale: 1.5,
      fitMode: 'auto',
      pageMode: 'single',
      enableSearch: true,
      enableDownload: true,
      enablePrint: true,
      enableThumbnails: true,
      enableSidebar: true,
      sidebarConfig: true,
      ...options
    };
    this.container = options.container;
    this.scale = this.options.initialScale!;
    this.fitMode = this.options.fitMode!;
    this.pageMode = this.options.pageMode || 'single';
    
    this.init();
  }

  /**
   * 初始化查看器
   */
  private init(): void {
    this.setupMainContainer();
    this.setupCanvas();
    this.setupStyles();
    this.setupSidebar();
    
    if (this.options.pdfUrl) {
      this.loadPDF(this.options.pdfUrl);
    }
  }

  /**
   * 设置主容器
   */
  private setupMainContainer(): void {
    // 创建主查看器容器
    const viewerElement = document.createElement('div');
    viewerElement.className = 'pdf-viewer';
    viewerElement.style.cssText = 'width: 100%; height: 100%; display: flex; flex-direction: column;';
    
    // 创建内容区域
    this.mainContainer = document.createElement('div');
    this.mainContainer.className = 'pdf-main';
    this.mainContainer.style.cssText = 'flex: 1; display: flex; overflow: hidden;';
    
    viewerElement.appendChild(this.mainContainer);
    this.container.appendChild(viewerElement);
  }

  /**
   * 设置侧边栏
   */
  private setupSidebar(): void {
    if (this.options.enableSidebar && this.options.enableThumbnails) {
      const config = typeof this.options.sidebarConfig === 'object' 
        ? this.options.sidebarConfig 
        : true;
      
      this.sidebarManager = new SidebarManager(this, config);
    }
  }

  /**
   * 设置Canvas
   */
  private setupCanvas(): void {
    if (!this.mainContainer) return;
    
    // 创建Canvas容器
    this.canvasContainer = document.createElement('div');
    this.canvasContainer.className = 'pdf-canvas-container';
    
    if (this.pageMode === 'continuous') {
      this.canvasContainer.style.cssText = 'flex: 1; overflow-y: auto; display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px; background: #f5f5f5;';
    } else {
      this.canvasContainer.style.cssText = 'flex: 1; overflow: auto; display: flex; justify-content: center; align-items: flex-start; padding: 20px; background: #f5f5f5;';
    }
    
    // 创建Canvas (单页模式)
    if (this.pageMode === 'single') {
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'pdf-canvas';
      this.canvasContainer.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
    }
    
    this.mainContainer.appendChild(this.canvasContainer);
    
    // 添加滚动监听
    this.setupScrollListener();
  }

  /**
   * 设置样式
   */
  private setupStyles(): void {
    const styleId = 'simple-pdf-viewer-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .pdf-canvas-wrapper {
        width: 100%;
        height: 100%;
        overflow: auto;
        background: #f5f5f5;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 20px;
      }
      
      .pdf-canvas {
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        max-width: 100%;
        height: auto;
      }
      
      .pdf-loading {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        font-size: 18px;
        color: #666;
      }
      
      .pdf-error {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: #f44336;
        font-size: 16px;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 加载PDF文档
   */
  async loadPDF(url: string): Promise<void> {
    try {
      this.showLoading();
      
      // 动态导入pdf.js
      const pdfjsLib = await import('pdfjs-dist');
      
      // 设置worker
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      }
      
      // 加载PDF文档
      const loadingTask = pdfjsLib.getDocument(url);
      this.pdfDoc = await loadingTask.promise;
      this.document = this.pdfDoc; // 同步document属性供SidebarManager使用
      
      this.emit('document-loaded', {
        numPages: this.pdfDoc.numPages,
        fingerprint: (this.pdfDoc as any).fingerprint
      });
      
      // 渲染第一页
      await this.renderPage(1);
      
      this.hideLoading();
    } catch (error) {
      this.showError(`Failed to load PDF: ${error}`);
      this.emit('error', error);
    }
  }

  /**
   * 渲染指定页
   */
  private async renderPage(pageNum: number): Promise<void> {
    if (!this.pdfDoc) return;
    
    // 如果是连续模式，渲染所有页面
    if (this.pageMode === 'continuous') {
      await this.renderAllPages();
      this.scrollToPage(pageNum);
      return;
    }
    
    // 单页模式
    if (!this.canvas || !this.ctx) return;
    
    this.pageRendering = true;
    
    try {
      // 获取页面
      const page = await this.pdfDoc.getPage(pageNum);
      
      // 计算缩放
      const scale = this.calculateScale(page);
      const viewport = page.getViewport({ scale, rotation: this.rotation });
      
      // 设置Canvas尺寸
      this.canvas.height = viewport.height;
      this.canvas.width = viewport.width;
      
      // 渲染页面
      const renderContext = {
        canvasContext: this.ctx,
        viewport: viewport
      };
      
      const renderTask = page.render(renderContext);
      await renderTask.promise;
      
      this.pageRendering = false;
      this.currentPageNum = pageNum;
      
      // 更新状态
      this.emit('page-rendered', {
        pageNumber: pageNum,
        totalPages: this.pdfDoc.numPages,
        scale: scale
      });
      
      // 如果有待渲染的页面，继续渲染
      if (this.pageNumPending !== null) {
        const pending = this.pageNumPending;
        this.pageNumPending = null;
        await this.renderPage(pending);
      }
    } catch (error) {
      this.emit('render-error', error);
      this.pageRendering = false;
    }
  }

  /**
   * 计算缩放比例
   */
  private calculateScale(page: PDFPageProxy): number {
    const viewport = page.getViewport({ scale: 1.0 });
    const containerWidth = this.container.clientWidth - 40; // 减去padding
    const containerHeight = this.container.clientHeight - 40;
    
    switch (this.fitMode) {
      case 'width':
        return containerWidth / viewport.width;
      case 'height':
        return containerHeight / viewport.height;
      case 'page':
        return Math.min(
          containerWidth / viewport.width,
          containerHeight / viewport.height
        );
      case 'auto':
      default:
        return this.scale;
    }
  }

  /**
   * 排队渲染页面
   */
  private queueRenderPage(pageNum: number): void {
    if (this.pageRendering) {
      this.pageNumPending = pageNum;
    } else {
      this.renderPage(pageNum);
    }
  }

  /**
   * 上一页
   */
  previousPage(): void {
    if (this.currentPageNum <= 1) return;
    this.currentPageNum--;
    this.queueRenderPage(this.currentPageNum);
    this.emit('page-changed', this.currentPageNum);
  }

  /**
   * 下一页
   */
  nextPage(): void {
    if (!this.pdfDoc || this.currentPageNum >= this.pdfDoc.numPages) return;
    this.currentPageNum++;
    this.queueRenderPage(this.currentPageNum);
    this.emit('page-changed', this.currentPageNum);
  }

  /**
   * 跳转到指定页（支持单页和连续模式）
   */
  goToPage(pageNum: number): void {
    if (!this.pdfDoc) return;

    pageNum = Math.max(1, Math.min(pageNum, this.pdfDoc.numPages));

    if (this.pageMode === 'continuous') {
      // 连续模式：滚动到指定页面
      this.scrollToPage(pageNum);
    } else {
      // 单页模式：重新渲染指定页
      if (pageNum === this.currentPageNum) return;
      this.currentPageNum = pageNum;
      this.queueRenderPage(this.currentPageNum);
      this.emit('page-change', this.currentPageNum);

      // 通知缩略图更新
      if (this.sidebarManager) {
        this.sidebarManager.highlightThumbnail(pageNum);
      }
    }
  }

  /**
   * 放大
   */
  zoomIn(): void {
    this.scale = Math.min(this.scale * 1.2, 5);
    this.fitMode = 'auto';
    this.queueRenderPage(this.currentPageNum);
    this.emit('zoom-changed', this.scale);
  }

  /**
   * 缩小
   */
  zoomOut(): void {
    this.scale = Math.max(this.scale / 1.2, 0.5);
    this.fitMode = 'auto';
    this.queueRenderPage(this.currentPageNum);
    this.emit('zoom-changed', this.scale);
  }

  /**
   * 重置缩放
   */
  resetZoom(): void {
    this.scale = this.options.initialScale!;
    this.fitMode = 'auto';
    this.queueRenderPage(this.currentPageNum);
    this.emit('zoom-changed', this.scale);
  }

  /**
   * 设置缩放
   */
  setZoom(scale: number): void {
    this.scale = Math.max(0.5, Math.min(scale, 5));
    this.fitMode = 'auto';
    this.queueRenderPage(this.currentPageNum);
    this.emit('zoom-changed', this.scale);
  }

  /**
   * 适应宽度
   */
  fitToWidth(): void {
    this.fitMode = 'width';
    this.queueRenderPage(this.currentPageNum);
  }

  /**
   * 适应高度
   */
  fitToHeight(): void {
    this.fitMode = 'height';
    this.queueRenderPage(this.currentPageNum);
  }

  /**
   * 适应页面
   */
  fitToPage(): void {
    this.fitMode = 'page';
    this.queueRenderPage(this.currentPageNum);
  }

  /**
   * 旋转页面
   */
  rotate(degrees: number = 90): void {
    this.rotation = (this.rotation + degrees) % 360;
    this.queueRenderPage(this.currentPageNum);
    this.emit('rotation-changed', this.rotation);
  }

  /**
   * 获取当前页码
   */
  getCurrentPage(): number {
    return this.currentPageNum;
  }

  /**
   * 获取总页数
   */
  getTotalPages(): number {
    return this.pdfDoc ? this.pdfDoc.numPages : 0;
  }

  /**
   * 监听事件(为SidebarManager提供类型安全的on方法)
   */
  on(event: string, handler: Function): void {
    super.on(event, handler);
  }

  /**
   * 设置滚动监听
   */
  private setupScrollListener(): void {
    if (!this.canvasContainer) return;
    
    this.canvasContainer.addEventListener('scroll', () => {
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
      
      this.scrollTimeout = setTimeout(() => {
        if (this.pageMode === 'continuous') {
          this.detectCurrentPage();
        }
      }, 150);
    });
  }

  /**
   * 检测当前可见页面（连续模式）
   */
  private detectCurrentPage(): void {
    if (!this.canvasContainer || this.pageMode !== 'continuous') return;

    const containerRect = this.canvasContainer.getBoundingClientRect();
    const centerY = containerRect.top + containerRect.height / 2;

    const pageWrappers = this.canvasContainer.querySelectorAll('.pdf-page-wrapper');
    let currentPage = 1;

    for (let i = 0; i < pageWrappers.length; i++) {
      const wrapper = pageWrappers[i] as HTMLElement;
      const rect = wrapper.getBoundingClientRect();

      if (rect.top <= centerY && rect.bottom >= centerY) {
        currentPage = i + 1;
        break;
      }
    }

    if (currentPage !== this.currentPageNum) {
      this.currentPageNum = currentPage;
      this.emit('page-change', currentPage);

      // 通知缩略图更新
      if (this.sidebarManager) {
        this.sidebarManager.highlightThumbnail(currentPage);
      }
    }
  }

  /**
   * 滚动到指定页面（连续模式）
   */
  private scrollToPage(pageNumber: number): void {
    if (!this.canvasContainer || this.pageMode !== 'continuous') return;

    const pageWrappers = this.canvasContainer.querySelectorAll('.pdf-page-wrapper');
    if (pageNumber < 1 || pageNumber > pageWrappers.length) return;

    const targetWrapper = pageWrappers[pageNumber - 1] as HTMLElement;
    if (targetWrapper) {
      targetWrapper.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });

      // 更新当前页码
      this.currentPageNum = pageNumber;
      this.emit('page-change', pageNumber);

      // 通知缩略图更新
      if (this.sidebarManager) {
        this.sidebarManager.highlightThumbnail(pageNumber);
      }
    }
  }

  /**
   * 切换页面模式
   */
  setPageMode(mode: 'single' | 'continuous'): void {
    if (this.pageMode === mode) return;
    
    this.pageMode = mode;
    this.rebuildCanvas();
    
    if (this.pdfDoc) {
      if (mode === 'single') {
        this.renderPage(this.currentPageNum);
      } else {
        this.renderAllPages();
      }
    }
    
    this.emit('page-mode-changed', mode);
  }

  /**
   * 重新构建Canvas
   */
  private rebuildCanvas(): void {
    if (this.canvasContainer) {
      this.canvasContainer.remove();
    }
    
    this.allCanvases = [];
    this.setupCanvas();
  }

  /**
   * 渲染所有页面
   */
  async renderAllPages(): Promise<void> {
    if (!this.pdfDoc || !this.canvasContainer) return;
    
    this.canvasContainer.innerHTML = '';
    this.allCanvases = [];
    
    for (let i = 1; i <= this.pdfDoc.numPages; i++) {
      const pageWrapper = document.createElement('div');
      pageWrapper.className = 'pdf-page-wrapper';
      pageWrapper.style.cssText = 'position: relative; margin: 0 auto; background: white; border-radius: 4px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);';
      pageWrapper.dataset.pageNumber = i.toString();
      
      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-canvas';
      canvas.style.cssText = 'display: block; max-width: 100%;';
      
      pageWrapper.appendChild(canvas);
      this.canvasContainer.appendChild(pageWrapper);
      this.allCanvases.push(canvas);
      
      // 异步渲染页面
      this.renderPageToCanvas(i, canvas);
    }
  }

  /**
   * 渲染指定页面到Canvas
   */
  private async renderPageToCanvas(pageNum: number, canvas: HTMLCanvasElement): Promise<void> {
    try {
      const page = await this.pdfDoc!.getPage(pageNum);
      const scale = this.calculateScale(page);
      const viewport = page.getViewport({ scale, rotation: this.rotation });
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await page.render({
          canvasContext: ctx,
          viewport: viewport
        }).promise;
      }
    } catch (error) {
      console.error(`Failed to render page ${pageNum}:`, error);
    }
  }

  /**
   * 搜索文本
   */
  async searchText(query: string): Promise<any[]> {
    if (!this.pdfDoc || !query) return [];
    
    const results = [];
    
    for (let i = 1; i <= this.pdfDoc.numPages; i++) {
      const page = await this.pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .toLowerCase();
      
      if (pageText.includes(query.toLowerCase())) {
        results.push({
          pageNumber: i,
          text: pageText
        });
      }
    }
    
    this.emit('search-completed', { query, results });
    return results;
  }

  /**
   * 下载PDF
   */
  async download(filename?: string): Promise<void> {
    if (!this.pdfDoc) return;
    
    try {
      const data = await this.pdfDoc.getData();
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'document.pdf';
      a.click();
      
      URL.revokeObjectURL(url);
      this.emit('download-completed');
    } catch (error) {
      this.emit('download-error', error);
    }
  }

  /**
   * 打印PDF
   */
  async print(): Promise<void> {
    if (!this.pdfDoc) return;
    
    try {
      // 创建打印iframe
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'absolute';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = 'none';
      document.body.appendChild(printIframe);
      
      const printWindow = printIframe.contentWindow;
      if (!printWindow) return;
      
      // 渲染所有页面到打印窗口
      const printDoc = printWindow.document;
      printDoc.open();
      printDoc.write('<html><head><title>Print</title></head><body>');
      
      for (let i = 1; i <= this.pdfDoc.numPages; i++) {
        const page = await this.pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({
            canvasContext: ctx,
            viewport: viewport
          }).promise;
          
          printDoc.write(`<img src="${canvas.toDataURL()}" style="max-width:100%;page-break-after:always;">`);
        }
      }
      
      printDoc.write('</body></html>');
      printDoc.close();
      
      // 打印
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => {
          document.body.removeChild(printIframe);
        }, 1000);
      }, 500);
      
      this.emit('print-completed');
    } catch (error) {
      this.emit('print-error', error);
    }
  }

  /**
   * 获取当前状态
   */
  getState(): ViewerState {
    return {
      currentPage: this.currentPageNum,
      totalPages: this.pdfDoc?.numPages || 0,
      scale: this.scale,
      rotation: this.rotation,
      isLoading: this.pageRendering
    };
  }

  /**
   * 获取当前页码
   */
  getCurrentPage(): number {
    return this.currentPageNum;
  }

  /**
   * 获取总页数
   */
  getTotalPages(): number {
    return this.pdfDoc?.numPages || 0;
  }

  /**
   * 显示加载中
   */
  private showLoading(): void {
    const loading = document.createElement('div');
    loading.className = 'pdf-loading';
    loading.id = 'pdf-loading';
    loading.innerHTML = 'Loading PDF...';
    this.container.appendChild(loading);
  }

  /**
   * 隐藏加载中
   */
  private hideLoading(): void {
    const loading = document.getElementById('pdf-loading');
    loading?.remove();
  }

  /**
   * 显示错误
   */
  private showError(message: string): void {
    this.hideLoading();
    const error = document.createElement('div');
    error.className = 'pdf-error';
    error.innerHTML = `⚠ ${message}`;
    this.container.appendChild(error);
  }

  /**
   * 销毁查看器
   */
  destroy(): void {
    // 清理侧边栏
    if (this.sidebarManager) {
      this.sidebarManager.destroy();
      this.sidebarManager = null;
    }
    
    // 清理PDF文档
    if (this.pdfDoc) {
      this.pdfDoc.destroy();
      this.pdfDoc = null;
      this.document = null;
    }
    
    // 清理Canvas
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }
    
    // 清理主容器
    if (this.mainContainer) {
      this.mainContainer.remove();
      this.mainContainer = null;
    }
    
    this.ctx = null;
    this.removeAllListeners();
  }
}