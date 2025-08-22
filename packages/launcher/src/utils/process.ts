/**
 * 进程工具模块
 * 提供子进程执行、命令检测和包管理器相关的工具函数
 * 
 * @author Vite Launcher Team
 * @version 1.0.0
 */

import { spawn, type SpawnOptions } from 'node:child_process'
import path from 'node:path'
import { FileUtils } from './file'

/**
 * 命令执行结果接口
 */
export interface ExecResult {
  /** 标准输出 */
  stdout: string
  /** 标准错误输出 */
  stderr: string
  /** 退出代码 */
  code: number
  /** 是否成功执行 */
  success: boolean
}

/**
 * 进程操作工具类
 * 提供命令执行、环境检测等功能
 */
export class ProcessUtils {
  /**
   * 执行命令并返回结果
   * @param command 命令
   * @param args 参数数组
   * @param options 执行选项
   * @returns 执行结果
   * @example
   * ```typescript
   * const result = await ProcessUtils.exec('npm', ['--version'])
   * console.log(`npm版本: ${result.stdout.trim()}`)
   * ```
   */
  static async exec(
    command: string,
    args: string[] = [],
    options: SpawnOptions = {},
  ): Promise<ExecResult> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'pipe',
        shell: process.platform === 'win32',
        ...options,
      })

      let stdout = ''
      let stderr = ''

      child.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString()
      })

      child.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString()
      })

      child.on('close', (code) => {
        const exitCode = code || 0
        resolve({
          stdout,
          stderr,
          code: exitCode,
          success: exitCode === 0
        })
      })

      child.on('error', (error) => {
        reject(new Error(`执行命令失败: ${command} ${args.join(' ')}. 原因: ${error.message}`))
      })

      // 设置超时
      const timeout = (options as any)?.timeout
      if (timeout) {
        setTimeout(() => {
          child.kill('SIGKILL')
          reject(new Error(`命令执行超时: ${command} ${args.join(' ')}`))
        }, timeout)
      }
    })
  }

  /**
   * 检查命令是否可用
   * @param command 命令名
   * @returns 是否可用
   * @example
   * ```typescript
   * const hasNode = await ProcessUtils.isCommandAvailable('node')
   * const hasPnpm = await ProcessUtils.isCommandAvailable('pnpm')
   * ```
   */
  static async isCommandAvailable(command: string): Promise<boolean> {
    try {
      const checkCommand = process.platform === 'win32' ? 'where' : 'which'
      const result = await this.exec(checkCommand, [command])
      return result.success
    }
    catch {
      return false
    }
  }

  /**
   * 检测项目使用的包管理器
   * @param projectPath 项目路径
   * @returns 包管理器名称或null
   * @example
   * ```typescript
   * const pm = await ProcessUtils.getPackageManager('./my-project')
   * console.log(`使用的包管理器: ${pm}`) // 'npm', 'yarn', 'pnpm' 或 null
   * ```
   */
  static async getPackageManager(projectPath: string): Promise<'npm' | 'yarn' | 'pnpm' | null> {
    // 优先级1: 检查锁文件
    const lockFiles = [
      { file: 'pnpm-lock.yaml', manager: 'pnpm' as const },
      { file: 'yarn.lock', manager: 'yarn' as const },
      { file: 'package-lock.json', manager: 'npm' as const },
    ]

    for (const { file, manager } of lockFiles) {
      if (await FileUtils.exists(path.join(projectPath, file))) {
        // 验证对应的包管理器是否可用
        if (await this.isCommandAvailable(manager)) {
          return manager
        }
      }
    }

    // 优先级2: 检查命令可用性（推荐使用 pnpm > yarn > npm）
    const managers = ['pnpm', 'yarn', 'npm'] as const
    for (const manager of managers) {
      if (await this.isCommandAvailable(manager)) {
        return manager
      }
    }

    return null
  }

  /**
   * 获取 Node.js 版本
   * @returns Node.js版本字符串
   * @example
   * ```typescript
   * const version = await ProcessUtils.getNodeVersion()
   * console.log(`Node.js版本: ${version}`) // 例如: "18.16.0"
   * ```
   */
  static async getNodeVersion(): Promise<string> {
    try {
      const result = await this.exec('node', ['--version'])
      if (result.success) {
        return result.stdout.trim().replace(/^v/, '')
      }
      throw new Error('无法获取Node.js版本')
    }
    catch (error) {
      throw new Error(`获取Node.js版本失败: ${(error as Error).message}`)
    }
  }

  /**
   * 安装依赖
   * @param projectPath 项目路径
   * @param options 安装选项
   * @returns 执行结果
   * @example
   * ```typescript
   * await ProcessUtils.installDependencies('./my-project', {
   *   packageManager: 'pnpm',
   *   production: false
   * })
   * ```
   */
  static async installDependencies(
    projectPath: string,
    options: {
      /** 指定包管理器 */
      packageManager?: 'npm' | 'yarn' | 'pnpm'
      /** 是否只安装生产依赖 */
      production?: boolean
      /** 是否静默安装 */
      silent?: boolean
      /** 超时时间（毫秒） */
      timeout?: number
    } = {}
  ): Promise<ExecResult> {
    const {
      packageManager: specifiedPM,
      production = false,
      silent = false,
      timeout = 120000 // 2分钟
    } = options

    // 确定使用的包管理器
    const packageManager = specifiedPM || await this.getPackageManager(projectPath)
    
    if (!packageManager) {
      throw new Error('未找到可用的包管理器 (npm/yarn/pnpm)')
    }

    // 构建安装命令
    const args: string[] = ['install']
    
    if (production) {
      if (packageManager === 'npm') {
        args.push('--production')
      } else if (packageManager === 'yarn') {
        args.push('--production')
      } else if (packageManager === 'pnpm') {
        args.push('--prod')
      }
    }

    if (silent) {
      if (packageManager === 'npm') {
        args.push('--silent')
      } else if (packageManager === 'yarn') {
        args.push('--silent')
      } else if (packageManager === 'pnpm') {
        args.push('--silent')
      }
    }

    try {
      const result = await this.exec(packageManager, args, {
        cwd: projectPath,
        timeout
      })

      if (!result.success) {
        throw new Error(`依赖安装失败: ${result.stderr}`)
      }

      return result
    }
    catch (error) {
      throw new Error(`安装依赖时发生错误: ${(error as Error).message}`)
    }
  }

  /**
   * 运行 npm 脚本
   * @param projectPath 项目路径
   * @param scriptName 脚本名称
   * @param options 运行选项
   * @returns 执行结果
   * @example
   * ```typescript
   * // 运行构建脚本
   * const result = await ProcessUtils.runScript('./my-project', 'build')
   * 
   * // 运行开发服务器（后台运行）
   * ProcessUtils.runScript('./my-project', 'dev', { detached: true })
   * ```
   */
  static async runScript(
    projectPath: string,
    scriptName: string,
    options: {
      /** 是否后台运行 */
      detached?: boolean
      /** 传递给脚本的额外参数 */
      args?: string[]
      /** 超时时间（毫秒） */
      timeout?: number
      /** 指定包管理器 */
      packageManager?: 'npm' | 'yarn' | 'pnpm'
    } = {}
  ): Promise<ExecResult> {
    const {
      detached = false,
      args = [],
      timeout,
      packageManager: specifiedPM
    } = options

    const packageManager = specifiedPM || await this.getPackageManager(projectPath) || 'npm'

    // 构建运行命令
    let command: string
    let commandArgs: string[]

    if (packageManager === 'yarn') {
      command = 'yarn'
      commandArgs = [scriptName, ...args]
    } else if (packageManager === 'pnpm') {
      command = 'pnpm'
      commandArgs = ['run', scriptName, ...args]
    } else {
      command = 'npm'
      commandArgs = ['run', scriptName, ...args]
    }

    const execOptions: SpawnOptions = {
      cwd: projectPath,
      ...(timeout && { timeout }),
      ...(detached && { detached: true, stdio: 'ignore' })
    }

    return this.exec(command, commandArgs, execOptions)
  }

  /**
   * 检查端口是否被占用
   * @param port 端口号
   * @param host 主机地址
   * @returns 是否被占用
   * @example
   * ```typescript
   * const isPortInUse = await ProcessUtils.isPortInUse(3000)
   * if (isPortInUse) {
   *   console.log('端口3000已被占用')
   * }
   * ```
   */
  static async isPortInUse(port: number, host: string = 'localhost'): Promise<boolean> {
    return new Promise((resolve) => {
      const net = require('node:net')
      const server = net.createServer()

      server.listen(port, host, () => {
        server.once('close', () => {
          resolve(false) // 端口可用
        })
        server.close()
      })

      server.on('error', () => {
        resolve(true) // 端口被占用
      })
    })
  }

  /**
   * 查找可用端口
   * @param startPort 起始端口
   * @param endPort 结束端口
   * @param host 主机地址
   * @returns 可用端口号，如果没有可用端口则返回null
   * @example
   * ```typescript
   * const availablePort = await ProcessUtils.findAvailablePort(3000, 3010)
   * console.log(`可用端口: ${availablePort}`)
   * ```
   */
  static async findAvailablePort(
    startPort: number = 3000,
    endPort: number = 3100,
    host: string = 'localhost'
  ): Promise<number | null> {
    for (let port = startPort; port <= endPort; port++) {
      const inUse = await this.isPortInUse(port, host)
      if (!inUse) {
        return port
      }
    }
    return null
  }
}

// 导出便捷函数
export const {
  exec,
  isCommandAvailable,
  getPackageManager,
  getNodeVersion,
  installDependencies,
  runScript,
  isPortInUse,
  findAvailablePort,
} = ProcessUtils