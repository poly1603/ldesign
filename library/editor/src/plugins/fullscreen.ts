/**
 * 全屏插件
 * 提供全屏编辑功能
 */

import { createPlugin } from '../core/Plugin'
import type { Plugin, Command } from '../types'

/**
 * 切换全屏
 */
function toggleFullscreen(editor: any): Command {
  return (state, dispatch) => {
    if (!dispatch) return true

    const editorElement = editor.element
    if (!editorElement) return false

    if (!editorElement.classList.contains('fullscreen')) {
      // 进入全屏
      editorElement.classList.add('fullscreen')
      editorElement.style.position = 'fixed'
      editorElement.style.top = '0'
      editorElement.style.left = '0'
      editorElement.style.width = '100%'
      editorElement.style.height = '100vh'
      editorElement.style.zIndex = '9999'
      editorElement.style.background = '#fff'
      editorElement.style.display = 'flex'
      editorElement.style.flexDirection = 'column'
      editorElement.style.overflow = 'hidden'
      
      // 确保工具栏可见
      const toolbar = editorElement.querySelector('.ldesign-editor-toolbar')
      if (toolbar) {
        toolbar.style.flexShrink = '0'
      }
      
      // 调整内容区域
      const content = editorElement.querySelector('.ldesign-editor-content')
      if (content) {
        content.style.flex = '1'
        content.style.overflow = 'auto'
        content.style.padding = '20px'
      }
    } else {
      // 退出全屏
      editorElement.classList.remove('fullscreen')
      editorElement.style.position = ''
      editorElement.style.top = ''
      editorElement.style.left = ''
      editorElement.style.width = ''
      editorElement.style.height = ''
      editorElement.style.zIndex = ''
      editorElement.style.background = ''
      editorElement.style.display = ''
      editorElement.style.flexDirection = ''
      editorElement.style.overflow = ''
      
      // 恢复工具栏样式
      const toolbar = editorElement.querySelector('.ldesign-editor-toolbar')
      if (toolbar) {
        toolbar.style.flexShrink = ''
      }
      
      // 恢复内容区域样式
      const content = editorElement.querySelector('.ldesign-editor-content')
      if (content) {
        content.style.flex = ''
        content.style.overflow = ''
        content.style.padding = ''
      }
    }

    return true
  }
}

/**
 * 检查是否全屏
 */
function isFullscreen(editor: any) {
  return () => {
    return editor.element?.classList.contains('fullscreen') || false
  }
}

/**
 * 全屏插件
 */
export const FullscreenPlugin: Plugin = {
  name: 'fullscreen',
  config: {
    name: 'fullscreen',
    commands: {},
    toolbar: []
  },
  install(editor: any) {
    // 注册命令
    editor.commands.register('toggleFullscreen', toggleFullscreen(editor))

    // 注册快捷键
    editor.keymap.register('F11', toggleFullscreen(editor))

    // 添加工具栏项
    const toolbarItem = {
      name: 'fullscreen',
      title: '全屏',
      icon: 'maximize',
      command: toggleFullscreen(editor),
      active: isFullscreen(editor)
    }

    this.config.toolbar = [toolbarItem]
  }
}
