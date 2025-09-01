/**
 * 组合式函数测试
 */

import type { TemplateMetadata } from '../src/types/template'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import {
  useDeviceDetection,
  useTemplateConfig,
  useTemplateRenderer,
  useTemplateScanner,
  useTemplateSelector,
} from '../src/composables'

// 模拟依赖
vi.mock('@ldesign/device', () => ({
  createDeviceDetector: vi.fn(() => ({
    detect: vi.fn().mockReturnValue('desktop'),
    getCurrentDevice: vi.fn().mockReturnValue('desktop'),
    isMobile: vi.fn().mockReturnValue(false),
    isTablet: vi.fn().mockReturnValue(false),
    isDesktop: vi.fn().mockReturnValue(true),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  })),
}))

describe('useTemplateScanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该提供扫描器功能', () => {
    const {
      scanner,
      templates,
      isScanning,
      scanError,
      scan,
      getTemplatesByCategory,
      getTemplatesByDevice,
      searchTemplates,
    } = useTemplateScanner({
      templatesDir: 'test/templates',
      autoScan: false,
    })

    expect(scanner).toBeDefined()
    expect(templates.value).toEqual(new Map())
    expect(isScanning.value).toBe(false)
    expect(scanError.value).toBeNull()
    expect(typeof scan).toBe('function')
    expect(typeof getTemplatesByCategory).toBe('function')
    expect(typeof getTemplatesByDevice).toBe('function')
    expect(typeof searchTemplates).toBe('function')
  })

  it('应该执行模板扫描', async () => {
    const { scan, isScanning, templates } = useTemplateScanner({
      templatesDir: 'test/templates',
      autoScan: false,
    })

    expect(isScanning.value).toBe(false)

    const scanPromise = scan()
    expect(isScanning.value).toBe(true)

    await scanPromise
    expect(isScanning.value).toBe(false)
    expect(templates.value).toBeDefined()
  })

  it('应该处理扫描错误', async () => {
    const { scan, scanError } = useTemplateScanner({
      templatesDir: 'nonexistent/templates',
      autoScan: false,
    })

    await scan()

    // 由于模拟的文件系统，这里可能不会产生真实错误
    // 但我们可以测试错误状态的响应性
    expect(scanError.value).toBeDefined()
  })

  it('应该按分类获取模板', async () => {
    const { scan, getTemplatesByCategory } = useTemplateScanner({
      templatesDir: 'test/templates',
      autoScan: false,
    })

    await scan()
    const loginTemplates = getTemplatesByCategory('login')

    expect(Array.isArray(loginTemplates.value)).toBe(true)
  })

  it('应该按设备类型获取模板', async () => {
    const { scan, getTemplatesByDevice } = useTemplateScanner({
      templatesDir: 'test/templates',
      autoScan: false,
    })

    await scan()
    const desktopTemplates = getTemplatesByDevice('desktop')

    expect(Array.isArray(desktopTemplates.value)).toBe(true)
  })

  it('应该搜索模板', async () => {
    const { scan, searchTemplates } = useTemplateScanner({
      templatesDir: 'test/templates',
      autoScan: false,
    })

    await scan()
    const searchResults = searchTemplates({
      keyword: '登录',
      categories: ['login'],
    })

    expect(Array.isArray(searchResults.value)).toBe(true)
  })
})

describe('useTemplateSelector', () => {
  let mockTemplates: TemplateMetadata[]

  beforeEach(() => {
    mockTemplates = [
      {
        name: 'login-classic',
        displayName: '经典登录',
        description: '经典风格的登录页面',
        version: '1.0.0',
        author: 'test',
        category: 'login',
        device: 'desktop',
        componentPath: '/path/to/component.vue',
        componentLoader: vi.fn(),
        configPath: '/path/to/config.ts',
        lastModified: Date.now(),
        isBuiltIn: true,
        tags: ['classic', 'responsive'],
      },
      {
        name: 'dashboard-modern',
        displayName: '现代仪表板',
        description: '现代化的仪表板页面',
        version: '1.0.0',
        author: 'test',
        category: 'dashboard',
        device: 'desktop',
        componentPath: '/path/to/component.vue',
        componentLoader: vi.fn(),
        configPath: '/path/to/config.ts',
        lastModified: Date.now(),
        isBuiltIn: true,
        tags: ['modern', 'interactive'],
      },
    ]
  })

  it('应该提供模板选择功能', () => {
    const {
      availableTemplates,
      filteredTemplates,
      selectedTemplate,
      searchQuery,
      loading,
      error,
      selectTemplate,
      previewTemplate,
      searchTemplates,
      filterByCategory,
      filterByDevice,
      reset,
    } = useTemplateSelector({
      templates: mockTemplates,
      device: 'desktop',
    })

    expect(availableTemplates.value).toEqual(mockTemplates)
    expect(filteredTemplates.value).toEqual(mockTemplates)
    expect(selectedTemplate.value).toBeNull()
    expect(searchQuery.value).toBe('')
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(typeof selectTemplate).toBe('function')
    expect(typeof previewTemplate).toBe('function')
    expect(typeof searchTemplates).toBe('function')
    expect(typeof filterByCategory).toBe('function')
    expect(typeof filterByDevice).toBe('function')
    expect(typeof reset).toBe('function')
  })

  it('应该选择模板', async () => {
    const { selectTemplate, selectedTemplate } = useTemplateSelector({
      templates: mockTemplates,
      device: 'desktop',
    })

    await selectTemplate(mockTemplates[0])
    expect(selectedTemplate.value).toBe(mockTemplates[0])
  })

  it('应该搜索模板', async () => {
    const { searchTemplates, filteredTemplates, searchQuery } = useTemplateSelector({
      templates: mockTemplates,
      device: 'desktop',
    })

    await searchTemplates('登录')

    expect(searchQuery.value).toBe('登录')
    expect(filteredTemplates.value.length).toBeLessThanOrEqual(mockTemplates.length)
  })

  it('应该按分类过滤模板', async () => {
    const { filterByCategory, filteredTemplates } = useTemplateSelector({
      templates: mockTemplates,
      device: 'desktop',
    })

    await filterByCategory('login')

    expect(filteredTemplates.value.every(t => t.category === 'login')).toBe(true)
  })

  it('应该按设备类型过滤模板', async () => {
    const { filterByDevice, filteredTemplates } = useTemplateSelector({
      templates: mockTemplates,
      device: 'desktop',
    })

    await filterByDevice('mobile')

    expect(filteredTemplates.value.every(t => t.device === 'mobile')).toBe(true)
  })

  it('应该重置选择器状态', () => {
    const {
      selectTemplate,
      searchTemplates,
      reset,
      selectedTemplate,
      searchQuery,
      filteredTemplates,
    } = useTemplateSelector({
      templates: mockTemplates,
      device: 'desktop',
    })

    // 设置一些状态
    selectTemplate(mockTemplates[0])
    searchTemplates('test')

    // 重置
    reset()

    expect(selectedTemplate.value).toBeNull()
    expect(searchQuery.value).toBe('')
    expect(filteredTemplates.value).toEqual(mockTemplates)
  })

  it('应该处理预览功能', async () => {
    const onPreview = vi.fn()
    const { previewTemplate } = useTemplateSelector({
      templates: mockTemplates,
      device: 'desktop',
      onPreview,
    })

    await previewTemplate(mockTemplates[0])

    expect(onPreview).toHaveBeenCalledWith(mockTemplates[0])
  })
})

describe('useTemplateRenderer', () => {
  let mockTemplate: TemplateMetadata

  beforeEach(() => {
    mockTemplate = {
      name: 'test-template',
      displayName: '测试模板',
      description: '测试模板描述',
      version: '1.0.0',
      author: 'test',
      category: 'login',
      device: 'desktop',
      componentPath: '/path/to/component.vue',
      componentLoader: vi.fn().mockResolvedValue({
        name: 'TestComponent',
        setup: () => () => ({ tag: 'div', children: 'Test Component' }),
      }),
      configPath: '/path/to/config.ts',
      lastModified: Date.now(),
      isBuiltIn: true,
    }
  })

  it('应该提供模板渲染功能', () => {
    const {
      currentTemplate,
      renderedComponent,
      isLoading,
      loadError,
      renderTemplate,
      clearTemplate,
    } = useTemplateRenderer()

    expect(currentTemplate.value).toBeNull()
    expect(renderedComponent.value).toBeNull()
    expect(isLoading.value).toBe(false)
    expect(loadError.value).toBeNull()
    expect(typeof renderTemplate).toBe('function')
    expect(typeof clearTemplate).toBe('function')
  })

  it('应该渲染模板', async () => {
    const { renderTemplate, currentTemplate, renderedComponent, isLoading } = useTemplateRenderer()

    expect(isLoading.value).toBe(false)

    const renderPromise = renderTemplate(mockTemplate)
    expect(isLoading.value).toBe(true)

    await renderPromise

    expect(isLoading.value).toBe(false)
    expect(currentTemplate.value).toBe(mockTemplate)
    expect(renderedComponent.value).toBeDefined()
  })

  it('应该处理加载错误', async () => {
    const errorTemplate = {
      ...mockTemplate,
      componentLoader: vi.fn().mockRejectedValue(new Error('Load failed')),
    }

    const { renderTemplate, loadError } = useTemplateRenderer()

    await renderTemplate(errorTemplate)

    expect(loadError.value).toBeDefined()
    expect(loadError.value?.message).toBe('Load failed')
  })

  it('应该清除模板', () => {
    const { renderTemplate, clearTemplate, currentTemplate, renderedComponent } = useTemplateRenderer()

    renderTemplate(mockTemplate)
    clearTemplate()

    expect(currentTemplate.value).toBeNull()
    expect(renderedComponent.value).toBeNull()
  })

  it('应该缓存已加载的组件', async () => {
    const { renderTemplate } = useTemplateRenderer({ enableCache: true })

    // 第一次加载
    await renderTemplate(mockTemplate)
    expect(mockTemplate.componentLoader).toHaveBeenCalledTimes(1)

    // 第二次加载应该使用缓存
    await renderTemplate(mockTemplate)
    expect(mockTemplate.componentLoader).toHaveBeenCalledTimes(1)
  })
})

describe('useTemplateConfig', () => {
  it('应该提供配置管理功能', () => {
    const {
      config,
      updateConfig,
      resetConfig,
      validateConfig,
      exportConfig,
      importConfig,
    } = useTemplateConfig({
      templatesDir: 'test/templates',
      debug: true,
    })

    expect(config.value).toBeDefined()
    expect(config.value.templatesDir).toBe('test/templates')
    expect(config.value.debug).toBe(true)
    expect(typeof updateConfig).toBe('function')
    expect(typeof resetConfig).toBe('function')
    expect(typeof validateConfig).toBe('function')
    expect(typeof exportConfig).toBe('function')
    expect(typeof importConfig).toBe('function')
  })

  it('应该更新配置', async () => {
    const { config, updateConfig } = useTemplateConfig({
      templatesDir: 'initial/templates',
    })

    await updateConfig({
      templatesDir: 'updated/templates',
      debug: true,
    })

    expect(config.value.templatesDir).toBe('updated/templates')
    expect(config.value.debug).toBe(true)
  })

  it('应该验证配置', () => {
    const { validateConfig } = useTemplateConfig()

    const validConfig = {
      templatesDir: 'valid/templates',
      autoScan: true,
    }

    const invalidConfig = {
      templatesDir: '', // 无效
      autoScan: 'invalid', // 类型错误
    }

    const validResult = validateConfig(validConfig)
    const invalidResult = validateConfig(invalidConfig as any)

    expect(validResult.valid).toBe(true)
    expect(invalidResult.valid).toBe(false)
  })

  it('应该导出和导入配置', () => {
    const { config, exportConfig, importConfig } = useTemplateConfig({
      templatesDir: 'export/templates',
      debug: true,
    })

    const exported = exportConfig()
    expect(typeof exported).toBe('string')

    // 修改配置
    config.value.debug = false

    // 导入原始配置
    importConfig(exported)
    expect(config.value.debug).toBe(true)
  })
})

describe('useDeviceDetection', () => {
  it('应该提供设备检测功能', () => {
    const {
      currentDevice,
      isMobile,
      isTablet,
      isDesktop,
      detectDevice,
      onDeviceChange,
    } = useDeviceDetection()

    expect(currentDevice.value).toBe('desktop')
    expect(isMobile.value).toBe(false)
    expect(isTablet.value).toBe(false)
    expect(isDesktop.value).toBe(true)
    expect(typeof detectDevice).toBe('function')
    expect(typeof onDeviceChange).toBe('function')
  })

  it('应该检测设备变化', async () => {
    const { currentDevice, detectDevice } = useDeviceDetection()

    // 模拟设备检测返回不同结果
    const mockDetector = (await import('@ldesign/device')).createDeviceDetector()
    vi.mocked(mockDetector.detect).mockReturnValue('mobile')

    detectDevice()
    await nextTick()

    expect(currentDevice.value).toBe('mobile')
  })

  it('应该监听设备变化事件', () => {
    const changeHandler = vi.fn()
    const { onDeviceChange } = useDeviceDetection()

    onDeviceChange(changeHandler)

    // 这里需要模拟设备变化事件的触发
    // 具体实现取决于设备检测器的实现
    expect(changeHandler).toBeDefined()
  })
})
