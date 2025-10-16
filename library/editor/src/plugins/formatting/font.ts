/**
 * 字体插件
 * 提供字体大小和字体家族功能
 */

import { createPlugin } from '../../core/Plugin'
import type { Plugin, Command } from '../../types'

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
    console.log('🎨 [FontSize] Command called with size:', size)
    if (!dispatch) {
      console.log('❌ [FontSize] No dispatch')
      return true
    }

    const selection = window.getSelection()
    console.log('🎨 [FontSize] Selection:', selection)
    if (!selection || selection.rangeCount === 0) {
      console.log('❌ [FontSize] No selection or range')
      return false
    }

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()
    console.log('🎨 [FontSize] Selected text:', `"${selectedText}"`)

    if (!selectedText) {
      console.log('📝 [FontSize] No text selected, inserting sample')
      // 没有选中文本时，插入带样式的示例文本供用户替换
      const span = document.createElement('span')
      span.style.fontSize = size
      span.textContent = 'Text'
      
      range.insertNode(span)
      console.log('✅ [FontSize] Sample span inserted:', span)
      
      // 选中插入的文本，方便用户直接替换
      const newRange = document.createRange()
      newRange.selectNodeContents(span)
      selection.removeAllRanges()
      selection.addRange(newRange)
      console.log('✅ [FontSize] Sample text selected')
      
      return true
    }

    // 有选中文本时，应用字体大小
    console.log('📝 [FontSize] Applying font size to selected text')
    const span = document.createElement('span')
    span.style.fontSize = size
    span.textContent = selectedText
    console.log('🎨 [FontSize] Created span:', span)
    range.deleteContents()
    console.log('🗑️ [FontSize] Deleted selection')
    range.insertNode(span)
    console.log('✅ [FontSize] Span inserted:', span)

    // 将光标移到span后面
    range.setStartAfter(span)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    console.log('✅ [FontSize] Cursor moved after span')

    // 触发输入事件以更新编辑器状态
    setTimeout(() => {
      const editorContent = document.querySelector('.ldesign-editor-content') as HTMLElement
      if (editorContent) {
        const event = new Event('input', { bubbles: true, cancelable: true })
        editorContent.dispatchEvent(event)
        console.log('✅ [FontSize] Input event dispatched')
      }
    }, 0)

    console.log('✅ [FontSize] Command completed successfully')
    return true
  }
}

/**
 * 设置字体家族
 */
function setFontFamily(family: string): Command {
  return (state, dispatch) => {
    console.log('🎨 [FontFamily] Command called with family:', family)
    if (!dispatch) {
      console.log('❌ [FontFamily] No dispatch')
      return true
    }

    const selection = window.getSelection()
    console.log('🎨 [FontFamily] Selection:', selection)
    if (!selection || selection.rangeCount === 0) {
      console.log('❌ [FontFamily] No selection or range')
      return false
    }

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()
    console.log('🎨 [FontFamily] Selected text:', `"${selectedText}"`)

    if (!selectedText) {
      console.log('📝 [FontFamily] No text selected, inserting sample')
      // 没有选中文本时，插入带样式的示例文本供用户替换
      const span = document.createElement('span')
      span.style.fontFamily = family
      span.textContent = 'Text'
      
      range.insertNode(span)
      console.log('✅ [FontFamily] Sample span inserted:', span)
      
      // 选中插入的文本，方便用户直接替换
      const newRange = document.createRange()
      newRange.selectNodeContents(span)
      selection.removeAllRanges()
      selection.addRange(newRange)
      console.log('✅ [FontFamily] Sample text selected')
      
      return true
    }

    // 有选中文本时，应用字体
    console.log('📝 [FontFamily] Applying font family to selected text')
    const span = document.createElement('span')
    span.style.fontFamily = family
    span.textContent = selectedText
    console.log('🎨 [FontFamily] Created span:', span)
    range.deleteContents()
    console.log('🗑️ [FontFamily] Deleted selection')
    range.insertNode(span)
    console.log('✅ [FontFamily] Span inserted:', span)

    // 将光标移到span后面
    range.setStartAfter(span)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    console.log('✅ [FontFamily] Cursor moved after span')

    // 触发输入事件以更新编辑器状态
    setTimeout(() => {
      const editorContent = document.querySelector('.ldesign-editor-content') as HTMLElement
      if (editorContent) {
        const event = new Event('input', { bubbles: true, cancelable: true })
        editorContent.dispatchEvent(event)
        console.log('✅ [FontFamily] Input event dispatched')
      }
    }, 0)

    console.log('✅ [FontFamily] Command completed successfully')
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
