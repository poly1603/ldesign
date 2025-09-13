/**
 * @file 批量处理系统导出
 * @description 导出批量处理相关的类、接口和工厂函数
 */

// 核心批量处理器
export { 
  BatchProcessor, 
  BatchStatus, 
  BatchOperation 
} from './batch-processor'

export type { 
  BatchItem,
  BatchOperationConfig,
  BatchProcessorConfig,
  BatchProcessorEventData
} from './batch-processor'

// 批量处理UI
export { BatchUI } from './batch-ui'
export type { BatchUIConfig } from './batch-ui'

/**
 * 批量处理管理器
 */
export class BatchManager {
  /** 批量处理器 */
  private batchProcessor: BatchProcessor

  /** 批量处理UI */
  private batchUI?: BatchUI

  /**
   * 构造函数
   */
  constructor(
    container?: HTMLElement,
    processorConfig?: Partial<any>,
    uiConfig?: Partial<any>
  ) {
    this.batchProcessor = new BatchProcessor(processorConfig)

    if (container) {
      this.batchUI = new BatchUI(container, this.batchProcessor, uiConfig)
    }
  }

  /**
   * 获取批量处理器
   */
  getProcessor(): BatchProcessor {
    return this.batchProcessor
  }

  /**
   * 获取批量处理UI
   */
  getUI(): BatchUI | undefined {
    return this.batchUI
  }

  /**
   * 添加文件
   */
  async addFiles(files: File[]): Promise<any[]> {
    return this.batchProcessor.addFiles(files)
  }

  /**
   * 设置操作
   */
  setOperations(operations: any[]): void {
    this.batchProcessor.setOperations(operations)
  }

  /**
   * 开始处理
   */
  async startProcessing(): Promise<void> {
    return this.batchProcessor.startProcessing()
  }

  /**
   * 停止处理
   */
  stopProcessing(): void {
    this.batchProcessor.stopProcessing()
  }

  /**
   * 下载全部
   */
  async downloadAll(): Promise<void> {
    return this.batchProcessor.downloadAll()
  }

  /**
   * 清空
   */
  clear(): void {
    this.batchProcessor.clear()
  }

  /**
   * 获取进度
   */
  getProgress(): { completed: number; total: number; percentage: number } {
    return this.batchProcessor.getProgress()
  }

  /**
   * 获取所有项目
   */
  getItems(): any[] {
    return this.batchProcessor.getItems()
  }

  /**
   * 添加事件监听器
   */
  on(event: string, listener: Function): void {
    this.batchProcessor.on(event, listener)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: Function): void {
    this.batchProcessor.off(event, listener)
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.batchUI?.destroy()
    this.batchProcessor.destroy()
  }
}

/**
 * 创建批量处理管理器的工厂函数
 */
export function createBatchManager(
  container?: HTMLElement,
  options: {
    processor?: Partial<any>
    ui?: Partial<any>
  } = {}
): BatchManager {
  return new BatchManager(container, options.processor, options.ui)
}

/**
 * 使用示例：
 * 
 * ```typescript
 * import { createBatchManager, BatchOperation } from '@/batch'
 * 
 * const container = document.getElementById('batch-container')
 * 
 * const batchManager = createBatchManager(container, {
 *   processor: {
 *     maxConcurrent: 5,
 *     outputFormat: 'jpeg',
 *     outputQuality: 0.9
 *   },
 *   ui: {
 *     theme: 'dark',
 *     maxPreviewItems: 100
 *   }
 * })
 * 
 * // 监听事件
 * batchManager.on('processingCompleted', (data) => {
 *   console.log('批量处理完成:', data)
 * })
 * 
 * // 添加文件
 * const files = Array.from(fileInput.files)
 * await batchManager.addFiles(files)
 * 
 * // 配置操作
 * batchManager.setOperations([
 *   {
 *     type: BatchOperation.RESIZE,
 *     enabled: true,
 *     name: '缩放',
 *     params: { width: 800, height: 600, maintainAspectRatio: true }
 *   },
 *   {
 *     type: BatchOperation.WATERMARK,
 *     enabled: true,
 *     name: '添加水印',
 *     params: { 
 *       text: '© 2024 我的水印', 
 *       position: 'bottom-right',
 *       opacity: 0.7 
 *     }
 *   }
 * ])
 * 
 * // 开始处理
 * await batchManager.startProcessing()
 * 
 * // 下载结果
 * await batchManager.downloadAll()
 * ```
 */
