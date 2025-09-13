/**
 * 撤销重做插件
 * 提供撤销和重做功能
 */

import type { Command, IEditor } from '../../types'
import { BasePlugin } from '../base-plugin'

/**
 * 撤销重做插件实现
 */
export class UndoRedoPlugin extends BasePlugin {
  public readonly name = 'undoRedo'
  public readonly version = '1.0.0'
  public readonly description = '撤销和重做功能插件'

  /**
   * 获取插件命令
   */
  getCommands(): Command[] {
    return [
      {
        name: 'undo',
        execute: this.undo.bind(this),
        canExecute: this.canUndo.bind(this),
        isActive: () => false
      },
      {
        name: 'redo',
        execute: this.redo.bind(this),
        canExecute: this.canRedo.bind(this),
        isActive: () => false
      }
    ]
  }

  /**
   * 获取工具栏项目
   */
  getToolbarItems() {
    return ['undo', 'redo']
  }

  /**
   * 执行撤销
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private undo(editor: IEditor): boolean {
    try {
      if (editor.history && editor.history.canUndo()) {
        const success = editor.history.undo()
        if (success) {
          this.log('info', 'Undo executed successfully')
          return true
        }
      }
      this.log('warn', 'Cannot undo')
      return false
    } catch (error) {
      this.log('error', 'Error executing undo:', error)
      return false
    }
  }

  /**
   * 执行重做
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private redo(editor: IEditor): boolean {
    try {
      if (editor.history && editor.history.canRedo()) {
        const success = editor.history.redo()
        if (success) {
          this.log('info', 'Redo executed successfully')
          return true
        }
      }
      this.log('warn', 'Cannot redo')
      return false
    } catch (error) {
      this.log('error', 'Error executing redo:', error)
      return false
    }
  }

  /**
   * 检查是否可以撤销
   * @param editor 编辑器实例
   * @returns 是否可以执行
   */
  private canUndo(editor: IEditor): boolean {
    if (editor.state.readonly) {
      return false
    }

    return editor.history ? editor.history.canUndo() : false
  }

  /**
   * 检查是否可以重做
   * @param editor 编辑器实例
   * @returns 是否可以执行
   */
  private canRedo(editor: IEditor): boolean {
    if (editor.state.readonly) {
      return false
    }

    return editor.history ? editor.history.canRedo() : false
  }

  /**
   * 插件初始化
   */
  protected onInit(): void {
    this.log('info', 'Undo/Redo plugin initialized')
  }

  /**
   * 插件销毁
   */
  protected onDestroy(): void {
    this.log('info', 'Undo/Redo plugin destroyed')
  }
}
