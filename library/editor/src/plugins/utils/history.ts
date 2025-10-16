/**
 * History plugin
 * Provides undo and redo functionality
 */

import type { Plugin } from '../../types'

const HistoryPlugin: Plugin = {
  name: 'History',
  install(editor: any) {
    const history: string[] = []
    let currentIndex = -1
    
    // Register undo command
    editor.commands.register('undo', () => {
      if (currentIndex > 0) {
        currentIndex--
        editor.setHTML(history[currentIndex])
        return true
      }
      return false
    })
    
    // Register redo command
    editor.commands.register('redo', () => {
      if (currentIndex < history.length - 1) {
        currentIndex++
        editor.setHTML(history[currentIndex])
        return true
      }
      return false
    })
    
    // Listen for content changes
    editor.on('input', () => {
      const content = editor.getHTML()
      if (currentIndex === -1 || content !== history[currentIndex]) {
        // Remove history after current position
        history.splice(currentIndex + 1)
        // Add new history record
        history.push(content)
        currentIndex++
        // Limit history size
        if (history.length > 100) {
          history.shift()
          currentIndex--
        }
      }
    })
    
    // Add keyboard shortcuts
    editor.keymap?.register({
      key: 'Ctrl+Z',
      command: 'undo',
      description: 'Undo'
    })
    
    editor.keymap?.register({
      key: 'Ctrl+Y',
      command: 'redo',
      description: 'Redo'
    })
    
    console.log('[HistoryPlugin] Installed')
  }
}

export default HistoryPlugin