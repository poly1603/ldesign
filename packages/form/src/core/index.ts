/**
 * 核心模块入口
 */

export { LayoutCalculator, createLayoutCalculator } from './layout-calculator'
export { FormRenderer } from './form-renderer'
export { FormStateManager } from './form-state-manager'
export {
  ValidationEngine,
  createValidationEngine,
  validators,
  type ValidationResult,
  type FieldValidationResult,
  type FormValidationResult,
  type ValidationEngineOptions,
  type ValidationFunction,
  type ValidatorDefinition,
} from './validation-engine'
export {
  FormManager,
  createFormManager,
  createForm,
  type FormManagerEvents,
} from './form-manager'