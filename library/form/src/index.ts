/**
 * @ldesign/form - Main Entry Point
 * 主入口文件
 */

// 核心模块
export * from './core'

// 工具函数
export * from './utils'

// 国际化
export * from './i18n'

// 默认导出
export { createForm } from './core/form-core'

// 类型导出
export type {
  FormCore,
  FormOptions,
  FormConfig,
  FormValues,
  FormState,
  FieldConfig,
  FieldState,
  ValidationRule,
  ValidatorFunction,
  LayoutConfig,
  ExpandConfig,
  ButtonConfig
} from './utils/types'
