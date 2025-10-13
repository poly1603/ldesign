import { PDFViewer } from '../core/PDFViewer';
import { ToolbarConfig, ToolbarItem } from '../types';

export class Toolbar {
  private container: HTMLElement;
  private viewer: PDFViewer;
  private config: ToolbarConfig;
  private elements: Map<string, HTMLElement> = new Map();

  constructor(container: HTMLElement, viewer: PDFViewer, config?: ToolbarConfig) {
    this.container = container;
    this.viewer = viewer;
    this.config = config || this.getDefaultConfig();
    this.render();
    this.attachEventListeners();
  }

  private getDefaultConfig(): ToolbarConfig {
    return {
      position: 'top',
      items: [
        {
          type: 'button',
          id: 'open-file',
          icon: '📁',
          tooltip: 'Open PDF',
          action: 'openFile'
        },
        { type: 'separator' },
        {
          type: 'group',
          id: 'navigation',
          items: [
            {
              type: 'button',
              id: 'prev-page',
              icon: '⬅️',
              tooltip: 'Previous Page',
              action: 'previousPage'
            },
            {
              type: 'input',
              id: 'page-input',
              className: 'page-input'
            },
            {
              type: 'button',
              id: 'next-page',
              icon: '➡️',
              tooltip: 'Next Page',
              action: 'nextPage'
            }
          ]
        },
        { type: 'separator' },
        {
          type: 'group',
          id: 'zoom',
          items: [
            {
              type: 'button',
              id: 'zoom-out',
              icon: '🔍-',
              tooltip: 'Zoom Out',
              action: 'zoomOut'
            },
            {
              type: 'select',
              id: 'zoom-select',
              className: 'zoom-select'
            },
            {
              type: 'button',
              id: 'zoom-in',
              icon: '🔍+',
              tooltip: 'Zoom In',
              action: 'zoomIn'
            },
            {
              type: 'button',
              id: 'fit-width',
              icon: '↔️',
              tooltip: 'Fit to Width',
              action: 'fitToWidth'
            },
            {
              type: 'button',
              id: 'fit-height',
              icon: '↕️',
              tooltip: 'Fit to Height',
              action: 'fitToHeight'
            }
          ]
        },
        { type: 'separator' },
        {
          type: 'group',
          id: 'view',
          items: [
            {
              type: 'button',
              id: 'rotate-left',
              icon: '↺',
              tooltip: 'Rotate Left',
              action: 'rotateCounterClockwise'
            },
            {
              type: 'button',
              id: 'rotate-right',
              icon: '↻',
              tooltip: 'Rotate Right',
              action: 'rotateClockwise'
            }
          ]
        },
        { type: 'separator' },
        {
          type: 'group',
          id: 'search',
          items: [
            {
              type: 'button',
              id: 'search-toggle',
              icon: '🔍',
              tooltip: 'Search',
              action: 'toggleSearch'
            }
          ]
        },
        { type: 'separator' },
        {
          type: 'group',
          id: 'actions',
          items: [
            {
              type: 'button',
              id: 'print',
              icon: '🖨️',
              tooltip: 'Print',
              action: 'print'
            },
            {
              type: 'button',
              id: 'download',
              icon: '⬇️',
              tooltip: 'Download',
              action: 'download'
            },
            {
              type: 'button',
              id: 'fullscreen',
              icon: '⛶',
              tooltip: 'Fullscreen',
              action: 'toggleFullscreen'
            }
          ]
        },
        { type: 'separator' },
        {
          type: 'button',
          id: 'theme-toggle',
          icon: '🌙',
          tooltip: 'Toggle Theme',
          action: 'toggleTheme'
        }
      ]
    };
  }

  private render(): void {
    const toolbar = document.createElement('div');
    toolbar.className = 'pdf-viewer-toolbar';
    toolbar.setAttribute('data-position', this.config.position || 'top');

    if (this.config.items) {
      this.config.items.forEach(item => {
        const element = this.createToolbarItem(item);
        if (element) {
          toolbar.appendChild(element);
        }
      });
    }

    this.container.appendChild(toolbar);
  }

  private createToolbarItem(item: ToolbarItem): HTMLElement | null {
    switch (item.type) {
      case 'button':
        return this.createButton(item);
      case 'separator':
        return this.createSeparator();
      case 'group':
        return this.createGroup(item);
      case 'input':
        return this.createInput(item);
      case 'select':
        return this.createSelect(item);
      default:
        return null;
    }
  }

  private createButton(item: ToolbarItem): HTMLElement {
    const button = document.createElement('button');
    button.className = `toolbar-button ${item.className || ''}`;
    if (item.id) {
      button.id = item.id;
      this.elements.set(item.id, button);
    }
    if (item.icon) {
      button.innerHTML = `<span class="icon">${item.icon}</span>`;
    }
    if (item.label) {
      button.innerHTML += `<span class="label">${item.label}</span>`;
    }
    if (item.tooltip) {
      button.title = item.tooltip;
    }
    if (item.disabled) {
      button.disabled = true;
    }
    if (item.hidden) {
      button.style.display = 'none';
    }
    if (item.action) {
      button.dataset.action = item.action;
    }
    return button;
  }

  private createSeparator(): HTMLElement {
    const separator = document.createElement('div');
    separator.className = 'toolbar-separator';
    return separator;
  }

  private createGroup(item: ToolbarItem): HTMLElement {
    const group = document.createElement('div');
    group.className = `toolbar-group ${item.className || ''}`;
    if (item.id) {
      group.id = item.id;
      this.elements.set(item.id, group);
    }
    if (item.items) {
      item.items.forEach(childItem => {
        const element = this.createToolbarItem(childItem);
        if (element) {
          group.appendChild(element);
        }
      });
    }
    return group;
  }

  private createInput(item: ToolbarItem): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'toolbar-input-wrapper';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = `toolbar-input ${item.className || ''}`;
    
    if (item.id) {
      input.id = item.id;
      this.elements.set(item.id, input);
    }
    
    if (item.id === 'page-input') {
      input.value = '1';
      input.style.width = '50px';
      input.style.textAlign = 'center';
      
      const totalPages = document.createElement('span');
      totalPages.className = 'total-pages';
      totalPages.textContent = ' / 1';
      totalPages.id = 'total-pages';
      this.elements.set('total-pages', totalPages);
      
      wrapper.appendChild(input);
      wrapper.appendChild(totalPages);
    } else {
      wrapper.appendChild(input);
    }
    
    return wrapper;
  }

  private createSelect(item: ToolbarItem): HTMLElement {
    const select = document.createElement('select');
    select.className = `toolbar-select ${item.className || ''}`;
    
    if (item.id) {
      select.id = item.id;
      this.elements.set(item.id, select);
    }
    
    if (item.id === 'zoom-select') {
      const zoomLevels = ['25%', '50%', '75%', '100%', '125%', '150%', '200%', '300%', '400%'];
      zoomLevels.forEach(level => {
        const option = document.createElement('option');
        option.value = level;
        option.textContent = level;
        if (level === '100%') {
          option.selected = true;
        }
        select.appendChild(option);
      });
    }
    
    return select;
  }

  private attachEventListeners(): void {
    // Button click events
    this.container.querySelectorAll('.toolbar-button[data-action]').forEach(button => {
      button.addEventListener('click', (e) => {
        const action = (e.currentTarget as HTMLElement).dataset.action;
        if (action) {
          this.handleAction(action);
        }
      });
    });

    // Page input
    const pageInput = this.elements.get('page-input') as HTMLInputElement;
    if (pageInput) {
      pageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const page = parseInt(pageInput.value, 10);
          if (!isNaN(page)) {
            this.viewer.goToPage(page);
          }
        }
      });
    }

    // Zoom select
    const zoomSelect = this.elements.get('zoom-select') as HTMLSelectElement;
    if (zoomSelect) {
      zoomSelect.addEventListener('change', () => {
        const value = parseFloat(zoomSelect.value) / 100;
        this.viewer.setScale(value);
      });
    }

    // Viewer events
    this.viewer.on('pageChanged', ({ currentPage, totalPages }) => {
      if (pageInput) {
        pageInput.value = currentPage.toString();
      }
      const totalPagesElement = this.elements.get('total-pages');
      if (totalPagesElement) {
        totalPagesElement.textContent = ` / ${totalPages}`;
      }
      this.updateNavigationButtons(currentPage, totalPages);
    });

    this.viewer.on('scaleChanged', ({ scale }) => {
      if (zoomSelect) {
        const percentage = Math.round(scale * 100);
        zoomSelect.value = `${percentage}%`;
        if (zoomSelect.value !== `${percentage}%`) {
          // If exact value doesn't exist, add it
          const option = document.createElement('option');
          option.value = `${percentage}%`;
          option.textContent = `${percentage}%`;
          zoomSelect.appendChild(option);
          zoomSelect.value = `${percentage}%`;
        }
      }
    });

    this.viewer.on('themeChanged', ({ theme }) => {
      const themeButton = this.elements.get('theme-toggle');
      if (themeButton) {
        themeButton.innerHTML = `<span class="icon">${theme === 'dark' ? '☀️' : '🌙'}</span>`;
      }
    });
  }

  private handleAction(action: string): void {
    switch (action) {
      case 'openFile':
        this.openFile();
        break;
      case 'previousPage':
        this.viewer.previousPage();
        break;
      case 'nextPage':
        this.viewer.nextPage();
        break;
      case 'zoomIn':
        this.viewer.zoomIn();
        break;
      case 'zoomOut':
        this.viewer.zoomOut();
        break;
      case 'fitToWidth':
        this.viewer.fitToWidth();
        break;
      case 'fitToHeight':
        this.viewer.fitToHeight();
        break;
      case 'rotateClockwise':
        this.viewer.rotateClockwise();
        break;
      case 'rotateCounterClockwise':
        this.viewer.rotateCounterClockwise();
        break;
      case 'toggleSearch':
        this.toggleSearchBar();
        break;
      case 'print':
        this.viewer.print();
        break;
      case 'download':
        this.viewer.download();
        break;
      case 'toggleFullscreen':
        this.viewer.toggleFullscreen();
        break;
      case 'toggleTheme':
        this.toggleTheme();
        break;
    }
  }

  private openFile(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          this.viewer.loadPDF(arrayBuffer);
        };
        reader.readAsArrayBuffer(file);
      }
    };
    input.click();
  }

  private toggleSearchBar(): void {
    let searchBar = document.querySelector('.pdf-viewer-search-bar');
    if (!searchBar) {
      searchBar = this.createSearchBar();
      this.container.appendChild(searchBar);
    } else {
      searchBar.classList.toggle('hidden');
    }
  }

  private createSearchBar(): HTMLElement {
    const searchBar = document.createElement('div');
    searchBar.className = 'pdf-viewer-search-bar';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search in document...';
    searchInput.className = 'search-input';
    
    const searchButton = document.createElement('button');
    searchButton.textContent = 'Search';
    searchButton.className = 'search-button';
    
    const prevButton = document.createElement('button');
    prevButton.textContent = '◀';
    prevButton.className = 'search-nav-button';
    prevButton.onclick = () => this.viewer.previousSearchResult();
    
    const nextButton = document.createElement('button');
    nextButton.textContent = '▶';
    nextButton.className = 'search-nav-button';
    nextButton.onclick = () => this.viewer.nextSearchResult();
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.className = 'search-close-button';
    closeButton.onclick = () => {
      searchBar.classList.add('hidden');
      this.viewer.clearSearch();
    };
    
    const resultsSpan = document.createElement('span');
    resultsSpan.className = 'search-results';
    resultsSpan.id = 'search-results';
    
    searchButton.onclick = () => {
      const query = searchInput.value;
      if (query) {
        this.viewer.search(query);
      }
    };
    
    searchInput.onkeypress = (e) => {
      if (e.key === 'Enter') {
        searchButton.click();
      }
    };
    
    this.viewer.on('searchComplete', ({ totalResults }) => {
      resultsSpan.textContent = totalResults > 0 ? 
        `${totalResults} result${totalResults > 1 ? 's' : ''} found` : 
        'No results found';
    });
    
    searchBar.appendChild(searchInput);
    searchBar.appendChild(searchButton);
    searchBar.appendChild(prevButton);
    searchBar.appendChild(nextButton);
    searchBar.appendChild(resultsSpan);
    searchBar.appendChild(closeButton);
    
    return searchBar;
  }

  private toggleTheme(): void {
    const currentTheme = this.container.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.viewer.setTheme(newTheme);
  }

  private updateNavigationButtons(currentPage: number, totalPages: number): void {
    const prevButton = this.elements.get('prev-page') as HTMLButtonElement;
    const nextButton = this.elements.get('next-page') as HTMLButtonElement;
    
    if (prevButton) {
      prevButton.disabled = currentPage <= 1;
    }
    if (nextButton) {
      nextButton.disabled = currentPage >= totalPages;
    }
  }

  public setEnabled(id: string, enabled: boolean): void {
    const element = this.elements.get(id) as HTMLButtonElement;
    if (element) {
      element.disabled = !enabled;
    }
  }

  public setVisible(id: string, visible: boolean): void {
    const element = this.elements.get(id);
    if (element) {
      element.style.display = visible ? '' : 'none';
    }
  }
}