import type { PDFViewer, ToolbarConfig } from '../types';

export class ToolbarManager {
  private viewer: PDFViewer;
  private config: ToolbarConfig | boolean;
  private container: HTMLElement | null = null;
  private pageInput: HTMLInputElement | null = null;
  private scaleSelect: HTMLSelectElement | null = null;

  constructor(viewer: PDFViewer, config: ToolbarConfig | boolean = true) {
    this.viewer = viewer;
    this.config = config;
    this.init();
  }

  private init(): void {
    this.createToolbar();
    this.attachEventListeners();
    this.updateToolbar();
  }

  private createToolbar(): void {
    const toolbar = document.createElement('div');
    toolbar.className = 'pdf-toolbar';
    
    // Previous page button
    const prevBtn = this.createButton('previous', '⟨', 'Previous Page', () => {
      this.viewer.previousPage();
    });
    
    // Page navigation
    const pageNav = document.createElement('div');
    pageNav.className = 'pdf-page-navigation';
    
    this.pageInput = document.createElement('input');
    this.pageInput.type = 'number';
    this.pageInput.className = 'pdf-page-input';
    this.pageInput.min = '1';
    this.pageInput.value = '1';
    
    const pageLabel = document.createElement('span');
    pageLabel.className = 'pdf-page-label';
    pageLabel.textContent = ' / 0';
    
    pageNav.appendChild(this.pageInput);
    pageNav.appendChild(pageLabel);
    
    // Next page button
    const nextBtn = this.createButton('next', '⟩', 'Next Page', () => {
      this.viewer.nextPage();
    });
    
    // Separator
    const separator1 = this.createSeparator();
    
    // Zoom controls
    const zoomOutBtn = this.createButton('zoom-out', '−', 'Zoom Out', () => {
      this.viewer.zoomOut();
    });
    
    this.scaleSelect = document.createElement('select');
    this.scaleSelect.className = 'pdf-scale-select';
    const scaleOptions = [
      { value: 'auto', label: 'Automatic' },
      { value: 'page-fit', label: 'Page Fit' },
      { value: 'page-width', label: 'Page Width' },
      { value: '0.5', label: '50%' },
      { value: '0.75', label: '75%' },
      { value: '1', label: '100%' },
      { value: '1.25', label: '125%' },
      { value: '1.5', label: '150%' },
      { value: '2', label: '200%' }
    ];
    
    scaleOptions.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option.value;
      opt.textContent = option.label;
      this.scaleSelect!.appendChild(opt);
    });
    
    const zoomInBtn = this.createButton('zoom-in', '+', 'Zoom In', () => {
      this.viewer.zoomIn();
    });
    
    // Separator
    const separator2 = this.createSeparator();
    
    // Rotate button
    const rotateBtn = this.createButton('rotate', '↻', 'Rotate', () => {
      this.viewer.rotate();
    });
    
    // Search button
    const searchBtn = this.createButton('search', '🔍', 'Search', () => {
      this.viewer.emit('search-toggle', !this.viewer.state.isSearchOpen);
    });
    
    // Separator
    const separator3 = this.createSeparator();
    
    // Print button
    const printBtn = this.createButton('print', '🖨', 'Print', () => {
      this.viewer.print();
    });
    
    // Download button
    const downloadBtn = this.createButton('download', '⬇', 'Download', () => {
      this.viewer.download();
    });
    
    // Fullscreen button
    const fullscreenBtn = this.createButton('fullscreen', '⛶', 'Fullscreen', () => {
      this.viewer.toggleFullscreen();
    });
    
    // Sidebar toggle
    const sidebarBtn = this.createButton('sidebar', '☰', 'Toggle Sidebar', () => {
      this.viewer.toggleSidebar();
    });
    
    // Append all elements
    toolbar.appendChild(sidebarBtn);
    toolbar.appendChild(prevBtn);
    toolbar.appendChild(pageNav);
    toolbar.appendChild(nextBtn);
    toolbar.appendChild(separator1);
    toolbar.appendChild(zoomOutBtn);
    toolbar.appendChild(this.scaleSelect);
    toolbar.appendChild(zoomInBtn);
    toolbar.appendChild(separator2);
    toolbar.appendChild(rotateBtn);
    toolbar.appendChild(searchBtn);
    toolbar.appendChild(separator3);
    toolbar.appendChild(printBtn);
    toolbar.appendChild(downloadBtn);
    toolbar.appendChild(fullscreenBtn);
    
    this.container = toolbar;
    
    // Add to viewer container
    const viewerContainer = this.viewer.options.container;
    if (viewerContainer instanceof HTMLElement) {
      viewerContainer.insertBefore(toolbar, viewerContainer.firstChild);
    }
  }

  private createButton(className: string, icon: string, title: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = `pdf-toolbar-button pdf-${className}`;
    button.innerHTML = icon;
    button.title = title;
    button.addEventListener('click', onClick);
    return button;
  }

  private createSeparator(): HTMLElement {
    const separator = document.createElement('div');
    separator.className = 'pdf-toolbar-separator';
    return separator;
  }

  private attachEventListeners(): void {
    // Page input change
    if (this.pageInput) {
      this.pageInput.addEventListener('change', () => {
        const page = parseInt(this.pageInput!.value, 10);
        if (!isNaN(page)) {
          this.viewer.goToPage(page);
        }
      });
      
      this.pageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const page = parseInt(this.pageInput!.value, 10);
          if (!isNaN(page)) {
            this.viewer.goToPage(page);
          }
        }
      });
    }
    
    // Scale select change
    if (this.scaleSelect) {
      this.scaleSelect.addEventListener('change', () => {
        const scale = this.scaleSelect!.value;
        if (scale === 'auto' || scale === 'page-fit' || scale === 'page-width') {
          this.viewer.setScale(scale);
        } else {
          this.viewer.setScale(parseFloat(scale));
        }
      });
    }
    
    // Listen to viewer events
    this.viewer.on('page-change', (pageNumber: number, totalPages: number) => {
      this.updatePageNavigation(pageNumber, totalPages);
    });
    
    this.viewer.on('scale-change', (scale: number) => {
      this.updateScaleSelect(scale);
    });
  }

  private updateToolbar(): void {
    if (!this.viewer.document) {
      return;
    }
    
    this.updatePageNavigation(this.viewer.state.currentPage, this.viewer.state.totalPages);
    this.updateScaleSelect(this.viewer.state.scale);
  }

  private updatePageNavigation(currentPage: number, totalPages: number): void {
    if (this.pageInput) {
      this.pageInput.value = currentPage.toString();
      this.pageInput.max = totalPages.toString();
    }
    
    const pageLabel = this.container?.querySelector('.pdf-page-label');
    if (pageLabel) {
      pageLabel.textContent = ` / ${totalPages}`;
    }
  }

  private updateScaleSelect(scale: number): void {
    if (!this.scaleSelect) {
      return;
    }
    
    // Find closest scale option
    const scalePercent = Math.round(scale * 100);
    let selectedValue = scale.toString();
    
    // Check if it's a predefined scale
    const options = Array.from(this.scaleSelect.options);
    for (const option of options) {
      const value = parseFloat(option.value);
      if (!isNaN(value) && Math.abs(value * 100 - scalePercent) < 5) {
        selectedValue = option.value;
        break;
      }
    }
    
    // Set custom value if not found
    const customOption = options.find(opt => opt.value === 'custom');
    if (!options.find(opt => opt.value === selectedValue)) {
      if (customOption) {
        customOption.textContent = `${scalePercent}%`;
        customOption.value = selectedValue;
      } else {
        const newOption = document.createElement('option');
        newOption.value = selectedValue;
        newOption.textContent = `${scalePercent}%`;
        newOption.selected = true;
        this.scaleSelect.appendChild(newOption);
      }
    }
    
    this.scaleSelect.value = selectedValue;
  }

  /**
   * Show or hide the toolbar
   */
  toggle(): void {
    if (this.container) {
      this.container.style.display = 
        this.container.style.display === 'none' ? 'flex' : 'none';
    }
  }

  /**
   * Enable or disable toolbar buttons
   */
  setButtonEnabled(buttonName: string, enabled: boolean): void {
    const button = this.container?.querySelector(`.pdf-${buttonName}`);
    if (button instanceof HTMLButtonElement) {
      button.disabled = !enabled;
    }
  }

  /**
   * Destroy the toolbar
   */
  destroy(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    this.pageInput = null;
    this.scaleSelect = null;
  }
}