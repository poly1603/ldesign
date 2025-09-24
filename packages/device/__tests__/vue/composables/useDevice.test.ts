import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useDevice } from '../../../src/vue/composables/useDevice'

// Mock DeviceDetector
vi.mock('../../../src/core/DeviceDetector', () => {
  const mockDetector = {
    getDeviceInfo: vi.fn(() => ({
      type: 'desktop',
      orientation: 'landscape',
      screen: {
        width: 1920,
        height: 1080,
        pixelRatio: 1,
        availWidth: 1920,
        availHeight: 1040,
      },
      browser: {
        name: 'Chrome',
        version: '120.0.0.0',
        engine: 'Blink',
      },
      os: {
        name: 'Windows',
        version: '10',
        platform: 'Win32',
      },
      features: {
        touch: false,
      },
    })),
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
  }

  return {
    DeviceDetector: vi.fn(() => mockDetector),
  }
})

describe('useDevice', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('应该返回正确的初始设备信息', async () => {
    const TestComponent = {
      setup() {
        return useDevice()
      },
      template: '<div></div>',
    }

    wrapper = mount(TestComponent)
    await nextTick()

    const {
      deviceType,
      orientation,
      isMobile,
      isTablet,
      isDesktop,
      isTouchDevice,
    } = wrapper.vm

    expect(deviceType).toBe('desktop')
    expect(orientation).toBe('landscape')
    expect(isMobile).toBe(false)
    expect(isTablet).toBe(false)
    expect(isDesktop).toBe(true)
    expect(isTouchDevice).toBe(false)
  })

  it('应该正确处理移动设备', async () => {
    const { DeviceDetector } = await import('../../../src/core/DeviceDetector')
    const mockDetector = new DeviceDetector()

    // 模拟移动设备信息
    vi.mocked(mockDetector.getDeviceInfo).mockReturnValue({
      type: 'mobile',
      orientation: 'portrait',
      screen: {
        width: 375,
        height: 667,
        pixelRatio: 2,
        availWidth: 375,
        availHeight: 647,
      },
      browser: {
        name: 'Safari',
        version: '17.0',
        engine: 'WebKit',
      },
      os: {
        name: 'iOS',
        version: '17.2.1',
        platform: 'iPhone',
      },
      features: {
        touch: true,
      },
    } as any)

    const TestComponent = {
      setup() {
        return useDevice()
      },
      template: '<div></div>',
    }

    wrapper = mount(TestComponent)
    await nextTick()

    const {
      deviceType,
      orientation,
      isMobile,
      isTablet,
      isDesktop,
      isTouchDevice,
    } = wrapper.vm

    expect(deviceType).toBe('mobile')
    expect(orientation).toBe('portrait')
    expect(isMobile).toBe(true)
    expect(isTablet).toBe(false)
    expect(isDesktop).toBe(false)
    expect(isTouchDevice).toBe(true)
  })

  it('应该正确处理平板设备', async () => {
    const { DeviceDetector } = await import('../../../src/core/DeviceDetector')
    const mockDetector = new DeviceDetector()

    // 模拟平板设备信息
    vi.mocked(mockDetector.getDeviceInfo).mockReturnValue({
      type: 'tablet',
      orientation: 'landscape',
      screen: {
        width: 1024,
        height: 768,
        pixelRatio: 2,
        availWidth: 1024,
        availHeight: 748,
      },
      browser: {
        name: 'Safari',
        version: '17.0',
        engine: 'WebKit',
      },
      os: {
        name: 'iPadOS',
        version: '17.2.1',
        platform: 'iPad',
      },
      features: {
        touch: true,
      },
    } as any)

    const TestComponent = {
      setup() {
        return useDevice()
      },
      template: '<div></div>',
    }

    wrapper = mount(TestComponent)
    await nextTick()

    const {
      deviceType,
      isMobile,
      isTablet,
      isDesktop,
      isTouchDevice,
    } = wrapper.vm

    expect(deviceType).toBe('tablet')
    expect(isMobile).toBe(false)
    expect(isTablet).toBe(true)
    expect(isDesktop).toBe(false)
    expect(isTouchDevice).toBe(true)
  })

  it('应该能够刷新设备信息', async () => {
    const TestComponent = {
      setup() {
        return useDevice()
      },
      template: '<div></div>',
    }

    wrapper = mount(TestComponent)
    await nextTick()

    const { refresh } = wrapper.vm

    // 调用刷新方法
    refresh()

    // 验证 getDeviceInfo 被调用
    const { DeviceDetector } = await import('../../../src/core/DeviceDetector')
    const mockDetector = new DeviceDetector()
    expect(mockDetector.getDeviceInfo).toHaveBeenCalled()
  })

  it('应该正确处理自定义配置', async () => {
    const customOptions = {
      enableResize: false,
      enableOrientation: false,
      breakpoints: {
        mobile: 640,
        tablet: 768,
        desktop: 1024,
      },
    }

    const TestComponent = {
      setup() {
        return useDevice(customOptions)
      },
      template: '<div></div>',
    }

    wrapper = mount(TestComponent)
    await nextTick()

    // 验证 DeviceDetector 使用了自定义配置
    const { DeviceDetector } = await import('../../../src/core/DeviceDetector')
    expect(DeviceDetector).toHaveBeenCalledWith(customOptions)
  })

  it('应该正确处理事件监听', async () => {
    const TestComponent = {
      setup() {
        return useDevice()
      },
      template: '<div></div>',
    }

    wrapper = mount(TestComponent)
    await nextTick()

    // 验证事件监听器被注册
    const { DeviceDetector } = await import('../../../src/core/DeviceDetector')
    const mockDetector = new DeviceDetector()
    expect(mockDetector.on).toHaveBeenCalledWith('deviceChange', expect.any(Function))
    expect(mockDetector.on).toHaveBeenCalledWith('orientationChange', expect.any(Function))
  })

  it('应该在组件卸载时清理资源', async () => {
    const TestComponent = {
      setup() {
        return useDevice()
      },
      template: '<div></div>',
    }

    wrapper = mount(TestComponent)
    await nextTick()

    const { DeviceDetector } = await import('../../../src/core/DeviceDetector')
    const mockDetector = new DeviceDetector()

    // 卸载组件
    wrapper.unmount()
    await nextTick()

    // 验证资源被清理
    expect(mockDetector.destroy).toHaveBeenCalled()
  })

  it('应该正确处理错误情况', async () => {
    const { DeviceDetector } = await import('../../../src/core/DeviceDetector')

    // 模拟构造函数抛出错误
    vi.mocked(DeviceDetector).mockImplementation(() => {
      throw new Error('Device detection failed')
    })

    const TestComponent = {
      setup() {
        return useDevice()
      },
      template: '<div></div>',
    }

    // 应该不会抛出错误，而是优雅地处理
    expect(() => {
      wrapper = mount(TestComponent)
    }).not.toThrow()
  })

  it('应该返回只读的响应式引用', async () => {
    const TestComponent = {
      setup() {
        return useDevice()
      },
      template: '<div></div>',
    }

    wrapper = mount(TestComponent)
    await nextTick()

    const {
      deviceType,
      orientation,
      deviceInfo: _deviceInfo,
      isMobile,
      isTablet: _isTablet,
      isDesktop: _isDesktop,
      isTouchDevice: _isTouchDevice,
    } = wrapper.vm

    // 验证返回的引用是只读的
    expect(() => {
      deviceType.value = 'mobile'
    }).toThrow()

    expect(() => {
      orientation.value = 'portrait'
    }).toThrow()

    // 计算属性应该是只读的
    expect(() => {
      isMobile.value = true
    }).toThrow()
  })
})
