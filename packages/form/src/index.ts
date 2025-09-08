/**
 * LDesign Form 组件库入口文件
 * 
 * 提供完整的表单解决方案，包括：
 * - 表单组件
 * - 验证系统
 * - 布局系统
 * - 自定义 Hooks
 * - 工具函数
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { App } from 'vue'

// 导出所有组件
export * from './components'

// 导出所有 Hooks
export * from './hooks'

// 导出核心模块
export * from './core'

// 导出工具函数
export * from './utils'

// 导出类型定义
export * from './types'

// 导出样式
import './styles/index.less'

// 组件列表
import {
  Form,
  FormItem,
  Input,
  Textarea,
  Select,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Switch,
  DatePicker,
  Upload,
} from './components'

const components = [
  Form,
  FormItem,
  Input,
  Textarea,
  Select,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Switch,
  DatePicker,
  Upload,
]

/**
 * 安装插件函数
 * 
 * @param app Vue 应用实例
 * @param options 安装选项
 */
export function install(app: App, options?: Record<string, any>): void {
  // 注册所有组件
  components.forEach(component => {
    if (component.name) {
      app.component(component.name, component)
    }
  })

  // 设置全局配置
  if (options) {
    app.config.globalProperties.$ldesignForm = options
  }
}

// 默认导出
export default {
  install,
  version: '1.0.0',
}

// 单独导出组件，支持按需引入
export {
  Form,
  FormItem,
  Input,
  Textarea,
  Select,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Switch,
  DatePicker,
  Upload,
}
