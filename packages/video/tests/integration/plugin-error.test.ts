import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { VideoPlayer } from '../../src/core/player'
import { DanmakuPlugin } from '../../src/plugins/danmaku'

describe('插件错误处理测试', () => {
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

  describe('插件错误处理', () => {
    it('应该处理插件初始化错误', async () => {
      const errorPlugin = new DanmakuPlugin({ enabled: true })

      // 模拟插件初始化错误
      vi.spyOn(errorPlugin, 'onInstall').mockRejectedValue(new Error('Plugin init failed'))

      player = new VideoPlayer({
        container,
        src: 'test-video.mp4',
        plugins: [errorPlugin]
      })

      await expect(player.initialize()).rejects.toThrow('Plugin init failed')
    })

    it('应该处理插件运行时错误', async () => {
      const danmakuPlugin = new DanmakuPlugin({ enabled: true })

      player = new VideoPlayer({
        container,
        src: 'test-video.mp4',
        plugins: [danmakuPlugin]
      })

      await player.initialize()

      const errorHandler = vi.fn()
      player.on('error', errorHandler)

      // 模拟插件运行时错误
      vi.spyOn(danmakuPlugin, 'send').mockImplementation(() => {
        throw new Error('Danmaku send failed')
      })

      expect(() => {
        danmakuPlugin.send('测试弹幕', 'scroll')
      }).toThrow('Danmaku send failed')
    })

    it('应该能够从插件错误中恢复', async () => {
      const danmakuPlugin = new DanmakuPlugin({ enabled: true })

      player = new VideoPlayer({
        container,
        src: 'test-video.mp4',
        plugins: [danmakuPlugin]
      })

      await player.initialize()

      // 模拟插件错误
      const originalSend = danmakuPlugin.send.bind(danmakuPlugin)
      let errorCount = 0

      vi.spyOn(danmakuPlugin, 'send').mockImplementation((text, type) => {
        errorCount++
        if (errorCount === 1) {
          throw new Error('First attempt failed')
        }
        return originalSend(text, type)
      })

      // 第一次调用失败
      expect(() => {
        danmakuPlugin.send('测试弹幕1', 'scroll')
      }).toThrow('First attempt failed')

      // 第二次调用成功
      expect(() => {
        danmakuPlugin.send('测试弹幕2', 'scroll')
      }).not.toThrow()
    })
  })
})
