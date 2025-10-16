/**
 * 格式化命令插件
 * 注册所有格式化相关的命令
 */

import type { Plugin } from '../../types'

const FormattingCommandsPlugin: Plugin = {
  name: 'FormattingCommands',
  install(editor: any) {
    // 对齐命令
    editor.commandManager.registerCommand('alignLeft', {
      execute: () => {
        document.execCommand('justifyLeft')
        return true
      }
    })

    editor.commandManager.registerCommand('alignCenter', {
      execute: () => {
        document.execCommand('justifyCenter')
        return true
      }
    })

    editor.commandManager.registerCommand('alignRight', {
      execute: () => {
        document.execCommand('justifyRight')
        return true
      }
    })

    editor.commandManager.registerCommand('alignJustify', {
      execute: () => {
        document.execCommand('justifyFull')
        return true
      }
    })

    // 字体大小命令
    editor.commandManager.registerCommand('setFontSize', {
      execute: (size: string) => {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const span = document.createElement('span')
          span.style.fontSize = size
          const range = selection.getRangeAt(0)
          try {
            range.surroundContents(span)
          } catch (e) {
            // 如果无法包围内容，则插入
            span.innerHTML = selection.toString()
            range.deleteContents()
            range.insertNode(span)
          }
        }
        return true
      }
    })

    // 字体命令
    editor.commandManager.registerCommand('setFontFamily', {
      execute: (fontFamily: string) => {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const span = document.createElement('span')
          span.style.fontFamily = fontFamily
          const range = selection.getRangeAt(0)
          try {
            range.surroundContents(span)
          } catch (e) {
            span.innerHTML = selection.toString()
            range.deleteContents()
            range.insertNode(span)
          }
        }
        return true
      }
    })

    // 文字颜色命令
    editor.commandManager.registerCommand('setTextColor', {
      execute: (color: string) => {
        document.execCommand('foreColor', false, color)
        return true
      }
    })

    // 背景颜色命令
    editor.commandManager.registerCommand('setBackgroundColor', {
      execute: (color: string) => {
        document.execCommand('hiliteColor', false, color)
        return true
      }
    })

    // 行高命令
    editor.commandManager.registerCommand('setLineHeight', {
      execute: (lineHeight: string) => {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const div = document.createElement('div')
          div.style.lineHeight = lineHeight
          const range = selection.getRangeAt(0)
          try {
            range.surroundContents(div)
          } catch (e) {
            div.innerHTML = selection.toString()
            range.deleteContents()
            range.insertNode(div)
          }
        }
        return true
      }
    })

    console.log('[FormattingCommandsPlugin] All formatting commands registered')
  }
}

export default FormattingCommandsPlugin