// 新的模板系统
export {
  useTemplate,
  registerTemplate,
  templateConfigs,
  useTemplateSwitch,
  type TemplateInfo,
  type DeviceType,
  type UseTemplateSwitchOptions,
  type UseTemplateSwitchReturn
} from './composables/useTemplateSystem'
export { TemplateRenderer } from './components/TemplateRenderer'

// 自动注册所有模板
import './templateRegistry'

// 旧的系统（保持兼容性）
export { useTemplate as useTemplateOld } from './composables/useTemplate'
export { templateDirective, registerTemplateDirective } from './directives/template'
export { TemplatePlugin, getGlobalTemplateManager } from './plugins'

// 导出已有的登录模板（保持兼容性）
export { default as ClassicLoginTemplate } from '../templates/login/desktop/classic/index'
export { default as ModernLoginTemplate } from '../templates/login/desktop/modern/index'
export { default as DefaultLoginTemplate } from '../templates/login/desktop/default/index'

// 类型定义
export type {
  TemplateRendererProps,
  TemplateDirectiveBinding,
  UseTemplateOptions,
  UseTemplateReturn,
  TemplatePluginOptions
} from './types'

// 设备类型
export type { DeviceType } from '../utils/device'

// 默认导出插件
export { TemplatePlugin as default } from './plugins'
