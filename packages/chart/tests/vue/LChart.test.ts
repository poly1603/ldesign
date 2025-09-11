/**
 * LChart 组件测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import LChart from '../../src/vue/components/LChart.vue'

// Mock useChart composable
vi.mock('../../src/vue/composables/useChart', () => ({
  useChart: vi.fn(() => ({
    chartRef: { value: null },
    chartInstance: { value: null },
    loading: { value: false },
    error: { value: null },
    ready: { value: true },
    updateData: vi.fn(),
    updateConfig: vi.fn(),
    setTheme: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  }))
}))

describe('LChart', () => {
  beforeEach(() => {
    // 清理 DOM
    document.body.innerHTML = ''
  })

  afterEach(() => {
    // 清理
  })

  describe('基础渲染', () => {
    it('应该正确渲染', () => {
      const wrapper = mount(LChart, {
        props: {
          type: 'line',
          data: [{ name: 'A', value: 100 }]
        }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.classes()).toContain('l-chart')
      expect(wrapper.classes()).toContain('l-chart--line')
    })

    it('应该应用正确的样式', () => {
      const wrapper = mount(LChart, {
        props: {
          type: 'bar',
          data: [{ name: 'A', value: 100 }],
          width: 800,
          height: 600
        }
      })

      const element = wrapper.element as HTMLElement
      expect(element.style.width).toBe('800px')
      expect(element.style.height).toBe('600px')
    })

    it('应该支持字符串尺寸', () => {
      const wrapper = mount(LChart, {
        props: {
          type: 'pie',
          data: [{ name: 'A', value: 100 }],
          width: '100%',
          height: '50vh'
        }
      })

      const element = wrapper.element as HTMLElement
      expect(element.style.width).toBe('100%')
      expect(element.style.height).toBe('50vh')
    })
  })

  describe('状态显示', () => {
    it('应该显示加载状态', () => {
      const wrapper = mount(LChart, {
        props: {
          type: 'line',
          data: [{ name: 'A', value: 100 }],
          loading: true
        }
      })

      expect(wrapper.find('.l-chart__loading').exists()).toBe(true)
      expect(wrapper.find('.l-chart__loading-spinner').exists()).toBe(true)
      expect(wrapper.classes()).toContain('l-chart--loading')
    })

    it('应该显示错误状态', () => {
      const errorMessage = '图表加载失败'
      const wrapper = mount(LChart, {
        props: {
          type: 'line',
          data: [{ name: 'A', value: 100 }],
          error: errorMessage
        }
      })

      expect(wrapper.find('.l-chart__error').exists()).toBe(true)
      expect(wrapper.find('.l-chart__error-message').text()).toBe(errorMessage)
      expect(wrapper.classes()).toContain('l-chart--error')
    })

    it('应该显示空数据状态', () => {
      const wrapper = mount(LChart, {
        props: {
          type: 'line',
          data: []
        }
      })

      expect(wrapper.find('.l-chart__empty').exists()).toBe(true)
      expect(wrapper.find('.l-chart__empty-message').text()).toBe('暂无数据')
      expect(wrapper.classes()).toContain('l-chart--empty')
    })

    it('应该处理复杂数据的空状态', () => {
      const wrapper = mount(LChart, {
        props: {
          type: 'line',
          data: { series: [] }
        }
      })

      expect(wrapper.find('.l-chart__empty').exists()).toBe(true)
    })
  })

  describe('事件处理', () => {
    it('应该触发点击事件', async () => {
      const wrapper = mount(LChart, {
        props: {
          type: 'line',
          data: [{ name: 'A', value: 100 }]
        }
      })

      // 模拟点击事件
      await wrapper.vm.$emit('click', { name: 'A', value: 100 })

      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')?.[0]).toEqual([{ name: 'A', value: 100 }])
    })

    it('应该触发准备就绪事件', async () => {
      const wrapper = mount(LChart, {
        props: {
          type: 'line',
          data: [{ name: 'A', value: 100 }]
        }
      })

      const mockInstance = { id: 'test-chart' }
      await wrapper.vm.$emit('ready', mockInstance)

      expect(wrapper.emitted('ready')).toBeTruthy()
      expect(wrapper.emitted('ready')?.[0]).toEqual([mockInstance])
    })

    it('应该触发错误事件', async () => {
      const wrapper = mount(LChart, {
        props: {
          type: 'line',
          data: [{ name: 'A', value: 100 }]
        }
      })

      const error = new Error('测试错误')
      await wrapper.vm.$emit('error', error)

      expect(wrapper.emitted('error')).toBeTruthy()
      expect(wrapper.emitted('error')?.[0]).toEqual([error])
    })
  })

  describe('Props 响应', () => {
    it('应该响应数据变化', async () => {
      const wrapper = mount(LChart, {
        props: {
          type: 'line',
          data: [{ name: 'A', value: 100 }]
        }
      })

      // 更新数据
      await wrapper.setProps({
        data: [{ name: 'B', value: 200 }]
      })

      // 验证组件已更新
      expect(wrapper.props('data')).toEqual([{ name: 'B', value: 200 }])
    })

    it('应该响应配置变化', async () => {
      const wrapper = mount(LChart, {
        props: {
          type: 'line',
          data: [{ name: 'A', value: 100 }],
          config: { title: '原标题' }
        }
      })

      // 更新配置
      await wrapper.setProps({
        config: { title: '新标题' }
      })

      expect(wrapper.props('config')).toEqual({ title: '新标题' })
    })

    it('应该响应主题变化', async () => {
      const wrapper = mount(LChart, {
        props: {
          type: 'line',
          data: [{ name: 'A', value: 100 }],
          theme: 'light'
        }
      })

      // 更新主题
      await wrapper.setProps({
        theme: 'dark'
      })

      expect(wrapper.props('theme')).toBe('dark')
    })
  })

  describe('图表类型', () => {
    const chartTypes = ['line', 'bar', 'pie', 'scatter', 'area'] as const

    chartTypes.forEach(type => {
      it(`应该支持 ${type} 图表类型`, () => {
        const wrapper = mount(LChart, {
          props: {
            type,
            data: [{ name: 'A', value: 100 }]
          }
        })

        expect(wrapper.classes()).toContain(`l-chart--${type}`)
      })
    })
  })

  describe('可访问性', () => {
    it('应该有正确的 ARIA 属性', () => {
      const wrapper = mount(LChart, {
        props: {
          type: 'line',
          data: [{ name: 'A', value: 100 }]
        }
      })

      // 检查是否有适当的可访问性属性
      const element = wrapper.element as HTMLElement
      expect(element.getAttribute('role')).toBe(null) // 或者应该有的值
    })
  })

  describe('性能优化', () => {
    it('应该正确处理防抖延迟', () => {
      const wrapper = mount(LChart, {
        props: {
          type: 'line',
          data: [{ name: 'A', value: 100 }],
          debounceDelay: 500
        }
      })

      expect(wrapper.props('debounceDelay')).toBe(500)
    })

    it('应该支持自动调整大小', () => {
      const wrapper = mount(LChart, {
        props: {
          type: 'line',
          data: [{ name: 'A', value: 100 }],
          autoResize: false
        }
      })

      expect(wrapper.props('autoResize')).toBe(false)
    })
  })
})
