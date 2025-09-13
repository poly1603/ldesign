/**
 * 排序指示器组件
 * 
 * 提供表格列头的排序指示器功能
 * 支持升序、降序和无排序状态的视觉指示
 */

import type { SortDirection } from '../types'

/**
 * 排序指示器配置
 */
export interface SortIndicatorConfig {
  /** 当前排序方向 */
  direction?: SortDirection
  /** 是否可排序 */
  sortable?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义类名 */
  className?: string
  /** 点击回调 */
  onClick?: (direction: SortDirection) => void
}

/**
 * 排序指示器类
 */
export class SortIndicator {
  /** 配置 */
  private config: SortIndicatorConfig

  /** 容器元素 */
  private container: HTMLElement

  /** 指示器元素 */
  private indicatorElement: HTMLElement | null = null

  /** 升序按钮 */
  private ascButton: HTMLElement | null = null

  /** 降序按钮 */
  private descButton: HTMLElement | null = null

  /** 事件监听器 */
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map()

  /**
   * 构造函数
   * @param container 容器元素或选择器
   * @param config 排序指示器配置
   */
  constructor(container: string | HTMLElement, config: SortIndicatorConfig = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container) as HTMLElement
      : container

    if (!this.container) {
      throw new Error('排序指示器容器不存在')
    }

    this.config = {
      sortable: true,
      disabled: false,
      ...config
    }

    this.render()
  }

  /**
   * 渲染排序指示器
   */
  render(): void {
    // 清空容器
    this.container.innerHTML = ''

    if (!this.config.sortable) {
      return
    }

    // 创建指示器元素
    this.indicatorElement = document.createElement('span')
    this.indicatorElement.className = `ldesign-table-sort-indicator ${this.config.className || ''}`

    if (this.config.disabled) {
      this.indicatorElement.classList.add('ldesign-table-sort-indicator-disabled')
    }

    // 创建升序按钮
    this.ascButton = document.createElement('span')
    this.ascButton.className = 'ldesign-table-sort-asc'
    this.ascButton.innerHTML = '▲'
    this.ascButton.title = '升序排序'

    // 创建降序按钮
    this.descButton = document.createElement('span')
    this.descButton.className = 'ldesign-table-sort-desc'
    this.descButton.innerHTML = '▼'
    this.descButton.title = '降序排序'

    // 添加按钮到指示器
    this.indicatorElement.appendChild(this.ascButton)
    this.indicatorElement.appendChild(this.descButton)

    // 设置当前状态
    this.updateState()

    // 绑定事件
    this.bindEvents()

    // 添加到容器
    this.container.appendChild(this.indicatorElement)
  }

  /**
   * 更新排序状态
   * @private
   */
  private updateState(): void {
    if (!this.ascButton || !this.descButton) return

    // 清除所有状态
    this.ascButton.classList.remove('active')
    this.descButton.classList.remove('active')

    // 设置当前状态
    switch (this.config.direction) {
      case 'asc':
        this.ascButton.classList.add('active')
        break
      case 'desc':
        this.descButton.classList.add('active')
        break
      default:
        // 无排序状态
        break
    }
  }

  /**
   * 绑定事件
   * @private
   */
  private bindEvents(): void {
    if (!this.ascButton || !this.descButton || this.config.disabled) return

    // 升序按钮点击
    this.ascButton.addEventListener('click', (e) => {
      e.stopPropagation()
      this.handleSort('asc')
    })

    // 降序按钮点击
    this.descButton.addEventListener('click', (e) => {
      e.stopPropagation()
      this.handleSort('desc')
    })

    // 整个指示器点击（循环排序）
    this.indicatorElement?.addEventListener('click', (e) => {
      e.stopPropagation()
      this.handleCycleSort()
    })
  }

  /**
   * 处理排序
   * @private
   */
  private handleSort(direction: SortDirection): void {
    if (this.config.disabled) return

    // 如果点击的是当前方向，则清除排序
    const newDirection = this.config.direction === direction ? null : direction

    this.setDirection(newDirection)

    // 触发回调
    if (this.config.onClick) {
      this.config.onClick(newDirection)
    }

    // 触发事件
    this.emit('sort-change', {
      direction: newDirection,
      previousDirection: this.config.direction
    })
  }

  /**
   * 处理循环排序（无排序 -> 升序 -> 降序 -> 无排序）
   * @private
   */
  private handleCycleSort(): void {
    if (this.config.disabled) return

    let newDirection: SortDirection

    switch (this.config.direction) {
      case null:
      case undefined:
        newDirection = 'asc'
        break
      case 'asc':
        newDirection = 'desc'
        break
      case 'desc':
        newDirection = null
        break
      default:
        newDirection = 'asc'
        break
    }

    this.setDirection(newDirection)

    // 触发回调
    if (this.config.onClick) {
      this.config.onClick(newDirection)
    }

    // 触发事件
    this.emit('sort-change', {
      direction: newDirection,
      previousDirection: this.config.direction
    })
  }

  /**
   * 发射事件
   * @private
   */
  private emit(eventName: string, data: any): void {
    const listeners = this.eventListeners.get(eventName)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error(`Error in sort indicator event listener for ${eventName}:`, error)
        }
      })
    }
  }

  // ==================== 公共方法 ====================

  /**
   * 设置排序方向
   */
  setDirection(direction: SortDirection): void {
    const previousDirection = this.config.direction
    this.config.direction = direction
    this.updateState()

    // 触发事件
    this.emit('sort-change', {
      direction,
      previousDirection
    })
  }

  /**
   * 获取当前排序方向
   */
  getDirection(): SortDirection {
    return this.config.direction || null
  }

  /**
   * 设置是否可排序
   */
  setSortable(sortable: boolean): void {
    this.config.sortable = sortable
    this.render()
  }

  /**
   * 设置是否禁用
   */
  setDisabled(disabled: boolean): void {
    this.config.disabled = disabled

    if (this.indicatorElement) {
      if (disabled) {
        this.indicatorElement.classList.add('ldesign-table-sort-indicator-disabled')
      } else {
        this.indicatorElement.classList.remove('ldesign-table-sort-indicator-disabled')
      }
    }

    this.render()
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<SortIndicatorConfig>): void {
    this.config = { ...this.config, ...config }
    this.render()
  }

  /**
   * 添加事件监听器
   */
  on(eventName: string, listener: (data: any) => void): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, [])
    }
    this.eventListeners.get(eventName)!.push(listener)
  }

  /**
   * 移除事件监听器
   */
  off(eventName: string, listener?: (data: any) => void): void {
    if (!this.eventListeners.has(eventName)) return

    if (listener) {
      const listeners = this.eventListeners.get(eventName)!
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    } else {
      this.eventListeners.delete(eventName)
    }
  }

  /**
   * 销毁排序指示器
   */
  destroy(): void {
    if (this.indicatorElement && this.indicatorElement.parentNode === this.container) {
      this.container.removeChild(this.indicatorElement)
    }
    this.indicatorElement = null
    this.ascButton = null
    this.descButton = null
    this.eventListeners.clear()
  }
}
