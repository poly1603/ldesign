import { TemplateManagerConfig } from './types/index.js'
export {
  DeviceType,
  TemplateChangeCallback,
  TemplateChangeEvent,
  TemplateConfig,
  TemplateLoadResult,
  TemplateMetadata,
  TemplatePathInfo,
  TemplatePluginOptions,
  TemplateRenderOptions,
  TemplateRendererProps,
  TemplateScanResult,
  UseTemplateOptions,
  UseTemplateReturn,
} from './types/index.js'
import { TemplateLoader } from './core/loader.js'
import { TemplateManager } from './core/manager.js'
import { TemplateScanner } from './core/scanner.js'
import { createTemplateEnginePlugin } from './engine/plugin.js'
export { createDefaultTemplateEnginePlugin } from './engine/plugin.js'
import { useTemplate } from './vue/composables/useTemplate.js'
export {
  buildTemplatePath,
  extractTemplatePathFromModulePath,
  getComponentPathFromConfigPath,
  getConfigPathFromComponentPath,
  getStylePathFromConfigPath,
  isTemplateComponentPath,
  isTemplateConfigPath,
  normalizeTemplatePath,
  parseTemplatePath,
  validateTemplatePath,
} from './utils/path.js'
export { default as TemplateRenderer } from './vue/components/TemplateRenderer.js'
export {
  default as TemplatePlugin,
  createTemplatePlugin,
  destroyGlobalTemplateManager,
  getGlobalTemplateManager,
  useTemplateManager,
} from './vue/plugin.js'

/**
 * 创建模板管理器实例
 */
declare function createTemplateManager(config?: TemplateManagerConfig): TemplateManager
/**
 * 创建模板扫描器实例
 */
declare function createTemplateScanner(): TemplateScanner
/**
 * 创建模板加载器实例
 */
declare function createTemplateLoader(): TemplateLoader
declare const _default: {
  TemplateManager: typeof TemplateManager
  TemplateScanner: typeof TemplateScanner
  TemplateLoader: typeof TemplateLoader
  createTemplateManager: typeof createTemplateManager
  createTemplateScanner: typeof createTemplateScanner
  createTemplateLoader: typeof createTemplateLoader
  TemplateRenderer: any
  TemplatePlugin: Plugin
  useTemplate: typeof useTemplate
  createTemplateEnginePlugin: typeof createTemplateEnginePlugin
}

declare const version = '0.1.0'

export {
  TemplateLoader,
  TemplateManager,
  TemplateManagerConfig,
  TemplateScanner,
  createTemplateEnginePlugin,
  createTemplateLoader,
  createTemplateManager,
  createTemplateScanner,
  _default as default,
  useTemplate,
  version,
}
