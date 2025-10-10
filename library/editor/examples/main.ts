/**
 * 演示示例主文件
 */

import { Editor, Toolbar, createPlugin } from '../src/index'
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
  BlockquotePlugin,
  CodeBlockPlugin,
  LinkPlugin,
  ImagePlugin,
  TablePlugin,
  HistoryPlugin,
  AlignPlugin
} from '../src/plugins'
import type { Plugin } from '../src/types'

// 基础示例
const basicEditorEl = document.getElementById('basic-editor')
if (basicEditorEl) {
  const basicEditor = new Editor({
    element: basicEditorEl,
    content: '<p>这是一个基础的富文本编辑器示例。试试选中文本并使用快捷键：</p><ul><li><strong>Ctrl/Cmd + B</strong>: 加粗</li><li><strong>Ctrl/Cmd + I</strong>: 斜体</li><li><strong>Ctrl/Cmd + U</strong>: 下划线</li></ul>',
    placeholder: '请输入内容...',
    plugins: [
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikePlugin,
      HistoryPlugin
    ]
  })

  // 创建工具栏
  const toolbar = new Toolbar(basicEditor, {
    container: basicEditorEl.parentElement!
  })

  // 插入工具栏到编辑器之前
  basicEditorEl.parentElement!.insertBefore(toolbar.getElement(), basicEditorEl)

  // 全局暴露用于按钮操作
  ;(window as any).basicDemo = {
    editor: basicEditor,
    getContent() {
      const output = document.getElementById('basic-output')
      const pre = output?.querySelector('pre')
      if (output && pre) {
        output.style.display = 'block'
        pre.textContent = basicEditor.getHTML()
      }
    },
    setContent() {
      basicEditor.setHTML('<h2>新内容</h2><p>这是通过 <code>setHTML()</code> 方法设置的内容。</p>')
    },
    clear() {
      basicEditor.clear()
    },
    toggleEditable() {
      const isEditable = basicEditor.isEditable()
      basicEditor.setEditable(!isEditable)
      alert(isEditable ? '已设为只读' : '已设为可编辑')
    }
  }
}

// 完整功能示例
const fullEditorEl = document.getElementById('full-editor')
if (fullEditorEl) {
  const fullEditor = new Editor({
    element: fullEditorEl,
    content: `
      <h1>欢迎使用 @ldesign/editor</h1>
      <p>这是一个功能完整的富文本编辑器示例，支持以下所有功能：</p>
      <h2>文本格式</h2>
      <p><strong>粗体</strong>、<em>斜体</em>、<u>下划线</u>、<s>删除线</s>、<code>代码</code></p>
      <h2>列表</h2>
      <ul>
        <li>无序列表项 1</li>
        <li>无序列表项 2</li>
      </ul>
      <ol>
        <li>有序列表项 1</li>
        <li>有序列表项 2</li>
      </ol>
      <h2>引用</h2>
      <blockquote>这是一段引用文字</blockquote>
      <h2>代码块</h2>
      <pre><code>function hello() {
  console.log('Hello, World!')
}</code></pre>
      <h2>链接和图片</h2>
      <p>这是一个<a href="https://github.com">链接</a>示例。</p>
      <p>快捷键提示：</p>
      <ul>
        <li>Ctrl/Cmd + B: 粗体</li>
        <li>Ctrl/Cmd + I: 斜体</li>
        <li>Ctrl/Cmd + K: 插入链接</li>
        <li>Ctrl/Cmd + Z: 撤销</li>
        <li>Ctrl/Cmd + Shift + Z: 重做</li>
      </ul>
    `,
    placeholder: '开始编写内容...',
    plugins: [
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikePlugin,
      CodePlugin,
      ClearFormatPlugin,
      HeadingPlugin,
      BulletListPlugin,
      OrderedListPlugin,
      BlockquotePlugin,
      CodeBlockPlugin,
      LinkPlugin,
      ImagePlugin,
      TablePlugin,
      HistoryPlugin,
      AlignPlugin
    ],
    onUpdate: () => {
      updateOutputs()
    }
  })

  // 创建工具栏
  const fullToolbar = new Toolbar(fullEditor, {
    container: fullEditorEl.parentElement!
  })
  fullEditorEl.parentElement!.insertBefore(fullToolbar.getElement(), fullEditorEl)

  // 更新输出
  function updateOutputs() {
    const htmlOutput = document.getElementById('html-output')
    const jsonOutput = document.getElementById('json-output')

    if (htmlOutput) {
      htmlOutput.textContent = fullEditor.getHTML()
    }

    if (jsonOutput) {
      jsonOutput.textContent = JSON.stringify(fullEditor.getJSON(), null, 2)
    }
  }

  updateOutputs()

  // 标签切换
  ;(window as any).switchTab = (tab: string) => {
    // 更新标签状态
    document.querySelectorAll('.tab').forEach(el => {
      el.classList.remove('active')
    })
    document.querySelectorAll('.tab-content').forEach(el => {
      el.classList.remove('active')
    })

    // 激活选中的标签
    const tabButton = Array.from(document.querySelectorAll('.tab')).find(
      el => el.textContent?.toLowerCase().includes(tab)
    )
    const tabContent = document.getElementById(`tab-${tab}`)

    tabButton?.classList.add('active')
    tabContent?.classList.add('active')

    // 更新输出
    if (tab === 'html' || tab === 'json') {
      updateOutputs()
    }
  }
}

// 自定义插件示例
const EmojiPlugin: Plugin = createPlugin({
  name: 'emoji',
  commands: {
    insertEmoji: (state, dispatch, emoji: string) => {
      if (!dispatch) return true

      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return false

      const range = selection.getRangeAt(0)
      const textNode = document.createTextNode(emoji)
      range.insertNode(textNode)

      // 移动光标到插入的内容之后
      range.setStartAfter(textNode)
      range.setEndAfter(textNode)
      selection.removeAllRanges()
      selection.addRange(range)

      return true
    }
  }
})

const customEditorEl = document.getElementById('custom-editor')
if (customEditorEl) {
  const customEditor = new Editor({
    element: customEditorEl,
    content: '<p>点击下方按钮插入 emoji 表情！ </p>',
    placeholder: '试试插入 emoji...',
    plugins: [
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      HistoryPlugin,
      EmojiPlugin
    ]
  })

  // 创建工具栏
  const customToolbar = new Toolbar(customEditor, {
    container: customEditorEl.parentElement!
  })
  customEditorEl.parentElement!.insertBefore(customToolbar.getElement(), customEditorEl)

  // 全局暴露
  ;(window as any).customDemo = {
    editor: customEditor,
    insertEmoji(emoji: string) {
      customEditor.commands.execute('insertEmoji', emoji)
    }
  }
}

// 控制台输出信息
console.log('%c@ldesign/editor%c 演示示例已加载', 'color: #3b82f6; font-weight: bold; font-size: 16px;', 'color: #6b7280;')
console.log('可用编辑器实例：')
console.log('- basicDemo.editor: 基础编辑器')
console.log('- customDemo.editor: 自定义插件编辑器')
