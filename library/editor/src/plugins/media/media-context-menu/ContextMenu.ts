/**
 * Context Menu Class for Media Elements
 */
export class ContextMenu {
  private menu: HTMLDivElement | null = null;
  private target: HTMLElement | null = null;
  private items: MenuItem[] = [];
  
  constructor(private options: ContextMenuOptions = {}) {}
  
  /**
   * Show the context menu
   */
  show(event: MouseEvent, items: MenuItem[], target?: HTMLElement): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.hide();
    this.target = target || (event.target as HTMLElement);
    this.items = items;
    
    this.menu = this.createMenu(items);
    document.body.appendChild(this.menu);
    
    // Position the menu
    this.positionMenu(event.clientX, event.clientY);
    
    // Add event listeners
    this.attachEventListeners();
  }
  
  /**
   * Hide the context menu
   */
  hide(): void {
    if (this.menu) {
      this.menu.remove();
      this.menu = null;
    }
    this.target = null;
    this.items = [];
  }
  
  /**
   * Create menu DOM element
   */
  private createMenu(items: MenuItem[]): HTMLDivElement {
    const menu = document.createElement('div');
    menu.className = this.options.className || 'context-menu';
    menu.style.cssText = `
      position: fixed;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      padding: 4px 0;
      min-width: 180px;
      z-index: 10000;
      user-select: none;
    `;
    
    const ul = document.createElement('ul');
    ul.style.cssText = `
      list-style: none;
      margin: 0;
      padding: 0;
    `;
    
    items.forEach(item => {
      const li = this.createMenuItem(item);
      ul.appendChild(li);
    });
    
    menu.appendChild(ul);
    return menu;
  }
  
  /**
   * Create individual menu item
   */
  private createMenuItem(item: MenuItem): HTMLLIElement {
    const li = document.createElement('li');
    
    if (item.divider) {
      li.style.cssText = `
        height: 1px;
        background: #e5e7eb;
        margin: 4px 8px;
      `;
    } else {
      li.style.cssText = `
        padding: 0;
        position: relative;
      `;
      
      const content = document.createElement('div');
      content.style.cssText = `
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #374151;
        transition: background 0.2s;
      `;
      
      // Add icon if provided
      if (item.icon) {
        const icon = document.createElement('span');
        icon.innerHTML = item.icon;
        icon.style.cssText = 'width: 16px; height: 16px; opacity: 0.6;';
        content.appendChild(icon);
      }
      
      // Add label
      const label = document.createElement('span');
      label.textContent = item.label || '';
      label.style.flex = '1';
      content.appendChild(label);
      
      // Add shortcut if provided
      if (item.shortcut) {
        const shortcut = document.createElement('span');
        shortcut.textContent = item.shortcut;
        shortcut.style.cssText = 'font-size: 12px; opacity: 0.5; margin-left: 16px;';
        content.appendChild(shortcut);
      }
      
      // Add arrow for submenus
      if (item.submenu) {
        const arrow = document.createElement('span');
        arrow.className = 'context-menu-arrow';
        arrow.innerHTML = '&#9654;'; // Right-pointing triangle
        content.appendChild(arrow);
      }
      
      li.appendChild(content);
      
      // Handle click
      if (item.action && !item.disabled) {
        content.onclick = (e) => {
          e.stopPropagation();
          item.action!(this.target);
          this.hide();
        };
      }
      
      // Handle hover effects
      if (!item.disabled) {
        content.onmouseenter = () => {
          content.style.background = '#f3f4f6';
          if (item.submenu) {
            this.showSubmenu(li, item.submenu);
          }
        };
        
        content.onmouseleave = () => {
          content.style.background = 'transparent';
        };
      } else {
        content.style.opacity = '0.5';
        content.style.cursor = 'default';
      }
    }
    
    return li;
  }
  
  /**
   * Show submenu
   */
  private showSubmenu(parent: HTMLElement, items: MenuItem[]): void {
    // Remove existing submenu
    const existingSubmenu = parent.querySelector('.submenu');
    if (existingSubmenu) {
      existingSubmenu.remove();
    }
    
    const submenu = document.createElement('div');
    submenu.className = 'submenu';
    submenu.style.cssText = `
      position: absolute;
      left: 100%;
      top: 0;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      padding: 4px 0;
      min-width: 150px;
      margin-left: 4px;
    `;
    
    const ul = document.createElement('ul');
    ul.style.cssText = `
      list-style: none;
      margin: 0;
      padding: 0;
    `;
    
    items.forEach(item => {
      const li = this.createMenuItem(item);
      ul.appendChild(li);
    });
    
    submenu.appendChild(ul);
    parent.appendChild(submenu);
  }
  
  /**
   * Position the menu on screen
   */
  private positionMenu(x: number, y: number): void {
    if (!this.menu) return;
    
    this.menu.style.left = `${x}px`;
    this.menu.style.top = `${y}px`;
    
    // Adjust if menu goes off-screen
    requestAnimationFrame(() => {
      if (!this.menu) return;
      
      const rect = this.menu.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      if (rect.right > windowWidth) {
        this.menu.style.left = `${windowWidth - rect.width - 10}px`;
      }
      
      if (rect.bottom > windowHeight) {
        this.menu.style.top = `${windowHeight - rect.height - 10}px`;
      }
    });
  }
  
  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    // Close on click outside
    const closeHandler = (e: MouseEvent) => {
      if (this.menu && !this.menu.contains(e.target as Node)) {
        this.hide();
        document.removeEventListener('click', closeHandler);
      }
    };
    
    // Close on ESC key
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.hide();
        document.removeEventListener('keydown', escHandler);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', closeHandler);
      document.addEventListener('keydown', escHandler);
    }, 0);
  }
}

/**
 * Menu item interface
 */
export interface MenuItem {
  id?: string;
  label?: string;
  icon?: string;
  shortcut?: string;
  action?: (target: HTMLElement | null) => void;
  submenu?: MenuItem[];
  divider?: boolean;
  disabled?: boolean;
}

/**
 * Context menu options
 */
export interface ContextMenuOptions {
  className?: string;
}