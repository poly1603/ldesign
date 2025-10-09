/**
 * 进程管理器
 * 管理项目的开发、构建、预览等子进程
 */

import { spawn, ChildProcess, execSync } from 'child_process'
import { EventEmitter } from 'events'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'

/**
 * 进程信息接口
 */
export interface ProcessInfo {
  /** 进程 ID */
  id: string
  /** 项目 ID */
  projectId: string
  /** 操作类型 (dev, build, preview, etc.) */
  action: string
  /** 运行环境 (development, production, test, staging) */
  environment: string
  /** 进程状态 */
  status: 'running' | 'stopped' | 'error'
  /** 开始时间 */
  startTime: number
  /** 日志 */
  logs: Array<{ time: number; message: string; type: 'stdout' | 'stderr' }>
  /** 子进程对象 */
  process?: ChildProcess
}

/**
 * 进程管理器类
 * 单例模式，管理所有项目的子进程
 */
export class ProcessManager extends EventEmitter {
  private static instance: ProcessManager
  private processes: Map<string, ProcessInfo> = new Map()

  private constructor() {
    super()
  }

  /**
   * 获取进程管理器实例
   */
  public static getInstance(): ProcessManager {
    if (!ProcessManager.instance) {
      ProcessManager.instance = new ProcessManager()
    }
    return ProcessManager.instance
  }

  /**
   * 生成进程 ID
   */
  private generateProcessId(projectId: string, action: string, environment: string): string {
    return `${projectId}-${action}-${environment}`
  }

  /**
   * 检查并提示 Verdaccio 认证
   */
  private checkVerdaccioAuth(registry: string): boolean {
    try {
      // 检查是否已经登录
      execSync(`npm whoami --registry=${registry}`, {
        encoding: 'utf-8',
        stdio: 'pipe'
      })
      return true
    } catch {
      return false
    }
  }

  /**
   * 启动进程
   * @param projectPath 项目路径
   * @param projectId 项目 ID
   * @param action 操作类型
   * @param environment 运行环境
   * @returns 进程信息
   */
  public async startProcess(
    projectPath: string,
    projectId: string,
    action: string,
    environment: string
  ): Promise<ProcessInfo> {
    const processId = this.generateProcessId(projectId, action, environment)

    // 如果进程已经在运行，先停止
    if (this.processes.has(processId)) {
      await this.stopProcess(processId)
    }

    // 读取 package.json 获取脚本命令
    const packageJsonPath = path.join(projectPath, 'package.json')
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json 不存在')
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    const scripts = packageJson.scripts || {}

    // 处理 publish 动作的特殊情况
    let command: string
    let args: string[]

    if (action === 'publish') {
      // 发布动作，直接使用 pnpm publish
      command = 'pnpm'
      // --no-git-checks: 跳过 git 检查
      // --ignore-scripts: 跳过 prepublishOnly 等生命周期脚本，适用于私有源快速发布
      args = ['publish', '--no-git-checks', '--ignore-scripts']
      
      // 如果 environment 是 URL，则作为 registry 参数
      if (environment && (environment.startsWith('http://') || environment.startsWith('https://'))) {
        args.push('--registry', environment)
        
        // 对于 Verdaccio 本地源，检查认证状态
        if (environment.includes('127.0.0.1') || environment.includes('localhost')) {
          if (!this.checkVerdaccioAuth(environment)) {
            throw new Error(
              `未登录到 ${environment}。\n` +
              `请先在终端执行： npm adduser --registry=${environment}\n` +
              `然后再尝试发布。`
            )
          }
        }
      }
    } else {
      // 其他动作，根据 action 和 environment 确定要执行的脚本
      let scriptName = action
      if (environment !== 'development' && environment !== 'production') {
        // 对于 test 和 staging 环境，尝试使用带环境后缀的脚本
        const envScriptName = `${action}:${environment}`
        if (scripts[envScriptName]) {
          scriptName = envScriptName
        }
      } else if (environment === 'production' && action === 'dev') {
        // 开发环境的生产模式
        const prodScriptName = `${action}:prod`
        if (scripts[prodScriptName]) {
          scriptName = prodScriptName
        }
      }

      if (!scripts[scriptName]) {
        throw new Error(`脚本 "${scriptName}" 不存在`)
      }

      command = 'pnpm'
      args = ['run', scriptName]
    }

    // 创建进程信息
    const processInfo: ProcessInfo = {
      id: processId,
      projectId,
      action,
      environment,
      status: 'running',
      startTime: Date.now(),
      logs: []
    }

    // 启动子进程
    const child = spawn(command, args, {
      cwd: projectPath,
      shell: true,
      stdio: 'pipe'
    })

    processInfo.process = child

    // 监听标准输出
    child.stdout?.on('data', (data: Buffer) => {
      const message = data.toString()
      processInfo.logs.push({
        time: Date.now(),
        message,
        type: 'stdout'
      })
      this.emit('log', processId, message, 'stdout')
    })

    // 监听错误输出
    child.stderr?.on('data', (data: Buffer) => {
      const message = data.toString()
      processInfo.logs.push({
        time: Date.now(),
        message,
        type: 'stderr'
      })
      this.emit('log', processId, message, 'stderr')
    })

    // 监听进程退出
    child.on('exit', (code: number | null) => {
      if (code === 0) {
        processInfo.status = 'stopped'
        this.emit('exit', processId, code)
      } else {
        processInfo.status = 'error'
        this.emit('error', processId, code)
      }
    })

    // 监听进程错误
    child.on('error', (error: Error) => {
      processInfo.status = 'error'
      processInfo.logs.push({
        time: Date.now(),
        message: error.message,
        type: 'stderr'
      })
      this.emit('error', processId, error)
    })

    // 保存进程信息
    this.processes.set(processId, processInfo)

    return processInfo
  }

  /**
   * 停止进程
   * @param processId 进程 ID
   */
  public async stopProcess(processId: string): Promise<void> {
    const processInfo = this.processes.get(processId)
    if (!processInfo) {
      throw new Error('进程不存在')
    }

    if (processInfo.process && processInfo.status === 'running') {
      // 尝试优雅地终止进程
      processInfo.process.kill('SIGTERM')

      // 等待 5 秒，如果进程还没有退出，强制杀死
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          if (processInfo.process && !processInfo.process.killed) {
            processInfo.process.kill('SIGKILL')
          }
          resolve()
        }, 5000)

        processInfo.process?.on('exit', () => {
          clearTimeout(timeout)
          resolve()
        })
      })

      processInfo.status = 'stopped'
    }
  }

  /**
   * 获取进程信息
   * @param processId 进程 ID
   */
  public getProcess(processId: string): ProcessInfo | undefined {
    return this.processes.get(processId)
  }

  /**
   * 获取项目的所有进程
   * @param projectId 项目 ID
   */
  public getProjectProcesses(projectId: string): ProcessInfo[] {
    return Array.from(this.processes.values()).filter(
      (p) => p.projectId === projectId
    )
  }

  /**
   * 获取所有进程
   */
  public getAllProcesses(): ProcessInfo[] {
    return Array.from(this.processes.values())
  }

  /**
   * 清理已停止的进程
   */
  public cleanup(): void {
    for (const [id, info] of this.processes.entries()) {
      if (info.status !== 'running') {
        this.processes.delete(id)
      }
    }
  }

  /**
   * 停止所有进程
   */
  public async stopAllProcesses(): Promise<void> {
    const promises = Array.from(this.processes.keys()).map((id) =>
      this.stopProcess(id).catch(() => {})
    )
    await Promise.all(promises)
    this.processes.clear()
  }

  /**
   * 获取进程日志
   * @param processId 进程 ID
   * @param limit 日志数量限制
   */
  public getProcessLogs(
    processId: string,
    limit?: number
  ): Array<{ time: number; message: string; type: 'stdout' | 'stderr' }> {
    const processInfo = this.processes.get(processId)
    if (!processInfo) {
      return []
    }

    const logs = processInfo.logs
    if (limit && limit > 0) {
      return logs.slice(-limit)
    }
    return logs
  }
}

