/**
 * Office Document Types and Interfaces
 */

export type DocumentType = 'word' | 'excel' | 'powerpoint' | 'pdf';

export interface RenderOptions {
  /** Container element or selector */
  container: HTMLElement | string;
  /** Width of the viewer */
  width?: string | number;
  /** Height of the viewer */
  height?: string | number;
  /** Enable toolbar */
  toolbar?: boolean;
  /** Toolbar options */
  toolbarOptions?: ToolbarOptions;
  /** Enable pagination for large documents */
  pagination?: boolean;
  /** Number of pages to load at once */
  pageSize?: number;
  /** Theme configuration */
  theme?: ThemeOptions;
  /** Enable zoom functionality */
  zoom?: boolean;
  /** Initial zoom level */
  initialZoom?: number;
  /** Enable search functionality */
  search?: boolean;
  /** Enable print functionality */
  print?: boolean;
  /** Enable download functionality */
  download?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Render mode */
  renderMode?: 'canvas' | 'html' | 'svg';
  /** Use Web Worker for rendering */
  useWebWorker?: boolean;
  /** Enable virtual scrolling for performance */
  virtualScrolling?: boolean;
  /** Lazy load images and resources */
  lazyLoad?: boolean;
  /** Cache rendered pages */
  cache?: boolean;
  /** Error callback */
  onError?: (error: Error) => void;
  /** Load callback */
  onLoad?: (doc: DocumentInfo) => void;
  /** Page change callback */
  onPageChange?: (page: number) => void;
  /** Zoom change callback */
  onZoomChange?: (zoom: number) => void;
}

export interface ToolbarOptions {
  items?: ToolbarItem[];
  position?: 'top' | 'bottom';
  style?: 'default' | 'minimal' | 'custom';
  customButtons?: CustomButton[];
}

export type ToolbarItem = 
  | 'zoom-in'
  | 'zoom-out'
  | 'zoom-fit'
  | 'print'
  | 'download'
  | 'search'
  | 'fullscreen'
  | 'page-nav'
  | 'rotate';

export interface CustomButton {
  id: string;
  icon?: string;
  text?: string;
  tooltip?: string;
  onClick: () => void;
}

export interface ThemeOptions {
  primary?: string;
  background?: string;
  text?: string;
  border?: string;
  toolbar?: {
    background?: string;
    text?: string;
    hover?: string;
  };
}

export interface DocumentInfo {
  type: DocumentType;
  name: string;
  size: number;
  pageCount?: number;
  metadata?: Record<string, any>;
}

export interface LoadOptions {
  /** File source */
  file?: File | Blob;
  /** URL to load file from */
  url?: string;
  /** Array buffer data */
  arrayBuffer?: ArrayBuffer;
  /** Base64 encoded string */
  base64?: string;
  /** Request headers for URL loading */
  headers?: Record<string, string>;
  /** Request credentials */
  credentials?: RequestCredentials;
}

export interface WordRenderOptions extends RenderOptions {
  /** Show comments */
  showComments?: boolean;
  /** Show tracked changes */
  showTrackedChanges?: boolean;
  /** Preserve styles */
  preserveStyles?: boolean;
}

export interface ExcelRenderOptions extends RenderOptions {
  /** Active sheet index */
  activeSheet?: number;
  /** Show grid lines */
  showGridLines?: boolean;
  /** Show row/column headers */
  showHeaders?: boolean;
  /** Enable cell editing */
  editable?: boolean;
  /** Show formulas */
  showFormulas?: boolean;
  /** Enable filtering */
  enableFiltering?: boolean;
  /** Enable sorting */
  enableSorting?: boolean;
}

export interface PowerPointRenderOptions extends RenderOptions {
  /** Enable slideshow mode */
  slideshow?: boolean;
  /** Auto play slides */
  autoPlay?: boolean;
  /** Slide duration in seconds */
  slideDuration?: number;
  /** Show slide notes */
  showNotes?: boolean;
  /** Enable animations */
  animations?: boolean;
  /** Thumbnail navigation */
  thumbnailNav?: boolean;
}

export interface RenderResult {
  /** Destroy the viewer */
  destroy: () => void;
  /** Refresh the viewer */
  refresh: () => void;
  /** Navigate to specific page */
  goToPage: (page: number) => void;
  /** Set zoom level */
  setZoom: (zoom: number) => void;
  /** Get current page */
  getCurrentPage: () => number;
  /** Get total pages */
  getTotalPages: () => number;
  /** Search in document */
  search?: (query: string) => void;
  /** Clear search */
  clearSearch?: () => void;
  /** Print document */
  print?: () => void;
  /** Download document */
  download?: () => void;
  /** Enter fullscreen */
  enterFullscreen?: () => void;
  /** Exit fullscreen */
  exitFullscreen?: () => void;
}

export interface RendererPlugin {
  name: string;
  supports: DocumentType[];
  render: (
    data: any,
    container: HTMLElement,
    options: RenderOptions
  ) => Promise<RenderResult>;
}