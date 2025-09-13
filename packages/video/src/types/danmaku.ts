/**
 * 弹幕系统类型定义
 * 定义弹幕的数据结构、样式配置和管理机制
 */

/**
 * 弹幕类型枚举
 */
export enum DanmakuType {
  /** 滚动弹幕 */
  SCROLL = 'scroll',
  /** 顶部弹幕 */
  TOP = 'top',
  /** 底部弹幕 */
  BOTTOM = 'bottom',
  /** 高级弹幕 */
  ADVANCED = 'advanced',
  /** 代码弹幕 */
  CODE = 'code'
}

/**
 * 弹幕模式枚举
 */
export enum DanmakuMode {
  /** 普通模式 */
  NORMAL = 'normal',
  /** 防挡字幕模式 */
  SUBTITLE_PROTECTION = 'subtitle-protection',
  /** 智能防挡模式 */
  SMART_PROTECTION = 'smart-protection',
  /** 高密度模式 */
  HIGH_DENSITY = 'high-density',
  /** 低密度模式 */
  LOW_DENSITY = 'low-density'
}

/**
 * 弹幕优先级枚举
 */
export enum DanmakuPriority {
  /** 低优先级 */
  LOW = 0,
  /** 普通优先级 */
  NORMAL = 1,
  /** 高优先级 */
  HIGH = 2,
  /** VIP优先级 */
  VIP = 3,
  /** 管理员优先级 */
  ADMIN = 4
}

/**
 * 弹幕状态枚举
 */
export enum DanmakuStatus {
  /** 等待显示 */
  PENDING = 'pending',
  /** 正在显示 */
  SHOWING = 'showing',
  /** 已完成 */
  COMPLETED = 'completed',
  /** 已过滤 */
  FILTERED = 'filtered',
  /** 已屏蔽 */
  BLOCKED = 'blocked'
}

/**
 * 弹幕数据接口
 */
export interface DanmakuData {
  /** 弹幕ID */
  id: string
  /** 弹幕内容 */
  text: string
  /** 弹幕类型 */
  type: DanmakuType
  /** 出现时间 (秒) */
  time: number
  /** 弹幕颜色 */
  color?: string
  /** 字体大小 */
  fontSize?: number
  /** 弹幕优先级 */
  priority?: DanmakuPriority
  /** 用户ID */
  userId?: string
  /** 用户名 */
  username?: string
  /** 用户等级 */
  userLevel?: number
  /** 是否为VIP */
  isVip?: boolean
  /** 是否为管理员 */
  isAdmin?: boolean
  /** 弹幕权重 */
  weight?: number
  /** 自定义样式 */
  style?: Partial<CSSStyleDeclaration>
  /** 扩展数据 */
  extra?: Record<string, any>
}

/**
 * 弹幕样式配置
 */
export interface DanmakuStyle {
  /** 字体族 */
  fontFamily?: string
  /** 字体大小 */
  fontSize?: number
  /** 字体粗细 */
  fontWeight?: string | number
  /** 字体颜色 */
  color?: string
  /** 描边颜色 */
  strokeColor?: string
  /** 描边宽度 */
  strokeWidth?: number
  /** 阴影颜色 */
  shadowColor?: string
  /** 阴影偏移X */
  shadowOffsetX?: number
  /** 阴影偏移Y */
  shadowOffsetY?: number
  /** 阴影模糊半径 */
  shadowBlur?: number
  /** 透明度 */
  opacity?: number
  /** 行高 */
  lineHeight?: number
  /** 字间距 */
  letterSpacing?: number
  /** 背景色 */
  backgroundColor?: string
  /** 背景透明度 */
  backgroundOpacity?: number
  /** 边框颜色 */
  borderColor?: string
  /** 边框宽度 */
  borderWidth?: number
  /** 圆角半径 */
  borderRadius?: number
  /** 内边距 */
  padding?: string | number
}

/**
 * 弹幕轨道配置
 */
export interface DanmakuTrack {
  /** 轨道ID */
  id: string
  /** 轨道类型 */
  type: DanmakuType
  /** 轨道高度 */
  height: number
  /** 轨道Y位置 */
  y: number
  /** 是否被占用 */
  occupied: boolean
  /** 占用结束时间 */
  occupiedUntil: number
  /** 轨道容量 */
  capacity: number
  /** 当前弹幕数量 */
  currentCount: number
}

/**
 * 弹幕配置选项
 */
export interface DanmakuOptions {
  /** 是否启用弹幕 */
  enabled?: boolean
  /** 弹幕透明度 */
  opacity?: number
  /** 弹幕速度 */
  speed?: number
  /** 弹幕密度 */
  density?: number
  /** 弹幕模式 */
  mode?: DanmakuMode
  /** 字体大小缩放 */
  fontScale?: number
  /** 显示区域 */
  displayArea?: {
    top?: number
    bottom?: number
    left?: number
    right?: number
  }
  /** 轨道配置 */
  tracks?: {
    /** 滚动弹幕轨道数 */
    scroll?: number
    /** 顶部弹幕轨道数 */
    top?: number
    /** 底部弹幕轨道数 */
    bottom?: number
  }
  /** 过滤配置 */
  filter?: {
    /** 是否过滤重复弹幕 */
    duplicate?: boolean
    /** 是否过滤长弹幕 */
    longText?: boolean
    /** 最大文本长度 */
    maxTextLength?: number
    /** 关键词过滤 */
    keywords?: string[]
    /** 用户黑名单 */
    blockedUsers?: string[]
    /** 正则表达式过滤 */
    regex?: RegExp[]
  }
  /** 碰撞检测 */
  collision?: {
    /** 是否启用碰撞检测 */
    enabled?: boolean
    /** 碰撞检测精度 */
    precision?: 'low' | 'medium' | 'high'
    /** 最小间距 */
    minGap?: number
  }
  /** 性能配置 */
  performance?: {
    /** 最大同时显示数量 */
    maxConcurrent?: number
    /** 渲染帧率 */
    fps?: number
    /** 是否使用GPU加速 */
    useGPU?: boolean
    /** 是否使用Web Workers */
    useWorker?: boolean
  }
  /** 样式配置 */
  style?: DanmakuStyle
  /** 自定义渲染器 */
  renderer?: 'canvas' | 'css' | 'webgl' | 'custom'
}

/**
 * 弹幕实例接口
 */
export interface IDanmaku {
  /** 弹幕数据 */
  readonly data: DanmakuData
  /** 弹幕状态 */
  readonly status: DanmakuStatus
  /** DOM元素 */
  readonly element: HTMLElement | null
  /** 当前位置 */
  readonly position: { x: number; y: number }
  /** 弹幕尺寸 */
  readonly size: { width: number; height: number }

  /** 显示弹幕 */
  show(): void
  /** 隐藏弹幕 */
  hide(): void
  /** 暂停弹幕 */
  pause(): void
  /** 恢复弹幕 */
  resume(): void
  /** 销毁弹幕 */
  destroy(): void
  /** 更新位置 */
  updatePosition(x: number, y: number): void
  /** 更新样式 */
  updateStyle(style: Partial<DanmakuStyle>): void
  /** 检查碰撞 */
  checkCollision(other: IDanmaku): boolean
}

/**
 * 弹幕管理器接口
 */
export interface IDanmakuManager {
  /** 弹幕配置 */
  readonly options: DanmakuOptions
  /** 当前弹幕列表 */
  readonly danmakus: IDanmaku[]
  /** 轨道列表 */
  readonly tracks: DanmakuTrack[]
  /** 是否正在播放 */
  readonly isPlaying: boolean

  /** 添加弹幕 */
  add(data: DanmakuData | DanmakuData[]): void
  /** 移除弹幕 */
  remove(id: string): void
  /** 清空弹幕 */
  clear(): void
  /** 开始播放 */
  play(): void
  /** 暂停播放 */
  pause(): void
  /** 停止播放 */
  stop(): void
  /** 跳转到指定时间 */
  seek(time: number): void
  /** 更新配置 */
  updateOptions(options: Partial<DanmakuOptions>): void
  /** 获取指定时间的弹幕 */
  getDanmakusAtTime(time: number): IDanmaku[]
  /** 过滤弹幕 */
  filter(predicate: (danmaku: IDanmaku) => boolean): IDanmaku[]
  /** 发送弹幕 */
  send(text: string, options?: Partial<DanmakuData>): Promise<void>
  /** 加载弹幕数据 */
  load(data: DanmakuData[]): Promise<void>
  /** 导出弹幕数据 */
  export(): DanmakuData[]
  /** 重置轨道 */
  resetTracks(): void
  /** 获取可用轨道 */
  getAvailableTrack(type: DanmakuType): DanmakuTrack | null
}

/**
 * 弹幕渲染器接口
 */
export interface IDanmakuRenderer {
  /** 渲染器类型 */
  readonly type: string
  /** 画布元素 */
  readonly canvas: HTMLCanvasElement | HTMLElement
  /** 是否支持GPU加速 */
  readonly supportsGPU: boolean

  /** 初始化渲染器 */
  initialize(container: HTMLElement): void
  /** 销毁渲染器 */
  destroy(): void
  /** 渲染弹幕 */
  render(danmaku: IDanmaku): void
  /** 清除弹幕 */
  clear(danmaku?: IDanmaku): void
  /** 更新画布大小 */
  resize(width: number, height: number): void
  /** 设置透明度 */
  setOpacity(opacity: number): void
}

/**
 * 弹幕事件类型
 */
export enum DanmakuEvent {
  /** 弹幕添加 */
  ADD = 'danmaku:add',
  /** 弹幕移除 */
  REMOVE = 'danmaku:remove',
  /** 弹幕显示 */
  SHOW = 'danmaku:show',
  /** 弹幕隐藏 */
  HIDE = 'danmaku:hide',
  /** 弹幕点击 */
  CLICK = 'danmaku:click',
  /** 弹幕发送 */
  SEND = 'danmaku:send',
  /** 弹幕加载 */
  LOAD = 'danmaku:load',
  /** 弹幕清空 */
  CLEAR = 'danmaku:clear',
  /** 配置更新 */
  OPTIONS_UPDATE = 'danmaku:optionsUpdate'
}

/**
 * 弹幕过滤器接口
 */
export interface IDanmakuFilter {
  /** 过滤器名称 */
  readonly name: string
  /** 过滤器优先级 */
  readonly priority: number

  /** 过滤弹幕 */
  filter(danmaku: DanmakuData): boolean
  /** 更新过滤规则 */
  updateRules(rules: any): void
}

/**
 * 弹幕池接口
 */
export interface IDanmakuPool {
  /** 池大小 */
  readonly size: number
  /** 可用对象数量 */
  readonly available: number

  /** 获取弹幕对象 */
  acquire(): IDanmaku
  /** 释放弹幕对象 */
  release(danmaku: IDanmaku): void
  /** 清空池 */
  clear(): void
  /** 预热池 */
  warm(count: number): void
}
