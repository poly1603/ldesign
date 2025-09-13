/**
 * VideoPlayer 单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { VideoPlayer } from '../../src/core/player'
import { createMockContainer, createMockVideoElement, cleanup, waitFor } from '../setup'

describe('VideoPlayer', () => {
  let container: HTMLElement
  let player: VideoPlayer

  beforeEach(() => {
    container = createMockContainer()
  })

  afterEach(() => {
    if (player) {
      player.destroy()
    }
    cleanup()
  })

  describe('构造函数', () => {
    it('应该正确创建播放器实例', () => {
      player = new VideoPlayer({
        container,
        src: 'test-video.mp4'
      })

      expect(player).toBeInstanceOf(VideoPlayer)
      expect(player.container).toBe(container)
    })

    it('应该抛出错误当容器不存在时', () => {
      expect(() => {
        new VideoPlayer({
          container: null as any,
          src: 'test-video.mp4'
        })
      }).toThrow('Container element is required')
    })

    it('应该抛出错误当视频源不存在时', () => {
      expect(() => {
        new VideoPlayer({
          container,
          src: ''
        })
      }).toThrow('Video source is required')
    })
  })

  describe('初始化', () => {
    it('应该正确初始化播放器', async () => {
      player = new VideoPlayer({
        container,
        src: 'test-video.mp4'
      })

      await player.initialize()

      expect(player.videoElement).toBeInstanceOf(HTMLVideoElement)
      expect(player.status.state).toBe('ready')
    })

    it('应该设置正确的视频属性', async () => {
      player = new VideoPlayer({
        container,
        src: 'test-video.mp4',
        autoplay: true,
        muted: true,
        loop: true,
        volume: 0.5
      })

      await player.initialize()

      expect(player.videoElement.autoplay).toBe(true)
      expect(player.videoElement.muted).toBe(true)
      expect(player.videoElement.loop).toBe(true)
      expect(player.videoElement.volume).toBe(0.5)
    })

    it('应该触发ready事件', async () => {
      const readyHandler = vi.fn()

      player = new VideoPlayer({
        container,
        src: 'test-video.mp4'
      })

      player.on('ready', readyHandler)
      await player.initialize()

      expect(readyHandler).toHaveBeenCalled()
    })
  })

  describe('播放控制', () => {
    beforeEach(async () => {
      player = new VideoPlayer({
        container,
        src: 'test-video.mp4'
      })
      await player.initialize()
    })

    it('应该能够播放视频', async () => {
      const playHandler = vi.fn()
      player.on('play', playHandler)

      await player.play()

      expect(player.videoElement.play).toHaveBeenCalled()
      expect(playHandler).toHaveBeenCalled()
    })

    it('应该能够暂停视频', () => {
      const pauseHandler = vi.fn()
      player.on('pause', pauseHandler)

      player.pause()

      expect(player.videoElement.pause).toHaveBeenCalled()
      expect(pauseHandler).toHaveBeenCalled()
    })

    it('应该能够切换播放状态', async () => {
      // 模拟暂停状态
      Object.defineProperty(player.videoElement, 'paused', {
        value: true,
        writable: true
      })

      await player.toggle()
      expect(player.videoElement.play).toHaveBeenCalled()

      // 模拟播放状态
      Object.defineProperty(player.videoElement, 'paused', {
        value: false,
        writable: true
      })

      await player.toggle()
      expect(player.videoElement.pause).toHaveBeenCalled()
    })

    it('应该能够跳转到指定时间', () => {
      player.seek(30)
      expect(player.videoElement.currentTime).toBe(30)
    })

    it('应该限制跳转时间在有效范围内', () => {
      // 跳转到负数时间
      player.seek(-10)
      expect(player.videoElement.currentTime).toBe(0)

      // 跳转到超出时长的时间
      Object.defineProperty(player.videoElement, 'duration', { value: 100 })
      player.seek(150)
      expect(player.videoElement.currentTime).toBe(100)
    })

    it('应该能够设置音量', () => {
      player.setVolume(0.8)
      expect(player.videoElement.volume).toBe(0.8)
    })

    it('应该限制音量在有效范围内', () => {
      player.setVolume(-0.5)
      expect(player.videoElement.volume).toBe(0)

      player.setVolume(1.5)
      expect(player.videoElement.volume).toBe(1)
    })

    it('应该能够设置播放速度', () => {
      player.setPlaybackRate(1.5)
      expect(player.videoElement.playbackRate).toBe(1.5)
    })

    it('应该限制播放速度在有效范围内', () => {
      player.setPlaybackRate(0.1)
      expect(player.videoElement.playbackRate).toBe(0.25)

      player.setPlaybackRate(5)
      expect(player.videoElement.playbackRate).toBe(4)
    })
  })

  describe('全屏功能', () => {
    beforeEach(async () => {
      player = new VideoPlayer({
        container,
        src: 'test-video.mp4'
      })
      await player.initialize()
    })

    it('应该能够进入全屏', async () => {
      await player.toggleFullscreen()
      expect(container.requestFullscreen).toHaveBeenCalled()
    })

    it('应该能够退出全屏', async () => {
      // 模拟已经在全屏状态
      Object.defineProperty(document, 'fullscreenElement', { value: container })

      await player.toggleFullscreen()
      expect(document.exitFullscreen).toHaveBeenCalled()
    })

    it('应该触发全屏状态变化事件', async () => {
      const fullscreenHandler = vi.fn()
      player.on('fullscreenchange', fullscreenHandler)

      await player.toggleFullscreen()
      expect(fullscreenHandler).toHaveBeenCalled()
    })
  })

  describe('画中画功能', () => {
    beforeEach(async () => {
      player = new VideoPlayer({
        container,
        src: 'test-video.mp4'
      })
      await player.initialize()
    })

    it('应该能够进入画中画', async () => {
      await player.togglePip()
      expect(player.videoElement.requestPictureInPicture).toHaveBeenCalled()
    })

    it('应该能够退出画中画', async () => {
      // 模拟已经在画中画状态
      Object.defineProperty(document, 'pictureInPictureElement', { value: player.videoElement })

      await player.togglePip()
      expect(document.exitPictureInPicture).toHaveBeenCalled()
    })

    it('应该触发画中画状态变化事件', async () => {
      const pipHandler = vi.fn()
      player.on('pipchange', pipHandler)

      await player.togglePip()
      expect(pipHandler).toHaveBeenCalled()
    })
  })

  describe('事件系统', () => {
    beforeEach(async () => {
      player = new VideoPlayer({
        container,
        src: 'test-video.mp4'
      })
      await player.initialize()
    })

    it('应该能够注册和触发事件', () => {
      const handler = vi.fn()
      player.on('test', handler)

        // 使用私有方法测试简单事件发射
        ; (player as any).emitSimple('test', { data: 'test' })
      expect(handler).toHaveBeenCalledWith({ data: 'test' })
    })

    it('应该能够注销事件监听器', () => {
      const handler = vi.fn()
      player.on('test', handler)
      player.off('test', handler)

      player.emit('test')
      expect(handler).not.toHaveBeenCalled()
    })

    it('应该能够注册一次性事件监听器', () => {
      const handler = vi.fn()
      player.once('test', handler)

      player.emit('test')
      player.emit('test')

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('应该能够移除所有事件监听器', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      player.on('test1', handler1)
      player.on('test2', handler2)
      player.removeAllListeners()

      player.emit('test1')
      player.emit('test2')

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })
  })

  describe('状态管理', () => {
    beforeEach(async () => {
      player = new VideoPlayer({
        container,
        src: 'test-video.mp4'
      })
      await player.initialize()
    })

    it('应该正确更新播放器状态', () => {
      const initialStatus = player.status
      expect(initialStatus.state).toBe('ready')
      expect(initialStatus.currentTime).toBe(0)
      expect(initialStatus.duration).toBe(100)
      expect(initialStatus.volume).toBe(1)
      expect(initialStatus.muted).toBe(false)
      expect(initialStatus.playbackRate).toBe(1)
      expect(initialStatus.fullscreen).toBe(false)
      expect(initialStatus.pip).toBe(false)
    })

    it('应该在状态变化时触发事件', async () => {
      const statusHandler = vi.fn()
      player.on('statuschange', statusHandler)

      await player.play()
      expect(statusHandler).toHaveBeenCalled()
    })
  })

  describe('错误处理', () => {
    it('应该处理播放错误', async () => {
      const errorHandler = vi.fn()

      player = new VideoPlayer({
        container,
        src: 'invalid-video.mp4'
      })

      await player.initialize()
      player.on('error', errorHandler)

      // 模拟播放错误
      vi.mocked(player.videoElement.play).mockRejectedValue(new Error('Play failed'))

      try {
        await player.play()
      } catch (error) {
        expect(errorHandler).toHaveBeenCalled()
      }
    })

    it('应该处理视频加载错误', async () => {
      const errorHandler = vi.fn()

      player = new VideoPlayer({
        container,
        src: 'invalid-video.mp4'
      })

      player.on('error', errorHandler)
      await player.initialize()

      // 模拟视频错误事件
      const errorEvent = new Event('error')
      player.videoElement.dispatchEvent(errorEvent)

      expect(errorHandler).toHaveBeenCalled()
    })
  })

  describe('销毁', () => {
    it('应该正确销毁播放器', async () => {
      player = new VideoPlayer({
        container,
        src: 'test-video.mp4'
      })

      await player.initialize()

      const videoElement = player.videoElement
      player.destroy()

      expect(container.innerHTML).toBe('')
      expect(player.videoElement).toBeNull()
    })

    it('应该移除所有事件监听器', async () => {
      const handler = vi.fn()

      player = new VideoPlayer({
        container,
        src: 'test-video.mp4'
      })

      await player.initialize()
      player.on('test', handler)
      player.destroy()

      player.emit('test')
      expect(handler).not.toHaveBeenCalled()
    })
  })
})
