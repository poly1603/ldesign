import { GridStack } from 'gridstack'
import 'gridstack/dist/gridstack.min.css'
import type {
  GridStackOptions,
  GridItemOptions,
  IGridStackInstance,
  GridStackEventName,
  GridStackEventHandler,
  GridStackNative
} from '../types'

/**
 * GridStack 核心管理器
 * 提供对 GridStack 的完整封装和增强功能
 */
export class GridStackCore implements IGridStackInstance {
  private _instance: GridStackNative | null = null
  private _el: HTMLElement | null = null
  private _options: GridStackOptions
  private _eventHandlers: Map<string, Set<Function>> = new Map()

  constructor(el: HTMLElement | string, options: GridStackOptions = {}) {
    this._options = this.normalizeOptions(options)
    this.init(el)
  }

  /**
   * 获取 GridStack 实例
   */
  get instance(): GridStackNative | null {
    return this._instance
  }

  /**
   * 获取容器元素
   */
  get el(): HTMLElement | null {
    return this._el
  }

  /**
   * 初始化网格
   */
  private init(el: HTMLElement | string): void {
    // 获取容器元素
    this._el = typeof el === 'string' ? document.querySelector(el) : el

    if (!this._el) {
      throw new Error(`GridStack: element not found: ${el}`)
    }

    // 创建 GridStack 实例
    try {
      this._instance = GridStack.init(this._options, this._el)

      if (!this._instance) {
        throw new Error('Failed to initialize GridStack instance')
      }

      this.setupDefaultEvents()
    } catch (error) {
      console.error('GridStack initialization error:', error)
      throw error
    }
  }

  /**
   * 标准化配置选项
   */
  private normalizeOptions(options: GridStackOptions): GridStackOptions {
    return {
      column: 12,
      cellHeight: 70,
      animate: true,
      float: false,
      margin: 5,
      ...options
    }
  }

  /**
   * 设置默认事件处理
   */
  private setupDefaultEvents(): void {
    if (!this._instance) return

    // 这里可以添加一些默认的事件处理逻辑
    // 例如: 性能监控、错误处理等
  }

  /**
   * 添加网格项
   */
  addWidget(options: GridItemOptions): HTMLElement | undefined {
    if (!this._instance) {
      console.warn('GridStack instance not initialized')
      return undefined
    }

    try {
      const widget = this._instance.addWidget(options)
      return widget
    } catch (error) {
      console.error('Error adding widget:', error)
      return undefined
    }
  }

  /**
   * 批量添加网格项
   */
  addWidgets(items: GridItemOptions[]): HTMLElement[] {
    const widgets: HTMLElement[] = []

    // 使用 batchUpdate 提升性能
    this.batchUpdate(true)

    for (const item of items) {
      const widget = this.addWidget(item)
      if (widget) {
        widgets.push(widget)
      }
    }

    this.batchUpdate(false)

    return widgets
  }

  /**
   * 移除网格项
   */
  removeWidget(el: HTMLElement | string, removeDOM: boolean = true): void {
    if (!this._instance) return

    try {
      const element = typeof el === 'string'
        ? this._el?.querySelector(el) as HTMLElement
        : el

      if (element) {
        this._instance.removeWidget(element, removeDOM)
      }
    } catch (error) {
      console.error('Error removing widget:', error)
    }
  }

  /**
   * 移除所有网格项
   */
  removeAll(removeDOM: boolean = true): void {
    if (!this._instance) return

    try {
      this._instance.removeAll(removeDOM)
    } catch (error) {
      console.error('Error removing all widgets:', error)
    }
  }

  /**
   * 更新网格项
   */
  update(el: HTMLElement, options: Partial<GridItemOptions>): void {
    if (!this._instance) return

    try {
      // 转换 id 为字符串
      const updateOptions = { ...options }
      if (updateOptions.id !== undefined) {
        updateOptions.id = String(updateOptions.id)
      }
      this._instance.update(el, updateOptions as any)
    } catch (error) {
      console.error('Error updating widget:', error)
    }
  }

  /**
   * 启用拖拽和调整大小
   */
  enable(): void {
    if (!this._instance) return
    this._instance.enable()
  }

  /**
   * 禁用拖拽和调整大小
   */
  disable(): void {
    if (!this._instance) return
    this._instance.disable()
  }

  /**
   * 锁定网格项
   */
  lock(el: HTMLElement): void {
    if (!this._instance) return

    try {
      this._instance.update(el, { locked: true })
    } catch (error) {
      console.error('Error locking widget:', error)
    }
  }

  /**
   * 解锁网格项
   */
  unlock(el: HTMLElement): void {
    if (!this._instance) return

    try {
      this._instance.update(el, { locked: false })
    } catch (error) {
      console.error('Error unlocking widget:', error)
    }
  }

  /**
   * 设置静态模式
   */
  setStatic(staticValue: boolean): void {
    if (!this._instance) return
    this._instance.setStatic(staticValue)
  }

  /**
   * 设置动画
   */
  setAnimation(animate: boolean): void {
    if (!this._instance) return
    this._instance.setAnimation(animate)
  }

  /**
   * 设置列数
   */
  column(column: number, layout: 'moveScale' | 'move' | 'scale' | 'none' = 'moveScale'): void {
    if (!this._instance) return
    this._instance.column(column, layout)
  }

  /**
   * 获取列数
   */
  getColumn(): number {
    if (!this._instance) return 0
    return this._instance.getColumn()
  }

  /**
   * 获取单元格高度
   */
  getCellHeight(): number {
    if (!this._instance) return 0
    return this._instance.getCellHeight(true) as number
  }

  /**
   * 设置单元格高度
   */
  cellHeight(val: number, update: boolean = true): void {
    if (!this._instance) return
    this._instance.cellHeight(val, update)
  }

  /**
   * 批量更新（提升性能）
   */
  batchUpdate(flag: boolean = true): void {
    if (!this._instance) return
    this._instance.batchUpdate(flag)
  }

  /**
   * 紧凑布局
   */
  compact(): void {
    if (!this._instance) return
    this._instance.compact()
  }

  /**
   * 设置浮动模式
   */
  float(val: boolean): void {
    if (!this._instance) return
    this._instance.float(val)
  }

  /**
   * 保存网格数据
   */
  save(saveContent: boolean = false): GridItemOptions[] {
    if (!this._instance) return []

    try {
      return this._instance.save(saveContent) as GridItemOptions[]
    } catch (error) {
      console.error('Error saving grid:', error)
      return []
    }
  }

  /**
   * 加载网格数据
   */
  load(items: GridItemOptions[], addAndRemove: boolean = true): void {
    if (!this._instance) return

    try {
      // 转换 id 为字符串
      const loadItems = items.map(item => ({
        ...item,
        id: item.id !== undefined ? String(item.id) : undefined
      }))
      this._instance.load(loadItems as any, addAndRemove)
    } catch (error) {
      console.error('Error loading grid:', error)
    }
  }

  /**
   * 监听事件
   */
  on<T extends GridStackEventName>(event: T, callback: GridStackEventHandler<T>): void {
    if (!this._instance || !this._el) return

    // 保存事件处理器引用
    if (!this._eventHandlers.has(event)) {
      this._eventHandlers.set(event, new Set())
    }
    this._eventHandlers.get(event)?.add(callback)

    // 绑定事件
    this._instance.on(event, callback as any)
  }

  /**
   * 取消监听事件
   */
  off<T extends GridStackEventName>(event: T): void {
    if (!this._instance) return

    this._instance.off(event)
    this._eventHandlers.delete(event)
  }

  /**
   * 获取单元格宽度
   */
  cellWidth(): number {
    if (!this._instance) return 0
    return this._instance.cellWidth()
  }

  /**
   * 获取所有网格项元素
   */
  getGridItems(): HTMLElement[] {
    if (!this._instance || !this._el) return []

    return Array.from(this._el.querySelectorAll('.grid-stack-item'))
  }

  /**
   * 创建子网格
   */
  makeSubGrid(el: HTMLElement, options?: GridStackOptions): GridStackNative {
    if (!this._instance) {
      throw new Error('GridStack instance not initialized')
    }
    return this._instance.makeSubGrid(el, options)
  }

  /**
   * 将元素转换为网格项
   */
  makeWidget(el: HTMLElement | string): HTMLElement {
    if (!this._instance) {
      throw new Error('GridStack instance not initialized')
    }
    return this._instance.makeWidget(el)
  }

  /**
   * 设置边距
   */
  margin(value: number | string): void {
    if (!this._instance) return
    this._instance.margin(value)
  }

  /**
   * 交换两个网格项位置
   */
  swap(a: HTMLElement, b: HTMLElement): void {
    if (!this._instance) return

    try {
      // GridStack 可能没有直接的 swap 方法，我们手动实现
      const nodeA = (a as any).gridstackNode
      const nodeB = (b as any).gridstackNode

      if (nodeA && nodeB) {
        const tempX = nodeA.x
        const tempY = nodeA.y

        this._instance.update(a, { x: nodeB.x, y: nodeB.y })
        this._instance.update(b, { x: tempX, y: tempY })
      }
    } catch (error) {
      console.error('Error swapping widgets:', error)
    }
  }

  /**
   * 销毁实例
   */
  destroy(removeDOM: boolean = true): void {
    if (!this._instance) return

    try {
      // 清理所有事件监听器
      this._eventHandlers.forEach((handlers, event) => {
        this._instance?.off(event as any)
      })
      this._eventHandlers.clear()

      // 销毁实例
      this._instance.destroy(removeDOM)
      this._instance = null
      this._el = null
    } catch (error) {
      console.error('Error destroying GridStack:', error)
    }
  }
}

/**
 * 工具函数
 */
export const GridStackUtils = {
  /**
   * 生成唯一 ID
   */
  generateId(): string {
    return `grid-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },

  /**
   * 克隆对象
   */
  clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
  },

  /**
   * 获取元素
   */
  getElement(el: HTMLElement | string): HTMLElement | null {
    return typeof el === 'string' ? document.querySelector(el) : el
  },

  /**
   * 解析选项
   */
  parseOptions(options: any): GridItemOptions {
    return {
      x: options.x ?? undefined,
      y: options.y ?? undefined,
      w: options.w ?? options.width ?? 1,
      h: options.h ?? options.height ?? 1,
      minW: options.minW ?? options.minWidth,
      maxW: options.maxW ?? options.maxWidth,
      minH: options.minH ?? options.minHeight,
      maxH: options.maxH ?? options.maxHeight,
      noMove: options.noMove ?? false,
      noResize: options.noResize ?? false,
      locked: options.locked ?? false,
      autoPosition: options.autoPosition ?? false,
      ...options
    }
  }
}

/**
 * 导出类型
 */
export type { GridStackOptions, GridItemOptions, IGridStackInstance }
