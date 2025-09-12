/**
 * 样式和主题相关类型定义
 */

/**
 * 地图主题类型
 */
export type MapTheme = 'default' | 'dark' | 'light' | string;

/**
 * 颜色配置接口
 */
export interface ColorConfig {
  /** 主色 */
  primary: string;
  /** 辅助色 */
  secondary: string;
  /** 背景色 */
  background: string;
  /** 表面色 */
  surface: string;
  /** 主文本色 */
  text: string;
  /** 次要文本色 */
  textSecondary: string;
  /** 边框色 */
  border: string;
  /** 成功色 */
  success: string;
  /** 警告色 */
  warning: string;
  /** 错误色 */
  error: string;
}

/**
 * 字体配置接口
 */
export interface FontConfig {
  /** 主字体 */
  primary: string;
  /** 辅助字体 */
  secondary: string;
}

/**
 * 尺寸配置接口
 */
export interface SizeConfig {
  /** 小尺寸 */
  small: number;
  /** 中等尺寸 */
  medium: number;
  /** 大尺寸 */
  large: number;
  /** 超大尺寸 */
  xlarge: number;
}

/**
 * 间距配置接口
 */
export interface SpacingConfig {
  /** 超小间距 */
  xs: number;
  /** 小间距 */
  sm: number;
  /** 中等间距 */
  md: number;
  /** 大间距 */
  lg: number;
  /** 超大间距 */
  xl: number;
}

/**
 * 圆角配置接口
 */
export interface BorderRadiusConfig {
  /** 小圆角 */
  small: number;
  /** 中等圆角 */
  medium: number;
  /** 大圆角 */
  large: number;
}

/**
 * 阴影配置接口
 */
export interface ShadowConfig {
  /** 小阴影 */
  small: string;
  /** 中等阴影 */
  medium: string;
  /** 大阴影 */
  large: string;
}

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  /** 主题名称 */
  name: string;
  /** 主题显示名称 */
  displayName: string;
  /** 颜色配置 */
  colors: ColorConfig;
  /** 字体配置 */
  fonts: FontConfig;
  /** 尺寸配置 */
  sizes: SizeConfig;
  /** 间距配置 */
  spacing: SpacingConfig;
  /** 圆角配置 */
  borderRadius: BorderRadiusConfig;
  /** 阴影配置 */
  shadows: ShadowConfig;
}

/**
 * 样式配置接口
 */
export interface StyleConfig {
  /** 主题 */
  theme?: MapTheme | ThemeConfig;
  /** 自定义CSS变量 */
  cssVariables?: Record<string, string>;
  /** 自定义样式类 */
  customClasses?: Record<string, string>;
  /** 样式覆盖 */
  styleOverrides?: Record<string, Record<string, any>>;
}

/**
 * 样式操作选项
 */
export interface StyleOperationOptions {
  /** 是否使用动画过渡 */
  animated?: boolean;
  /** 过渡持续时间 */
  duration?: number;
  /** 操作完成回调 */
  onComplete?: () => void;
  /** 操作失败回调 */
  onError?: (error: Error) => void;
}

/**
 * 样式管理器接口
 */
export interface IStyleManager {
  /**
   * 设置主题
   * @param theme 主题名称或主题配置
   * @param options 操作选项
   */
  setTheme(theme: MapTheme | ThemeConfig, options?: StyleOperationOptions): void;

  /**
   * 获取当前主题
   * @returns 当前主题名称
   */
  getCurrentTheme(): MapTheme;

  /**
   * 获取主题配置
   * @param theme 主题名称
   * @returns 主题配置或null
   */
  getThemeConfig(theme?: MapTheme | string): ThemeConfig | null;

  /**
   * 获取所有可用主题
   * @returns 主题列表
   */
  getAvailableThemes(): Array<{ name: string; displayName: string; isCustom: boolean }>;

  /**
   * 注册自定义主题
   * @param theme 主题配置
   */
  registerTheme(theme: ThemeConfig): void;

  /**
   * 移除自定义主题
   * @param name 主题名称
   * @returns 是否移除成功
   */
  removeTheme(name: string): boolean;

  /**
   * 设置样式覆盖
   * @param selector CSS选择器
   * @param styles 样式对象
   */
  setStyleOverride(selector: string, styles: Record<string, any>): void;

  /**
   * 移除样式覆盖
   * @param selector CSS选择器
   * @returns 是否移除成功
   */
  removeStyleOverride(selector: string): boolean;

  /**
   * 清空所有样式覆盖
   */
  clearStyleOverrides(): void;

  /**
   * 获取计算后的样式值
   * @param property 样式属性路径
   * @returns 样式值
   */
  getComputedStyle(property: string): any;

  /**
   * 生成CSS变量
   * @param theme 主题配置
   * @returns CSS变量字符串
   */
  generateCSSVariables(theme?: ThemeConfig): string;

  /**
   * 销毁样式管理器
   */
  destroy(): void;
}
