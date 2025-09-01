/**
 * 响应式模板切换功能测试
 */

import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useDeviceDetection } from '../../src/composables/useDeviceDetection'
import { useResponsiveTemplate } from '../../src/composables/useResponsiveTemplate'
import { useTemplate } from '../../src/composables/useTemplate'

// Mock composables
vi.mock('../../src/composables/useDeviceDetection')
vi.mock('../../src/composables/useTemplate')

const mockUseDeviceDetection = useDeviceDetection as Mock
const mockUseTemplate = useTemplate as Mock

describe('响应式模板切换', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // 默认 mock 设置
    mockUseDeviceDetection.mockReturnValue({
      deviceType: ref('desktop'),
      setDeviceType: vi.fn(),
    })

    mockUseTemplate.mockReturnValue({
      templates: ref([]),
      loading: ref(false),
      error: ref(null),
      getTemplate: vi.fn(),
      loadTemplate: vi.fn(),
    })
  })

  describe('基础功能', () => {
    it('应该正确初始化', () => {
      const mockTemplates = [
        {
          name: 'default',
          category: 'login',
          device: 'desktop',
          componentLoader: vi.fn(),
        },
      ]

      mockUseTemplate.mockReturnValue({
        templates: ref(mockTemplates),
        loading: ref(false),
        error: ref(null),
        getTemplate: vi.fn().mockReturnValue(mockTemplates[0]),
        loadTemplate: vi.fn(),
      })

      const {
        currentDevice,
        currentTemplate,
        currentTemplateMetadata,
      } = useResponsiveTemplate({
        category: 'login',
        initialTemplate: 'default',
        initialDevice: 'desktop',
      })

      expect(currentDevice.value).toBe('desktop')
      expect(currentTemplate.value).toBe('default')
    })

    it('应该支持自定义初始配置', () => {
      const {
        currentDevice,
        currentTemplate,
      } = useResponsiveTemplate({
        category: 'dashboard',
        initialTemplate: 'admin',
        initialDevice: 'tablet',
      })

      expect(currentDevice.value).toBe('tablet')
      expect(currentTemplate.value).toBe('admin')
    })
  })

  describe('设备切换', () => {
    it('应该能够手动切换设备', async () => {
      const mockSetDeviceType = vi.fn()
      const mockGetTemplate = vi.fn().mockReturnValue({
        name: 'default',
        category: 'login',
        device: 'mobile',
        componentLoader: vi.fn(),
      })

      mockUseDeviceDetection.mockReturnValue({
        deviceType: ref('desktop'),
        setDeviceType: mockSetDeviceType,
      })

      mockUseTemplate.mockReturnValue({
        templates: ref([]),
        loading: ref(false),
        error: ref(null),
        getTemplate: mockGetTemplate,
        loadTemplate: vi.fn(),
      })

      const { switchDevice, currentDevice } = useResponsiveTemplate({
        category: 'login',
        enableAutoDeviceSwitch: true,
      })

      await switchDevice('mobile')

      expect(mockSetDeviceType).toHaveBeenCalledWith('mobile')
      expect(currentDevice.value).toBe('mobile')
    })

    it('应该支持设备模板映射', async () => {
      const deviceTemplateMap = {
        desktop: 'default',
        tablet: 'tablet-optimized',
        mobile: 'mobile-first',
      }

      const mockGetTemplate = vi.fn()
        .mockReturnValueOnce({
          name: 'tablet-optimized',
          category: 'login',
          device: 'tablet',
        })

      mockUseTemplate.mockReturnValue({
        templates: ref([]),
        loading: ref(false),
        error: ref(null),
        getTemplate: mockGetTemplate,
        loadTemplate: vi.fn(),
      })

      const { switchDevice, currentTemplate } = useResponsiveTemplate({
        category: 'login',
        deviceTemplateMap,
      })

      await switchDevice('tablet')

      expect(currentTemplate.value).toBe('tablet-optimized')
    })

    it('应该处理设备切换错误', async () => {
      const mockGetTemplate = vi.fn().mockReturnValue(null)

      mockUseTemplate.mockReturnValue({
        templates: ref([]),
        loading: ref(false),
        error: ref(null),
        getTemplate: mockGetTemplate,
        loadTemplate: vi.fn(),
      })

      const { switchDevice, switchError } = useResponsiveTemplate({
        category: 'login',
      })

      try {
        await switchDevice('mobile')
      }
      catch (error) {
        expect(switchError.value).toContain('Template not found')
      }
    })
  })

  describe('模板切换', () => {
    it('应该能够手动切换模板', async () => {
      const mockTemplate = {
        name: 'modern',
        category: 'login',
        device: 'desktop',
        componentLoader: vi.fn(),
      }

      mockUseTemplate.mockReturnValue({
        templates: ref([mockTemplate]),
        loading: ref(false),
        error: ref(null),
        getTemplate: vi.fn().mockReturnValue(mockTemplate),
        loadTemplate: vi.fn(),
      })

      const { switchTemplate, currentTemplate } = useResponsiveTemplate({
        category: 'login',
      })

      await switchTemplate('modern')

      expect(currentTemplate.value).toBe('modern')
    })

    it('应该支持跨设备模板切换', async () => {
      const mockTemplate = {
        name: 'default',
        category: 'login',
        device: 'mobile',
        componentLoader: vi.fn(),
      }

      mockUseTemplate.mockReturnValue({
        templates: ref([mockTemplate]),
        loading: ref(false),
        error: ref(null),
        getTemplate: vi.fn().mockReturnValue(mockTemplate),
        loadTemplate: vi.fn(),
      })

      const { switchTemplate, currentDevice, currentTemplate } = useResponsiveTemplate({
        category: 'login',
      })

      await switchTemplate('default', 'mobile')

      expect(currentDevice.value).toBe('mobile')
      expect(currentTemplate.value).toBe('default')
    })

    it('应该避免重复切换', async () => {
      const mockGetTemplate = vi.fn()

      mockUseTemplate.mockReturnValue({
        templates: ref([]),
        loading: ref(false),
        error: ref(null),
        getTemplate: mockGetTemplate,
        loadTemplate: vi.fn(),
      })

      const { switchTemplate } = useResponsiveTemplate({
        category: 'login',
        initialTemplate: 'default',
      })

      // 切换到相同的模板应该不执行任何操作
      await switchTemplate('default')

      expect(mockGetTemplate).not.toHaveBeenCalled()
    })
  })

  describe('自动响应', () => {
    it('应该响应设备类型变化', async () => {
      const deviceTypeRef = ref('desktop')
      const mockGetTemplate = vi.fn().mockReturnValue({
        name: 'default',
        category: 'login',
        device: 'mobile',
      })

      mockUseDeviceDetection.mockReturnValue({
        deviceType: deviceTypeRef,
        setDeviceType: vi.fn(),
      })

      mockUseTemplate.mockReturnValue({
        templates: ref([]),
        loading: ref(false),
        error: ref(null),
        getTemplate: mockGetTemplate,
        loadTemplate: vi.fn(),
      })

      const { currentDevice } = useResponsiveTemplate({
        category: 'login',
        enableAutoDeviceSwitch: true,
      })

      // 模拟设备类型变化
      deviceTypeRef.value = 'mobile'
      await nextTick()

      // 由于是异步操作，需要等待
      await new Promise(resolve => setTimeout(resolve, 150))

      expect(currentDevice.value).toBe('mobile')
    })

    it('应该支持禁用自动切换', async () => {
      const deviceTypeRef = ref('desktop')

      mockUseDeviceDetection.mockReturnValue({
        deviceType: deviceTypeRef,
        setDeviceType: vi.fn(),
      })

      const { currentDevice } = useResponsiveTemplate({
        category: 'login',
        enableAutoDeviceSwitch: false,
      })

      const initialDevice = currentDevice.value

      // 模拟设备类型变化
      deviceTypeRef.value = 'mobile'
      await nextTick()

      // 设备类型不应该自动变化
      expect(currentDevice.value).toBe(initialDevice)
    })
  })

  describe('过渡动画', () => {
    it('应该支持过渡动画', async () => {
      const mockTemplate = {
        name: 'modern',
        category: 'login',
        device: 'desktop',
        componentLoader: vi.fn(),
      }

      mockUseTemplate.mockReturnValue({
        templates: ref([mockTemplate]),
        loading: ref(false),
        error: ref(null),
        getTemplate: vi.fn().mockReturnValue(mockTemplate),
        loadTemplate: vi.fn(),
      })

      const { switchTemplate, isSwitching } = useResponsiveTemplate({
        category: 'login',
        enableTransition: true,
        transitionDuration: 100,
      })

      const switchPromise = switchTemplate('modern')

      // 切换过程中应该显示切换状态
      expect(isSwitching.value).toBe(true)

      await switchPromise

      // 切换完成后状态应该重置
      expect(isSwitching.value).toBe(false)
    })

    it('应该支持禁用过渡动画', async () => {
      const mockTemplate = {
        name: 'modern',
        category: 'login',
        device: 'desktop',
        componentLoader: vi.fn(),
      }

      mockUseTemplate.mockReturnValue({
        templates: ref([mockTemplate]),
        loading: ref(false),
        error: ref(null),
        getTemplate: vi.fn().mockReturnValue(mockTemplate),
        loadTemplate: vi.fn(),
      })

      const { switchTemplate } = useResponsiveTemplate({
        category: 'login',
        enableTransition: false,
      })

      const startTime = Date.now()
      await switchTemplate('modern')
      const endTime = Date.now()

      // 没有过渡动画时切换应该很快完成
      expect(endTime - startTime).toBeLessThan(50)
    })
  })

  describe('工具方法', () => {
    it('应该能够获取可用模板列表', () => {
      const mockTemplates = [
        { name: 'default', category: 'login', device: 'desktop' },
        { name: 'modern', category: 'login', device: 'desktop' },
        { name: 'default', category: 'login', device: 'mobile' },
      ]

      mockUseTemplate.mockReturnValue({
        templates: ref(mockTemplates),
        loading: ref(false),
        error: ref(null),
        getTemplate: vi.fn(),
        loadTemplate: vi.fn(),
      })

      const { getAvailableTemplates } = useResponsiveTemplate({
        category: 'login',
      })

      const desktopTemplates = getAvailableTemplates('desktop')
      expect(desktopTemplates).toHaveLength(2)
      expect(desktopTemplates.every(t => t.device === 'desktop')).toBe(true)

      const mobileTemplates = getAvailableTemplates('mobile')
      expect(mobileTemplates).toHaveLength(1)
      expect(mobileTemplates[0].device).toBe('mobile')
    })

    it('应该能够重置状态', () => {
      const { reset, currentDevice, currentTemplate, switchError } = useResponsiveTemplate({
        category: 'login',
        initialTemplate: 'default',
        initialDevice: 'desktop',
      })

      // 修改状态
      switchError.value = 'Some error'

      // 重置状态
      reset()

      expect(currentDevice.value).toBe('desktop')
      expect(currentTemplate.value).toBe('default')
      expect(switchError.value).toBeNull()
    })
  })

  describe('防抖功能', () => {
    it('应该对快速切换进行防抖', async () => {
      const mockGetTemplate = vi.fn().mockReturnValue({
        name: 'modern',
        category: 'login',
        device: 'desktop',
      })

      mockUseTemplate.mockReturnValue({
        templates: ref([]),
        loading: ref(false),
        error: ref(null),
        getTemplate: mockGetTemplate,
        loadTemplate: vi.fn(),
      })

      const { switchTemplate } = useResponsiveTemplate({
        category: 'login',
        switchDebounce: 50,
      })

      // 快速连续切换
      switchTemplate('modern')
      switchTemplate('creative')
      await switchTemplate('default')

      // 由于防抖，只有最后一次切换应该生效
      expect(mockGetTemplate).toHaveBeenCalledWith('login', 'desktop', 'default')
    })
  })
})
