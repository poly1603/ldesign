/**
 * Office Document Renderer
 * A high-performance, framework-agnostic plugin for rendering Word, Excel, and PPT files
 */

import { WordRenderer } from './renderers/word-renderer';
import { ExcelRenderer } from './renderers/excel-renderer';
import { PowerPointRenderer } from './renderers/powerpoint-renderer';
import {
  DocumentType,
  RenderOptions,
  LoadOptions,
  RenderResult,
  WordRenderOptions,
  ExcelRenderOptions,
  PowerPointRenderOptions
} from './types';
import {
  detectDocumentType,
  fileToArrayBuffer,
  base64ToArrayBuffer,
  loadFromUrl,
  getContainer,
  isWebWorkerSupported
} from './utils';

// Export types
export * from './types';
export * from './utils';

/**
 * Main class for rendering office documents
 */
export class OfficeDocument {
  private container: HTMLElement;
  private options: RenderOptions;
  private renderer: any = null;
  private renderResult: RenderResult | null = null;

  constructor(options: RenderOptions) {
    this.container = getContainer(options.container);
    this.options = {
      toolbar: true,
      zoom: true,
      search: true,
      print: true,
      download: true,
      renderMode: 'html',
      useWebWorker: false,
      virtualScrolling: false,
      lazyLoad: true,
      cache: true,
      initialZoom: 100,
      ...options
    };

    // Check Web Worker support
    if (this.options.useWebWorker && !isWebWorkerSupported()) {
      console.warn('Web Worker is not supported, falling back to main thread rendering');
      this.options.useWebWorker = false;
    }
  }

  /**
   * Load and render a document
   */
  async load(loadOptions: LoadOptions): Promise<RenderResult> {
    try {
      // Get document data as ArrayBuffer
      let arrayBuffer: ArrayBuffer;

      if (loadOptions.file) {
        arrayBuffer = await fileToArrayBuffer(loadOptions.file);
      } else if (loadOptions.url) {
        arrayBuffer = await loadFromUrl(loadOptions.url, {
          headers: loadOptions.headers,
          credentials: loadOptions.credentials
        });
      } else if (loadOptions.arrayBuffer) {
        arrayBuffer = loadOptions.arrayBuffer;
      } else if (loadOptions.base64) {
        arrayBuffer = base64ToArrayBuffer(loadOptions.base64);
      } else {
        throw new Error('No valid document source provided');
      }

      // Detect document type
      let docType: DocumentType | null = null;
      
      if (loadOptions.file instanceof File) {
        docType = detectDocumentType(loadOptions.file);
      } else if (loadOptions.url) {
        docType = detectDocumentType(loadOptions.url);
      }

      if (!docType) {
        throw new Error('Unable to detect document type');
      }

      // Render based on document type
      return await this.render(arrayBuffer, docType);
    } catch (error) {
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * Render a document from ArrayBuffer
   */
  async render(data: ArrayBuffer, type: DocumentType): Promise<RenderResult> {
    // Destroy previous renderer if exists
    if (this.renderResult) {
      this.renderResult.destroy();
    }

    switch (type) {
      case 'word':
        this.renderer = new WordRenderer(this.container, this.options as WordRenderOptions);
        break;
      
      case 'excel':
        this.renderer = new ExcelRenderer(this.container, this.options as ExcelRenderOptions);
        break;
      
      case 'powerpoint':
        this.renderer = new PowerPointRenderer(this.container, this.options as PowerPointRenderOptions);
        break;
      
      case 'pdf':
        // PDF renderer would be implemented similarly
        throw new Error('PDF rendering not yet implemented');
      
      default:
        throw new Error(`Unsupported document type: ${type}`);
    }

    this.renderResult = await this.renderer.render(data);
    return this.renderResult;
  }

  /**
   * Load and render a Word document
   */
  static async renderWord(
    loadOptions: LoadOptions,
    renderOptions: WordRenderOptions
  ): Promise<RenderResult> {
    const doc = new OfficeDocument(renderOptions);
    return doc.load(loadOptions);
  }

  /**
   * Load and render an Excel spreadsheet
   */
  static async renderExcel(
    loadOptions: LoadOptions,
    renderOptions: ExcelRenderOptions
  ): Promise<RenderResult> {
    const doc = new OfficeDocument(renderOptions);
    return doc.load(loadOptions);
  }

  /**
   * Load and render a PowerPoint presentation
   */
  static async renderPowerPoint(
    loadOptions: LoadOptions,
    renderOptions: PowerPointRenderOptions
  ): Promise<RenderResult> {
    const doc = new OfficeDocument(renderOptions);
    return doc.load(loadOptions);
  }

  /**
   * Destroy the renderer and clean up resources
   */
  destroy(): void {
    if (this.renderResult) {
      this.renderResult.destroy();
      this.renderResult = null;
    }
    this.renderer = null;
  }

  /**
   * Get current render result
   */
  getRenderResult(): RenderResult | null {
    return this.renderResult;
  }
}

// Default export
export default OfficeDocument;