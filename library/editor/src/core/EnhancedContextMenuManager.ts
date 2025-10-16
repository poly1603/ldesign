/**
 * 增强的统一右键菜单管理器
 * 整合原有三套右键菜单系统的所有功能
 */

import { ContextMenu, MenuItem } from '../ui/base/ContextMenu'
import { EventEmitter } from '../utils/event'
import { delegate, on } from '../utils/event'

export interface MenuRegistration {
  id: string
  selector: string | string[] // 支持多个选择器
  priority?: number // 优先级，数字越大优先级越高
  items: MenuItem[] | ((context: MenuContext) => MenuItem[])
  condition?: (element: HTMLElement, context: MenuContext) => boolean
  onBeforeShow?: (menu: ContextMenu, context: MenuContext) => void
  onAfterShow?: (menu: ContextMenu, context: MenuContext) => void
  onBeforeHide?: (menu: ContextMenu, context: MenuContext) => void
  onAfterHide?: (menu: ContextMenu, context: MenuContext) => void
  merge?: boolean // 是否与其他菜单合并
  group?: string // 分组名称，用于合并菜单
}

export interface MenuContext {
  element: HTMLElement
  event: MouseEvent
  registration?: MenuRegistration
  data?: any
  [key: string]: any
}

export interface ContextMenuManagerOptions {
  container?: HTMLElement
  theme?: 'light' | 'dark'
  animation?: boolean
  maxHeight?: number
  minWidth?: number
  zIndex?: number
  enableDefault?: boolean
  mergeMenus?: boolean // 是否合并多个匹配的菜单
}

/**
 * 单例模式的右键菜单管理器
 */
export class EnhancedContextMenuManager extends EventEmitter<{
  'menu-registered': [MenuRegistration]
  'menu-unregistered': [string]
  'menu-updated': [string]
  'menu-show': [MenuContext]
  'menu-hide': [MenuContext]
  'menu-select': [MenuItem, MenuContext]
}> {
  private static instance: EnhancedContextMenuManager | null = null
  
  private registrations: Map<string, MenuRegistration> = new Map()
  private activeMenu: ContextMenu | null = null
  private activeContext: MenuContext | null = null
  private options: ContextMenuManagerOptions
  private cleanupFunctions: (() => void)[] = []
  
  private constructor(options: ContextMenuManagerOptions = {}) {
    super()
    
    this.options = {
      theme: 'light',
      animation: true,
      maxHeight: window.innerHeight * 0.7,
      minWidth: 220,
      zIndex: 10000,
      enableDefault: false,
      mergeMenus: false,
      ...options
    }
    
    this.initialize()
  }
  
  /**
   * 获取单例实例
   */
  public static getInstance(options?: ContextMenuManagerOptions): EnhancedContextMenuManager {
    if (!EnhancedContextMenuManager.instance) {
      EnhancedContextMenuManager.instance = new EnhancedContextMenuManager(options)
    }
    return EnhancedContextMenuManager.instance
  }
  
  /**
   * 销毁单例实例
   */
  public static destroy(): void {
    if (EnhancedContextMenuManager.instance) {
      EnhancedContextMenuManager.instance.dispose()
      EnhancedContextMenuManager.instance = null
    }
  }
  
  private initialize(): void {
    // 全局右键事件监听
    const cleanup = on(document, 'contextmenu', this.handleContextMenu.bind(this), {
      capture: true
    })
    this.cleanupFunctions.push(cleanup)
    
    // 点击其他地方关闭菜单
    const clickCleanup = on(document, 'click', () => {
      if (this.activeMenu) {
        this.hideMenu()
      }
    })
    this.cleanupFunctions.push(clickCleanup)
    
    // ESC键关闭菜单
    const escCleanup = on(document, 'keydown', (e) => {
      const event = e as KeyboardEvent
      if (event.key === 'Escape' && this.activeMenu) {
        this.hideMenu()
      }
    })
    this.cleanupFunctions.push(escCleanup)
  }
  
  /**
   * 注册右键菜单
   */
  public register(registration: MenuRegistration): void {
    if (!registration.id) {
      throw new Error('Menu registration must have an id')
    }
    
    // 设置默认值
    registration.priority = registration.priority ?? 0
    registration.merge = registration.merge ?? this.options.mergeMenus
    
    this.registrations.set(registration.id, registration)
    this.emit('menu-registered', registration)
    
    console.log(`[ContextMenuManager] Registered menu: ${registration.id}`)
  }
  
  /**
   * 批量注册菜单
   */
  public registerBatch(registrations: MenuRegistration[]): void {
    registrations.forEach(reg => this.register(reg))
  }
  
  /**
   * 注销右键菜单
   */
  public unregister(id: string): void {
    if (this.registrations.has(id)) {
      this.registrations.delete(id)
      this.emit('menu-unregistered', id)
      console.log(`[ContextMenuManager] Unregistered menu: ${id}`)
    }
  }
  
  /**
   * 更新菜单项
   */
  public updateMenu(id: string, updates: Partial<MenuRegistration>): void {
    const registration = this.registrations.get(id)
    if (registration) {
      Object.assign(registration, updates)
      this.emit('menu-updated', id)
    }
  }
  
  /**
   * 设置容器
   */
  public setContainer(container: HTMLElement): void {
    this.options.container = container
  }
  
  /**
   * 更新选项
   */
  public updateOptions(options: Partial<ContextMenuManagerOptions>): void {
    Object.assign(this.options, options)
  }
  
  /**
   * 处理右键事件
   */
  private handleContextMenu(e: Event): void {
    const event = e as MouseEvent
    const target = event.target as HTMLElement
    
    // 检查容器限制
    if (this.options.container && !this.options.container.contains(target)) {
      return
    }
    
    // 查找匹配的菜单
    const matchedMenus = this.findMatchingMenus(target, event)
    
    if (matchedMenus.length > 0) {
      event.preventDefault()
      event.stopPropagation()
      
      // 创建上下文
      const context: MenuContext = {
        element: target,
        event: event
      }
      
      // 合并或选择菜单
      if (this.options.mergeMenus && matchedMenus.length > 1) {
        this.showMergedMenu(matchedMenus, context)
      } else {
        // 使用优先级最高的菜单
        this.showSingleMenu(matchedMenus[0], context)
      }
    } else if (!this.options.enableDefault && this.options.container?.contains(target)) {
      // 阻止默认右键菜单
      event.preventDefault()
    }
  }
  
  /**
   * 查找匹配的菜单
   */
  private findMatchingMenus(element: HTMLElement, event: MouseEvent): MenuRegistration[] {
    const matched: MenuRegistration[] = []
    const context: MenuContext = { element, event }
    
    for (const registration of this.registrations.values()) {
      const selectors = Array.isArray(registration.selector) 
        ? registration.selector 
        : [registration.selector]
      
      // 检查选择器匹配
      const isMatch = selectors.some(selector => {
        return element.matches(selector) || element.closest(selector) !== null
      })
      
      if (isMatch) {
        // 检查额外条件
        if (!registration.condition || registration.condition(element, context)) {
          matched.push(registration)
        }
      }
    }
    
    // 按优先级排序
    matched.sort((a, b) => (b.priority || 0) - (a.priority || 0))
    
    return matched
  }
  
  /**
   * 显示单个菜单
   */
  private showSingleMenu(registration: MenuRegistration, context: MenuContext): void {
    context.registration = registration
    
    // 获取菜单项
    const items = typeof registration.items === 'function' 
      ? registration.items(context)
      : registration.items
    
    if (items.length === 0) {
      return
    }
    
    // 关闭之前的菜单
    this.hideMenu()
    
    // 创建新菜单
    this.activeMenu = new ContextMenu({
      items,
      context,
      theme: this.options.theme,
      animation: this.options.animation,
      minWidth: this.options.minWidth,
      maxHeight: this.options.maxHeight,
      zIndex: this.options.zIndex,
      onBeforeShow: (menu) => registration.onBeforeShow?.(menu, context),
      onAfterShow: (menu) => {
        registration.onAfterShow?.(menu, context)
        this.emit('menu-show', context)
      },
      onBeforeHide: (menu) => registration.onBeforeHide?.(menu, context),
      onAfterHide: (menu) => {
        registration.onAfterHide?.(menu, context)
        this.emit('menu-hide', context)
      },
      onSelect: (item) => {
        this.emit('menu-select', item, context)
      }
    })
    
    this.activeContext = context
    this.activeMenu.showAt(context.event.clientX, context.event.clientY, context)
  }
  
  /**
   * 显示合并的菜单
   */
  private showMergedMenu(registrations: MenuRegistration[], context: MenuContext): void {
    const allItems: MenuItem[] = []
    const groupedItems = new Map<string, MenuItem[]>()
    
    // 收集所有菜单项
    for (const registration of registrations) {
      context.registration = registration
      
      const items = typeof registration.items === 'function' 
        ? registration.items(context)
        : registration.items
      
      if (registration.group) {
        // 分组菜单
        if (!groupedItems.has(registration.group)) {
          groupedItems.set(registration.group, [])
        }
        groupedItems.get(registration.group)!.push(...items)
      } else {
        // 独立菜单项
        if (allItems.length > 0 && items.length > 0) {
          allItems.push({ divider: true }) // 添加分隔符
        }
        allItems.push(...items)
      }
    }
    
    // 添加分组菜单项
    groupedItems.forEach((items, group) => {
      if (allItems.length > 0) {
        allItems.push({ divider: true })
      }
      allItems.push(...items)
    })
    
    if (allItems.length === 0) {
      return
    }
    
    // 关闭之前的菜单
    this.hideMenu()
    
    // 创建合并菜单
    this.activeMenu = new ContextMenu({
      items: allItems,
      context,
      theme: this.options.theme,
      animation: this.options.animation,
      minWidth: this.options.minWidth,
      maxHeight: this.options.maxHeight,
      zIndex: this.options.zIndex,
      onAfterShow: () => this.emit('menu-show', context),
      onAfterHide: () => this.emit('menu-hide', context),
      onSelect: (item) => this.emit('menu-select', item, context)
    })
    
    this.activeContext = context
    this.activeMenu.showAt(context.event.clientX, context.event.clientY, context)
  }
  
  /**
   * 隐藏当前菜单
   */
  public hideMenu(): void {
    if (this.activeMenu) {
      this.activeMenu.hide()
      this.activeMenu = null
      this.activeContext = null
    }
  }
  
  /**
   * 手动触发菜单
   */
  public trigger(e: MouseEvent, menuId: string, context?: any): void {
    const registration = this.registrations.get(menuId)
    if (!registration) {
      console.warn(`[ContextMenuManager] Menu "${menuId}" not found`)
      return
    }
    
    const menuContext: MenuContext = {
      element: e.target as HTMLElement,
      event: e,
      registration,
      ...context
    }
    
    this.showSingleMenu(registration, menuContext)
  }
  
  /**
   * 获取注册的菜单
   */
  public getRegistration(id: string): MenuRegistration | undefined {
    return this.registrations.get(id)
  }
  
  /**
   * 获取所有注册的菜单
   */
  public getAllRegistrations(): MenuRegistration[] {
    return Array.from(this.registrations.values())
  }
  
  /**
   * 获取当前活动的菜单
   */
  public getActiveMenu(): ContextMenu | null {
    return this.activeMenu
  }
  
  /**
   * 获取当前活动的上下文
   */
  public getActiveContext(): MenuContext | null {
    return this.activeContext
  }
  
  /**
   * 清理资源
   */
  public dispose(): void {
    this.hideMenu()
    this.registrations.clear()
    this.cleanupFunctions.forEach(cleanup => cleanup())
    this.cleanupFunctions = []
    this.clear()
  }
}

// 导出便捷函数
export function getContextMenuManager(options?: ContextMenuManagerOptions): EnhancedContextMenuManager {
  return EnhancedContextMenuManager.getInstance(options)
}

export function registerContextMenu(registration: MenuRegistration): void {
  getContextMenuManager().register(registration)
}

export function unregisterContextMenu(id: string): void {
  getContextMenuManager().unregister(id)
}

export function updateContextMenu(id: string, updates: Partial<MenuRegistration>): void {
  getContextMenuManager().updateMenu(id, updates)
}

export function triggerContextMenu(e: MouseEvent, menuId: string, context?: any): void {
  getContextMenuManager().trigger(e, menuId, context)
}

export function hideContextMenu(): void {
  getContextMenuManager().hideMenu()
}