/**
 * 构建报告生成器
 * 
 * 生成详细的构建报告，包括性能分析、文件大小、依赖关系等
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import path from 'path'
import fs from 'fs-extra'
import { formatBytes, formatDuration } from './performance-utils'
import { Logger } from './logger'

/**
 * 构建报告数据
 */
export interface BuildReportData {
  /** 构建时间戳 */
  timestamp: number
  /** 构建持续时间 (ms) */
  duration: number
  /** 构建状态 */
  status: 'success' | 'failed' | 'warning'
  /** 输出文件 */
  outputs: Array<{
    file: string
    size: number
    gzipSize?: number
    type: string
  }>
  /** 性能指标 */
  performance?: {
    phases: Array<{
      name: string
      duration: number
      percentage: number
    }>
    bottlenecks?: string[]
  }
  /** 内存使用 */
  memory?: {
    peak: number
    average: number
    final: number
  }
  /** 警告和错误 */
  issues?: Array<{
    type: 'error' | 'warning'
    message: string
    file?: string
    line?: number
  }>
  /** 依赖信息 */
  dependencies?: {
    total: number
    production: number
    development: number
  }
  /** 代码质量 */
  quality?: {
    score: number
    issues: number
  }
}

/**
 * 报告格式
 */
export type ReportFormat = 'json' | 'html' | 'markdown' | 'text'

/**
 * 报告选项
 */
export interface BuildReportOptions {
  /** 输出目录 */
  outputDir?: string
  /** 报告格式 */
  formats?: ReportFormat[]
  /** 是否包含详细信息 */
  detailed?: boolean
  /** 是否打开报告 */
  open?: boolean
}

/**
 * 构建报告生成器
 */
export class BuildReportGenerator {
  private logger: Logger
  private outputDir: string

  constructor(options: BuildReportOptions = {}) {
    this.logger = new Logger({ prefix: 'BuildReport' })
    this.outputDir = options.outputDir || path.join(process.cwd(), 'build-reports')
  }

  /**
   * 生成报告
   */
  async generate(
    data: BuildReportData,
    options: BuildReportOptions = {}
  ): Promise<string[]> {
    const formats = options.formats || ['json', 'html']
    const generatedFiles: string[] = []

    await fs.mkdir(this.outputDir, { recursive: true })

    for (const format of formats) {
      const filePath = await this.generateFormat(data, format, options)
      generatedFiles.push(filePath)
    }

    this.logger.info(`构建报告已生成: ${generatedFiles.join(', ')}`)
    return generatedFiles
  }

  /**
   * 生成指定格式的报告
   */
  private async generateFormat(
    data: BuildReportData,
    format: ReportFormat,
    options: BuildReportOptions
  ): Promise<string> {
    const timestamp = new Date(data.timestamp).toISOString().replace(/[:.]/g, '-')
    const fileName = `build-report-${timestamp}.${format}`
    const filePath = path.join(this.outputDir, fileName)

    let content: string

    switch (format) {
      case 'json':
        content = this.generateJSON(data, options)
        break
      case 'html':
        content = this.generateHTML(data, options)
        break
      case 'markdown':
        content = this.generateMarkdown(data, options)
        break
      case 'text':
        content = this.generateText(data, options)
        break
      default:
        throw new Error(`不支持的报告格式: ${format}`)
    }

    await fs.writeFile(filePath, content, 'utf-8')
    return filePath
  }

  /**
   * 生成 JSON 格式报告
   */
  private generateJSON(data: BuildReportData, options: BuildReportOptions): string {
    return JSON.stringify(data, null, options.detailed ? 2 : 0)
  }

  /**
   * 生成 HTML 格式报告
   */
  private generateHTML(data: BuildReportData, options: BuildReportOptions): string {
    const statusColor = data.status === 'success' ? '#4caf50' : data.status === 'failed' ? '#f44336' : '#ff9800'
    const totalSize = data.outputs.reduce((sum, o) => sum + o.size, 0)

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>构建报告 - ${new Date(data.timestamp).toLocaleString()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px 8px 0 0; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .status { display: inline-block; padding: 6px 12px; background: ${statusColor}; border-radius: 4px; font-weight: bold; }
    .section { padding: 20px 30px; border-bottom: 1px solid #eee; }
    .section:last-child { border-bottom: none; }
    .section h2 { font-size: 20px; margin-bottom: 15px; color: #333; }
    .metric { display: inline-block; margin-right: 30px; margin-bottom: 10px; }
    .metric-label { font-size: 12px; color: #666; text-transform: uppercase; }
    .metric-value { font-size: 24px; font-weight: bold; color: #333; }
    .file-list { list-style: none; }
    .file-item { padding: 10px; margin: 5px 0; background: #f9f9f9; border-radius: 4px; display: flex; justify-content: space-between; }
    .file-name { font-family: monospace; color: #667eea; }
    .file-size { color: #666; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f5f5f5; font-weight: 600; }
    .progress-bar { height: 20px; background: #e0e0e0; border-radius: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); transition: width 0.3s; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 构建报告</h1>
      <p>${new Date(data.timestamp).toLocaleString()}</p>
      <p class="status">${data.status.toUpperCase()}</p>
    </div>
    
    <div class="section">
      <h2>📊 构建概览</h2>
      <div class="metric">
        <div class="metric-label">构建时间</div>
        <div class="metric-value">${formatDuration(data.duration)}</div>
      </div>
      <div class="metric">
        <div class="metric-label">输出文件</div>
        <div class="metric-value">${data.outputs.length}</div>
      </div>
      <div class="metric">
        <div class="metric-label">总大小</div>
        <div class="metric-value">${formatBytes(totalSize)}</div>
      </div>
      ${data.memory ? `
      <div class="metric">
        <div class="metric-label">峰值内存</div>
        <div class="metric-value">${formatBytes(data.memory.peak)}</div>
      </div>
      ` : ''}
    </div>

    <div class="section">
      <h2>📦 输出文件</h2>
      <ul class="file-list">
        ${data.outputs.map(output => `
          <li class="file-item">
            <span class="file-name">${output.file}</span>
            <span class="file-size">${formatBytes(output.size)}${output.gzipSize ? ` (gzip: ${formatBytes(output.gzipSize)})` : ''}</span>
          </li>
        `).join('')}
      </ul>
    </div>

    ${data.performance ? `
    <div class="section">
      <h2>⚡ 性能分析</h2>
      <table>
        <thead>
          <tr>
            <th>阶段</th>
            <th>耗时</th>
            <th>占比</th>
            <th>进度</th>
          </tr>
        </thead>
        <tbody>
          ${data.performance.phases.map(phase => `
            <tr>
              <td>${phase.name}</td>
              <td>${formatDuration(phase.duration)}</td>
              <td>${phase.percentage.toFixed(1)}%</td>
              <td>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${phase.percentage}%"></div>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    ${data.issues && data.issues.length > 0 ? `
    <div class="section">
      <h2>⚠️ 问题 (${data.issues.length})</h2>
      <ul class="file-list">
        ${data.issues.map(issue => `
          <li class="file-item">
            <span>${issue.type === 'error' ? '❌' : '⚠️'} ${issue.message}</span>
            ${issue.file ? `<span class="file-name">${issue.file}${issue.line ? `:${issue.line}` : ''}</span>` : ''}
          </li>
        `).join('')}
      </ul>
    </div>
    ` : ''}
  </div>
</body>
</html>`
  }

  /**
   * 生成 Markdown 格式报告
   */
  private generateMarkdown(data: BuildReportData, _options: BuildReportOptions): string {
    const totalSize = data.outputs.reduce((sum, o) => sum + o.size, 0)
    
    let md = `# 构建报告\n\n`
    md += `**时间**: ${new Date(data.timestamp).toLocaleString()}\n`
    md += `**状态**: ${data.status}\n`
    md += `**耗时**: ${formatDuration(data.duration)}\n\n`
    
    md += `## 构建概览\n\n`
    md += `- 输出文件: ${data.outputs.length}\n`
    md += `- 总大小: ${formatBytes(totalSize)}\n`
    if (data.memory) {
      md += `- 峰值内存: ${formatBytes(data.memory.peak)}\n`
    }
    md += `\n`
    
    md += `## 输出文件\n\n`
    md += `| 文件 | 大小 | Gzip |\n`
    md += `|------|------|------|\n`
    data.outputs.forEach(output => {
      md += `| ${output.file} | ${formatBytes(output.size)} | ${output.gzipSize ? formatBytes(output.gzipSize) : '-'} |\n`
    })
    
    return md
  }

  /**
   * 生成纯文本格式报告
   */
  private generateText(data: BuildReportData, _options: BuildReportOptions): string {
    const totalSize = data.outputs.reduce((sum, o) => sum + o.size, 0)
    
    let text = `构建报告\n${'='.repeat(50)}\n\n`
    text += `时间: ${new Date(data.timestamp).toLocaleString()}\n`
    text += `状态: ${data.status}\n`
    text += `耗时: ${formatDuration(data.duration)}\n\n`
    
    text += `输出文件 (${data.outputs.length}):\n`
    data.outputs.forEach(output => {
      text += `  - ${output.file}: ${formatBytes(output.size)}\n`
    })
    text += `\n总大小: ${formatBytes(totalSize)}\n`
    
    return text
  }
}

/**
 * 创建构建报告生成器
 */
export function createBuildReportGenerator(
  options?: BuildReportOptions
): BuildReportGenerator {
  return new BuildReportGenerator(options)
}

