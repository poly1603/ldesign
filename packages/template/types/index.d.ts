import { JSX } from './node_modules/vue/jsx-runtime/index.d.js'
import * as _vue_runtime_core from '@vue/runtime-core'
import * as vue from 'vue'
import {
  TemplateManagerConfig,
  DeviceType,
  TemplateSelectorConfig,
  SlotConfig,
  TemplateProviderConfig,
} from './types/index.js'
export {
  LegacyTemplateRendererProps,
  TemplateChangeCallback,
  TemplateChangeEvent,
  TemplateConfig,
  TemplateLoadResult,
  TemplateMetadata,
  TemplatePathInfo,
  TemplatePluginOptions,
  TemplateProviderProps,
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
import { useTemplateSelector } from './vue/composables/useTemplateSelector.js'
import useTemplateProvider from './vue/composables/useTemplateProvider.js'
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
export { default as TemplateProvider } from './vue/components/TemplateProvider.js'
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
      selector: {
        type: vue.PropType<boolean | TemplateSelectorConfig>
        default: boolean
      }
      slots: {
        type: vue.PropType<SlotConfig[]>
        default: () => never[]
      }
      allowTemplateSwitch: {
        type: BooleanConstructor
        default: boolean
      }
      canSwitchTemplate: {
        type: vue.PropType<(template: string) => boolean>
        default: () => boolean
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
        selector: {
          type: vue.PropType<boolean | TemplateSelectorConfig>
          default: boolean
        }
        slots: {
          type: vue.PropType<SlotConfig[]>
          default: () => never[]
        }
        allowTemplateSwitch: {
          type: BooleanConstructor
          default: boolean
        }
        canSwitchTemplate: {
          type: vue.PropType<(template: string) => boolean>
          default: () => boolean
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
      selector: boolean | TemplateSelectorConfig
      slots: SlotConfig[]
      allowTemplateSwitch: boolean
      canSwitchTemplate: (template: string) => boolean
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
  TemplateSelector: _vue_runtime_core.DefineComponent<
    _vue_runtime_core.ExtractPropTypes<{
      category: {
        type: StringConstructor
        required: true
      }
      device: {
        type: vue.PropType<'desktop' | 'mobile' | 'tablet'>
        default: string
      }
      currentTemplate: {
        type: StringConstructor
        default: string
      }
      showPreview: {
        type: BooleanConstructor
        default: boolean
      }
      showSearch: {
        type: BooleanConstructor
        default: boolean
      }
      layout: {
        type: vue.PropType<'grid' | 'list'>
        default: string
      }
      columns: {
        type: NumberConstructor
        default: number
      }
      showInfo: {
        type: BooleanConstructor
        default: boolean
      }
      templates: {
        type: ArrayConstructor
        default: () => never[]
      }
      onTemplateChange: {
        type: vue.PropType<(template: string) => void>
      }
      onTemplatePreview: {
        type: vue.PropType<(template: string) => void>
      }
    }>,
    () => JSX.Element,
    {},
    {},
    {},
    _vue_runtime_core.ComponentOptionsMixin,
    _vue_runtime_core.ComponentOptionsMixin,
    ('template-change' | 'template-preview')[],
    'template-change' | 'template-preview',
    _vue_runtime_core.PublicProps,
    Readonly<
      _vue_runtime_core.ExtractPropTypes<{
        category: {
          type: StringConstructor
          required: true
        }
        device: {
          type: vue.PropType<'desktop' | 'mobile' | 'tablet'>
          default: string
        }
        currentTemplate: {
          type: StringConstructor
          default: string
        }
        showPreview: {
          type: BooleanConstructor
          default: boolean
        }
        showSearch: {
          type: BooleanConstructor
          default: boolean
        }
        layout: {
          type: vue.PropType<'grid' | 'list'>
          default: string
        }
        columns: {
          type: NumberConstructor
          default: number
        }
        showInfo: {
          type: BooleanConstructor
          default: boolean
        }
        templates: {
          type: ArrayConstructor
          default: () => never[]
        }
        onTemplateChange: {
          type: vue.PropType<(template: string) => void>
        }
        onTemplatePreview: {
          type: vue.PropType<(template: string) => void>
        }
      }>
    > &
      Readonly<{
        'onTemplate-change'?: ((...args: any[]) => any) | undefined
        'onTemplate-preview'?: ((...args: any[]) => any) | undefined
      }>,
    {
      device: 'desktop' | 'mobile' | 'tablet'
      currentTemplate: string
      showPreview: boolean
      showSearch: boolean
      layout: 'grid' | 'list'
      columns: number
      showInfo: boolean
      templates: unknown[]
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
  TemplateProvider: _vue_runtime_core.DefineComponent<
    _vue_runtime_core.ExtractPropTypes<{
      config: {
        type: vue.PropType<TemplateProviderConfig>
        default: () => {}
      }
    }>,
    () => JSX.Element,
    {},
    {},
    {},
    _vue_runtime_core.ComponentOptionsMixin,
    _vue_runtime_core.ComponentOptionsMixin,
    {},
    string,
    _vue_runtime_core.PublicProps,
    Readonly<
      _vue_runtime_core.ExtractPropTypes<{
        config: {
          type: vue.PropType<TemplateProviderConfig>
          default: () => {}
        }
      }>
    > &
      Readonly<{}>,
    {
      config: TemplateProviderConfig
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
  useTemplateSelector: typeof useTemplateSelector
  useTemplateProvider: typeof useTemplateProvider
  createTemplateEnginePlugin: typeof createTemplateEnginePlugin
}

declare const version = '0.1.0'

export {
  DeviceType,
  SlotConfig,
  TemplateLoader,
  TemplateManager,
  TemplateManagerConfig,
  TemplateProviderConfig,
  TemplateScanner,
  TemplateSelectorConfig,
  createTemplateEnginePlugin,
  createTemplateLoader,
  createTemplateManager,
  createTemplateScanner,
  _default as default,
  useTemplate,
  useTemplateProvider,
  useTemplateSelector,
  version,
}
