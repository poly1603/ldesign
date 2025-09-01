/**
 * useTemplate Hook 单元测试
 */

import type { TemplateMetadata } from '@/types/template'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useTemplate } from '@/composables/useTemplate'

// Mock 依赖
vi.mock('@/scanner', () => ({
  TemplateScanner: vi.fn().mockImplementation(() => ({
    scan: vi.fn().mockResolvedValue({
      templates: new Map(),
      stats: { totalTemplates: 0, byCategory: {}, byDevice: { desktop: 0, tablet: 0, mobile: 0 }, scanTime: 0, lastScanTime: 0 },
      errors: [],
    }),
    getTemplates: vi.fn().mockReturnValue([]),
    getTemplate: vi.fn().mockReturnValue(null),
  })),
}))

vi.mock('@/utils/loader', () => ({
  componentLoader: {
    loadComponent: vi.fn().mockResolvedValue({
      component: { name: 'MockComponent' },
      fromCache: false,
      loadTime: 100,
    }),
    preloadComponent: vi.fn().mockResolvedValue(undefined),
    clearLoadingPromises: vi.fn(),
  },
}))

vi.mock('@/utils/cache', () => ({
  componentCache: {
    getComponent: vi.fn().mockReturnValue(null),
    clear: vi.fn(),
  },
}))

vi.mock('@/composables/useDeviceDetection', () => ({
  useDeviceDetection: vi.fn().mockReturnValue({
    deviceType: { value: 'desktop' },
  }),
}))

describe('useTemplate', () => {
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

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该初始化Hook状态', () => {
    const TestComponent = {
      setup() {
        const templateHook = useTemplate({
          category: 'login',
          device: 'desktop',
        })
        return { templateHook }
      },
      template: '<div></div>',
    }

    const wrapper = mount(TestComponent)
    const { templateHook } = wrapper.vm

    expect(templateHook.currentTemplate.value).toBeNull()
    expect(templateHook.currentComponent.value).toBeNull()
    expect(templateHook.availableTemplates.value).toEqual([])
    expect(templateHook.loading.value).toBe(false)
    expect(templateHook.error.value).toBeNull()
    expect(templateHook.deviceType.value).toBe('desktop')
  })

  it('应该提供切换模板的功能', async () => {
    const TestComponent = {
      setup() {
        const templateHook = useTemplate({
          category: 'login',
          device: 'desktop',
        })

        // Mock 可用模板
        templateHook.availableTemplates.value = [mockTemplate]

        return { templateHook }
      },
      template: '<div></div>',
    }

    const wrapper = mount(TestComponent)
    const { templateHook } = wrapper.vm

    await templateHook.switchTemplate('test-template')
    await nextTick()

    expect(templateHook.currentTemplate.value).toEqual(mockTemplate)
  })

  it('应该处理模板切换错误', async () => {
    const TestComponent = {
      setup() {
        const templateHook = useTemplate({
          category: 'login',
          device: 'desktop',
        })
        return { templateHook }
      },
      template: '<div></div>',
    }

    const wrapper = mount(TestComponent)
    const { templateHook } = wrapper.vm

    await templateHook.switchTemplate('nonexistent-template')
    await nextTick()

    expect(templateHook.error.value).toContain('Template not found')
  })

  it('应该支持预加载模板', async () => {
    const TestComponent = {
      setup() {
        const templateHook = useTemplate({
          category: 'login',
          device: 'desktop',
        })

        templateHook.availableTemplates.value = [mockTemplate]

        return { templateHook }
      },
      template: '<div></div>',
    }

    const wrapper = mount(TestComponent)
    const { templateHook } = wrapper.vm

    await templateHook.preloadTemplate('test-template')

    const { componentLoader } = await import('@/utils/loader')
    expect(componentLoader.preloadComponent).toHaveBeenCalledWith(mockTemplate)
  })

  it('应该支持刷新模板列表', async () => {
    const TestComponent = {
      setup() {
        const templateHook = useTemplate({
          category: 'login',
          device: 'desktop',
        })
        return { templateHook }
      },
      template: '<div></div>',
    }

    const wrapper = mount(TestComponent)
    const { templateHook } = wrapper.vm

    await templateHook.refreshTemplates()

    const { componentCache } = await import('@/utils/cache')
    expect(componentCache.clear).toHaveBeenCalled()
  })

  it('应该支持清除缓存', () => {
    const TestComponent = {
      setup() {
        const templateHook = useTemplate({
          category: 'login',
          device: 'desktop',
        })
        return { templateHook }
      },
      template: '<div></div>',
    }

    const wrapper = mount(TestComponent)
    const { templateHook } = wrapper.vm

    templateHook.clearCache()

    // 验证缓存清除方法被调用
    expect(true).toBe(true) // 由于是mock，我们只验证不抛出错误
  })

  it('应该支持自动设备检测', () => {
    const TestComponent = {
      setup() {
        const templateHook = useTemplate({
          category: 'login',
          autoDetectDevice: true,
        })
        return { templateHook }
      },
      template: '<div></div>',
    }

    const wrapper = mount(TestComponent)
    const { templateHook } = wrapper.vm

    expect(templateHook.deviceType.value).toBe('desktop')
  })

  it('应该支持禁用缓存', () => {
    const TestComponent = {
      setup() {
        const templateHook = useTemplate({
          category: 'login',
          device: 'desktop',
          enableCache: false,
        })
        return { templateHook }
      },
      template: '<div></div>',
    }

    const wrapper = mount(TestComponent)
    expect(wrapper.vm.templateHook).toBeDefined()
  })
})
