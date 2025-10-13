import { EventEmitter } from '../core/EventEmitter';
import type { PDFViewer, PrintOptions } from '../types';

export class PrintManager extends EventEmitter {
  private viewer: PDFViewer;
  private printWindow: Window | null = null;
  private isPrinting: boolean = false;
  private printOptions: PrintOptions = {};

  constructor(viewer: PDFViewer) {
    super();
    this.viewer = viewer;
    this.setupPrintHandlers();
  }

  /**
   * Setup print event handlers
   */
  private setupPrintHandlers(): void {
    // Listen for keyboard shortcut (Ctrl+P)
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        const container = this.viewer.options.container as HTMLElement;
        if (container && container.contains(document.activeElement)) {
          e.preventDefault();
          this.print();
        }
      }
    });

    // Listen for browser print events
    window.addEventListener('beforeprint', () => {
      this.emit('print-start');
    });

    window.addEventListener('afterprint', () => {
      this.emit('print-end');
      this.isPrinting = false;
    });
  }

  /**
   * Print the PDF document
   */
  async print(options?: PrintOptions): Promise<void> {
    if (this.isPrinting) {
      console.warn('Print already in progress');
      return;
    }

    if (!this.viewer.document) {
      throw new Error('No document loaded');
    }

    this.isPrinting = true;
    this.printOptions = { ...this.getDefaultOptions(), ...options };

    try {
      this.emit('print-preparing');

      // Parse page range
      const pages = this.parsePageRange(
        this.printOptions.pageRange || `1-${this.viewer.getTotalPages()}`
      );

      // Generate print content
      const printContent = await this.generatePrintContent(pages);

      // Open print preview
      this.openPrintPreview(printContent);

    } catch (error) {
      this.isPrinting = false;
      this.emit('print-error', error);
      throw error;
    }
  }

  /**
   * Print specific pages
   */
  async printPages(pageNumbers: number[], options?: PrintOptions): Promise<void> {
    const pageRange = pageNumbers.join(',');
    return this.print({ ...options, pageRange });
  }

  /**
   * Print current page
   */
  async printCurrentPage(options?: PrintOptions): Promise<void> {
    const currentPage = this.viewer.getCurrentPage();
    return this.printPages([currentPage], options);
  }

  /**
   * Generate print content
   */
  private async generatePrintContent(pageNumbers: number[]): Promise<string> {
    const canvases: HTMLCanvasElement[] = [];

    for (const pageNum of pageNumbers) {
      const canvas = await this.renderPageToCanvas(pageNum);
      canvases.push(canvas);
    }

    return this.createPrintHTML(canvases);
  }

  /**
   * Render a page to canvas for printing
   */
  private async renderPageToCanvas(pageNumber: number): Promise<HTMLCanvasElement> {
    if (!this.viewer.document) {
      throw new Error('Document not loaded');
    }

    const page = await this.viewer.document.getPage(pageNumber);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    // Calculate print scale
    const scale = this.calculatePrintScale(page);
    const viewport = page.getViewport({ scale, rotation: this.viewer.getRotation() });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Render page
    await page.render({
      canvasContext: context,
      viewport: viewport,
      intent: 'print',
      renderInteractiveForms: true
    }).promise;

    // Apply grayscale if needed
    if (this.printOptions.grayscale) {
      this.applyGrayscale(canvas);
    }

    return canvas;
  }

  /**
   * Calculate print scale based on options
   */
  private calculatePrintScale(page: any): number {
    const { scale, customScale, paperSize, orientation } = this.printOptions;

    if (scale === 'custom' && customScale) {
      return customScale;
    }

    const viewport = page.getViewport({ scale: 1 });
    const paperDimensions = this.getPaperDimensions(paperSize || 'A4');
    
    // Swap dimensions for landscape
    if (orientation === 'landscape') {
      [paperDimensions.width, paperDimensions.height] = 
        [paperDimensions.height, paperDimensions.width];
    }

    // Apply margins
    const margins = this.printOptions.margins || this.getDefaultMargins();
    const printWidth = paperDimensions.width - margins.left - margins.right;
    const printHeight = paperDimensions.height - margins.top - margins.bottom;

    if (scale === 'actual') {
      return 1;
    }

    // Calculate scale to fit
    const scaleX = printWidth / viewport.width;
    const scaleY = printHeight / viewport.height;

    return Math.min(scaleX, scaleY);
  }

  /**
   * Create HTML for printing
   */
  private createPrintHTML(canvases: HTMLCanvasElement[]): string {
    const margins = this.printOptions.margins || this.getDefaultMargins();
    const orientation = this.printOptions.orientation || 'portrait';

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print PDF</title>
        <style>
          @page {
            size: ${this.printOptions.paperSize || 'A4'} ${orientation};
            margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }
          
          .page {
            page-break-after: always;
            position: relative;
            width: 100%;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          .page:last-child {
            page-break-after: auto;
          }
          
          .page-canvas {
            max-width: 100%;
            max-height: 100%;
            ${this.printOptions.grayscale ? 'filter: grayscale(100%);' : ''}
          }
          
          .page-number {
            position: absolute;
            bottom: 10mm;
            right: 10mm;
            font-size: 10pt;
            color: #666;
          }
          
          .annotations {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
          }
          
          .annotation {
            position: absolute;
            border: 1px solid #ff0000;
            background: rgba(255, 255, 0, 0.2);
          }
          
          .comment {
            position: absolute;
            background: #ffffcc;
            border: 1px solid #000;
            padding: 2mm;
            font-size: 8pt;
            max-width: 50mm;
          }
          
          @media print {
            .no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
    `;

    canvases.forEach((canvas, index) => {
      const pageNum = this.parsePageRange(this.printOptions.pageRange || '')[index];
      const dataUrl = canvas.toDataURL('image/png');
      
      html += `
        <div class="page">
          <img class="page-canvas" src="${dataUrl}" />
          <div class="page-number">Page ${pageNum}</div>
      `;

      // Add annotations if enabled
      if (this.printOptions.printAnnotations) {
        html += this.generateAnnotationsHTML(pageNum);
      }

      // Add comments if enabled
      if (this.printOptions.printComments) {
        html += this.generateCommentsHTML(pageNum);
      }

      html += '</div>';
    });

    html += `
      </body>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          }, 500);
        };
      </script>
      </html>
    `;

    return html;
  }

  /**
   * Generate HTML for annotations
   */
  private generateAnnotationsHTML(pageNumber: number): string {
    // Get annotations from annotation manager if available
    const annotations = this.viewer.getAnnotations?.(pageNumber) || [];
    
    if (annotations.length === 0) {
      return '';
    }

    let html = '<div class="annotations">';
    
    annotations.forEach(annotation => {
      if (annotation.type === 'highlight' || annotation.type === 'underline') {
        html += `
          <div class="annotation" style="
            left: ${annotation.position.x}px;
            top: ${annotation.position.y}px;
            width: ${annotation.position.width}px;
            height: ${annotation.position.height}px;
            background-color: ${annotation.color || '#ffff00'};
            opacity: 0.3;
          "></div>
        `;
      }
    });
    
    html += '</div>';
    return html;
  }

  /**
   * Generate HTML for comments
   */
  private generateCommentsHTML(pageNumber: number): string {
    // Get annotations with comments
    const annotations = this.viewer.getAnnotations?.(pageNumber) || [];
    const comments = annotations.filter(a => a.content);
    
    if (comments.length === 0) {
      return '';
    }

    let html = '';
    let commentIndex = 1;
    
    comments.forEach(annotation => {
      html += `
        <div class="comment" style="
          left: ${annotation.position.x + annotation.position.width + 5}px;
          top: ${annotation.position.y}px;
        ">
          <strong>[${commentIndex}]</strong> ${annotation.content}
          ${annotation.author ? `<br><em>- ${annotation.author}</em>` : ''}
        </div>
      `;
      commentIndex++;
    });
    
    return html;
  }

  /**
   * Open print preview window
   */
  private openPrintPreview(content: string): void {
    // Close previous print window if exists
    if (this.printWindow && !this.printWindow.closed) {
      this.printWindow.close();
    }

    // Open new print window
    this.printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!this.printWindow) {
      throw new Error('Failed to open print preview window');
    }

    this.printWindow.document.write(content);
    this.printWindow.document.close();

    // Clean up after printing
    this.printWindow.onafterprint = () => {
      this.isPrinting = false;
      this.emit('print-complete');
    };
  }

  /**
   * Parse page range string
   */
  private parsePageRange(range: string): number[] {
    const pages: number[] = [];
    const totalPages = this.viewer.getTotalPages();
    
    // Split by comma
    const parts = range.split(',');
    
    for (const part of parts) {
      const trimmed = part.trim();
      
      if (trimmed.includes('-')) {
        // Handle range (e.g., "1-5")
        const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
        for (let i = start; i <= Math.min(end, totalPages); i++) {
          if (i > 0 && !pages.includes(i)) {
            pages.push(i);
          }
        }
      } else {
        // Handle single page
        const pageNum = parseInt(trimmed);
        if (pageNum > 0 && pageNum <= totalPages && !pages.includes(pageNum)) {
          pages.push(pageNum);
        }
      }
    }
    
    return pages.sort((a, b) => a - b);
  }

  /**
   * Apply grayscale filter to canvas
   */
  private applyGrayscale(canvas: HTMLCanvasElement): void {
    const context = canvas.getContext('2d');
    if (!context) return;

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;     // Red
      data[i + 1] = gray; // Green
      data[i + 2] = gray; // Blue
      // Alpha channel (data[i + 3]) remains unchanged
    }

    context.putImageData(imageData, 0, 0);
  }

  /**
   * Get paper dimensions in pixels (assuming 96 DPI)
   */
  private getPaperDimensions(paperSize: string): { width: number; height: number } {
    const dpi = 96;
    const mmToInch = 0.0393701;
    
    const sizes: Record<string, { width: number; height: number }> = {
      'A3': { width: 297, height: 420 },
      'A4': { width: 210, height: 297 },
      'Letter': { width: 216, height: 279 },
      'Legal': { width: 216, height: 356 }
    };

    const size = sizes[paperSize] || sizes['A4'];
    
    return {
      width: size.width * mmToInch * dpi,
      height: size.height * mmToInch * dpi
    };
  }

  /**
   * Get default print options
   */
  private getDefaultOptions(): PrintOptions {
    return {
      pageRange: `1-${this.viewer.getTotalPages()}`,
      scale: 'auto',
      orientation: 'portrait',
      paperSize: 'A4',
      margins: this.getDefaultMargins(),
      printAnnotations: true,
      printComments: false,
      grayscale: false
    };
  }

  /**
   * Get default margins in mm
   */
  private getDefaultMargins(): { top: number; right: number; bottom: number; left: number } {
    return {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    };
  }

  /**
   * Show print dialog
   */
  showPrintDialog(): void {
    // Create and show a custom print dialog
    const dialog = this.createPrintDialog();
    document.body.appendChild(dialog);
  }

  /**
   * Create print dialog UI
   */
  private createPrintDialog(): HTMLElement {
    const dialog = document.createElement('div');
    dialog.className = 'pdf-print-dialog';
    dialog.innerHTML = `
      <div class="dialog-overlay"></div>
      <div class="dialog-content">
        <h2>Print Options</h2>
        
        <div class="form-group">
          <label>Page Range:</label>
          <input type="text" id="print-page-range" value="1-${this.viewer.getTotalPages()}" />
          <small>e.g., 1-5, 8, 11-13</small>
        </div>
        
        <div class="form-group">
          <label>Scale:</label>
          <select id="print-scale">
            <option value="auto">Fit to page</option>
            <option value="actual">Actual size</option>
            <option value="custom">Custom</option>
          </select>
          <input type="number" id="print-custom-scale" value="100" min="10" max="500" style="display:none;" />
        </div>
        
        <div class="form-group">
          <label>Orientation:</label>
          <select id="print-orientation">
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Paper Size:</label>
          <select id="print-paper-size">
            <option value="A4">A4</option>
            <option value="A3">A3</option>
            <option value="Letter">Letter</option>
            <option value="Legal">Legal</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>
            <input type="checkbox" id="print-annotations" checked />
            Print annotations
          </label>
        </div>
        
        <div class="form-group">
          <label>
            <input type="checkbox" id="print-comments" />
            Print comments
          </label>
        </div>
        
        <div class="form-group">
          <label>
            <input type="checkbox" id="print-grayscale" />
            Grayscale
          </label>
        </div>
        
        <div class="dialog-buttons">
          <button id="btn-print-cancel">Cancel</button>
          <button id="btn-print-ok" class="primary">Print</button>
        </div>
      </div>
    `;

    // Add event listeners
    const scaleSelect = dialog.querySelector('#print-scale') as HTMLSelectElement;
    const customScaleInput = dialog.querySelector('#print-custom-scale') as HTMLInputElement;
    
    scaleSelect?.addEventListener('change', () => {
      customScaleInput.style.display = scaleSelect.value === 'custom' ? 'inline-block' : 'none';
    });

    dialog.querySelector('#btn-print-cancel')?.addEventListener('click', () => {
      dialog.remove();
    });

    dialog.querySelector('#btn-print-ok')?.addEventListener('click', () => {
      const options: PrintOptions = {
        pageRange: (dialog.querySelector('#print-page-range') as HTMLInputElement)?.value,
        scale: scaleSelect?.value as any,
        customScale: scaleSelect?.value === 'custom' 
          ? parseInt(customScaleInput?.value) / 100 
          : undefined,
        orientation: (dialog.querySelector('#print-orientation') as HTMLSelectElement)?.value as any,
        paperSize: (dialog.querySelector('#print-paper-size') as HTMLSelectElement)?.value as any,
        printAnnotations: (dialog.querySelector('#print-annotations') as HTMLInputElement)?.checked,
        printComments: (dialog.querySelector('#print-comments') as HTMLInputElement)?.checked,
        grayscale: (dialog.querySelector('#print-grayscale') as HTMLInputElement)?.checked
      };
      
      dialog.remove();
      this.print(options);
    });

    return dialog;
  }

  /**
   * Cancel current print job
   */
  cancelPrint(): void {
    if (this.printWindow && !this.printWindow.closed) {
      this.printWindow.close();
    }
    this.isPrinting = false;
    this.emit('print-cancelled');
  }

  /**
   * Check if printing is in progress
   */
  isPrintInProgress(): boolean {
    return this.isPrinting;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.cancelPrint();
  }
}