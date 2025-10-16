/**
 * 引用块插�? */

import { createPlugin } from '../../core/Plugin'
import type { Plugin, Command } from '../../types'

/**
 * 切换引用�? */
const toggleBlockquote: Command = (state, dispatch) => {
  if (!dispatch) return true

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false

  // 检查当前是否在引用块中
  let node = selection.anchorNode
  let inBlockquote = false

  while (node && node !== document.body) {
    if (node.nodeName === 'BLOCKQUOTE') {
      inBlockquote = true
      break
    }
    node = node.parentNode
  }

  if (inBlockquote) {
    // 移除引用�?    document.execCommand('outdent', false)
  } else {
    // 添加引用�?    document.execCommand('formatBlock', false, 'blockquote')
  }

  return true
}

/**
 * 检查是否在引用块中
 */
function isBlockquoteActive() {
  return () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return false

    let node = selection.anchorNode
    while (node && node !== document.body) {
      if (node.nodeName === 'BLOCKQUOTE') return true
      node = node.parentNode
    }
    return false
  }
}

/**
 * 引用块插�? */
export const BlockquotePlugin: Plugin = createPlugin({
  name: 'blockquote',
  commands: {
    toggleBlockquote
  },
  keys: {
    'Mod-Shift-B': toggleBlockquote
  },
  toolbar: [{
    name: 'blockquote',
    title: '引用',
    icon: 'quote',
    command: toggleBlockquote,
    active: isBlockquoteActive()
  }]
})
