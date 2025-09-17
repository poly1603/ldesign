/**
 * 设备组件解析器测试
 */

import type {
  DeviceType,
  RouteComponent,
  RouteRecordNormalized,
} from '../../src/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeviceComponentResolver } from '../../src/device/resolver'

describe('deviceComponentResolver', () => {
  let getCurrentDevice: () => DeviceType
  let resolver: DeviceComponentResolver

  const mockMobileComponent = { name: 'MobileComponent' } as RouteComponent
  const mockTabletComponent = { name: 'TabletComponent' } as RouteComponent
  const mockDesktopComponent = { name: 'DesktopComponent' } as RouteComponent
  const mockDefaultComponent = { name: 'DefaultComponent' } as RouteComponent

  beforeEach(() => {
    getCurrentDevice = vi.fn(() => 'desktop' as DeviceType)
    resolver = new DeviceComponentResolver(getCurrentDevice)
  })

  describe('基础功能', () => {
    it('应该创建解析器实例', () => {
      expect(resolver).toBeInstanceOf(DeviceComponentResolver)
    })
  })

  describe('设备特定组件解析', () => {
    it('应该解析当前设备的组件', () => {
      getCurrentDevice = vi.fn(() => 'mobile' as DeviceType)
      resolver = new DeviceComponentResolver(getCurrentDevice)

      const record = createMockRecord({
        deviceComponents: {
          mobile: mockMobileComponent,
          tablet: mockTabletComponent,
          desktop: mockDesktopComponent,
        },
      })

      const result = resolver.resolveComponent(record)

      expect(result).toEqual({
        component: mockMobileComponent,
        deviceType: 'mobile',
        isFallback: false,
        source: 'deviceComponents',
      })
    })

    it('应该回退到其他设备组件', () => {
      getCurrentDevice = vi.fn(() => 'mobile' as DeviceType)
      resolver = new DeviceComponentResolver(getCurrentDevice)

      const record = createMockRecord({
        deviceComponents: {
          desktop: mockDesktopComponent,
          tablet: mockTabletComponent,
          // 没有 mobile 组件
        },
      })

      const result = resolver.resolveComponent(record)

      expect(result).toEqual({
        component: mockDesktopComponent,
        deviceType: 'desktop',
        isFallback: true,
        source: 'deviceComponents',
      })
    })

    it('回退顺序应该是 desktop -> tablet -> mobile', () => {
      getCurrentDevice = vi.fn(() => 'mobile' as DeviceType)
      resolver = new DeviceComponentResolver(getCurrentDevice)

      // 只有 tablet 组件
      const record1 = createMockRecord({
        deviceComponents: {
          tablet: mockTabletComponent,
        },
      })

      const result1 = resolver.resolveComponent(record1)
      expect(result1?.component).toBe(mockTabletComponent)

      // 有 desktop 和 tablet 组件，应该优先选择 desktop
      const record2 = createMockRecord({
        deviceComponents: {
          desktop: mockDesktopComponent,
          tablet: mockTabletComponent,
        },
      })

      const result2 = resolver.resolveComponent(record2)
      expect(result2?.component).toBe(mockDesktopComponent)
    })
  })

  describe('常规组件解析', () => {
    it('应该解析常规组件', () => {
      const record = createMockRecord({
        components: {
          default: mockDefaultComponent,
        },
      })

      const result = resolver.resolveComponent(record)

      expect(result).toEqual({
        component: mockDefaultComponent,
        deviceType: 'desktop',
        isFallback: false,
        source: 'component',
      })
    })

    it('应该支持指定视图名称', () => {
      const namedComponent = { name: 'NamedComponent' } as RouteComponent
      const record = createMockRecord({
        components: {
          default: mockDefaultComponent,
          sidebar: namedComponent,
        },
      })

      const result = resolver.resolveComponent(record, 'sidebar')

      expect(result?.component).toBe(namedComponent)
    })
  })



  describe('优先级顺序', () => {
    it('设备特定组件应该优先于常规组件', () => {
      const record = createMockRecord({
        deviceComponents: {
          desktop: mockDesktopComponent,
        },
        components: {
          default: mockDefaultComponent,
        },
      })

      const result = resolver.resolveComponent(record)

      expect(result?.component).toBe(mockDesktopComponent)
      expect(result?.source).toBe('deviceComponents')
    })


  })

  describe('设备支持检查', () => {
    it('应该检查组件是否支持当前设备', () => {
      const record = createMockRecord({
        deviceComponents: {
          desktop: mockDesktopComponent,
          tablet: mockTabletComponent,
        },
      })

      expect(resolver.isComponentSupportedOnDevice(record, 'desktop')).toBe(
        true,
      )
      expect(resolver.isComponentSupportedOnDevice(record, 'tablet')).toBe(true)
      expect(resolver.isComponentSupportedOnDevice(record, 'mobile')).toBe(true) // 有回退组件
    })

    it('没有任何组件时应该返回 false', () => {
      const record = createMockRecord({})

      expect(resolver.isComponentSupportedOnDevice(record, 'desktop')).toBe(
        false,
      )
    })

    it('有常规组件时应该支持所有设备', () => {
      const record = createMockRecord({
        components: {
          default: mockDefaultComponent,
        },
      })

      expect(resolver.isComponentSupportedOnDevice(record, 'desktop')).toBe(
        true,
      )
      expect(resolver.isComponentSupportedOnDevice(record, 'tablet')).toBe(true)
      expect(resolver.isComponentSupportedOnDevice(record, 'mobile')).toBe(true)
    })


  })

  describe('错误处理', () => {
    it('没有找到组件时应该返回 null', () => {
      const record = createMockRecord({})

      const result = resolver.resolveComponent(record)

      expect(result).toBeNull()
    })
  })
})

// 辅助函数
function createMockRecord(overrides: any = {}): RouteRecordNormalized {
  return {
    path: '/',
    name: undefined,
    components: null,
    children: [],
    meta: {},
    props: {},
    beforeEnter: undefined,
    aliasOf: undefined,
    redirect: undefined,
    ...overrides,
  } as RouteRecordNormalized
}
