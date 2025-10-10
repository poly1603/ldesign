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
  code.textContent = selection.toString() || '\n'

  pre.appendChild(code)
  range.deleteContents()
  range.insertNode(pre)

  // 将光标移到代码块内
  const newRange = document.createRange()
  newRange.setStart(code, 0)
  newRange.collapse(true)
  selection.removeAllRanges()
  selection.addRange(newRange)

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
