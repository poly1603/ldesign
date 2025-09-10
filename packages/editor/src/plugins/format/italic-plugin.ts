/**
 * 斜体插件
 * 提供文本斜体功能
 */

import type { Command, IEditor } from '../../types'
import { BasePlugin } from '../base-plugin'

/**
 * 斜体插件实现
 */
export class ItalicPlugin extends BasePlugin {
  public readonly name = 'italic'
  public readonly version = '1.0.0'
  public readonly description = '文本斜体功能插件'

  /**
   * 获取插件命令
   */
  getCommands(): Command[] {
    return [
      {
        name: 'italic',
        execute: this.toggleItalic.bind(this),
        canExecute: this.canToggleItalic.bind(this),
        isActive: this.isItalicActive.bind(this)
      }
    ]
  }

  /**
   * 获取工具栏项目
   */
  getToolbarItems() {
    return ['italic']
  }

  /**
   * 切换斜体状态
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private toggleItalic(editor: IEditor): boolean {
    try {
      // 使用浏览器原生的 execCommand
      const success = document.execCommand('italic', false)
      
      if (success) {
        // 触发内容变更事件
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        
        this.log('info', 'Italic toggled successfully')
        return true
      } else {
        this.log('warn', 'Failed to toggle italic using execCommand')
        return false
      }
    } catch (error) {
      this.log('error', 'Error toggling italic:', error)
      return false
    }
  }

  /**
   * 检查是否可以切换斜体
   * @param editor 编辑器实例
   * @returns 是否可以执行
   */
  private canToggleItalic(editor: IEditor): boolean {
    // 检查编辑器是否只读
    if (editor.state.readonly) {
      return false
    }

    // 检查是否有选区或光标位置
    const selection = editor.selection.getSelection()
    return selection !== null
  }

  /**
   * 检查斜体是否激活
   * @param editor 编辑器实例
   * @returns 是否激活
   */
  private isItalicActive(editor: IEditor): boolean {
    try {
      // 使用浏览器原生的 queryCommandState
      return document.queryCommandState('italic')
    } catch (error) {
      this.log('error', 'Error checking italic state:', error)
      return false
    }
  }

  /**
   * 插件初始化
   */
  protected onInit(): void {
    this.log('info', 'Italic plugin initialized')
  }

  /**
   * 插件销毁
   */
  protected onDestroy(): void {
    this.log('info', 'Italic plugin destroyed')
  }
}
