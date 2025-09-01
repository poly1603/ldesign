import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, nextTick, watch, computed } from 'vue'
import { useTemplateConfig } from '../../composables/useTemplateConfig'
import { mockTemplateConfig, mockConfigManager } from '../../test-utils'

// Mock 配置管理器
vi.mock('../../config', () => ({
  TemplateConfigManager: {
    getInstance: vi.fn(() => mockConfigManager),
  },
}))

describe('useTemplateConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConfigManager.getConfig.mockReturnValue(mockTemplateConfig)
  })

  describe('基本功能', () => {
    it('应该返回正确的初始配置', () => {
      const { config, loading, error } = useTemplateConfig()

      expect(config.value).toEqual(mockTemplateConfig)
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('应该能够获取配置', async () => {
      const { config, getConfig } = useTemplateConfig()

      await getConfig()

      expect(mockConfigManager.getConfig).toHaveBeenCalled()
      expect(config.value).toEqual(mockTemplateConfig)
    })
  })

  describe('配置更新', () => {
    it('应该能够更新配置', async () => {
      const { config, updateConfig } = useTemplateConfig()
      const newConfig = {
        ...mockTemplateConfig,
        defaultDevice: 'mobile' as const,
      }

      await updateConfig(newConfig)

      expect(mockConfigManager.updateConfig).toHaveBeenCalledWith(newConfig)
      expect(config.value.defaultDevice).toBe('mobile')
    })

    it('应该能够部分更新配置', async () => {
      const { config, updateConfig } = useTemplateConfig()
      const partialConfig = {
        defaultDevice: 'tablet' as const,
        enableCache: false,
      }

      await updateConfig(partialConfig)

      expect(mockConfigManager.updateConfig).toHaveBeenCalledWith(
        expect.objectContaining(partialConfig)
      )
    })

    it('应该在更新时显示加载状态', async () => {
      const { loading, updateConfig } = useTemplateConfig()

      // Mock 异步更新
      mockConfigManager.updateConfig.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      const updatePromise = updateConfig({ enableCache: false })

      expect(loading.value).toBe(true)

      await updatePromise

      expect(loading.value).toBe(false)
    })
  })

  describe('配置监听', () => {
    it('应该能够监听配置变化', () => {
      const { watchConfig } = useTemplateConfig()
      const callback = vi.fn()

      watchConfig(callback)

      expect(mockConfigManager.watchConfig).toHaveBeenCalledWith(callback)
    })

    it('应该能够停止监听配置变化', () => {
      const { watchConfig, unwatchConfig } = useTemplateConfig()
      const callback = vi.fn()

      watchConfig(callback)
      unwatchConfig(callback)

      expect(mockConfigManager.unwatchConfig).toHaveBeenCalledWith(callback)
    })

    it('应该在配置变化时更新本地状态', async () => {
      const { config, watchConfig } = useTemplateConfig()
      const callback = vi.fn()

      watchConfig(callback)

      // 模拟配置变化
      const newConfig = { ...mockTemplateConfig, enableCache: false }
      mockConfigManager.getConfig.mockReturnValue(newConfig)

      // 触发回调
      const watchCallback = mockConfigManager.watchConfig.mock.calls[0][0]
      watchCallback(newConfig)

      await nextTick()

      expect(config.value.enableCache).toBe(false)
    })
  })

  describe('特定配置项访问', () => {
    it('应该能够获取动画配置', () => {
      const { getAnimationConfig } = useTemplateConfig()

      const animationConfig = getAnimationConfig()

      expect(animationConfig).toEqual(mockTemplateConfig.animation)
    })

    it('应该能够获取缓存配置', () => {
      const { getCacheConfig } = useTemplateConfig()

      const cacheConfig = getCacheConfig()

      expect(cacheConfig).toEqual(mockTemplateConfig.cache)
    })

    it('应该能够获取性能配置', () => {
      const { getPerformanceConfig } = useTemplateConfig()

      const performanceConfig = getPerformanceConfig()

      expect(performanceConfig).toEqual(mockTemplateConfig.performance)
    })

    it('应该能够检查功能是否启用', () => {
      const { isFeatureEnabled } = useTemplateConfig()

      expect(isFeatureEnabled('cache')).toBe(true)
      expect(isFeatureEnabled('performance')).toBe(true)
      expect(isFeatureEnabled('animation')).toBe(true)
    })
  })

  describe('配置验证', () => {
    it('应该能够验证配置格式', () => {
      const { validateConfig } = useTemplateConfig()

      const validConfig = mockTemplateConfig
      const invalidConfig = { ...mockTemplateConfig, defaultDevice: 'invalid' }

      expect(validateConfig(validConfig)).toBe(true)
      expect(validateConfig(invalidConfig)).toBe(false)
    })

    it('应该在配置无效时设置错误', async () => {
      const { error, updateConfig } = useTemplateConfig()

      // Mock 配置管理器抛出验证错误
      mockConfigManager.updateConfig.mockRejectedValue(new Error('配置格式无效'))

      await updateConfig({ defaultDevice: 'invalid' as any })

      expect(error.value).toBeTruthy()
      expect(error.value?.message).toBe('配置格式无效')
    })
  })

  describe('默认配置', () => {
    it('应该能够重置为默认配置', async () => {
      const { config, resetToDefault } = useTemplateConfig()

      // 先修改配置
      await updateConfig({ enableCache: false })

      // 重置为默认
      await resetToDefault()

      expect(config.value).toEqual(mockTemplateConfig)
    })

    it('应该能够获取默认配置', () => {
      const { getDefaultConfig } = useTemplateConfig()

      const defaultConfig = getDefaultConfig()

      expect(defaultConfig).toBeDefined()
      expect(defaultConfig.templatesDir).toBeDefined()
      expect(defaultConfig.autoScan).toBeDefined()
    })
  })

  describe('配置持久化', () => {
    it('应该能够保存配置到本地存储', async () => {
      const { saveToLocal } = useTemplateConfig()

      await saveToLocal()

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ldesign-template-config',
        JSON.stringify(mockTemplateConfig)
      )
    })

    it('应该能够从本地存储加载配置', async () => {
      const { loadFromLocal } = useTemplateConfig()

      // Mock localStorage 返回配置
      const savedConfig = JSON.stringify({ ...mockTemplateConfig, enableCache: false })
      localStorage.getItem.mockReturnValue(savedConfig)

      const config = await loadFromLocal()

      expect(localStorage.getItem).toHaveBeenCalledWith('ldesign-template-config')
      expect(config.enableCache).toBe(false)
    })

    it('应该能够清除本地存储的配置', () => {
      const { clearLocal } = useTemplateConfig()

      clearLocal()

      expect(localStorage.removeItem).toHaveBeenCalledWith('ldesign-template-config')
    })
  })

  describe('配置合并', () => {
    it('应该能够合并多个配置对象', () => {
      const { mergeConfigs } = useTemplateConfig()

      const config1 = { enableCache: true, autoScan: false }
      const config2 = { enableCache: false, enableHMR: true }
      const config3 = { defaultDevice: 'mobile' as const }

      const merged = mergeConfigs(config1, config2, config3)

      expect(merged).toEqual({
        enableCache: false, // 后面的覆盖前面的
        autoScan: false,
        enableHMR: true,
        defaultDevice: 'mobile',
      })
    })

    it('应该能够深度合并嵌套配置', () => {
      const { mergeConfigs } = useTemplateConfig()

      const config1 = {
        animation: { enable: true, duration: 300 },
        cache: { enable: true, maxSize: 50 }
      }
      const config2 = {
        animation: { duration: 500 },
        cache: { ttl: 60000 }
      }

      const merged = mergeConfigs(config1, config2)

      expect(merged.animation).toEqual({ enable: true, duration: 500 })
      expect(merged.cache).toEqual({ enable: true, maxSize: 50, ttl: 60000 })
    })
  })

  describe('错误处理', () => {
    it('应该正确处理配置加载错误', async () => {
      const { error, getConfig } = useTemplateConfig()

      mockConfigManager.getConfig.mockImplementation(() => {
        throw new Error('配置加载失败')
      })

      await getConfig()

      expect(error.value).toBeTruthy()
      expect(error.value?.message).toBe('配置加载失败')
    })

    it('应该能够清除错误状态', () => {
      const { error, clearError } = useTemplateConfig()

      // 模拟设置错误
      error.value = new Error('测试错误')
      expect(error.value).toBeTruthy()

      clearError()
      expect(error.value).toBeNull()
    })

    it('应该在网络错误时提供降级配置', async () => {
      const { config, getConfig } = useTemplateConfig()

      mockConfigManager.getConfig.mockRejectedValue(new Error('网络错误'))

      await getConfig()

      // 应该使用默认配置作为降级
      expect(config.value).toBeDefined()
      expect(config.value.templatesDir).toBeDefined()
    })
  })

  describe('响应式更新', () => {
    it('配置变化应该触发响应式更新', async () => {
      const { config } = useTemplateConfig()
      const watcherCallback = vi.fn()

      // 监听配置变化
      watch(config, watcherCallback, { deep: true })

      // 更新配置
      await updateConfig({ enableCache: false })

      expect(watcherCallback).toHaveBeenCalled()
    })

    it('应该能够计算派生状态', () => {
      const { config } = useTemplateConfig()

      const isCacheEnabled = computed(() => config.value.enableCache)
      const isAnimationEnabled = computed(() => config.value.animation?.enable)

      expect(isCacheEnabled.value).toBe(true)
      expect(isAnimationEnabled.value).toBe(true)
    })
  })
})
