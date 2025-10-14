/**
 * PDF Viewer Configuration Options
 */
export interface PDFViewerOptions {
  // Basic Configuration
  container: HTMLElement | string;
  url?: string;
  data?: ArrayBuffer | Uint8Array;
  
  // Display Options
  width?: number | string;
  height?: number | string;
  initialScale?: number | 'page-fit' | 'page-width' | 'page-height' | 'auto';
  minScale?: number;
  maxScale?: number;
  rotation?: 0 | 90 | 180 | 270;
  pageMode?: 'single' | 'continuous' | 'book';
  
  // UI Configuration
  toolbar?: boolean | ToolbarConfig;
  sidebar?: boolean | SidebarConfig;
  contextMenu?: boolean | ContextMenuConfig;
  theme?: 'light' | 'dark' | 'auto' | CustomTheme;
  language?: string;
  
  // Features
  enableSearch?: boolean;
  enablePrint?: boolean;
  enableDownload?: boolean;
  enableFullscreen?: boolean;
  enableRotation?: boolean;
  enableZoom?: boolean;
  enablePageNavigation?: boolean;
  enableTextSelection?: boolean;
  enableAnnotations?: boolean;
  enableBookmarks?: boolean;
  enableThumbnails?: boolean;
  enableOutline?: boolean;
  enableHandTool?: boolean;
  
  // Advanced Options
  workerSrc?: string;
  cMapUrl?: string;
  cMapPacked?: boolean;
  standardFontDataUrl?: string;
  withCredentials?: boolean;
  password?: string;
  
  // Performance
  renderingMode?: 'canvas' | 'svg' | 'custom';
  textLayerMode?: 0 | 1 | 2; // 0: disabled, 1: enabled, 2: enhanced
  annotationMode?: 0 | 1 | 2; // 0: disabled, 1: enabled, 2: forms
  
  // Callbacks
  onInit?: (viewer: PDFViewer) => void;
  onDocumentLoad?: (document: PDFDocumentProxy) => void;
  onPageChange?: (pageNumber: number, totalPages: number) => void;
  onScaleChange?: (scale: number) => void;
  onError?: (error: Error) => void;
  onProgress?: (loaded: number, total: number) => void;
  onPasswordRequired?: () => string | Promise<string>;
  onPrint?: () => void;
  onDownload?: () => void;
  onAnnotationClick?: (annotation: any) => void;
  onTextSelection?: (text: string) => void;
  onSearch?: (query: string, results: SearchResult[]) => void;
}

export interface ToolbarConfig {
  show?: boolean;
  position?: 'top' | 'bottom';
  items?: ToolbarItem[];
  customButtons?: CustomButton[];
}

export interface ToolbarItem {
  name: string;
  show?: boolean;
  icon?: string;
  label?: string;
  tooltip?: string;
}

export interface CustomButton {
  id: string;
  icon?: string;
  label?: string;
  tooltip?: string;
  position?: number;
  onClick: () => void;
}

export interface SidebarConfig {
  show?: boolean;
  position?: 'left' | 'right';
  defaultPanel?: 'thumbnails' | 'outline' | 'attachments' | 'layers';
  width?: number | string;
  collapsible?: boolean;
}

export interface ContextMenuConfig {
  enabled?: boolean;
  items?: ContextMenuItem[];
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  onClick: () => void;
  condition?: () => boolean;
}

export interface CustomTheme {
  name: string;
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
    toolbar?: string;
    sidebar?: string;
    [key: string]: string | undefined;
  };
  fonts?: {
    family?: string;
    size?: string;
  };
}

export interface SearchResult {
  page: number;
  matches: SearchMatch[];
}

export interface SearchMatch {
  text: string;
  position: { x: number; y: number; width: number; height: number };
}

export interface PDFDocumentProxy {
  numPages: number;
  fingerprint: string;
  getPage(pageNumber: number): Promise<PDFPageProxy>;
  getMetadata(): Promise<any>;
  getOutline(): Promise<any>;
  getAttachments(): Promise<any>;
  destroy(): void;
}

export interface PDFPageProxy {
  pageNumber: number;
  rotate: number;
  getViewport(params: { scale: number; rotation?: number }): PDFPageViewport;
  render(params: RenderParameters): RenderTask;
  getTextContent(): Promise<any>;
  getAnnotations(): Promise<any>;
}

export interface PDFPageViewport {
  width: number;
  height: number;
  scale: number;
  rotation: number;
  transform: number[];
  clone(params?: { scale?: number; rotation?: number }): PDFPageViewport;
}

export interface RenderParameters {
  canvasContext: CanvasRenderingContext2D;
  viewport: PDFPageViewport;
  transform?: number[];
  intent?: string;
  enableWebGL?: boolean;
  renderInteractiveForms?: boolean;
  imageLayer?: any;
}

export interface RenderTask {
  promise: Promise<void>;
  cancel(): void;
}

export interface ViewerState {
  currentPage: number;
  totalPages: number;
  scale: number;
  rotation: number;
  pageMode: string;
  isFullscreen: boolean;
  isSearchOpen: boolean;
  isSidebarOpen: boolean;
}

export interface PDFViewer {
  // Properties
  options: PDFViewerOptions;
  state: ViewerState;
  document: PDFDocumentProxy | null;
  container: HTMLElement;
  
  // Methods
  init(): Promise<void>;
  loadDocument(url: string | ArrayBuffer | Uint8Array): Promise<void>;
  destroy(): void;
  
  // Navigation
  nextPage(): void;
  previousPage(): void;
  goToPage(pageNumber: number): void;
  firstPage(): void;
  lastPage(): void;
  
  // View Control
  zoomIn(): void;
  zoomOut(): void;
  setScale(scale: number | string): void;
  rotate(angle?: number): void;
  setPageMode(mode: 'single' | 'continuous' | 'book'): void;
  
  // Features
  print(): void;
  download(filename?: string): void;
  toggleFullscreen(): void;
  toggleSidebar(): void;
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  clearSearch(): void;
  
  // Text and Annotations
  getSelectedText(): string;
  addAnnotation(annotation: Omit<Annotation, 'id' | 'createdAt'>): Annotation | null;
  removeAnnotation(id: string): void;
  getAnnotations(pageNumber?: number): Annotation[];
  
  // Bookmarks
  addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Bookmark | null;
  addCurrentPageBookmark(title?: string): Bookmark | null;
  removeBookmark(id: string): void;
  getBookmarks(): Bookmark[];
  goToBookmark(id: string): void;
  
  // Advanced
  getViewport(): any;
  scrollTo(x: number, y: number): void;
  
  // Utilities
  getCurrentPage(): number;
  getTotalPages(): number;
  getScale(): number;
  getRotation(): number;
  isReady(): boolean;
  
  // Event Management
  on(event: string, handler: Function): void;
  off(event: string, handler?: Function): void;
  emit(event: string, ...args: any[]): void;
}

export interface SearchOptions {
  caseSensitive?: boolean;
  entireWord?: boolean;
  highlightAll?: boolean;
  findPrevious?: boolean;
}

// Annotation types
export interface Annotation {
  id: string;
  type: 'highlight' | 'underline' | 'strikeout' | 'text' | 'drawing' | 'stamp';
  pageNumber: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color?: string;
  content?: string;
  author?: string;
  createdAt: Date;
  modifiedAt?: Date;
  replies?: AnnotationReply[];
}

export interface AnnotationReply {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
}

export interface DrawingAnnotation extends Annotation {
  type: 'drawing';
  paths: DrawingPath[];
}

export interface DrawingPath {
  points: { x: number; y: number }[];
  strokeColor: string;
  strokeWidth: number;
}

// Bookmark types
export interface Bookmark {
  id: string;
  title: string;
  pageNumber: number;
  position?: { x: number; y: number };
  parentId?: string;
  children?: Bookmark[];
  color?: string;
  createdAt: Date;
}

// Print options
export interface PrintOptions {
  pageRange?: string; // e.g., "1-5,8,11-13"
  scale?: 'auto' | 'actual' | 'custom';
  customScale?: number;
  orientation?: 'portrait' | 'landscape';
  paperSize?: 'A4' | 'Letter' | 'Legal' | 'A3';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  printAnnotations?: boolean;
  printComments?: boolean;
  grayscale?: boolean;
}

// Advanced search
export interface AdvancedSearchOptions extends SearchOptions {
  pageRange?: string;
  searchIn?: ('content' | 'annotations' | 'bookmarks')[];
  regex?: boolean;
  maxResults?: number;
}

// Signature types
export interface Signature {
  id: string;
  pageNumber: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  image?: string; // base64 or URL
  text?: string;
  certificate?: SignatureCertificate;
  timestamp: Date;
}

export interface SignatureCertificate {
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  serialNumber: string;
}

// Form types
export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'select' | 'button' | 'signature';
  pageNumber: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  value?: any;
  defaultValue?: any;
  required?: boolean;
  readonly?: boolean;
  options?: string[]; // for select and radio
}

// Export options
export interface ExportOptions {
  format: 'pdf' | 'image' | 'text' | 'html';
  pageRange?: string;
  quality?: number; // for image export
  imageFormat?: 'png' | 'jpeg' | 'webp';
  includeAnnotations?: boolean;
  includeBookmarks?: boolean;
}
