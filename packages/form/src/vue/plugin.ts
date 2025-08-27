/**
 * Vue插件
 * 
 * 提供完整的Vue插件功能
 */

import type { App, Plugin } from 'vue'
import { installDirectives } from './directives'

// 导入组件
import DynamicForm from './components/DynamicForm.vue'
import FormField from './components/FormField.vue'
import FormActions from './components/FormActions.vue'
import FormDebugPanel from './components/FormDebugPanel.vue'

// 导入字段组件
import FormInput from './components/fields/FormInput.vue'
import FormTextarea from './components/fields/FormTextarea.vue'
import FormSelect from './components/fields/FormSelect.vue'
import FormRadio from './components/fields/FormRadio.vue'
import FormCheckbox from './components/fields/FormCheckbox.vue'
import FormSwitch from './components/fields/FormSwitch.vue'
import FormDatePicker from './components/fields/FormDatePicker.vue'
import FormTimePicker from './components/fields/FormTimePicker.vue'
import FormUpload from './components/fields/FormUpload.vue'

/**
 * 插件选项
 */
export interface DynamicFormPluginOptions {
  // 组件前缀
  prefix?: string
  // 是否安装指令
  directives?: boolean
  // 全局配置
  globalConfig?: {
    // 默认主题
    theme?: 'light' | 'dark'
    // 默认尺寸
    size?: 'small' | 'medium' | 'large'
    // 默认语言
    locale?: string
    // 调试模式
    debug?: boolean
  }
  // 自定义组件
  components?: Record<string, any>
  // 自定义验证器
  validators?: Record<string, any>
  // 自定义字段类型
  fieldTypes?: Record<string, any>
}

/**
 * 默认组件映射
 */
const defaultComponents = {
  DynamicForm,
  FormField,
  FormActions,
  FormDebugPanel,
  FormInput,
  FormTextarea,
  FormSelect,
  FormRadio,
  FormCheckbox,
  FormSwitch,
  FormDatePicker,
  FormTimePicker,
  FormUpload
}

/**
 * 创建插件
 */
export function createDynamicFormPlugin(
  options: DynamicFormPluginOptions = {}
): Plugin {
  return {
    install(app: App) {
      const {
        prefix = 'L',
        directives = true,
        globalConfig = {},
        components = {},
        validators = {},
        fieldTypes = {}
      } = options
      
      // 合并组件
      const allComponents = { ...defaultComponents, ...components }
      
      // 注册组件
      Object.entries(allComponents).forEach(([name, component]) => {
        const componentName = `${prefix}${name}`
        app.component(componentName, component)
      })
      
      // 安装指令
      if (directives) {
        installDirectives(app)
      }
      
      // 设置全局属性
      app.config.globalProperties.$dynamicForm = {
        version: '1.0.0',
        config: globalConfig,
        validators,
        fieldTypes
      }
      
      // 提供全局配置
      app.provide('dynamicFormConfig', globalConfig)
      app.provide('dynamicFormValidators', validators)
      app.provide('dynamicFormFieldTypes', fieldTypes)
      
      // 设置全局错误处理
      if (globalConfig.debug) {
        app.config.errorHandler = (error, instance, info) => {
          console.error('[DynamicForm Error]:', error)
          console.error('[Component Instance]:', instance)
          console.error('[Error Info]:', info)
        }
      }
    }
  }
}

/**
 * 默认插件实例
 */
export const DynamicFormPlugin = createDynamicFormPlugin()

/**
 * 便捷安装函数
 */
export function install(app: App, options?: DynamicFormPluginOptions) {
  const plugin = createDynamicFormPlugin(options)
  app.use(plugin)
}

/**
 * 默认导出
 */
export default DynamicFormPlugin

/**
 * Vue插件类型声明
 */
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $dynamicForm: {
      version: string
      config: any
      validators: Record<string, any>
      fieldTypes: Record<string, any>
    }
  }
  
  interface GlobalComponents {
    LDynamicForm: typeof DynamicForm
    LFormField: typeof FormField
    LFormActions: typeof FormActions
    LFormDebugPanel: typeof FormDebugPanel
    LFormInput: typeof FormInput
    LFormTextarea: typeof FormTextarea
    LFormSelect: typeof FormSelect
    LFormRadio: typeof FormRadio
    LFormCheckbox: typeof FormCheckbox
    LFormSwitch: typeof FormSwitch
    LFormDatePicker: typeof FormDatePicker
    LFormTimePicker: typeof FormTimePicker
    LFormUpload: typeof FormUpload
  }
}
