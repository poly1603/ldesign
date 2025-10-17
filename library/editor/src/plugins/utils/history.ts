/**
 * History plugin
 * Provides undo and redo functionality
 * 
 * NOTE: The actual History implementation is in src/core/History.ts
 * This plugin just registers the keyboard shortcuts and commands
 */

import type { Plugin } from '../../types'
import { createLogger } from '../../utils/logger'

const logger = createLogger('HistoryPlugin')

const HistoryPlugin: Plugin = {
  name: 'History',
  install(editor: any) {
    // Register undo command (uses CommandManager's undo method)
    editor.commands.register('undo', () => {
      return editor.commands.undo()
    })
    
    // Register redo command (uses CommandManager's redo method)
    editor.commands.register('redo', () => {
      return editor.commands.redo()
    })
    
    // Add keyboard shortcuts
    if (editor.keymap) {
      editor.keymap.register({
        key: 'Ctrl+Z',
        command: 'undo',
        description: 'Undo'
      })
      
      editor.keymap.register({
        key: 'Ctrl+Shift+Z',
        command: 'redo',
        description: 'Redo'
      })
      
      editor.keymap.register({
        key: 'Ctrl+Y',
        command: 'redo',
        description: 'Redo'
      })
    }
    
    logger.debug('Installed - using CommandManager History')
  }
}

export default HistoryPlugin