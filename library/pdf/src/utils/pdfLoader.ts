/**
 * PDF loading utilities with CORS proxy support and retry logic
 */

export interface PDFLoadConfig {
  corsProxy?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  fallbackProxies?: string[];
}

export const DEFAULT_LOAD_CONFIG: PDFLoadConfig = {
  corsProxy: 'https://api.allorigins.win/raw?url=',
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
  fallbackProxies: [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/'
  ]
};

/**
 * Check if a URL needs CORS proxy
 */
export function needsCorsProxy(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const currentOrigin = window.location.origin;
    const urlOrigin = urlObj.origin;
    
    // Same origin doesn't need proxy
    if (urlOrigin === currentOrigin) {
      return false;
    }
    
    // Local files don't need proxy
    if (urlObj.protocol === 'file:' || urlObj.protocol === 'blob:') {
      return false;
    }
    
    // Check if it's a known CORS-enabled domain
    const corsEnabledDomains = [
      'arxiv.org',
      'github.com',
      'raw.githubusercontent.com',
      'unpkg.com',
      'cdn.jsdelivr.net',
      'cdnjs.cloudflare.com'
    ];
    
    return !corsEnabledDomains.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

/**
 * Get PDF URL with CORS proxy if needed
 */
export function getPdfUrl(url: string, config: PDFLoadConfig = DEFAULT_LOAD_CONFIG): string {
  if (!url) return url;
  
  // For ArrayBuffer or Uint8Array, return as is
  if (url instanceof ArrayBuffer || url instanceof Uint8Array) {
    return url as any;
  }
  
  // Check if URL needs proxy
  if (needsCorsProxy(url) && config.corsProxy) {
    return `${config.corsProxy}${encodeURIComponent(url)}`;
  }
  
  return url;
}

/**
 * Try loading PDF with different proxies
 */
export async function tryLoadWithProxies(
  url: string,
  loadFunction: (url: string) => Promise<any>,
  config: PDFLoadConfig = DEFAULT_LOAD_CONFIG
): Promise<any> {
  const proxies = config.fallbackProxies || [config.corsProxy].filter(Boolean);
  
  for (let i = 0; i < proxies.length; i++) {
    const proxy = proxies[i];
    const proxiedUrl = needsCorsProxy(url) ? `${proxy}${encodeURIComponent(url)}` : url;
    
    try {
      const result = await loadFunction(proxiedUrl);
      return result;
    } catch (error) {
      console.warn(`Failed to load PDF with proxy ${i + 1}/${proxies.length}:`, error);
      
      if (i === proxies.length - 1) {
        throw error;
      }
      
      // Wait before trying next proxy
      if (config.retryDelay) {
        await new Promise(resolve => setTimeout(resolve, config.retryDelay));
      }
    }
  }
  
  throw new Error('Failed to load PDF with all available proxies');
}

/**
 * Load PDF with retry logic
 */
export async function loadPdfWithRetry(
  url: string,
  loadFunction: (url: string) => Promise<any>,
  config: PDFLoadConfig = DEFAULT_LOAD_CONFIG
): Promise<any> {
  const maxRetries = config.maxRetries || 3;
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Try with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('PDF loading timeout')), config.timeout || 30000);
      });
      
      const loadPromise = tryLoadWithProxies(url, loadFunction, config);
      const result = await Promise.race([loadPromise, timeoutPromise]);
      
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`PDF load attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt < maxRetries && config.retryDelay) {
        await new Promise(resolve => setTimeout(resolve, config.retryDelay * attempt));
      }
    }
  }
  
  throw lastError || new Error('Failed to load PDF after all retries');
}

/**
 * Enhanced error handler for PDF loading
 */
export interface PDFLoadError extends Error {
  code?: string;
  details?: any;
  suggestion?: string;
}

export function createPdfLoadError(
  message: string,
  code?: string,
  details?: any,
  suggestion?: string
): PDFLoadError {
  const error = new Error(message) as PDFLoadError;
  error.code = code;
  error.details = details;
  error.suggestion = suggestion;
  return error;
}

/**
 * Handle PDF loading errors and provide helpful messages
 */
export function handlePdfError(error: any): PDFLoadError {
  console.error('PDF loading error:', error);
  
  // CORS error
  if (error.message?.toLowerCase().includes('cors') || 
      error.message?.toLowerCase().includes('cross-origin')) {
    return createPdfLoadError(
      'Unable to load PDF due to CORS restrictions',
      'CORS_ERROR',
      error,
      'The PDF server does not allow cross-origin requests. Try downloading the PDF locally or using a different source.'
    );
  }
  
  // Network error
  if (error.message?.toLowerCase().includes('network') ||
      error.message?.toLowerCase().includes('fetch')) {
    return createPdfLoadError(
      'Network error while loading PDF',
      'NETWORK_ERROR',
      error,
      'Please check your internet connection and try again.'
    );
  }
  
  // Invalid PDF
  if (error.message?.toLowerCase().includes('invalid') ||
      error.message?.toLowerCase().includes('pdf')) {
    return createPdfLoadError(
      'The file appears to be an invalid or corrupted PDF',
      'INVALID_PDF',
      error,
      'Please ensure the file is a valid PDF document.'
    );
  }
  
  // Timeout
  if (error.message?.toLowerCase().includes('timeout')) {
    return createPdfLoadError(
      'PDF loading timed out',
      'TIMEOUT',
      error,
      'The PDF is taking too long to load. Try a smaller file or check your connection.'
    );
  }
  
  // Generic error
  return createPdfLoadError(
    error.message || 'Failed to load PDF',
    'UNKNOWN',
    error,
    'An unexpected error occurred. Please try again or use a different PDF.'
  );
}

/**
 * Sample PDF configurations for testing
 */
export const SAMPLE_PDFS = {
  test: {
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    name: 'Test PDF',
    description: 'A simple test PDF document'
  },
  large: {
    url: 'https://www.africau.edu/images/default/sample.pdf', 
    name: 'Sample Document',
    description: 'A sample PDF with multiple pages'
  }
};