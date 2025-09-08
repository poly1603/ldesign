/**
 * QRCode实例管理器
 * 提供高级API和事件管理功能
 */

import type {
  QRCodeOptions,
  QRCodeResult,
  QRCodeError,
  PerformanceMetric,
} from '../types'
import { QRCodeGenerator } from './generator'
import { createError } from '../utils'

/**
 * 事件监听器类型
 */
type EventListener = (...args: any[]) => void

/**
 * 支持的事件类型
 */
interface QRCodeEvents {
  generated: (result: QRCodeResult) => void
  error: (error: QRCodeError) => void
  optionsChanged: (options: QRCodeOptions) => void
}

/**
 * QRCode实例接口
 */
export interface QRCodeInstance {
  // 生成方法
  generate(text?: string, options?: Partial<QRCodeOptions>): Promise<QRCodeResult>
  
  // 选项管理
  updateOptions(options: Partial<QRCodeOptions>): void
  getOptions(): QRCodeOptions
  
  // 事件管理
  on<K extends keyof QRCodeEvents>(event: K, listener: QRCodeEvents[K]): void
  off<K extends keyof QRCodeEvents>(event: K, listener: QRCodeEvents[K]): void
  emit<K extends keyof QRCodeEvents>(event: K, ...args: Parameters<QRCodeEvents[K]>): void
  
  // 缓存管理
  clearCache(): void
  
  // 性能监控
  getMetrics(): PerformanceMetric[]
  
  // 资源清理
  destroy(): void
}

/**
 * QRCode实例实现类
 */
export class QRCodeInstanceImpl implements QRCodeInstance {
  private generator: QRCodeGenerator
  private eventListeners: Map<string, EventListener[]> = new Map()
  private destroyed = false

  constructor(options: QRCodeOptions) {
    this.generator = new QRCodeGenerator(options)
  }

  /**
   * 生成二维码
   */
  async generate(text?: string, options?: Partial<QRCodeOptions>): Promise<QRCodeResult> {
    if (this.destroyed) {
      throw createError('Instance has been destroyed', 'INSTANCE_DESTROYED')
    }

    try {
      // 如果提供了选项，临时更新
      if (options) {
        this.generator.updateOptions(options)
      }

      const result = await this.generator.generate(text || this.generator.getOptions().data)
      
      // 触发生成成功事件
      this.emit('generated', result)
      
      return result
    } catch (error) {
      const qrError = error as QRCodeError
      
      // 触发错误事件
      this.emit('error', qrError)
      
      throw qrError
    }
  }

  /**
   * 更新选项
   */
  updateOptions(options: Partial<QRCodeOptions>): void {
    if (this.destroyed) {
      throw createError('Instance has been destroyed', 'INSTANCE_DESTROYED')
    }

    this.generator.updateOptions(options)
    this.emit('optionsChanged', this.generator.getOptions())
  }

  /**
   * 获取当前选项
   */
  getOptions(): QRCodeOptions {
    return this.generator.getOptions()
  }

  /**
   * 添加事件监听器
   */
  on<K extends keyof QRCodeEvents>(event: K, listener: QRCodeEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener as EventListener)
  }

  /**
   * 移除事件监听器
   */
  off<K extends keyof QRCodeEvents>(event: K, listener: QRCodeEvents[K]): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener as EventListener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   */
  emit<K extends keyof QRCodeEvents>(event: K, ...args: Parameters<QRCodeEvents[K]>): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args)
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    if (this.destroyed) {
      return
    }
    this.generator.clearCache()
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetric[] {
    return this.generator.getPerformanceMetrics()
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    if (this.destroyed) {
      return
    }

    this.destroyed = true
    this.eventListeners.clear()
    this.generator.destroy()
  }
}

/**
 * 创建QRCode实例
 */
export function createQRCodeInstance(options: QRCodeOptions): QRCodeInstance {
  return new QRCodeInstanceImpl(options)
}
