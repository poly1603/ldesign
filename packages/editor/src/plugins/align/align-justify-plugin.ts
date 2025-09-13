/**
 * 两端对齐插件
 */

import type { Command, IEditor } from '../../types'
import { BasePlugin } from '../base-plugin'

export class AlignJustifyPlugin extends BasePlugin {
  public readonly name = 'alignJustify'
  public readonly version = '1.0.0'
  public readonly description = '文本两端对齐功能插件'

  getCommands(): Command[] {
    return [
      {
        name: 'alignJustify',
        execute: this.alignJustify.bind(this),
        canExecute: this.canAlign.bind(this),
        isActive: this.isAlignJustifyActive.bind(this)
      }
    ]
  }

  getToolbarItems() {
    return ['alignJustify']
  }

  private alignJustify(editor: IEditor): boolean {
    try {
      const success = document.execCommand('justifyFull', false)
      if (success) {
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        return true
      }
      return false
    } catch (error) {
      this.log('error', 'Error executing align justify:', error)
      return false
    }
  }

  private canAlign(editor: IEditor): boolean {
    return !editor.state.readonly && editor.selection.getSelection() !== null
  }

  private isAlignJustifyActive(editor: IEditor): boolean {
    try {
      return document.queryCommandState('justifyFull')
    } catch (error) {
      return false
    }
  }
}
