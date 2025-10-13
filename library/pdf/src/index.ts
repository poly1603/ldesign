import { PDFViewer } from './core/PDFViewer';
import { Toolbar } from './components/Toolbar';
import { PDFViewerOptions, ToolbarConfig } from './types';
import './styles/index.css';

export interface UniversalPDFViewerOptions extends Partial<PDFViewerOptions> {
  container: string | HTMLElement;
  pdfUrl?: string;
  toolbarConfig?: ToolbarConfig;
}

export class UniversalPDFViewer {
  private container: HTMLElement;
  private wrapper: HTMLElement;
  private viewerContainer: HTMLElement;
  private viewer: PDFViewer;
  private toolbar: Toolbar | null = null;
  private options: UniversalPDFViewerOptions;

  constructor(options: UniversalPDFViewerOptions) {
    this.options = options;
    this.container = this.resolveContainer(options.container);
    this.wrapper = this.createWrapper();
    this.viewerContainer = this.createViewerContainer();
    
    // Initialize PDF viewer
    this.viewer = new PDFViewer(this.viewerContainer, options);
    
    // Initialize toolbar if enabled
    if (options.enableToolbar !== false) {
      this.toolbar = new Toolbar(this.wrapper, this.viewer, options.toolbarConfig);
    }
    
    // Load PDF if URL provided
    if (options.pdfUrl) {
      this.loadPDF(options.pdfUrl);
    }
    
    this.attachEventListeners();
  }

  private resolveContainer(container: string | HTMLElement): HTMLElement {
    if (typeof container === 'string') {
      const element = document.querySelector(container);
      if (!element) {
        throw new Error(`Container element "${container}" not found`);
      }
      return element as HTMLElement;
    }
    return container;
  }

  private createWrapper(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'universal-pdf-viewer';
    this.container.appendChild(wrapper);
    return wrapper;
  }

  private createViewerContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'pdf-viewer-main';
    this.wrapper.appendChild(container);
    return container;
  }

  private attachEventListeners(): void {
    // Add loading indicator
    this.viewer.on('loading', () => {
      this.showLoadingIndicator();
    });

    this.viewer.on('loaded', () => {
      this.hideLoadingIndicator();
    });

    this.viewer.on('error', (error) => {
      this.showError(error);
    });
  }

  private showLoadingIndicator(): void {
    const existing = this.wrapper.querySelector('.loading-indicator');
    if (existing) return;

    const indicator = document.createElement('div');
    indicator.className = 'loading-indicator';
    indicator.innerHTML = `
      <div class="spinner"></div>
      <p>Loading PDF...</p>
    `;
    this.wrapper.appendChild(indicator);
  }

  private hideLoadingIndicator(): void {
    const indicator = this.wrapper.querySelector('.loading-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  private showError(error: Error): void {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'pdf-error';
    errorDiv.innerHTML = `
      <div class="error-icon">⚠️</div>
      <h3>Error loading PDF</h3>
      <p>${error.message}</p>
    `;
    this.viewerContainer.appendChild(errorDiv);
  }

  // Public API methods
  public async loadPDF(source: string | ArrayBuffer | Uint8Array): Promise<void> {
    return this.viewer.loadPDF(source);
  }

  public nextPage(): void {
    this.viewer.nextPage();
  }

  public previousPage(): void {
    this.viewer.previousPage();
  }

  public goToPage(pageNum: number): void {
    this.viewer.goToPage(pageNum);
  }

  public zoomIn(): void {
    this.viewer.zoomIn();
  }

  public zoomOut(): void {
    this.viewer.zoomOut();
  }

  public setScale(scale: number): void {
    this.viewer.setScale(scale);
  }

  public rotate(angle: number): void {
    this.viewer.rotate(angle);
  }

  public search(query: string): Promise<void> {
    return this.viewer.search(query);
  }

  public print(): Promise<void> {
    return this.viewer.print();
  }

  public download(filename?: string): Promise<void> {
    return this.viewer.download(filename);
  }

  public setTheme(theme: 'light' | 'dark'): void {
    this.viewer.setTheme(theme);
  }

  public getCurrentPage(): number {
    return this.viewer.getCurrentPage();
  }

  public getTotalPages(): number {
    return this.viewer.getTotalPages();
  }

  public getScale(): number {
    return this.viewer.getScale();
  }

  public on(event: string, callback: Function): void {
    this.viewer.on(event, callback);
  }

  public off(event: string, callback: Function): void {
    this.viewer.off(event, callback);
  }

  public destroy(): void {
    this.viewer.destroy();
    this.wrapper.remove();
  }
}

// Export all types and classes
export { PDFViewer } from './core/PDFViewer';
export { Toolbar } from './components/Toolbar';
export * from './types';

// Default export for convenience
export default UniversalPDFViewer;