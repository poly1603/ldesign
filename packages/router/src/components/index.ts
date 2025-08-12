// 组件安装函数
// Vue App 类型定义
import { RouterLink } from './RouterLink'
import { RouterView } from './RouterView'

export interface App {
  use: (plugin: any, ...options: any[]) => App
  mount: (rootContainer: any) => any
  config: any
  component: (name: string, component: any) => App
  provide: (key: any, value: any) => App
  onUnmount?: (fn: () => void) => void
}

// 导出增强组件插件
export {
  createDefaultConfirmDialog,
  createDefaultEventTracker,
  createDefaultLayoutResolver,
  createDefaultPermissionChecker,
  createEnhancedComponentsPlugin,
  createEnhancementConfig,
  EnhancedComponentsPlugin,
  setupEnhancedComponents,
} from '../plugins/components'
export type { EnhancedComponentsPluginOptions } from '../plugins/components'

export { RouterLink, default as RouterLinkDefault } from './RouterLink'

export { RouterView, default as RouterViewDefault } from './RouterView'
// 导出组件类型
export type {
  ComponentEnhancementConfig,
  ComponentSize,
  EnhancedRouterLinkProps,
  EnhancedRouterViewProps,
  LinkVariant,
  PreloadStrategy,
  RouterLinkProps,
  RouterViewProps,
  TransitionConfig,
} from './types'

export function installComponents(app: App): void {
  app.component('RouterView', RouterView)
  app.component('RouterLink', RouterLink)
}

// 默认导出
export default {
  RouterView,
  RouterLink,
  install: installComponents,
}
