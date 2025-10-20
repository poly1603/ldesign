/**
 * 性能分析报告生成器
 * 生成详细的性能分析报告，包括内存使用、性能瓶颈、优化建议等
 */

import { MemoryMonitor } from './MemoryMonitor'
import { PerformanceMonitor } from './performance'
import { StorePool } from './storePool'

/**
 * 性能报告配置
 */
export interface ReportConfig {
  includeMemory?: boolean
  includePerformance?: boolean
  includeStorePool?: boolean
  includeSuggestions?: boolean
  format?: 'json' | 'html' | 'markdown'
}

/**
 * 完整性能报告
 */
export interface PerformanceReport {
  timestamp: number
  summary: {
    health: 'good' | 'warning' | 'critical'
    score: number // 0-100
    issues: string[]
  }
  memory?: {
    current: {
      used: string
      stores: number
      caches: number
    }
    trend: 'stable' | 'growing' | 'shrinking'
    leakDetection: {
      suspected: boolean
      growthRate: number
      problematic: string[]
    }
  }
  performance?: {
    slowActions: Array<{
      name: string
      avgTime: number
      maxTime: number
    }>
    slowGetters: Array<{
      name: string
      avgTime: number
      maxTime: number
    }>
    frequentUpdates: Array<{
      name: string
      count: number
    }>
  }
  storePool?: {
    totalPools: number
    totalInstances: number
    utilization: number // 百分比
    topPools: Array<{
      className: string
      instances: number
    }>
  }
  suggestions?: string[]
  raw?: any
}

/**
 * 性能报告生成器
 */
export class PerformanceReporter {
  private static instance: PerformanceReporter
  private performanceMonitor = PerformanceMonitor.getInstance()
  private memoryMonitor = MemoryMonitor.getInstance()
  private storePool = StorePool.getInstance()

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): PerformanceReporter {
    if (!PerformanceReporter.instance) {
      PerformanceReporter.instance = new PerformanceReporter()
    }
    return PerformanceReporter.instance
  }

  /**
   * 生成性能报告
   */
  generateReport(config: ReportConfig = {}): PerformanceReport {
    const {
      includeMemory = true,
      includePerformance = true,
      includeStorePool = true,
      includeSuggestions = true,
    } = config

    const report: PerformanceReport = {
      timestamp: Date.now(),
      summary: this.generateSummary(),
    }

    if (includeMemory) {
      report.memory = this.generateMemoryReport()
    }

    if (includePerformance) {
      report.performance = this.generatePerformanceReport()
    }

    if (includeStorePool) {
      report.storePool = this.generateStorePoolReport()
    }

    if (includeSuggestions) {
      report.suggestions = this.generateSuggestions(report)
    }

    // 更新健康状态
    report.summary = this.updateHealthStatus(report)

    return report
  }

  /**
   * 生成摘要
   */
  private generateSummary(): PerformanceReport['summary'] {
    return {
      health: 'good',
      score: 100,
      issues: [],
    }
  }

  /**
   * 生成内存报告
   */
  private generateMemoryReport(): PerformanceReport['memory'] {
    const memoryReport = this.memoryMonitor.getMemoryReport()
    const current = memoryReport.current

    if (!current) {
      return {
        current: {
          used: '0MB',
          stores: 0,
          caches: 0,
        },
        trend: 'stable',
        leakDetection: {
          suspected: false,
          growthRate: 0,
          problematic: [],
        },
      }
    }

    return {
      current: {
        used: `${(current.estimatedSize / 1024 / 1024).toFixed(2)}MB`,
        stores: current.storeInstances,
        caches: current.cacheEntries,
      },
      trend: memoryReport.trend,
      leakDetection: {
        suspected: memoryReport.leakDetection.suspected,
        growthRate: memoryReport.leakDetection.growthRate,
        problematic: [
          ...memoryReport.leakDetection.problematicStores,
          ...memoryReport.leakDetection.problematicCaches,
        ],
      },
    }
  }

  /**
   * 生成性能报告
   */
  private generatePerformanceReport(): PerformanceReport['performance'] {
    const perfReport = this.performanceMonitor.getPerformanceReport()

    return {
      slowActions: perfReport.slowActions.slice(0, 5),
      slowGetters: perfReport.slowGetters.slice(0, 5),
      frequentUpdates: perfReport.frequentUpdates.slice(0, 5),
    }
  }

  /**
   * 生成Store池报告
   */
  private generateStorePoolReport(): PerformanceReport['storePool'] {
    const stats = this.storePool.getStats()
    
    // 计算利用率
    const maxInstances = 50 // 假设最大实例数
    const utilization = (stats.totalInstances / maxInstances) * 100

    // 获取前5个最大的池
    const topPools = stats.poolDetails
      .sort((a, b) => (b.poolSize + b.activeInstances) - (a.poolSize + a.activeInstances))
      .slice(0, 5)
      .map(detail => ({
        className: detail.className,
        instances: detail.poolSize + detail.activeInstances,
      }))

    return {
      totalPools: stats.totalPools,
      totalInstances: stats.totalInstances,
      utilization: Math.min(utilization, 100),
      topPools,
    }
  }

  /**
   * 生成优化建议
   */
  private generateSuggestions(report: PerformanceReport): string[] {
    const suggestions: string[] = []

    // 内存相关建议
    if (report.memory) {
      if (report.memory.leakDetection.suspected) {
        suggestions.push(`检测到可能的内存泄漏，请检查以下组件：${  
          report.memory.leakDetection.problematic.join(', ')}`)
      }
      if (report.memory.trend === 'growing') {
        suggestions.push('内存使用量持续增长，建议：\n' +
          '  - 检查是否有未清理的事件监听器\n' +
          '  - 确保Store实例被正确销毁\n' +
          '  - 考虑设置缓存过期时间')
      }
      const memoryUsed = Number.parseFloat(report.memory.current.used)
      if (memoryUsed > 50) {
        suggestions.push(`内存使用量较高(${report.memory.current.used})，建议清理不必要的缓存`)
      }
    }

    // 性能相关建议
    if (report.performance) {
      if (report.performance.slowActions.length > 0) {
        const slowest = report.performance.slowActions[0]
        suggestions.push(`发现慢速Action(${slowest.name}: ${slowest.avgTime.toFixed(2)}ms)，建议：\n` +
          '  - 使用防抖或节流\n' +
          '  - 考虑异步处理\n' +
          '  - 优化算法复杂度')
      }
      if (report.performance.slowGetters.length > 0) {
        const slowest = report.performance.slowGetters[0]
        suggestions.push(`发现慢速Getter(${slowest.name}: ${slowest.avgTime.toFixed(2)}ms)，建议：\n` +
          '  - 使用计算缓存\n' +
          '  - 简化计算逻辑\n' +
          '  - 考虑使用memo模式')
      }
      if (report.performance.frequentUpdates.length > 0) {
        const most = report.performance.frequentUpdates[0]
        suggestions.push(`状态更新过于频繁(${most.name}: ${most.count}次)，建议：\n` +
          '  - 批量更新状态\n' +
          '  - 使用节流限制更新频率\n' +
          '  - 检查是否有不必要的更新')
      }
    }

    // Store池相关建议
    if (report.storePool) {
      if (report.storePool.utilization > 80) {
        suggestions.push(`Store池利用率较高(${report.storePool.utilization.toFixed(0)}%)，建议：\n` +
          '  - 增加池的最大容量\n' +
          '  - 及时清理不用的Store实例\n' +
          '  - 考虑使用Store复用')
      }
      if (report.storePool.totalInstances > 100) {
        suggestions.push(`Store实例过多(${report.storePool.totalInstances}个)，建议：\n` +
          '  - 合并相关的Store\n' +
          '  - 使用懒加载策略\n' +
          '  - 设置更短的空闲超时时间')
      }
    }

    // 通用建议
    if (suggestions.length === 0) {
      suggestions.push('系统运行良好，继续保持当前的优化策略')
    }

    return suggestions
  }

  /**
   * 更新健康状态
   */
  private updateHealthStatus(report: PerformanceReport): PerformanceReport['summary'] {
    const issues: string[] = []
    let score = 100

    // 检查内存问题
    if (report.memory) {
      if (report.memory.leakDetection.suspected) {
        issues.push('内存泄漏风险')
        score -= 30
      }
      if (report.memory.trend === 'growing') {
        issues.push('内存持续增长')
        score -= 10
      }
      const memoryUsed = Number.parseFloat(report.memory.current.used)
      if (memoryUsed > 100) {
        issues.push('内存使用过高')
        score -= 20
      } else if (memoryUsed > 50) {
        score -= 10
      }
    }

    // 检查性能问题
    if (report.performance) {
      if (report.performance.slowActions.length > 3) {
        issues.push('多个慢速Action')
        score -= 15
      }
      if (report.performance.slowGetters.length > 3) {
        issues.push('多个慢速Getter')
        score -= 15
      }
      if (report.performance.frequentUpdates.length > 0) {
        issues.push('状态更新频繁')
        score -= 10
      }
    }

    // 检查Store池问题
    if (report.storePool) {
      if (report.storePool.utilization > 90) {
        issues.push('Store池接近饱和')
        score -= 15
      }
      if (report.storePool.totalInstances > 200) {
        issues.push('Store实例过多')
        score -= 10
      }
    }

    // 确保分数在合理范围内
    score = Math.max(0, Math.min(100, score))

    // 确定健康状态
    let health: 'good' | 'warning' | 'critical' = 'good'
    if (score < 50) {
      health = 'critical'
    } else if (score < 80) {
      health = 'warning'
    }

    return {
      health,
      score,
      issues,
    }
  }

  /**
   * 格式化报告
   */
  formatReport(report: PerformanceReport, format: 'json' | 'html' | 'markdown' = 'json'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2)

      case 'markdown':
        return this.formatAsMarkdown(report)

      case 'html':
        return this.formatAsHTML(report)

      default:
        return JSON.stringify(report)
    }
  }

  /**
   * 格式化为Markdown
   */
  private formatAsMarkdown(report: PerformanceReport): string {
    let md = '# 性能分析报告\n\n'
    
    const date = new Date(report.timestamp).toLocaleString()
    md += `**生成时间**: ${date}\n\n`

    // 摘要
    md += '## 摘要\n\n'
    md += `- **健康状态**: ${this.getHealthEmoji(report.summary.health)} ${report.summary.health}\n`
    md += `- **评分**: ${report.summary.score}/100\n`
    if (report.summary.issues.length > 0) {
      md += `- **问题**: ${report.summary.issues.join(', ')}\n`
    }
    md += '\n'

    // 内存
    if (report.memory) {
      md += '## 内存使用\n\n'
      md += `- **当前使用**: ${report.memory.current.used}\n`
      md += `- **Store实例**: ${report.memory.current.stores}\n`
      md += `- **缓存条目**: ${report.memory.current.caches}\n`
      md += `- **趋势**: ${report.memory.trend}\n`
      if (report.memory.leakDetection.suspected) {
        md += `- **⚠️ 内存泄漏风险**: 增长率 ${report.memory.leakDetection.growthRate.toFixed(2)}%\n`
      }
      md += '\n'
    }

    // 性能
    if (report.performance) {
      md += '## 性能指标\n\n'
      
      if (report.performance.slowActions.length > 0) {
        md += '### 慢速Actions\n\n'
        md += '| Action | 平均时间(ms) | 最大时间(ms) |\n'
        md += '|--------|-------------|-------------|\n'
        report.performance.slowActions.forEach(action => {
          md += `| ${action.name} | ${action.avgTime.toFixed(2)} | ${action.maxTime.toFixed(2)} |\n`
        })
        md += '\n'
      }

      if (report.performance.slowGetters.length > 0) {
        md += '### 慢速Getters\n\n'
        md += '| Getter | 平均时间(ms) | 最大时间(ms) |\n'
        md += '|--------|-------------|-------------|\n'
        report.performance.slowGetters.forEach(getter => {
          md += `| ${getter.name} | ${getter.avgTime.toFixed(2)} | ${getter.maxTime.toFixed(2)} |\n`
        })
        md += '\n'
      }
    }

    // 优化建议
    if (report.suggestions && report.suggestions.length > 0) {
      md += '## 优化建议\n\n'
      report.suggestions.forEach((suggestion, index) => {
        md += `${index + 1}. ${suggestion}\n\n`
      })
    }

    return md
  }

  /**
   * 格式化为HTML
   */
  private formatAsHTML(report: PerformanceReport): string {
    let html = `
<!DOCTYPE html>
<html>
<head>
  <title>性能分析报告</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    h2 { color: #666; margin-top: 30px; }
    .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; }
    .health-good { color: green; }
    .health-warning { color: orange; }
    .health-critical { color: red; }
    table { border-collapse: collapse; width: 100%; margin: 10px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .suggestion { background: #e8f4f8; padding: 10px; margin: 10px 0; border-left: 3px solid #2196F3; }
  </style>
</head>
<body>
  <h1>性能分析报告</h1>
  <div class="summary">
    <p><strong>生成时间</strong>: ${new Date(report.timestamp).toLocaleString()}</p>
    <p><strong>健康状态</strong>: <span class="health-${report.summary.health}">${report.summary.health}</span></p>
    <p><strong>评分</strong>: ${report.summary.score}/100</p>
    ${report.summary.issues.length > 0 ? `<p><strong>问题</strong>: ${report.summary.issues.join(', ')}</p>` : ''}
  </div>
`

    if (report.memory) {
      html += `
  <h2>内存使用</h2>
  <table>
    <tr><th>指标</th><th>值</th></tr>
    <tr><td>当前使用</td><td>${report.memory.current.used}</td></tr>
    <tr><td>Store实例</td><td>${report.memory.current.stores}</td></tr>
    <tr><td>缓存条目</td><td>${report.memory.current.caches}</td></tr>
    <tr><td>趋势</td><td>${report.memory.trend}</td></tr>
  </table>
`
    }

    if (report.suggestions && report.suggestions.length > 0) {
      html += '<h2>优化建议</h2>'
      report.suggestions.forEach(suggestion => {
        html += `<div class="suggestion">${suggestion.replace(/\n/g, '<br>')}</div>`
      })
    }

    html += '</body></html>'
    return html
  }

  /**
   * 获取健康状态emoji
   */
  private getHealthEmoji(health: 'good' | 'warning' | 'critical'): string {
    switch (health) {
      case 'good': return '✅'
      case 'warning': return '⚠️'
      case 'critical': return '❌'
    }
  }

  /**
   * 保存报告到文件
   */
  async saveReport(report: PerformanceReport, filename: string, format: 'json' | 'html' | 'markdown' = 'json'): Promise<void> {
    const formatted = this.formatReport(report, format)
    
    if (typeof window !== 'undefined' && window.navigator) {
      // 浏览器环境
      const blob = new Blob([formatted], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } else {
      // Node.js环境
      const fs = await import('node:fs/promises')
      await fs.writeFile(filename, formatted, 'utf-8')
    }
  }
}

/**
 * 获取性能报告器实例
 */
export function usePerformanceReporter(): PerformanceReporter {
  return PerformanceReporter.getInstance()
}

/**
 * 快捷生成报告
 */
export async function generatePerformanceReport(
  config?: ReportConfig,
  save?: { filename: string; format?: 'json' | 'html' | 'markdown' }
): Promise<PerformanceReport> {
  const reporter = PerformanceReporter.getInstance()
  const report = reporter.generateReport(config)
  
  if (save) {
    await reporter.saveReport(report, save.filename, save.format)
  }
  
  return report
}