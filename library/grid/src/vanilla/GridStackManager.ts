import { GridStackCore, GridStackUtils } from '../core'
import type {
  GridStackOptions,
  GridItemOptions,
  IGridStackInstance,
  GridStackEventName,
  GridStackEventHandler
} from '../types'

/**
 * GridStack 管理器 (Vanilla JS)
 * 提供原生 JavaScript 使用的简洁 API
 */
export class GridStackManager implements IGridStackInstance {
  private core: GridStackCore

  constructor(el: HTMLElement | string, options: GridStackOptions = {}) {
    this.core = new GridStackCore(el, options)
  }

  get instance() {
    return this.core.instance
  }

  get el() {
    return this.core.el
  }

  /**
   * 添加单个网格项
   */
  addWidget(options: GridItemOptions): HTMLElement | undefined {
    return this.core.addWidget(options)
  }

  /**
   * 批量添加网格项
   */
  addWidgets(items: GridItemOptions[]): HTMLElement[] {
    return this.core.addWidgets(items)
  }

  /**
   * 移除网格项
   */
  removeWidget(el: HTMLElement | string, removeDOM?: boolean): void {
    this.core.removeWidget(el, removeDOM)
  }

  /**
   * 移除所有网格项
   */
  removeAll(removeDOM?: boolean): void {
    this.core.removeAll(removeDOM)
  }

  /**
   * 更新网格项
   */
  update(el: HTMLElement, options: Partial<GridItemOptions>): void {
    this.core.update(el, options)
  }

  /**
   * 启用交互
   */
  enable(): void {
    this.core.enable()
  }

  /**
   * 禁用交互
   */
  disable(): void {
    this.core.disable()
  }

  /**
   * 锁定网格项
   */
  lock(el: HTMLElement): void {
    this.core.lock(el)
  }

  /**
   * 解锁网格项
   */
  unlock(el: HTMLElement): void {
    this.core.unlock(el)
  }

  /**
   * 设置静态模式
   */
  setStatic(staticValue: boolean): void {
    this.core.setStatic(staticValue)
  }

  /**
   * 设置动画
   */
  setAnimation(animate: boolean): void {
    this.core.setAnimation(animate)
  }

  /**
   * 设置列数
   */
  column(column: number, layout?: 'moveScale' | 'move' | 'scale' | 'none'): void {
    this.core.column(column, layout)
  }

  /**
   * 获取列数
   */
  getColumn(): number {
    return this.core.getColumn()
  }

  /**
   * 获取单元格高度
   */
  getCellHeight(): number {
    return this.core.getCellHeight()
  }

  /**
   * 设置单元格高度
   */
  cellHeight(val: number, update?: boolean): void {
    this.core.cellHeight(val, update)
  }

  /**
   * 批量更新
   */
  batchUpdate(flag?: boolean): void {
    this.core.batchUpdate(flag)
  }

  /**
   * 紧凑布局
   */
  compact(): void {
    this.core.compact()
  }

  /**
   * 浮动模式
   */
  float(val: boolean): void {
    this.core.float(val)
  }

  /**
   * 保存布局
   */
  save(saveContent?: boolean): GridItemOptions[] {
    return this.core.save(saveContent)
  }

  /**
   * 加载布局
   */
  load(items: GridItemOptions[], addAndRemove?: boolean): void {
    this.core.load(items, addAndRemove)
  }

  /**
   * 监听事件
   */
  on<T extends GridStackEventName>(event: T, callback: GridStackEventHandler<T>): void {
    this.core.on(event, callback)
  }

  /**
   * 取消监听
   */
  off<T extends GridStackEventName>(event: T): void {
    this.core.off(event)
  }

  /**
   * 获取单元格宽度
   */
  cellWidth(): number {
    return this.core.cellWidth()
  }

  /**
   * 获取所有网格项
   */
  getGridItems(): HTMLElement[] {
    return this.core.getGridItems()
  }

  /**
   * 创建子网格
   */
  makeSubGrid(el: HTMLElement, options?: GridStackOptions) {
    return this.core.makeSubGrid(el, options)
  }

  /**
   * 转换为网格项
   */
  makeWidget(el: HTMLElement | string): HTMLElement {
    return this.core.makeWidget(el)
  }

  /**
   * 设置边距
   */
  margin(value: number | string): void {
    this.core.margin(value)
  }

  /**
   * 交换网格项
   */
  swap(a: HTMLElement, b: HTMLElement): void {
    this.core.swap(a, b)
  }

  /**
   * 销毁实例
   */
  destroy(removeDOM?: boolean): void {
    this.core.destroy(removeDOM)
  }

  /**
   * 创建静态辅助方法
   */
  static init(el: HTMLElement | string, options: GridStackOptions = {}): GridStackManager {
    return new GridStackManager(el, options)
  }

  /**
   * 从选择器初始化多个网格
   */
  static initAll(selector: string = '.grid-stack', options: GridStackOptions = {}): GridStackManager[] {
    const elements = document.querySelectorAll(selector)
    const instances: GridStackManager[] = []

    elements.forEach((el) => {
      if (el instanceof HTMLElement) {
        instances.push(new GridStackManager(el, options))
      }
    })

    return instances
  }
}

/**
 * 工具函数导出
 */
export { GridStackUtils }

/**
 * 导出类型
 */
export type {
  GridStackOptions,
  GridItemOptions,
  IGridStackInstance,
  GridStackEventName,
  GridStackEventHandler
}
