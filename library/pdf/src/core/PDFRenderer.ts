import type { 
  PDFDocumentProxy, 
  PDFPageProxy, 
  PDFPageViewport,
  RenderParameters,
  RenderTask
} from '../types';

// Dynamic PDF.js import
let pdfjsLib: any = null;

// Initialize PDF.js
async function initPdfJs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    // Set worker
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }
  return pdfjsLib;
}

export interface RenderOptions {
  scale?: number;
  rotation?: number;
  background?: string;
  renderTextLayer?: boolean;
  renderAnnotations?: boolean;
}

export class PDFRenderer {
  private document: PDFDocumentProxy | null = null;
  private renderTasks: Map<number, RenderTask> = new Map();
  private pageCache: Map<number, PDFPageProxy> = new Map();
  private canvasCache: Map<number, HTMLCanvasElement> = new Map();

  constructor() {
    // PDF.js will be initialized on first use
  }

  /**
   * Load a PDF document
   */
  async loadDocument(source: string | ArrayBuffer | Uint8Array, options?: any): Promise<PDFDocumentProxy> {
    try {
      // Initialize PDF.js if needed
      const pdfjs = await initPdfJs();
      
      // Destroy existing document if any
      if (this.document) {
        await this.destroy();
      }

      // Prepare loading parameters
      const loadingParams: any = {
        ...options
      };

      if (typeof source === 'string') {
        loadingParams.url = source;
      } else {
        loadingParams.data = source;
      }

      // Load the document
      const loadingTask = pdfjs.getDocument(loadingParams);
      
      loadingTask.onProgress = (progress: any) => {
        if (options?.onProgress) {
          options.onProgress(progress.loaded, progress.total);
        }
      };

      this.document = await loadingTask.promise;
      return this.document;
    } catch (error) {
      throw new Error(`Failed to load PDF document: ${error}`);
    }
  }

  /**
   * Get a specific page
   */
  async getPage(pageNumber: number): Promise<PDFPageProxy> {
    if (!this.document) {
      throw new Error('No document loaded');
    }

    if (pageNumber < 1 || pageNumber > this.document.numPages) {
      throw new Error(`Invalid page number: ${pageNumber}`);
    }

    // Check cache first
    if (this.pageCache.has(pageNumber)) {
      return this.pageCache.get(pageNumber)!;
    }

    const page = await this.document.getPage(pageNumber);
    this.pageCache.set(pageNumber, page);
    return page;
  }

  /**
   * Render a page to canvas
   */
  async renderPage(
    pageNumber: number,
    canvas: HTMLCanvasElement,
    options: RenderOptions = {}
  ): Promise<void> {
    const page = await this.getPage(pageNumber);
    
    // Cancel any existing render task for this page
    this.cancelRenderTask(pageNumber);

    const scale = options.scale || 1.5;
    const rotation = options.rotation || 0;
    
    // Get viewport
    const viewport = page.getViewport({ scale, rotation });

    // Prepare canvas
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Set background
    if (options.background) {
      context.fillStyle = options.background;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Render PDF page
    const renderContext: RenderParameters = {
      canvasContext: context,
      viewport: viewport,
      enableWebGL: true,
      renderInteractiveForms: true
    };

    const renderTask = page.render(renderContext);
    this.renderTasks.set(pageNumber, renderTask);

    try {
      await renderTask.promise;
      this.renderTasks.delete(pageNumber);
      this.canvasCache.set(pageNumber, canvas);
    } catch (error: any) {
      if (error.name === 'RenderingCancelledException') {
        console.log(`Rendering cancelled for page ${pageNumber}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Render text layer for a page
   */
  async renderTextLayer(
    pageNumber: number,
    container: HTMLElement,
    scale: number = 1.5,
    rotation: number = 0
  ): Promise<void> {
    const pdfjs = await initPdfJs();
    const page = await this.getPage(pageNumber);
    const viewport = page.getViewport({ scale, rotation });
    
    // Get text content
    const textContent = await page.getTextContent();

    // Clear existing content
    container.innerHTML = '';
    container.style.width = `${viewport.width}px`;
    container.style.height = `${viewport.height}px`;

    // Create text layer
    const textLayer = document.createElement('div');
    textLayer.className = 'textLayer';
    textLayer.style.width = `${viewport.width}px`;
    textLayer.style.height = `${viewport.height}px`;
    container.appendChild(textLayer);

    // Render text items
    textContent.items.forEach((item: any) => {
      const span = document.createElement('span');
      span.textContent = item.str;
      span.style.position = 'absolute';
      
      const tx = pdfjs.Util.transform(viewport.transform, item.transform);
      span.style.left = `${tx[4]}px`;
      span.style.top = `${tx[5]}px`;
      span.style.fontSize = `${Math.abs(tx[0])}px`;
      
      textLayer.appendChild(span);
    });
  }

  /**
   * Render annotations for a page
   */
  async renderAnnotations(
    pageNumber: number,
    container: HTMLElement,
    scale: number = 1.5,
    rotation: number = 0
  ): Promise<void> {
    const page = await this.getPage(pageNumber);
    const viewport = page.getViewport({ scale, rotation });
    
    // Get annotations
    const annotations = await page.getAnnotations();

    // Clear existing content
    container.innerHTML = '';
    container.style.width = `${viewport.width}px`;
    container.style.height = `${viewport.height}px`;

    // Create annotation layer
    const annotationLayer = document.createElement('div');
    annotationLayer.className = 'annotationLayer';
    annotationLayer.style.width = `${viewport.width}px`;
    annotationLayer.style.height = `${viewport.height}px`;
    container.appendChild(annotationLayer);

    // Render annotations
    annotations.forEach((annotation: any) => {
      if (annotation.subtype === 'Link') {
        const link = document.createElement('a');
        link.href = annotation.url || '#';
        link.target = '_blank';
        link.style.position = 'absolute';
        
        const rect = viewport.convertToViewportRectangle(annotation.rect);
        link.style.left = `${Math.min(rect[0], rect[2])}px`;
        link.style.top = `${Math.min(rect[1], rect[3])}px`;
        link.style.width = `${Math.abs(rect[0] - rect[2])}px`;
        link.style.height = `${Math.abs(rect[1] - rect[3])}px`;
        
        annotationLayer.appendChild(link);
      }
    });
  }

  /**
   * Generate thumbnail for a page
   */
  async generateThumbnail(
    pageNumber: number,
    maxWidth: number = 150,
    maxHeight: number = 150
  ): Promise<HTMLCanvasElement> {
    const page = await this.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });

    // Calculate scale to fit within max dimensions
    const scale = Math.min(
      maxWidth / viewport.width,
      maxHeight / viewport.height
    );

    const scaledViewport = page.getViewport({ scale });

    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    // Render page
    const renderContext: RenderParameters = {
      canvasContext: context,
      viewport: scaledViewport
    };

    await page.render(renderContext).promise;
    return canvas;
  }

  /**
   * Extract text from a page
   */
  async extractText(pageNumber: number): Promise<string> {
    const page = await this.getPage(pageNumber);
    const textContent = await page.getTextContent();
    return textContent.items.map((item: any) => item.str).join(' ');
  }

  /**
   * Extract all text from document
   */
  async extractAllText(): Promise<string> {
    if (!this.document) {
      throw new Error('No document loaded');
    }

    const textParts: string[] = [];
    for (let i = 1; i <= this.document.numPages; i++) {
      const text = await this.extractText(i);
      textParts.push(text);
    }

    return textParts.join('\n\n');
  }

  /**
   * Get document metadata
   */
  async getMetadata(): Promise<any> {
    if (!this.document) {
      throw new Error('No document loaded');
    }

    return await this.document.getMetadata();
  }

  /**
   * Get document outline
   */
  async getOutline(): Promise<any> {
    if (!this.document) {
      throw new Error('No document loaded');
    }

    return await this.document.getOutline();
  }

  /**
   * Cancel render task for a page
   */
  private cancelRenderTask(pageNumber: number): void {
    const task = this.renderTasks.get(pageNumber);
    if (task) {
      task.cancel();
      this.renderTasks.delete(pageNumber);
    }
  }

  /**
   * Clear caches
   */
  clearCache(): void {
    this.pageCache.clear();
    this.canvasCache.clear();
  }

  /**
   * Destroy and cleanup
   */
  async destroy(): Promise<void> {
    // Cancel all render tasks
    this.renderTasks.forEach((task, pageNumber) => {
      task.cancel();
    });
    this.renderTasks.clear();

    // Clear caches
    this.clearCache();

    // Destroy document
    if (this.document) {
      await this.document.destroy();
      this.document = null;
    }
  }

  /**
   * Get current document
   */
  getDocument(): PDFDocumentProxy | null {
    return this.document;
  }

  /**
   * Check if document is loaded
   */
  isDocumentLoaded(): boolean {
    return this.document !== null;
  }

  /**
   * Get total number of pages
   */
  getTotalPages(): number {
    return this.document ? this.document.numPages : 0;
  }
}