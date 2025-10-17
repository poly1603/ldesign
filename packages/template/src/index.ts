/**
 * @ldesign/template - 多模板管理及动态渲染系统
 * 
 * 核心特性：
 * - 自动扫描模板：使用 import.meta.glob 自动扫描所有模板
 * - 懒加载：按需加载模板组件，优化性能
 * - 类型安全：完整的 TypeScript 类型支持
 * - Vue 集成：提供 Vue 组合式函数和组件
 */

// Vue 组件
export { TemplateRenderer, TemplateSelector, TemplateSkeleton, TemplateVersion, TemplateDevPanel } from './components'

// Vue 组合式函数
export {
  useDefaultTemplate,
  useTemplate,
  useTemplateList,
  useTemplateManager,
  // 新增 hooks
  useTemplateLifecycle,
  useTemplatePrefetch,
  useTemplateNavigation,
  useTemplatePerformance,
  // 主题系统
  useTemplateTheme,
  createThemeManager,
  provideTemplateTheme,
  // 表单系统  
  useTemplateForm,
  useTemplateModel,
  // 事件总线
  useTemplateEventBus,
  useTemplateEvent,
  useTemplateEvents,
  provideTemplateEventBus,
  createMiddlewareEventBus,
  templateEventBus,
  // 版本控制
  useTemplateVersion,
  useAutoMigration,
  useVersionComparison,
  // 动画系统
  useTemplateAnimation,
  useParallax,
  useGesture,
  useSequenceAnimation,
  useScrollAnimation,
  EASING_FUNCTIONS,
  // 快照与时间旅行
  useTemplateSnapshot,
  useTimeTravel,
  // 调试工具
  useTemplateDebugger,
  globalDebuggerManager,
  createDebugPanelData,
  DebugLevel,
} from './composables'

// 核心模块
export {
  createTemplateManager,
  getLoader,
  getManager,
  getScanner,
  loadTemplate,
  preloadTemplate,
  scanTemplates,
  TemplateLoader,
  TemplateManager,
  TemplateScanner,
} from './core'

// 默认导出
export { getManager as default } from './core'

// 插件系统
export {
  createTemplatePlugin,
  type TemplatePlugin,
  type TemplatePluginOptions,
  TemplatePluginSymbol,
  useTemplatePlugin,
} from './plugin'

// 语言包
export { 
  zhCN, 
  enUS, 
  jaJP,
  getLocale,
  locales,
  supportedLocales
} from './locales'
export type { TemplateLocale, LocaleKey } from './locales'

// 指令系统
export {
  vTemplate,
  installTemplateDirective
} from './directives'

// 错误处理
export {
  TemplateError,
  TemplateErrorType,
  ErrorRecoveryManager,
  GlobalTemplateErrorHandler,
  createErrorBoundary,
  globalErrorHandler
} from './utils'

// 常量导出
export { PRESET_THEMES, TEMPLATE_EVENTS } from './composables'

// 模板继承系统
export {
  TemplateInheritanceManager,
  TemplateBlockManager,
  inheritanceManager,
  blockManager,
  createInheritableTemplate,
  createTemplateMixin,
  registerBaseTemplate,
  type TemplateInheritanceConfig,
  type MergeStrategy,
  type TemplateBlock
} from './core/inheritance'

export {
  useTemplateInheritance,
  useTemplateBlocks,
  useTemplateMixins,
  type UseTemplateInheritanceOptions,
  type TemplateInheritanceContext
} from './composables/useTemplateInheritance'

export { default as InheritableTemplate } from './components/InheritableTemplate.vue'

// 类型导出
export type * from './types'
export type { 
  TemplateLifecycle, 
  TemplatePrefetchOptions, 
  TemplateHookResult,
  TemplateTheme,
  ThemeContext,
  ValidationRule,
  FieldRules,
  FormRules,
  FieldError,
  FormState,
  FormOptions,
  EventHandler,
  EventSubscribeOptions,
  TemplateEventBus,
  TemplateEventType,
  EventMiddleware,
  UseTemplateVersionOptions,
  VersionState,
  EasingFunction,
  AnimationConfig,
  ParallaxConfig,
  GestureConfig,
  SequenceStep,
  TemplateSnapshot,
  SnapshotOptions,
  TimeTravel,
  DebugLog,
  DebuggerConfig,
  TemplateStateSnapshot
} from './composables'
export type { ErrorRecoveryStrategy } from './utils'
