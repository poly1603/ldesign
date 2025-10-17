/**
 * Vue 组合式函数导出
 */

export {
  useDefaultTemplate,
  useTemplate,
  useTemplateList,
  useTemplateManager,
} from './useTemplate'

export {
  useTemplateLifecycle,
  useTemplatePrefetch,
  useTemplateNavigation,
  useTemplatePerformance,
  type TemplateLifecycle,
  type TemplatePrefetchOptions,
  type TemplateHookResult,
} from './useTemplateHooks'

export {
  useTemplateTheme,
  createThemeManager,
  provideTemplateTheme,
  PRESET_THEMES,
  type TemplateTheme,
  type ThemeContext
} from './useTemplateTheme'

export {
  useTemplateForm,
  useTemplateModel,
  type ValidationRule,
  type FieldRules,
  type FormRules,
  type FieldError,
  type FormState,
  type FormOptions
} from './useTemplateForm'

export {
  useTemplateEventBus,
  useTemplateEvent,
  useTemplateEvents,
  provideTemplateEventBus,
  createMiddlewareEventBus,
  templateEventBus,
  TEMPLATE_EVENTS,
  type EventHandler,
  type EventSubscribeOptions,
  type TemplateEventBus,
  type TemplateEventType,
  type EventMiddleware,
  MiddlewareEventBus
} from './useTemplateEventBus'

export {
  useTemplateCondition,
  useTemplateABTest,
  createABTest,
  TEMPLATE_CONDITIONS,
  type TemplateCondition,
  type TemplateContext,
  type ABTestConfig,
  type ABTestVariant,
  type ABTestResult
} from './useTemplateCondition'

export {
  useTemplateVersion,
  useAutoMigration,
  useVersionComparison,
  type UseTemplateVersionOptions,
  type VersionState
} from './useTemplateVersion'

export {
  useTemplateAnimation,
  useParallax,
  useGesture,
  useSequenceAnimation,
  useScrollAnimation,
  EASING_FUNCTIONS,
  type EasingFunction,
  type AnimationConfig,
  type ParallaxConfig,
  type GestureConfig,
  type SequenceStep
} from './useTemplateAnimation'

export {
  useTemplateSnapshot,
  useTimeTravel,
  type TemplateSnapshot,
  type SnapshotOptions,
  type TimeTravel
} from './useTemplateSnapshot'

export {
  useTemplateDebugger,
  globalDebuggerManager,
  createDebugPanelData,
  DebugLevel,
  type DebugLog,
  type DebuggerConfig,
  type TemplateStateSnapshot
} from './useTemplateDebugger'
