/**
 * 命令执行辅助工具
 * @module utils/exec-helper
 */

import { execa } from 'execa'
import type { ExecaReturnValue } from 'execa'

/**
 * 执行结果
 */
export interface ExecResult {
  /** 退出码 */
  exitCode: number
  /** 标准输出 */
  stdout: string
  /** 标准错误 */
  stderr: string
  /** 是否成功 */
  success: boolean
}

/**
 * 执行选项
 */
export interface ExecOptions {
  /** 工作目录 */
  cwd?: string
  /** 环境变量 */
  env?: Record<string, string>
  /** 超时时间（毫秒） */
  timeout?: number
  /** 是否捕获输出 */
  all?: boolean
}

/**
 * 命令执行辅助类
 */
export class ExecHelper {
  /**
   * 执行命令
   * 
   * @param command - 命令
   * @param args - 参数列表
   * @param options - 执行选项
   * @returns 执行结果
   * 
   * @example
   * ```typescript
   * const result = await ExecHelper.exec('node', ['--version'])
   * console.log(result.stdout) // "v20.10.0"
   * ```
   */
  static async exec(
    command: string,
    args: string[] = [],
    options: ExecOptions = {},
  ): Promise<ExecResult> {
    try {
      const result = await execa(command, args, {
        cwd: options.cwd,
        env: options.env,
        timeout: options.timeout || 30000,
        all: options.all ?? true,
      })

      return {
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
        success: result.exitCode === 0,
      }
    }
    catch (error: any) {
      return {
        exitCode: error.exitCode || 1,
        stdout: error.stdout || '',
        stderr: error.stderr || error.message || '',
        success: false,
      }
    }
  }

  /**
   * 检查命令是否存在
   * 
   * @param command - 命令名称
   * @returns 是否存在
   * 
   * @example
   * ```typescript
   * const hasNode = await ExecHelper.exists('node')
   * console.log('Node.js 已安装:', hasNode)
   * ```
   */
  static async exists(command: string): Promise<boolean> {
    const isWindows = process.platform === 'win32'
    const checkCommand = isWindows ? 'where' : 'which'

    const result = await this.exec(checkCommand, [command])
    return result.success
  }

  /**
   * 获取命令的完整路径
   * 
   * @param command - 命令名称
   * @returns 完整路径，如果不存在则返回 null
   * 
   * @example
   * ```typescript
   * const nodePath = await ExecHelper.getCommandPath('node')
   * console.log('Node.js 路径:', nodePath)
   * ```
   */
  static async getCommandPath(command: string): Promise<string | null> {
    const isWindows = process.platform === 'win32'
    const checkCommand = isWindows ? 'where' : 'which'

    const result = await this.exec(checkCommand, [command])
    if (result.success && result.stdout) {
      // Windows 的 where 可能返回多个路径，取第一个
      const paths = result.stdout.trim().split('\n')
      return paths[0].trim()
    }

    return null
  }

  /**
   * 执行 shell 命令（支持管道和重定向）
   * 
   * @param command - 完整的 shell 命令
   * @param options - 执行选项
   * @returns 执行结果
   * 
   * @example
   * ```typescript
   * const result = await ExecHelper.shell('echo hello | grep hello')
   * console.log(result.stdout) // "hello"
   * ```
   */
  static async shell(
    command: string,
    options: ExecOptions = {},
  ): Promise<ExecResult> {
    const isWindows = process.platform === 'win32'
    const shell = isWindows ? 'cmd' : 'sh'
    const shellArg = isWindows ? '/c' : '-c'

    return this.exec(shell, [shellArg, command], options)
  }
}


