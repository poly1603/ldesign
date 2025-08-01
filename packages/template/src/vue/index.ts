// 新的模板系统
// 自动注册所有模板
import './templateRegistry'

// 导出已有的登录模板（保持兼容性）
export { default as ClassicLoginTemplate } from '../templates/login/desktop/classic/index'
export { default as DefaultLoginTemplate } from '../templates/login/desktop/default/index'

export { default as ModernLoginTemplate } from '../templates/login/desktop/modern/index'
// 设备类型
export type { DeviceType } from '../utils/device'
export { TemplateRenderer } from './components/TemplateRenderer'

// 旧的系统（保持兼容性）
export { useTemplate as useTemplateOld } from './composables/useTemplate'
export {
  type DeviceType,
  registerTemplate,
  templateConfigs,
  type TemplateInfo,
  useTemplate,
  useTemplateSwitch,
  type UseTemplateSwitchOptions,
  type UseTemplateSwitchReturn,
} from './composables/useTemplateSystem'
export { registerTemplateDirective, templateDirective } from './directives/template'

export { getGlobalTemplateManager, TemplatePlugin } from './plugins'

// 默认导出插件
export { TemplatePlugin as default } from './plugins'

// 类型定义
export type {
  TemplateDirectiveBinding,
  TemplatePluginOptions,
  TemplateRendererProps,
  UseTemplateOptions,
  UseTemplateReturn,
} from './types'
