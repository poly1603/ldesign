/**
 * 导入导出模块入口
 */

// 核心类型
export type {
  SupportedFormat,
  FormatInfo,
  ImportOptions,
  ExportOptions,
  ImportResult,
  ExportResult,
  ImportStats,
  ExportStats,
  ImportError,
  ExportError,
  ImportWarning,
  ExportWarning,
  MappingRule,
  ImportFilter,
  ExportFilter,
  FormatParser,
  FormatGenerator,
  FormatConverter,
  ConvertOptions,
  ConversionQuality,
  ImportExportManager as IImportExportManager,
  BatchOperationOptions,
  BatchProgress,
  BatchImportResult,
  BatchExportResult,
  ImportExportConfig,
  ImportExportEvents,
  ImageExportOptions
} from './types'

// 核心管理器
export { ImportExportManager } from './ImportExportManager'

// 解析器和生成器
export { JsonParser, JsonGenerator } from './parsers/JsonParser'
export { DrawioParser, DrawioGenerator } from './parsers/DrawioParser'
export { BpmnParser, BpmnGenerator } from './parsers/BpmnParser'

// 插件
export { ImportExportPlugin } from '../plugins/builtin/ImportExportPlugin'
export type { ImportExportPluginConfig, CustomButtonConfig } from '../plugins/builtin/ImportExportPlugin'

// 工具函数
export const ImportExportUtils = {
  /**
   * 检测文件格式
   */
  detectFormatByExtension(filename: string): SupportedFormat | null {
    const extension = filename.toLowerCase().split('.').pop()
    
    const extensionMap: Record<string, SupportedFormat> = {
      'json': 'json',
      'vsdx': 'visio',
      'vsd': 'visio',
      'drawio': 'drawio',
      'bpmn': 'bpmn',
      'xml': 'xml',
      'png': 'png',
      'svg': 'svg',
      'pdf': 'pdf',
      'csv': 'csv',
      'xlsx': 'excel',
      'xls': 'excel'
    }

    return extension ? (extensionMap[extension] || null) : null
  },

  /**
   * 验证文件大小
   */
  validateFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize
  },

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  /**
   * 生成唯一文件名
   */
  generateUniqueFilename(baseName: string, extension: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    return `${baseName}-${timestamp}.${extension}`
  },

  /**
   * 验证LogicFlow数据结构
   */
  validateLogicFlowData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false
    }

    // 检查必需的字段
    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      return false
    }

    // 验证节点结构
    for (const node of data.nodes) {
      if (!node || typeof node.id !== 'string' || typeof node.type !== 'string') {
        return false
      }
      if (typeof node.x !== 'number' || typeof node.y !== 'number') {
        return false
      }
    }

    // 验证边结构
    for (const edge of data.edges) {
      if (!edge || typeof edge.id !== 'string' || typeof edge.type !== 'string') {
        return false
      }
      if (typeof edge.sourceNodeId !== 'string' || typeof edge.targetNodeId !== 'string') {
        return false
      }
    }

    return true
  },

  /**
   * 清理数据
   */
  cleanData(data: any): any {
    if (!data) return data

    const cleaned = { ...data }

    // 清理节点
    if (Array.isArray(cleaned.nodes)) {
      cleaned.nodes = cleaned.nodes.map((node: any) => {
        const cleanNode = { ...node }
        
        // 移除空值属性
        Object.keys(cleanNode).forEach(key => {
          if (cleanNode[key] === null || cleanNode[key] === undefined) {
            delete cleanNode[key]
          }
        })
        
        return cleanNode
      })
    }

    // 清理边
    if (Array.isArray(cleaned.edges)) {
      cleaned.edges = cleaned.edges.map((edge: any) => {
        const cleanEdge = { ...edge }
        
        // 移除空值属性
        Object.keys(cleanEdge).forEach(key => {
          if (cleanEdge[key] === null || cleanEdge[key] === undefined) {
            delete cleanEdge[key]
          }
        })
        
        return cleanEdge
      })
    }

    return cleaned
  },

  /**
   * 深度克隆对象
   */
  deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T
    }

    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item)) as unknown as T
    }

    if (typeof obj === 'object') {
      const cloned = {} as T
      Object.keys(obj).forEach(key => {
        (cloned as any)[key] = this.deepClone((obj as any)[key])
      })
      return cloned
    }

    return obj
  },

  /**
   * 合并配置对象
   */
  mergeConfig<T extends Record<string, any>>(defaultConfig: T, userConfig: Partial<T>): T {
    const merged = { ...defaultConfig }

    Object.keys(userConfig).forEach(key => {
      const userValue = userConfig[key]
      const defaultValue = defaultConfig[key]

      if (userValue !== undefined) {
        if (typeof userValue === 'object' && typeof defaultValue === 'object' && 
            !Array.isArray(userValue) && !Array.isArray(defaultValue)) {
          merged[key] = this.mergeConfig(defaultValue, userValue)
        } else {
          merged[key] = userValue
        }
      }
    })

    return merged
  },

  /**
   * 创建错误对象
   */
  createError(code: string, message: string, details?: any): ImportError | ExportError {
    return {
      code,
      message,
      details
    }
  },

  /**
   * 创建警告对象
   */
  createWarning(code: string, message: string, location?: string): ImportWarning | ExportWarning {
    return {
      code,
      message,
      location
    }
  },

  /**
   * 计算数据统计
   */
  calculateStats(data: any): { nodeCount: number; edgeCount: number } {
    return {
      nodeCount: Array.isArray(data.nodes) ? data.nodes.length : 0,
      edgeCount: Array.isArray(data.edges) ? data.edges.length : 0
    }
  },

  /**
   * 验证映射规则
   */
  validateMappingRule(rule: MappingRule): boolean {
    return !!(
      rule &&
      typeof rule.id === 'string' &&
      typeof rule.sourcePath === 'string' &&
      typeof rule.targetPath === 'string'
    )
  },

  /**
   * 应用映射规则
   */
  applyMappingRules(data: any, rules: MappingRule[]): any {
    if (!rules || rules.length === 0) {
      return data
    }

    let result = this.deepClone(data)

    rules.forEach(rule => {
      if (this.validateMappingRule(rule)) {
        try {
          const sourceValue = this.getValueByPath(result, rule.sourcePath)
          let targetValue = sourceValue

          // 应用转换函数
          if (rule.transform && typeof rule.transform === 'function') {
            targetValue = rule.transform(sourceValue)
          }

          // 设置目标值
          this.setValueByPath(result, rule.targetPath, targetValue)
        } catch (error) {
          console.warn(`映射规则应用失败: ${rule.id}`, error)
        }
      }
    })

    return result
  },

  /**
   * 根据路径获取值
   */
  getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  },

  /**
   * 根据路径设置值
   */
  setValueByPath(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    const lastKey = keys.pop()
    
    if (!lastKey) return

    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {}
      }
      return current[key]
    }, obj)

    target[lastKey] = value
  },

  /**
   * 创建默认导入选项
   */
  createDefaultImportOptions(): ImportOptions {
    return {
      format: 'json',
      merge: false,
      preserveIds: false,
      validate: true,
      errorHandling: 'lenient'
    }
  },

  /**
   * 创建默认导出选项
   */
  createDefaultExportOptions(format: SupportedFormat): ExportOptions {
    return {
      format,
      scope: 'all',
      includeMetadata: true,
      compress: false
    }
  }
}

// 导入导出类型
import type { 
  ImportError, 
  ExportError, 
  ImportWarning, 
  ExportWarning, 
  MappingRule,
  SupportedFormat
} from './types'

// 常量
export const SUPPORTED_FORMATS: SupportedFormat[] = [
  'json',
  'visio',
  'drawio',
  'bpmn',
  'png',
  'svg',
  'pdf',
  'xml',
  'csv',
  'excel'
]

export const DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export const MIME_TYPES: Record<SupportedFormat, string[]> = {
  json: ['application/json'],
  visio: ['application/vnd.visio'],
  drawio: ['application/xml', 'text/xml'],
  bpmn: ['application/xml', 'text/xml'],
  png: ['image/png'],
  svg: ['image/svg+xml'],
  pdf: ['application/pdf'],
  xml: ['application/xml', 'text/xml'],
  csv: ['text/csv'],
  excel: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
}

export const FILE_EXTENSIONS: Record<SupportedFormat, string[]> = {
  json: ['.json'],
  visio: ['.vsdx', '.vsd'],
  drawio: ['.drawio', '.xml'],
  bpmn: ['.bpmn', '.xml'],
  png: ['.png'],
  svg: ['.svg'],
  pdf: ['.pdf'],
  xml: ['.xml'],
  csv: ['.csv'],
  excel: ['.xlsx', '.xls']
}
