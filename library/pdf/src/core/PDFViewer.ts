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
  pageTransition?: {
    enabled?: boolean;
    type?: 'fade' | 'slide' | 'flip' | 'zoom' | 'none';
    duration?: number; // 毫秒
    easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  };
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
  private transitionCanvas: HTMLCanvasElement | null = null;
  private isTransitioning: boolean = false;

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
      pageTransition: {
        enabled: true,
        type: 'fade',
        duration: 300,
        easing: 'ease-in-out'
      },
      ...options
    };
    
    // 合并页面过渡配置
    if (options.pageTransition) {
      this.options.pageTransition = {
        ...this.options.pageTransition,
        ...options.pageTransition
      };
    }
    
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
      this.canvasContainer.style.cssText = `
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding: 20px 20px 40px 20px;
        background: #f5f5f5;
        scroll-behavior: smooth;
      `;
    } else {
      // 单页模式 - 确保内容居中
      this.canvasContainer.style.cssText = `
        flex: 1;
        overflow: auto;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        background: #f5f5f5;
      `;
    }
    
    // 创建Canvas (单页模式)
    if (this.pageMode === 'single') {
      // 创建包装容器用于动画和文本层
      const canvasWrapper = document.createElement('div');
      canvasWrapper.className = 'pdf-canvas-wrapper';
      canvasWrapper.style.cssText = `
        position: relative;
        display: inline-block;
        margin: 0 auto;
      `;
      
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'pdf-canvas';
      this.canvas.style.cssText = `
        display: block;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        margin: 0 auto;
      `;
      
      // 创建过渡用的canvas
      this.transitionCanvas = document.createElement('canvas');
      this.transitionCanvas.className = 'pdf-canvas-transition';
      this.transitionCanvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
        opacity: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      `;
      
      canvasWrapper.appendChild(this.canvas);
      canvasWrapper.appendChild(this.transitionCanvas);
      this.canvasContainer.appendChild(canvasWrapper);
      
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
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
      }
      
      .pdf-canvas {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        max-width: 100%;
        height: auto;
      }
      
      /* 文本层样式 - 关键部分 */
      .textLayer {
        position: absolute;
        text-align: initial;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        overflow: hidden;
        opacity: 0.2;
        line-height: 1;
        -webkit-text-size-adjust: none;
        -moz-text-size-adjust: none;
        text-size-adjust: none;
        forced-color-adjust: none;
        transform-origin: 0% 0%;
        z-index: 2;
        user-select: text;
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
      }
      
      .textLayer span,
      .textLayer br {
        color: transparent;
        position: absolute;
        white-space: pre;
        cursor: text;
        transform-origin: 0% 0%;
      }
      
      /* 文本选中样式 */
      .textLayer ::selection {
        background: rgba(0, 100, 255, 0.3);
      }
      
      .textLayer ::-moz-selection {
        background: rgba(0, 100, 255, 0.3);
      }
      
      /* 高亮效果 */
      .textLayer .highlight {
        margin: -1px;
        padding: 1px;
        background-color: rgba(255, 255, 0, 0.3);
        border-radius: 4px;
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
  private async renderPage(pageNum: number, withTransition: boolean = false): Promise<void> {
    if (!this.pdfDoc) return;
    
    // 如果是连续模式，渲染所有页面
    if (this.pageMode === 'continuous') {
      await this.renderAllPages();
      // 所有页面渲染完成后，滚动到指定页面
      // 使用 requestAnimationFrame 确保 DOM 更新
      requestAnimationFrame(() => {
        if (this.canvasContainer) {
          // 如果是第一页，直接滚动到顶部
          if (pageNum === 1) {
            this.canvasContainer.scrollTop = 0;
            this.currentPageNum = 1;
            this.emit('page-change', 1);
            this.emit('page-changed', 1);
            if (this.sidebarManager) {
              this.sidebarManager.highlightThumbnail(1);
            }
          } else {
            // 其他页面，使用 scrollToPage
            this.scrollToPage(pageNum);
          }
        }
      });
      return;
    }
    
    // 单页模式
    if (!this.canvas || !this.ctx) return;
    
    // 如果需要动画且配置了动画
    const shouldAnimate = withTransition && 
      this.options.pageTransition?.enabled && 
      this.options.pageTransition?.type !== 'none' &&
      !this.isTransitioning &&
      this.currentPageNum !== pageNum;
    
    if (shouldAnimate) {
      await this.renderPageWithTransition(pageNum);
      return;
    }
    
    // 无动画直接渲染
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
      
      // 渲染页面到Canvas
      const renderContext = {
        canvasContext: this.ctx,
        viewport: viewport
      };
      
      const renderTask = page.render(renderContext);
      await renderTask.promise;
      
      // 标记canvas已渲染完成
      this.canvas.classList.add('rendered');
      const wrapper = this.canvas.parentElement;
      if (wrapper && wrapper.classList.contains('pdf-page-wrapper')) {
        wrapper.classList.add('loaded');
      }
      
      // 添加文本层以支持文本选择和复制
      await this.renderTextLayer(page, viewport, this.canvas.parentElement as HTMLElement);
      
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
        await this.renderPage(pending, withTransition);
      }
    } catch (error) {
      this.emit('render-error', error);
      this.pageRendering = false;
    }
  }
  
  /**
   * 带动画的页面渲染
   */
  private async renderPageWithTransition(pageNum: number): Promise<void> {
    if (!this.pdfDoc || !this.canvas || !this.transitionCanvas) return;
    
    this.isTransitioning = true;
    this.pageRendering = true;
    
    try {
      const page = await this.pdfDoc.getPage(pageNum);
      const scale = this.calculateScale(page);
      const viewport = page.getViewport({ scale, rotation: this.rotation });
      
      // 设置过渡canvas尺寸
      this.transitionCanvas.height = viewport.height;
      this.transitionCanvas.width = viewport.width;
      
      // 确保过渡canvas居中
      const wrapper = this.canvas.parentElement;
      if (wrapper) {
        const wrapperRect = wrapper.getBoundingClientRect();
        const canvasLeft = (wrapperRect.width - viewport.width) / 2;
        const canvasTop = (wrapperRect.height - viewport.height) / 2;
        this.transitionCanvas.style.left = `${Math.max(0, canvasLeft)}px`;
        this.transitionCanvas.style.top = `${Math.max(0, canvasTop)}px`;
      }
      
      const transitionCtx = this.transitionCanvas.getContext('2d');
      if (!transitionCtx) return;
      
      // 先在过渡canvas上渲染新页面
      await page.render({
        canvasContext: transitionCtx,
        viewport: viewport
      }).promise;
      
      // 应用动画
      const transition = this.options.pageTransition!;
      const duration = transition.duration || 300;
      const easing = transition.easing || 'ease-in-out';
      const type = transition.type || 'fade';
      
      // 设置动画样式
      this.transitionCanvas.style.transition = `all ${duration}ms ${easing}`;
      this.canvas.style.transition = `all ${duration}ms ${easing}`;
      
      // 根据动画类型设置初始状态
      this.setupTransitionStart(type, pageNum > this.currentPageNum);
      
      // 触发动画
      requestAnimationFrame(() => {
        this.applyTransitionEffect(type, pageNum > this.currentPageNum);
      });
      
      // 等待动画完成
      await new Promise(resolve => setTimeout(resolve, duration));
      
      // 将过渡canvas的内容复制到主canvas
      this.canvas.height = viewport.height;
      this.canvas.width = viewport.width;
      this.ctx!.drawImage(this.transitionCanvas, 0, 0);
      
      // 标记canvas已渲染完成
      this.canvas.classList.add('rendered');
      const canvasWrapper = this.canvas.parentElement;
      if (canvasWrapper && canvasWrapper.classList.contains('pdf-page-wrapper')) {
        canvasWrapper.classList.add('loaded');
      }
      
      // 重置样式
      this.resetTransitionStyles();
      
      this.currentPageNum = pageNum;
      this.isTransitioning = false;
      this.pageRendering = false;
      
      this.emit('page-rendered', {
        pageNumber: pageNum,
        totalPages: this.pdfDoc.numPages,
        scale: scale
      });
      
      // 处理待渲染页面
      if (this.pageNumPending !== null) {
        const pending = this.pageNumPending;
        this.pageNumPending = null;
        await this.renderPage(pending, true);
      }
    } catch (error) {
      this.isTransitioning = false;
      this.pageRendering = false;
      this.emit('render-error', error);
    }
  }
  
  /**
   * 设置过渡动画初始状态
   */
  private setupTransitionStart(type: string, isForward: boolean): void {
    if (!this.canvas || !this.transitionCanvas) return;
    
    // 确保动画时保持居中
    const wrapper = this.canvas.parentElement;
    if (wrapper) {
      wrapper.style.transformStyle = 'preserve-3d';
      wrapper.style.perspective = '1000px';
      wrapper.style.position = 'relative';
    }
    
    switch (type) {
      case 'fade':
        this.transitionCanvas.style.opacity = '0';
        this.transitionCanvas.style.transform = '';
        break;
      case 'slide':
        const offset = isForward ? '100%' : '-100%';
        this.transitionCanvas.style.transform = `translateX(${offset})`;
        this.transitionCanvas.style.opacity = '1';
        break;
      case 'flip':
        this.transitionCanvas.style.transform = 'rotateY(180deg)';
        this.transitionCanvas.style.opacity = '1';
        this.transitionCanvas.style.transformOrigin = 'center center';
        this.canvas.style.transformOrigin = 'center center';
        break;
      case 'zoom':
        this.transitionCanvas.style.transform = 'scale(0.5)';
        this.transitionCanvas.style.opacity = '0';
        this.transitionCanvas.style.transformOrigin = 'center center';
        break;
    }
  }
  
  /**
   * 应用过渡效果
   */
  private applyTransitionEffect(type: string, isForward: boolean): void {
    if (!this.canvas || !this.transitionCanvas) return;
    
    switch (type) {
      case 'fade':
        this.transitionCanvas.style.opacity = '1';
        this.transitionCanvas.style.transform = '';
        this.canvas.style.opacity = '0';
        break;
      case 'slide':
        this.transitionCanvas.style.transform = 'translateX(0)';
        const canvasOffset = isForward ? '-100%' : '100%';
        this.canvas.style.transform = `translateX(${canvasOffset})`;
        this.canvas.style.opacity = '0';
        break;
      case 'flip':
        this.transitionCanvas.style.transform = 'rotateY(0deg)';
        this.canvas.style.transform = 'rotateY(-180deg)';
        this.canvas.style.opacity = '0';
        break;
      case 'zoom':
        this.transitionCanvas.style.transform = 'scale(1)';
        this.transitionCanvas.style.transformOrigin = 'center center';
        this.transitionCanvas.style.opacity = '1';
        this.canvas.style.transform = 'scale(1.5)';
        this.canvas.style.transformOrigin = 'center center';
        this.canvas.style.opacity = '0';
        break;
    }
  }
  
  /**
   * 重置过渡样式
   */
  private resetTransitionStyles(): void {
    if (!this.canvas || !this.transitionCanvas) return;
    
    // 移除过渡
    this.transitionCanvas.style.transition = '';
    this.canvas.style.transition = '';
    
    // 重置样式
    this.transitionCanvas.style.opacity = '0';
    this.transitionCanvas.style.transform = '';
    this.transitionCanvas.style.transformOrigin = '';
    this.canvas.style.opacity = '1';
    this.canvas.style.transform = '';
    this.canvas.style.transformOrigin = '';
    
    // 重置wrapper的3D样式
    const wrapper = this.canvas.parentElement;
    if (wrapper) {
      wrapper.style.transformStyle = '';
      wrapper.style.perspective = '';
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
    
    if (this.pageMode === 'continuous') {
      this.scrollToPage(this.currentPageNum);
    } else {
      this.queueRenderPage(this.currentPageNum);
    }
    
    this.emit('page-change', this.currentPageNum);
    this.emit('page-changed', this.currentPageNum);
  }

  /**
   * 下一页
   */
  nextPage(): void {
    if (!this.pdfDoc || this.currentPageNum >= this.pdfDoc.numPages) return;
    this.currentPageNum++;
    
    if (this.pageMode === 'continuous') {
      this.scrollToPage(this.currentPageNum);
    } else {
      this.queueRenderPage(this.currentPageNum);
    }
    
    this.emit('page-change', this.currentPageNum);
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
      // 单页模式：重新渲染指定页，带动画
      if (pageNum === this.currentPageNum) return;
      
      // 使用动画渲染
      if (this.pageRendering) {
        this.pageNumPending = pageNum;
      } else {
        this.renderPage(pageNum, true); // 启用动画
      }
      
      this.emit('page-change', pageNum);
      this.emit('page-changed', pageNum);

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
      // 计算目标位置
      const containerRect = this.canvasContainer.getBoundingClientRect();
      const wrapperRect = targetWrapper.getBoundingClientRect();
      const currentScroll = this.canvasContainer.scrollTop;
      const targetScroll = currentScroll + (wrapperRect.top - containerRect.top) - 20;
      
      // 平滑滚动到目标位置
      this.canvasContainer.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth'
      });

      // 更新当前页码
      this.currentPageNum = pageNumber;
      this.emit('page-change', pageNumber);
      this.emit('page-changed', pageNumber);

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
    
    const savedPage = this.currentPageNum; // 保存当前页码
    this.pageMode = mode;
    this.rebuildCanvas();
    
    if (this.pdfDoc) {
      if (mode === 'single') {
        this.renderPage(savedPage);
      } else {
        // 渲染所有页面，renderAllPages 现在会等待所有页面完成
        this.renderAllPages().then(() => {
          // 使用 requestAnimationFrame 确保 DOM 更新
          requestAnimationFrame(() => {
            if (this.canvasContainer) {
              // 如果是第一页或者要滚动到第一页，直接设置 scrollTop = 0
              if (savedPage === 1) {
                this.canvasContainer.scrollTop = 0;
                this.currentPageNum = 1;
                this.emit('page-change', 1);
                this.emit('page-changed', 1);
                if (this.sidebarManager) {
                  this.sidebarManager.highlightThumbnail(1);
                }
              } else {
                // 对于其他页面，先重置到顶部，然后滚动到目标页
                this.canvasContainer.scrollTop = 0;
                // 使用 setTimeout 给浏览器时间更新滚动位置
                setTimeout(() => {
                  this.scrollToPage(savedPage);
                }, 50);
              }
            }
          });
        });
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
    
    // 先保存当前滚动位置
    const shouldResetScroll = this.canvasContainer.children.length === 0;
    
    this.canvasContainer.innerHTML = '';
    this.allCanvases = [];
    
    // 收集所有渲染任务
    const renderPromises: Promise<void>[] = [];
    
    for (let i = 1; i <= this.pdfDoc.numPages; i++) {
      const pageWrapper = document.createElement('div');
      pageWrapper.className = 'pdf-page-wrapper';
      pageWrapper.style.cssText = `
        position: relative;
        margin: 0 auto 20px auto;
        border-radius: 4px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        display: block;
        width: fit-content;
        max-width: 100%;
      `;
      pageWrapper.dataset.pageNumber = i.toString();
      
      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-canvas';
      canvas.style.cssText = `
        display: block;
        max-width: 100%;
        height: auto;
      `;
      
      // 添加页码标签
      const pageLabel = document.createElement('div');
      pageLabel.className = 'pdf-page-number';
      pageLabel.style.cssText = `
        position: absolute;
        bottom: 16px;
        right: 16px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
        z-index: 10;
        user-select: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      `;
      pageLabel.textContent = `${i} / ${this.pdfDoc.numPages}`;
      
      pageWrapper.appendChild(canvas);
      pageWrapper.appendChild(pageLabel);
      this.canvasContainer.appendChild(pageWrapper);
      this.allCanvases.push(canvas);
      
      // 收集渲染promise
      renderPromises.push(this.renderPageToCanvas(i, canvas));
    }
    
    // 等待所有页面渲染完成
    await Promise.all(renderPromises);
    
    // 如果是初次渲染，重置滚动位置
    if (shouldResetScroll) {
      this.canvasContainer.scrollTop = 0;
    }
  }

  /**
   * 渲染文本层（支持文本选择和复制）
   */
  private async renderTextLayer(page: PDFPageProxy, viewport: any, container: HTMLElement): Promise<void> {
    try {
      // 移除现有的文本层
      const existingTextLayer = container.querySelector('.textLayer');
      if (existingTextLayer) {
        existingTextLayer.remove();
      }

      // 获取文本内容
      const textContent = await page.getTextContent();
      
      // 创建文本层容器
      const textLayerDiv = document.createElement('div');
      textLayerDiv.className = 'textLayer';
      textLayerDiv.style.position = 'absolute';
      textLayerDiv.style.left = '0';
      textLayerDiv.style.top = '0';
      textLayerDiv.style.right = '0';
      textLayerDiv.style.bottom = '0';
      textLayerDiv.style.overflow = 'hidden';
      textLayerDiv.style.opacity = '0.2';
      textLayerDiv.style.lineHeight = '1';
      
      // 添加到容器
      container.appendChild(textLayerDiv);
      
      // 简单的文本层渲染 - 不使用 PDF.js 的 renderTextLayer
      // 因为它在某些版本中有兼容性问题
      textContent.items.forEach((item: any) => {
        if (item.str && item.str.trim()) {
          const textSpan = document.createElement('span');
          textSpan.textContent = item.str;
          textSpan.style.position = 'absolute';
          textSpan.style.color = 'transparent';
          textSpan.style.whiteSpace = 'pre';
          textSpan.style.cursor = 'text';
          textSpan.style.userSelect = 'text';
          textSpan.style.webkitUserSelect = 'text';
          
          // 计算位置
          const tx = item.transform;
          if (tx) {
            const x = tx[4];
            const y = tx[5];
            textSpan.style.left = `${x}px`;
            textSpan.style.top = `${viewport.height - y}px`;
            textSpan.style.fontSize = `${Math.abs(tx[0])}px`;
          }
          
          textLayerDiv.appendChild(textSpan);
        }
      });
    } catch (error) {
      console.error('Failed to render text layer:', error);
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
        
        // 标记canvas已渲染完成
        canvas.classList.add('rendered');
        
        // 为连续模式的页面也添加文本层
        const pageWrapper = canvas.parentElement;
        if (pageWrapper && pageWrapper.classList.contains('pdf-page-wrapper')) {
          pageWrapper.classList.add('loaded');
          await this.renderTextLayer(page, viewport, pageWrapper);
        }
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
   * 显示加载中
   */
  private showLoading(): void {
    // 先检查是否已经存在loading元素
    if (document.getElementById('pdf-loading')) return;
    
    const loading = document.createElement('div');
    loading.className = 'pdf-loading';
    loading.id = 'pdf-loading';
    loading.innerHTML = '<div class="pdf-spinner"></div>';
    this.container.appendChild(loading);
  }

  /**
   * 隐藏加载中
   */
  private hideLoading(): void {
    const loading = this.container.querySelector('.pdf-loading');
    if (loading) {
      loading.remove();
    }
    // 也尝试通过ID删除
    const loadingById = document.getElementById('pdf-loading');
    if (loadingById) {
      loadingById.remove();
    }
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
   * 获取当前页面模式
   */
  getPageMode(): 'single' | 'continuous' {
    return this.pageMode;
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
