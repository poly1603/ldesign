/**
 * @ldesign/component - 现代化 Vue 3 组件库
 *
 * 基于 TypeScript + Vite + ESM 构建的高质量组件库
 * 遵循 TDesign 设计规范，提供完整的类型支持和测试覆盖
 *
 * @author LDesign Team
 * @version 1.0.0
 */

import type { App } from 'vue'

// 导入组件
import Button from './components/button'
import Icon from './components/icon'
import Input from './components/input'

// 导入样式
import './styles/index.less'

// 导出所有组件类型
export * from './types'

// 导出工具函数
export * from './utils'

// 导出组件
export { default as LButton } from './components/button'
export { default as LIcon } from './components/icon'
export { default as LInput } from './components/input'
// export { default as LCard } from './components/card'
// export { default as LLoading } from './components/loading'
// export { default as LSelect } from './components/select'
// export { default as LForm } from './components/form'
// export { default as LModal } from './components/modal'
// export { default as LTable } from './components/table'

// 导出组件类型
export type * from './components/button/types'
export type * from './components/icon/types'
export type * from './components/input/types'

// 所有组件列表
const components = [
  Button,
  Icon,
  Input
]

// 安装函数
const install = (app: App): void => {
  components.forEach(component => {
    if (component.install) {
      app.use(component)
    } else if (component.name) {
      app.component(component.name, component)
    }
  })
}

// 导出组件库版本信息
export const version = '1.0.0'

// 导出组件库名称
export const name = '@ldesign/component'

// 默认导出（用于全量引入）
export default {
  version,
  name,
  install
}
