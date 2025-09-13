/**
 * 下标插件
 * 提供文本下标功能
 */

import type { Command, IEditor } from '../../types'
import { BasePlugin } from '../base-plugin'

/**
 * 下标插件实现
 */
export class SubscriptPlugin extends BasePlugin {
  public readonly name = 'subscript'
  public readonly version = '1.0.0'
  public readonly description = '文本下标功能插件'

  /**
   * 获取插件命令
   */
  getCommands(): Command[] {
    return [
      {
        name: 'subscript',
        execute: this.toggleSubscript.bind(this),
        canExecute: this.canToggleSubscript.bind(this),
        isActive: this.isSubscriptActive.bind(this)
      }
    ]
  }

  /**
   * 获取工具栏项目
   */
  getToolbarItems() {
    return ['subscript']
  }

  /**
   * 切换下标状态
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private toggleSubscript(editor: IEditor): boolean {
    try {
      const success = document.execCommand('subscript', false)
      
      if (success) {
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        this.log('info', 'Subscript toggled successfully')
        return true
      } else {
        this.log('warn', 'Failed to toggle subscript using execCommand')
        return false
      }
    } catch (error) {
      this.log('error', 'Error toggling subscript:', error)
      return false
    }
  }

  /**
   * 检查是否可以切换下标
   * @param editor 编辑器实例
   * @returns 是否可以执行
   */
  private canToggleSubscript(editor: IEditor): boolean {
    if (editor.state.readonly) {
      return false
    }

    const selection = editor.selection.getSelection()
    return selection !== null
  }

  /**
   * 检查下标是否激活
   * @param editor 编辑器实例
   * @returns 是否激活
   */
  private isSubscriptActive(editor: IEditor): boolean {
    try {
      return document.queryCommandState('subscript')
    } catch (error) {
      this.log('error', 'Error checking subscript state:', error)
      return false
    }
  }

  /**
   * 插件初始化
   */
  protected onInit(): void {
    this.log('info', 'Subscript plugin initialized')
  }

  /**
   * 插件销毁
   */
  protected onDestroy(): void {
    this.log('info', 'Subscript plugin destroyed')
  }
}
