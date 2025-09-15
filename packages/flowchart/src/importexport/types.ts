/**
 * 导入导出模块类型定义
 */

/**
 * 支持的文件格式
 */
export type SupportedFormat = 
  | 'json'           // LogicFlow原生JSON格式
  | 'visio'          // Microsoft Visio格式
  | 'drawio'         // Draw.io格式
  | 'bpmn'           // BPMN 2.0格式
  | 'png'            // PNG图片格式
  | 'svg'            // SVG矢量图格式
  | 'pdf'            // PDF文档格式
  | 'xml'            // 通用XML格式
  | 'csv'            // CSV数据格式
  | 'excel'          // Excel表格格式

/**
 * 文件格式信息
 */
export interface FormatInfo {
  /** 格式标识 */
  format: SupportedFormat
  /** 格式名称 */
  name: string
  /** 文件扩展名 */
  extensions: string[]
  /** MIME类型 */
  mimeTypes: string[]
  /** 是否支持导入 */
  supportsImport: boolean
  /** 是否支持导出 */
  supportsExport: boolean
  /** 格式描述 */
  description: string
  /** 格式版本 */
  version?: string
}

/**
 * 导入选项
 */
export interface ImportOptions {
  /** 目标格式 */
  format: SupportedFormat
  /** 是否合并到当前流程图 */
  merge?: boolean
  /** 导入时的坐标偏移 */
  offset?: { x: number; y: number }
  /** 是否保留原始ID */
  preserveIds?: boolean
  /** 是否验证数据 */
  validate?: boolean
  /** 自定义映射规则 */
  mappingRules?: MappingRule[]
  /** 导入过滤器 */
  filters?: ImportFilter[]
  /** 错误处理策略 */
  errorHandling?: 'strict' | 'lenient' | 'skip'
}

/**
 * 导出选项
 */
export interface ExportOptions {
  /** 目标格式 */
  format: SupportedFormat
  /** 导出范围 */
  scope?: 'all' | 'selected' | 'visible'
  /** 图片导出选项 */
  imageOptions?: ImageExportOptions
  /** 是否包含元数据 */
  includeMetadata?: boolean
  /** 是否压缩输出 */
  compress?: boolean
  /** 自定义映射规则 */
  mappingRules?: MappingRule[]
  /** 导出过滤器 */
  filters?: ExportFilter[]
  /** 格式特定选项 */
  formatOptions?: Record<string, any>
}

/**
 * 图片导出选项
 */
export interface ImageExportOptions {
  /** 图片宽度 */
  width?: number
  /** 图片高度 */
  height?: number
  /** 图片质量 (0-1) */
  quality?: number
  /** 背景颜色 */
  backgroundColor?: string
  /** 是否包含背景 */
  includeBackground?: boolean
  /** DPI设置 */
  dpi?: number
  /** 缩放比例 */
  scale?: number
  /** 边距 */
  padding?: number
}

/**
 * 映射规则
 */
export interface MappingRule {
  /** 规则ID */
  id: string
  /** 规则名称 */
  name: string
  /** 源字段路径 */
  sourcePath: string
  /** 目标字段路径 */
  targetPath: string
  /** 转换函数 */
  transform?: (value: any) => any
  /** 是否必需 */
  required?: boolean
  /** 默认值 */
  defaultValue?: any
}

/**
 * 导入过滤器
 */
export interface ImportFilter {
  /** 过滤器类型 */
  type: 'node' | 'edge' | 'property'
  /** 过滤条件 */
  condition: (item: any) => boolean
  /** 过滤器名称 */
  name?: string
}

/**
 * 导出过滤器
 */
export interface ExportFilter {
  /** 过滤器类型 */
  type: 'node' | 'edge' | 'property'
  /** 过滤条件 */
  condition: (item: any) => boolean
  /** 过滤器名称 */
  name?: string
}

/**
 * 导入结果
 */
export interface ImportResult {
  /** 是否成功 */
  success: boolean
  /** 导入的数据 */
  data?: any
  /** 导入统计 */
  stats: ImportStats
  /** 错误信息 */
  errors: ImportError[]
  /** 警告信息 */
  warnings: ImportWarning[]
  /** 导入时间 */
  timestamp: number
}

/**
 * 导出结果
 */
export interface ExportResult {
  /** 是否成功 */
  success: boolean
  /** 导出的数据 */
  data?: string | Blob | ArrayBuffer
  /** 文件名 */
  filename?: string
  /** 文件大小 */
  size?: number
  /** 导出统计 */
  stats: ExportStats
  /** 错误信息 */
  errors: ExportError[]
  /** 警告信息 */
  warnings: ExportWarning[]
  /** 导出时间 */
  timestamp: number
}

/**
 * 导入统计
 */
export interface ImportStats {
  /** 总节点数 */
  totalNodes: number
  /** 成功导入的节点数 */
  importedNodes: number
  /** 总连线数 */
  totalEdges: number
  /** 成功导入的连线数 */
  importedEdges: number
  /** 跳过的项目数 */
  skippedItems: number
  /** 处理时间(ms) */
  processingTime: number
}

/**
 * 导出统计
 */
export interface ExportStats {
  /** 导出的节点数 */
  exportedNodes: number
  /** 导出的连线数 */
  exportedEdges: number
  /** 输出大小(字节) */
  outputSize: number
  /** 处理时间(ms) */
  processingTime: number
}

/**
 * 导入错误
 */
export interface ImportError {
  /** 错误代码 */
  code: string
  /** 错误消息 */
  message: string
  /** 错误位置 */
  location?: string
  /** 错误详情 */
  details?: any
}

/**
 * 导出错误
 */
export interface ExportError {
  /** 错误代码 */
  code: string
  /** 错误消息 */
  message: string
  /** 错误位置 */
  location?: string
  /** 错误详情 */
  details?: any
}

/**
 * 导入警告
 */
export interface ImportWarning {
  /** 警告代码 */
  code: string
  /** 警告消息 */
  message: string
  /** 警告位置 */
  location?: string
}

/**
 * 导出警告
 */
export interface ExportWarning {
  /** 警告代码 */
  code: string
  /** 警告消息 */
  message: string
  /** 警告位置 */
  location?: string
}

/**
 * 格式解析器接口
 */
export interface FormatParser {
  /** 解析器名称 */
  name: string
  /** 支持的格式 */
  supportedFormats: SupportedFormat[]
  /** 解析数据 */
  parse(data: string | ArrayBuffer, options?: ImportOptions): Promise<any>
  /** 验证数据格式 */
  validate(data: string | ArrayBuffer): Promise<boolean>
  /** 获取格式信息 */
  getFormatInfo(data: string | ArrayBuffer): Promise<Partial<FormatInfo>>
}

/**
 * 格式生成器接口
 */
export interface FormatGenerator {
  /** 生成器名称 */
  name: string
  /** 支持的格式 */
  supportedFormats: SupportedFormat[]
  /** 生成数据 */
  generate(data: any, options?: ExportOptions): Promise<string | Blob | ArrayBuffer>
  /** 获取默认选项 */
  getDefaultOptions(): ExportOptions
  /** 验证输入数据 */
  validateInput(data: any): Promise<boolean>
}

/**
 * 格式转换器接口
 */
export interface FormatConverter {
  /** 转换器名称 */
  name: string
  /** 源格式 */
  sourceFormat: SupportedFormat
  /** 目标格式 */
  targetFormat: SupportedFormat
  /** 转换数据 */
  convert(data: any, options?: ConvertOptions): Promise<any>
  /** 获取转换质量评估 */
  getConversionQuality(): ConversionQuality
}

/**
 * 转换选项
 */
export interface ConvertOptions {
  /** 是否保留格式特定属性 */
  preserveFormatSpecific?: boolean
  /** 是否进行数据清理 */
  cleanupData?: boolean
  /** 映射规则 */
  mappingRules?: MappingRule[]
}

/**
 * 转换质量
 */
export interface ConversionQuality {
  /** 数据完整性 (0-1) */
  dataIntegrity: number
  /** 视觉保真度 (0-1) */
  visualFidelity: number
  /** 功能兼容性 (0-1) */
  functionalCompatibility: number
  /** 总体质量 (0-1) */
  overallQuality: number
}

/**
 * 导入导出管理器接口
 */
export interface ImportExportManager {
  /** 注册格式解析器 */
  registerParser(parser: FormatParser): void
  /** 注册格式生成器 */
  registerGenerator(generator: FormatGenerator): void
  /** 注册格式转换器 */
  registerConverter(converter: FormatConverter): void
  
  /** 导入数据 */
  import(data: string | ArrayBuffer | File, options?: ImportOptions): Promise<ImportResult>
  /** 导出数据 */
  export(data: any, options: ExportOptions): Promise<ExportResult>
  /** 转换格式 */
  convert(data: any, sourceFormat: SupportedFormat, targetFormat: SupportedFormat, options?: ConvertOptions): Promise<any>
  
  /** 获取支持的格式 */
  getSupportedFormats(): FormatInfo[]
  /** 检测文件格式 */
  detectFormat(data: string | ArrayBuffer | File): Promise<SupportedFormat | null>
  /** 验证文件格式 */
  validateFormat(data: string | ArrayBuffer | File, format: SupportedFormat): Promise<boolean>
}

/**
 * 批量操作选项
 */
export interface BatchOperationOptions {
  /** 并发数量 */
  concurrency?: number
  /** 是否在错误时停止 */
  stopOnError?: boolean
  /** 进度回调 */
  onProgress?: (progress: BatchProgress) => void
  /** 错误回调 */
  onError?: (error: Error, index: number) => void
}

/**
 * 批量操作进度
 */
export interface BatchProgress {
  /** 总数量 */
  total: number
  /** 已完成数量 */
  completed: number
  /** 成功数量 */
  successful: number
  /** 失败数量 */
  failed: number
  /** 进度百分比 */
  percentage: number
}

/**
 * 批量导入结果
 */
export interface BatchImportResult {
  /** 总体是否成功 */
  success: boolean
  /** 各文件导入结果 */
  results: ImportResult[]
  /** 总体统计 */
  totalStats: ImportStats
  /** 批量操作时间 */
  totalTime: number
}

/**
 * 批量导出结果
 */
export interface BatchExportResult {
  /** 总体是否成功 */
  success: boolean
  /** 各文件导出结果 */
  results: ExportResult[]
  /** 总体统计 */
  totalStats: ExportStats
  /** 批量操作时间 */
  totalTime: number
}

/**
 * 导入导出配置
 */
export interface ImportExportConfig {
  /** 默认导入选项 */
  defaultImportOptions: Partial<ImportOptions>
  /** 默认导出选项 */
  defaultExportOptions: Partial<ExportOptions>
  /** 最大文件大小(字节) */
  maxFileSize: number
  /** 支持的格式 */
  enabledFormats: SupportedFormat[]
  /** 是否启用批量操作 */
  enableBatchOperations: boolean
  /** 临时文件目录 */
  tempDirectory?: string
  /** 缓存配置 */
  cache: {
    enabled: boolean
    maxSize: number
    ttl: number
  }
}

/**
 * 导入导出事件
 */
export interface ImportExportEvents {
  'import:start': (options: ImportOptions) => void
  'import:progress': (progress: number) => void
  'import:complete': (result: ImportResult) => void
  'import:error': (error: ImportError) => void
  
  'export:start': (options: ExportOptions) => void
  'export:progress': (progress: number) => void
  'export:complete': (result: ExportResult) => void
  'export:error': (error: ExportError) => void
  
  'convert:start': (sourceFormat: SupportedFormat, targetFormat: SupportedFormat) => void
  'convert:complete': (result: any) => void
  'convert:error': (error: Error) => void
  
  'batch:start': (total: number) => void
  'batch:progress': (progress: BatchProgress) => void
  'batch:complete': (result: BatchImportResult | BatchExportResult) => void
  'batch:error': (error: Error) => void
}
