/**
 * 服务管理器
 * 提供服务的启动、停止、重启和监控功能
 */

import type { ChildProcess } from 'node:child_process'
import { spawn } from 'node:child_process'
import { EventEmitter } from 'node:events'
import { readFile, unlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ProcessError } from '../types'
import { AsyncUtils } from '../utils'
import { ProcessUtils } from './process-utils'

/**
 * 服务管理器类
 */
export class ServiceManager extends EventEmitter {
  private services: Map<string, ManagedService> = new Map()
  private pidDir: string
  private logDir: string

  constructor(options: ServiceManagerOptions = {}) {
    super()
    this.pidDir = options.pidDir || join(tmpdir(), 'ldesign-services', 'pids')
    this.logDir = options.logDir || join(tmpdir(), 'ldesign-services', 'logs')

    this.ensureDirectories()
  }

  /**
   * 确保必要的目录存在
   */
  private async ensureDirectories(): Promise<void> {
    try {
      const { FileSystem } = await import('../filesystem')
      await FileSystem.ensureDir(this.pidDir)
      await FileSystem.ensureDir(this.logDir)
    }
    catch (error) {
      this.emit(
        'error',
        new ProcessError('Failed to create service directories', '', undefined, error as Error),
      )
    }
  }

  /**
   * 注册服务
   * @param name 服务名称
   * @param config 服务配置
   */
  register(name: string, config: ServiceConfig): void {
    if (this.services.has(name)) {
      throw new ProcessError(`Service already registered: ${name}`, '', undefined)
    }

    const fullConfig: Required<ServiceConfig> = {
      command: config.command,
      args: config.args ?? [],
      cwd: config.cwd ?? process.cwd(),
      env: config.env ?? {},
      stdio: config.stdio ?? 'pipe',
      detached: config.detached ?? false,
      autoRestart: config.autoRestart ?? true,
      maxRestarts: config.maxRestarts ?? 5,
      restartDelay: config.restartDelay ?? 1000,
      healthCheck: config.healthCheck ?? (async () => true),
      healthCheckInterval: config.healthCheckInterval ?? 30000,
      gracefulShutdownTimeout: config.gracefulShutdownTimeout ?? 10000,
      logFile: config.logFile ?? false,
    }

    const service: ManagedService = {
      name,
      config: fullConfig,
      status: 'stopped',
      restartCount: 0,
      startTime: null,
      lastRestart: null,
      process: null,
      healthCheckTimer: null,
    }

    this.services.set(name, service)
    this.emit('registered', { name, config: service.config })
  }

  /**
   * 启动服务
   * @param name 服务名称
   */
  async start(name: string): Promise<void> {
    const service = this.services.get(name)
    if (!service) {
      throw new ProcessError(`Service not found: ${name}`, '', undefined)
    }

    if (service.status === 'running') {
      return // 已经在运行
    }

    try {
      service.status = 'starting'
      this.emit('starting', { name })

      // 启动进程
      const childProcess = spawn(service.config.command, service.config.args || [], {
        cwd: service.config.cwd || process.cwd(),
        env: { ...process.env, ...service.config.env },
        stdio: service.config.stdio || 'pipe',
        detached: service.config.detached || false,
      })

      service.process = childProcess
      service.startTime = new Date()
      service.status = 'running'

      // 写入 PID 文件
      await this.writePidFile(name, childProcess.pid!)

      // 设置进程事件监听
      this.setupProcessListeners(service)

      // 启动健康检查
      this.startHealthCheck(service)

      this.emit('started', { name, pid: childProcess.pid })
    }
    catch (error) {
      service.status = 'error'
      service.error = error as Error
      this.emit(
        'error',
        new ProcessError(`Failed to start service: ${name}`, '', undefined, error as Error),
      )
      throw error
    }
  }

  /**
   * 停止服务
   * @param name 服务名称
   * @param force 是否强制停止
   */
  async stop(name: string, force = false): Promise<void> {
    const service = this.services.get(name)
    if (!service) {
      throw new ProcessError(`Service not found: ${name}`, '', undefined)
    }

    if (service.status !== 'running' || !service.process) {
      return // 已经停止
    }

    try {
      service.status = 'stopping'
      this.emit('stopping', { name, force })

      // 停止健康检查
      this.stopHealthCheck(service)

      if (force) {
        // 强制终止
        service.process.kill('SIGKILL')
      }
      else {
        // 优雅停止
        service.process.kill('SIGTERM')

        // 等待优雅停止超时
        const timeout = service.config.gracefulShutdownTimeout
        await AsyncUtils.timeout(
          this.waitForProcessExit(service.process),
          timeout,
          `Service ${name} did not stop gracefully within ${timeout}ms`,
        ).catch(() => {
          // 超时后强制终止
          if (service.process && !service.process.killed) {
            service.process.kill('SIGKILL')
          }
        })
      }

      // 清理 PID 文件
      await this.removePidFile(name)

      this.emit('stopped', { name, force })
    }
    catch (error) {
      this.emit(
        'error',
        new ProcessError(`Failed to stop service: ${name}`, '', undefined, error as Error),
      )
      throw error
    }
  }

  /**
   * 重启服务
   * @param name 服务名称
   */
  async restart(name: string): Promise<void> {
    const service = this.services.get(name)
    if (!service) {
      throw new ProcessError(`Service not found: ${name}`, '', undefined)
    }

    this.emit('restarting', { name })

    if (service.status === 'running') {
      await this.stop(name)
    }

    // 等待一段时间后重启
    await AsyncUtils.delay(service.config.restartDelay)

    service.restartCount++
    service.lastRestart = new Date()

    await this.start(name)
  }

  /**
   * 获取服务状态
   * @param name 服务名称
   */
  getStatus(name: string): ServiceStatus | null {
    const service = this.services.get(name)
    if (!service) {
      return null
    }

    return {
      name: service.name,
      status: service.status,
      pid: service.process?.pid,
      startTime: service.startTime,
      restartCount: service.restartCount,
      lastRestart: service.lastRestart,
      uptime: service.startTime ? Date.now() - service.startTime.getTime() : 0,
      error: service.error?.message,
    }
  }

  /**
   * 获取所有服务状态
   */
  getAllStatus(): ServiceStatus[] {
    return Array.from(this.services.keys())
      .map(name => this.getStatus(name)!)
      .filter(Boolean)
  }

  /**
   * 启动所有服务
   */
  async startAll(): Promise<void> {
    const promises = Array.from(this.services.keys()).map(name =>
      this.start(name).catch((error) => {
        this.emit(
          'error',
          new ProcessError(`Failed to start service ${name}`, '', undefined, error),
        )
      }),
    )

    await Promise.all(promises)
  }

  /**
   * 停止所有服务
   * @param force 是否强制停止
   */
  async stopAll(force = false): Promise<void> {
    const promises = Array.from(this.services.keys()).map(name =>
      this.stop(name, force).catch((error) => {
        this.emit('error', new ProcessError(`Failed to stop service ${name}`, '', undefined, error))
      }),
    )

    await Promise.all(promises)
  }

  /**
   * 注销服务
   * @param name 服务名称
   */
  async unregister(name: string): Promise<void> {
    const service = this.services.get(name)
    if (!service) {
      return
    }

    if (service.status === 'running') {
      await this.stop(name, true)
    }

    this.stopHealthCheck(service)
    this.services.delete(name)

    this.emit('unregistered', { name })
  }

  /**
   * 设置进程事件监听
   */
  private setupProcessListeners(service: ManagedService): void {
    if (!service.process)
      return

    service.process.on('exit', async (code, signal) => {
      service.status = code === 0 ? 'stopped' : 'crashed'
      service.process = null

      this.stopHealthCheck(service)
      await this.removePidFile(service.name)

      this.emit('exit', {
        name: service.name,
        exitCode: code,
        signal,
        crashed: code !== 0,
      })

      // 自动重启逻辑
      if (
        service.config.autoRestart
        && code !== 0
        && service.restartCount < service.config.maxRestarts
      ) {
        this.emit('autoRestart', { name: service.name, attempt: service.restartCount + 1 })

        setTimeout(() => {
          this.restart(service.name).catch((error) => {
            this.emit(
              'error',
              new ProcessError(
                `Auto restart failed for service: ${service.name}`,
                '',
                undefined,
                error,
              ),
            )
          })
        }, service.config.restartDelay)
      }
    })

    service.process.on('error', (error) => {
      service.status = 'error'
      service.error = error
      this.emit('processError', { name: service.name, error })
    })

    // 处理输出日志
    if (service.process.stdout && service.config.logFile) {
      service.process.stdout.on('data', (data) => {
        this.writeLog(service.name, 'stdout', data.toString())
      })
    }

    if (service.process.stderr && service.config.logFile) {
      service.process.stderr.on('data', (data) => {
        this.writeLog(service.name, 'stderr', data.toString())
      })
    }
  }

  /**
   * 启动健康检查
   */
  private startHealthCheck(service: ManagedService): void {
    if (!service.config.healthCheck || !service.config.healthCheckInterval) {
      return
    }

    service.healthCheckTimer = setInterval(async () => {
      try {
        const isHealthy = await service.config.healthCheck!()
        if (!isHealthy) {
          this.emit('unhealthy', { name: service.name })

          if (service.config.autoRestart) {
            await this.restart(service.name)
          }
        }
      }
      catch (error) {
        this.emit('healthCheckError', { name: service.name, error })
      }
    }, service.config.healthCheckInterval)
  }

  /**
   * 停止健康检查
   */
  private stopHealthCheck(service: ManagedService): void {
    if (service.healthCheckTimer) {
      clearInterval(service.healthCheckTimer)
      service.healthCheckTimer = null
    }
  }

  /**
   * 等待进程退出
   */
  private waitForProcessExit(process: ChildProcess): Promise<void> {
    return new Promise((resolve) => {
      process.on('exit', () => resolve())
    })
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

  /**
   * 写入日志
   */
  private async writeLog(
    serviceName: string,
    type: 'stdout' | 'stderr',
    data: string,
  ): Promise<void> {
    if (!this.logDir)
      return

    try {
      const logFile = join(this.logDir, `${serviceName}.log`)
      const timestamp = new Date().toISOString()
      const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${data}`

      const { FileSystem } = await import('../filesystem')
      await FileSystem.appendFile(logFile, logEntry)
    }
    catch {
      // 忽略日志写入错误
    }
  }

  /**
   * 从 PID 文件恢复服务状态
   */
  async recoverFromPidFiles(): Promise<void> {
    try {
      const { FileSystem } = await import('../filesystem')
      const pidFiles = await FileSystem.readDir(this.pidDir)

      for (const pidFile of pidFiles as string[]) {
        if (!pidFile.endsWith('.pid'))
          continue

        const serviceName = pidFile.replace('.pid', '')
        const service = this.services.get(serviceName)

        if (!service)
          continue

        try {
          const pidContent = await readFile(join(this.pidDir, pidFile), 'utf8')
          const pid = Number.parseInt(pidContent.trim())

          if (await ProcessUtils.isProcessRunning(pid)) {
            service.status = 'running'
            service.startTime = new Date() // 无法恢复确切的启动时间
            // 注意：无法恢复 ChildProcess 对象，所以某些功能可能受限
            this.emit('recovered', { name: serviceName, pid })
          }
          else {
            await this.removePidFile(serviceName)
          }
        }
        catch {
          await this.removePidFile(serviceName)
        }
      }
    }
    catch {
      // 忽略恢复错误
    }
  }
}

// 类型定义
interface ServiceManagerOptions {
  pidDir?: string
  logDir?: string
}

interface ServiceConfig {
  command: string
  args?: string[]
  cwd?: string
  env?: Record<string, string>
  stdio?: 'pipe' | 'inherit' | 'ignore'
  detached?: boolean
  autoRestart?: boolean
  maxRestarts?: number
  restartDelay?: number
  healthCheck?: () => Promise<boolean>
  healthCheckInterval?: number
  gracefulShutdownTimeout?: number
  logFile?: boolean
}

interface ManagedService {
  name: string
  config: Required<ServiceConfig>
  status: 'stopped' | 'starting' | 'running' | 'stopping' | 'crashed' | 'error'
  restartCount: number
  startTime: Date | null
  lastRestart: Date | null
  process: ChildProcess | null
  healthCheckTimer: NodeJS.Timeout | null
  error?: Error
}

interface ServiceStatus {
  name: string
  status: string
  pid?: number
  startTime: Date | null
  restartCount: number
  lastRestart: Date | null
  uptime: number
  error?: string
}
