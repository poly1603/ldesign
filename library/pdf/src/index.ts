import './styles/pdf-viewer.css';
import { PDFViewer } from './core/PDFViewer';
import type { PDFViewerOptions } from './types';

// Export types
export * from './types';

// Export core classes
export { PDFViewer } from './core/PDFViewer';
export { PDFRenderer } from './core/PDFRenderer';
export { EventEmitter } from './core/EventEmitter';

// Main export function
export function createPDFViewer(options: PDFViewerOptions): PDFViewer {
  const viewer = new PDFViewer(options);
  
  // Auto-initialize if container is provided
  if (options.container) {
    viewer.init().catch(error => {
      console.error('Failed to initialize PDF viewer:', error);
      if (options.onError) {
        options.onError(error);
      }
    });
  }
  
  return viewer;
}

// Default export
export default {
  create: createPDFViewer,
  PDFViewer,
  version: '1.0.0'
};

// Global variable for non-module usage
if (typeof window !== 'undefined') {
  (window as any).PDFViewer = {
    create: createPDFViewer,
    PDFViewer,
    version: '1.0.0'
  };
}