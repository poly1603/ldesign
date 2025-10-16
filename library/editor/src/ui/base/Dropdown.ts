/**
 * Dropdown 基础类
 * 所有下拉菜单组件的基类
 */

import { BaseComponent, BaseComponentOptions } from './BaseComponent'

export interface DropdownItem {
  label: string
  value?: any
  icon?: string
  divider?: boolean
  disabled?: boolean
  selected?: boolean
  onClick?: (item: DropdownItem) => void
  submenu?: DropdownItem[]
}

export interface DropdownOptions extends BaseComponentOptions {
  items?: DropdownItem[]
  trigger?: HTMLElement
  position?: 'bottom' | 'top' | 'left' | 'right' | 'auto'
  alignment?: 'start' | 'center' | 'end'
  width?: number | 'auto' | 'match-trigger'
  maxHeight?: number
  showOnHover?: boolean
  hideOnClick?: boolean
  searchable?: boolean
  placeholder?: string
  animation?: boolean
}

export class Dropdown extends BaseComponent {
  protected dropdownOptions: DropdownOptions
  protected trigger: HTMLElement | null = null
  protected itemsContainer: HTMLElement
  protected searchInput: HTMLInputElement | null = null
  protected items: DropdownItem[] = []
  protected filteredItems: DropdownItem[] = []
  
  constructor(options: DropdownOptions = {}) {
    const defaultOptions: DropdownOptions = {
      position: 'bottom',
      alignment: 'start',
      width: 'auto',
      maxHeight: 300,
      showOnHover: false,
      hideOnClick: true,
      searchable: false,
      animation: true,
      zIndex: 9999,
      className: 'ldesign-dropdown',
      ...options
    }
    
    super(defaultOptions)
    this.dropdownOptions = defaultOptions
    
    if (defaultOptions.items) {
      this.setItems(defaultOptions.items)
    }
    
    if (defaultOptions.trigger) {
      this.setTrigger(defaultOptions.trigger)
    }
  }

  protected createElement(): HTMLElement {
    const dropdown = document.createElement('div')
    dropdown.className = 'ldesign-dropdown-container'
    dropdown.style.cssText = `
      position: fixed;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      padding: 4px;
      overflow: hidden;
    `
    
    // 创建搜索框
    if (this.dropdownOptions.searchable) {
      this.searchInput = this.createSearchInput()
      dropdown.appendChild(this.searchInput)
    }
    
    // 创建项目容器
    this.itemsContainer = this.createItemsContainer()
    dropdown.appendChild(this.itemsContainer)
    
    return dropdown
  }

  protected createSearchInput(): HTMLInputElement {
    const container = document.createElement('div')
    container.style.cssText = `
      padding: 8px;
      border-bottom: 1px solid #e5e7eb;
    `
    
    const input = document.createElement('input')
    input.type = 'text'
    input.placeholder = this.dropdownOptions.placeholder || 'Search...'
    input.className = 'ldesign-dropdown-search'
    input.style.cssText = `
      width: 100%;
      padding: 6px 10px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      outline: none;
      font-size: 14px;
    `
    
    input.addEventListener('input', () => {
      this.filterItems(input.value)
    })
    
    container.appendChild(input)
    return input
  }

  protected createItemsContainer(): HTMLElement {
    const container = document.createElement('div')
    container.className = 'ldesign-dropdown-items'
    container.style.cssText = `
      max-height: ${this.dropdownOptions.maxHeight}px;
      overflow-y: auto;
    `
    return container
  }

  public setItems(items: DropdownItem[]): void {
    this.items = items
    this.filteredItems = items
    this.renderItems()
  }

  protected renderItems(): void {
    this.itemsContainer.innerHTML = ''
    
    this.filteredItems.forEach((item, index) => {
      if (item.divider) {
        this.itemsContainer.appendChild(this.createDivider())
      } else {
        this.itemsContainer.appendChild(this.createItem(item, index))
      }
    })
  }

  protected createItem(item: DropdownItem, index: number): HTMLElement {
    const element = document.createElement('div')
    element.className = 'ldesign-dropdown-item'
    element.dataset.index = index.toString()
    
    const baseStyles = `
      padding: 8px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 4px;
      transition: all 0.2s;
      font-size: 14px;
      color: #374151;
    `
    
    const disabledStyles = item.disabled ? `
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    ` : ''
    
    const selectedStyles = item.selected ? `
      background: #eff6ff;
      color: #2563eb;
    ` : ''
    
    element.style.cssText = baseStyles + disabledStyles + selectedStyles
    
    // 添加图标
    if (item.icon) {
      const icon = document.createElement('span')
      icon.className = 'ldesign-dropdown-item-icon'
      icon.innerHTML = item.icon
      icon.style.cssText = `
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      `
      element.appendChild(icon)
    }
    
    // 添加标签
    const label = document.createElement('span')
    label.className = 'ldesign-dropdown-item-label'
    label.textContent = item.label
    label.style.cssText = `flex: 1;`
    element.appendChild(label)
    
    // 添加子菜单箭头
    if (item.submenu) {
      const arrow = document.createElement('span')
      arrow.className = 'ldesign-dropdown-item-arrow'
      arrow.innerHTML = '›'
      arrow.style.cssText = `
        margin-left: auto;
        opacity: 0.5;
      `
      element.appendChild(arrow)
    }
    
    // 鼠标悬停效果
    if (!item.disabled) {
      element.addEventListener('mouseenter', () => {
        if (!item.selected) {
          element.style.background = '#f9fafb'
        }
      })
      
      element.addEventListener('mouseleave', () => {
        if (!item.selected) {
          element.style.background = ''
        }
      })
      
      // 点击事件
      element.addEventListener('click', () => {
        this.handleItemClick(item, index)
      })
    }
    
    return element
  }

  protected createDivider(): HTMLElement {
    const divider = document.createElement('div')
    divider.className = 'ldesign-dropdown-divider'
    divider.style.cssText = `
      height: 1px;
      background: #e5e7eb;
      margin: 4px 0;
    `
    return divider
  }

  protected handleItemClick(item: DropdownItem, index: number): void {
    if (item.onClick) {
      item.onClick(item)
    }
    
    this.emit('select', item, index)
    
    if (this.dropdownOptions.hideOnClick && !item.submenu) {
      this.hide()
    }
  }

  public setTrigger(trigger: HTMLElement): void {
    // 移除旧触发器的事件
    if (this.trigger) {
      // 事件会在 removeAllEvents 中清理
    }
    
    this.trigger = trigger
    
    if (this.dropdownOptions.showOnHover) {
      this.bindEvent(trigger, 'mouseenter', () => this.show())
      this.bindEvent(trigger, 'mouseleave', () => {
        setTimeout(() => {
          if (!this.element.matches(':hover')) {
            this.hide()
          }
        }, 100)
      })
      
      this.bindEvent(this.element, 'mouseleave', () => {
        setTimeout(() => {
          if (!trigger.matches(':hover')) {
            this.hide()
          }
        }, 100)
      })
    } else {
      this.bindEvent(trigger, 'click', (e: Event) => {
        e.stopPropagation()
        this.toggle()
      })
    }
    
    // 点击外部关闭
    this.bindEvent(document, 'click', (e: Event) => {
      const target = e.target as HTMLElement
      if (!this.element.contains(target) && target !== trigger) {
        this.hide()
      }
    })
  }

  protected filterItems(query: string): void {
    if (!query) {
      this.filteredItems = this.items
    } else {
      const lowerQuery = query.toLowerCase()
      this.filteredItems = this.items.filter(item => 
        !item.divider && item.label.toLowerCase().includes(lowerQuery)
      )
    }
    
    this.renderItems()
  }

  protected beforeShow(): void {
    this.positionDropdown()
    
    if (this.dropdownOptions.animation) {
      this.element.style.opacity = '0'
      this.element.style.transform = 'translateY(-10px)'
      
      requestAnimationFrame(() => {
        this.element.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        this.element.style.opacity = '1'
        this.element.style.transform = 'translateY(0)'
      })
    }
    
    if (this.searchInput) {
      setTimeout(() => this.searchInput?.focus(), 100)
    }
  }

  protected positionDropdown(): void {
    if (!this.trigger) return
    
    const triggerRect = this.trigger.getBoundingClientRect()
    const dropdownRect = this.element.getBoundingClientRect()
    const { position, alignment } = this.dropdownOptions
    
    let top = 0
    let left = 0
    
    // 设置宽度
    if (this.dropdownOptions.width === 'match-trigger') {
      this.element.style.width = `${triggerRect.width}px`
    } else if (typeof this.dropdownOptions.width === 'number') {
      this.element.style.width = `${this.dropdownOptions.width}px`
    }
    
    // 计算位置
    switch (position) {
      case 'bottom':
        top = triggerRect.bottom + 4
        left = this.getAlignmentPosition(triggerRect, dropdownRect, alignment)
        break
      case 'top':
        top = triggerRect.top - dropdownRect.height - 4
        left = this.getAlignmentPosition(triggerRect, dropdownRect, alignment)
        break
      case 'left':
        top = triggerRect.top
        left = triggerRect.left - dropdownRect.width - 4
        break
      case 'right':
        top = triggerRect.top
        left = triggerRect.right + 4
        break
      case 'auto':
        // 自动选择最佳位置
        const spaceBelow = window.innerHeight - triggerRect.bottom
        const spaceAbove = triggerRect.top
        
        if (spaceBelow >= dropdownRect.height || spaceBelow > spaceAbove) {
          top = triggerRect.bottom + 4
        } else {
          top = triggerRect.top - dropdownRect.height - 4
        }
        
        left = this.getAlignmentPosition(triggerRect, dropdownRect, alignment)
        break
    }
    
    // 确保不超出视口
    const padding = 10
    left = Math.max(padding, Math.min(left, window.innerWidth - dropdownRect.width - padding))
    top = Math.max(padding, Math.min(top, window.innerHeight - dropdownRect.height - padding))
    
    this.setPosition(left, top)
  }

  private getAlignmentPosition(
    triggerRect: DOMRect,
    dropdownRect: DOMRect,
    alignment?: 'start' | 'center' | 'end'
  ): number {
    switch (alignment) {
      case 'center':
        return triggerRect.left + (triggerRect.width - dropdownRect.width) / 2
      case 'end':
        return triggerRect.right - dropdownRect.width
      case 'start':
      default:
        return triggerRect.left
    }
  }

  public getSelectedItem(): DropdownItem | null {
    return this.items.find(item => item.selected) || null
  }

  public setSelectedItem(value: any): void {
    this.items.forEach(item => {
      item.selected = item.value === value
    })
    this.renderItems()
  }

  public clearSelection(): void {
    this.items.forEach(item => {
      item.selected = false
    })
    this.renderItems()
  }
}