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
  type PreloadMode
} from './config'

// 从模板类型导出 TemplateConfig，避免错误地从 config 导出
export { type TemplateConfig } from './template'

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

// 导出工厂函数类型
export * from './factory'

// 导出性能相关类型
export * from './performance'
