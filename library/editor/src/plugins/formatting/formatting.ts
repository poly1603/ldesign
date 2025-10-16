/**
 * 基础格式化插件
 * 提供粗体、斜体、下划线、删除线等基础格式
 */

import { createPlugin } from '../../core/Plugin'
import type { Plugin, Command } from '../../types'

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
export const InlineCodePlugin: Plugin = createPlugin({
  name: 'inlineCode',
  commands: {
    toggleInlineCode: (state, dispatch) => {
      if (!dispatch) return true

      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return false

      const range = selection.getRangeAt(0)
      const selectedText = range.toString()

      if (selectedText) {
        // 检查是否已经是代码
        const parent = range.commonAncestorContainer.parentElement
        if (parent && parent.tagName === 'CODE') {
          // 移除代码标记
          const textNode = document.createTextNode(selectedText)
          parent.parentNode?.replaceChild(textNode, parent)
        } else {
          // 添加代码标记
          const code = document.createElement('code')
          code.style.cssText = `
            padding: 2px 4px;
            margin: 0 2px;
            background-color: rgba(135, 131, 120, 0.15);
            border-radius: 3px;
            font-size: 85%;
            font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
          `
          code.textContent = selectedText
          range.deleteContents()
          range.insertNode(code)
          
          // 设置光标到代码后面
          const newRange = document.createRange()
          newRange.setStartAfter(code)
          newRange.collapse(true)
          selection.removeAllRanges()
          selection.addRange(newRange)
        }
      }

      return true
    }
  },
  keys: {
    'Mod-`': (state, dispatch) => {
      if (!dispatch) return true
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return false
      
      const range = selection.getRangeAt(0)
      const selectedText = range.toString()
      
      if (selectedText) {
        // 检查是否已经是代码
        const parent = range.commonAncestorContainer.parentElement
        if (parent && parent.tagName === 'CODE') {
          // 移除代码标记
          const textNode = document.createTextNode(selectedText)
          parent.parentNode?.replaceChild(textNode, parent)
        } else {
          // 添加代码标记  
          document.execCommand('insertHTML', false, `<code style="padding: 2px 4px; margin: 0 2px; background-color: rgba(135, 131, 120, 0.15); border-radius: 3px; font-size: 85%; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;">${selectedText}</code>`)
        }
      }
      return true
    }
  },
  toolbar: [{
    name: 'inlineCode',
    title: '行内代码 (Ctrl+`)',
    icon: 'code',
    command: (state, dispatch) => {
      if (!dispatch) return true
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return false
      
      const range = selection.getRangeAt(0)
      const selectedText = range.toString()
      
      if (selectedText) {
        // 检查是否已经是代码
        const parent = range.commonAncestorContainer.parentElement
        if (parent && parent.tagName === 'CODE') {
          // 移除代码标记
          const textNode = document.createTextNode(selectedText)
          parent.parentNode?.replaceChild(textNode, parent)
        } else {
          // 添加代码标记
          document.execCommand('insertHTML', false, `<code style="padding: 2px 4px; margin: 0 2px; background-color: rgba(135, 131, 120, 0.15); border-radius: 3px; font-size: 85%; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;">${selectedText}</code>`)
        }
      }
      return true
    },
    active: () => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return false
      const parent = selection.getRangeAt(0).commonAncestorContainer.parentElement
      return parent?.tagName === 'CODE'
    }
  }]
})

// 为了兼容性保留旧的导出名称
export const CodePlugin = InlineCodePlugin

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
