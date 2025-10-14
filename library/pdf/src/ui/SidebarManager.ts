import type { PDFViewer, SidebarConfig } from '../types';

export class SidebarManager {
  private viewer: PDFViewer;
  private config: SidebarConfig | boolean;
  private container: HTMLElement | null = null;
  private thumbnailsContainer: HTMLElement | null = null;
  private outlineContainer: HTMLElement | null = null;
  private currentPanel: string = 'thumbnails';

  constructor(viewer: PDFViewer, config: SidebarConfig | boolean = true) {
    this.viewer = viewer;
    this.config = config;
    this.init();
  }

  private init(): void {
    this.createSidebar();
    this.attachEventListeners();
  }

  private createSidebar(): void {
    const sidebar = document.createElement('div');
    sidebar.className = 'pdf-sidebar';
    
    // Sidebar tabs
    const tabs = document.createElement('div');
    tabs.className = 'pdf-sidebar-tabs';
    
    const thumbnailsTab = this.createTab('thumbnails', 'Thumbnails', 'Thumbnails');
    const outlineTab = this.createTab('outline', 'Bookmarks', 'Bookmarks');
    
    thumbnailsTab.classList.add('active');
    
    tabs.appendChild(thumbnailsTab);
    tabs.appendChild(outlineTab);
    
    // Sidebar content
    const content = document.createElement('div');
    content.className = 'pdf-sidebar-content';
    
    // Thumbnails panel
    this.thumbnailsContainer = document.createElement('div');
    this.thumbnailsContainer.className = 'pdf-thumbnails-panel';
    this.thumbnailsContainer.style.display = 'block';
    
    // Outline panel
    this.outlineContainer = document.createElement('div');
    this.outlineContainer.className = 'pdf-outline-panel';
    this.outlineContainer.style.display = 'none';
    
    content.appendChild(this.thumbnailsContainer);
    content.appendChild(this.outlineContainer);
    
    sidebar.appendChild(tabs);
    sidebar.appendChild(content);
    
    this.container = sidebar;
    
    // Add to viewer container
    const viewerElement = this.viewer.container?.querySelector('.pdf-viewer');
    if (viewerElement) {
      // Prefer inserting into the main content wrapper
      const mainContainer = viewerElement.querySelector('.pdf-main');
      const canvasContainer = viewerElement.querySelector('.pdf-canvas-container');
      if (mainContainer && canvasContainer && canvasContainer.parentElement === mainContainer) {
        mainContainer.insertBefore(sidebar, canvasContainer);
      } else if (canvasContainer) {
        // Fallback: insert before canvas container in viewer
        (canvasContainer.parentElement || viewerElement).insertBefore(sidebar, canvasContainer);
      } else if (mainContainer) {
        mainContainer.insertBefore(sidebar, mainContainer.firstChild);
      } else {
        viewerElement.insertBefore(sidebar, viewerElement.firstChild);
      }
    }
    
    // Set initial state
    if (typeof this.config === 'object') {
      if (this.config.defaultPanel) {
        this.switchPanel(this.config.defaultPanel);
      }
      if (this.config.width) {
        sidebar.style.width = typeof this.config.width === 'number' 
          ? `${this.config.width}px` 
          : this.config.width;
      }
    }
  }

  private createTab(name: string, text: string, title: string): HTMLElement {
    const tab = document.createElement('button');
    tab.className = `pdf-sidebar-tab pdf-tab-${name}`;
    tab.textContent = text;
    tab.title = title;
    tab.addEventListener('click', () => this.switchPanel(name));
    return tab;
  }

  private attachEventListeners(): void {
    // Listen for document load to generate thumbnails
    this.viewer.on('document-loaded', () => {
      this.generateThumbnails();
      this.loadOutline();
    });
    
    // Listen for page changes to highlight current thumbnail
    this.viewer.on('page-change', (pageNumber: number) => {
      this.highlightCurrentThumbnail(pageNumber);
    });
  }

  private switchPanel(panelName: string): void {
    this.currentPanel = panelName;
    
    // Update tab styles
    const tabs = this.container?.querySelectorAll('.pdf-sidebar-tab');
    tabs?.forEach(tab => {
      tab.classList.remove('active');
      if (tab.classList.contains(`pdf-tab-${panelName}`)) {
        tab.classList.add('active');
      }
    });
    
    // Show/hide panels
    if (this.thumbnailsContainer) {
      this.thumbnailsContainer.style.display = 
        panelName === 'thumbnails' ? 'block' : 'none';
    }
    if (this.outlineContainer) {
      this.outlineContainer.style.display = 
        panelName === 'outline' ? 'block' : 'none';
    }
  }

  /**
   * Generate thumbnails for all pages
   */
  async generateThumbnails(): Promise<void> {
    if (!this.thumbnailsContainer || !this.viewer.document) {
      return;
    }
    
    this.thumbnailsContainer.innerHTML = '';
    
    const totalPages = this.viewer.getTotalPages();
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const thumbnailItem = document.createElement('div');
      thumbnailItem.className = 'pdf-thumbnail-item';
      thumbnailItem.dataset.pageNumber = pageNum.toString();
      
      const thumbnailCanvas = document.createElement('canvas');
      thumbnailCanvas.className = 'pdf-thumbnail-canvas';
      
      const thumbnailLabel = document.createElement('div');
      thumbnailLabel.className = 'pdf-thumbnail-label';
      thumbnailLabel.textContent = pageNum.toString();
      
      thumbnailItem.appendChild(thumbnailCanvas);
      thumbnailItem.appendChild(thumbnailLabel);
      
      // Click handler
      thumbnailItem.addEventListener('click', () => {
        this.viewer.goToPage(pageNum);
      });
      
      this.thumbnailsContainer.appendChild(thumbnailItem);
      
      // Render thumbnail asynchronously
      this.renderThumbnail(pageNum, thumbnailCanvas);
    }
    
    // Highlight current page
    this.highlightCurrentThumbnail(this.viewer.getCurrentPage());
  }

  private async renderThumbnail(pageNumber: number, canvas: HTMLCanvasElement): Promise<void> {
    try {
      if (!this.viewer.document) {
        return;
      }
      
      const page = await this.viewer.document.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 0.3 });
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await page.render({
          canvasContext: ctx,
          viewport: viewport
        }).promise;
      }
    } catch (error) {
      console.error(`Failed to render thumbnail for page ${pageNumber}:`, error);
      // Fallback to placeholder
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 100;
        canvas.height = 140;
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#dee2e6';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(pageNumber.toString(), 50, 75);
      }
    }
  }

  private highlightCurrentThumbnail(pageNumber: number): void {
    const thumbnails = this.thumbnailsContainer?.querySelectorAll('.pdf-thumbnail-item');
    thumbnails?.forEach(thumbnail => {
      const element = thumbnail as HTMLElement;
      if (element.dataset.pageNumber === pageNumber.toString()) {
        element.classList.add('active');
        // Scroll into view
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        element.classList.remove('active');
      }
    });
  }

  /**
   * Public method to highlight thumbnail
   */
  public highlightThumbnail(pageNumber: number): void {
    this.highlightCurrentThumbnail(pageNumber);
  }

  /**
   * Load and display document outline
   */
  private async loadOutline(): Promise<void> {
    if (!this.outlineContainer || !this.viewer.document) {
      return;
    }
    
    this.outlineContainer.innerHTML = '';
    
    try {
      // This would load the actual outline from the PDF
      // For now, show a placeholder
      const placeholder = document.createElement('div');
      placeholder.className = 'pdf-outline-placeholder';
      placeholder.textContent = 'No bookmarks available';
      this.outlineContainer.appendChild(placeholder);
    } catch (error) {
      console.error('Failed to load outline:', error);
    }
  }

  /**
   * Toggle sidebar visibility
   */
  toggle(): void {
    if (this.container) {
      this.container.classList.toggle('hidden');
    }
  }

  /**
   * Show the sidebar
   */
  show(): void {
    if (this.container) {
      this.container.classList.remove('hidden');
    }
  }

  /**
   * Hide the sidebar
   */
  hide(): void {
    if (this.container) {
      this.container.classList.add('hidden');
    }
  }

  /**
   * Destroy the sidebar
   */
  destroy(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    this.thumbnailsContainer = null;
    this.outlineContainer = null;
  }
}