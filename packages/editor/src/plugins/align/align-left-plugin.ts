/**
 * 左对齐插件
 * 提供文本左对齐功能
 */

import type { Command, IEditor } from '../../types'
import { BasePlugin } from '../base-plugin'

/**
 * 左对齐插件实现
 */
export class AlignLeftPlugin extends BasePlugin {
  public readonly name = 'alignLeft'
  public readonly version = '1.0.0'
  public readonly description = '文本左对齐功能插件'

  /**
   * 获取插件命令
   */
  getCommands(): Command[] {
    return [
      {
        name: 'alignLeft',
        execute: this.alignLeft.bind(this),
        canExecute: this.canAlign.bind(this),
        isActive: this.isAlignLeftActive.bind(this)
      }
    ]
  }

  /**
   * 获取工具栏项目
   */
  getToolbarItems() {
    return ['alignLeft']
  }

  /**
   * 执行左对齐
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private alignLeft(editor: IEditor): boolean {
    try {
      const success = document.execCommand('justifyLeft', false)
      
      if (success) {
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        this.log('info', 'Align left executed successfully')
        return true
      } else {
        this.log('warn', 'Failed to align left using execCommand')
        return false
      }
    } catch (error) {
      this.log('error', 'Error executing align left:', error)
      return false
    }
  }

  /**
   * 检查是否可以对齐
   * @param editor 编辑器实例
   * @returns 是否可以执行
   */
  private canAlign(editor: IEditor): boolean {
    if (editor.state.readonly) {
      return false
    }

    const selection = editor.selection.getSelection()
    return selection !== null
  }

  /**
   * 检查左对齐是否激活
   * @param editor 编辑器实例
   * @returns 是否激活
   */
  private isAlignLeftActive(editor: IEditor): boolean {
    try {
      return document.queryCommandState('justifyLeft')
    } catch (error) {
      this.log('error', 'Error checking align left state:', error)
      return false
    }
  }

  /**
   * 插件初始化
   */
  protected onInit(): void {
    this.log('info', 'Align left plugin initialized')
  }

  /**
   * 插件销毁
   */
  protected onDestroy(): void {
    this.log('info', 'Align left plugin destroyed')
  }
}
