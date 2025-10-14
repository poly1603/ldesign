/**
 * LDesign Editor - Vite + TypeScript Demo
 * 
 * 这个示例展示了如何在 Vite + TypeScript 项目中使用 LDesign Editor
 */

import './style.css'
import './styles/media-dialog.css'

// 直接使用核心编辑器和组件
import { Editor } from '@/core/Editor'
import { Toolbar } from '@/ui/Toolbar'
import { DEFAULT_TOOLBAR_ITEMS } from '@/ui/defaultToolbar'
import { MediaPlugin } from './plugins/media-v2'

// 导入所有插件
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikePlugin,
  CodePlugin,
  ClearFormatPlugin,
  HeadingPlugin,
  BulletListPlugin,
  OrderedListPlugin,
  TaskListPlugin,
  BlockquotePlugin,
  CodeBlockPlugin,
  LinkPlugin,
  // ImagePlugin, // 由 MediaPlugin 处理图片插入
  TablePlugin,
  HistoryPlugin,
  AlignPlugin,
  TextColorPlugin,
  BackgroundColorPlugin,
  FontSizePlugin,
  FontFamilyPlugin,
  SuperscriptPlugin,
  SubscriptPlugin,
  HorizontalRulePlugin,
  IndentPlugin,
  FullscreenPlugin,
  LineHeightPlugin,
  TextTransformPlugin,
  FindReplacePlugin,
  WordCountPlugin,
  ExportMarkdownPlugin,
  ContextMenuPlugin
} from '@/plugins'

console.log('🚀 正在初始化 LDesign Editor...')

// 获取容器元素
const container = document.querySelector('#editor') as HTMLElement
if (!container) {
  throw new Error('Editor container not found')
}

// 创建编辑器容器结构
container.innerHTML = ''
container.classList.add('ldesign-editor-wrapper')

// 创建工具栏容器
const toolbarContainer = document.createElement('div')
toolbarContainer.id = 'toolbar'
toolbarContainer.className = 'ldesign-toolbar'
container.appendChild(toolbarContainer)

// 创建编辑器内容容器
const editorContainer = document.createElement('div')
editorContainer.className = 'ldesign-editor-content'
editorContainer.style.minHeight = '500px'
container.appendChild(editorContainer)

// 初始化编辑器
const editor = new Editor({
  element: editorContainer,
  content: `
    <h1>欢迎使用 LDesign Editor！</h1>
    <p>这是一个使用 <strong>Vite + TypeScript</strong> 构建的富文本编辑器演示。</p>
    
    <h2>功能特性</h2>
    <ul>
      <li>🎨 丰富的文本格式化选项</li>
      <li>🎼️ 图片插入与编辑</li>
      <li>📋 表格支持</li>
      <li>🔗 超链接管理</li>
      <li>📝 代码块高亮</li>
      <li>⌨️ 强大的快捷键系统</li>
    </ul>

    <h2>开始使用</h2>
    <p>尝试在编辑器中输入内容，使用工具栏或快捷键来格式化文本。</p>
    
    <blockquote>
      <p>💡 提示：按 <code>Ctrl+B</code> 可以快速加粗文本！</p>
    </blockquote>

    <h2>代码示例</h2>
    <pre><code>// 直接使用核心编辑器
const editor = new Editor({
  element: '#my-editor',
  placeholder: '开始输入...',
  plugins: [...] // 加载需要的插件
});

// 创建工具栏
const toolbar = new Toolbar(editor, {
  container: '#toolbar',
  items: DEFAULT_TOOLBAR_ITEMS
});</code></pre>

    <h2>表格示例</h2>
    <table>
      <tr>
        <th>功能</th>
        <th>描述</th>
        <th>快捷键</th>
      </tr>
      <tr>
        <td>加粗</td>
        <td>让文字更重</td>
        <td>Ctrl+B</td>
      </tr>
      <tr>
        <td>斜体</td>
        <td>倾斜文字</td>
        <td>Ctrl+I</td>
      </tr>
    </table>

    <p>开始你的创作之旅吧！✨</p>
  `,
  placeholder: '开始输入内容...',
  autofocus: true,
  onChange: (html) => {
    console.log('📝 编辑器内容已更新')
  },
  // 加载所有插件
  plugins: [
    // 基础格式化
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    StrikePlugin,
    CodePlugin,
    ClearFormatPlugin,
    
    // 标题和块级元素
    HeadingPlugin,
    BlockquotePlugin,
    CodeBlockPlugin,
    
    // 列表
    BulletListPlugin,
    OrderedListPlugin,
    TaskListPlugin,
    
    // 节点插件
    LinkPlugin,
    // ImagePlugin, // 由 MediaPlugin 处理图片插入
    TablePlugin,
    HorizontalRulePlugin,
    
    // 文本样式
    AlignPlugin,
    TextColorPlugin,
    BackgroundColorPlugin,
    FontSizePlugin,
    FontFamilyPlugin,
    SuperscriptPlugin,
    SubscriptPlugin,
    IndentPlugin,
    LineHeightPlugin,
    TextTransformPlugin,
    
    // 功能插件
    HistoryPlugin,
    FullscreenPlugin,
    FindReplacePlugin,
    WordCountPlugin,
    ExportMarkdownPlugin,
    ContextMenuPlugin
  ]
})

// 立即初始化媒体插件，覆盖默认行为
const mediaPlugin = new MediaPlugin()
mediaPlugin.initialize(editor)
console.log('📦 媒体插件已加载 - 支持本地文件选择和网络URL输入')

// 初始化工具栏
const toolbar = new Toolbar(editor, {
  container: toolbarContainer,
  items: DEFAULT_TOOLBAR_ITEMS // 使用默认工具栏配置
})

console.log('🎨 编辑器和工具栏已初始化！')


// 暴露到全局，方便调试
;(window as any).editor = editor
;(window as any).toolbar = toolbar
;(window as any).__ldesignToolbar = toolbar
;(window as any).mediaPlugin = mediaPlugin

// 添加基础样式
const style = document.createElement('style')
style.textContent = `
  .ldesign-editor-wrapper {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    background: white;
  }

  .ldesign-toolbar {
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
    padding: 8px;
  }

  .ldesign-editor-content {
    padding: 16px;
    overflow-y: auto;
  }

  .ldesign-editor-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
  }

  .ldesign-editor-toolbar-button {
    width: 32px;
    height: 32px;
    border: 1px solid transparent;
    background: transparent;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    color: #475569;
  }

  .ldesign-editor-toolbar-button:hover {
    background: #e2e8f0;
    color: #1e293b;
  }

  .ldesign-editor-toolbar-button.active {
    background: #3b82f6;
    color: white;
  }

  .ldesign-editor-toolbar-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ldesign-editor-toolbar-separator {
    width: 1px;
    height: 24px;
    background: #cbd5e1;
    margin: 0 4px;
  }
`
document.head.appendChild(style)

console.log('✅ LDesign Editor 初始化完成！')
console.log('💡 提示：')
console.log('   - window.editor: Editor 实例')
console.log('   - window.toolbar: Toolbar 实例')

// 调试工具栏
setTimeout(() => {
  console.log('\n🔍 检查工具栏状态...')
  if (toolbar) {
    console.log('✅ 工具栏已创建')
    const items = toolbar.getDefaultItems()
    console.log(`📦 工具栏按钮数量: ${items.length}`)
    console.log('🔧 工具栏按钮列表:')
    items.slice(0, 10).forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.name}: ${item.title}`)
    })
    if (items.length > 10) {
      console.log(`   ... 和其他 ${items.length - 10} 个按钮`)
    }
  }
}, 500)
