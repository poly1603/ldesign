/**
 * @ldesign/form Lit 适配器
 * 
 * @description
 * 为 Lit 框架提供表单组件支持，通过 Web Components 技术渲染表单
 * 
 * @author LDESIGN Team
 * @version 1.0.0
 */

export { LDesignForm } from './components/form'
export { LDesignFormItem } from './components/form-item'
export { LDesignQueryForm } from './components/query-form'
export { LDesignButton } from './components/button'
export { LDesignInput } from './components/input'
export { LDesignSelect } from './components/select'
export { LDesignTextarea } from './components/textarea'
export { LDesignCheckbox } from './components/checkbox'

// 导出类型定义
export type {
  LitFormConfig,
  LitFormItemConfig,
  LitQueryFormConfig,
  LitFormEvents,
  LitFormState
} from './types'

// 导出工具函数
export { createLitForm, registerLitComponents } from './utils'

// 导出 hooks
export { useLitForm } from './hooks/use-form'
export { useLitFormItem } from './hooks/use-form-item'
export { useLitQueryForm } from './hooks/use-query-form'
