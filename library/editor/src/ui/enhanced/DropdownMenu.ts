import { BaseComponent } from '../base/BaseComponent';
import './DropdownMenu.css';

export interface DropdownMenuItem {
  id: string;
  label: string;
  value?: any;
  icon?: string;
  disabled?: boolean;
  selected?: boolean;
  shortcut?: string;
  divider?: boolean;
  children?: DropdownMenuItem[];
  render?: (item: DropdownMenuItem) => HTMLElement;
}

export interface DropdownMenuConfig {
  trigger?: HTMLElement;
  items: DropdownMenuItem[];
  multiSelect?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  position?: 'auto' | 'bottom' | 'top' | 'left' | 'right';
  maxHeight?: number;
  minWidth?: number;
  closeOnSelect?: boolean;
  onSelect?: (item: DropdownMenuItem, items?: DropdownMenuItem[]) => void;
  onOpen?: () => void;
  onClose?: () => void;
  className?: string;
}

export class DropdownMenu extends BaseComponent {
  private config: DropdownMenuConfig;
  private menuElement: HTMLElement;
  private searchInput?: HTMLInputElement;
  private itemsContainer: HTMLElement;
  private selectedItems: Set<string> = new Set();
  private focusedIndex: number = -1;
  private filteredItems: DropdownMenuItem[] = [];
  private isOpen: boolean = false;
  private subMenus: Map<string, DropdownMenu> = new Map();

  constructor(config: DropdownMenuConfig) {
    super();
    this.config = {
      position: 'auto',
      closeOnSelect: !config.multiSelect,
      searchPlaceholder: 'Search...',
      ...config
    };
    this.filteredItems = [...this.config.items];
    this.init();
  }

  protected init(): void {
    this.createElements();
    this.bindEvents();
    this.updateSelectedItems();
  }

  private createElements(): void {
    // Create main dropdown container
    this.menuElement = document.createElement('div');
    this.menuElement.className = `dropdown-menu ${this.config.className || ''}`;
    this.menuElement.style.display = 'none';
    
    if (this.config.minWidth) {
      this.menuElement.style.minWidth = `${this.config.minWidth}px`;
    }

    // Add search input if searchable
    if (this.config.searchable) {
      const searchContainer = document.createElement('div');
      searchContainer.className = 'dropdown-search';
      
      this.searchInput = document.createElement('input');
      this.searchInput.type = 'text';
      this.searchInput.placeholder = this.config.searchPlaceholder!;
      this.searchInput.className = 'dropdown-search-input';
      
      searchContainer.appendChild(this.searchInput);
      this.menuElement.appendChild(searchContainer);
    }

    // Create items container
    this.itemsContainer = document.createElement('div');
    this.itemsContainer.className = 'dropdown-items';
    
    if (this.config.maxHeight) {
      this.itemsContainer.style.maxHeight = `${this.config.maxHeight}px`;
      this.itemsContainer.style.overflowY = 'auto';
    }

    this.menuElement.appendChild(this.itemsContainer);
    document.body.appendChild(this.menuElement);

    // Render initial items
    this.renderItems();
  }

  private renderItems(): void {
    this.itemsContainer.innerHTML = '';
    this.focusedIndex = -1;

    this.filteredItems.forEach((item, index) => {
      if (item.divider) {
        const divider = document.createElement('div');
        divider.className = 'dropdown-divider';
        this.itemsContainer.appendChild(divider);
        return;
      }

      const itemElement = this.createItemElement(item, index);
      this.itemsContainer.appendChild(itemElement);
    });
  }

  private createItemElement(item: DropdownMenuItem, index: number): HTMLElement {
    // Use custom render function if provided
    if (item.render) {
      const customElement = item.render(item);
      customElement.dataset.itemId = item.id;
      customElement.dataset.index = index.toString();
      this.bindItemEvents(customElement, item);
      return customElement;
    }

    // Default item rendering
    const itemElement = document.createElement('div');
    itemElement.className = 'dropdown-item';
    itemElement.dataset.itemId = item.id;
    itemElement.dataset.index = index.toString();

    if (item.disabled) {
      itemElement.classList.add('disabled');
    }

    if (this.selectedItems.has(item.id)) {
      itemElement.classList.add('selected');
    }

    // Add icon if provided
    if (item.icon) {
      const icon = document.createElement('span');
      icon.className = 'dropdown-item-icon';
      icon.innerHTML = item.icon;
      itemElement.appendChild(icon);
    }

    // Add label
    const label = document.createElement('span');
    label.className = 'dropdown-item-label';
    label.textContent = item.label;
    itemElement.appendChild(label);

    // Add shortcut if provided
    if (item.shortcut) {
      const shortcut = document.createElement('span');
      shortcut.className = 'dropdown-item-shortcut';
      shortcut.textContent = item.shortcut;
      itemElement.appendChild(shortcut);
    }

    // Add submenu indicator if has children
    if (item.children && item.children.length > 0) {
      const arrow = document.createElement('span');
      arrow.className = 'dropdown-item-arrow';
      arrow.innerHTML = '▶';
      itemElement.appendChild(arrow);
    }

    // Add checkbox for multi-select
    if (this.config.multiSelect) {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'dropdown-item-checkbox';
      checkbox.checked = this.selectedItems.has(item.id);
      itemElement.insertBefore(checkbox, itemElement.firstChild);
    }

    this.bindItemEvents(itemElement, item);
    return itemElement;
  }

  private bindItemEvents(element: HTMLElement, item: DropdownMenuItem): void {
    element.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!item.disabled) {
        this.selectItem(item);
      }
    });

    element.addEventListener('mouseenter', () => {
      if (!item.disabled) {
        this.setFocusedIndex(parseInt(element.dataset.index || '-1'));
        
        // Show submenu if has children
        if (item.children && item.children.length > 0) {
          this.showSubmenu(item, element);
        }
      }
    });

    element.addEventListener('mouseleave', () => {
      // Hide submenu when leaving item (unless entering the submenu itself)
      if (item.children && item.children.length > 0) {
        setTimeout(() => {
          const submenu = this.subMenus.get(item.id);
          if (submenu && !submenu.menuElement.matches(':hover')) {
            this.hideSubmenu(item.id);
          }
        }, 100);
      }
    });
  }

  private showSubmenu(parentItem: DropdownMenuItem, parentElement: HTMLElement): void {
    // Hide other submenus
    this.subMenus.forEach((menu, id) => {
      if (id !== parentItem.id) {
        this.hideSubmenu(id);
      }
    });

    // Create or show existing submenu
    let submenu = this.subMenus.get(parentItem.id);
    if (!submenu) {
      submenu = new DropdownMenu({
        items: parentItem.children!,
        multiSelect: this.config.multiSelect,
        closeOnSelect: this.config.closeOnSelect,
        onSelect: (item, items) => {
          // Propagate selection to parent
          if (this.config.onSelect) {
            this.config.onSelect(item, items);
          }
          if (this.config.closeOnSelect) {
            this.close();
          }
        },
        className: 'dropdown-submenu'
      });
      this.subMenus.set(parentItem.id, submenu);
    }

    // Position submenu relative to parent item
    const rect = parentElement.getBoundingClientRect();
    submenu.menuElement.style.position = 'fixed';
    submenu.menuElement.style.left = `${rect.right}px`;
    submenu.menuElement.style.top = `${rect.top}px`;
    submenu.menuElement.style.display = 'block';
  }

  private hideSubmenu(itemId: string): void {
    const submenu = this.subMenus.get(itemId);
    if (submenu) {
      submenu.menuElement.style.display = 'none';
    }
  }

  private bindEvents(): void {
    // Trigger events
    if (this.config.trigger) {
      this.config.trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });
    }

    // Search events
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => {
        this.filterItems(this.searchInput!.value);
      });

      this.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.close();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          this.handleArrowKey(e.key === 'ArrowDown' ? 1 : -1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.selectFocusedItem();
        }
      });
    }

    // Keyboard navigation
    this.menuElement.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.handleArrowKey(e.key === 'ArrowDown' ? 1 : -1);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.selectFocusedItem();
      } else if (e.key === 'ArrowRight') {
        this.expandFocusedSubmenu();
      } else if (e.key === 'ArrowLeft') {
        this.collapseFocusedSubmenu();
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.menuElement.contains(e.target as Node) && 
          (!this.config.trigger || !this.config.trigger.contains(e.target as Node))) {
        this.close();
      }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (this.isOpen && e.key === 'Escape') {
        this.close();
      }
    });
  }

  private filterItems(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredItems = [...this.config.items];
    } else {
      const term = searchTerm.toLowerCase();
      this.filteredItems = this.config.items.filter(item => 
        !item.divider && item.label.toLowerCase().includes(term)
      );
    }
    this.renderItems();
  }

  private handleArrowKey(direction: number): void {
    const selectableItems = this.filteredItems.filter(item => !item.divider && !item.disabled);
    if (selectableItems.length === 0) return;

    const currentIndex = this.focusedIndex;
    let newIndex = currentIndex + direction;

    // Wrap around
    if (newIndex < 0) {
      newIndex = selectableItems.length - 1;
    } else if (newIndex >= selectableItems.length) {
      newIndex = 0;
    }

    // Find actual index in filtered items
    const targetItem = selectableItems[newIndex];
    const actualIndex = this.filteredItems.indexOf(targetItem);
    this.setFocusedIndex(actualIndex);
  }

  private setFocusedIndex(index: number): void {
    // Remove previous focus
    const prevFocused = this.itemsContainer.querySelector('.focused');
    if (prevFocused) {
      prevFocused.classList.remove('focused');
    }

    // Set new focus
    this.focusedIndex = index;
    const items = this.itemsContainer.querySelectorAll('.dropdown-item');
    if (items[index]) {
      items[index].classList.add('focused');
      items[index].scrollIntoView({ block: 'nearest' });
    }
  }

  private selectFocusedItem(): void {
    if (this.focusedIndex >= 0 && this.focusedIndex < this.filteredItems.length) {
      const item = this.filteredItems[this.focusedIndex];
      if (!item.divider && !item.disabled) {
        this.selectItem(item);
      }
    }
  }

  private expandFocusedSubmenu(): void {
    if (this.focusedIndex >= 0 && this.focusedIndex < this.filteredItems.length) {
      const item = this.filteredItems[this.focusedIndex];
      if (item.children && item.children.length > 0) {
        const itemElement = this.itemsContainer.querySelectorAll('.dropdown-item')[this.focusedIndex] as HTMLElement;
        this.showSubmenu(item, itemElement);
      }
    }
  }

  private collapseFocusedSubmenu(): void {
    // Hide all submenus
    this.subMenus.forEach((menu, id) => {
      this.hideSubmenu(id);
    });
  }

  private selectItem(item: DropdownMenuItem): void {
    if (this.config.multiSelect) {
      // Toggle selection
      if (this.selectedItems.has(item.id)) {
        this.selectedItems.delete(item.id);
      } else {
        this.selectedItems.add(item.id);
      }
      
      // Update UI
      const itemElement = this.itemsContainer.querySelector(`[data-item-id="${item.id}"]`);
      if (itemElement) {
        itemElement.classList.toggle('selected');
        const checkbox = itemElement.querySelector('.dropdown-item-checkbox') as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = this.selectedItems.has(item.id);
        }
      }

      // Callback with all selected items
      if (this.config.onSelect) {
        const selectedItems = this.config.items.filter(i => this.selectedItems.has(i.id));
        this.config.onSelect(item, selectedItems);
      }
    } else {
      // Single select
      this.selectedItems.clear();
      this.selectedItems.add(item.id);
      
      if (this.config.onSelect) {
        this.config.onSelect(item);
      }

      if (this.config.closeOnSelect) {
        this.close();
      }
    }
  }

  private updateSelectedItems(): void {
    this.config.items.forEach(item => {
      if (item.selected) {
        this.selectedItems.add(item.id);
      }
    });
  }

  private positionMenu(): void {
    if (!this.config.trigger) return;

    const rect = this.config.trigger.getBoundingClientRect();
    const menuRect = this.menuElement.getBoundingClientRect();
    
    let top = rect.bottom;
    let left = rect.left;

    // Auto-positioning
    if (this.config.position === 'auto') {
      // Check if menu would go off-screen bottom
      if (top + menuRect.height > window.innerHeight) {
        top = rect.top - menuRect.height;
      }
      
      // Check if menu would go off-screen right
      if (left + menuRect.width > window.innerWidth) {
        left = rect.right - menuRect.width;
      }
    } else {
      switch (this.config.position) {
        case 'top':
          top = rect.top - menuRect.height;
          break;
        case 'left':
          top = rect.top;
          left = rect.left - menuRect.width;
          break;
        case 'right':
          top = rect.top;
          left = rect.right;
          break;
      }
    }

    // Ensure menu stays within viewport
    top = Math.max(0, Math.min(top, window.innerHeight - menuRect.height));
    left = Math.max(0, Math.min(left, window.innerWidth - menuRect.width));

    this.menuElement.style.position = 'fixed';
    this.menuElement.style.top = `${top}px`;
    this.menuElement.style.left = `${left}px`;
  }

  public open(): void {
    if (this.isOpen) return;

    this.menuElement.style.display = 'block';
    this.positionMenu();
    this.isOpen = true;

    // Focus search input if available
    if (this.searchInput) {
      setTimeout(() => this.searchInput?.focus(), 0);
    }

    // Force reflow to ensure initial state is applied
    void this.menuElement.offsetHeight;
    
    // Animate in on next frame
    requestAnimationFrame(() => {
      this.menuElement.classList.add('dropdown-menu-open');
    });

    if (this.config.onOpen) {
      this.config.onOpen();
    }
  }

  public close(): void {
    if (!this.isOpen) return;

    // Hide all submenus
    this.subMenus.forEach((menu, id) => {
      this.hideSubmenu(id);
    });

    // Remove open class to trigger close animation
    this.menuElement.classList.remove('dropdown-menu-open');
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
      if (!this.isOpen) { // Check if still closed
        this.menuElement.style.display = 'none';
      }
    }, 300); // Updated to match CSS animation duration

    this.isOpen = false;

    if (this.config.onClose) {
      this.config.onClose();
    }
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public setItems(items: DropdownMenuItem[]): void {
    this.config.items = items;
    this.filteredItems = [...items];
    this.renderItems();
    if (this.isOpen) {
      this.positionMenu();
    }
  }

  public getSelectedItems(): DropdownMenuItem[] {
    return this.config.items.filter(item => this.selectedItems.has(item.id));
  }

  public clearSelection(): void {
    this.selectedItems.clear();
    this.renderItems();
  }

  public destroy(): void {
    // Clean up submenus
    this.subMenus.forEach(menu => menu.destroy());
    this.subMenus.clear();

    // Remove element
    if (this.menuElement && this.menuElement.parentNode) {
      this.menuElement.parentNode.removeChild(this.menuElement);
    }

    // Clear references
    this.config = null as any;
    this.menuElement = null as any;
    this.searchInput = null as any;
    this.itemsContainer = null as any;
  }
}