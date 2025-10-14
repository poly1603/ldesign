/**
 * Word Document Renderer
 */

import mammoth from 'mammoth';
import { WordRenderOptions, RenderResult, DocumentInfo } from '../types';
import { createElement, generateId } from '../utils';

export class WordRenderer {
  private container: HTMLElement;
  private options: WordRenderOptions;
  private contentElement: HTMLElement | null = null;
  private currentPage = 1;
  private totalPages = 1;

  constructor(container: HTMLElement, options: WordRenderOptions) {
    this.container = container;
    this.options = {
      preserveStyles: true,
      showComments: false,
      showTrackedChanges: false,
      ...options
    };
  }

  async render(data: ArrayBuffer): Promise<RenderResult> {
    try {
      // Convert to HTML using mammoth
      const result = await mammoth.convertToHtml(
        { arrayBuffer: data },
        {
          styleMap: this.options.preserveStyles ? this.getStyleMap() : [],
          includeDefaultStyleMap: this.options.preserveStyles,
          convertImage: mammoth.images.imgElement((image) => {
            return image.read('base64').then((imageBuffer) => {
              return {
                src: `data:${image.contentType};base64,${imageBuffer}`
              };
            });
          })
        }
      );

      // Create viewer structure
      this.createViewer(result.value, result.messages);

      // Handle pagination if enabled
      if (this.options.pagination) {
        this.setupPagination();
      }

      // Call onLoad callback
      if (this.options.onLoad) {
        const docInfo: DocumentInfo = {
          type: 'word',
          name: 'document.docx',
          size: data.byteLength,
          pageCount: this.totalPages
        };
        this.options.onLoad(docInfo);
      }

      return this.createRenderResult();
    } catch (error) {
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      throw error;
    }
  }

  private createViewer(html: string, messages: any[]): void {
    // Clear container
    this.container.innerHTML = '';

    // Create wrapper
    const wrapper = createElement('div', {
      className: 'od-word-viewer',
      id: generateId('word')
    });

    // Add toolbar if enabled
    if (this.options.toolbar) {
      const toolbar = this.createToolbar();
      wrapper.appendChild(toolbar);
    }

    // Create content area
    this.contentElement = createElement('div', {
      className: 'od-word-content',
      innerHTML: html,
      style: {
        width: typeof this.options.width === 'number' 
          ? `${this.options.width}px` 
          : this.options.width || '100%',
        height: typeof this.options.height === 'number'
          ? `${this.options.height}px`
          : this.options.height || 'auto',
        overflow: 'auto',
        padding: '20px',
        backgroundColor: this.options.theme?.background || '#fff'
      }
    });

    // Process styles
    this.processStyles();

    // Add custom class if provided
    if (this.options.className) {
      wrapper.classList.add(this.options.className);
    }

    wrapper.appendChild(this.contentElement);
    this.container.appendChild(wrapper);

    // Log conversion messages if any warnings
    if (messages.length > 0) {
      console.warn('Word conversion messages:', messages);
    }
  }

  private createToolbar(): HTMLElement {
    const toolbar = createElement('div', {
      className: 'od-word-toolbar',
      style: {
        padding: '10px',
        borderBottom: '1px solid #ddd',
        backgroundColor: this.options.theme?.toolbar?.background || '#f5f5f5',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }
    });

    const items = this.options.toolbarOptions?.items || [
      'zoom-in', 'zoom-out', 'print', 'download'
    ];

    items.forEach(item => {
      const button = this.createToolbarButton(item);
      if (button) {
        toolbar.appendChild(button);
      }
    });

    // Add custom buttons
    if (this.options.toolbarOptions?.customButtons) {
      this.options.toolbarOptions.customButtons.forEach(customButton => {
        const button = createElement('button', {
          className: 'od-toolbar-button',
          id: customButton.id,
          textContent: customButton.text || '',
          attributes: {
            title: customButton.tooltip || ''
          }
        });
        button.onclick = customButton.onClick;
        toolbar.appendChild(button);
      });
    }

    return toolbar;
  }

  private createToolbarButton(item: string): HTMLElement | null {
    const button = createElement('button', {
      className: 'od-toolbar-button',
      attributes: {
        'data-action': item
      }
    });

    switch (item) {
      case 'zoom-in':
        button.innerHTML = '🔍+';
        button.title = 'Zoom In';
        button.onclick = () => this.zoomIn();
        break;
      case 'zoom-out':
        button.innerHTML = '🔍-';
        button.title = 'Zoom Out';
        button.onclick = () => this.zoomOut();
        break;
      case 'print':
        button.innerHTML = '🖨️';
        button.title = 'Print';
        button.onclick = () => this.print();
        break;
      case 'download':
        button.innerHTML = '💾';
        button.title = 'Download';
        button.onclick = () => this.download();
        break;
      case 'search':
        button.innerHTML = '🔍';
        button.title = 'Search';
        button.onclick = () => this.toggleSearch();
        break;
      case 'fullscreen':
        button.innerHTML = '⛶';
        button.title = 'Fullscreen';
        button.onclick = () => this.toggleFullscreen();
        break;
      default:
        return null;
    }

    return button;
  }

  private processStyles(): void {
    if (!this.contentElement) return;

    // Apply theme colors
    if (this.options.theme) {
      const theme = this.options.theme;
      
      if (theme.text) {
        this.contentElement.style.color = theme.text;
      }

      // Apply to all paragraphs
      const paragraphs = this.contentElement.querySelectorAll('p');
      paragraphs.forEach(p => {
        (p as HTMLElement).style.marginBottom = '1em';
        if (theme.text) {
          (p as HTMLElement).style.color = theme.text;
        }
      });

      // Style headings
      const headings = this.contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(h => {
        (h as HTMLElement).style.marginTop = '1.5em';
        (h as HTMLElement).style.marginBottom = '0.5em';
        if (theme.primary) {
          (h as HTMLElement).style.color = theme.primary;
        }
      });

      // Style tables
      const tables = this.contentElement.querySelectorAll('table');
      tables.forEach(table => {
        (table as HTMLElement).style.borderCollapse = 'collapse';
        (table as HTMLElement).style.width = '100%';
        (table as HTMLElement).style.marginBottom = '1em';
      });

      const cells = this.contentElement.querySelectorAll('td, th');
      cells.forEach(cell => {
        (cell as HTMLElement).style.border = `1px solid ${theme.border || '#ddd'}`;
        (cell as HTMLElement).style.padding = '8px';
      });
    }
  }

  private setupPagination(): void {
    // Implement pagination logic
    // This is a simplified version - real implementation would need more sophisticated page break detection
    if (!this.contentElement) return;

    const pageHeight = 1000; // Approximate page height in pixels
    const content = this.contentElement.innerHTML;
    const tempDiv = createElement('div', {
      style: {
        position: 'absolute',
        visibility: 'hidden',
        width: this.contentElement.offsetWidth + 'px'
      },
      innerHTML: content
    });

    document.body.appendChild(tempDiv);
    const totalHeight = tempDiv.offsetHeight;
    this.totalPages = Math.ceil(totalHeight / pageHeight);
    document.body.removeChild(tempDiv);

    // Add page navigation if multiple pages
    if (this.totalPages > 1 && this.options.toolbar) {
      this.addPageNavigation();
    }
  }

  private addPageNavigation(): void {
    const toolbar = this.container.querySelector('.od-word-toolbar');
    if (!toolbar) return;

    const pageNav = createElement('div', {
      className: 'od-page-navigation',
      style: {
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }
    });

    const prevBtn = createElement('button', {
      textContent: '◀',
      className: 'od-page-btn'
    });
    prevBtn.onclick = () => this.goToPage(this.currentPage - 1);

    const pageInfo = createElement('span', {
      textContent: `Page ${this.currentPage} of ${this.totalPages}`,
      className: 'od-page-info'
    });

    const nextBtn = createElement('button', {
      textContent: '▶',
      className: 'od-page-btn'
    });
    nextBtn.onclick = () => this.goToPage(this.currentPage + 1);

    pageNav.appendChild(prevBtn);
    pageNav.appendChild(pageInfo);
    pageNav.appendChild(nextBtn);

    toolbar.appendChild(pageNav);
  }

  private getStyleMap(): string[] {
    return [
      "p[style-name='Title'] => h1.document-title",
      "p[style-name='Heading 1'] => h1",
      "p[style-name='Heading 2'] => h2",
      "p[style-name='Heading 3'] => h3",
      "p[style-name='Heading 4'] => h4",
      "p[style-name='Heading 5'] => h5",
      "p[style-name='Heading 6'] => h6"
    ];
  }

  private createRenderResult(): RenderResult {
    return {
      destroy: () => this.destroy(),
      refresh: () => this.refresh(),
      goToPage: (page: number) => this.goToPage(page),
      setZoom: (zoom: number) => this.setZoom(zoom),
      getCurrentPage: () => this.currentPage,
      getTotalPages: () => this.totalPages,
      search: (query: string) => this.search(query),
      clearSearch: () => this.clearSearch(),
      print: () => this.print(),
      download: () => this.download(),
      enterFullscreen: () => this.enterFullscreen(),
      exitFullscreen: () => this.exitFullscreen()
    };
  }

  private destroy(): void {
    this.container.innerHTML = '';
    this.contentElement = null;
  }

  private refresh(): void {
    // Refresh implementation
  }

  private goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    
    this.currentPage = page;
    
    // Update page info
    const pageInfo = this.container.querySelector('.od-page-info');
    if (pageInfo) {
      pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
    }

    // Scroll to page
    if (this.contentElement) {
      const pageHeight = this.contentElement.scrollHeight / this.totalPages;
      this.contentElement.scrollTop = (page - 1) * pageHeight;
    }

    if (this.options.onPageChange) {
      this.options.onPageChange(page);
    }
  }

  private currentZoom = 100;

  private setZoom(zoom: number): void {
    this.currentZoom = zoom;
    if (this.contentElement) {
      this.contentElement.style.transform = `scale(${zoom / 100})`;
      this.contentElement.style.transformOrigin = 'top left';
    }
    
    if (this.options.onZoomChange) {
      this.options.onZoomChange(zoom);
    }
  }

  private zoomIn(): void {
    this.setZoom(Math.min(this.currentZoom + 10, 200));
  }

  private zoomOut(): void {
    this.setZoom(Math.max(this.currentZoom - 10, 50));
  }

  private search(query: string): void {
    // Implement search functionality
    if (!this.contentElement || !query) return;

    // Clear previous highlights
    this.clearSearch();

    const walker = document.createTreeWalker(
      this.contentElement,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes: Text[] = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node as Text);
    }

    textNodes.forEach(textNode => {
      const text = textNode.textContent || '';
      const regex = new RegExp(`(${query})`, 'gi');
      
      if (regex.test(text)) {
        const span = createElement('span');
        span.innerHTML = text.replace(regex, '<mark class="od-highlight">$1</mark>');
        textNode.parentNode?.replaceChild(span, textNode);
      }
    });
  }

  private clearSearch(): void {
    if (!this.contentElement) return;

    const highlights = this.contentElement.querySelectorAll('.od-highlight');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      if (parent) {
        parent.replaceChild(
          document.createTextNode(highlight.textContent || ''),
          highlight
        );
      }
    });
  }

  private print(): void {
    window.print();
  }

  private download(): void {
    // Implement download functionality
    console.log('Download functionality to be implemented');
  }

  private toggleSearch(): void {
    // Toggle search UI
    const searchQuery = prompt('Enter search term:');
    if (searchQuery) {
      this.search(searchQuery);
    }
  }

  private toggleFullscreen(): void {
    if (document.fullscreenElement) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }

  private enterFullscreen(): void {
    const viewer = this.container.querySelector('.od-word-viewer') as HTMLElement;
    if (viewer && viewer.requestFullscreen) {
      viewer.requestFullscreen();
    }
  }

  private exitFullscreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}