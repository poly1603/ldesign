/**
 * 组件安装函数
 * 用于在 Vue 应用中全局注册组件
 */

import type { App } from 'vue'
import LSelect from './select/LSelect.vue'
import LPopup from './popup/LPopup.vue'
import LDialog from './dialog/LDialog.vue'

export interface ComponentInstallOptions {
  /** 组件名称前缀 */
  prefix?: string
  /** 要安装的组件列表，如果不指定则安装所有组件 */
  components?: ('select' | 'popup' | 'dialog')[]
}

/**
 * 安装所有组件
 */
export function installComponents(app: App, options: ComponentInstallOptions = {}) {
  const { prefix = 'L', components } = options

  const componentMap = {
    select: LSelect,
    popup: LPopup,
    dialog: LDialog
  }

  const componentsToInstall = components || Object.keys(componentMap) as (keyof typeof componentMap)[]

  componentsToInstall.forEach(componentName => {
    const component = componentMap[componentName]
    if (component) {
      const name = `${prefix}${componentName.charAt(0).toUpperCase() + componentName.slice(1)}`
      app.component(name, component)
    }
  })
}

/**
 * 创建组件安装插件
 */
export function createComponentPlugin(options: ComponentInstallOptions = {}) {
  return {
    install(app: App) {
      installComponents(app, options)
    }
  }
}

export default {
  install: installComponents
}
