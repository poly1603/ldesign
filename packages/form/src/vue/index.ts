/**
 * @fileoverview Vue module exports
 * @author LDesign Team
 */

export { FormPlugin, createFormPlugin, install, version } from './plugin'
export { vFormValidate, vFormFocus, directives } from './directives'

// Re-export composables for convenience
export {
  useForm,
  useFormItem,
  useFormValidation,
  useFormLayout,
} from '../composables'