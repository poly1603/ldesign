/**
 * DarkModeToggle 组件测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DarkModeToggle from '../../../src/vue/components/DarkModeToggle.vue'

// 模拟 View Transition API
Object.defineProperty(document, 'startViewTransition', {
  value: vi.fn((callback) => {
    callback()
    return {
      finished: Promise.resolve(),
      ready: Promise.resolve()
    }
  }),
  writable: true,
  configurable: true
})

describe('DarkModeToggle', () => {
  beforeEach(() => {
    // 模拟 DOM 环境
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    document.documentElement.setAttribute('data-theme-mode', 'light')
    
    // 模拟 localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })
  })

  it('应该正确渲染切换按钮', () => {
    const wrapper = mount(DarkModeToggle)

    expect(wrapper.find('.dark-mode-toggle').exists()).toBe(true)
    expect(wrapper.find('.dark-mode-toggle__icon').exists()).toBe(true)
  })

  it('应该正确显示亮色模式图标', () => {
    const wrapper = mount(DarkModeToggle)

    expect(wrapper.find('.dark-mode-toggle__sun').exists()).toBe(true)
    expect(wrapper.find('.dark-mode-toggle__moon').exists()).toBe(false)
  })

  it('应该正确显示暗色模式图标', async () => {
    const wrapper = mount(DarkModeToggle)

    // 切换到暗色模式
    await wrapper.find('.dark-mode-toggle').trigger('click')

    expect(wrapper.find('.dark-mode-toggle__moon').exists()).toBe(true)
    expect(wrapper.find('.dark-mode-toggle__sun').exists()).toBe(false)
  })

  it('应该正确处理点击切换', async () => {
    const wrapper = mount(DarkModeToggle)

    const initialMode = wrapper.vm.isDark
    await wrapper.find('.dark-mode-toggle').trigger('click')

    expect(wrapper.vm.isDark).toBe(!initialMode)
    expect(wrapper.emitted('change')).toBeTruthy()
  })

  it('应该正确处理不同尺寸', () => {
    const sizes = ['small', 'medium', 'large'] as const
    
    sizes.forEach(size => {
      const wrapper = mount(DarkModeToggle, {
        props: { size }
      })
      
      expect(wrapper.find(`.dark-mode-toggle--${size}`).exists()).toBe(true)
    })
  })

  it('应该正确处理禁用状态', () => {
    const wrapper = mount(DarkModeToggle, {
      props: { disabled: true }
    })

    expect(wrapper.find('.dark-mode-toggle--disabled').exists()).toBe(true)
  })

  it('应该正确处理禁用状态下的点击', async () => {
    const wrapper = mount(DarkModeToggle, {
      props: { disabled: true }
    })

    const initialMode = wrapper.vm.isDark
    await wrapper.find('.dark-mode-toggle').trigger('click')

    // 禁用状态下模式不应该改变
    expect(wrapper.vm.isDark).toBe(initialMode)
    expect(wrapper.emitted('change')).toBeFalsy()
  })

  it('应该正确处理不同动画类型', () => {
    const animationTypes = ['circle', 'slide', 'fade', 'flip', 'zoom', 'wipe'] as const
    
    animationTypes.forEach(animationType => {
      const wrapper = mount(DarkModeToggle, {
        props: { animationType }
      })
      
      expect(wrapper.vm.animationType).toBe(animationType)
    })
  })

  it('应该正确处理自定义动画持续时间', () => {
    const wrapper = mount(DarkModeToggle, {
      props: { animationDuration: 500 }
    })

    expect(wrapper.vm.animationDuration).toBe(500)
  })

  it('应该正确处理自动检测', () => {
    const wrapper = mount(DarkModeToggle, {
      props: { autoDetect: true }
    })

    expect(wrapper.vm.autoDetect).toBe(true)
  })

  it('应该正确处理存储键配置', () => {
    const customKey = 'custom-dark-mode'
    const wrapper = mount(DarkModeToggle, {
      props: { storageKey: customKey }
    })

    expect(wrapper.vm.storageKey).toBe(customKey)
  })

  it('应该正确触发 beforeChange 事件', async () => {
    const wrapper = mount(DarkModeToggle)

    await wrapper.find('.dark-mode-toggle').trigger('click')

    expect(wrapper.emitted('beforeChange')).toBeTruthy()
    const beforeChangeEvent = wrapper.emitted('beforeChange')?.[0]
    expect(beforeChangeEvent).toBeDefined()
  })

  it('应该正确显示加载状态', async () => {
    const wrapper = mount(DarkModeToggle)

    // 模拟动画过程中的加载状态
    wrapper.vm.isAnimating = true
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.dark-mode-toggle--animating').exists()).toBe(true)
    expect(wrapper.find('.dark-mode-toggle__spinner').exists()).toBe(true)
  })

  it('应该正确处理 View Transition 支持检测', () => {
    const wrapper = mount(DarkModeToggle)

    // 模拟支持 View Transition
    expect(wrapper.vm.supportsViewTransition).toBe(true)
  })

  it('应该正确处理 View Transition 不支持的情况', async () => {
    // 临时移除 View Transition 支持
    const originalStartViewTransition = (document as any).startViewTransition
    delete (document as any).startViewTransition

    const wrapper = mount(DarkModeToggle)
    expect(wrapper.vm.supportsViewTransition).toBe(false)

    // 恢复
    ;(document as any).startViewTransition = originalStartViewTransition
  })

  it('应该正确处理触发点动画', () => {
    const wrapper = mount(DarkModeToggle, {
      props: { enableTriggerAnimation: true }
    })

    expect(wrapper.vm.enableTriggerAnimation).toBe(true)
  })

  it('应该正确处理圆形动画的点击位置', async () => {
    const wrapper = mount(DarkModeToggle, {
      props: { animationType: 'circle' }
    })

    await wrapper.find('.dark-mode-toggle').trigger('click', {
      clientX: 100,
      clientY: 200
    })

    // 验证 CSS 变量被设置
    expect(document.documentElement.style.getPropertyValue('--click-x')).toBe('100px')
    expect(document.documentElement.style.getPropertyValue('--click-y')).toBe('200px')
  })

  it('应该正确设置 DOM 属性', async () => {
    const wrapper = mount(DarkModeToggle)

    // 切换到暗色模式
    await wrapper.find('.dark-mode-toggle').trigger('click')

    expect(document.documentElement.getAttribute('data-theme-mode')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('应该正确处理错误情况', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    // 模拟 View Transition 错误
    ;(document as any).startViewTransition = vi.fn(() => {
      throw new Error('View Transition 错误')
    })

    const wrapper = mount(DarkModeToggle)
    await wrapper.find('.dark-mode-toggle').trigger('click')

    expect(consoleWarnSpy).toHaveBeenCalled()
    
    consoleWarnSpy.mockRestore()
  })
})
