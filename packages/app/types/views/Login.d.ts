import * as vue from 'vue'

declare const _default: vue.DefineComponent<
  {},
  {
    TemplateRenderer: _vue_runtime_core.DefineComponent<
      _vue_runtime_core.ExtractPropTypes<{
        category: {
          type: StringConstructor
          required: true
        }
        templateId: {
          type: StringConstructor
          default: undefined
        }
        deviceType: {
          type: StringConstructor
          default: undefined
        }
        showSelector: {
          type: BooleanConstructor
          default: boolean
        }
        selectorPosition: {
          type: StringConstructor
          default: string
        }
        autoDetectDevice: {
          type: BooleanConstructor
          default: boolean
        }
        config: {
          type: ObjectConstructor
          default: () => {}
        }
        lazy: {
          type: BooleanConstructor
          default: boolean
        }
        preload: {
          type: BooleanConstructor
          default: boolean
        }
        placeholderHeight: {
          type: NumberConstructor
          default: number
        }
        enablePerformanceMonitor: {
          type: BooleanConstructor
          default: boolean
        }
      }>,
      () => any,
      {},
      {},
      {},
      _vue_runtime_core.ComponentOptionsMixin,
      _vue_runtime_core.ComponentOptionsMixin,
      (
        | 'template-change'
        | 'device-change'
        | 'render-error'
        | 'performance-update'
        | 'load-start'
        | 'load-end'
      )[],
      | 'template-change'
      | 'device-change'
      | 'render-error'
      | 'performance-update'
      | 'load-start'
      | 'load-end',
      _vue_runtime_core.PublicProps,
      any,
      {
        placeholderHeight: number
        lazy: boolean
        templateId: string
        deviceType: string
        showSelector: boolean
        selectorPosition: string
        autoDetectDevice: boolean
        config: Record<string, any>
        preload: boolean
        enablePerformanceMonitor: boolean
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
    handleLogin: (data: any) => Promise<void>
  },
  {},
  {},
  {},
  vue.ComponentOptionsMixin,
  vue.ComponentOptionsMixin,
  {},
  string,
  vue.PublicProps,
  Readonly<{}> & Readonly<{}>,
  {},
  {},
  {},
  {},
  string,
  vue.ComponentProvideOptions,
  true,
  {},
  any
>

export { _default as default }
