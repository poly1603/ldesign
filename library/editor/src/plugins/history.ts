/**
 * 历史记录插件
 * 提供撤销和重做功能
 */

import { createPlugin } from '../core/Plugin'
import type { Plugin, Command } from '../types'

/**
 * 撤销命令
 */
const undo: Command = (state, dispatch) => {
  if (!dispatch) return true
  document.execCommand('undo', false)
  return true
}

/**
 * 重做命令
 */
const redo: Command = (state, dispatch) => {
  if (!dispatch) return true
  document.execCommand('redo', false)
  return true
}

/**
 * 历史记录插件
 */
export const HistoryPlugin: Plugin = createPlugin({
  name: 'history',
  commands: {
    undo,
    redo
  },
  keys: {
    'Mod-Z': undo,
    'Mod-Shift-Z': redo,
    'Mod-Y': redo
  },
  toolbar: [
    {
      name: 'undo',
      title: '撤销',
      icon: 'undo',
      command: undo
    },
    {
      name: 'redo',
      title: '重做',
      icon: 'redo',
      command: redo
    }
  ]
})
