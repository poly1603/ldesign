/**
 * @file 高级功能模块统一导出
 * @description 导出所有高级功能相关的类和接口
 */

// 导入所有管理器
import { HistoryManager } from './history-manager'
import { BatchProcessor } from './batch-processor'

// 导出所有管理器
export { HistoryManager } from './history-manager'
export type {
  HistoryItem,
  HistoryState
} from './history-manager'

export { BatchProcessor } from './batch-processor'
export type {
  BatchTask,
  BatchConfig,
  BatchProgress,
  BatchResult
} from './batch-processor'

/**
 * 高级功能系统集成类
 */
export class AdvancedSystem {
  /** 历史管理器 */
  public readonly history: HistoryManager

  /** 批量处理器 */
  public readonly batch: BatchProcessor

  /**
   * 构造函数
   * @param options 初始化选项
   */
  constructor(options: {
    history?: { maxHistorySize?: number }
    batch?: any
  } = {}) {
    this.history = new HistoryManager(options.history?.maxHistorySize)
    this.batch = new BatchProcessor(options.batch)

    // 设置系统间的联动
    this.setupInteractions()
  }

  /**
   * 设置系统间的交互
   */
  private setupInteractions(): void {
    // 批量处理完成后添加到历史记录
    this.batch.on('processingCompleted', (result) => {
      this.history.addHistory(
        'batch_process',
        `批量处理 ${result.successful.length} 个图片`,
        result,
        null // 批量操作通常不支持撤销
      )
    })

    // 历史操作时暂停批量处理
    this.history.on('beforeUndo', () => {
      if (this.batch.getProgress().percentage > 0) {
        this.batch.stopProcessing()
      }
    })
  }

  /**
   * 获取系统状态
   */
  getSystemStatus(): {
    history: HistoryState
    batch: BatchProgress
  } {
    return {
      history: this.history.getState(),
      batch: this.batch.getProgress()
    }
  }

  /**
   * 销毁高级功能系统
   */
  destroy(): void {
    this.history.destroy()
    this.batch.destroy()
  }
}
