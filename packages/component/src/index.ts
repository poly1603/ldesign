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
import Card from './components/card'
import Loading from './components/loading'
import Select from './components/select'
import Badge from './components/badge'
import Tag from './components/tag'
import Checkbox from './components/checkbox'
import Radio from './components/radio'
import Switch from './components/switch'
import Alert from './components/alert'
import Progress from './components/progress'

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
export { default as LCard } from './components/card'
export { default as LLoading } from './components/loading'
export { default as LSelect } from './components/select'
export { default as LBadge } from './components/badge'
export { default as LTag } from './components/tag'
export { default as LCheckbox } from './components/checkbox'
export { default as LRadio } from './components/radio'
export { default as LSwitch } from './components/switch'
export { default as LAlert } from './components/alert'
export { default as LProgress } from './components/progress'

// 导出组件类型
export type * from './components/button/types'
export type * from './components/icon/types'
export type * from './components/input/types'
export type * from './components/card/types'
export type * from './components/loading/types'
export type * from './components/select/types'
export type * from './components/badge/types'
export type * from './components/tag/types'
export type * from './components/checkbox/types'
export type * from './components/radio/types'
export type * from './components/switch/types'
export type * from './components/alert/types'
export type * from './components/progress/types'

// 所有组件列表
const components = [
  Button,
  Icon,
  Input,
  Card,
  Loading,
  Select,
  Badge,
  Tag,
  Checkbox,
  Radio,
  Switch,
  Alert,
  Progress
]

// 安装函数
const install = (app: App): void => {
  components.forEach(component => {
    if ((component as any).install) {
      app.use(component as any)
    } else if ((component as any).name) {
      app.component((component as any).name, component)
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
