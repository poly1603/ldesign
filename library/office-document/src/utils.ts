import type { DocumentType, FileExtension } from './types';

/**
 * Detect document type from file extension or MIME type
 */
export function detectDocumentType(
 source: string | File | Blob,
 explicitType?: DocumentType
): DocumentType {
 if (explicitType) {
  return explicitType;
 }

 let filename = '';
 let mimeType = '';

 if (typeof source === 'string') {
  filename = source.toLowerCase();
 } else if (source instanceof File) {
  filename = source.name.toLowerCase();
  mimeType = source.type;
 } else if (source instanceof Blob) {
  mimeType = source.type;
 }

 // Check by MIME type first
 if (mimeType) {
  if (mimeType.includes('wordprocessing') || mimeType.includes('msword')) {
   return 'word';
  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
   return 'excel';
  }
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
   return 'powerpoint';
  }
 }

 // Check by file extension
 if (filename) {
  if (filename.endsWith('.docx') || filename.endsWith('.doc')) {
   return 'word';
  }
  if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
   return 'excel';
  }
  if (filename.endsWith('.pptx') || filename.endsWith('.ppt')) {
   return 'powerpoint';
  }
 }

 throw new Error('Unable to detect document type. Please specify the type explicitly.');
}

/**
 * Convert source to ArrayBuffer
 */
export async function sourceToArrayBuffer(
 source: string | File | ArrayBuffer | Blob
): Promise<ArrayBuffer> {
 if (source instanceof ArrayBuffer) {
  return source;
 }

 if (source instanceof Blob || source instanceof File) {
  return await source.arrayBuffer();
 }

 if (typeof source === 'string') {
  // Check if it's a data URL
  if (source.startsWith('data:')) {
   const base64 = source.split(',')[1];
   const binaryString = atob(base64);
   const bytes = new Uint8Array(binaryString.length);
   for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
   }
   return bytes.buffer;
  }

  // Otherwise treat as URL
  const response = await fetch(source);
  if (!response.ok) {
   throw new Error(`Failed to fetch document: ${response.statusText}`);
  }
  return await response.arrayBuffer();
 }

 throw new Error('Invalid source type');
}

/**
 * Get container element
 */
export function getContainer(container: HTMLElement | string): HTMLElement {
 if (typeof container === 'string') {
  const element = document.querySelector(container);
  if (!element) {
   throw new Error(`Container element not found: ${container}`);
  }
  return element as HTMLElement;
 }
 return container;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
 if (bytes === 0) return '0 Bytes';

 const k = 1024;
 const sizes = ['Bytes', 'KB', 'MB', 'GB'];
 const i = Math.floor(Math.log(bytes) / Math.log(k));

 return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Create download link for blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.download = filename;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 URL.revokeObjectURL(url);
}

/**
 * Create a loading overlay
 */
export function createLoadingOverlay(container: HTMLElement, message: string = 'Loading...'): HTMLElement {
 const overlay = document.createElement('div');
 overlay.className = 'office-viewer-loading';
 overlay.innerHTML = `
  <div class="loading-spinner"></div>
  <div class="loading-message">${message}</div>
 `;
 container.appendChild(overlay);
 return overlay;
}

/**
 * Remove loading overlay
 */
export function removeLoadingOverlay(container: HTMLElement): void {
 const overlay = container.querySelector('.office-viewer-loading');
 if (overlay) {
  overlay.remove();
 }
}

/**
 * Show error message
 */
export function showError(container: HTMLElement, error: Error): void {
 const errorDiv = document.createElement('div');
 errorDiv.className = 'office-viewer-error';
 errorDiv.innerHTML = `
  <div class="error-icon">⚠️</div>
  <div class="error-message">
   <h3>Failed to load document</h3>
   <p>${error.message}</p>
  </div>
 `;
 container.innerHTML = '';
 container.appendChild(errorDiv);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
 func: T,
 wait: number
): (...args: Parameters<T>) => void {
 let timeout: NodeJS.Timeout | null = null;
 return function (this: any, ...args: Parameters<T>) {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => func.apply(this, args), wait);
 };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
 func: T,
 limit: number
): (...args: Parameters<T>) => void {
 let inThrottle: boolean;
 return function (this: any, ...args: Parameters<T>) {
  if (!inThrottle) {
   func.apply(this, args);
   inThrottle = true;
   setTimeout(() => (inThrottle = false), limit);
  }
 };
}

/**
 * Create toolbar
 */
export function createToolbar(options: {
 onZoomIn?: () => void;
 onZoomOut?: () => void;
 onDownload?: () => void;
 onPrint?: () => void;
 onFullscreen?: () => void;
 enableZoom?: boolean;
 enableDownload?: boolean;
 enablePrint?: boolean;
 enableFullscreen?: boolean;
}): HTMLElement {
 const toolbar = document.createElement('div');
 toolbar.className = 'office-viewer-toolbar';

 let buttonsHTML = '';

 if (options.enableZoom) {
  buttonsHTML += `
   <button class="toolbar-btn zoom-out" title="Zoom Out">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
     <circle cx="11" cy="11" r="8"></circle>
     <path d="M21 21l-4.35-4.35"></path>
     <line x1="8" y1="11" x2="14" y2="11"></line>
    </svg>
   </button>
   <button class="toolbar-btn zoom-in" title="Zoom In">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
     <circle cx="11" cy="11" r="8"></circle>
     <path d="M21 21l-4.35-4.35"></path>
     <line x1="11" y1="8" x2="11" y2="14"></line>
     <line x1="8" y1="11" x2="14" y2="11"></line>
    </svg>
   </button>
  `;
 }

 if (options.enableDownload) {
  buttonsHTML += `
   <button class="toolbar-btn download" title="Download">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
     <polyline points="7 10 12 15 17 10"></polyline>
     <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
   </button>
  `;
 }

 if (options.enablePrint) {
  buttonsHTML += `
   <button class="toolbar-btn print" title="Print">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
     <polyline points="6 9 6 2 18 2 18 9"></polyline>
     <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
     <rect x="6" y="14" width="12" height="8"></rect>
    </svg>
   </button>
  `;
 }

 if (options.enableFullscreen) {
  buttonsHTML += `
   <button class="toolbar-btn fullscreen" title="Fullscreen">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
     <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
    </svg>
   </button>
  `;
 }

 toolbar.innerHTML = buttonsHTML;

 // Attach event listeners
 if (options.enableZoom) {
  toolbar.querySelector('.zoom-in')?.addEventListener('click', () => options.onZoomIn?.());
  toolbar.querySelector('.zoom-out')?.addEventListener('click', () => options.onZoomOut?.());
 }
 if (options.enableDownload) {
  toolbar.querySelector('.download')?.addEventListener('click', () => options.onDownload?.());
 }
 if (options.enablePrint) {
  toolbar.querySelector('.print')?.addEventListener('click', () => options.onPrint?.());
 }
 if (options.enableFullscreen) {
  toolbar.querySelector('.fullscreen')?.addEventListener('click', () => options.onFullscreen?.());
 }

 return toolbar;
}

/**
 * Generate unique ID
 */
export function generateId(): string {
 return `office-viewer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Merge options with defaults
 */
export function mergeOptions<T extends object>(defaults: T, options: Partial<T>): T {
 return { ...defaults, ...options };
}
