/**
 * Vue3 PDF预览器适配器
 * 提供Vue3组件和Hooks
 */

import type { App } from 'vue'
import PdfViewer from './PdfViewer'
import { usePdfViewer, usePdfSearch, usePdfThumbnails } from './hooks'

// 导出组件
export { PdfViewer }

// 导出Hooks
export { usePdfViewer, usePdfSearch, usePdfThumbnails }

// 导出类型
export type {
  UsePdfViewerOptions,
  UsePdfViewerReturn,
} from './hooks'

// Vue插件安装函数
export function install(app: App): void {
  app.component('PdfViewer', PdfViewer)
}

// 默认导出
export default {
  PdfViewer,
  usePdfViewer,
  usePdfSearch,
  usePdfThumbnails,
  install,
}

// 自动安装（如果在浏览器环境中通过script标签引入）
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}
