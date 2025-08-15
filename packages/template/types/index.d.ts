import { JSX } from './node_modules/.pnpm/vue@3.5.18_typescript@5.8.3/node_modules/vue/jsx-runtime/index.d.js'
import * as _vue_runtime_core from '@vue/runtime-core'
import { TemplateManagerConfig, DeviceType } from './types/index.js'
export {
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
import { TemplateManager } from './core/manager.js'
import { TemplateScanner } from './core/scanner.js'
import { TemplateLoader } from './core/loader.js'
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
import { createTemplateEnginePlugin } from './engine/plugin.js'
export { createDefaultTemplateEnginePlugin } from './engine/plugin.js'
export { default as TemplateRenderer } from './vue/components/TemplateRenderer.js'
export {
  default as TemplatePlugin,
  createTemplatePlugin,
  destroyGlobalTemplateManager,
  getGlobalTemplateManager,
  useTemplateManager,
} from './vue/plugin.js'
import { useTemplate } from './vue/composables/useTemplate.js'

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
  TemplateRenderer: _vue_runtime_core.DefineComponent<
    _vue_runtime_core.ExtractPropTypes<{
      category: {
        type: StringConstructor
        required: true
      }
      device: {
        type: _vue_runtime_core.PropType<DeviceType>
        default: undefined
      }
      template: {
        type: StringConstructor
        required: true
      }
      templateProps: {
        type: _vue_runtime_core.PropType<Record<string, unknown>>
        default: () => {}
      }
      cache: {
        type: BooleanConstructor
        default: boolean
      }
      preload: {
        type: BooleanConstructor
        default: boolean
      }
      loading: {
        type: BooleanConstructor
        default: boolean
      }
      error: {
        type: BooleanConstructor
        default: boolean
      }
    }>,
    () =>
      | _vue_runtime_core.VNode<
          _vue_runtime_core.RendererNode,
          _vue_runtime_core.RendererElement,
          {
            [key: string]: any
          }
        >[]
      | JSX.Element,
    {},
    {},
    {},
    _vue_runtime_core.ComponentOptionsMixin,
    _vue_runtime_core.ComponentOptionsMixin,
    {
      load: (result: any) => true
      error: (error: Error) => true
      'before-load': () => true
      'template-change': (template: any) => true
    },
    string,
    _vue_runtime_core.PublicProps,
    Readonly<
      _vue_runtime_core.ExtractPropTypes<{
        category: {
          type: StringConstructor
          required: true
        }
        device: {
          type: _vue_runtime_core.PropType<DeviceType>
          default: undefined
        }
        template: {
          type: StringConstructor
          required: true
        }
        templateProps: {
          type: _vue_runtime_core.PropType<Record<string, unknown>>
          default: () => {}
        }
        cache: {
          type: BooleanConstructor
          default: boolean
        }
        preload: {
          type: BooleanConstructor
          default: boolean
        }
        loading: {
          type: BooleanConstructor
          default: boolean
        }
        error: {
          type: BooleanConstructor
          default: boolean
        }
      }>
    > &
      Readonly<{
        onError?: ((error: Error) => any) | undefined
        onLoad?: ((result: any) => any) | undefined
        'onBefore-load'?: (() => any) | undefined
        'onTemplate-change'?: ((template: any) => any) | undefined
      }>,
    {
      device: DeviceType
      templateProps: Record<string, unknown>
      cache: boolean
      preload: boolean
      loading: boolean
      error: boolean
    },
    {},
    {},
    {},
    string,
    _vue_runtime_core.ComponentProvideOptions,
    true,
    {},
    any
  >
  TemplatePlugin: _vue_runtime_core.Plugin
  useTemplate: typeof useTemplate
  createTemplateEnginePlugin: typeof createTemplateEnginePlugin
}

declare const version = '0.1.0'

export {
  DeviceType,
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
