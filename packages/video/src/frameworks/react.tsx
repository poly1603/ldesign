/**
 * React 集成支持
 * 提供 React 组件和 Hooks
 */

import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { VideoPlayer } from '../core/player'
import type { PlayerOptions, PlayerStatus, IVideoPlayer } from '../types/player'

/**
 * React 播放器 Hook
 */
export function useVideoPlayer(options: PlayerOptions) {
  const [player, setPlayer] = useState<IVideoPlayer | null>(null)
  const [status, setStatus] = useState<PlayerStatus>({
    state: 'uninitialized',
    currentTime: 0,
    duration: 0,
    buffered: 0,
    volume: 1,
    muted: false,
    playbackRate: 1,
    fullscreen: false,
    pip: false
  })
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)

  /**
   * 初始化播放器
   */
  const initPlayer = useCallback(async () => {
    if (!containerRef.current) {
      throw new Error('Container element not found')
    }

    try {
      setIsLoading(true)
      setError(null)

      const videoPlayer = new VideoPlayer({
        ...options,
        container: containerRef.current
      })

      // 绑定事件监听器
      const bindEvents = () => {
        videoPlayer.on('ready', () => {
          setStatus({ ...videoPlayer.status })
          setIsReady(true)
        })

        videoPlayer.on('timeupdate', () => {
          setStatus({ ...videoPlayer.status })
        })

        videoPlayer.on('play', () => {
          setStatus({ ...videoPlayer.status })
        })

        videoPlayer.on('pause', () => {
          setStatus({ ...videoPlayer.status })
        })

        videoPlayer.on('volumechange', () => {
          setStatus({ ...videoPlayer.status })
        })

        videoPlayer.on('ratechange', () => {
          setStatus({ ...videoPlayer.status })
        })

        videoPlayer.on('fullscreenchange', () => {
          setStatus({ ...videoPlayer.status })
        })

        videoPlayer.on('pipchange', () => {
          setStatus({ ...videoPlayer.status })
        })

        videoPlayer.on('error', (errorEvent) => {
          setError(errorEvent.error)
        })
      }

      bindEvents()

      // 初始化播放器
      await videoPlayer.initialize()
      
      setPlayer(videoPlayer)
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [options])

  /**
   * 销毁播放器
   */
  const destroyPlayer = useCallback(() => {
    if (player) {
      player.destroy()
      setPlayer(null)
      setIsReady(false)
    }
  }, [player])

  /**
   * 播放器控制方法
   */
  const play = useCallback(async () => {
    if (player) {
      await player.play()
    }
  }, [player])

  const pause = useCallback(() => {
    if (player) {
      player.pause()
    }
  }, [player])

  const toggle = useCallback(() => {
    if (player) {
      player.toggle()
    }
  }, [player])

  const seek = useCallback((time: number) => {
    if (player) {
      player.seek(time)
    }
  }, [player])

  const setVolume = useCallback((volume: number) => {
    if (player) {
      player.setVolume(volume)
    }
  }, [player])

  const setPlaybackRate = useCallback((rate: number) => {
    if (player) {
      player.setPlaybackRate(rate)
    }
  }, [player])

  const toggleFullscreen = useCallback(async () => {
    if (player) {
      await player.toggleFullscreen()
    }
  }, [player])

  const togglePip = useCallback(async () => {
    if (player) {
      await player.togglePip()
    }
  }, [player])

  // 生命周期效果
  useEffect(() => {
    if (containerRef.current) {
      initPlayer().catch(console.error)
    }

    return () => {
      destroyPlayer()
    }
  }, [initPlayer, destroyPlayer])

  return {
    containerRef,
    player,
    status,
    isReady,
    isLoading,
    error,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    setPlaybackRate,
    toggleFullscreen,
    togglePip
  }
}

/**
 * 播放器组件属性接口
 */
export interface VideoPlayerProps extends PlayerOptions {
  className?: string
  style?: React.CSSProperties
  onReady?: () => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onTimeUpdate?: (data: { currentTime: number; duration: number }) => void
  onVolumeChange?: (data: { volume: number; muted: boolean }) => void
  onRateChange?: (data: { playbackRate: number }) => void
  onFullscreenChange?: (data: { fullscreen: boolean }) => void
  onPipChange?: (data: { pip: boolean }) => void
  onError?: (error: Error) => void
}

/**
 * 播放器组件引用接口
 */
export interface VideoPlayerRef {
  player: IVideoPlayer | null
  status: PlayerStatus
  isReady: boolean
  isLoading: boolean
  error: Error | null
  play: () => Promise<void>
  pause: () => void
  toggle: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  setPlaybackRate: (rate: number) => void
  toggleFullscreen: () => Promise<void>
  togglePip: () => Promise<void>
}

/**
 * React 播放器组件
 */
export const VideoPlayerComponent = forwardRef<VideoPlayerRef, VideoPlayerProps>((props, ref) => {
  const {
    className,
    style,
    onReady,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onVolumeChange,
    onRateChange,
    onFullscreenChange,
    onPipChange,
    onError,
    ...playerOptions
  } = props

  const {
    containerRef,
    player,
    status,
    isReady,
    isLoading,
    error,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    setPlaybackRate,
    toggleFullscreen,
    togglePip
  } = useVideoPlayer(playerOptions)

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    player,
    status,
    isReady,
    isLoading,
    error,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    setPlaybackRate,
    toggleFullscreen,
    togglePip
  }), [
    player,
    status,
    isReady,
    isLoading,
    error,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    setPlaybackRate,
    toggleFullscreen,
    togglePip
  ])

  // 事件回调
  useEffect(() => {
    if (isReady && onReady) {
      onReady()
    }
  }, [isReady, onReady])

  useEffect(() => {
    if (status.state === 'playing' && onPlay) {
      onPlay()
    } else if (status.state === 'paused' && onPause) {
      onPause()
    } else if (status.state === 'ended' && onEnded) {
      onEnded()
    }
  }, [status.state, onPlay, onPause, onEnded])

  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate({
        currentTime: status.currentTime,
        duration: status.duration
      })
    }
  }, [status.currentTime, status.duration, onTimeUpdate])

  useEffect(() => {
    if (onVolumeChange) {
      onVolumeChange({
        volume: status.volume,
        muted: status.muted
      })
    }
  }, [status.volume, status.muted, onVolumeChange])

  useEffect(() => {
    if (onRateChange) {
      onRateChange({
        playbackRate: status.playbackRate
      })
    }
  }, [status.playbackRate, onRateChange])

  useEffect(() => {
    if (onFullscreenChange) {
      onFullscreenChange({
        fullscreen: status.fullscreen
      })
    }
  }, [status.fullscreen, onFullscreenChange])

  useEffect(() => {
    if (onPipChange) {
      onPipChange({
        pip: status.pip
      })
    }
  }, [status.pip, onPipChange])

  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  return (
    <div
      ref={containerRef}
      className={`lv-player-container ${className || ''}`}
      style={style}
    >
      {isLoading && (
        <div className="lv-loading">
          <div className="lv-loading-spinner"></div>
          <span>加载中...</span>
        </div>
      )}
      {error && (
        <div className="lv-error">
          <span>播放器错误: {error.message}</span>
        </div>
      )}
    </div>
  )
})

VideoPlayerComponent.displayName = 'VideoPlayer'

/**
 * 默认导出
 */
export default VideoPlayerComponent
