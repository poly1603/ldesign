/**
 * 删除线插件
 * 提供文本删除线功能
 */

import type { Command, IEditor } from '../../types'
import { BasePlugin } from '../base-plugin'

/**
 * 删除线插件实现
 */
export class StrikethroughPlugin extends BasePlugin {
  public readonly name = 'strikethrough'
  public readonly version = '1.0.0'
  public readonly description = '文本删除线功能插件'

  /**
   * 获取插件命令
   */
  getCommands(): Command[] {
    return [
      {
        name: 'strikethrough',
        execute: this.toggleStrikethrough.bind(this),
        canExecute: this.canToggleStrikethrough.bind(this),
        isActive: this.isStrikethroughActive.bind(this)
      }
    ]
  }

  /**
   * 获取工具栏项目
   */
  getToolbarItems() {
    return ['strikethrough']
  }

  /**
   * 切换删除线状态
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private toggleStrikethrough(editor: IEditor): boolean {
    try {
      const success = document.execCommand('strikeThrough', false)
      
      if (success) {
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        this.log('info', 'Strikethrough toggled successfully')
        return true
      } else {
        this.log('warn', 'Failed to toggle strikethrough using execCommand')
        return false
      }
    } catch (error) {
      this.log('error', 'Error toggling strikethrough:', error)
      return false
    }
  }

  /**
   * 检查是否可以切换删除线
   * @param editor 编辑器实例
   * @returns 是否可以执行
   */
  private canToggleStrikethrough(editor: IEditor): boolean {
    if (editor.state.readonly) {
      return false
    }

    const selection = editor.selection.getSelection()
    return selection !== null
  }

  /**
   * 检查删除线是否激活
   * @param editor 编辑器实例
   * @returns 是否激活
   */
  private isStrikethroughActive(editor: IEditor): boolean {
    try {
      return document.queryCommandState('strikeThrough')
    } catch (error) {
      this.log('error', 'Error checking strikethrough state:', error)
      return false
    }
  }

  /**
   * 插件初始化
   */
  protected onInit(): void {
    this.log('info', 'Strikethrough plugin initialized')
  }

  /**
   * 插件销毁
   */
  protected onDestroy(): void {
    this.log('info', 'Strikethrough plugin destroyed')
  }
}
