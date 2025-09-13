/**
 * 居中对齐插件
 */

import type { Command, IEditor } from '../../types'
import { BasePlugin } from '../base-plugin'

export class AlignCenterPlugin extends BasePlugin {
  public readonly name = 'alignCenter'
  public readonly version = '1.0.0'
  public readonly description = '文本居中对齐功能插件'

  getCommands(): Command[] {
    return [
      {
        name: 'alignCenter',
        execute: this.alignCenter.bind(this),
        canExecute: this.canAlign.bind(this),
        isActive: this.isAlignCenterActive.bind(this)
      }
    ]
  }

  getToolbarItems() {
    return ['alignCenter']
  }

  private alignCenter(editor: IEditor): boolean {
    try {
      const success = document.execCommand('justifyCenter', false)
      if (success) {
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        return true
      }
      return false
    } catch (error) {
      this.log('error', 'Error executing align center:', error)
      return false
    }
  }

  private canAlign(editor: IEditor): boolean {
    return !editor.state.readonly && editor.selection.getSelection() !== null
  }

  private isAlignCenterActive(editor: IEditor): boolean {
    try {
      return document.queryCommandState('justifyCenter')
    } catch (error) {
      return false
    }
  }
}
