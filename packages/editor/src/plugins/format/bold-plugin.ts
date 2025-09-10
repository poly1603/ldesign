/**
 * 加粗插件
 * 提供文本加粗功能
 */

import type { Command, IEditor } from '../../types'
import { BasePlugin } from '../base-plugin'

/**
 * 加粗插件实现
 */
export class BoldPlugin extends BasePlugin {
  public readonly name = 'bold'
  public readonly version = '1.0.0'
  public readonly description = '文本加粗功能插件'

  /**
   * 获取插件命令
   */
  getCommands(): Command[] {
    return [
      {
        name: 'bold',
        execute: this.toggleBold.bind(this),
        canExecute: this.canToggleBold.bind(this),
        isActive: this.isBoldActive.bind(this)
      }
    ]
  }

  /**
   * 获取工具栏项目
   */
  getToolbarItems() {
    return ['bold']
  }

  /**
   * 切换加粗状态
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private toggleBold(editor: IEditor): boolean {
    try {
      // 使用浏览器原生的 execCommand
      const success = document.execCommand('bold', false)
      
      if (success) {
        // 触发内容变更事件
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        
        this.log('info', 'Bold toggled successfully')
        return true
      } else {
        this.log('warn', 'Failed to toggle bold using execCommand')
        return false
      }
    } catch (error) {
      this.log('error', 'Error toggling bold:', error)
      return false
    }
  }

  /**
   * 检查是否可以切换加粗
   * @param editor 编辑器实例
   * @returns 是否可以执行
   */
  private canToggleBold(editor: IEditor): boolean {
    // 检查编辑器是否只读
    if (editor.state.readonly) {
      return false
    }

    // 检查是否有选区或光标位置
    const selection = editor.selection.getSelection()
    return selection !== null
  }

  /**
   * 检查加粗是否激活
   * @param editor 编辑器实例
   * @returns 是否激活
   */
  private isBoldActive(editor: IEditor): boolean {
    try {
      // 使用浏览器原生的 queryCommandState
      return document.queryCommandState('bold')
    } catch (error) {
      this.log('error', 'Error checking bold state:', error)
      return false
    }
  }

  /**
   * 插件初始化
   */
  protected onInit(): void {
    this.log('info', 'Bold plugin initialized')
  }

  /**
   * 插件销毁
   */
  protected onDestroy(): void {
    this.log('info', 'Bold plugin destroyed')
  }
}
