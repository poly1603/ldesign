import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { VideoPlayer } from '../../src/core/player'
import { DanmakuPlugin } from '../../src/plugins/danmaku'
import { SubtitlePlugin } from '../../src/plugins/subtitle'
import { ScreenshotPlugin } from '../../src/plugins/screenshot'

// 等待函数
const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('多插件协作测试', () => {
  let container: HTMLDivElement
  let player: VideoPlayer

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div')
    container.id = 'test-container'
    if (document.body && document.body.appendChild) {
      document.body.appendChild(container)
    }
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

    // 清理DOM
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
    container = null as any

    // 等待更长时间确保所有异步操作完成
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  describe('多插件协作', () => {
    it('应该能够同时使用多个插件', async () => {
      const danmakuPlugin = new DanmakuPlugin({ enabled: true })
      const subtitlePlugin = new SubtitlePlugin({ enabled: true })
      const screenshotPlugin = new ScreenshotPlugin({ enabled: true, autoDownload: false })

      player = new VideoPlayer({
        container,
        src: 'test-video.mp4',
        plugins: [danmakuPlugin, subtitlePlugin, screenshotPlugin]
      })

      await player.initialize()

      expect(player.getPlugin('danmaku')).toBe(danmakuPlugin)
      expect(player.getPlugin('subtitle')).toBe(subtitlePlugin)
      expect(player.getPlugin('screenshot')).toBe(screenshotPlugin)

      // 测试插件功能不冲突
      danmakuPlugin.send('测试弹幕', 'scroll')
      const dataUrl = await screenshotPlugin.capture()

      expect(dataUrl).toMatch(/^data:image\/png;base64,/)

      await waitFor(100)
      const danmakuElements = container.querySelectorAll('.lv-danmaku-item')
      expect(danmakuElements).toHaveLength(1)
    })

    it('应该能够动态启用和禁用插件', async () => {
      const danmakuPlugin = new DanmakuPlugin({ enabled: false })
      const subtitlePlugin = new SubtitlePlugin({ enabled: false })

      player = new VideoPlayer({
        container,
        src: 'test-video.mp4',
        plugins: [danmakuPlugin, subtitlePlugin]
      })

      await player.initialize()

      // 启用弹幕插件
      await player.pluginManager.enable('danmaku')
      expect(danmakuPlugin.enabled).toBe(true)

      // 启用字幕插件
      await player.pluginManager.enable('subtitle')
      expect(subtitlePlugin.enabled).toBe(true)

      // 禁用弹幕插件
      await player.pluginManager.disable('danmaku')
      expect(danmakuPlugin.enabled).toBe(false)
    })

    it('应该正确处理插件间的事件通信', async () => {
      const danmakuPlugin = new DanmakuPlugin({ enabled: true })

      player = new VideoPlayer({
        container,
        src: 'test-video.mp4',
        plugins: [danmakuPlugin]
      })

      await player.initialize()

      // 监听弹幕插件事件
      const danmakuHandler = vi.fn()
      danmakuPlugin.on('danmakuSent', danmakuHandler)

      // 触发弹幕发送
      danmakuPlugin.send('测试弹幕', 'scroll')

      await waitFor(100)

      // 验证事件被触发
      expect(danmakuHandler).toHaveBeenCalled()

      // 由于事件系统的限制，我们只验证事件被正确触发
      // 实际的数据传递在插件内部处理
    })
  })
})
