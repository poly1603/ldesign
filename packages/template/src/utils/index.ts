/**
 * 工具函数模块
 * 提供模板管理相关的工具函数
 */

import type { DeviceType, TemplateInfo } from '../types'

/**
 * 设备类型检测工具
 */
export const deviceUtils = {
  /**
   * 检测当前设备类型
   */
  detectDeviceType(): DeviceType {
    if (typeof window === 'undefined') {
      return 'desktop'
    }

    const userAgent = navigator.userAgent.toLowerCase()
    const width = window.innerWidth

    // 移动设备检测
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return 'mobile'
    }

    // 平板设备检测
    if (/tablet|ipad|playbook|silk/i.test(userAgent)
      || (width >= 768 && width <= 1024)) {
      return 'tablet'
    }

    return 'desktop'
  },

  /**
   * 检查是否为移动设备
   */
  isMobile(): boolean {
    return this.detectDeviceType() === 'mobile'
  },

  /**
   * 检查是否为平板设备
   */
  isTablet(): boolean {
    return this.detectDeviceType() === 'tablet'
  },

  /**
   * 检查是否为桌面设备
   */
  isDesktop(): boolean {
    return this.detectDeviceType() === 'desktop'
  },

  /**
   * 获取屏幕尺寸
   */
  getScreenSize(): { width: number, height: number } {
    if (typeof window === 'undefined') {
      return { width: 0, height: 0 }
    }

    return {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  },

  /**
   * 获取设备方向
   */
  getOrientation(): 'portrait' | 'landscape' {
    const { width, height } = this.getScreenSize()
    return width > height ? 'landscape' : 'portrait'
  },
}

/**
 * 模板工具函数
 */
export const templateUtils = {
  /**
   * 生成模板缓存键
   */
  generateCacheKey(category: string, deviceType: DeviceType, path?: string): string {
    const parts = [category, deviceType]
    if (path) {
      parts.push(path)
    }
    return parts.join(':')
  },

  /**
   * 解析模板路径
   */
  parseTemplatePath(path: string): {
    category: string
    deviceType: DeviceType | null
    filename: string
  } {
    const parts = path.split('/')
    const filename = parts[parts.length - 1]

    // 尝试从路径中提取分类和设备类型
    // 假设路径格式为: templates/category/device/filename
    if (parts.length >= 4 && parts[0] === 'templates') {
      const category = parts[1]
      const deviceType = parts[2] as DeviceType

      if (['desktop', 'mobile', 'tablet'].includes(deviceType)) {
        return { category, deviceType, filename }
      }
    }

    // 如果无法解析，返回基本信息
    return {
      category: parts[parts.length - 2] || 'unknown',
      deviceType: null,
      filename,
    }
  },

  /**
   * 验证模板信息
   */
  validateTemplateInfo(templateInfo: Partial<TemplateInfo>): boolean {
    return !!(
      templateInfo.category
      && templateInfo.deviceType
      && templateInfo.templateFile
      && templateInfo.metadata
    )
  },

  /**
   * 格式化模板大小
   */
  formatTemplateSize(bytes: number): string {
    if (bytes === 0)
      return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  },

  /**
   * 计算模板加载优先级
   */
  calculatePriority(templateInfo: TemplateInfo, currentDevice: DeviceType): number {
    let priority = 0

    // 设备类型匹配度
    if (templateInfo.deviceType === currentDevice) {
      priority += 100
    }
    else if (
      (currentDevice === 'tablet' && templateInfo.deviceType === 'desktop')
      || (currentDevice === 'mobile' && templateInfo.deviceType === 'tablet')
    ) {
      priority += 50
    }

    // 模板状态
    if (templateInfo.status === 'loaded') {
      priority += 30
    }
    else if (templateInfo.status === 'cached') {
      priority += 20
    }

    // 访问频率（如果有的话）
    if (templateInfo.metadata.config?.priority) {
      priority += templateInfo.metadata.config.priority
    }

    return priority
  },
}

/**
 * 性能工具函数
 */
export const performanceUtils = {
  /**
   * 测量函数执行时间
   */
  async measureTime<T>(fn: () => Promise<T> | T): Promise<{ result: T, duration: number }> {
    const start = performance.now()
    const result = await fn()
    const duration = performance.now() - start

    return { result, duration }
  },

  /**
   * 防抖函数
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout

    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  /**
   * 节流函数
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number,
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  },

  /**
   * 内存使用情况检测
   */
  getMemoryUsage(): {
    used: number
    total: number
    percentage: number
  } {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
      }
    }

    return { used: 0, total: 0, percentage: 0 }
  },

  /**
   * 检查是否支持某个特性
   */
  checkFeatureSupport(feature: string): boolean {
    switch (feature) {
      case 'intersectionObserver':
        return typeof IntersectionObserver !== 'undefined'

      case 'resizeObserver':
        return typeof ResizeObserver !== 'undefined'

      case 'webgl':
        try {
          const canvas = document.createElement('canvas')
          return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        }
        catch {
          return false
        }

      case 'localStorage':
        try {
          return typeof localStorage !== 'undefined'
        }
        catch {
          return false
        }

      case 'serviceWorker':
        return 'serviceWorker' in navigator

      default:
        return false
    }
  },
}

/**
 * 缓存工具函数
 */
export const cacheUtils = {
  /**
   * 生成缓存键的哈希值
   */
  hashKey(key: string): string {
    let hash = 0
    if (key.length === 0)
      return hash.toString()

    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }

    return Math.abs(hash).toString(36)
  },

  /**
   * 序列化对象为缓存
   */
  serialize(obj: any): string {
    try {
      return JSON.stringify(obj)
    }
    catch {
      return ''
    }
  },

  /**
   * 反序列化缓存对象
   */
  deserialize<T>(str: string): T | null {
    try {
      return JSON.parse(str)
    }
    catch {
      return null
    }
  },

  /**
   * 计算对象大小（字节）
   */
  calculateSize(obj: any): number {
    return new Blob([this.serialize(obj)]).size
  },

  /**
   * 检查缓存是否过期
   */
  isExpired(timestamp: number, ttl: number): boolean {
    return Date.now() - timestamp > ttl
  },
}

/**
 * 错误处理工具
 */
export const errorUtils = {
  /**
   * 创建标准错误
   */
  createError(message: string, code?: string, cause?: Error): Error {
    const error = new Error(message)
    if (code) {
      (error as any).code = code
    }
    if (cause) {
      (error as any).cause = cause
    }
    return error
  },

  /**
   * 检查是否为网络错误
   */
  isNetworkError(error: Error): boolean {
    return error.message.includes('fetch')
      || error.message.includes('network')
      || error.message.includes('timeout')
  },

  /**
   * 检查是否为模板不存在错误
   */
  isTemplateNotFoundError(error: Error): boolean {
    return error.message.includes('not found')
      || error.message.includes('No template')
  },

  /**
   * 格式化错误信息
   */
  formatError(error: Error): {
    message: string
    stack?: string
    code?: string
    timestamp: number
  } {
    return {
      message: error.message,
      stack: error.stack,
      code: (error as any).code,
      timestamp: Date.now(),
    }
  },
}

/**
 * 日志工具
 */
export const logUtils = {
  /**
   * 创建带前缀的日志函数
   */
  createLogger(prefix: string) {
    return {
      debug: (message: string, ...args: any[]) => {
        console.debug(`[${prefix}] ${message}`, ...args)
      },
      info: (message: string, ...args: any[]) => {
        console.info(`[${prefix}] ${message}`, ...args)
      },
      warn: (message: string, ...args: any[]) => {
        console.warn(`[${prefix}] ${message}`, ...args)
      },
      error: (message: string, ...args: any[]) => {
        console.error(`[${prefix}] ${message}`, ...args)
      },
    }
  },

  /**
   * 格式化日志时间
   */
  formatTime(timestamp: number = Date.now()): string {
    return new Date(timestamp).toISOString()
  },
}

// 默认导出所有工具
export default {
  deviceUtils,
  templateUtils,
  performanceUtils,
  cacheUtils,
  errorUtils,
  logUtils,
}
