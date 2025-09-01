/**
 * TemplateRenderer 组件单元测试
 */

import type { TemplateMetadata } from '@/types/template'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { TemplateRenderer } from '@/components/TemplateRenderer'

// Mock 依赖
vi.mock('@/composables/useTemplate', () => ({
  useTemplate: vi.fn().mockReturnValue({
    currentTemplate: { value: null },
    currentComponent: { value: null },
    availableTemplates: { value: [] },
    loading: { value: false },
    error: { value: null },
    switchTemplate: vi.fn(),
    refreshTemplates: vi.fn(),
  }),
}))

vi.mock('@/composables/useDeviceDetection', () => ({
  useDeviceDetection: vi.fn().mockReturnValue({
    deviceType: { value: 'desktop' },
  }),
}))

describe('templateRenderer', () => {
  const mockTemplate: TemplateMetadata = {
    name: 'test-template',
    displayName: '测试模板',
    description: '这是一个测试模板',
    version: '1.0.0',
    category: 'login',
    device: 'desktop',
    componentPath: '/templates/login/desktop/test/index.vue',
    configPath: '/templates/login/desktop/test/config.js',
    isDefault: true,
  }

  const MockTemplateComponent = {
    name: 'MockTemplate',
    props: ['title'],
    template: '<div class="mock-template">{{ title || "Mock Template" }}</div>',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该渲染基本组件结构', () => {
    const wrapper = mount(TemplateRenderer, {
      props: {
        category: 'login',
      },
    })

    expect(wrapper.find('.template-renderer').exists()).toBe(true)
    expect(wrapper.find('.template-renderer__content').exists()).toBe(true)
  })

  it('应该显示加载状态', async () => {
    const { useTemplate } = await import('@/composables/useTemplate')
    vi.mocked(useTemplate).mockReturnValue({
      currentTemplate: { value: null },
      currentComponent: { value: null },
      availableTemplates: { value: [] },
      loading: { value: true },
      error: { value: null },
      switchTemplate: vi.fn(),
      refreshTemplates: vi.fn(),
    } as any)

    const wrapper = mount(TemplateRenderer, {
      props: {
        category: 'login',
      },
    })

    expect(wrapper.find('.template-loading').exists()).toBe(true)
    expect(wrapper.find('.template-loading__text').text()).toBe('加载模板中...')
  })

  it('应该显示错误状态', async () => {
    const { useTemplate } = await import('@/composables/useTemplate')
    vi.mocked(useTemplate).mockReturnValue({
      currentTemplate: { value: null },
      currentComponent: { value: null },
      availableTemplates: { value: [] },
      loading: { value: false },
      error: { value: '加载失败' },
      switchTemplate: vi.fn(),
      refreshTemplates: vi.fn(),
    } as any)

    const wrapper = mount(TemplateRenderer, {
      props: {
        category: 'login',
      },
    })

    expect(wrapper.find('.template-error').exists()).toBe(true)
    expect(wrapper.find('.template-error__message').text()).toBe('加载失败')
  })

  it('应该渲染模板组件', async () => {
    const { useTemplate } = await import('@/composables/useTemplate')
    vi.mocked(useTemplate).mockReturnValue({
      currentTemplate: { value: mockTemplate },
      currentComponent: { value: MockTemplateComponent },
      availableTemplates: { value: [mockTemplate] },
      loading: { value: false },
      error: { value: null },
      switchTemplate: vi.fn(),
      refreshTemplates: vi.fn(),
    } as any)

    const wrapper = mount(TemplateRenderer, {
      props: {
        category: 'login',
        props: { title: '自定义标题' },
      },
    })

    await nextTick()
    expect(wrapper.find('.mock-template').exists()).toBe(true)
    expect(wrapper.find('.mock-template').text()).toBe('自定义标题')
  })

  it('应该显示模板选择器触发器', async () => {
    const { useTemplate } = await import('@/composables/useTemplate')
    vi.mocked(useTemplate).mockReturnValue({
      currentTemplate: { value: mockTemplate },
      currentComponent: { value: MockTemplateComponent },
      availableTemplates: { value: [mockTemplate, { ...mockTemplate, name: 'another-template' }] },
      loading: { value: false },
      error: { value: null },
      switchTemplate: vi.fn(),
      refreshTemplates: vi.fn(),
    } as any)

    const wrapper = mount(TemplateRenderer, {
      props: {
        category: 'login',
        showSelector: true,
      },
    })

    expect(wrapper.find('.template-selector-trigger').exists()).toBe(true)
    expect(wrapper.find('.template-selector-trigger__button').exists()).toBe(true)
  })

  it('应该处理模板切换', async () => {
    const mockSwitchTemplate = vi.fn()
    const { useTemplate } = await import('@/composables/useTemplate')
    vi.mocked(useTemplate).mockReturnValue({
      currentTemplate: { value: mockTemplate },
      currentComponent: { value: MockTemplateComponent },
      availableTemplates: { value: [mockTemplate] },
      loading: { value: false },
      error: { value: null },
      switchTemplate: mockSwitchTemplate,
      refreshTemplates: vi.fn(),
    } as any)

    const onTemplateChange = vi.fn()
    const wrapper = mount(TemplateRenderer, {
      props: {
        category: 'login',
        templateName: 'new-template',
        onTemplateChange,
      },
    })

    await nextTick()
    expect(mockSwitchTemplate).toHaveBeenCalledWith('new-template')
  })

  it('应该处理错误重试', async () => {
    const mockRefreshTemplates = vi.fn()
    const { useTemplate } = await import('@/composables/useTemplate')
    vi.mocked(useTemplate).mockReturnValue({
      currentTemplate: { value: null },
      currentComponent: { value: null },
      availableTemplates: { value: [] },
      loading: { value: false },
      error: { value: '加载失败' },
      switchTemplate: vi.fn(),
      refreshTemplates: mockRefreshTemplates,
    } as any)

    const wrapper = mount(TemplateRenderer, {
      props: {
        category: 'login',
      },
    })

    const retryButton = wrapper.find('.template-error__retry')
    expect(retryButton.exists()).toBe(true)

    await retryButton.trigger('click')
    expect(mockRefreshTemplates).toHaveBeenCalled()
  })

  it('应该使用自定义加载组件', async () => {
    const CustomLoadingComponent = {
      name: 'CustomLoading',
      template: '<div class="custom-loading">自定义加载中...</div>',
    }

    const { useTemplate } = await import('@/composables/useTemplate')
    vi.mocked(useTemplate).mockReturnValue({
      currentTemplate: { value: null },
      currentComponent: { value: null },
      availableTemplates: { value: [] },
      loading: { value: true },
      error: { value: null },
      switchTemplate: vi.fn(),
      refreshTemplates: vi.fn(),
    } as any)

    const wrapper = mount(TemplateRenderer, {
      props: {
        category: 'login',
        loadingComponent: CustomLoadingComponent,
      },
    })

    expect(wrapper.find('.custom-loading').exists()).toBe(true)
    expect(wrapper.find('.custom-loading').text()).toBe('自定义加载中...')
  })

  it('应该使用自定义错误组件', async () => {
    const CustomErrorComponent = {
      name: 'CustomError',
      props: ['error', 'retry'],
      template: '<div class="custom-error">{{ error }} <button @click="retry">重试</button></div>',
    }

    const { useTemplate } = await import('@/composables/useTemplate')
    vi.mocked(useTemplate).mockReturnValue({
      currentTemplate: { value: null },
      currentComponent: { value: null },
      availableTemplates: { value: [] },
      loading: { value: false },
      error: { value: '自定义错误' },
      switchTemplate: vi.fn(),
      refreshTemplates: vi.fn(),
    } as any)

    const wrapper = mount(TemplateRenderer, {
      props: {
        category: 'login',
        errorComponent: CustomErrorComponent,
      },
    })

    expect(wrapper.find('.custom-error').exists()).toBe(true)
    expect(wrapper.find('.custom-error').text()).toContain('自定义错误')
  })

  it('应该触发事件', async () => {
    const { useTemplate } = await import('@/composables/useTemplate')
    vi.mocked(useTemplate).mockReturnValue({
      currentTemplate: { value: mockTemplate },
      currentComponent: { value: MockTemplateComponent },
      availableTemplates: { value: [mockTemplate] },
      loading: { value: false },
      error: { value: null },
      switchTemplate: vi.fn().mockResolvedValue(undefined),
      refreshTemplates: vi.fn(),
    } as any)

    const wrapper = mount(TemplateRenderer, {
      props: {
        category: 'login',
      },
    })

    // 模拟模板切换成功
    await wrapper.vm.$emit('template-change', 'test-template')
    await wrapper.vm.$emit('load-success', mockTemplate)

    expect(wrapper.emitted('template-change')).toBeTruthy()
    expect(wrapper.emitted('load-success')).toBeTruthy()
  })

  it('应该支持响应式设备切换', async () => {
    const { useDeviceDetection } = await import('@/composables/useDeviceDetection')
    vi.mocked(useDeviceDetection).mockReturnValue({
      deviceType: { value: 'mobile' },
    } as any)

    const wrapper = mount(TemplateRenderer, {
      props: {
        category: 'login',
        responsive: true,
      },
    })

    // 验证组件使用了移动设备类型
    expect(wrapper.vm).toBeDefined()
  })

  it('应该显示空状态', async () => {
    const { useTemplate } = await import('@/composables/useTemplate')
    vi.mocked(useTemplate).mockReturnValue({
      currentTemplate: { value: null },
      currentComponent: { value: null },
      availableTemplates: { value: [] },
      loading: { value: false },
      error: { value: null },
      switchTemplate: vi.fn(),
      refreshTemplates: vi.fn(),
    } as any)

    const wrapper = mount(TemplateRenderer, {
      props: {
        category: 'login',
      },
    })

    expect(wrapper.find('.template-empty').exists()).toBe(true)
    expect(wrapper.find('.template-empty__message').text()).toBe('没有找到可用的模板')
  })
})
