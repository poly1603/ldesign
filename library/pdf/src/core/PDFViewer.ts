import { EventEmitter } from './EventEmitter';
import { PDFRenderer } from './PDFRenderer';
import { SearchManager } from '../features/SearchManager';
import { ToolbarManager } from '../ui/ToolbarManager';
import { SidebarManager } from '../ui/SidebarManager';
import type {
  PDFViewerOptions,
  PDFDocumentProxy,
  ViewerState,
  SearchResult,
  SearchOptions
} from '../types';

export class PDFViewer extends EventEmitter implements PDFViewer {
  public options: PDFViewerOptions;
  public state: ViewerState;
  public document: PDFDocumentProxy | null = null;

  private container: HTMLElement;
  private viewerContainer: HTMLElement | null = null;
  private renderer: PDFRenderer;
  private searchManager: SearchManager | null = null;
  private toolbarManager: ToolbarManager | null = null;
  private sidebarManager: SidebarManager | null = null;
  private canvasContainer: HTMLElement | null = null;
  private textLayerContainer: HTMLElement | null = null;
  private annotationLayerContainer: HTMLElement | null = null;
  private currentCanvas: HTMLCanvasElement | null = null;
  private isInitialized: boolean = false;

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
   * Render the current page
   */
  private async renderCurrentPage(): Promise<void> {
    if (!this.document || !this.canvasContainer) {
      return;
    }

    try {
      // Create or reuse canvas
      if (!this.currentCanvas) {
        this.currentCanvas = document.createElement('canvas');
        this.currentCanvas.className = 'pdf-canvas';
        this.canvasContainer.appendChild(this.currentCanvas);
      }

      // Render page
      await this.renderer.renderPage(this.state.currentPage, this.currentCanvas, {
        scale: this.state.scale,
        rotation: this.state.rotation,
        background: '#ffffff',
        renderTextLayer: this.options.textLayerMode !== 0,
        renderAnnotations: this.options.annotationMode !== 0
      });

      // Render text layer if enabled
      if (this.options.textLayerMode !== 0 && this.textLayerContainer) {
        await this.renderer.renderTextLayer(
          this.state.currentPage,
          this.textLayerContainer,
          this.state.scale,
          this.state.rotation
        );
      }

      // Render annotations if enabled
      if (this.options.annotationMode !== 0 && this.annotationLayerContainer) {
        await this.renderer.renderAnnotations(
          this.state.currentPage,
          this.annotationLayerContainer,
          this.state.scale,
          this.state.rotation
        );
      }

      this.emit('page-rendered', this.state.currentPage);
    } catch (error) {
      this.handleError(error as Error);
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
    this.renderCurrentPage();
    
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
    this.state.pageMode = mode;
    this.renderCurrentPage();
    this.emit('page-mode-change', mode);
  }

  /**
   * Feature methods
   */
  print(): void {
    if (!this.options.enablePrint) {
      return;
    }

    window.print();
    
    this.emit('print');
    
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

  addAnnotation(annotation: any): void {
    // Implementation for adding annotations
    this.emit('annotation-add', annotation);
  }

  removeAnnotation(id: string): void {
    // Implementation for removing annotations
    this.emit('annotation-remove', id);
  }

  getAnnotations(pageNumber?: number): any[] {
    // Implementation for getting annotations
    return [];
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