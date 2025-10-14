import type { PDFViewer, ToolbarConfig } from '../types';

export class ToolbarManager {
  private viewer: PDFViewer;
  private config: ToolbarConfig | boolean;
  private container: HTMLElement | null = null;
  private pageInput: HTMLInputElement | null = null;
  private scaleSelect: HTMLSelectElement | null = null;
  private searchBox: HTMLElement | null = null;
  private searchInput: HTMLInputElement | null = null;
  private isSearchVisible: boolean = false;
  private bookmarkMenu: HTMLElement | null = null;
  private annotationMode: string | null = null;
  private annotationLayer: HTMLCanvasElement | null = null;
  private annotationContext: CanvasRenderingContext2D | null = null;
  private isDrawing: boolean = false;
  private startX: number = 0;
  private startY: number = 0;
  private annotations: any[] = [];
  private undoStack: any[][] = [];
  private redoStack: any[][] = [];
  private currentColor: string = '#FF0000';
  private currentLineWidth: number = 2;
  private annotationToolbar: HTMLElement | null = null;

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
    
    // Open file button
    const openBtn = this.createOpenFileButton();
    
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
    leftSection.appendChild(this.createSeparator());
    leftSection.appendChild(openBtn);
    leftSection.appendChild(this.createSeparator());
    leftSection.appendChild(pageNav);
    
    // Center section (empty for spacing)
    const centerSection = document.createElement('div');
    centerSection.className = 'pdf-toolbar-section pdf-toolbar-center';
    centerSection.style.flex = '1';
    
    // Right section
    const rightSection = document.createElement('div');
    rightSection.className = 'pdf-toolbar-section';
    
    // Zoom controls (moved to right)
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
    
    // Page mode toggle
    const pageModeBtn = this.createButton('page-mode', 
      this.viewer.state.pageMode === 'continuous' ? this.createIcon('layers') : this.createIcon('file'),
      this.viewer.state.pageMode === 'continuous' ? 'Single Page' : 'Continuous', 
      () => {
        const newMode = this.viewer.state.pageMode === 'continuous' ? 'single' : 'continuous';
        this.viewer.setPageMode(newMode);
        this.updatePageModeButton();
      }
    );
    
    // Rotate button
    const rotateBtn = this.createButton('rotate', this.createIcon('rotate-cw'), 'Rotate', () => {
      this.viewer.rotate();
    });
    
    // Annotation button (opens toolbar)
    const annotateBtn = this.createButton('annotate', this.createIcon('edit'), 'Annotations', () => {
      this.toggleAnnotationToolbar();
    });
    
    // Search button
    const searchBtn = this.createButton('search', this.createIcon('search'), 'Search', () => {
      this.toggleSearchBox();
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
    
    rightSection.appendChild(zoomControls);
    rightSection.appendChild(this.createSeparator());
    rightSection.appendChild(pageModeBtn);
    rightSection.appendChild(rotateBtn);
    rightSection.appendChild(this.createSeparator());
    rightSection.appendChild(annotateBtn);
    rightSection.appendChild(searchBtn);
    rightSection.appendChild(this.createBookmarksButton());
    rightSection.appendChild(this.createSeparator());
    rightSection.appendChild(printBtn);
    rightSection.appendChild(downloadBtn);
    rightSection.appendChild(this.createSeparator());
    rightSection.appendChild(this.createDocInfoButton());
    rightSection.appendChild(fullscreenBtn);
    
    // Create search box (initially hidden)
    this.searchBox = this.createSearchBox();
    
    // Append all sections
    toolbar.appendChild(leftSection);
    toolbar.appendChild(centerSection);
    toolbar.appendChild(rightSection);
    toolbar.appendChild(this.searchBox);
    
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
      'rotate-cw': 'M21 12a9 9 0 11-9-9 9 9 0 019 9zM9 15l3-3 3 3M12 9v6',
      'search': 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      'printer': 'M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z',
      'download': 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
      'maximize': 'M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3',
      'file': 'M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z',
      'layers': 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
      'folder-open': 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 01 2-2h5l2 3h9a2 2 0 01 2 2z',
      'bookmark': 'M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z',
      'bookmark-filled': 'M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z',
      'info': 'M12 16v-4M12 8h.01M3 12a9 9 0 1018 0 9 9 0 00-18 0',
      'x': 'M18 6L6 18M6 6l12 12',
      'sidebar': 'M3 3h18a2 2 0 012 2v14a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2zM9 3v18',
      'square': 'M3 3h18v18H3z',
      'arrow-right': 'M5 12h14M12 5l7 7-7 7',
      'pen': 'M12 19l7-7 3 3-7 7-3-3zm1.5-6.5L17 9m-5-5l4 4',
      'plus': 'M12 5v14M5 12h14',
      'trash': 'M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6',
      'eraser': 'M3 7l3-3 9 9-3 3zM10.5 10.5l7-7M8 21L21 8',
      'edit': 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5',
      'type': 'M4 7V4h16v3M9 20h6M12 4v16',
      'undo': 'M3 7v6h6M3 13c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10',
      'redo': 'M21 7v6h-6M21 13c0-5.523-4.477-10-10-10S1 7.477 1 13s4.477 10 10 10',
      'circle': 'M12 12m-10 0a10 10 0 1020 0 10 10 0 00-20 0',
      'palette': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.19 0 .38-.01.57-.02C17.5 21.47 22 17.2 22 12c0-5.52-4.48-10-10-10'
    };
    
    const pathData = paths[name] || '';
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    
    // Special handling for filled bookmark
    if (name === 'bookmark-filled') {
      path.setAttribute('fill', 'currentColor');
      path.setAttribute('stroke', 'none');
    }
    
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
   * Update page mode button
   */
  private updatePageModeButton(): void {
    const btn = this.container?.querySelector('.pdf-page-mode') as HTMLButtonElement;
    if (btn) {
      const isContinuous = this.viewer.state.pageMode === 'continuous';
      btn.innerHTML = '';
      btn.appendChild(this.createIcon(isContinuous ? 'file' : 'layers'));
      btn.title = isContinuous ? 'Single Page' : 'Continuous';
    }
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
   * Create open file button
   */
  private createOpenFileButton(): HTMLElement {
    const button = document.createElement('button');
    button.className = 'pdf-toolbar-button pdf-open-file';
    button.innerHTML = '';
    button.appendChild(this.createIcon('folder-open'));
    button.title = 'Open File';
    button.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const url = URL.createObjectURL(file);
          this.viewer.loadDocument(url);
        }
      };
      input.click();
    });
    return button;
  }

  /**
   * Create search box
   */
  private createSearchBox(): HTMLElement {
    const searchBox = document.createElement('div');
    searchBox.className = 'pdf-search-box';
    searchBox.style.display = 'none';
    searchBox.style.position = 'fixed';  // Use fixed positioning
    searchBox.style.zIndex = '1000';
    
    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.className = 'pdf-search-input';
    this.searchInput.placeholder = 'Search in document...';
    
    const searchButton = this.createButton('search-go', this.createIcon('search'), 'Search', () => {
      this.performSearch();
    });
    searchButton.style.minWidth = '32px';
    searchButton.style.width = '32px';
    searchButton.style.height = '32px';
    
    const closeButton = this.createButton('search-close', this.createIcon('x'), 'Close', () => {
      this.toggleSearchBox();
    });
    closeButton.style.minWidth = '32px';
    closeButton.style.width = '32px';
    closeButton.style.height = '32px';
    
    // Search input events
    this.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performSearch();
      }
    });
    
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.toggleSearchBox();
      }
    });
    
    searchBox.appendChild(this.searchInput);
    searchBox.appendChild(searchButton);
    searchBox.appendChild(closeButton);
    
    return searchBox;
  }
  
  /**
   * Toggle search box visibility
   */
  private toggleSearchBox(): void {
    if (!this.searchBox) return;
    
    this.isSearchVisible = !this.isSearchVisible;
    this.searchBox.style.display = this.isSearchVisible ? 'flex' : 'none';
    
    if (this.isSearchVisible) {
      // Position search box near the search button
      const searchBtn = this.container?.querySelector('.pdf-search') as HTMLElement;
      if (searchBtn) {
        const rect = searchBtn.getBoundingClientRect();
        this.searchBox.style.top = `${rect.bottom + 8}px`;
        this.searchBox.style.right = `${window.innerWidth - rect.right}px`;
      }
      
      this.searchInput?.focus();
      this.searchInput?.select();
    } else {
      // Clear search when closing
      if (this.searchInput) {
        this.searchInput.value = '';
      }
      this.viewer.clearSearch();
    }
    
    this.viewer.state.isSearchOpen = this.isSearchVisible;
    this.viewer.emit('search-toggle', this.isSearchVisible);
  }
  
  /**
   * Perform search
   */
  private async performSearch(): Promise<void> {
    if (!this.searchInput || !this.searchInput.value) return;
    
    const query = this.searchInput.value;
    const results = await this.viewer.search(query);
    
    if (results.length > 0) {
      console.log(`Found ${results.length} matches for "${query}"`);
    } else {
      console.log(`No matches found for "${query}"`);
    }
  }
  
  /**
   * Create bookmarks button
   */
  private createBookmarksButton(): HTMLElement {
    const button = document.createElement('button');
    button.className = 'pdf-toolbar-button pdf-bookmarks';
    button.innerHTML = '';
    const icon = this.createIcon('bookmark');
    button.appendChild(icon);
    button.title = 'Bookmarks';
    
    // Create bookmark menu
    const bookmarkMenu = this.createBookmarkMenu();
    
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Check if document is loaded
      if (!this.viewer.isReady()) {
        console.warn('Please load a PDF document first');
        return;
      }
      
      // Toggle bookmark menu
      const isVisible = bookmarkMenu.style.display === 'block';
      bookmarkMenu.style.display = isVisible ? 'none' : 'block';
      
      if (!isVisible) {
        // Position menu
        const rect = button.getBoundingClientRect();
        bookmarkMenu.style.top = `${rect.bottom + 5}px`;
        bookmarkMenu.style.right = `${window.innerWidth - rect.right}px`;
        
        // Update bookmark list
        this.updateBookmarkList();
      }
    });
    
    // Close menu on outside click
    document.addEventListener('click', () => {
      bookmarkMenu.style.display = 'none';
    });
    
    return button;
  }

  /**
   * Create document info button
   */
  private createDocInfoButton(): HTMLElement {
    const button = document.createElement('button');
    button.className = 'pdf-toolbar-button pdf-doc-info';
    button.innerHTML = '';
    button.appendChild(this.createIcon('info'));
    button.title = 'Document Info';
    button.addEventListener('click', () => {
      // Placeholder for document info functionality
      console.log('Document info clicked');
    });
    return button;
  }

  /**
   * Destroy the toolbar
   */
  /**
   * Create bookmark menu
   */
  private createBookmarkMenu(): HTMLElement {
    const menu = document.createElement('div');
    menu.className = 'pdf-bookmark-menu';
    menu.style.cssText = `
      display: none;
      position: fixed;
      background: var(--pdf-card-bg, white);
      border: 1px solid var(--pdf-border, #e0e0e0);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1001;
      min-width: 250px;
      max-width: 300px;
      max-height: 400px;
      overflow: hidden;
    `;
    
    // Menu header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 12px 16px;
      border-bottom: 1px solid var(--pdf-border, #e0e0e0);
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    const title = document.createElement('span');
    title.textContent = 'Bookmarks';
    title.style.fontWeight = 'bold';
    
    const addBtn = document.createElement('button');
    addBtn.className = 'pdf-toolbar-button';
    addBtn.style.cssText = 'width: 28px; height: 28px; min-width: 28px;';
    addBtn.appendChild(this.createIcon('plus'));
    addBtn.title = 'Add current page';
    addBtn.onclick = (e) => {
      e.stopPropagation();
      this.addBookmarkForCurrentPage();
    };
    
    header.appendChild(title);
    header.appendChild(addBtn);
    
    // Bookmark list
    const listContainer = document.createElement('div');
    listContainer.className = 'pdf-bookmark-list';
    listContainer.style.cssText = `
      max-height: 320px;
      overflow-y: auto;
      padding: 8px;
    `;
    
    menu.appendChild(header);
    menu.appendChild(listContainer);
    
    // Add to body
    document.body.appendChild(menu);
    this.bookmarkMenu = menu;
    
    return menu;
  }
  
  /**
   * Update bookmark list
   */
  private updateBookmarkList(): void {
    if (!this.bookmarkMenu) return;
    
    const listContainer = this.bookmarkMenu.querySelector('.pdf-bookmark-list');
    if (!listContainer) return;
    
    const bookmarks = this.viewer.getBookmarks();
    
    if (bookmarks.length === 0) {
      listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No bookmarks yet</div>';
      return;
    }
    
    listContainer.innerHTML = '';
    bookmarks.forEach(bookmark => {
      const item = document.createElement('div');
      item.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        margin-bottom: 4px;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s;
      `;
      
      item.onmouseenter = () => item.style.background = 'var(--pdf-hover, #f5f5f5)';
      item.onmouseleave = () => item.style.background = '';
      
      const label = document.createElement('span');
      label.textContent = bookmark.title;
      label.style.flex = '1';
      
      item.onclick = () => {
        console.log(`Navigating to bookmark: ${bookmark.title}, page ${bookmark.pageNumber}`);
        this.viewer.goToPage(bookmark.pageNumber);
        this.bookmarkMenu!.style.display = 'none';
        this.showToast(`Jumped to: ${bookmark.title}`);
      };
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'pdf-toolbar-button';
      deleteBtn.style.cssText = 'width: 24px; height: 24px; min-width: 24px;';
      deleteBtn.appendChild(this.createIcon('trash'));
      deleteBtn.title = 'Delete bookmark';
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        this.viewer.removeBookmark(bookmark.id);
        this.updateBookmarkList();
      };
      
      item.appendChild(label);
      item.appendChild(deleteBtn);
      listContainer.appendChild(item);
    });
  }
  
  /**
   * Add bookmark for current page
   */
  private addBookmarkForCurrentPage(): void {
    const currentPage = this.viewer.getCurrentPage();
    if (currentPage > 0) {
      const bookmark = this.viewer.addCurrentPageBookmark(`Page ${currentPage}`);
      if (bookmark) {
        this.showToast(`Bookmark added: Page ${currentPage}`);
        this.updateBookmarkList();
      }
    }
  }
  
  /**
   * Toggle annotation toolbar
   */
  private toggleAnnotationToolbar(): void {
    if (!this.annotationToolbar) {
      this.createAnnotationToolbar();
    }
    
    if (this.annotationToolbar) {
      const isVisible = this.annotationToolbar.style.display !== 'none';
      this.annotationToolbar.style.display = isVisible ? 'none' : 'flex';
      
      if (!isVisible) {
        // Position below main toolbar
        const toolbar = this.container;
        if (toolbar) {
          const rect = toolbar.getBoundingClientRect();
          this.annotationToolbar.style.top = `${rect.bottom + 5}px`;
        }
      } else {
        // Clean up when closing
        this.setAnnotationMode(null);
      }
    }
  }
  
  /**
   * Create annotation toolbar
   */
  private createAnnotationToolbar(): void {
    const toolbar = document.createElement('div');
    toolbar.className = 'pdf-annotation-toolbar';
    toolbar.style.cssText = `
      display: none;
      position: fixed;
      left: 50%;
      transform: translateX(-50%);
      background: var(--pdf-toolbar-bg, white);
      border: 1px solid var(--pdf-border, #e0e0e0);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 8px;
      gap: 8px;
      z-index: 1002;
      align-items: center;
    `;
    
    // Drawing tools
    const tools = [
      { id: 'rect', icon: 'square', title: 'Rectangle' },
      { id: 'circle', icon: 'circle', title: 'Circle' },
      { id: 'arrow', icon: 'arrow-right', title: 'Arrow' },
      { id: 'pen', icon: 'pen', title: 'Pen' },
      { id: 'text', icon: 'type', title: 'Text' },
      { id: 'eraser', icon: 'eraser', title: 'Eraser' }
    ];
    
    tools.forEach(tool => {
      const btn = this.createButton(tool.id, this.createIcon(tool.icon), tool.title, () => {
        this.setAnnotationMode(tool.id);
      });
      btn.style.minWidth = '36px';
      toolbar.appendChild(btn);
    });
    
    toolbar.appendChild(this.createSeparator());
    
    // Color picker
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = this.currentColor;
    colorPicker.style.cssText = 'width: 36px; height: 36px; border: none; border-radius: 4px; cursor: pointer;';
    colorPicker.title = 'Color';
    colorPicker.onchange = (e) => {
      this.currentColor = (e.target as HTMLInputElement).value;
    };
    toolbar.appendChild(colorPicker);
    
    // Line width
    const widthSelect = document.createElement('select');
    widthSelect.style.cssText = 'height: 36px; border: 1px solid var(--pdf-border); border-radius: 4px; padding: 0 8px;';
    widthSelect.title = 'Line Width';
    [1, 2, 3, 5, 8].forEach(width => {
      const option = document.createElement('option');
      option.value = width.toString();
      option.textContent = `${width}px`;
      if (width === 2) option.selected = true;
      widthSelect.appendChild(option);
    });
    widthSelect.onchange = (e) => {
      this.currentLineWidth = parseInt((e.target as HTMLSelectElement).value);
    };
    toolbar.appendChild(widthSelect);
    
    toolbar.appendChild(this.createSeparator());
    
    // Undo/Redo
    const undoBtn = this.createButton('undo', this.createIcon('undo'), 'Undo', () => {
      this.undo();
    });
    const redoBtn = this.createButton('redo', this.createIcon('redo'), 'Redo', () => {
      this.redo();
    });
    toolbar.appendChild(undoBtn);
    toolbar.appendChild(redoBtn);
    
    toolbar.appendChild(this.createSeparator());
    
    // Clear all
    const clearBtn = this.createButton('clear', this.createIcon('trash'), 'Clear All', () => {
      this.clearAnnotations();
    });
    toolbar.appendChild(clearBtn);
    
    document.body.appendChild(toolbar);
    this.annotationToolbar = toolbar;
  }
  
  /**
   * Set annotation mode
   */
  private setAnnotationMode(mode: string | null): void {
    // Clear previous mode
    if (this.annotationMode && this.annotationToolbar) {
      const prevBtn = this.annotationToolbar.querySelector(`button[id="${this.annotationMode}"]`) as HTMLElement;
      if (prevBtn) {
        prevBtn.style.background = '';
        prevBtn.style.color = '';
      }
    }
    
    this.annotationMode = mode;
    
    if (mode && this.annotationToolbar) {
      // Highlight active button
      const activeBtn = this.annotationToolbar.querySelector(`button[id="${mode}"]`) as HTMLElement;
      if (activeBtn) {
        activeBtn.style.background = 'var(--pdf-active, #4a90e2)';
        activeBtn.style.color = 'white';
      }
      
      // Setup annotation layer
      this.setupAnnotationLayer();
      
      // Show mode message
      const modeNames: Record<string, string> = {
        'rect': 'Rectangle',
        'circle': 'Circle', 
        'arrow': 'Arrow',
        'pen': 'Free Draw',
        'text': 'Text',
        'eraser': 'Eraser'
      };
      this.showToast(`${modeNames[mode] || mode} mode activated`);
    } else {
      // Clean up
      this.removeAnnotationLayer();
    }
  }
  
  /**
   * Setup annotation layer
   */
  private setupAnnotationLayer(): void {
    const canvasContainer = document.querySelector('.pdf-canvas-container');
    if (!canvasContainer) return;
    
    // Find the PDF canvas
    const pdfCanvas = canvasContainer.querySelector('.pdf-canvas') as HTMLCanvasElement;
    if (!pdfCanvas) return;
    
    // Create or get annotation layer
    let annotationLayer = canvasContainer.querySelector('.pdf-annotation-canvas') as HTMLCanvasElement;
    if (!annotationLayer) {
      annotationLayer = document.createElement('canvas');
      annotationLayer.className = 'pdf-annotation-canvas';
      annotationLayer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: auto;
        z-index: 10;
      `;
      
      // Insert after PDF canvas
      pdfCanvas.parentElement?.appendChild(annotationLayer);
    }
    
    // Match dimensions
    annotationLayer.width = pdfCanvas.width;
    annotationLayer.height = pdfCanvas.height;
    annotationLayer.style.width = pdfCanvas.style.width || `${pdfCanvas.width}px`;
    annotationLayer.style.height = pdfCanvas.style.height || `${pdfCanvas.height}px`;
    
    this.annotationLayer = annotationLayer;
    this.annotationContext = annotationLayer.getContext('2d')!;
    
    // Redraw existing annotations
    this.redrawAnnotations();
    
    // Add event listeners
    annotationLayer.addEventListener('mousedown', this.handleMouseDown);
    annotationLayer.addEventListener('mousemove', this.handleMouseMove);
    annotationLayer.addEventListener('mouseup', this.handleMouseUp);
    annotationLayer.addEventListener('mouseleave', this.handleMouseUp);
  }
  
  /**
   * Remove annotation layer
   */
  private removeAnnotationLayer(): void {
    if (this.annotationLayer) {
      this.annotationLayer.removeEventListener('mousedown', this.handleMouseDown);
      this.annotationLayer.removeEventListener('mousemove', this.handleMouseMove);
      this.annotationLayer.removeEventListener('mouseup', this.handleMouseUp);
      this.annotationLayer.removeEventListener('mouseleave', this.handleMouseUp);
    }
  }
  
  /**
   * Handle mouse down
   */
  private handleMouseDown = (e: MouseEvent): void => {
    if (!this.annotationMode || !this.annotationLayer) return;
    
    const rect = this.annotationLayer.getBoundingClientRect();
    this.startX = e.clientX - rect.left;
    this.startY = e.clientY - rect.top;
    
    // Handle text mode specially - add text immediately on click
    if (this.annotationMode === 'text') {
      this.addTextAnnotation(this.startX, this.startY);
      return;
    }
    
    this.isDrawing = true;
    
    if (this.annotationMode === 'pen') {
      this.currentPath = [{x: this.startX, y: this.startY}];
    }
  }
  
  private currentPath: {x: number, y: number}[] = [];
  
  /**
   * Handle mouse move
   */
  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.isDrawing || !this.annotationMode || !this.annotationLayer || !this.annotationContext) return;
    
    const rect = this.annotationLayer.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    // Clear and redraw
    this.annotationContext.clearRect(0, 0, this.annotationLayer.width, this.annotationLayer.height);
    this.redrawAnnotations();
    
    // Draw current annotation
    this.annotationContext.strokeStyle = this.currentColor;
    this.annotationContext.lineWidth = this.currentLineWidth;
    
    if (this.annotationMode === 'rect') {
      this.annotationContext.strokeRect(
        this.startX,
        this.startY,
        currentX - this.startX,
        currentY - this.startY
      );
    } else if (this.annotationMode === 'circle') {
      const radius = Math.sqrt(Math.pow(currentX - this.startX, 2) + Math.pow(currentY - this.startY, 2));
      this.annotationContext.beginPath();
      this.annotationContext.arc(this.startX, this.startY, radius, 0, 2 * Math.PI);
      this.annotationContext.stroke();
    } else if (this.annotationMode === 'arrow') {
      this.drawArrow(this.startX, this.startY, currentX, currentY);
    } else if (this.annotationMode === 'pen') {
      this.currentPath.push({x: currentX, y: currentY});
      this.drawPath(this.currentPath);
    } else if (this.annotationMode === 'eraser') {
      // Eraser mode - remove annotations at this point
      this.eraseAt(currentX, currentY);
    }
  }
  
  /**
   * Handle mouse up
   */
  private handleMouseUp = (e: MouseEvent): void => {
    if (!this.isDrawing || !this.annotationMode || !this.annotationLayer) return;
    
    const rect = this.annotationLayer.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    
    // Skip if it's text mode (already handled in mousedown)
    if (this.annotationMode === 'text') {
      this.isDrawing = false;
      return;
    }
    
    // Skip eraser mode - it doesn't create annotations
    if (this.annotationMode === 'eraser') {
      this.isDrawing = false;
      return;
    }
    
    // Save annotation
    const annotation = {
      type: this.annotationMode,
      startX: this.startX,
      startY: this.startY,
      endX: endX,
      endY: endY,
      path: this.annotationMode === 'pen' ? [...this.currentPath] : undefined,
      pageNumber: this.viewer.getCurrentPage(),
      color: this.currentColor,
      lineWidth: this.currentLineWidth
    };
    
    // Save to undo stack
    this.undoStack.push([...this.annotations]);
    this.redoStack = []; // Clear redo stack on new action
    
    this.annotations.push(annotation);
    this.isDrawing = false;
    this.currentPath = [];
    
    // Redraw all
    this.redrawAnnotations();
  }
  
  /**
   * Draw arrow
   */
  private drawArrow(fromX: number, fromY: number, toX: number, toY: number): void {
    if (!this.annotationContext) return;
    
    const ctx = this.annotationContext;
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    
    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  }
  
  /**
   * Draw path
   */
  private drawPath(path: {x: number, y: number}[]): void {
    if (!this.annotationContext || path.length < 2) return;
    
    const ctx = this.annotationContext;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    
    ctx.stroke();
  }
  
  /**
   * Redraw all annotations
   */
  private redrawAnnotations(): void {
    if (!this.annotationContext || !this.annotationLayer) return;
    
    const currentPage = this.viewer.getCurrentPage();
    const pageAnnotations = this.annotations.filter(a => a.pageNumber === currentPage);
    
    pageAnnotations.forEach(annotation => {
      this.annotationContext!.strokeStyle = annotation.color || '#ff0000';
      this.annotationContext!.lineWidth = annotation.lineWidth || 2;
      
      if (annotation.type === 'rect') {
        this.annotationContext!.strokeRect(
          annotation.startX,
          annotation.startY,
          annotation.endX - annotation.startX,
          annotation.endY - annotation.startY
        );
      } else if (annotation.type === 'circle') {
        const radius = Math.sqrt(Math.pow(annotation.endX - annotation.startX, 2) + Math.pow(annotation.endY - annotation.startY, 2));
        this.annotationContext!.beginPath();
        this.annotationContext!.arc(annotation.startX, annotation.startY, radius, 0, 2 * Math.PI);
        this.annotationContext!.stroke();
      } else if (annotation.type === 'arrow') {
        this.drawArrow(annotation.startX, annotation.startY, annotation.endX, annotation.endY);
      } else if (annotation.type === 'pen' && annotation.path) {
        this.drawPath(annotation.path);
      } else if (annotation.type === 'text' && annotation.text) {
        this.annotationContext!.font = `${annotation.fontSize || 16}px Arial`;
        this.annotationContext!.fillStyle = annotation.color || '#ff0000';
        this.annotationContext!.fillText(annotation.text, annotation.startX, annotation.startY);
      }
    });
  }
  
  /**
   * Undo last annotation
   */
  private undo(): void {
    if (this.undoStack.length > 0) {
      this.redoStack.push([...this.annotations]);
      this.annotations = this.undoStack.pop() || [];
      this.redrawAnnotations();
      this.showToast('Undone');
    }
  }
  
  /**
   * Redo last undone annotation
   */
  private redo(): void {
    if (this.redoStack.length > 0) {
      this.undoStack.push([...this.annotations]);
      this.annotations = this.redoStack.pop() || [];
      this.redrawAnnotations();
      this.showToast('Redone');
    }
  }
  
  /**
   * Clear all annotations
   */
  private clearAnnotations(): void {
    if (this.annotations.length > 0) {
      this.undoStack.push([...this.annotations]);
      this.annotations = [];
      this.redoStack = [];
      if (this.annotationContext && this.annotationLayer) {
        this.annotationContext.clearRect(0, 0, this.annotationLayer.width, this.annotationLayer.height);
      }
      this.showToast('All annotations cleared');
    }
  }
  
  /**
   * Add text annotation
   */
  private addTextAnnotation(x: number, y: number): void {
    const text = prompt('Enter annotation text:');
    if (text) {
      const annotation = {
        type: 'text',
        text: text,
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        fontSize: 16,
        pageNumber: this.viewer.getCurrentPage(),
        color: this.currentColor,
        lineWidth: this.currentLineWidth
      };
      
      this.undoStack.push([...this.annotations]);
      this.redoStack = [];
      this.annotations.push(annotation);
      
      if (this.annotationContext && this.annotationLayer) {
        this.annotationContext.clearRect(0, 0, this.annotationLayer.width, this.annotationLayer.height);
        this.redrawAnnotations();
      }
      this.showToast(`Text annotation added: "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"`);  
    }
  }
  
  /**
   * Erase annotations at point
   */
  private eraseAt(x: number, y: number): void {
    const eraserSize = 10; // Eraser radius
    const currentPage = this.viewer.getCurrentPage();
    
    // Filter out annotations that are hit by the eraser
    const remainingAnnotations = this.annotations.filter(annotation => {
      if (annotation.pageNumber !== currentPage) return true;
      
      // Check if annotation is within eraser range
      if (annotation.type === 'pen' && annotation.path) {
        // For pen paths, check each point
        return !annotation.path.some(point => 
          Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)) < eraserSize
        );
      } else {
        // For shapes, check if eraser hits the shape bounds
        const minX = Math.min(annotation.startX, annotation.endX) - eraserSize;
        const maxX = Math.max(annotation.startX, annotation.endX) + eraserSize;
        const minY = Math.min(annotation.startY, annotation.endY) - eraserSize;
        const maxY = Math.max(annotation.startY, annotation.endY) + eraserSize;
        
        return !(x >= minX && x <= maxX && y >= minY && y <= maxY);
      }
    });
    
    if (remainingAnnotations.length < this.annotations.length) {
      this.undoStack.push([...this.annotations]);
      this.annotations = remainingAnnotations;
      this.redoStack = [];
      
      // Clear and redraw
      if (this.annotationContext && this.annotationLayer) {
        this.annotationContext.clearRect(0, 0, this.annotationLayer.width, this.annotationLayer.height);
        this.redrawAnnotations();
      }
    }
  }
  
  
  /**
   * Show toast notification
   */
  private showToast(message: string): void {
    const toast = document.createElement('div');
    toast.className = 'pdf-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
  
  destroy(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    this.pageInput = null;
    this.scaleSelect = null;
    this.searchBox = null;
    this.searchInput = null;
  }
}
