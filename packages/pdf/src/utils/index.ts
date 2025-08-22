/**
 * 工具函数集合
 * 提供常用的辅助功能
 */

// 导出所有工具模块
export * from './error-handler'
export * from './event-emitter'
export * from './performance-monitor'

/**
 * 类型检查工具
 */
export const typeUtils = {
  /**
   * 检查是否为ArrayBuffer
   */
  isArrayBuffer(value: any): value is ArrayBuffer {
    return value instanceof ArrayBuffer
  },

  /**
   * 检查是否为Uint8Array
   */
  isUint8Array(value: any): value is Uint8Array {
    return value instanceof Uint8Array
  },

  /**
   * 检查是否为Blob
   */
  isBlob(value: any): value is Blob {
    return value instanceof Blob
  },

  /**
   * 检查是否为File
   */
  isFile(value: any): value is File {
    return value instanceof File
  },

  /**
   * 检查是否为URL字符串
   */
  isUrl(value: any): value is string {
    if (typeof value !== 'string')
      return false
    try {
      new URL(value)
      return true
    }
    catch {
      return false
    }
  },

  /**
   * 检查是否为有效的页码
   */
  isValidPageNumber(pageNumber: any, totalPages?: number): pageNumber is number {
    if (typeof pageNumber !== 'number' || !Number.isInteger(pageNumber)) {
      return false
    }
    if (pageNumber < 1)
      return false
    if (totalPages && pageNumber > totalPages)
      return false
    return true
  },
}

/**
 * 数据转换工具
 */
export const dataUtils = {
  /**
   * 将ArrayBuffer转换为Uint8Array
   */
  arrayBufferToUint8Array(buffer: ArrayBuffer): Uint8Array {
    return new Uint8Array(buffer)
  },

  /**
   * 将Uint8Array转换为ArrayBuffer
   */
  uint8ArrayToArrayBuffer(array: Uint8Array): ArrayBuffer {
    const buffer = array.buffer
    if (buffer instanceof ArrayBuffer) {
      return buffer.slice(array.byteOffset, array.byteOffset + array.byteLength)
    }
    // 处理SharedArrayBuffer的情况
    const newBuffer = new ArrayBuffer(array.byteLength)
    new Uint8Array(newBuffer).set(array)
    return newBuffer
  },

  /**
   * 将Blob转换为ArrayBuffer
   */
  async blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(blob)
    })
  },

  /**
   * 将URL转换为ArrayBuffer
   */
  async urlToArrayBuffer(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
    }
    return response.arrayBuffer()
  },

  /**
   * 将Base64字符串转换为ArrayBuffer
   */
  base64ToArrayBuffer(base64: string): ArrayBuffer {
    // 移除data URL前缀
    const base64Data = base64.replace(/^data:[^;]+;base64,/, '')
    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    return bytes.buffer
  },

  /**
   * 将ArrayBuffer转换为Base64字符串
   */
  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''

    for (let i = 0; i < bytes.byteLength; i++) {
      const byte = bytes[i]
      if (byte !== undefined) {
        binary += String.fromCharCode(byte)
      }
    }

    return btoa(binary)
  },
}

/**
 * 缓存键生成工具
 */
export const cacheUtils = {
  /**
   * 生成文档缓存键
   */
  generateDocumentKey(source: string | ArrayBuffer | Uint8Array): string {
    if (typeof source === 'string') {
      return `doc_${this.hashString(source)}`
    }
    return `doc_${this.hashBuffer(source)}`
  },

  /**
   * 生成页面缓存键
   */
  generatePageKey(documentKey: string, pageNumber: number): string {
    return `page_${documentKey}_${pageNumber}`
  },

  /**
   * 生成渲染缓存键
   */
  generateRenderKey(
    pageKey: string,
    scale: number,
    rotation: number,
    options?: Record<string, any>,
  ): string {
    const optionsHash = options ? this.hashObject(options) : ''
    return `render_${pageKey}_${scale}_${rotation}_${optionsHash}`
  },

  /**
   * 字符串哈希
   */
  hashString(str: string): string {
    let hash = 0
    if (str.length === 0)
      return hash.toString()

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }

    return Math.abs(hash).toString(36)
  },

  /**
   * 缓冲区哈希
   */
  hashBuffer(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer
    let hash = 0

    // 只对前1KB进行哈希以提高性能
    const sampleSize = Math.min(bytes.length, 1024)

    for (let i = 0; i < sampleSize; i++) {
      const byte = bytes[i]
      if (byte !== undefined) {
        hash = ((hash << 5) - hash) + byte
        hash = hash & hash
      }
    }

    return `${Math.abs(hash).toString(36)}_${bytes.length}`
  },

  /**
   * 对象哈希
   */
  hashObject(obj: Record<string, any>): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort())
    return this.hashString(str)
  },
}

/**
 * 异步工具
 */
export const asyncUtils = {
  /**
   * 延迟执行
   */
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  /**
   * 超时包装
   */
  withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
      }),
    ])
  },

  /**
   * 重试执行
   */
  async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number,
    delayMs = 1000,
    backoffMultiplier = 1.5,
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn()
      }
      catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (attempt === maxAttempts) {
          throw lastError
        }

        const delay = delayMs * backoffMultiplier ** (attempt - 1)
        await this.delay(delay)
      }
    }

    throw lastError!
  },

  /**
   * 批量执行（限制并发）
   */
  async batchExecute<T, R>(
    items: T[],
    executor: (item: T) => Promise<R>,
    concurrency = 3,
  ): Promise<R[]> {
    if (items.length === 0) {
      return []
    }

    const results: R[] = new Array(items.length)
    const executing: Promise<void>[] = []
    let index = 0

    const executeNext = async (): Promise<void> => {
      const currentIndex = index++
      if (currentIndex >= items.length) return

      const item = items[currentIndex]
      const result = await executor(item)
      results[currentIndex] = result

      // 继续执行下一个任务
      return executeNext()
    }

    // 启动初始并发任务
    for (let i = 0; i < Math.min(concurrency, items.length); i++) {
      executing.push(executeNext())
    }

    await Promise.all(executing)
    return results
  },
}

/**
 * DOM工具
 */
export const domUtils = {
  /**
   * 创建Canvas元素
   */
  createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return canvas
  },

  /**
   * 获取Canvas 2D上下文
   */
  getCanvas2DContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Failed to get 2D context from canvas')
    }
    return context
  },

  /**
   * 将Canvas转换为Blob
   */
  canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png', quality = 0.92): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          }
          else {
            reject(new Error('Failed to convert canvas to blob'))
          }
        },
        type,
        quality,
      )
    })
  },

  /**
   * 将Canvas转换为ImageData
   */
  canvasToImageData(canvas: HTMLCanvasElement): ImageData {
    const context = this.getCanvas2DContext(canvas)
    return context.getImageData(0, 0, canvas.width, canvas.height)
  },

  /**
   * 检查是否支持OffscreenCanvas
   */
  supportsOffscreenCanvas(): boolean {
    return typeof OffscreenCanvas !== 'undefined'
  },

  /**
   * 检查是否支持WebWorker
   */
  supportsWebWorker(): boolean {
    return typeof Worker !== 'undefined'
  },
}

/**
 * 数学工具
 */
export const mathUtils = {
  /**
   * 限制数值范围
   */
  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
  },

  /**
   * 线性插值
   */
  lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor
  },

  /**
   * 计算两点距离
   */
  distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1
    const dy = y2 - y1
    return Math.sqrt(dx * dx + dy * dy)
  },

  /**
   * 角度转弧度
   */
  degToRad(degrees: number): number {
    return degrees * (Math.PI / 180)
  },

  /**
   * 弧度转角度
   */
  radToDeg(radians: number): number {
    return radians * (180 / Math.PI)
  },

  /**
   * 计算缩放比例以适应容器
   */
  calculateFitScale(
    contentWidth: number,
    contentHeight: number,
    containerWidth: number,
    containerHeight: number,
  ): number {
    const scaleX = containerWidth / contentWidth
    const scaleY = containerHeight / contentHeight
    return Math.min(scaleX, scaleY)
  },
}

/**
 * 格式化工具
 */
export const formatUtils = {
  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0)
      return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  },

  /**
   * 格式化时间
   */
  formatDuration(ms: number): string {
    if (ms < 1000)
      return `${ms.toFixed(0)}ms`
    if (ms < 60000)
      return `${(ms / 1000).toFixed(1)}s`
    if (ms < 3600000)
      return `${(ms / 60000).toFixed(1)}m`
    return `${(ms / 3600000).toFixed(1)}h`
  },

  /**
   * 格式化百分比
   */
  formatPercentage(value: number, decimals = 1): string {
    return `${value.toFixed(decimals)}%`
  },
}

/**
 * 调试工具
 */
export const debugUtils = {
  /**
   * 创建调试日志函数
   */
  createLogger(prefix: string, enabled = false) {
    return {
      log: (...args: any[]) => {
        if (enabled) {
          console.warn(`[${prefix}]`, ...args)
        }
      },
      error: (...args: any[]) => {
        if (enabled) {
          console.error(`[${prefix}]`, ...args)
        }
      },
      time: (label: string) => {
        if (enabled) {
          console.time(`[${prefix}] ${label}`)
        }
      },
      timeEnd: (label: string) => {
        if (enabled) {
          console.timeEnd(`[${prefix}] ${label}`)
        }
      },
    }
  },

  /**
   * 性能测试
   */
  async benchmark<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const end = performance.now()
      const duration = `${(end - start).toFixed(2)}ms`
      console.warn(`[Benchmark] ${name}:`, duration)
      return result
    }
    catch (error) {
      const end = performance.now()
      console.error(`[Benchmark] ${name} failed after ${(end - start).toFixed(2)}ms:`, error)
      throw error
    }
  },
}

