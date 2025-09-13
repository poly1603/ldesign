/**
 * 播放器与插件集成测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { VideoPlayer } from '../../src/core/player'
import { DanmakuPlugin } from '../../src/plugins/danmaku'
import { SubtitlePlugin } from '../../src/plugins/subtitle'
import { ScreenshotPlugin } from '../../src/plugins/screenshot'
import { PipPlugin } from '../../src/plugins/pip'
import { createMockContainer, cleanup, waitFor } from '../setup'

describe('播放器与插件集成', () => {
  let container: HTMLElement
  let player: VideoPlayer

  beforeEach(() => {
    container = createMockContainer()
  })

  afterEach(async () => {
    // 强制清理所有定时器和异步操作
    vi.clearAllTimers()
    vi.clearAllMocks()

    if (player) {
      try {
        // 销毁播放器
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

    // 重新创建容器
    container = document.createElement('div')
    container.id = 'test-container'
    document.body.appendChild(container)

    // 强制垃圾回收（如果可用）
    if (global.gc) {
      global.gc()
    }

    cleanup()

    // 等待更长时间确保所有异步操作完成
    await new Promise(resolve => setTimeout(resolve, 50))
  })

  describe('弹幕插件集成', () => {
    it('应该能够正确集成弹幕插件', async () => {
      const danmakuPlugin = new DanmakuPlugin({
        enabled: true,
        opacity: 0.8,
        fontSize: 16
      })

      player = new VideoPlayer({
        container,
        src: 'test-video.mp4',
        plugins: [danmakuPlugin]
      })

      await player.initialize()

      expect(player.getPlugin('danmaku')).toBe(danmakuPlugin)
      expect(danmakuPlugin.enabled).toBe(true)
    })

    it('应该能够发送和显示弹幕', async () => {
      const danmakuPlugin = new DanmakuPlugin({
        enabled: true
      })

      player = new VideoPlayer({
        container,
        src: 'test-video.mp4',
        plugins: [danmakuPlugin]
      })

      await player.initialize()

      // 发送弹幕
      danmakuPlugin.send('测试弹幕', 'scroll')

      // 检查弹幕是否被添加到DOM
      await waitFor(100)
      const danmakuElements = container.querySelectorAll('.lv-danmaku-item')
      expect(danmakuElements).toHaveLength(1)
      expect(danmakuElements[0].textContent).toBe('测试弹幕')
    })

    it('应该能够清除弹幕', async () => {
      const danmakuPlugin = new DanmakuPlugin({
        enabled: true
      })

      player = new VideoPlayer({
        container,
        src: 'test-video.mp4',
        plugins: [danmakuPlugin]
      })

      await player.initialize()

      // 发送多条弹幕
      danmakuPlugin.send('弹幕1', 'scroll')
      danmakuPlugin.send('弹幕2', 'scroll')
      danmakuPlugin.send('弹幕3', 'scroll')

      await waitFor(100)
      expect(container.querySelectorAll('.lv-danmaku-item')).toHaveLength(3)

      // 清除弹幕
      danmakuPlugin.clear()

      await waitFor(100)
      expect(container.querySelectorAll('.lv-danmaku-item')).toHaveLength(0)
    })

    it('应该能够暂停和恢复弹幕', async () => {
      const danmakuPlugin = new DanmakuPlugin({
        enabled: true
      })

      player = new VideoPlayer({
        container,
        src: 'test-video.mp4',
        plugins: [danmakuPlugin]
      })

      await player.initialize()

      // 发送弹幕
      danmakuPlugin.send('测试弹幕', 'scroll')

      // 暂停弹幕
      danmakuPlugin.pause()
      expect(danmakuPlugin.paused).toBe(true)

      // 恢复弹幕
      danmakuPlugin.resume()
      expect(danmakuPlugin.paused).toBe(false)
    })
  })

  describe('字幕插件集成', () => {
    it('应该能够正确集成字幕插件', async () => {
      const subtitlePlugin = new SubtitlePlugin({
        enabled: true,
        fontSize: 18
      })

      player = new VideoPlayer({
        container,
        src: 'test-video.mp4',
        plugins: [subtitlePlugin]
      })

      await player.initialize()

      expect(player.getPlugin('subtitle')).toBe(subtitlePlugin)
      expect(subtitlePlugin.enabled).toBe(true)
    })

    it('应该能够加载和显示字幕', async () => {
      const subtitlePlugin = new SubtitlePlugin({
        enabled: true
      })

      player = new VideoPlayer({
        container,
        src: 'test-video.mp4',
        plugins: [subtitlePlugin]
      })

      await player.initialize()

      // 模拟SRT字幕内容
      const srtContent = `1
00:00:01,000 --> 00:00:03,000
这是第一条字幕

2
00:00:04,000 --> 00:00:06,000
这是第二条字幕`

      // 加载字幕
      await subtitlePlugin.loadSubtitle(srtContent, 'srt')

      expect(subtitlePlugin.tracks).toHaveLength(2)
      expect(subtitlePlugin.tracks[0].text).toBe('这是第一条字幕')
      expect(subtitlePlugin.tracks[1].text).toBe('这是第二条字幕')
    })

    it('应该能够根据播放时间显示对应字幕', async () => {
      const subtitlePlugin = new SubtitlePlugin({
        enabled: true
      })

      player = new VideoPlayer({
        container,
        src: 'test-video.mp4',
        plugins: [subtitlePlugin]
      })

      await player.initialize()

      const srtContent = `1
00:00:01,000 --> 00:00:03,000
第一条字幕

2
00:00:04,000 --> 00:00:06,000
第二条字幕`

      await subtitlePlugin.loadSubtitle(srtContent, 'srt')

      // 直接调用字幕插件的更新方法
      subtitlePlugin.updateSubtitle(2)

      await waitFor(100)

      // 查找有内容的字幕元素（可能有多个字幕元素）
      const allSubtitleElements = container.querySelectorAll('.lv-subtitle-display')
      let subtitleElement = null
      for (let i = 0; i < allSubtitleElements.length; i++) {
        const element = allSubtitleElements[i]
        if (element.textContent && element.style.display !== 'none') {
          subtitleElement = element
          break
        }
      }

      expect(subtitleElement?.textContent).toBe('第一条字幕')
    })
  })

  describe('截图插件集成', () => {
    it('应该能够正确集成截图插件', async () => {
      const screenshotPlugin = new ScreenshotPlugin({
        enabled: true,
        format: 'png',
        quality: 0.9,
        autoDownload: false // 在测试中禁用自动下载
      })

      player = new VideoPlayer({
        container,
        src: 'test-video.mp4',
        plugins: [screenshotPlugin]
      })

      await player.initialize()

      expect(player.getPlugin('screenshot')).toBe(screenshotPlugin)
      expect(screenshotPlugin.enabled).toBe(true)
    })

    it('应该能够捕获视频截图', async () => {
      const screenshotPlugin = new ScreenshotPlugin({
        enabled: true,
        format: 'png',
        autoDownload: false // 在测试中禁用自动下载
      })

      player = new VideoPlayer({
        container,
        src: 'test-video.mp4',
        plugins: [screenshotPlugin]
      })

      await player.initialize()

      const dataUrl = await screenshotPlugin.capture()
      expect(dataUrl).toMatch(/^data:image\/png;base64,/)
    })

    it('应该能够下载截图', async () => {
      const screenshotPlugin = new ScreenshotPlugin({
        enabled: true,
        autoDownload: false // 在测试中禁用自动下载，我们手动测试下载功能
      })

      player = new VideoPlayer({
        container,
        src: 'test-video.mp4',
        plugins: [screenshotPlugin]
      })

      await player.initialize()

      // Mock创建下载链接
      const domUtils = await import('../../src/utils/dom')
      const createElementSpy = vi.spyOn(domUtils, 'createElement')

      // 创建真正的链接元素，然后模拟其方法
      const mockLink = document.createElement('a')
      mockLink.click = vi.fn()

      createElementSpy.mockImplementation((tagName: string, options?: any) => {
        if (tagName === 'a') {
          // 应用属性到模拟链接
          if (options?.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
              mockLink.setAttribute(key, value as string)
            })
          }
          if (options?.styles) {
            Object.assign(mockLink.style, options.styles)
          }
          return mockLink
        }
        // 对于其他元素，使用原始实现
        return (domUtils.createElement as any).wrappedMethod?.(tagName, options) ||
          document.createElement(tagName)
      })

      await screenshotPlugin.download('test-screenshot.png')

      expect(mockLink.click).toHaveBeenCalled()
      expect(mockLink.download).toBe('test-screenshot.png')
    })
  })

  // 画中画插件测试移动到单独文件以避免状态污染

  // 多插件协作和错误处理测试移动到单独文件以避免状态污染
})
