/**
 * 基础格式化插件
 * 提供粗体、斜体、下划线、删除线等基础格式
 */

import { createPlugin } from '../core/Plugin'
import type { Plugin, Command } from '../types'

/**
 * 切换标记命令
 */
function toggleMarkCommand(markType: string): Command {
  return (state, dispatch) => {
    if (!dispatch) return true

    // 简化实现 - 实际需要操作 DOM 和文档模型
    document.execCommand(markType, false)
    return true
  }
}

/**
 * 检查标记是否激活
 */
function isMarkActive(markType: string) {
  return () => {
    return document.queryCommandState(markType)
  }
}

/**
 * 粗体插件
 */
export const BoldPlugin: Plugin = createPlugin({
  name: 'bold',
  commands: {
    toggleBold: toggleMarkCommand('bold')
  },
  keys: {
    'Mod-B': toggleMarkCommand('bold')
  },
  toolbar: [{
    name: 'bold',
    title: '粗体',
    icon: 'bold',
    command: toggleMarkCommand('bold'),
    active: isMarkActive('bold')
  }]
})

/**
 * 斜体插件
 */
export const ItalicPlugin: Plugin = createPlugin({
  name: 'italic',
  commands: {
    toggleItalic: toggleMarkCommand('italic')
  },
  keys: {
    'Mod-I': toggleMarkCommand('italic')
  },
  toolbar: [{
    name: 'italic',
    title: '斜体',
    icon: 'italic',
    command: toggleMarkCommand('italic'),
    active: isMarkActive('italic')
  }]
})

/**
 * 下划线插件
 */
export const UnderlinePlugin: Plugin = createPlugin({
  name: 'underline',
  commands: {
    toggleUnderline: toggleMarkCommand('underline')
  },
  keys: {
    'Mod-U': toggleMarkCommand('underline')
  },
  toolbar: [{
    name: 'underline',
    title: '下划线',
    icon: 'underline',
    command: toggleMarkCommand('underline'),
    active: isMarkActive('underline')
  }]
})

/**
 * 删除线插件
 */
export const StrikePlugin: Plugin = createPlugin({
  name: 'strike',
  commands: {
    toggleStrike: toggleMarkCommand('strikeThrough')
  },
  keys: {
    'Mod-Shift-X': toggleMarkCommand('strikeThrough')
  },
  toolbar: [{
    name: 'strike',
    title: '删除线',
    icon: 'strikethrough',
    command: toggleMarkCommand('strikeThrough'),
    active: isMarkActive('strikeThrough')
  }]
})

/**
 * 行内代码插件
 */
export const CodePlugin: Plugin = createPlugin({
  name: 'code',
  commands: {
    toggleCode: (state, dispatch) => {
      if (!dispatch) return true

      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return false

      const range = selection.getRangeAt(0)
      const selectedText = range.toString()

      if (selectedText) {
        const code = document.createElement('code')
        code.textContent = selectedText
        range.deleteContents()
        range.insertNode(code)
      }

      return true
    }
  },
  keys: {
    'Mod-E': (state, dispatch) => {
      if (!dispatch) return true
      return true
    }
  },
  toolbar: [{
    name: 'code',
    title: '代码',
    icon: 'code',
    command: (state, dispatch) => true
  }]
})

/**
 * 清除格式插件
 */
export const ClearFormatPlugin: Plugin = createPlugin({
  name: 'clearFormat',
  commands: {
    clearFormat: (state, dispatch) => {
      if (!dispatch) return true
      document.execCommand('removeFormat', false)
      return true
    }
  },
  keys: {
    'Mod-\\': (state, dispatch) => {
      if (!dispatch) return true
      document.execCommand('removeFormat', false)
      return true
    }
  },
  toolbar: [{
    name: 'clearFormat',
    title: '清除格式',
    icon: 'eraser',
    command: (state, dispatch) => {
      if (!dispatch) return true
      document.execCommand('removeFormat', false)
      return true
    }
  }]
})
