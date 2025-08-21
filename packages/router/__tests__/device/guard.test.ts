/**
 * 设备路由守卫测试
 */

import type { DeviceType, RouteLocationNormalized } from '../../src/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeviceRouteGuard } from '../../src/device/guard'

describe('deviceRouteGuard', () => {
  let getCurrentDevice: () => DeviceType
  let guard: DeviceRouteGuard

  beforeEach(() => {
    getCurrentDevice = vi.fn(() => 'desktop' as DeviceType)
    guard = new DeviceRouteGuard(getCurrentDevice)
  })

  describe('基础功能', () => {
    it('应该创建守卫实例', () => {
      expect(guard).toBeInstanceOf(DeviceRouteGuard)
    })

    it('应该创建导航守卫函数', () => {
      const guardFn = guard.createGuard()
      expect(typeof guardFn).toBe('function')
    })
  })

  describe('设备支持检查', () => {
    it('没有设备限制时应该允许访问', async () => {
      const guardFn = guard.createGuard()
      const next = vi.fn()

      const to = createMockRoute({
        meta: {},
      })
      const from = createMockRoute()

      await guardFn(to, from, next)

      expect(next).toHaveBeenCalledWith()
    })

    it('当前设备被支持时应该允许访问', async () => {
      getCurrentDevice = vi.fn(() => 'desktop' as DeviceType)
      guard = new DeviceRouteGuard(getCurrentDevice)

      const guardFn = guard.createGuard()
      const next = vi.fn()

      const to = createMockRoute({
        meta: {
          supportedDevices: ['desktop', 'tablet'],
        },
      })
      const from = createMockRoute()

      await guardFn(to, from, next)

      expect(next).toHaveBeenCalledWith()
    })

    it('当前设备不被支持时应该重定向', async () => {
      getCurrentDevice = vi.fn(() => 'mobile' as DeviceType)
      guard = new DeviceRouteGuard(getCurrentDevice)

      const guardFn = guard.createGuard()
      const next = vi.fn()

      const to = createMockRoute({
        path: '/admin',
        fullPath: '/admin',
        meta: {
          supportedDevices: ['desktop'],
        },
      })
      const from = createMockRoute()

      await guardFn(to, from, next)

      expect(next).toHaveBeenCalledWith({
        path: '/device-unsupported',
        query: {
          from: '/admin',
          device: 'mobile',
          message: '当前系统不支持在此设备上查看',
        },
      })
    })

    it('应该使用自定义重定向路由', async () => {
      getCurrentDevice = vi.fn(() => 'mobile' as DeviceType)
      guard = new DeviceRouteGuard(getCurrentDevice)

      const guardFn = guard.createGuard()
      const next = vi.fn()

      const to = createMockRoute({
        path: '/admin',
        fullPath: '/admin',
        meta: {
          supportedDevices: ['desktop'],
          unsupportedRedirect: '/custom-unsupported',
        },
      })
      const from = createMockRoute()

      await guardFn(to, from, next)

      expect(next).toHaveBeenCalledWith({
        path: '/custom-unsupported',
        query: {
          from: '/admin',
          device: 'mobile',
          reason: 'unsupported_device',
        },
      })
    })
  })

  describe('自定义选项', () => {
    it('应该使用自定义设备检查函数', async () => {
      const customChecker = vi.fn(() => true)
      guard = new DeviceRouteGuard(getCurrentDevice, {
        checkSupportedDevices: customChecker,
      })

      const guardFn = guard.createGuard()
      const next = vi.fn()

      const to = createMockRoute({
        meta: {
          supportedDevices: ['desktop'],
        },
      })
      const from = createMockRoute()

      await guardFn(to, from, next)

      expect(customChecker).toHaveBeenCalledWith(['desktop'], 'desktop', to)
      expect(next).toHaveBeenCalledWith()
    })

    it('应该使用自定义不支持设备处理函数', async () => {
      const customHandler = vi.fn(() => '/custom-redirect')
      guard = new DeviceRouteGuard(getCurrentDevice, {
        onUnsupportedDevice: customHandler,
      })

      const guardFn = guard.createGuard()
      const next = vi.fn()

      const to = createMockRoute({
        meta: {
          supportedDevices: ['tablet'],
        },
      })
      const from = createMockRoute()

      await guardFn(to, from, next)

      expect(customHandler).toHaveBeenCalledWith('desktop', to)
      expect(next).toHaveBeenCalledWith('/custom-redirect')
    })
  })

  describe('匹配路由记录检查', () => {
    it('应该检查匹配的路由记录中的设备限制', async () => {
      const guardFn = guard.createGuard()
      const next = vi.fn()

      const to = createMockRoute({
        meta: {},
        matched: [
          {
            meta: {
              supportedDevices: ['desktop'],
            },
          } as any,
        ],
      })
      const from = createMockRoute()

      await guardFn(to, from, next)

      expect(next).toHaveBeenCalledWith()
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
