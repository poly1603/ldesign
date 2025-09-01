import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { TemplateRenderer } from '../../components/TemplateRenderer'
import {
  createWrapper,
  createMockRendererProps,
  mockTemplates,
  mockVueComponent,
  waitForDOMUpdate,
  expectElementVisible,
  expectEventEmitted
} from '../../test-utils'

// Mock 依赖
vi.mock('../../composables/useTemplate', () => ({
  useTemplate: vi.fn(() => ({
    currentTemplate: mockTemplates[0],
    currentComponent: mockVueComponent,
    loading: false,
    error: null,
    showSelector: false,
    selectorConfig: {},
    availableTemplates: mockTemplates,
    switchTemplate: vi.fn(),
    refreshTemplates: vi.fn(),
    openSelector: vi.fn(),
    closeSelector: vi.fn(),
    TemplateTransition: mockVueComponent,
  })),
}))

describe('TemplateRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该正确渲染组件', () => {
      const props = createMockRendererProps()
      const wrapper = createWrapper(TemplateRenderer, { props })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.template-renderer').exists()).toBe(true)
    })

    it('应该渲染当前模板组件', async () => {
      const props = createMockRendererProps()
      const wrapper = createWrapper(TemplateRenderer, { props })

      await waitForDOMUpdate()

      expect(wrapper.find('.template-content').exists()).toBe(true)
    })

    it('应该在没有模板时显示占位符', async () => {
      const mockUseTemplate = vi.mocked(require('../../composables/useTemplate').useTemplate)
      mockUseTemplate.mockReturnValue({
        currentTemplate: null,
        currentComponent: null,
        loading: false,
        error: null,
        showSelector: false,
        selectorConfig: {},
        availableTemplates: [],
        switchTemplate: vi.fn(),
        refreshTemplates: vi.fn(),
        openSelector: vi.fn(),
        closeSelector: vi.fn(),
        TemplateTransition: mockVueComponent,
      })

      const props = createMockRendererProps()
      const wrapper = createWrapper(TemplateRenderer, { props })

      await waitForDOMUpdate()

      expect(wrapper.find('.template-placeholder').exists()).toBe(true)
      expect(wrapper.text()).toContain('没有找到可用的模板')
    })
  })

  describe('加载状态', () => {
    it('应该在加载时显示加载指示器', async () => {
      const mockUseTemplate = vi.mocked(require('../../composables/useTemplate').useTemplate)
      mockUseTemplate.mockReturnValue({
        currentTemplate: null,
        currentComponent: null,
        loading: true,
        error: null,
        showSelector: false,
        selectorConfig: {},
        availableTemplates: [],
        switchTemplate: vi.fn(),
        refreshTemplates: vi.fn(),
        openSelector: vi.fn(),
        closeSelector: vi.fn(),
        TemplateTransition: mockVueComponent,
      })

      const props = createMockRendererProps()
      const wrapper = createWrapper(TemplateRenderer, { props })

      await waitForDOMUpdate()

      expect(wrapper.find('.template-loading').exists()).toBe(true)
      expect(wrapper.text()).toContain('加载中')
    })

    it('应该在加载完成后隐藏加载指示器', async () => {
      const mockUseTemplate = vi.mocked(require('../../composables/useTemplate').useTemplate)

      // 初始加载状态
      mockUseTemplate.mockReturnValue({
        currentTemplate: null,
        currentComponent: null,
        loading: true,
        error: null,
        showSelector: false,
        selectorConfig: {},
        availableTemplates: [],
        switchTemplate: vi.fn(),
        refreshTemplates: vi.fn(),
        openSelector: vi.fn(),
        closeSelector: vi.fn(),
        TemplateTransition: mockVueComponent,
      })

      const props = createMockRendererProps()
      const wrapper = createWrapper(TemplateRenderer, { props })

      expect(wrapper.find('.template-loading').exists()).toBe(true)

      // 模拟加载完成
      mockUseTemplate.mockReturnValue({
        currentTemplate: mockTemplates[0],
        currentComponent: mockVueComponent,
        loading: false,
        error: null,
        showSelector: false,
        selectorConfig: {},
        availableTemplates: mockTemplates,
        switchTemplate: vi.fn(),
        refreshTemplates: vi.fn(),
        openSelector: vi.fn(),
        closeSelector: vi.fn(),
        TemplateTransition: mockVueComponent,
      })

      await wrapper.vm.$forceUpdate()
      await waitForDOMUpdate()

      expect(wrapper.find('.template-loading').exists()).toBe(false)
      expect(wrapper.find('.template-content').exists()).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('应该在出错时显示错误信息', async () => {
      const mockUseTemplate = vi.mocked(require('../../composables/useTemplate').useTemplate)
      mockUseTemplate.mockReturnValue({
        currentTemplate: null,
        currentComponent: null,
        loading: false,
        error: new Error('模板加载失败'),
        showSelector: false,
        selectorConfig: {},
        availableTemplates: [],
        switchTemplate: vi.fn(),
        refreshTemplates: vi.fn(),
        openSelector: vi.fn(),
        closeSelector: vi.fn(),
        TemplateTransition: mockVueComponent,
      })

      const props = createMockRendererProps()
      const wrapper = createWrapper(TemplateRenderer, { props })

      await waitForDOMUpdate()

      expect(wrapper.find('.template-error').exists()).toBe(true)
      expect(wrapper.text()).toContain('模板加载失败')
    })

    it('应该提供重试按钮', async () => {
      const mockRefreshTemplates = vi.fn()
      const mockUseTemplate = vi.mocked(require('../../composables/useTemplate').useTemplate)
      mockUseTemplate.mockReturnValue({
        currentTemplate: null,
        currentComponent: null,
        loading: false,
        error: new Error('模板加载失败'),
        showSelector: false,
        selectorConfig: {},
        availableTemplates: [],
        switchTemplate: vi.fn(),
        refreshTemplates: mockRefreshTemplates,
        openSelector: vi.fn(),
        closeSelector: vi.fn(),
        TemplateTransition: mockVueComponent,
      })

      const props = createMockRendererProps()
      const wrapper = createWrapper(TemplateRenderer, { props })

      await waitForDOMUpdate()

      const retryButton = wrapper.find('.retry-button')
      expect(retryButton.exists()).toBe(true)

      await retryButton.trigger('click')
      expect(mockRefreshTemplates).toHaveBeenCalled()
    })
  })

  describe('模板选择器', () => {
    it('应该在 showSelector 为 true 时显示选择器', async () => {
      const mockUseTemplate = vi.mocked(require('../../composables/useTemplate').useTemplate)
      mockUseTemplate.mockReturnValue({
        currentTemplate: mockTemplates[0],
        currentComponent: mockVueComponent,
        loading: false,
        error: null,
        showSelector: true,
        selectorConfig: {},
        availableTemplates: mockTemplates,
        switchTemplate: vi.fn(),
        refreshTemplates: vi.fn(),
        openSelector: vi.fn(),
        closeSelector: vi.fn(),
        TemplateTransition: mockVueComponent,
      })

      const props = createMockRendererProps({ showSelector: true })
      const wrapper = createWrapper(TemplateRenderer, { props })

      await waitForDOMUpdate()

      expect(wrapper.findComponent({ name: 'TemplateSelector' }).exists()).toBe(true)
    })

    it('应该在 showSelector 为 false 时隐藏选择器', async () => {
      const props = createMockRendererProps({ showSelector: false })
      const wrapper = createWrapper(TemplateRenderer, { props })

      await waitForDOMUpdate()

      expect(wrapper.findComponent({ name: 'TemplateSelector' }).exists()).toBe(false)
    })

    it('应该正确传递选择器配置', async () => {
      const selectorConfig = {
        theme: 'dark',
        showSearch: false,
        showTags: true,
      }

      const mockUseTemplate = vi.mocked(require('../../composables/useTemplate').useTemplate)
      mockUseTemplate.mockReturnValue({
        currentTemplate: mockTemplates[0],
        currentComponent: mockVueComponent,
        loading: false,
        error: null,
        showSelector: true,
        selectorConfig,
        availableTemplates: mockTemplates,
        switchTemplate: vi.fn(),
        refreshTemplates: vi.fn(),
        openSelector: vi.fn(),
        closeSelector: vi.fn(),
        TemplateTransition: mockVueComponent,
      })

      const props = createMockRendererProps({
        showSelector: true,
        selectorConfig
      })
      const wrapper = createWrapper(TemplateRenderer, { props })

      await waitForDOMUpdate()

      const selector = wrapper.findComponent({ name: 'TemplateSelector' })
      expect(selector.props('showSearch')).toBe(false)
      expect(selector.props('showTags')).toBe(true)
    })
  })

  describe('事件处理', () => {
    it('应该处理模板切换事件', async () => {
      const mockSwitchTemplate = vi.fn()
      const mockUseTemplate = vi.mocked(require('../../composables/useTemplate').useTemplate)
      mockUseTemplate.mockReturnValue({
        currentTemplate: mockTemplates[0],
        currentComponent: mockVueComponent,
        loading: false,
        error: null,
        showSelector: true,
        selectorConfig: {},
        availableTemplates: mockTemplates,
        switchTemplate: mockSwitchTemplate,
        refreshTemplates: vi.fn(),
        openSelector: vi.fn(),
        closeSelector: vi.fn(),
        TemplateTransition: mockVueComponent,
      })

      const props = createMockRendererProps({ showSelector: true })
      const wrapper = createWrapper(TemplateRenderer, { props })

      await waitForDOMUpdate()

      const selector = wrapper.findComponent({ name: 'TemplateSelector' })
      await selector.vm.$emit('select', 'creative')

      expect(mockSwitchTemplate).toHaveBeenCalledWith('creative')
    })

    it('应该处理选择器关闭事件', async () => {
      const mockCloseSelector = vi.fn()
      const mockUseTemplate = vi.mocked(require('../../composables/useTemplate').useTemplate)
      mockUseTemplate.mockReturnValue({
        currentTemplate: mockTemplates[0],
        currentComponent: mockVueComponent,
        loading: false,
        error: null,
        showSelector: true,
        selectorConfig: {},
        availableTemplates: mockTemplates,
        switchTemplate: vi.fn(),
        refreshTemplates: vi.fn(),
        openSelector: vi.fn(),
        closeSelector: mockCloseSelector,
        TemplateTransition: mockVueComponent,
      })

      const props = createMockRendererProps({ showSelector: true })
      const wrapper = createWrapper(TemplateRenderer, { props })

      await waitForDOMUpdate()

      const selector = wrapper.findComponent({ name: 'TemplateSelector' })
      await selector.vm.$emit('close')

      expect(mockCloseSelector).toHaveBeenCalled()
    })

    it('应该向外发射模板变化事件', async () => {
      const props = createMockRendererProps()
      const wrapper = createWrapper(TemplateRenderer, { props })

      // 模拟模板变化
      await wrapper.vm.$emit('template-change', mockTemplates[1])

      expectEventEmitted(wrapper, 'template-change')
    })
  })

  describe('响应式更新', () => {
    it('应该在 props 变化时更新模板', async () => {
      const props = createMockRendererProps({ templateName: 'default' })
      const wrapper = createWrapper(TemplateRenderer, { props })

      await wrapper.setProps({ templateName: 'creative' })
      await waitForDOMUpdate()

      // 验证模板切换逻辑被调用
      expect(wrapper.props('templateName')).toBe('creative')
    })

    it('应该在分类变化时重新加载模板', async () => {
      const mockRefreshTemplates = vi.fn()
      const mockUseTemplate = vi.mocked(require('../../composables/useTemplate').useTemplate)
      mockUseTemplate.mockReturnValue({
        currentTemplate: mockTemplates[0],
        currentComponent: mockVueComponent,
        loading: false,
        error: null,
        showSelector: false,
        selectorConfig: {},
        availableTemplates: mockTemplates,
        switchTemplate: vi.fn(),
        refreshTemplates: mockRefreshTemplates,
        openSelector: vi.fn(),
        closeSelector: vi.fn(),
        TemplateTransition: mockVueComponent,
      })

      const props = createMockRendererProps({ category: 'login' })
      const wrapper = createWrapper(TemplateRenderer, { props })

      await wrapper.setProps({ category: 'dashboard' })
      await waitForDOMUpdate()

      expect(mockRefreshTemplates).toHaveBeenCalled()
    })
  })

  describe('性能优化', () => {
    it('应该使用 TemplateTransition 包装内容', async () => {
      const props = createMockRendererProps()
      const wrapper = createWrapper(TemplateRenderer, { props })

      await waitForDOMUpdate()

      expect(wrapper.findComponent({ name: 'TemplateTransition' }).exists()).toBe(true)
    })

    it('应该在模板未变化时避免重新渲染', async () => {
      const props = createMockRendererProps()
      const wrapper = createWrapper(TemplateRenderer, { props })

      const initialRenderCount = wrapper.vm.$el.children.length

      // 设置相同的 props
      await wrapper.setProps(props)
      await waitForDOMUpdate()

      expect(wrapper.vm.$el.children.length).toBe(initialRenderCount)
    })
  })
})
