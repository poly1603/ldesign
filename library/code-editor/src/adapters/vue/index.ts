import type { App } from 'vue'
import CodeEditorComponent from './CodeEditor.vue'

// 导出组件
export const CodeEditor = CodeEditorComponent

// 导出 Composable
export { useCodeEditor, createEditor } from './useCodeEditor'

// 导出类型
export type * from '../../types'

// Vue 插件安装函数
export function install(app: App) {
  app.component('LdCodeEditor', CodeEditorComponent)
}

// 默认导出
export default {
  install,
  CodeEditor: CodeEditorComponent
}
