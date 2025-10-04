/**
 * Verdaccio 本地 NPM 服务器管理模块
 * 提供启动、停止、配置和状态管理功能
 */

import { spawn, ChildProcess } from 'child_process'
import { join } from 'path'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import { homedir } from 'os'
import { logger } from '../../utils/logger.js'

const verdaccioLogger = logger.withPrefix('Verdaccio')

/**
 * Verdaccio 配置接口
 */
export interface VerdaccioConfig {
  port: number
  host: string
  storage: string
  maxBodySize?: string
  uplinks?: Record<string, { url: string }>
}

/**
 * Verdaccio 服务状态
 */
export interface VerdaccioStatus {
  isRunning: boolean
  pid?: number
  port?: number
  host?: string
  uptime?: number
  configPath?: string
  storageePath?: string
  url?: string
}

/**
 * Verdaccio 管理器类
 */
class VerdaccioManager {
  private process: ChildProcess | null = null
  private config: VerdaccioConfig
  private configDir: string
  private configPath: string
  private startTime: number | null = null

  constructor() {
    // 默认配置
    this.configDir = join(homedir(), '.ldesign', 'verdaccio')
    this.configPath = join(this.configDir, 'config.yaml')
    
    this.config = {
      port: 4873,
      host: '127.0.0.1',
      storage: join(this.configDir, 'storage'),
      maxBodySize: '100mb',
      uplinks: {
        npmjs: {
          url: 'https://registry.npmjs.org/'
        },
        taobao: {
          url: 'https://registry.npmmirror.com/'
        }
      }
    }

    this.ensureConfigDirectory()
  }

  /**
   * 确保配置目录存在
   */
  private ensureConfigDirectory(): void {
    if (!existsSync(this.configDir)) {
      mkdirSync(this.configDir, { recursive: true })
      verdaccioLogger.info(`创建配置目录: ${this.configDir}`)
    }

    if (!existsSync(this.config.storage)) {
      mkdirSync(this.config.storage, { recursive: true })
      verdaccioLogger.info(`创建存储目录: ${this.config.storage}`)
    }
  }

  /**
   * 生成 Verdaccio 配置文件
   */
  private generateConfigFile(): void {
    const configContent = `
# Verdaccio 配置文件 - 由 LDesign CLI 自动生成
# 详细配置说明: https://verdaccio.org/docs/configuration

# 存储路径
storage: ${this.config.storage}

# Web UI 配置
web:
  title: LDesign Local NPM Registry
  # logo: logo.png
  # favicon: favicon.ico
  enable: true

# 认证配置
auth:
  htpasswd:
    file: ./htpasswd
    # 允许注册新用户
    max_users: -1

# 上游链路配置 (代理到其他 npm 源)
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
  taobao:
    url: https://registry.npmmirror.com/

# 包访问权限配置
packages:
  # 私有包 (以 @ldesign 开头)
  '@ldesign/*':
    access: $all
    publish: $authenticated
    unpublish: $authenticated
    proxy: npmjs

  # 其他私有包
  '@*/*':
    access: $all
    publish: $authenticated
    unpublish: $authenticated
    proxy: npmjs

  # 公共包
  '**':
    access: $all
    publish: $authenticated
    unpublish: $authenticated
    proxy: taobao

# 服务器配置
server:
  keepAliveTimeout: 60

# 中间件配置
middlewares:
  audit:
    enabled: true

# 日志配置
logs:
  - { type: stdout, format: pretty, level: info }

# 监听配置
listen:
  - ${this.config.host}:${this.config.port}

# 最大上传大小
max_body_size: ${this.config.maxBodySize || '100mb'}

# 通知配置
notify:
  method: POST
  headers: [{ "Content-Type": "application/json" }]
  endpoint: http://localhost:3000/api/verdaccio/notify
  content: '{"name": "{{name}}", "version": "{{version}}", "tag": "{{tag}}"}'
`

    writeFileSync(this.configPath, configContent, 'utf-8')
    verdaccioLogger.info(`配置文件已生成: ${this.configPath}`)
  }

  /**
   * 启动 Verdaccio 服务
   */
  async start(customConfig?: Partial<VerdaccioConfig>): Promise<{ success: boolean; message: string; data?: VerdaccioStatus }> {
    try {
      // 检查是否已经在运行
      if (this.process && !this.process.killed) {
        return {
          success: false,
          message: 'Verdaccio 已经在运行中'
        }
      }

      // 合并自定义配置
      if (customConfig) {
        this.config = { ...this.config, ...customConfig }
      }

      // 确保目录和配置文件存在
      this.ensureConfigDirectory()
      this.generateConfigFile()

      verdaccioLogger.info(`正在启动 Verdaccio 服务...`)
      verdaccioLogger.info(`配置文件: ${this.configPath}`)
      verdaccioLogger.info(`监听地址: http://${this.config.host}:${this.config.port}`)

      // 使用 spawn 启动 Verdaccio
      // 注意：需要使用 npx 或者直接调用 node_modules 中的 verdaccio
      const verdaccioPath = 'verdaccio'
      
      this.process = spawn(verdaccioPath, [
        '--config', this.configPath,
        '--listen', `${this.config.host}:${this.config.port}`
      ], {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false,
        shell: true
      })

      this.startTime = Date.now()

      // 处理标准输出
      this.process.stdout?.on('data', (data) => {
        const message = data.toString().trim()
        verdaccioLogger.info(`[STDOUT] ${message}`)
      })

      // 处理错误输出
      this.process.stderr?.on('data', (data) => {
        const message = data.toString().trim()
        // Verdaccio 的正常日志也会输出到 stderr
        if (message.includes('http address')) {
          verdaccioLogger.info(`[INFO] ${message}`)
        } else if (message.includes('error') || message.includes('Error')) {
          verdaccioLogger.error(`[ERROR] ${message}`)
        } else {
          verdaccioLogger.info(`[INFO] ${message}`)
        }
      })

      // 处理进程退出
      this.process.on('exit', (code, signal) => {
        verdaccioLogger.warn(`Verdaccio 进程退出: code=${code}, signal=${signal}`)
        this.process = null
        this.startTime = null
      })

      // 处理进程错误
      this.process.on('error', (error) => {
        verdaccioLogger.error(`Verdaccio 进程错误:`, error)
        this.process = null
        this.startTime = null
      })

      // 等待服务启动 (简单延迟，实际应该检查端口)
      await new Promise(resolve => setTimeout(resolve, 2000))

      const status = this.getStatus()
      
      return {
        success: true,
        message: `Verdaccio 服务已启动，访问地址: http://${this.config.host}:${this.config.port}`,
        data: status
      }
    } catch (error) {
      verdaccioLogger.error('启动 Verdaccio 失败:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : '启动失败'
      }
    }
  }

  /**
   * 停止 Verdaccio 服务
   */
  async stop(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.process || this.process.killed) {
        return {
          success: false,
          message: 'Verdaccio 未在运行'
        }
      }

      verdaccioLogger.info('正在停止 Verdaccio 服务...')

      return new Promise((resolve) => {
        if (!this.process) {
          resolve({
            success: false,
            message: 'Verdaccio 未在运行'
          })
          return
        }

        // 设置超时强制杀死
        const timeout = setTimeout(() => {
          if (this.process && !this.process.killed) {
            verdaccioLogger.warn('强制终止 Verdaccio 进程')
            this.process.kill('SIGKILL')
          }
        }, 5000)

        this.process.once('exit', () => {
          clearTimeout(timeout)
          this.process = null
          this.startTime = null
          verdaccioLogger.info('Verdaccio 服务已停止')
          resolve({
            success: true,
            message: 'Verdaccio 服务已停止'
          })
        })

        // 发送终止信号
        this.process.kill('SIGTERM')
      })
    } catch (error) {
      verdaccioLogger.error('停止 Verdaccio 失败:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : '停止失败'
      }
    }
  }

  /**
   * 重启 Verdaccio 服务
   */
  async restart(customConfig?: Partial<VerdaccioConfig>): Promise<{ success: boolean; message: string; data?: VerdaccioStatus }> {
    verdaccioLogger.info('正在重启 Verdaccio 服务...')
    
    // 先停止
    if (this.process && !this.process.killed) {
      await this.stop()
      // 等待一下确保进程完全退出
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // 再启动
    return this.start(customConfig)
  }

  /**
   * 获取服务状态
   */
  getStatus(): VerdaccioStatus {
    const isRunning = !!(this.process && !this.process.killed)
    
    const status: VerdaccioStatus = {
      isRunning,
      configPath: this.configPath,
      storageePath: this.config.storage
    }

    if (isRunning) {
      status.pid = this.process!.pid
      status.port = this.config.port
      status.host = this.config.host
      status.url = `http://${this.config.host}:${this.config.port}`
      
      if (this.startTime) {
        status.uptime = Date.now() - this.startTime
      }
    }

    return status
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<VerdaccioConfig>): void {
    this.config = { ...this.config, ...newConfig }
    verdaccioLogger.info('配置已更新')
  }

  /**
   * 获取当前配置
   */
  getConfig(): VerdaccioConfig {
    return { ...this.config }
  }

  /**
   * 读取配置文件内容
   */
  getConfigFileContent(): string | null {
    try {
      if (existsSync(this.configPath)) {
        return readFileSync(this.configPath, 'utf-8')
      }
      return null
    } catch (error) {
      verdaccioLogger.error('读取配置文件失败:', error)
      return null
    }
  }

  /**
   * 保存配置文件内容
   */
  saveConfigFileContent(content: string): { success: boolean; message: string } {
    try {
      writeFileSync(this.configPath, content, 'utf-8')
      verdaccioLogger.info('配置文件已保存')
      return {
        success: true,
        message: '配置文件已保存'
      }
    } catch (error) {
      verdaccioLogger.error('保存配置文件失败:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : '保存失败'
      }
    }
  }
}

// 导出单例实例
export const verdaccioManager = new VerdaccioManager()
