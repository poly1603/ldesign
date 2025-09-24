import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import DeviceInfo from '../../../src/vue/components/DeviceInfo.vue'

// Mock useDevice composable
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

const mockUseDevice = {
  deviceInfo: { value: mockDeviceInfo },
  refresh: vi.fn(),
}

vi.mock('../../../src/vue/composables/useDevice', () => ({
  useDevice: vi.fn(() => mockUseDevice),
}))

describe('deviceInfo 组件', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
    // 重置mock状态
    mockUseDevice.deviceInfo.value = mockDeviceInfo
    mockUseDevice.refresh.mockResolvedValue(undefined)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('基础渲染', () => {
    it('应该正确渲染设备信息', async () => {
      wrapper = mount(DeviceInfo, {
        props: {
          mode: 'detailed',
        },
      })

      await nextTick()

      // 检查设备类型
      expect(wrapper.text()).toContain('桌面设备')

      // 检查屏幕信息
      expect(wrapper.text()).toContain('1920×1080')

      // 检查浏览器信息
      expect(wrapper.text()).toContain('Chrome 120.0.0.0')

      // 检查操作系统信息
      expect(wrapper.text()).toContain('Windows 10')

      // 检查触摸支持
      expect(wrapper.text()).toContain('不支持')
    })

    it('应该在紧凑模式下正确渲染', async () => {
      wrapper = mount(DeviceInfo, {
        props: {
          mode: 'compact',
        },
      })

      await nextTick()

      // 紧凑模式应该包含基本信息
      expect(wrapper.text()).toContain('桌面设备')
      expect(wrapper.text()).toContain('1920×1080')

      // 但不应该包含详细信息的标题
      expect(wrapper.text()).not.toContain('基本信息')
      expect(wrapper.text()).not.toContain('屏幕信息')
    })

    it('应该正确显示设备图标', async () => {
      wrapper = mount(DeviceInfo, {
        props: {
          mode: 'detailed',
        },
      })

      await nextTick()

      // 桌面设备应该显示电脑图标
      expect(wrapper.text()).toContain('💻')
    })
  })

  describe('移动设备渲染', () => {
    beforeEach(() => {
      // 模拟移动设备
      mockUseDevice.deviceInfo.value = {
        ...mockDeviceInfo,
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
      }
    })

    it('应该正确渲染移动设备信息', async () => {
      wrapper = mount(DeviceInfo, {
        props: {
          mode: 'detailed',
        },
      })

      await nextTick()

      // 检查移动设备特有信息
      expect(wrapper.text()).toContain('移动设备')
      expect(wrapper.text()).toContain('竖屏')
      expect(wrapper.text()).toContain('支持') // 触摸支持
      expect(wrapper.text()).toContain('375×667')
      expect(wrapper.text()).toContain('Safari 17.0')
      expect(wrapper.text()).toContain('iOS 17.2.1')

      // 移动设备应该显示手机图标
      expect(wrapper.text()).toContain('📱')
    })
  })

  describe('交互功能', () => {
    it('应该显示刷新按钮并响应点击', async () => {
      wrapper = mount(DeviceInfo, {
        props: {
          mode: 'detailed',
          showRefresh: true,
        },
      })

      await nextTick()

      // 查找刷新按钮
      const refreshButton = wrapper.find('.device-info__refresh-btn')
      expect(refreshButton.exists()).toBe(true)

      // 点击刷新按钮
      await refreshButton.trigger('click')

      // 验证 refresh 方法被调用
      expect(mockUseDevice.refresh).toHaveBeenCalled()
    })

    it('应该在 showRefresh 为 false 时隐藏刷新按钮', async () => {
      wrapper = mount(DeviceInfo, {
        props: {
          mode: 'detailed',
          showRefresh: false,
        },
      })

      await nextTick()

      // 刷新按钮应该不存在
      const refreshButton = wrapper.find('.device-info__refresh-btn')
      expect(refreshButton.exists()).toBe(false)
    })

    it('应该触发更新事件', async () => {
      wrapper = mount(DeviceInfo, {
        props: {
          mode: 'detailed',
          showRefresh: true,
        },
      })

      await nextTick()

      // 点击刷新按钮
      const refreshButton = wrapper.find('.device-info__refresh-btn')
      await refreshButton.trigger('click')

      // 验证事件被触发
      expect(wrapper.emitted('update')).toBeTruthy()
      expect(wrapper.emitted('refresh')).toBeTruthy()
    })
  })

  describe('加载状态', () => {
    it('应该显示加载状态', async () => {
      // 模拟加载状态
      mockUseDevice.deviceInfo.value = null

      wrapper = mount(DeviceInfo, {
        props: {
          mode: 'detailed',
        },
      })

      // 组件内部会设置 isLoading 为 true
      await wrapper.vm.$nextTick()

      // 应该显示加载指示器
      expect(wrapper.find('.device-info__loading').exists()).toBe(true)
      expect(wrapper.text()).toContain('正在检测设备信息')
    })
  })

  describe('错误处理', () => {
    it('应该处理刷新错误', async () => {
      // 模拟刷新失败
      mockUseDevice.refresh.mockRejectedValue(new Error('Refresh failed'))

      wrapper = mount(DeviceInfo, {
        props: {
          mode: 'detailed',
          showRefresh: true,
        },
      })

      await nextTick()

      // 点击刷新按钮
      const refreshButton = wrapper.find('.device-info__refresh-btn')
      expect(refreshButton.exists()).toBe(true)
      await refreshButton.trigger('click')

      // 等待错误处理
      await nextTick()

      // 验证错误事件被触发
      expect(wrapper.emitted('error')).toBeTruthy()
      expect(wrapper.emitted('error')[0][0]).toBe('Refresh failed')
    })

    it('应该显示错误状态', async () => {
      // 模拟刷新失败来触发错误状态
      mockUseDevice.refresh.mockRejectedValue(new Error('Test error'))

      wrapper = mount(DeviceInfo, {
        props: {
          mode: 'detailed',
          showRefresh: true,
        },
      })

      await nextTick()

      // 点击刷新按钮触发错误
      const refreshButton = wrapper.find('.device-info__refresh-btn')
      await refreshButton.trigger('click')
      await nextTick()

      // 应该显示错误信息
      expect(wrapper.find('.device-info__error').exists()).toBe(true)
      expect(wrapper.text()).toContain('设备信息获取失败')
    })
  })

  describe('自动刷新', () => {
    it('应该支持自动刷新', async () => {
      vi.useFakeTimers()

      wrapper = mount(DeviceInfo, {
        props: {
          mode: 'detailed',
          autoRefresh: 1000, // 1秒自动刷新
        },
      })

      await nextTick()

      // 快进时间
      vi.advanceTimersByTime(1000)
      await nextTick()

      // 验证 refresh 被调用
      expect(mockUseDevice.refresh).toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('应该在组件卸载时清理自动刷新定时器', async () => {
      vi.useFakeTimers()

      wrapper = mount(DeviceInfo, {
        props: {
          mode: 'detailed',
          autoRefresh: 1000,
        },
      })

      await nextTick()

      // 卸载组件
      wrapper.unmount()

      // 快进时间
      vi.advanceTimersByTime(2000)

      // refresh 不应该被调用（因为定时器已清理）
      expect(mockUseDevice.refresh).not.toHaveBeenCalled()

      vi.useRealTimers()
    })
  })

  describe('cSS 类名', () => {
    it('应该应用正确的 CSS 类名', async () => {
      // 确保mock返回正确的设备信息
      mockUseDevice.deviceInfo.value = { ...mockDeviceInfo, type: 'desktop' }

      wrapper = mount(DeviceInfo, {
        props: {
          mode: 'compact',
        },
      })

      await nextTick()

      const rootElement = wrapper.find('.device-info')
      expect(rootElement.exists()).toBe(true)
      expect(rootElement.classes()).toContain('device-info--compact')
      expect(rootElement.classes()).toContain('device-info--desktop')
    })

    it('应该在加载时应用加载类名', async () => {
      // 模拟没有设备信息的情况，这会触发加载状态
      mockUseDevice.deviceInfo.value = null

      wrapper = mount(DeviceInfo, {
        props: {
          mode: 'detailed',
        },
      })

      await nextTick()

      const rootElement = wrapper.find('.device-info')
      expect(rootElement.classes()).toContain('device-info--loading')
    })

    it('应该在错误时应用错误类名', async () => {
      // 模拟刷新失败来触发错误状态
      mockUseDevice.refresh.mockRejectedValue(new Error('Test error'))

      wrapper = mount(DeviceInfo, {
        props: {
          mode: 'detailed',
          showRefresh: true,
        },
      })

      await nextTick()

      // 点击刷新按钮触发错误
      const refreshButton = wrapper.find('.device-info__refresh-btn')
      await refreshButton.trigger('click')
      await nextTick()

      const rootElement = wrapper.find('.device-info')
      expect(rootElement.classes()).toContain('device-info--error')
    })
  })

  describe('插槽', () => {
    it('应该正确渲染自定义插槽内容', async () => {
      wrapper = mount(DeviceInfo, {
        props: {
          mode: 'detailed',
        },
        slots: {
          default: '<div class="custom-content">自定义内容</div>',
        },
      })

      await nextTick()

      // 验证插槽内容被渲染
      expect(wrapper.find('.custom-content').exists()).toBe(true)
      expect(wrapper.text()).toContain('自定义内容')
    })
  })
})
