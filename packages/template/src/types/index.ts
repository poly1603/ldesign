/**
 * 类型定义导出文件
 *
 * 导出所有类型定义
 */

// 避免重复导出，使用具名导出
export * from './animation'
export {
  type CacheConfig,
  type DeviceDetectionConfig,
  type PreloadStrategyConfig,
  type ScannerConfig,
  type TemplateSystemConfig,
  type ConfigValidationResult,
  type TemplateConfig,
  type LoaderConfig,
  type FileNamingConfig,
  type PerformanceConfig,
  type ErrorHandlingConfig,
  type DevtoolsConfig,
  type ConfigListener,
  type ConfigManager,
  type ConfigUpdateEvent,
  type LogLevel,
  type CacheStrategy,
  type PreloadMode,
  type ScanMode
} from './config'

export {
  type TemplatePluginOptions,
  type PluginState,
  type PluginOptions
} from './plugin'

export * from './strict-types'

export {
  type DeviceType,
  type TemplateMetadata,
  type TemplateIndex,
  type TemplateRendererAnimationConfig,
  type TemplateSelectorConfig,
  type TemplateRendererProps,
  type UseTemplateOptions,
  type UseTemplateReturn,
  type UseSimpleTemplateOptions,
  type UseSimpleTemplateReturn,
  type UseTemplateListReturn,
  type ExtendedTemplateMetadata,
  type TemplateManagerConfig,
  type LoadResult,
  type TemplateInfo,
  type TemplateEvents,
  type EventListener,
  type PreloadStrategy,
  type FileChangeEvent
} from './template'

export * from './template-categories'
