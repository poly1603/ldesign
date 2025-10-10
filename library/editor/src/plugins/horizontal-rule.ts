/**
 * 水平线插件
 */

import { createPlugin } from '../core/Plugin'
import type { Plugin, Command } from '../types'

/**
 * 插入水平线
 */
const insertHorizontalRule: Command = (state, dispatch) => {
  if (!dispatch) return true

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false

  const range = selection.getRangeAt(0)
  const hr = document.createElement('hr')

  range.deleteContents()
  range.insertNode(hr)

  // 在水平线后插入一个段落，方便继续输入
  const p = document.createElement('p')
  p.innerHTML = '<br>'
  hr.parentNode?.insertBefore(p, hr.nextSibling)

  // 将光标移到新段落
  const newRange = document.createRange()
  newRange.setStart(p, 0)
  newRange.collapse(true)
  selection.removeAllRanges()
  selection.addRange(newRange)

  return true
}

/**
 * 水平线插件
 */
export const HorizontalRulePlugin: Plugin = createPlugin({
  name: 'horizontalRule',
  commands: {
    insertHorizontalRule
  },
  keys: {
    'Mod-Shift--': insertHorizontalRule
  },
  toolbar: [{
    name: 'horizontalRule',
    title: '水平线',
    icon: 'minus',
    command: insertHorizontalRule
  }]
})
