/**
 * 图片插件
 */

import { createPlugin } from '../core/Plugin'
import type { Plugin, Command } from '../types'

/**
 * 插入图片
 */
const insertImage: Command = (state, dispatch) => {
  if (!dispatch) return true

  const url = prompt('请输入图片地址:', 'https://')
  if (!url) return false

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false

  const range = selection.getRangeAt(0)
  const img = document.createElement('img')
  img.src = url
  img.alt = '图片'

  range.deleteContents()
  range.insertNode(img)

  return true
}

/**
 * 上传图片
 */
const uploadImage: Command = (state, dispatch) => {
  if (!dispatch) return true

  // 创建文件选择器
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    // 读取文件并插入
    const reader = new FileReader()
    reader.onload = (e) => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)
      const img = document.createElement('img')
      img.src = e.target?.result as string
      img.alt = file.name

      range.deleteContents()
      range.insertNode(img)
    }
    reader.readAsDataURL(file)
  }

  input.click()
  return true
}

/**
 * 图片插件
 */
export const ImagePlugin: Plugin = createPlugin({
  name: 'image',
  commands: {
    insertImage,
    uploadImage
  },
  toolbar: [{
    name: 'image',
    title: '图片',
    icon: 'image',
    command: uploadImage
  }]
})
