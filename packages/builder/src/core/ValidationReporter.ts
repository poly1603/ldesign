/**
 * 验证报告生成器
 * 
 * 负责生成和输出验证报告
 * 支持多种格式的报告输出
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import * as path from 'path'
import * as fs from 'fs-extra'
import type {
  IValidationReporter,
  ValidationReport,
  ValidationReportingConfig,
  ValidationResult,
  ValidationSummary
} from '../types/validation'
import { Logger } from '../utils/logger'

/**
 * 验证报告生成器实现
 */
export class ValidationReporter implements IValidationReporter {
  /** 日志记录器 */
  private logger: Logger

  /**
   * 构造函数
   */
  constructor(options: {
    logger?: Logger
  } = {}) {
    this.logger = options.logger || new Logger({ level: 'info', prefix: 'ValidationReporter' })
  }

  /**
   * 生成报告
   */
  async generateReport(
    result: ValidationResult,
    _config: ValidationReportingConfig
  ): Promise<ValidationReport> {
    this.logger.info('生成验证报告...')

    const report: ValidationReport = {
      title: `构建验证报告 - ${result.validationId}`,
      summary: this.generateSummary(result),
      details: {
        fileResults: [],
        formatResults: [],
        typeResults: [],
        styleResults: []
      },
      recommendations: this.generateRecommendations(result),
      generatedAt: Date.now(),
      version: '1.0.0'
    }

    return report
  }

  /**
   * 输出报告
   */
  async outputReport(
    report: ValidationReport,
    config: ValidationReportingConfig
  ): Promise<void> {
    this.logger.info(`输出验证报告 (格式: ${config.format})`)

    switch (config.format) {
      case 'console':
        await this.outputConsoleReport(report, config)
        break
      case 'json':
        await this.outputJsonReport(report, config)
        break
      case 'html':
        await this.outputHtmlReport(report, config)
        break
      case 'markdown':
        await this.outputMarkdownReport(report, config)
        break
      default:
        await this.outputConsoleReport(report, config)
    }
  }

  /**
   * 生成摘要
   */
  private generateSummary(result: ValidationResult): ValidationSummary {
    return {
      status: result.success ? 'passed' : 'failed',
      totalFiles: result.stats.totalFiles,
      passedFiles: result.success ? result.stats.totalFiles : 0,
      failedFiles: result.success ? 0 : result.stats.totalFiles,
      totalTests: result.testResult.totalTests,
      passedTests: result.testResult.passedTests,
      failedTests: result.testResult.failedTests,
      duration: result.duration
    }
  }

  /**
   * 生成建议
   */
  private generateRecommendations(result: ValidationResult): any[] {
    const recommendations: any[] = []

    // 如果验证失败，添加建议
    if (!result.success) {
      recommendations.push({
        type: 'error',
        title: '验证失败',
        description: '打包后的代码验证失败，请检查构建配置和测试用例',
        solution: '检查构建输出和测试日志，修复相关问题',
        priority: 'high'
      })
    }

    // 如果有错误，添加具体建议
    if (result.errors.length > 0) {
      recommendations.push({
        type: 'error',
        title: '发现错误',
        description: `发现 ${result.errors.length} 个错误`,
        solution: '查看详细错误信息并逐一修复',
        priority: 'high'
      })
    }

    // 如果有警告，添加建议
    if (result.warnings.length > 0) {
      recommendations.push({
        type: 'warning',
        title: '发现警告',
        description: `发现 ${result.warnings.length} 个警告`,
        solution: '查看警告信息并考虑优化',
        priority: 'medium'
      })
    }

    // 性能建议
    if (result.duration > 60000) {
      recommendations.push({
        type: 'optimization',
        title: '验证耗时较长',
        description: `验证耗时 ${Math.round(result.duration / 1000)}s，建议优化`,
        solution: '考虑减少测试用例数量或优化测试性能',
        priority: 'low'
      })
    }

    return recommendations
  }

  /**
   * 输出控制台报告
   */
  private async outputConsoleReport(
    report: ValidationReport,
    config: ValidationReportingConfig
  ): Promise<void> {
    const { summary } = report

    console.log('\n' + '='.repeat(50))
    console.log('验证报告')
    console.log('='.repeat(50))

    // 状态
    const statusIcon = summary.status === 'passed' ? '✅' : '❌'
    const statusText = summary.status === 'passed' ? '通过' : '失败'
    console.log(`\n${statusIcon} 状态: ${statusText}`)

    // 统计信息
    console.log(`\n📊 统计信息:`)
    console.log(`  - 文件: ${summary.passedFiles}/${summary.totalFiles}`)
    console.log(`  - 测试: ${summary.passedTests}/${summary.totalTests}`)
    console.log(`  - 耗时: ${(summary.duration / 1000).toFixed(2)}s`)

    // 建议
    if (report.recommendations.length > 0) {
      console.log(`\n💡 建议:`)
      report.recommendations.forEach((rec, index) => {
        const icon = this.getRecommendationIcon(rec.type)
        console.log(`  ${index + 1}. ${icon} ${rec.title}`)
        if (config.verbose) {
          console.log(`     说明: ${rec.description}`)
          if (rec.solution) {
            console.log(`     解决方案: ${rec.solution}`)
          }
        }
      })
    }

    console.log('='.repeat(50) + '\n')
  }

  /**
   * 输出 JSON 报告
   */
  private async outputJsonReport(
    report: ValidationReport,
    config: ValidationReportingConfig
  ): Promise<void> {
    const outputPath = config.outputPath || 'validation-report.json'
    const reportJson = JSON.stringify(report, null, 2)

    await fs.ensureDir(path.dirname(outputPath))
    await fs.writeFile(outputPath, reportJson, 'utf8')

    this.logger.success(`JSON 报告已保存到: ${outputPath}`)
  }

  /**
   * 输出 HTML 报告
   */
  private async outputHtmlReport(
    report: ValidationReport,
    config: ValidationReportingConfig
  ): Promise<void> {
    const outputPath = config.outputPath || 'validation-report.html'
    const html = this.generateHtmlReport(report)

    await fs.ensureDir(path.dirname(outputPath))
    await fs.writeFile(outputPath, html, 'utf8')

    this.logger.success(`HTML 报告已保存到: ${outputPath}`)
  }

  /**
   * 输出 Markdown 报告
   */
  private async outputMarkdownReport(
    report: ValidationReport,
    config: ValidationReportingConfig
  ): Promise<void> {
    const outputPath = config.outputPath || 'validation-report.md'
    const markdown = this.generateMarkdownReport(report)

    await fs.ensureDir(path.dirname(outputPath))
    await fs.writeFile(outputPath, markdown, 'utf8')

    this.logger.success(`Markdown 报告已保存到: ${outputPath}`)
  }

  /**
   * 生成 HTML 报告
   */
  private generateHtmlReport(report: ValidationReport): string {
    const { summary } = report
    const statusClass = summary.status === 'passed' ? 'success' : 'error'

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .status { padding: 10px 20px; border-radius: 5px; margin: 20px 0; }
        .success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #007bff; }
        .recommendations { margin-top: 30px; }
        .recommendation { margin: 10px 0; padding: 15px; border-left: 4px solid #007bff; background: #f8f9fa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${report.title}</h1>
        <p>生成时间: ${new Date(report.generatedAt).toLocaleString()}</p>
    </div>

    <div class="status ${statusClass}">
        <h2>验证状态: ${summary.status === 'passed' ? '✅ 通过' : '❌ 失败'}</h2>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">${summary.totalTests}</div>
            <div>总测试数</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${summary.passedTests}</div>
            <div>通过测试</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${summary.failedTests}</div>
            <div>失败测试</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${Math.round(summary.duration / 1000)}s</div>
            <div>验证耗时</div>
        </div>
    </div>

    ${report.recommendations.length > 0 ? `
    <div class="recommendations">
        <h2>💡 建议</h2>
        ${report.recommendations.map(rec => `
        <div class="recommendation">
            <h3>${this.getRecommendationIcon(rec.type)} ${rec.title}</h3>
            <p>${rec.description}</p>
            ${rec.solution ? `<p><strong>解决方案:</strong> ${rec.solution}</p>` : ''}
        </div>
        `).join('')}
    </div>
    ` : ''}
</body>
</html>
    `.trim()
  }

  /**
   * 生成 Markdown 报告
   */
  private generateMarkdownReport(report: ValidationReport): string {
    const { summary } = report

    return `
# ${report.title}

**生成时间:** ${new Date(report.generatedAt).toLocaleString()}

## 验证状态

${summary.status === 'passed' ? '✅ **通过**' : '❌ **失败**'}

## 统计信息

| 项目 | 数量 |
|------|------|
| 总测试数 | ${summary.totalTests} |
| 通过测试 | ${summary.passedTests} |
| 失败测试 | ${summary.failedTests} |
| 验证耗时 | ${Math.round(summary.duration / 1000)}s |

${report.recommendations.length > 0 ? `
## 💡 建议

${report.recommendations.map((rec, index) => `
### ${index + 1}. ${this.getRecommendationIcon(rec.type)} ${rec.title}

${rec.description}

${rec.solution ? `**解决方案:** ${rec.solution}` : ''}
`).join('')}
` : ''}
    `.trim()
  }

  /**
   * 获取建议图标
   */
  private getRecommendationIcon(type: string): string {
    switch (type) {
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      case 'optimization': return '⚡'
      default: return '💡'
    }
  }
}
