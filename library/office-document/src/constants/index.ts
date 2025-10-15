/**
 * Application constants
 */

export const APP_NAME = 'OfficeViewer';
export const APP_VERSION = '1.0.0';

/**
 * Document type constants
 */
export const DOCUMENT_TYPES = {
 WORD: 'word',
 EXCEL: 'excel',
 POWERPOINT: 'powerpoint'
} as const;

/**
 * File extensions
 */
export const FILE_EXTENSIONS = {
 WORD: ['.docx', '.doc'],
 EXCEL: ['.xlsx', '.xls', '.csv'],
 POWERPOINT: ['.pptx', '.ppt']
} as const;

/**
 * MIME types
 */
export const MIME_TYPES = {
 WORD: [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword'
 ],
 EXCEL: [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv'
 ],
 POWERPOINT: [
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint'
 ]
} as const;

/**
 * Event names
 */
export const EVENTS = {
 LOAD: 'load',
 ERROR: 'error',
 PROGRESS: 'progress',
 ZOOM: 'zoom',
 PAGE_CHANGE: 'page-change',
 SHEET_CHANGE: 'sheet-change',
 SLIDE_CHANGE: 'slide-change',
 DESTROY: 'destroy',
 SEARCH: 'search',
 ANNOTATION_ADD: 'annotation-add',
 ANNOTATION_UPDATE: 'annotation-update',
 ANNOTATION_DELETE: 'annotation-delete'
} as const;

/**
 * Zoom levels
 */
export const ZOOM = {
 MIN: 0.25,
 MAX: 4.0,
 DEFAULT: 1.0,
 STEP: 0.1
} as const;

/**
 * Cache settings
 */
export const CACHE = {
 MAX_SIZE: 50 * 1024 * 1024, // 50MB
 MAX_AGE: 1000 * 60 * 30 // 30 minutes
} as const;

/**
 * UI constants
 */
export const UI = {
 TOOLBAR_HEIGHT: 48,
 SIDEBAR_WIDTH: 250,
 ANIMATION_DURATION: 200
} as const;

/**
 * Keyboard shortcuts
 */
export const SHORTCUTS = {
 ZOOM_IN: 'ctrl+=',
 ZOOM_OUT: 'ctrl+-',
 ZOOM_RESET: 'ctrl+0',
 FULLSCREEN: 'f11',
 SEARCH: 'ctrl+f',
 PRINT: 'ctrl+p',
 DOWNLOAD: 'ctrl+s',
 NEXT_PAGE: 'ArrowRight',
 PREV_PAGE: 'ArrowLeft'
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
 INVALID_SOURCE: 'Invalid document source',
 LOAD_FAILED: 'Failed to load document',
 PARSE_FAILED: 'Failed to parse document',
 RENDER_FAILED: 'Failed to render document',
 UNSUPPORTED_FORMAT: 'Unsupported document format',
 CONTAINER_NOT_FOUND: 'Container element not found',
 NO_DOCUMENT_LOADED: 'No document loaded'
} as const;

/**
 * Default options
 */
export const DEFAULT_OPTIONS = {
 width: '100%',
 height: '600px',
 enableZoom: true,
 enableDownload: true,
 enablePrint: true,
 enableFullscreen: true,
 enableSearch: true,
 enableAnnotations: false,
 showToolbar: true,
 theme: 'light',
 excel: {
  defaultSheet: 0,
  showSheetTabs: true,
  showFormulaBar: false,
  showGridLines: true,
  enableEditing: false,
  enableFilters: true,
  enableSort: true
 },
 powerpoint: {
  autoPlay: false,
  autoPlayInterval: 3000,
  showNavigation: true,
  showThumbnails: false,
  enableTransitions: true
 },
 word: {
  showOutline: false,
  pageView: 'continuous',
  enableComments: false,
  showPageNumbers: true
 }
} as const;
