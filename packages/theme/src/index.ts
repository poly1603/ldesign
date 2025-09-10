/**
 * @ldesign/theme - 节日主题包
 * 
 * 为你的应用带来节日的魅力！支持多种节日主题切换和丰富的挂件装饰系统。
 * 
 * 特性：
 * - 🎄 节日主题：内置春节、圣诞节、万圣节等节日主题
 * - 🎭 挂件系统：支持按钮、面板、背景装饰、动画效果等多种挂件
 * - 🎨 基于 @ldesign/color：完美集成颜色系统，自动生成 CSS 变量
 * - 🎯 Vue 3 深度集成：提供指令、组件和组合式函数
 * - 📱 响应式设计：自适应不同屏幕尺寸和设备
 * - ⚡ 性能优化：GPU 加速动画，智能资源管理
 * - 🔧 框架无关：可在任何前端框架中使用
 * 
 * @version 0.1.0
 * @author LDesign Team
 */

// 导出核心类型
export type {
  // 枚举类型
  FestivalType,
  WidgetType,
  ThemeEventType,

  // 配置接口
  WidgetConfig,
  WidgetPosition,
  WidgetStyle,
  AnimationConfig,
  FestivalThemeConfig,
  ThemeManagerConfig,
  WidgetManagerConfig,

  // 事件相关
  ThemeEventData,
  ThemeEventListener,

  // 管理器接口
  IThemeManager,
  IWidgetManager,
  IAnimationEngine
} from './core/types'

// 导出核心类
export { FestivalThemeManager } from './core/theme-manager'
export { WidgetManager } from './core/widget-manager'
export {
  AnimationEngine,
  globalAnimationEngine,
  playAnimation,
  stopAnimation,
  registerAnimation
} from './core/animation-engine'

// 导出节日主题配置
export {
  springFestivalTheme,
  christmasTheme,
  halloweenTheme,
  valentinesDayTheme,
  midAutumnTheme,
  defaultTheme
} from './themes'

// 导出挂件工厂函数
export {
  createButtonWidget,
  createPanelWidget,
  createBackgroundWidget,
  createAnimationWidget,
  createFloatingWidget
} from './widgets'

// 导出工具函数
export {
  createFestivalTheme,
  validateWidgetConfig,
  generateWidgetId,
  mergeAnimationConfigs,
  calculateOptimalPosition,
  detectCollisions
} from './utils'

// 导出 Vue 3 集成（可选依赖）
export {
  VueThemePlugin,
  ThemeProvider,
  ThemeSelector,
  ThemeButton,
  WidgetContainer,
  AnimationWrapper
} from './vue'

// 导出 Vue 3 组合式函数
export {
  useTheme,
  useThemeSelector,
  useThemeToggle,
  useWidgets,
  useAnimations,
  useResponsiveWidgets
} from './vue/composables'

// 导出 Vue 3 指令
export {
  vThemeDecoration,
  vThemeAnimation,
  vWidgetContainer
} from './vue/directives'

/**
 * 创建节日主题管理器
 *
 * @param config 主题管理器配置
 * @returns 主题管理器实例
 *
 * @example
 * ```typescript
 * import { createFestivalThemeManager, FestivalType } from '@ldesign/theme'
 * import { springFestivalTheme, christmasTheme } from '@ldesign/theme/themes'
 *
 * const themeManager = createFestivalThemeManager({
 *   themes: [springFestivalTheme, christmasTheme],
 *   defaultTheme: FestivalType.SPRING_FESTIVAL,
 *   autoActivate: true
 * })
 *
 * await themeManager.init()
 * await themeManager.setTheme(FestivalType.CHRISTMAS)
 * ```
 */
export function createFestivalThemeManager(config: ThemeManagerConfig): IThemeManager {
  return new FestivalThemeManager(config)
}

/**
 * 创建主题管理器（别名函数，为了兼容性）
 *
 * @param config 主题管理器配置
 * @returns 主题管理器实例
 */
export function createThemeManager(config?: Partial<ThemeManagerConfig>): FestivalThemeManager {
  // 动态导入所有主题
  const allThemes = [
    defaultTheme,
    springFestivalTheme,
    christmasTheme,
    halloweenTheme,
    valentinesDayTheme,
    midAutumnTheme
  ]

  return new FestivalThemeManager({
    themes: allThemes,
    defaultTheme: 'default',
    container: document.body,
    enableCache: true,
    enablePerformanceMonitoring: true,
    ...config
  })
}

/**
 * 创建挂件管理器
 * 
 * @param config 挂件管理器配置
 * @returns 挂件管理器实例
 * 
 * @example
 * ```typescript
 * import { createWidgetManager, WidgetType } from '@ldesign/theme'
 * 
 * const widgetManager = createWidgetManager({
 *   container: document.body,
 *   maxWidgets: 50
 * })
 * 
 * await widgetManager.init()
 * 
 * await widgetManager.addWidget({
 *   id: 'snowflake-1',
 *   name: '雪花',
 *   type: WidgetType.ANIMATION,
 *   content: '<svg>...</svg>',
 *   animation: { name: 'snowfall', duration: 3000, iterations: 'infinite' }
 * })
 * ```
 */
export function createWidgetManager(config?: WidgetManagerConfig): IWidgetManager {
  return new WidgetManager(config)
}

/**
 * 创建动画引擎
 * 
 * @returns 动画引擎实例
 * 
 * @example
 * ```typescript
 * import { createAnimationEngine } from '@ldesign/theme'
 * 
 * const animationEngine = createAnimationEngine()
 * 
 * await animationEngine.play(element, {
 *   name: 'snowfall',
 *   duration: 3000,
 *   iterations: 'infinite'
 * })
 * ```
 */
export function createAnimationEngine(): IAnimationEngine {
  return new AnimationEngine()
}

/**
 * 快速设置节日主题
 * 
 * 这是一个便捷函数，用于快速设置和激活节日主题
 * 
 * @param festival 节日类型
 * @param options 配置选项
 * @returns 主题管理器实例
 * 
 * @example
 * ```typescript
 * import { setupFestivalTheme, FestivalType } from '@ldesign/theme'
 * 
 * // 快速设置圣诞节主题
 * const themeManager = await setupFestivalTheme(FestivalType.CHRISTMAS, {
 *   container: '#app',
 *   enableAnimations: true
 * })
 * ```
 */
export async function setupFestivalTheme(
  festival: FestivalType,
  options: {
    container?: string | HTMLElement
    enableAnimations?: boolean
    maxWidgets?: number
  } = {}
): Promise<IThemeManager> {
  // 动态导入主题配置
  const themes = await import('./themes')
  const themeConfig = themes[`${festival}Theme`] as FestivalThemeConfig

  if (!themeConfig) {
    throw new Error(`Theme configuration for "${festival}" not found`)
  }

  // 创建主题管理器
  const themeManager = createFestivalThemeManager({
    themes: [themeConfig],
    defaultTheme: festival,
    autoActivate: true
  })

  // 初始化并激活主题
  await themeManager.init()

  return themeManager
}

/**
 * 版本信息
 */
export const version = '0.1.0'

/**
 * 默认导出主题管理器类
 */
export default FestivalThemeManager

// 重新导出核心枚举，方便使用
export { FestivalType, WidgetType, ThemeEventType } from './core/types'
