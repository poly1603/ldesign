/**
 * 事件系统类型定义
 * 定义播放器和插件的事件处理机制
 */

/**
 * 事件监听器函数类型
 */
export type EventListener<T = any> = (event: T) => void | Promise<void>

/**
 * 事件监听器选项
 */
export interface EventListenerOptions {
  /** 是否只执行一次 */
  once?: boolean
  /** 事件优先级 */
  priority?: number
  /** 是否在捕获阶段执行 */
  capture?: boolean
  /** 是否被动监听 */
  passive?: boolean
}

/**
 * 事件对象基础接口
 */
export interface BaseEvent {
  /** 事件类型 */
  type: string
  /** 事件目标 */
  target?: any
  /** 事件时间戳 */
  timestamp: number
  /** 是否已阻止默认行为 */
  defaultPrevented: boolean
  /** 是否已停止传播 */
  propagationStopped: boolean
  /** 阻止默认行为 */
  preventDefault(): void
  /** 停止事件传播 */
  stopPropagation(): void
}

/**
 * 播放器事件对象
 */
export interface PlayerEventObject extends BaseEvent {
  /** 播放器实例 */
  player: any
  /** 事件数据 */
  data?: any
}

/**
 * 时间更新事件数据
 */
export interface TimeUpdateEventData {
  /** 当前时间 */
  currentTime: number
  /** 总时长 */
  duration: number
  /** 播放进度百分比 */
  progress: number
}

/**
 * 进度更新事件数据
 */
export interface ProgressEventData {
  /** 缓冲进度 */
  buffered: number
  /** 缓冲时间范围 */
  bufferedRanges: Array<{ start: number; end: number }>
  /** 可播放进度 */
  playable: number
}

/**
 * 音量变化事件数据
 */
export interface VolumeChangeEventData {
  /** 音量值 */
  volume: number
  /** 是否静音 */
  muted: boolean
  /** 之前的音量值 */
  previousVolume: number
}

/**
 * 播放速度变化事件数据
 */
export interface RateChangeEventData {
  /** 播放速度 */
  playbackRate: number
  /** 之前的播放速度 */
  previousRate: number
}

/**
 * 全屏状态变化事件数据
 */
export interface FullscreenChangeEventData {
  /** 是否全屏 */
  fullscreen: boolean
  /** 全屏元素 */
  fullscreenElement?: HTMLElement
}

/**
 * 画中画状态变化事件数据
 */
export interface PipChangeEventData {
  /** 是否画中画 */
  pip: boolean
  /** 画中画窗口 */
  pipWindow?: any
}

/**
 * 错误事件数据
 */
export interface ErrorEventData {
  /** 错误代码 */
  code: number
  /** 错误消息 */
  message: string
  /** 错误详情 */
  details?: any
  /** 是否可恢复 */
  recoverable: boolean
}

/**
 * 质量变化事件数据
 */
export interface QualityChangeEventData {
  /** 当前质量 */
  quality: any
  /** 之前的质量 */
  previousQuality: any
  /** 可用质量列表 */
  availableQualities: any[]
}

/**
 * 插件事件数据
 */
export interface PluginEventData {
  /** 插件名称 */
  pluginName: string
  /** 插件实例 */
  plugin: any
  /** 事件数据 */
  data?: any
}

/**
 * 主题事件数据
 */
export interface ThemeEventData {
  /** 主题名称 */
  themeName: string
  /** 主题实例 */
  theme: any
  /** 之前的主题名称 */
  previousThemeName?: string
}

/**
 * 键盘事件数据
 */
export interface KeyboardEventData {
  /** 按键代码 */
  key: string
  /** 按键码 */
  keyCode: number
  /** 是否按下Ctrl */
  ctrlKey: boolean
  /** 是否按下Alt */
  altKey: boolean
  /** 是否按下Shift */
  shiftKey: boolean
  /** 是否按下Meta */
  metaKey: boolean
  /** 原始事件 */
  originalEvent: KeyboardEvent
}

/**
 * 鼠标事件数据
 */
export interface MouseEventData {
  /** 鼠标X坐标 */
  clientX: number
  /** 鼠标Y坐标 */
  clientY: number
  /** 鼠标按键 */
  button: number
  /** 是否按下Ctrl */
  ctrlKey: boolean
  /** 是否按下Alt */
  altKey: boolean
  /** 是否按下Shift */
  shiftKey: boolean
  /** 是否按下Meta */
  metaKey: boolean
  /** 原始事件 */
  originalEvent: MouseEvent
}

/**
 * 触摸事件数据
 */
export interface TouchEventData {
  /** 触摸点列表 */
  touches: Array<{
    clientX: number
    clientY: number
    identifier: number
  }>
  /** 变化的触摸点列表 */
  changedTouches: Array<{
    clientX: number
    clientY: number
    identifier: number
  }>
  /** 原始事件 */
  originalEvent: TouchEvent
}

/**
 * 手势事件数据
 */
export interface GestureEventData {
  /** 手势类型 */
  type: 'tap' | 'doubleTap' | 'swipe' | 'pinch' | 'pan'
  /** 手势数据 */
  data: any
  /** 原始事件 */
  originalEvent: Event
}

/**
 * 窗口大小变化事件数据
 */
export interface ResizeEventData {
  /** 窗口宽度 */
  width: number
  /** 窗口高度 */
  height: number
}

/**
 * 屏幕方向变化事件数据
 */
export interface OrientationChangeEventData {
  /** 屏幕方向角度 */
  orientation: number
}

/**
 * 事件发射器接口
 */
export interface IEventEmitter {
  /** 添加事件监听器 */
  on<T = any>(event: string, listener: EventListener<T>, options?: EventListenerOptions): void
  /** 添加一次性事件监听器 */
  once<T = any>(event: string, listener: EventListener<T>, options?: EventListenerOptions): void
  /** 移除事件监听器 */
  off<T = any>(event: string, listener?: EventListener<T>): void
  /** 移除所有事件监听器 */
  removeAllListeners(event?: string): void
  /** 触发事件 */
  emit<T = any>(event: string, data?: T): boolean
  /** 获取事件监听器数量 */
  listenerCount(event: string): number
  /** 获取事件监听器列表 */
  listeners(event: string): EventListener[]
  /** 获取所有事件名称 */
  eventNames(): string[]
}

/**
 * 事件总线接口
 */
export interface IEventBus extends IEventEmitter {
  /** 创建命名空间 */
  namespace(name: string): IEventBus
  /** 销毁事件总线 */
  destroy(): void
  /** 暂停事件处理 */
  pause(): void
  /** 恢复事件处理 */
  resume(): void
  /** 是否已暂停 */
  isPaused(): boolean
}

/**
 * 事件中间件函数
 */
export type EventMiddleware = (
  event: BaseEvent,
  next: () => void
) => void | Promise<void>

/**
 * 事件过滤器函数
 */
export type EventFilter<T = any> = (event: T) => boolean

/**
 * 事件转换器函数
 */
export type EventTransformer<T = any, R = any> = (event: T) => R

/**
 * 高级事件监听器选项
 */
export interface AdvancedEventListenerOptions extends EventListenerOptions {
  /** 事件过滤器 */
  filter?: EventFilter
  /** 事件转换器 */
  transformer?: EventTransformer
  /** 中间件 */
  middleware?: EventMiddleware[]
  /** 错误处理器 */
  errorHandler?: (error: Error) => void
  /** 最大执行次数 */
  maxCount?: number
  /** 防抖延迟 */
  debounce?: number
  /** 节流延迟 */
  throttle?: number
}
