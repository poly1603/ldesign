/**
 * 设备路由工具函数测试
 */

import type {
  DeviceType,
  RouteComponent,
  RouteLocationNormalized,
} from '../../src/types'
import { describe, expect, it } from 'vitest'
import {
  checkDeviceSupport,
  createDeviceInfo,
  createUnsupportedDeviceRoute,
  getDeviceFriendlyName,
  getDevicePriority,
  getSupportedDevicesFromRoute,
  hasDeviceSpecificConfig,
  isValidDeviceType,
  resolveDeviceComponent,
  sortDevicesByPriority,
} from '../../src/device/utils'

describe('设备路由工具函数', () => {
  describe('checkDeviceSupport', () => {
    it('没有设备限制时应该支持所有设备', () => {
      const route = createMockRoute({
        meta: {},
      })

      expect(checkDeviceSupport(route, 'mobile')).toBe(true)
      expect(checkDeviceSupport(route, 'tablet')).toBe(true)
      expect(checkDeviceSupport(route, 'desktop')).toBe(true)
    })

    it('应该检查路由元信息中的设备支持', () => {
      const route = createMockRoute({
        meta: {
          supportedDevices: ['desktop', 'tablet'],
        },
      })

      expect(checkDeviceSupport(route, 'desktop')).toBe(true)
      expect(checkDeviceSupport(route, 'tablet')).toBe(true)
      expect(checkDeviceSupport(route, 'mobile')).toBe(false)
    })

    it('应该检查匹配路由记录中的设备支持', () => {
      const route = createMockRoute({
        meta: {},
        matched: [
          {
            meta: {
              supportedDevices: ['mobile'],
            },
          } as any,
        ],
      })

      expect(checkDeviceSupport(route, 'mobile')).toBe(true)
      expect(checkDeviceSupport(route, 'desktop')).toBe(false)
    })
  })

  describe('getSupportedDevicesFromRoute', () => {
    it('应该从路由元信息获取支持的设备', () => {
      const route = createMockRoute({
        meta: {
          supportedDevices: ['desktop'],
        },
      })

      expect(getSupportedDevicesFromRoute(route)).toEqual(['desktop'])
    })

    it('应该从匹配的路由记录获取支持的设备', () => {
      const route = createMockRoute({
        meta: {},
        matched: [
          {
            meta: {
              supportedDevices: ['mobile', 'tablet'],
            },
          } as any,
        ],
      })

      expect(getSupportedDevicesFromRoute(route)).toEqual(['mobile', 'tablet'])
    })

    it('没有设备限制时应该返回 undefined', () => {
      const route = createMockRoute({
        meta: {},
      })

      expect(getSupportedDevicesFromRoute(route)).toBeUndefined()
    })
  })

  describe('resolveDeviceComponent', () => {
    const mockComponents: Record<DeviceType, RouteComponent> = {
      mobile: { name: 'MobileComponent' } as RouteComponent,
      tablet: { name: 'TabletComponent' } as RouteComponent,
      desktop: { name: 'DesktopComponent' } as RouteComponent,
      tv: { name: 'TVComponent' } as RouteComponent,
      watch: { name: 'WatchComponent' } as RouteComponent,
      unknown: { name: 'UnknownComponent' } as RouteComponent,
    }

    it('应该解析当前设备的组件', () => {
      const result = resolveDeviceComponent(mockComponents, 'mobile')

      expect(result).toEqual({
        component: mockComponents.mobile,
        deviceType: 'mobile',
        isFallback: false,
        source: 'deviceComponents',
      })
    })

    it('应该回退到其他设备组件', () => {
      const components = {
        desktop: mockComponents.desktop,
      }

      const result = resolveDeviceComponent(
        components as Record<DeviceType, RouteComponent>,
        'mobile',
      )

      expect(result).toEqual({
        component: mockComponents.desktop,
        deviceType: 'desktop',
        isFallback: true,
        source: 'deviceComponents',
      })
    })

    it('没有可用组件时应该返回 null', () => {
      const result = resolveDeviceComponent(
        {} as Record<DeviceType, RouteComponent>,
        'mobile',
      )

      expect(result).toBeNull()
    })
  })

  describe('createUnsupportedDeviceRoute', () => {
    it('应该创建默认的不支持设备路由', () => {
      const route = createMockRoute({
        fullPath: '/admin',
      })

      const result = createUnsupportedDeviceRoute(route, 'mobile')

      expect(result).toEqual({
        path: '/device-unsupported',
        query: {
          from: '/admin',
          device: 'mobile',
          message: '当前系统不支持在此设备上查看',
        },
      })
    })

    it('应该使用自定义重定向路由', () => {
      const route = createMockRoute({
        fullPath: '/admin',
        meta: {
          unsupportedRedirect: '/custom-unsupported',
        },
      })

      const result = createUnsupportedDeviceRoute(route, 'mobile')

      expect(result).toEqual({
        path: '/custom-unsupported',
        query: {
          from: '/admin',
          device: 'mobile',
          reason: 'unsupported_device',
        },
      })
    })

    it('应该使用自定义提示信息', () => {
      const route = createMockRoute({
        fullPath: '/admin',
        meta: {
          unsupportedMessage: '自定义提示信息',
        },
      })

      const result = createUnsupportedDeviceRoute(route, 'mobile')

      expect((result as any).query?.message).toBe('自定义提示信息')
    })
  })

  describe('hasDeviceSpecificConfig', () => {
    it('有设备限制时应该返回 true', () => {
      const route = createMockRoute({
        meta: {
          supportedDevices: ['desktop'],
        },
      })

      expect(hasDeviceSpecificConfig(route)).toBe(true)
    })

    it('匹配的路由记录有设备限制时应该返回 true', () => {
      const route = createMockRoute({
        meta: {},
        matched: [
          {
            meta: {
              supportedDevices: ['mobile'],
            },
          } as any,
        ],
      })

      expect(hasDeviceSpecificConfig(route)).toBe(true)
    })

    it('没有设备特定配置时应该返回 false', () => {
      const route = createMockRoute({
        meta: {},
      })

      expect(hasDeviceSpecificConfig(route)).toBe(false)
    })
  })

  describe('getDeviceFriendlyName', () => {
    it('应该返回设备友好名称', () => {
      expect(getDeviceFriendlyName('mobile')).toBe('移动设备')
      expect(getDeviceFriendlyName('tablet')).toBe('平板设备')
      expect(getDeviceFriendlyName('desktop')).toBe('桌面设备')
    })
  })

  describe('createDeviceInfo', () => {
    it('应该创建设备信息对象', () => {
      const info = createDeviceInfo('mobile')

      expect(info).toEqual({
        type: 'mobile',
        name: '移动设备',
        isMobile: true,
        isTablet: false,
        isDesktop: false,
      })
    })
  })

  describe('isValidDeviceType', () => {
    it('应该验证有效的设备类型', () => {
      expect(isValidDeviceType('mobile')).toBe(true)
      expect(isValidDeviceType('tablet')).toBe(true)
      expect(isValidDeviceType('desktop')).toBe(true)
      expect(isValidDeviceType('invalid')).toBe(false)
    })
  })

  describe('getDevicePriority', () => {
    it('应该返回正确的设备优先级', () => {
      expect(getDevicePriority('desktop')).toBe(1)
      expect(getDevicePriority('tablet')).toBe(2)
      expect(getDevicePriority('mobile')).toBe(3)
    })
  })

  describe('sortDevicesByPriority', () => {
    it('应该按优先级排序设备', () => {
      const devices: DeviceType[] = ['mobile', 'desktop', 'tablet']
      const sorted = sortDevicesByPriority(devices)

      expect(sorted).toEqual(['desktop', 'tablet', 'mobile'])
    })

    it('不应该修改原数组', () => {
      const devices: DeviceType[] = ['mobile', 'desktop', 'tablet']
      const original = [...devices]

      sortDevicesByPriority(devices)

      expect(devices).toEqual(original)
    })
  })
})

// 辅助函数
function createMockRoute(
  overrides: Partial<RouteLocationNormalized> = {},
): RouteLocationNormalized {
  return {
    path: '/',
    name: undefined,
    params: {},
    query: {},
    hash: '',
    fullPath: '/',
    meta: {},
    matched: [],
    redirectedFrom: undefined,
    ...overrides,
  } as RouteLocationNormalized
}
