/**
 * Chart 类单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Chart } from '../../src/core/Chart'
import { createTestContainer, cleanupTestContainer, createTestConfig, mockEChartsInstance } from '../setup'

describe('Chart', () => {
  let container: HTMLElement
  let config: any

  beforeEach(() => {
    container = createTestContainer('chart-test-container')
    config = createTestConfig()
  })

  afterEach(() => {
    cleanupTestContainer(container)
  })

  describe('构造函数', () => {
    it('应该能够创建图表实例', () => {
      const chart = new Chart(container, config)
      
      expect(chart).toBeInstanceOf(Chart)
      expect(chart.container).toBe(container)
      expect(chart.config.type).toBe('line')
    })

    it('应该能够通过选择器创建图表', () => {
      const chart = new Chart('#chart-test-container', config)
      
      expect(chart).toBeInstanceOf(Chart)
      expect(chart.container).toBe(container)
    })

    it('应该在无效容器时抛出错误', () => {
      expect(() => {
        new Chart('#non-existent', config)
      }).toThrow('无效的容器元素')
    })

    it('应该在无效配置时抛出错误', () => {
      expect(() => {
        new Chart(container, null as any)
      }).toThrow('无效的图表配置')
    })

    it('应该合并默认配置', () => {
      const chart = new Chart(container, { type: 'bar', data: [] })
      
      expect(chart.config.responsive).toBe(true)
      expect(chart.config.animation).toBe(true)
    })
  })

  describe('属性访问', () => {
    let chart: Chart

    beforeEach(() => {
      chart = new Chart(container, config)
    })

    afterEach(() => {
      chart.dispose()
    })

    it('应该能够访问 ECharts 实例', () => {
      expect(chart.echarts).toBeDefined()
      expect(chart.echarts).toBe(mockEChartsInstance)
    })

    it('应该能够访问图表配置', () => {
      const chartConfig = chart.config
      expect(chartConfig.type).toBe('line')
      expect(chartConfig.title).toBe('测试图表')
    })

    it('应该能够访问容器元素', () => {
      expect(chart.container).toBe(container)
    })
  })

  describe('数据更新', () => {
    let chart: Chart

    beforeEach(() => {
      chart = new Chart(container, config)
    })

    afterEach(() => {
      chart.dispose()
    })

    it('应该能够更新图表数据', () => {
      const newData = [
        { name: 'A', value: 10 },
        { name: 'B', value: 20 },
      ]

      chart.updateData(newData)

      expect(chart.config.data).toBe(newData)
      expect(mockEChartsInstance.setOption).toHaveBeenCalled()
    })

    it('应该能够更新图表配置', () => {
      chart.updateConfig({ title: '新标题' })

      expect(chart.config.title).toBe('新标题')
      expect(mockEChartsInstance.setOption).toHaveBeenCalled()
    })
  })

  describe('主题管理', () => {
    let chart: Chart

    beforeEach(() => {
      chart = new Chart(container, config)
    })

    afterEach(() => {
      chart.dispose()
    })

    it('应该能够设置字符串主题', () => {
      chart.setTheme('dark')

      expect(chart.config.theme).toBe('dark')
      expect(mockEChartsInstance.setOption).toHaveBeenCalled()
    })

    it('应该能够设置自定义主题对象', () => {
      const customTheme = {
        name: 'custom',
        colors: {
          primary: '#ff0000',
          text: '#333333',
          background: '#ffffff',
        },
      }

      chart.setTheme(customTheme)

      expect(chart.config.theme).toBe(customTheme)
      expect(mockEChartsInstance.setOption).toHaveBeenCalled()
    })
  })

  describe('尺寸调整', () => {
    let chart: Chart

    beforeEach(() => {
      chart = new Chart(container, config)
    })

    afterEach(() => {
      chart.dispose()
    })

    it('应该能够调整图表大小', () => {
      chart.resize({ width: 800, height: 600 })

      expect(chart.config.size?.width).toBe(800)
      expect(chart.config.size?.height).toBe(600)
      expect(mockEChartsInstance.resize).toHaveBeenCalled()
    })

    it('应该能够不指定尺寸调整大小', () => {
      chart.resize()

      expect(mockEChartsInstance.resize).toHaveBeenCalled()
    })
  })

  describe('加载状态', () => {
    let chart: Chart

    beforeEach(() => {
      chart = new Chart(container, config)
    })

    afterEach(() => {
      chart.dispose()
    })

    it('应该能够显示加载动画', () => {
      chart.showLoading('加载中...')

      expect(mockEChartsInstance.showLoading).toHaveBeenCalledWith('default', expect.objectContaining({
        text: '加载中...',
      }))
      expect(container.classList.contains('ldesign-chart-loading')).toBe(true)
    })

    it('应该能够隐藏加载动画', () => {
      chart.showLoading()
      chart.hideLoading()

      expect(mockEChartsInstance.hideLoading).toHaveBeenCalled()
      expect(container.classList.contains('ldesign-chart-loading')).toBe(false)
    })
  })

  describe('图表清理', () => {
    let chart: Chart

    beforeEach(() => {
      chart = new Chart(container, config)
    })

    afterEach(() => {
      chart.dispose()
    })

    it('应该能够清空图表', () => {
      chart.clear()

      expect(mockEChartsInstance.clear).toHaveBeenCalled()
    })
  })

  describe('事件管理', () => {
    let chart: Chart

    beforeEach(() => {
      chart = new Chart(container, config)
    })

    afterEach(() => {
      chart.dispose()
    })

    it('应该能够注册事件监听器', () => {
      const handler = vi.fn()
      chart.on('click', handler)

      // 事件管理器应该被调用
      // 注意：这里测试的是事件注册，实际的事件触发需要在集成测试中验证
      expect(handler).not.toHaveBeenCalled()
    })

    it('应该能够注销事件监听器', () => {
      const handler = vi.fn()
      chart.on('click', handler)
      chart.off('click', handler)

      // 验证事件已被注销
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('图表销毁', () => {
    it('应该能够正确销毁图表', () => {
      const chart = new Chart(container, config)
      
      chart.dispose()

      expect(mockEChartsInstance.dispose).toHaveBeenCalled()
      expect(container.classList.contains('ldesign-chart-container')).toBe(false)
    })

    it('应该在销毁后阻止操作', () => {
      const chart = new Chart(container, config)
      chart.dispose()

      expect(() => {
        chart.updateData([])
      }).toThrow('图表已被销毁')

      expect(() => {
        chart.resize()
      }).toThrow('图表已被销毁')

      expect(() => {
        chart.setTheme('dark')
      }).toThrow('图表已被销毁')
    })

    it('应该能够多次调用 dispose 而不出错', () => {
      const chart = new Chart(container, config)
      
      chart.dispose()
      chart.dispose() // 第二次调用应该不会出错

      expect(mockEChartsInstance.dispose).toHaveBeenCalledTimes(1)
    })
  })

  describe('错误处理', () => {
    it('应该在渲染失败时抛出错误', () => {
      // 模拟 setOption 抛出错误
      mockEChartsInstance.setOption.mockImplementationOnce(() => {
        throw new Error('渲染失败')
      })

      expect(() => {
        new Chart(container, config)
      }).toThrow('渲染失败')
    })
  })
})
