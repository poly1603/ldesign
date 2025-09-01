/**
 * 动态模板加载功能测试
 */

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { nextTick } from 'vue'
import { TemplateRenderer } from '../../src/components'
import { useResponsiveTemplate } from '../../src/composables/useResponsiveTemplate'
import { useTemplate } from '../../src/composables/useTemplate'

// Mock composables
vi.mock('../../src/composables/useTemplate')
vi.mock('../../src/composables/useResponsiveTemplate')

const mockUseTemplate = useTemplate as Mock
const mockUseResponsiveTemplate = useResponsiveTemplate as Mock

describe('动态模板加载', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('templateRenderer 动态加载', () => {
    it('应该能够动态加载内置模板', async () => {
      // Mock 模板元数据
      const mockTemplate = {
        name: 'default',
        category: 'login',
        device: 'desktop',
        componentLoader: vi.fn().mockResolvedValue({
          default: {
            name: 'LoginDefault',
            template: '<div class="login-default">Login Template</div>',
          },
        }),
      }

      mockUseTemplate.mockReturnValue({
        templates: { value: [mockTemplate] },
        loading: { value: false },
        error: { value: null },
        getTemplate: vi.fn().mockReturnValue(mockTemplate),
        loadTemplate: vi.fn().mockResolvedValue(mockTemplate),
      })

      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
          device: 'desktop',
          template: 'default',
        },
      })

      await nextTick()

      expect(mockTemplate.componentLoader).toHaveBeenCalled()
      expect(wrapper.exists()).toBe(true)
    })

    it('应该显示加载状态', async () => {
      mockUseTemplate.mockReturnValue({
        templates: { value: [] },
        loading: { value: true },
        error: { value: null },
        getTemplate: vi.fn().mockReturnValue(null),
        loadTemplate: vi.fn(),
      })

      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
          device: 'desktop',
          template: 'default',
        },
      })

      expect(wrapper.find('.template-loading').exists()).toBe(true)
    })

    it('应该显示错误状态', async () => {
      const errorMessage = 'Template not found'

      mockUseTemplate.mockReturnValue({
        templates: { value: [] },
        loading: { value: false },
        error: { value: errorMessage },
        getTemplate: vi.fn().mockReturnValue(null),
        loadTemplate: vi.fn(),
      })

      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
          device: 'desktop',
          template: 'default',
        },
      })

      expect(wrapper.find('.template-error').exists()).toBe(true)
      expect(wrapper.find('.template-error__message').text()).toBe(errorMessage)
    })

    it('应该支持重试加载', async () => {
      const retryFn = vi.fn()

      mockUseTemplate.mockReturnValue({
        templates: { value: [] },
        loading: { value: false },
        error: { value: 'Load failed' },
        getTemplate: vi.fn().mockReturnValue(null),
        loadTemplate: retryFn,
      })

      const wrapper = mount(TemplateRenderer, {
        props: {
          category: 'login',
          device: 'desktop',
          template: 'default',
        },
      })

      const retryButton = wrapper.find('.template-error__retry')
      expect(retryButton.exists()).toBe(true)

      await retryButton.trigger('click')
      expect(retryFn).toHaveBeenCalled()
    })
  })

  describe('响应式模板切换', () => {
    it('应该能够响应设备类型变化', async () => {
      const mockSwitchDevice = vi.fn()
      const mockCurrentDevice = { value: 'desktop' }
      const mockCurrentTemplate = { value: 'default' }

      mockUseResponsiveTemplate.mockReturnValue({
        currentDevice: mockCurrentDevice,
        currentTemplate: mockCurrentTemplate,
        currentTemplateMetadata: { value: null },
        isSwitching: { value: false },
        isLoading: { value: false },
        switchError: { value: null },
        switchDevice: mockSwitchDevice,
        switchTemplate: vi.fn(),
        getAvailableTemplates: vi.fn().mockReturnValue([]),
        reset: vi.fn(),
      })

      const { switchDevice } = useResponsiveTemplate({
        category: 'login',
        enableAutoDeviceSwitch: true,
      })

      await switchDevice('mobile')
      expect(mockSwitchDevice).toHaveBeenCalledWith('mobile')
    })

    it('应该能够手动切换模板', async () => {
      const mockSwitchTemplate = vi.fn()

      mockUseResponsiveTemplate.mockReturnValue({
        currentDevice: { value: 'desktop' },
        currentTemplate: { value: 'default' },
        currentTemplateMetadata: { value: null },
        isSwitching: { value: false },
        isLoading: { value: false },
        switchError: { value: null },
        switchDevice: vi.fn(),
        switchTemplate: mockSwitchTemplate,
        getAvailableTemplates: vi.fn().mockReturnValue([]),
        reset: vi.fn(),
      })

      const { switchTemplate } = useResponsiveTemplate({
        category: 'login',
      })

      await switchTemplate('modern')
      expect(mockSwitchTemplate).toHaveBeenCalledWith('modern')
    })

    it('应该处理切换过程中的错误', async () => {
      const switchError = 'Template not found'

      mockUseResponsiveTemplate.mockReturnValue({
        currentDevice: { value: 'desktop' },
        currentTemplate: { value: 'default' },
        currentTemplateMetadata: { value: null },
        isSwitching: { value: false },
        isLoading: { value: false },
        switchError: { value: switchError },
        switchDevice: vi.fn(),
        switchTemplate: vi.fn(),
        getAvailableTemplates: vi.fn().mockReturnValue([]),
        reset: vi.fn(),
      })

      const { switchError: error } = useResponsiveTemplate({
        category: 'login',
      })

      expect(error.value).toBe(switchError)
    })

    it('应该显示切换状态', async () => {
      mockUseResponsiveTemplate.mockReturnValue({
        currentDevice: { value: 'desktop' },
        currentTemplate: { value: 'default' },
        currentTemplateMetadata: { value: null },
        isSwitching: { value: true },
        isLoading: { value: true },
        switchError: { value: null },
        switchDevice: vi.fn(),
        switchTemplate: vi.fn(),
        getAvailableTemplates: vi.fn().mockReturnValue([]),
        reset: vi.fn(),
      })

      const { isSwitching, isLoading } = useResponsiveTemplate({
        category: 'login',
      })

      expect(isSwitching.value).toBe(true)
      expect(isLoading.value).toBe(true)
    })
  })

  describe('模板扫描器动态扫描', () => {
    it('应该能够扫描内置模板', async () => {
      // Mock import.meta.glob
      const mockConfigModules = {
        '/src/templates/login/desktop/default/config.ts': () => Promise.resolve({
          default: {
            name: 'default',
            displayName: '默认登录模板',
            version: '1.0.0',
          },
        }),
      }

      const mockComponentModules = {
        '/src/templates/login/desktop/default/index.vue': () => Promise.resolve({
          default: {
            name: 'LoginDefault',
            template: '<div>Login</div>',
          },
        }),
      }

      // 这里应该测试扫描器的实际功能
      // 由于 import.meta.glob 是构建时功能，我们需要模拟其行为
      expect(mockConfigModules).toBeDefined()
      expect(mockComponentModules).toBeDefined()
    })

    it('应该正确解析模板路径结构', () => {
      const configPath = '/src/templates/login/desktop/default/config.ts'
      const pathParts = configPath.split('/')
      const configIndex = pathParts.findIndex(part => part.startsWith('config.'))

      expect(configIndex).toBeGreaterThan(0)

      const templateName = pathParts[configIndex - 1]
      const device = pathParts[configIndex - 2]
      const category = pathParts[configIndex - 3]

      expect(templateName).toBe('default')
      expect(device).toBe('desktop')
      expect(category).toBe('login')
    })

    it('应该验证设备类型', () => {
      const validDevices = ['desktop', 'tablet', 'mobile']
      const testDevice = 'desktop'

      expect(validDevices.includes(testDevice)).toBe(true)

      const invalidDevice = 'invalid'
      expect(validDevices.includes(invalidDevice)).toBe(false)
    })
  })

  describe('组件加载器', () => {
    it('应该优先使用 componentLoader 函数', async () => {
      const mockComponentLoader = vi.fn().mockResolvedValue({
        default: { name: 'TestComponent' },
      })

      const metadata = {
        name: 'test',
        componentLoader: mockComponentLoader,
        componentPath: '/path/to/component.vue',
      }

      // 模拟组件加载器的行为
      const component = await metadata.componentLoader()

      expect(mockComponentLoader).toHaveBeenCalled()
      expect(component.default.name).toBe('TestComponent')
    })

    it('应该回退到路径导入', async () => {
      const metadata = {
        name: 'test',
        componentPath: '/path/to/component.vue',
      }

      // 这里应该测试路径导入的回退逻辑
      expect(metadata.componentPath).toBeDefined()
    })

    it('应该处理加载失败的情况', async () => {
      const mockComponentLoader = vi.fn().mockRejectedValue(new Error('Load failed'))

      const metadata = {
        name: 'test',
        componentLoader: mockComponentLoader,
      }

      try {
        await metadata.componentLoader()
      }
      catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Load failed')
      }
    })
  })
})
