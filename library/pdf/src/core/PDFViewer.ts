import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
import { EventEmitter } from '../utils/EventEmitter';
import { PDFViewerOptions, ViewMode, PDFViewerState } from '../types';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export class PDFViewer extends EventEmitter {
  private container: HTMLElement;
  private options: PDFViewerOptions;
  private pdfDoc: PDFDocumentProxy | null = null;
  private currentPage: number = 1;
  private totalPages: number = 0;
  private scale: number = 1.0;
  private rotation: number = 0;
  private viewMode: ViewMode = 'single';
  private isLoading: boolean = false;
  private renderTask: any = null;
  private canvas: HTMLCanvasElement | null = null;
  private textLayer: HTMLDivElement | null = null;
  private annotationLayer: HTMLDivElement | null = null;
  private searchResults: any[] = [];
  private currentSearchIndex: number = -1;
  private state: PDFViewerState;

  constructor(container: HTMLElement, options: Partial<PDFViewerOptions> = {}) {
    super();
    this.container = container;
    this.options = this.mergeOptions(options);
    this.state = {
      currentPage: 1,
      totalPages: 0,
      scale: this.options.defaultScale || 1.0,
      rotation: 0,
      viewMode: this.options.viewMode || 'single',
      isLoading: false,
      searchActive: false,
      fullscreen: false
    };
    this.init();
  }

  private mergeOptions(options: Partial<PDFViewerOptions>): PDFViewerOptions {
    return {
      defaultScale: 1.0,
      minScale: 0.25,
      maxScale: 5.0,
      viewMode: 'single',
      enableToolbar: true,
      enableNavigation: true,
      enableZoom: true,
      enableSearch: true,
      enablePrint: true,
      enableDownload: true,
      enableFullscreen: true,
      enableRotation: true,
      enableThumbnails: false,
      enableAnnotations: true,
      theme: 'light',
      locale: 'en',
      ...options
    };
  }

  private init(): void {
    this.setupContainer();
    this.createCanvas();
    this.createLayers();
    this.setupEventListeners();
    this.emit('initialized', this.state);
  }

  private setupContainer(): void {
    this.container.classList.add('pdf-viewer-container');
    if (this.options.theme) {
      this.container.setAttribute('data-theme', this.options.theme);
    }
  }

  private createCanvas(): void {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'pdf-viewer-canvas';
    this.container.appendChild(this.canvas);
  }

  private createLayers(): void {
    // Text selection layer
    this.textLayer = document.createElement('div');
    this.textLayer.className = 'pdf-viewer-text-layer';
    this.container.appendChild(this.textLayer);

    // Annotations layer
    if (this.options.enableAnnotations) {
      this.annotationLayer = document.createElement('div');
      this.annotationLayer.className = 'pdf-viewer-annotation-layer';
      this.container.appendChild(this.annotationLayer);
    }
  }

  private setupEventListeners(): void {
    // Keyboard navigation
    document.addEventListener('keydown', this.handleKeydown.bind(this));

    // Mouse wheel zoom
    if (this.options.enableZoom) {
      this.container.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    }

    // Touch gestures for mobile
    let touchStartDistance = 0;
    this.container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        touchStartDistance = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
      }
    });

    this.container.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && touchStartDistance > 0) {
        e.preventDefault();
        const distance = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        const scale = distance / touchStartDistance;
        this.setScale(this.scale * scale);
        touchStartDistance = distance;
      }
    });
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (!this.pdfDoc) return;

    switch (event.key) {
      case 'ArrowLeft':
      case 'PageUp':
        event.preventDefault();
        this.previousPage();
        break;
      case 'ArrowRight':
      case 'PageDown':
        event.preventDefault();
        this.nextPage();
        break;
      case 'Home':
        event.preventDefault();
        this.goToPage(1);
        break;
      case 'End':
        event.preventDefault();
        this.goToPage(this.totalPages);
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
          this.resetZoom();
        }
        break;
    }
  }

  private handleWheel(event: WheelEvent): void {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      this.setScale(this.scale + delta);
    }
  }

  public async loadPDF(source: string | ArrayBuffer | Uint8Array): Promise<void> {
    try {
      this.setLoading(true);
      this.emit('loading', { source });

      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument(source);
      this.pdfDoc = await loadingTask.promise;
      this.totalPages = this.pdfDoc.numPages;
      this.state.totalPages = this.totalPages;

      // Load metadata
      const metadata = await this.pdfDoc.getMetadata();
      this.emit('metadata', metadata);

      // Render first page
      await this.renderPage(this.currentPage);
      
      this.setLoading(false);
      this.emit('loaded', {
        totalPages: this.totalPages,
        metadata
      });
    } catch (error) {
      this.setLoading(false);
      this.emit('error', error);
      throw error;
    }
  }

  private async renderPage(pageNum: number): Promise<void> {
    if (!this.pdfDoc || !this.canvas) return;

    // Cancel any ongoing render task
    if (this.renderTask) {
      await this.renderTask.cancel();
    }

    try {
      const page = await this.pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ 
        scale: this.scale, 
        rotation: this.rotation 
      });

      // Set canvas dimensions
      const context = this.canvas.getContext('2d');
      if (!context) return;

      this.canvas.width = viewport.width;
      this.canvas.height = viewport.height;

      // Clear canvas
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Render PDF page
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      this.renderTask = page.render(renderContext);
      await this.renderTask.promise;

      // Render text layer for selection
      if (this.textLayer) {
        await this.renderTextLayer(page, viewport);
      }

      // Render annotations
      if (this.annotationLayer && this.options.enableAnnotations) {
        await this.renderAnnotations(page, viewport);
      }

      this.emit('pageRendered', { 
        pageNumber: pageNum, 
        scale: this.scale,
        rotation: this.rotation
      });
    } catch (error) {
      if (error instanceof Error && error.name !== 'RenderingCancelledException') {
        this.emit('error', error);
        throw error;
      }
    }
  }

  private async renderTextLayer(page: PDFPageProxy, viewport: any): Promise<void> {
    if (!this.textLayer) return;

    // Clear existing text layer
    this.textLayer.innerHTML = '';
    this.textLayer.style.width = viewport.width + 'px';
    this.textLayer.style.height = viewport.height + 'px';

    // Get text content
    const textContent = await page.getTextContent();
    
    // Render text layer
    pdfjsLib.renderTextLayer({
      textContent: textContent,
      container: this.textLayer,
      viewport: viewport,
      textDivs: []
    });
  }

  private async renderAnnotations(page: PDFPageProxy, viewport: any): Promise<void> {
    if (!this.annotationLayer || !this.pdfDoc) return;

    // Clear existing annotations
    this.annotationLayer.innerHTML = '';
    this.annotationLayer.style.width = viewport.width + 'px';
    this.annotationLayer.style.height = viewport.height + 'px';

    // Get annotations
    const annotations = await page.getAnnotations();
    
    // Render annotation layer
    pdfjsLib.AnnotationLayer.render({
      viewport: viewport.clone({ dontFlip: true }),
      div: this.annotationLayer,
      annotations: annotations,
      page: page,
      linkService: {
        getDestinationHash: (dest: any) => '#',
        getAnchorUrl: (hash: string) => hash,
        navigateTo: (dest: any) => { /* Handle navigation */ }
      }
    });
  }

  // Navigation methods
  public nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  public previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  public goToPage(pageNum: number): void {
    if (pageNum < 1 || pageNum > this.totalPages) return;
    
    this.currentPage = pageNum;
    this.state.currentPage = pageNum;
    this.renderPage(pageNum);
    this.emit('pageChanged', { 
      currentPage: this.currentPage, 
      totalPages: this.totalPages 
    });
  }

  // Zoom methods
  public zoomIn(): void {
    this.setScale(Math.min(this.scale + 0.25, this.options.maxScale));
  }

  public zoomOut(): void {
    this.setScale(Math.max(this.scale - 0.25, this.options.minScale));
  }

  public setScale(scale: number): void {
    const newScale = Math.min(Math.max(scale, this.options.minScale), this.options.maxScale);
    if (newScale !== this.scale) {
      this.scale = newScale;
      this.state.scale = newScale;
      this.renderPage(this.currentPage);
      this.emit('scaleChanged', { scale: this.scale });
    }
  }

  public resetZoom(): void {
    this.setScale(this.options.defaultScale);
  }

  public fitToWidth(): void {
    if (!this.canvas) return;
    const containerWidth = this.container.clientWidth;
    const pageWidth = this.canvas.width / this.scale;
    this.setScale(containerWidth / pageWidth);
  }

  public fitToHeight(): void {
    if (!this.canvas) return;
    const containerHeight = this.container.clientHeight;
    const pageHeight = this.canvas.height / this.scale;
    this.setScale(containerHeight / pageHeight);
  }

  // Rotation methods
  public rotate(angle: number): void {
    this.rotation = (this.rotation + angle) % 360;
    this.state.rotation = this.rotation;
    this.renderPage(this.currentPage);
    this.emit('rotationChanged', { rotation: this.rotation });
  }

  public rotateClockwise(): void {
    this.rotate(90);
  }

  public rotateCounterClockwise(): void {
    this.rotate(-90);
  }

  // Search functionality
  public async search(query: string): Promise<void> {
    if (!this.pdfDoc || !query) return;

    this.searchResults = [];
    this.currentSearchIndex = -1;
    this.state.searchActive = true;

    for (let i = 1; i <= this.totalPages; i++) {
      const page = await this.pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: any) => item.str).join(' ');
      
      const regex = new RegExp(query, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        this.searchResults.push({
          page: i,
          index: match.index,
          text: match[0]
        });
      }
    }

    if (this.searchResults.length > 0) {
      this.currentSearchIndex = 0;
      this.goToPage(this.searchResults[0].page);
      this.highlightSearchResult(this.searchResults[0]);
    }

    this.emit('searchComplete', {
      query,
      results: this.searchResults,
      totalResults: this.searchResults.length
    });
  }

  public nextSearchResult(): void {
    if (this.searchResults.length === 0) return;
    
    this.currentSearchIndex = (this.currentSearchIndex + 1) % this.searchResults.length;
    const result = this.searchResults[this.currentSearchIndex];
    this.goToPage(result.page);
    this.highlightSearchResult(result);
  }

  public previousSearchResult(): void {
    if (this.searchResults.length === 0) return;
    
    this.currentSearchIndex = this.currentSearchIndex - 1;
    if (this.currentSearchIndex < 0) {
      this.currentSearchIndex = this.searchResults.length - 1;
    }
    const result = this.searchResults[this.currentSearchIndex];
    this.goToPage(result.page);
    this.highlightSearchResult(result);
  }

  public clearSearch(): void {
    this.searchResults = [];
    this.currentSearchIndex = -1;
    this.state.searchActive = false;
    this.clearHighlights();
    this.emit('searchCleared');
  }

  private highlightSearchResult(result: any): void {
    // Implementation for highlighting search results in the text layer
    if (!this.textLayer) return;
    
    // Clear previous highlights
    this.clearHighlights();
    
    // Add highlight class to matching text
    const textDivs = this.textLayer.querySelectorAll('span');
    textDivs.forEach(div => {
      if (div.textContent?.toLowerCase().includes(result.text.toLowerCase())) {
        div.classList.add('highlight');
      }
    });
  }

  private clearHighlights(): void {
    if (!this.textLayer) return;
    const highlights = this.textLayer.querySelectorAll('.highlight');
    highlights.forEach(el => el.classList.remove('highlight'));
  }

  // Print functionality
  public async print(): Promise<void> {
    if (!this.pdfDoc) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printDocument = printWindow.document;
    printDocument.write('<html><head><title>Print PDF</title></head><body></body></html>');

    for (let i = 1; i <= this.totalPages; i++) {
      const page = await this.pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });
      
      const canvas = printDocument.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      printDocument.body.appendChild(canvas);
      if (i < this.totalPages) {
        printDocument.body.appendChild(printDocument.createElement('div')).style.pageBreakAfter = 'always';
      }
    }

    printWindow.print();
    printWindow.close();
  }

  // Download functionality
  public async download(filename?: string): Promise<void> {
    if (!this.pdfDoc) return;

    const data = await this.pdfDoc.getData();
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.emit('downloaded', { filename });
  }

  // Fullscreen functionality
  public enterFullscreen(): void {
    if (this.container.requestFullscreen) {
      this.container.requestFullscreen();
    } else if ((this.container as any).webkitRequestFullscreen) {
      (this.container as any).webkitRequestFullscreen();
    } else if ((this.container as any).msRequestFullscreen) {
      (this.container as any).msRequestFullscreen();
    }
    this.state.fullscreen = true;
    this.emit('fullscreenChanged', { fullscreen: true });
  }

  public exitFullscreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
    this.state.fullscreen = false;
    this.emit('fullscreenChanged', { fullscreen: false });
  }

  public toggleFullscreen(): void {
    if (this.state.fullscreen) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }

  // View mode methods
  public setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    this.state.viewMode = mode;
    this.renderPage(this.currentPage);
    this.emit('viewModeChanged', { mode });
  }

  // Theme methods
  public setTheme(theme: 'light' | 'dark'): void {
    this.options.theme = theme;
    this.container.setAttribute('data-theme', theme);
    this.emit('themeChanged', { theme });
  }

  // Utility methods
  private setLoading(loading: boolean): void {
    this.isLoading = loading;
    this.state.isLoading = loading;
    this.container.classList.toggle('loading', loading);
  }

  public getState(): PDFViewerState {
    return { ...this.state };
  }

  public getCurrentPage(): number {
    return this.currentPage;
  }

  public getTotalPages(): number {
    return this.totalPages;
  }

  public getScale(): number {
    return this.scale;
  }

  public destroy(): void {
    // Clean up event listeners
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
    
    // Cancel render task
    if (this.renderTask) {
      this.renderTask.cancel();
    }

    // Clear container
    this.container.innerHTML = '';
    
    // Destroy PDF document
    if (this.pdfDoc) {
      this.pdfDoc.destroy();
      this.pdfDoc = null;
    }

    this.emit('destroyed');
  }
}