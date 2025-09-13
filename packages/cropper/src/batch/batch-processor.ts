/**
 * @file 批量处理系统
 * @description 支持批量上传、处理和导出多张图片
 */

import type { Point, Size, Rectangle } from '@/types'

/**
 * 批量处理状态
 */
export enum BatchStatus {
  /** 等待中 */
  PENDING = 'pending',
  /** 处理中 */
  PROCESSING = 'processing',
  /** 已完成 */
  COMPLETED = 'completed',
  /** 出错 */
  ERROR = 'error',
  /** 已取消 */
  CANCELLED = 'cancelled'
}

/**
 * 批量操作类型
 */
export enum BatchOperation {
  /** 裁剪 */
  CROP = 'crop',
  /** 缩放 */
  RESIZE = 'resize',
  /** 旋转 */
  ROTATE = 'rotate',
  /** 翻转 */
  FLIP = 'flip',
  /** 应用滤镜 */
  FILTER = 'filter',
  /** 格式转换 */
  FORMAT = 'format',
  /** 压缩 */
  COMPRESS = 'compress',
  /** 添加水印 */
  WATERMARK = 'watermark'
}

/**
 * 批量操作配置
 */
export interface BatchOperationConfig {
  /** 操作类型 */
  type: BatchOperation
  /** 操作参数 */
  params: any
  /** 是否启用 */
  enabled: boolean
  /** 操作名称 */
  name: string
  /** 操作描述 */
  description?: string
}

/**
 * 批量处理项目
 */
export interface BatchItem {
  /** 项目ID */
  id: string
  /** 文件信息 */
  file: File
  /** 原始图片 */
  originalImage: HTMLImageElement
  /** 处理后图片 */
  processedImage?: HTMLCanvasElement
  /** 处理状态 */
  status: BatchStatus
  /** 进度百分比 */
  progress: number
  /** 错误信息 */
  error?: string
  /** 处理结果 */
  result?: {
    blob: Blob
    dataUrl: string
    fileName: string
    fileSize: number
  }
  /** 创建时间 */
  createdAt: number
  /** 开始处理时间 */
  startedAt?: number
  /** 完成时间 */
  completedAt?: number
}

/**
 * 批量处理配置
 */
export interface BatchProcessorConfig {
  /** 最大并发处理数 */
  maxConcurrent: number
  /** 处理超时时间（毫秒） */
  timeout: number
  /** 是否保留原始文件名 */
  keepOriginalName: boolean
  /** 输出文件名模板 */
  outputNameTemplate: string
  /** 输出格式 */
  outputFormat: 'png' | 'jpeg' | 'webp'
  /** 输出质量 */
  outputQuality: number
}

/**
 * 批量处理事件数据
 */
export interface BatchProcessorEventData {
  /** 事件类型 */
  type: string
  /** 批量处理项目 */
  item?: BatchItem
  /** 所有项目 */
  items?: BatchItem[]
  /** 进度信息 */
  progress?: {
    completed: number
    total: number
    percentage: number
  }
}

/**
 * 批量处理器类
 */
export class BatchProcessor {
  /** 批量处理项目列表 */
  private items: Map<string, BatchItem> = new Map()

  /** 处理队列 */
  private queue: string[] = []

  /** 正在处理的项目 */
  private processing: Set<string> = new Set()

  /** 批量操作配置 */
  private operations: BatchOperationConfig[] = []

  /** 配置选项 */
  private config: BatchProcessorConfig

  /** 是否正在处理 */
  private isProcessing: boolean = false

  /** 事件监听器 */
  private eventListeners = new Map<string, Set<Function>>()

  /** 项目ID计数器 */
  private itemIdCounter = 0

  /** 默认配置 */
  private static readonly DEFAULT_CONFIG: BatchProcessorConfig = {
    maxConcurrent: 3,
    timeout: 30000,
    keepOriginalName: true,
    outputNameTemplate: '{name}_processed.{ext}',
    outputFormat: 'png',
    outputQuality: 0.9
  }

  /**
   * 构造函数
   */
  constructor(config: Partial<BatchProcessorConfig> = {}) {
    this.config = { ...BatchProcessor.DEFAULT_CONFIG, ...config }
  }

  /**
   * 添加文件到批量处理
   */
  async addFiles(files: File[]): Promise<BatchItem[]> {
    const addedItems: BatchItem[] = []

    for (const file of files) {
      try {
        const item = await this.createBatchItem(file)
        this.items.set(item.id, item)
        this.queue.push(item.id)
        addedItems.push(item)

        this.emit('itemAdded', { type: 'itemAdded', item })
      } catch (error) {
        console.error('Error adding file to batch:', error)
      }
    }

    this.emit('filesAdded', { 
      type: 'filesAdded', 
      items: addedItems,
      progress: this.getProgress()
    })

    return addedItems
  }

  /**
   * 创建批量处理项目
   */
  private async createBatchItem(file: File): Promise<BatchItem> {
    const id = this.generateItemId()
    
    // 加载图片
    const originalImage = await this.loadImage(file)

    const item: BatchItem = {
      id,
      file,
      originalImage,
      status: BatchStatus.PENDING,
      progress: 0,
      createdAt: Date.now()
    }

    return item
  }

  /**
   * 加载图片
   */
  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load image'))
      
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 移除批量处理项目
   */
  removeItem(itemId: string): boolean {
    const item = this.items.get(itemId)
    if (!item) return false

    // 如果正在处理，取消处理
    if (this.processing.has(itemId)) {
      this.cancelItem(itemId)
    }

    // 从队列中移除
    const queueIndex = this.queue.indexOf(itemId)
    if (queueIndex > -1) {
      this.queue.splice(queueIndex, 1)
    }

    // 清理资源
    if (item.originalImage.src) {
      URL.revokeObjectURL(item.originalImage.src)
    }

    this.items.delete(itemId)
    this.emit('itemRemoved', { type: 'itemRemoved', item })

    return true
  }

  /**
   * 清空所有项目
   */
  clear(): void {
    // 取消所有正在处理的项目
    this.processing.forEach(itemId => {
      this.cancelItem(itemId)
    })

    // 清理所有资源
    this.items.forEach(item => {
      if (item.originalImage.src) {
        URL.revokeObjectURL(item.originalImage.src)
      }
    })

    this.items.clear()
    this.queue.length = 0
    this.processing.clear()
    this.isProcessing = false

    this.emit('cleared', { type: 'cleared' })
  }

  /**
   * 设置批量操作
   */
  setOperations(operations: BatchOperationConfig[]): void {
    this.operations = operations.filter(op => op.enabled)
    this.emit('operationsUpdated', { type: 'operationsUpdated' })
  }

  /**
   * 获取操作列表
   */
  getOperations(): BatchOperationConfig[] {
    return [...this.operations]
  }

  /**
   * 开始批量处理
   */
  async startProcessing(): Promise<void> {
    if (this.isProcessing) {
      console.warn('Batch processing already in progress')
      return
    }

    if (this.queue.length === 0) {
      console.warn('No items to process')
      return
    }

    this.isProcessing = true
    this.emit('processingStarted', { 
      type: 'processingStarted',
      progress: this.getProgress()
    })

    try {
      await this.processQueue()
    } catch (error) {
      console.error('Batch processing error:', error)
      this.emit('processingError', { type: 'processingError', error })
    } finally {
      this.isProcessing = false
      this.emit('processingCompleted', { 
        type: 'processingCompleted',
        progress: this.getProgress()
      })
    }
  }

  /**
   * 停止批量处理
   */
  stopProcessing(): void {
    this.isProcessing = false
    
    // 取消所有正在处理的项目
    this.processing.forEach(itemId => {
      this.cancelItem(itemId)
    })

    this.emit('processingStopped', { type: 'processingStopped' })
  }

  /**
   * 处理队列
   */
  private async processQueue(): Promise<void> {
    while (this.queue.length > 0 && this.isProcessing) {
      // 获取可以并发处理的项目
      const availableSlots = this.config.maxConcurrent - this.processing.size
      const itemsToProcess = this.queue.splice(0, availableSlots)

      // 并发处理项目
      const promises = itemsToProcess.map(itemId => this.processItem(itemId))
      
      try {
        await Promise.all(promises)
      } catch (error) {
        console.error('Error in concurrent processing:', error)
      }

      // 更新进度
      this.emit('progressUpdated', {
        type: 'progressUpdated',
        progress: this.getProgress()
      })
    }
  }

  /**
   * 处理单个项目
   */
  private async processItem(itemId: string): Promise<void> {
    const item = this.items.get(itemId)
    if (!item || !this.isProcessing) return

    this.processing.add(itemId)
    item.status = BatchStatus.PROCESSING
    item.startedAt = Date.now()
    item.progress = 0

    this.emit('itemStarted', { type: 'itemStarted', item })

    try {
      // 创建处理画布
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      // 设置初始画布大小
      canvas.width = item.originalImage.width
      canvas.height = item.originalImage.height
      ctx.drawImage(item.originalImage, 0, 0)

      // 应用所有操作
      for (let i = 0; i < this.operations.length; i++) {
        if (!this.isProcessing) break

        const operation = this.operations[i]
        await this.applyOperation(canvas, ctx, operation)

        // 更新进度
        item.progress = ((i + 1) / this.operations.length) * 100
        this.emit('itemProgress', { type: 'itemProgress', item })
      }

      if (this.isProcessing) {
        // 生成结果
        const result = await this.generateResult(canvas, item)
        
        item.processedImage = canvas
        item.result = result
        item.status = BatchStatus.COMPLETED
        item.progress = 100
        item.completedAt = Date.now()

        this.emit('itemCompleted', { type: 'itemCompleted', item })
      }

    } catch (error) {
      item.status = BatchStatus.ERROR
      item.error = error instanceof Error ? error.message : 'Processing failed'
      this.emit('itemError', { type: 'itemError', item })
    } finally {
      this.processing.delete(itemId)
    }
  }

  /**
   * 应用单个操作
   */
  private async applyOperation(
    canvas: HTMLCanvasElement, 
    ctx: CanvasRenderingContext2D, 
    operation: BatchOperationConfig
  ): Promise<void> {
    switch (operation.type) {
      case BatchOperation.CROP:
        this.applyCrop(canvas, ctx, operation.params)
        break
      case BatchOperation.RESIZE:
        this.applyResize(canvas, ctx, operation.params)
        break
      case BatchOperation.ROTATE:
        this.applyRotate(canvas, ctx, operation.params)
        break
      case BatchOperation.FLIP:
        this.applyFlip(canvas, ctx, operation.params)
        break
      case BatchOperation.FILTER:
        await this.applyFilter(canvas, ctx, operation.params)
        break
      case BatchOperation.COMPRESS:
        // 压缩在最终导出时处理
        break
      case BatchOperation.WATERMARK:
        await this.applyWatermark(canvas, ctx, operation.params)
        break
    }
  }

  /**
   * 应用裁剪
   */
  private applyCrop(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, params: any): void {
    const { x, y, width, height } = params
    const imageData = ctx.getImageData(x, y, width, height)
    
    canvas.width = width
    canvas.height = height
    ctx.putImageData(imageData, 0, 0)
  }

  /**
   * 应用缩放
   */
  private applyResize(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, params: any): void {
    const { width, height, maintainAspectRatio } = params
    const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    let newWidth = width
    let newHeight = height

    if (maintainAspectRatio) {
      const aspectRatio = canvas.width / canvas.height
      if (width / height > aspectRatio) {
        newWidth = height * aspectRatio
      } else {
        newHeight = width / aspectRatio
      }
    }

    // 创建临时画布
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')!
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    tempCtx.putImageData(currentImageData, 0, 0)

    // 调整主画布大小
    canvas.width = newWidth
    canvas.height = newHeight
    ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight)
  }

  /**
   * 应用旋转
   */
  private applyRotate(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, params: any): void {
    const { angle } = params
    const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    // 创建临时画布
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')!
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    tempCtx.putImageData(currentImageData, 0, 0)

    // 计算旋转后的尺寸
    const radians = (angle * Math.PI) / 180
    const cos = Math.abs(Math.cos(radians))
    const sin = Math.abs(Math.sin(radians))
    const newWidth = canvas.width * cos + canvas.height * sin
    const newHeight = canvas.width * sin + canvas.height * cos

    // 调整画布大小
    canvas.width = newWidth
    canvas.height = newHeight
    
    // 旋转并绘制
    ctx.translate(newWidth / 2, newHeight / 2)
    ctx.rotate(radians)
    ctx.drawImage(tempCanvas, -canvas.width / 2, -canvas.height / 2)
  }

  /**
   * 应用翻转
   */
  private applyFlip(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, params: any): void {
    const { horizontal, vertical } = params
    const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    ctx.save()
    ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1)
    ctx.translate(
      horizontal ? -canvas.width : 0,
      vertical ? -canvas.height : 0
    )
    
    ctx.putImageData(currentImageData, 0, 0)
    ctx.restore()
  }

  /**
   * 应用滤镜
   */
  private async applyFilter(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, params: any): Promise<void> {
    // 这里可以集成之前实现的滤镜系统
    const { filterType, intensity } = params
    
    // 简化的滤镜实现示例
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    switch (filterType) {
      case 'grayscale':
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
          data[i] = data[i + 1] = data[i + 2] = gray * intensity + data[i] * (1 - intensity)
        }
        break
      case 'sepia':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          
          data[i] = Math.min(255, (r * 0.393 + g * 0.769 + b * 0.189) * intensity + r * (1 - intensity))
          data[i + 1] = Math.min(255, (r * 0.349 + g * 0.686 + b * 0.168) * intensity + g * (1 - intensity))
          data[i + 2] = Math.min(255, (r * 0.272 + g * 0.534 + b * 0.131) * intensity + b * (1 - intensity))
        }
        break
    }

    ctx.putImageData(imageData, 0, 0)
  }

  /**
   * 应用水印
   */
  private async applyWatermark(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, params: any): Promise<void> {
    const { text, position, size, opacity, color } = params
    
    ctx.save()
    ctx.globalAlpha = opacity
    ctx.font = `${size}px Arial`
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    
    let x: number, y: number
    
    switch (position) {
      case 'top-left':
        x = size
        y = size * 2
        break
      case 'top-right':
        x = canvas.width - size
        y = size * 2
        break
      case 'bottom-left':
        x = size
        y = canvas.height - size
        break
      case 'bottom-right':
        x = canvas.width - size
        y = canvas.height - size
        break
      default: // center
        x = canvas.width / 2
        y = canvas.height / 2
        break
    }
    
    ctx.fillText(text, x, y)
    ctx.restore()
  }

  /**
   * 生成处理结果
   */
  private async generateResult(canvas: HTMLCanvasElement, item: BatchItem): Promise<any> {
    return new Promise((resolve, reject) => {
      const callback = (blob: Blob | null) => {
        if (!blob) {
          reject(new Error('Failed to generate blob'))
          return
        }

        const fileName = this.generateFileName(item)
        const dataUrl = canvas.toDataURL(`image/${this.config.outputFormat}`, this.config.outputQuality)
        
        resolve({
          blob,
          dataUrl,
          fileName,
          fileSize: blob.size
        })
      }

      canvas.toBlob(callback, `image/${this.config.outputFormat}`, this.config.outputQuality)
    })
  }

  /**
   * 生成文件名
   */
  private generateFileName(item: BatchItem): string {
    const originalName = item.file.name.replace(/\.[^/.]+$/, '')
    const extension = this.config.outputFormat

    if (this.config.keepOriginalName) {
      return this.config.outputNameTemplate
        .replace('{name}', originalName)
        .replace('{ext}', extension)
        .replace('{timestamp}', Date.now().toString())
    }

    return `processed_${Date.now()}.${extension}`
  }

  /**
   * 取消项目处理
   */
  private cancelItem(itemId: string): void {
    const item = this.items.get(itemId)
    if (!item) return

    item.status = BatchStatus.CANCELLED
    this.processing.delete(itemId)
    
    this.emit('itemCancelled', { type: 'itemCancelled', item })
  }

  /**
   * 获取处理进度
   */
  getProgress(): { completed: number; total: number; percentage: number } {
    const total = this.items.size
    const completed = Array.from(this.items.values()).filter(
      item => item.status === BatchStatus.COMPLETED
    ).length

    return {
      completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0
    }
  }

  /**
   * 获取所有项目
   */
  getItems(): BatchItem[] {
    return Array.from(this.items.values())
  }

  /**
   * 获取项目
   */
  getItem(itemId: string): BatchItem | undefined {
    return this.items.get(itemId)
  }

  /**
   * 下载所有完成的项目
   */
  async downloadAll(): Promise<void> {
    const completedItems = Array.from(this.items.values()).filter(
      item => item.status === BatchStatus.COMPLETED && item.result
    )

    if (completedItems.length === 0) {
      throw new Error('No completed items to download')
    }

    if (completedItems.length === 1) {
      // 单个文件直接下载
      const item = completedItems[0]
      this.downloadSingle(item.result!.blob, item.result!.fileName)
    } else {
      // 多个文件打包下载
      await this.downloadAsZip(completedItems)
    }
  }

  /**
   * 下载单个文件
   */
  private downloadSingle(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.style.display = 'none'
    
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
  }

  /**
   * 打包下载为ZIP
   */
  private async downloadAsZip(items: BatchItem[]): Promise<void> {
    // 这里需要集成JSZip库来创建ZIP文件
    // 简化实现：依次下载各个文件
    for (const item of items) {
      if (item.result) {
        this.downloadSingle(item.result.blob, item.result.fileName)
        // 添加延迟避免浏览器阻止多个下载
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  }

  /**
   * 生成项目ID
   */
  private generateItemId(): string {
    return `batch_item_${Date.now()}_${++this.itemIdCounter}`
  }

  /**
   * 添加事件监听器
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(listener)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.eventListeners.delete(event)
      }
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, data: BatchProcessorEventData): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error('Error in batch processor event listener:', error)
        }
      })
    }
  }

  /**
   * 销毁批量处理器
   */
  destroy(): void {
    this.stopProcessing()
    this.clear()
    this.eventListeners.clear()
  }
}
