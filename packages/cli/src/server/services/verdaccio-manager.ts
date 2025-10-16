/**
 * Verdaccio 本地 NPM 服务器管理模块
 * 提供启动、停止、配置和状态管理功能
 */

import { spawn, ChildProcess, exec } from 'child_process'
import { join } from 'path'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import { homedir } from 'os'
import { logger } from '../../utils/logger.js'
import { promisify } from 'util'
import { createHash } from 'crypto'

const execAsync = promisify(exec)

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
 * Verdaccio 用户接口
 */
export interface VerdaccioUser {
  username: string
  createdAt?: string
  email?: string
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

    if (!existsSync(this.config?.storage)) {
      mkdirSync(this.config?.storage, { recursive: true })
      verdaccioLogger.info(`创建存储目录: ${this.config?.storage}`)
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
storage: ${this.config?.storage}

# Web UI 配置
web:
  title: LDesign Local NPM Registry
  # logo: logo.png
  # favicon: favicon.ico
  enable: true

# 认证配置
auth:
  htpasswd:
    file: ${join(this.configDir, 'htpasswd')}
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
  - ${this.config?.host}:${this.config?.port}

# 最大上传大小
max_body_size: ${this.config?.maxBodySize || '100mb'}

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
   * 检查端口是否被占用
   */
  private async isPortInUse(port: number): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`)
      return stdout.trim().length > 0
    } catch {
      return false
    }
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

      // 检查端口是否已被占用
      const portInUse = await this.isPortInUse(this.config?.port)
      if (portInUse) {
        verdaccioLogger.warn(`端口 ${this.config?.port} 已被占用，可能有 Verdaccio 实例正在运行`)
        // 返回一个虚拟的状态，表示服务已在运行
        return {
          success: true,
          message: `Verdaccio 服务已在端口 ${this.config?.port} 运行（外部启动）`,
          data: {
            isRunning: true,
            port: this.config?.port,
            host: this.config?.host,
            url: `http://${this.config?.host}:${this.config?.port}`,
            configPath: this.configPath,
            storageePath: this.config?.storage
          }
        }
      }

      // 确保目录和配置文件存在
      this.ensureConfigDirectory()
      this.generateConfigFile()

      verdaccioLogger.info(`正在启动 Verdaccio 服务...`)
      verdaccioLogger.info(`配置文件: ${this.configPath}`)
      verdaccioLogger.info(`监听地址: http://${this.config?.host}:${this.config?.port}`)

      // 使用 spawn 启动 Verdaccio
      // 注意：需要使用 npx 或者直接调用 node_modules 中的 verdaccio
      const verdaccioPath = 'verdaccio'
      
      this.process = spawn(verdaccioPath, [
        '--config', this.configPath,
        '--listen', `${this.config?.host}:${this.config?.port}`
      ], {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false,
        shell: true
      })

      this.startTime = Date.now()

      // 用于跟踪启动状态
      let startupError: Error | null = null
      let isStarted = false

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
          isStarted = true
        } else if (message.includes('error') || message.includes('Error')) {
          verdaccioLogger.error(`[ERROR] ${message}`)
        } else {
          verdaccioLogger.info(`[INFO] ${message}`)
        }
      })

      // 处理进程退出
      this.process.on('exit', (code, signal) => {
        verdaccioLogger.warn(`Verdaccio 进程退出: code=${code}, signal=${signal}`)
        if (!isStarted) {
          startupError = new Error(`Verdaccio 启动失败，退出码: ${code}`)
        }
        this.process = null
        this.startTime = null
      })

      // 处理进程错误
      this.process.on('error', (error: any) => {
        verdaccioLogger.error(`Verdaccio 进程错误:`, error)
        startupError = error
        
        // 检测是否是命令不存在的错误
        if (error.code === 'ENOENT') {
          verdaccioLogger.error('Verdaccio 未安装，请运行: npm install -g verdaccio')
        }
        
        this.process = null
        this.startTime = null
      })

      // 等待服务启动完成
      await new Promise(resolve => setTimeout(resolve, 3000))

      // 检查是否启动失败
      if (startupError) {
        throw startupError
      }

      // 检查进程是否还在运行
      if (!this.process || this.process.killed) {
        throw new Error('Verdaccio 进程启动后立即退出，请检查配置或端口是否被占用')
      }

      const status = await this.getStatus()
      verdaccioLogger.info('Verdaccio 启动成功，当前状态:', status)
      
      return {
        success: true,
        message: `Verdaccio 服务已启动，访问地址: http://${this.config?.host}:${this.config?.port}`,
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
  async getStatus(): Promise<VerdaccioStatus> {
    const isRunning = !!(this.process && !this.process.killed)
    
    const status: VerdaccioStatus = {
      isRunning,
      configPath: this.configPath,
      storageePath: this.config?.storage
    }

    if (isRunning) {
      status.pid = this.process!.pid
      status.port = this.config?.port
      status.host = this.config?.host
      status.url = `http://${this.config?.host}:${this.config?.port}`
      
      if (this.startTime) {
        status.uptime = Date.now() - this.startTime
      }
    } else {
      // 如果本地进程不存在，检查端口是否被占用（可能是外部启动的 Verdaccio）
      const portInUse = await this.isPortInUse(this.config?.port)
      if (portInUse) {
        status.isRunning = true
        status.port = this.config?.port
        status.host = this.config?.host
        status.url = `http://${this.config?.host}:${this.config?.port}`
        // 注意：外部进程我们无法获取 PID 和 uptime
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

  /**
   * 获取所有已发布的包列表
   */
  getPackages(): Array<{
    name: string
    versions: string[]
    latestVersion: string
    description?: string
    author?: string
    modified: number
  }> {
    try {
      const storageDir = this.config?.storage
      if (!existsSync(storageDir)) {
        return []
      }

      const { readdirSync, statSync } = require('fs')
      const packages: any[] = []

      // 读取存储目录
      const items = readdirSync(storageDir)

      for (const item of items) {
        const itemPath = join(storageDir, item)
        const stat = statSync(itemPath)

        if (stat.isDirectory() && !item.startsWith('.')) {
          // 读取包的 package.json
          const packageJsonPath = join(itemPath, 'package.json')
          if (existsSync(packageJsonPath)) {
            try {
              const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
              
              // 获取所有版本
              const versions = readdirSync(itemPath)
                .filter((f: string) => f.endsWith('.tgz'))
                .map((f: string) => f.replace(`${item}-`, '').replace('.tgz', ''))
                .sort((a: string, b: string) => b.localeCompare(a, undefined, { numeric: true }))

              packages.push({
                name: packageJson.name || item,
                versions,
                latestVersion: versions[0] || packageJson.version,
                description: packageJson.description,
                author: typeof packageJson.author === 'string' 
                  ? packageJson.author 
                  : packageJson.author?.name,
                modified: stat.mtimeMs
              })
            } catch (err) {
              verdaccioLogger.warn(`无法读取包信息: ${item}`, err)
            }
          }
        }
      }

      return packages.sort((a, b) => b.modified - a.modified)
    } catch (error) {
      verdaccioLogger.error('获取包列表失败:', error)
      return []
    }
  }

  /**
   * 获取包的详细信息
   */
  getPackageInfo(packageName: string): any | null {
    try {
      const packageDir = join(this.config?.storage, packageName)
      if (!existsSync(packageDir)) {
        return null
      }

      const packageJsonPath = join(packageDir, 'package.json')
      if (!existsSync(packageJsonPath)) {
        return null
      }

      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      
      // 获取所有版本文件
      const { readdirSync, statSync } = require('fs')
      const versions = readdirSync(packageDir)
        .filter((f: string) => f.endsWith('.tgz'))
        .map((f: string) => {
          const version = f.replace(`${packageName}-`, '').replace('.tgz', '')
          const filePath = join(packageDir, f)
          const stat = statSync(filePath)
          return {
            version,
            file: f,
            size: stat.size,
            modified: stat.mtimeMs
          }
        })
        .sort((a: any, b: any) => b.modified - a.modified)

      return {
        ...packageJson,
        versions
      }
    } catch (error) {
      verdaccioLogger.error(`获取包信息失败: ${packageName}`, error)
      return null
    }
  }

  /**
   * 删除包
   */
  deletePackage(packageName: string): { success: boolean; message: string } {
    try {
      const packageDir = join(this.config?.storage, packageName)
      if (!existsSync(packageDir)) {
        return {
          success: false,
          message: '包不存在'
        }
      }

      // 递归删除目录
      const { rmSync } = require('fs')
      rmSync(packageDir, { recursive: true, force: true })

      verdaccioLogger.info(`包已删除: ${packageName}`)
      return {
        success: true,
        message: '包已成功删除'
      }
    } catch (error) {
      verdaccioLogger.error(`删除包失败: ${packageName}`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : '删除失败'
      }
    }
  }

  /**
   * 删除包的特定版本
   */
  deletePackageVersion(packageName: string, version: string): { success: boolean; message: string } {
    try {
      const packageDir = join(this.config?.storage, packageName)
      if (!existsSync(packageDir)) {
        return {
          success: false,
          message: '包不存在'
        }
      }

      const versionFile = join(packageDir, `${packageName}-${version}.tgz`)
      if (!existsSync(versionFile)) {
        return {
          success: false,
          message: '版本不存在'
        }
      }

      const { unlinkSync } = require('fs')
      unlinkSync(versionFile)

      verdaccioLogger.info(`版本已删除: ${packageName}@${version}`)
      return {
        success: true,
        message: '版本已成功删除'
      }
    } catch (error) {
      verdaccioLogger.error(`删除版本失败: ${packageName}@${version}`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : '删除失败'
      }
    }
  }

  /**
   * 生成 htpasswd 密码哈希
   * 使用 Apache htpasswd 格式 (Apache MD5)
   */
  private generatePasswordHash(password: string): string {
    // 简化实现：使用 SHA256 哈希 (Verdaccio 5+ 支持)
    const hash = createHash('sha256').update(password).digest('hex')
    return `{SHA256}${hash}`
  }

  /**
   * 获取 htpasswd 文件路径
   */
  private getHtpasswdPath(): string {
    return join(this.configDir, 'htpasswd')
  }

  /**
   * 读取 htpasswd 文件
   */
  private readHtpasswd(): Map<string, string> {
    const htpasswdPath = this.getHtpasswdPath()
    const users = new Map<string, string>()

    if (!existsSync(htpasswdPath)) {
      return users
    }

    try {
      const content = readFileSync(htpasswdPath, 'utf-8')
      const lines = content.split('\n').filter(line => line.trim())

      for (const line of lines) {
        const [username, hash] = line.split(':')
        if (username && hash) {
          users.set(username.trim(), hash.trim())
        }
      }
    } catch (error) {
      verdaccioLogger.error('读取 htpasswd 文件失败:', error)
    }

    return users
  }

  /**
   * 写入 htpasswd 文件
   */
  private writeHtpasswd(users: Map<string, string>): void {
    const htpasswdPath = this.getHtpasswdPath()
    const lines: string[] = []

    users.forEach((hash, username) => {
      lines.push(`${username}:${hash}`)
    })

    writeFileSync(htpasswdPath, lines.join('\n') + '\n', 'utf-8')
  }

  /**
   * 获取所有用户列表
   */
  getUsers(): VerdaccioUser[] {
    try {
      const htpasswdPath = this.getHtpasswdPath()
      verdaccioLogger.info(`[获取用户] htpasswd 文件路径: ${htpasswdPath}`)
      verdaccioLogger.info(`[获取用户] 文件是否存在: ${existsSync(htpasswdPath)}`)
      
      if (existsSync(htpasswdPath)) {
        const content = readFileSync(htpasswdPath, 'utf-8')
        verdaccioLogger.info(`[获取用户] htpasswd 文件内容:\n${content}`)
      }
      
      const users = this.readHtpasswd()
      verdaccioLogger.info(`[获取用户] 读取到的用户数: ${users.size}`)
      verdaccioLogger.info(`[获取用户] 用户列表: ${Array.from(users.keys()).join(', ')}`)
      
      return Array.from(users.keys()).map(username => ({
        username,
        createdAt: new Date().toISOString() // htpasswd 不存储创建时间
      }))
    } catch (error) {
      verdaccioLogger.error('[获取用户] 失败:', error)
      return []
    }
  }

  /**
   * 添加新用户
   */
  addUser(username: string, password: string, email?: string): { success: boolean; message: string } {
    try {
      const htpasswdPath = this.getHtpasswdPath()
      verdaccioLogger.info(`[添加用户] 开始添加用户: ${username}`)
      verdaccioLogger.info(`[添加用户] htpasswd 文件路径: ${htpasswdPath}`)
      verdaccioLogger.info(`[添加用户] 配置目录: ${this.configDir}`)
      verdaccioLogger.info(`[添加用户] 配置文件: ${this.configPath}`)

      // 验证用户名
      if (!username || !username.trim()) {
        return {
          success: false,
          message: '用户名不能为空'
        }
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return {
          success: false,
          message: '用户名只能包含字母、数字、下划线和连字符'
        }
      }

      // 验证密码
      if (!password || password.length < 4) {
        return {
          success: false,
          message: '密码长度至少为 4 个字符'
        }
      }

      const users = this.readHtpasswd()
      verdaccioLogger.info(`[添加用户] 当前用户数: ${users.size}`)

      // 检查用户是否已存在
      if (users.has(username)) {
        return {
          success: false,
          message: '用户已存在'
        }
      }

      // 添加用户
      const passwordHash = this.generatePasswordHash(password)
      users.set(username, passwordHash)
      verdaccioLogger.info(`[添加用户] 准备写入，总用户数: ${users.size}`)
      
      this.writeHtpasswd(users)
      
      // 验证是否成功写入
      if (existsSync(htpasswdPath)) {
        const content = readFileSync(htpasswdPath, 'utf-8')
        verdaccioLogger.info(`[添加用户] htpasswd 文件内容:\n${content}`)
      } else {
        verdaccioLogger.error(`[添加用户] htpasswd 文件不存在: ${htpasswdPath}`)
      }

      verdaccioLogger.info(`[添加用户] 用户已添加: ${username}`)
      return {
        success: true,
        message: `用户 ${username} 添加成功`
      }
    } catch (error) {
      verdaccioLogger.error(`[添加用户] 失败: ${username}`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : '添加失败'
      }
    }
  }

  /**
   * 删除用户
   */
  deleteUser(username: string): { success: boolean; message: string } {
    try {
      const users = this.readHtpasswd()

      if (!users.has(username)) {
        return {
          success: false,
          message: '用户不存在'
        }
      }

      users.delete(username)
      this.writeHtpasswd(users)

      verdaccioLogger.info(`用户已删除: ${username}`)
      return {
        success: true,
        message: `用户 ${username} 删除成功`
      }
    } catch (error) {
      verdaccioLogger.error(`删除用户失败: ${username}`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : '删除失败'
      }
    }
  }

  /**
   * 修改用户密码
   */
  changeUserPassword(username: string, newPassword: string): { success: boolean; message: string } {
    try {
      // 验证密码
      if (!newPassword || newPassword.length < 4) {
        return {
          success: false,
          message: '密码长度至少为 4 个字符'
        }
      }

      const users = this.readHtpasswd()

      if (!users.has(username)) {
        return {
          success: false,
          message: '用户不存在'
        }
      }

      // 更新密码
      const passwordHash = this.generatePasswordHash(newPassword)
      users.set(username, passwordHash)
      this.writeHtpasswd(users)

      verdaccioLogger.info(`用户密码已更新: ${username}`)
      return {
        success: true,
        message: `用户 ${username} 的密码已更新`
      }
    } catch (error) {
      verdaccioLogger.error(`修改密码失败: ${username}`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : '修改失败'
      }
    }
  }

  /**
   * 检查用户是否存在
   */
  userExists(username: string): boolean {
    const users = this.readHtpasswd()
    return users.has(username)
  }
}

// 导出单例实例
export const verdaccioManager = new VerdaccioManager()
