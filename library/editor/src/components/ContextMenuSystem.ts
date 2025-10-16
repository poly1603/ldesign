/**
 * 通用多层右键菜单系统
 * 支持无限层级、动态菜单项、快捷键、图标、分隔符等功能
 */

import { getLucideIcon } from '../ui/icons/lucide'

export interface MenuItem {
  id?: string
  label?: string
  icon?: string
  shortcut?: string
  action?: (context?: any) => void
  submenu?: MenuItem[]
  divider?: boolean
  disabled?: boolean | ((context?: any) => boolean)
  visible?: boolean | ((context?: any) => boolean)
  checked?: boolean | ((context?: any) => boolean)
  type?: 'normal' | 'checkbox' | 'radio'
  group?: string // 用于radio类型的分组
  className?: string
  tooltip?: string
}

export interface ContextMenuOptions {
  items: MenuItem[]
  context?: any
  onBeforeShow?: (menu: ContextMenuSystem) => void
  onAfterShow?: (menu: ContextMenuSystem) => void
  onBeforeHide?: (menu: ContextMenuSystem) => void
  onAfterHide?: (menu: ContextMenuSystem) => void
  theme?: 'light' | 'dark'
  animation?: boolean
  maxHeight?: number
  minWidth?: number
  zIndex?: number
}

export class ContextMenuSystem {
  private container: HTMLDivElement
  private options: ContextMenuOptions
  private visible = false
  private submenuMap = new Map<HTMLElement, HTMLDivElement>()
  private activeSubmenus: HTMLDivElement[] = []
  private hideTimeouts = new Map<HTMLElement, number>()
  
  constructor(options: ContextMenuOptions) {
    this.options = {
      theme: 'light',
      animation: true,
      maxHeight: window.innerHeight * 0.7,
      minWidth: 200,
      zIndex: 10000,
      ...options
    }
    
    this.container = this.createContainer()
    this.attachEventListeners()
  }
  
  private createContainer(): HTMLDivElement {
    const container = document.createElement('div')
    container.className = `context-menu-system context-menu-${this.options.theme}`
    container.style.cssText = `
      position: fixed;
      display: none;
      z-index: ${this.options.zIndex};
      min-width: ${this.options.minWidth}px;
      max-height: ${this.options.maxHeight}px;
      overflow-y: auto;
      background: var(--menu-bg, #ffffff);
      border: 1px solid var(--menu-border, #e5e7eb);
      border-radius: 8px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      padding: 4px;
      font-size: 14px;
      color: var(--menu-text, #374151);
      user-select: none;
      backdrop-filter: blur(10px);
      ${this.options.animation ? 'transition: opacity 0.15s, transform 0.15s;' : ''}
    `
    
    document.body.appendChild(container)
    return container
  }
  
  private attachEventListeners(): void {
    // 点击其他地方关闭菜单
    document.addEventListener('mousedown', (e) => {
      if (!this.visible) return
      
      const target = e.target as HTMLElement
      if (!this.container.contains(target) && 
          !Array.from(this.submenuMap.values()).some(submenu => submenu.contains(target))) {
        this.hide()
      }
    })
    
    // ESC键关闭菜单
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.visible) {
        this.hide()
      }
    })
    
    // 滚动时处理菜单
    let scrollTimeout: number | null = null
    document.addEventListener('scroll', (e) => {
      if (!this.visible) return
      
      // 如果是菜单内部的滚动，不关闭
      const target = e.target as HTMLElement
      if (this.container.contains(target) || 
          Array.from(this.submenuMap.values()).some(submenu => submenu.contains(target))) {
        return
      }
      
      // 延迟关闭，避免误触
      if (scrollTimeout) clearTimeout(scrollTimeout)
      scrollTimeout = window.setTimeout(() => {
        // 只有大幅滚动才关闭菜单
        if (this.visible) {
          const rect = this.container.getBoundingClientRect()
          // 如果菜单还在视口内，不关闭
          if (rect.top >= -rect.height && rect.bottom <= window.innerHeight + rect.height) {
            return
          }
          this.hide()
        }
      }, 300)
    }, true)
    
    // 窗口大小改变时关闭菜单
    window.addEventListener('resize', () => {
      if (this.visible) {
        this.hide()
      }
    })
  }
  
  public show(x: number, y: number, context?: any): void {
    if (this.visible) {
      this.hide()
    }
    
    // 更新上下文
    if (context !== undefined) {
      this.options.context = context
    }
    
    // 触发显示前回调
    this.options.onBeforeShow?.(this)
    
    // 渲染菜单内容
    this.render()
    
    // 显示菜单
    this.container.style.display = 'block'
    
    if (this.options.animation) {
      this.container.style.opacity = '0'
      this.container.style.transform = 'scale(0.95)'
    }
    
    // 计算位置
    requestAnimationFrame(() => {
      const rect = this.container.getBoundingClientRect()
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const padding = 10
      
      let posX = x
      let posY = y
      
      // 水平位置调整
      if (x + rect.width + padding > windowWidth) {
        posX = Math.max(padding, x - rect.width)
      }
      
      // 垂直位置调整
      if (y + rect.height + padding > windowHeight) {
        posY = Math.max(padding, windowHeight - rect.height - padding)
      }
      
      this.container.style.left = `${posX}px`
      this.container.style.top = `${posY}px`
      
      if (this.options.animation) {
        this.container.style.opacity = '1'
        this.container.style.transform = 'scale(1)'
      }
      
      this.visible = true
      
      // 触发显示后回调
      this.options.onAfterShow?.(this)
    })
  }
  
  public hide(): void {
    if (!this.visible) return
    
    // 触发隐藏前回调
    this.options.onBeforeHide?.(this)
    
    // 清理所有子菜单
    this.cleanupSubmenus()
    
    // 隐藏主菜单
    if (this.options.animation) {
      this.container.style.opacity = '0'
      this.container.style.transform = 'scale(0.95)'
      
      setTimeout(() => {
        this.container.style.display = 'none'
        this.container.innerHTML = ''
      }, 150)
    } else {
      this.container.style.display = 'none'
      this.container.innerHTML = ''
    }
    
    this.visible = false
    
    // 触发隐藏后回调
    this.options.onAfterHide?.(this)
  }
  
  private cleanupSubmenus(): void {
    // 清除所有定时器
    this.hideTimeouts.forEach(timeout => clearTimeout(timeout))
    this.hideTimeouts.clear()
    
    // 移除所有子菜单
    this.submenuMap.forEach(submenu => {
      if (document.body.contains(submenu)) {
        document.body.removeChild(submenu)
      }
    })
    this.submenuMap.clear()
    this.activeSubmenus = []
  }
  
  private render(): void {
    this.container.innerHTML = ''
    this.renderItems(this.options.items, this.container)
  }
  
  private renderItems(items: MenuItem[], container: HTMLElement): void {
    items.forEach(item => {
      // 检查可见性
      if (item.visible !== undefined) {
        const isVisible = typeof item.visible === 'function' 
          ? item.visible(this.options.context) 
          : item.visible
        if (!isVisible) return
      }
      
      if (item.divider) {
        this.renderDivider(container)
      } else {
        this.renderMenuItem(item, container)
      }
    })
  }
  
  private renderDivider(container: HTMLElement): void {
    const divider = document.createElement('div')
    divider.className = 'context-menu-divider'
    divider.style.cssText = `
      height: 1px;
      background: var(--menu-divider, #e5e7eb);
      margin: 4px 0;
    `
    container.appendChild(divider)
  }
  
  private renderMenuItem(item: MenuItem, container: HTMLElement): void {
    const menuItem = document.createElement('div')
    menuItem.className = 'context-menu-item'
    
    // 检查禁用状态
    const isDisabled = typeof item.disabled === 'function' 
      ? item.disabled(this.options.context) 
      : item.disabled
    
    if (isDisabled) {
      menuItem.classList.add('disabled')
    }
    
    if (item.className) {
      menuItem.classList.add(...item.className.split(' '))
    }
    
    menuItem.style.cssText = `
      display: flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: ${isDisabled ? 'not-allowed' : 'pointer'};
      opacity: ${isDisabled ? '0.5' : '1'};
      position: relative;
      min-height: 32px;
      transition: background-color 0.15s;
    `
    
    // 添加悬停效果
    if (!isDisabled) {
      menuItem.addEventListener('mouseenter', () => {
        menuItem.style.backgroundColor = 'var(--menu-hover, #f3f4f6)'
      })
      
      menuItem.addEventListener('mouseleave', () => {
        menuItem.style.backgroundColor = 'transparent'
      })
    }
    
    // 复选框或单选框
    if (item.type === 'checkbox' || item.type === 'radio') {
      const checked = typeof item.checked === 'function' 
        ? item.checked(this.options.context) 
        : item.checked
      
      const checkIcon = document.createElement('span')
      checkIcon.className = 'context-menu-check'
      checkIcon.style.cssText = `
        width: 16px;
        height: 16px;
        margin-right: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      `
      
      if (checked) {
        checkIcon.innerHTML = item.type === 'radio' 
          ? getLucideIcon('circle') 
          : getLucideIcon('check')
      }
      
      menuItem.appendChild(checkIcon)
    }
    
    // 图标
    if (item.icon) {
      const icon = document.createElement('span')
      icon.className = 'context-menu-icon'
      icon.style.cssText = `
        width: 16px;
        height: 16px;
        margin-right: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      `
      icon.innerHTML = item.icon
      menuItem.appendChild(icon)
    }
    
    // 标签
    if (item.label) {
      const label = document.createElement('span')
      label.className = 'context-menu-label'
      label.style.cssText = `
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      `
      label.textContent = item.label
      menuItem.appendChild(label)
    }
    
    // 快捷键
    if (item.shortcut) {
      const shortcut = document.createElement('span')
      shortcut.className = 'context-menu-shortcut'
      shortcut.style.cssText = `
        margin-left: 20px;
        font-size: 12px;
        color: var(--menu-muted, #9ca3af);
      `
      shortcut.textContent = item.shortcut
      menuItem.appendChild(shortcut)
    }
    
    // 子菜单箭头
    if (item.submenu && item.submenu.length > 0) {
      const arrow = document.createElement('span')
      arrow.className = 'context-menu-arrow'
      arrow.style.cssText = `
        width: 16px;
        height: 16px;
        margin-left: auto;
        padding-left: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      `
      arrow.innerHTML = getLucideIcon('chevronRight')
      menuItem.appendChild(arrow)
      
      // 创建子菜单
      if (!isDisabled) {
        this.setupSubmenu(menuItem, item.submenu)
      }
    }
    
    // 提示信息
    if (item.tooltip) {
      menuItem.title = item.tooltip
    }
    
    // 点击事件
    if (item.action && !isDisabled && !item.submenu) {
      menuItem.addEventListener('click', (e) => {
        e.stopPropagation()
        item.action!(this.options.context)
        this.hide()
      })
    }
    
    container.appendChild(menuItem)
  }
  
  private setupSubmenu(parentItem: HTMLElement, items: MenuItem[]): void {
    const submenu = this.createSubmenu(items)
    this.submenuMap.set(parentItem, submenu)
    
    let hideTimeout: number | null = null
    
    parentItem.addEventListener('mouseenter', () => {
      // 清除隐藏定时器
      if (hideTimeout) {
        clearTimeout(hideTimeout)
        hideTimeout = null
      }
      
      // 隐藏其他同级子菜单
      this.activeSubmenus.forEach(s => {
        if (s !== submenu) {
          s.style.display = 'none'
        }
      })
      
      // 显示子菜单
      submenu.style.display = 'block'
      
      // 定位子菜单
      const itemRect = parentItem.getBoundingClientRect()
      const submenuRect = submenu.getBoundingClientRect()
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      
      let left = itemRect.right - 4
      let top = itemRect.top
      
      // 水平位置调整
      if (left + submenuRect.width > windowWidth - 10) {
        left = itemRect.left - submenuRect.width + 4
      }
      
      // 垂直位置调整
      if (top + submenuRect.height > windowHeight - 10) {
        top = Math.max(10, windowHeight - submenuRect.height - 10)
      }
      
      submenu.style.left = `${left}px`
      submenu.style.top = `${top}px`
      
      if (this.options.animation) {
        submenu.style.opacity = '1'
        submenu.style.transform = 'translateX(0)'
      }
      
      // 添加到活动子菜单列表
      if (!this.activeSubmenus.includes(submenu)) {
        this.activeSubmenus.push(submenu)
      }
    })
    
    parentItem.addEventListener('mouseleave', (e) => {
      const relatedTarget = e.relatedTarget as HTMLElement
      
      if (relatedTarget && submenu.contains(relatedTarget)) {
        return
      }
      
      hideTimeout = window.setTimeout(() => {
        submenu.style.display = 'none'
      }, 150)
      
      this.hideTimeouts.set(parentItem, hideTimeout)
    })
    
    submenu.addEventListener('mouseenter', () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout)
        hideTimeout = null
      }
    })
    
    submenu.addEventListener('mouseleave', (e) => {
      const relatedTarget = e.relatedTarget as HTMLElement
      
      if (relatedTarget && parentItem.contains(relatedTarget)) {
        return
      }
      
      hideTimeout = window.setTimeout(() => {
        submenu.style.display = 'none'
      }, 150)
      
      this.hideTimeouts.set(parentItem, hideTimeout)
    })
  }
  
  private createSubmenu(items: MenuItem[]): HTMLDivElement {
    const submenu = document.createElement('div')
    submenu.className = `context-submenu context-menu-${this.options.theme}`
    submenu.style.cssText = `
      position: fixed;
      display: none;
      z-index: ${this.options.zIndex! + 1};
      min-width: ${this.options.minWidth}px;
      max-height: ${this.options.maxHeight}px;
      overflow-y: auto;
      background: var(--menu-bg, #ffffff);
      border: 1px solid var(--menu-border, #e5e7eb);
      border-radius: 8px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      padding: 4px;
      font-size: 14px;
      color: var(--menu-text, #374151);
      user-select: none;
      backdrop-filter: blur(10px);
      ${this.options.animation ? 'opacity: 0; transform: translateX(-10px); transition: opacity 0.15s, transform 0.15s;' : ''}
    `
    
    this.renderItems(items, submenu)
    document.body.appendChild(submenu)
    
    return submenu
  }
  
  // 公共方法：更新菜单项
  public updateItems(items: MenuItem[]): void {
    this.options.items = items
    if (this.visible) {
      this.render()
    }
  }
  
  // 公共方法：更新上下文
  public updateContext(context: any): void {
    this.options.context = context
  }
  
  // 公共方法：销毁菜单
  public destroy(): void {
    this.hide()
    if (document.body.contains(this.container)) {
      document.body.removeChild(this.container)
    }
  }
}

// 便捷函数：显示右键菜单
export function showContextMenu(e: MouseEvent, options: ContextMenuOptions): ContextMenuSystem {
  e.preventDefault()
  e.stopPropagation()
  
  const menu = new ContextMenuSystem(options)
  menu.show(e.clientX, e.clientY)
  
  return menu
}