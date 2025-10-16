/**
 * 历史记录插件
 * 提供撤销和重做功能
 */

import type { Plugin } from '../../types'

const HistoryPlugin: Plugin = {
  name: 'History',
  install(editor: any) {
    const history: string[] = []
    let currentIndex = -1
    
    // 注册撤销命令
    editor.commandManager.registerCommand('undo', {
      execute: () => {
        if (currentIndex > 0) {
          currentIndex--
          editor.setContent(history[currentIndex])
          return true
        }
        return false
      }
    })
    
    // 注册重做命令
    editor.commandManager.registerCommand('redo', {
      execute: () => {
        if (currentIndex < history.length - 1) {
          currentIndex++
          editor.setContent(history[currentIndex])
          return true
        }
        return false
      }
    })
    
    // 监听内容变化
    editor.on('input', () => {
      const content = editor.getContent()
      if (currentIndex === -1 || content !== history[currentIndex]) {
        // 删除当前位置之后的历史
        history.splice(currentIndex + 1)
        // 添加新的历史记录
        history.push(content)
        currentIndex++
        // 限制历史记录数量
        if (history.length > 100) {
          history.shift()
          currentIndex--
        }
      }
    })
    
    // 添加快捷键
    editor.shortcutManager?.registerShortcut({
      key: 'Ctrl+Z',
      command: 'undo',
      description: '撤销'
    })
    
    editor.shortcutManager?.registerShortcut({
      key: 'Ctrl+Y',
      command: 'redo',
      description: '重做'
    })
    
    console.log('[HistoryPlugin] Installed')
  }
}

export default HistoryPlugin
