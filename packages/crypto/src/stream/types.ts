/**
 * Stream Encryption Types
 * 流式加密类型定义
 */

import type { EncryptionAlgorithm } from '../types'

/**
 * 流式加密选项
 */
export interface StreamEncryptionOptions {
  /**
   * 加密算法
   */
  algorithm: EncryptionAlgorithm

  /**
   * 密钥
   */
  key: string

  /**
   * 算法特定选项
   */
  options?: Record<string, unknown>

  /**
   * 分块大小（字节，默认 64KB）
   */
  chunkSize?: number

  /**
   * 进度回调
   */
  onProgress?: (progress: StreamProgress) => void

  /**
   * 是否自动关闭输出流
   */
  autoClose?: boolean
}

/**
 * 流式解密选项
 */
export interface StreamDecryptionOptions {
  /**
   * 解密算法
   */
  algorithm: EncryptionAlgorithm

  /**
   * 密钥
   */
  key: string

  /**
   * 算法特定选项
   */
  options?: Record<string, unknown>

  /**
   * 分块大小（字节，默认 64KB）
   */
  chunkSize?: number

  /**
   * 进度回调
   */
  onProgress?: (progress: StreamProgress) => void

  /**
   * 是否自动关闭输出流
   */
  autoClose?: boolean
}

/**
 * 流处理进度信息
 */
export interface StreamProgress {
  /**
   * 已处理字节数
   */
  processedBytes: number

  /**
   * 总字节数（如果已知）
   */
  totalBytes?: number

  /**
   * 进度百分比（0-100）
   */
  percentage?: number

  /**
   * 处理速度（字节/秒）
   */
  speed?: number

  /**
   * 预计剩余时间（毫秒）
   */
  estimatedTimeRemaining?: number

  /**
   * 已用时间（毫秒）
   */
  elapsedTime: number

  /**
   * 当前状态
   */
  status: 'processing' | 'completed' | 'error' | 'cancelled'

  /**
   * 错误信息
   */
  error?: string
}

/**
 * 流式加密结果
 */
export interface StreamEncryptionResult {
  /**
   * 是否成功
   */
  success: boolean

  /**
   * 算法名称
   */
  algorithm: string

  /**
   * 处理的总字节数
   */
  bytesProcessed: number

  /**
   * 耗时（毫秒）
   */
  duration: number

  /**
   * 平均速度（字节/秒）
   */
  averageSpeed: number

  /**
   * 错误信息
   */
  error?: string

  /**
   * 元数据
   */
  metadata?: Record<string, unknown>
}

/**
 * 流式解密结果
 */
export interface StreamDecryptionResult {
  /**
   * 是否成功
   */
  success: boolean

  /**
   * 算法名称
   */
  algorithm: string

  /**
   * 处理的总字节数
   */
  bytesProcessed: number

  /**
   * 耗时（毫秒）
   */
  duration: number

  /**
   * 平均速度（字节/秒）
   */
  averageSpeed: number

  /**
   * 错误信息
   */
  error?: string

  /**
   * 元数据
   */
  metadata?: Record<string, unknown>
}

/**
 * 文件加密选项
 */
export interface FileEncryptionOptions extends StreamEncryptionOptions {
  /**
   * 输入文件路径
   */
  inputPath: string

  /**
   * 输出文件路径
   */
  outputPath: string

  /**
   * 是否覆盖已存在的文件
   */
  overwrite?: boolean
}

/**
 * 文件解密选项
 */
export interface FileDecryptionOptions extends StreamDecryptionOptions {
  /**
   * 输入文件路径
   */
  inputPath: string

  /**
   * 输出文件路径
   */
  outputPath: string

  /**
   * 是否覆盖已存在的文件
   */
  overwrite?: boolean
}

/**
 * 流式处理器接口
 */
export interface IStreamProcessor {
  /**
   * 处理数据块
   */
  processChunk: (chunk: Uint8Array) => Promise<Uint8Array>

  /**
   * 完成处理
   */
  finalize: () => Promise<Uint8Array | null>

  /**
   * 重置处理器
   */
  reset: () => void

  /**
   * 获取统计信息
   */
  getStats: () => {
    bytesProcessed: number
    chunksProcessed: number
    errors: number
  }
}

/**
 * 流式加密处理器接口
 */
export interface IStreamEncryptor extends IStreamProcessor {
  /**
   * 算法名称
   */
  readonly algorithm: string

  /**
   * 加密选项
   */
  readonly options: Record<string, unknown>
}

/**
 * 流式解密处理器接口
 */
export interface IStreamDecryptor extends IStreamProcessor {
  /**
   * 算法名称
   */
  readonly algorithm: string

  /**
   * 解密选项
   */
  readonly options: Record<string, unknown>
}
