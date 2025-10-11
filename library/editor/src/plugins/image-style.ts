/**
 * 图片样式插件
 * 提供图片宽度、高度、对齐、边框、圆角等样式设置
 */

import { createPlugin } from '../core/Plugin'
import type { Plugin, Command } from '../types'

/**
 * 获取当前选中的图片
 */
function getSelectedImage(): HTMLImageElement | null {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return null

  let node = selection.anchorNode
  
  // 如果选中的是文本节点，获取父元素
  if (node?.nodeType === Node.TEXT_NODE) {
    node = node.parentNode
  }

  // 查找图片元素
  while (node && node !== document.body) {
    if (node.nodeName === 'IMG') {
      return node as HTMLImageElement
    }
    node = node.parentNode
  }

  return null
}

/**
 * 设置图片宽度
 */
const setImageWidth: Command = (state, dispatch, width: string) => {
  if (!dispatch) return true

  const img = getSelectedImage()
  if (!img) return false

  img.style.width = width
  img.removeAttribute('width')

  // 触发输入事件以更新编辑器状态
  const event = new Event('input', { bubbles: true })
  const editorContent = img.closest('.ldesign-editor-content')
  if (editorContent) {
    editorContent.dispatchEvent(event)
  }

  return true
}

/**
 * 设置图片高度
 */
const setImageHeight: Command = (state, dispatch, height: string) => {
  if (!dispatch) return true

  const img = getSelectedImage()
  if (!img) return false

  img.style.height = height
  img.removeAttribute('height')

  // 触发输入事件以更新编辑器状态
  const event = new Event('input', { bubbles: true })
  const editorContent = img.closest('.ldesign-editor-content')
  if (editorContent) {
    editorContent.dispatchEvent(event)
  }

  return true
}

/**
 * 设置图片对齐方式
 */
const setImageAlign: Command = (state, dispatch, align: 'left' | 'center' | 'right') => {
  if (!dispatch) return true

  const img = getSelectedImage()
  if (!img) return false

  // 移除之前的对齐类
  img.style.display = 'block'
  
  switch (align) {
    case 'left':
      img.style.marginLeft = '0'
      img.style.marginRight = 'auto'
      break
    case 'center':
      img.style.marginLeft = 'auto'
      img.style.marginRight = 'auto'
      break
    case 'right':
      img.style.marginLeft = 'auto'
      img.style.marginRight = '0'
      break
  }

  // 触发输入事件以更新编辑器状态
  const event = new Event('input', { bubbles: true })
  const editorContent = img.closest('.ldesign-editor-content')
  if (editorContent) {
    editorContent.dispatchEvent(event)
  }

  return true
}

/**
 * 设置图片边框
 */
const setImageBorder: Command = (state, dispatch, border: string) => {
  if (!dispatch) return true

  const img = getSelectedImage()
  if (!img) return false

  img.style.border = border

  // 触发输入事件以更新编辑器状态
  const event = new Event('input', { bubbles: true })
  const editorContent = img.closest('.ldesign-editor-content')
  if (editorContent) {
    editorContent.dispatchEvent(event)
  }

  return true
}

/**
 * 设置图片圆角
 */
const setImageBorderRadius: Command = (state, dispatch, radius: string) => {
  if (!dispatch) return true

  const img = getSelectedImage()
  if (!img) return false

  img.style.borderRadius = radius

  // 触发输入事件以更新编辑器状态
  const event = new Event('input', { bubbles: true })
  const editorContent = img.closest('.ldesign-editor-content')
  if (editorContent) {
    editorContent.dispatchEvent(event)
  }

  return true
}

/**
 * 设置图片阴影
 */
const setImageShadow: Command = (state, dispatch, shadow: string) => {
  if (!dispatch) return true

  const img = getSelectedImage()
  if (!img) return false

  img.style.boxShadow = shadow

  // 触发输入事件以更新编辑器状态
  const event = new Event('input', { bubbles: true })
  const editorContent = img.closest('.ldesign-editor-content')
  if (editorContent) {
    editorContent.dispatchEvent(event)
  }

  return true
}

/**
 * 设置图片透明度
 */
const setImageOpacity: Command = (state, dispatch, opacity: string) => {
  if (!dispatch) return true

  const img = getSelectedImage()
  if (!img) return false

  img.style.opacity = opacity

  // 触发输入事件以更新编辑器状态
  const event = new Event('input', { bubbles: true })
  const editorContent = img.closest('.ldesign-editor-content')
  if (editorContent) {
    editorContent.dispatchEvent(event)
  }

  return true
}

/**
 * 重置图片样式
 */
const resetImageStyle: Command = (state, dispatch) => {
  if (!dispatch) return true

  const img = getSelectedImage()
  if (!img) return false

  img.style.width = ''
  img.style.height = ''
  img.style.display = ''
  img.style.marginLeft = ''
  img.style.marginRight = ''
  img.style.border = ''
  img.style.borderRadius = ''
  img.style.boxShadow = ''
  img.style.opacity = ''

  // 触发输入事件以更新编辑器状态
  const event = new Event('input', { bubbles: true })
  const editorContent = img.closest('.ldesign-editor-content')
  if (editorContent) {
    editorContent.dispatchEvent(event)
  }

  return true
}

/**
 * 检查是否选中了图片
 */
function isImageSelected() {
  return () => {
    return getSelectedImage() !== null
  }
}

/**
 * 图片样式插件
 */
export const ImageStylePlugin: Plugin = createPlugin({
  name: 'imageStyle',
  commands: {
    setImageWidth,
    setImageHeight,
    setImageAlign,
    setImageBorder,
    setImageBorderRadius,
    setImageShadow,
    setImageOpacity,
    resetImageStyle
  },
  toolbar: [{
    name: 'imageStyle',
    title: '图片样式',
    icon: 'image',
    command: (state, dispatch) => {
      return true
    },
    active: isImageSelected()
  }]
})

/**
 * 预设样式
 */
export const IMAGE_STYLE_PRESETS = {
  widths: [
    { label: '25%', value: '25%' },
    { label: '50%', value: '50%' },
    { label: '75%', value: '75%' },
    { label: '100%', value: '100%' },
    { label: '原始大小', value: 'auto' }
  ],
  aligns: [
    { label: '左对齐', value: 'left' },
    { label: '居中', value: 'center' },
    { label: '右对齐', value: 'right' }
  ],
  borders: [
    { label: '无边框', value: 'none' },
    { label: '细边框', value: '1px solid #ddd' },
    { label: '中边框', value: '2px solid #999' },
    { label: '粗边框', value: '3px solid #666' }
  ],
  borderRadius: [
    { label: '无圆角', value: '0' },
    { label: '小圆角', value: '4px' },
    { label: '中圆角', value: '8px' },
    { label: '大圆角', value: '16px' },
    { label: '圆形', value: '50%' }
  ],
  shadows: [
    { label: '无阴影', value: 'none' },
    { label: '轻微阴影', value: '0 2px 4px rgba(0,0,0,0.1)' },
    { label: '中等阴影', value: '0 4px 8px rgba(0,0,0,0.15)' },
    { label: '明显阴影', value: '0 8px 16px rgba(0,0,0,0.2)' }
  ]
}
