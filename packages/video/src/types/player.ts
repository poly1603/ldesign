/**
 * 视频播放器核心类型定义
 * 定义播放器的基础接口、配置选项和状态管理
 */

/**
 * 播放器状态枚举
 */
export enum PlayerState {
  /** 未初始化 */
  UNINITIALIZED = 'uninitialized',
  /** 加载中 */
  LOADING = 'loading',
  /** 已加载 */
  LOADED = 'loaded',
  /** 准备就绪 */
  READY = 'ready',
  /** 播放中 */
  PLAYING = 'playing',
  /** 暂停 */
  PAUSED = 'paused',
  /** 缓冲中 */
  BUFFERING = 'buffering',
  /** 结束 */
  ENDED = 'ended',
  /** 错误 */
  ERROR = 'error'
}

/**
 * 播放器事件类型
 */
export enum PlayerEvent {
  /** 播放器准备就绪 */
  READY = 'ready',
  /** 开始播放 */
  PLAY = 'play',
  /** 暂停播放 */
  PAUSE = 'pause',
  /** 播放结束 */
  ENDED = 'ended',
  /** 时间更新 */
  TIME_UPDATE = 'timeupdate',
  /** 进度更新 */
  PROGRESS = 'progress',
  /** 音量变化 */
  VOLUME_CHANGE = 'volumechange',
  /** 播放速度变化 */
  RATE_CHANGE = 'ratechange',
  /** 全屏状态变化 */
  FULLSCREEN_CHANGE = 'fullscreenchange',
  /** 画中画状态变化 */
  PIP_CHANGE = 'pipchange',
  /** 错误 */
  ERROR = 'error',
  /** 加载开始 */
  LOAD_START = 'loadstart',
  /** 加载完成 */
  LOADED_DATA = 'loadeddata',
  /** 可以播放 */
  CAN_PLAY = 'canplay',
  /** 可以流畅播放 */
  CAN_PLAY_THROUGH = 'canplaythrough',
  /** 状态变化 */
  STATUS_CHANGE = 'statuschange',
  /** 销毁 */
  DESTROY = 'destroy',
  /** 窗口大小变化 */
  RESIZE = 'resize',
  /** 屏幕方向变化 */
  ORIENTATION_CHANGE = 'orientationchange'
}

/**
 * 视频质量选项
 */
export interface VideoQuality {
  /** 质量标识 */
  id: string
  /** 质量名称 */
  name: string
  /** 视频源URL */
  src: string
  /** 分辨率宽度 */
  width?: number
  /** 分辨率高度 */
  height?: number
  /** 比特率 */
  bitrate?: number
  /** 是否为默认质量 */
  default?: boolean
}

/**
 * 视频源配置
 */
export interface VideoSource {
  /** 视频URL */
  src: string
  /** 视频类型 */
  type?: string
  /** 视频标题 */
  title?: string
  /** 视频封面 */
  poster?: string
  /** 多质量选项 */
  qualities?: VideoQuality[]
}

/**
 * 播放器配置选项
 */
export interface PlayerOptions {
  /** 容器元素或选择器 */
  container: HTMLElement | string
  /** 视频源 */
  src: VideoSource | string
  /** 是否自动播放 */
  autoplay?: boolean
  /** 是否静音 */
  muted?: boolean
  /** 是否循环播放 */
  loop?: boolean
  /** 是否显示控制栏 */
  controls?: boolean
  /** 初始音量 (0-1) */
  volume?: number
  /** 初始播放速度 */
  playbackRate?: number
  /** 是否预加载 */
  preload?: 'none' | 'metadata' | 'auto'
  /** 跨域设置 */
  crossOrigin?: 'anonymous' | 'use-credentials'
  /** 是否启用画中画 */
  pip?: boolean
  /** 是否启用全屏 */
  fullscreen?: boolean
  /** 主题配置 */
  theme?: string | object
  /** 插件配置 */
  plugins?: (PluginConfig | import('../types/plugin').IPlugin)[]
  /** 快捷键配置 */
  hotkeys?: boolean | HotkeyConfig
  /** 手势配置 */
  gestures?: boolean | GestureConfig
  /** 响应式配置 */
  responsive?: boolean | ResponsiveConfig
  /** 自定义CSS类名 */
  className?: string
  /** 语言设置 */
  language?: string
}

/**
 * 插件配置
 */
export interface PluginConfig {
  /** 插件名称 */
  name: string
  /** 插件选项 */
  options?: Record<string, any>
  /** 是否启用 */
  enabled?: boolean
}

/**
 * 快捷键配置
 */
export interface HotkeyConfig {
  /** 播放/暂停 */
  playPause?: string | string[]
  /** 音量增加 */
  volumeUp?: string | string[]
  /** 音量减少 */
  volumeDown?: string | string[]
  /** 静音切换 */
  mute?: string | string[]
  /** 全屏切换 */
  fullscreen?: string | string[]
  /** 快进 */
  forward?: string | string[]
  /** 快退 */
  backward?: string | string[]
  /** 自定义快捷键 */
  custom?: Record<string, string | string[]>
}

/**
 * 手势配置
 */
export interface GestureConfig {
  /** 是否启用点击播放/暂停 */
  tap?: boolean
  /** 是否启用双击全屏 */
  doubleTap?: boolean
  /** 是否启用滑动调节音量 */
  swipeVolume?: boolean
  /** 是否启用滑动调节进度 */
  swipeProgress?: boolean
  /** 是否启用捏合缩放 */
  pinchZoom?: boolean
}

/**
 * 响应式配置
 */
export interface ResponsiveConfig {
  /** 断点配置 */
  breakpoints?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  /** 移动端特殊配置 */
  mobile?: Partial<PlayerOptions>
  /** 平板端特殊配置 */
  tablet?: Partial<PlayerOptions>
  /** 桌面端特殊配置 */
  desktop?: Partial<PlayerOptions>
}

/**
 * 播放器状态信息
 */
export interface PlayerStatus {
  /** 当前状态 */
  state: PlayerState
  /** 当前时间 */
  currentTime: number
  /** 总时长 */
  duration: number
  /** 缓冲进度 */
  buffered: number
  /** 音量 */
  volume: number
  /** 是否静音 */
  muted: boolean
  /** 播放速度 */
  playbackRate: number
  /** 是否全屏 */
  fullscreen: boolean
  /** 是否画中画 */
  pip: boolean
  /** 当前质量 */
  quality?: VideoQuality
}

/**
 * 播放器核心接口
 */
export interface IVideoPlayer {
  /** 播放器配置 */
  readonly options: PlayerOptions
  /** 播放器状态 */
  readonly status: PlayerStatus
  /** 视频元素 */
  readonly videoElement: HTMLVideoElement
  /** 容器元素 */
  readonly container: HTMLElement

  /** 初始化播放器 */
  initialize(): Promise<void>
  /** 销毁播放器 */
  destroy(): void
  /** 播放 */
  play(): Promise<void>
  /** 暂停 */
  pause(): void
  /** 跳转到指定时间 */
  seek(time: number): void
  /** 设置音量 */
  setVolume(volume: number): void
  /** 设置播放速度 */
  setPlaybackRate(rate: number): void
  /** 切换全屏 */
  toggleFullscreen(): Promise<void>
  /** 切换画中画 */
  togglePip(): Promise<void>
  /** 切换播放/暂停 */
  toggle(): void
  /** 设置视频源 */
  setSrc(src: VideoSource | string): void
  /** 切换视频质量 */
  setQuality(quality: VideoQuality): void

  /** 事件监听 */
  on(event: PlayerEvent, callback: Function): void
  /** 移除事件监听 */
  off(event: PlayerEvent, callback?: Function): void
  /** 触发事件 */
  emit(event: PlayerEvent, ...args: any[]): void
}
