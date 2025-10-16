/**
 * 链接插件
 */

import { createPlugin } from '../../core/Plugin'
import type { Plugin, Command } from '../../types'
import { showLinkDialog } from '../../ui/LinkDialog'

/**
 * 插入或编辑链接
 */
const toggleLink: Command = (state, dispatch) => {
  if (!dispatch) return true

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false

  // 检查当前是否在链接中
  let node = selection.anchorNode
  let linkElement: HTMLAnchorElement | null = null

  while (node && node !== document.body) {
    if (node.nodeName === 'A') {
      linkElement = node as HTMLAnchorElement
      break
    }
    node = node.parentNode
  }

  if (linkElement) {
    // 移除链接
    const text = document.createTextNode(linkElement.textContent || '')
    linkElement.parentNode?.replaceChild(text, linkElement)
  } else {
    // 获取选中的文本
    const selectedText = selection.toString()
    
    // 显示链接对话框
    showLinkDialog({
      selectedText,
      onConfirm: (text, url) => {
        if (selectedText) {
          // 有选中文本，直接创建链接
          document.execCommand('createLink', false, url)
        } else {
          // 没有选中文本，插入新的链接
          const link = document.createElement('a')
          link.href = url
          link.textContent = text
          
          const range = selection.getRangeAt(0)
          range.deleteContents()
          range.insertNode(link)
          
          // 将光标移到链接后面
          range.setStartAfter(link)
          range.setEndAfter(link)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
    })
  }

  return true
}

/**
 * 检查是否在链接中
 */
function isLinkActive() {
  return () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return false

    let node = selection.anchorNode
    while (node && node !== document.body) {
      if (node.nodeName === 'A') return true
      node = node.parentNode
    }
    return false
  }
}

/**
 * 链接插件
 */
export const LinkPlugin: Plugin = createPlugin({
  name: 'link',
  commands: {
    toggleLink,
    insertLink: (state, dispatch) => {
      if (!dispatch) return true
      
      const selection = window.getSelection()
      const selectedText = selection?.toString() || ''
      
      showLinkDialog({
        selectedText,
        onConfirm: (text, url) => {
          if (selectedText) {
            // 有选中文本，直接创建链接
            document.execCommand('createLink', false, url)
          } else {
            // 没有选中文本，插入新的链接
            const link = document.createElement('a')
            link.href = url
            link.textContent = text
            
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0)
              range.deleteContents()
              range.insertNode(link)
              
              // 将光标移到链接后面
              range.setStartAfter(link)
              range.setEndAfter(link)
              selection.removeAllRanges()
              selection.addRange(range)
            }
          }
        }
      })
      
      return true
    },
    removeLink: (state, dispatch) => {
      if (!dispatch) return true
      document.execCommand('unlink', false)
      return true
    }
  },
  keys: {
    'Mod-K': toggleLink
  },
  toolbar: [{
    name: 'link',
    title: '链接',
    icon: 'link',
    command: toggleLink,
    active: isLinkActive()
  }]
})
