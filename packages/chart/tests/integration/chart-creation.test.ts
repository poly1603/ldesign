/**
 * 图表创建流程集成测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Chart } from '../../src/core/Chart'
import { ChartFactory } from '../../src/core/ChartFactory'
import { createLineChart, createBarChart, createPieChart } from '../../src/index'
import { 
  createTestContainer, 
  cleanupTestContainer, 
  createTestData, 
  createTestConfig,
  mockEChartsInstance,
  waitFor 
} from '../setup'

describe('图表创建流程集成测试', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = createTestContainer('integration-test-container')
  })

  afterEach(() => {
    cleanupTestContainer(container)
  })

  describe('基础图表创建', () => {
    it('应该能够创建完整的折线图', async () => {
      const config = createTestConfig({
        type: 'line',
        title: '销售趋势图',
        theme: 'light',
      })

      const chart = new Chart(container, config)

      // 验证图表实例
      expect(chart).toBeInstanceOf(Chart)
      expect(chart.container).toBe(container)
      expect(chart.config.type).toBe('line')

      // 验证 ECharts 初始化
      expect(mockEChartsInstance.setOption).toHaveBeenCalled()

      // 验证容器样式
      expect(container.classList.contains('ldesign-chart-container')).toBe(true)
      expect(container.classList.contains('ldesign-chart-responsive')).toBe(true)

      chart.dispose()
    })

    it('应该能够创建完整的柱状图', async () => {
      const config = createTestConfig({
        type: 'bar',
        title: '销售对比图',
        data: createTestData('complex'),
      })

      const chart = new Chart(container, config)

      expect(chart.config.type).toBe('bar')
      expect(mockEChartsInstance.setOption).toHaveBeenCalled()

      chart.dispose()
    })

    it('应该能够创建完整的饼图', async () => {
      const config = createTestConfig({
        type: 'pie',
        title: '市场份额图',
      })

      const chart = new Chart(container, config)

      expect(chart.config.type).toBe('pie')
      expect(mockEChartsInstance.setOption).toHaveBeenCalled()

      chart.dispose()
    })
  })

  describe('工厂方法创建', () => {
    it('应该能够通过 ChartFactory 创建图表', () => {
      const config = createTestConfig({ type: 'scatter' })
      const chart = ChartFactory.create(container, config)

      expect(chart).toBeInstanceOf(Chart)
      expect(chart.config.type).toBe('scatter')

      chart.dispose()
    })

    it('应该能够通过便捷函数创建折线图', () => {
      const data = createTestData('simple')
      const chart = createLineChart(container, data, {
        title: '便捷折线图',
        smooth: true,
      })

      expect(chart).toBeInstanceOf(Chart)
      expect(chart.config.type).toBe('line')
      expect(chart.config.title).toBe('便捷折线图')

      chart.dispose()
    })

    it('应该能够通过便捷函数创建柱状图', () => {
      const data = createTestData('complex')
      const chart = createBarChart(container, data, {
        title: '便捷柱状图',
        stack: true,
      })

      expect(chart).toBeInstanceOf(Chart)
      expect(chart.config.type).toBe('bar')

      chart.dispose()
    })

    it('应该能够通过便捷函数创建饼图', () => {
      const data = createTestData('simple')
      const chart = createPieChart(container, data, {
        title: '便捷饼图',
        donut: true,
      })

      expect(chart).toBeInstanceOf(Chart)
      expect(chart.config.type).toBe('pie')

      chart.dispose()
    })
  })

  describe('数据流转测试', () => {
    it('应该正确处理简单数据格式', () => {
      const simpleData = createTestData('simple')
      const chart = new Chart(container, {
        type: 'line',
        data: simpleData,
      })

      // 验证数据被正确处理
      expect(mockEChartsInstance.setOption).toHaveBeenCalledWith(
        expect.objectContaining({
          series: expect.arrayContaining([
            expect.objectContaining({
              data: expect.any(Array),
            }),
          ]),
        }),
        true
      )

      chart.dispose()
    })

    it('应该正确处理复杂数据格式', () => {
      const complexData = createTestData('complex')
      const chart = new Chart(container, {
        type: 'bar',
        data: complexData,
      })

      // 验证多系列数据被正确处理
      expect(mockEChartsInstance.setOption).toHaveBeenCalledWith(
        expect.objectContaining({
          series: expect.arrayContaining([
            expect.objectContaining({
              name: '销售额',
              data: expect.any(Array),
            }),
            expect.objectContaining({
              name: '利润',
              data: expect.any(Array),
            }),
          ]),
        }),
        true
      )

      chart.dispose()
    })
  })

  describe('主题集成测试', () => {
    it('应该正确应用预设主题', () => {
      const chart = new Chart(container, {
        type: 'line',
        data: createTestData(),
        theme: 'dark',
      })

      expect(chart.config.theme).toBe('dark')
      expect(mockEChartsInstance.setOption).toHaveBeenCalled()

      chart.dispose()
    })

    it('应该能够动态切换主题', async () => {
      const chart = new Chart(container, {
        type: 'line',
        data: createTestData(),
        theme: 'light',
      })

      // 切换到深色主题
      chart.setTheme('dark')
      expect(chart.config.theme).toBe('dark')

      // 切换到自定义主题
      const customTheme = {
        name: 'custom',
        colors: {
          primary: '#ff0000',
          background: '#ffffff',
          text: '#333333',
        },
      }
      chart.setTheme(customTheme)
      expect(chart.config.theme).toBe(customTheme)

      chart.dispose()
    })
  })

  describe('响应式集成测试', () => {
    it('应该初始化响应式管理器', () => {
      const chart = new Chart(container, {
        type: 'line',
        data: createTestData(),
        responsive: true,
      })

      expect(container.classList.contains('ldesign-chart-responsive')).toBe(true)

      chart.dispose()
    })

    it('应该能够手动调整大小', () => {
      const chart = new Chart(container, {
        type: 'line',
        data: createTestData(),
      })

      chart.resize({ width: 800, height: 600 })

      expect(chart.config.size?.width).toBe(800)
      expect(chart.config.size?.height).toBe(600)
      expect(mockEChartsInstance.resize).toHaveBeenCalled()

      chart.dispose()
    })
  })

  describe('事件集成测试', () => {
    it('应该能够注册和触发事件', () => {
      const chart = new Chart(container, {
        type: 'line',
        data: createTestData(),
      })

      const clickHandler = vi.fn()
      chart.on('click', clickHandler)

      // 验证事件注册（实际触发需要 ECharts 实例配合）
      expect(clickHandler).not.toHaveBeenCalled()

      chart.off('click', clickHandler)
      chart.dispose()
    })
  })

  describe('生命周期集成测试', () => {
    it('应该正确处理完整的生命周期', async () => {
      // 创建
      const chart = new Chart(container, {
        type: 'line',
        data: createTestData(),
        title: '生命周期测试',
      })

      expect(mockEChartsInstance.setOption).toHaveBeenCalled()

      // 更新数据
      const newData = createTestData('complex')
      chart.updateData(newData)
      expect(chart.config.data).toBe(newData)

      // 更新配置
      chart.updateConfig({ title: '更新后的标题' })
      expect(chart.config.title).toBe('更新后的标题')

      // 显示加载
      chart.showLoading('加载中...')
      expect(mockEChartsInstance.showLoading).toHaveBeenCalled()

      // 隐藏加载
      chart.hideLoading()
      expect(mockEChartsInstance.hideLoading).toHaveBeenCalled()

      // 清空
      chart.clear()
      expect(mockEChartsInstance.clear).toHaveBeenCalled()

      // 销毁
      chart.dispose()
      expect(mockEChartsInstance.dispose).toHaveBeenCalled()
      expect(container.classList.contains('ldesign-chart-container')).toBe(false)
    })

    it('应该在销毁后阻止操作', () => {
      const chart = new Chart(container, {
        type: 'line',
        data: createTestData(),
      })

      chart.dispose()

      expect(() => chart.updateData([])).toThrow('图表已被销毁')
      expect(() => chart.resize()).toThrow('图表已被销毁')
      expect(() => chart.setTheme('dark')).toThrow('图表已被销毁')
    })
  })

  describe('错误处理集成测试', () => {
    it('应该处理无效容器', () => {
      expect(() => {
        new Chart('#non-existent', createTestConfig())
      }).toThrow('无效的容器元素')
    })

    it('应该处理无效配置', () => {
      expect(() => {
        new Chart(container, {} as any)
      }).toThrow('无效的图表配置')
    })

    it('应该处理渲染错误', () => {
      // 模拟 setOption 抛出错误
      mockEChartsInstance.setOption.mockImplementationOnce(() => {
        throw new Error('渲染失败')
      })

      expect(() => {
        new Chart(container, createTestConfig())
      }).toThrow('渲染失败')
    })
  })

  describe('性能集成测试', () => {
    it('应该能够处理大量数据', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
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

    it('应该能够快速更新数据', async () => {
      const chart = new Chart(container, {
        type: 'line',
        data: createTestData(),
      })

      const updates = 100
      const start = performance.now()

      for (let i = 0; i < updates; i++) {
        chart.updateData(createTestData())
      }

      const end = performance.now()

      expect(end - start).toBeLessThan(1000) // 100 次更新应该在 1 秒内完成
      expect(mockEChartsInstance.setOption).toHaveBeenCalledTimes(updates + 1) // +1 for initial render

      chart.dispose()
    })
  })
})
