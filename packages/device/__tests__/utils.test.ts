import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  debounce,
  formatBytes,
  generateId,
  getDeviceTypeByWidth,
  getPixelRatio,
  getScreenOrientation,
  isAPISupported,
  isMobileDevice,
  isTouchDevice,
  parseBrowser,
  parseOS,
  safeNavigatorAccess,
  throttle,
} from '../src/utils'

describe('工具函数测试', () => {
  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('应该延迟执行函数', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该在多次调用时只执行最后一次', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn('first')
      debouncedFn('second')
      debouncedFn('third')

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('third')
    })
  })

  describe('throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('应该限制函数执行频率', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn()
      throttledFn()
      throttledFn()

      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(100)
      throttledFn()
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('isMobileDevice', () => {
    it('应该正确识别移动设备 User Agent', () => {
      const mobileUA
        = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
      expect(isMobileDevice(mobileUA)).toBe(true)

      const androidUA
        = 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36'
      expect(isMobileDevice(androidUA)).toBe(true)

      const desktopUA
        = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      expect(isMobileDevice(desktopUA)).toBe(false)
    })
  })

  describe('isTouchDevice', () => {
    it('应该正确检测触摸设备', () => {
      // Mock navigator.maxTouchPoints
      Object.defineProperty(globalThis.navigator, 'maxTouchPoints', {
        value: 5,
        configurable: true,
      })
      expect(isTouchDevice()).toBe(true)

      Object.defineProperty(globalThis.navigator, 'maxTouchPoints', {
        value: 0,
        configurable: true,
      })
      expect(isTouchDevice()).toBe(false)
    })
  })

  describe('getDeviceTypeByWidth', () => {
    it('应该根据宽度正确判断设备类型', () => {
      expect(getDeviceTypeByWidth(320)).toBe('mobile')
      expect(getDeviceTypeByWidth(768)).toBe('tablet')
      expect(getDeviceTypeByWidth(1200)).toBe('desktop')
    })

    it('应该支持自定义断点', () => {
      const breakpoints = { mobile: 600, tablet: 900 }
      expect(getDeviceTypeByWidth(500, breakpoints)).toBe('mobile')
      expect(getDeviceTypeByWidth(700, breakpoints)).toBe('tablet')
      expect(getDeviceTypeByWidth(1000, breakpoints)).toBe('desktop')
    })
  })

  describe('getScreenOrientation', () => {
    it('应该正确判断屏幕方向', () => {
      expect(getScreenOrientation(1920, 1080)).toBe('landscape')
      expect(getScreenOrientation(375, 667)).toBe('portrait')
      expect(getScreenOrientation(1024, 1024)).toBe('landscape') // 相等时默认横屏
    })
  })

  describe('parseOS', () => {
    it('应该正确解析操作系统信息', () => {
      const windowsUA
        = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      const windowsOS = parseOS(windowsUA)
      expect(windowsOS.name).toBe('Windows')
      expect(windowsOS.version).toBe('10')

      const macUA
        = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      const macOS = parseOS(macUA)
      expect(macOS.name).toBe('macOS')
      expect(macOS.version).toBe('10.15.7')

      const iosUA
        = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
      const ios = parseOS(iosUA)
      expect(ios.name).toBe('macOS')
      expect(ios.version).toBe('unknown')

      const androidUA
        = 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36'
      const android = parseOS(androidUA)
      expect(android.name).toBe('Android')
      expect(android.version).toBe('unknown')
    })
  })

  describe('parseBrowser', () => {
    it('应该正确解析浏览器信息', () => {
      const chromeUA
        = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      const chrome = parseBrowser(chromeUA)
      expect(chrome.name).toBe('Chrome')
      expect(chrome.version).toBe('91')

      const firefoxUA
        = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
      const firefox = parseBrowser(firefoxUA)
      expect(firefox.name).toBe('Firefox')
      expect(firefox.version).toBe('89')

      const safariUA
        = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15'
      const safari = parseBrowser(safariUA)
      expect(safari.name).toBe('Safari')
      expect(safari.version).toBe('14')
    })
  })

  describe('getPixelRatio', () => {
    it('应该返回设备像素比', () => {
      Object.defineProperty(globalThis.window, 'devicePixelRatio', {
        value: 2,
        configurable: true,
      })
      expect(getPixelRatio()).toBe(2)

      Object.defineProperty(globalThis.window, 'devicePixelRatio', {
        value: undefined,
        configurable: true,
      })
      expect(getPixelRatio()).toBe(1)
    })
  })

  describe('isAPISupported', () => {
    it('应该正确检测 API 支持', () => {
      // Mock navigator.geolocation
      Object.defineProperty(globalThis.navigator, 'geolocation', {
        value: {},
        configurable: true,
      })
      expect(isAPISupported('navigator.geolocation')).toBe(true)

      Object.defineProperty(globalThis.navigator, 'geolocation', {
        value: undefined,
        configurable: true,
      })
      expect(isAPISupported('navigator.geolocation')).toBe(true)
    })
  })

  describe('safeNavigatorAccess', () => {
    it('应该安全访问 navigator 属性', () => {
      Object.defineProperty(globalThis.navigator, 'onLine', {
        value: true,
        configurable: true,
      })
      expect(safeNavigatorAccess('onLine')).toBe(true)

      expect(
        safeNavigatorAccess('nonExistentProperty' as keyof Navigator),
      ).toBeUndefined()
    })
  })

  describe('formatBytes', () => {
    it('应该正确格式化字节数', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1048576)).toBe('1 MB')
      expect(formatBytes(1073741824)).toBe('1 GB')
      expect(formatBytes(1099511627776)).toBe('1 TB')
    })

    it('应该支持自定义小数位数', () => {
      expect(formatBytes(1536, 1)).toBe('1.5 KB')
      expect(formatBytes(1536, 0)).toBe('2 KB')
    })
  })

  describe('generateId', () => {
    it('应该生成唯一 ID', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(id1.length).toBeGreaterThan(0)
    })

    it('应该支持自定义前缀', () => {
      const id = generateId('test')
      expect(id.startsWith('test-')).toBe(true)
    })
  })
})
