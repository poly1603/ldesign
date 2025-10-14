/**
 * LDesign Editor - Vite + TypeScript Demo
 * 
 * 这个示例展示了如何在 Vite + TypeScript 项目中使用 LDesign Editor
 */

import './style.css'
import './styles/media-dialog.css'

// 使用简化版编辑器，自动配置完整工具栏
import { SimpleEditor } from '@/SimpleEditor'
import { MediaPlugin } from './plugins/media'

console.log('🚀 正在初始化 LDesign Editor...')

// 使用简化版编辑器初始化
const simpleEditor = new SimpleEditor({
  element: '#editor',
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
    <pre><code>// 使用简化版编辑器，无需复杂配置
const editor = new SimpleEditor({
  element: '#my-editor',
  placeholder: '开始输入...'
});

// 自动配置完整工具栏！</code></pre>

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
  height: '500px',
  onChange: (html) => {
    console.log('📝 编辑器内容已更新')
  }
})

console.log('🎨 SimpleEditor 已初始化，自动配置了完整工具栏！')

// 初始化媒体插件
const mediaPlugin = new MediaPlugin()
mediaPlugin.initialize(simpleEditor.getEditor())
console.log('📦 媒体插件已加载 - 支持本地文件选择和网络URL输入')

// 暴露到全局，方便调试
;(window as any).simpleEditor = simpleEditor
;(window as any).editor = simpleEditor.getEditor()
;(window as any).toolbar = simpleEditor.getToolbar()
;(window as any).mediaPlugin = mediaPlugin
;(window as any).__ldesignToolbar = simpleEditor.getToolbar()

console.log('✅ LDesign Editor 初始化完成！')
console.log('💡 提示：')
console.log('   - window.simpleEditor: SimpleEditor 实例')
console.log('   - window.editor: 原始 Editor 实例')
console.log('   - window.toolbar: Toolbar 实例')

// 调试工具栏
setTimeout(() => {
  console.log('\n🔍 检查工具栏状态...')
  const toolbar = simpleEditor.getToolbar()
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
