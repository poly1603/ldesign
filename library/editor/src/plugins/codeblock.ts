/**
 * 代码块插件
 */

import { createPlugin } from '../core/Plugin'
import type { Plugin, Command } from '../types'

/**
 * 插入代码块
 */
const insertCodeBlock: Command = (state, dispatch) => {
  if (!dispatch) return true

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false

  const range = selection.getRangeAt(0)
  const pre = document.createElement('pre')
  const code = document.createElement('code')
  
  // 设置样式
  pre.style.backgroundColor = '#f5f5f5'
  pre.style.border = '1px solid #ddd'
  pre.style.borderRadius = '4px'
  pre.style.padding = '12px'
  pre.style.fontFamily = 'Consolas, Monaco, "Courier New", monospace'
  pre.style.fontSize = '14px'
  pre.style.lineHeight = '1.5'
  pre.style.overflow = 'auto'
  pre.style.whiteSpace = 'pre'
  pre.setAttribute('contenteditable', 'true')
  
  code.textContent = selection.toString() || '// 输入代码...'
  code.setAttribute('contenteditable', 'true')

  pre.appendChild(code)
  range.deleteContents()
  range.insertNode(pre)

  // 插入一个段落在代码块后面，以便可以继续编辑
  const p = document.createElement('p')
  p.innerHTML = '<br>'
  if (pre.nextSibling) {
    pre.parentNode?.insertBefore(p, pre.nextSibling)
  } else {
    pre.parentNode?.appendChild(p)
  }

  // 将光标移到代码块内
  const newRange = document.createRange()
  newRange.selectNodeContents(code)
  newRange.collapse(true)
  selection.removeAllRanges()
  selection.addRange(newRange)

  // 触发输入事件以更新编辑器状态
  setTimeout(() => {
    const editorContent = document.querySelector('.ldesign-editor-content') as HTMLElement
    if (editorContent) {
      const event = new Event('input', { bubbles: true, cancelable: true })
      editorContent.dispatchEvent(event)
    }
  }, 0)

  return true
}

/**
 * 检查是否在代码块中
 */
function isCodeBlockActive() {
  return () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return false

    let node = selection.anchorNode
    while (node && node !== document.body) {
      if (node.nodeName === 'PRE') return true
      node = node.parentNode
    }
    return false
  }
}

/**
 * 代码块插件
 */
export const CodeBlockPlugin: Plugin = createPlugin({
  name: 'codeBlock',
  commands: {
    insertCodeBlock
  },
  keys: {
    'Mod-Alt-C': insertCodeBlock
  },
  toolbar: [{
    name: 'codeBlock',
    title: '代码块',
    icon: 'code-xml',
    command: insertCodeBlock,
    active: isCodeBlockActive()
  }]
})
