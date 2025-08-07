// Vue 插件

import type { App } from 'vue'
import type { ThemeConfig } from '../types/theme'
import DynamicForm from '../components/DynamicForm.vue'
import FormInput from '../components/FormInput.vue'
import FormSelect from '../components/FormSelect.vue'
import { ThemeManager } from '../core/ThemeManager'

/**
 * 插件配置选项
 */
export interface FormPluginOptions {
  /** 组件名称前缀 */
  prefix?: string

  /** 默认主题 */
  theme?: ThemeConfig

  /** 是否注册所有组件 */
  registerAll?: boolean

  /** 自定义组件映射 */
  components?: Record<string, any>
}

/**
 * Vue 表单插件
 */
export const FormPlugin = {
  install(app: App, options: FormPluginOptions = {}) {
    const { prefix = 'L', theme, registerAll = true, components = {} } = options

    // 注册核心组件
    app.component(`${prefix}DynamicForm`, DynamicForm)

    if (registerAll) {
      // 注册所有内置组件
      app.component(`${prefix}FormInput`, FormInput)
      app.component(`${prefix}FormSelect`, FormSelect)
      // 可以继续添加其他组件
    }

    // 注册自定义组件
    Object.entries(components).forEach(([name, component]) => {
      app.component(`${prefix}${name}`, component)
    })

    // 初始化主题管理器
    const themeManager = new ThemeManager()
    if (theme) {
      themeManager.setTheme(theme)
    }

    // 提供全局属性
    app.config.globalProperties.$formTheme = themeManager
    app.provide('formTheme', themeManager)

    // 全局方法
    app.config.globalProperties.$createForm = (options: any) => {
      // 可以在这里添加创建表单的全局方法
      return options
    }
  },
}

export default FormPlugin
