/**
 * @ldesign/cropper 主题类型定义
 * 
 * 定义主题系统相关的所有类型接口
 */

// ============================================================================
// 基础主题类型
// ============================================================================

/**
 * 主题名称类型
 */
export type CropperTheme = 'light' | 'dark' | 'high-contrast' | string;

/**
 * 颜色配置接口
 */
export interface ThemeColors {
  // 主要颜色
  /** 主色 */
  primary: string;
  /** 主色悬停态 */
  primaryHover: string;
  /** 主色激活态 */
  primaryActive: string;
  /** 主色禁用态 */
  primaryDisabled: string;

  // 背景颜色
  /** 页面背景色 */
  background: string;
  /** 表面背景色 */
  surface: string;
  /** 表面悬停背景色 */
  surfaceHover: string;

  // 文本颜色
  /** 主要文本色 */
  textPrimary: string;
  /** 次要文本色 */
  textSecondary: string;
  /** 禁用文本色 */
  textDisabled: string;

  // 边框颜色
  /** 边框色 */
  border: string;
  /** 边框悬停色 */
  borderHover: string;
  /** 边框聚焦色 */
  borderFocus: string;

  // 状态颜色
  /** 成功色 */
  success: string;
  /** 警告色 */
  warning: string;
  /** 错误色 */
  error: string;

  // 裁剪器特定颜色
  /** 裁剪区域背景色 */
  cropArea: string;
  /** 裁剪区域边框色 */
  cropBorder: string;
  /** 控制点颜色 */
  controlPoint: string;
  /** 控制点悬停色 */
  controlPointHover: string;
  /** 网格线颜色 */
  grid: string;
  /** 遮罩颜色 */
  mask: string;
}

/**
 * 间距配置接口
 */
export interface ThemeSpacing {
  /** 超小间距 */
  xs: string;
  /** 小间距 */
  sm: string;
  /** 基础间距 */
  base: string;
  /** 大间距 */
  lg: string;
  /** 超大间距 */
  xl: string;
  /** 特大间距 */
  xxl: string;
}

/**
 * 圆角配置接口
 */
export interface ThemeBorderRadius {
  /** 无圆角 */
  none: string;
  /** 小圆角 */
  sm: string;
  /** 基础圆角 */
  base: string;
  /** 大圆角 */
  lg: string;
  /** 超大圆角 */
  xl: string;
  /** 完全圆角 */
  full: string;
}

/**
 * 阴影配置接口
 */
export interface ThemeShadows {
  /** 无阴影 */
  none: string;
  /** 小阴影 */
  sm: string;
  /** 基础阴影 */
  base: string;
  /** 大阴影 */
  lg: string;
  /** 超大阴影 */
  xl: string;
}

/**
 * 字体大小配置接口
 */
export interface ThemeFontSize {
  /** 超小字体 */
  xs: string;
  /** 小字体 */
  sm: string;
  /** 基础字体 */
  base: string;
  /** 大字体 */
  lg: string;
  /** 超大字体 */
  xl: string;
  /** 特大字体 */
  xxl: string;
}

/**
 * 字体粗细配置接口
 */
export interface ThemeFontWeight {
  /** 正常粗细 */
  normal: string;
  /** 中等粗细 */
  medium: string;
  /** 半粗体 */
  semibold: string;
  /** 粗体 */
  bold: string;
}

/**
 * 行高配置接口
 */
export interface ThemeLineHeight {
  /** 紧凑行高 */
  tight: string;
  /** 正常行高 */
  normal: string;
  /** 宽松行高 */
  relaxed: string;
}

/**
 * 字体配置接口
 */
export interface ThemeTypography {
  /** 字体族 */
  fontFamily: string;
  /** 字体大小 */
  fontSize: ThemeFontSize;
  /** 字体粗细 */
  fontWeight: ThemeFontWeight;
  /** 行高 */
  lineHeight: ThemeLineHeight;
}

/**
 * 动画持续时间配置接口
 */
export interface ThemeAnimationDuration {
  /** 快速动画 */
  fast: string;
  /** 正常动画 */
  normal: string;
  /** 慢速动画 */
  slow: string;
}

/**
 * 动画缓动配置接口
 */
export interface ThemeAnimationEasing {
  /** 线性 */
  linear: string;
  /** 缓动 */
  ease: string;
  /** 缓入 */
  easeIn: string;
  /** 缓出 */
  easeOut: string;
  /** 缓入缓出 */
  easeInOut: string;
}

/**
 * 动画配置接口
 */
export interface ThemeAnimation {
  /** 动画持续时间 */
  duration: ThemeAnimationDuration;
  /** 动画缓动 */
  easing: ThemeAnimationEasing;
}

// ============================================================================
// 主题配置接口
// ============================================================================

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  /** 主题名称 */
  name: string;
  /** 主题显示名称 */
  displayName: string;
  /** 主题描述 */
  description?: string;
  /** 颜色配置 */
  colors: ThemeColors;
  /** 间距配置 */
  spacing: ThemeSpacing;
  /** 圆角配置 */
  borderRadius: ThemeBorderRadius;
  /** 阴影配置 */
  shadows: ThemeShadows;
  /** 字体配置 */
  typography: ThemeTypography;
  /** 动画配置 */
  animation: ThemeAnimation;
}

/**
 * 主题变量映射接口
 */
export interface ThemeVariables {
  /** CSS变量映射 */
  [key: string]: string;
}

/**
 * 主题上下文接口
 */
export interface ThemeContext {
  /** 当前主题 */
  currentTheme: string;
  /** 主题配置 */
  themeConfig: ThemeConfig;
  /** 设置主题 */
  setTheme: (theme: string) => void;
  /** 获取主题变量 */
  getThemeVariable: (key: string) => string;
  /** 注册主题 */
  registerTheme: (theme: ThemeConfig) => void;
}

// ============================================================================
// 主题预设类型
// ============================================================================

/**
 * 主题预设接口
 */
export interface ThemePreset {
  /** 预设名称 */
  name: string;
  /** 预设显示名称 */
  displayName: string;
  /** 预设描述 */
  description?: string;
  /** 预设配置 */
  config: Partial<ThemeConfig>;
}

/**
 * 主题预设集合接口
 */
export interface ThemePresets {
  /** 预设映射 */
  [key: string]: ThemePreset;
}

// ============================================================================
// 主题工具类型
// ============================================================================

/**
 * 颜色工具类型
 */
export type ColorValue = string;

/**
 * 尺寸工具类型
 */
export type SizeValue = string | number;

/**
 * 主题变量键类型
 */
export type ThemeVariableKey = 
  | `color-${keyof ThemeColors}`
  | `spacing-${keyof ThemeSpacing}`
  | `border-radius-${keyof ThemeBorderRadius}`
  | `shadow-${keyof ThemeShadows}`
  | `font-size-${keyof ThemeFontSize}`
  | `font-weight-${keyof ThemeFontWeight}`
  | `line-height-${keyof ThemeLineHeight}`
  | `duration-${keyof ThemeAnimationDuration}`
  | `easing-${keyof ThemeAnimationEasing}`;

/**
 * 主题变更回调类型
 */
export type ThemeChangeCallback = (theme: string, config: ThemeConfig) => void;

/**
 * 主题验证器类型
 */
export type ThemeValidator = (config: ThemeConfig) => boolean;

/**
 * 主题转换器类型
 */
export type ThemeTransformer = (config: ThemeConfig) => ThemeConfig;
