/**
 * 进程工具类
 * 提供进程相关的实用工具函数
 */

import type { ExecResult, ExecOptions as KitExecOptions } from '../types'
import { exec } from 'node:child_process'
import { platform } from 'node:os'
import { promisify } from 'node:util'
import { ProcessError } from '../types'

const execAsync = promisify(exec)

/**
 * 进程工具类
 */
export class ProcessUtils {
  /**
   * 检查命令是否可用
   * @param command 命令名
   * @returns 是否可用
   */
  static async isCommandAvailable(command: string): Promise<boolean> {
    try {
      const checkCommand = platform() === 'win32' ? `where ${command}` : `which ${command}`

      await execAsync(checkCommand)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 获取命令的完整路径
   * @param command 命令名
   * @returns 命令路径
   */
  static async getCommandPath(command: string): Promise<string | null> {
    try {
      const checkCommand = platform() === 'win32' ? `where ${command}` : `which ${command}`

      const { stdout } = await execAsync(checkCommand)
      return stdout.trim().split('\n')[0] || null
    }
    catch {
      return null
    }
  }

  /**
   * 检测包管理器
   * @param cwd 工作目录
   * @returns 包管理器名称
   */
  static async detectPackageManager(cwd: string = process.cwd()): Promise<string> {
    const managers = [
      { name: 'pnpm', lockFile: 'pnpm-lock.yaml' },
      { name: 'yarn', lockFile: 'yarn.lock' },
      { name: 'npm', lockFile: 'package-lock.json' },
    ]

    // 检查锁文件
    for (const manager of managers) {
      try {
        const { FileSystem } = await import('../filesystem')
        const lockPath = FileSystem.join(cwd, manager.lockFile)
        if (await FileSystem.exists(lockPath)) {
          // 验证命令是否可用
          if (await ProcessUtils.isCommandAvailable(manager.name)) {
            return manager.name
          }
        }
      }
      catch {
        // 继续检查下一个
      }
    }

    // 检查全局安装的包管理器
    for (const manager of managers) {
      if (await ProcessUtils.isCommandAvailable(manager.name)) {
        return manager.name
      }
    }

    return 'npm' // 默认返回 npm
  }

  /**
   * 获取包管理器命令
   * @param packageManager 包管理器名称
   * @returns 命令映射
   */
  static getPackageManagerCommands(packageManager: string): PackageManagerCommands {
    const commands: Record<string, PackageManagerCommands> = {
      npm: {
        install: 'npm install',
        add: 'npm install',
        remove: 'npm uninstall',
        run: 'npm run',
        exec: 'npx',
        list: 'npm list',
        outdated: 'npm outdated',
        update: 'npm update',
      },
      yarn: {
        install: 'yarn install',
        add: 'yarn add',
        remove: 'yarn remove',
        run: 'yarn run',
        exec: 'yarn dlx',
        list: 'yarn list',
        outdated: 'yarn outdated',
        update: 'yarn upgrade',
      },
      pnpm: {
        install: 'pnpm install',
        add: 'pnpm add',
        remove: 'pnpm remove',
        run: 'pnpm run',
        exec: 'pnpm dlx',
        list: 'pnpm list',
        outdated: 'pnpm outdated',
        update: 'pnpm update',
      },
    }

    const mapped = commands[packageManager] ?? commands.npm
    return mapped as PackageManagerCommands
  }

  /**
   * 执行包管理器命令
   * @param action 操作
   * @param args 参数
   * @param options 选项
   * @returns 执行结果
   */
  static async runPackageManagerCommand(
    action: keyof PackageManagerCommands,
    args: string[] = [],
    options: KitExecOptions = {},
  ): Promise<ExecResult> {
    const packageManager = await ProcessUtils.detectPackageManager(options.cwd)
    const commands = ProcessUtils.getPackageManagerCommands(packageManager)
    const baseCommand = commands[action]

    if (!baseCommand) {
      throw new ProcessError(`Unsupported action: ${action}`, '', undefined)
    }

    const fullCommand = `${baseCommand} ${args.join(' ')}`.trim()

    try {
      const { stdout, stderr } = await execAsync(fullCommand, {
        cwd: options.cwd || process.cwd(),
        env: options.env || process.env,
        timeout: options.timeout || 300000, // 5分钟默认超时
        encoding: options.encoding || 'utf8',
      })

      return {
        stdout: stdout.toString(),
        stderr: stderr.toString(),
        exitCode: 0,
        killed: false,
        timedOut: false,
      }
    }
    catch (error: any) {
      throw new ProcessError(
        `Package manager command failed: ${fullCommand}`,
        fullCommand,
        error.code,
        error,
      )
    }
  }

  /**
   * 获取进程信息
   * @param pid 进程ID
   * @returns 进程信息
   */
  static async getProcessInfo(pid: number): Promise<ProcessInfo | null> {
    try {
      const isWindows = platform() === 'win32'
      const command = isWindows
        ? `tasklist /FI "PID eq ${pid}" /FO CSV /NH`
        : `ps -p ${pid} -o pid,ppid,command --no-headers`

      const { stdout } = await execAsync(command)

      if (!stdout.trim()) {
        return null
      }

      if (isWindows) {
        const parts = stdout.trim().split(',')
        if (parts.length >= 5) {
          const p0 = parts[0] ?? ''
          const p1 = parts[1] ?? '0'
          const p4 = parts[4] ?? '0'
          return {
            pid,
            name: p0.replace(/"/g, ''),
            memory: Number.parseInt(p4.replace(/[",\s]/g, '')) * 1024, // KB to bytes
            command: p0.replace(/"/g, ''),
            ppid: Number.parseInt(p1),
          }
        }
      }
      else {
        const parts = stdout.trim().split(/\s+/)
        if (parts.length >= 3) {
          const p1 = parts[1] ?? '0'
          const p2 = parts[2] ?? ''
          const cmd = parts.slice(2).join(' ')
          return {
            pid,
            ppid: Number.parseInt(p1),
            command: cmd,
            name: p2,
          }
        }
      }

      return null
    }
    catch {
      return null
    }
  }

  /**
   * 终止进程树
   * @param pid 根进程ID
   * @param signal 信号
   */
  static async killProcessTree(pid: number, signal: NodeJS.Signals = 'SIGTERM'): Promise<void> {
    const isWindows = platform() === 'win32'

    try {
      if (isWindows) {
        // Windows: 使用 taskkill 终止进程树
        await execAsync(`taskkill /PID ${pid} /T /F`)
      }
      else {
        // Unix: 获取子进程并递归终止
        const children = await ProcessUtils.getChildProcesses(pid)

        // 先终止子进程
        for (const childPid of children) {
          await ProcessUtils.killProcessTree(childPid, signal)
        }

        // 最后终止父进程
        try {
          process.kill(pid, signal)
        }
        catch {
          // 进程可能已经不存在
        }
      }
    }
    catch (error) {
      throw new ProcessError(`Failed to kill process tree: ${pid}`, '', undefined, error as Error)
    }
  }

  /**
   * 获取子进程列表
   * @param pid 父进程ID
   * @returns 子进程ID列表
   */
  static async getChildProcesses(pid: number): Promise<number[]> {
    try {
      const isWindows = platform() === 'win32'
      const command = isWindows
        ? `wmic process where "ParentProcessId=${pid}" get ProcessId /format:csv`
        : `pgrep -P ${pid}`

      const { stdout } = await execAsync(command)

      if (isWindows) {
        return stdout
          .split('\n')
          .slice(1) // 跳过标题行
          .map((line: string) => line.split(',')[1] ?? '')
          .filter((p: string) => p && p.trim())
          .map((p: string) => Number.parseInt(p.trim()))
          .filter((n: number) => !Number.isNaN(n))
      }
      else {
        return stdout
          .split('\n')
          .filter((line: string) => line.trim())
          .map((p: string) => Number.parseInt(p.trim()))
          .filter((n: number) => !Number.isNaN(n))
      }
    }
    catch {
      return []
    }
  }

  /**
   * 检查进程是否存在
   * @param pid 进程ID
   * @returns 是否存在
   */
  static async isProcessRunning(pid: number): Promise<boolean> {
    try {
      process.kill(pid, 0) // 发送信号0检查进程是否存在
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 等待进程结束
   * @param pid 进程ID
   * @param timeout 超时时间
   * @param interval 检查间隔
   */
  static async waitForProcessExit(pid: number, timeout = 30000, interval = 1000): Promise<void> {
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      if (!(await ProcessUtils.isProcessRunning(pid))) {
        return
      }

      await new Promise(resolve => setTimeout(resolve, interval))
    }

    throw new ProcessError(`Timeout waiting for process ${pid} to exit`, '', undefined)
  }

  /**
   * 获取系统进程列表
   * @returns 进程列表
   */
  static async getProcessList(): Promise<ProcessInfo[]> {
    try {
      const isWindows = platform() === 'win32'
      const command = isWindows ? 'tasklist /FO CSV /NH' : 'ps aux --no-headers'

      const { stdout } = await execAsync(command)
      const processes: ProcessInfo[] = []

      const lines = stdout.trim().split('\n')

      for (const line of lines) {
        if (!line.trim())
          continue

        if (isWindows) {
          const parts = line.split(',')
          if (parts.length >= 5) {
            const p0 = parts[0] ?? ''
            const p1 = parts[1] ?? '0'
            const p4 = parts[4] ?? '0'
            processes.push({
              pid: Number.parseInt(p1.replace(/"/g, '')),
              name: p0.replace(/"/g, ''),
              memory: Number.parseInt(p4.replace(/[",\s]/g, '')) * 1024,
              command: p0.replace(/"/g, ''),
            })
          }
        }
        else {
          const parts = line.trim().split(/\s+/)
          if (parts.length >= 11) {
            const p1 = parts[1] ?? '0'
            const p2 = parts[2] ?? '0'
            const p5 = parts[5] ?? '0'
            const p10 = parts[10] ?? ''
            processes.push({
              pid: Number.parseInt(p1),
              ppid: Number.parseInt(p2),
              name: p10,
              command: parts.slice(10).join(' '),
              memory: Number.parseInt(p5) * 1024, // KB to bytes
              cpu: Number.parseFloat(p2),
            })
          }
        }
      }

      return processes
    }
    catch (error) {
      throw new ProcessError('Failed to get process list', '', undefined, error as Error)
    }
  }

  /**
   * 查找进程
   * @param name 进程名或命令
   * @returns 匹配的进程列表
   */
  static async findProcesses(name: string): Promise<ProcessInfo[]> {
    const processes = await ProcessUtils.getProcessList()
    return processes.filter(
      p =>
        p.name.toLowerCase().includes(name.toLowerCase())
        || p.command.toLowerCase().includes(name.toLowerCase()),
    )
  }

  /**
   * 获取当前进程信息
   */
  static getCurrentProcessInfo(): ProcessInfo {
    return {
      pid: process.pid,
      ppid: process.ppid,
      name: process.title,
      command: process.argv.join(' '),
      memory: process.memoryUsage().rss,
      cpu: process.cpuUsage().user / 1000000, // 转换为秒
    }
  }

  /**
   * 设置进程标题
   * @param title 标题
   */
  static setProcessTitle(title: string): void {
    process.title = title
  }

  /**
   * 获取环境变量
   * @param key 键名
   * @param defaultValue 默认值
   */
  static getEnv(key: string, defaultValue?: string): string | undefined {
    return process.env[key] || defaultValue
  }

  /**
   * 设置环境变量
   * @param key 键名
   * @param value 值
   */
  static setEnv(key: string, value: string): void {
    process.env[key] = value
  }

  /**
   * 删除环境变量
   * @param key 键名
   */
  static deleteEnv(key: string): void {
    delete process.env[key]
  }
}

// 类型定义
interface PackageManagerCommands {
  install: string
  add: string
  remove: string
  run: string
  exec: string
  list: string
  outdated: string
  update: string
}

interface ProcessInfo {
  pid: number
  ppid?: number
  name: string
  command: string
  memory?: number
  cpu?: number
}
