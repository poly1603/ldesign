/**
 * 性能测试设置文件
 * 为性能测试提供专用的工具函数和基准测试环境
 */

import type { Engine } from '../../src/types'
import process from 'node:process'
import { vi } from 'vitest'
import { createEngine } from '../../src'

// 性能测试专用的全局变量
declare global {
  // eslint-disable-next-line vars-on-top
  var __PERFORMANCE_TEST__: boolean
}

globalThis.__PERFORMANCE_TEST__ = true

// 性能测试结果接口
export interface PerformanceTestResult {
  name: string
  duration: number
  memoryUsage: {
    before: number
    after: number
    delta: number
  }
  iterations: number
  averageTime: number
  minTime: number
  maxTime: number
}

// 性能测试工具类
export class PerformanceTestUtils {
  private results: PerformanceTestResult[] = []

  /**
   * 创建性能测试引擎实例
   */
  createPerformanceTestEngine(config?: any): Engine {
    const performanceConfig = {
      app: {
        name: 'Performance Test App',
        version: '1.0.0',
      },
      environment: 'production' as const,
      debug: false, // 性能测试应该在生产模式下运行
      features: {
        enableHotReload: false,
        enableDevTools: false,
        enablePerformanceMonitoring: true,
        enableErrorReporting: false,
        enableSecurityProtection: true,
        enableCaching: true,
        enableNotifications: false,
      },
      logger: {
        level: 'error' as const, // 减少日志输出以避免影响性能
        enableConsole: false,
        enableFile: false,
      },
      cache: {
        maxSize: 1000,
        ttl: 300000,
      },
      security: {
        enableXSSProtection: true,
        enableCSRFProtection: true,
      },
      performance: {
        enableMonitoring: true,
      },
      notifications: {
        position: 'top-right' as const,
        duration: 3000,
      },
      env: {},
      custom: {},
    }

    return createEngine({
      config: { ...performanceConfig, ...config },
    })
  }

  /**
   * 测量函数执行时间
   */
  async measureExecutionTime<T>(
    name: string,
    fn: () => T | Promise<T>,
    iterations = 1000,
  ): Promise<PerformanceTestResult> {
    const times: number[] = []
    const memoryBefore = this.getMemoryUsage()

    // 预热
    for (let i = 0; i < Math.min(10, iterations); i++) {
      await fn()
    }

    // 实际测试
    for (let i = 0; i < iterations; i++) {
      const start = performance.now()
      await fn()
      const end = performance.now()
      times.push(end - start)
    }

    const memoryAfter = this.getMemoryUsage()
    const totalTime = times.reduce((sum, time) => sum + time, 0)

    const result: PerformanceTestResult = {
      name,
      duration: totalTime,
      memoryUsage: {
        before: memoryBefore,
        after: memoryAfter,
        delta: memoryAfter - memoryBefore,
      },
      iterations,
      averageTime: totalTime / iterations,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
    }

    this.results.push(result)
    return result
  }

  /**
   * 基准测试
   */
  async benchmark(
    name: string,
    testCases: Array<{
      name: string
      fn: () => any | Promise<any>
    }>,
    iterations = 1000,
  ): Promise<PerformanceTestResult[]> {
    const results: PerformanceTestResult[] = []

    for (const testCase of testCases) {
      const result = await this.measureExecutionTime(
        `${name} - ${testCase.name}`,
        testCase.fn,
        iterations,
      )
      results.push(result)
    }

    return results
  }

  /**
   * 内存泄漏测试
   */
  async testMemoryLeak<T>(
    name: string,
    createFn: () => T,
    destroyFn: (instance: T) => void,
    iterations = 100,
  ): Promise<{
    name: string
    memoryGrowth: number
    averageGrowthPerIteration: number
    hasMemoryLeak: boolean
  }> {
    const initialMemory = this.getMemoryUsage()
    const instances: T[] = []

    // 创建实例
    for (let i = 0; i < iterations; i++) {
      instances.push(createFn())

      // 每10次迭代强制垃圾回收
      if (i % 10 === 0 && globalThis.gc) {
        globalThis.gc()
      }
    }

    const _midMemory = this.getMemoryUsage()

    // 销毁实例
    instances.forEach(instance => destroyFn(instance))
    instances.length = 0

    // 强制垃圾回收
    if (globalThis.gc) {
      globalThis.gc()
      // 等待垃圾回收完成
      await new Promise(resolve => setTimeout(resolve, 100))
      globalThis.gc()
    }

    const finalMemory = this.getMemoryUsage()
    const memoryGrowth = finalMemory - initialMemory
    const averageGrowthPerIteration = memoryGrowth / iterations

    return {
      name,
      memoryGrowth,
      averageGrowthPerIteration,
      hasMemoryLeak: memoryGrowth > (iterations * 1024), // 如果每次迭代平均增长超过1KB，认为有内存泄漏
    }
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed
    }

    // 浏览器环境的近似值
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize
    }

    return 0
  }

  /**
   * 生成性能报告
   */
  generateReport(): string {
    if (this.results.length === 0) {
      return 'No performance test results available.'
    }

    let report = '# Performance Test Report\n\n'

    this.results.forEach((result) => {
      report += `## ${result.name}\n`
      report += `- **Total Duration**: ${result.duration.toFixed(2)}ms\n`
      report += `- **Iterations**: ${result.iterations}\n`
      report += `- **Average Time**: ${result.averageTime.toFixed(2)}ms\n`
      report += `- **Min Time**: ${result.minTime.toFixed(2)}ms\n`
      report += `- **Max Time**: ${result.maxTime.toFixed(2)}ms\n`
      report += `- **Memory Delta**: ${(result.memoryUsage.delta / 1024).toFixed(2)}KB\n\n`
    })

    return report
  }

  /**
   * 保存性能报告到文件
   */
  async saveReport(filename = 'performance-report.md'): Promise<void> {
    const report = this.generateReport()
    const fs = await import('node:fs/promises')
    const path = await import('node:path')

    const reportPath = path.resolve(process.cwd(), 'performance-results', filename)

    // 确保目录存在
    await fs.mkdir(path.dirname(reportPath), { recursive: true })

    // 写入报告
    await fs.writeFile(reportPath, report, 'utf-8')
  }

  /**
   * 清理测试结果
   */
  clearResults(): void {
    this.results = []
  }

  /**
   * 获取所有测试结果
   */
  getResults(): PerformanceTestResult[] {
    return [...this.results]
  }
}

// 创建全局性能测试工具实例
export const performanceTestUtils = new PerformanceTestUtils()

// 性能测试钩子
beforeEach(() => {
  // 强制垃圾回收（如果可用）
  if (globalThis.gc) {
    globalThis.gc()
  }
})

afterEach(async () => {
  // 清理定时器
  vi.clearAllTimers()

  // 强制垃圾回收
  if (globalThis.gc) {
    globalThis.gc()
  }
})

afterAll(async () => {
  // 生成并保存性能报告
  await performanceTestUtils.saveReport()
})

// 导出性能测试断言
export const performanceAssertions = {
  /**
   * 断言执行时间在预期范围内
   */
  expectExecutionTimeWithin: (result: PerformanceTestResult, maxTime: number) => {
    expect(result.averageTime).toBeLessThan(maxTime)
  },

  /**
   * 断言内存使用在合理范围内
   */
  expectMemoryUsageWithin: (result: PerformanceTestResult, maxMemoryDelta: number) => {
    expect(result.memoryUsage.delta).toBeLessThan(maxMemoryDelta)
  },

  /**
   * 断言性能比较结果
   */
  expectPerformanceBetter: (result1: PerformanceTestResult, result2: PerformanceTestResult) => {
    expect(result1.averageTime).toBeLessThan(result2.averageTime)
  },

  /**
   * 断言没有内存泄漏
   */
  expectNoMemoryLeak: (leakTestResult: { hasMemoryLeak: boolean }) => {
    expect(leakTestResult.hasMemoryLeak).toBe(false)
  },
}
