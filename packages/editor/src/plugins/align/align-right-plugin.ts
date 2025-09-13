/**
 * 右对齐插件
 */

import type { Command, IEditor } from '../../types'
import { BasePlugin } from '../base-plugin'

export class AlignRightPlugin extends BasePlugin {
  public readonly name = 'alignRight'
  public readonly version = '1.0.0'
  public readonly description = '文本右对齐功能插件'

  getCommands(): Command[] {
    return [
      {
        name: 'alignRight',
        execute: this.alignRight.bind(this),
        canExecute: this.canAlign.bind(this),
        isActive: this.isAlignRightActive.bind(this)
      }
    ]
  }

  getToolbarItems() {
    return ['alignRight']
  }

  private alignRight(editor: IEditor): boolean {
    try {
      const success = document.execCommand('justifyRight', false)
      if (success) {
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        return true
      }
      return false
    } catch (error) {
      this.log('error', 'Error executing align right:', error)
      return false
    }
  }

  private canAlign(editor: IEditor): boolean {
    return !editor.state.readonly && editor.selection.getSelection() !== null
  }

  private isAlignRightActive(editor: IEditor): boolean {
    try {
      return document.queryCommandState('justifyRight')
    } catch (error) {
      return false
    }
  }
}
