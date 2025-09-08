/**
 * 进程管理器
 * 提供进程创建、监控和管理功能
 */

import type { ChildProcess, ExecOptions, SpawnOptions } from 'node:child_process'
import type { ExecResult, ExecOptions as KitExecOptions } from '../types'
import { exec, fork, spawn } from 'node:child_process'
import { EventEmitter } from 'node:events'
import { promisify } from 'node:util'
import { ProcessError } from '../types'

const execAsync = promisify(exec)

/**
 * 进程管理器类
 */
export class ProcessManager extends EventEmitter {
  private processes: Map<string, ManagedProcess> = new Map()
  private nextId = 1

  /**
   * 执行命令（异步）
   * @param command 命令
   * @param options 选项
   * @returns 执行结果
   */
  async exec(command: string, options: KitExecOptions = {}): Promise<ExecResult> {
    const {
      cwd = process.cwd(),
      env = process.env,
      timeout = 30000,
      shell = true,
      silent = false,
    } = options

    try {
      const execOptions: ExecOptions = {
        cwd,
        env,
        timeout,
        shell: typeof shell === 'string' ? shell : (shell ? (process.platform === 'win32' ? 'cmd.exe' : '/bin/sh') : undefined),
        maxBuffer: 1024 * 1024 * 10, // 10MB
      }

      if (!silent) {
        this.emit('command', { command, options: execOptions })
      }

      const startTime = Date.now()
      const { stdout, stderr } = await execAsync(command, execOptions)
      const duration = Date.now() - startTime

      const result: ExecResult = {
        stdout: stdout.toString(),
        stderr: stderr.toString(),
        exitCode: 0,
        killed: false,
        timedOut: false,
      }

      if (!silent) {
        this.emit('result', { command, result, duration })
      }

      return result
    }
    catch (error: any) {
      const result: ExecResult = {
        stdout: error.stdout?.toString() || '',
        stderr: error.stderr?.toString() || '',
        exitCode: error.code || 1,
        signal: error.signal,
        killed: error.killed || false,
        timedOut: error.code === 'ETIMEDOUT',
      }

      if (!silent) {
        this.emit(
          'error',
          new ProcessError(`Command failed: ${command}`, command, result.exitCode, error),
        )
      }

      throw new ProcessError(`Command failed: ${command}`, command, result.exitCode, error)
    }
  }

  /**
   * 启动进程
   * @param command 命令
   * @param args 参数
   * @param options 选项
   * @returns 进程ID
   */
  spawn(command: string, args: string[] = [], options: SpawnOptions = {}): string {
    const processId = `proc_${this.nextId++}`

    const spawnOptions: SpawnOptions = {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'pipe',
      ...options,
    }

    const childProcess = spawn(command, args, spawnOptions)

    const managedProcess: ManagedProcess = {
      id: processId,
      command,
      args,
      process: childProcess,
      startTime: new Date(),
      status: 'running',
    }

    this.processes.set(processId, managedProcess)

    // 设置事件监听
    this.setupProcessListeners(managedProcess)

    this.emit('spawn', { processId, command, args, pid: childProcess.pid })

    return processId
  }

  /**
   * Fork 子进程
   * @param modulePath 模块路径
   * @param args 参数
   * @param options 选项
   * @returns 进程ID
   */
  fork(modulePath: string, args: string[] = [], options: any = {}): string {
    const processId = `fork_${this.nextId++}`

    const forkOptions = {
      cwd: process.cwd(),
      env: process.env,
      ...options,
    }

    const childProcess = fork(modulePath, args, forkOptions)

    const managedProcess: ManagedProcess = {
      id: processId,
      command: modulePath,
      args,
      process: childProcess,
      startTime: new Date(),
      status: 'running',
    }

    this.processes.set(processId, managedProcess)
    this.setupProcessListeners(managedProcess)

    this.emit('fork', { processId, modulePath, args, pid: childProcess.pid })

    return processId
  }

  /**
   * 设置进程事件监听
   */
  private setupProcessListeners(managedProcess: ManagedProcess): void {
    const { id, process: childProcess } = managedProcess

    childProcess.on('exit', (code, signal) => {
      managedProcess.status = 'exited'
      managedProcess.exitCode = code
      managedProcess.signal = signal
      managedProcess.endTime = new Date()

      this.emit('exit', {
        processId: id,
        exitCode: code,
        signal,
        duration: managedProcess.endTime.getTime() - managedProcess.startTime.getTime(),
      })
    })

    childProcess.on('error', (error) => {
      managedProcess.status = 'error'
      managedProcess.error = error

      this.emit('processError', {
        processId: id,
        error: new ProcessError(
          `Process error: ${managedProcess.command}`,
          managedProcess.command,
          undefined,
          error,
        ),
      })
    })

    childProcess.on('close', (code, signal) => {
      this.emit('close', { processId: id, exitCode: code, signal })
    })

    // 监听标准输出
    if (childProcess.stdout) {
      childProcess.stdout.on('data', (data) => {
        this.emit('stdout', { processId: id, data: data.toString() })
      })
    }

    // 监听标准错误
    if (childProcess.stderr) {
      childProcess.stderr.on('data', (data) => {
        this.emit('stderr', { processId: id, data: data.toString() })
      })
    }
  }

  /**
   * 终止进程
   * @param processId 进程ID
   * @param signal 信号
   */
  kill(processId: string, signal: NodeJS.Signals = 'SIGTERM'): boolean {
    const managedProcess = this.processes.get(processId)
    if (!managedProcess || managedProcess.status !== 'running') {
      return false
    }

    const killed = managedProcess.process.kill(signal)
    if (killed) {
      managedProcess.status = 'killed'
      this.emit('kill', { processId, signal })
    }

    return killed
  }

  /**
   * 强制终止进程
   * @param processId 进程ID
   */
  forceKill(processId: string): boolean {
    return this.kill(processId, 'SIGKILL')
  }

  /**
   * 向进程发送消息
   * @param processId 进程ID
   * @param message 消息
   */
  send(processId: string, message: any): boolean {
    const managedProcess = this.processes.get(processId)
    if (!managedProcess || managedProcess.status !== 'running') {
      return false
    }

    if (managedProcess.process.send) {
      managedProcess.process.send(message)
      return true
    }

    return false
  }

  /**
   * 写入进程标准输入
   * @param processId 进程ID
   * @param data 数据
   */
  write(processId: string, data: string): boolean {
    const managedProcess = this.processes.get(processId)
    if (!managedProcess || managedProcess.status !== 'running') {
      return false
    }

    if (managedProcess.process.stdin) {
      managedProcess.process.stdin.write(data)
      return true
    }

    return false
  }

  /**
   * 获取进程信息
   * @param processId 进程ID
   */
  getProcess(processId: string): ManagedProcess | undefined {
    return this.processes.get(processId)
  }

  /**
   * 获取所有进程
   */
  getAllProcesses(): ManagedProcess[] {
    return Array.from(this.processes.values())
  }

  /**
   * 获取运行中的进程
   */
  getRunningProcesses(): ManagedProcess[] {
    return this.getAllProcesses().filter(p => p.status === 'running')
  }

  /**
   * 等待进程结束
   * @param processId 进程ID
   * @param timeout 超时时间
   */
  async waitForExit(processId: string, timeout = 30000): Promise<ProcessExitInfo> {
    const managedProcess = this.processes.get(processId)
    if (!managedProcess) {
      throw new ProcessError(`Process not found: ${processId}`, '', undefined)
    }

    if (managedProcess.status !== 'running') {
      return {
        processId,
        exitCode: managedProcess.exitCode,
        signal: managedProcess.signal,
        duration: managedProcess.endTime
          ? managedProcess.endTime.getTime() - managedProcess.startTime.getTime()
          : 0,
      }
    }

    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | undefined

      const onExit = (info: ProcessExitInfo) => {
        if (info.processId === processId) {
          if (timeoutId)
            clearTimeout(timeoutId)
          this.off('exit', onExit)
          resolve(info)
        }
      }

      this.on('exit', onExit)

      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          this.off('exit', onExit)
          reject(new ProcessError(`Timeout waiting for process exit: ${processId}`, '', undefined))
        }, timeout)
      }
    })
  }

  /**
   * 清理已结束的进程
   */
  cleanup(): void {
    for (const [id, process] of this.processes.entries()) {
      if (process.status !== 'running') {
        this.processes.delete(id)
      }
    }
  }

  /**
   * 终止所有进程
   */
  async killAll(signal: NodeJS.Signals = 'SIGTERM'): Promise<void> {
    const runningProcesses = this.getRunningProcesses()

    for (const process of runningProcesses) {
      this.kill(process.id, signal)
    }

    // 等待所有进程结束
    const waitPromises = runningProcesses.map(p =>
      this.waitForExit(p.id, 5000).catch(() => {
        // 如果超时，强制终止
        this.forceKill(p.id)
      }),
    )

    await Promise.all(waitPromises)
  }

  /**
   * 获取进程统计信息
   */
  getStats(): ProcessStats {
    const processes = this.getAllProcesses()

    return {
      total: processes.length,
      running: processes.filter(p => p.status === 'running').length,
      exited: processes.filter(p => p.status === 'exited').length,
      killed: processes.filter(p => p.status === 'killed').length,
      error: processes.filter(p => p.status === 'error').length,
    }
  }
}

// 类型定义
interface ManagedProcess {
  id: string
  command: string
  args: string[]
  process: ChildProcess
  startTime: Date
  endTime?: Date
  status: 'running' | 'exited' | 'killed' | 'error'
  exitCode?: number | null
  signal?: NodeJS.Signals | null
  error?: Error
}

interface ProcessExitInfo {
  processId: string
  exitCode?: number | null
  signal?: NodeJS.Signals | null
  duration: number
}

interface ProcessStats {
  total: number
  running: number
  exited: number
  killed: number
  error: number
}
