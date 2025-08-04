/**
 * 适配器模块入口
 */

// 原生 JavaScript 适配器
export {
  NativeFormAdapter,
  createNativeForm,
  autoInitForms,
  type NativeAdapterOptions,
} from './native'

// Vue 3 适配器 - 暂时注释掉，因为有语法错误
// export {
//   AdaptiveForm,
//   useAdaptiveForm,
//   FormProvider,
//   FormProviderKey,
//   useFormProvider,
//   createFormPlugin,
//   type UseAdaptiveFormReturn,
//   type FormProviderState,
//   type FormPluginOptions,
// } from './vue'

// 重新导出类型
export type {
  FormConfig,
  FormManagerOptions,
  AdaptiveFormProps,
  AdaptiveFormEmits,
} from '../types'