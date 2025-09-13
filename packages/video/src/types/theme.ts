/**
 * 主题系统类型定义
 * 定义主题的结构、样式配置和管理机制
 */

/**
 * 颜色配置
 */
export interface ColorConfig {
  /** 主色调 */
  primary?: string
  /** 次要色调 */
  secondary?: string
  /** 成功色 */
  success?: string
  /** 警告色 */
  warning?: string
  /** 错误色 */
  error?: string
  /** 信息色 */
  info?: string
  /** 文本颜色 */
  text?: {
    primary?: string
    secondary?: string
    disabled?: string
    inverse?: string
  }
  /** 背景颜色 */
  background?: {
    primary?: string
    secondary?: string
    overlay?: string
    modal?: string
  }
  /** 边框颜色 */
  border?: {
    primary?: string
    secondary?: string
    focus?: string
    hover?: string
  }
}

/**
 * 尺寸配置
 */
export interface SizeConfig {
  /** 字体大小 */
  fontSize?: {
    xs?: string
    sm?: string
    base?: string
    lg?: string
    xl?: string
    xxl?: string
  }
  /** 间距 */
  spacing?: {
    xs?: string
    sm?: string
    base?: string
    lg?: string
    xl?: string
    xxl?: string
  }
  /** 圆角 */
  borderRadius?: {
    none?: string
    sm?: string
    base?: string
    lg?: string
    full?: string
  }
  /** 阴影 */
  shadow?: {
    none?: string
    sm?: string
    base?: string
    lg?: string
    xl?: string
  }
}

/**
 * 控制栏样式配置
 */
export interface ControlBarStyle {
  /** 背景色 */
  background?: string
  /** 高度 */
  height?: string
  /** 内边距 */
  padding?: string
  /** 边框 */
  border?: string
  /** 圆角 */
  borderRadius?: string
  /** 阴影 */
  boxShadow?: string
  /** 透明度 */
  opacity?: number
  /** 模糊效果 */
  backdropFilter?: string
}

/**
 * 按钮样式配置
 */
export interface ButtonStyle {
  /** 默认状态 */
  default?: {
    background?: string
    color?: string
    border?: string
    borderRadius?: string
    padding?: string
    fontSize?: string
  }
  /** 悬停状态 */
  hover?: {
    background?: string
    color?: string
    border?: string
    transform?: string
    opacity?: number
  }
  /** 激活状态 */
  active?: {
    background?: string
    color?: string
    border?: string
    transform?: string
  }
  /** 禁用状态 */
  disabled?: {
    background?: string
    color?: string
    border?: string
    opacity?: number
    cursor?: string
  }
}

/**
 * 进度条样式配置
 */
export interface ProgressStyle {
  /** 轨道样式 */
  track?: {
    background?: string
    height?: string
    borderRadius?: string
  }
  /** 进度样式 */
  progress?: {
    background?: string
    borderRadius?: string
  }
  /** 缓冲样式 */
  buffer?: {
    background?: string
    borderRadius?: string
  }
  /** 拖拽手柄样式 */
  thumb?: {
    background?: string
    width?: string
    height?: string
    borderRadius?: string
    border?: string
    boxShadow?: string
  }
}

/**
 * 音量控制样式配置
 */
export interface VolumeStyle {
  /** 音量条样式 */
  slider?: ProgressStyle
  /** 音量图标样式 */
  icon?: {
    color?: string
    fontSize?: string
  }
  /** 音量面板样式 */
  panel?: {
    background?: string
    border?: string
    borderRadius?: string
    boxShadow?: string
    padding?: string
  }
}

/**
 * 全屏按钮样式配置
 */
export interface FullscreenStyle {
  /** 按钮样式 */
  button?: ButtonStyle
  /** 图标样式 */
  icon?: {
    color?: string
    fontSize?: string
  }
}

/**
 * 时间显示样式配置
 */
export interface TimeStyle {
  /** 文本颜色 */
  color?: string
  /** 字体大小 */
  fontSize?: string
  /** 字体粗细 */
  fontWeight?: string
  /** 字体族 */
  fontFamily?: string
  /** 分隔符样式 */
  separator?: {
    color?: string
    margin?: string
  }
}

/**
 * 加载器样式配置
 */
export interface LoaderStyle {
  /** 加载器颜色 */
  color?: string
  /** 加载器大小 */
  size?: string
  /** 背景色 */
  background?: string
  /** 动画持续时间 */
  duration?: string
}

/**
 * 错误提示样式配置
 */
export interface ErrorStyle {
  /** 背景色 */
  background?: string
  /** 文本颜色 */
  color?: string
  /** 字体大小 */
  fontSize?: string
  /** 内边距 */
  padding?: string
  /** 边框 */
  border?: string
  /** 圆角 */
  borderRadius?: string
  /** 图标样式 */
  icon?: {
    color?: string
    fontSize?: string
  }
}

/**
 * 主题样式配置
 */
export interface ThemeStyle {
  /** 颜色配置 */
  colors?: ColorConfig
  /** 尺寸配置 */
  sizes?: SizeConfig
  /** 控制栏样式 */
  controlBar?: ControlBarStyle
  /** 按钮样式 */
  button?: ButtonStyle
  /** 进度条样式 */
  progress?: ProgressStyle
  /** 音量控制样式 */
  volume?: VolumeStyle
  /** 全屏按钮样式 */
  fullscreen?: FullscreenStyle
  /** 时间显示样式 */
  time?: TimeStyle
  /** 加载器样式 */
  loader?: LoaderStyle
  /** 错误提示样式 */
  error?: ErrorStyle
  /** 自定义CSS变量 */
  cssVariables?: Record<string, string>
  /** 自定义CSS规则 */
  customCSS?: string
}

/**
 * 主题元数据
 */
export interface ThemeMetadata {
  /** 主题名称 */
  name: string
  /** 主题版本 */
  version: string
  /** 主题描述 */
  description?: string
  /** 主题作者 */
  author?: string
  /** 主题预览图 */
  preview?: string
  /** 主题标签 */
  tags?: string[]
  /** 是否为暗色主题 */
  dark?: boolean
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 主题元数据 */
  metadata: ThemeMetadata
  /** 主题样式 */
  style: ThemeStyle
  /** 主题资源 */
  assets?: {
    /** CSS文件 */
    css?: string[]
    /** 字体文件 */
    fonts?: string[]
    /** 图片文件 */
    images?: Record<string, string>
  }
}

/**
 * 主题接口
 */
export interface ITheme {
  /** 主题元数据 */
  readonly metadata: ThemeMetadata
  /** 主题样式 */
  readonly style: ThemeStyle

  /** 应用主题 */
  apply(container: HTMLElement): void
  /** 移除主题 */
  remove(container: HTMLElement): void
  /** 更新主题样式 */
  updateStyle(style: Partial<ThemeStyle>): void
  /** 获取CSS变量 */
  getCSSVariables(): Record<string, string>
  /** 生成CSS字符串 */
  generateCSS(): string
}

/**
 * 主题管理器接口
 */
export interface IThemeManager {
  /** 当前主题 */
  readonly currentTheme: ITheme | null
  /** 已注册的主题 */
  readonly themes: Map<string, ITheme>
  /** 播放器容器 */
  readonly container: HTMLElement

  /** 注册主题 */
  register(theme: ITheme | ThemeConfig): void
  /** 卸载主题 */
  unregister(name: string): void
  /** 应用主题 */
  apply(name: string): void
  /** 获取主题 */
  get(name: string): ITheme | undefined
  /** 获取所有主题 */
  getAll(): ITheme[]
  /** 检查主题是否存在 */
  has(name: string): boolean
  /** 获取当前主题名称 */
  getCurrentThemeName(): string | null
  /** 重置为默认主题 */
  reset(): void
  /** 清空所有主题 */
  clear(): void
}

/**
 * 主题构造函数接口
 */
export interface ThemeConstructor {
  new(config: ThemeConfig): ITheme
}

/**
 * 主题工厂函数
 */
export type ThemeFactory = (config: ThemeConfig) => ITheme

/**
 * 响应式主题配置
 */
export interface ResponsiveThemeConfig {
  /** 默认主题 */
  default: ThemeConfig
  /** 移动端主题 */
  mobile?: Partial<ThemeConfig>
  /** 平板端主题 */
  tablet?: Partial<ThemeConfig>
  /** 桌面端主题 */
  desktop?: Partial<ThemeConfig>
  /** 暗色模式主题 */
  dark?: Partial<ThemeConfig>
}

/**
 * 主题事件枚举
 */
export enum ThemeEvent {
  /** 主题注册 */
  THEME_REGISTERED = 'theme-registered',
  /** 主题移除 */
  THEME_REMOVED = 'theme-removed',
  /** 主题注销 */
  THEME_UNREGISTERED = 'theme-unregistered',
  /** 主题切换前 */
  BEFORE_THEME_CHANGE = 'before-theme-change',
  /** 主题切换后 */
  AFTER_THEME_CHANGE = 'after-theme-change',
  /** 主题应用 */
  THEME_APPLIED = 'theme-applied',
  /** 系统主题变化 */
  SYSTEM_THEME_CHANGED = 'system-theme-changed',
  /** 响应式断点变化 */
  BREAKPOINT_CHANGED = 'breakpoint-changed',
  /** 主题错误 */
  THEME_ERROR = 'theme-error'
}
