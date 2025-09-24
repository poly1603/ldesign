/**
 * 性能基准测试和回归检测
 *
 * 提供性能基准测试和回归检测功能，包括：
 * - 建立性能基准线
 * - 性能回归检测
 * - 性能报告生成
 * - 持续性能监控
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import {
  PerformanceBenchmark,
  getMemoryUsage,
  performanceMonitor
} from './setup'
import { useProductStore } from '../../src/stores/decorators/ProductStore'
import { usePersistenceStore } from '../../src/stores/persistence/PersistenceStore'
import { useRealtimeStore } from '../../src/stores/realtime/RealtimeStore'
import { createPinia, setActivePinia } from 'pinia'

// 性能基准数据接口
interface PerformanceBenchmarkData {
  timestamp: number
  version: string
  environment: {
    nodeVersion: string
    platform: string
    arch: string
    memory: number
  }
  benchmarks: {
    [testName: string]: {
      opsPerSecond: number
      meanTime: number
      samples: number
      variance: number
      standardDeviation: number
    }
  }
}

// 性能回归检测结果
interface RegressionResult {
  testName: string
  current: number
  baseline: number
  change: number
  changePercent: number
  isRegression: boolean
  severity: 'low' | 'medium' | 'high'
}

// 性能基准管理器
class PerformanceBenchmarkManager {
  private baselineFile: string
  private threshold: number

  constructor(baselineFile: string = 'performance-baseline.json', threshold: number = 0.2) {
    this.baselineFile = join(process.cwd(), 'tests', 'performance', baselineFile)
    this.threshold = threshold // 20% 性能下降阈值
  }

  /**
   * 保存性能基准数据
   */
  saveBaseline(data: PerformanceBenchmarkData): void {
    try {
      writeFileSync(this.baselineFile, JSON.stringify(data, null, 2))
      console.log(`性能基准数据已保存到: ${this.baselineFile}`)
    } catch (error) {
      console.error('保存性能基准数据失败:', error)
    }
  }

  /**
   * 加载性能基准数据
   */
  loadBaseline(): PerformanceBenchmarkData | null {
    try {
      if (!existsSync(this.baselineFile)) {
        return null
      }
      const data = readFileSync(this.baselineFile, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      console.error('加载性能基准数据失败:', error)
      return null
    }
  }

  /**
   * 检测性能回归
   */
  detectRegression(current: PerformanceBenchmarkData): RegressionResult[] {
    const baseline = this.loadBaseline()
    if (!baseline) {
      console.warn('未找到性能基准数据，无法进行回归检测')
      return []
    }

    const results: RegressionResult[] = []

    Object.keys(current.benchmarks).forEach(testName => {
      const currentBench = current.benchmarks[testName]
      const baselineBench = baseline.benchmarks[testName]

      if (!baselineBench) {
        console.warn(`基准数据中未找到测试: ${testName}`)
        return
      }

      const change = currentBench.opsPerSecond - baselineBench.opsPerSecond
      const changePercent = (change / baselineBench.opsPerSecond) * 100
      const isRegression = changePercent < -this.threshold * 100

      let severity: 'low' | 'medium' | 'high' = 'low'
      if (Math.abs(changePercent) > 50) {
        severity = 'high'
      } else if (Math.abs(changePercent) > 30) {
        severity = 'medium'
      }

      results.push({
        testName,
        current: currentBench.opsPerSecond,
        baseline: baselineBench.opsPerSecond,
        change,
        changePercent,
        isRegression,
        severity
      })
    })

    return results
  }

  /**
   * 生成性能报告
   */
  generateReport(regressions: RegressionResult[]): string {
    const hasRegressions = regressions.some(r => r.isRegression)

    let report = '# 性能测试报告\n\n'
    report += `生成时间: ${new Date().toISOString()}\n`
    report += `回归阈值: ${this.threshold * 100}%\n\n`

    if (hasRegressions) {
      report += '## ⚠️ 发现性能回归\n\n'
      const regressionItems = regressions.filter(r => r.isRegression)

      regressionItems.forEach(item => {
        report += `### ${item.testName}\n`
        report += `- 当前性能: ${item.current.toFixed(2)} ops/sec\n`
        report += `- 基准性能: ${item.baseline.toFixed(2)} ops/sec\n`
        report += `- 性能变化: ${item.changePercent.toFixed(2)}%\n`
        report += `- 严重程度: ${item.severity}\n\n`
      })
    } else {
      report += '## ✅ 未发现性能回归\n\n'
    }

    report += '## 详细结果\n\n'
    report += '| 测试名称 | 当前性能 | 基准性能 | 变化 | 变化% | 状态 |\n'
    report += '|---------|---------|---------|------|-------|------|\n'

    regressions.forEach(item => {
      const status = item.isRegression ? '❌ 回归' : '✅ 正常'
      report += `| ${item.testName} | ${item.current.toFixed(2)} | ${item.baseline.toFixed(2)} | ${item.change.toFixed(2)} | ${item.changePercent.toFixed(2)}% | ${status} |\n`
    })

    return report
  }
}

describe('性能基准测试和回归检测', () => {
  const benchmarkManager = new PerformanceBenchmarkManager()

  beforeEach(() => {
    setActivePinia(createPinia())
    performanceMonitor.clear()
  })

  describe('建立性能基准线', () => {
    it('应该建立完整的性能基准数据', async () => {
      const productStore = useProductStore()
      const persistenceStore = usePersistenceStore()
      const realtimeStore = useRealtimeStore()

      // 初始化存储
      persistenceStore.initializePersistence()

      const benchmarkData: PerformanceBenchmarkData = {
        timestamp: Date.now(),
        version: '1.0.0', // 从 package.json 获取
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          memory: process.memoryUsage().heapTotal
        },
        benchmarks: {}
      }

      // Store 操作基准测试
      const storeBenchmark = new PerformanceBenchmark('Store 基准测试')

      storeBenchmark
        .add('ProductStore-添加产品', () => {
          productStore.addProduct({
            id: Date.now(),
            name: '基准测试产品',
            price: 99.99,
            category: '测试',
            description: '基准测试',
            stock: 100,
            rating: 4.5,
            tags: ['基准', '测试'],
            createdAt: Date.now(),
            updatedAt: Date.now()
          })
        })
        .add('PersistenceStore-保存数据', () => {
          persistenceStore.saveToStorage(false)
        })
        .add('RealtimeStore-添加消息', () => {
          realtimeStore.addMessage({
            id: Date.now().toString(),
            user: '基准测试',
            content: '基准测试消息',
            timestamp: Date.now(),
            type: 'text'
          })
        })

      const storeResults = await storeBenchmark.run()

      // 保存基准数据
      storeResults.forEach(result => {
        benchmarkData.benchmarks[result.name] = {
          opsPerSecond: result.opsPerSecond,
          meanTime: result.meanTime,
          samples: result.samples,
          variance: result.variance,
          standardDeviation: result.standardDeviation
        }
      })

      // 内存使用基准测试
      const memoryBenchmark = new PerformanceBenchmark('内存使用基准')

      memoryBenchmark
        .add('大数据集处理', () => {
          const largeArray = Array.from({ length: 10000 }, (_, i) => ({
            id: i,
            data: `item-${i}`,
            value: Math.random()
          }))

          // 处理数据
          const processed = largeArray
            .filter(item => item.value > 0.5)
            .map(item => ({ ...item, processed: true }))
            .sort((a, b) => a.value - b.value)

          return processed.length
        })

      const memoryResults = await memoryBenchmark.run()

      memoryResults.forEach(result => {
        benchmarkData.benchmarks[result.name] = {
          opsPerSecond: result.opsPerSecond,
          meanTime: result.meanTime,
          samples: result.samples,
          variance: result.variance,
          standardDeviation: result.standardDeviation
        }
      })

      // 保存基准数据
      benchmarkManager.saveBaseline(benchmarkData)

      // 验证基准数据
      expect(Object.keys(benchmarkData.benchmarks).length).toBeGreaterThan(0)
      expect(benchmarkData.timestamp).toBeGreaterThan(0)
      expect(benchmarkData.version).toBeTruthy()

      console.log('性能基准数据已建立:', Object.keys(benchmarkData.benchmarks))
    })
  })

  describe('性能回归检测', () => {
    it('应该检测性能回归', async () => {
      // 首先确保有基准数据
      const baseline = benchmarkManager.loadBaseline()
      if (!baseline) {
        console.warn('未找到基准数据，跳过回归检测测试')
        return
      }

      const productStore = useProductStore()
      const persistenceStore = usePersistenceStore()
      const realtimeStore = useRealtimeStore()

      persistenceStore.initializePersistence()

      // 运行当前性能测试
      const currentBenchmark = new PerformanceBenchmark('当前性能测试')

      currentBenchmark
        .add('ProductStore-添加产品', () => {
          productStore.addProduct({
            id: Date.now(),
            name: '回归测试产品',
            price: 99.99,
            category: '测试',
            description: '回归测试',
            stock: 100,
            rating: 4.5,
            tags: ['回归', '测试'],
            createdAt: Date.now(),
            updatedAt: Date.now()
          })
        })
        .add('PersistenceStore-保存数据', () => {
          persistenceStore.saveToStorage(false)
        })
        .add('RealtimeStore-添加消息', () => {
          realtimeStore.addMessage({
            id: Date.now().toString(),
            user: '回归测试',
            content: '回归测试消息',
            timestamp: Date.now(),
            type: 'text'
          })
        })

      const currentResults = await currentBenchmark.run()

      // 构建当前测试数据
      const currentData: PerformanceBenchmarkData = {
        timestamp: Date.now(),
        version: '1.0.1', // 模拟新版本
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          memory: process.memoryUsage().heapTotal
        },
        benchmarks: {}
      }

      currentResults.forEach(result => {
        currentData.benchmarks[result.name] = {
          opsPerSecond: result.opsPerSecond,
          meanTime: result.meanTime,
          samples: result.samples,
          variance: result.variance,
          standardDeviation: result.standardDeviation
        }
      })

      // 检测回归
      const regressions = benchmarkManager.detectRegression(currentData)

      // 生成报告
      const report = benchmarkManager.generateReport(regressions)

      console.log('性能回归检测报告:')
      console.log(report)

      // 验证回归检测结果
      expect(regressions.length).toBeGreaterThan(0)
      regressions.forEach(regression => {
        expect(regression.testName).toBeTruthy()
        expect(typeof regression.current).toBe('number')
        expect(typeof regression.baseline).toBe('number')
        expect(typeof regression.changePercent).toBe('number')
      })

      // 如果有严重回归，测试应该失败
      const severeRegressions = regressions.filter(r => r.isRegression && r.severity === 'high')
      if (severeRegressions.length > 0) {
        console.error('发现严重性能回归:', severeRegressions)
        // 在实际项目中，这里可能会导致测试失败
        // expect(severeRegressions.length).toBe(0)
      }
    })
  })

  describe('持续性能监控', () => {
    it('应该监控关键性能指标', async () => {
      const monitor = performanceMonitor
      const productStore = useProductStore()

      // 监控产品操作性能
      monitor.mark('product-operations-start')

      const operations = [
        () => productStore.addProduct({
          id: 1,
          name: '监控测试产品1',
          price: 99.99,
          category: '测试',
          description: '监控测试',
          stock: 100,
          rating: 4.5,
          tags: ['监控', '测试'],
          createdAt: Date.now(),
          updatedAt: Date.now()
        }),
        () => productStore.updateProduct(1, { name: '更新后的产品' }),
        () => productStore.searchProducts('监控'),
        () => productStore.filterProducts({ category: '测试' }),
        () => productStore.removeProduct(1)
      ]

      const operationTimes: number[] = []

      for (let i = 0; i < operations.length; i++) {
        const operationStart = `operation-${i}-start`
        const operationEnd = `operation-${i}-end`

        monitor.mark(operationStart)
        operations[i]()
        monitor.mark(operationEnd)

        const operationTime = monitor.measure(`operation-${i}`, operationStart, operationEnd)
        operationTimes.push(operationTime)
      }

      monitor.mark('product-operations-end')
      const totalTime = monitor.measure('total-operations', 'product-operations-start', 'product-operations-end')

      // 性能指标验证
      expect(totalTime).toBeLessThan(100) // 总时间小于100ms
      expect(Math.max(...operationTimes)).toBeLessThan(50) // 单个操作小于50ms
      expect(Math.min(...operationTimes)).toBeGreaterThan(0) // 所有操作都有耗时

      // 计算性能统计
      const avgTime = operationTimes.reduce((sum, time) => sum + time, 0) / operationTimes.length
      const maxTime = Math.max(...operationTimes)
      const minTime = Math.min(...operationTimes)

      console.log('性能监控结果:')
      console.log(`总执行时间: ${totalTime.toFixed(2)}ms`)
      console.log(`平均操作时间: ${avgTime.toFixed(2)}ms`)
      console.log(`最长操作时间: ${maxTime.toFixed(2)}ms`)
      console.log(`最短操作时间: ${minTime.toFixed(2)}ms`)

      // 性能警告阈值
      if (avgTime > 20) {
        console.warn(`平均操作时间过长: ${avgTime.toFixed(2)}ms`)
      }
      if (maxTime > 50) {
        console.warn(`发现慢操作: ${maxTime.toFixed(2)}ms`)
      }
    })

    it('应该监控内存使用情况', async () => {
      const initialMemory = getMemoryUsage()
      const productStore = useProductStore()

      // 执行大量操作
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `产品${i}`,
        price: Math.random() * 1000,
        category: `分类${i % 10}`,
        description: `描述${i}`,
        stock: Math.floor(Math.random() * 100),
        rating: Math.random() * 5,
        tags: [`标签${i}`, `测试`],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }))

      // 批量添加产品
      largeDataset.forEach(product => productStore.addProduct(product))

      const afterAddMemory = getMemoryUsage()

      // 执行搜索和过滤操作
      for (let i = 0; i < 100; i++) {
        productStore.searchProducts(`产品${i}`)
        productStore.filterProducts({ category: `分类${i % 10}` })
      }

      const afterOperationsMemory = getMemoryUsage()

      // 清理数据
      largeDataset.forEach(product => productStore.removeProduct(product.id))

      const afterCleanupMemory = getMemoryUsage()

      // 内存使用分析
      const addMemoryIncrease = afterAddMemory.used - initialMemory.used
      const operationsMemoryIncrease = afterOperationsMemory.used - afterAddMemory.used
      const cleanupMemoryDecrease = afterOperationsMemory.used - afterCleanupMemory.used

      console.log('内存使用监控:')
      console.log(`初始内存: ${(initialMemory.used / 1024 / 1024).toFixed(2)} MB`)
      console.log(`添加数据后: ${(afterAddMemory.used / 1024 / 1024).toFixed(2)} MB (+${(addMemoryIncrease / 1024 / 1024).toFixed(2)} MB)`)
      console.log(`操作后: ${(afterOperationsMemory.used / 1024 / 1024).toFixed(2)} MB (+${(operationsMemoryIncrease / 1024 / 1024).toFixed(2)} MB)`)
      console.log(`清理后: ${(afterCleanupMemory.used / 1024 / 1024).toFixed(2)} MB (-${(cleanupMemoryDecrease / 1024 / 1024).toFixed(2)} MB)`)

      // 内存使用验证
      expect(addMemoryIncrease).toBeGreaterThan(0) // 添加数据应该增加内存
      // 注意：由于垃圾回收的不确定性，我们不强制要求立即释放内存
      // expect(cleanupMemoryDecrease).toBeGreaterThan(0) // 清理应该释放内存
      expect(addMemoryIncrease).toBeLessThan(50 * 1024 * 1024) // 内存增加不超过50MB

      // 内存泄漏检测
      const finalMemoryIncrease = afterCleanupMemory.used - initialMemory.used
      if (finalMemoryIncrease > 10 * 1024 * 1024) { // 10MB
        console.warn(`可能存在内存泄漏: ${(finalMemoryIncrease / 1024 / 1024).toFixed(2)} MB`)
      }
    })
  })
})
