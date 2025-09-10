/**
 * 命令管理器
 * 负责编辑器的命令系统，包括命令注册、执行、状态管理等
 */

import type { 
  ICommandManager, 
  IEditor, 
  Command, 
  CommandResult 
} from '../types'

/**
 * 命令管理器实现
 * 提供完整的命令管理功能，支持命令注册、执行、状态查询等
 */
export class CommandManager implements ICommandManager {
  /** 编辑器实例 */
  private editor: IEditor

  /** 命令注册表 */
  private commands: Map<string, Command> = new Map()

  /** 命令执行历史 */
  private executionHistory: Array<{
    name: string
    args: any[]
    timestamp: number
    result: CommandResult
  }> = []

  /** 最大历史记录数 */
  private maxHistorySize = 100

  constructor(editor: IEditor) {
    this.editor = editor
  }

  /**
   * 注册命令
   * @param command 命令对象
   */
  register(command: Command): void {
    if (this.commands.has(command.name)) {
      console.warn(`Command "${command.name}" is already registered. Overwriting.`)
    }
    
    this.commands.set(command.name, command)
  }

  /**
   * 批量注册命令
   * @param commands 命令数组
   */
  registerMultiple(commands: Command[]): void {
    commands.forEach(command => this.register(command))
  }

  /**
   * 注销命令
   * @param name 命令名称
   */
  unregister(name: string): void {
    if (!this.commands.has(name)) {
      console.warn(`Command "${name}" is not registered.`)
      return
    }
    
    this.commands.delete(name)
  }

  /**
   * 检查命令是否已注册
   * @param name 命令名称
   * @returns 是否已注册
   */
  isRegistered(name: string): boolean {
    return this.commands.has(name)
  }

  /**
   * 获取命令
   * @param name 命令名称
   * @returns 命令对象或undefined
   */
  getCommand(name: string): Command | undefined {
    return this.commands.get(name)
  }

  /**
   * 获取所有已注册的命令
   * @returns 命令数组
   */
  getAllCommands(): Command[] {
    return Array.from(this.commands.values())
  }

  /**
   * 获取所有命令名称
   * @returns 命令名称数组
   */
  getCommandNames(): string[] {
    return Array.from(this.commands.keys())
  }

  /**
   * 执行命令
   * @param name 命令名称
   * @param args 命令参数
   * @returns 命令执行结果
   */
  execute(name: string, ...args: any[]): CommandResult {
    const command = this.commands.get(name)
    
    if (!command) {
      const result: CommandResult = {
        success: false,
        error: `Command "${name}" is not registered.`
      }
      this.recordExecution(name, args, result)
      return result
    }

    // 检查命令是否可以执行
    if (command.canExecute && !command.canExecute(this.editor, ...args)) {
      const result: CommandResult = {
        success: false,
        error: `Command "${name}" cannot be executed at this time.`
      }
      this.recordExecution(name, args, result)
      return result
    }

    try {
      // 执行命令
      const success = command.execute(this.editor, ...args)
      const result: CommandResult = {
        success,
        data: success ? 'Command executed successfully' : 'Command execution failed'
      }
      
      this.recordExecution(name, args, result)
      return result
    } catch (error) {
      const result: CommandResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
      
      this.recordExecution(name, args, result)
      console.error(`Error executing command "${name}":`, error)
      return result
    }
  }

  /**
   * 检查命令是否可以执行
   * @param name 命令名称
   * @param args 命令参数
   * @returns 是否可以执行
   */
  canExecute(name: string, ...args: any[]): boolean {
    const command = this.commands.get(name)
    
    if (!command) {
      return false
    }

    if (command.canExecute) {
      try {
        return command.canExecute(this.editor, ...args)
      } catch (error) {
        console.error(`Error checking if command "${name}" can execute:`, error)
        return false
      }
    }

    return true
  }

  /**
   * 检查命令是否处于激活状态
   * @param name 命令名称
   * @returns 是否激活
   */
  isActive(name: string): boolean {
    const command = this.commands.get(name)
    
    if (!command || !command.isActive) {
      return false
    }

    try {
      return command.isActive(this.editor)
    } catch (error) {
      console.error(`Error checking if command "${name}" is active:`, error)
      return false
    }
  }

  /**
   * 获取命令状态信息
   * @param name 命令名称
   * @returns 状态信息
   */
  getCommandState(name: string): {
    registered: boolean
    canExecute: boolean
    isActive: boolean
  } {
    return {
      registered: this.isRegistered(name),
      canExecute: this.canExecute(name),
      isActive: this.isActive(name)
    }
  }

  /**
   * 获取执行历史
   * @param limit 限制数量
   * @returns 执行历史数组
   */
  getExecutionHistory(limit?: number): Array<{
    name: string
    args: any[]
    timestamp: number
    result: CommandResult
  }> {
    const history = [...this.executionHistory].reverse()
    return limit ? history.slice(0, limit) : history
  }

  /**
   * 清除执行历史
   */
  clearExecutionHistory(): void {
    this.executionHistory = []
  }

  /**
   * 记录命令执行
   * @param name 命令名称
   * @param args 命令参数
   * @param result 执行结果
   */
  private recordExecution(name: string, args: any[], result: CommandResult): void {
    this.executionHistory.push({
      name,
      args: [...args], // 创建参数副本
      timestamp: Date.now(),
      result: { ...result } // 创建结果副本
    })

    // 限制历史记录数量
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory.shift()
    }
  }

  /**
   * 设置最大历史记录数
   * @param size 最大数量
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = Math.max(0, size)
    
    // 如果当前历史记录超过新的限制，则截断
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(-this.maxHistorySize)
    }
  }

  /**
   * 获取调试信息
   * @returns 调试信息对象
   */
  getDebugInfo(): {
    totalCommands: number
    commandNames: string[]
    executionHistorySize: number
    recentExecutions: Array<{ name: string; timestamp: number; success: boolean }>
  } {
    const recentExecutions = this.executionHistory
      .slice(-10)
      .map(entry => ({
        name: entry.name,
        timestamp: entry.timestamp,
        success: entry.result.success
      }))

    return {
      totalCommands: this.commands.size,
      commandNames: this.getCommandNames(),
      executionHistorySize: this.executionHistory.length,
      recentExecutions
    }
  }

  /**
   * 销毁命令管理器
   */
  destroy(): void {
    this.commands.clear()
    this.executionHistory = []
  }
}
