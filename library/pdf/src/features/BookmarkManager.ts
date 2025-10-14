import { EventEmitter } from '../core/EventEmitter';
import type { PDFViewer, Bookmark } from '../types';

export class BookmarkManager extends EventEmitter {
  private viewer: PDFViewer;
  private bookmarks: Map<string, Bookmark> = new Map();
  private bookmarkTree: Bookmark[] = [];
  private currentBookmark: Bookmark | null = null;
  private bookmarkPanel: HTMLElement | null = null;

  constructor(viewer: PDFViewer) {
    super();
    this.viewer = viewer;
    this.initializeBookmarkPanel();
    this.loadSavedBookmarks();
  }

  /**
   * Initialize bookmark panel UI
   */
  private initializeBookmarkPanel(): void {
    const container = this.viewer.options.container as HTMLElement;
    this.bookmarkPanel = document.createElement('div');
    this.bookmarkPanel.className = 'pdf-bookmark-panel';
    this.bookmarkPanel.style.display = 'none';
    container.appendChild(this.bookmarkPanel);
  }

  /**
   * Add a bookmark
   */
  addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Bookmark {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: this.generateId(),
      createdAt: new Date()
    };

    // Add to bookmarks map
    this.bookmarks.set(newBookmark.id, newBookmark);

    // Add to tree structure if no parent
    if (!bookmark.parentId) {
      this.bookmarkTree.push(newBookmark);
    } else {
      // Add as child of parent bookmark
      const parent = this.bookmarks.get(bookmark.parentId);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(newBookmark);
      }
    }

    this.saveBookmarks();
    this.renderBookmarks();
    this.emit('bookmark-added', newBookmark);
    
    return newBookmark;
  }

  /**
   * Add bookmark for current page
   */
  addCurrentPageBookmark(title?: string): Bookmark | null {
    try {
      const currentPage = this.viewer.getCurrentPage();
      const viewport = this.viewer.getViewport();
      
      if (!currentPage || currentPage === 0) {
        console.warn('No page loaded to bookmark');
        return null;
      }
      
      return this.addBookmark({
        title: title || `Page ${currentPage}`,
        pageNumber: currentPage,
        position: viewport ? { 
          x: viewport.scrollLeft || 0, 
          y: viewport.scrollTop || 0 
        } : undefined
      });
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      return null;
    }
  }

  /**
   * Update a bookmark
   */
  updateBookmark(id: string, updates: Partial<Bookmark>): void {
    const bookmark = this.bookmarks.get(id);
    if (bookmark) {
      Object.assign(bookmark, updates);
      this.saveBookmarks();
      this.renderBookmarks();
      this.emit('bookmark-updated', bookmark);
    }
  }

  /**
   * Remove a bookmark
   */
  removeBookmark(id: string): void {
    const bookmark = this.bookmarks.get(id);
    if (bookmark) {
      // Remove from map
      this.bookmarks.delete(id);

      // Remove from tree
      this.removeFromTree(id, this.bookmarkTree);

      // Remove children
      if (bookmark.children) {
        bookmark.children.forEach(child => this.removeBookmark(child.id));
      }

      this.saveBookmarks();
      this.renderBookmarks();
      this.emit('bookmark-removed', bookmark);
    }
  }

  /**
   * Remove bookmark from tree structure
   */
  private removeFromTree(id: string, tree: Bookmark[]): boolean {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].id === id) {
        tree.splice(i, 1);
        return true;
      }
      if (tree[i].children && this.removeFromTree(id, tree[i].children!)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Navigate to a bookmark
   */
  goToBookmark(id: string): void {
    const bookmark = this.bookmarks.get(id);
    if (bookmark) {
      this.viewer.goToPage(bookmark.pageNumber);
      
      // Scroll to position if available
      if (bookmark.position) {
        this.viewer.scrollTo(bookmark.position.x, bookmark.position.y);
      }

      this.currentBookmark = bookmark;
      this.highlightBookmark(id);
      this.emit('bookmark-navigated', bookmark);
    }
  }

  /**
   * Get all bookmarks
   */
  getAllBookmarks(): Bookmark[] {
    return Array.from(this.bookmarks.values());
  }

  /**
   * Get bookmarks tree
   */
  getBookmarkTree(): Bookmark[] {
    return this.bookmarkTree;
  }

  /**
   * Get bookmarks for a specific page
   */
  getPageBookmarks(pageNumber: number): Bookmark[] {
    return Array.from(this.bookmarks.values())
      .filter(b => b.pageNumber === pageNumber);
  }

  /**
   * Search bookmarks
   */
  searchBookmarks(query: string): Bookmark[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.bookmarks.values())
      .filter(b => b.title.toLowerCase().includes(lowerQuery));
  }

  /**
   * Import PDF outline as bookmarks
   */
  async importOutline(): Promise<void> {
    if (!this.viewer.document) {
      throw new Error('No document loaded');
    }

    try {
      const outline = await this.viewer.document.getOutline();
      if (outline) {
        this.outlineToBookmarks(outline);
        this.saveBookmarks();
        this.renderBookmarks();
        this.emit('outline-imported', outline);
      }
    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * Convert PDF outline to bookmarks
   */
  private outlineToBookmarks(outline: any[], parent?: Bookmark): void {
    outline.forEach(item => {
      const bookmark = this.addBookmark({
        title: item.title,
        pageNumber: item.dest ? item.dest[0] + 1 : 1,
        parentId: parent?.id
      });

      if (item.items && item.items.length > 0) {
        this.outlineToBookmarks(item.items, bookmark);
      }
    });
  }

  /**
   * Export bookmarks
   */
  exportBookmarks(format: 'json' | 'html' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify({
        bookmarks: this.getAllBookmarks(),
        tree: this.bookmarkTree
      }, null, 2);
    } else {
      return this.generateHTML(this.bookmarkTree);
    }
  }

  /**
   * Import bookmarks
   */
  importBookmarks(data: string, format: 'json' | 'html' = 'json'): void {
    try {
      if (format === 'json') {
        const imported = JSON.parse(data);
        
        // Clear existing bookmarks
        this.bookmarks.clear();
        this.bookmarkTree = [];

        // Import bookmarks
        if (imported.bookmarks) {
          imported.bookmarks.forEach((b: Bookmark) => {
            this.bookmarks.set(b.id, b);
          });
        }

        if (imported.tree) {
          this.bookmarkTree = imported.tree;
        }

        this.saveBookmarks();
        this.renderBookmarks();
        this.emit('bookmarks-imported', imported);
      }
    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * Render bookmarks in UI
   */
  private renderBookmarks(): void {
    if (!this.bookmarkPanel) return;

    this.bookmarkPanel.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'bookmark-header';
    header.innerHTML = `
      <h3>Bookmarks</h3>
      <div class="bookmark-actions">
        <button class="btn-add-bookmark" title="Add bookmark">+</button>
        <button class="btn-import-outline" title="Import outline">📥</button>
        <button class="btn-export-bookmarks" title="Export bookmarks">📤</button>
      </div>
    `;
    this.bookmarkPanel.appendChild(header);

    // Add event listeners
    header.querySelector('.btn-add-bookmark')?.addEventListener('click', () => {
      const title = prompt('Enter bookmark title:');
      if (title) {
        this.addCurrentPageBookmark(title);
      }
    });

    header.querySelector('.btn-import-outline')?.addEventListener('click', () => {
      this.importOutline();
    });

    header.querySelector('.btn-export-bookmarks')?.addEventListener('click', () => {
      const data = this.exportBookmarks();
      this.downloadJSON(data, 'bookmarks.json');
    });

    // Render bookmark tree
    const list = document.createElement('div');
    list.className = 'bookmark-list';
    list.appendChild(this.renderBookmarkTree(this.bookmarkTree));
    this.bookmarkPanel.appendChild(list);
  }

  /**
   * Render bookmark tree recursively
   */
  private renderBookmarkTree(bookmarks: Bookmark[], level: number = 0): HTMLElement {
    const ul = document.createElement('ul');
    ul.className = `bookmark-level-${level}`;
    ul.style.paddingLeft = `${level * 20}px`;

    bookmarks.forEach(bookmark => {
      const li = document.createElement('li');
      li.className = 'bookmark-item';
      li.id = `bookmark-${bookmark.id}`;
      
      const content = document.createElement('div');
      content.className = 'bookmark-content';
      content.innerHTML = `
        <span class="bookmark-title" style="color: ${bookmark.color || '#000000'}">
          ${bookmark.title}
        </span>
        <span class="bookmark-page">(Page ${bookmark.pageNumber})</span>
        <div class="bookmark-actions">
          <button class="btn-edit" title="Edit">✏️</button>
          <button class="btn-delete" title="Delete">🗑️</button>
        </div>
      `;

      // Add click handler to navigate
      content.querySelector('.bookmark-title')?.addEventListener('click', () => {
        this.goToBookmark(bookmark.id);
      });

      // Add edit handler
      content.querySelector('.btn-edit')?.addEventListener('click', () => {
        const newTitle = prompt('Edit bookmark title:', bookmark.title);
        if (newTitle) {
          this.updateBookmark(bookmark.id, { title: newTitle });
        }
      });

      // Add delete handler
      content.querySelector('.btn-delete')?.addEventListener('click', () => {
        if (confirm(`Delete bookmark "${bookmark.title}"?`)) {
          this.removeBookmark(bookmark.id);
        }
      });

      li.appendChild(content);

      // Render children
      if (bookmark.children && bookmark.children.length > 0) {
        li.appendChild(this.renderBookmarkTree(bookmark.children, level + 1));
      }

      ul.appendChild(li);
    });

    return ul;
  }

  /**
   * Highlight a bookmark in UI
   */
  private highlightBookmark(id: string): void {
    // Remove previous highlights
    this.bookmarkPanel?.querySelectorAll('.bookmark-item.active')
      .forEach(el => el.classList.remove('active'));

    // Add highlight to current
    const element = document.getElementById(`bookmark-${id}`);
    if (element) {
      element.classList.add('active');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Toggle bookmark panel visibility
   */
  togglePanel(): void {
    if (this.bookmarkPanel) {
      const isVisible = this.bookmarkPanel.style.display !== 'none';
      this.bookmarkPanel.style.display = isVisible ? 'none' : 'block';
      this.emit('panel-toggled', !isVisible);
    }
  }

  /**
   * Show bookmark panel
   */
  showPanel(): void {
    if (this.bookmarkPanel) {
      this.bookmarkPanel.style.display = 'block';
      this.renderBookmarks();
    }
  }

  /**
   * Hide bookmark panel
   */
  hidePanel(): void {
    if (this.bookmarkPanel) {
      this.bookmarkPanel.style.display = 'none';
    }
  }

  /**
   * Save bookmarks to localStorage
   */
  private saveBookmarks(): void {
    try {
      const data = {
        bookmarks: Array.from(this.bookmarks.entries()),
        tree: this.bookmarkTree
      };
      localStorage.setItem('pdf-bookmarks', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save bookmarks:', error);
    }
  }

  /**
   * Load bookmarks from localStorage
   */
  private loadSavedBookmarks(): void {
    try {
      const saved = localStorage.getItem('pdf-bookmarks');
      if (saved) {
        const data = JSON.parse(saved);
        
        if (data.bookmarks) {
          this.bookmarks = new Map(data.bookmarks);
        }
        
        if (data.tree) {
          this.bookmarkTree = data.tree;
        }
        
        this.renderBookmarks();
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
  }

  /**
   * Generate HTML from bookmark tree
   */
  private generateHTML(bookmarks: Bookmark[]): string {
    let html = '<ul>';
    bookmarks.forEach(bookmark => {
      html += `<li>
        <a href="#page-${bookmark.pageNumber}">${bookmark.title}</a>
        ${bookmark.children ? this.generateHTML(bookmark.children) : ''}
      </li>`;
    });
    html += '</ul>';
    return html;
  }

  /**
   * Download JSON data
   */
  private downloadJSON(data: string, filename: string): void {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `bm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.saveBookmarks();
    if (this.bookmarkPanel) {
      this.bookmarkPanel.remove();
    }
    this.bookmarks.clear();
    this.bookmarkTree = [];
  }
}