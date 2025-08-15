/**
 * @ldesign/theme - 主题系统
 *
 * 提供完整的主题管理功能，包括节日主题、装饰元素和动画效果
 *
 * @version 0.1.0
 * @author LDesign Team
 */

// 导出核心类型
export type {
  ThemeCategory,
  FestivalType,
  DecorationType,
  AnimationType,
  Position,
  Size,
  TimeRange,
  DecorationPosition,
  DecorationStyle,
  DecorationConfig,
  DecorationCondition,
  AnimationConfig,
  AnimationKeyframe,
  AnimationPerformance,
  ResourceConfig,
  ThemeConfig,
  ThemeCompatibility,
  ThemeManagerOptions,
  PerformanceOptions,
  StorageOptions,
  ThemeEventType,
  ThemeEventData,
  ThemeEventListener,
  ThemeManagerInstance,
  DecorationManagerInstance,
  AnimationManagerInstance,
  ResourceManagerInstance,
  ResourceStats,
} from './core/types'

// 导出核心管理器
export { ThemeManager, createThemeManager } from './core/theme-manager'
export {
  DecorationManager,
  createDecorationManager,
} from './core/decoration-manager'
export {
  AnimationManager,
  createAnimationManager,
} from './core/animation-manager'
export { ResourceManager, createResourceManager } from './core/resource-manager'

// 导出工具函数
export {
  EventEmitterImpl,
  createEventEmitter,
  defaultEventEmitter,
} from './utils/event-emitter'

// 导出主题预设
export * from './themes/presets'

// 导出装饰元素
export * from './decorations'

// 导出动画效果
export * from './decorations/animations'

// 导出节日主题系统
export type {
  FestivalThemeConfig,
  WidgetConfig,
  WidgetType,
  WidgetPosition,
  WidgetSize,
  WidgetAnimation,
  SVGIcon,
} from './widgets/element-decorations'

export type { ThemeSwitchEvent } from './core/theme-switcher'

export {
  createFestivalTheme,
  validateFestivalTheme,
  mergeFestivalThemes,
} from './core/festival-theme-config'

// 导出挂件管理器
export { createWidgetManager, globalWidgetManager } from './core/widget-manager'

// 导出主题切换器
export {
  ThemeSwitcher,
  createThemeSwitcher,
  globalThemeSwitcher,
} from './core/theme-switcher'

// 导出挂件辅助函数
export {
  applyWidget,
  removeWidget,
  switchTheme,
  getCurrentTheme,
  getAvailableThemes,
  applyWidgets,
  applyButtonWidget,
  applyHeaderWidget,
  applyCardWidget,
  applyPanelWidget,
  applyBackgroundWidget,
  applySidebarWidget,
  applyInputWidget,
  applyNavigationWidget,
  applyFooterWidget,
  applyModalWidget,
  autoApplyWidgets,
  clearAllWidgets,
  initializeWidgetSystem,
  onThemeChange,
  enableDebugMode,
  disableDebugMode,
} from './core/widget-helpers'

// 导出节日主题配置
export {
  allFestivalThemes,
  getThemeConfig,
  getAllThemeConfigs,
  getSupportedThemeIds,
  isSupportedThemeId,
  getRecommendedTheme,
  defaultThemeConfig,
  springFestivalThemeConfig,
  christmasThemeConfig,
} from './themes/festivals'

// 导出图标资源
export {
  allThemeIcons,
  getThemeIcons,
  getCachedThemeIcons,
  getSupportedThemes,
  isSupportedTheme,
  preloadThemeIcons,
} from './resources/icons'

// 导出 Vue 适配层
export * from './adapt/vue'

// 导出所有类型
export * from './types'

// 版本信息
export const version = '0.1.0'

// 默认导出
export default {
  version,
  createThemeManager,
  createWidgetManager,
  createThemeSwitcher,
  globalWidgetManager,
  globalThemeSwitcher,
  initializeWidgetSystem,
  switchTheme,
  applyWidget,
}
