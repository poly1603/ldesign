/**
 * 消息系统工具函数
 */

import type {
  MessageConfigBuilder as IMessageConfigBuilder,
  MessageConfig,
  MessagePosition,
  MessageTheme,
  MessageType,
} from './types'

/**
 * 生成唯一ID
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 验证消息配置
 */
export function validateMessageConfig(config: MessageConfig): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!config.content || typeof config.content !== 'string') {
    errors.push('Message content is required and must be a string')
  }

  if (
    config.type &&
    !['success', 'error', 'warning', 'info', 'loading'].includes(config.type)
  ) {
    errors.push('Invalid message type')
  }

  if (
    config.position &&
    !['top', 'center', 'bottom'].includes(config.position)
  ) {
    errors.push('Invalid message position')
  }

  if (
    config.duration !== undefined &&
    (typeof config.duration !== 'number' || config.duration < 0)
  ) {
    errors.push('Duration must be a non-negative number')
  }

  if (
    config.offset !== undefined &&
    (typeof config.offset !== 'number' || config.offset < 0)
  ) {
    errors.push('Offset must be a non-negative number')
  }

  if (
    config.zIndex !== undefined &&
    (typeof config.zIndex !== 'number' || config.zIndex < 0)
  ) {
    errors.push('zIndex must be a non-negative number')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 合并消息配置
 */
export function mergeMessageConfig(
  defaultConfig: Partial<MessageConfig>,
  userConfig: MessageConfig
): MessageConfig {
  return {
    ...defaultConfig,
    ...userConfig,
    id: userConfig.id || generateMessageId(),
  }
}

/**
 * 获取默认主题
 */
export function getDefaultThemes(): Record<MessageType, MessageTheme> {
  return {
    success: {
      background: '#f0f9ff',
      border: '1px solid #67c23a',
      color: '#67c23a',
      iconColor: '#67c23a',
    },
    error: {
      background: '#fef0f0',
      border: '1px solid #f56c6c',
      color: '#f56c6c',
      iconColor: '#f56c6c',
    },
    warning: {
      background: '#fdf6ec',
      border: '1px solid #e6a23c',
      color: '#e6a23c',
      iconColor: '#e6a23c',
    },
    info: {
      background: '#f4f4f5',
      border: '1px solid #909399',
      color: '#909399',
      iconColor: '#909399',
    },
    loading: {
      background: '#f0f9ff',
      border: '1px solid #409eff',
      color: '#409eff',
      iconColor: '#409eff',
    },
  }
}

/**
 * 获取消息图标
 */
export function getMessageIcon(type: MessageType): string {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
    loading: '⟳',
  }
  return icons[type] || icons.info
}

/**
 * 创建CSS样式字符串
 */
export function createStyleString(
  styles: Record<string, string | number>
): string {
  return Object.entries(styles)
    .map(([key, value]) => `${kebabCase(key)}: ${value}`)
    .join('; ')
}

/**
 * 转换为kebab-case
 */
export function kebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | undefined

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = window.setTimeout(later, wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T
  }

  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }

  return obj
}

/**
 * 检查是否为移动设备
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * 获取视口尺寸
 */
export function getViewportSize(): { width: number; height: number } {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  }
}

/**
 * 计算元素位置
 */
export function calculatePosition(
  element: HTMLElement,
  position: MessagePosition,
  offset: number,
  index: number,
  gap: number
): { top?: string; bottom?: string; left: string; transform: string } {
  const elementRect = element.getBoundingClientRect()

  const result: { top?: string; bottom?: string; left: string; transform: string } = {
    left: '50%',
    transform: 'translateX(-50%)',
  }

  switch (position) {
    case 'top':
      result.top = `${offset + index * (elementRect.height + gap)}px`
      break
    case 'center':
      result.top = '50%'
      result.transform = 'translate(-50%, -50%)'
      break
    case 'bottom':
      result.bottom = `${offset + index * (elementRect.height + gap)}px`
      break
  }

  return result
}

/**
 * 消息配置构建器
 */
export class MessageConfigBuilder implements IMessageConfigBuilder {
  private config: Partial<MessageConfig> = {}

  type(type: MessageType): MessageConfigBuilder {
    this.config.type = type
    return this
  }

  content(content: string): MessageConfigBuilder {
    this.config.content = content
    return this
  }

  title(title: string): MessageConfigBuilder {
    this.config.title = title
    return this
  }

  duration(duration: number): MessageConfigBuilder {
    this.config.duration = duration
    return this
  }

  position(position: MessagePosition): MessageConfigBuilder {
    this.config.position = position
    return this
  }

  showClose(show: boolean): MessageConfigBuilder {
    this.config.showClose = show
    return this
  }

  html(html: boolean): MessageConfigBuilder {
    this.config.html = html
    return this
  }

  customClass(className: string): MessageConfigBuilder {
    this.config.customClass = className
    return this
  }

  onClick(callback: () => void): MessageConfigBuilder {
    this.config.onClick = callback
    return this
  }

  onClose(callback: () => void): MessageConfigBuilder {
    this.config.onClose = callback
    return this
  }

  build(): MessageConfig {
    if (!this.config?.content) {
      throw new Error('Message content is required')
    }

    return {
      type: 'info',
      duration: 3000,
      position: 'top',
      offset: 20,
      showClose: true,
      html: false,
      ...this.config,
      content: this.config?.content,
      id: this.config?.id || generateMessageId(),
    }
  }
}

/**
 * 创建消息配置构建器
 */
export function createMessageBuilder(): MessageConfigBuilder {
  return new MessageConfigBuilder()
}

/**
 * 快捷方法创建不同类型的消息配置
 */
export const messageBuilder = {
  success: (content: string) =>
    new MessageConfigBuilder().type('success').content(content),
  error: (content: string) =>
    new MessageConfigBuilder().type('error').content(content),
  warning: (content: string) =>
    new MessageConfigBuilder().type('warning').content(content),
  info: (content: string) =>
    new MessageConfigBuilder().type('info').content(content),
  loading: (content: string) =>
    new MessageConfigBuilder().type('loading').content(content).duration(0),
}

/**
 * 消息队列实现
 */
export class MessageQueue {
  private queue: MessageConfig[] = []
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  enqueue(config: MessageConfig): void {
    if (this.queue.length >= this.maxSize) {
      this.queue.shift() // 移除最早的消息
    }
    this.queue.push(config)
  }

  dequeue(): MessageConfig | null {
    return this.queue.shift() || null
  }

  peek(): MessageConfig | null {
    return this.queue[0] || null
  }

  size(): number {
    return this.queue.length
  }

  clear(): void {
    this.queue = []
  }

  toArray(): MessageConfig[] {
    return [...this.queue]
  }
}

/**
 * 消息存储实现（基于内存）
 */
export class MessageMemoryStorage {
  private storage = new Map<string, { id: string; options: unknown; timestamp: number }>()

  save(instance: { id: string; options: unknown }): void {
    this.storage.set(instance.id, {
      id: instance.id,
      options: instance.options,
      timestamp: Date.now(),
    })
  }

  load(id: string): unknown | null {
    return this.storage.get(id) || null
  }

  remove(id: string): boolean {
    return this.storage.delete(id)
  }

  clear(): void {
    this.storage.clear()
  }

  getAll(): unknown[] {
    return Array.from(this.storage.values())
  }

  size(): number {
    return this.storage.size
  }
}

/**
 * 性能监控工具
 */
export class MessagePerformanceMonitor {
  private timings = new Map<string, number>()
  private metrics = {
    renderTimes: [] as number[],
    animationTimes: [] as number[],
  }

  startTiming(id: string): void {
    this.timings.set(id, performance.now())
  }

  endTiming(id: string): number {
    const startTime = this.timings.get(id)
    if (!startTime) return 0

    const duration = performance.now() - startTime
    this.timings.delete(id)
    return duration
  }

  recordRenderTime(duration: number): void {
    this.metrics.renderTimes.push(duration)
    if (this.metrics.renderTimes.length > 100) {
      this.metrics.renderTimes.shift()
    }
  }

  recordAnimationTime(duration: number): void {
    this.metrics.animationTimes.push(duration)
    if (this.metrics.animationTimes.length > 100) {
      this.metrics.animationTimes.shift()
    }
  }

  getMetrics() {
    const avgRender =
      this.metrics.renderTimes.length > 0
        ? this.metrics.renderTimes.reduce((a, b) => a + b, 0) /
        this.metrics.renderTimes.length
        : 0

    const avgAnimation =
      this.metrics.animationTimes.length > 0
        ? this.metrics.animationTimes.reduce((a, b) => a + b, 0) /
        this.metrics.animationTimes.length
        : 0

    return {
      averageRenderTime: avgRender,
      averageAnimationTime: avgAnimation,
      memoryUsage:
        typeof globalThis !== 'undefined' &&
          typeof globalThis.performance !== 'undefined' &&
          'memory' in (globalThis.performance as Performance)
          ? ((globalThis.performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0)
          : 0,
    }
  }

  reset(): void {
    this.timings.clear()
    this.metrics.renderTimes = []
    this.metrics.animationTimes = []
  }
}
