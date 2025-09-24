import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BatteryModule } from '../../src/modules/BatteryModule'

describe('batteryModule', () => {
  let batteryModule: BatteryModule
  let mockBattery: any

  beforeEach(() => {
    // 模拟电池 API
    mockBattery = {
      level: 0.8,
      charging: false,
      chargingTime: Infinity,
      dischargingTime: 3600,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    // 模拟 navigator.getBattery
    Object.defineProperty(navigator, 'getBattery', {
      writable: true,
      value: vi.fn().mockResolvedValue(mockBattery),
    })

    batteryModule = new BatteryModule()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化', () => {
    it('应该成功初始化电池模块', async () => {
      await batteryModule.init()
      expect(navigator.getBattery).toHaveBeenCalled()
    })

    it('应该在不支持电池 API 时返回默认值', async () => {
      // 模拟不支持电池 API
      Object.defineProperty(navigator, 'getBattery', {
        writable: true,
        value: undefined,
      })

      await batteryModule.init()
      const info = batteryModule.getData()

      expect(info).toEqual({
        level: 1,
        charging: false,
        chargingTime: Infinity,
        dischargingTime: Infinity,
      })
    })

    it('应该处理 getBattery 抛出的错误', async () => {
      Object.defineProperty(navigator, 'getBattery', {
        writable: true,
        value: vi.fn().mockRejectedValue(new Error('Battery API error')),
      })

      await batteryModule.init()
      const info = batteryModule.getData()

      expect(info.level).toBe(1) // 默认值
    })
  })

  describe('电池信息获取', () => {
    beforeEach(async () => {
      await batteryModule.init()
    })

    it('应该返回正确的电池信息', () => {
      const info = batteryModule.getData()

      expect(info).toEqual({
        level: 0.8,
        charging: false,
        chargingTime: Infinity,
        dischargingTime: 3600,
      })
    })

    it('应该正确格式化电池电量百分比', () => {
      mockBattery.level = 0.567
      const info = batteryModule.getData()

      expect(info.level).toBe(0.567)
    })
  })

  describe('事件监听', () => {
    beforeEach(async () => {
      await batteryModule.init()
    })

    it('应该监听电池状态变化事件', () => {
      expect(mockBattery.addEventListener).toHaveBeenCalledWith(
        'levelchange',
        expect.any(Function),
      )
      expect(mockBattery.addEventListener).toHaveBeenCalledWith(
        'chargingchange',
        expect.any(Function),
      )
      expect(mockBattery.addEventListener).toHaveBeenCalledWith(
        'chargingtimechange',
        expect.any(Function),
      )
      expect(mockBattery.addEventListener).toHaveBeenCalledWith(
        'dischargingtimechange',
        expect.any(Function),
      )
    })

    it('应该在电池状态变化时更新内部状态', () => {
      // 模拟电池电量变化
      mockBattery.level = 0.5
      const levelChangeHandler = mockBattery.addEventListener.mock.calls
        .find((call: unknown[]) => call[0] === 'levelchange')?.[1] as (() => void) | undefined

      if (levelChangeHandler) {
        levelChangeHandler()
      }

      const info = batteryModule.getData()
      expect(info.level).toBe(0.5)
    })
  })

  describe('销毁', () => {
    beforeEach(async () => {
      await batteryModule.init()
    })

    it('应该正确清理事件监听器', async () => {
      await batteryModule.destroy()

      expect(mockBattery.removeEventListener).toHaveBeenCalledWith(
        'levelchange',
        expect.any(Function),
      )
      expect(mockBattery.removeEventListener).toHaveBeenCalledWith(
        'chargingchange',
        expect.any(Function),
      )
      expect(mockBattery.removeEventListener).toHaveBeenCalledWith(
        'chargingtimechange',
        expect.any(Function),
      )
      expect(mockBattery.removeEventListener).toHaveBeenCalledWith(
        'dischargingtimechange',
        expect.any(Function),
      )
    })

    it('应该在没有电池对象时安全销毁', async () => {
      const moduleWithoutBattery = new BatteryModule()
      await expect(moduleWithoutBattery.destroy()).resolves.not.toThrow()
    })
  })

  describe('边界情况', () => {
    it('应该处理无效的电池数据', async () => {
      mockBattery.level = null
      mockBattery.charging = undefined

      await batteryModule.init()
      const info = batteryModule.getData()

      expect(info.level).toBe(1) // 默认值
      expect(info.charging).toBe(false) // 默认值
    })

    it('应该处理极端的充电时间值', async () => {
      mockBattery.chargingTime = -1
      mockBattery.dischargingTime = Number.MAX_VALUE

      await batteryModule.init()
      const info = batteryModule.getData()

      expect(info.chargingTime).toBe(Infinity)
      expect(info.dischargingTime).toBe(Infinity)
    })
  })
})
