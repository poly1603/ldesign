/**
 * 数据导出组件
 * 
 * 提供表格数据的导出功能
 * 支持CSV、Excel、JSON等多种格式
 */

import type { TableRow, TableColumn } from '../types'
import { EventManager } from '../managers/EventManager'

/**
 * 导出格式
 */
export type ExportFormat = 'csv' | 'excel' | 'json' | 'xml' | 'html'

/**
 * 导出配置
 */
export interface ExportConfig<T = any> {
  /** 导出格式 */
  format: ExportFormat
  /** 文件名 */
  filename?: string
  /** 是否包含表头 */
  includeHeader?: boolean
  /** 要导出的列（不指定则导出所有列） */
  columns?: string[]
  /** 数据过滤器 */
  filter?: (row: T, index: number) => boolean
  /** 数据转换器 */
  transformer?: (row: T, index: number) => any
  /** CSV分隔符 */
  csvSeparator?: string
  /** CSV编码 */
  csvEncoding?: string
  /** Excel工作表名称 */
  sheetName?: string
  /** 是否压缩输出 */
  compress?: boolean
}

/**
 * 导出进度数据
 */
export interface ExportProgress {
  /** 当前处理的行数 */
  current: number
  /** 总行数 */
  total: number
  /** 进度百分比 */
  percentage: number
  /** 当前阶段 */
  stage: 'preparing' | 'processing' | 'generating' | 'downloading'
}

/**
 * 数据导出器实现类
 */
export class DataExporter<T extends TableRow = TableRow> {
  /** 事件管理器 */
  private eventManager: EventManager

  /** 默认配置 */
  private defaultConfig: Partial<ExportConfig<T>> = {
    includeHeader: true,
    csvSeparator: ',',
    csvEncoding: 'utf-8',
    sheetName: 'Sheet1',
    compress: false
  }

  /**
   * 构造函数
   */
  constructor() {
    this.eventManager = new EventManager()
  }

  /**
   * 导出数据
   */
  async export(
    data: T[],
    columns: TableColumn<T>[],
    config: ExportConfig<T>
  ): Promise<void> {
    const finalConfig = { ...this.defaultConfig, ...config }
    
    try {
      // 触发导出开始事件
      this.eventManager.emit('export-start', { config: finalConfig })

      // 准备数据
      this.updateProgress(0, data.length, 'preparing')
      const processedData = await this.prepareData(data, columns, finalConfig)

      // 生成文件内容
      this.updateProgress(0, 1, 'generating')
      const content = await this.generateContent(processedData, columns, finalConfig)

      // 下载文件
      this.updateProgress(0, 1, 'downloading')
      await this.downloadFile(content, finalConfig)

      // 触发导出完成事件
      this.eventManager.emit('export-complete', { 
        config: finalConfig,
        rowCount: processedData.length 
      })

    } catch (error) {
      // 触发导出错误事件
      this.eventManager.emit('export-error', { 
        error: error instanceof Error ? error.message : '导出失败',
        config: finalConfig 
      })
      throw error
    }
  }

  /**
   * 准备导出数据
   * @private
   */
  private async prepareData(
    data: T[],
    columns: TableColumn<T>[],
    config: ExportConfig<T>
  ): Promise<any[]> {
    let processedData = [...data]

    // 应用过滤器
    if (config.filter) {
      processedData = processedData.filter(config.filter)
    }

    // 应用数据转换器
    if (config.transformer) {
      processedData = processedData.map(config.transformer)
    }

    // 选择要导出的列
    const exportColumns = this.getExportColumns(columns, config.columns)
    
    // 转换数据格式
    const result = processedData.map((row, index) => {
      this.updateProgress(index + 1, processedData.length, 'processing')
      
      const exportRow: any = {}
      exportColumns.forEach(column => {
        const value = row[column.key]
        exportRow[column.title || column.key] = this.formatCellValue(value, column)
      })
      return exportRow
    })

    return result
  }

  /**
   * 获取要导出的列
   * @private
   */
  private getExportColumns(
    columns: TableColumn<T>[],
    selectedColumns?: string[]
  ): TableColumn<T>[] {
    if (!selectedColumns || selectedColumns.length === 0) {
      return columns.filter(col => col.key !== 'selection' && col.key !== 'expand')
    }
    
    return columns.filter(col => selectedColumns.includes(col.key))
  }

  /**
   * 格式化单元格值
   * @private
   */
  private formatCellValue(value: any, column: TableColumn<T>): string {
    if (value === null || value === undefined) {
      return ''
    }

    // 如果列有自定义格式化函数
    if (column.formatter) {
      return column.formatter(value)
    }

    // 处理不同数据类型
    if (typeof value === 'boolean') {
      return value ? '是' : '否'
    }

    if (value instanceof Date) {
      return value.toLocaleDateString()
    }

    if (typeof value === 'object') {
      return JSON.stringify(value)
    }

    return String(value)
  }

  /**
   * 生成文件内容
   * @private
   */
  private async generateContent(
    data: any[],
    columns: TableColumn<T>[],
    config: ExportConfig<T>
  ): Promise<string | Blob> {
    switch (config.format) {
      case 'csv':
        return this.generateCSV(data, columns, config)
      case 'excel':
        return this.generateExcel(data, columns, config)
      case 'json':
        return this.generateJSON(data, config)
      case 'xml':
        return this.generateXML(data, config)
      case 'html':
        return this.generateHTML(data, columns, config)
      default:
        throw new Error(`不支持的导出格式: ${config.format}`)
    }
  }

  /**
   * 生成CSV内容
   * @private
   */
  private generateCSV(
    data: any[],
    columns: TableColumn<T>[],
    config: ExportConfig<T>
  ): string {
    const separator = config.csvSeparator || ','
    const lines: string[] = []

    // 添加表头
    if (config.includeHeader) {
      const exportColumns = this.getExportColumns(columns, config.columns)
      const headers = exportColumns.map(col => this.escapeCsvValue(col.title || col.key))
      lines.push(headers.join(separator))
    }

    // 添加数据行
    data.forEach(row => {
      const values = Object.values(row).map(value => this.escapeCsvValue(String(value)))
      lines.push(values.join(separator))
    })

    return lines.join('\n')
  }

  /**
   * 转义CSV值
   * @private
   */
  private escapeCsvValue(value: string): string {
    // 如果包含分隔符、换行符或引号，需要用引号包围
    if (value.includes(',') || value.includes('\n') || value.includes('"')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  /**
   * 生成Excel内容（简化版，实际项目中可能需要使用专门的库）
   * @private
   */
  private generateExcel(
    data: any[],
    columns: TableColumn<T>[],
    config: ExportConfig<T>
  ): Blob {
    // 这里使用简化的Excel格式（实际上是HTML表格）
    // 在实际项目中，建议使用 xlsx 或 exceljs 等专门的库
    const html = this.generateHTML(data, columns, config)
    return new Blob([html], { 
      type: 'application/vnd.ms-excel;charset=utf-8' 
    })
  }

  /**
   * 生成JSON内容
   * @private
   */
  private generateJSON(data: any[], config: ExportConfig<T>): string {
    return JSON.stringify(data, null, config.compress ? 0 : 2)
  }

  /**
   * 生成XML内容
   * @private
   */
  private generateXML(data: any[], config: ExportConfig<T>): string {
    const lines: string[] = []
    lines.push('<?xml version="1.0" encoding="UTF-8"?>')
    lines.push('<data>')

    data.forEach(row => {
      lines.push('  <row>')
      Object.entries(row).forEach(([key, value]) => {
        const escapedKey = this.escapeXmlValue(key)
        const escapedValue = this.escapeXmlValue(String(value))
        lines.push(`    <${escapedKey}>${escapedValue}</${escapedKey}>`)
      })
      lines.push('  </row>')
    })

    lines.push('</data>')
    return lines.join('\n')
  }

  /**
   * 转义XML值
   * @private
   */
  private escapeXmlValue(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  /**
   * 生成HTML内容
   * @private
   */
  private generateHTML(
    data: any[],
    columns: TableColumn<T>[],
    config: ExportConfig<T>
  ): string {
    const lines: string[] = []
    lines.push('<!DOCTYPE html>')
    lines.push('<html>')
    lines.push('<head>')
    lines.push('<meta charset="UTF-8">')
    lines.push('<title>导出数据</title>')
    lines.push('<style>')
    lines.push('table { border-collapse: collapse; width: 100%; }')
    lines.push('th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }')
    lines.push('th { background-color: #f2f2f2; }')
    lines.push('</style>')
    lines.push('</head>')
    lines.push('<body>')
    lines.push('<table>')

    // 添加表头
    if (config.includeHeader) {
      lines.push('<thead>')
      lines.push('<tr>')
      const exportColumns = this.getExportColumns(columns, config.columns)
      exportColumns.forEach(col => {
        lines.push(`<th>${this.escapeHtmlValue(col.title || col.key)}</th>`)
      })
      lines.push('</tr>')
      lines.push('</thead>')
    }

    // 添加数据行
    lines.push('<tbody>')
    data.forEach(row => {
      lines.push('<tr>')
      Object.values(row).forEach(value => {
        lines.push(`<td>${this.escapeHtmlValue(String(value))}</td>`)
      })
      lines.push('</tr>')
    })
    lines.push('</tbody>')

    lines.push('</table>')
    lines.push('</body>')
    lines.push('</html>')

    return lines.join('\n')
  }

  /**
   * 转义HTML值
   * @private
   */
  private escapeHtmlValue(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  /**
   * 下载文件
   * @private
   */
  private async downloadFile(
    content: string | Blob,
    config: ExportConfig<T>
  ): Promise<void> {
    const filename = config.filename || `export_${Date.now()}.${config.format}`
    
    let blob: Blob
    if (content instanceof Blob) {
      blob = content
    } else {
      const mimeType = this.getMimeType(config.format)
      blob = new Blob([content], { type: mimeType })
    }

    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'

    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // 清理URL对象
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  /**
   * 获取MIME类型
   * @private
   */
  private getMimeType(format: ExportFormat): string {
    const mimeTypes: Record<ExportFormat, string> = {
      csv: 'text/csv;charset=utf-8',
      excel: 'application/vnd.ms-excel;charset=utf-8',
      json: 'application/json;charset=utf-8',
      xml: 'application/xml;charset=utf-8',
      html: 'text/html;charset=utf-8'
    }
    return mimeTypes[format] || 'text/plain;charset=utf-8'
  }

  /**
   * 更新进度
   * @private
   */
  private updateProgress(
    current: number,
    total: number,
    stage: ExportProgress['stage']
  ): void {
    const progress: ExportProgress = {
      current,
      total,
      percentage: total > 0 ? Math.round((current / total) * 100) : 0,
      stage
    }
    this.eventManager.emit('export-progress', progress)
  }

  /**
   * 添加事件监听器
   */
  on(eventName: string, listener: (data: any) => void): void {
    this.eventManager.on(eventName, listener)
  }

  /**
   * 移除事件监听器
   */
  off(eventName: string, listener?: (data: any) => void): void {
    this.eventManager.off(eventName, listener)
  }

  /**
   * 销毁导出器
   */
  destroy(): void {
    this.eventManager.destroy()
  }
}
