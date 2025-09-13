/**
 * @file Web Workers模块统一导出
 * @description 导出所有Web Workers相关的类和接口
 */

// 图片处理Worker
import { ImageWorkerManager } from './image-worker'
export { ImageWorkerManager } from './image-worker'
export type { 
  WorkerMessage,
  WorkerMessageType,
  ImageProcessParams,
  CropParams,
  ResizeParams,
  FilterParams,
  RotateParams,
  FlipParams
} from './image-worker'

/**
 * Worker管理系统
 */
export class WorkerSystem {
  /** 图片处理Worker管理器 */
  public readonly imageWorker: ImageWorkerManager

  /** 是否支持Worker */
  public readonly isSupported: boolean

  /**
   * 构造函数
   */
  constructor() {
    this.isSupported = ImageWorkerManager.isSupported()
    this.imageWorker = new ImageWorkerManager()
  }

  /**
   * 初始化Worker系统
   */
  async initialize(): Promise<void> {
    if (!this.isSupported) {
      console.warn('Web Workers are not supported in this environment')
      return
    }

    try {
      await this.imageWorker.initWorker()
    } catch (error) {
      console.error('Failed to initialize worker system:', error)
      throw error
    }
  }

  /**
   * 检查Worker支持
   */
  static isSupported(): boolean {
    return ImageWorkerManager.isSupported()
  }

  /**
   * 销毁Worker系统
   */
  destroy(): void {
    this.imageWorker.destroy()
  }
}
