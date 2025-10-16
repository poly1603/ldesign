/**
 * 标题插件
 * 提供 H1-H6 标题功能
 */

import { createPlugin } from '../../core/Plugin'
import type { Plugin, Command } from '../../types'

/**
 * 设置标题命令
 */
function setHeadingCommand(level: number): Command {
  return (state, dispatch) => {
    if (!dispatch) return true

    // 确保有选区
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      console.warn('[Heading] No selection available')
      return false
    }

    // 如果没有选中内容，选中当前段落
    let range = selection.getRangeAt(0)
    if (range.collapsed) {
      // 获取当前所在的块级元素
      const container = range.commonAncestorContainer
      const block = container.nodeType === Node.TEXT_NODE 
        ? container.parentElement 
        : container as HTMLElement
      
      if (block) {
        // 找到最近的块级元素
        let blockElement = block
        while (blockElement && !['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE'].includes(blockElement.tagName)) {
          if (blockElement.parentElement) {
            blockElement = blockElement.parentElement
          } else {
            break
          }
        }
        
        // 选中整个块元素的内容
        if (blockElement) {
          range = document.createRange()
          range.selectNodeContents(blockElement)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
    }

    // 使用大写标签名，这是 formatBlock 的标准格式
    let success = document.execCommand('formatBlock', false, `H${level}`)
    
    // 如果失败，尝试带尖括号的格式（某些浏览器需要）
    if (!success) {
      success = document.execCommand('formatBlock', false, `<h${level}>`)
    }
    
    // 如果还是失败，尝试小写格式
    if (!success) {
      success = document.execCommand('formatBlock', false, `h${level}`)
    }
    
    if (success) {
      console.log(`[Heading] Successfully set heading level ${level}`)
    } else {
      console.warn(`[Heading] Failed to set heading level ${level}`)
    }
    
    return success
  }
}

/**
 * 设置段落命令
 */
function setParagraphCommand(): Command {
  return (state, dispatch) => {
    if (!dispatch) return true
    
    // 确保有选区
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      console.warn('[Heading] No selection available for paragraph')
      return false
    }

    // 如果没有选中内容，选中当前段落
    let range = selection.getRangeAt(0)
    if (range.collapsed) {
      // 获取当前所在的块级元素
      const container = range.commonAncestorContainer
      const block = container.nodeType === Node.TEXT_NODE 
        ? container.parentElement 
        : container as HTMLElement
      
      if (block) {
        // 找到最近的块级元素
        let blockElement = block
        while (blockElement && !['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE'].includes(blockElement.tagName)) {
          if (blockElement.parentElement) {
            blockElement = blockElement.parentElement
          } else {
            break
          }
        }
        
        // 选中整个块元素的内容
        if (blockElement) {
          range = document.createRange()
          range.selectNodeContents(blockElement)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
    }
    
    // 尝试多种格式
    let success = document.execCommand('formatBlock', false, 'P')
    
    if (!success) {
      success = document.execCommand('formatBlock', false, '<p>')
    }
    
    if (!success) {
      success = document.execCommand('formatBlock', false, 'p')
    }
    
    if (success) {
      console.log('[Heading] Successfully set paragraph')
    } else {
      console.warn('[Heading] Failed to set paragraph')
    }
    
    return success
  }
}

/**
 * 检查标题是否激活
 */
function isHeadingActive(level: number) {
  return () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return false

    const node = selection.anchorNode?.parentElement
    return node?.tagName === `H${level}`
  }
}

/**
 * 标题插件
 */
export const HeadingPlugin: Plugin = createPlugin({
  name: 'heading',
  commands: {
    setHeading1: setHeadingCommand(1),
    setHeading2: setHeadingCommand(2),
    setHeading3: setHeadingCommand(3),
    setHeading4: setHeadingCommand(4),
    setHeading5: setHeadingCommand(5),
    setHeading6: setHeadingCommand(6),
    setParagraph: setParagraphCommand()
  },
  keys: {
    'Mod-Alt-1': setHeadingCommand(1),
    'Mod-Alt-2': setHeadingCommand(2),
    'Mod-Alt-3': setHeadingCommand(3),
    'Mod-Alt-4': setHeadingCommand(4),
    'Mod-Alt-5': setHeadingCommand(5),
    'Mod-Alt-6': setHeadingCommand(6),
    'Mod-Alt-0': setParagraphCommand()
  },
  toolbar: [
    {
      name: 'heading1',
      title: '标题 1',
      icon: 'heading-1',
      command: setHeadingCommand(1),
      active: isHeadingActive(1)
    },
    {
      name: 'heading2',
      title: '标题 2',
      icon: 'heading-2',
      command: setHeadingCommand(2),
      active: isHeadingActive(2)
    },
    {
      name: 'heading3',
      title: '标题 3',
      icon: 'heading-3',
      command: setHeadingCommand(3),
      active: isHeadingActive(3)
    }
  ]
})