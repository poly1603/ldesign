/**
 * 右键菜单管理器
 * 
 * 框架无关的右键菜单核心逻辑，负责：
 * - 菜单项管理和配置
 * - 菜单显示位置计算
 * - 菜单事件分发和处理
 * - 与Calendar核心的集成
 */

import type { CalendarEvent } from '../types/event'

/**
 * 菜单项接口
 */
export interface ContextMenuItem {
  /** 菜单项ID */
  id: string
  /** 显示文本 */
  text: string
  /** 图标 */
  icon?: string
  /** 快捷键提示 */
  shortcut?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否为分割线 */
  divider?: boolean
  /** 点击处理函数 */
  onClick?: (context: ContextMenuContext) => void
}

/**
 * 右键菜单上下文
 */
export interface ContextMenuContext {
  /** 菜单类型 */
  type: 'date' | 'event' | 'empty'
  /** 点击的日期（如果是日期右键） */
  date?: Date
  /** 点击的事件（如果是事件右键） */
  event?: CalendarEvent
  /** 鼠标位置 */
  position: { x: number; y: number }
  /** 原始DOM事件 */
  originalEvent: MouseEvent
}

/**
 * 菜单配置接口
 */
export interface ContextMenuConfig {
  /** 日期右键菜单项 */
  dateMenuItems?: ContextMenuItem[]
  /** 事件右键菜单项 */
  eventMenuItems?: ContextMenuItem[]
  /** 空白区域右键菜单项 */
  emptyMenuItems?: ContextMenuItem[]
  /** 是否启用右键菜单 */
  enabled?: boolean
  /** 自定义菜单项生成器 */
  customMenuGenerator?: (context: ContextMenuContext) => ContextMenuItem[]
}

/**
 * 右键菜单管理器类
 */
export class ContextMenuManager {
  private config: ContextMenuConfig
  private eventListeners: Map<string, Function[]> = new Map()
  private currentContext: ContextMenuContext | null = null
  private isMenuVisible = false

  constructor(config: ContextMenuConfig = {}) {
    this.config = {
      enabled: true,
      ...config
    }
    
    this.initializeDefaultMenuItems()
  }

  /**
   * 初始化默认菜单项
   */
  private initializeDefaultMenuItems(): void {
    // 默认日期右键菜单
    if (!this.config.dateMenuItems) {
      this.config.dateMenuItems = [
        {
          id: 'add-event',
          text: '添加事件',
          icon: '➕',
          shortcut: 'Ctrl+N',
          onClick: (context) => this.emit('addEvent', context)
        },
        {
          id: 'view-date',
          text: '查看详情',
          icon: '👁️',
          onClick: (context) => this.emit('viewDate', context)
        }
      ]
    }

    // 默认事件右键菜单
    if (!this.config.eventMenuItems) {
      this.config.eventMenuItems = [
        {
          id: 'edit-event',
          text: '编辑事件',
          icon: '✏️',
          shortcut: 'Enter',
          onClick: (context) => this.emit('editEvent', context)
        },
        {
          id: 'duplicate-event',
          text: '复制事件',
          icon: '📋',
          shortcut: 'Ctrl+D',
          onClick: (context) => this.emit('duplicateEvent', context)
        },
        {
          id: 'divider-1',
          text: '',
          divider: true
        },
        {
          id: 'delete-event',
          text: '删除事件',
          icon: '🗑️',
          shortcut: 'Delete',
          onClick: (context) => this.emit('deleteEvent', context)
        }
      ]
    }

    // 默认空白区域右键菜单
    if (!this.config.emptyMenuItems) {
      this.config.emptyMenuItems = [
        {
          id: 'today',
          text: '回到今天',
          icon: '📅',
          shortcut: 'T',
          onClick: (context) => this.emit('goToToday', context)
        },
        {
          id: 'refresh',
          text: '刷新',
          icon: '🔄',
          shortcut: 'F5',
          onClick: (context) => this.emit('refresh', context)
        }
      ]
    }
  }

  /**
   * 处理右键点击
   */
  handleContextMenu(event: MouseEvent, type: 'date' | 'event' | 'empty', data?: { date?: Date; event?: CalendarEvent }): boolean {
    if (!this.config.enabled) {
      return false
    }

    event.preventDefault()
    event.stopPropagation()

    // 创建上下文
    this.currentContext = {
      type,
      date: data?.date,
      event: data?.event,
      position: { x: event.clientX, y: event.clientY },
      originalEvent: event
    }

    // 获取菜单项
    const menuItems = this.getMenuItems(this.currentContext)
    
    if (menuItems.length === 0) {
      return false
    }

    // 发出菜单显示事件
    this.emit('menuShow', {
      context: this.currentContext,
      menuItems,
      position: this.currentContext.position
    })

    this.isMenuVisible = true
    return true
  }

  /**
   * 获取菜单项
   */
  private getMenuItems(context: ContextMenuContext): ContextMenuItem[] {
    let menuItems: ContextMenuItem[] = []

    // 根据类型获取对应的菜单项
    switch (context.type) {
      case 'date':
        menuItems = [...(this.config.dateMenuItems || [])]
        break
      case 'event':
        menuItems = [...(this.config.eventMenuItems || [])]
        break
      case 'empty':
        menuItems = [...(this.config.emptyMenuItems || [])]
        break
    }

    // 如果有自定义菜单生成器，使用它
    if (this.config.customMenuGenerator) {
      const customItems = this.config.customMenuGenerator(context)
      menuItems = [...menuItems, ...customItems]
    }

    // 过滤禁用的菜单项
    return menuItems.filter(item => !item.disabled)
  }

  /**
   * 隐藏菜单
   */
  hideMenu(): void {
    if (this.isMenuVisible) {
      this.emit('menuHide')
      this.isMenuVisible = false
      this.currentContext = null
    }
  }

  /**
   * 处理菜单项点击
   */
  handleMenuItemClick(itemId: string): void {
    if (!this.currentContext) return

    const menuItems = this.getMenuItems(this.currentContext)
    const item = menuItems.find(item => item.id === itemId)
    
    if (item && item.onClick) {
      item.onClick(this.currentContext)
    }

    this.hideMenu()
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ContextMenuConfig>): void {
    this.config = { ...this.config, ...config }
    this.initializeDefaultMenuItems()
  }

  /**
   * 获取当前上下文
   */
  getCurrentContext(): ContextMenuContext | null {
    return this.currentContext
  }

  /**
   * 是否显示菜单
   */
  isVisible(): boolean {
    return this.isMenuVisible
  }

  /**
   * 添加事件监听器
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 发出事件
   */
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => listener(data))
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.hideMenu()
    this.eventListeners.clear()
    this.currentContext = null
  }
}
