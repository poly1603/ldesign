import type {
 ViewerOptions,
 DocumentType,
 DocumentMetadata,
 IOfficeViewer,
 IDocumentRenderer,
 ViewerEventType,
 EventHandler,
 RenderState
} from './types';
import {
 detectDocumentType,
 sourceToArrayBuffer,
 getContainer,
 downloadBlob,
 createLoadingOverlay,
 removeLoadingOverlay,
 showError,
 createToolbar,
 generateId,
 mergeOptions
} from './utils';
import { WordRenderer } from './renderers/word-renderer';
import { ExcelRenderer } from './renderers/excel-renderer';
import { PowerPointRenderer } from './renderers/powerpoint-renderer';
import './styles.css';

/**
 * Default viewer options
 */
const DEFAULT_OPTIONS: Partial<ViewerOptions> = {
 width: '100%',
 height: '600px',
 enableZoom: true,
 enableDownload: true,
 enablePrint: true,
 enableFullscreen: true,
 showToolbar: true,
 theme: 'light',
 excel: {
  showSheetTabs: true,
  showFormulaBar: false,
  showGridLines: true,
  enableEditing: false
 },
 powerpoint: {
  autoPlay: false,
  autoPlayInterval: 3000,
  showNavigation: true,
  showThumbnails: false
 },
 word: {
  showOutline: false,
  pageView: 'continuous'
 }
};

/**
 * OfficeViewer - Framework-agnostic Office document viewer
 *
 * @example
 * // Basic usage
 * const viewer = new OfficeViewer({
 *  container: '#viewer',
 *  source: 'document.docx'
 * });
 *
 * @example
 * // With options
 * const viewer = new OfficeViewer({
 *  container: document.getElementById('viewer'),
 *  source: file, // File object from input
 *  type: 'excel',
 *  enableZoom: true,
 *  excel: {
 *   showSheetTabs: true,
 *   showFormulaBar: true
 *  }
 * });
 */
export class OfficeViewer implements IOfficeViewer {
 private container: HTMLElement;
 private viewerWrapper: HTMLElement | null = null;
 private contentContainer: HTMLElement | null = null;
 private toolbar: HTMLElement | null = null;
 private renderer: IDocumentRenderer | null = null;
 private options: ViewerOptions;
 private currentSource: string | File | ArrayBuffer | Blob | null = null;
 private currentType: DocumentType | null = null;
 private currentData: ArrayBuffer | null = null;
 private eventHandlers: Map<ViewerEventType, Set<EventHandler>> = new Map();
 private state: RenderState = {
  currentPage: 1,
  currentSheet: 0,
  currentSlide: 0,
  zoomLevel: 1,
  isFullscreen: false,
  isLoading: false,
  error: null
 };
 private viewerId: string;

 /**
  * Create a new OfficeViewer instance
  */
 constructor(options: ViewerOptions) {
  this.viewerId = generateId();
  this.options = mergeOptions(DEFAULT_OPTIONS as ViewerOptions, options);
  this.container = getContainer(this.options.container);

  // Initialize viewer
  this.initializeViewer();

  // Load document if source is provided
  if (this.options.source) {
   this.load(this.options.source, this.options.type);
  }
 }

 /**
  * Initialize viewer UI
  */
 private initializeViewer(): void {
  // Apply container styles
  this.container.style.width = typeof this.options.width === 'number'
   ? `${this.options.width}px`
   : this.options.width || '100%';
  this.container.style.height = typeof this.options.height === 'number'
   ? `${this.options.height}px`
   : this.options.height || '600px';

  // Add theme class
  this.container.classList.add('office-viewer');
  this.container.classList.add(`theme-${this.options.theme}`);
  if (this.options.className) {
   this.container.classList.add(this.options.className);
  }

  // Create viewer wrapper
  this.viewerWrapper = document.createElement('div');
  this.viewerWrapper.className = 'office-viewer-wrapper';
  this.viewerWrapper.id = this.viewerId;

  // Create toolbar if enabled
  if (this.options.showToolbar) {
   this.toolbar = createToolbar({
    onZoomIn: () => this.zoomIn(),
    onZoomOut: () => this.zoomOut(),
    onDownload: () => this.download(),
    onPrint: () => this.print(),
    onFullscreen: () => this.fullscreen(),
    enableZoom: this.options.enableZoom,
    enableDownload: this.options.enableDownload,
    enablePrint: this.options.enablePrint,
    enableFullscreen: this.options.enableFullscreen
   });
   this.viewerWrapper.appendChild(this.toolbar);
  }

  // Create content container
  this.contentContainer = document.createElement('div');
  this.contentContainer.className = 'office-viewer-content-container';
  this.viewerWrapper.appendChild(this.contentContainer);

  this.container.appendChild(this.viewerWrapper);
 }

 /**
  * Load a new document
  */
 async load(source: string | File | ArrayBuffer | Blob, type?: DocumentType): Promise<void> {
  if (!this.contentContainer) {
   throw new Error('Viewer not initialized');
  }

  try {
   this.state.isLoading = true;
   this.state.error = null;
   this.emit('progress', 0);

   // Show loading overlay
   const loadingOverlay = createLoadingOverlay(this.contentContainer, 'Loading document...');

   // Detect document type
   this.currentType = detectDocumentType(source, type);
   this.currentSource = source;

   // Convert to ArrayBuffer
   this.emit('progress', 30);
   this.currentData = await sourceToArrayBuffer(source);

   // Create renderer
   this.emit('progress', 50);
   this.renderer?.destroy();
   this.renderer = this.createRenderer(this.currentType);

   // Clear content
   this.contentContainer.innerHTML = '';

   // Render document
   this.emit('progress', 70);
   await this.renderer.render(this.contentContainer, this.currentData, this.options);

   // Remove loading overlay
   removeLoadingOverlay(this.contentContainer);

   this.emit('progress', 100);
   this.state.isLoading = false;
   this.emit('load');
  } catch (error) {
   this.state.isLoading = false;
   this.state.error = error instanceof Error ? error : new Error('Unknown error');

   if (this.contentContainer) {
    removeLoadingOverlay(this.contentContainer);
    showError(this.contentContainer, this.state.error);
   }

   this.emit('error', this.state.error);
   throw this.state.error;
  }
 }

 /**
  * Reload current document
  */
 async reload(): Promise<void> {
  if (!this.currentSource || !this.currentType) {
   throw new Error('No document loaded');
  }
  await this.load(this.currentSource, this.currentType);
 }

 /**
  * Get current document metadata
  */
 async getMetadata(): Promise<DocumentMetadata> {
  if (!this.renderer || !this.currentData) {
   throw new Error('No document loaded');
  }
  return await this.renderer.getMetadata(this.currentData);
 }

 /**
  * Zoom in
  */
 zoomIn(): void {
  this.setZoom(this.state.zoomLevel + 0.1);
 }

 /**
  * Zoom out
  */
 zoomOut(): void {
  this.setZoom(this.state.zoomLevel - 0.1);
 }

 /**
  * Set zoom level
  */
 setZoom(level: number): void {
  // Clamp zoom level between 0.5 and 3
  this.state.zoomLevel = Math.max(0.5, Math.min(3, level));

  if (this.contentContainer) {
   const content = this.contentContainer.querySelector('.office-viewer-content-container') as HTMLElement;
   if (content) {
    content.style.transform = `scale(${this.state.zoomLevel})`;
    content.style.transformOrigin = 'top left';
   }
  }

  this.emit('zoom', this.state.zoomLevel);
 }

 /**
  * Get current zoom level
  */
 getZoom(): number {
  return this.state.zoomLevel;
 }

 /**
  * Download the document
  */
 download(filename?: string): void {
  if (!this.currentData || !this.currentSource) {
   throw new Error('No document loaded');
  }

  // Generate filename if not provided
  if (!filename) {
   if (typeof this.currentSource === 'string') {
    filename = this.currentSource.split('/').pop() || 'document';
   } else if (this.currentSource instanceof File) {
    filename = this.currentSource.name;
   } else {
    const extension = this.currentType === 'word' ? '.docx'
     : this.currentType === 'excel' ? '.xlsx'
     : '.pptx';
    filename = `document${extension}`;
   }
  }

  const blob = new Blob([this.currentData]);
  downloadBlob(blob, filename);
 }

 /**
  * Print the document
  */
 print(): void {
  if (!this.contentContainer) {
   throw new Error('No document loaded');
  }

  // Create print window
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
   throw new Error('Failed to open print window');
  }

  const content = this.contentContainer.innerHTML;
  printWindow.document.write(`
   <!DOCTYPE html>
   <html>
   <head>
    <title>Print Document</title>
    <style>
     body { margin: 0; padding: 20px; }
     @media print { body { margin: 0; } }
    </style>
   </head>
   <body>
    ${content}
    <script>
     window.onload = function() {
      window.print();
      window.close();
     };
    </script>
   </body>
   </html>
  `);
  printWindow.document.close();
 }

 /**
  * Enter fullscreen mode
  */
 fullscreen(): void {
  if (!this.viewerWrapper) return;

  if (this.viewerWrapper.requestFullscreen) {
   this.viewerWrapper.requestFullscreen();
   this.state.isFullscreen = true;
  }
 }

 /**
  * Exit fullscreen mode
  */
 exitFullscreen(): void {
  if (document.exitFullscreen) {
   document.exitFullscreen();
   this.state.isFullscreen = false;
  }
 }

 /**
  * Navigate to page (Word/PowerPoint)
  */
 goToPage(page: number): void {
  this.state.currentPage = page;
  this.emit('page-change', page);
 }

 /**
  * Switch to sheet (Excel)
  */
 switchSheet(sheetIndex: number): void {
  if (this.renderer instanceof ExcelRenderer) {
   this.renderer.switchSheet(sheetIndex);
   this.state.currentSheet = sheetIndex;
   this.emit('sheet-change', sheetIndex);
  }
 }

 /**
  * Listen to events
  */
 on(event: ViewerEventType, handler: EventHandler): void {
  if (!this.eventHandlers.has(event)) {
   this.eventHandlers.set(event, new Set());
  }
  this.eventHandlers.get(event)!.add(handler);
 }

 /**
  * Remove event listener
  */
 off(event: ViewerEventType, handler: EventHandler): void {
  const handlers = this.eventHandlers.get(event);
  if (handlers) {
   handlers.delete(handler);
  }
 }

 /**
  * Emit event
  */
 private emit(event: ViewerEventType, data?: any): void {
  const handlers = this.eventHandlers.get(event);
  if (handlers) {
   handlers.forEach(handler => handler(data));
  }
 }

 /**
  * Create renderer based on document type
  */
 private createRenderer(type: DocumentType): IDocumentRenderer {
  switch (type) {
   case 'word':
    return new WordRenderer();
   case 'excel':
    return new ExcelRenderer();
   case 'powerpoint':
    return new PowerPointRenderer();
   default:
    throw new Error(`Unsupported document type: ${type}`);
  }
 }

 /**
  * Destroy the viewer
  */
 destroy(): void {
  // Destroy renderer
  this.renderer?.destroy();

  // Clear container
  if (this.container) {
   this.container.innerHTML = '';
   this.container.classList.remove('office-viewer', `theme-${this.options.theme}`);
   if (this.options.className) {
    this.container.classList.remove(this.options.className);
   }
  }

  // Clear references
  this.viewerWrapper = null;
  this.contentContainer = null;
  this.toolbar = null;
  this.renderer = null;
  this.currentSource = null;
  this.currentType = null;
  this.currentData = null;
  this.eventHandlers.clear();

  this.emit('destroy');
 }
}

// Export types and utilities
export * from './types';
export { WordRenderer } from './renderers/word-renderer';
export { ExcelRenderer } from './renderers/excel-renderer';
export { PowerPointRenderer } from './renderers/powerpoint-renderer';

// Default export
export default OfficeViewer;
