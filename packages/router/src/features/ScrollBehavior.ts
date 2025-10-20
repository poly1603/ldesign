/**
 * @ldesign/router 滚动行为管理器
 * 
 * 提供高级滚动控制功能
 */

import type { RouteLocationNormalized, ScrollPosition } from '../types'

export interface ScrollBehaviorOptions {
  /**
   * 是否启用平滑滚动
   */
  smooth?: boolean
  
  /**
   * 滚动延迟（毫秒）
   */
  delay?: number
  
  /**
   * 是否保存滚动位置
   */
  savePosition?: boolean
  
  /**
   * 最大保存的位置数量
   */
  maxSavedPositions?: number
  
  /**
   * 自定义滚动行为
   */
  custom?: (to: RouteLocationNormalized, from: RouteLocationNormalized, savedPosition: ScrollPosition | null) => ScrollPosition | false | void
  
  /**
   * 滚动到锚点的偏移量
   */
  anchorOffset?: number
  
  /**
   * 排除的路由
   */
  exclude?: string[]
}

/**
 * 滚动位置记录
 */
interface ScrollRecord {
  position: ScrollPosition
  timestamp: number
}

/**
 * 滚动行为管理器
 */
export class ScrollBehaviorManager {
  private savedPositions = new Map<string, ScrollRecord>()
  private options: Required<ScrollBehaviorOptions>
  private isScrolling = false
  
  constructor(options: ScrollBehaviorOptions = {}) {
    this.options = {
      smooth: true,
      delay: 0,
      savePosition: true,
      maxSavedPositions: 100,
      anchorOffset: 0,
      exclude: [],
      custom: undefined as any,
      ...options,
    }
  }
  
  /**
   * 保存当前滚动位置
   */
  saveScrollPosition(route: RouteLocationNormalized): void {
    if (!this.options.savePosition) return
    if (this.options.exclude.includes(route.name as string)) return
    
    const position: ScrollPosition = {
      left: window.scrollX || window.pageXOffset || document.documentElement.scrollLeft,
      top: window.scrollY || window.pageYOffset || document.documentElement.scrollTop,
    }
    
    this.savedPositions.set(route.fullPath, {
      position,
      timestamp: Date.now(),
    })
    
    // 限制保存的数量
    if (this.savedPositions.size > this.options.maxSavedPositions) {
      // 删除最旧的记录
      const entries = Array.from(this.savedPositions.entries())
      const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      const oldest = sorted[0]
      if (oldest) {
        this.savedPositions.delete(oldest[0])
      }
    }
  }
  
  /**
   * 获取保存的滚动位置
   */
  getSavedPosition(route: RouteLocationNormalized): ScrollPosition | null {
    const record = this.savedPositions.get(route.fullPath)
    return record ? record.position : null
  }
  
  /**
   * 处理滚动行为
   */
  async handleScroll(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    savedPosition?: ScrollPosition | null
  ): Promise<void> {
    // 如果正在滚动，取消之前的滚动
    if (this.isScrolling) {
      return
    }
    
    // 保存当前位置
    this.saveScrollPosition(from)
    
    // 获取滚动位置
    let scrollPosition: ScrollPosition | false | void
    
    if (this.options.custom) {
      scrollPosition = this.options.custom(to, from, savedPosition || this.getSavedPosition(to))
    } else if (savedPosition) {
      scrollPosition = savedPosition
    } else if (to.hash) {
      const el = typeof document !== 'undefined' ? document.querySelector(to.hash) : null
      scrollPosition = { left: 0, top: this.options.anchorOffset || 0, el }
    } else if (this.options.savePosition) {
      const saved = this.getSavedPosition(to)
      scrollPosition = saved || { left: 0, top: 0 }
    } else {
      scrollPosition = { left: 0, top: 0 }
    }
    
    if (scrollPosition === false) {
      return
    }
    
    // 执行滚动
    await this.performScroll(scrollPosition as ScrollPosition)
  }
  
  /**
   * 执行滚动
   */
  private async performScroll(position: ScrollPosition): Promise<void> {
    this.isScrolling = true
    
    // 延迟滚动
    if (this.options.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.options.delay))
    }
    
    try {
      // 处理锚点滚动
      if ('el' in position && position.el) {
        const element = document.querySelector((position as any).selector || (position as any).el as string)
        if (element) {
          const top = element.getBoundingClientRect().top + window.scrollY + (position.top || 0)
          this.scrollTo({ left: 0, top })
        }
        return
      }
      
      // 处理选择器滚动
      if ('selector' in position && position.selector) {
        const element = document.querySelector(position.selector as string)
        if (element) {
          element.scrollIntoView({
            behavior: this.options.smooth ? 'smooth' : 'auto',
            block: 'start',
          })
        }
        return
      }
      
      // 处理位置滚动
      this.scrollTo(position)
    } finally {
      // 滚动完成后重置状态
      setTimeout(() => {
        this.isScrolling = false
      }, 300)
    }
  }
  
  /**
   * 滚动到指定位置
   */
  private scrollTo(position: { left?: number; top?: number }): void {
    const options: ScrollToOptions = {
      left: position.left || 0,
      top: position.top || 0,
      behavior: this.options.smooth ? 'smooth' : 'auto',
    }
    
    window.scrollTo(options)
  }
  
  /**
   * 滚动到顶部
   */
  scrollToTop(_smooth = true): void {
    this.scrollTo({ left: 0, top: 0 })
  }
  
  /**
   * 滚动到底部
   */
  scrollToBottom(_smooth = true): void {
    const height = document.documentElement.scrollHeight - window.innerHeight
    this.scrollTo({ left: 0, top: height })
  }
  
  /**
   * 滚动到元素
   */
  scrollToElement(selector: string, offset = 0): void {
    const element = document.querySelector(selector)
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY + offset
      this.scrollTo({ left: 0, top })
    }
  }
  
  /**
   * 清除保存的位置
   */
  clearSavedPositions(): void {
    this.savedPositions.clear()
  }
  
  /**
   * 获取当前滚动位置
   */
  getCurrentPosition(): ScrollPosition {
    return {
      left: window.scrollX || window.pageXOffset || document.documentElement.scrollLeft,
      top: window.scrollY || window.pageYOffset || document.documentElement.scrollTop,
    }
  }
  
  /**
   * 是否在顶部
   */
  isAtTop(): boolean {
    return this.getCurrentPosition().top === 0
  }
  
  /**
   * 是否在底部
   */
  isAtBottom(): boolean {
    const scrollHeight = document.documentElement.scrollHeight
    const scrollTop = window.scrollY || window.pageYOffset
    const clientHeight = window.innerHeight
    return scrollTop + clientHeight >= scrollHeight - 1
  }
}

/**
 * 创建滚动行为管理器
 */
export function createScrollBehavior(options?: ScrollBehaviorOptions): ScrollBehaviorManager {
  return new ScrollBehaviorManager(options)
}

// 默认实例
let defaultManager: ScrollBehaviorManager | null = null

/**
 * 获取默认滚动管理器
 */
export function getScrollManager(): ScrollBehaviorManager {
  if (!defaultManager) {
    defaultManager = new ScrollBehaviorManager()
  }
  return defaultManager
}

/**
 * Vue 插件
 */
export const ScrollBehaviorPlugin = {
  install(app: any, options?: ScrollBehaviorOptions) {
    const manager = createScrollBehavior(options)
    app.config.globalProperties.$scrollBehavior = manager
    app.provide('scrollBehavior', manager)
  },
}