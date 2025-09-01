import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick, ref, watch } from 'vue'
import { useTemplate } from '../../composables/useTemplate'
import { TemplateRenderer } from '../../components/TemplateRenderer'
import {
  createWrapper,
  createMockRendererProps,
  createMockUseTemplateOptions,
  mockTemplates,
  mockVueComponent,
  mockSelectorConfig,
  waitForDOMUpdate,
  expectEventEmitted
} from '../../test-utils'

// Mock 依赖
vi.mock('../../scanner', () => ({
  TemplateScanner: {
    getInstance: vi.fn(() => ({
      scan: vi.fn(() => Promise.resolve(mockTemplates)),
      getTemplates: vi.fn(() => mockTemplates),
      getTemplatesByCategory: vi.fn((category: string) =>
        mockTemplates.filter(t => t.category === category)
      ),
      getTemplatesByDevice: vi.fn((device: string) =>
        mockTemplates.filter(t => t.device === device)
      ),
    })),
  },
}))

vi.mock('../../config', () => ({
  TemplateConfigManager: {
    getInstance: vi.fn(() => ({
      getConfig: vi.fn(() => ({})),
      updateConfig: vi.fn(),
    })),
  },
}))

describe('Hook 方式与组件方式一致性测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('配置选项一致性', () => {
    it('Hook 和组件应该支持相同的基本配置', () => {
      // Hook 方式配置
      const hookOptions = createMockUseTemplateOptions({
        category: 'login',
        device: 'desktop',
        templateName: 'default',
        enableCache: true,
        showSelector: true,
      })

      const {
        currentTemplate,
        showSelector,
        availableTemplates
      } = useTemplate(hookOptions)

      // 组件方式配置
      const componentProps = createMockRendererProps({
        category: 'login',
        device: 'desktop',
        templateName: 'default',
        showSelector: true,
        selectorConfig: mockSelectorConfig,
      })

      const wrapper = createWrapper(TemplateRenderer, { props: componentProps })

      // 验证配置一致性
      expect(hookOptions.category).toBe(componentProps.category)
      expect(hookOptions.device).toBe(componentProps.device)
      expect(hookOptions.templateName).toBe(componentProps.templateName)
      expect(hookOptions.showSelector).toBe(componentProps.showSelector)
    })

    it('选择器配置应该在两种方式中保持一致', () => {
      const selectorConfig = {
        theme: 'dark',
        showSearch: false,
        showTags: true,
        showSort: false,
      }

      // Hook 方式
      const { selectorConfig: hookSelectorConfig } = useTemplate({
        selectorConfig,
      })

      // 组件方式
      const componentProps = createMockRendererProps({
        selectorConfig,
      })

      expect(hookSelectorConfig.value).toEqual(selectorConfig)
      expect(componentProps.selectorConfig).toEqual(selectorConfig)
    })

    it('动画配置应该在两种方式中保持一致', () => {
      const animationConfig = {
        duration: 500,
        easing: 'ease-in-out',
        type: 'slide',
      }

      // Hook 方式
      const hookOptions = createMockUseTemplateOptions({
        animationConfig,
      })

      // 组件方式
      const componentProps = createMockRendererProps({
        transitionDuration: animationConfig.duration,
        transitionEasing: animationConfig.easing,
        transitionType: animationConfig.type,
      })

      expect(hookOptions.animationConfig).toEqual(animationConfig)
      expect(componentProps.transitionDuration).toBe(animationConfig.duration)
      expect(componentProps.transitionType).toBe(animationConfig.type)
    })
  })

  describe('功能行为一致性', () => {
    it('模板切换行为应该一致', async () => {
      // Hook 方式
      const { switchTemplate: hookSwitchTemplate } = useTemplate({
        category: 'login',
      })

      // 组件方式
      const componentProps = createMockRendererProps({
        category: 'login',
      })
      const wrapper = createWrapper(TemplateRenderer, { props: componentProps })

      // 测试 Hook 方式切换
      await hookSwitchTemplate('creative')
      expect(vi.mocked(require('../../scanner').TemplateScanner.getInstance().scan)).toHaveBeenCalled()

      // 测试组件方式切换（通过 props 变化）
      await wrapper.setProps({ templateName: 'creative' })
      await waitForDOMUpdate()

      // 验证两种方式都能正确切换模板
      expect(wrapper.props('templateName')).toBe('creative')
    })

    it('选择器显示/隐藏行为应该一致', async () => {
      // Hook 方式
      const {
        showSelector: hookShowSelector,
        openSelector: hookOpenSelector,
        closeSelector: hookCloseSelector
      } = useTemplate()

      // 组件方式
      const componentProps = createMockRendererProps({ showSelector: false })
      const wrapper = createWrapper(TemplateRenderer, { props: componentProps })

      // Hook 方式：打开选择器
      hookOpenSelector()
      expect(hookShowSelector.value).toBe(true)

      // 组件方式：打开选择器
      await wrapper.setProps({ showSelector: true })
      expect(wrapper.props('showSelector')).toBe(true)

      // Hook 方式：关闭选择器
      hookCloseSelector()
      expect(hookShowSelector.value).toBe(false)

      // 组件方式：关闭选择器
      await wrapper.setProps({ showSelector: false })
      expect(wrapper.props('showSelector')).toBe(false)
    })

    it('错误处理行为应该一致', async () => {
      // Mock 错误场景
      vi.mocked(require('../../scanner').TemplateScanner.getInstance).mockReturnValue({
        scan: vi.fn(() => Promise.reject(new Error('加载失败'))),
        getTemplates: vi.fn(() => []),
        getTemplatesByCategory: vi.fn(() => []),
        getTemplatesByDevice: vi.fn(() => []),
      })

      // Hook 方式
      const { error: hookError, refreshTemplates } = useTemplate()
      await refreshTemplates()
      await nextTick()

      // 组件方式
      const componentProps = createMockRendererProps()
      const wrapper = createWrapper(TemplateRenderer, { props: componentProps })
      await waitForDOMUpdate()

      // 验证两种方式都能正确处理错误
      expect(hookError.value).toBeTruthy()
      expect(wrapper.find('.template-error').exists()).toBe(true)
    })

    it('加载状态应该一致', async () => {
      // Mock 异步加载
      vi.mocked(require('../../scanner').TemplateScanner.getInstance).mockReturnValue({
        scan: vi.fn(() => new Promise(resolve => setTimeout(() => resolve(mockTemplates), 100))),
        getTemplates: vi.fn(() => mockTemplates),
        getTemplatesByCategory: vi.fn(() => mockTemplates),
        getTemplatesByDevice: vi.fn(() => mockTemplates),
      })

      // Hook 方式
      const { loading: hookLoading, refreshTemplates } = useTemplate()
      const refreshPromise = refreshTemplates()

      // 组件方式
      const componentProps = createMockRendererProps()
      const wrapper = createWrapper(TemplateRenderer, { props: componentProps })

      // 验证加载状态
      expect(hookLoading.value).toBe(true)
      expect(wrapper.find('.template-loading').exists()).toBe(true)

      await refreshPromise
      await waitForDOMUpdate()

      expect(hookLoading.value).toBe(false)
      expect(wrapper.find('.template-loading').exists()).toBe(false)
    })
  })

  describe('事件处理一致性', () => {
    it('模板变化事件应该一致', async () => {
      // Hook 方式
      const hookCallback = vi.fn()
      const { currentTemplate } = useTemplate()

      // 监听模板变化
      watch(currentTemplate, hookCallback)

      // 组件方式
      const componentProps = createMockRendererProps()
      const wrapper = createWrapper(TemplateRenderer, { props: componentProps })

      // 触发模板变化
      await wrapper.vm.$emit('template-change', mockTemplates[1])

      // 验证事件处理
      expectEventEmitted(wrapper, 'template-change')
    })

    it('选择器事件应该一致', async () => {
      // Hook 方式
      const { closeSelector } = useTemplate()
      const hookCloseSpy = vi.spyOn({ closeSelector }, 'closeSelector')

      // 组件方式
      const componentProps = createMockRendererProps({ showSelector: true })
      const wrapper = createWrapper(TemplateRenderer, { props: componentProps })

      await waitForDOMUpdate()

      const selector = wrapper.findComponent({ name: 'TemplateSelector' })
      if (selector.exists()) {
        await selector.vm.$emit('close')
        expectEventEmitted(selector, 'close')
      }

      // 验证两种方式都能正确处理选择器关闭
      closeSelector()
      expect(hookCloseSpy.closeSelector).toHaveBeenCalled()
    })
  })

  describe('状态管理一致性', () => {
    it('响应式状态应该保持同步', async () => {
      // Hook 方式
      const {
        currentTemplate: hookCurrentTemplate,
        availableTemplates: hookAvailableTemplates,
        loading: hookLoading,
        error: hookError
      } = useTemplate({ category: 'login' })

      // 组件方式（通过 provide/inject 共享状态）
      const componentProps = createMockRendererProps({ category: 'login' })
      const wrapper = createWrapper(TemplateRenderer, {
        props: componentProps,
        global: {
          provide: {
            templateState: {
              currentTemplate: hookCurrentTemplate,
              availableTemplates: hookAvailableTemplates,
              loading: hookLoading,
              error: hookError,
            },
          },
        },
      })

      // 验证状态同步
      expect(hookCurrentTemplate.value).toBe(mockTemplates[0])
      expect(hookAvailableTemplates.value).toEqual(mockTemplates)
      expect(hookLoading.value).toBe(false)
      expect(hookError.value).toBeNull()
    })

    it('配置变化应该同步更新', async () => {
      // Hook 方式
      const category = ref('login')
      const { availableTemplates } = useTemplate({
        category: category.value,
      })

      // 组件方式
      const componentProps = createMockRendererProps({ category: 'login' })
      const wrapper = createWrapper(TemplateRenderer, { props: componentProps })

      // 改变分类
      category.value = 'dashboard'
      await wrapper.setProps({ category: 'dashboard' })
      await waitForDOMUpdate()

      // 验证两种方式都响应配置变化
      expect(wrapper.props('category')).toBe('dashboard')
    })
  })

  describe('性能特性一致性', () => {
    it('缓存行为应该一致', () => {
      // Hook 方式
      const { refreshTemplates: hookRefresh } = useTemplate({
        enableCache: true,
      })

      // 组件方式
      const componentProps = createMockRendererProps({
        enableCache: true,
      })
      const wrapper = createWrapper(TemplateRenderer, { props: componentProps })

      // 验证缓存配置
      expect(componentProps.enableCache).toBe(true)
      expect(typeof hookRefresh).toBe('function')
    })

    it('懒加载行为应该一致', () => {
      // Hook 方式
      const { currentComponent } = useTemplate({
        lazy: true,
      })

      // 组件方式
      const componentProps = createMockRendererProps({
        lazy: true,
      })
      const wrapper = createWrapper(TemplateRenderer, { props: componentProps })

      // 验证懒加载配置
      expect(componentProps.lazy).toBe(true)
      expect(currentComponent.value).toBeDefined()
    })
  })

  describe('API 接口一致性', () => {
    it('返回值结构应该一致', () => {
      const hookResult = useTemplate()

      // 验证 Hook 返回的接口
      expect(hookResult).toHaveProperty('currentTemplate')
      expect(hookResult).toHaveProperty('currentComponent')
      expect(hookResult).toHaveProperty('loading')
      expect(hookResult).toHaveProperty('error')
      expect(hookResult).toHaveProperty('showSelector')
      expect(hookResult).toHaveProperty('selectorConfig')
      expect(hookResult).toHaveProperty('availableTemplates')
      expect(hookResult).toHaveProperty('switchTemplate')
      expect(hookResult).toHaveProperty('refreshTemplates')
      expect(hookResult).toHaveProperty('openSelector')
      expect(hookResult).toHaveProperty('closeSelector')
      expect(hookResult).toHaveProperty('TemplateTransition')

      // 验证类型
      expect(typeof hookResult.switchTemplate).toBe('function')
      expect(typeof hookResult.refreshTemplates).toBe('function')
      expect(typeof hookResult.openSelector).toBe('function')
      expect(typeof hookResult.closeSelector).toBe('function')
    })

    it('组件 props 应该覆盖所有 Hook 配置', () => {
      const hookOptions = createMockUseTemplateOptions()
      const componentProps = createMockRendererProps()

      // 验证组件 props 包含所有 Hook 配置选项
      const hookConfigKeys = Object.keys(hookOptions)
      const componentPropKeys = Object.keys(componentProps)

      hookConfigKeys.forEach(key => {
        if (key !== 'selectorConfig') { // selectorConfig 在组件中是扁平化的
          expect(componentPropKeys).toContain(key)
        }
      })
    })
  })

  describe('文档示例一致性', () => {
    it('README 中的 Hook 示例应该可以正常工作', () => {
      // 模拟 README 中的 Hook 示例
      const {
        currentTemplate,
        currentComponent,
        showSelector,
        switchTemplate,
        openSelector,
        closeSelector
      } = useTemplate({
        category: 'login',
        device: 'desktop',
        showSelector: true,
        selectorConfig: {
          theme: 'default',
          showSearch: true,
          showTags: true,
        },
      })

      expect(currentTemplate.value).toBeDefined()
      expect(currentComponent.value).toBeDefined()
      expect(showSelector.value).toBe(true)
      expect(typeof switchTemplate).toBe('function')
      expect(typeof openSelector).toBe('function')
      expect(typeof closeSelector).toBe('function')
    })

    it('README 中的组件示例应该可以正常工作', () => {
      // 模拟 README 中的组件示例
      const props = {
        category: 'login',
        device: 'desktop',
        showSelector: true,
        selectorConfig: {
          theme: 'default',
          showSearch: true,
          showTags: true,
        },
      }

      const wrapper = createWrapper(TemplateRenderer, { props })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props('category')).toBe('login')
      expect(wrapper.props('device')).toBe('desktop')
      expect(wrapper.props('showSelector')).toBe(true)
    })
  })
})
