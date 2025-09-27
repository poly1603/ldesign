import type { DocumentViewerOptions, DocumentInfo, DocumentContent } from '../../types'

/**
 * Vue 组件 Props
 */
export interface DocumentViewerProps {
  /** 文档文件或 URL */
  file?: File | string | ArrayBuffer
  /** 是否启用编辑功能 */
  editable?: boolean
  /** 工具栏配置 */
  toolbar?: DocumentViewerOptions['toolbar']
  /** 主题配置 */
  theme?: DocumentViewerOptions['theme']
  /** 容器高度 */
  height?: string | number
  /** 容器宽度 */
  width?: string | number
  /** 自定义类名 */
  class?: string
  /** 自定义样式 */
  style?: string | Record<string, any>
}

/**
 * Vue 组件 Emits
 */
export interface DocumentViewerEmits {
  /** 文档加载完成 */
  load: [document: DocumentInfo]
  /** 文档加载错误 */
  error: [error: Error]
  /** 文档内容变化 */
  change: [content: DocumentContent]
  /** 保存事件 */
  save: [content: DocumentContent]
  /** 组件准备就绪 */
  ready: []
}
