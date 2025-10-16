/**
 * ContextMenu 基础类
 * 所有右键菜单组件的基类
 */

import { BaseComponent, BaseComponentOptions } from './BaseComponent'
import { createElement } from '../../utils/dom'
import { adjustPosition } from '../../utils/position'

export interface MenuItem {
  id?: string
  label?: string
  icon?: string
  shortcut?: string
  divider?: boolean
  disabled?: boolean | ((context?: any) => boolean)
  visible?: boolean | ((context?: any) => boolean)
  checked?: boolean | ((context?: any) => boolean)
  action?: (context?: any) => void
  submenu?: MenuItem[]
  className?: string
  type?: 'normal' | 'checkbox' | 'radio'
  group?: string // radio分组
}

export interface ContextMenuOptions extends BaseComponentOptions {
  items?: MenuItem[]
  context?: any
  minWidth?: number
  maxHeight?: number
  animation?: boolean
  theme?: 'light' | 'dark'
  onSelect?: (item: MenuItem, context?: any) => void
  onBeforeShow?: (menu: ContextMenu) => void
  onAfterShow?: (menu: ContextMenu) => void
  onBeforeHide?: (menu: ContextMenu) => void
  onAfterHide?: (menu: ContextMenu) => void
}

export class ContextMenu extends BaseComponent {
  protected menuOptions: ContextMenuOptions
  protected items: MenuItem[] = []
  protected context: any = null
  protected itemsContainer: HTMLElement
  protected submenuMap: Map<HTMLElement, ContextMenu> = new Map()
  protected activeSubmenu: ContextMenu | null = null
  protected hideTimeout: number | null = null
  
  constructor(options: ContextMenuOptions = {}) {
    const defaultOptions: ContextMenuOptions = {
      minWidth: 200,
      maxHeight: window.innerHeight * 0.7,
      animation: true,
      theme: 'light',
      zIndex: 10000,
      className: 'ldesign-context-menu',
      ...options
    }
    
    super(defaultOptions)
    this.menuOptions = defaultOptions
    
    if (defaultOptions.items) {
      this.setItems(defaultOptions.items)
    }
    
    this.setupGlobalListeners()
  }

  protected createElement(): HTMLElement {
    const menu = document.createElement('div')
    menu.className = `ldesign-context-menu-container ${this.menuOptions.theme}`
    menu.style.cssText = `
      position: fixed;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      padding: 4px;
      min-width: ${this.menuOptions.minWidth}px;
      max-height: ${this.menuOptions.maxHeight}px;
      overflow-y: auto;
      font-size: 14px;
      color: #374151;
      user-select: none;
    `
    
    // 创建项目容器
    this.itemsContainer = createElement({
      className: 'ldesign-context-menu-items',
      parent: menu
    })
    
    return menu
  }

  protected setupGlobalListeners(): void {
    // 点击外部关闭
    this.bindEvent(document, 'mousedown', (e: Event) => {
      if (!this.visible) return
      
      const target = e.target as HTMLElement
      if (!this.element.contains(target) && !this.isInSubmenu(target)) {
        this.hide()
      }
    })
    
    // ESC键关闭
    this.bindEvent(document, 'keydown', (e: Event) => {
      const event = e as KeyboardEvent
      if (event.key === 'Escape' && this.visible) {
        this.hide()
      }
    })
    
    // 窗口滚动或大小改变时关闭
    this.bindEvent(window, 'scroll', () => this.hide(), { passive: true })
    this.bindEvent(window, 'resize', () => this.hide())
  }

  protected isInSubmenu(target: HTMLElement): boolean {
    for (const submenu of this.submenuMap.values()) {
      if (submenu.getElement().contains(target)) {
        return true
      }
    }
    return false
  }

  public setItems(items: MenuItem[]): void {
    this.items = items
    this.renderItems()
  }

  public setContext(context: any): void {
    this.context = context
  }

  protected renderItems(): void {
    this.itemsContainer.innerHTML = ''
    this.submenuMap.clear()
    
    this.items.forEach(item => {
      // 检查可见性
      if (item.visible !== undefined) {
        const visible = typeof item.visible === 'function' 
          ? item.visible(this.context) 
          : item.visible
        if (!visible) return
      }
      
      if (item.divider) {
        this.itemsContainer.appendChild(this.createDivider())
      } else {
        this.itemsContainer.appendChild(this.createMenuItem(item))
      }
    })
  }

  protected createMenuItem(item: MenuItem): HTMLElement {
    const element = createElement({
      className: `ldesign-context-menu-item ${item.className || ''}`,
      attrs: {
        'data-id': item.id || ''
      }
    })
    
    // 检查禁用状态
    const disabled = typeof item.disabled === 'function' 
      ? item.disabled(this.context) 
      : item.disabled
    
    // 检查选中状态
    const checked = typeof item.checked === 'function'
      ? item.checked(this.context)
      : item.checked
    
    // 基础样式
    element.style.cssText = `
      padding: 8px 12px;
      cursor: ${disabled ? 'not-allowed' : 'pointer'};
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 4px;
      transition: all 0.2s;
      opacity: ${disabled ? '0.5' : '1'};
      ${checked ? 'background: #eff6ff;' : ''}
    `
    
    // 图标
    if (item.icon) {
      const icon = createElement({
        tag: 'span',
        className: 'ldesign-context-menu-icon',
        html: item.icon,
        parent: element
      })
      icon.style.cssText = `
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        opacity: 0.7;
      `
    }
    
    // 复选框或单选框
    if (item.type === 'checkbox' || item.type === 'radio') {
      const checkmark = createElement({
        tag: 'span',
        className: 'ldesign-context-menu-check',
        html: checked ? '✓' : '',
        parent: element
      })
      checkmark.style.cssText = `
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        text-align: center;
      `
    }
    
    // 标签
    if (item.label) {
      const label = createElement({
        tag: 'span',
        className: 'ldesign-context-menu-label',
        text: item.label,
        parent: element
      })
      label.style.cssText = `flex: 1;`
    }
    
    // 快捷键
    if (item.shortcut) {
      const shortcut = createElement({
        tag: 'span',
        className: 'ldesign-context-menu-shortcut',
        text: item.shortcut,
        parent: element
      })
      shortcut.style.cssText = `
        font-size: 12px;
        opacity: 0.5;
        margin-left: auto;
      `
    }
    
    // 子菜单箭头
    if (item.submenu && item.submenu.length > 0) {
      const arrow = createElement({
        tag: 'span',
        className: 'ldesign-context-menu-arrow',
        text: '›',
        parent: element
      })
      arrow.style.cssText = `
        margin-left: auto;
        opacity: 0.5;
      `
    }
    
    // 事件处理
    if (!disabled) {
      // 鼠标悬停
      element.addEventListener('mouseenter', () => {
        if (!checked) {
          element.style.background = '#f9fafb'
        }
        
        // 显示子菜单
        if (item.submenu && item.submenu.length > 0) {
          this.showSubmenu(element, item.submenu)
        } else {
          this.hideActiveSubmenu()
        }
      })
      
      element.addEventListener('mouseleave', () => {
        if (!checked) {
          element.style.background = ''
        }
      })
      
      // 点击事件
      element.addEventListener('click', (e) => {
        e.stopPropagation()
        
        if (item.submenu && item.submenu.length > 0) {
          // 有子菜单时不执行动作
          return
        }
        
        // 执行动作
        if (item.action) {
          item.action(this.context)
        }
        
        // 触发选择事件
        this.menuOptions.onSelect?.(item, this.context)
        this.emit('select', item, this.context)
        
        // 关闭菜单
        this.hide()
      })
    }
    
    return element
  }

  protected createDivider(): HTMLElement {
    const divider = createElement({
      className: 'ldesign-context-menu-divider'
    })
    divider.style.cssText = `
      height: 1px;
      background: #e5e7eb;
      margin: 4px 0;
    `
    return divider
  }

  protected showSubmenu(parentItem: HTMLElement, items: MenuItem[]): void {
    // 先隐藏当前子菜单
    this.hideActiveSubmenu()
    
    // 创建新的子菜单
    const submenu = new ContextMenu({
      items,
      context: this.context,
      minWidth: this.menuOptions.minWidth,
      maxHeight: this.menuOptions.maxHeight,
      theme: this.menuOptions.theme,
      animation: false, // 子菜单不需要动画
      zIndex: (this.menuOptions.zIndex || 10000) + 1
    })
    
    // 计算位置
    const itemRect = parentItem.getBoundingClientRect()
    const menuRect = this.element.getBoundingClientRect()
    
    // 优先显示在右侧
    let x = menuRect.right
    let y = itemRect.top
    
    // 如果右侧空间不够，显示在左侧
    const submenuWidth = this.menuOptions.minWidth || 200
    if (x + submenuWidth > window.innerWidth) {
      x = menuRect.left - submenuWidth
    }
    
    // 调整位置确保不超出视口
    const adjusted = adjustPosition(submenu.getElement(), x, y)
    submenu.setPosition(adjusted.x, adjusted.y)
    submenu.show()
    
    // 保存子菜单引用
    this.submenuMap.set(parentItem, submenu)
    this.activeSubmenu = submenu
    
    // 子菜单隐藏时清理引用
    submenu.on('hide', () => {
      this.submenuMap.delete(parentItem)
      if (this.activeSubmenu === submenu) {
        this.activeSubmenu = null
      }
    })
  }

  protected hideActiveSubmenu(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout)
    }
    
    this.hideTimeout = window.setTimeout(() => {
      if (this.activeSubmenu) {
        this.activeSubmenu.hide()
        this.activeSubmenu = null
      }
    }, 100)
  }

  public showAt(x: number, y: number, context?: any): void {
    if (context !== undefined) {
      this.context = context
    }
    
    // 触发显示前回调
    this.menuOptions.onBeforeShow?.(this)
    
    // 重新渲染项目（考虑动态状态）
    this.renderItems()
    
    // 设置位置
    this.setPosition(x, y)
    
    // 显示菜单
    this.show()
    
    // 调整位置以确保在视口内
    requestAnimationFrame(() => {
      const adjusted = adjustPosition(this.element, x, y)
      this.setPosition(adjusted.x, adjusted.y)
      
      // 触发显示后回调
      this.menuOptions.onAfterShow?.(this)
    })
  }

  protected beforeShow(): void {
    if (this.menuOptions.animation) {
      this.element.style.opacity = '0'
      this.element.style.transform = 'scale(0.95)'
      
      requestAnimationFrame(() => {
        this.element.style.transition = 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
        this.element.style.opacity = '1'
        this.element.style.transform = 'scale(1)'
      })
    }
  }

  protected beforeHide(): void {
    // 触发隐藏前回调
    this.menuOptions.onBeforeHide?.(this)
    
    // 隐藏所有子菜单
    this.submenuMap.forEach(submenu => submenu.hide())
    this.submenuMap.clear()
    this.activeSubmenu = null
    
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout)
      this.hideTimeout = null
    }
  }

  protected afterHide(): void {
    // 触发隐藏后回调
    this.menuOptions.onAfterHide?.(this)
  }

  public updateItem(id: string, updates: Partial<MenuItem>): void {
    const item = this.items.find(item => item.id === id)
    if (item) {
      Object.assign(item, updates)
      this.renderItems()
    }
  }

  public getItem(id: string): MenuItem | undefined {
    return this.items.find(item => item.id === id)
  }

  public addItem(item: MenuItem, index?: number): void {
    if (index !== undefined) {
      this.items.splice(index, 0, item)
    } else {
      this.items.push(item)
    }
    this.renderItems()
  }

  public removeItem(id: string): void {
    const index = this.items.findIndex(item => item.id === id)
    if (index >= 0) {
      this.items.splice(index, 1)
      this.renderItems()
    }
  }
}