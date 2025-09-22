/**
 * 主题系统类型定义
 * 提供完整的主题系统类型支持，包括主题定义、管理和切换
 */

// 主题类型枚举
export enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
  CUSTOM = 'custom'
}

// 主题模式
export enum ThemeMode {
  STATIC = 'static',      // 静态主题
  DYNAMIC = 'dynamic',    // 动态主题
  ADAPTIVE = 'adaptive'   // 自适应主题
}

// 颜色变量定义
export interface ColorVariables {
  // 主色调
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primaryDisabled: string;
  
  // 次要色调
  secondary: string;
  secondaryHover: string;
  secondaryActive: string;
  secondaryDisabled: string;
  
  // 背景色
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // 文字颜色
  text: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  
  // 边框颜色
  border: string;
  borderSecondary: string;
  borderHover: string;
  
  // 状态颜色
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // 覆盖层颜色
  overlay: string;
  overlayLight: string;
  overlayDark: string;
  
  // 阴影颜色
  shadow: string;
  shadowLight: string;
  shadowDark: string;
  
  // 控制栏颜色
  controlsBackground: string;
  controlsText: string;
  controlsHover: string;
  controlsActive: string;
  
  // 进度条颜色
  progressBackground: string;
  progressBuffer: string;
  progressPlayed: string;
  progressThumb: string;
  
  // 音量条颜色
  volumeBackground: string;
  volumeFill: string;
  volumeThumb: string;
}

// 字体变量定义
export interface FontVariables {
  // 字体族
  fontFamily: string;
  fontFamilyMono: string;
  
  // 字体大小
  fontSizeXs: string;
  fontSizeSm: string;
  fontSizeMd: string;
  fontSizeLg: string;
  fontSizeXl: string;
  fontSizeXxl: string;
  
  // 字体粗细
  fontWeightLight: string;
  fontWeightNormal: string;
  fontWeightMedium: string;
  fontWeightBold: string;
  
  // 行高
  lineHeightTight: string;
  lineHeightNormal: string;
  lineHeightRelaxed: string;
  
  // 字母间距
  letterSpacingTight: string;
  letterSpacingNormal: string;
  letterSpacingWide: string;
}

// 尺寸变量定义
export interface SizeVariables {
  // 间距
  spacingXs: string;
  spacingSm: string;
  spacingMd: string;
  spacingLg: string;
  spacingXl: string;
  spacingXxl: string;
  
  // 圆角
  radiusXs: string;
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  radiusXl: string;
  radiusFull: string;
  
  // 边框宽度
  borderWidthThin: string;
  borderWidthNormal: string;
  borderWidthThick: string;
  
  // 阴影
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  shadowXl: string;
  
  // 控制栏尺寸
  controlsHeight: string;
  controlsPadding: string;
  controlsMargin: string;
  
  // 按钮尺寸
  buttonSizeSm: string;
  buttonSizeMd: string;
  buttonSizeLg: string;
  
  // 图标尺寸
  iconSizeSm: string;
  iconSizeMd: string;
  iconSizeLg: string;
  
  // 进度条尺寸
  progressHeight: string;
  progressThumbSize: string;
  
  // 音量条尺寸
  volumeWidth: string;
  volumeHeight: string;
  volumeThumbSize: string;
}

// 动画变量定义
export interface AnimationVariables {
  // 过渡时间
  transitionFast: string;
  transitionNormal: string;
  transitionSlow: string;
  
  // 缓动函数
  easingLinear: string;
  easingEaseIn: string;
  easingEaseOut: string;
  easingEaseInOut: string;
  
  // 动画时间
  animationFast: string;
  animationNormal: string;
  animationSlow: string;
  
  // 特定动画
  fadeInDuration: string;
  fadeOutDuration: string;
  slideInDuration: string;
  slideOutDuration: string;
}

// 主题变量集合
export interface ThemeVariables {
  colors: ColorVariables;
  fonts: FontVariables;
  sizes: SizeVariables;
  animations: AnimationVariables;
}

// 主题配置接口
export interface ThemeConfig {
  // 基础信息
  name: string;
  version: string;
  description?: string;
  author?: string;
  
  // 主题类型和模式
  type: ThemeType;
  mode: ThemeMode;
  
  // 主题变量
  variables: Partial<ThemeVariables>;
  
  // CSS 样式
  styles?: string;
  
  // 自定义 CSS 变量
  customVariables?: Record<string, string>;
  
  // 媒体查询断点
  breakpoints?: Record<string, string>;
  
  // 组件样式覆盖
  components?: Record<string, any>;
  
  // 插件样式覆盖
  plugins?: Record<string, any>;
  
  // 继承的主题
  extends?: string;
  
  // 主题依赖
  dependencies?: string[];
}

// 主题元数据
export interface ThemeMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  preview?: string;
  screenshots?: string[];
  compatibility?: string[];
}

// 主题状态
export enum ThemeState {
  UNLOADED = 'unloaded',
  LOADING = 'loading',
  LOADED = 'loaded',
  ACTIVE = 'active',
  ERROR = 'error'
}

// 主题上下文接口
export interface ThemeContext {
  name: string;
  config: ThemeConfig;
  metadata: ThemeMetadata;
  state: ThemeState;
  variables: ThemeVariables;
  element?: HTMLStyleElement;
  cssText?: string;
}

// 主题管理器接口
export interface ThemeManager {
  // 主题注册
  register(name: string, config: ThemeConfig, metadata?: ThemeMetadata): void;
  unregister(name: string): void;
  
  // 主题加载
  load(name: string): Promise<void>;
  unload(name: string): void;
  
  // 主题切换
  setTheme(name: string): Promise<void>;
  getCurrentTheme(): string | null;
  
  // 主题查询
  has(name: string): boolean;
  get(name: string): ThemeContext | null;
  list(): string[];
  
  // 主题状态
  getState(name: string): ThemeState;
  isLoaded(name: string): boolean;
  isActive(name: string): boolean;
  
  // 变量管理
  getVariable(name: string): string | null;
  setVariable(name: string, value: string): void;
  getVariables(): Record<string, string>;
  setVariables(variables: Record<string, string>): void;
  
  // CSS 管理
  getCSSText(name: string): string | null;
  applyCSSText(cssText: string): void;
  removeCSSText(): void;
  
  // 事件
  on(event: 'change', listener: (theme: string) => void): void;
  on(event: 'load', listener: (theme: string) => void): void;
  on(event: 'error', listener: (theme: string, error: Error) => void): void;
  off(event: string, listener: Function): void;
  
  // 清理
  clear(): void;
}

// 主题构建器接口
export interface ThemeBuilder {
  // 创建主题
  create(name: string): ThemeBuilder;
  
  // 设置基础信息
  setMetadata(metadata: Partial<ThemeMetadata>): ThemeBuilder;
  setType(type: ThemeType): ThemeBuilder;
  setMode(mode: ThemeMode): ThemeBuilder;
  
  // 设置变量
  setColors(colors: Partial<ColorVariables>): ThemeBuilder;
  setFonts(fonts: Partial<FontVariables>): ThemeBuilder;
  setSizes(sizes: Partial<SizeVariables>): ThemeBuilder;
  setAnimations(animations: Partial<AnimationVariables>): ThemeBuilder;
  
  // 设置样式
  setStyles(styles: string): ThemeBuilder;
  addStyles(styles: string): ThemeBuilder;
  
  // 设置自定义变量
  setCustomVariable(name: string, value: string): ThemeBuilder;
  setCustomVariables(variables: Record<string, string>): ThemeBuilder;
  
  // 继承主题
  extend(themeName: string): ThemeBuilder;
  
  // 构建主题
  build(): ThemeConfig;
}

// 主题工具函数接口
export interface ThemeUtils {
  // 颜色工具
  lighten(color: string, amount: number): string;
  darken(color: string, amount: number): string;
  alpha(color: string, alpha: number): string;
  mix(color1: string, color2: string, weight: number): string;
  
  // CSS 变量工具
  toCSSVariables(variables: Record<string, string>): string;
  fromCSSVariables(cssText: string): Record<string, string>;
  
  // 主题合并
  mergeThemes(base: ThemeConfig, override: Partial<ThemeConfig>): ThemeConfig;
  
  // 主题验证
  validateTheme(config: ThemeConfig): boolean | string[];
  
  // 主题转换
  convertTheme(config: any, format: 'css' | 'scss' | 'less'): string;
}

// 响应式主题接口
export interface ResponsiveTheme {
  // 断点定义
  breakpoints: Record<string, number>;
  
  // 响应式变量
  responsive: Record<string, Record<string, string>>;
  
  // 媒体查询生成
  generateMediaQueries(): string;
  
  // 当前断点
  getCurrentBreakpoint(): string;
  
  // 断点监听
  onBreakpointChange(callback: (breakpoint: string) => void): void;
}

// 主题预设
export interface ThemePresets {
  light: ThemeConfig;
  dark: ThemeConfig;
  auto: ThemeConfig;
}

// 导出类型
export type ThemeVariableKey = keyof ThemeVariables;
export type ColorVariableKey = keyof ColorVariables;
export type FontVariableKey = keyof FontVariables;
export type SizeVariableKey = keyof SizeVariables;
export type AnimationVariableKey = keyof AnimationVariables;
