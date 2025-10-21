/**
 * @ldesign/form - Responsive Layout Manager
 * 响应式布局管理器
 */

import type { ResponsiveBreakpoints } from '../../utils/types'
import { getCurrentBreakpoint, type BreakpointName } from '../../utils/constants'

/**
 * 响应式布局管理器类
 */
export class ResponsiveLayoutManager {
  private breakpoints: Required<ResponsiveBreakpoints>
  private currentBreakpoint: BreakpointName
  private listeners: Set<(breakpoint: BreakpointName, columns: number) => void>
  private resizeObserver: ResizeObserver | null
  private container: HTMLElement | null

  constructor(breakpoints?: ResponsiveBreakpoints) {
    this.breakpoints = {
      xs: breakpoints?.xs ?? 1,
      sm: breakpoints?.sm ?? 1,
      md: breakpoints?.md ?? 2,
      lg: breakpoints?.lg ?? 3,
      xl: breakpoints?.xl ?? 4,
      xxl: breakpoints?.xxl ?? 4
    }

    this.currentBreakpoint = 'md'
    this.listeners = new Set()
    this.resizeObserver = null
    this.container = null
  }

  /**
   * 初始化响应式监听
   * @param container 容器元素
   */
  init(container: HTMLElement): void {
    this.container = container
    this.currentBreakpoint = this.getBreakpoint(container.offsetWidth)

    // 使用 ResizeObserver 监听容器尺寸变化
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          this.handleResize(entry.contentRect.width)
        }
      })

      this.resizeObserver.observe(container)
    } else {
      // 降级方案：使用 window resize 事件
      window.addEventListener('resize', this.handleWindowResize)
    }
  }

  /**
   * 处理窗口尺寸变化
   */
  private handleWindowResize = (): void => {
    if (this.container) {
      this.handleResize(this.container.offsetWidth)
    }
  }

  /**
   * 处理尺寸变化
   * @param width 容器宽度
   */
  private handleResize(width: number): void {
    const newBreakpoint = this.getBreakpoint(width)

    if (newBreakpoint !== this.currentBreakpoint) {
      this.currentBreakpoint = newBreakpoint
      const columns = this.getColumns()
      this.notifyListeners(newBreakpoint, columns)
    }
  }

  /**
   * 根据宽度获取断点
   * @param width 容器宽度
   */
  private getBreakpoint(width: number): BreakpointName {
    return getCurrentBreakpoint(width)
  }

  /**
   * 获取当前断点对应的列数
   */
  getColumns(): number {
    return this.breakpoints[this.currentBreakpoint]
  }

  /**
   * 获取当前断点
   */
  getCurrentBreakpoint(): BreakpointName {
    return this.currentBreakpoint
  }

  /**
   * 更新断点配置
   * @param breakpoints 新的断点配置
   */
  updateBreakpoints(breakpoints: ResponsiveBreakpoints): void {
    this.breakpoints = {
      ...this.breakpoints,
      ...breakpoints
    }

    // 重新计算当前列数
    const columns = this.getColumns()
    this.notifyListeners(this.currentBreakpoint, columns)
  }

  /**
   * 订阅断点变化
   * @param listener 监听器函数
   * @returns 取消订阅函数
   */
  subscribe(listener: (breakpoint: BreakpointName, columns: number) => void): () => void {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * 通知所有监听器
   * @param breakpoint 当前断点
   * @param columns 列数
   */
  private notifyListeners(breakpoint: BreakpointName, columns: number): void {
    this.listeners.forEach(listener => {
      try {
        listener(breakpoint, columns)
      } catch (error) {
        console.error('Error in responsive layout listener:', error)
      }
    })
  }

  /**
   * 销毁响应式管理器
   */
  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    } else {
      window.removeEventListener('resize', this.handleWindowResize)
    }

    this.listeners.clear()
    this.container = null
  }
}

/**
 * 创建响应式布局管理器
 */
export function createResponsiveLayoutManager(
  breakpoints?: ResponsiveBreakpoints
): ResponsiveLayoutManager {
  return new ResponsiveLayoutManager(breakpoints)
}




