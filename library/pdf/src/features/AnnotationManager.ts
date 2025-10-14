import { EventEmitter } from '../core/EventEmitter';
import type { 
  PDFViewer, 
  Annotation, 
  AnnotationReply,
  DrawingAnnotation,
  DrawingPath 
} from '../types';

export class AnnotationManager extends EventEmitter {
  private viewer: PDFViewer;
  private annotations: Map<string, Annotation> = new Map();
  private selectedAnnotation: Annotation | null = null;
  private isDrawingMode: boolean = false;
  private currentDrawingPath: DrawingPath | null = null;
  private annotationLayer: HTMLElement | null = null;

  constructor(viewer: PDFViewer) {
    super();
    this.viewer = viewer;
    this.setupAnnotationLayer();
    this.bindEvents();
  }

  /**
   * Setup annotation layer
   */
  private setupAnnotationLayer(): void {
    // Don't create a separate blocking layer - use the existing annotation layers
    // in each page wrapper or canvas container
    // This method is now a no-op but kept for compatibility
    // Annotations will be rendered within individual page annotation layers
  }

  /**
   * Bind event listeners
   */
  private bindEvents(): void {
    // Event listeners will be attached to individual page annotation layers
    // when they are created, not to a global blocking layer
    
    // Listen to page changes
    this.viewer.on('page-changed', () => {
      this.renderAnnotations();
    });
  }

  /**
   * Add an annotation
   */
  addAnnotation(annotation: Omit<Annotation, 'id' | 'createdAt'>): Annotation {
    const newAnnotation: Annotation = {
      ...annotation,
      id: this.generateId(),
      createdAt: new Date(),
      replies: []
    };

    this.annotations.set(newAnnotation.id, newAnnotation);
    this.renderAnnotation(newAnnotation);
    this.emit('annotation-added', newAnnotation);
    
    return newAnnotation;
  }

  /**
   * Add highlight annotation
   */
  addHighlight(pageNumber: number, position: any, color: string = '#ffff00'): Annotation {
    return this.addAnnotation({
      type: 'highlight',
      pageNumber,
      position,
      color,
      author: this.getDefaultAuthor()
    });
  }

  /**
   * Add text annotation
   */
  addTextNote(pageNumber: number, position: any, content: string): Annotation {
    return this.addAnnotation({
      type: 'text',
      pageNumber,
      position,
      content,
      author: this.getDefaultAuthor()
    });
  }

  /**
   * Add underline annotation
   */
  addUnderline(pageNumber: number, position: any, color: string = '#00ff00'): Annotation {
    return this.addAnnotation({
      type: 'underline',
      pageNumber,
      position,
      color,
      author: this.getDefaultAuthor()
    });
  }

  /**
   * Add strikeout annotation
   */
  addStrikeout(pageNumber: number, position: any, color: string = '#ff0000'): Annotation {
    return this.addAnnotation({
      type: 'strikeout',
      pageNumber,
      position,
      color,
      author: this.getDefaultAuthor()
    });
  }

  /**
   * Start drawing mode
   */
  startDrawing(color: string = '#000000', strokeWidth: number = 2): void {
    this.isDrawingMode = true;
    // Update cursor on canvas container instead of annotation layer
    const canvasContainer = document.querySelector('.pdf-canvas-container') as HTMLElement;
    if (canvasContainer) {
      canvasContainer.style.cursor = 'crosshair';
    }
    
    this.currentDrawingPath = {
      points: [],
      strokeColor: color,
      strokeWidth
    };
  }

  /**
   * Stop drawing mode
   */
  stopDrawing(): void {
    this.isDrawingMode = false;
    // Reset cursor on canvas container
    const canvasContainer = document.querySelector('.pdf-canvas-container') as HTMLElement;
    if (canvasContainer) {
      canvasContainer.style.cursor = 'default';
    }
    this.currentDrawingPath = null;
  }

  /**
   * Update an annotation
   */
  updateAnnotation(id: string, updates: Partial<Annotation>): void {
    const annotation = this.annotations.get(id);
    if (annotation) {
      Object.assign(annotation, updates, { modifiedAt: new Date() });
      this.renderAnnotation(annotation);
      this.emit('annotation-updated', annotation);
    }
  }

  /**
   * Remove an annotation
   */
  removeAnnotation(id: string): void {
    const annotation = this.annotations.get(id);
    if (annotation) {
      this.annotations.delete(id);
      this.removeAnnotationElement(id);
      this.emit('annotation-removed', annotation);
    }
  }

  /**
   * Add a reply to an annotation
   */
  addReply(annotationId: string, content: string, author?: string): void {
    const annotation = this.annotations.get(annotationId);
    if (annotation) {
      const reply: AnnotationReply = {
        id: this.generateId(),
        content,
        author: author || this.getDefaultAuthor(),
        createdAt: new Date()
      };
      
      if (!annotation.replies) {
        annotation.replies = [];
      }
      annotation.replies.push(reply);
      
      this.emit('reply-added', annotation, reply);
    }
  }

  /**
   * Get annotations for a specific page
   */
  getPageAnnotations(pageNumber: number): Annotation[] {
    return Array.from(this.annotations.values())
      .filter(ann => ann.pageNumber === pageNumber);
  }

  /**
   * Get all annotations
   */
  getAllAnnotations(): Annotation[] {
    return Array.from(this.annotations.values());
  }

  /**
   * Select an annotation
   */
  selectAnnotation(id: string): void {
    const annotation = this.annotations.get(id);
    if (annotation) {
      this.selectedAnnotation = annotation;
      this.highlightAnnotation(id);
      this.emit('annotation-selected', annotation);
    }
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    if (this.selectedAnnotation) {
      this.unhighlightAnnotation(this.selectedAnnotation.id);
      this.selectedAnnotation = null;
      this.emit('selection-cleared');
    }
  }

  /**
   * Search annotations
   */
  searchAnnotations(query: string): Annotation[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.annotations.values()).filter(ann => {
      if (ann.content && ann.content.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      if (ann.replies) {
        return ann.replies.some(reply => 
          reply.content.toLowerCase().includes(lowerQuery)
        );
      }
      return false;
    });
  }

  /**
   * Export annotations
   */
  exportAnnotations(format: 'json' | 'xml' = 'json'): string {
    const annotations = this.getAllAnnotations();
    
    if (format === 'json') {
      return JSON.stringify(annotations, null, 2);
    } else {
      return this.convertToXML(annotations);
    }
  }

  /**
   * Import annotations
   */
  importAnnotations(data: string, format: 'json' | 'xml' = 'json'): void {
    let annotations: Annotation[];
    
    if (format === 'json') {
      annotations = JSON.parse(data);
    } else {
      annotations = this.parseXML(data);
    }

    annotations.forEach(ann => {
      this.annotations.set(ann.id, ann);
    });

    this.renderAnnotations();
    this.emit('annotations-imported', annotations);
  }

  /**
   * Render all annotations for current page
   */
  private renderAnnotations(): void {
    if (!this.annotationLayer) return;

    // Clear existing annotations
    this.annotationLayer.innerHTML = '';

    const currentPage = this.viewer.getCurrentPage();
    const pageAnnotations = this.getPageAnnotations(currentPage);

    pageAnnotations.forEach(annotation => {
      this.renderAnnotation(annotation);
    });
  }

  /**
   * Render a single annotation
   */
  private renderAnnotation(annotation: Annotation): void {
    if (!this.annotationLayer) return;

    // Remove existing element if it exists
    this.removeAnnotationElement(annotation.id);

    const element = document.createElement('div');
    element.className = `pdf-annotation pdf-annotation-${annotation.type}`;
    element.id = `annotation-${annotation.id}`;
    element.style.position = 'absolute';
    element.style.left = `${annotation.position.x}px`;
    element.style.top = `${annotation.position.y}px`;
    element.style.width = `${annotation.position.width}px`;
    element.style.height = `${annotation.position.height}px`;

    switch (annotation.type) {
      case 'highlight':
        element.style.backgroundColor = annotation.color || '#ffff00';
        element.style.opacity = '0.3';
        break;
      
      case 'underline':
        element.style.borderBottom = `2px solid ${annotation.color || '#00ff00'}`;
        break;
      
      case 'strikeout':
        element.style.textDecoration = 'line-through';
        element.style.textDecorationColor = annotation.color || '#ff0000';
        break;
      
      case 'text':
        element.innerHTML = `
          <div class="annotation-icon">💬</div>
          <div class="annotation-popup" style="display: none;">
            <div class="annotation-content">${annotation.content || ''}</div>
            <div class="annotation-author">- ${annotation.author || 'Anonymous'}</div>
          </div>
        `;
        break;
      
      case 'drawing':
        if ((annotation as DrawingAnnotation).paths) {
          const svg = this.createSVGFromPaths((annotation as DrawingAnnotation).paths);
          element.appendChild(svg);
        }
        break;
    }

    element.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectAnnotation(annotation.id);
    });

    this.annotationLayer.appendChild(element);
  }

  /**
   * Remove annotation element from DOM
   */
  private removeAnnotationElement(id: string): void {
    const element = document.getElementById(`annotation-${id}`);
    if (element) {
      element.remove();
    }
  }

  /**
   * Highlight an annotation
   */
  private highlightAnnotation(id: string): void {
    const element = document.getElementById(`annotation-${id}`);
    if (element) {
      element.classList.add('annotation-selected');
    }
  }

  /**
   * Unhighlight an annotation
   */
  private unhighlightAnnotation(id: string): void {
    const element = document.getElementById(`annotation-${id}`);
    if (element) {
      element.classList.remove('annotation-selected');
    }
  }

  /**
   * Handle click events
   */
  private handleClick(event: MouseEvent): void {
    if (!this.isDrawingMode && event.target === this.annotationLayer) {
      this.clearSelection();
    }
  }

  /**
   * Handle mouse down events for drawing
   */
  private handleMouseDown(event: MouseEvent): void {
    if (this.isDrawingMode && this.currentDrawingPath) {
      const rect = this.annotationLayer!.getBoundingClientRect();
      this.currentDrawingPath.points.push({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
  }

  /**
   * Handle mouse move events for drawing
   */
  private handleMouseMove(event: MouseEvent): void {
    if (this.isDrawingMode && this.currentDrawingPath && event.buttons === 1) {
      const rect = this.annotationLayer!.getBoundingClientRect();
      this.currentDrawingPath.points.push({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
      // Render drawing in real-time
      this.renderCurrentDrawing();
    }
  }

  /**
   * Handle mouse up events for drawing
   */
  private handleMouseUp(event: MouseEvent): void {
    if (this.isDrawingMode && this.currentDrawingPath && this.currentDrawingPath.points.length > 0) {
      // Calculate bounding box
      const bounds = this.calculateBounds(this.currentDrawingPath.points);
      
      // Create drawing annotation
      const drawingAnnotation: Omit<DrawingAnnotation, 'id' | 'createdAt'> = {
        type: 'drawing',
        pageNumber: this.viewer.getCurrentPage(),
        position: bounds,
        paths: [this.currentDrawingPath],
        author: this.getDefaultAuthor()
      };

      this.addAnnotation(drawingAnnotation);
      
      // Reset current path
      this.currentDrawingPath = {
        points: [],
        strokeColor: this.currentDrawingPath.strokeColor,
        strokeWidth: this.currentDrawingPath.strokeWidth
      };
    }
  }

  /**
   * Render current drawing
   */
  private renderCurrentDrawing(): void {
    // Implementation for real-time drawing preview
  }

  /**
   * Calculate bounds from points
   */
  private calculateBounds(points: { x: number; y: number }[]): any {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    };
  }

  /**
   * Create SVG from drawing paths
   */
  private createSVGFromPaths(paths: DrawingPath[]): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.position = 'absolute';
    svg.style.pointerEvents = 'none';

    paths.forEach(path => {
      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const d = path.points.map((p, i) => 
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
      ).join(' ');
      
      pathElement.setAttribute('d', d);
      pathElement.setAttribute('stroke', path.strokeColor);
      pathElement.setAttribute('stroke-width', path.strokeWidth.toString());
      pathElement.setAttribute('fill', 'none');
      
      svg.appendChild(pathElement);
    });

    return svg;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `ann-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get default author name
   */
  private getDefaultAuthor(): string {
    return 'User';
  }

  /**
   * Convert annotations to XML
   */
  private convertToXML(annotations: Annotation[]): string {
    // XML conversion implementation
    return '<annotations></annotations>';
  }

  /**
   * Parse XML to annotations
   */
  private parseXML(xml: string): Annotation[] {
    // XML parsing implementation
    return [];
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.annotationLayer) {
      this.annotationLayer.remove();
    }
    this.annotations.clear();
    this.selectedAnnotation = null;
  }
}