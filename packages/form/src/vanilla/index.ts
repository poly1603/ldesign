/**
 * @fileoverview Vanilla JavaScript module exports
 * @author LDesign Team
 */

export { VanillaFormInstanceImpl } from './VanillaFormInstance'
export {
  createFormInstance,
  FormInstanceClass,
  createSimpleForm,
  createFormFromHTML,
  formRegistry,
  createAndRegisterForm,
  getForm,
} from './factory'

// Re-export core functionality for vanilla usage
export {
  FormEngine,
  ValidationEngine,
  LayoutCalculator,
  EventEmitter,
} from '../core'