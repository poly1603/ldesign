/**
 * 工具栏管理器
 * 支持动态配置、按需加载和性能优化
 */

import type { Editor } from '../core/Editor'
import { EventEmitter } from '../core/EventEmitter'
import { getIconManager } from '../icons/IconManager'
import { getI18n } from '../i18n'
import type { ToolbarItem, ToolbarConfig } from '../types'

/**
 * 工具栏组配置
 */
export interface ToolbarGroupConfig {
  name: string
  label?: string
  items: string[]
  visible?: boolean
  collapsed?: boolean
  order?: number
}

/**
 * 工具栏配置
 */
export interface ToolbarManagerConfig {
  groups?: ToolbarGroupConfig[]
  position?: 'top' | 'bottom' | 'float'
  sticky?: boolean
  compact?: boolean
  showLabels?: boolean
  lazyLoad?: boolean
}

/**
 * 工具栏项注册信息
 */
interface ToolbarItemRegistration {
  item: ToolbarItem
  element?: HTMLElement
  loaded: boolean
  visible: boolean
  group?: string
}

/**
 * 工具栏管理器类
 */
export class ToolbarManager extends EventEmitter {
  private editor: Editor
  private config: ToolbarManagerConfig
  private container: HTMLElement
  private items: Map<string, ToolbarItemRegistration> = new Map()
  private groups: Map<string, ToolbarGroupConfig> = new Map()
  private visibleItems: Set<string> = new Set()
  private observer?: IntersectionObserver
  
  constructor(editor: Editor, config: ToolbarManagerConfig = {}) {
    super()
    this.editor = editor
    this.config = {
      position: 'top',
      sticky: true,
      compact: false,
      showLabels: false,
      lazyLoad: true,
      ...config
    }
    
    this.container = this.createContainer()
    this.setupIntersectionObserver()
  }
  
  /**
   * 创建容器
   */
  private createContainer(): HTMLElement {
    const container = document.createElement('div')
    container.className = 'editor-toolbar'
    
    if (this.config.sticky) {
      container.classList.add('editor-toolbar-sticky')
    }
    
    if (this.config.compact) {
      container.classList.add('editor-toolbar-compact')
    }
    
    container.style.cssText = `
      display: flex;
      gap: 8px;
      padding: 8px;
      background: var(--editor-color-toolbar-background, #ffffff);
      border-bottom: 1px solid var(--editor-color-border, #e5e7eb);
      overflow-x: auto;
    `
    
    return container
  }
  
  /**
   * 设置交叉观察器（用于按需加载）
   */
  private setupIntersectionObserver(): void {
    if (!this.config.lazyLoad) return
    
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const itemName = entry.target.getAttribute('data-item-name')
          if (itemName && entry.isIntersecting) {
            this.loadItem(itemName)
          }
        })
      },
      { threshold: 0.1 }
    )
  }
  
  /**
   * 注册工具栏项
   */
  registerItem(item: ToolbarItem, group?: string): void {
    if (this.items.has(item.name)) {
      console.warn(`Toolbar item "${item.name}" is already registered`)
      return
    }
    
    this.items.set(item.name, {
      item,
      loaded: false,
      visible: true,
      group
    })
    
    this.emit('item:registered', { name: item.name, group })
  }
  
  /**
   * 批量注册工具栏项
   */
  registerBatch(items: ToolbarItem[], group?: string): void {
    items.forEach(item => this.registerItem(item, group))
  }
  
  /**
   * 注册工具栏组
   */
  registerGroup(config: ToolbarGroupConfig): void {
    this.groups.set(config.name, {
      visible: true,
      collapsed: false,
      order: 0,
      ...config
    })
    
    this.emit('group:registered', { name: config.name })
  }
  
  /**
   * 加载工具栏项
   */
  private async loadItem(name: string): Promise<void> {
    const registration = this.items.get(name)
    
    if (!registration || registration.loaded) {
      return
    }
    
    try {
      const element = await this.createItemElement(registration.item)
      registration.element = element
      registration.loaded = true
      
      // 替换占位符
      const placeholder = this.container.querySelector(`[data-item-name="${name}"]`)
      if (placeholder && element) {
        placeholder.replaceWith(element)
      }
      
      this.emit('item:loaded', { name })
    } catch (error) {
      console.error(`Failed to load toolbar item "${name}":`, error)
      this.emit('item:error', { name, error })
    }
  }
  
  /**
   * 创建工具栏项元素
   */
  private async createItemElement(item: ToolbarItem): Promise<HTMLElement> {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'toolbar-item'
    button.setAttribute('data-item-name', item.name)
    
    if (item.title) {
      const i18n = getI18n()
      button.title = i18n.t(item.title) || item.title
    }
    
    // 添加图标
    if (item.icon) {
      const iconManager = getIconManager()
      const icon = iconManager.createIconElement(item.icon, { size: 18 })
      button.appendChild(icon)
    }
    
    // 添加标签
    if (this.config.showLabels && item.label) {
      const label = document.createElement('span')
      label.className = 'toolbar-item-label'
      label.textContent = item.label
      button.appendChild(label)
    }
    
    // 绑定事件
    if (item.action) {
      button.addEventListener('click', (e) => {
        e.preventDefault()
        item.action!(this.editor)
      })
    }
    
    // 应用样式
    button.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 10px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: var(--editor-color-text-primary, #374151);
      cursor: pointer;
      transition: all 0.2s;
    `
    
    button.addEventListener('mouseenter', () => {
      button.style.background = 'var(--editor-color-toolbar-button-hover, #f3f4f6)'
    })
    
    button.addEventListener('mouseleave', () => {
      button.style.background = 'transparent'
    })
    
    return button
  }
  
  /**
   * 创建占位符元素
   */
  private createPlaceholder(name: string): HTMLElement {
    const placeholder = document.createElement('div')
    placeholder.className = 'toolbar-item-placeholder'
    placeholder.setAttribute('data-item-name', name)
    placeholder.style.cssText = `
      width: 36px;
      height: 32px;
      background: var(--editor-color-background-paper, #f9fafb);
      border-radius: 4px;
    `
    return placeholder
  }
  
  /**
   * 渲染工具栏
   */
  render(): HTMLElement {
    this.container.innerHTML = ''
    
    if (this.config.groups && this.config.groups.length > 0) {
      this.renderGroups()
    } else {
      this.renderFlat()
    }
    
    return this.container
  }
  
  /**
   * 渲染分组工具栏
   */
  private renderGroups(): void {
    const sortedGroups = Array.from(this.groups.values())
      .sort((a, b) => (a.order || 0) - (b.order || 0))
    
    sortedGroups.forEach(group => {
      if (!group.visible) return
      
      const groupEl = document.createElement('div')
      groupEl.className = 'toolbar-group'
      groupEl.setAttribute('data-group-name', group.name)
      
      if (group.label) {
        const label = document.createElement('span')
        label.className = 'toolbar-group-label'
        label.textContent = group.label
        groupEl.appendChild(label)
      }
      
      const itemsContainer = document.createElement('div')
      itemsContainer.className = 'toolbar-group-items'
      itemsContainer.style.cssText = `
        display: flex;
        gap: 4px;
      `
      
      group.items.forEach(itemName => {
        const registration = this.items.get(itemName)
        if (!registration || !registration.visible) return
        
        if (this.config.lazyLoad && !registration.loaded) {
          const placeholder = this.createPlaceholder(itemName)
          itemsContainer.appendChild(placeholder)
          this.observer?.observe(placeholder)
        } else {
          this.loadItem(itemName).then(() => {
            if (registration.element) {
              itemsContainer.appendChild(registration.element)
            }
          })
        }
      })
      
      groupEl.appendChild(itemsContainer)
      this.container.appendChild(groupEl)
      
      // 添加分隔符
      const separator = document.createElement('div')
      separator.className = 'toolbar-separator'
      separator.style.cssText = `
        width: 1px;
        height: 24px;
        background: var(--editor-color-border, #e5e7eb);
        margin: 0 4px;
      `
      this.container.appendChild(separator)
    })
  }
  
  /**
   * 渲染扁平工具栏
   */
  private renderFlat(): void {
    this.items.forEach((registration, name) => {
      if (!registration.visible) return
      
      if (this.config.lazyLoad && !registration.loaded) {
        const placeholder = this.createPlaceholder(name)
        this.container.appendChild(placeholder)
        this.observer?.observe(placeholder)
      } else {
        this.loadItem(name).then(() => {
          if (registration.element) {
            this.container.appendChild(registration.element)
          }
        })
      }
    })
  }
  
  /**
   * 显示工具栏项
   */
  showItem(name: string): void {
    const registration = this.items.get(name)
    if (!registration) return
    
    registration.visible = true
    this.visibleItems.add(name)
    
    if (registration.element) {
      registration.element.style.display = 'inline-flex'
    }
    
    this.emit('item:shown', { name })
  }
  
  /**
   * 隐藏工具栏项
   */
  hideItem(name: string): void {
    const registration = this.items.get(name)
    if (!registration) return
    
    registration.visible = false
    this.visibleItems.delete(name)
    
    if (registration.element) {
      registration.element.style.display = 'none'
    }
    
    this.emit('item:hidden', { name })
  }
  
  /**
   * 显示工具栏组
   */
  showGroup(name: string): void {
    const group = this.groups.get(name)
    if (!group) return
    
    group.visible = true
    group.items.forEach(item => this.showItem(item))
    
    this.emit('group:shown', { name })
  }
  
  /**
   * 隐藏工具栏组
   */
  hideGroup(name: string): void {
    const group = this.groups.get(name)
    if (!group) return
    
    group.visible = false
    group.items.forEach(item => this.hideItem(item))
    
    this.emit('group:hidden', { name })
  }
  
  /**
   * 更新工具栏配置
   */
  updateConfig(config: Partial<ToolbarManagerConfig>): void {
    this.config = { ...this.config, ...config }
    this.render()
    this.emit('config:updated', config)
  }
  
  /**
   * 获取容器
   */
  getContainer(): HTMLElement {
    return this.container
  }
  
  /**
   * 获取统计信息
   */
  getStats(): {
    total: number
    loaded: number
    visible: number
    groups: number
  } {
    return {
      total: this.items.size,
      loaded: Array.from(this.items.values()).filter(r => r.loaded).length,
      visible: this.visibleItems.size,
      groups: this.groups.size
    }
  }
  
  /**
   * 销毁
   */
  destroy(): void {
    this.observer?.disconnect()
    this.container.remove()
    this.items.clear()
    this.groups.clear()
    this.visibleItems.clear()
    this.removeAllListeners()
  }
}






