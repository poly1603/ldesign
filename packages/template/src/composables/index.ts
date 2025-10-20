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
  type AnimationConfig,
  EASING_FUNCTIONS,
  type EasingFunction,
  type GestureConfig,
  type ParallaxConfig,
  type SequenceStep,
  useGesture,
  useParallax,
  useScrollAnimation,
  useSequenceAnimation,
  useTemplateAnimation
} from './useTemplateAnimation'

export {
  type ABTestConfig,
  type ABTestResult,
  type ABTestVariant,
  createABTest,
  TEMPLATE_CONDITIONS,
  type TemplateCondition,
  type TemplateContext,
  useTemplateABTest,
  useTemplateCondition
} from './useTemplateCondition'

export {
  createDebugPanelData,
  type DebuggerConfig,
  DebugLevel,
  type DebugLog,
  globalDebuggerManager,
  type TemplateStateSnapshot,
  useTemplateDebugger
} from './useTemplateDebugger'

export {
  createMiddlewareEventBus,
  type EventHandler,
  type EventMiddleware,
  type EventSubscribeOptions,
  MiddlewareEventBus,
  provideTemplateEventBus,
  TEMPLATE_EVENTS,
  templateEventBus,
  type TemplateEventBus,
  type TemplateEventType,
  useTemplateEvent,
  useTemplateEventBus,
  useTemplateEvents
} from './useTemplateEventBus'

export {
  type FieldError,
  type FieldRules,
  type FormOptions,
  type FormRules,
  type FormState,
  useTemplateForm,
  useTemplateModel,
  type ValidationRule
} from './useTemplateForm'

export {
  type TemplateHookResult,
  type TemplateLifecycle,
  type TemplatePrefetchOptions,
  useTemplateLifecycle,
  useTemplateNavigation,
  useTemplatePerformance,
  useTemplatePrefetch,
} from './useTemplateHooks'

export {
  type SnapshotOptions,
  type TemplateSnapshot,
  type TimeTravel,
  useTemplateSnapshot,
  useTimeTravel
} from './useTemplateSnapshot'

export {
  createThemeManager,
  PRESET_THEMES,
  provideTemplateTheme,
  type TemplateTheme,
  type ThemeContext,
  useTemplateTheme
} from './useTemplateTheme'

export {
  useAutoMigration,
  useTemplateVersion,
  type UseTemplateVersionOptions,
  useVersionComparison,
  type VersionState
} from './useTemplateVersion'
