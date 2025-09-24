import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NetworkModule } from '../../src/modules/NetworkModule'

describe('networkModule', () => {
  let networkModule: NetworkModule
  let mockConnection: any

  beforeEach(() => {
    // 清理之前的模拟
    vi.clearAllMocks()

    // 模拟网络连接 API
    mockConnection = {
      effectiveType: '4g',
      downlink: 10,
      rtt: 100,
      saveData: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    // 重置现有的 connection 属性（如果存在）
    try {
      if ('connection' in navigator) {
        Object.defineProperty(navigator, 'connection', {
          writable: true,
          configurable: true,
          value: undefined,
        })
      }
    }
    catch {
      // 忽略删除错误，继续执行
    }

    // 模拟 navigator.connection
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      configurable: true,
      value: mockConnection,
    })

    // 模拟 navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    })

    // 模拟 window 事件监听器
    globalThis.window.addEventListener = vi.fn()
    globalThis.window.removeEventListener = vi.fn()

    networkModule = new NetworkModule()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化', () => {
    it('应该成功初始化网络模块', async () => {
      await networkModule.init()

      const info = networkModule.getData()
      expect(info.online).toBe(true)
      expect(info.effectiveType).toBe('4g')
    })

    it('应该在不支持网络连接 API 时返回基本信息', async () => {
      // 模拟不支持网络连接 API
      Object.defineProperty(navigator, 'connection', {
        writable: true,
        value: undefined,
      })

      await networkModule.init()
      const info = networkModule.getData()

      expect(info.online).toBe(true)
      expect(info.effectiveType).toBe('unknown')
    })

    it('应该处理离线状态', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      })

      await networkModule.init()
      const info = networkModule.getNetworkInfo()

      expect(info.online).toBe(false)
    })
  })

  describe('网络信息获取', () => {
    beforeEach(async () => {
      await networkModule.init()
    })

    it('应该返回正确的网络信息', () => {
      const info = networkModule.getNetworkInfo()

      expect(info).toEqual({
        status: 'online',
        type: 'cellular',
        online: true,
        effectiveType: '4g',
        downlink: 10,
        rtt: 100,
        saveData: false,
        supported: true,
      })
    })

    it('应该处理不同的网络类型', () => {
      mockConnection.effectiveType = '3g'
      mockConnection.downlink = 1.5
      mockConnection.rtt = 300

      const info = networkModule.getNetworkInfo()

      expect(info.effectiveType).toBe('3g')
      expect(info.downlink).toBe(1.5)
      expect(info.rtt).toBe(300)
    })

    it('应该处理省流量模式', () => {
      mockConnection.saveData = true

      const info = networkModule.getNetworkInfo()

      expect(info.saveData).toBe(true)
    })
  })

  describe('事件监听', () => {
    beforeEach(async () => {
      await networkModule.init()
    })

    it('应该监听网络状态变化事件', () => {
      expect(mockConnection.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function),
      )
    })

    it('应该监听在线状态变化事件', () => {
      // 检查是否添加了 online 和 offline 事件监听器
      expect(window.addEventListener).toHaveBeenCalledWith(
        'online',
        expect.any(Function),
      )
      expect(window.addEventListener).toHaveBeenCalledWith(
        'offline',
        expect.any(Function),
      )
    })

    it('应该在网络状态变化时触发事件', () => {
      const mockCallback = vi.fn()
      networkModule.on('networkChange', mockCallback)

      // 模拟网络状态变化
      mockConnection.effectiveType = '3g'
      const changeHandler = mockConnection.addEventListener.mock.calls
        .find((call: unknown[]) => call[0] === 'change')?.[1] as (() => void) | undefined

      if (changeHandler) {
        changeHandler()
      }

      expect(mockCallback).toHaveBeenCalledWith({
        status: 'online',
        type: 'cellular',
        online: true,
        effectiveType: '3g',
        downlink: 10,
        rtt: 100,
        saveData: false,
        supported: true,
      })
    })

    it('应该在离线时触发事件', async () => {
      const mockCallback = vi.fn()
      networkModule.on('networkChange', mockCallback)

      // 获取当前网络状态作为基准
      const _initialInfo = networkModule.getNetworkInfo()

      // 确保初始状态是在线的
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
        configurable: true,
      })

      // 等待一个tick确保状态稳定
      await new Promise(resolve => setTimeout(resolve, 10))

      // 模拟离线状态
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
        configurable: true,
      })

      // 触发离线事件
      const offlineEvent = new Event('offline')
      window.dispatchEvent(offlineEvent)

      // 也直接调用更新方法确保状态更新
      ;(networkModule as any).updateNetworkInfo()

      // 等待事件处理
      await vi.waitFor(() => {
        expect(mockCallback).toHaveBeenCalled()
      }, { timeout: 1000 })

      // 验证事件参数
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          online: false,
          status: 'offline',
        }),
      )
    })
  })

  describe('销毁', () => {
    beforeEach(async () => {
      await networkModule.init()
    })

    it('应该正确清理事件监听器', async () => {
      await networkModule.destroy()

      expect(mockConnection.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function),
      )
      expect(window.removeEventListener).toHaveBeenCalledWith(
        'online',
        expect.any(Function),
      )
      expect(window.removeEventListener).toHaveBeenCalledWith(
        'offline',
        expect.any(Function),
      )
    })

    it('应该在没有连接对象时安全销毁', async () => {
      const moduleWithoutConnection = new NetworkModule()
      await expect(moduleWithoutConnection.destroy()).resolves.not.toThrow()
    })
  })

  describe('边界情况', () => {
    it('应该处理无效的网络数据', async () => {
      mockConnection.effectiveType = null
      mockConnection.downlink = undefined
      mockConnection.rtt = -1

      await networkModule.init()
      const info = networkModule.getNetworkInfo()

      expect(info.effectiveType).toBe('unknown')
      expect(info.downlink).toBe(0)
      expect(info.rtt).toBe(0)
    })

    it('应该处理极端的网络值', async () => {
      mockConnection.downlink = Number.MAX_VALUE
      mockConnection.rtt = Number.MAX_VALUE

      await networkModule.init()
      const info = networkModule.getNetworkInfo()

      expect(info.downlink).toBe(Number.MAX_VALUE)
      expect(info.rtt).toBe(Number.MAX_VALUE)
    })

    it('应该处理不支持的网络类型', async () => {
      mockConnection.effectiveType = 'unknown-type'

      await networkModule.init()
      const info = networkModule.getNetworkInfo()

      expect(info.effectiveType).toBe('unknown-type')
    })
  })
})
