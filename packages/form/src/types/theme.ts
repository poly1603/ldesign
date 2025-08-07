// 主题相关类型定义

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 主题名称 */
  name?: string

  /** 主题类型 */
  type?: ThemeType

  /** 颜色配置 */
  colors?: ColorConfig

  /** 字体配置 */
  typography?: TypographyConfig

  /** 间距配置 */
  spacing?: SpacingConfig

  /** 边框配置 */
  border?: BorderConfig

  /** 阴影配置 */
  shadow?: ShadowConfig

  /** 动画配置 */
  animation?: AnimationConfig

  /** 组件样式配置 */
  components?: ComponentThemeConfig

  /** 自定义CSS变量 */
  cssVars?: Record<string, string>
}

/**
 * 主题类型
 */
export type ThemeType = 'light' | 'dark' | 'auto'

/**
 * 颜色配置
 */
export interface ColorConfig {
  /** 主色 */
  primary?: string

  /** 成功色 */
  success?: string

  /** 警告色 */
  warning?: string

  /** 错误色 */
  error?: string

  /** 信息色 */
  info?: string

  /** 文本颜色 */
  text?: TextColorConfig

  /** 背景颜色 */
  background?: BackgroundColorConfig

  /** 边框颜色 */
  border?: BorderColorConfig
}

/**
 * 文本颜色配置
 */
export interface TextColorConfig {
  /** 主要文本 */
  primary?: string

  /** 次要文本 */
  secondary?: string

  /** 禁用文本 */
  disabled?: string

  /** 占位符文本 */
  placeholder?: string

  /** 链接文本 */
  link?: string
}

/**
 * 背景颜色配置
 */
export interface BackgroundColorConfig {
  /** 主背景 */
  primary?: string

  /** 次背景 */
  secondary?: string

  /** 悬停背景 */
  hover?: string

  /** 激活背景 */
  active?: string

  /** 禁用背景 */
  disabled?: string
}

/**
 * 边框颜色配置
 */
export interface BorderColorConfig {
  /** 默认边框 */
  default?: string

  /** 悬停边框 */
  hover?: string

  /** 激活边框 */
  active?: string

  /** 错误边框 */
  error?: string

  /** 成功边框 */
  success?: string
}

/**
 * 字体配置
 */
export interface TypographyConfig {
  /** 字体族 */
  fontFamily?: string

  /** 字体大小 */
  fontSize?: FontSizeConfig

  /** 字体粗细 */
  fontWeight?: FontWeightConfig

  /** 行高 */
  lineHeight?: LineHeightConfig

  /** 字间距 */
  letterSpacing?: string
}

/**
 * 字体大小配置
 */
export interface FontSizeConfig {
  /** 超小字体 */
  xs?: string

  /** 小字体 */
  sm?: string

  /** 默认字体 */
  base?: string

  /** 大字体 */
  lg?: string

  /** 超大字体 */
  xl?: string

  /** 特大字体 */
  xxl?: string
}

/**
 * 字体粗细配置
 */
export interface FontWeightConfig {
  /** 细体 */
  light?: number

  /** 正常 */
  normal?: number

  /** 中等 */
  medium?: number

  /** 粗体 */
  bold?: number
}

/**
 * 行高配置
 */
export interface LineHeightConfig {
  /** 紧密 */
  tight?: number

  /** 正常 */
  normal?: number

  /** 宽松 */
  loose?: number
}

/**
 * 间距配置
 */
export interface SpacingConfig {
  /** 超小间距 */
  xs?: string

  /** 小间距 */
  sm?: string

  /** 默认间距 */
  base?: string

  /** 大间距 */
  lg?: string

  /** 超大间距 */
  xl?: string

  /** 特大间距 */
  xxl?: string
}

/**
 * 边框配置
 */
export interface BorderConfig {
  /** 边框宽度 */
  width?: string

  /** 边框样式 */
  style?: string

  /** 边框圆角 */
  radius?: BorderRadiusConfig
}

/**
 * 边框圆角配置
 */
export interface BorderRadiusConfig {
  /** 无圆角 */
  none?: string

  /** 小圆角 */
  sm?: string

  /** 默认圆角 */
  base?: string

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

  /** 默认阴影 */
  base?: string

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
  duration?: AnimationDurationConfig

  /** 动画缓动函数 */
  easing?: AnimationEasingConfig

  /** 是否启用动画 */
  enabled?: boolean
}

/**
 * 动画持续时间配置
 */
export interface AnimationDurationConfig {
  /** 快速 */
  fast?: string

  /** 正常 */
  normal?: string

  /** 慢速 */
  slow?: string
}

/**
 * 动画缓动函数配置
 */
export interface AnimationEasingConfig {
  /** 线性 */
  linear?: string

  /** 缓入 */
  easeIn?: string

  /** 缓出 */
  easeOut?: string

  /** 缓入缓出 */
  easeInOut?: string
}

/**
 * 组件主题配置
 */
export interface ComponentThemeConfig {
  /** 表单组件 */
  form?: FormThemeConfig

  /** 输入框组件 */
  input?: InputThemeConfig

  /** 按钮组件 */
  button?: ButtonThemeConfig

  /** 选择器组件 */
  select?: SelectThemeConfig
}

/**
 * 表单主题配置
 */
export interface FormThemeConfig {
  /** 表单背景 */
  background?: string

  /** 表单边框 */
  border?: string

  /** 表单圆角 */
  borderRadius?: string

  /** 表单内边距 */
  padding?: string

  /** 标签样式 */
  label?: LabelThemeConfig
}

/**
 * 标签主题配置
 */
export interface LabelThemeConfig {
  /** 标签颜色 */
  color?: string

  /** 标签字体大小 */
  fontSize?: string

  /** 标签字体粗细 */
  fontWeight?: number

  /** 标签间距 */
  margin?: string
}

/**
 * 输入框主题配置
 */
export interface InputThemeConfig {
  /** 输入框背景 */
  background?: string

  /** 输入框边框 */
  border?: string

  /** 输入框圆角 */
  borderRadius?: string

  /** 输入框内边距 */
  padding?: string

  /** 输入框高度 */
  height?: string

  /** 聚焦样式 */
  focus?: {
    border?: string
    boxShadow?: string
  }

  /** 错误样式 */
  error?: {
    border?: string
    color?: string
  }
}

/**
 * 按钮主题配置
 */
export interface ButtonThemeConfig {
  /** 按钮背景 */
  background?: string

  /** 按钮边框 */
  border?: string

  /** 按钮圆角 */
  borderRadius?: string

  /** 按钮内边距 */
  padding?: string

  /** 按钮高度 */
  height?: string

  /** 按钮颜色 */
  color?: string

  /** 悬停样式 */
  hover?: {
    background?: string
    border?: string
    color?: string
  }

  /** 激活样式 */
  active?: {
    background?: string
    border?: string
    color?: string
  }
}

/**
 * 选择器主题配置
 */
export interface SelectThemeConfig {
  /** 选择器背景 */
  background?: string

  /** 选择器边框 */
  border?: string

  /** 选择器圆角 */
  borderRadius?: string

  /** 选择器内边距 */
  padding?: string

  /** 选择器高度 */
  height?: string

  /** 下拉框样式 */
  dropdown?: {
    background?: string
    border?: string
    borderRadius?: string
    boxShadow?: string
  }

  /** 选项样式 */
  option?: {
    background?: string
    color?: string
    hover?: {
      background?: string
      color?: string
    }
    selected?: {
      background?: string
      color?: string
    }
  }
}

/**
 * 主题管理器接口
 */
export interface ThemeManager {
  /** 设置主题 */
  setTheme(theme: ThemeConfig): void

  /** 获取当前主题 */
  getTheme(): ThemeConfig

  /** 切换主题类型 */
  toggleTheme(): void

  /** 注册主题 */
  registerTheme(name: string, theme: ThemeConfig): void

  /** 获取注册的主题 */
  getRegisteredTheme(name: string): ThemeConfig | undefined

  /** 应用CSS变量 */
  applyCssVars(vars: Record<string, string>): void

  /** 移除CSS变量 */
  removeCssVars(keys: string[]): void
}
