/**
 * 性能测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Chart } from '../../src/core/Chart'
import { DataAdapter } from '../../src/adapters/DataAdapter'
import { LineAdapter } from '../../src/adapters/LineAdapter'
import { BarAdapter } from '../../src/adapters/BarAdapter'
import { PieAdapter } from '../../src/adapters/PieAdapter'
import { ThemeManager } from '../../src/themes/ThemeManager'
import {
  createTestContainer,
  cleanupTestContainer,
  mockEChartsInstance
} from '../setup'

describe('性能测试', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = createTestContainer('performance-test-container')
  })

  afterEach(() => {
    cleanupTestContainer(container)
  })

  describe('大数据量渲染性能', () => {
    it('应该能够快速渲染 10K 数据点', () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        name: `点${i}`,
        value: Math.random() * 100,
      }))

      const start = performance.now()
      const chart = new Chart(container, {
        type: 'line',
        data: largeData,
      })
      const end = performance.now()

      expect(end - start).toBeLessThan(1000) // 应该在 1 秒内完成
      expect(mockEChartsInstance.setOption).toHaveBeenCalled()

      chart.dispose()
    })

    it('应该能够快速渲染 100 个系列', () => {
      const categories = Array.from({ length: 100 }, (_, i) => `分类${i}`)
      const series = Array.from({ length: 100 }, (_, i) => ({
        name: `系列${i}`,
        data: Array.from({ length: 100 }, () => Math.random() * 100),
      }))

      const largeData = { categories, series }

      const start = performance.now()
      const chart = new Chart(container, {
        type: 'bar',
        data: largeData,
      })
      const end = performance.now()

      expect(end - start).toBeLessThan(2000) // 应该在 2 秒内完成
      expect(mockEChartsInstance.setOption).toHaveBeenCalled()

      chart.dispose()
    })

    it('应该能够快速处理散点图大数据', () => {
      const scatterData = Array.from({ length: 50000 }, (_, i) => ({
        name: `点${i}`,
        value: [Math.random() * 100, Math.random() * 100],
      }))

      const start = performance.now()
      const chart = new Chart(container, {
        type: 'scatter',
        data: scatterData,
      })
      const end = performance.now()

      expect(end - start).toBeLessThan(1500) // 应该在 1.5 秒内完成

      chart.dispose()
    })
  })

  describe('数据更新性能', () => {
    it('应该能够快速更新大量数据', () => {
      const chart = new Chart(container, {
        type: 'line',
        data: Array.from({ length: 1000 }, (_, i) => ({
          name: `点${i}`,
          value: Math.random() * 100,
        })),
      })

      const newData = Array.from({ length: 1000 }, (_, i) => ({
        name: `新点${i}`,
        value: Math.random() * 100,
      }))

      const start = performance.now()
      chart.updateData(newData)
      const end = performance.now()

      expect(end - start).toBeLessThan(100) // 应该在 100ms 内完成

      chart.dispose()
    })

    it('应该能够快速进行多次连续更新', () => {
      const chart = new Chart(container, {
        type: 'line',
        data: Array.from({ length: 100 }, (_, i) => ({
          name: `点${i}`,
          value: Math.random() * 100,
        })),
      })

      const updates = 100
      const start = performance.now()

      for (let i = 0; i < updates; i++) {
        const newData = Array.from({ length: 100 }, (_, j) => ({
          name: `点${j}`,
          value: Math.random() * 100,
        }))
        chart.updateData(newData)
      }

      const end = performance.now()

      expect(end - start).toBeLessThan(1000) // 100 次更新应该在 1 秒内完成

      chart.dispose()
    })
  })

  describe('适配器性能', () => {
    it('DataAdapter 应该快速处理大数据', () => {
      const adapter = new DataAdapter()
      const largeData = Array.from({ length: 100000 }, (_, i) => ({
        name: `点${i}`,
        value: Math.random() * 100,
      }))

      const start = performance.now()
      const result = adapter.adapt(largeData, 'line')
      const end = performance.now()

      expect(end - start).toBeLessThan(500) // 应该在 500ms 内完成
      expect(result.categories).toHaveLength(100000)
      expect(result.series[0].data).toHaveLength(100000)
    })

    it('LineAdapter 应该快速处理时间序列数据', () => {
      const adapter = new LineAdapter()
      const timeSeriesData = Array.from({ length: 10000 }, (_, i) => ({
        time: new Date(2023, 0, 1, 0, i).toISOString(),
        value: Math.random() * 100,
      }))

      const start = performance.now()
      const result = adapter.adaptTimeSeries(timeSeriesData)
      const end = performance.now()

      expect(end - start).toBeLessThan(300) // 应该在 300ms 内完成
      expect(result.series[0].data).toHaveLength(10000)
    })

    it('BarAdapter 应该快速处理堆叠数据', () => {
      const adapter = new BarAdapter()
      const stackedData = {
        categories: Array.from({ length: 1000 }, (_, i) => `分类${i}`),
        series: Array.from({ length: 50 }, (_, i) => ({
          name: `系列${i}`,
          data: Array.from({ length: 1000 }, () => Math.random() * 100),
        })),
      }

      const start = performance.now()
      const result = adapter.adaptStacked(stackedData)
      const end = performance.now()

      expect(end - start).toBeLessThan(400) // 应该在 400ms 内完成
      expect(result.series).toHaveLength(50)
    })

    it('PieAdapter 应该快速处理大量分类', () => {
      const adapter = new PieAdapter()
      const pieData = Array.from({ length: 1000 }, (_, i) => ({
        name: `分类${i}`,
        value: Math.random() * 100,
      }))

      const start = performance.now()
      const result = adapter.adapt(pieData, 'pie')
      const end = performance.now()

      expect(end - start).toBeLessThan(200) // 应该在 200ms 内完成
      expect(result.series[0].data).toHaveLength(1000)
    })
  })

  describe('主题管理性能', () => {
    it('应该快速切换主题', () => {
      const themeManager = new ThemeManager()

      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        themeManager.setCurrentTheme('light')
        themeManager.setCurrentTheme('dark')
        themeManager.setCurrentTheme('colorful')
      }
      const end = performance.now()

      expect(end - start).toBeLessThan(500) // 3000 次切换应该在 500ms 内完成
    })

    it('应该快速创建自定义主题', () => {
      const themeManager = new ThemeManager()

      const start = performance.now()
      for (let i = 0; i < 100; i++) {
        themeManager.createCustomTheme(`custom-${i}`, 'light', {
          colors: {
            primary: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          },
        })
      }
      const end = performance.now()

      expect(end - start).toBeLessThan(200) // 100 个自定义主题应该在 200ms 内完成
    })

    it('应该快速获取 ECharts 主题配置', () => {
      const themeManager = new ThemeManager()

      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        themeManager.getEChartsTheme('light')
        themeManager.getEChartsTheme('dark')
        themeManager.getEChartsTheme('colorful')
      }
      const end = performance.now()

      expect(end - start).toBeLessThan(50) // 3000 次获取应该在 50ms 内完成
    })
  })

  describe('内存使用性能', () => {
    it('应该正确清理图表实例', () => {
      const charts: Chart[] = []

      // 创建多个图表实例
      for (let i = 0; i < 100; i++) {
        const testContainer = createTestContainer(`test-${i}`)
        const chart = new Chart(testContainer, {
          type: 'line',
          data: Array.from({ length: 100 }, (_, j) => ({
            name: `点${j}`,
            value: Math.random() * 100,
          })),
        })
        charts.push(chart)
      }

      // 销毁所有图表
      const start = performance.now()
      charts.forEach(chart => {
        chart.dispose()
        cleanupTestContainer(chart.container)
      })
      const end = performance.now()

      expect(end - start).toBeLessThan(500) // 销毁 100 个图表应该在 500ms 内完成
      expect(mockEChartsInstance.dispose).toHaveBeenCalledTimes(100)
    })

    it('应该避免内存泄漏', () => {
      // 模拟内存使用监控
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0

      // 创建和销毁大量图表
      for (let i = 0; i < 50; i++) {
        const testContainer = createTestContainer(`memory-test-${i}`)
        const chart = new Chart(testContainer, {
          type: 'line',
          data: Array.from({ length: 1000 }, (_, j) => ({
            name: `点${j}`,
            value: Math.random() * 100,
          })),
        })

        // 立即销毁
        chart.dispose()
        cleanupTestContainer(testContainer)
      }

      // 强制垃圾回收（如果支持）
      if (global.gc) {
        global.gc()
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0

      // 内存增长应该在合理范围内（考虑到测试环境的限制）
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024) // 不应超过 10MB
      }
    })
  })

  describe('响应式性能', () => {
    it('应该快速响应容器大小变化', () => {
      const chart = new Chart(container, {
        type: 'line',
        data: Array.from({ length: 1000 }, (_, i) => ({
          name: `点${i}`,
          value: Math.random() * 100,
        })),
        responsive: true,
      })

      const start = performance.now()
      for (let i = 0; i < 100; i++) {
        chart.resize({
          width: 400 + i,
          height: 300 + i
        })
      }
      const end = performance.now()

      expect(end - start).toBeLessThan(200) // 100 次调整应该在 200ms 内完成
      expect(mockEChartsInstance.resize).toHaveBeenCalledTimes(100)

      chart.dispose()
    })
  })

  describe('并发性能', () => {
    it('应该能够同时创建多个图表', async () => {
      const containers = Array.from({ length: 10 }, (_, i) =>
        createTestContainer(`concurrent-${i}`)
      )

      const start = performance.now()

      const chartPromises = containers.map(async (testContainer, i) => {
        return new Chart(testContainer, {
          type: 'line',
          data: Array.from({ length: 100 }, (_, j) => ({
            name: `点${j}`,
            value: Math.random() * 100,
          })),
        })
      })

      const charts = await Promise.all(chartPromises)
      const end = performance.now()

      expect(end - start).toBeLessThan(1000) // 10 个图表应该在 1 秒内完成
      expect(charts).toHaveLength(10)

      // 清理
      charts.forEach(chart => {
        chart.dispose()
        cleanupTestContainer(chart.container)
      })
    })
  })
})
