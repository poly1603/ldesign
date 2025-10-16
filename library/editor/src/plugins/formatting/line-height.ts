/**
 * 行高插件
 */

import { createPlugin } from '../../core/Plugin'
import type { Plugin, Command } from '../../types'

/**
 * 行高选项
 */
export const LINE_HEIGHTS = [
  { label: '1.0', value: '1.0' },
  { label: '1.15', value: '1.15' },
  { label: '1.5', value: '1.5' },
  { label: '1.75', value: '1.75' },
  { label: '2.0', value: '2.0' },
  { label: '2.5', value: '2.5' },
  { label: '3.0', value: '3.0' }
]

/**
 * 设置行高
 */
function setLineHeight(height: string): Command {
  return (state, dispatch) => {
    if (!dispatch) return true

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return false

    // 获取选中的块级元素或创建一个新的块
    let node = selection.anchorNode
    let block: HTMLElement | null = null

    // 查找块级元素
    while (node && node !== document.body) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement
        const display = window.getComputedStyle(element).display
        if (display === 'block' || element.tagName.match(/^(P|DIV|H[1-6]|BLOCKQUOTE|LI)$/)) {
          block = element
          break
        }
      }
      node = node.parentNode
    }

    if (block) {
      // 设置块级元素的行高
      block.style.lineHeight = height
    } else {
      // 如果没有找到块级元素，包装选中的内容
      const range = selection.getRangeAt(0)
      const selectedText = range.toString()

      if (selectedText) {
        const span = document.createElement('span')
        span.style.lineHeight = height
        span.style.display = 'inline-block'
        range.surroundContents(span)
      }
    }

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
}

/**
 * 行高插件
 */
export const LineHeightPlugin: Plugin = createPlugin({
  name: 'lineHeight',
  commands: {
    setLineHeight: (state, dispatch, height: string) => {
      return setLineHeight(height)(state, dispatch)
    }
  },
  toolbar: [{
    name: 'lineHeight',
    title: '行高',
    icon: 'line-height',
    command: (state, dispatch) => {
      return true
    }
  }]
})
