import { JSX } from './node_modules/vue/jsx-runtime/index.d.js'
import * as _vue_runtime_core from '@vue/runtime-core'
import * as vue from 'vue'
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
  TemplateSelectorProps,
  TemplateStorageOptions,
  UseTemplateOptions,
  UseTemplateReturn,
  UseTemplateSelectorReturn,
} from './types/index.js'
import { TemplateLoader } from './core/loader.js'
import { TemplateManager } from './core/manager.js'
import { TemplateScanner } from './core/scanner.js'
import { createTemplateEnginePlugin } from './engine/plugin.js'
export { createDefaultTemplateEnginePlugin } from './engine/plugin.js'
import { useTemplate } from './vue/composables/useTemplate.js'
export { templateMap, templateMetadata } from './templates/index.js'
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
export { default as TemplateSelector } from './vue/components/TemplateSelector.js'
export { useTemplateSelector } from './vue/composables/useTemplateSelector.js'
export {
  default as TemplatePlugin,
  createTemplatePlugin,
  destroyGlobalTemplateManager,
  getGlobalTemplateManager,
  useTemplateManager,
} from './vue/plugin.js'
export { default as LoginDesktopClassic } from './templates/login/desktop/classic/index.js'
export { default as LoginDesktopDefault } from './templates/login/desktop/default/index.js'
export { default as LoginDesktopModern } from './templates/login/desktop/modern/index.js'
export { default as LoginMobileCard } from './templates/login/mobile/card/index.js'
export { default as LoginMobileDefault } from './templates/login/mobile/default/index.js'
export { default as LoginMobileSimple } from './templates/login/mobile/simple/index.js'
export { default as LoginTabletAdaptive } from './templates/login/tablet/adaptive/index.js'
export { default as LoginTabletDefault } from './templates/login/tablet/default/index.js'
export { default as LoginTabletSplit } from './templates/login/tablet/split/index.js'

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
        type: vue.PropType<DeviceType>
        default: undefined
      }
      template: {
        type: vue.PropType<string | Record<DeviceType, string>>
        required: false
        default: undefined
      }
      templateProps: {
        type: vue.PropType<Record<string, unknown>>
        default: () => {}
      }
      cache: {
        type: BooleanConstructor
        default: boolean
      }
      transition: {
        type: BooleanConstructor
        default: boolean
      }
      transitionDuration: {
        type: NumberConstructor
        default: number
      }
      transitionType: {
        type: vue.PropType<'fade' | 'slide' | 'scale' | 'flip'>
        default: string
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
    () => JSX.Element,
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
      'device-change': (event: { oldDevice: DeviceType; newDevice: DeviceType }) => true
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
          type: vue.PropType<DeviceType>
          default: undefined
        }
        template: {
          type: vue.PropType<string | Record<DeviceType, string>>
          required: false
          default: undefined
        }
        templateProps: {
          type: vue.PropType<Record<string, unknown>>
          default: () => {}
        }
        cache: {
          type: BooleanConstructor
          default: boolean
        }
        transition: {
          type: BooleanConstructor
          default: boolean
        }
        transitionDuration: {
          type: NumberConstructor
          default: number
        }
        transitionType: {
          type: vue.PropType<'fade' | 'slide' | 'scale' | 'flip'>
          default: string
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
        'onDevice-change'?: ((event: { oldDevice: DeviceType; newDevice: DeviceType }) => any) | undefined
      }>,
    {
      device: DeviceType
      template: string | Record<DeviceType, string>
      templateProps: Record<string, unknown>
      cache: boolean
      transition: boolean
      transitionDuration: number
      transitionType: 'fade' | 'slide' | 'scale' | 'flip'
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
  TemplatePlugin: vue.Plugin
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
