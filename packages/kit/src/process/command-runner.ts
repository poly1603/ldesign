/**
 * 命令运行器
 * 提供高级命令执行和管理功能
 */

import type { ChildProcess } from 'node:child_process'
import type { ExecResult, ExecOptions as KitExecOptions } from '../types'
import { spawn } from 'node:child_process'
import { EventEmitter } from 'node:events'
import { ProcessError } from '../types'
import { AsyncUtils } from '../utils'

/**
 * 命令运行器类
 */
export class CommandRunner extends EventEmitter {
  private runningCommands: Map<string, RunningCommand> = new Map()
  private commandHistory: CommandHistoryEntry[] = []
  private maxHistorySize = 1000

  /**
   * 运行命令
   * @param command 命令
   * @param options 选项
   * @returns 执行结果
   */
  async run(command: string, options: CommandRunOptions = {}): Promise<ExecResult> {
    const {
      cwd = process.cwd(),
      env = process.env,
      timeout = 30000,
      shell = true,
      stdio = 'pipe',
      onStdout,
      onStderr,
      onProgress,
      retries = 0,
      retryDelay = 1000,
      killSignal = 'SIGTERM',
    } = options
    const useShell: boolean = typeof shell === 'boolean' ? shell : true

    const commandId = this.generateCommandId()
    const startTime = Date.now()

    // 记录命令开始
    this.emit('start', { commandId, command, options })

    let lastError: Error | undefined
    let attempt = 0

    while (attempt <= retries) {
      try {
        const result = await this.executeCommand(commandId, command, {
          cwd,
          env,
          timeout,
          shell: useShell,
          stdio,
          onStdout,
          onStderr,
          onProgress,
          killSignal,
        })

        // 记录成功执行
        const duration = Date.now() - startTime
        this.addToHistory({
          commandId,
          command,
          startTime: new Date(startTime),
          endTime: new Date(),
          duration,
          exitCode: result.exitCode,
          success: result.exitCode === 0,
          attempt: attempt + 1,
        })

        this.emit('success', { commandId, command, result, duration, attempt: attempt + 1 })
        return result
      }
      catch (error) {
        lastError = error as Error
        attempt++

        if (attempt <= retries) {
          this.emit('retry', { commandId, command, error, attempt, maxAttempts: retries + 1 })
          await AsyncUtils.delay(retryDelay)
        }
      }
    }

    // 记录失败执行
    const duration = Date.now() - startTime
    this.addToHistory({
      commandId,
      command,
      startTime: new Date(startTime),
      endTime: new Date(),
      duration,
      exitCode: -1,
      success: false,
      attempt,
      error: lastError?.message,
    })

    this.emit('error', { commandId, command, error: lastError, attempts: attempt })
    throw (lastError instanceof Error
      ? lastError
      : new ProcessError(`Command failed: ${command}`, command, undefined))
  }

  /**
   * 执行单个命令
   */
  private async executeCommand(
    commandId: string,
    command: string,
    options: InternalCommandOptions,
  ): Promise<ExecResult> {
    return new Promise((resolve, reject) => {
      const args = options.shell ? ['/c', command] : command.split(' ')
      const cmd = options.shell ? (process.platform === 'win32' ? 'cmd' : 'sh') : args.shift()!

      const childProcess = spawn(cmd, options.shell ? args : args, {
        cwd: options.cwd,
        env: options.env,
        stdio: options.stdio,
        shell: !options.shell,
      })

      const runningCommand: RunningCommand = {
        id: commandId,
        command,
        process: childProcess,
        startTime: new Date(),
        stdout: '',
        stderr: '',
      }

      this.runningCommands.set(commandId, runningCommand)

      let timeoutId: NodeJS.Timeout | undefined

      // 设置超时
      if (options.timeout > 0) {
        timeoutId = setTimeout(() => {
          this.killCommand(commandId, options.killSignal)
          reject(new ProcessError(`Command timeout: ${command}`, command, undefined))
        }, options.timeout)
      }

      // 处理标准输出
      if (childProcess.stdout) {
        childProcess.stdout.on('data', (data) => {
          const output = data.toString()
          runningCommand.stdout += output

          if (options.onStdout) {
            options.onStdout(output)
          }

          this.emit('stdout', { commandId, data: output })
        })
      }

      // 处理标准错误
      if (childProcess.stderr) {
        childProcess.stderr.on('data', (data) => {
          const output = data.toString()
          runningCommand.stderr += output

          if (options.onStderr) {
            options.onStderr(output)
          }

          this.emit('stderr', { commandId, data: output })
        })
      }

      // 处理进程退出
      childProcess.on('exit', (code, signal) => {
        if (timeoutId)
          clearTimeout(timeoutId)

        runningCommand.endTime = new Date()
        runningCommand.exitCode = code
        runningCommand.signal = signal

        const result: ExecResult = {
          stdout: runningCommand.stdout,
          stderr: runningCommand.stderr,
          exitCode: code || 0,
          signal: (signal as unknown as string | undefined),
          killed: signal !== null,
          timedOut: false,
        }

        this.runningCommands.delete(commandId)

        if (code === 0) {
          resolve(result)
        }
        else {
          reject(
            new ProcessError(
              `Command failed with exit code ${code}: ${command}`,
              command,
              code || undefined,
            ),
          )
        }
      })

      // 处理进程错误
      childProcess.on('error', (error) => {
        if (timeoutId)
          clearTimeout(timeoutId)
        this.runningCommands.delete(commandId)
        reject(new ProcessError(`Command error: ${command}`, command, undefined, error))
      })
    })
  }

  /**
   * 运行多个命令（串行）
   * @param commands 命令数组
   * @param options 选项
   * @returns 执行结果数组
   */
  async runSeries(commands: string[], options: CommandRunOptions = {}): Promise<ExecResult[]> {
    const results: ExecResult[] = []

    for (const command of commands) {
      const result = await this.run(command, options)
      results.push(result)

      // 如果命令失败且没有设置继续执行，则停止
      if (result.exitCode !== 0 && !options.continueOnError) {
        break
      }
    }

    return results
  }

  /**
   * 运行多个命令（并行）
   * @param commands 命令数组
   * @param options 选项
   * @returns 执行结果数组
   */
  async runParallel(commands: string[], options: CommandRunOptions = {}): Promise<ExecResult[]> {
    const promises = commands.map(command => this.run(command, options))
    return Promise.all(promises)
  }

  /**
   * 运行管道命令
   * @param commands 命令数组
   * @param options 选项
   * @returns 最终执行结果
   */
  async runPipeline(commands: string[], options: CommandRunOptions = {}): Promise<ExecResult> {
    if (commands.length === 0) {
      throw new ProcessError('Pipeline cannot be empty', '', undefined)
    }

    if (commands.length === 1) {
      return this.run(commands[0]!, options)
    }

    // 构建管道命令
    const pipelineCommand = commands.join(' | ')
    return this.run(pipelineCommand, { ...options, shell: true })
  }

  /**
   * 终止命令
   * @param commandId 命令ID
   * @param signal 信号
   */
  killCommand(commandId: string, signal: NodeJS.Signals = 'SIGTERM'): boolean {
    const runningCommand = this.runningCommands.get(commandId)
    if (!runningCommand) {
      return false
    }

    try {
      runningCommand.process.kill(signal)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 终止所有运行中的命令
   * @param signal 信号
   */
  killAll(signal: NodeJS.Signals = 'SIGTERM'): void {
    for (const [commandId] of this.runningCommands) {
      this.killCommand(commandId, signal)
    }
  }

  /**
   * 获取运行中的命令
   */
  getRunningCommands(): RunningCommand[] {
    return Array.from(this.runningCommands.values())
  }

  /**
   * 获取命令历史
   * @param limit 限制数量
   */
  getHistory(limit?: number): CommandHistoryEntry[] {
    const history = [...this.commandHistory].reverse()
    return limit ? history.slice(0, limit) : history
  }

  /**
   * 清空命令历史
   */
  clearHistory(): void {
    this.commandHistory = []
  }

  /**
   * 获取统计信息
   */
  getStats(): CommandStats {
    const total = this.commandHistory.length
    const successful = this.commandHistory.filter(entry => entry.success).length
    const failed = total - successful
    const avgDuration
      = total > 0 ? this.commandHistory.reduce((sum, entry) => sum + entry.duration, 0) / total : 0

    return {
      total,
      successful,
      failed,
      running: this.runningCommands.size,
      avgDuration,
      successRate: total > 0 ? (successful / total) * 100 : 0,
    }
  }

  /**
   * 生成命令ID
   */
  private generateCommandId(): string {
    return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(entry: CommandHistoryEntry): void {
    this.commandHistory.push(entry)

    // 限制历史记录大小
    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory = this.commandHistory.slice(-this.maxHistorySize)
    }
  }

  /**
   * 创建命令运行器实例
   * @param options 选项
   */
  static create(options: CommandRunnerOptions = {}): CommandRunner {
    const runner = new CommandRunner()

    if (options.maxHistorySize) {
      runner.maxHistorySize = options.maxHistorySize
    }

    return runner
  }

  /**
   * 快速运行命令
   * @param command 命令
   * @param options 选项
   */
  static async exec(command: string, options: CommandRunOptions = {}): Promise<ExecResult> {
    const runner = new CommandRunner()
    return runner.run(command, options)
  }

  /**
   * 检查命令是否存在
   * @param command 命令名
   */
  static async which(command: string): Promise<string | null> {
    try {
      const result = await CommandRunner.exec(
        process.platform === 'win32' ? `where ${command}` : `which ${command}`,
        { timeout: 5000 },
      )
      return result.stdout.trim() || null
    }
    catch {
      return null
    }
  }
}

// 类型定义
interface CommandRunOptions extends KitExecOptions {
  onStdout?: (data: string) => void
  onStderr?: (data: string) => void
  onProgress?: (progress: number) => void
  retries?: number
  retryDelay?: number
  continueOnError?: boolean
  killSignal?: NodeJS.Signals
  stdio?: 'pipe' | 'inherit' | 'ignore'
}

interface InternalCommandOptions {
  cwd: string
  env: NodeJS.ProcessEnv
  timeout: number
  shell: boolean
  stdio: 'pipe' | 'inherit' | 'ignore'
  onStdout?: (data: string) => void
  onStderr?: (data: string) => void
  onProgress?: (progress: number) => void
  killSignal: NodeJS.Signals
}

interface RunningCommand {
  id: string
  command: string
  process: ChildProcess
  startTime: Date
  endTime?: Date
  stdout: string
  stderr: string
  exitCode?: number | null
  signal?: NodeJS.Signals | null
}

interface CommandHistoryEntry {
  commandId: string
  command: string
  startTime: Date
  endTime: Date
  duration: number
  exitCode: number
  success: boolean
  attempt: number
  error?: string
}

interface CommandStats {
  total: number
  successful: number
  failed: number
  running: number
  avgDuration: number
  successRate: number
}

interface CommandRunnerOptions {
  maxHistorySize?: number
}
