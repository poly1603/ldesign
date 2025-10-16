/**
 * 列表插件
 * 提供有序列表和无序列表功�? */

import { createPlugin } from '../../core/Plugin'
import type { Plugin, Command } from '../../types'

/**
 * 切换无序列表
 */
const toggleBulletList: Command = (state, dispatch) => {
  if (!dispatch) return true
  document.execCommand('insertUnorderedList', false)
  return true
}

/**
 * 切换有序列表
 */
const toggleOrderedList: Command = (state, dispatch) => {
  if (!dispatch) return true
  document.execCommand('insertOrderedList', false)
  return true
}

/**
 * 检查是否在列表�? */
function isListActive(listType: 'UL' | 'OL') {
  return () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return false

    let node = selection.anchorNode
    while (node && node !== document.body) {
      if (node.nodeName === listType) return true
      node = node.parentNode
    }
    return false
  }
}

/**
 * 无序列表插件
 */
export const BulletListPlugin: Plugin = createPlugin({
  name: 'bulletList',
  commands: {
    toggleBulletList
  },
  keys: {
    'Mod-Shift-8': toggleBulletList
  },
  toolbar: [{
    name: 'bulletList',
    title: '无序列表',
    icon: 'list',
    command: toggleBulletList,
    active: isListActive('UL')
  }]
})

/**
 * 有序列表插件
 */
export const OrderedListPlugin: Plugin = createPlugin({
  name: 'orderedList',
  commands: {
    toggleOrderedList
  },
  keys: {
    'Mod-Shift-7': toggleOrderedList
  },
  toolbar: [{
    name: 'orderedList',
    title: '有序列表',
    icon: 'list-ordered',
    command: toggleOrderedList,
    active: isListActive('OL')
  }]
})

/**
 * 任务列表插件
 */
export const TaskListPlugin: Plugin = createPlugin({
  name: 'taskList',
  commands: {
    toggleTaskList: (state, dispatch) => {
      if (!dispatch) return true

      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return false

      const range = selection.getRangeAt(0)
      const li = document.createElement('li')
      li.innerHTML = '<input type="checkbox"> '

      range.insertNode(li)
      return true
    }
  },
  toolbar: [{
    name: 'taskList',
    title: '任务列表',
    icon: 'list-checks',
    command: (state, dispatch) => true
  }]
})
