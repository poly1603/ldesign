/**
 * Vue组件入口文件
 * 
 * 导出所有Vue组件和相关功能
 */

import type { App } from 'vue'

// 导出主要组件
export { default as DynamicForm } from './components/DynamicForm.vue'
export { default as FormField } from './components/FormField.vue'
export { default as FormActions } from './components/FormActions.vue'
export { default as FormDebugPanel } from './components/FormDebugPanel.vue'

// 导出字段组件
export { default as FormInput } from './components/fields/FormInput.vue'
export { default as FormTextarea } from './components/fields/FormTextarea.vue'
export { default as FormSelect } from './components/fields/FormSelect.vue'
export { default as FormRadio } from './components/fields/FormRadio.vue'
export { default as FormCheckbox } from './components/fields/FormCheckbox.vue'
export { default as FormSwitch } from './components/fields/FormSwitch.vue'
export { default as FormDatePicker } from './components/fields/FormDatePicker.vue'
export { default as FormTimePicker } from './components/fields/FormTimePicker.vue'
export { default as FormUpload } from './components/fields/FormUpload.vue'

// 导出组合式函数
export * from './composables'

// 导出指令
export * from './directives'

// 导出插件
export * from './plugin'

// 导出类型
export type {
  FormComponentProps,
  FormComponentEmits,
  FormFieldComponentProps,
  FormFieldComponentEmits
} from '../types'

// 组件列表
const components = {
  DynamicForm: () => import('./components/DynamicForm.vue'),
  FormField: () => import('./components/FormField.vue'),
  FormActions: () => import('./components/FormActions.vue'),
  FormDebugPanel: () => import('./components/FormDebugPanel.vue'),
  FormInput: () => import('./components/fields/FormInput.vue'),
  FormTextarea: () => import('./components/fields/FormTextarea.vue'),
  FormSelect: () => import('./components/fields/FormSelect.vue'),
  FormRadio: () => import('./components/fields/FormRadio.vue'),
  FormCheckbox: () => import('./components/fields/FormCheckbox.vue'),
  FormSwitch: () => import('./components/fields/FormSwitch.vue'),
  FormDatePicker: () => import('./components/fields/FormDatePicker.vue'),
  FormTimePicker: () => import('./components/fields/FormTimePicker.vue'),
  FormUpload: () => import('./components/fields/FormUpload.vue')
}

// 安装函数
export function install(app: App, options: any = {}) {
  // 注册组件
  Object.entries(components).forEach(([name, component]) => {
    app.component(name, component)
  })
  
  // 注册全局属性
  app.config.globalProperties.$dynamicForm = {
    version: '1.0.0',
    options
  }
  
  // 提供全局配置
  app.provide('dynamicFormOptions', options)
}

// 默认导出
export default {
  install,
  version: '1.0.0'
}

// Vue插件类型声明
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $dynamicForm: {
      version: string
      options: any
    }
  }
}
