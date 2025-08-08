// @ldesign/form - Vue 3 表单系统主入口文件
// 支持 Vue 组件、Composition API Hook 以及原生 JavaScript 三种使用方式

// Vue 组件导出
export { default as DynamicForm } from './components/DynamicForm.vue'

// Composition API Hook 导出
export { useForm } from './composables/useForm'

// 内置表单组件导出
export { default as FormInput } from './components/FormInput.vue'
export { default as FormTextarea } from './components/FormTextarea.vue'
export { default as FormSelect } from './components/FormSelect.vue'
export { default as FormRadio } from './components/FormRadio.vue'
export { default as FormCheckbox } from './components/FormCheckbox.vue'
export { default as FormDatePicker } from './components/FormDatePicker.vue'
export { default as FormTimePicker } from './components/FormTimePicker.vue'
export { default as FormSwitch } from './components/FormSwitch.vue'
export { default as FormSlider } from './components/FormSlider.vue'
export { default as FormRate } from './components/FormRate.vue'

// 类型定义导出
export type * from './types'

// 核心功能导出（供高级用户使用）
export { FormStateManager } from './core/FormStateManager'
export { ValidationEngine } from './core/ValidationEngine'
export { LayoutCalculator } from './core/LayoutCalculator'

// 工具函数导出
export { createFormInstance, FormInstance } from './vanilla'
export type { VanillaFormInstanceConfig as FormInstanceConfig } from './vanilla'

// 别名导出，兼容性
export { FormInstance as FormManager } from './vanilla'

// Vue 插件导出
export { FormPlugin } from './composables/plugin'

// 版本信息
export const version = '1.0.0'

// 导入样式
import './styles/index.css'

// 默认导出插件
export { FormPlugin as default } from './composables/plugin'
