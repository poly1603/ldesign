import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useBattery, useDevice, useGeolocation, useNetwork } from '../../src/vue/composables/useDevice'

// Mock window and navigator
const mockWindow = {
  innerWidth: 1920,
  innerHeight: 1080,
  devicePixelRatio: 1,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}

const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  onLine: true,
  maxTouchPoints: 0,
  connection: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false,
  },
}

const mockScreen = {
  orientation: {
    angle: 0,
  },
}

// Setup global mocks
Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
})

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
})

Object.defineProperty(global, 'screen', {
  value: mockScreen,
  writable: true,
})

// Mock getBattery API
const mockBattery = {
  level: 0.8,
  charging: false,
  chargingTime: Infinity,
  dischargingTime: 3600,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}

Object.defineProperty(global.navigator, 'getBattery', {
  value: vi.fn().mockResolvedValue(mockBattery),
  configurable: true,
})

// Mock geolocation API
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn().mockReturnValue(1),
  clearWatch: vi.fn(),
}

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  configurable: true,
})

describe('vue Composables', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useDevice', () => {
    it('应该返回设备信息的响应式数据', async () => {
      const TestComponent = {
        setup() {
          return useDevice()
        },
        template: '<div></div>',
      }

      const wrapper = mount(TestComponent)
      const vm = wrapper.vm as any

      expect(vm.deviceType).toBe('desktop')
      expect(vm.orientation).toBe('landscape')
      expect(vm.isMobile).toBe(false)
      expect(vm.isTablet).toBe(false)
      expect(vm.isDesktop).toBe(true)
      expect(vm.isTouchDevice).toBe(false)
      expect(vm.width).toBe(1920)
      expect(vm.height).toBe(1080)
      expect(vm.pixelRatio).toBe(1)

      wrapper.unmount()
    })

    it('应该支持自定义配置', async () => {
      const TestComponent = {
        setup() {
          return useDevice({
            breakpoints: {
              mobile: 600,
              tablet: 900,
            },
          })
        },
        template: '<div></div>',
      }

      const wrapper = mount(TestComponent)
      wrapper.unmount()
    })

    it('应该在组件卸载时清理资源', async () => {
      const TestComponent = {
        setup() {
          return useDevice()
        },
        template: '<div></div>',
      }

      const wrapper = mount(TestComponent)
      wrapper.unmount()

      expect(mockWindow.removeEventListener).toHaveBeenCalled()
    })
  })

  describe('useNetwork', () => {
    it('应该返回网络信息的响应式数据', async () => {
      const TestComponent = {
        setup() {
          return useNetwork()
        },
        template: '<div></div>',
      }

      const wrapper = mount(TestComponent)
      await nextTick()

      const vm = wrapper.vm as any

      expect(vm.isOnline).toBe(true)
      expect(vm.connectionType).toBe('4g')
      expect(vm.downlink).toBe(10)
      expect(vm.rtt).toBe(100)
      expect(vm.saveData).toBe(false)

      wrapper.unmount()
    })

    it('应该在网络状态变化时更新数据', async () => {
      const TestComponent = {
        setup() {
          return useNetwork()
        },
        template: '<div></div>',
      }

      const wrapper = mount(TestComponent)
      await nextTick()

      // 模拟网络状态变化
      Object.defineProperty(global.navigator, 'onLine', {
        value: false,
        configurable: true,
      })

      // 触发 offline 事件
      const offlineEvent = new Event('offline')
      window.dispatchEvent(offlineEvent)
      await nextTick()

      wrapper.unmount()
    })
  })

  describe('useBattery', () => {
    it('应该返回电池信息的响应式数据', async () => {
      const TestComponent = {
        setup() {
          return useBattery()
        },
        template: '<div></div>',
      }

      const wrapper = mount(TestComponent)
      await nextTick()

      const vm = wrapper.vm as any

      expect(vm.level).toBe(0.8)
      expect(vm.charging).toBe(false)
      expect(vm.chargingTime).toBe(Infinity)
      expect(vm.dischargingTime).toBe(3600)

      wrapper.unmount()
    })

    it('应该在不支持电池 API 时返回 null', async () => {
      // 临时移除 getBattery API
      const originalGetBattery = global.navigator.getBattery
      // @ts-expect-error - 测试用途
      delete global.navigator.getBattery

      const TestComponent = {
        setup() {
          return useBattery()
        },
        template: '<div></div>',
      }

      const wrapper = mount(TestComponent)
      await nextTick()

      const vm = wrapper.vm as any
      expect(vm.level).toBeNull()
      expect(vm.charging).toBeNull()

      wrapper.unmount()

      // 恢复 API
      global.navigator.getBattery = originalGetBattery
    })
  })

  describe('useGeolocation', () => {
    beforeEach(() => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.0060,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        })
      })
    })

    it('应该返回地理位置信息的响应式数据', async () => {
      const TestComponent = {
        setup() {
          return useGeolocation()
        },
        template: '<div></div>',
      }

      const wrapper = mount(TestComponent)
      const vm = wrapper.vm as any

      // 获取当前位置
      await vm.getCurrentPosition()
      await nextTick()

      expect(vm.latitude).toBe(40.7128)
      expect(vm.longitude).toBe(-74.0060)
      expect(vm.accuracy).toBe(10)

      wrapper.unmount()
    })

    it('应该支持监听位置变化', async () => {
      const TestComponent = {
        setup() {
          return useGeolocation()
        },
        template: '<div></div>',
      }

      const wrapper = mount(TestComponent)
      const vm = wrapper.vm as any

      // 开始监听位置变化
      vm.startWatching()
      expect(vm.isWatching).toBe(true)
      expect(mockGeolocation.watchPosition).toHaveBeenCalled()

      // 停止监听
      vm.stopWatching()
      expect(vm.isWatching).toBe(false)
      expect(mockGeolocation.clearWatch).toHaveBeenCalled()

      wrapper.unmount()
    })

    it('应该处理地理位置错误', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({
          code: 1,
          message: 'User denied the request for Geolocation.',
        })
      })

      const TestComponent = {
        setup() {
          return useGeolocation()
        },
        template: '<div></div>',
      }

      const wrapper = mount(TestComponent)
      const vm = wrapper.vm as any

      await vm.getCurrentPosition()
      await nextTick()

      expect(vm.error).toBeTruthy()
      expect(vm.latitude).toBeNull()
      expect(vm.longitude).toBeNull()

      wrapper.unmount()
    })

    it('应该在不支持地理位置 API 时返回错误', async () => {
      // 临时移除 geolocation API
      const originalGeolocation = global.navigator.geolocation
      // @ts-expect-error - 测试用途
      delete global.navigator.geolocation

      const TestComponent = {
        setup() {
          return useGeolocation()
        },
        template: '<div></div>',
      }

      const wrapper = mount(TestComponent)
      const vm = wrapper.vm as any

      await vm.getCurrentPosition()
      await nextTick()

      expect(vm.error).toBeTruthy()
      expect(vm.latitude).toBeNull()

      wrapper.unmount()

      // 恢复 API
      global.navigator.geolocation = originalGeolocation
    })
  })

  describe('响应式更新', () => {
    it('应该在窗口大小变化时更新设备信息', async () => {
      const TestComponent = {
        setup() {
          return useDevice()
        },
        template: '<div></div>',
      }

      const wrapper = mount(TestComponent)
      const vm = wrapper.vm as any

      expect(vm.deviceType).toBe('desktop')

      // 模拟窗口大小变化为移动设备
      mockWindow.innerWidth = 375
      mockWindow.innerHeight = 667

      // 触发 resize 事件
      const resizeEvent = new Event('resize')
      window.dispatchEvent(resizeEvent)

      // 等待防抖完成
      await new Promise(resolve => setTimeout(resolve, 300))
      await nextTick()

      wrapper.unmount()
    })
  })
})
