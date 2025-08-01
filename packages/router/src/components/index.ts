// 组件安装函数
import type { App } from 'vue'
import { RouterLink } from './RouterLink'
import { RouterView } from './RouterView'

export { RouterLink, default as RouterLinkDefault } from './RouterLink'
export { RouterView, default as RouterViewDefault } from './RouterView'

// 导出组件类型
export type { RouterLinkProps, RouterViewProps } from './types'

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
