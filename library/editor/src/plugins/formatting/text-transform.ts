/**
 * 文本转换插件
 * 提供大小写转换、全角半角转换等功能
 */

import { createPlugin } from '../../core/Plugin'
import type { Plugin, Command } from '../../types'

/**
 * 转换为大写
 */
const toUpperCase: Command = (state, dispatch) => {
  if (!dispatch) return true

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false

  const range = selection.getRangeAt(0)
  const selectedText = range.toString()

  if (!selectedText) return false

  const upperText = selectedText.toUpperCase()
  range.deleteContents()
  range.insertNode(document.createTextNode(upperText))

  // 触发输入事件以更新编辑器状态
  setTimeout(() => {
    const editorContent = document.querySelector('.ldesign-editor-content') as HTMLElement
    if (editorContent) {
      const event = new Event('input', { bubbles: true, cancelable: true })
      editorContent.dispatchEvent(event)
    }
  }, 0)

  return true
}

/**
 * 转换为小写
 */
const toLowerCase: Command = (state, dispatch) => {
  if (!dispatch) return true

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false

  const range = selection.getRangeAt(0)
  const selectedText = range.toString()

  if (!selectedText) return false

  const lowerText = selectedText.toLowerCase()
  range.deleteContents()
  range.insertNode(document.createTextNode(lowerText))

  // 触发输入事件以更新编辑器状态
  setTimeout(() => {
    const editorContent = document.querySelector('.ldesign-editor-content') as HTMLElement
    if (editorContent) {
      const event = new Event('input', { bubbles: true, cancelable: true })
      editorContent.dispatchEvent(event)
    }
  }, 0)

  return true
}

/**
 * 首字母大写
 */
const toCapitalize: Command = (state, dispatch) => {
  if (!dispatch) return true

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false

  const range = selection.getRangeAt(0)
  const selectedText = range.toString()

  if (!selectedText) return false

  const capitalizedText = selectedText
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  range.deleteContents()
  range.insertNode(document.createTextNode(capitalizedText))

  // 触发输入事件以更新编辑器状态
  setTimeout(() => {
    const editorContent = document.querySelector('.ldesign-editor-content') as HTMLElement
    if (editorContent) {
      const event = new Event('input', { bubbles: true, cancelable: true })
      editorContent.dispatchEvent(event)
    }
  }, 0)

  return true
}

/**
 * 转换为句子大小写（第一个字母大写）
 */
const toSentenceCase: Command = (state, dispatch) => {
  if (!dispatch) return true

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false

  const range = selection.getRangeAt(0)
  const selectedText = range.toString()

  if (!selectedText) return false

  const sentenceText = selectedText.charAt(0).toUpperCase() + selectedText.slice(1).toLowerCase()
  range.deleteContents()
  range.insertNode(document.createTextNode(sentenceText))

  // 触发输入事件以更新编辑器状态
  setTimeout(() => {
    const editorContent = document.querySelector('.ldesign-editor-content') as HTMLElement
    if (editorContent) {
      const event = new Event('input', { bubbles: true, cancelable: true })
      editorContent.dispatchEvent(event)
    }
  }, 0)

  return true
}

/**
 * 全角转半角
 */
const toHalfWidth: Command = (state, dispatch) => {
  if (!dispatch) return true

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false

  const range = selection.getRangeAt(0)
  const selectedText = range.toString()

  if (!selectedText) return false

  const halfWidthText = selectedText.replace(/[\uff01-\uff5e]/g, (ch) => {
    return String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  }).replace(/\u3000/g, ' ')

  range.deleteContents()
  range.insertNode(document.createTextNode(halfWidthText))

  // 触发输入事件以更新编辑器状态
  setTimeout(() => {
    const editorContent = document.querySelector('.ldesign-editor-content') as HTMLElement
    if (editorContent) {
      const event = new Event('input', { bubbles: true, cancelable: true })
      editorContent.dispatchEvent(event)
    }
  }, 0)

  return true
}

/**
 * 半角转全角
 */
const toFullWidth: Command = (state, dispatch) => {
  if (!dispatch) return true

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false

  const range = selection.getRangeAt(0)
  const selectedText = range.toString()

  if (!selectedText) return false

  const fullWidthText = selectedText.replace(/[\x21-\x7e]/g, (ch) => {
    return String.fromCharCode(ch.charCodeAt(0) + 0xfee0)
  }).replace(/ /g, '\u3000')

  range.deleteContents()
  range.insertNode(document.createTextNode(fullWidthText))

  // 触发输入事件以更新编辑器状态
  setTimeout(() => {
    const editorContent = document.querySelector('.ldesign-editor-content') as HTMLElement
    if (editorContent) {
      const event = new Event('input', { bubbles: true, cancelable: true })
      editorContent.dispatchEvent(event)
    }
  }, 0)

  return true
}

/**
 * 文本转换插件
 */
export const TextTransformPlugin: Plugin = createPlugin({
  name: 'textTransform',
  commands: {
    toUpperCase,
    toLowerCase,
    toCapitalize,
    toSentenceCase,
    toHalfWidth,
    toFullWidth
  },
  toolbar: [{
    name: 'textTransform',
    title: '文本转换',
    icon: 'text',
    command: (state, dispatch) => {
      return true
    }
  }]
})

/**
 * 大写转换插件（快捷方式）
 */
export const UpperCasePlugin: Plugin = createPlugin({
  name: 'upperCase',
  commands: { toUpperCase },
  toolbar: [{
    name: 'upperCase',
    title: '转大写',
    icon: 'text',
    command: toUpperCase
  }]
})

/**
 * 小写转换插件（快捷方式）
 */
export const LowerCasePlugin: Plugin = createPlugin({
  name: 'lowerCase',
  commands: { toLowerCase },
  toolbar: [{
    name: 'lowerCase',
    title: '转小写',
    icon: 'text',
    command: toLowerCase
  }]
})

/**
 * 首字母大写插件（快捷方式）
 */
export const CapitalizePlugin: Plugin = createPlugin({
  name: 'capitalize',
  commands: { toCapitalize },
  toolbar: [{
    name: 'capitalize',
    title: '首字母大写',
    icon: 'text',
    command: toCapitalize
  }]
})
