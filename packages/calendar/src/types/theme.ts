/**
 * 主题系统相关的类型定义
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

  /** 背景色 */
  background?: string

  /** 表面色 */
  surface?: string

  /** 文本色 */
  text?: string

  /** 次要文本色 */
  textSecondary?: string

  /** 边框色 */
  border?: string

  /** 分割线色 */
  divider?: string

  /** 禁用色 */
  disabled?: string

  /** 悬停色 */
  hover?: string

  /** 激活色 */
  active?: string

  /** 选中色 */
  selected?: string

  /** 焦点色 */
  focus?: string
}

/**
 * 字体配置
 */
export interface FontConfig {
  /** 字体族 */
  family?: string

  /** 基础字体大小 */
  size?: string

  /** 小字体大小 */
  sizeSmall?: string

  /** 大字体大小 */
  sizeLarge?: string

  /** 标题字体大小 */
  sizeTitle?: string

  /** 字体粗细 */
  weight?: string | number

  /** 粗体字体粗细 */
  weightBold?: string | number

  /** 行高 */
  lineHeight?: string | number

  /** 字母间距 */
  letterSpacing?: string
}

/**
 * 间距配置
 */
export interface SpacingConfig {
  /** 超小间距 */
  xs?: string

  /** 小间距 */
  sm?: string

  /** 中等间距 */
  md?: string

  /** 大间距 */
  lg?: string

  /** 超大间距 */
  xl?: string

  /** 超超大间距 */
  xxl?: string
}

/**
 * 圆角配置
 */
export interface BorderRadiusConfig {
  /** 无圆角 */
  none?: string

  /** 小圆角 */
  sm?: string

  /** 中等圆角 */
  md?: string

  /** 大圆角 */
  lg?: string

  /** 圆形 */
  full?: string
}

/**
 * 阴影配置
 */
export interface ShadowConfig {
  /** 无阴影 */
  none?: string

  /** 小阴影 */
  sm?: string

  /** 中等阴影 */
  md?: string

  /** 大阴影 */
  lg?: string

  /** 超大阴影 */
  xl?: string
}

/**
 * 动画配置
 */
export interface AnimationConfig {
  /** 动画持续时间 */
  duration?: {
    fast?: string
    normal?: string
    slow?: string
  }

  /** 动画缓动函数 */
  easing?: {
    linear?: string
    ease?: string
    easeIn?: string
    easeOut?: string
    easeInOut?: string
  }
}

/**
 * 日历特定的主题配置
 */
export interface CalendarThemeConfig {
  /** 日历网格 */
  grid?: {
    /** 网格线颜色 */
    lineColor?: string

    /** 网格线宽度 */
    lineWidth?: string

    /** 网格背景色 */
    backgroundColor?: string
  }

  /** 日期单元格 */
  dateCell?: {
    /** 默认背景色 */
    backgroundColor?: string

    /** 悬停背景色 */
    hoverBackgroundColor?: string

    /** 选中背景色 */
    selectedBackgroundColor?: string

    /** 今天背景色 */
    todayBackgroundColor?: string

    /** 其他月份日期颜色 */
    otherMonthColor?: string

    /** 周末颜色 */
    weekendColor?: string

    /** 节假日颜色 */
    holidayColor?: string
  }

  /** 事件样式 */
  event?: {
    /** 默认背景色 */
    backgroundColor?: string

    /** 默认文本色 */
    textColor?: string

    /** 默认边框色 */
    borderColor?: string

    /** 边框宽度 */
    borderWidth?: string

    /** 圆角 */
    borderRadius?: string

    /** 内边距 */
    padding?: string

    /** 外边距 */
    margin?: string

    /** 字体大小 */
    fontSize?: string

    /** 最小高度 */
    minHeight?: string
  }

  /** 时间轴 */
  timeAxis?: {
    /** 背景色 */
    backgroundColor?: string

    /** 文本色 */
    textColor?: string

    /** 边框色 */
    borderColor?: string

    /** 宽度 */
    width?: string

    /** 字体大小 */
    fontSize?: string
  }

  /** 头部 */
  header?: {
    /** 背景色 */
    backgroundColor?: string

    /** 文本色 */
    textColor?: string

    /** 边框色 */
    borderColor?: string

    /** 高度 */
    height?: string

    /** 字体大小 */
    fontSize?: string

    /** 字体粗细 */
    fontWeight?: string
  }

  /** 农历 */
  lunar?: {
    /** 文本色 */
    textColor?: string

    /** 字体大小 */
    fontSize?: string

    /** 节日颜色 */
    festivalColor?: string
  }

  /** 节假日 */
  holiday?: {
    /** 文本色 */
    textColor?: string

    /** 背景色 */
    backgroundColor?: string

    /** 标记颜色 */
    markColor?: string
  }
}

/**
 * 完整的主题配置
 */
export interface CalendarTheme {
  /** 主题名称 */
  name: string

  /** 主题显示名称 */
  displayName?: string

  /** 主题描述 */
  description?: string

  /** 主题版本 */
  version?: string

  /** 主题作者 */
  author?: string

  /** 是否为暗色主题 */
  dark?: boolean

  /** 颜色配置 */
  colors: ColorConfig

  /** 字体配置 */
  fonts?: FontConfig

  /** 间距配置 */
  spacing?: SpacingConfig

  /** 圆角配置 */
  borderRadius?: BorderRadiusConfig

  /** 阴影配置 */
  shadows?: ShadowConfig

  /** 动画配置 */
  animations?: AnimationConfig

  /** 日历特定配置 */
  calendar?: CalendarThemeConfig

  /** 自定义CSS变量 */
  customVariables?: Record<string, string>

  /** 自定义CSS */
  customCSS?: string
}

/**
 * 主题管理器接口
 */
export interface IThemeManager {
  /** 注册主题 */
  register(theme: CalendarTheme): void

  /** 卸载主题 */
  unregister(themeName: string): void

  /** 应用主题 */
  apply(themeName: string): void

  /** 获取当前主题 */
  getCurrent(): CalendarTheme | null

  /** 获取主题 */
  get(themeName: string): CalendarTheme | null

  /** 获取所有主题 */
  getAll(): CalendarTheme[]

  /** 检查主题是否存在 */
  has(themeName: string): boolean

  /** 创建自定义主题 */
  create(baseTheme: string, customConfig: Partial<CalendarTheme>): CalendarTheme

  /** 导出主题 */
  export(themeName: string): string

  /** 导入主题 */
  import(themeData: string): CalendarTheme

  /** 重置为默认主题 */
  reset(): void

  /** 销毁主题管理器 */
  destroy(): void

  /** 添加事件监听器 */
  on(event: string, callback: (data?: any) => void): void

  /** 移除事件监听器 */
  off(event: string, callback?: (data?: any) => void): void

  /** 触发事件 */
  emit(event: string, data?: any): void
}

/**
 * 主题事件
 */
export interface ThemeEvent {
  /** 事件类型 */
  type: 'register' | 'unregister' | 'apply' | 'change'

  /** 主题名称 */
  themeName: string

  /** 之前的主题名称（仅在change事件中） */
  previousTheme?: string

  /** 事件时间戳 */
  timestamp: number
}

/**
 * 内置主题类型
 */
export type BuiltinThemeType =
  | 'default'
  | 'dark'
  | 'light'
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'red'
  | 'minimal'
  | 'classic'
  | 'modern'

/**
 * 主题变量映射
 */
export interface ThemeVariables {
  /** CSS变量名到值的映射 */
  [key: string]: string
}

/**
 * 主题颜色配置（向后兼容）
 */
export type ThemeColors = ColorConfig

/**
 * 主题字体配置（向后兼容）
 */
export type ThemeFonts = FontConfig

/**
 * 主题间距配置（向后兼容）
 */
export type ThemeSpacing = SpacingConfig

/**
 * 主题边框圆角配置（向后兼容）
 */
export type ThemeBorderRadius = BorderRadiusConfig

/**
 * 主题阴影配置（向后兼容）
 */
export type ThemeShadows = ShadowConfig

/**
 * 主题动画配置（向后兼容）
 */
export type ThemeAnimations = AnimationConfig

/**
 * 主题日历配置（向后兼容）
 */
export type ThemeCalendarConfig = CalendarThemeConfig

/**
 * 主题构建器接口
 */
export interface IThemeBuilder {
  /** 设置基础主题 */
  base(themeName: string): IThemeBuilder

  /** 设置颜色 */
  colors(colors: Partial<ColorConfig>): IThemeBuilder

  /** 设置字体 */
  fonts(fonts: Partial<FontConfig>): IThemeBuilder

  /** 设置间距 */
  spacing(spacing: Partial<SpacingConfig>): IThemeBuilder

  /** 设置圆角 */
  borderRadius(borderRadius: Partial<BorderRadiusConfig>): IThemeBuilder

  /** 设置阴影 */
  shadows(shadows: Partial<ShadowConfig>): IThemeBuilder

  /** 设置动画 */
  animations(animations: Partial<AnimationConfig>): IThemeBuilder

  /** 设置日历特定配置 */
  calendar(calendar: Partial<CalendarThemeConfig>): IThemeBuilder

  /** 设置自定义变量 */
  variables(variables: Record<string, string>): IThemeBuilder

  /** 设置自定义CSS */
  css(css: string): IThemeBuilder

  /** 构建主题 */
  build(): CalendarTheme
}
