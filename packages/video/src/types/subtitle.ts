/**
 * 字幕系统类型定义
 * 定义字幕的数据结构、样式配置和管理机制
 */

/**
 * 字幕格式枚举
 */
export enum SubtitleFormat {
  /** SRT格式 */
  SRT = 'srt',
  /** VTT格式 */
  VTT = 'vtt',
  /** ASS格式 */
  ASS = 'ass',
  /** SSA格式 */
  SSA = 'ssa',
  /** TTML格式 */
  TTML = 'ttml',
  /** JSON格式 */
  JSON = 'json'
}

/**
 * 字幕类型枚举
 */
export enum SubtitleType {
  /** 普通字幕 */
  NORMAL = 'normal',
  /** 强制字幕 */
  FORCED = 'forced',
  /** 注释字幕 */
  COMMENTARY = 'commentary',
  /** 歌词字幕 */
  LYRICS = 'lyrics',
  /** 描述字幕 */
  DESCRIPTIONS = 'descriptions'
}

/**
 * 字幕对齐方式枚举
 */
export enum SubtitleAlignment {
  /** 左对齐 */
  LEFT = 'left',
  /** 居中对齐 */
  CENTER = 'center',
  /** 右对齐 */
  RIGHT = 'right',
  /** 两端对齐 */
  JUSTIFY = 'justify'
}

/**
 * 字幕位置枚举
 */
export enum SubtitlePosition {
  /** 顶部 */
  TOP = 'top',
  /** 中间 */
  MIDDLE = 'middle',
  /** 底部 */
  BOTTOM = 'bottom'
}

/**
 * 字幕条目接口
 */
export interface SubtitleCue {
  /** 字幕ID */
  id: string
  /** 开始时间 (秒) */
  startTime: number
  /** 结束时间 (秒) */
  endTime: number
  /** 字幕文本 */
  text: string
  /** 字幕类型 */
  type?: SubtitleType
  /** 字幕位置 */
  position?: SubtitlePosition
  /** 对齐方式 */
  alignment?: SubtitleAlignment
  /** 自定义样式 */
  style?: Partial<SubtitleStyle>
  /** 扩展数据 */
  metadata?: Record<string, any>
}

/**
 * 字幕样式配置
 */
export interface SubtitleStyle {
  /** 字体族 */
  fontFamily?: string
  /** 字体大小 */
  fontSize?: number | string
  /** 字体粗细 */
  fontWeight?: string | number
  /** 字体样式 */
  fontStyle?: 'normal' | 'italic' | 'oblique'
  /** 字体颜色 */
  color?: string
  /** 背景色 */
  backgroundColor?: string
  /** 背景透明度 */
  backgroundOpacity?: number
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
  lineHeight?: number | string
  /** 字间距 */
  letterSpacing?: number | string
  /** 词间距 */
  wordSpacing?: number | string
  /** 文本装饰 */
  textDecoration?: string
  /** 文本变换 */
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase'
  /** 边框颜色 */
  borderColor?: string
  /** 边框宽度 */
  borderWidth?: number
  /** 边框样式 */
  borderStyle?: string
  /** 圆角半径 */
  borderRadius?: number
  /** 内边距 */
  padding?: string | number
  /** 外边距 */
  margin?: string | number
  /** 最大宽度 */
  maxWidth?: string | number
  /** 最小宽度 */
  minWidth?: string | number
  /** 文本对齐 */
  textAlign?: SubtitleAlignment
  /** 垂直对齐 */
  verticalAlign?: 'top' | 'middle' | 'bottom' | 'baseline'
  /** 换行方式 */
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line'
  /** 文本溢出处理 */
  textOverflow?: 'clip' | 'ellipsis'
  /** 溢出处理 */
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto'
}

/**
 * 字幕轨道接口
 */
export interface SubtitleTrack {
  /** 轨道ID */
  id: string
  /** 轨道标签 */
  label: string
  /** 语言代码 */
  language: string
  /** 字幕格式 */
  format: SubtitleFormat
  /** 字幕源URL */
  src?: string
  /** 字幕数据 */
  cues?: SubtitleCue[]
  /** 是否为默认轨道 */
  default?: boolean
  /** 是否启用 */
  enabled?: boolean
  /** 字幕类型 */
  type?: SubtitleType
  /** 轨道样式 */
  style?: SubtitleStyle
  /** 轨道元数据 */
  metadata?: Record<string, any>
}

/**
 * 字幕配置选项
 */
export interface SubtitleOptions {
  /** 是否启用字幕 */
  enabled?: boolean
  /** 默认语言 */
  defaultLanguage?: string
  /** 字幕样式 */
  style?: SubtitleStyle
  /** 显示位置 */
  position?: SubtitlePosition
  /** 对齐方式 */
  alignment?: SubtitleAlignment
  /** 字体大小缩放 */
  fontScale?: number
  /** 透明度 */
  opacity?: number
  /** 显示区域 */
  displayArea?: {
    top?: number
    bottom?: number
    left?: number
    right?: number
  }
  /** 自动隐藏延迟 */
  autoHideDelay?: number
  /** 是否显示背景 */
  showBackground?: boolean
  /** 背景模糊 */
  backgroundBlur?: number
  /** 最大行数 */
  maxLines?: number
  /** 行间距 */
  lineSpacing?: number
  /** 渲染模式 */
  renderMode?: 'html' | 'canvas' | 'svg'
  /** 是否支持HTML标签 */
  allowHTML?: boolean
  /** 是否支持样式标签 */
  allowStyling?: boolean
  /** 字幕预加载 */
  preload?: boolean
  /** 缓存策略 */
  cache?: 'none' | 'memory' | 'storage'
}

/**
 * 字幕管理器接口
 */
export interface ISubtitleManager {
  /** 字幕配置 */
  readonly options: SubtitleOptions
  /** 字幕轨道列表 */
  readonly tracks: SubtitleTrack[]
  /** 当前激活轨道 */
  readonly activeTrack: SubtitleTrack | null
  /** 当前显示的字幕 */
  readonly currentCues: SubtitleCue[]
  /** 是否启用 */
  readonly enabled: boolean

  /** 添加字幕轨道 */
  addTrack(track: SubtitleTrack): void
  /** 移除字幕轨道 */
  removeTrack(id: string): void
  /** 切换字幕轨道 */
  switchTrack(id: string): void
  /** 获取字幕轨道 */
  getTrack(id: string): SubtitleTrack | undefined
  /** 获取所有轨道 */
  getTracks(): SubtitleTrack[]
  /** 启用字幕 */
  enable(): void
  /** 禁用字幕 */
  disable(): void
  /** 显示字幕 */
  show(): void
  /** 隐藏字幕 */
  hide(): void
  /** 更新时间 */
  updateTime(time: number): void
  /** 更新配置 */
  updateOptions(options: Partial<SubtitleOptions>): void
  /** 更新样式 */
  updateStyle(style: Partial<SubtitleStyle>): void
  /** 搜索字幕 */
  search(query: string): SubtitleCue[]
  /** 导出字幕 */
  export(format: SubtitleFormat): string
  /** 导入字幕 */
  import(data: string, format: SubtitleFormat): SubtitleTrack
  /** 清空字幕 */
  clear(): void
}

/**
 * 字幕解析器接口
 */
export interface ISubtitleParser {
  /** 支持的格式 */
  readonly supportedFormats: SubtitleFormat[]

  /** 解析字幕 */
  parse(data: string, format: SubtitleFormat): SubtitleCue[]
  /** 检测格式 */
  detectFormat(data: string): SubtitleFormat | null
  /** 验证格式 */
  validate(data: string, format: SubtitleFormat): boolean
}

/**
 * 字幕渲染器接口
 */
export interface ISubtitleRenderer {
  /** 渲染器类型 */
  readonly type: 'html' | 'canvas' | 'svg'
  /** 容器元素 */
  readonly container: HTMLElement

  /** 渲染字幕 */
  render(cues: SubtitleCue[], style: SubtitleStyle): void
  /** 清除字幕 */
  clear(): void
  /** 更新样式 */
  updateStyle(style: SubtitleStyle): void
  /** 调整大小 */
  resize(width: number, height: number): void
  /** 销毁渲染器 */
  destroy(): void
}

/**
 * 字幕事件类型
 */
export enum SubtitleEvent {
  /** 轨道添加 */
  TRACK_ADD = 'subtitle:trackAdd',
  /** 轨道移除 */
  TRACK_REMOVE = 'subtitle:trackRemove',
  /** 轨道切换 */
  TRACK_SWITCH = 'subtitle:trackSwitch',
  /** 字幕显示 */
  CUE_ENTER = 'subtitle:cueEnter',
  /** 字幕隐藏 */
  CUE_EXIT = 'subtitle:cueExit',
  /** 字幕更新 */
  CUE_UPDATE = 'subtitle:cueUpdate',
  /** 样式更新 */
  STYLE_UPDATE = 'subtitle:styleUpdate',
  /** 启用状态变化 */
  ENABLED_CHANGE = 'subtitle:enabledChange'
}

/**
 * 字幕加载器接口
 */
export interface ISubtitleLoader {
  /** 加载字幕 */
  load(src: string): Promise<SubtitleTrack>
  /** 预加载字幕 */
  preload(src: string): Promise<void>
  /** 取消加载 */
  cancel(src: string): void
  /** 清除缓存 */
  clearCache(): void
}

/**
 * 字幕搜索结果接口
 */
export interface SubtitleSearchResult {
  /** 匹配的字幕条目 */
  cue: SubtitleCue
  /** 匹配的文本片段 */
  matches: Array<{
    text: string
    start: number
    end: number
  }>
  /** 匹配得分 */
  score: number
}

/**
 * 字幕统计信息接口
 */
export interface SubtitleStats {
  /** 总字幕数 */
  totalCues: number
  /** 总时长 */
  totalDuration: number
  /** 平均字幕长度 */
  averageDuration: number
  /** 字符总数 */
  totalCharacters: number
  /** 单词总数 */
  totalWords: number
  /** 语言分布 */
  languageDistribution: Record<string, number>
  /** 类型分布 */
  typeDistribution: Record<SubtitleType, number>
}

/**
 * 字幕验证结果接口
 */
export interface SubtitleValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误列表 */
  errors: Array<{
    line: number
    message: string
    severity: 'error' | 'warning'
  }>
  /** 统计信息 */
  stats: SubtitleStats
}
