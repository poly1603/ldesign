/**
 * Utility functions for Office Document Renderer
 */

import { DocumentType } from './types';

/**
 * Detect document type from file extension or MIME type
 */
export function detectDocumentType(file: File | string): DocumentType | null {
  let filename = '';
  let mimeType = '';

  if (typeof file === 'string') {
    filename = file;
  } else {
    filename = file.name;
    mimeType = file.type;
  }

  const extension = filename.split('.').pop()?.toLowerCase();

  // Check by extension
  if (extension) {
    if (['doc', 'docx', 'docm', 'dotx', 'dotm', 'odt'].includes(extension)) {
      return 'word';
    }
    if (['xls', 'xlsx', 'xlsm', 'xlsb', 'xltx', 'xltm', 'ods'].includes(extension)) {
      return 'excel';
    }
    if (['ppt', 'pptx', 'pptm', 'potx', 'potm', 'ppsx', 'ppsm', 'odp'].includes(extension)) {
      return 'powerpoint';
    }
    if (extension === 'pdf') {
      return 'pdf';
    }
  }

  // Check by MIME type
  if (mimeType) {
    if (mimeType.includes('word') || mimeType.includes('document')) {
      return 'word';
    }
    if (mimeType.includes('sheet') || mimeType.includes('excel')) {
      return 'excel';
    }
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return 'powerpoint';
    }
    if (mimeType === 'application/pdf') {
      return 'pdf';
    }
  }

  return null;
}

/**
 * Convert file to ArrayBuffer
 */
export function fileToArrayBuffer(file: File | Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        resolve(e.target.result);
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Convert Base64 to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64.split(',').pop() || base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes.buffer;
}

/**
 * Load file from URL
 */
export async function loadFromUrl(
  url: string,
  options?: {
    headers?: Record<string, string>;
    credentials?: RequestCredentials;
  }
): Promise<ArrayBuffer> {
  const response = await fetch(url, {
    headers: options?.headers,
    credentials: options?.credentials,
  });

  if (!response.ok) {
    throw new Error(`Failed to load file from URL: ${response.statusText}`);
  }

  return response.arrayBuffer();
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
 * Create element with classes and attributes
 */
export function createElement(
  tag: string,
  options?: {
    className?: string;
    id?: string;
    attributes?: Record<string, string>;
    style?: Partial<CSSStyleDeclaration>;
    innerHTML?: string;
    textContent?: string;
  }
): HTMLElement {
  const element = document.createElement(tag);

  if (options?.className) {
    element.className = options.className;
  }

  if (options?.id) {
    element.id = options.id;
  }

  if (options?.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  if (options?.style) {
    Object.assign(element.style, options.style);
  }

  if (options?.innerHTML) {
    element.innerHTML = options.innerHTML;
  } else if (options?.textContent) {
    element.textContent = options.textContent;
  }

  return element;
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
    const context = this;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(context, args);
      timeout = null;
    }, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate unique ID
 */
export function generateId(prefix = 'od'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if Web Worker is supported
 */
export function isWebWorkerSupported(): boolean {
  return typeof Worker !== 'undefined';
}

/**
 * Create Web Worker from function
 */
export function createWorkerFromFunction(fn: Function): Worker {
  const blob = new Blob([`(${fn.toString()})()`], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  return new Worker(url);
}