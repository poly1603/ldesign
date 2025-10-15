/**
 * Viewer type definitions
 */

export type DocumentType = 'word' | 'excel' | 'powerpoint';
export type FileExtension = '.docx' | '.doc' | '.xlsx' | '.xls' | '.pptx' | '.ppt' | '.csv';
export type Theme = 'light' | 'dark';
export type PageView = 'single' | 'continuous';

/**
 * Viewer configuration options
 */
export interface ViewerOptions {
 // Required
 container: HTMLElement | string;
 source: string | File | ArrayBuffer | Blob;

 // Optional - Basic
 type?: DocumentType;
 width?: string | number;
 height?: string | number;
 theme?: Theme;
 className?: string;

 // Optional - Features
 enableZoom?: boolean;
 enableDownload?: boolean;
 enablePrint?: boolean;
 enableFullscreen?: boolean;
 enableSearch?: boolean;
 enableAnnotations?: boolean;
 showToolbar?: boolean;

 // Optional - Callbacks
 onLoad?: () => void;
 onError?: (error: Error) => void;
 onProgress?: (progress: number) => void;
 onZoom?: (level: number) => void;

 // Document-specific options
 excel?: ExcelOptions;
 powerpoint?: PowerPointOptions;
 word?: WordOptions;
}

/**
 * Excel-specific options
 */
export interface ExcelOptions {
 defaultSheet?: number;
 showSheetTabs?: boolean;
 showFormulaBar?: boolean;
 showGridLines?: boolean;
 enableEditing?: boolean;
 enableFilters?: boolean;
 enableSort?: boolean;
 freezeHeader?: boolean;
 cellStyles?: boolean;
}

/**
 * PowerPoint-specific options
 */
export interface PowerPointOptions {
 autoPlay?: boolean;
 autoPlayInterval?: number;
 showNavigation?: boolean;
 showThumbnails?: boolean;
 enableTransitions?: boolean;
 loop?: boolean;
 startSlide?: number;
}

/**
 * Word-specific options
 */
export interface WordOptions {
 showOutline?: boolean;
 pageView?: PageView;
 enableComments?: boolean;
 showPageNumbers?: boolean;
 showHeaders?: boolean;
 showFooters?: boolean;
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
 sheetCount?: number;
 slideCount?: number;
 fileSize?: number;
 [key: string]: any;
}

/**
 * Render state
 */
export interface RenderState {
 isLoading: boolean;
 isRendered: boolean;
 currentPage: number;
 currentSheet: number;
 currentSlide: number;
 zoomLevel: number;
 isFullscreen: boolean;
 error: Error | null;
 searchQuery?: string;
 searchResults?: SearchResult[];
}

/**
 * Search result
 */
export interface SearchResult {
 index: number;
 text: string;
 page?: number;
 sheet?: number;
 slide?: number;
 position: {
  x: number;
  y: number;
 };
}

/**
 * Annotation
 */
export interface Annotation {
 id: string;
 type: 'highlight' | 'comment' | 'drawing';
 page?: number;
 sheet?: number;
 slide?: number;
 position: {
  x: number;
  y: number;
  width?: number;
  height?: number;
 };
 content?: string;
 color?: string;
 author?: string;
 timestamp: Date;
}

/**
 * Export options
 */
export interface ExportOptions {
 format: 'pdf' | 'html' | 'text' | 'image';
 quality?: number;
 includeAnnotations?: boolean;
 pageRange?: {
  start: number;
  end: number;
 };
}
