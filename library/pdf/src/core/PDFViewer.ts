import { EventEmitter } from './EventEmitter';
import { PDFRenderer } from './PDFRenderer';
import { SearchManager } from '../features/SearchManager';
import { AnnotationManager } from '../features/AnnotationManager';
import { BookmarkManager } from '../features/BookmarkManager';
import { PrintManager } from '../features/PrintManager';
import { ToolbarManager } from '../ui/ToolbarManager';
import { SidebarManager } from '../ui/SidebarManager';
import type {
  PDFViewerOptions,
  PDFDocumentProxy,
  ViewerState,
  SearchResult,
  SearchOptions,
  Annotation,
  Bookmark,
  PrintOptions
} from '../types';

export class PDFViewer extends EventEmitter implements PDFViewer {
  public options: PDFViewerOptions;
  public state: ViewerState;
  public document: PDFDocumentProxy | null = null;
  public container: HTMLElement;
  private viewerContainer: HTMLElement | null = null;
  private renderer: PDFRenderer;
  private searchManager: SearchManager | null = null;
  private annotationManager: AnnotationManager | null = null;
  private bookmarkManager: BookmarkManager | null = null;
  private printManager: PrintManager | null = null;
  private toolbarManager: ToolbarManager | null = null;
  private sidebarManager: SidebarManager | null = null;
  private canvasContainer: HTMLElement | null = null;
  private textLayerContainer: HTMLElement | null = null;
  private annotationLayerContainer: HTMLElement | null = null;
  private currentCanvas: HTMLCanvasElement | null = null;
  private pageCanvases: Map<number, HTMLCanvasElement> = new Map();
  private isInitialized: boolean = false;
  private scrollTimeout: NodeJS.Timeout | null = null;

  constructor(options: PDFViewerOptions) {
    super();
    this.options = this.mergeOptions(options);
    this.container = this.getContainer(options.container);
    this.renderer = new PDFRenderer();
    
    this.state = {
      currentPage: 1,
      totalPages: 0,
      scale: this.getInitialScale(),
      rotation: options.rotation || 0,
      pageMode: options.pageMode || 'single',
      isFullscreen: false,
      isSearchOpen: false,
      isSidebarOpen: options.sidebar !== false
    };
  }

  /**
   * Initialize the viewer
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Setup viewer structure
      this.setupViewerStructure();
      
      // Initialize components
      if (this.options.toolbar !== false) {
        this.toolbarManager = new ToolbarManager(this, this.options.toolbar);
      }
      
      if (this.options.sidebar !== false) {
        this.sidebarManager = new SidebarManager(this, this.options.sidebar);
      }
      
      if (this.options.enableSearch) {
        this.searchManager = new SearchManager(this);
      }

      if (this.options.enableAnnotations) {
        this.annotationManager = new AnnotationManager(this);
      }

      if (this.options.enableBookmarks !== false) {
        this.bookmarkManager = new BookmarkManager(this);
      }

      if (this.options.enablePrint) {
        this.printManager = new PrintManager(this);
      }

      // Setup event listeners
      this.setupEventListeners();

      // Load initial document if provided
      if (this.options.url || this.options.data) {
        await this.loadDocument(this.options.url || this.options.data!);
      }

      this.isInitialized = true;
      this.emit('init', this);
      
      if (this.options.onInit) {
        this.options.onInit(this);
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Load a PDF document
   */
  async loadDocument(source: string | ArrayBuffer | Uint8Array): Promise<void> {
    try {
      this.emit('loading-start');
      
      const loadOptions = {
        password: this.options.password,
        withCredentials: this.options.withCredentials,
        cMapUrl: this.options.cMapUrl,
        cMapPacked: this.options.cMapPacked,
        standardFontDataUrl: this.options.standardFontDataUrl,
        onProgress: (loaded: number, total: number) => {
          this.emit('progress', loaded, total);
          if (this.options.onProgress) {
            this.options.onProgress(loaded, total);
          }
        }
      };

      // Handle password-protected PDFs
      if (!loadOptions.password && this.options.onPasswordRequired) {
        loadOptions.password = await this.options.onPasswordRequired();
      }

      this.document = await this.renderer.loadDocument(source, loadOptions);
      this.state.totalPages = this.document.numPages;
      this.state.currentPage = 1;

      // Emit page-change event to update toolbar with initial page and total pages
      this.emit('page-change', this.state.currentPage, this.state.totalPages);

      // Render first page
      await this.renderCurrentPage();

      // Generate thumbnails if sidebar is enabled
      if (this.sidebarManager && this.options.enableThumbnails !== false) {
        this.sidebarManager.generateThumbnails();
      }

      this.emit('document-loaded', this.document);
      
      if (this.options.onDocumentLoad) {
        this.options.onDocumentLoad(this.document);
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Render the current page(s) based on mode
   */
  private async renderCurrentPage(): Promise<void> {
    if (!this.document || !this.canvasContainer) {
      return;
    }

    try {
      if (this.state.pageMode === 'continuous') {
        // Render all pages in continuous mode
        await this.renderAllPages();
      } else {
        // Render single page
        await this.renderSinglePage(this.state.currentPage);
      }

      this.emit('page-rendered', this.state.currentPage);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Render a single page
   */
  private async renderSinglePage(pageNumber: number): Promise<void> {
    if (!this.document || !this.canvasContainer) {
      return;
    }

    // Clear previous content in single page mode
    this.canvasContainer.innerHTML = '';
    this.pageCanvases.clear();

    const canvas = document.createElement('canvas');
    canvas.className = 'pdf-canvas';
    canvas.dataset.pageNumber = pageNumber.toString();
    this.canvasContainer.appendChild(canvas);
    this.currentCanvas = canvas;
    this.pageCanvases.set(pageNumber, canvas);

    await this.renderer.renderPage(pageNumber, canvas, {
      scale: this.state.scale,
      rotation: this.state.rotation,
      background: '#ffffff',
      renderTextLayer: this.options.textLayerMode !== 0,
      renderAnnotations: this.options.annotationMode !== 0
    });
  }

  /**
   * Render all pages in continuous mode
   */
  private async renderAllPages(): Promise<void> {
    if (!this.document || !this.canvasContainer) {
      return;
    }

    // Clear and setup for continuous mode
    if (this.pageCanvases.size === 0) {
      this.canvasContainer.innerHTML = '';
      
      // Create all page containers
      for (let i = 1; i <= this.state.totalPages; i++) {
        const pageWrapper = document.createElement('div');
        pageWrapper.className = 'pdf-page-wrapper';
        pageWrapper.dataset.pageNumber = i.toString();
        
        const canvas = document.createElement('canvas');
        canvas.className = 'pdf-canvas';
        canvas.dataset.pageNumber = i.toString();
        
        pageWrapper.appendChild(canvas);
        this.canvasContainer.appendChild(pageWrapper);
        this.pageCanvases.set(i, canvas);
        
        // Render each page
        this.renderer.renderPage(i, canvas, {
          scale: this.state.scale,
          rotation: this.state.rotation,
          background: '#ffffff',
          renderTextLayer: this.options.textLayerMode !== 0,
          renderAnnotations: this.options.annotationMode !== 0
        });
      }
    } else {
      // Re-render existing pages with new scale
      for (const [pageNum, canvas] of this.pageCanvases) {
        await this.renderer.renderPage(pageNum, canvas, {
          scale: this.state.scale,
          rotation: this.state.rotation,
          background: '#ffffff',
          renderTextLayer: this.options.textLayerMode !== 0,
          renderAnnotations: this.options.annotationMode !== 0
        });
      }
    }
  }

  /**
   * Navigation methods
   */
  nextPage(): void {
    if (this.state.currentPage < this.state.totalPages) {
      this.goToPage(this.state.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.state.currentPage > 1) {
      this.goToPage(this.state.currentPage - 1);
    }
  }

  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.state.totalPages) {
      return;
    }

    this.state.currentPage = pageNumber;
    
    if (this.state.pageMode === 'continuous') {
      // In continuous mode, scroll to the page
      this.scrollToPage(pageNumber);
    } else {
      // In single page mode, render the page
      this.renderCurrentPage();
    }
    
    this.emit('page-change', pageNumber, this.state.totalPages);
    
    if (this.options.onPageChange) {
      this.options.onPageChange(pageNumber, this.state.totalPages);
    }
  }

  firstPage(): void {
    this.goToPage(1);
  }

  lastPage(): void {
    this.goToPage(this.state.totalPages);
  }

  /**
   * View control methods
   */
  zoomIn(): void {
    this.setScale(this.state.scale * 1.25);
  }

  zoomOut(): void {
    this.setScale(this.state.scale * 0.8);
  }

  setScale(scale: number | string): void {
    let newScale: number;

    if (typeof scale === 'string') {
      switch (scale) {
        case 'page-fit':
          newScale = this.calculatePageFitScale();
          break;
        case 'page-width':
          newScale = this.calculatePageWidthScale();
          break;
        case 'page-height':
          newScale = this.calculatePageHeightScale();
          break;
        case 'auto':
          newScale = this.calculateAutoScale();
          break;
        default:
          newScale = parseFloat(scale) || 1;
      }
    } else {
      newScale = scale;
    }

    // Apply min/max constraints
    const minScale = this.options.minScale || 0.25;
    const maxScale = this.options.maxScale || 4;
    newScale = Math.min(Math.max(newScale, minScale), maxScale);

    if (newScale !== this.state.scale) {
      this.state.scale = newScale;
      this.renderCurrentPage();
      
      this.emit('scale-change', newScale);
      
      if (this.options.onScaleChange) {
        this.options.onScaleChange(newScale);
      }
    }
  }

  rotate(angle: number = 90): void {
    this.state.rotation = (this.state.rotation + angle) % 360;
    this.renderCurrentPage();
    this.emit('rotation-change', this.state.rotation);
  }

  setPageMode(mode: 'single' | 'continuous' | 'book'): void {
    if (this.state.pageMode === mode) {
      return;
    }
    
    this.state.pageMode = mode;
    this.pageCanvases.clear();
    
    // Update the data-page-mode attribute on the viewer container
    if (this.viewerContainer) {
      this.viewerContainer.setAttribute('data-page-mode', mode);
    }
    
    // Setup scroll listener for continuous mode
    if (mode === 'continuous' && this.canvasContainer) {
      this.canvasContainer.addEventListener('scroll', this.handleScroll.bind(this));
    } else if (this.canvasContainer) {
      this.canvasContainer.removeEventListener('scroll', this.handleScroll.bind(this));
    }
    
    this.renderCurrentPage();
    this.emit('page-mode-change', mode);
  }

  /**
   * Feature methods
   */
  print(options?: PrintOptions): void {
    if (!this.printManager) {
      console.warn('Print manager not initialized');
      return;
    }

    this.printManager.print(options);
    
    if (this.options.onPrint) {
      this.options.onPrint();
    }
  }

  download(filename?: string): void {
    if (!this.options.enableDownload || !this.options.url) {
      return;
    }

    const link = document.createElement('a');
    link.href = this.options.url;
    link.download = filename || 'document.pdf';
    link.click();
    
    this.emit('download');
    
    if (this.options.onDownload) {
      this.options.onDownload();
    }
  }

  toggleFullscreen(): void {
    if (!this.options.enableFullscreen) {
      return;
    }

    if (!this.state.isFullscreen) {
      this.container.requestFullscreen();
      this.state.isFullscreen = true;
    } else {
      document.exitFullscreen();
      this.state.isFullscreen = false;
    }
    
    this.emit('fullscreen-change', this.state.isFullscreen);
  }

  toggleSidebar(): void {
    this.state.isSidebarOpen = !this.state.isSidebarOpen;
    
    if (this.sidebarManager) {
      this.sidebarManager.toggle();
    }
    
    this.emit('sidebar-toggle', this.state.isSidebarOpen);
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    if (!this.searchManager) {
      return [];
    }

    const results = await this.searchManager.search(query, options);
    
    if (this.options.onSearch) {
      this.options.onSearch(query, results);
    }
    
    return results;
  }

  clearSearch(): void {
    if (this.searchManager) {
      this.searchManager.clear();
    }
  }

  /**
   * Text and annotation methods
   */
  getSelectedText(): string {
    return window.getSelection()?.toString() || '';
  }

  addAnnotation(annotation: Omit<Annotation, 'id' | 'createdAt'>): Annotation | null {
    if (!this.annotationManager) {
      console.warn('Annotation manager not initialized');
      return null;
    }
    return this.annotationManager.addAnnotation(annotation);
  }

  removeAnnotation(id: string): void {
    if (!this.annotationManager) {
      console.warn('Annotation manager not initialized');
      return;
    }
    this.annotationManager.removeAnnotation(id);
  }

  getAnnotations(pageNumber?: number): Annotation[] {
    if (!this.annotationManager) {
      return [];
    }
    return pageNumber 
      ? this.annotationManager.getPageAnnotations(pageNumber)
      : this.annotationManager.getAllAnnotations();
  }

  /**
   * Bookmark methods
   */
  addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Bookmark | null {
    if (!this.bookmarkManager) {
      console.warn('Bookmark manager not initialized');
      return null;
    }
    return this.bookmarkManager.addBookmark(bookmark);
  }

  addCurrentPageBookmark(title?: string): Bookmark | null {
    if (!this.bookmarkManager) {
      console.warn('Bookmark manager not initialized');
      return null;
    }
    return this.bookmarkManager.addCurrentPageBookmark(title);
  }

  removeBookmark(id: string): void {
    if (!this.bookmarkManager) {
      console.warn('Bookmark manager not initialized');
      return;
    }
    this.bookmarkManager.removeBookmark(id);
  }

  getBookmarks(): Bookmark[] {
    if (!this.bookmarkManager) {
      return [];
    }
    return this.bookmarkManager.getAllBookmarks();
  }

  goToBookmark(id: string): void {
    if (!this.bookmarkManager) {
      console.warn('Bookmark manager not initialized');
      return;
    }
    this.bookmarkManager.goToBookmark(id);
  }

  /**
   * Advanced methods
   */
  getViewport(): any {
    if (!this.canvasContainer) {
      return null;
    }
    return {
      scrollLeft: this.canvasContainer.scrollLeft,
      scrollTop: this.canvasContainer.scrollTop,
      clientWidth: this.canvasContainer.clientWidth,
      clientHeight: this.canvasContainer.clientHeight
    };
  }

  scrollTo(x: number, y: number): void {
    if (this.canvasContainer) {
      this.canvasContainer.scrollLeft = x;
      this.canvasContainer.scrollTop = y;
    }
  }

  /**
   * Utility methods
   */
  getCurrentPage(): number {
    return this.state.currentPage;
  }

  getTotalPages(): number {
    return this.state.totalPages;
  }

  getScale(): number {
    return this.state.scale;
  }

  getRotation(): number {
    return this.state.rotation;
  }

  isReady(): boolean {
    return this.isInitialized && this.document !== null;
  }

  /**
   * Destroy the viewer
   */
  destroy(): void {
    this.renderer.destroy();
    this.searchManager?.destroy();
    this.annotationManager?.destroy();
    this.bookmarkManager?.destroy();
    this.printManager?.destroy();
    this.toolbarManager?.destroy();
    this.sidebarManager?.destroy();
    
    this.removeAllListeners();
    
    if (this.viewerContainer) {
      this.viewerContainer.remove();
    }
    
    this.isInitialized = false;
    this.emit('destroy');
  }

  /**
   * Private helper methods
   */
  private mergeOptions(options: PDFViewerOptions): PDFViewerOptions {
    const defaults: Partial<PDFViewerOptions> = {
      initialScale: 'auto',
      minScale: 0.25,
      maxScale: 4,
      rotation: 0,
      pageMode: 'single',
      toolbar: true,
      sidebar: true,
      theme: 'light',
      language: 'en',
      enableSearch: true,
      enablePrint: true,
      enableDownload: true,
      enableFullscreen: true,
      enableRotation: true,
      enableZoom: true,
      enablePageNavigation: true,
      enableTextSelection: true,
      enableAnnotations: true,
      enableThumbnails: true,
      enableOutline: true,
      enableHandTool: false,
      renderingMode: 'canvas',
      textLayerMode: 1,
      annotationMode: 1
    };

    return { ...defaults, ...options };
  }

  private getContainer(container: HTMLElement | string): HTMLElement {
    if (typeof container === 'string') {
      const element = document.querySelector(container);
      if (!element) {
        throw new Error(`Container element not found: ${container}`);
      }
      return element as HTMLElement;
    }
    return container;
  }

  private setupViewerStructure(): void {
    // Clear container
    this.container.innerHTML = '';
    
    // Create main viewer container
    this.viewerContainer = document.createElement('div');
    this.viewerContainer.className = 'pdf-viewer';
    this.viewerContainer.setAttribute('data-theme', this.options.theme as string);
    this.viewerContainer.setAttribute('data-page-mode', this.state.pageMode);
    
    // Create canvas container
    this.canvasContainer = document.createElement('div');
    this.canvasContainer.className = 'pdf-canvas-container';
    
    // Create text layer container
    if (this.options.textLayerMode !== 0) {
      this.textLayerContainer = document.createElement('div');
      this.textLayerContainer.className = 'pdf-text-layer';
      this.canvasContainer.appendChild(this.textLayerContainer);
    }
    
    // Create annotation layer container
    if (this.options.annotationMode !== 0) {
      this.annotationLayerContainer = document.createElement('div');
      this.annotationLayerContainer.className = 'pdf-annotation-layer';
      this.canvasContainer.appendChild(this.annotationLayerContainer);
    }
    
    this.viewerContainer.appendChild(this.canvasContainer);
    this.container.appendChild(this.viewerContainer);
  }

  private setupEventListeners(): void {
    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Fullscreen change
    document.addEventListener('fullscreenchange', () => {
      this.state.isFullscreen = !!document.fullscreenElement;
      this.emit('fullscreen-change', this.state.isFullscreen);
    });
    
    // Window resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isReady()) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        this.previousPage();
        break;
      case 'ArrowRight':
        this.nextPage();
        break;
      case '+':
      case '=':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.zoomIn();
        }
        break;
      case '-':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.zoomOut();
        }
        break;
      case '0':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.setScale(1);
        }
        break;
      case 'f':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          if (this.searchManager) {
            this.state.isSearchOpen = !this.state.isSearchOpen;
            this.emit('search-toggle', this.state.isSearchOpen);
          }
        }
        break;
    }
  }

  private handleResize(): void {
    if (this.options.initialScale === 'auto' || 
        this.options.initialScale === 'page-fit' ||
        this.options.initialScale === 'page-width') {
      this.setScale(this.options.initialScale);
    }
  }

  /**
   * Handle scroll event in continuous mode
   */
  private handleScroll(): void {
    if (this.state.pageMode !== 'continuous' || !this.canvasContainer) {
      return;
    }

    // Clear previous timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Debounce scroll event
    this.scrollTimeout = setTimeout(() => {
      const scrollTop = this.canvasContainer!.scrollTop;
      const containerHeight = this.canvasContainer!.clientHeight;
      
      // Find the current visible page
      let currentPage = 1;
      let accumulatedHeight = 0;
      
      const pages = this.canvasContainer!.querySelectorAll('.pdf-page-wrapper');
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        const pageHeight = page.offsetHeight;
        
        if (scrollTop < accumulatedHeight + pageHeight / 2) {
          currentPage = i + 1;
          break;
        }
        
        accumulatedHeight += pageHeight + 20; // 20px gap between pages
      }
      
      // Update current page if changed
      if (currentPage !== this.state.currentPage) {
        this.state.currentPage = currentPage;
        this.emit('page-change', currentPage, this.state.totalPages);
        
        if (this.options.onPageChange) {
          this.options.onPageChange(currentPage, this.state.totalPages);
        }
        
        // Update thumbnail highlight
        if (this.sidebarManager) {
          this.sidebarManager.highlightThumbnail(currentPage);
        }
      }
    }, 100);
  }

  /**
   * Scroll to a specific page in continuous mode
   */
  scrollToPage(pageNumber: number): void {
    if (this.state.pageMode !== 'continuous' || !this.canvasContainer) {
      return;
    }

    const pageElement = this.canvasContainer.querySelector(`[data-page-number="${pageNumber}"]`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private getInitialScale(): number {
    if (typeof this.options.initialScale === 'number') {
      return this.options.initialScale;
    }
    return 1; // Will be calculated on first render
  }

  private calculatePageFitScale(): number {
    // Implementation to calculate scale to fit page
    return 1;
  }

  private calculatePageWidthScale(): number {
    // Implementation to calculate scale to fit width
    return 1;
  }

  private calculatePageHeightScale(): number {
    // Implementation to calculate scale to fit height
    return 1;
  }

  private calculateAutoScale(): number {
    // Implementation to calculate auto scale
    return this.calculatePageWidthScale();
  }

  private handleError(error: Error): void {
    console.error('PDF Viewer Error:', error);
    this.emit('error', error);
    
    if (this.options.onError) {
      this.options.onError(error);
    }
  }
}