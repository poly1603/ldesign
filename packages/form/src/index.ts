/**
 * 动态表单库主入口文件
 * 
 * 提供完整的表单解决方案，包括核心引擎、Vue组件、类型定义等
 */

// 导出核心功能
export * from './core'

// 导出Vue组件
export * from './vue'

// 导出类型定义
export * from './types'

// 导出工具函数
export * from './utils'

// 导出版本信息
export const VERSION = '1.0.0'

// 导出默认配置
export const DEFAULT_CONFIG = {
  // 表单默认配置
  form: {
    mode: 'edit' as const,
    size: 'medium' as const,
    theme: 'light' as const,
    layout: {
      type: 'grid' as const,
      columns: 3,
      gap: 16
    },
    validation: {
      enabled: true,
      trigger: 'change' as const,
      showStatus: true,
      showMessage: true
    }
  },
  
  // 字段默认配置
  field: {
    size: 'medium' as const,
    validateOnChange: true,
    validateOnBlur: true,
    showLabel: true,
    showHelp: false
  },
  
  // 布局默认配置
  layout: {
    responsive: {
      enabled: true,
      breakpoints: {
        xs: { value: 0, name: 'xs', columns: 1 },
        sm: { value: 576, name: 'sm', columns: 2 },
        md: { value: 768, name: 'md', columns: 3 },
        lg: { value: 992, name: 'lg', columns: 4 },
        xl: { value: 1200, name: 'xl', columns: 5 }
      },
      defaultBreakpoint: 'md' as const
    },
    calculation: {
      autoCalculate: true,
      minColumnWidth: 300,
      maxColumns: 6,
      minColumns: 1
    }
  },
  
  // 验证默认配置
  validation: {
    enabled: true,
    trigger: 'change' as const,
    stopOnFirstError: false,
    timeout: 5000,
    cache: {
      enabled: true,
      ttl: 300000,
      maxSize: 100
    }
  }
} as const

// 导出便捷创建函数
export { createFormEngine, createEventBus } from './core'
export { useForm, useFormField, useFormValidation, useFormLayout } from './vue/composables'

// 导出Vue插件
export { default as DynamicFormPlugin, createDynamicFormPlugin } from './vue/plugin'

// 导出主要组件（用于按需导入）
export { default as DynamicForm } from './vue/components/DynamicForm.vue'
export { default as FormField } from './vue/components/FormField.vue'
export { default as FormActions } from './vue/components/FormActions.vue'

// 导出字段组件
export { default as FormInput } from './vue/components/fields/FormInput.vue'
export { default as FormTextarea } from './vue/components/fields/FormTextarea.vue'
export { default as FormSelect } from './vue/components/fields/FormSelect.vue'
export { default as FormRadio } from './vue/components/fields/FormRadio.vue'
export { default as FormCheckbox } from './vue/components/fields/FormCheckbox.vue'
export { default as FormSwitch } from './vue/components/fields/FormSwitch.vue'
export { default as FormDatePicker } from './vue/components/fields/FormDatePicker.vue'
export { default as FormTimePicker } from './vue/components/fields/FormTimePicker.vue'
export { default as FormUpload } from './vue/components/fields/FormUpload.vue'

// 导出指令
export * from './vue/directives'

// 默认导出（Vue插件）
export default DynamicFormPlugin
