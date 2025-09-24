import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MediaModule } from '../../src/modules/MediaModule'

describe('mediaModule', () => {
  let module: MediaModule
  let mockMediaDevices: any
  let mockPermissions: any

  beforeEach(() => {
    // Mock navigator.mediaDevices
    mockMediaDevices = {
      enumerateDevices: vi.fn(),
      getUserMedia: vi.fn(),
      getDisplayMedia: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    // Mock navigator.permissions
    mockPermissions = {
      query: vi.fn(),
    }

    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      value: mockMediaDevices,
      writable: true,
      configurable: true,
    })

    Object.defineProperty(globalThis.navigator, 'permissions', {
      value: mockPermissions,
      writable: true,
      configurable: true,
    })

    module = new MediaModule()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化模块', async () => {
      mockMediaDevices.enumerateDevices.mockResolvedValue([])
      await module.init()

      expect(module.name).toBe('media')
      expect(module.getData()).toBeDefined()
    })

    it('应该检测媒体设备', async () => {
      const mockDevices = [
        { deviceId: 'camera1', label: 'Front Camera', kind: 'videoinput', groupId: 'group1' },
        { deviceId: 'mic1', label: 'Microphone', kind: 'audioinput', groupId: 'group2' },
        { deviceId: 'speaker1', label: 'Speaker', kind: 'audiooutput', groupId: 'group3' },
      ]

      mockMediaDevices.enumerateDevices.mockResolvedValue(mockDevices)
      await module.init()

      const data = module.getData()
      expect(data.hasCamera).toBe(true)
      expect(data.hasMicrophone).toBe(true)
      expect(data.hasSpeaker).toBe(true)
      expect(data.cameras).toHaveLength(1)
      expect(data.microphones).toHaveLength(1)
      expect(data.speakers).toHaveLength(1)
    })

    it('应该处理初始化错误', async () => {
      mockMediaDevices.enumerateDevices.mockRejectedValue(new Error('Permission denied'))

      // 不应该抛出错误，而是静默处理
      await expect(module.init()).resolves.not.toThrow()
    })
  })

  describe('设备检测', () => {
    beforeEach(async () => {
      const mockDevices = [
        { deviceId: 'camera1', label: 'Camera 1', kind: 'videoinput', groupId: 'group1' },
        { deviceId: 'camera2', label: 'Camera 2', kind: 'videoinput', groupId: 'group1' },
        { deviceId: 'mic1', label: 'Mic 1', kind: 'audioinput', groupId: 'group2' },
      ]
      mockMediaDevices.enumerateDevices.mockResolvedValue(mockDevices)
      await module.init()
    })

    it('应该返回摄像头列表', () => {
      const cameras = module.getCameras()
      expect(cameras).toHaveLength(2)
      expect(cameras[0].deviceId).toBe('camera1')
      expect(cameras[1].deviceId).toBe('camera2')
    })

    it('应该返回麦克风列表', () => {
      const microphones = module.getMicrophones()
      expect(microphones).toHaveLength(1)
      expect(microphones[0].deviceId).toBe('mic1')
    })

    it('应该检测是否有摄像头', () => {
      expect(module.hasCamera()).toBe(true)
    })

    it('应该检测是否有麦克风', () => {
      expect(module.hasMicrophone()).toBe(true)
    })

    it('应该检测是否有扬声器', () => {
      expect(module.hasSpeaker()).toBe(false)
    })
  })

  describe('权限管理', () => {
    it('应该请求摄像头权限', async () => {
      const mockStream = {
        getTracks: vi.fn().mockReturnValue([
          { stop: vi.fn() },
        ]),
      }
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream)
      mockMediaDevices.enumerateDevices.mockResolvedValue([])

      const result = await module.requestCameraPermission()

      expect(result).toBe(true)
      expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true })
      expect(mockStream.getTracks).toHaveBeenCalled()
    })

    it('应该处理摄像头权限被拒绝', async () => {
      mockMediaDevices.getUserMedia.mockRejectedValue(new Error('Permission denied'))

      const result = await module.requestCameraPermission()

      expect(result).toBe(false)
      expect(module.getData().cameraPermission).toBe('denied')
    })

    it('应该请求麦克风权限', async () => {
      const mockStream = {
        getTracks: vi.fn().mockReturnValue([
          { stop: vi.fn() },
        ]),
      }
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream)
      mockMediaDevices.enumerateDevices.mockResolvedValue([])

      const result = await module.requestMicrophonePermission()

      expect(result).toBe(true)
      expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true })
      expect(mockStream.getTracks).toHaveBeenCalled()
    })

    it('应该处理麦克风权限被拒绝', async () => {
      mockMediaDevices.getUserMedia.mockRejectedValue(new Error('Permission denied'))

      const result = await module.requestMicrophonePermission()

      expect(result).toBe(false)
      expect(module.getData().microphonePermission).toBe('denied')
    })
  })

  describe('设备测试', () => {
    it('应该测试摄像头', async () => {
      const mockStream = {
        getVideoTracks: vi.fn().mockReturnValue([{ id: 'track1' }]),
        getTracks: vi.fn().mockReturnValue([
          { stop: vi.fn() },
        ]),
      }
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream)

      const result = await module.testCamera()

      expect(result).toBe(true)
      expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true })
    })

    it('应该测试摄像头失败', async () => {
      mockMediaDevices.getUserMedia.mockRejectedValue(new Error('No camera'))

      const result = await module.testCamera()

      expect(result).toBe(false)
    })

    it('应该测试麦克风', async () => {
      const mockStream = {
        getAudioTracks: vi.fn().mockReturnValue([{ id: 'track1' }]),
        getTracks: vi.fn().mockReturnValue([
          { stop: vi.fn() },
        ]),
      }
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream)

      const result = await module.testMicrophone()

      expect(result).toBe(true)
      expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true })
    })

    it('应该测试麦克风失败', async () => {
      mockMediaDevices.getUserMedia.mockRejectedValue(new Error('No microphone'))

      const result = await module.testMicrophone()

      expect(result).toBe(false)
    })
  })

  describe('媒体流', () => {
    it('应该获取媒体流', async () => {
      const mockStream = new MediaStream()
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream)

      const result = await module.getMediaStream()

      expect(result).toBe(mockStream)
      expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: true,
        audio: true,
      })
    })

    it('应该使用自定义约束获取媒体流', async () => {
      const mockStream = new MediaStream()
      const constraints = { video: { width: 1920 }, audio: false }
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream)

      const result = await module.getMediaStream(constraints)

      expect(result).toBe(mockStream)
      expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith(constraints)
    })

    it('应该处理获取媒体流失败', async () => {
      mockMediaDevices.getUserMedia.mockRejectedValue(new Error('Failed'))

      const result = await module.getMediaStream()

      expect(result).toBeNull()
    })

    it('应该获取屏幕共享流', async () => {
      const mockStream = new MediaStream()
      mockMediaDevices.getDisplayMedia.mockResolvedValue(mockStream)

      const result = await module.getDisplayMedia()

      expect(result).toBe(mockStream)
      expect(mockMediaDevices.getDisplayMedia).toHaveBeenCalledWith({
        video: true,
        audio: false,
      })
    })

    it('应该处理不支持屏幕共享', async () => {
      delete mockMediaDevices.getDisplayMedia

      const result = await module.getDisplayMedia()

      expect(result).toBeNull()
    })
  })

  describe('事件监听', () => {
    it('应该监听设备变化事件', async () => {
      const listener = vi.fn()
      module.on('deviceChange', listener)

      mockMediaDevices.enumerateDevices.mockResolvedValue([
        { deviceId: 'camera1', label: 'Camera', kind: 'videoinput' },
      ])

      await module.init()

      // 触发设备变化
      const deviceChangeHandler = mockMediaDevices.addEventListener.mock.calls.find(
        call => call[0] === 'devicechange',
      )?.[1]

      if (deviceChangeHandler) {
        await deviceChangeHandler()
        expect(listener).toHaveBeenCalled()
      }
    })

    it('应该监听权限变化事件', async () => {
      const listener = vi.fn()
      module.on('permissionChange', listener)

      const mockStream = {
        getTracks: vi.fn().mockReturnValue([
          { stop: vi.fn() },
        ]),
      }
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream)
      mockMediaDevices.enumerateDevices.mockResolvedValue([])

      await module.requestCameraPermission()

      expect(listener).toHaveBeenCalledWith({
        type: 'camera',
        state: 'granted',
      })
    })
  })

  describe('清理', () => {
    it('应该正确销毁模块', async () => {
      mockMediaDevices.enumerateDevices.mockResolvedValue([])
      await module.init()

      await module.destroy()

      expect(mockMediaDevices.removeEventListener).toHaveBeenCalled()
    })
  })
})
