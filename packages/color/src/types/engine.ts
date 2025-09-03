/**
 * Engine 插件相关类型定义
 */

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  /** 主题名称 */
  name: string
  /** 显示名称 */
  displayName: string
  /** 亮色模式颜色配置 */
  light: ColorScheme
  /** 暗色模式颜色配置 */
  dark: ColorScheme
}

/**
 * 颜色方案接口
 */
export interface ColorScheme {
  /** 主色 */
  primary: string
  /** 辅助色 */
  secondary: string
  /** 成功色 */
  success: string
  /** 警告色 */
  warning: string
  /** 危险色 */
  danger: string
  /** 背景色 */
  background: string
  /** 表面色 */
  surface: string
  /** 文本色 */
  text: string
  /** 边框色 */
  border: string
  /** 其他自定义颜色 */
  [key: string]: string
}

/**
 * 组件配置接口
 */
export interface ComponentConfig {
  /** 是否全局注册组件 */
  registerGlobally?: boolean
  /** 组件名称前缀 */
  prefix?: string
}

/**
 * 功能配置接口
 */
export interface FeatureConfig {
  /** 启用主题管理器 */
  enableThemeManager?: boolean
  /** 启用颜色选择器 */
  enableColorPicker?: boolean
  /** 启用调色板生成器 */
  enablePaletteGenerator?: boolean
  /** 启用可访问性检查器 */
  enableAccessibilityChecker?: boolean
  /** 启用主题组件 */
  enableThemeComponents?: boolean
  /** 启用自动检测系统主题 */
  enableAutoDetectSystemTheme?: boolean
}

/**
 * 性能配置接口
 */
export interface PerformanceConfig {
  /** 启用缓存 */
  enableCache?: boolean
  /** 缓存大小 */
  cacheSize?: number
  /** 启用闲时处理 */
  enableIdleProcessing?: boolean
}

/**
 * CSS 变量配置接口
 */
export interface CSSVariableConfig {
  /** CSS 变量前缀，默认为 'ldesign' */
  prefix?: string
  /** CSS 变量作用域 */
  scope?: string
  /** 启用过渡动画 */
  enableTransition?: boolean
  /** 过渡动画持续时间 */
  transitionDuration?: string
  /** 是否启用语义化变量 */
  enableSemanticVariables?: boolean
  /** 是否启用色阶变量 */
  enableScaleVariables?: boolean
  /** 是否包含变量描述注释 */
  includeComments?: boolean
  /** 是否包含主题信息注释 */
  includeThemeInfo?: boolean
}

/**
 * 缓存配置接口
 */
export interface CacheConfig {
  /** 是否启用缓存，默认为 true */
  enabled?: boolean
  /** 缓存存储类型 */
  storage?: 'localStorage' | 'sessionStorage' | 'memory'
  /** 缓存键名前缀 */
  keyPrefix?: string
  /** 缓存过期时间（毫秒），0 表示永不过期 */
  expiration?: number
  /** 是否在页面刷新时恢复缓存 */
  restoreOnReload?: boolean
}

/**
 * 背景色生成策略配置接口
 */
export interface BackgroundGenerationConfig {
  /** 背景色生成策略 */
  strategy?: 'neutral' | 'primary-based' | 'custom'
  /** 当策略为 'primary-based' 时，是否根据主色调生成背景色 */
  basedOnPrimary?: boolean
  /** 自定义背景色配置（当策略为 'custom' 时使用） */
  customColors?: {
    light?: string[]
    dark?: string[]
  }
  /** 背景色透明度范围 */
  opacityRange?: [number, number]
}

/**
 * 主题禁用配置接口
 */
export interface ThemeDisableConfig {
  /** 禁用的内置主题名称列表 */
  disabledBuiltinThemes?: string[]
  /** 是否完全禁用内置主题 */
  disableAllBuiltin?: boolean
  /** 禁用特定主题的某些颜色类别 */
  disabledCategories?: Record<string, string[]>
}

/**
 * 开发配置接口
 */
export interface DevelopmentConfig {
  /** 启用调试模式 */
  enableDebugMode?: boolean
  /** 启用性能监控 */
  enablePerformanceMonitoring?: boolean
  /** 是否在控制台显示详细日志 */
  verboseLogging?: boolean
  /** 是否启用热重载 */
  enableHotReload?: boolean
}

/**
 * 颜色 Engine 插件配置接口
 */
export interface ColorEnginePluginConfig {
  /** 主题配置列表 */
  themes?: ThemeConfig[]
  /** 默认主题名称 */
  defaultTheme?: string
  /** 默认模式 */
  defaultMode?: 'light' | 'dark'
  /** 组件配置 */
  components?: ComponentConfig
  /** 功能配置 */
  features?: FeatureConfig
  /** 性能配置 */
  performance?: PerformanceConfig
  /** CSS 变量配置 */
  cssVariables?: CSSVariableConfig
  /** 缓存配置 */
  cache?: CacheConfig
  /** 背景色生成策略配置 */
  backgroundGeneration?: BackgroundGenerationConfig
  /** 主题禁用配置 */
  themeDisable?: ThemeDisableConfig
  /** 自定义主题色配置 */
  customThemes?: ThemeConfig[]
  /** 开发配置 */
  development?: DevelopmentConfig
}

/**
 * 颜色 Engine 插件选项接口（用于用户传入的配置）
 */
export interface ColorEnginePluginOptions extends Partial<ColorEnginePluginConfig> {
  /** 插件名称 */
  name?: string
  /** 插件版本 */
  version?: string
}

/**
 * 主题管理器选项接口
 */
export interface ThemeManagerOptions {
  /** 主题配置列表 */
  themes?: ThemeConfig[]
  /** 默认主题名称 */
  defaultTheme?: string
  /** 默认模式 */
  defaultMode?: 'light' | 'dark'
  /** CSS 变量配置 */
  cssVariables?: CSSVariableConfig
  /** 性能配置 */
  performance?: PerformanceConfig
  /** 调试模式 */
  debug?: boolean
}

/**
 * 主题切换事件接口
 */
export interface ThemeChangeEvent {
  /** 主题名称 */
  theme: string
  /** 模式 */
  mode: 'light' | 'dark'
  /** 颜色方案 */
  colors: ColorScheme
  /** 时间戳 */
  timestamp: number
}

/**
 * 主题选择器选项接口
 */
export interface ThemeSelectorOptions {
  /** 显示模式 */
  mode?: 'select' | 'dialog'
  /** 选择器大小 */
  size?: 'small' | 'medium' | 'large'
  /** 是否显示模式切换 */
  showModeToggle?: boolean
  /** 是否显示预览 */
  showPreview?: boolean
  /** 自定义样式类 */
  customClass?: string
}

/**
 * 主题对话框选项接口
 */
export interface ThemeDialogOptions {
  /** 对话框标题 */
  title?: string
  /** 对话框宽度 */
  width?: string | number
  /** 是否显示模式切换 */
  showModeToggle?: boolean
  /** 是否显示预览 */
  showPreview?: boolean
  /** 每行显示的主题数量 */
  columnsPerRow?: number
  /** 主题项大小 */
  themeItemSize?: 'small' | 'medium' | 'large'
}

/**
 * 颜色工具函数选项接口
 */
export interface ColorUtilOptions {
  /** 输出格式 */
  format?: 'hex' | 'rgb' | 'hsl' | 'hsv'
  /** 精度 */
  precision?: number
  /** 是否包含 alpha 通道 */
  includeAlpha?: boolean
}

/**
 * 调色板生成选项接口
 */
export interface PaletteGenerationOptions {
  /** 调色板类型 */
  type?: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic'
  /** 颜色数量 */
  count?: number
  /** 饱和度范围 */
  saturationRange?: [number, number]
  /** 亮度范围 */
  lightnessRange?: [number, number]
}

/**
 * 可访问性检查选项接口
 */
export interface AccessibilityCheckOptions {
  /** WCAG 等级 */
  level?: 'AA' | 'AAA'
  /** 文本大小 */
  textSize?: 'normal' | 'large'
  /** 是否包含建议 */
  includeSuggestions?: boolean
}

/**
 * 插件状态接口
 */
export interface PluginState {
  /** 是否已安装 */
  installed: boolean
  /** 安装时间 */
  installedAt?: number
  /** 主题管理器实例 */
  themeManager?: any
  /** 配置 */
  config?: ColorEnginePluginConfig
}

/**
 * 插件事件接口
 */
export interface PluginEvent {
  /** 事件类型 */
  type: 'install' | 'uninstall' | 'themeChange' | 'error'
  /** 事件数据 */
  data?: any
  /** 时间戳 */
  timestamp: number
}

/**
 * 错误信息接口
 */
export interface PluginError {
  /** 错误代码 */
  code: string
  /** 错误消息 */
  message: string
  /** 错误详情 */
  details?: any
  /** 错误堆栈 */
  stack?: string
}
