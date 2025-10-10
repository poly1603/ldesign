/**
 * Command - 命令系统
 * 处理编辑器命令和快捷键
 */

import type { Command, EditorState, Transaction } from '../types'

/**
 * 命令管理器
 */
export class CommandManager {
  private commands: Map<string, Command> = new Map()
  private editor: any

  constructor(editor: any) {
    this.editor = editor
  }

  /**
   * 注册命令
   */
  register(name: string, command: Command): void {
    this.commands.set(name, command)
  }

  /**
   * 执行命令
   */
  execute(name: string, ...args: any[]): boolean {
    const command = this.commands.get(name)
    if (!command) {
      console.warn(`Command "${name}" not found`)
      return false
    }

    const state = this.editor.getState()
    return command(state, this.editor.dispatch.bind(this.editor), ...args)
  }

  /**
   * 检查命令是否可用
   */
  canExecute(name: string): boolean {
    const command = this.commands.get(name)
    if (!command) return false

    const state = this.editor.getState()
    return command(state)
  }

  /**
   * 获取所有命令
   */
  getCommands(): string[] {
    return Array.from(this.commands.keys())
  }

  /**
   * 移除命令
   */
  unregister(name: string): void {
    this.commands.delete(name)
  }

  /**
   * 清除所有命令
   */
  clear(): void {
    this.commands.clear()
  }
}

/**
 * 键盘快捷键管理器
 */
export class KeymapManager {
  private keymap: Map<string, Command> = new Map()
  private editor: any

  constructor(editor: any) {
    this.editor = editor
  }

  /**
   * 注册快捷键
   */
  register(keys: string, command: Command): void {
    this.keymap.set(this.normalizeKey(keys), command)
  }

  /**
   * 处理键盘事件
   */
  handleKeyDown(event: KeyboardEvent): boolean {
    const key = this.eventToKey(event)
    const command = this.keymap.get(key)

    if (command) {
      const state = this.editor.getState()
      const result = command(state, this.editor.dispatch.bind(this.editor))

      if (result) {
        event.preventDefault()
        return true
      }
    }

    return false
  }

  /**
   * 事件转快捷键字符串
   */
  private eventToKey(event: KeyboardEvent): string {
    const parts: string[] = []

    if (event.ctrlKey || event.metaKey) parts.push('Mod')
    if (event.altKey) parts.push('Alt')
    if (event.shiftKey) parts.push('Shift')

    const key = event.key
    if (key.length === 1) {
      parts.push(key.toUpperCase())
    } else {
      parts.push(key)
    }

    return parts.join('-')
  }

  /**
   * 规范化快捷键
   */
  private normalizeKey(key: string): string {
    return key
      .split('-')
      .map(part => {
        if (part === 'Ctrl' || part === 'Cmd' || part === 'Command') return 'Mod'
        if (part === 'Option') return 'Alt'
        return part
      })
      .join('-')
  }

  /**
   * 移除快捷键
   */
  unregister(keys: string): void {
    this.keymap.delete(this.normalizeKey(keys))
  }

  /**
   * 清除所有快捷键
   */
  clear(): void {
    this.keymap.clear()
  }
}

/**
 * 内置命令
 */

// 撤销
export const undo: Command = (state, dispatch) => {
  // TODO: 实现撤销逻辑
  return true
}

// 重做
export const redo: Command = (state, dispatch) => {
  // TODO: 实现重做逻辑
  return true
}

// 切换标记
export function toggleMark(markType: string): Command {
  return (state, dispatch) => {
    if (dispatch) {
      // TODO: 实现切换标记逻辑
    }
    return true
  }
}

// 设置节点类型
export function setBlockType(nodeType: string, attrs?: any): Command {
  return (state, dispatch) => {
    if (dispatch) {
      // TODO: 实现设置节点类型逻辑
    }
    return true
  }
}

// 插入节点
export function insertNode(node: any): Command {
  return (state, dispatch) => {
    if (dispatch) {
      // TODO: 实现插入节点逻辑
    }
    return true
  }
}

// 删除选区
export const deleteSelection: Command = (state, dispatch) => {
  if (state.selection.empty) return false

  if (dispatch) {
    // TODO: 实现删除选区逻辑
  }

  return true
}
