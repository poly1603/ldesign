/**
 * 表单组件类型定义入口文件
 * 
 * 统一导出所有类型定义，方便外部使用
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

// 核心类型
export type {
  FormState,
  FormConfig,
  FieldConfig,
  FieldState,
  ValidationRule,
  ValidationSchema,
  LayoutConfig,
  FieldLayout,
  FormActions,
  FormInstance,
  FieldInstance,
  FormEventCallbacks,
  ValidationEngineConfig,
  ValidationContext,
  ValidatorFunction
} from './core'

// 组件类型
export type {
  FormProps,
  FormItemProps,
  BaseInputProps,
  InputProps,
  TextareaProps,
  SelectProps,
  CheckboxProps,
  CheckboxGroupProps,
  RadioProps,
  RadioGroupProps,
  SwitchProps,
  DatePickerProps,
  UploadProps,
  ComponentMap,
  ComponentPropsMap,
} from './components'

// 验证类型
export type {
  ValidationResult,
  AsyncValidationResult,
  ValidationContext,
  ValidatorFunction,
  ValidationRuleType,
  ValidationTrigger,
  BuiltinValidatorConfig,
  ValidatorRegistry,
  ValidationError,
  ValidationSummary,
  ValidationOptions,
  AsyncValidationTask,
  ValidationState,
  ValidationEngine,
} from './validation'

// 导出常量
export {
  VALIDATION_PATTERNS,
  VALIDATION_MESSAGES,
} from './validation'

// 重新导出 Vue 相关类型，方便使用
export type {
  Component,
  VNode,
  Ref,
  ComputedRef,
  UnwrapRef,
} from 'vue'
