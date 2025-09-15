/**
 * 导入导出管理器
 * 
 * 负责管理各种格式的导入导出功能
 */

import { EventEmitter } from 'events'
import type {
  ImportExportManager as IImportExportManager,
  FormatParser,
  FormatGenerator,
  FormatConverter,
  ImportOptions,
  ExportOptions,
  ConvertOptions,
  ImportResult,
  ExportResult,
  FormatInfo,
  SupportedFormat,
  ImportExportConfig,
  BatchOperationOptions,
  BatchImportResult,
  BatchExportResult,
  ImportExportEvents
} from './types'

/**
 * 导入导出管理器实现
 */
export class ImportExportManager extends EventEmitter implements IImportExportManager {
  private parsers: Map<SupportedFormat, FormatParser> = new Map()
  private generators: Map<SupportedFormat, FormatGenerator> = new Map()
  private converters: Map<string, FormatConverter> = new Map()
  private config: ImportExportConfig
  private isInitialized: boolean = false

  constructor(config: ImportExportConfig) {
    super()
    this.config = {
      defaultImportOptions: {
        merge: false,
        preserveIds: false,
        validate: true,
        errorHandling: 'lenient'
      },
      defaultExportOptions: {
        scope: 'all',
        includeMetadata: true,
        compress: false
      },
      maxFileSize: 50 * 1024 * 1024, // 50MB
      enabledFormats: ['json', 'visio', 'drawio', 'bpmn', 'png', 'svg', 'pdf'],
      enableBatchOperations: true,
      cache: {
        enabled: true,
        maxSize: 100,
        ttl: 30 * 60 * 1000 // 30分钟
      },
      ...config
    }
  }

  /**
   * 初始化管理器
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      // 注册内置解析器和生成器
      await this.registerBuiltinParsersAndGenerators()
      
      this.isInitialized = true
      console.log('导入导出管理器初始化完成')
    } catch (error) {
      console.error('导入导出管理器初始化失败:', error)
      throw error
    }
  }

  /**
   * 注册格式解析器
   */
  registerParser(parser: FormatParser): void {
    for (const format of parser.supportedFormats) {
      if (this.config.enabledFormats.includes(format)) {
        this.parsers.set(format, parser)
        console.log(`已注册解析器: ${parser.name} (${format})`)
      }
    }
  }

  /**
   * 注册格式生成器
   */
  registerGenerator(generator: FormatGenerator): void {
    for (const format of generator.supportedFormats) {
      if (this.config.enabledFormats.includes(format)) {
        this.generators.set(format, generator)
        console.log(`已注册生成器: ${generator.name} (${format})`)
      }
    }
  }

  /**
   * 注册格式转换器
   */
  registerConverter(converter: FormatConverter): void {
    const key = `${converter.sourceFormat}->${converter.targetFormat}`
    this.converters.set(key, converter)
    console.log(`已注册转换器: ${converter.name} (${key})`)
  }

  /**
   * 导入数据
   */
  async import(data: string | ArrayBuffer | File, options?: ImportOptions): Promise<ImportResult> {
    const startTime = Date.now()
    
    try {
      // 检查文件大小
      const size = this.getDataSize(data)
      if (size > this.config.maxFileSize) {
        throw new Error(`文件大小超过限制: ${size} > ${this.config.maxFileSize}`)
      }

      // 合并选项
      const mergedOptions: ImportOptions = {
        ...this.config.defaultImportOptions,
        ...options
      }

      // 检测格式
      let format = mergedOptions.format
      if (!format) {
        format = await this.detectFormat(data)
        if (!format) {
          throw new Error('无法检测文件格式')
        }
      }

      // 触发导入开始事件
      this.emit('import:start', mergedOptions)

      // 获取解析器
      const parser = this.parsers.get(format)
      if (!parser) {
        throw new Error(`不支持的导入格式: ${format}`)
      }

      // 验证格式
      if (mergedOptions.validate) {
        const isValid = await parser.validate(this.normalizeData(data))
        if (!isValid) {
          throw new Error(`文件格式验证失败: ${format}`)
        }
      }

      // 解析数据
      this.emit('import:progress', 50)
      const parsedData = await parser.parse(this.normalizeData(data), mergedOptions)

      // 应用映射规则
      const mappedData = this.applyImportMappingRules(parsedData, mergedOptions.mappingRules || [])

      // 应用过滤器
      const filteredData = this.applyImportFilters(mappedData, mergedOptions.filters || [])

      // 生成统计信息
      const stats = this.generateImportStats(filteredData, startTime)

      this.emit('import:progress', 100)

      const result: ImportResult = {
        success: true,
        data: filteredData,
        stats,
        errors: [],
        warnings: [],
        timestamp: Date.now()
      }

      // 触发导入完成事件
      this.emit('import:complete', result)

      return result
    } catch (error) {
      const result: ImportResult = {
        success: false,
        stats: {
          totalNodes: 0,
          importedNodes: 0,
          totalEdges: 0,
          importedEdges: 0,
          skippedItems: 0,
          processingTime: Date.now() - startTime
        },
        errors: [{
          code: 'IMPORT_ERROR',
          message: error.message,
          details: error
        }],
        warnings: [],
        timestamp: Date.now()
      }

      this.emit('import:error', result.errors[0])
      return result
    }
  }

  /**
   * 导出数据
   */
  async export(data: any, options: ExportOptions): Promise<ExportResult> {
    const startTime = Date.now()
    
    try {
      // 合并选项
      const mergedOptions: ExportOptions = {
        ...this.config.defaultExportOptions,
        ...options
      }

      // 触发导出开始事件
      this.emit('export:start', mergedOptions)

      // 获取生成器
      const generator = this.generators.get(mergedOptions.format)
      if (!generator) {
        throw new Error(`不支持的导出格式: ${mergedOptions.format}`)
      }

      // 验证输入数据
      const isValid = await generator.validateInput(data)
      if (!isValid) {
        throw new Error('输入数据验证失败')
      }

      // 应用过滤器
      this.emit('export:progress', 25)
      const filteredData = this.applyExportFilters(data, mergedOptions.filters || [])

      // 应用映射规则
      this.emit('export:progress', 50)
      const mappedData = this.applyExportMappingRules(filteredData, mergedOptions.mappingRules || [])

      // 生成数据
      this.emit('export:progress', 75)
      const generatedData = await generator.generate(mappedData, mergedOptions)

      // 生成统计信息
      const stats = this.generateExportStats(data, generatedData, startTime)

      this.emit('export:progress', 100)

      const result: ExportResult = {
        success: true,
        data: generatedData,
        filename: this.generateFilename(mergedOptions.format),
        size: this.getGeneratedDataSize(generatedData),
        stats,
        errors: [],
        warnings: [],
        timestamp: Date.now()
      }

      // 触发导出完成事件
      this.emit('export:complete', result)

      return result
    } catch (error) {
      const result: ExportResult = {
        success: false,
        stats: {
          exportedNodes: 0,
          exportedEdges: 0,
          outputSize: 0,
          processingTime: Date.now() - startTime
        },
        errors: [{
          code: 'EXPORT_ERROR',
          message: error.message,
          details: error
        }],
        warnings: [],
        timestamp: Date.now()
      }

      this.emit('export:error', result.errors[0])
      return result
    }
  }

  /**
   * 转换格式
   */
  async convert(
    data: any,
    sourceFormat: SupportedFormat,
    targetFormat: SupportedFormat,
    options?: ConvertOptions
  ): Promise<any> {
    try {
      // 触发转换开始事件
      this.emit('convert:start', sourceFormat, targetFormat)

      // 查找直接转换器
      const directKey = `${sourceFormat}->${targetFormat}`
      const directConverter = this.converters.get(directKey)
      
      if (directConverter) {
        const result = await directConverter.convert(data, options)
        this.emit('convert:complete', result)
        return result
      }

      // 通过中间格式转换
      const intermediateResult = await this.convertViaIntermediate(data, sourceFormat, targetFormat, options)
      this.emit('convert:complete', intermediateResult)
      return intermediateResult
    } catch (error) {
      this.emit('convert:error', error)
      throw error
    }
  }

  /**
   * 获取支持的格式
   */
  getSupportedFormats(): FormatInfo[] {
    const formats: FormatInfo[] = []
    
    for (const format of this.config.enabledFormats) {
      const hasParser = this.parsers.has(format)
      const hasGenerator = this.generators.has(format)
      
      if (hasParser || hasGenerator) {
        formats.push(this.getFormatInfo(format, hasParser, hasGenerator))
      }
    }
    
    return formats
  }

  /**
   * 检测文件格式
   */
  async detectFormat(data: string | ArrayBuffer | File): Promise<SupportedFormat | null> {
    // 如果是File对象，先检查扩展名
    if (data instanceof File) {
      const extension = this.getFileExtension(data.name)
      const formatByExtension = this.getFormatByExtension(extension)
      if (formatByExtension) {
        return formatByExtension
      }
    }

    // 尝试各个解析器检测格式
    const normalizedData = this.normalizeData(data)
    
    for (const [format, parser] of this.parsers.entries()) {
      try {
        const formatInfo = await parser.getFormatInfo(normalizedData)
        if (formatInfo.format === format) {
          return format
        }
      } catch (error) {
        // 继续尝试下一个解析器
      }
    }

    return null
  }

  /**
   * 验证文件格式
   */
  async validateFormat(data: string | ArrayBuffer | File, format: SupportedFormat): Promise<boolean> {
    const parser = this.parsers.get(format)
    if (!parser) {
      return false
    }

    try {
      return await parser.validate(this.normalizeData(data))
    } catch (error) {
      return false
    }
  }

  /**
   * 批量导入
   */
  async batchImport(
    files: (string | ArrayBuffer | File)[],
    options?: ImportOptions,
    batchOptions?: BatchOperationOptions
  ): Promise<BatchImportResult> {
    if (!this.config.enableBatchOperations) {
      throw new Error('批量操作已禁用')
    }

    const startTime = Date.now()
    const results: ImportResult[] = []
    const concurrency = batchOptions?.concurrency || 3
    
    this.emit('batch:start', files.length)

    try {
      // 分批处理文件
      for (let i = 0; i < files.length; i += concurrency) {
        const batch = files.slice(i, i + concurrency)
        const batchPromises = batch.map(async (file, index) => {
          try {
            const result = await this.import(file, options)
            
            if (batchOptions?.onProgress) {
              batchOptions.onProgress({
                total: files.length,
                completed: i + index + 1,
                successful: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length,
                percentage: ((i + index + 1) / files.length) * 100
              })
            }
            
            return result
          } catch (error) {
            if (batchOptions?.onError) {
              batchOptions.onError(error, i + index)
            }
            
            if (batchOptions?.stopOnError) {
              throw error
            }
            
            return {
              success: false,
              stats: { totalNodes: 0, importedNodes: 0, totalEdges: 0, importedEdges: 0, skippedItems: 0, processingTime: 0 },
              errors: [{ code: 'BATCH_ERROR', message: error.message }],
              warnings: [],
              timestamp: Date.now()
            } as ImportResult
          }
        })

        const batchResults = await Promise.all(batchPromises)
        results.push(...batchResults)
      }

      // 生成总体统计
      const totalStats = this.aggregateImportStats(results)
      
      const batchResult: BatchImportResult = {
        success: results.every(r => r.success),
        results,
        totalStats,
        totalTime: Date.now() - startTime
      }

      this.emit('batch:complete', batchResult)
      return batchResult
    } catch (error) {
      this.emit('batch:error', error)
      throw error
    }
  }

  /**
   * 批量导出
   */
  async batchExport(
    dataList: any[],
    options: ExportOptions,
    batchOptions?: BatchOperationOptions
  ): Promise<BatchExportResult> {
    if (!this.config.enableBatchOperations) {
      throw new Error('批量操作已禁用')
    }

    const startTime = Date.now()
    const results: ExportResult[] = []
    const concurrency = batchOptions?.concurrency || 3
    
    this.emit('batch:start', dataList.length)

    try {
      // 分批处理数据
      for (let i = 0; i < dataList.length; i += concurrency) {
        const batch = dataList.slice(i, i + concurrency)
        const batchPromises = batch.map(async (data, index) => {
          try {
            const result = await this.export(data, options)
            
            if (batchOptions?.onProgress) {
              batchOptions.onProgress({
                total: dataList.length,
                completed: i + index + 1,
                successful: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length,
                percentage: ((i + index + 1) / dataList.length) * 100
              })
            }
            
            return result
          } catch (error) {
            if (batchOptions?.onError) {
              batchOptions.onError(error, i + index)
            }
            
            if (batchOptions?.stopOnError) {
              throw error
            }
            
            return {
              success: false,
              stats: { exportedNodes: 0, exportedEdges: 0, outputSize: 0, processingTime: 0 },
              errors: [{ code: 'BATCH_ERROR', message: error.message }],
              warnings: [],
              timestamp: Date.now()
            } as ExportResult
          }
        })

        const batchResults = await Promise.all(batchPromises)
        results.push(...batchResults)
      }

      // 生成总体统计
      const totalStats = this.aggregateExportStats(results)
      
      const batchResult: BatchExportResult = {
        success: results.every(r => r.success),
        results,
        totalStats,
        totalTime: Date.now() - startTime
      }

      this.emit('batch:complete', batchResult)
      return batchResult
    } catch (error) {
      this.emit('batch:error', error)
      throw error
    }
  }

  /**
   * 注册内置解析器和生成器
   */
  private async registerBuiltinParsersAndGenerators(): Promise<void> {
    // 这里会注册各种格式的解析器和生成器
    // 由于篇幅限制，具体实现将在单独的文件中
    console.log('注册内置解析器和生成器...')
  }

  /**
   * 标准化数据格式
   */
  private normalizeData(data: string | ArrayBuffer | File): string | ArrayBuffer {
    if (data instanceof File) {
      // 对于File对象，需要读取内容
      // 这里返回一个占位符，实际实现中需要异步读取
      return ''
    }
    return data
  }

  /**
   * 获取数据大小
   */
  private getDataSize(data: string | ArrayBuffer | File): number {
    if (data instanceof File) {
      return data.size
    }
    if (data instanceof ArrayBuffer) {
      return data.byteLength
    }
    return new Blob([data]).size
  }

  /**
   * 获取生成数据大小
   */
  private getGeneratedDataSize(data: string | Blob | ArrayBuffer): number {
    if (data instanceof Blob) {
      return data.size
    }
    if (data instanceof ArrayBuffer) {
      return data.byteLength
    }
    return new Blob([data]).size
  }

  /**
   * 应用导入映射规则
   */
  private applyImportMappingRules(data: any, rules: any[]): any {
    // 实现映射规则应用逻辑
    return data
  }

  /**
   * 应用导出映射规则
   */
  private applyExportMappingRules(data: any, rules: any[]): any {
    // 实现映射规则应用逻辑
    return data
  }

  /**
   * 应用导入过滤器
   */
  private applyImportFilters(data: any, filters: any[]): any {
    // 实现过滤器应用逻辑
    return data
  }

  /**
   * 应用导出过滤器
   */
  private applyExportFilters(data: any, filters: any[]): any {
    // 实现过滤器应用逻辑
    return data
  }

  /**
   * 生成导入统计
   */
  private generateImportStats(data: any, startTime: number): any {
    return {
      totalNodes: 0,
      importedNodes: 0,
      totalEdges: 0,
      importedEdges: 0,
      skippedItems: 0,
      processingTime: Date.now() - startTime
    }
  }

  /**
   * 生成导出统计
   */
  private generateExportStats(inputData: any, outputData: any, startTime: number): any {
    return {
      exportedNodes: 0,
      exportedEdges: 0,
      outputSize: this.getGeneratedDataSize(outputData),
      processingTime: Date.now() - startTime
    }
  }

  /**
   * 聚合导入统计
   */
  private aggregateImportStats(results: ImportResult[]): any {
    return results.reduce((total, result) => ({
      totalNodes: total.totalNodes + result.stats.totalNodes,
      importedNodes: total.importedNodes + result.stats.importedNodes,
      totalEdges: total.totalEdges + result.stats.totalEdges,
      importedEdges: total.importedEdges + result.stats.importedEdges,
      skippedItems: total.skippedItems + result.stats.skippedItems,
      processingTime: total.processingTime + result.stats.processingTime
    }), { totalNodes: 0, importedNodes: 0, totalEdges: 0, importedEdges: 0, skippedItems: 0, processingTime: 0 })
  }

  /**
   * 聚合导出统计
   */
  private aggregateExportStats(results: ExportResult[]): any {
    return results.reduce((total, result) => ({
      exportedNodes: total.exportedNodes + result.stats.exportedNodes,
      exportedEdges: total.exportedEdges + result.stats.exportedEdges,
      outputSize: total.outputSize + result.stats.outputSize,
      processingTime: total.processingTime + result.stats.processingTime
    }), { exportedNodes: 0, exportedEdges: 0, outputSize: 0, processingTime: 0 })
  }

  /**
   * 通过中间格式转换
   */
  private async convertViaIntermediate(
    data: any,
    sourceFormat: SupportedFormat,
    targetFormat: SupportedFormat,
    options?: ConvertOptions
  ): Promise<any> {
    // 使用JSON作为中间格式
    const intermediateFormat: SupportedFormat = 'json'
    
    // 源格式 -> JSON
    const toJsonKey = `${sourceFormat}->${intermediateFormat}`
    const toJsonConverter = this.converters.get(toJsonKey)
    if (!toJsonConverter) {
      throw new Error(`无法找到从 ${sourceFormat} 到 ${intermediateFormat} 的转换器`)
    }
    
    const jsonData = await toJsonConverter.convert(data, options)
    
    // JSON -> 目标格式
    const fromJsonKey = `${intermediateFormat}->${targetFormat}`
    const fromJsonConverter = this.converters.get(fromJsonKey)
    if (!fromJsonConverter) {
      throw new Error(`无法找到从 ${intermediateFormat} 到 ${targetFormat} 的转换器`)
    }
    
    return await fromJsonConverter.convert(jsonData, options)
  }

  /**
   * 获取格式信息
   */
  private getFormatInfo(format: SupportedFormat, supportsImport: boolean, supportsExport: boolean): FormatInfo {
    const formatInfoMap: Record<SupportedFormat, Omit<FormatInfo, 'supportsImport' | 'supportsExport'>> = {
      json: {
        format: 'json',
        name: 'LogicFlow JSON',
        extensions: ['.json'],
        mimeTypes: ['application/json'],
        description: 'LogicFlow原生JSON格式'
      },
      visio: {
        format: 'visio',
        name: 'Microsoft Visio',
        extensions: ['.vsdx', '.vsd'],
        mimeTypes: ['application/vnd.visio'],
        description: 'Microsoft Visio流程图格式'
      },
      drawio: {
        format: 'drawio',
        name: 'Draw.io',
        extensions: ['.drawio', '.xml'],
        mimeTypes: ['application/xml', 'text/xml'],
        description: 'Draw.io流程图格式'
      },
      bpmn: {
        format: 'bpmn',
        name: 'BPMN 2.0',
        extensions: ['.bpmn', '.xml'],
        mimeTypes: ['application/xml', 'text/xml'],
        description: 'BPMN 2.0业务流程建模格式'
      },
      png: {
        format: 'png',
        name: 'PNG图片',
        extensions: ['.png'],
        mimeTypes: ['image/png'],
        description: 'PNG位图格式'
      },
      svg: {
        format: 'svg',
        name: 'SVG矢量图',
        extensions: ['.svg'],
        mimeTypes: ['image/svg+xml'],
        description: 'SVG矢量图格式'
      },
      pdf: {
        format: 'pdf',
        name: 'PDF文档',
        extensions: ['.pdf'],
        mimeTypes: ['application/pdf'],
        description: 'PDF文档格式'
      },
      xml: {
        format: 'xml',
        name: 'XML文档',
        extensions: ['.xml'],
        mimeTypes: ['application/xml', 'text/xml'],
        description: '通用XML格式'
      },
      csv: {
        format: 'csv',
        name: 'CSV数据',
        extensions: ['.csv'],
        mimeTypes: ['text/csv'],
        description: 'CSV数据格式'
      },
      excel: {
        format: 'excel',
        name: 'Excel表格',
        extensions: ['.xlsx', '.xls'],
        mimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        description: 'Excel表格格式'
      }
    }

    return {
      ...formatInfoMap[format],
      supportsImport,
      supportsExport
    }
  }

  /**
   * 获取文件扩展名
   */
  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.')
    return lastDotIndex >= 0 ? filename.substring(lastDotIndex) : ''
  }

  /**
   * 根据扩展名获取格式
   */
  private getFormatByExtension(extension: string): SupportedFormat | null {
    const extensionMap: Record<string, SupportedFormat> = {
      '.json': 'json',
      '.vsdx': 'visio',
      '.vsd': 'visio',
      '.drawio': 'drawio',
      '.bpmn': 'bpmn',
      '.xml': 'xml',
      '.png': 'png',
      '.svg': 'svg',
      '.pdf': 'pdf',
      '.csv': 'csv',
      '.xlsx': 'excel',
      '.xls': 'excel'
    }

    return extensionMap[extension.toLowerCase()] || null
  }

  /**
   * 生成文件名
   */
  private generateFilename(format: SupportedFormat): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const extension = this.getFormatInfo(format, false, true).extensions[0]
    return `flowchart-${timestamp}${extension}`
  }
}
