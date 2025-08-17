import type { EnvironmentManager } from '../src/environment/environment-manager'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEnvironmentManager } from '../src/environment/environment-manager'
import { createLogger } from '../src/logger/logger'

// Mock DOM APIs for testing
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    onLine: true,
    maxTouchPoints: 0,
  },
  writable: true,
})

Object.defineProperty(window, 'screen', {
  value: {
    width: 1920,
    height: 1080,
    availWidth: 1920,
    availHeight: 1040,
    colorDepth: 24,
    orientation: {
      type: 'landscape-primary',
      addEventListener: vi.fn(),
    },
  },
  writable: true,
})

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

describe('environmentManager', () => {
  let environmentManager: EnvironmentManager

  beforeEach(() => {
    const logger = createLogger('debug')
    environmentManager = createEnvironmentManager(logger)
  })

  describe('环境检测', () => {
    it('应该检测基本环境信息', () => {
      const info = environmentManager.detect()

      expect(info).toBeDefined()
      expect(info.environment).toMatch(/development|production|test/)
      expect(info.platform).toMatch(/browser|node|webworker|electron|unknown/)
      expect(info.browser).toBeDefined()
      expect(info.device).toBeDefined()
      expect(info.features).toBeDefined()
      expect(info.screen).toBeDefined()
      expect(info.timezone).toBeDefined()
    })

    it('应该正确检测环境类型', () => {
      const environment = environmentManager.getEnvironment()
      expect(['development', 'production', 'test']).toContain(environment)
    })

    it('应该正确检测平台类型', () => {
      const platform = environmentManager.getPlatform()
      expect(['browser', 'node', 'webworker', 'electron', 'unknown']).toContain(platform)
    })

    it('应该正确检测浏览器信息', () => {
      const browser = environmentManager.getBrowser()

      expect(browser).toBeDefined()
      expect(browser.name).toMatch(/chrome|firefox|safari|edge|ie|opera|unknown/)
      expect(typeof browser.version).toBe('string')
    })

    it('应该正确检测设备信息', () => {
      const device = environmentManager.getDevice()

      expect(device).toBeDefined()
      expect(device.type).toMatch(/desktop|mobile|tablet|unknown/)
      expect(typeof device.isMobile).toBe('boolean')
    })
  })

  describe('特性检测', () => {
    it('应该检测Web API特性', () => {
      const features = environmentManager.getFeatures()

      expect(features).toBeDefined()
      expect(typeof features.hasLocalStorage).toBe('boolean')
      expect(typeof features.hasSessionStorage).toBe('boolean')
      expect(typeof features.hasIndexedDB).toBe('boolean')
      expect(typeof features.hasWebWorkers).toBe('boolean')
      expect(typeof features.hasServiceWorkers).toBe('boolean')
    })

    it('应该能够检查单个特性', () => {
      const hasLocalStorage = environmentManager.hasFeature('hasLocalStorage')
      expect(typeof hasLocalStorage).toBe('boolean')

      const hasWebGL = environmentManager.hasFeature('hasWebGL')
      expect(typeof hasWebGL).toBe('boolean')
    })

    it('应该能够检查兼容性', () => {
      const requirements = {
        features: ['hasLocalStorage', 'hasWebWorkers'],
        browser: {
          chrome: '80',
          firefox: '75',
        },
      }

      const isCompatible = environmentManager.checkCompatibility(requirements)
      expect(typeof isCompatible).toBe('boolean')
    })
  })

  describe('环境适配', () => {
    it('应该提供默认适配配置', () => {
      const adaptation = environmentManager.getAdaptation()

      expect(adaptation).toBeDefined()
      expect(adaptation.fallbacks).toBeDefined()
      expect(adaptation.optimizations).toBeDefined()
      expect(adaptation.compatibility).toBeDefined()
    })

    it('应该能够设置适配配置', () => {
      const customAdaptation = {
        fallbacks: {
          storage: 'cookie' as const,
          animation: 'js' as const,
          networking: 'xhr' as const,
        },
        optimizations: {
          enableLazyLoading: true,
          enableCodeSplitting: true,
          enableImageOptimization: true,
          enableCaching: false,
          maxConcurrentRequests: 4,
        },
      }

      environmentManager.setAdaptation(customAdaptation)
      const adaptation = environmentManager.getAdaptation()

      expect(adaptation.fallbacks.storage).toBe('cookie')
      expect(adaptation.optimizations.enableLazyLoading).toBe(true)
    })

    it('应该能够根据环境自动适配', () => {
      const envInfo = environmentManager.detect()
      const adaptation = environmentManager.adaptForEnvironment(envInfo)

      expect(adaptation).toBeDefined()
      expect(adaptation.fallbacks).toBeDefined()
      expect(adaptation.optimizations).toBeDefined()
      expect(adaptation.compatibility).toBeDefined()
    })
  })

  describe('性能监控', () => {
    it('应该能够获取性能信息', () => {
      const perfInfo = environmentManager.getPerformanceInfo()

      expect(perfInfo).toBeDefined()
      // 性能信息可能为空，这是正常的
    })

    it('应该能够监控性能变化', async () => {
      const callback = vi.fn()

      environmentManager.monitorPerformance(callback)

      // 等待一小段时间让监控器执行
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(callback).toHaveBeenCalled()
    })
  })

  describe('事件监听', () => {
    it('应该能够监听环境变化', () => {
      const callback = vi.fn()

      const unsubscribe = environmentManager.onEnvironmentChange(callback)

      expect(typeof unsubscribe).toBe('function')

      // 清理监听器
      unsubscribe()
    })

    it('应该能够监听特性变化', () => {
      const callback = vi.fn()

      const unsubscribe = environmentManager.onFeatureChange('hasLocalStorage', callback)

      expect(typeof unsubscribe).toBe('function')

      // 清理监听器
      unsubscribe()
    })
  })

  describe('浏览器检测', () => {
    it('应该正确检测Chrome浏览器', () => {
      // 模拟Chrome用户代理
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        writable: true,
      })

      const manager = createEnvironmentManager()
      const browser = manager.getBrowser()

      expect(browser.name).toBe('chrome')
      expect(browser.version).toBe('91')
    })

    it('应该正确检测Firefox浏览器', () => {
      // 模拟Firefox用户代理
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        writable: true,
      })

      const manager = createEnvironmentManager()
      const browser = manager.getBrowser()

      expect(browser.name).toBe('firefox')
      expect(browser.version).toBe('89')
    })

    it('应该正确检测Safari浏览器', () => {
      // 模拟Safari用户代理
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        writable: true,
      })

      const manager = createEnvironmentManager()
      const browser = manager.getBrowser()

      expect(browser.name).toBe('safari')
      expect(browser.version).toBe('14')
    })
  })

  describe('设备检测', () => {
    it('应该正确检测移动设备', () => {
      // 模拟移动设备用户代理
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        writable: true,
      })

      const manager = createEnvironmentManager()
      const device = manager.getDevice()

      expect(device.type).toBe('mobile')
      expect(device.isMobile).toBe(true)
    })

    it('应该正确检测平板设备', () => {
      // 模拟iPad用户代理
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        writable: true,
      })

      const manager = createEnvironmentManager()
      const device = manager.getDevice()

      expect(device.type).toBe('tablet')
      expect(device.isMobile).toBe(true)
    })
  })
})
