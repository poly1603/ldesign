/**
 * Office document types
 */
export type DocumentType = 'word' | 'excel' | 'powerpoint';

/**
 * Supported file extensions
 */
export type FileExtension = '.docx' | '.doc' | '.xlsx' | '.xls' | '.pptx' | '.ppt';

/**
 * Viewer configuration options
 */
export interface ViewerOptions {
 /** Container element or selector */
 container: HTMLElement | string;

 /** Document source (URL, File, ArrayBuffer, or Blob) */
 source: string | File | ArrayBuffer | Blob;

 /** Document type (auto-detected if not specified) */
 type?: DocumentType;

 /** Custom width */
 width?: string | number;

 /** Custom height */
 height?: string | number;

 /** Enable zoom controls */
 enableZoom?: boolean;

 /** Enable download button */
 enableDownload?: boolean;

 /** Enable print button */
 enablePrint?: boolean;

 /** Enable fullscreen button */
 enableFullscreen?: boolean;

 /** Show toolbar */
 showToolbar?: boolean;

 /** Custom CSS class */
 className?: string;

 /** Theme (light or dark) */
 theme?: 'light' | 'dark';

 /** Callback when document loads successfully */
 onLoad?: () => void;

 /** Callback when error occurs */
 onError?: (error: Error) => void;

 /** Callback for loading progress */
 onProgress?: (progress: number) => void;

 /** Excel-specific options */
 excel?: {
  /** Default sheet index to display */
  defaultSheet?: number;
  /** Enable sheet tabs */
  showSheetTabs?: boolean;
  /** Enable formula bar */
  showFormulaBar?: boolean;
  /** Enable grid lines */
  showGridLines?: boolean;
  /** Enable cell editing */
  enableEditing?: boolean;
 };

 /** PowerPoint-specific options */
 powerpoint?: {
  /** Auto-play slides */
  autoPlay?: boolean;
  /** Auto-play interval (ms) */
  autoPlayInterval?: number;
  /** Show slide navigation */
  showNavigation?: boolean;
  /** Show slide thumbnails */
  showThumbnails?: boolean;
 };

 /** Word-specific options */
 word?: {
  /** Enable outline view */
  showOutline?: boolean;
  /** Page view mode */
  pageView?: 'single' | 'continuous';
 };
}

/**
 * Document metadata
 */
export interface DocumentMetadata {
 title?: string;
 author?: string;
 subject?: string;
 creator?: string;
 created?: Date;
 modified?: Date;
 pageCount?: number;
 wordCount?: number;
 [key: string]: any;
}

/**
 * Renderer interface that all document renderers must implement
 */
export interface IDocumentRenderer {
 /** Render the document */
 render(container: HTMLElement, data: ArrayBuffer, options: ViewerOptions): Promise<void>;

 /** Get document metadata */
 getMetadata(data: ArrayBuffer): Promise<DocumentMetadata>;

 /** Destroy the renderer and clean up resources */
 destroy(): void;

 /** Export document to different formats */
 export?(format: 'pdf' | 'html' | 'text'): Promise<Blob>;
}

/**
 * Event types
 */
export type ViewerEventType =
 | 'load'
 | 'error'
 | 'progress'
 | 'zoom'
 | 'page-change'
 | 'sheet-change'
 | 'slide-change'
 | 'destroy';

/**
 * Event handler
 */
export type EventHandler = (data?: any) => void;

/**
 * Viewer instance interface
 */
export interface IOfficeViewer {
 /** Load a new document */
 load(source: string | File | ArrayBuffer | Blob, type?: DocumentType): Promise<void>;

 /** Reload current document */
 reload(): Promise<void>;

 /** Get current document metadata */
 getMetadata(): Promise<DocumentMetadata>;

 /** Zoom in */
 zoomIn(): void;

 /** Zoom out */
 zoomOut(): void;

 /** Set zoom level */
 setZoom(level: number): void;

 /** Get current zoom level */
 getZoom(): number;

 /** Download the document */
 download(filename?: string): void;

 /** Print the document */
 print(): void;

 /** Enter fullscreen mode */
 fullscreen(): void;

 /** Exit fullscreen mode */
 exitFullscreen(): void;

 /** Navigate to page (Word/PowerPoint) */
 goToPage?(page: number): void;

 /** Switch to sheet (Excel) */
 switchSheet?(sheetIndex: number): void;

 /** Listen to events */
 on(event: ViewerEventType, handler: EventHandler): void;

 /** Remove event listener */
 off(event: ViewerEventType, handler: EventHandler): void;

 /** Destroy the viewer */
 destroy(): void;
}

/**
 * Render state
 */
export interface RenderState {
 currentPage: number;
 currentSheet: number;
 currentSlide: number;
 zoomLevel: number;
 isFullscreen: boolean;
 isLoading: boolean;
 error: Error | null;
}
