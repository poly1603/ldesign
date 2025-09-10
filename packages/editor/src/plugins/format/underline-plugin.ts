/**
 * 下划线插件
 * 提供文本下划线功能
 */

import type { Command, IEditor } from '../../types'
import { BasePlugin } from '../base-plugin'

/**
 * 下划线插件实现
 */
export class UnderlinePlugin extends BasePlugin {
  public readonly name = 'underline'
  public readonly version = '1.0.0'
  public readonly description = '文本下划线功能插件'

  /**
   * 获取插件命令
   */
  getCommands(): Command[] {
    return [
      {
        name: 'underline',
        execute: this.toggleUnderline.bind(this),
        canExecute: this.canToggleUnderline.bind(this),
        isActive: this.isUnderlineActive.bind(this)
      }
    ]
  }

  /**
   * 获取工具栏项目
   */
  getToolbarItems() {
    return ['underline']
  }

  /**
   * 切换下划线状态
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private toggleUnderline(editor: IEditor): boolean {
    try {
      // 使用浏览器原生的 execCommand
      const success = document.execCommand('underline', false)
      
      if (success) {
        // 触发内容变更事件
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        
        this.log('info', 'Underline toggled successfully')
        return true
      } else {
        this.log('warn', 'Failed to toggle underline using execCommand')
        return false
      }
    } catch (error) {
      this.log('error', 'Error toggling underline:', error)
      return false
    }
  }

  /**
   * 检查是否可以切换下划线
   * @param editor 编辑器实例
   * @returns 是否可以执行
   */
  private canToggleUnderline(editor: IEditor): boolean {
    // 检查编辑器是否只读
    if (editor.state.readonly) {
      return false
    }

    // 检查是否有选区或光标位置
    const selection = editor.selection.getSelection()
    return selection !== null
  }

  /**
   * 检查下划线是否激活
   * @param editor 编辑器实例
   * @returns 是否激活
   */
  private isUnderlineActive(editor: IEditor): boolean {
    try {
      // 使用浏览器原生的 queryCommandState
      return document.queryCommandState('underline')
    } catch (error) {
      this.log('error', 'Error checking underline state:', error)
      return false
    }
  }

  /**
   * 插件初始化
   */
  protected onInit(): void {
    this.log('info', 'Underline plugin initialized')
  }

  /**
   * 插件销毁
   */
  protected onDestroy(): void {
    this.log('info', 'Underline plugin destroyed')
  }
}
