/**
 * 全屏插件
 * 提供全屏编辑功能
 */

import type { Plugin } from '../../types'

const FullscreenPlugin: Plugin = {
  name: 'Fullscreen',
  install(editor: any) {
    // 注册全屏命令
    editor.commandManager.registerCommand('toggleFullscreen', {
      execute: () => {
        const element = editor.element
        if (!element) return false
        
        if (element.classList.contains('fullscreen')) {
          element.classList.remove('fullscreen')
          document.body.style.overflow = ''
        } else {
          element.classList.add('fullscreen')
          document.body.style.overflow = 'hidden'
        }
        
        // 触发 resize 事件
        window.dispatchEvent(new Event('resize'))
        return true
      }
    })
    
    // 添加快捷键
    editor.shortcutManager?.registerShortcut({
      key: 'F11',
      command: 'toggleFullscreen',
      description: '切换全屏'
    })
    
    console.log('[FullscreenPlugin] Installed')
  }
}

export default FullscreenPlugin
