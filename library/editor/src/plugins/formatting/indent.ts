/**
 * 缩进插件
 * 提供增加缩进和减少缩进功能
 */

import { createPlugin } from '../../core/Plugin'
import type { Plugin, Command } from '../../types'

/**
 * 增加缩进
 */
const indent: Command = (state, dispatch) => {
  if (!dispatch) return true
  document.execCommand('indent', false)
  return true
}

/**
 * 减少缩进
 */
const outdent: Command = (state, dispatch) => {
  if (!dispatch) return true
  document.execCommand('outdent', false)
  return true
}

/**
 * 缩进插件
 */
export const IndentPlugin: Plugin = createPlugin({
  name: 'indent',
  commands: {
    indent,
    outdent
  },
  keys: {
    'Tab': indent,
    'Shift-Tab': outdent
  },
  toolbar: [
    {
      name: 'indent',
      title: '增加缩进',
      icon: 'indent',
      command: indent
    },
    {
      name: 'outdent',
      title: '减少缩进',
      icon: 'outdent',
      command: outdent
    }
  ]
})
