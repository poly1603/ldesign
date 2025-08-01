import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  checkDeviceSupport,
  createDeviceWatcher,
  DEFAULT_BREAKPOINTS,
  DEFAULT_DEVICE_CONFIG,
  detectDevice,
  detectDeviceByUserAgent,
  detectDeviceByViewport,
  getDeviceInfo,
  getViewportHeight,
  getViewportWidth,
  isMobileDevice,
  isTabletDevice,
  isTouchDevice,
} from '@/utils/device'

describe('device utils', () => {
  beforeEach(() => {
    // Mock window object
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('视口尺寸', () => {
    it('应该能获取视口宽度', () => {
      const width = getViewportWidth()
      expect(typeof width).toBe('number')
      expect(width).toBeGreaterThan(0)
    })

    it('应该能获取视口高度', () => {
      const height = getViewportHeight()
      expect(typeof height).toBe('number')
      expect(height).toBeGreaterThan(0)
    })

    it('在 SSR 环境下应该返回默认值', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window

      const width = getViewportWidth()
      const height = getViewportHeight()

      expect(width).toBe(1920)
      expect(height).toBe(1080)

      global.window = originalWindow
    })
  })

  describe('设备检测', () => {
    it('应该能检测移动设备', () => {
      // Mock mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      })

      const isMobile = isMobileDevice()
      expect(typeof isMobile).toBe('boolean')
    })

    it('应该能检测平板设备', () => {
      // Mock tablet user agent
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
      })

      const isTablet = isTabletDevice()
      expect(typeof isTablet).toBe('boolean')
    })

    it('应该能检测触摸设备', () => {
      const isTouch = isTouchDevice()
      expect(typeof isTouch).toBe('boolean')
    })

    it('应该能基于视口检测设备类型', () => {
      // 测试桌面端
      window.innerWidth = 1200
      let device = detectDeviceByViewport()
      expect(device).toBe('desktop')

      // 测试平板端
      window.innerWidth = 800
      device = detectDeviceByViewport()
      expect(device).toBe('tablet')

      // 测试移动端
      window.innerWidth = 600
      device = detectDeviceByViewport()
      expect(device).toBe('mobile')
    })

    it('应该能基于用户代理检测设备类型', () => {
      const device = detectDeviceByUserAgent()
      expect(['desktop', 'mobile', 'tablet']).toContain(device)
    })

    it('应该能综合检测设备类型', () => {
      const device = detectDevice()
      expect(['desktop', 'mobile', 'tablet']).toContain(device)
    })

    it('应该支持自定义检测器', () => {
      const customDetector = () => 'tablet' as const
      const device = detectDevice({
        ...DEFAULT_DEVICE_CONFIG,
        customDetector,
      })
      expect(device).toBe('tablet')
    })
  })

  describe('设备监听器', () => {
    it('应该能创建设备变化监听器', () => {
      const callback = vi.fn()
      const cleanup = createDeviceWatcher(callback)

      expect(typeof cleanup).toBe('function')
      cleanup()
    })

    it('应该在设备变化时调用回调', () => {
      const callback = vi.fn()
      const cleanup = createDeviceWatcher(callback)

      // 模拟窗口大小变化
      window.innerWidth = 600
      window.dispatchEvent(new Event('resize'))

      cleanup()
    })
  })

  describe('设备信息', () => {
    it('应该能获取完整的设备信息', () => {
      const info = getDeviceInfo()

      expect(info).toBeDefined()
      expect(typeof info.width).toBe('number')
      expect(typeof info.height).toBe('number')
      expect(['desktop', 'mobile', 'tablet']).toContain(info.device)
      expect(typeof info.isMobile).toBe('boolean')
      expect(typeof info.isTablet).toBe('boolean')
      expect(typeof info.isTouch).toBe('boolean')
      expect(typeof info.aspectRatio).toBe('number')
      expect(['landscape', 'portrait']).toContain(info.orientation)
    })
  })

  describe('设备支持检查', () => {
    it('应该能检查最小宽度支持', () => {
      window.innerWidth = 1200

      expect(checkDeviceSupport(1000)).toBe(true)
      expect(checkDeviceSupport(1500)).toBe(false)
    })

    it('应该能检查最大宽度支持', () => {
      window.innerWidth = 1200

      expect(checkDeviceSupport(undefined, 1500)).toBe(true)
      expect(checkDeviceSupport(undefined, 1000)).toBe(false)
    })

    it('应该能检查宽度范围支持', () => {
      window.innerWidth = 1200

      expect(checkDeviceSupport(1000, 1500)).toBe(true)
      expect(checkDeviceSupport(1300, 1500)).toBe(false)
      expect(checkDeviceSupport(1000, 1100)).toBe(false)
    })

    it('没有限制时应该返回 true', () => {
      expect(checkDeviceSupport()).toBe(true)
    })
  })

  describe('常量', () => {
    it('应该导出默认断点配置', () => {
      expect(DEFAULT_BREAKPOINTS).toBeDefined()
      expect(typeof DEFAULT_BREAKPOINTS.xs).toBe('number')
      expect(typeof DEFAULT_BREAKPOINTS.sm).toBe('number')
      expect(typeof DEFAULT_BREAKPOINTS.md).toBe('number')
      expect(typeof DEFAULT_BREAKPOINTS.lg).toBe('number')
      expect(typeof DEFAULT_BREAKPOINTS.xl).toBe('number')
      expect(typeof DEFAULT_BREAKPOINTS.xxl).toBe('number')
    })

    it('应该导出默认设备配置', () => {
      expect(DEFAULT_DEVICE_CONFIG).toBeDefined()
      expect(typeof DEFAULT_DEVICE_CONFIG.mobileBreakpoint).toBe('number')
      expect(typeof DEFAULT_DEVICE_CONFIG.tabletBreakpoint).toBe('number')
      expect(typeof DEFAULT_DEVICE_CONFIG.desktopBreakpoint).toBe('number')
    })
  })
})
