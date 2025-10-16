/**
 * 构建性能追踪和分析工具
 * 用于监控和优化构建过程的性能瓶颈
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import fs from 'fs/promises'
import path from 'path'
import { performance } from 'perf_hooks'

export interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, unknown>
}

export interface PerformanceReport {
  totalDuration: number
  metrics: PerformanceMetric[]
  bottlenecks: Array<{
    name: string
    duration: number
    percentage: number
  }>
  recommendations: string[]
  timestamp: string
}

/**
 * 性能追踪器类
 */
export class PerformanceTracker {
  private metrics: Map<string, PerformanceMetric> = new Map()
  private readonly startTime: number = performance.now()

  /**
   * 开始追踪一个操作
   */
  public start(name: string, metadata?: Record<string, unknown>): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata
    })
  }

  /**
   * 结束追踪一个操作
   */
  public end(name: string): number {
    const metric = this.metrics.get(name)
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`)
      return 0
    }

    const endTime = performance.now()
    const duration = endTime - metric.startTime

    metric.endTime = endTime
    metric.duration = duration

    return duration
  }

  /**
   * 测量一个异步操作的性能
   */
  public async measure<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    this.start(name, metadata)
    try {
      return await fn()
    } finally {
      this.end(name)
    }
  }

  /**
   * 测量一个同步操作的性能
   */
  public measureSync<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, unknown>
  ): T {
    this.start(name, metadata)
    try {
      return fn()
    } finally {
      this.end(name)
    }
  }

  /**
   * 获取所有性能指标
   */
  public getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values())
  }

  /**
   * 生成性能报告
   */
  public generateReport(): PerformanceReport {
    const metrics = this.getMetrics()
    const totalDuration = performance.now() - this.startTime

    // 找出性能瓶颈（占用超过10%时间的操作）
    const bottlenecks = metrics
      .filter(m => m.duration && (m.duration / totalDuration) > 0.1)
      .map(m => ({
        name: m.name,
        duration: m.duration!,
        percentage: (m.duration! / totalDuration) * 100
      }))
      .sort((a, b) => b.duration - a.duration)

    // 生成优化建议
    const recommendations = this.generateRecommendations(metrics, bottlenecks, totalDuration)

    return {
      totalDuration,
      metrics,
      bottlenecks,
      recommendations,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(
    metrics: PerformanceMetric[],
    bottlenecks: Array<{ name: string; duration: number; percentage: number }>,
    totalDuration: number
  ): string[] {
    const recommendations: string[] = []

    // 检查构建时间
    if (totalDuration > 60000) {
      recommendations.push('Build time exceeds 60 seconds. Consider enabling caching or incremental builds.')
    }

    // 检查瓶颈
    if (bottlenecks.length > 0) {
      bottlenecks.forEach(bottleneck => {
        if (bottleneck.name.includes('dependency')) {
          recommendations.push(
            `Dependency optimization is taking ${bottleneck.percentage.toFixed(1)}% of build time. ` +
            'Consider pre-bundling dependencies or using external configuration.'
          )
        } else if (bottleneck.name.includes('transform')) {
          recommendations.push(
            `Code transformation is taking ${bottleneck.percentage.toFixed(1)}% of build time. ` +
            'Consider using esbuild or swc for faster transformation.'
          )
        } else if (bottleneck.name.includes('minify')) {
          recommendations.push(
            `Minification is taking ${bottleneck.percentage.toFixed(1)}% of build time. ` +
            'Consider using esbuild minifier or disabling minification in development.'
          )
        }
      })
    }

    // 检查操作数量
    const transformMetrics = metrics.filter(m => m.name.includes('transform'))
    if (transformMetrics.length > 1000) {
      recommendations.push(
        `High number of file transformations (${transformMetrics.length}). ` +
        'Consider code splitting or lazy loading to reduce initial bundle size.'
      )
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Build performance is optimal!')
    }

    return recommendations
  }

  /**
   * 保存性能报告到文件
   */
  public async saveReport(outputPath: string): Promise<void> {
    const report = this.generateReport()
    const reportDir = path.dirname(outputPath)

    // 确保目录存在
    await fs.mkdir(reportDir, { recursive: true })

    // 保存 JSON 报告
    await fs.writeFile(
      outputPath,
      JSON.stringify(report, null, 2)
    )

    // 生成并保存 HTML 报告
    const htmlPath = outputPath.replace('.json', '.html')
    await this.saveHTMLReport(report, htmlPath)

    
  }

  /**
   * 生成并保存 HTML 报告
   */
  private async saveHTMLReport(report: PerformanceReport, outputPath: string): Promise<void> {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Performance Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      padding: 40px;
    }
    h1 {
      color: #667eea;
      margin-bottom: 10px;
      font-size: 2.5em;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .timestamp {
      color: #7f8c8d;
      font-size: 0.9em;
      margin-bottom: 30px;
    }
    .stat-card {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .stat-label {
      font-size: 1.1em;
      opacity: 0.9;
      margin-bottom: 10px;
    }
    .stat-value {
      font-size: 3em;
      font-weight: bold;
    }
    .section {
      margin-bottom: 40px;
    }
    .section h2 {
      color: #2c3e50;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 3px solid #ecf0f1;
      font-size: 1.8em;
    }
    .metric-list {
      display: grid;
      gap: 15px;
    }
    .metric-item {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border-left: 5px solid #3498db;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: transform 0.2s;
    }
    .metric-item:hover {
      transform: translateX(5px);
    }
    .metric-item.bottleneck {
      border-left-color: #e74c3c;
      background: linear-gradient(135deg, #fff 0%, #ffebee 100%);
    }
    .metric-name {
      font-weight: 600;
      color: #2c3e50;
    }
    .metric-duration {
      font-family: 'Courier New', monospace;
      font-weight: bold;
      color: #7f8c8d;
      font-size: 1.1em;
    }
    .metric-item.bottleneck .metric-duration {
      color: #e74c3c;
    }
    .recommendation-list {
      list-style: none;
    }
    .recommendation-list li {
      background: linear-gradient(135deg, #fff 0%, #e3f2fd 100%);
      border-left: 5px solid #2196f3;
      padding: 20px;
      margin-bottom: 15px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .percentage {
      display: inline-block;
      background: #e74c3c;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.9em;
      margin-left: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚡ Performance Report</h1>
    <div class="timestamp">Generated at: ${report.timestamp}</div>
    
    <div class="stat-card">
      <div class="stat-label">Total Build Time</div>
      <div class="stat-value">${(report.totalDuration / 1000).toFixed(2)}s</div>
    </div>

    ${report.bottlenecks.length > 0 ? `
    <div class="section">
      <h2>🔥 Performance Bottlenecks</h2>
      <div class="metric-list">
        ${report.bottlenecks.map(b => `
          <div class="metric-item bottleneck">
            <span class="metric-name">
              ${b.name}
              <span class="percentage">${b.percentage.toFixed(1)}%</span>
            </span>
            <span class="metric-duration">${(b.duration / 1000).toFixed(2)}s</span>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <div class="section">
      <h2>📊 All Metrics</h2>
      <div class="metric-list">
        ${report.metrics
          .filter(m => m.duration)
          .sort((a, b) => (b.duration || 0) - (a.duration || 0))
          .map(m => `
            <div class="metric-item">
              <span class="metric-name">${m.name}</span>
              <span class="metric-duration">${(m.duration! / 1000).toFixed(3)}s</span>
            </div>
          `).join('')}
      </div>
    </div>

    ${report.recommendations.length > 0 ? `
    <div class="section">
      <h2>💡 Optimization Recommendations</h2>
      <ul class="recommendation-list">
        ${report.recommendations.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
  </div>
</body>
</html>`

    await fs.writeFile(outputPath, html)
  }

  /**
   * 打印性能摘要到控制台
   */
  public printSummary(): void {
    const report = this.generateReport()
    
    
    .toFixed(2)}s`)
    
    if (report.bottlenecks.length > 0) {
      
      report.bottlenecks.forEach(b => {
        .toFixed(2)}s (${b.percentage.toFixed(1)}%)`)
      })
    }

    if (report.recommendations.length > 0) {
      
      report.recommendations.forEach(r => {
        
      })
    }
  }

  /**
   * 重置追踪器
   */
  public reset(): void {
    this.metrics.clear()
  }
}

/**
 * 创建性能追踪器实例
 */
export function createPerformanceTracker(): PerformanceTracker {
  return new PerformanceTracker()
}

/**
 * 全局性能追踪器实例（单例）
 */
export const globalTracker = new PerformanceTracker()
