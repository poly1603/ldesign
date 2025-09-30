/**
 * 扫描器相关类型定义
 */

import type { DeviceType, TemplateIndex, TemplateMetadata } from '../types/template'

/**
 * 扫描器配置选项
 */
export interface ScannerOptions {
  /** 模板目录路径 */
  templatesDir: string
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 是否启用热更新 */
  enableHMR?: boolean
  /** 扫描深度限制 */
  maxDepth?: number
  /** 包含的文件扩展名 */
  includeExtensions?: string[]
  /** 排除的目录或文件模式 */
  excludePatterns?: string[]
  /** 是否启用监听模式 */
  watchMode?: boolean
  /** 防抖延迟（毫秒） */
  debounceDelay?: number
  /** 批处理大小 */
  batchSize?: number
}

/**
 * 扫描结果
 */
export interface ScanResult {
  /** 扫描到的模板索引 */
  templates: TemplateIndex
  /** 扫描统计信息 */
  stats: ScanStats
  /** 扫描错误列表 */
  errors: ScanError[]
}

/**
 * 扫描统计信息
 */
export interface ScanStats {
  /** 总模板数量 */
  totalTemplates: number
  /** 按分类统计 */
  byCategory: Record<string, number>
  /** 按设备类型统计 */
  byDevice: Record<DeviceType, number>
  /** 扫描耗时（毫秒） */
  scanTime: number
  /** 最后扫描时间 */
  lastScanTime: number
}

/**
 * 扫描错误
 */
export interface ScanError {
  /** 错误类型 */
  type: 'CONFIG_PARSE_ERROR' | 'FILE_NOT_FOUND' | 'INVALID_STRUCTURE' | 'VALIDATION_ERROR' | 'SCAN_ERROR'
  /** 错误消息 */
  message: string
  /** 文件路径 */
  filePath: string
  /** 错误详情 */
  details?: any
}

/**
 * 文件变更事件
 */
export interface ScannerFileChangeEvent {
  /** 变更类型 */
  type: 'added' | 'changed' | 'removed'
  /** 文件路径 */
  path: string
  /** 变更时间 */
  timestamp: number
}

/**
 * 扫描器事件回调
 */
export interface ScannerEventCallbacks {
  /** 扫描开始回调 */
  onScanStart?: () => void
  /** 扫描完成回调 */
  onScanComplete?: (result: ScanResult) => void
  /** 扫描错误回调 */
  onScanError?: (error: ScanError) => void
  /** 文件变更回调 */
  onFileChange?: (event: ScannerFileChangeEvent) => void
  /** 模板更新回调 */
  onTemplateUpdate?: (template: TemplateMetadata) => void
}

/**
 * 兼容性别名
 */
export type ScannerCallbacks = ScannerEventCallbacks
