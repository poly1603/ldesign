import type { DeviceDetectorOptions } from '../src/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DeviceDetector } from '../src/core/DeviceDetector'

// Mock window and navigator
const mockWindow = {
  innerWidth: 1920,
  innerHeight: 1080,
  devicePixelRatio: 1,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}

const mockNavigator = {
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  onLine: true,
  maxTouchPoints: 0,
}

const mockScreen = {
  orientation: {
    angle: 0,
  },
}

// Setup global mocks
Object.defineProperty(globalThis, 'window', {
  value: mockWindow,
  writable: true,
})

Object.defineProperty(globalThis, 'navigator', {
  value: mockNavigator,
  writable: true,
})

Object.defineProperty(globalThis, 'screen', {
  value: mockScreen,
  writable: true,
})

describe('deviceDetector', () => {
  let detector: DeviceDetector

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(async () => {
    if (detector) {
      await detector.destroy()
    }
  })

  describe('基础功能', () => {
    it('应该正确初始化设备检测器', () => {
      detector = new DeviceDetector()
      expect(detector).toBeInstanceOf(DeviceDetector)
    })

    it('应该正确检测桌面设备类型', () => {
      detector = new DeviceDetector()
      expect(detector.getDeviceType()).toBe('desktop')
      expect(detector.isDesktop()).toBe(true)
      expect(detector.isMobile()).toBe(false)
      expect(detector.isTablet()).toBe(false)
    })

    it('应该正确检测屏幕方向', () => {
      // 模拟横屏环境
      vi.stubGlobal('innerWidth', 1920)
      vi.stubGlobal('innerHeight', 1080)
      // 移除 screen.orientation 以使用 window 尺寸判断
      Object.defineProperty(screen, 'orientation', {
        value: undefined,
        configurable: true,
      })

      detector = new DeviceDetector()
      expect(detector.getOrientation()).toBe('landscape')

      // 恢复
      vi.unstubAllGlobals()
    })

    it('应该正确检测触摸设备', () => {
      detector = new DeviceDetector()
      expect(detector.isTouchDevice()).toBe(false)
    })

    it('应该返回完整的设备信息', () => {
      // 模拟横屏环境
      vi.stubGlobal('innerWidth', 1920)
      vi.stubGlobal('innerHeight', 1080)
      // 移除 screen.orientation 以使用 window 尺寸判断
      Object.defineProperty(screen, 'orientation', {
        value: undefined,
        configurable: true,
      })

      detector = new DeviceDetector()
      const deviceInfo = detector.getDeviceInfo()

      expect(deviceInfo).toMatchObject({
        type: 'desktop',
        orientation: 'landscape',
        width: 1920,
        height: 1080,
        pixelRatio: 1,
        isTouchDevice: false,
        userAgent: expect.any(String),
        os: {
          name: expect.any(String),
          version: expect.any(String),
        },
        browser: {
          name: expect.any(String),
          version: expect.any(String),
        },
      })
    })
  })

  describe('移动设备检测', () => {
    beforeEach(() => {
      mockWindow.innerWidth = 375
      mockWindow.innerHeight = 667
      mockNavigator.userAgent
        = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
      mockNavigator.maxTouchPoints = 5
    })

    it('应该正确检测移动设备', () => {
      detector = new DeviceDetector()
      expect(detector.getDeviceType()).toBe('mobile')
      expect(detector.isMobile()).toBe(true)
      expect(detector.isDesktop()).toBe(false)
    })

    it('应该正确检测竖屏方向', () => {
      detector = new DeviceDetector()
      expect(detector.getOrientation()).toBe('portrait')
    })
  })

  describe('平板设备检测', () => {
    beforeEach(() => {
      mockWindow.innerWidth = 768
      mockWindow.innerHeight = 1024
      mockNavigator.userAgent
        = 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
      mockNavigator.maxTouchPoints = 5
    })

    it('应该正确检测平板设备', () => {
      detector = new DeviceDetector()
      expect(detector.getDeviceType()).toBe('tablet')
      expect(detector.isTablet()).toBe(true)
      expect(detector.isMobile()).toBe(false)
      expect(detector.isDesktop()).toBe(false)
    })
  })

  describe('自定义配置', () => {
    it('应该支持自定义断点', () => {
      const options: DeviceDetectorOptions = {
        breakpoints: {
          mobile: 600,
          tablet: 900,
        },
      }

      mockWindow.innerWidth = 650
      detector = new DeviceDetector(options)
      expect(detector.getDeviceType()).toBe('tablet')
    })

    it('应该支持禁用事件监听', () => {
      const options: DeviceDetectorOptions = {
        enableResize: false,
        enableOrientation: false,
      }

      detector = new DeviceDetector(options)
      expect(mockWindow.addEventListener).not.toHaveBeenCalled()
    })
  })

  describe('事件系统', () => {
    it('应该支持事件监听', () => {
      detector = new DeviceDetector()
      const callback = vi.fn()

      detector.on('deviceChange', callback)
      expect(detector.listenerCount('deviceChange')).toBe(1)

      detector.off('deviceChange', callback)
      expect(detector.listenerCount('deviceChange')).toBe(0)
    })

    it('应该支持一次性事件监听', () => {
      detector = new DeviceDetector()
      const callback = vi.fn()

      detector.once('deviceChange', callback)
      expect(detector.listenerCount('deviceChange')).toBe(1)

      detector.emit('deviceChange', detector.getDeviceInfo())
      expect(callback).toHaveBeenCalledTimes(1)
      expect(detector.listenerCount('deviceChange')).toBe(0)
    })
  })

  describe('模块系统', () => {
    it('应该支持检查模块加载状态', () => {
      detector = new DeviceDetector()
      expect(detector.isModuleLoaded('network')).toBe(false)
    })

    it('应该返回已加载的模块列表', () => {
      detector = new DeviceDetector()
      expect(detector.getLoadedModules()).toEqual([])
    })
  })

  describe('生命周期', () => {
    it('应该正确销毁检测器', async () => {
      detector = new DeviceDetector()
      await detector.destroy()

      expect(mockWindow.removeEventListener).toHaveBeenCalled()
    })

    it('销毁后不应该响应事件', async () => {
      detector = new DeviceDetector()
      await detector.destroy()

      expect(() => detector.refresh()).not.toThrow()
    })
  })

  describe('服务端渲染支持', () => {
    it('应该在没有 window 对象时返回默认值', () => {
      const originalWindow = globalThis.window
      // @ts-expect-error - 测试用途
      delete globalThis.window

      detector = new DeviceDetector()
      const deviceInfo = detector.getDeviceInfo()

      expect(deviceInfo.type).toBe('desktop')
      expect(deviceInfo.orientation).toBe('landscape')
      expect(deviceInfo.width).toBe(1920)
      expect(deviceInfo.height).toBe(1080)

      globalThis.window = originalWindow
    })
  })
})
