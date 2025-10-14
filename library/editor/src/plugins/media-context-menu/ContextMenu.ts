/**
 * Context Menu Component for Media Elements
 */

export interface ContextMenuItem {
  id?: string;
  label?: string;
  icon?: string;
  shortcut?: string;
  separator?: boolean;
  submenu?: ContextMenuItem[];
  disabled?: boolean;
  checked?: boolean;
  action?: (target: HTMLElement, menu: ContextMenu) => void;
}

export interface ContextMenuOptions {
  items: ContextMenuItem[];
  className?: string;
  onOpen?: (target: HTMLElement) => void;
  onClose?: () => void;
}

export class ContextMenu {
  private container: HTMLElement;
  private currentTarget: HTMLElement | null = null;
  private isOpen: boolean = false;
  private options: ContextMenuOptions;
  private submenuTimeout: number | null = null;
  private activeSubmenu: HTMLElement | null = null;

  constructor(options: ContextMenuOptions) {
    this.options = options;
    this.container = this.createContainer();
    this.bindEvents();
  }

  private createContainer(): HTMLElement {
    const menu = document.createElement('div');
    menu.className = `editor-context-menu ${this.options.className || ''}`;
    menu.style.display = 'none';
    menu.style.position = 'fixed';
    menu.style.zIndex = '10000';
    document.body.appendChild(menu);
    return menu;
  }

  private renderMenu(items: ContextMenuItem[], isSubmenu = false): HTMLElement {
    const menu = document.createElement('ul');
    menu.className = isSubmenu ? 'context-submenu' : 'context-menu-list';

    items.forEach(item => {
      if (item.separator) {
        const separator = document.createElement('li');
        separator.className = 'context-menu-separator';
        menu.appendChild(separator);
        return;
      }

      const li = document.createElement('li');
      li.className = 'context-menu-item';
      if (item.disabled) li.classList.add('disabled');
      if (item.checked) li.classList.add('checked');

      const content = document.createElement('div');
      content.className = 'context-menu-item-content';

      // Icon
      if (item.icon) {
        const icon = document.createElement('span');
        icon.className = 'context-menu-icon';
        icon.innerHTML = item.icon;
        content.appendChild(icon);
      }

      // Label
      const label = document.createElement('span');
      label.className = 'context-menu-label';
      label.textContent = item.label;
      content.appendChild(label);

      // Shortcut
      if (item.shortcut) {
        const shortcut = document.createElement('span');
        shortcut.className = 'context-menu-shortcut';
        shortcut.textContent = item.shortcut;
        content.appendChild(shortcut);
      }

      // Submenu arrow
      if (item.submenu) {
        const arrow = document.createElement('span');
        arrow.className = 'context-menu-arrow';
        arrow.innerHTML = '▶';
        content.appendChild(arrow);
      }

      li.appendChild(content);

      // Handle click
      if (!item.disabled && item.action) {
        li.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.currentTarget) {
            item.action!(this.currentTarget, this);
            this.close();
          }
        });
      }

      // Handle submenu
      if (item.submenu && !item.disabled) {
        const submenuEl = this.renderMenu(item.submenu, true);
        submenuEl.style.display = 'none';
        submenuEl.style.position = 'absolute';
        li.appendChild(submenuEl);

        li.addEventListener('mouseenter', () => {
          this.showSubmenu(li, submenuEl);
        });

        li.addEventListener('mouseleave', () => {
          this.hideSubmenu(submenuEl);
        });
      }

      menu.appendChild(li);
    });

    return menu;
  }

  private showSubmenu(parent: HTMLElement, submenu: HTMLElement) {
    if (this.submenuTimeout) {
      clearTimeout(this.submenuTimeout);
      this.submenuTimeout = null;
    }

    // Hide other submenus
    if (this.activeSubmenu && this.activeSubmenu !== submenu) {
      this.activeSubmenu.style.display = 'none';
    }

    const rect = parent.getBoundingClientRect();
    submenu.style.display = 'block';
    submenu.style.left = `${rect.width}px`;
    submenu.style.top = '0';

    // Adjust position if submenu goes off screen
    const submenuRect = submenu.getBoundingClientRect();
    if (submenuRect.right > window.innerWidth) {
      submenu.style.left = `-${submenuRect.width}px`;
    }
    if (submenuRect.bottom > window.innerHeight) {
      submenu.style.top = `${window.innerHeight - submenuRect.bottom}px`;
    }

    this.activeSubmenu = submenu;
  }

  private hideSubmenu(submenu: HTMLElement) {
    this.submenuTimeout = window.setTimeout(() => {
      submenu.style.display = 'none';
      if (this.activeSubmenu === submenu) {
        this.activeSubmenu = null;
      }
    }, 200);
  }

  private bindEvents() {
    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target as Node)) {
        this.close();
      }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Close on scroll
    document.addEventListener('scroll', () => {
      if (this.isOpen) {
        this.close();
      }
    }, true);
  }

  public open(x: number, y: number, target: HTMLElement) {
    this.currentTarget = target;
    this.container.innerHTML = '';
    
    const menuList = this.renderMenu(this.options.items);
    this.container.appendChild(menuList);

    // Position the menu
    this.container.style.display = 'block';
    const rect = this.container.getBoundingClientRect();

    // Adjust position to keep menu on screen
    let adjustedX = x;
    let adjustedY = y;

    if (x + rect.width > window.innerWidth) {
      adjustedX = window.innerWidth - rect.width - 10;
    }

    if (y + rect.height > window.innerHeight) {
      adjustedY = window.innerHeight - rect.height - 10;
    }

    this.container.style.left = `${adjustedX}px`;
    this.container.style.top = `${adjustedY}px`;

    this.isOpen = true;
    
    if (this.options.onOpen) {
      this.options.onOpen(target);
    }
  }

  public close() {
    if (!this.isOpen) return;

    this.container.style.display = 'none';
    this.isOpen = false;
    this.currentTarget = null;
    this.activeSubmenu = null;

    if (this.options.onClose) {
      this.options.onClose();
    }
  }

  public updateItems(items: ContextMenuItem[]) {
    this.options.items = items;
  }

  public destroy() {
    this.close();
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}