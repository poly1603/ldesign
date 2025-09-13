/**
 * 上标插件
 * 提供文本上标功能
 */

import type { Command, IEditor } from '../../types'
import { BasePlugin } from '../base-plugin'

/**
 * 上标插件实现
 */
export class SuperscriptPlugin extends BasePlugin {
  public readonly name = 'superscript'
  public readonly version = '1.0.0'
  public readonly description = '文本上标功能插件'

  /**
   * 获取插件命令
   */
  getCommands(): Command[] {
    return [
      {
        name: 'superscript',
        execute: this.toggleSuperscript.bind(this),
        canExecute: this.canToggleSuperscript.bind(this),
        isActive: this.isSuperscriptActive.bind(this)
      }
    ]
  }

  /**
   * 获取工具栏项目
   */
  getToolbarItems() {
    return ['superscript']
  }

  /**
   * 切换上标状态
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private toggleSuperscript(editor: IEditor): boolean {
    try {
      const success = document.execCommand('superscript', false)
      
      if (success) {
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        this.log('info', 'Superscript toggled successfully')
        return true
      } else {
        this.log('warn', 'Failed to toggle superscript using execCommand')
        return false
      }
    } catch (error) {
      this.log('error', 'Error toggling superscript:', error)
      return false
    }
  }

  /**
   * 检查是否可以切换上标
   * @param editor 编辑器实例
   * @returns 是否可以执行
   */
  private canToggleSuperscript(editor: IEditor): boolean {
    if (editor.state.readonly) {
      return false
    }

    const selection = editor.selection.getSelection()
    return selection !== null
  }

  /**
   * 检查上标是否激活
   * @param editor 编辑器实例
   * @returns 是否激活
   */
  private isSuperscriptActive(editor: IEditor): boolean {
    try {
      return document.queryCommandState('superscript')
    } catch (error) {
      this.log('error', 'Error checking superscript state:', error)
      return false
    }
  }

  /**
   * 插件初始化
   */
  protected onInit(): void {
    this.log('info', 'Superscript plugin initialized')
  }

  /**
   * 插件销毁
   */
  protected onDestroy(): void {
    this.log('info', 'Superscript plugin destroyed')
  }
}
