/**
 * 插件上下文实现
 */

import type { Tree } from '../../core/tree'
import type { TreeNode } from '../../types'
import type { 
  PluginContext, 
  PluginManager, 
  PluginConfig, 
  PluginMetadata,
  Plugin 
} from './plugin-interface'

/**
 * 插件上下文实现类
 */
export class PluginContextImpl implements PluginContext {
  private styleElements = new Set<HTMLStyleElement>()

  constructor(
    public tree: Tree,
    public pluginManager: PluginManager,
    public config: PluginConfig,
    public metadata: PluginMetadata
  ) {}

  /**
   * 获取其他插件实例
   */
  getPlugin<T = Plugin>(name: string): T | undefined {
    return this.pluginManager.get<T>(name)
  }

  /**
   * 发送事件
   */
  emit(event: string, ...args: any[]): void {
    this.tree.emit(`plugin:${this.metadata.name}:${event}`, ...args)
  }

  /**
   * 监听事件
   */
  on(event: string, callback: (...args: any[]) => void): void {
    // 监听树事件
    if (event.startsWith('tree:')) {
      this.tree.on(event.substring(5), callback)
      return
    }

    // 监听插件事件
    if (event.startsWith('plugin:')) {
      this.tree.on(event, callback)
      return
    }

    // 监听当前插件事件
    this.tree.on(`plugin:${this.metadata.name}:${event}`, callback)
  }

  /**
   * 取消监听事件
   */
  off(event: string, callback?: (...args: any[]) => void): void {
    // 取消监听树事件
    if (event.startsWith('tree:')) {
      this.tree.off(event.substring(5), callback)
      return
    }

    // 取消监听插件事件
    if (event.startsWith('plugin:')) {
      this.tree.off(event, callback)
      return
    }

    // 取消监听当前插件事件
    this.tree.off(`plugin:${this.metadata.name}:${event}`, callback)
  }

  /**
   * 创建DOM元素
   */
  createElement(tag: string, props?: Record<string, any>): HTMLElement {
    const element = document.createElement(tag)

    if (props) {
      Object.entries(props).forEach(([key, value]) => {
        if (key === 'className' || key === 'class') {
          element.className = value
        } else if (key === 'style' && typeof value === 'object') {
          Object.assign(element.style, value)
        } else if (key.startsWith('on') && typeof value === 'function') {
          const eventName = key.substring(2).toLowerCase()
          element.addEventListener(eventName, value)
        } else if (key === 'innerHTML') {
          element.innerHTML = value
        } else if (key === 'textContent') {
          element.textContent = value
        } else {
          element.setAttribute(key, value)
        }
      })
    }

    return element
  }

  /**
   * 添加样式
   */
  addStyle(css: string): void {
    const style = document.createElement('style')
    style.textContent = css
    style.setAttribute('data-plugin', this.metadata.name)
    document.head.appendChild(style)
    this.styleElements.add(style)
  }

  /**
   * 移除样式
   */
  removeStyle(css: string): void {
    this.styleElements.forEach(style => {
      if (style.textContent === css) {
        document.head.removeChild(style)
        this.styleElements.delete(style)
      }
    })
  }

  /**
   * 获取选中的节点
   */
  getSelectedNodes(): TreeNode[] {
    const selectedIds = this.tree.getSelectedNodes()
    return selectedIds.map(id => this.tree.getNode(id)).filter(Boolean) as TreeNode[]
  }

  /**
   * 获取所有节点
   */
  getAllNodes(): TreeNode[] {
    return this.tree.getAllNodes()
  }

  /**
   * 查找节点
   */
  findNode(predicate: (node: TreeNode) => boolean): TreeNode | undefined {
    return this.getAllNodes().find(predicate)
  }

  /**
   * 查找多个节点
   */
  findNodes(predicate: (node: TreeNode) => boolean): TreeNode[] {
    return this.getAllNodes().filter(predicate)
  }

  /**
   * 获取树容器元素
   */
  getContainer(): HTMLElement {
    return this.tree.getContainer()
  }

  /**
   * 获取节点元素
   */
  getNodeElement(nodeId: string): HTMLElement | null {
    return this.tree.getNodeElement(nodeId)
  }

  /**
   * 添加CSS类
   */
  addClass(element: HTMLElement, className: string): void {
    element.classList.add(className)
  }

  /**
   * 移除CSS类
   */
  removeClass(element: HTMLElement, className: string): void {
    element.classList.remove(className)
  }

  /**
   * 切换CSS类
   */
  toggleClass(element: HTMLElement, className: string): void {
    element.classList.toggle(className)
  }

  /**
   * 检查是否有CSS类
   */
  hasClass(element: HTMLElement, className: string): boolean {
    return element.classList.contains(className)
  }

  /**
   * 添加事件监听器
   */
  addEventListener(
    element: HTMLElement, 
    event: string, 
    callback: EventListener, 
    options?: AddEventListenerOptions
  ): void {
    element.addEventListener(event, callback, options)
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(
    element: HTMLElement, 
    event: string, 
    callback: EventListener, 
    options?: EventListenerOptions
  ): void {
    element.removeEventListener(event, callback, options)
  }

  /**
   * 获取配置值
   */
  getConfigValue<T = any>(key: string, defaultValue?: T): T {
    const keys = key.split('.')
    let value: any = this.config

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return defaultValue as T
      }
    }

    return value as T
  }

  /**
   * 设置配置值
   */
  setConfigValue(key: string, value: any): void {
    const keys = key.split('.')
    const lastKey = keys.pop()!
    let target: any = this.config

    for (const k of keys) {
      if (!target[k] || typeof target[k] !== 'object') {
        target[k] = {}
      }
      target = target[k]
    }

    target[lastKey] = value
  }

  /**
   * 创建工具提示
   */
  createTooltip(element: HTMLElement, content: string, options?: {
    position?: 'top' | 'bottom' | 'left' | 'right'
    delay?: number
  }): void {
    const tooltip = this.createElement('div', {
      className: 'ldesign-tree-tooltip',
      textContent: content,
      style: {
        position: 'absolute',
        background: '#333',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: '9999',
        pointerEvents: 'none',
        opacity: '0',
        transition: 'opacity 0.2s',
      },
    })

    document.body.appendChild(tooltip)

    let showTimeout: number
    let hideTimeout: number

    const show = () => {
      clearTimeout(hideTimeout)
      showTimeout = window.setTimeout(() => {
        const rect = element.getBoundingClientRect()
        const tooltipRect = tooltip.getBoundingClientRect()
        const position = options?.position || 'top'

        let left = rect.left + rect.width / 2 - tooltipRect.width / 2
        let top = rect.top - tooltipRect.height - 8

        if (position === 'bottom') {
          top = rect.bottom + 8
        } else if (position === 'left') {
          left = rect.left - tooltipRect.width - 8
          top = rect.top + rect.height / 2 - tooltipRect.height / 2
        } else if (position === 'right') {
          left = rect.right + 8
          top = rect.top + rect.height / 2 - tooltipRect.height / 2
        }

        tooltip.style.left = `${left}px`
        tooltip.style.top = `${top}px`
        tooltip.style.opacity = '1'
      }, options?.delay || 500)
    }

    const hide = () => {
      clearTimeout(showTimeout)
      hideTimeout = window.setTimeout(() => {
        tooltip.style.opacity = '0'
        setTimeout(() => {
          if (tooltip.parentNode) {
            document.body.removeChild(tooltip)
          }
        }, 200)
      }, 100)
    }

    element.addEventListener('mouseenter', show)
    element.addEventListener('mouseleave', hide)
  }

  /**
   * 销毁上下文
   */
  destroy(): void {
    // 移除所有样式
    this.styleElements.forEach(style => {
      if (style.parentNode) {
        document.head.removeChild(style)
      }
    })
    this.styleElements.clear()
  }
}
