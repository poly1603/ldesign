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
    
    // Left section
    const leftSection = document.createElement('div');
    leftSection.className = 'pdf-toolbar-section';
    
    // Sidebar toggle button
    const sidebarBtn = this.createButton('sidebar', this.createIcon('menu'), 'Toggle Sidebar', () => {
      this.viewer.toggleSidebar();
    });
    
    // Page navigation
    const pageNav = document.createElement('div');
    pageNav.className = 'pdf-page-navigation';
    
    const prevBtn = this.createButton('previous', this.createIcon('chevron-left'), 'Previous Page', () => {
      this.viewer.previousPage();
    });
    
    this.pageInput = document.createElement('input');
    this.pageInput.type = 'number';
    this.pageInput.className = 'pdf-page-input';
    this.pageInput.min = '1';
    this.pageInput.value = '1';
    
    const pageLabel = document.createElement('span');
    pageLabel.className = 'pdf-page-label';
    pageLabel.textContent = '/ 0';
    
    const nextBtn = this.createButton('next', this.createIcon('chevron-right'), 'Next Page', () => {
      this.viewer.nextPage();
    });
    
    pageNav.appendChild(prevBtn);
    pageNav.appendChild(this.pageInput);
    pageNav.appendChild(pageLabel);
    pageNav.appendChild(nextBtn);
    
    leftSection.appendChild(sidebarBtn);
    leftSection.appendChild(pageNav);
    
    // Center section
    const centerSection = document.createElement('div');
    centerSection.className = 'pdf-toolbar-section';
    
    // Zoom controls
    const zoomControls = document.createElement('div');
    zoomControls.className = 'pdf-zoom-controls';
    
    const zoomOutBtn = this.createButton('zoom-out', this.createIcon('zoom-out'), 'Zoom Out', () => {
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
    
    const zoomInBtn = this.createButton('zoom-in', this.createIcon('zoom-in'), 'Zoom In', () => {
      this.viewer.zoomIn();
    });
    
    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(this.scaleSelect);
    zoomControls.appendChild(zoomInBtn);
    
    centerSection.appendChild(zoomControls);
    
    // Right section
    const rightSection = document.createElement('div');
    rightSection.className = 'pdf-toolbar-section';
    
    // Rotate button
    const rotateBtn = this.createButton('rotate', this.createIcon('rotate-cw'), 'Rotate', () => {
      this.viewer.rotate();
    });
    
    // Search button
    const searchBtn = this.createButton('search', this.createIcon('search'), 'Search', () => {
      this.viewer.emit('search-toggle', !this.viewer.state.isSearchOpen);
    });
    
    // Print button
    const printBtn = this.createButton('print', this.createIcon('printer'), 'Print', () => {
      this.viewer.print();
    });
    
    // Download button
    const downloadBtn = this.createButton('download', this.createIcon('download'), 'Download', () => {
      this.viewer.download();
    });
    
    // Fullscreen button
    const fullscreenBtn = this.createButton('fullscreen', this.createIcon('maximize'), 'Fullscreen', () => {
      this.viewer.toggleFullscreen();
    });
    
    rightSection.appendChild(rotateBtn);
    rightSection.appendChild(searchBtn);
    rightSection.appendChild(this.createSeparator());
    rightSection.appendChild(printBtn);
    rightSection.appendChild(downloadBtn);
    rightSection.appendChild(fullscreenBtn);
    
    // Append all sections
    toolbar.appendChild(leftSection);
    toolbar.appendChild(centerSection);
    toolbar.appendChild(rightSection);
    
    this.container = toolbar;
    
    // Add to viewer container
    const viewerElement = this.viewer.container?.querySelector('.pdf-viewer');
    if (viewerElement) {
      viewerElement.insertBefore(toolbar, viewerElement.firstChild);
    }
  }

  private createButton(className: string, icon: string | SVGElement, title: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = `pdf-toolbar-button pdf-${className}`;
    if (typeof icon === 'string') {
      button.innerHTML = icon;
    } else {
      button.appendChild(icon);
    }
    button.title = title;
    button.addEventListener('click', onClick);
    return button;
  }

  private createIcon(name: string): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '18');
    svg.setAttribute('height', '18');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    
    // Define icon paths based on Lucide icons
    const paths: { [key: string]: string } = {
      'menu': 'M3 12h18M3 6h18M3 18h18',
      'chevron-left': 'M15 18l-6-6 6-6',
      'chevron-right': 'M9 18l6-6-6-6',
      'zoom-in': 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7',
      'zoom-out': 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM7 10h6',
      'rotate-cw': 'M23 4v6h-6M1 20v-6h6m16.5-3a9 9 0 11-3 7.5',
      'search': 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      'printer': 'M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z',
      'download': 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
      'maximize': 'M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3'
    };
    
    const pathData = paths[name] || '';
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    svg.appendChild(path);
    
    return svg;
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