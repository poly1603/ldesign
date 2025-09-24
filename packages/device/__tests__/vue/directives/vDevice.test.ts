import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { __resetGlobalState, __setGlobalDetector, vDevice, vDeviceDesktop, vDeviceMobile, vDeviceTablet } from '../../../src/vue/directives/vDevice'

// Mock DeviceDetector
const mockDeviceInfo = {
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
}

const mockDetector = {
  getDeviceInfo: vi.fn(() => mockDeviceInfo),
  getDeviceType: vi.fn(() => mockDeviceInfo.type),
  on: vi.fn().mockReturnThis(),
  off: vi.fn().mockReturnThis(),
  destroy: vi.fn().mockReturnThis(),
  init: vi.fn().mockResolvedValue(undefined),
  emit: vi.fn(),
  once: vi.fn().mockReturnThis(),
  removeAllListeners: vi.fn().mockReturnThis(),
}

vi.mock('../../../src/core/DeviceDetector', () => ({
  DeviceDetector: vi.fn().mockImplementation(() => mockDetector),
}))

describe('vDevice 指令', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
    // 重置全局状态
    __resetGlobalState()
    // 设置mock检测器
    __setGlobalDetector(mockDetector as any)
    // 重置 mock 数据
    mockDeviceInfo.type = 'desktop'
    mockDetector.getDeviceType.mockReturnValue('desktop')
    mockDetector.getDeviceInfo.mockReturnValue(mockDeviceInfo)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('v-device 基础指令', () => {
    it('应该在匹配设备类型时显示元素', async () => {
      const TestComponent = {
        directives: { device: vDevice },
        template: '<div v-device="\'desktop\'">桌面内容</div>',
      }

      wrapper = mount(TestComponent)
      await nextTick()

      const element = wrapper.find('div')
      expect(element.isVisible()).toBe(true)
      expect(element.attributes('hidden')).toBeUndefined()
      expect(element.element.style.display).not.toBe('none')
    })

    it('应该在不匹配设备类型时隐藏元素', async () => {
      const TestComponent = {
        directives: { device: vDevice },
        template: '<div v-device="\'mobile\'">移动端内容</div>',
      }

      wrapper = mount(TestComponent)
      await nextTick()

      const element = wrapper.find('div')
      expect(element.element.style.display).toBe('none')
      expect(element.attributes('hidden')).toBeDefined()
    })

    it('应该支持数组形式的设备类型', async () => {
      const TestComponent = {
        directives: { device: vDevice },
        data() {
          return {
            deviceTypes: ['tablet', 'desktop'],
          }
        },
        template: '<div v-device="deviceTypes">大屏设备内容</div>',
      }

      wrapper = mount(TestComponent)
      await nextTick()

      const element = wrapper.find('div')
      expect(element.isVisible()).toBe(true)
      expect(element.element.style.display).not.toBe('none')
    })

    it('应该支持对象形式的配置', async () => {
      const TestComponent = {
        directives: { device: vDevice },
        data() {
          return {
            config: {
              type: 'mobile',
              inverse: true,
            },
          }
        },
        template: '<div v-device="config">非移动端内容</div>',
      }

      wrapper = mount(TestComponent)
      await nextTick()

      const element = wrapper.find('div')
      // 因为是反向匹配，当前是桌面设备，所以应该显示
      expect(element.isVisible()).toBe(true)
      expect(element.element.style.display).not.toBe('none')
    })

    it('应该在设备类型变化时更新显示状态', async () => {
      const TestComponent = {
        directives: { device: vDevice },
        template: '<div v-device="\'mobile\'">移动端内容</div>',
      }

      wrapper = mount(TestComponent)
      await nextTick()

      // 初始状态：桌面设备，应该隐藏
      let element = wrapper.find('div')
      expect(element.element.style.display).toBe('none')

      // 模拟设备类型变化为移动设备
      mockDeviceInfo.type = 'mobile'
      mockDetector.getDeviceType.mockReturnValue('mobile')

      // 触发全局设备变化事件
      const deviceChangeCallback = mockDetector.on.mock.calls.find(call => call[0] === 'deviceChange')?.[1]
      if (deviceChangeCallback) {
        deviceChangeCallback()
      }

      // 等待批量更新完成
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))
      await nextTick()

      // 现在应该显示
      element = wrapper.find('div')
      expect(element.element.style.display).not.toBe('none')
    })

    it('应该在组件更新时正确处理指令值变化', async () => {
      const TestComponent = {
        directives: { device: vDevice },
        data() {
          return {
            targetDevice: 'mobile',
          }
        },
        template: '<div v-device="targetDevice">内容</div>',
      }

      wrapper = mount(TestComponent)
      await nextTick()

      // 初始状态：目标是移动设备，当前是桌面设备，应该隐藏
      let element = wrapper.find('div')
      expect(element.element.style.display).toBe('none')

      // 更新目标设备为桌面设备
      await wrapper.setData({ targetDevice: 'desktop' })
      await nextTick()

      // 现在应该显示
      element = wrapper.find('div')
      expect(element.element.style.display).not.toBe('none')
    })

    it('应该在组件卸载时清理资源', async () => {
      const TestComponent = {
        directives: { device: vDevice },
        template: '<div v-device="\'desktop\'">桌面内容</div>',
      }

      wrapper = mount(TestComponent)
      await nextTick()

      // 验证事件监听器被注册
      expect(mockDetector.on).toHaveBeenCalledWith('deviceChange', expect.any(Function))

      // 卸载组件
      wrapper.unmount()
      await nextTick()

      // 验证事件监听器被移除
      expect(mockDetector.off).toHaveBeenCalledWith('deviceChange', expect.any(Function))
    })
  })

  describe('v-device-mobile 指令', () => {
    it('应该在移动设备时显示元素', async () => {
      // 设置为移动设备
      mockDeviceInfo.type = 'mobile'
      mockDetector.getDeviceType.mockReturnValue('mobile')

      const TestComponent = {
        directives: { deviceMobile: vDeviceMobile },
        template: '<div v-device-mobile>移动端内容</div>',
      }

      wrapper = mount(TestComponent)
      await nextTick()

      const element = wrapper.find('div')
      expect(element.element.style.display).not.toBe('none')
    })

    it('应该在非移动设备时隐藏元素', async () => {
      // 设置为桌面设备
      mockDeviceInfo.type = 'desktop'
      mockDetector.getDeviceType.mockReturnValue('desktop')

      const TestComponent = {
        directives: { deviceMobile: vDeviceMobile },
        template: '<div v-device-mobile>移动端内容</div>',
      }

      wrapper = mount(TestComponent)
      await nextTick()

      const element = wrapper.find('div')
      expect(element.element.style.display).toBe('none')
    })
  })

  describe('v-device-tablet 指令', () => {
    it('应该在平板设备时显示元素', async () => {
      // 设置为平板设备
      mockDeviceInfo.type = 'tablet'
      mockDetector.getDeviceType.mockReturnValue('tablet')

      const TestComponent = {
        directives: { deviceTablet: vDeviceTablet },
        template: '<div v-device-tablet>平板内容</div>',
      }

      wrapper = mount(TestComponent)
      await nextTick()

      const element = wrapper.find('div')
      expect(element.element.style.display).not.toBe('none')
    })

    it('应该在非平板设备时隐藏元素', async () => {
      // 设置为桌面设备
      mockDeviceInfo.type = 'desktop'
      mockDetector.getDeviceType.mockReturnValue('desktop')

      const TestComponent = {
        directives: { deviceTablet: vDeviceTablet },
        template: '<div v-device-tablet>平板内容</div>',
      }

      wrapper = mount(TestComponent)
      await nextTick()

      const element = wrapper.find('div')
      expect(element.element.style.display).toBe('none')
    })
  })

  describe('v-device-desktop 指令', () => {
    it('应该在桌面设备时显示元素', async () => {
      // 设置为桌面设备
      mockDeviceInfo.type = 'desktop'
      mockDetector.getDeviceType.mockReturnValue('desktop')

      const TestComponent = {
        directives: { deviceDesktop: vDeviceDesktop },
        template: '<div v-device-desktop>桌面内容</div>',
      }

      wrapper = mount(TestComponent)
      await nextTick()

      const element = wrapper.find('div')
      expect(element.element.style.display).not.toBe('none')
    })

    it('应该在非桌面设备时隐藏元素', async () => {
      // 设置为移动设备
      mockDeviceInfo.type = 'mobile'
      mockDetector.getDeviceType.mockReturnValue('mobile')

      const TestComponent = {
        directives: { deviceDesktop: vDeviceDesktop },
        template: '<div v-device-desktop>桌面内容</div>',
      }

      wrapper = mount(TestComponent)
      await nextTick()

      const element = wrapper.find('div')
      expect(element.element.style.display).toBe('none')
    })
  })

  describe('性能优化', () => {
    it('应该避免重复更新相同的显示状态', async () => {
      const TestComponent = {
        directives: { device: vDevice },
        template: '<div v-device="\'desktop\'">桌面内容</div>',
      }

      wrapper = mount(TestComponent)
      await nextTick()

      const element = wrapper.find('div').element as HTMLElement
      const originalDisplay = element.style.display

      // 触发相同的设备变化事件
      const deviceChangeCallback = mockDetector.on.mock.calls.find(
        call => call[0] === 'deviceChange',
      )?.[1]

      if (deviceChangeCallback) {
        // 多次触发相同的设备信息
        deviceChangeCallback(mockDeviceInfo)
        deviceChangeCallback(mockDeviceInfo)
        deviceChangeCallback(mockDeviceInfo)
        await nextTick()
      }

      // 显示状态应该保持不变
      expect(element.style.display).toBe(originalDisplay)
    })

    it('应该正确处理批量更新', async () => {
      const TestComponent = {
        directives: { device: vDevice },
        template: `
          <div>
            <div v-device="'desktop'" class="desktop-1">桌面内容1</div>
            <div v-device="'desktop'" class="desktop-2">桌面内容2</div>
            <div v-device="'mobile'" class="mobile-1">移动内容1</div>
          </div>
        `,
      }

      wrapper = mount(TestComponent)
      await nextTick()

      // 验证初始状态
      expect(wrapper.find('.desktop-1').element.style.display).not.toBe('none')
      expect(wrapper.find('.desktop-2').element.style.display).not.toBe('none')
      expect(wrapper.find('.mobile-1').element.style.display).toBe('none')

      // 模拟设备类型变化
      mockDeviceInfo.type = 'mobile'
      mockDetector.getDeviceType.mockReturnValue('mobile')

      // 触发全局设备变化事件
      const deviceChangeCallback = mockDetector.on.mock.calls.find(call => call[0] === 'deviceChange')?.[1]
      if (deviceChangeCallback) {
        deviceChangeCallback()
      }

      // 等待批量更新完成
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))
      await nextTick()

      // 验证批量更新后的状态
      expect(wrapper.find('.desktop-1').element.style.display).toBe('none')
      expect(wrapper.find('.desktop-2').element.style.display).toBe('none')
      expect(wrapper.find('.mobile-1').element.style.display).not.toBe('none')
    })
  })
})
