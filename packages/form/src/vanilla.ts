/**
 * @fileoverview Vanilla JavaScript entry point for @ldesign/form
 * @author LDesign Team
 */

// ================================
// Core type exports (essential only)
// ================================
export type {
  FormData,
  FormFieldValue,
  FormOptions,
  FormItemConfig,
  FormGroupConfig,
  FormValidationResult,
  FieldValidationResult,
  ValidationRule,
  VanillaFormOptions,
  VanillaFormInstance,
  FormInstance,
} from './types'

// ================================
// Core functionality exports
// ================================
export {
  EventEmitter,
  FormEngine,
  ValidationEngine,
  BuiltInValidators,
  LayoutCalculator,
} from './core'

// ================================
// Vanilla JavaScript API exports
// ================================
export {
  VanillaFormInstanceImpl,
  createFormInstance,
  FormInstanceClass,
  createSimpleForm,
  createFormFromHTML,
  formRegistry,
  createAndRegisterForm,
  getForm,
} from './vanilla/index'

// ================================
// Default export for UMD build
// ================================
const LDesignFormVanilla = {
  version: '1.0.0',
}

export default LDesignFormVanilla