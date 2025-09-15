/**
 * Select 组件入口文件
 */

import type { App } from 'vue'
import Select from './Select.vue'
import type { SelectProps, SelectInstance } from './types'

// 为组件添加 install 方法，支持 Vue.use() 安装
const SelectComponent = Select as any
SelectComponent.install = (app: App): void => {
  app.component(Select.name || 'LSelect', Select)
}

// 导出组件
export default SelectComponent

// 导出类型
export type { SelectProps, SelectInstance }
export * from './types'