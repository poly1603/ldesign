import type { PDFViewer, SidebarConfig } from '../types';

export class SidebarManager {
  private viewer: PDFViewer;
  private config: SidebarConfig | boolean;
  private container: HTMLElement | null = null;
  private thumbnailsContainer: HTMLElement | null = null;
  private outlineContainer: HTMLElement | null = null;
  private currentPanel: string = 'thumbnails';
  private intersectionObserver: IntersectionObserver | null = null;
  private renderedThumbnails: Set<number> = new Set();

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
   * Generate thumbnails for all pages with lazy loading
   */
  async generateThumbnails(): Promise<void> {
    if (!this.thumbnailsContainer || !this.viewer.document) {
      return;
    }

    this.thumbnailsContainer.innerHTML = '';
    this.renderedThumbnails.clear();

    // Setup intersection observer for lazy loading
    this.setupIntersectionObserver();

    const totalPages = this.viewer.getTotalPages();

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const thumbnailItem = document.createElement('div');
      thumbnailItem.className = 'pdf-thumbnail-item';
      thumbnailItem.dataset.pageNumber = pageNum.toString();

      // Add loading placeholder
      const placeholder = document.createElement('div');
      placeholder.className = 'pdf-thumbnail-placeholder';
      placeholder.style.cssText = `
        width: 180px;
        height: 240px;
        background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #94a3b8;
        font-size: 14px;
        font-weight: 500;
      `;
      placeholder.textContent = 'Loading...';

      const thumbnailCanvas = document.createElement('canvas');
      thumbnailCanvas.className = 'pdf-thumbnail-canvas';
      thumbnailCanvas.style.display = 'none'; // Initially hidden

      const thumbnailLabel = document.createElement('div');
      thumbnailLabel.className = 'pdf-thumbnail-label';
      thumbnailLabel.textContent = pageNum.toString();

      thumbnailItem.appendChild(placeholder);
      thumbnailItem.appendChild(thumbnailCanvas);
      thumbnailItem.appendChild(thumbnailLabel);

      // Click handler
      thumbnailItem.addEventListener('click', () => {
        this.viewer.goToPage(pageNum);
      });

      this.thumbnailsContainer.appendChild(thumbnailItem);
    }

    // Highlight current page
    this.highlightCurrentThumbnail(this.viewer.getCurrentPage());
  }

  /**
   * Setup intersection observer for lazy loading thumbnails
   */
  private setupIntersectionObserver(): void {
    // Clean up existing observer
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    const options = {
      root: this.thumbnailsContainer,
      rootMargin: '100px', // Start loading 100px before visible
      threshold: 0.01
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const thumbnailItem = entry.target as HTMLElement;
          const pageNumber = parseInt(thumbnailItem.dataset.pageNumber || '0', 10);

          if (pageNumber && !this.renderedThumbnails.has(pageNumber)) {
            this.renderedThumbnails.add(pageNumber);
            this.loadThumbnail(thumbnailItem, pageNumber);
          }
        }
      });
    }, options);

    // Observe all thumbnail items
    const items = this.thumbnailsContainer?.querySelectorAll('.pdf-thumbnail-item');
    items?.forEach(item => {
      this.intersectionObserver?.observe(item);
    });
  }

  /**
   * Load a specific thumbnail
   */
  private async loadThumbnail(thumbnailItem: HTMLElement, pageNumber: number): Promise<void> {
    const placeholder = thumbnailItem.querySelector('.pdf-thumbnail-placeholder') as HTMLElement;
    const canvas = thumbnailItem.querySelector('.pdf-thumbnail-canvas') as HTMLCanvasElement;

    if (!canvas) return;

    try {
      // Render the thumbnail
      await this.renderThumbnail(pageNumber, canvas);

      // Hide placeholder and show canvas
      if (placeholder) {
        placeholder.style.display = 'none';
      }
      canvas.style.display = 'block';

      // Add fade-in animation
      canvas.style.opacity = '0';
      canvas.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        canvas.style.opacity = '1';
      }, 10);
    } catch (error) {
      console.error(`Failed to load thumbnail ${pageNumber}:`, error);
      if (placeholder) {
        placeholder.textContent = 'Failed';
        placeholder.style.background = '#fee';
        placeholder.style.color = '#c33';
      }
    }
  }

  private async renderThumbnail(pageNumber: number, canvas: HTMLCanvasElement): Promise<void> {
    try {
      if (!this.viewer.document) {
        console.error('No PDF document available for thumbnail rendering');
        return;
      }

      const page = await this.viewer.document.getPage(pageNumber);

      // Define target display size for thumbnails
      const TARGET_WIDTH = 180; // Max display width in pixels
      const RENDER_SCALE = 1.5; // Reduced scale for better performance

      // Get original page dimensions
      const originalViewport = page.getViewport({ scale: 1 });
      const pageAspectRatio = originalViewport.width / originalViewport.height;

      // Calculate proper scale to fit within target width
      const scale = TARGET_WIDTH / originalViewport.width;
      const viewport = page.getViewport({ scale: scale * RENDER_SCALE });

      // Set canvas internal resolution (for rendering)
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      // Set canvas display size (via inline styles)
      canvas.style.width = `${TARGET_WIDTH}px`;
      canvas.style.height = `${Math.floor(TARGET_WIDTH / pageAspectRatio)}px`;
      canvas.style.maxWidth = '100%';
      canvas.style.display = 'block';

      const ctx = canvas.getContext('2d', { alpha: false });
      if (ctx) {
        // Clear canvas and set white background
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Render PDF page
        const renderTask = page.render({
          canvasContext: ctx,
          viewport: viewport,
          intent: 'display'
        });
        
        await renderTask.promise;
        ctx.restore();
        
        console.log(`Thumbnail ${pageNumber} rendered successfully`);
      } else {
        console.error(`Failed to get canvas context for thumbnail ${pageNumber}`);
      }
    } catch (error) {
      console.error(`Failed to render thumbnail for page ${pageNumber}:`, error);
      // Fallback to placeholder
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const TARGET_WIDTH = 180;
        const TARGET_HEIGHT = 240;

        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;
        canvas.style.width = `${TARGET_WIDTH}px`;
        canvas.style.height = `${TARGET_HEIGHT}px`;

        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#6c757d';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pageNumber.toString(), canvas.width / 2, canvas.height / 2);
      }
    }
  }

  private highlightCurrentThumbnail(pageNumber: number): void {
    const thumbnails = this.thumbnailsContainer?.querySelectorAll('.pdf-thumbnail-item');
    thumbnails?.forEach(thumbnail => {
      const element = thumbnail as HTMLElement;
      if (element.dataset.pageNumber === pageNumber.toString()) {
        element.classList.add('active');
        // Smooth scroll with better positioning
        setTimeout(() => {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }, 100);
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
    // Clean up intersection observer
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }

    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    this.thumbnailsContainer = null;
    this.outlineContainer = null;
    this.renderedThumbnails.clear();
  }
}