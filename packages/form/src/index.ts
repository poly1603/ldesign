/**
 * @fileoverview Main entry point for @ldesign/form
 * @author LDesign Team
 */

// ================================
// Type exports
// ================================
export type * from './types'

// ================================
// Core exports
// ================================
export {
  EventEmitter,
  FormEngine,
  ValidationEngine,
  BuiltInValidators,
  LayoutCalculator,
} from './core'

// ================================
// Vue 3 exports
// ================================
export {
  useForm,
  useFormItem,
  useFormValidation,
  useFormLayout,
} from './composables'

export {
  FormPlugin,
  createFormPlugin,
  install,
  version,
  vFormValidate,
  vFormFocus,
  directives,
} from './vue'

// ================================
// Vanilla JavaScript exports
// ================================
export {
  createFormInstance,
  FormInstanceClass,
  createSimpleForm,
  createFormFromHTML,
  formRegistry,
  createAndRegisterForm,
  getForm,
} from './vanilla'

// ================================
// Default export for Vue plugin
// ================================
export { FormPlugin as default } from './vue'