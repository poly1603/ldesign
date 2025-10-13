/**
 * 图片插件
 * 集成增强版功能，支持拖动调整大小和样式设置
 */

import { createPlugin } from '../core/Plugin'
import type { Plugin, Command } from '../types'
import { ImageWrapper } from './image-enhanced'

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

  // 使用增强版包装器
  new ImageWrapper(img)

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
  input.multiple = true // 支持多文件上传

  input.onchange = (e) => {
    const files = (e.target as HTMLInputElement).files
    if (!files || files.length === 0) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)

    // 处理多个文件
    Array.from(files).forEach((file, index) => {
      // 读取文件并插入
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = document.createElement('img')
        img.src = e.target?.result as string
        img.alt = file.name
        
        // 插入图片
        if (index === 0) {
          range.deleteContents()
        }
        range.insertNode(img)
        
        // 使用增强版包装器
        const wrapper = new ImageWrapper(img)
        
        // 在图片后插入换行，除了最后一张
        if (index < files.length - 1) {
          const br = document.createElement('br')
          range.insertNode(br)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  input.click()
  return true
}

/**
 * 初始化已有图片
 */
const initializeImages: Command = (state, dispatch) => {
  if (!dispatch) return true
  
  const editorContent = document.querySelector('.ldesign-editor-content')
  if (editorContent) {
    ImageWrapper.wrapExistingImages(editorContent as HTMLElement)
  }
  
  return true
}

/**
 * 图片插件
 */
export const ImagePlugin: Plugin = createPlugin({
  name: 'image',
  commands: {
    insertImage,
    uploadImage,
    initializeImages
  },
  toolbar: [{
    name: 'image',
    title: '图片',
    icon: 'image',
    command: uploadImage
  }],
  init: (editor) => {
    // 监听编辑器内容变化，自动包装新插入的图片
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeName === 'IMG') {
            const img = node as HTMLImageElement
            if (!img.closest('[data-image-wrapper]') && !img.hasAttribute('data-wrapped')) {
              img.setAttribute('data-wrapped', 'true')
              new ImageWrapper(img)
            }
          }
        })
      })
    })
    
    const content = editor.querySelector('.ldesign-editor-content')
    if (content) {
      observer.observe(content, {
        childList: true,
        subtree: true
      })
      
      // 初始化已有图片
      setTimeout(() => {
        ImageWrapper.wrapExistingImages(content as HTMLElement)
      }, 100)
    }
  }
})
