/**
 * @file 图片处理Web Worker
 * @description 在后台线程中处理图片操作
 */

/**
 * Worker消息类型
 */
export enum WorkerMessageType {
  PROCESS_IMAGE = 'processImage',
  CROP_IMAGE = 'cropImage',
  RESIZE_IMAGE = 'resizeImage',
  APPLY_FILTER = 'applyFilter',
  ROTATE_IMAGE = 'rotateImage',
  FLIP_IMAGE = 'flipImage',
  RESULT = 'result',
  ERROR = 'error',
  PROGRESS = 'progress'
}

/**
 * Worker消息接口
 */
export interface WorkerMessage {
  id: string
  type: WorkerMessageType
  data: any
}

/**
 * 图片处理参数
 */
export interface ImageProcessParams {
  imageData: ImageData
  operation: string
  params: Record<string, any>
}

/**
 * 裁剪参数
 */
export interface CropParams {
  x: number
  y: number
  width: number
  height: number
  outputWidth?: number
  outputHeight?: number
  quality?: number
}

/**
 * 调整大小参数
 */
export interface ResizeParams {
  width: number
  height: number
  quality?: number
  algorithm?: 'bilinear' | 'bicubic' | 'lanczos'
}

/**
 * 滤镜参数
 */
export interface FilterParams {
  type: 'blur' | 'sharpen' | 'brightness' | 'contrast' | 'saturation' | 'hue'
  value: number
}

/**
 * 旋转参数
 */
export interface RotateParams {
  angle: number
  backgroundColor?: string
}

/**
 * 翻转参数
 */
export interface FlipParams {
  horizontal: boolean
  vertical: boolean
}

// Worker代码（在Worker上下文中运行）
if (typeof importScripts === 'function') {
  // 这是Worker上下文
  
  /**
   * 处理图片裁剪
   */
  function cropImage(imageData: ImageData, params: CropParams): ImageData {
    const { x, y, width, height, outputWidth = width, outputHeight = height } = params
    
    const canvas = new OffscreenCanvas(outputWidth, outputHeight)
    const ctx = canvas.getContext('2d')!
    
    // 创建临时canvas来放置原始图片
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height)
    const tempCtx = tempCanvas.getContext('2d')!
    tempCtx.putImageData(imageData, 0, 0)
    
    // 裁剪并缩放到输出尺寸
    ctx.drawImage(tempCanvas, x, y, width, height, 0, 0, outputWidth, outputHeight)
    
    return ctx.getImageData(0, 0, outputWidth, outputHeight)
  }

  /**
   * 调整图片大小
   */
  function resizeImage(imageData: ImageData, params: ResizeParams): ImageData {
    const { width, height, algorithm = 'bilinear' } = params
    
    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')!
    
    // 设置图像平滑算法
    if (algorithm === 'bilinear') {
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
    } else {
      ctx.imageSmoothingEnabled = false
    }
    
    // 创建临时canvas
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height)
    const tempCtx = tempCanvas.getContext('2d')!
    tempCtx.putImageData(imageData, 0, 0)
    
    // 绘制缩放后的图片
    ctx.drawImage(tempCanvas, 0, 0, imageData.width, imageData.height, 0, 0, width, height)
    
    return ctx.getImageData(0, 0, width, height)
  }

  /**
   * 应用滤镜
   */
  function applyFilter(imageData: ImageData, params: FilterParams): ImageData {
    const { type, value } = params
    const data = new Uint8ClampedArray(imageData.data)
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      switch (type) {
        case 'brightness':
          data[i] = Math.min(255, r + value)
          data[i + 1] = Math.min(255, g + value)
          data[i + 2] = Math.min(255, b + value)
          break
          
        case 'contrast':
          const factor = (259 * (value + 255)) / (255 * (259 - value))
          data[i] = Math.min(255, Math.max(0, factor * (r - 128) + 128))
          data[i + 1] = Math.min(255, Math.max(0, factor * (g - 128) + 128))
          data[i + 2] = Math.min(255, Math.max(0, factor * (b - 128) + 128))
          break
          
        case 'saturation':
          const gray = 0.299 * r + 0.587 * g + 0.114 * b
          data[i] = Math.min(255, Math.max(0, gray + value * (r - gray)))
          data[i + 1] = Math.min(255, Math.max(0, gray + value * (g - gray)))
          data[i + 2] = Math.min(255, Math.max(0, gray + value * (b - gray)))
          break
      }
    }
    
    return new ImageData(data, imageData.width, imageData.height)
  }

  /**
   * 旋转图片
   */
  function rotateImage(imageData: ImageData, params: RotateParams): ImageData {
    const { angle, backgroundColor = 'transparent' } = params
    const radians = (angle * Math.PI) / 180
    
    // 计算旋转后的尺寸
    const cos = Math.abs(Math.cos(radians))
    const sin = Math.abs(Math.sin(radians))
    const newWidth = Math.ceil(imageData.width * cos + imageData.height * sin)
    const newHeight = Math.ceil(imageData.width * sin + imageData.height * cos)
    
    const canvas = new OffscreenCanvas(newWidth, newHeight)
    const ctx = canvas.getContext('2d')!
    
    // 设置背景色
    if (backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, newWidth, newHeight)
    }
    
    // 移动到中心点并旋转
    ctx.translate(newWidth / 2, newHeight / 2)
    ctx.rotate(radians)
    
    // 创建临时canvas
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height)
    const tempCtx = tempCanvas.getContext('2d')!
    tempCtx.putImageData(imageData, 0, 0)
    
    // 绘制旋转后的图片
    ctx.drawImage(tempCanvas, -imageData.width / 2, -imageData.height / 2)
    
    return ctx.getImageData(0, 0, newWidth, newHeight)
  }

  /**
   * 翻转图片
   */
  function flipImage(imageData: ImageData, params: FlipParams): ImageData {
    const { horizontal, vertical } = params
    
    const canvas = new OffscreenCanvas(imageData.width, imageData.height)
    const ctx = canvas.getContext('2d')!
    
    // 创建临时canvas
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height)
    const tempCtx = tempCanvas.getContext('2d')!
    tempCtx.putImageData(imageData, 0, 0)
    
    // 应用翻转变换
    ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1)
    ctx.drawImage(
      tempCanvas,
      horizontal ? -imageData.width : 0,
      vertical ? -imageData.height : 0
    )
    
    return ctx.getImageData(0, 0, imageData.width, imageData.height)
  }

  /**
   * 处理Worker消息
   */
  self.onmessage = function(event: MessageEvent<WorkerMessage>) {
    const { id, type, data } = event.data
    
    try {
      let result: ImageData
      
      switch (type) {
        case WorkerMessageType.CROP_IMAGE:
          result = cropImage(data.imageData, data.params)
          break
          
        case WorkerMessageType.RESIZE_IMAGE:
          result = resizeImage(data.imageData, data.params)
          break
          
        case WorkerMessageType.APPLY_FILTER:
          result = applyFilter(data.imageData, data.params)
          break
          
        case WorkerMessageType.ROTATE_IMAGE:
          result = rotateImage(data.imageData, data.params)
          break
          
        case WorkerMessageType.FLIP_IMAGE:
          result = flipImage(data.imageData, data.params)
          break
          
        default:
          throw new Error(`Unknown operation: ${type}`)
      }
      
      // 发送结果
      self.postMessage({
        id,
        type: WorkerMessageType.RESULT,
        data: result
      })
      
    } catch (error) {
      // 发送错误
      self.postMessage({
        id,
        type: WorkerMessageType.ERROR,
        data: {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        }
      })
    }
  }
}

// 主线程代码
export class ImageWorkerManager {
  private worker?: Worker
  private pendingTasks: Map<string, {
    resolve: (result: any) => void
    reject: (error: Error) => void
  }> = new Map()

  /**
   * 初始化Worker
   */
  async initWorker(): Promise<void> {
    if (this.worker) return

    try {
      // 创建Worker（使用内联代码）
      const workerCode = this.getWorkerCode()
      const blob = new Blob([workerCode], { type: 'application/javascript' })
      const workerUrl = URL.createObjectURL(blob)
      
      this.worker = new Worker(workerUrl)
      this.worker.onmessage = this.handleWorkerMessage.bind(this)
      this.worker.onerror = this.handleWorkerError.bind(this)
      
      // 清理URL
      URL.revokeObjectURL(workerUrl)
    } catch (error) {
      throw new Error(`Failed to initialize worker: ${error}`)
    }
  }

  /**
   * 在Worker中裁剪图片
   */
  async cropImage(imageData: ImageData, params: CropParams): Promise<ImageData> {
    return this.executeTask(WorkerMessageType.CROP_IMAGE, { imageData, params })
  }

  /**
   * 在Worker中调整图片大小
   */
  async resizeImage(imageData: ImageData, params: ResizeParams): Promise<ImageData> {
    return this.executeTask(WorkerMessageType.RESIZE_IMAGE, { imageData, params })
  }

  /**
   * 在Worker中应用滤镜
   */
  async applyFilter(imageData: ImageData, params: FilterParams): Promise<ImageData> {
    return this.executeTask(WorkerMessageType.APPLY_FILTER, { imageData, params })
  }

  /**
   * 在Worker中旋转图片
   */
  async rotateImage(imageData: ImageData, params: RotateParams): Promise<ImageData> {
    return this.executeTask(WorkerMessageType.ROTATE_IMAGE, { imageData, params })
  }

  /**
   * 在Worker中翻转图片
   */
  async flipImage(imageData: ImageData, params: FlipParams): Promise<ImageData> {
    return this.executeTask(WorkerMessageType.FLIP_IMAGE, { imageData, params })
  }

  /**
   * 检查Worker支持
   */
  static isSupported(): boolean {
    return typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined'
  }

  /**
   * 销毁Worker
   */
  destroy(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = undefined
    }
    
    // 拒绝所有待处理的任务
    this.pendingTasks.forEach(({ reject }) => {
      reject(new Error('Worker destroyed'))
    })
    this.pendingTasks.clear()
  }

  /**
   * 执行Worker任务
   */
  private async executeTask(type: WorkerMessageType, data: any): Promise<any> {
    if (!this.worker) {
      await this.initWorker()
    }

    const id = this.generateTaskId()
    
    return new Promise((resolve, reject) => {
      this.pendingTasks.set(id, { resolve, reject })
      
      this.worker!.postMessage({
        id,
        type,
        data
      })
      
      // 设置超时
      setTimeout(() => {
        if (this.pendingTasks.has(id)) {
          this.pendingTasks.delete(id)
          reject(new Error('Worker task timeout'))
        }
      }, 30000) // 30秒超时
    })
  }

  /**
   * 处理Worker消息
   */
  private handleWorkerMessage(event: MessageEvent<WorkerMessage>): void {
    const { id, type, data } = event.data
    const task = this.pendingTasks.get(id)
    
    if (!task) return

    this.pendingTasks.delete(id)

    if (type === WorkerMessageType.RESULT) {
      task.resolve(data)
    } else if (type === WorkerMessageType.ERROR) {
      task.reject(new Error(data.message))
    }
  }

  /**
   * 处理Worker错误
   */
  private handleWorkerError(error: ErrorEvent): void {
    console.error('Worker error:', error)
    
    // 拒绝所有待处理的任务
    this.pendingTasks.forEach(({ reject }) => {
      reject(new Error(`Worker error: ${error.message}`))
    })
    this.pendingTasks.clear()
  }

  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取Worker代码
   */
  private getWorkerCode(): string {
    // 返回Worker代码字符串
    // 这里简化处理，实际应用中可能需要更复杂的代码注入
    return `
      // Worker代码会在这里注入
      // 实际实现中需要将上面的Worker代码转换为字符串
    `
  }
}
