/**
 * Renderer type definitions
 */

import type { ViewerOptions, DocumentMetadata, Annotation } from './viewer';

/**
 * Base renderer interface
 */
export interface IRenderer {
 /**
  * Initialize the renderer
  */
 initialize(container: HTMLElement, options: ViewerOptions): Promise<void>;

 /**
  * Render the document
  */
 render(data: ArrayBuffer): Promise<void>;

 /**
  * Get document metadata
  */
 getMetadata(data: ArrayBuffer): Promise<DocumentMetadata>;

 /**
  * Search in document
  */
 search?(query: string): Promise<any[]>;

 /**
  * Add annotation
  */
 addAnnotation?(annotation: Annotation): void;

 /**
  * Remove annotation
  */
 removeAnnotation?(annotationId: string): void;

 /**
  * Export document
  */
 export?(format: 'pdf' | 'html' | 'text'): Promise<Blob>;

 /**
  * Zoom control
  */
 setZoom?(level: number): void;
 getZoom?(): number;

 /**
  * Navigate
  */
 goToPage?(page: number): void;
 getCurrentPage?(): number;

 /**
  * Destroy and cleanup
  */
 destroy(): void;
}

/**
 * Renderer factory
 */
export interface IRendererFactory {
 createRenderer(type: string): IRenderer;
}

/**
 * Parse result
 */
export interface ParseResult<T = any> {
 success: boolean;
 data?: T;
 error?: Error;
 warnings?: string[];
}
