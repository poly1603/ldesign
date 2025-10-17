/**
 * Command - 命令系统
 * 处理编辑器命令和快捷键
 */

import type { Command, EditorState, Transaction } from '../types'
import { History } from './History'
import { createLogger } from '../utils/logger'

const logger = createLogger('CommandManager')

/**
 * 命令管理器
 */
export class CommandManager {
  private commands: Map<string, Command> = new Map()
  private editor: any
  public history: History

  constructor(editor: any) {
    this.editor = editor
    this.history = new History(editor)
    logger.debug('CommandManager initialized')
  }
  
  /**
   * 撤销
   */
  undo(): boolean {
    const result = this.history.undo()
    if (result) {
      this.editor.emit('content-change')
    }
    return result
  }
  
  /**
   * 重做
   */
  redo(): boolean {
    const result = this.history.redo()
    if (result) {
      this.editor.emit('content-change')
    }
    return result
  }
  
  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.history.canUndo()
  }
  
  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    return this.history.canRedo()
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
    logger.debug(`Executing command: "${name}" with args:`, args)
    const command = this.commands.get(name)
    if (!command) {
      logger.warn(`Command "${name}" not found`)
      logger.debug(`Available commands:`, Array.from(this.commands.keys()))
      return false
    }

    const state = this.editor.getState()
    logger.debug(`State:`, state)
    logger.debug(`Calling command function`)
    const result = command(state, this.editor.dispatch.bind(this.editor), ...args)
    logger.debug(`Command returned:`, result)
    return result
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
   * 获取命令
   */
  get(name: string): Command | undefined {
    return this.commands.get(name)
  }
  
  /**
   * 检查命令是否存在
   */
  has(name: string): boolean {
    return this.commands.has(name)
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
   * 支持两种形式：
   * - register('Mod-B', command)
   * - register({ key: 'Ctrl+Z', command: 'undo' | Command })
   */
  register(keys: string | { key: string, command: Command | string }, command?: Command): void {
    if (typeof keys === 'string') {
      if (!command) return
      this.keymap.set(this.normalizeKey(keys), command)
      return
    }

    const keyStr = keys.key
    const cmdOrName = keys.command
    const handler: Command = (state, dispatch) => {
      if (typeof cmdOrName === 'string') {
        return this.editor.commands.execute(cmdOrName)
      }
      return cmdOrName(state, dispatch)
    }
    this.keymap.set(this.normalizeKey(keyStr), handler)
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
      .split(/[-+]/) // 同时支持用 - 或 + 连接
      .map(part => {
        if (part === 'Ctrl' || part === 'Cmd' || part === 'Command' || part === 'Meta') return 'Mod'
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
  // 撤销由 CommandManager 中的 History 实例处理
  return true
}

// 重做
export const redo: Command = (state, dispatch) => {
  // 重做由 CommandManager 中的 History 实例处理
  return true
}

// 切换标记
export function toggleMark(markType: string): Command {
  return (state, dispatch) => {
    if (!dispatch) return true
    
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return false
    
    try {
      // 使用 document.execCommand 来切换标记
      // 这是浏览器原生支持的，兼容性好
      const commandMap: Record<string, string> = {
        'bold': 'bold',
        'italic': 'italic',
        'underline': 'underline',
        'strike': 'strikeThrough',
        'code': 'insertHTML', // 代码需要特殊处理
        'superscript': 'superscript',
        'subscript': 'subscript'
      }
      
      const command = commandMap[markType]
      if (!command) return false
      
      if (markType === 'code') {
        // 代码标记特殊处理
        const text = selection.toString()
        if (text) {
          document.execCommand('insertHTML', false, `<code>${text}</code>`)
        }
      } else {
        document.execCommand(command, false)
      }
      
      return true
    } catch (e) {
      console.error('Failed to toggle mark:', e)
      return false
    }
  }
}

// 设置节点类型
export function setBlockType(nodeType: string, attrs?: any): Command {
  return (state, dispatch) => {
    if (!dispatch) return true
    
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return false
    
    try {
      const range = selection.getRangeAt(0)
      let block = range.commonAncestorContainer as Node
      
      // 查找块级元素
      while (block && block.nodeType !== Node.ELEMENT_NODE || !isBlockElement(block as HTMLElement)) {
        if (!block.parentNode) return false
        block = block.parentNode
      }
      
      const blockElement = block as HTMLElement
      
      // 创建新节点
      const newNode = document.createElement(nodeType)
      if (attrs) {
        Object.entries(attrs).forEach(([key, value]) => {
          newNode.setAttribute(key, String(value))
        })
      }
      
      // 转移内容
      while (blockElement.firstChild) {
        newNode.appendChild(blockElement.firstChild)
      }
      
      // 替换节点
      blockElement.parentNode?.replaceChild(newNode, blockElement)
      
      // 恢复选区
      const newRange = document.createRange()
      newRange.selectNodeContents(newNode)
      selection.removeAllRanges()
      selection.addRange(newRange)
      
      return true
    } catch (e) {
      console.error('Failed to set block type:', e)
      return false
    }
  }
}

// 插入节点
export function insertNode(node: any): Command {
  return (state, dispatch) => {
    if (!dispatch) return true
    
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return false
    
    try {
      const range = selection.getRangeAt(0)
      
      // 删除选中的内容
      range.deleteContents()
      
      // 插入新节点
      if (typeof node === 'string') {
        // 如果是字符串，创建文本节点
        const textNode = document.createTextNode(node)
        range.insertNode(textNode)
      } else if (node instanceof HTMLElement) {
        // 如果是 HTML 元素，直接插入
        range.insertNode(node)
      } else {
        return false
      }
      
      // 移动光标到插入内容之后
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
      
      return true
    } catch (e) {
      console.error('Failed to insert node:', e)
      return false
    }
  }
}

// 删除选区
export const deleteSelection: Command = (state, dispatch) => {
  if (state.selection.empty) return false

  if (dispatch) {
    try {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return false
      
      const range = selection.getRangeAt(0)
      if (range.collapsed) return false
      
      // 删除选中的内容
      range.deleteContents()
      
      // 确保光标位置正确
      selection.removeAllRanges()
      selection.addRange(range)
      
      return true
    } catch (e) {
      console.error('Failed to delete selection:', e)
      return false
    }
  }

  return true
}

/**
 * 辅助函数：判断是否是块级元素
 */
function isBlockElement(element: HTMLElement): boolean {
  const blockTags = [
    'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    'DIV', 'BLOCKQUOTE', 'PRE', 'UL', 'OL', 'LI',
    'TABLE', 'TR', 'TD', 'TH'
  ]
  return blockTags.includes(element.tagName)
}
