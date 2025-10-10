/**
 * 字体插件
 * 提供字体大小和字体家族功能
 */

import { createPlugin } from '../core/Plugin'
import type { Plugin, Command } from '../types'

/**
 * 字体大小选项
 */
export const FONT_SIZES = [
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
  { label: '28px', value: '28px' },
  { label: '32px', value: '32px' },
  { label: '36px', value: '36px' },
  { label: '48px', value: '48px' },
  { label: '72px', value: '72px' }
]

/**
 * 字体家族选项
 */
export const FONT_FAMILIES = [
  { label: '默认', value: 'inherit' },
  { label: '宋体', value: 'SimSun, serif' },
  { label: '黑体', value: 'SimHei, sans-serif' },
  { label: '微软雅黑', value: 'Microsoft YaHei, sans-serif' },
  { label: '楷体', value: 'KaiTi, serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' }
]

/**
 * 设置字体大小
 */
function setFontSize(size: string): Command {
  return (state, dispatch) => {
    if (!dispatch) return true

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return false

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()

    if (selectedText) {
      const span = document.createElement('span')
      span.style.fontSize = size
      span.textContent = selectedText
      range.deleteContents()
      range.insertNode(span)
    }

    return true
  }
}

/**
 * 设置字体家族
 */
function setFontFamily(family: string): Command {
  return (state, dispatch) => {
    if (!dispatch) return true

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return false

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()

    if (selectedText) {
      const span = document.createElement('span')
      span.style.fontFamily = family
      span.textContent = selectedText
      range.deleteContents()
      range.insertNode(span)
    }

    return true
  }
}

/**
 * 字体大小插件
 */
export const FontSizePlugin: Plugin = createPlugin({
  name: 'fontSize',
  commands: {
    setFontSize: (state, dispatch, size: string) => {
      return setFontSize(size)(state, dispatch)
    }
  },
  toolbar: [{
    name: 'fontSize',
    title: '字体大小',
    icon: 'type',
    command: (state, dispatch) => {
      return true
    }
  }]
})

/**
 * 字体家族插件
 */
export const FontFamilyPlugin: Plugin = createPlugin({
  name: 'fontFamily',
  commands: {
    setFontFamily: (state, dispatch, family: string) => {
      return setFontFamily(family)(state, dispatch)
    }
  },
  toolbar: [{
    name: 'fontFamily',
    title: '字体',
    icon: 'type',
    command: (state, dispatch) => {
      return true
    }
  }]
})
