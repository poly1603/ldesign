import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GeolocationModule } from '../../src/modules/GeolocationModule'

describe('geolocationModule', () => {
  let geolocationModule: GeolocationModule
  let mockGeolocation: any

  beforeEach(() => {
    // 模拟地理位置 API
    mockGeolocation = {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    }

    // 模拟 navigator.geolocation
    Object.defineProperty(navigator, 'geolocation', {
      writable: true,
      configurable: true,
      value: mockGeolocation,
    })

    geolocationModule = new GeolocationModule()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化', () => {
    it('应该成功初始化地理位置模块', async () => {
      // 模拟成功获取位置
      mockGeolocation.getCurrentPosition.mockImplementation((success: PositionCallback) => {
        success({
          coords: {
            latitude: 39.9042,
            longitude: 116.4074,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
            toJSON: () => ({}),
          } as GeolocationCoordinates,
          timestamp: Date.now(),
          toJSON: () => ({}),
        })
      })

      await geolocationModule.init()

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled()
    })

    it('应该在不支持地理位置 API 时返回默认值', async () => {
      // 模拟不支持地理位置 API
      Object.defineProperty(navigator, 'geolocation', {
        writable: true,
        value: undefined,
      })

      const moduleWithoutGeo = new GeolocationModule()
      await moduleWithoutGeo.init()

      const info = moduleWithoutGeo.getCurrentPosition()
      await expect(info).rejects.toThrow('Geolocation is not supported')
    })

    it('应该处理地理位置权限被拒绝', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((_success: PositionCallback, error: PositionErrorCallback) => {
        error({
          code: 1, // PERMISSION_DENIED
          message: 'User denied the request for Geolocation.',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError)
      })

      await geolocationModule.init()

      const info = geolocationModule.getCurrentPosition()
      await expect(info).rejects.toThrow('Permission denied')
    })
  })

  describe('位置获取', () => {
    beforeEach(async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success: PositionCallback) => {
        success({
          coords: {
            latitude: 39.9042,
            longitude: 116.4074,
            accuracy: 10,
            altitude: 100,
            altitudeAccuracy: 5,
            heading: 90,
            speed: 5,
            toJSON: () => ({}),
          } as GeolocationCoordinates,
          timestamp: Date.now(),
        } as GeolocationPosition)
      })

      await geolocationModule.init()
    })

    it('应该返回正确的位置信息', async () => {
      const position = await geolocationModule.getCurrentPosition()

      expect(position).toEqual({
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: 10,
        altitude: 100,
        altitudeAccuracy: 5,
        heading: 90,
        speed: 5,
        timestamp: expect.any(Number),
      })
    })

    it('应该使用自定义选项获取位置', async () => {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }

      await geolocationModule.getCurrentPosition(options)

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        options,
      )
    })
  })

  describe('位置监听', () => {
    beforeEach(async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success: PositionCallback) => {
        success({
          coords: {
            latitude: 39.9042,
            longitude: 116.4074,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
            toJSON: () => ({}),
          } as GeolocationCoordinates,
          timestamp: Date.now(),
          toJSON: () => ({}),
        } as GeolocationPosition)
      })

      mockGeolocation.watchPosition.mockReturnValue(123) // 模拟 watchId

      await geolocationModule.init()
    })

    it('应该开始监听位置变化', () => {
      const callback = vi.fn()
      const watchId = geolocationModule.watchPosition(callback)

      expect(mockGeolocation.watchPosition).toHaveBeenCalled()
      expect(watchId).toBe(123)
    })

    it('应该停止监听位置变化', () => {
      const callback = vi.fn()
      const watchId = geolocationModule.watchPosition(callback)

      if (watchId !== null) {
        geolocationModule.clearWatch(watchId)
      }

      expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(watchId)
    })

    it('应该在位置变化时触发回调', () => {
      const callback = vi.fn()
      geolocationModule.watchPosition(callback)

      // 获取传递给 watchPosition 的成功回调
      const successCallback = mockGeolocation.watchPosition.mock.calls[0][0]

      // 模拟位置变化
      const newPosition = {
        coords: {
          latitude: 40.0000,
          longitude: 116.0000,
          accuracy: 15,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      }

      successCallback(newPosition)

      expect(callback).toHaveBeenCalledWith({
        latitude: 40.0000,
        longitude: 116.0000,
        accuracy: 15,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        timestamp: expect.any(Number),
      })
    })
  })

  describe('错误处理', () => {
    beforeEach(async () => {
      await geolocationModule.init()
    })

    it('应该处理位置不可用错误', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((_success: PositionCallback, error: PositionErrorCallback) => {
        error({
          code: 2, // POSITION_UNAVAILABLE
          message: 'Position unavailable.',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError)
      })

      const position = geolocationModule.getCurrentPosition()
      await expect(position).rejects.toThrow('Position unavailable')
    })

    it('应该处理超时错误', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((_success: PositionCallback, error: PositionErrorCallback) => {
        error({
          code: 3, // TIMEOUT
          message: 'Timeout expired.',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError)
      })

      const position = geolocationModule.getCurrentPosition()
      await expect(position).rejects.toThrow('Request timeout')
    })

    it('应该处理未知错误', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((_success: PositionCallback, error: PositionErrorCallback) => {
        error({
          code: 999, // 未知错误码
          message: 'Unknown error.',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError)
      })

      const position = geolocationModule.getCurrentPosition()
      await expect(position).rejects.toThrow('An unknown error occurred')
    })
  })

  describe('销毁', () => {
    beforeEach(async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success: PositionCallback) => {
        success({
          coords: {
            latitude: 39.9042,
            longitude: 116.4074,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
            toJSON: () => ({}),
          } as GeolocationCoordinates,
          timestamp: Date.now(),
          toJSON: () => ({}),
        } as GeolocationPosition)
      })

      await geolocationModule.init()
    })

    it('应该清理所有监听器', async () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      mockGeolocation.watchPosition.mockReturnValueOnce(1).mockReturnValueOnce(2)

      geolocationModule.watchPosition(callback1)
      geolocationModule.watchPosition(callback2)

      await geolocationModule.destroy()

      expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(1)
      expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(2)
    })

    it('应该在没有监听器时安全销毁', async () => {
      await expect(geolocationModule.destroy()).resolves.not.toThrow()
    })
  })

  describe('边界情况', () => {
    it('应该处理无效的坐标数据', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success: PositionCallback) => {
        success({
          coords: {
            latitude: null as any,
            longitude: undefined as any,
            accuracy: -1,
            altitude: 'invalid' as any,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
            toJSON: () => ({}),
          } as GeolocationCoordinates,
          timestamp: Date.now(),
          toJSON: () => ({}),
        } as GeolocationPosition)
      })

      await geolocationModule.init()
      const position = await geolocationModule.getCurrentPosition()

      expect(position.latitude).toBeNull()
      expect(position.longitude).toBeUndefined()
      expect(position.accuracy).toBe(-1)
    })
  })
})
