/**
 * 验证码插件库类型定义
 */

// 基础类型定义
export interface Point {
  /** X坐标 */
  x: number
  /** Y坐标 */
  y: number
}

export interface Size {
  /** 宽度 */
  width: number
  /** 高度 */
  height: number
}

export interface Rect extends Point, Size {}

// 验证码类型枚举
export enum CaptchaType {
  /** 滑动拼图验证 */
  SLIDE_PUZZLE = 'slide-puzzle',
  /** 按顺序点击文字验证 */
  CLICK_TEXT = 'click-text',
  /** 滑动滑块图片回正验证 */
  ROTATE_SLIDER = 'rotate-slider',
  /** 点击验证 */
  CLICK = 'click'
}

// 验证状态枚举
export enum CaptchaStatus {
  /** 未初始化 */
  UNINITIALIZED = 'uninitialized',
  /** 初始化中 */
  INITIALIZING = 'initializing',
  /** 就绪状态 */
  READY = 'ready',
  /** 验证中 */
  VERIFYING = 'verifying',
  /** 验证成功 */
  SUCCESS = 'success',
  /** 验证失败 */
  FAILED = 'failed',
  /** 错误状态 */
  ERROR = 'error'
}

// 主题配置接口
export interface ThemeConfig {
  /** 主色调 */
  primaryColor?: string
  /** 边框颜色 */
  borderColor?: string
  /** 背景颜色 */
  backgroundColor?: string
  /** 文字颜色 */
  textColor?: string
  /** 边框圆角 */
  borderRadius?: string
  /** 阴影 */
  boxShadow?: string
  /** 成功颜色 */
  successColor?: string
  /** 错误颜色 */
  errorColor?: string
  /** 警告颜色 */
  warningColor?: string
}

// 基础配置接口
export interface BaseCaptchaConfig {
  /** 容器元素或选择器 */
  container: string | HTMLElement
  /** 宽度 */
  width?: number
  /** 高度 */
  height?: number
  /** 主题配置 */
  theme?: ThemeConfig
  /** 是否启用调试模式 */
  debug?: boolean
  /** 语言设置 */
  language?: string
  /** 自定义样式类名 */
  className?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 验证成功回调 */
  onSuccess?: (result: CaptchaResult) => void
  /** 验证失败回调 */
  onFail?: (error: CaptchaError) => void
  /** 状态变化回调 */
  onStatusChange?: (status: CaptchaStatus) => void
  /** 重试回调 */
  onRetry?: () => void
}

// 验证结果接口
export interface CaptchaResult {
  /** 验证码类型 */
  type: CaptchaType
  /** 验证是否成功 */
  success: boolean
  /** 验证数据 */
  data: any
  /** 验证时间戳 */
  timestamp: number
  /** 验证耗时（毫秒） */
  duration: number
  /** 验证令牌 */
  token?: string
}

// 错误信息接口
export interface CaptchaError {
  /** 错误代码 */
  code: string
  /** 错误消息 */
  message: string
  /** 错误详情 */
  details?: any
  /** 错误时间戳 */
  timestamp: number
}

// 事件类型定义
export type CaptchaEventType = 
  | 'init'
  | 'ready'
  | 'start'
  | 'progress'
  | 'success'
  | 'fail'
  | 'retry'
  | 'reset'
  | 'destroy'
  | 'statusChange'

// 事件数据接口
export interface CaptchaEventData {
  /** 事件类型 */
  type: CaptchaEventType
  /** 事件数据 */
  data?: any
  /** 事件时间戳 */
  timestamp: number
}

// 事件监听器类型
export type CaptchaEventListener = (data: CaptchaEventData) => void

// 滑动拼图验证配置
export interface SlidePuzzleConfig extends BaseCaptchaConfig {
  /** 图片URL */
  imageUrl?: string
  /** 拼图块大小 */
  puzzleSize?: number
  /** 容错像素 */
  tolerance?: number
  /** 是否显示阴影 */
  showShadow?: boolean
  /** 滑块轨道高度 */
  sliderHeight?: number
}

// 点击文字验证配置
export interface ClickTextConfig extends BaseCaptchaConfig {
  /** 文字数量 */
  textCount?: number
  /** 点击顺序 */
  clickOrder?: number[]
  /** 文字内容 */
  texts?: string[]
  /** 字体大小 */
  fontSize?: number
  /** 干扰文字数量 */
  distractorCount?: number
}

// 旋转滑块验证配置
export interface RotateSliderConfig extends BaseCaptchaConfig {
  /** 图片URL */
  imageUrl?: string
  /** 目标角度 */
  targetAngle?: number
  /** 角度容错 */
  tolerance?: number
  /** 滑块样式 */
  sliderStyle?: 'circular' | 'linear'
}

// 点击验证配置
export interface ClickConfig extends BaseCaptchaConfig {
  /** 图片URL */
  imageUrl?: string
  /** 目标区域 */
  targetAreas?: Array<{
    x: number
    y: number
    radius: number
    label?: string
  }>
  /** 点击容错 */
  tolerance?: number
  /** 最大点击次数 */
  maxClicks?: number
}

// 验证码实例接口
export interface ICaptcha {
  /** 验证码类型 */
  readonly type: CaptchaType
  /** 当前状态 */
  readonly status: CaptchaStatus
  /** 配置信息 */
  readonly config: BaseCaptchaConfig
  
  /** 初始化验证码 */
  init(): Promise<void>
  /** 开始验证 */
  start(): void
  /** 重置验证码 */
  reset(): void
  /** 销毁验证码 */
  destroy(): void
  /** 验证结果 */
  verify(data: any): Promise<CaptchaResult>
  
  /** 添加事件监听器 */
  on(event: CaptchaEventType, listener: CaptchaEventListener): void
  /** 移除事件监听器 */
  off(event: CaptchaEventType, listener: CaptchaEventListener): void
  /** 触发事件 */
  emit(event: CaptchaEventType, data?: any): void
}
