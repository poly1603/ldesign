/**
 * LDesign Editor - Vite + TypeScript 示例
 * 
 * 最简单的富文本编辑器使用示例
 */

import './style.css'
// 引入编辑器核心样式
import '@/styles/editor.css'
import '@/styles/reset.css'
import '@/styles/table.css'
import '@/styles/codeblock.css'

// 导入编辑器核心类
import { Editor } from '@/core/Editor'

// 导入插件
import { HeadingPlugin } from '@/plugins/text/heading'  // 重要！标题插件
import { MediaCommandsPlugin } from '@/plugins/media'
import { FormattingCommandsPlugin } from '@/plugins/formatting'
import { AIPlugin } from '@/plugins/ai'  // AI 插件
import FullscreenPlugin from '@/plugins/utils/fullscreen'
import HistoryPlugin from '@/plugins/utils/history'
import FindReplacePlugin from '@/plugins/utils/find-replace'
import ExportMarkdownPlugin from '@/plugins/utils/export-markdown'
import ContextMenuPlugin from '@/plugins/utils/context-menu'
import WordCountPlugin from '@/plugins/utils/word-count'

// 创建编辑器实例
const editor = new Editor({
  element: '#editor',
  placeholder: '开始输入内容...',
  autofocus: true,
  plugins: [
    // 标题插件 - 必须放在最前面！
    HeadingPlugin,
    // 媒体插件
    MediaCommandsPlugin,
    // 格式化插件
    FormattingCommandsPlugin,
    // AI 插件 - 提供 AI 功能
    AIPlugin,
    // 工具插件
    FullscreenPlugin,
    HistoryPlugin,
    FindReplacePlugin,
    ExportMarkdownPlugin,
    ContextMenuPlugin,
    WordCountPlugin
  ],
  content: `
    <h1>欢迎使用 LDesign Editor!</h1>
    <p>这是一个功能强大的富文本编辑器，支持：</p>
    <ul>
      <li><strong>文本格式化</strong>：加粗、斜体、下划线、删除线等</li>
      <li><strong>标题级别</strong>：H1-H6 标题</li>
      <li><strong>列表</strong>：有序列表、无序列表</li>
      <li><strong>表格</strong>：创建和编辑表格</li>
      <li><strong>媒体内容</strong>：图片、视频、音频</li>
      <li><strong>代码块</strong>：支持代码高亮</li>
      <li><strong>更多功能</strong>：链接、引用、对齐等</li>
    </ul>
    <p>点击工具栏上的按钮来体验各种功能！</p>
  `
})

// 暴露到全局方便调试
;(window as any).editor = editor

