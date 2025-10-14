/**
 * 右键菜单管理器
 * 统一管理编辑器中所有的右键菜单，提供注册、注销、更新等功能
 */

import { ContextMenuSystem, MenuItem, ContextMenuOptions } from '../components/ContextMenuSystem'
import { EventEmitter } from './EventEmitter'

export interface MenuRegistration {
  id: string
  selector: string // CSS选择器，用于匹配元素
  priority?: number // 优先级，数字越大优先级越高
  items: MenuItem[] | ((context: any) => MenuItem[]) // 菜单项，可以是静态的或动态生成的
  condition?: (element: HTMLElement) => boolean // 额外的条件判断
  onBeforeShow?: (menu: ContextMenuSystem, context: any) => void
  onAfterShow?: (menu: ContextMenuSystem, context: any) => void
  onBeforeHide?: (menu: ContextMenuSystem, context: any) => void
  onAfterHide?: (menu: ContextMenuSystem, context: any) => void
}

export interface ContextMenuManagerOptions {
  theme?: 'light' | 'dark'
  animation?: boolean
  maxHeight?: number
  minWidth?: number
  zIndex?: number
  enableDefault?: boolean // 是否启用默认右键菜单
}

export class ContextMenuManager extends EventEmitter {
  private registrations: Map<string, MenuRegistration> = new Map()
  private activeMenu: ContextMenuSystem | null = null
  private options: ContextMenuManagerOptions
  private container: HTMLElement | null = null
  private clickHandlers: Map<HTMLElement, (e: MouseEvent) => void> = new Map()
  
  constructor(options: ContextMenuManagerOptions = {}) {
    super()
    
    this.options = {
      theme: 'light',
      animation: true,
      maxHeight: window.innerHeight * 0.7,
      minWidth: 220,
      zIndex: 10000,
      enableDefault: false,
      ...options
    }
    
    this.initialize()
  }
  
  private initialize(): void {
    // 监听全局右键事件
    document.addEventListener('contextmenu', this.handleGlobalContextMenu.bind(this), true)
  }
  
  /**
   * 设置容器元素
   */
  public setContainer(element: HTMLElement): void {
    this.container = element
  }
  
  /**
   * 注册右键菜单
   */
  public register(registration: MenuRegistration): void {
    if (!registration.id) {
      throw new Error('Menu registration must have an id')
    }
    
    // 设置默认优先级
    if (registration.priority === undefined) {
      registration.priority = 0
    }
    
    this.registrations.set(registration.id, registration)
    this.emit('menu-registered', registration)
    
    console.log(`[ContextMenuManager] Registered menu: ${registration.id}`)
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
  public updateMenu(id: string, items: MenuItem[] | ((context: any) => MenuItem[])): void {
    const registration = this.registrations.get(id)
    if (registration) {
      registration.items = items
      this.emit('menu-updated', id)
    }
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
   * 处理全局右键事件
   */
  private handleGlobalContextMenu(e: MouseEvent): void {
    const target = e.target as HTMLElement
    
    console.log('[ContextMenuManager] Right click on:', target, 'Classes:', target.className)
    
    // 如果有容器限制，检查是否在容器内
    if (this.container && !this.container.contains(target)) {
      console.log('[ContextMenuManager] Target not in container')
      return
    }
    
    // 查找匹配的菜单
    const matchedMenus = this.findMatchingMenus(target)
    
    console.log('[ContextMenuManager] Matched menus:', matchedMenus.map(m => m.id))
    
    if (matchedMenus.length > 0) {
      e.preventDefault()
      e.stopPropagation()
      
      // 按优先级排序
      matchedMenus.sort((a, b) => (b.priority || 0) - (a.priority || 0))
      
      // 使用优先级最高的菜单
      const registration = matchedMenus[0]
      console.log('[ContextMenuManager] Using menu:', registration.id, 'Priority:', registration.priority)
      this.showMenu(e, target, registration)
    } else if (!this.options.enableDefault) {
      // 如果没有匹配的菜单且禁用默认菜单，阻止默认行为
      if (this.container && this.container.contains(target)) {
        console.log('[ContextMenuManager] Preventing default context menu')
        e.preventDefault()
      }
    }
  }
  
  /**
   * 查找匹配的菜单
   */
  private findMatchingMenus(element: HTMLElement): MenuRegistration[] {
    const matched: MenuRegistration[] = []
    
    for (const registration of this.registrations.values()) {
      // 检查选择器是否匹配
      if (element.matches(registration.selector) || element.closest(registration.selector)) {
        // 检查额外条件
        if (!registration.condition || registration.condition(element)) {
          matched.push(registration)
        }
      }
    }
    
    return matched
  }
  
  /**
   * 显示菜单
   */
  private showMenu(e: MouseEvent, element: HTMLElement, registration: MenuRegistration): void {
    // 关闭之前的菜单
    if (this.activeMenu) {
      this.activeMenu.destroy()
      this.activeMenu = null
    }
    
    // 创建上下文对象
    const context = {
      element,
      event: e,
      registration,
      manager: this
    }
    
    // 获取菜单项
    const items = typeof registration.items === 'function' 
      ? registration.items(context)
      : registration.items
    
    // 创建菜单选项
    const menuOptions: ContextMenuOptions = {
      items,
      context,
      theme: this.options.theme,
      animation: this.options.animation,
      maxHeight: this.options.maxHeight,
      minWidth: this.options.minWidth,
      zIndex: this.options.zIndex,
      onBeforeShow: (menu) => {
        registration.onBeforeShow?.(menu, context)
        this.emit('menu-before-show', { menu, context, registration })
      },
      onAfterShow: (menu) => {
        registration.onAfterShow?.(menu, context)
        this.emit('menu-after-show', { menu, context, registration })
      },
      onBeforeHide: (menu) => {
        registration.onBeforeHide?.(menu, context)
        this.emit('menu-before-hide', { menu, context, registration })
      },
      onAfterHide: (menu) => {
        registration.onAfterHide?.(menu, context)
        this.emit('menu-after-hide', { menu, context, registration })
        // 清理活动菜单引用
        if (this.activeMenu === menu) {
          this.activeMenu = null
        }
      }
    }
    
    // 创建并显示菜单
    this.activeMenu = new ContextMenuSystem(menuOptions)
    this.activeMenu.show(e.clientX, e.clientY, context)
  }
  
  /**
   * 手动触发右键菜单
   */
  public trigger(e: MouseEvent, menuId: string, context?: any): void {
    const registration = this.registrations.get(menuId)
    if (!registration) {
      console.warn(`Menu with id "${menuId}" not found`)
      return
    }
    
    const element = e.target as HTMLElement
    this.showMenu(e, element, registration)
  }
  
  /**
   * 关闭当前活动的菜单
   */
  public closeActiveMenu(): void {
    if (this.activeMenu) {
      this.activeMenu.hide()
      this.activeMenu = null
    }
  }
  
  /**
   * 为特定元素添加右键菜单
   */
  public addContextMenu(element: HTMLElement, items: MenuItem[], options?: Partial<MenuRegistration>): string {
    const id = options?.id || `menu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // 创建一个唯一的类名
    const className = `context-menu-${id}`
    element.classList.add(className)
    
    // 注册菜单
    this.register({
      id,
      selector: `.${className}`,
      items,
      ...options
    })
    
    return id
  }
  
  /**
   * 批量注册菜单
   */
  public registerBatch(registrations: MenuRegistration[]): void {
    registrations.forEach(registration => {
      this.register(registration)
    })
  }
  
  /**
   * 批量注销菜单
   */
  public unregisterBatch(ids: string[]): void {
    ids.forEach(id => {
      this.unregister(id)
    })
  }
  
  /**
   * 清除所有注册的菜单
   */
  public clear(): void {
    this.registrations.clear()
    this.closeActiveMenu()
    this.emit('menus-cleared')
  }
  
  /**
   * 更新全局选项
   */
  public updateOptions(options: Partial<ContextMenuManagerOptions>): void {
    this.options = {
      ...this.options,
      ...options
    }
    this.emit('options-updated', this.options)
  }
  
  /**
   * 获取当前选项
   */
  public getOptions(): ContextMenuManagerOptions {
    return { ...this.options }
  }
  
  /**
   * 销毁管理器
   */
  public destroy(): void {
    this.clear()
    document.removeEventListener('contextmenu', this.handleGlobalContextMenu.bind(this), true)
    this.removeAllListeners()
  }
}

// 创建全局单例
let globalManager: ContextMenuManager | null = null

/**
 * 获取全局右键菜单管理器
 */
export function getContextMenuManager(): ContextMenuManager {
  if (!globalManager) {
    globalManager = new ContextMenuManager()
  }
  return globalManager
}

/**
 * 快捷函数：注册右键菜单
 */
export function registerContextMenu(registration: MenuRegistration): void {
  getContextMenuManager().register(registration)
}

/**
 * 快捷函数：为元素添加右键菜单
 */
export function addContextMenuToElement(
  element: HTMLElement,
  items: MenuItem[],
  options?: Partial<MenuRegistration>
): string {
  return getContextMenuManager().addContextMenu(element, items, options)
}