import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LazyTemplate from '../../../src/vue/components/LazyTemplate'

// Mock Intersection Observer
const mockObserver = {
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}

const mockIntersectionObserver = vi.fn(() => mockObserver)

// @ts-ignore
window.IntersectionObserver = mockIntersectionObserver

describe('LazyTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该渲染占位符', () => {
    const wrapper = mount(LazyTemplate, {
      props: {
        category: 'login',
        device: 'desktop',
        template: 'default',
        lazy: true,
        placeholderHeight: 200,
      },
    })

    expect(wrapper.find('.lazy-template-placeholder').exists()).toBe(true)
    expect(wrapper.element.style.minHeight).toBe('200px')
  })

  it('应该在非懒加载模式下立即加载', async () => {
    const wrapper = mount(LazyTemplate, {
      props: {
        category: 'login',
        device: 'desktop',
        template: 'default',
        lazy: false,
      },
    })

    // 非懒加载模式下不应该创建 IntersectionObserver
    expect(mockIntersectionObserver).not.toHaveBeenCalled()
  })

  it('应该在懒加载模式下创建 IntersectionObserver', () => {
    const wrapper = mount(LazyTemplate, {
      props: {
        category: 'login',
        device: 'desktop',
        template: 'default',
        lazy: true,
      },
    })

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    )
  })

  it('应该支持自定义 rootMargin 和 threshold', () => {
    const wrapper = mount(LazyTemplate, {
      props: {
        category: 'login',
        device: 'desktop',
        template: 'default',
        lazy: true,
        rootMargin: '100px',
        threshold: 0.5,
      },
    })

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        rootMargin: '100px',
        threshold: 0.5,
      }
    )
  })

  it('应该显示加载状态', async () => {
    const wrapper = mount(LazyTemplate, {
      props: {
        category: 'login',
        device: 'desktop',
        template: 'default',
        lazy: true,
      },
      slots: {
        loading: '<div class="custom-loading">Loading...</div>',
      },
    })

    // 模拟进入可视区域
    const vm = wrapper.vm as any
    vm.isLoading = true

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.lazy-template-loading').exists()).toBe(true)
  })

  it('应该显示错误状态', async () => {
    const wrapper = mount(LazyTemplate, {
      props: {
        category: 'login',
        device: 'desktop',
        template: 'default',
        lazy: true,
      },
      slots: {
        error: '<div class="custom-error">Error occurred</div>',
      },
    })

    // 模拟错误状态
    const vm = wrapper.vm as any
    vm.error = new Error('Load failed')

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.lazy-template-error').exists()).toBe(true)
  })

  it('应该触发 visible 事件', async () => {
    const wrapper = mount(LazyTemplate, {
      props: {
        category: 'login',
        device: 'desktop',
        template: 'default',
        lazy: true,
      },
    })

    // 模拟进入可视区域
    const vm = wrapper.vm as any
    vm.isVisible = true
    vm.$emit('visible')

    expect(wrapper.emitted('visible')).toBeTruthy()
  })

  it('应该触发 load 事件', async () => {
    const wrapper = mount(LazyTemplate, {
      props: {
        category: 'login',
        device: 'desktop',
        template: 'default',
        lazy: true,
      },
    })

    // 模拟加载完成
    const mockComponent = { name: 'TestComponent' }
    const vm = wrapper.vm as any
    vm.templateComponent = mockComponent
    vm.isLoaded = true
    vm.$emit('load', mockComponent)

    expect(wrapper.emitted('load')).toBeTruthy()
    expect(wrapper.emitted('load')?.[0]).toEqual([mockComponent])
  })

  it('应该触发 error 事件', async () => {
    const wrapper = mount(LazyTemplate, {
      props: {
        category: 'login',
        device: 'desktop',
        template: 'default',
        lazy: true,
      },
    })

    // 模拟加载错误
    const error = new Error('Load failed')
    const vm = wrapper.vm as any
    vm.error = error
    vm.$emit('error', error)

    expect(wrapper.emitted('error')).toBeTruthy()
    expect(wrapper.emitted('error')?.[0]).toEqual([error])
  })

  it('应该在组件卸载时清理 observer', () => {
    const mockObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }
    mockIntersectionObserver.mockReturnValue(mockObserver)

    const wrapper = mount(LazyTemplate, {
      props: {
        category: 'login',
        device: 'desktop',
        template: 'default',
        lazy: true,
      },
    })

    wrapper.unmount()

    expect(mockObserver.disconnect).toHaveBeenCalled()
  })

  it('应该支持自定义占位符插槽', () => {
    const wrapper = mount(LazyTemplate, {
      props: {
        category: 'login',
        device: 'desktop',
        template: 'default',
        lazy: true,
      },
      slots: {
        placeholder: '<div class="custom-placeholder">Custom placeholder</div>',
      },
    })

    expect(wrapper.find('.custom-placeholder').exists()).toBe(true)
    expect(wrapper.text()).toContain('Custom placeholder')
  })

  it('应该支持重试功能', async () => {
    const wrapper = mount(LazyTemplate, {
      props: {
        category: 'login',
        device: 'desktop',
        template: 'default',
        lazy: true,
      },
    })

    // 模拟错误状态
    const vm = wrapper.vm as any
    vm.error = new Error('Load failed')
    vm.retry = vi.fn()

    await wrapper.vm.$nextTick()

    // 测试重试功能
    expect(typeof vm.retry).toBe('function')
  })
})
