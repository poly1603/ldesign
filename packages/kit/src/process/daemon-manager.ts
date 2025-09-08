/**
 * 守护进程管理器
 * 提供守护进程的创建、管理和监控功能
 */

import { spawn } from 'node:child_process'
import { EventEmitter } from 'node:events'
import { chmod, readFile, unlink, writeFile } from 'node:fs/promises'
import { platform, tmpdir } from 'node:os'
import { join } from 'node:path'
import { ProcessError } from '../types'
import { ProcessUtils } from './process-utils'

/**
 * 守护进程管理器类
 */
export class DaemonManager extends EventEmitter {
  private daemons: Map<string, ManagedDaemon> = new Map()
  private configDir: string
  private pidDir: string
  private logDir: string

  constructor(options: DaemonManagerOptions = {}) {
    super()
    this.configDir = options.configDir || join(tmpdir(), 'ldesign-daemons', 'config')
    this.pidDir = options.pidDir || join(tmpdir(), 'ldesign-daemons', 'pids')
    this.logDir = options.logDir || join(tmpdir(), 'ldesign-daemons', 'logs')

    this.ensureDirectories()
  }

  /**
   * 确保必要的目录存在
   */
  private async ensureDirectories(): Promise<void> {
    try {
      const { FileSystem } = await import('../filesystem')
      await FileSystem.ensureDir(this.configDir)
      await FileSystem.ensureDir(this.pidDir)
      await FileSystem.ensureDir(this.logDir)
    }
    catch (error) {
      this.emit(
        'error',
        new ProcessError('Failed to create daemon directories', '', undefined, error as Error),
      )
    }
  }

  /**
   * 创建守护进程
   * @param name 守护进程名称
   * @param config 配置
   */
  async create(name: string, config: DaemonConfig): Promise<void> {
    if (this.daemons.has(name)) {
      throw new ProcessError(`Daemon already exists: ${name}`, '', undefined)
    }

    const normalizedConfig: Required<DaemonConfig> = {
      command: config.command,
      args: config.args ?? [],
      cwd: config.cwd ?? process.cwd(),
      env: config.env ?? {},
      autoStart: config.autoStart ?? true,
      autoRestart: config.autoRestart ?? true,
      maxRestarts: config.maxRestarts ?? 10,
      restartDelay: config.restartDelay ?? 5000,
      stopTimeout: config.stopTimeout ?? 30000,
      killTimeout: config.killTimeout ?? 10000,
    }

    const daemon: ManagedDaemon = {
      name,
      config: normalizedConfig,
      status: 'stopped',
      pid: null,
      startTime: null,
      restartCount: 0,
      lastRestart: null,
    }

    this.daemons.set(name, daemon)

    // 保存配置到文件
    await this.saveConfig(daemon)

    this.emit('created', { name, config: daemon.config })
  }

  /**
   * 启动守护进程
   * @param name 守护进程名称
   */
  async start(name: string): Promise<void> {
    const daemon = this.daemons.get(name)
    if (!daemon) {
      throw new ProcessError(`Daemon not found: ${name}`, '', undefined)
    }

    if (daemon.status === 'running') {
      return // 已经在运行
    }

    try {
      daemon.status = 'starting'
      this.emit('starting', { name })

      // 创建启动脚本
      const scriptPath = await this.createStartScript(daemon)

      // 启动守护进程
      const child = spawn(scriptPath, [], {
        detached: true,
        stdio: 'ignore',
        cwd: daemon.config.cwd || process.cwd(),
        env: { ...process.env, ...daemon.config.env },
      })

      // 分离进程
      child.unref()

      daemon.pid = child.pid!
      daemon.startTime = new Date()
      daemon.status = 'running'

      // 写入 PID 文件
      if (daemon.pid != null) {
        await this.writePidFile(name, daemon.pid)
      }

      this.emit('started', { name, pid: daemon.pid })

      // 验证进程是否真正启动
      setTimeout(async () => {
        if (daemon.pid && !(await ProcessUtils.isProcessRunning(daemon.pid))) {
          daemon.status = 'failed'
          this.emit('failed', { name, reason: 'Process died immediately after start' })
        }
      }, 1000)
    }
    catch (error) {
      daemon.status = 'failed'
      this.emit(
        'error',
        new ProcessError(`Failed to start daemon: ${name}`, '', undefined, error as Error),
      )
      throw error
    }
  }

  /**
   * 停止守护进程
   * @param name 守护进程名称
   * @param force 是否强制停止
   */
  async stop(name: string, force = false): Promise<void> {
    const daemon = this.daemons.get(name)
    if (!daemon) {
      throw new ProcessError(`Daemon not found: ${name}`, '', undefined)
    }

    if (daemon.status !== 'running' || !daemon.pid) {
      return // 已经停止
    }

    try {
      daemon.status = 'stopping'
      this.emit('stopping', { name, force })

      if (force) {
        // 强制终止
        await ProcessUtils.killProcessTree(daemon.pid, 'SIGKILL')
      }
      else {
        // 优雅停止
        try {
          await ProcessUtils.killProcessTree(daemon.pid, 'SIGTERM')

          // 等待进程停止
          await ProcessUtils.waitForProcessExit(daemon.pid, daemon.config.stopTimeout)
        }
        catch {
          // 如果优雅停止失败，强制终止
          await ProcessUtils.killProcessTree(daemon.pid, 'SIGKILL')
          await ProcessUtils.waitForProcessExit(daemon.pid, daemon.config.killTimeout)
        }
      }

      daemon.status = 'stopped'
      daemon.pid = null

      // 清理 PID 文件
      await this.removePidFile(name)

      this.emit('stopped', { name, force })
    }
    catch (error) {
      this.emit(
        'error',
        new ProcessError(`Failed to stop daemon: ${name}`, '', undefined, error as Error),
      )
      throw error
    }
  }

  /**
   * 重启守护进程
   * @param name 守护进程名称
   */
  async restart(name: string): Promise<void> {
    const daemon = this.daemons.get(name)
    if (!daemon) {
      throw new ProcessError(`Daemon not found: ${name}`, '', undefined)
    }

    this.emit('restarting', { name })

    if (daemon.status === 'running') {
      await this.stop(name)
    }

    daemon.restartCount++
    daemon.lastRestart = new Date()

    await this.start(name)
  }

  /**
   * 获取守护进程状态
   * @param name 守护进程名称
   */
  async getStatus(name: string): Promise<DaemonStatus | null> {
    const daemon = this.daemons.get(name)
    if (!daemon) {
      return null
    }

    // 检查进程是否真正在运行
    if (daemon.pid && daemon.status === 'running') {
      const isRunning = await ProcessUtils.isProcessRunning(daemon.pid)
      if (!isRunning) {
        daemon.status = 'stopped'
        daemon.pid = null
        await this.removePidFile(name)
      }
    }

    return {
      name: daemon.name,
      status: daemon.status,
      pid: daemon.pid,
      startTime: daemon.startTime,
      restartCount: daemon.restartCount,
      lastRestart: daemon.lastRestart,
      uptime: daemon.startTime ? Date.now() - daemon.startTime.getTime() : 0,
    }
  }

  /**
   * 获取所有守护进程状态
   */
  async getAllStatus(): Promise<DaemonStatus[]> {
    const statuses: DaemonStatus[] = []

    for (const name of this.daemons.keys()) {
      const status = await this.getStatus(name)
      if (status) {
        statuses.push(status)
      }
    }

    return statuses
  }

  /**
   * 删除守护进程
   * @param name 守护进程名称
   */
  async remove(name: string): Promise<void> {
    const daemon = this.daemons.get(name)
    if (!daemon) {
      return
    }

    if (daemon.status === 'running') {
      await this.stop(name, true)
    }

    // 清理文件
    await this.removeConfig(name)
    await this.removePidFile(name)
    await this.removeStartScript(name)

    this.daemons.delete(name)
    this.emit('removed', { name })
  }

  /**
   * 启动所有守护进程
   */
  async startAll(): Promise<void> {
    const promises = Array.from(this.daemons.entries())
      .filter(([_, daemon]) => daemon.config.autoStart)
      .map(([name]) =>
        this.start(name).catch((error) => {
          this.emit(
            'error',
            new ProcessError(`Failed to start daemon ${name}`, '', undefined, error),
          )
        }),
      )

    await Promise.all(promises)
  }

  /**
   * 停止所有守护进程
   * @param force 是否强制停止
   */
  async stopAll(force = false): Promise<void> {
    const promises = Array.from(this.daemons.keys()).map(name =>
      this.stop(name, force).catch((error) => {
        this.emit('error', new ProcessError(`Failed to stop daemon ${name}`, '', undefined, error))
      }),
    )

    await Promise.all(promises)
  }

  /**
   * 从配置文件加载守护进程
   */
  async loadFromConfig(): Promise<void> {
    try {
      const { FileSystem } = await import('../filesystem')
      const configFiles = (await FileSystem.readDir(this.configDir)) as string[]

      for (const configFile of configFiles) {
        if (!configFile.endsWith('.json'))
          continue

        const name = configFile.replace('.json', '')
        const configPath = join(this.configDir, configFile)

        try {
          const configContent = await readFile(configPath, 'utf8')
          const config = JSON.parse(configContent)

          if (!this.daemons.has(name)) {
            await this.create(name, config)
          }
        }
        catch (error) {
          this.emit(
            'error',
            new ProcessError(
              `Failed to load config for daemon ${name}`,
              '',
              undefined,
              error as Error,
            ),
          )
        }
      }
    }
    catch {
      // 忽略加载错误
    }
  }

  /**
   * 从 PID 文件恢复状态
   */
  async recoverFromPidFiles(): Promise<void> {
    try {
      const { FileSystem } = await import('../filesystem')
      const pidFiles = (await FileSystem.readDir(this.pidDir)) as string[]

      for (const pidFile of pidFiles) {
        if (!pidFile.endsWith('.pid'))
          continue

        const name = pidFile.replace('.pid', '')
        const daemon = this.daemons.get(name)

        if (!daemon)
          continue

        try {
          const pidContent = await readFile(join(this.pidDir, pidFile), 'utf8')
          const pid = Number.parseInt(pidContent.trim())

          if (await ProcessUtils.isProcessRunning(pid)) {
            daemon.status = 'running'
            daemon.pid = pid
            daemon.startTime = new Date() // 无法恢复确切的启动时间
            this.emit('recovered', { name, pid })
          }
          else {
            await this.removePidFile(name)
          }
        }
        catch {
          await this.removePidFile(name)
        }
      }
    }
    catch {
      // 忽略恢复错误
    }
  }

  /**
   * 创建启动脚本
   */
  private async createStartScript(daemon: ManagedDaemon): Promise<string> {
    const isWindows = platform() === 'win32'
    const scriptExt = isWindows ? '.bat' : '.sh'
    const scriptPath = join(this.configDir, `${daemon.name}${scriptExt}`)

    const logFile = join(this.logDir, `${daemon.name}.log`)
    const pidFile = join(this.pidDir, `${daemon.name}.pid`)

    let scriptContent: string

    if (isWindows) {
      scriptContent = `@echo off
cd /d "${daemon.config.cwd || process.cwd()}"
echo %date% %time% Starting daemon ${daemon.name} >> "${logFile}"
${daemon.config.command} ${(daemon.config.args || []).join(' ')} >> "${logFile}" 2>&1
`
    }
    else {
      scriptContent = `#!/bin/bash
cd "${daemon.config.cwd || process.cwd()}"
echo "$(date) Starting daemon ${daemon.name}" >> "${logFile}"
exec ${daemon.config.command} ${(daemon.config.args || []).join(' ')} >> "${logFile}" 2>&1 &
echo $! > "${pidFile}"
`
    }

    await writeFile(scriptPath, scriptContent)

    if (!isWindows) {
      await chmod(scriptPath, 0o755)
    }

    return scriptPath
  }

  /**
   * 保存配置
   */
  private async saveConfig(daemon: ManagedDaemon): Promise<void> {
    const configPath = join(this.configDir, `${daemon.name}.json`)
    await writeFile(configPath, JSON.stringify(daemon.config, null, 2))
  }

  /**
   * 删除配置
   */
  private async removeConfig(name: string): Promise<void> {
    const configPath = join(this.configDir, `${name}.json`)
    try {
      await unlink(configPath)
    }
    catch {
      // 忽略文件不存在的错误
    }
  }

  /**
   * 删除启动脚本
   */
  private async removeStartScript(name: string): Promise<void> {
    const isWindows = platform() === 'win32'
    const scriptExt = isWindows ? '.bat' : '.sh'
    const scriptPath = join(this.configDir, `${name}${scriptExt}`)

    try {
      await unlink(scriptPath)
    }
    catch {
      // 忽略文件不存在的错误
    }
  }

  /**
   * 写入 PID 文件
   */
  private async writePidFile(name: string, pid: number): Promise<void> {
    const pidFile = join(this.pidDir, `${name}.pid`)
    await writeFile(pidFile, pid.toString())
  }

  /**
   * 删除 PID 文件
   */
  private async removePidFile(name: string): Promise<void> {
    const pidFile = join(this.pidDir, `${name}.pid`)
    try {
      await unlink(pidFile)
    }
    catch {
      // 忽略文件不存在的错误
    }
  }
}

// 类型定义
interface DaemonManagerOptions {
  configDir?: string
  pidDir?: string
  logDir?: string
}

interface DaemonConfig {
  command: string
  args?: string[]
  cwd?: string
  env?: Record<string, string>
  autoStart?: boolean
  autoRestart?: boolean
  maxRestarts?: number
  restartDelay?: number
  stopTimeout?: number
  killTimeout?: number
}

interface ManagedDaemon {
  name: string
  config: Required<DaemonConfig>
  status: 'stopped' | 'starting' | 'running' | 'stopping' | 'failed'
  pid: number | null
  startTime: Date | null
  restartCount: number
  lastRestart: Date | null
}

interface DaemonStatus {
  name: string
  status: string
  pid: number | null
  startTime: Date | null
  restartCount: number
  lastRestart: Date | null
  uptime: number
}
