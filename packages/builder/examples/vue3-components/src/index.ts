/**
 * Vue 3 组件库示例
 * 
 * 展示如何使用 @ldesign/builder 构建 Vue 3 组件库
 */

import { App, Plugin } from 'vue'

// 导入组件
import Button from './components/Button.vue'
import Input from './components/Input.vue'
import Card from './components/Card.vue'

// 导出组件
export { Button, Input, Card }

// 导出组件类型
// export type { ButtonProps, ButtonEmits } from './components/Button.vue'
// export type { InputProps, InputEmits } from './components/Input.vue'
// export type { CardProps } from './components/Card.vue'

// 组件列表
const components = [
  Button,
  Input,
  Card
]

// 安装函数
export function install(app: App): void {
  components.forEach(component => {
    // 使用组件的 name 属性或 __name 属性作为组件名
    const name = component.name || component.__name
    if (name) {
      app.component(name, component)
    }
  })
}

// 插件对象（支持 app.use() 方式安装）
const LDesignComponents: Plugin = {
  install
}

// 默认导出
export default LDesignComponents

// 版本信息
export const version = '1.0.0'

// 工具函数
export const utils = {
  /**
   * 安装单个组件
   */
  installComponent(app: App, component: any, name?: string) {
    const componentName = name || component.name || component.__name
    if (componentName) {
      app.component(componentName, component)
    }
  },

  /**
   * 批量安装组件
   */
  installComponents(app: App, components: any[]) {
    components.forEach(component => {
      this.installComponent(app, component)
    })
  }
}
