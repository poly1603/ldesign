/**
 * Vue Composables 测试
 * 确保所有 composables 在 Vue 环境中正常工作
 */

import {
  useBattery,
  useDevice,
  useGeolocation,
  useNetwork,
} from '@ldesign/device/vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

describe('vue Composables', () => {
  describe('useDevice', () => {
    it('应该返回正确的设备信息', () => {
      const wrapper = mount({
        setup() {
          const deviceResult = useDevice()
          return { deviceResult }
        },
        template: '<div></div>',
      })

      const { deviceResult } = wrapper.vm

      // 检查返回的属性
      expect(deviceResult).toHaveProperty('deviceType')
      expect(deviceResult).toHaveProperty('orientation')
      expect(deviceResult).toHaveProperty('deviceInfo')
      expect(deviceResult).toHaveProperty('isMobile')
      expect(deviceResult).toHaveProperty('isTablet')
      expect(deviceResult).toHaveProperty('isDesktop')
      expect(deviceResult).toHaveProperty('isTouchDevice')
      expect(deviceResult).toHaveProperty('refresh')

      // 检查函数类型
      expect(typeof deviceResult.refresh).toBe('function')
    })
  })

  describe('useNetwork', () => {
    it('应该返回正确的网络相关属性和方法', () => {
      const wrapper = mount({
        setup() {
          const networkResult = useNetwork()
          return { networkResult }
        },
        template: '<div></div>',
      })

      const { networkResult } = wrapper.vm

      // 检查返回的属性
      expect(networkResult).toHaveProperty('networkInfo')
      expect(networkResult).toHaveProperty('isOnline')
      expect(networkResult).toHaveProperty('connectionType')
      expect(networkResult).toHaveProperty('isLoaded')
      expect(networkResult).toHaveProperty('loadModule')
      expect(networkResult).toHaveProperty('unloadModule')

      // 检查函数类型
      expect(typeof networkResult.loadModule).toBe('function')
      expect(typeof networkResult.unloadModule).toBe('function')
    })

    it('loadModule 应该能够正常调用', async () => {
      const wrapper = mount({
        setup() {
          const networkResult = useNetwork()
          return { networkResult }
        },
        template: '<div></div>',
      })

      const { networkResult } = wrapper.vm

      // 测试 loadModule 调用
      await expect(networkResult.loadModule()).resolves.not.toThrow()
      expect(networkResult.isLoaded.value).toBe(true)
    })
  })

  describe('useBattery', () => {
    it('应该返回正确的电池相关属性和方法', () => {
      const wrapper = mount({
        setup() {
          const batteryResult = useBattery()
          return { batteryResult }
        },
        template: '<div></div>',
      })

      const { batteryResult } = wrapper.vm

      // 检查返回的属性
      expect(batteryResult).toHaveProperty('batteryInfo')
      expect(batteryResult).toHaveProperty('batteryLevel')
      expect(batteryResult).toHaveProperty('isCharging')
      expect(batteryResult).toHaveProperty('batteryStatus')
      expect(batteryResult).toHaveProperty('isLoaded')
      expect(batteryResult).toHaveProperty('loadModule')
      expect(batteryResult).toHaveProperty('unloadModule')

      // 检查函数类型
      expect(typeof batteryResult.loadModule).toBe('function')
      expect(typeof batteryResult.unloadModule).toBe('function')
    })

    it('loadModule 应该能够正常调用', async () => {
      const wrapper = mount({
        setup() {
          const batteryResult = useBattery()
          return { batteryResult }
        },
        template: '<div></div>',
      })

      const { batteryResult } = wrapper.vm

      // 测试 loadModule 调用
      await expect(batteryResult.loadModule()).resolves.not.toThrow()
      expect(batteryResult.isLoaded.value).toBe(true)
    })
  })

  describe('useGeolocation', () => {
    it('应该返回正确的地理位置相关属性和方法', () => {
      const wrapper = mount({
        setup() {
          const geoResult = useGeolocation()
          return { geoResult }
        },
        template: '<div></div>',
      })

      const { geoResult } = wrapper.vm

      // 检查返回的属性
      expect(geoResult).toHaveProperty('position')
      expect(geoResult).toHaveProperty('latitude')
      expect(geoResult).toHaveProperty('longitude')
      expect(geoResult).toHaveProperty('accuracy')
      expect(geoResult).toHaveProperty('error')
      expect(geoResult).toHaveProperty('isSupported')
      expect(geoResult).toHaveProperty('isWatching')
      expect(geoResult).toHaveProperty('isLoaded')
      expect(geoResult).toHaveProperty('loadModule')
      expect(geoResult).toHaveProperty('unloadModule')
      expect(geoResult).toHaveProperty('getCurrentPosition')
      expect(geoResult).toHaveProperty('startWatching')
      expect(geoResult).toHaveProperty('stopWatching')

      // 检查函数类型
      expect(typeof geoResult.loadModule).toBe('function')
      expect(typeof geoResult.unloadModule).toBe('function')
      expect(typeof geoResult.getCurrentPosition).toBe('function')
      expect(typeof geoResult.startWatching).toBe('function')
      expect(typeof geoResult.stopWatching).toBe('function')
    })

    it('loadModule 应该能够正常调用', async () => {
      const wrapper = mount({
        setup() {
          const geoResult = useGeolocation()
          return { geoResult }
        },
        template: '<div></div>',
      })

      const { geoResult } = wrapper.vm

      // 测试 loadModule 调用
      await expect(geoResult.loadModule()).resolves.not.toThrow()
      expect(geoResult.isLoaded.value).toBe(true)
    })
  })

  describe('框架一致性测试', () => {
    it('所有 composables 的 loadModule 都应该是函数', () => {
      const wrapper = mount({
        setup() {
          const deviceResult = useDevice()
          const networkResult = useNetwork()
          const batteryResult = useBattery()
          const geoResult = useGeolocation()

          return {
            deviceResult,
            networkResult,
            batteryResult,
            geoResult,
          }
        },
        template: '<div></div>',
      })

      const { networkResult, batteryResult, geoResult } = wrapper.vm

      // 检查所有 loadModule 都是函数
      expect(typeof networkResult.loadModule).toBe('function')
      expect(typeof batteryResult.loadModule).toBe('function')
      expect(typeof geoResult.loadModule).toBe('function')
    })

    it('所有 composables 的 unloadModule 都应该是函数', () => {
      const wrapper = mount({
        setup() {
          const networkResult = useNetwork()
          const batteryResult = useBattery()
          const geoResult = useGeolocation()

          return {
            networkResult,
            batteryResult,
            geoResult,
          }
        },
        template: '<div></div>',
      })

      const { networkResult, batteryResult, geoResult } = wrapper.vm

      // 检查所有 unloadModule 都是函数
      expect(typeof networkResult.unloadModule).toBe('function')
      expect(typeof batteryResult.unloadModule).toBe('function')
      expect(typeof geoResult.unloadModule).toBe('function')
    })
  })
})
