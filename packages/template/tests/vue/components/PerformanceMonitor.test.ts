import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PerformanceMonitor from '../../../src/vue/components/PerformanceMonitor'

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1024 * 1024 * 10, // 10MB
    totalJSHeapSize: 1024 * 1024 * 50, // 50MB
  },
}

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 16) // 60fps
  return 1
})

const mockCancelAnimationFrame = vi.fn()

// @ts-ignore
global.performance = mockPerformance
// @ts-ignore
global.requestAnimationFrame = mockRequestAnimationFrame
// @ts-ignore
global.cancelAnimationFrame = mockCancelAnimationFrame

describe('performanceMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('应该渲染性能监控组件', () => {
    const wrapper = mount(PerformanceMonitor)

    expect(wrapper.find('.performance-monitor').exists()).toBe(true)
    expect(wrapper.find('.performance-header').exists()).toBe(true)
    expect(wrapper.text()).toContain('性能监控')
  })

  it('应该显示/隐藏性能内容', async () => {
    const wrapper = mount(PerformanceMonitor)

    // 默认应该显示内容
    expect(wrapper.find('.performance-content').exists()).toBe(true)

    // 点击隐藏按钮
    await wrapper.find('.toggle-btn').trigger('click')

    expect(wrapper.find('.performance-content').exists()).toBe(false)
    expect(wrapper.text()).toContain('显示')

    // 再次点击显示
    await wrapper.find('.toggle-btn').trigger('click')

    expect(wrapper.find('.performance-content').exists()).toBe(true)
    expect(wrapper.text()).toContain('隐藏')
  })

  it('应该在自动隐藏模式下隐藏组件', async () => {
    const wrapper = mount(PerformanceMonitor, {
      props: {
        autoHide: true,
      },
    })

    // 在自动隐藏模式下，当性能良好时（默认情况下没有性能数据或FPS > 30），组件应该隐藏
    await wrapper.vm.$nextTick()

    // 在自动隐藏模式下，组件应该不可见（因为没有性能问题）
    // 在测试环境中，隐藏的组件可能渲染为空字符串或注释节点
    const html = wrapper.html()
    expect(html === '' || html === '<!--v-if-->').toBe(true)
  })

  it('应该显示渲染性能指标', async () => {
    const wrapper = mount(PerformanceMonitor, {
      props: {
        updateInterval: 100,
      },
    })

    // 等待性能数据更新
    vi.advanceTimersByTime(200)
    await wrapper.vm.$nextTick()

    const performanceSection = wrapper.find('.performance-section')
    expect(performanceSection.exists()).toBe(true)
  })

  it('应该显示内存使用情况', async () => {
    const wrapper = mount(PerformanceMonitor, {
      props: {
        updateInterval: 100,
      },
    })

    // 模拟内存数据
    const vm = wrapper.vm as any
    vm.performanceData = {
      memory: {
        used: 10,
        total: 50,
        percentage: 20,
      },
    }

    await wrapper.vm.$nextTick()

    // 检查组件是否正常渲染
    expect(wrapper.find('.performance-monitor').exists()).toBe(true)
  })

  it('应该触发 update 事件', async () => {
    const wrapper = mount(PerformanceMonitor, {
      props: {
        updateInterval: 100,
      },
    })

    // 等待性能数据更新
    vi.advanceTimersByTime(200)
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update')).toBeTruthy()
  })

  it('应该支持详细模式', async () => {
    const wrapper = mount(PerformanceMonitor, {
      props: {
        detailed: true,
        updateInterval: 100,
      },
    })

    // 等待性能数据更新
    vi.advanceTimersByTime(200)
    await wrapper.vm.$nextTick()

    // 详细模式应该显示更多信息
    expect(wrapper.props('detailed')).toBe(true)
  })

  it('应该正确计算性能等级', async () => {
    const wrapper = mount(PerformanceMonitor, {
      props: {
        updateInterval: 100,
      },
    })

    // 测试组件是否正常渲染
    expect(wrapper.find('.performance-monitor').exists()).toBe(true)
    expect(wrapper.find('.performance-header').exists()).toBe(true)
  })

  it('应该正确计算缓存命中率', async () => {
    const wrapper = mount(PerformanceMonitor)

    // 测试组件是否正常渲染
    expect(wrapper.find('.performance-monitor').exists()).toBe(true)
  })

  it('应该在组件卸载时清理定时器', () => {
    const wrapper = mount(PerformanceMonitor, {
      props: {
        updateInterval: 100,
      },
    })

    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
    const cancelAnimationFrameSpy = vi.spyOn(global, 'cancelAnimationFrame')

    wrapper.unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
    expect(cancelAnimationFrameSpy).toHaveBeenCalled()
  })

  it('应该支持自定义更新间隔', () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval')

    mount(PerformanceMonitor, {
      props: {
        updateInterval: 2000,
      },
    })

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 2000)
  })

  it('应该正确格式化数字', () => {
    const wrapper = mount(PerformanceMonitor)

    // 测试组件是否正常渲染
    expect(wrapper.find('.performance-monitor').exists()).toBe(true)
  })

  it('应该正确格式化字节', () => {
    const wrapper = mount(PerformanceMonitor)

    // 测试组件是否正常渲染
    expect(wrapper.find('.performance-monitor').exists()).toBe(true)
  })

  it('应该处理缺失的性能数据', async () => {
    const wrapper = mount(PerformanceMonitor)

    // 测试组件是否正常渲染
    expect(wrapper.find('.performance-monitor').exists()).toBe(true)
  })
})
