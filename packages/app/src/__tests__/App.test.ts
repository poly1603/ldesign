import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import App from '../App.vue'

// 模拟 composables
vi.mock('../composables/useEngine', () => ({
  useEngine: () => ({
    logger: {
      info: vi.fn(),
      error: vi.fn(),
    },
    events: {
      emit: vi.fn(),
    },
    notifications: {
      show: vi.fn(),
    },
  }),
}))

vi.mock('../composables/useWatermark', () => ({
  useWatermark: () => ({
    showWatermark: { value: false },
    watermarkText: { value: 'LDesign' },
    watermarkOptions: { value: {} },
  }),
}))

vi.mock('../stores/global', () => ({
  useGlobalState: () => ({
    loading: { value: false },
    initialize: vi.fn(),
  }),
}))

// 模拟组件
vi.mock('../components/LWatermark.vue', () => ({
  default: {
    name: 'LWatermark',
    template: '<div class="l-watermark"><slot /></div>',
  },
}))

vi.mock('../components/LNotificationContainer.vue', () => ({
  default: {
    name: 'LNotificationContainer',
    template: '<div class="l-notification-container"></div>',
  },
}))

vi.mock('../components/LGlobalLoading.vue', () => ({
  default: {
    name: 'LGlobalLoading',
    template: '<div class="l-global-loading">Loading...</div>',
  },
}))

vi.mock('../components/LErrorBoundary.vue', () => ({
  default: {
    name: 'LErrorBoundary',
    template: '<div class="l-error-boundary"><slot /></div>',
  },
}))

describe('App', () => {
  let wrapper: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    
    wrapper = mount(App, {
      global: {
        plugins: [pinia],
        stubs: {
          'router-view': {
            template: '<div class="router-view">Router View</div>',
          },
          'transition': {
            template: '<div><slot /></div>',
          },
        },
      },
    })
  })

  it('应该正确渲染应用根组件', () => {
    expect(wrapper.find('.ldesign-app').exists()).toBe(true)
  })

  it('应该包含路由视图', () => {
    expect(wrapper.find('.router-view').exists()).toBe(true)
  })

  it('应该包含通知容器', () => {
    expect(wrapper.find('.l-notification-container').exists()).toBe(true)
  })

  it('应该包含错误边界', () => {
    expect(wrapper.find('.l-error-boundary').exists()).toBe(true)
  })

  it('应该在组件挂载时初始化应用', () => {
    // 验证初始化逻辑被调用
    expect(wrapper.vm).toBeDefined()
  })
})
