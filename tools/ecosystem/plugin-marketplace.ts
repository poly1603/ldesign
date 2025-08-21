/**
 * LDesign 插件市场
 * 提供插件发现、安装、管理和社区贡献功能
 */

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import chalk from 'chalk'

export interface PluginMetadata {
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version: string
  /** 插件描述 */
  description: string
  /** 作者信息 */
  author: {
    name: string
    email?: string
    url?: string
  }
  /** 插件主页 */
  homepage?: string
  /** 仓库地址 */
  repository?: string
  /** 许可证 */
  license: string
  /** 关键词 */
  keywords: string[]
  /** 支持的 LDesign 版本 */
  ldesignVersion: string
  /** 插件依赖 */
  dependencies?: string[]
  /** 插件分类 */
  category: PluginCategory
  /** 下载统计 */
  downloads: {
    total: number
    weekly: number
    monthly: number
  }
  /** 评分 */
  rating: {
    average: number
    count: number
  }
  /** 发布时间 */
  publishedAt: string
  /** 更新时间 */
  updatedAt: string
  /** 是否官方插件 */
  official: boolean
  /** 插件状态 */
  status: 'active' | 'deprecated' | 'archived'
  /** 插件截图 */
  screenshots?: string[]
  /** 示例代码 */
  examples?: PluginExample[]
}

export interface PluginExample {
  title: string
  description: string
  code: string
  language: 'typescript' | 'javascript' | 'vue'
}

export type PluginCategory =
  | 'ui-components'
  | 'data-visualization'
  | 'form-controls'
  | 'navigation'
  | 'layout'
  | 'animation'
  | 'utilities'
  | 'integrations'
  | 'development-tools'
  | 'testing'
  | 'performance'
  | 'security'
  | 'analytics'
  | 'other'

export interface PluginSearchOptions {
  /** 搜索关键词 */
  query?: string
  /** 插件分类 */
  category?: PluginCategory
  /** 是否只显示官方插件 */
  officialOnly?: boolean
  /** 排序方式 */
  sortBy?: 'downloads' | 'rating' | 'updated' | 'name'
  /** 排序顺序 */
  sortOrder?: 'asc' | 'desc'
  /** 分页 */
  page?: number
  /** 每页数量 */
  limit?: number
}

export interface PluginSearchResult {
  plugins: PluginMetadata[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export class PluginMarketplace {
  private registryUrl: string
  private localRegistry: string
  private cacheDir: string

  constructor(
    options: {
      registryUrl?: string
      localRegistry?: string
      cacheDir?: string
    } = {},
  ) {
    this.registryUrl
      = options.registryUrl || 'https://registry.ldesign.com/plugins'
    this.localRegistry
      = options.localRegistry || resolve(process.cwd(), '.ldesign/registry.json')
    this.cacheDir = options.cacheDir || resolve(process.cwd(), '.ldesign/cache')

    this.ensureDirectories()
  }

  /**
   * 搜索插件
   */
  async searchPlugins(
    options: PluginSearchOptions = {},
  ): Promise<PluginSearchResult> {
    console.log(chalk.blue('🔍 搜索插件...'))

    try {
      // 从本地注册表搜索
      const localResults = await this.searchLocalPlugins(options)

      // 从远程注册表搜索
      const remoteResults = await this.searchRemotePlugins(options)

      // 合并结果
      const mergedResults = this.mergeSearchResults(localResults, remoteResults)

      console.log(chalk.green(`✅ 找到 ${mergedResults.total} 个插件`))
      return mergedResults
    }
    catch (error) {
      console.error(chalk.red('❌ 搜索插件失败:'), error)
      throw error
    }
  }

  /**
   * 获取插件详情
   */
  async getPluginDetails(name: string): Promise<PluginMetadata | null> {
    console.log(chalk.blue(`📦 获取插件详情: ${name}`))

    try {
      // 先从本地缓存查找
      const cached = await this.getCachedPlugin(name)
      if (cached) {
        return cached
      }

      // 从远程获取
      const remote = await this.fetchRemotePlugin(name)
      if (remote) {
        await this.cachePlugin(remote)
        return remote
      }

      return null
    }
    catch (error) {
      console.error(chalk.red(`❌ 获取插件详情失败: ${name}`), error)
      return null
    }
  }

  /**
   * 安装插件
   */
  async installPlugin(name: string, version?: string): Promise<boolean> {
    console.log(
      chalk.blue(`📥 安装插件: ${name}${version ? `@${version}` : ''}`),
    )

    try {
      // 获取插件详情
      const plugin = await this.getPluginDetails(name)
      if (!plugin) {
        throw new Error(`插件不存在: ${name}`)
      }

      // 检查版本兼容性
      if (!this.isVersionCompatible(plugin.ldesignVersion)) {
        throw new Error(`插件 ${name} 不兼容当前 LDesign 版本`)
      }

      // 安装依赖
      if (plugin.dependencies) {
        for (const dep of plugin.dependencies) {
          await this.installPlugin(dep)
        }
      }

      // 使用 npm/pnpm 安装
      const packageManager = this.detectPackageManager()
      const installCommand = `${packageManager} add ${name}${
        version ? `@${version}` : ''
      }`

      execSync(installCommand, { stdio: 'inherit' })

      // 更新本地注册表
      await this.updateLocalRegistry(plugin)

      console.log(chalk.green(`✅ 插件 ${name} 安装成功`))
      return true
    }
    catch (error) {
      console.error(chalk.red(`❌ 安装插件失败: ${name}`), error)
      return false
    }
  }

  /**
   * 卸载插件
   */
  async uninstallPlugin(name: string): Promise<boolean> {
    console.log(chalk.blue(`🗑️ 卸载插件: ${name}`))

    try {
      // 检查依赖关系
      const dependents = await this.findDependents(name)
      if (dependents.length > 0) {
        console.warn(chalk.yellow(`⚠️ 以下插件依赖 ${name}:`))
        dependents.forEach(dep => console.log(chalk.yellow(`  - ${dep}`)))

        const confirm = await this.confirmUninstall(name, dependents)
        if (!confirm) {
          console.log(chalk.gray('取消卸载'))
          return false
        }
      }

      // 使用 npm/pnpm 卸载
      const packageManager = this.detectPackageManager()
      const uninstallCommand = `${packageManager} remove ${name}`

      execSync(uninstallCommand, { stdio: 'inherit' })

      // 从本地注册表移除
      await this.removeFromLocalRegistry(name)

      console.log(chalk.green(`✅ 插件 ${name} 卸载成功`))
      return true
    }
    catch (error) {
      console.error(chalk.red(`❌ 卸载插件失败: ${name}`), error)
      return false
    }
  }

  /**
   * 列出已安装的插件
   */
  async listInstalledPlugins(): Promise<PluginMetadata[]> {
    try {
      const registry = await this.loadLocalRegistry()
      return Object.values(registry.installed || {})
    }
    catch (error) {
      console.error(chalk.red('❌ 获取已安装插件列表失败:'), error)
      return []
    }
  }

  /**
   * 更新插件
   */
  async updatePlugin(name: string): Promise<boolean> {
    console.log(chalk.blue(`🔄 更新插件: ${name}`))

    try {
      // 获取最新版本信息
      const latest = await this.getPluginDetails(name)
      if (!latest) {
        throw new Error(`插件不存在: ${name}`)
      }

      // 检查是否需要更新
      const installed = await this.getInstalledVersion(name)
      if (!installed) {
        throw new Error(`插件未安装: ${name}`)
      }

      if (this.compareVersions(latest.version, installed) <= 0) {
        console.log(chalk.gray(`插件 ${name} 已是最新版本`))
        return true
      }

      // 执行更新
      const packageManager = this.detectPackageManager()
      const updateCommand = `${packageManager} update ${name}`

      execSync(updateCommand, { stdio: 'inherit' })

      // 更新本地注册表
      await this.updateLocalRegistry(latest)

      console.log(
        chalk.green(
          `✅ 插件 ${name} 更新成功: ${installed} → ${latest.version}`,
        ),
      )
      return true
    }
    catch (error) {
      console.error(chalk.red(`❌ 更新插件失败: ${name}`), error)
      return false
    }
  }

  /**
   * 发布插件
   */
  async publishPlugin(pluginPath: string): Promise<boolean> {
    console.log(chalk.blue('📤 发布插件...'))

    try {
      // 验证插件结构
      const isValid = await this.validatePluginStructure(pluginPath)
      if (!isValid) {
        throw new Error('插件结构验证失败')
      }

      // 生成插件元数据
      const metadata = await this.generatePluginMetadata(pluginPath)

      // 构建插件
      await this.buildPlugin(pluginPath)

      // 发布到 npm
      const packageManager = this.detectPackageManager()
      execSync(`${packageManager} publish`, {
        cwd: pluginPath,
        stdio: 'inherit',
      })

      // 提交到插件注册表
      await this.submitToRegistry(metadata)

      console.log(chalk.green(`✅ 插件 ${metadata.name} 发布成功`))
      return true
    }
    catch (error) {
      console.error(chalk.red('❌ 发布插件失败:'), error)
      return false
    }
  }

  /**
   * 确保目录存在
   */
  private ensureDirectories(): void {
    const dirs = [this.cacheDir, resolve(this.localRegistry, '..')]

    dirs.forEach((dir) => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
    })
  }

  /**
   * 搜索本地插件
   */
  private async searchLocalPlugins(
    options: PluginSearchOptions,
  ): Promise<PluginSearchResult> {
    const registry = await this.loadLocalRegistry()
    let plugins = Object.values(registry.plugins || {}) as PluginMetadata[]

    // 应用过滤器
    if (options.query) {
      const query = options.query.toLowerCase()
      plugins = plugins.filter(
        plugin =>
          plugin.name.toLowerCase().includes(query)
          || plugin.description.toLowerCase().includes(query)
          || plugin.keywords.some(keyword => keyword.toLowerCase().includes(query)),
      )
    }

    if (options.category) {
      plugins = plugins.filter(plugin => plugin.category === options.category)
    }

    if (options.officialOnly) {
      plugins = plugins.filter(plugin => plugin.official)
    }

    // 排序
    plugins = this.sortPlugins(plugins, options.sortBy, options.sortOrder)

    // 分页
    const page = options.page || 1
    const limit = options.limit || 20
    const start = (page - 1) * limit
    const end = start + limit

    return {
      plugins: plugins.slice(start, end),
      total: plugins.length,
      page,
      limit,
      hasMore: end < plugins.length,
    }
  }

  /**
   * 搜索远程插件
   */
  private async searchRemotePlugins(
    options: PluginSearchOptions,
  ): Promise<PluginSearchResult> {
    try {
      // 模拟远程 API 调用
      // 实际实现中应该调用真实的 API
      return {
        plugins: [],
        total: 0,
        page: options.page || 1,
        limit: options.limit || 20,
        hasMore: false,
      }
    }
    catch (error) {
      console.warn(chalk.yellow('⚠️ 无法连接到远程注册表'))
      return {
        plugins: [],
        total: 0,
        page: options.page || 1,
        limit: options.limit || 20,
        hasMore: false,
      }
    }
  }

  /**
   * 合并搜索结果
   */
  private mergeSearchResults(
    local: PluginSearchResult,
    remote: PluginSearchResult,
  ): PluginSearchResult {
    const pluginMap = new Map<string, PluginMetadata>()

    // 添加本地插件
    local.plugins.forEach((plugin) => {
      pluginMap.set(plugin.name, plugin)
    })

    // 添加远程插件（如果本地没有或版本更新）
    remote.plugins.forEach((plugin) => {
      const existing = pluginMap.get(plugin.name)
      if (
        !existing
        || this.compareVersions(plugin.version, existing.version) > 0
      ) {
        pluginMap.set(plugin.name, plugin)
      }
    })

    const plugins = Array.from(pluginMap.values())

    return {
      plugins,
      total: plugins.length,
      page: local.page,
      limit: local.limit,
      hasMore: plugins.length >= local.limit,
    }
  }

  /**
   * 排序插件
   */
  private sortPlugins(
    plugins: PluginMetadata[],
    sortBy: PluginSearchOptions['sortBy'] = 'downloads',
    sortOrder: PluginSearchOptions['sortOrder'] = 'desc',
  ): PluginMetadata[] {
    return plugins.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'downloads':
          comparison = a.downloads.total - b.downloads.total
          break
        case 'rating':
          comparison = a.rating.average - b.rating.average
          break
        case 'updated':
          comparison
            = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })
  }

  /**
   * 加载本地注册表
   */
  private async loadLocalRegistry(): Promise<any> {
    try {
      if (existsSync(this.localRegistry)) {
        const content = readFileSync(this.localRegistry, 'utf-8')
        return JSON.parse(content)
      }
    }
    catch (error) {
      console.warn(chalk.yellow('⚠️ 无法加载本地注册表'))
    }

    return { plugins: {}, installed: {} }
  }

  /**
   * 保存本地注册表
   */
  private async saveLocalRegistry(registry: any): Promise<void> {
    try {
      writeFileSync(this.localRegistry, JSON.stringify(registry, null, 2))
    }
    catch (error) {
      console.error(chalk.red('❌ 保存本地注册表失败:'), error)
    }
  }

  /**
   * 检测包管理器
   */
  private detectPackageManager(): string {
    if (existsSync('pnpm-lock.yaml'))
      return 'pnpm'
    if (existsSync('yarn.lock'))
      return 'yarn'
    return 'npm'
  }

  /**
   * 比较版本号
   */
  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number)
    const v2Parts = version2.split('.').map(Number)

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0
      const v2Part = v2Parts[i] || 0

      if (v1Part > v2Part)
        return 1
      if (v1Part < v2Part)
        return -1
    }

    return 0
  }

  /**
   * 检查版本兼容性
   */
  private isVersionCompatible(requiredVersion: string): boolean {
    // 简化的版本兼容性检查
    // 实际实现中应该使用 semver 库
    return true
  }

  /**
   * 获取缓存的插件
   */
  private async getCachedPlugin(name: string): Promise<PluginMetadata | null> {
    try {
      const cachePath = join(this.cacheDir, `${name}.json`)
      if (existsSync(cachePath)) {
        const content = readFileSync(cachePath, 'utf-8')
        return JSON.parse(content)
      }
    }
    catch (error) {
      console.warn(chalk.yellow(`⚠️ 无法加载缓存的插件: ${name}`))
    }
    return null
  }

  /**
   * 缓存插件
   */
  private async cachePlugin(plugin: PluginMetadata): Promise<void> {
    try {
      const cachePath = join(this.cacheDir, `${plugin.name}.json`)
      writeFileSync(cachePath, JSON.stringify(plugin, null, 2))
    }
    catch (error) {
      console.warn(chalk.yellow(`⚠️ 无法缓存插件: ${plugin.name}`))
    }
  }

  /**
   * 从远程获取插件
   */
  private async fetchRemotePlugin(
    name: string,
  ): Promise<PluginMetadata | null> {
    try {
      // 模拟远程 API 调用
      // 实际实现中应该调用真实的 API
      return null
    }
    catch (error) {
      console.warn(chalk.yellow(`⚠️ 无法从远程获取插件: ${name}`))
      return null
    }
  }

  /**
   * 更新本地注册表
   */
  private async updateLocalRegistry(plugin: PluginMetadata): Promise<void> {
    const registry = await this.loadLocalRegistry()

    if (!registry.installed) {
      registry.installed = {}
    }

    registry.installed[plugin.name] = plugin
    await this.saveLocalRegistry(registry)
  }

  /**
   * 从本地注册表移除
   */
  private async removeFromLocalRegistry(name: string): Promise<void> {
    const registry = await this.loadLocalRegistry()

    if (registry.installed && registry.installed[name]) {
      delete registry.installed[name]
      await this.saveLocalRegistry(registry)
    }
  }

  /**
   * 查找依赖此插件的其他插件
   */
  private async findDependents(name: string): Promise<string[]> {
    const installed = await this.listInstalledPlugins()
    return installed
      .filter(plugin => plugin.dependencies?.includes(name))
      .map(plugin => plugin.name)
  }

  /**
   * 确认卸载
   */
  private async confirmUninstall(
    name: string,
    dependents: string[],
  ): Promise<boolean> {
    // 在实际实现中，这里应该提示用户确认
    // 现在简单返回 false
    return false
  }

  /**
   * 获取已安装版本
   */
  private async getInstalledVersion(name: string): Promise<string | null> {
    const installed = await this.listInstalledPlugins()
    const plugin = installed.find(p => p.name === name)
    return plugin?.version || null
  }

  /**
   * 验证插件结构
   */
  private async validatePluginStructure(pluginPath: string): Promise<boolean> {
    // 检查必需文件
    const requiredFiles = ['package.json', 'src/index.ts']

    for (const file of requiredFiles) {
      if (!existsSync(join(pluginPath, file))) {
        console.error(chalk.red(`❌ 缺少必需文件: ${file}`))
        return false
      }
    }

    return true
  }

  /**
   * 生成插件元数据
   */
  private async generatePluginMetadata(
    pluginPath: string,
  ): Promise<PluginMetadata> {
    const packageJsonPath = join(pluginPath, 'package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

    return {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description || '',
      author: packageJson.author || { name: 'Unknown' },
      homepage: packageJson.homepage,
      repository: packageJson.repository?.url,
      license: packageJson.license || 'MIT',
      keywords: packageJson.keywords || [],
      ldesignVersion: packageJson.peerDependencies?.['@ldesign/engine'] || '*',
      dependencies: packageJson.ldesign?.dependencies,
      category: packageJson.ldesign?.category || 'other',
      downloads: { total: 0, weekly: 0, monthly: 0 },
      rating: { average: 0, count: 0 },
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      official: false,
      status: 'active',
    } as PluginMetadata
  }

  /**
   * 构建插件
   */
  private async buildPlugin(pluginPath: string): Promise<void> {
    console.log(chalk.blue('🔨 构建插件...'))

    try {
      execSync('pnpm build', {
        cwd: pluginPath,
        stdio: 'inherit',
      })

      console.log(chalk.green('✅ 插件构建成功'))
    }
    catch (error) {
      console.error(chalk.red('❌ 插件构建失败:'), error)
      throw error
    }
  }

  /**
   * 提交到注册表
   */
  private async submitToRegistry(metadata: PluginMetadata): Promise<void> {
    console.log(chalk.blue('📤 提交到插件注册表...'))

    try {
      // 模拟提交到远程注册表
      // 实际实现中应该调用真实的 API
      console.log(chalk.green('✅ 提交到注册表成功'))
    }
    catch (error) {
      console.error(chalk.red('❌ 提交到注册表失败:'), error)
      throw error
    }
  }
}

export function createPluginMarketplace(options?: {
  registryUrl?: string
  localRegistry?: string
  cacheDir?: string
}): PluginMarketplace {
  return new PluginMarketplace(options)
}
