export type ViewMode = 'single' | 'continuous' | 'double' | 'thumbnail';

export interface PDFViewerOptions {
  defaultScale: number;
  minScale: number;
  maxScale: number;
  viewMode: ViewMode;
  enableToolbar: boolean;
  enableNavigation: boolean;
  enableZoom: boolean;
  enableSearch: boolean;
  enablePrint: boolean;
  enableDownload: boolean;
  enableFullscreen: boolean;
  enableRotation: boolean;
  enableThumbnails: boolean;
  enableAnnotations: boolean;
  theme: 'light' | 'dark';
  locale: string;
  customToolbar?: ToolbarConfig;
}

export interface PDFViewerState {
  currentPage: number;
  totalPages: number;
  scale: number;
  rotation: number;
  viewMode: ViewMode;
  isLoading: boolean;
  searchActive: boolean;
  fullscreen: boolean;
}

export interface ToolbarConfig {
  items?: ToolbarItem[];
  position?: 'top' | 'bottom';
  style?: Partial<CSSStyleDeclaration>;
}

export interface ToolbarItem {
  type: 'button' | 'separator' | 'group' | 'input' | 'select';
  id?: string;
  icon?: string;
  label?: string;
  tooltip?: string;
  action?: string;
  items?: ToolbarItem[];
  disabled?: boolean;
  hidden?: boolean;
  className?: string;
}

export interface SearchResult {
  page: number;
  index: number;
  text: string;
  context?: string;
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
}

export interface PDFViewerEvents {
  initialized: (state: PDFViewerState) => void;
  loading: (data: { source: string | ArrayBuffer | Uint8Array }) => void;
  loaded: (data: { totalPages: number; metadata: PDFMetadata }) => void;
  error: (error: Error) => void;
  pageChanged: (data: { currentPage: number; totalPages: number }) => void;
  pageRendered: (data: { pageNumber: number; scale: number; rotation: number }) => void;
  scaleChanged: (data: { scale: number }) => void;
  rotationChanged: (data: { rotation: number }) => void;
  viewModeChanged: (data: { mode: ViewMode }) => void;
  searchComplete: (data: { query: string; results: SearchResult[]; totalResults: number }) => void;
  searchCleared: () => void;
  fullscreenChanged: (data: { fullscreen: boolean }) => void;
  themeChanged: (data: { theme: 'light' | 'dark' }) => void;
  downloaded: (data: { filename?: string }) => void;
  destroyed: () => void;
  metadata: (metadata: PDFMetadata) => void;
}