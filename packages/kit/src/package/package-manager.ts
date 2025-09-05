/**
 * NPM 包管理器
 */

import type {
  DependencyInfo,
  InstallOptions,
  PackageInfo,
  PackageJsonData,
  PackageManagerOptions,
  PackageManagerType,
} from '../types'
import { exec } from 'node:child_process'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { FileSystem } from '../filesystem'

const execAsync = promisify(exec)

/**
 * 包管理器
 */
export class PackageManager {
  private cwd: string
  private options: Required<PackageManagerOptions>
  private packageManager: PackageManagerType

  constructor(cwd: string = process.cwd(), options: PackageManagerOptions = {}) {
    this.cwd = cwd
    this.options = {
      timeout: options.timeout || 60000,
      encoding: options.encoding || 'utf8',
      maxBuffer: options.maxBuffer || 1024 * 1024 * 10, // 10MB
      registry: options.registry || 'https://registry.npmjs.org/',
      packageManager: options.packageManager || 'npm',
    }
    this.packageManager = options.packageManager ?? 'npm'
  }

  /**
   * 执行包管理器命令
   */
  private async exec(command: string): Promise<string> {
    try {
      const { stdout } = await execAsync(command, {
        cwd: this.cwd,
        timeout: this.options.timeout,
        encoding: this.options.encoding,
        maxBuffer: this.options.maxBuffer,
      })
      return stdout.trim()
    }
    catch (error: any) {
      throw new Error(`Package manager command failed: ${error.message}`)
    }
  }

  /**
   * 检测项目使用的包管理器
   */
  async detectPackageManager(): Promise<PackageManagerType> {
    const lockFiles = {
      'package-lock.json': 'npm' as const,
      'yarn.lock': 'yarn' as const,
      'pnpm-lock.yaml': 'pnpm' as const,
    }

    for (const [lockFile, manager] of Object.entries(lockFiles)) {
      if (await FileSystem.exists(join(this.cwd, lockFile))) {
        this.packageManager = manager
        return manager
      }
    }

    return 'npm'
  }

  /**
   * 读取 package.json
   */
  async readPackageJson(): Promise<PackageJsonData> {
    const packagePath = join(this.cwd, 'package.json')

    if (!(await FileSystem.exists(packagePath))) {
      throw new Error('package.json not found')
    }

    const content = await FileSystem.readFile(packagePath)
    return JSON.parse(content)
  }

  /**
   * 写入 package.json
   */
  async writePackageJson(packageJson: PackageJsonData): Promise<void> {
    const packagePath = join(this.cwd, 'package.json')
    const content = JSON.stringify(packageJson, null, 2)
    await FileSystem.writeFile(packagePath, content)
  }

  /**
   * 安装依赖
   */
  async install(packages?: string | string[], options: InstallOptions = {}): Promise<void> {
    let command = this.getInstallCommand()

    if (packages) {
      const packageList = Array.isArray(packages) ? packages : [packages]
      command += ` ${packageList.join(' ')}`

      if (options.dev) {
        command += this.getDevFlag()
      }

      if (options.global) {
        command += this.getGlobalFlag()
      }

      if (options.exact) {
        command += this.getExactFlag()
      }
    }

    if (this.options.registry) {
      command += ` --registry ${this.options.registry}`
    }

    await this.exec(command)
  }

  /**
   * 卸载依赖
   */
  async uninstall(packages: string | string[], options: { global?: boolean } = {}): Promise<void> {
    const packageList = Array.isArray(packages) ? packages : [packages]
    let command = this.getUninstallCommand()

    command += ` ${packageList.join(' ')}`

    if (options.global) {
      command += this.getGlobalFlag()
    }

    await this.exec(command)
  }

  /**
   * 更新依赖
   */
  async update(packages?: string | string[]): Promise<void> {
    let command = this.getUpdateCommand()

    if (packages) {
      const packageList = Array.isArray(packages) ? packages : [packages]
      command += ` ${packageList.join(' ')}`
    }

    await this.exec(command)
  }

  /**
   * 获取包信息
   */
  async getPackageInfo(packageName: string): Promise<PackageInfo> {
    const command = this.getInfoCommand(packageName)
    const output = await this.exec(command)

    try {
      const info = JSON.parse(output)
      return this.normalizePackageInfo(info)
    }
    catch {
      throw new Error(`Failed to parse package info for ${packageName}`)
    }
  }

  /**
   * 搜索包
   */
  async search(query: string, limit = 20): Promise<PackageInfo[]> {
    const command = this.getSearchCommand(query, limit)
    const output = await this.exec(command)

    try {
      const results = JSON.parse(output)
      return Array.isArray(results) ? results.map(info => this.normalizePackageInfo(info)) : []
    }
    catch {
      return []
    }
  }

  /**
   * 获取已安装的依赖
   */
  async getInstalledPackages(
    options: {
      depth?: number
      global?: boolean
    } = {},
  ): Promise<DependencyInfo[]> {
    let command = this.getListCommand()

    if (options.depth !== undefined) {
      command += ` --depth=${options.depth}`
    }

    if (options.global) {
      command += this.getGlobalFlag()
    }

    const output = await this.exec(command)

    try {
      const data = JSON.parse(output)
      return this.normalizeDependencyList(data)
    }
    catch {
      return []
    }
  }

  /**
   * 检查过时的依赖
   */
  async getOutdatedPackages(): Promise<
    Array<{
      name: string
      current: string
      wanted: string
      latest: string
    }>
  > {
    const command = this.getOutdatedCommand()

    try {
      const output = await this.exec(command)
      const data = JSON.parse(output)

      return Object.entries(data).map(([name, info]: [string, any]) => ({
        name,
        current: info.current,
        wanted: info.wanted,
        latest: info.latest,
      }))
    }
    catch {
      return []
    }
  }

  /**
   * 运行脚本
   */
  async runScript(scriptName: string, args: string[] = []): Promise<string> {
    const command = this.getRunCommand(scriptName, args)
    return await this.exec(command)
  }

  /**
   * 获取可用脚本
   */
  async getScripts(): Promise<Record<string, string>> {
    const packageJson = await this.readPackageJson()
    return packageJson.scripts || {}
  }

  /**
   * 清理缓存
   */
  async cleanCache(): Promise<void> {
    const command = this.getCacheCleanCommand()
    await this.exec(command)
  }

  /**
   * 获取缓存目录
   */
  async getCacheDir(): Promise<string> {
    const command = this.getCacheDirCommand()
    return await this.exec(command)
  }

  /**
   * 获取全局包目录
   */
  async getGlobalDir(): Promise<string> {
    const command = this.getGlobalDirCommand()
    return await this.exec(command)
  }

  /**
   * 获取安装命令
   */
  private getInstallCommand(): string {
    switch (this.packageManager) {
      case 'yarn':
        return 'yarn add'
      case 'pnpm':
        return 'pnpm add'
      default:
        return 'npm install'
    }
  }

  /**
   * 获取卸载命令
   */
  private getUninstallCommand(): string {
    switch (this.packageManager) {
      case 'yarn':
        return 'yarn remove'
      case 'pnpm':
        return 'pnpm remove'
      default:
        return 'npm uninstall'
    }
  }

  /**
   * 获取更新命令
   */
  private getUpdateCommand(): string {
    switch (this.packageManager) {
      case 'yarn':
        return 'yarn upgrade'
      case 'pnpm':
        return 'pnpm update'
      default:
        return 'npm update'
    }
  }

  /**
   * 获取信息命令
   */
  private getInfoCommand(packageName: string): string {
    switch (this.packageManager) {
      case 'yarn':
        return `yarn info ${packageName} --json`
      case 'pnpm':
        return `pnpm info ${packageName} --json`
      default:
        return `npm info ${packageName} --json`
    }
  }

  /**
   * 获取搜索命令
   */
  private getSearchCommand(query: string, limit: number): string {
    switch (this.packageManager) {
      case 'yarn':
        return `yarn search ${query} --json`
      case 'pnpm':
        return `pnpm search ${query} --json`
      default:
        return `npm search ${query} --json --searchlimit=${limit}`
    }
  }

  /**
   * 获取列表命令
   */
  private getListCommand(): string {
    switch (this.packageManager) {
      case 'yarn':
        return 'yarn list --json'
      case 'pnpm':
        return 'pnpm list --json'
      default:
        return 'npm list --json'
    }
  }

  /**
   * 获取过时包命令
   */
  private getOutdatedCommand(): string {
    switch (this.packageManager) {
      case 'yarn':
        return 'yarn outdated --json'
      case 'pnpm':
        return 'pnpm outdated --json'
      default:
        return 'npm outdated --json'
    }
  }

  /**
   * 获取运行命令
   */
  private getRunCommand(scriptName: string, args: string[]): string {
    const argsStr = args.length > 0 ? ` -- ${args.join(' ')}` : ''

    switch (this.packageManager) {
      case 'yarn':
        return `yarn ${scriptName}${argsStr}`
      case 'pnpm':
        return `pnpm ${scriptName}${argsStr}`
      default:
        return `npm run ${scriptName}${argsStr}`
    }
  }

  /**
   * 获取缓存清理命令
   */
  private getCacheCleanCommand(): string {
    switch (this.packageManager) {
      case 'yarn':
        return 'yarn cache clean'
      case 'pnpm':
        return 'pnpm store prune'
      default:
        return 'npm cache clean --force'
    }
  }

  /**
   * 获取缓存目录命令
   */
  private getCacheDirCommand(): string {
    switch (this.packageManager) {
      case 'yarn':
        return 'yarn cache dir'
      case 'pnpm':
        return 'pnpm store path'
      default:
        return 'npm config get cache'
    }
  }

  /**
   * 获取全局目录命令
   */
  private getGlobalDirCommand(): string {
    switch (this.packageManager) {
      case 'yarn':
        return 'yarn global dir'
      case 'pnpm':
        return 'pnpm root -g'
      default:
        return 'npm root -g'
    }
  }

  /**
   * 获取开发依赖标志
   */
  private getDevFlag(): string {
    switch (this.packageManager) {
      case 'yarn':
        return ' --dev'
      case 'pnpm':
        return ' --save-dev'
      default:
        return ' --save-dev'
    }
  }

  /**
   * 获取全局标志
   */
  private getGlobalFlag(): string {
    switch (this.packageManager) {
      case 'yarn':
        return ' --global'
      case 'pnpm':
        return ' --global'
      default:
        return ' --global'
    }
  }

  /**
   * 获取精确版本标志
   */
  private getExactFlag(): string {
    switch (this.packageManager) {
      case 'yarn':
        return ' --exact'
      case 'pnpm':
        return ' --save-exact'
      default:
        return ' --save-exact'
    }
  }

  /**
   * 标准化包信息
   */
  private normalizePackageInfo(info: any): PackageInfo {
    return {
      name: info.name,
      version: info.version,
      description: info.description,
      author: info.author,
      license: info.license,
      homepage: info.homepage,
      repository: info.repository,
      keywords: info.keywords || [],
      dependencies: info.dependencies || {},
      devDependencies: info.devDependencies || {},
      peerDependencies: info.peerDependencies || {},
    }
  }

  /**
   * 标准化依赖列表
   */
  private normalizeDependencyList(data: any): DependencyInfo[] {
    const dependencies: DependencyInfo[] = []

    if (data.dependencies) {
      for (const [name, info] of Object.entries(data.dependencies)) {
        dependencies.push({
          name,
          version: (info as any).version,
          resolved: (info as any).resolved,
          dependencies: (info as any).dependencies || {},
        })
      }
    }

    return dependencies
  }

  /**
   * 创建包管理器实例
   */
  static create(cwd?: string, options?: PackageManagerOptions): PackageManager {
    return new PackageManager(cwd, options)
  }
}
