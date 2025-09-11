/**
 * 数据流处理器
 * 
 * 提供数据流的处理、转换、过滤等功能
 */

import type { DataPoint, DataSeries } from '../core/types'
import { EventEmitter } from '../events/EventManager'

/**
 * 数据流配置接口
 */
export interface DataStreamConfig {
  /** 批处理大小 */
  batchSize?: number
  /** 处理间隔（毫秒） */
  processInterval?: number
  /** 是否启用数据验证 */
  enableValidation?: boolean
  /** 是否启用数据转换 */
  enableTransformation?: boolean
  /** 最大队列大小 */
  maxQueueSize?: number
}

/**
 * 数据转换函数类型
 */
export type DataTransformer = (data: DataPoint) => DataPoint | null

/**
 * 数据过滤函数类型
 */
export type DataFilter = (data: DataPoint) => boolean

/**
 * 数据验证函数类型
 */
export type DataValidator = (data: DataPoint) => boolean

/**
 * 数据流处理器
 */
export class DataStreamProcessor extends EventEmitter {
  private _config: Required<DataStreamConfig>
  private _dataQueue: DataPoint[] = []
  private _transformers: DataTransformer[] = []
  private _filters: DataFilter[] = []
  private _validators: DataValidator[] = []
  private _processTimer: number | null = null
  private _isProcessing = false
  private _processedCount = 0
  private _errorCount = 0

  constructor(config: DataStreamConfig = {}) {
    super()
    
    this._config = {
      batchSize: config.batchSize ?? 100,
      processInterval: config.processInterval ?? 100,
      enableValidation: config.enableValidation ?? true,
      enableTransformation: config.enableTransformation ?? true,
      maxQueueSize: config.maxQueueSize ?? 10000
    }
  }

  /**
   * 启动数据流处理
   */
  start(): void {
    if (this._processTimer) return

    this._processTimer = (typeof window !== 'undefined' ? window.setInterval : setInterval)(() => {
      this._processBatch()
    }, this._config.processInterval)

    this.emit('started')
  }

  /**
   * 停止数据流处理
   */
  stop(): void {
    if (this._processTimer) {
      (typeof window !== 'undefined' ? window.clearInterval : clearInterval)(this._processTimer)
      this._processTimer = null
    }

    this.emit('stopped')
  }

  /**
   * 添加数据到队列
   * @param data - 数据点
   */
  addData(data: DataPoint): void {
    // 检查队列大小
    if (this._dataQueue.length >= this._config.maxQueueSize) {
      this._dataQueue.shift() // 移除最旧的数据
      this.emit('queueOverflow', data)
    }

    this._dataQueue.push(data)
    this.emit('dataAdded', data)
  }

  /**
   * 批量添加数据到队列
   * @param dataArray - 数据点数组
   */
  addDataBatch(dataArray: DataPoint[]): void {
    for (const data of dataArray) {
      this.addData(data)
    }
  }

  /**
   * 添加数据转换器
   * @param transformer - 转换函数
   */
  addTransformer(transformer: DataTransformer): void {
    this._transformers.push(transformer)
  }

  /**
   * 添加数据过滤器
   * @param filter - 过滤函数
   */
  addFilter(filter: DataFilter): void {
    this._filters.push(filter)
  }

  /**
   * 添加数据验证器
   * @param validator - 验证函数
   */
  addValidator(validator: DataValidator): void {
    this._validators.push(validator)
  }

  /**
   * 清空队列
   */
  clearQueue(): void {
    this._dataQueue = []
    this.emit('queueCleared')
  }

  /**
   * 获取队列大小
   * @returns 队列大小
   */
  getQueueSize(): number {
    return this._dataQueue.length
  }

  /**
   * 获取处理统计
   * @returns 处理统计
   */
  getStats(): {
    queueSize: number
    processedCount: number
    errorCount: number
    isProcessing: boolean
  } {
    return {
      queueSize: this._dataQueue.length,
      processedCount: this._processedCount,
      errorCount: this._errorCount,
      isProcessing: this._isProcessing
    }
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this._processedCount = 0
    this._errorCount = 0
  }

  /**
   * 处理一批数据
   */
  private _processBatch(): void {
    if (this._isProcessing || this._dataQueue.length === 0) return

    this._isProcessing = true
    const batchSize = Math.min(this._config.batchSize, this._dataQueue.length)
    const batch = this._dataQueue.splice(0, batchSize)

    try {
      const processedBatch = this._processDataBatch(batch)
      this._processedCount += processedBatch.length
      
      if (processedBatch.length > 0) {
        this.emit('batchProcessed', processedBatch)
      }
    } catch (error) {
      this._errorCount++
      this.emit('processingError', error)
    } finally {
      this._isProcessing = false
    }
  }

  /**
   * 处理数据批次
   * @param batch - 数据批次
   * @returns 处理后的数据
   */
  private _processDataBatch(batch: DataPoint[]): DataPoint[] {
    const processedData: DataPoint[] = []

    for (const dataPoint of batch) {
      try {
        let processedPoint = dataPoint

        // 数据验证
        if (this._config.enableValidation && !this._validateData(processedPoint)) {
          this.emit('validationError', processedPoint)
          continue
        }

        // 数据转换
        if (this._config.enableTransformation) {
          processedPoint = this._transformData(processedPoint)
          if (!processedPoint) continue // 转换器返回 null 表示丢弃数据
        }

        // 数据过滤
        if (!this._filterData(processedPoint)) {
          continue
        }

        processedData.push(processedPoint)
      } catch (error) {
        this._errorCount++
        this.emit('dataProcessingError', { data: dataPoint, error })
      }
    }

    return processedData
  }

  /**
   * 验证数据
   * @param data - 数据点
   * @returns 是否有效
   */
  private _validateData(data: DataPoint): boolean {
    for (const validator of this._validators) {
      if (!validator(data)) {
        return false
      }
    }
    return true
  }

  /**
   * 转换数据
   * @param data - 数据点
   * @returns 转换后的数据
   */
  private _transformData(data: DataPoint): DataPoint | null {
    let transformedData = data

    for (const transformer of this._transformers) {
      transformedData = transformer(transformedData)
      if (!transformedData) {
        return null // 转换器返回 null 表示丢弃数据
      }
    }

    return transformedData
  }

  /**
   * 过滤数据
   * @param data - 数据点
   * @returns 是否通过过滤
   */
  private _filterData(data: DataPoint): boolean {
    for (const filter of this._filters) {
      if (!filter(data)) {
        return false
      }
    }
    return true
  }
}

/**
 * 常用数据转换器
 */
export class DataTransformers {
  /**
   * 数值转换器
   * @param field - 字段名
   * @param converter - 转换函数
   * @returns 转换器
   */
  static numberConverter(field: string, converter: (value: any) => number): DataTransformer {
    return (data: DataPoint) => {
      if (typeof data.value === 'object' && data.value !== null) {
        (data.value as any)[field] = converter((data.value as any)[field])
      } else if (field === 'value') {
        data.value = converter(data.value)
      }
      return data
    }
  }

  /**
   * 时间戳添加器
   * @returns 转换器
   */
  static timestampAdder(): DataTransformer {
    return (data: DataPoint) => {
      if (typeof data.value === 'object' && data.value !== null) {
        (data.value as any).timestamp = Date.now()
      } else {
        data.value = {
          value: data.value,
          timestamp: Date.now()
        }
      }
      return data
    }
  }

  /**
   * 字段重命名器
   * @param oldField - 旧字段名
   * @param newField - 新字段名
   * @returns 转换器
   */
  static fieldRenamer(oldField: string, newField: string): DataTransformer {
    return (data: DataPoint) => {
      if (typeof data.value === 'object' && data.value !== null) {
        const obj = data.value as any
        if (oldField in obj) {
          obj[newField] = obj[oldField]
          delete obj[oldField]
        }
      }
      return data
    }
  }
}

/**
 * 常用数据过滤器
 */
export class DataFilters {
  /**
   * 数值范围过滤器
   * @param field - 字段名
   * @param min - 最小值
   * @param max - 最大值
   * @returns 过滤器
   */
  static numberRange(field: string, min: number, max: number): DataFilter {
    return (data: DataPoint) => {
      let value: number
      
      if (typeof data.value === 'object' && data.value !== null) {
        value = (data.value as any)[field]
      } else if (field === 'value') {
        value = data.value as number
      } else {
        return true
      }

      return typeof value === 'number' && value >= min && value <= max
    }
  }

  /**
   * 非空过滤器
   * @param field - 字段名
   * @returns 过滤器
   */
  static notNull(field: string): DataFilter {
    return (data: DataPoint) => {
      if (typeof data.value === 'object' && data.value !== null) {
        return (data.value as any)[field] != null
      } else if (field === 'value') {
        return data.value != null
      }
      return true
    }
  }

  /**
   * 时间范围过滤器
   * @param startTime - 开始时间
   * @param endTime - 结束时间
   * @returns 过滤器
   */
  static timeRange(startTime: number, endTime: number): DataFilter {
    return (data: DataPoint) => {
      let timestamp: number
      
      if (typeof data.value === 'object' && data.value !== null) {
        timestamp = (data.value as any).timestamp || Date.now()
      } else {
        timestamp = Date.now()
      }

      return timestamp >= startTime && timestamp <= endTime
    }
  }
}

/**
 * 常用数据验证器
 */
export class DataValidators {
  /**
   * 必需字段验证器
   * @param fields - 必需字段列表
   * @returns 验证器
   */
  static requiredFields(fields: string[]): DataValidator {
    return (data: DataPoint) => {
      if (typeof data.value !== 'object' || data.value === null) {
        return fields.length === 0 || fields.includes('value')
      }

      const obj = data.value as any
      return fields.every(field => field in obj && obj[field] != null)
    }
  }

  /**
   * 数据类型验证器
   * @param field - 字段名
   * @param type - 期望类型
   * @returns 验证器
   */
  static dataType(field: string, type: string): DataValidator {
    return (data: DataPoint) => {
      let value: any
      
      if (typeof data.value === 'object' && data.value !== null) {
        value = (data.value as any)[field]
      } else if (field === 'value') {
        value = data.value
      } else {
        return true
      }

      return typeof value === type
    }
  }
}

/**
 * 创建数据流处理器
 * @param config - 配置
 * @returns 数据流处理器实例
 */
export function createDataStreamProcessor(config?: DataStreamConfig): DataStreamProcessor {
  return new DataStreamProcessor(config)
}
