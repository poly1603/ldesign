/**
 * 性能基准测试
 * 
 * 用于持续监控和比较性能优化效果
 */

import { bench, describe } from 'vitest'
import { createPerformanceOptimizer } from '../core/PerformanceOptimizer'
import { createDevExperience } from '../core/DevExperience'
import { ViteLauncher } from '../core/ViteLauncher'
import type { ViteDevServer } from 'vite'

describe('性能基准测试', () => {
  describe('构建性能', () => {
    bench('基础构建（无优化）', async () => {
      const launcher = new ViteLauncher({
        config: {
          root: process.cwd(),
          build: {
            outDir: 'dist-bench-base'
          }
        }
      })
      
      await launcher.initialize()
      await launcher.build()
    }, { time: 60000 })

    bench('优化构建（启用所有优化）', async () => {
      const optimizer = createPerformanceOptimizer({
        enableAutoSplitting: true,
        enableCompression: true,
        enableTreeShaking: true,
        enableCaching: true,
        enableParallelBuild: true
      })
      
      const launcher = new ViteLauncher({
        config: {
          root: process.cwd(),
          build: {
            outDir: 'dist-bench-optimized'
          },
          plugins: [optimizer.createVitePlugin()]
        }
      })
      
      await launcher.initialize()
      await launcher.build()
    }, { time: 60000 })

    bench('代码分割性能', async () => {
      const optimizer = createPerformanceOptimizer({
        enableAutoSplitting: true,
        splitStrategy: 'vendor'
      })
      
      const launcher = new ViteLauncher({
        config: {
          root: process.cwd(),
          build: {
            outDir: 'dist-bench-split'
          },
          plugins: [optimizer.createVitePlugin()]
        }
      })
      
      await launcher.initialize()
      await launcher.build()
    }, { time: 60000 })
  })

  describe('开发服务器性能', () => {
    let server: ViteDevServer | null = null

    bench('服务器启动时间（基础）', async () => {
      const launcher = new ViteLauncher({
        config: {
          server: {
            port: 4000
          }
        }
      })
      
      await launcher.initialize()
      server = await launcher.startDev()
      await launcher.stopDev()
    }, { time: 30000 })

    bench('服务器启动时间（优化）', async () => {
      const devExp = createDevExperience({
        enablePerformanceHints: true,
        enableFastRefresh: true
      })
      
      const launcher = new ViteLauncher({
        config: {
          server: {
            port: 4001
          },
          plugins: [devExp.createVitePlugin()]
        }
      })
      
      await launcher.initialize()
      server = await launcher.startDev()
      await launcher.stopDev()
    }, { time: 30000 })
  })

  describe('内存使用', () => {
    bench('内存占用（基础配置）', () => {
      const launcher = new ViteLauncher()
      const memUsage = process.memoryUsage()
      // 返回 void，不需要返回值
    })

    bench('内存占用（完整优化）', () => {
      const optimizer = createPerformanceOptimizer()
      const devExp = createDevExperience()
      const launcher = new ViteLauncher({
        config: {
          plugins: [
            optimizer.createVitePlugin(),
            devExp.createVitePlugin()
          ]
        }
      })
      const memUsage = process.memoryUsage()
      // 返回 void，不需要返回值
    })
  })

  describe('插件性能', () => {
    bench('性能优化器初始化', () => {
      const optimizer = createPerformanceOptimizer({
        enableAutoSplitting: true,
        enableCompression: true,
        enableTreeShaking: true
      })
      optimizer.createVitePlugin()
    })

    bench('开发体验增强初始化', () => {
      const devExp = createDevExperience({
        enableErrorOverlay: true,
        enablePrettyConsole: true,
        enableProgressBar: true
      })
      devExp.createVitePlugin()
    })

    bench('配置合并性能', () => {
      const configs = []
      for (let i = 0; i < 100; i++) {
        configs.push({
          server: { port: 3000 + i },
          build: { outDir: `dist-${i}` }
        })
      }
      
      const launcher = new ViteLauncher({
        config: configs.reduce((acc, curr) => ({ ...acc, ...curr }), {})
      })
    })
  })
})

/**
 * 基准测试报告生成器
 */
export class BenchmarkReporter {
  private results: Map<string, number[]> = new Map()
  
  record(name: string, value: number): void {
    if (!this.results.has(name)) {
      this.results.set(name, [])
    }
    this.results.get(name)!.push(value)
  }
  
  getAverage(name: string): number {
    const values = this.results.get(name) || []
    if (values.length === 0) return 0
    return values.reduce((a, b) => a + b, 0) / values.length
  }
  
  getMedian(name: string): number {
    const values = this.results.get(name) || []
    if (values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]
  }
  
  getPercentile(name: string, percentile: number): number {
    const values = this.results.get(name) || []
    if (values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[Math.max(0, index)]
  }
  
  generateReport(): string {
    const report: string[] = ['# 性能基准测试报告\n']
    report.push(`生成时间: ${new Date().toISOString()}\n`)
    report.push('## 测试结果\n')
    
    for (const [name, values] of this.results.entries()) {
      report.push(`### ${name}`)
      report.push(`- 平均值: ${this.getAverage(name).toFixed(2)}ms`)
      report.push(`- 中位数: ${this.getMedian(name).toFixed(2)}ms`)
      report.push(`- P95: ${this.getPercentile(name, 95).toFixed(2)}ms`)
      report.push(`- P99: ${this.getPercentile(name, 99).toFixed(2)}ms`)
      report.push(`- 样本数: ${values.length}`)
      report.push('')
    }
    
    return report.join('\n')
  }
  
  compareWithBaseline(baseline: Map<string, number>): string {
    const comparison: string[] = ['# 性能对比报告\n']
    
    for (const [name, baselineValue] of baseline.entries()) {
      const currentAvg = this.getAverage(name)
      const diff = currentAvg - baselineValue
      const diffPercent = (diff / baselineValue) * 100
      
      comparison.push(`### ${name}`)
      comparison.push(`- 基准值: ${baselineValue.toFixed(2)}ms`)
      comparison.push(`- 当前值: ${currentAvg.toFixed(2)}ms`)
      comparison.push(`- 差异: ${diff > 0 ? '+' : ''}${diff.toFixed(2)}ms (${diffPercent.toFixed(1)}%)`)
      
      if (Math.abs(diffPercent) > 10) {
        comparison.push(`- ⚠️ 性能${diff > 0 ? '下降' : '提升'}超过10%`)
      }
      comparison.push('')
    }
    
    return comparison.join('\n')
  }
}
