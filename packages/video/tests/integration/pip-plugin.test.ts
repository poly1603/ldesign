import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { VideoPlayer } from '../../src/core/player'
import { PipPlugin } from '../../src/plugins/pip'

// 等待函数
const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('画中画插件集成测试', () => {
  let container: HTMLDivElement
  let player: VideoPlayer

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div')
    container.id = 'test-container'
    if (document.body && document.body.appendChild) {
      document.body.appendChild(container)
    }

    // 清理画中画状态
    (document as any).pictureInPictureElement = null
  })

  afterEach(async () => {
    // 强制清理所有定时器和异步操作
    vi.clearAllTimers()
    vi.clearAllMocks()

    if (player) {
      try {
        player.destroy()
      } catch (error) {
        console.warn('Error destroying player:', error)
      }
      player = null as any
    }

    // 彻底清理全局状态
    if (document.pictureInPictureElement) {
      (document as any).pictureInPictureElement = null
    }

    // 清理DOM
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
    container = null as any

    // 等待更长时间确保所有异步操作完成
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  describe('画中画插件集成', () => {
    it('应该能够正确集成画中画插件', async () => {
      // 先验证画中画API支持
      expect(document.pictureInPictureEnabled).toBe(true)
      expect('requestPictureInPicture' in HTMLVideoElement.prototype).toBe(true)

      // 测试插件创建
      const pipPlugin = new PipPlugin({
        enabled: true,
        autoEnter: false,
        showButton: false
      })

      expect(pipPlugin).toBeDefined()
      expect(pipPlugin.isSupported).toBe(true)

      // 测试播放器集成
      player = new VideoPlayer({
        container,
        src: 'test-video.mp4',
        plugins: [pipPlugin]
      })

      await player.initialize()

      expect(player.getPlugin('pip')).toBe(pipPlugin)
      expect(pipPlugin.enabled).toBe(true) // 安装后应该启用
    })

    it('应该能够进入画中画模式', async () => {
      const pipPlugin = new PipPlugin({
        enabled: true
      })

      player = new VideoPlayer({
        container,
        src: 'test-video.mp4',
        plugins: [pipPlugin]
      })

      await player.initialize()

      await pipPlugin.enter()
      expect(player.videoElement.requestPictureInPicture).toHaveBeenCalled()
    })

    it('应该能够退出画中画模式', async () => {
      const pipPlugin = new PipPlugin({
        enabled: true
      })

      player = new VideoPlayer({
        container,
        src: 'test-video.mp4',
        plugins: [pipPlugin]
      })

      await player.initialize()

        // 模拟已在画中画模式
        // 直接设置属性值（setup.ts中已经定义为writable）
        ; (document as any).pictureInPictureElement = player.videoElement

      // 触发进入画中画事件来更新插件状态
      const enterEvent = new Event('enterpictureinpicture')
      player.videoElement.dispatchEvent(enterEvent)

      await pipPlugin.exit()
      expect(document.exitPictureInPicture).toHaveBeenCalled()
    })

    it('应该能够自动进入画中画', async () => {
      // 创建一个模拟的IntersectionObserver回调
      let intersectionCallback: ((entries: any[]) => void) | null = null

      // 重新模拟IntersectionObserver以捕获回调
      global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
        intersectionCallback = callback
        return {
          observe: vi.fn(),
          unobserve: vi.fn(),
          disconnect: vi.fn(),
        }
      })

      const pipPlugin = new PipPlugin({
        enabled: true,
        autoEnter: true,
        autoEnterTrigger: 'visibility'
      })

      player = new VideoPlayer({
        container,
        src: 'test-video.mp4',
        plugins: [pipPlugin]
      })

      await player.initialize()

      // 等待插件初始化完成
      await waitFor(50)

      // 模拟容器不可见（触发自动画中画）
      if (intersectionCallback) {
        intersectionCallback([{ isIntersecting: false }])
      }

      await waitFor(100)
      expect(player.videoElement.requestPictureInPicture).toHaveBeenCalled()
    })
  })
})
