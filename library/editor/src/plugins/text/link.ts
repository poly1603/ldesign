/**
 * 链接插件
 */

import { createPlugin } from '../../core/Plugin'
import type { Plugin, Command } from '../../types'

/**
 * 插入或编辑链�? */
const toggleLink: Command = (state, dispatch) => {
  if (!dispatch) return true

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false

  // 检查当前是否在链接�?  let node = selection.anchorNode
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
    // 添加链接
    const url = prompt('请输入链接地址:', 'https://')
    if (url) {
      document.execCommand('createLink', false, url)
    }
  }

  return true
}

/**
 * 检查是否在链接�? */
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
      const url = prompt('请输入链接地址:', 'https://')
      if (url) {
        document.execCommand('createLink', false, url)
      }
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
