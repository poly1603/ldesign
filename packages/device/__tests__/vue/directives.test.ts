import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { vDevice } from '../../src/vue/directives/vDevice'

// 模拟 DeviceDetector
vi.mock('../../src/core/DeviceDetector', () => {
  const mockDetector = {
    getDeviceType: vi.fn(() => 'desktop'),
    getDeviceInfo: vi.fn(() => ({
      type: 'desktop',
      orientation: 'landscape',
      width: 1920,
      height: 1080,
      pixelRatio: 1,
      isTouchDevice: false,
      userAgent: 'test',
      os: { name: 'test', version: '1.0' },
      browser: { name: 'test', version: '1.0' },
    })),
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
  }

  return {
    DeviceDetector: vi.fn(() => mockDetector),
  }
})

describe('vue 指令', () => {
  let mockDetector: any

  beforeEach(async () => {
    // 重置模拟
    vi.clearAllMocks()

    // 获取模拟的检测器实例
    const { DeviceDetector } = await import('../../src/core/DeviceDetector')
    mockDetector = new DeviceDetector()
  })

  describe('v-device 指令', () => {
    it('应该在桌面设备上显示元素', async () => {
      const TestComponent = defineComponent({
        directives: { device: vDevice },
        template: '<div v-device="\'desktop\'">Desktop Content</div>',
      })

      const wrapper = mount(TestComponent)
      await nextTick()

      const element = wrapper.find('div')
      expect(element.isVisible()).toBe(true)
      expect(element.element.style.display).not.toBe('none')
    })

    it('应该在移动设备上隐藏桌面专用元素', async () => {
      // 模拟移动设备
      mockDetector.getDeviceType.mockReturnValue('mobile')
      mockDetector.getDeviceInfo.mockReturnValue({
        type: 'mobile',
        orientation: 'portrait',
        width: 375,
        height: 667,
        pixelRatio: 2,
        isTouchDevice: true,
        userAgent: 'mobile',
        os: { name: 'iOS', version: '14.0' },
        browser: { name: 'Safari', version: '14.0' },
      })

      const TestComponent = defineComponent({
        directives: { device: vDevice },
        template: '<div v-device="\'desktop\'">Desktop Content</div>',
      })

      const wrapper = mount(TestComponent)
      await nextTick()

      const element = wrapper.find('div')
      expect(element.element.style.display).toBe('none')
      expect(element.element.hasAttribute('hidden')).toBe(true)
    })

    it('应该支持数组形式的设备类型', async () => {
      const TestComponent = defineComponent({
        directives: { device: vDevice },
        template: '<div v-device="[\'mobile\', \'tablet\']">Mobile/Tablet Content</div>',
      })

      const wrapper = mount(TestComponent)
      await nextTick()

      const element = wrapper.find('div')
      // 桌面设备不在数组中，应该隐藏
      expect(element.element.style.display).toBe('none')
    })

    it('应该支持反向匹配', async () => {
      const TestComponent = defineComponent({
        directives: { device: vDevice },
        template: '<div v-device="{ type: \'mobile\', inverse: true }">Non-Mobile Content</div>',
      })

      const wrapper = mount(TestComponent)
      await nextTick()

      const element = wrapper.find('div')
      // 桌面设备，反向匹配移动设备，应该显示
      expect(element.element.style.display).not.toBe('none')
    })

    it('应该在设备类型变化时更新显示状态', async () => {
      const TestComponent = defineComponent({
        directives: { device: vDevice },
        template: '<div v-device="\'mobile\'">Mobile Content</div>',
      })

      const wrapper = mount(TestComponent)
      await nextTick()

      const element = wrapper.find('div')
      // 初始为桌面设备，移动内容应该隐藏
      expect(element.element.style.display).toBe('none')

      // 模拟设备类型变化为移动设备
      mockDetector.getDeviceType.mockReturnValue('mobile')
      mockDetector.getDeviceInfo.mockReturnValue({
        type: 'mobile',
        orientation: 'portrait',
        width: 375,
        height: 667,
        pixelRatio: 2,
        isTouchDevice: true,
        userAgent: 'mobile',
        os: { name: 'iOS', version: '14.0' },
        browser: { name: 'Safari', version: '14.0' },
      })

      // 触发设备变化事件
      const deviceChangeCallback = mockDetector.on.mock.calls
        .find((call: unknown[]) => call[0] === 'deviceChange')?.[1] as ((data: any) => void) | undefined

      if (deviceChangeCallback) {
        deviceChangeCallback({
          type: 'mobile',
          orientation: 'portrait',
          width: 375,
          height: 667,
          pixelRatio: 2,
          isTouchDevice: true,
          userAgent: 'mobile',
          os: { name: 'iOS', version: '14.0' },
          browser: { name: 'Safari', version: '14.0' },
        })
      }

      await nextTick()

      // 现在应该显示移动内容
      expect(element.element.style.display).not.toBe('none')
    })

    it('应该保存和恢复原始显示样式', async () => {
      const TestComponent = defineComponent({
        directives: { device: vDevice },
        template: '<div v-device="\'mobile\'" style="display: block;">Mobile Content</div>',
      })

      const wrapper = mount(TestComponent)
      await nextTick()

      const element = wrapper.find('div')

      // 应该保存原始的 display 样式
      expect(element.element.dataset.originalDisplay).toBe('block')

      // 当前应该隐藏（桌面设备）
      expect(element.element.style.display).toBe('none')
    })

    it('应该在组件卸载时清理事件监听器', async () => {
      const TestComponent = defineComponent({
        directives: { device: vDevice },
        template: '<div v-device="\'desktop\'">Desktop Content</div>',
      })

      const wrapper = mount(TestComponent)
      await nextTick()

      // 卸载组件
      wrapper.unmount()

      // 应该移除事件监听器
      expect(mockDetector.off).toHaveBeenCalledWith(
        'deviceChange',
        expect.any(Function),
      )
    })

    it('应该处理无效的指令值', async () => {
      const TestComponent = defineComponent({
        directives: { device: vDevice },
        template: '<div v-device="null">Content</div>',
      })

      // 应该不抛出错误
      expect(() => {
        mount(TestComponent)
      }).not.toThrow()
    })

    it('应该在指令值更新时重新计算显示状态', async () => {
      const TestComponent = defineComponent({
        directives: { device: vDevice },
        data() {
          return {
            deviceType: 'desktop',
          }
        },
        template: '<div v-device="deviceType">Content</div>',
      })

      const wrapper = mount(TestComponent)
      await nextTick()

      const element = wrapper.find('div')
      // 桌面设备匹配，应该显示
      expect(element.element.style.display).not.toBe('none')

      // 更新指令值
      await wrapper.setData({ deviceType: 'mobile' })
      await nextTick()

      // 现在不匹配，应该隐藏
      expect(element.element.style.display).toBe('none')
    })
  })

  describe('性能优化', () => {
    it('应该避免重复的 DOM 操作', async () => {
      const TestComponent = defineComponent({
        directives: { device: vDevice },
        template: '<div v-device="\'desktop\'">Desktop Content</div>',
      })

      const wrapper = mount(TestComponent)
      await nextTick()

      const element = wrapper.find('div')
      const originalDisplay = element.element.style.display

      // 触发相同的设备变化事件
      const deviceChangeCallback = mockDetector.on.mock.calls
        .find((call: unknown[]) => call[0] === 'deviceChange')?.[1] as ((data: any) => void) | undefined

      if (deviceChangeCallback) {
        // 触发相同的设备信息
        deviceChangeCallback({
          type: 'desktop',
          orientation: 'landscape',
          width: 1920,
          height: 1080,
          pixelRatio: 1,
          isTouchDevice: false,
          userAgent: 'test',
          os: { name: 'test', version: '1.0' },
          browser: { name: 'test', version: '1.0' },
        })
      }

      await nextTick()

      // 显示状态应该保持不变
      expect(element.element.style.display).toBe(originalDisplay)
    })
  })
})
