/**
 * 插件系统核心模块
 * 提供插件加载、管理、生命周期控制等功能
 */

import { Git } from '../index.js'
import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import Table from 'cli-table3'
import * as fs from 'fs/promises'
import * as fsSync from 'fs'
import * as path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { EventEmitter } from 'events'
import semver from 'semver'

const execAsync = promisify(exec)

// ========== 插件接口定义 ==========

export interface PluginManifest {
  name: string
  version: string
  description: string
  author: string | { name: string; email?: string }
  main: string
  repository?: string
  homepage?: string
  keywords?: string[]
  engines?: {
    node?: string
    lgit?: string
  }
  dependencies?: Record<string, string>
  permissions?: PluginPermission[]
  commands?: PluginCommand[]
  hooks?: PluginHook[]
  config?: PluginConfig
  api?: PluginApiDefinition
}

export interface PluginPermission {
  resource: 'filesystem' | 'network' | 'git' | 'shell' | 'env'
  actions: string[]
  reason?: string
}

export interface PluginCommand {
  name: string
  description: string
  alias?: string[]
  options?: CommandOption[]
  handler: string // 处理函数名称
}

export interface CommandOption {
  name: string
  description: string
  type: 'string' | 'boolean' | 'number' | 'array'
  required?: boolean
  default?: any
  alias?: string
}

export interface PluginHook {
  event: string
  handler: string
  priority?: number
}

export interface PluginConfig {
  schema?: Record<string, any>
  defaults?: Record<string, any>
  ui?: {
    configurable?: boolean
    categories?: ConfigCategory[]
  }
}

export interface ConfigCategory {
  name: string
  title: string
  fields: string[]
}

export interface PluginApiDefinition {
  version: string
  methods: ApiMethod[]
}

export interface ApiMethod {
  name: string
  description: string
  parameters?: ApiParameter[]
  returns?: string
  async?: boolean
}

export interface ApiParameter {
  name: string
  type: string
  required?: boolean
  description?: string
}

export interface Plugin {
  manifest: PluginManifest
  instance: PluginInstance
  status: 'loaded' | 'active' | 'inactive' | 'error'
  path: string
  loadTime: Date
  errors?: string[]
}

export interface PluginInstance {
  onLoad?: () => Promise<void>
  onUnload?: () => Promise<void>
  onActivate?: () => Promise<void>
  onDeactivate?: () => Promise<void>
  execute?: (command: string, args: any) => Promise<any>
  [key: string]: any
}

export interface PluginContext {
  git: Git
  logger: Logger
  storage: Storage
  events: EventEmitter
  api: PluginAPI
  config: any
}

export interface Logger {
  info: (message: string) => void
  warn: (message: string) => void
  error: (message: string) => void
  debug: (message: string) => void
}

export interface Storage {
  get: (key: string) => Promise<any>
  set: (key: string, value: any) => Promise<void>
  delete: (key: string) => Promise<void>
  clear: () => Promise<void>
}

export interface PluginAPI {
  registerCommand: (command: PluginCommand) => void
  registerHook: (hook: PluginHook) => void
  executeGitCommand: (command: string) => Promise<any>
  showNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
  promptUser: (questions: any[]) => Promise<any>
  getPluginConfig: (pluginName: string) => any
  setPluginConfig: (pluginName: string, config: any) => Promise<void>
  callPlugin: (pluginName: string, method: string, ...args: any[]) => Promise<any>
}

// ========== 插件系统实现 ==========

export class PluginSystem {
  private git: Git
  private plugins: Map<string, Plugin> = new Map()
  private hooks: Map<string, Array<{ plugin: string; handler: string; priority: number }>> = new Map()
  private commands: Map<string, { plugin: string; command: PluginCommand }> = new Map()
  private events: EventEmitter = new EventEmitter()
  private pluginDir: string
  private configDir: string
  private spinner?: ora.Ora

  constructor(git: Git) {
    this.git = git
    this.pluginDir = path.join(process.env.HOME || process.env.USERPROFILE || '', '.lgit', 'plugins')
    this.configDir = path.join(process.env.HOME || process.env.USERPROFILE || '', '.lgit', 'config')
    this.setupEventHandlers()
  }

  /**
   * 初始化插件系统
   */
  async initialize(): Promise<void> {
    console.log(chalk.cyan('🔌 初始化插件系统...'))
    
    // 创建必要的目录
    await this.ensureDirectories()
    
    // 加载已安装的插件
    await this.loadInstalledPlugins()
    
    // 激活自动启动的插件
    await this.activateAutoStartPlugins()
    
    console.log(chalk.green('✅ 插件系统初始化完成'))
  }

  /**
   * 插件管理主菜单
   */
  async managePlugins(): Promise<void> {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择插件操作:',
        choices: [
          { name: '📦 安装插件', value: 'install' },
          { name: '📋 查看已安装插件', value: 'list' },
          { name: '🔍 搜索插件', value: 'search' },
          { name: '⚡ 激活/停用插件', value: 'toggle' },
          { name: '⚙️ 配置插件', value: 'config' },
          { name: '🗑️ 卸载插件', value: 'uninstall' },
          { name: '🔄 更新插件', value: 'update' },
          { name: '🛠️ 创建插件', value: 'create' },
          { name: '📊 插件统计', value: 'stats' }
        ]
      }
    ])

    switch (action) {
      case 'install':
        await this.installPluginInteractive()
        break
      case 'list':
        await this.listPlugins()
        break
      case 'search':
        await this.searchPlugins()
        break
      case 'toggle':
        await this.togglePlugin()
        break
      case 'config':
        await this.configurePlugin()
        break
      case 'uninstall':
        await this.uninstallPluginInteractive()
        break
      case 'update':
        await this.updatePlugins()
        break
      case 'create':
        await this.createPluginScaffold()
        break
      case 'stats':
        await this.showPluginStats()
        break
    }
  }

  /**
   * 安装插件
   */
  async installPlugin(source: string): Promise<void> {
    this.spinner = ora(`安装插件: ${source}`).start()

    try {
      let pluginPath: string

      // 判断安装源类型
      if (source.startsWith('http://') || source.startsWith('https://')) {
        // 从 URL 安装
        pluginPath = await this.downloadPlugin(source)
      } else if (source.startsWith('npm:')) {
        // 从 npm 安装
        const packageName = source.replace('npm:', '')
        pluginPath = await this.installFromNpm(packageName)
      } else if (source.startsWith('github:')) {
        // 从 GitHub 安装
        const repo = source.replace('github:', '')
        pluginPath = await this.installFromGitHub(repo)
      } else {
        // 本地路径安装
        pluginPath = path.resolve(source)
      }

      // 验证插件
      const manifest = await this.validatePlugin(pluginPath)
      
      // 检查依赖
      await this.checkDependencies(manifest)
      
      // 检查权限
      await this.checkPermissions(manifest)
      
      // 复制到插件目录
      const targetPath = path.join(this.pluginDir, manifest.name)
      await this.copyPlugin(pluginPath, targetPath)
      
      // 加载插件
      await this.loadPlugin(targetPath)
      
      this.spinner.succeed(`插件 ${chalk.green(manifest.name)} 安装成功！`)
      
      // 询问是否激活
      const { activate } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'activate',
          message: '是否立即激活插件？',
          default: true
        }
      ])
      
      if (activate) {
        await this.activatePlugin(manifest.name)
      }
      
    } catch (error) {
      this.spinner.fail('插件安装失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 加载插件
   */
  private async loadPlugin(pluginPath: string): Promise<void> {
    const manifestPath = path.join(pluginPath, 'plugin.json')
    const manifestContent = await fs.readFile(manifestPath, 'utf-8')
    const manifest: PluginManifest = JSON.parse(manifestContent)

    // 动态导入插件主文件
    const mainPath = path.join(pluginPath, manifest.main)
    const pluginModule = await import(`file://${mainPath}`)

    // 创建插件上下文
    const context = this.createPluginContext(manifest.name)

    // 创建插件实例
    const instance: PluginInstance = new pluginModule.default(context)

    // 注册插件
    const plugin: Plugin = {
      manifest,
      instance,
      status: 'loaded',
      path: pluginPath,
      loadTime: new Date()
    }

    this.plugins.set(manifest.name, plugin)

    // 调用加载钩子
    if (instance.onLoad) {
      await instance.onLoad()
    }

    // 注册命令
    if (manifest.commands) {
      for (const command of manifest.commands) {
        this.registerCommand(manifest.name, command)
      }
    }

    // 注册钩子
    if (manifest.hooks) {
      for (const hook of manifest.hooks) {
        this.registerHook(manifest.name, hook)
      }
    }
  }

  /**
   * 激活插件
   */
  async activatePlugin(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      throw new Error(`插件 ${pluginName} 未找到`)
    }

    if (plugin.status === 'active') {
      console.log(chalk.yellow(`插件 ${pluginName} 已经激活`))
      return
    }

    // 调用激活钩子
    if (plugin.instance.onActivate) {
      await plugin.instance.onActivate()
    }

    plugin.status = 'active'
    
    // 触发激活事件
    this.events.emit('plugin:activated', { plugin: pluginName })
    
    console.log(chalk.green(`✅ 插件 ${pluginName} 已激活`))
  }

  /**
   * 停用插件
   */
  async deactivatePlugin(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      throw new Error(`插件 ${pluginName} 未找到`)
    }

    if (plugin.status === 'inactive') {
      console.log(chalk.yellow(`插件 ${pluginName} 已经停用`))
      return
    }

    // 调用停用钩子
    if (plugin.instance.onDeactivate) {
      await plugin.instance.onDeactivate()
    }

    plugin.status = 'inactive'
    
    // 触发停用事件
    this.events.emit('plugin:deactivated', { plugin: pluginName })
    
    console.log(chalk.yellow(`⏸️ 插件 ${pluginName} 已停用`))
  }

  /**
   * 卸载插件
   */
  async uninstallPlugin(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      throw new Error(`插件 ${pluginName} 未找到`)
    }

    // 停用插件
    if (plugin.status === 'active') {
      await this.deactivatePlugin(pluginName)
    }

    // 调用卸载钩子
    if (plugin.instance.onUnload) {
      await plugin.instance.onUnload()
    }

    // 移除命令注册
    for (const [cmdName, cmd] of this.commands.entries()) {
      if (cmd.plugin === pluginName) {
        this.commands.delete(cmdName)
      }
    }

    // 移除钩子注册
    for (const [event, hooks] of this.hooks.entries()) {
      const filtered = hooks.filter(h => h.plugin !== pluginName)
      if (filtered.length > 0) {
        this.hooks.set(event, filtered)
      } else {
        this.hooks.delete(event)
      }
    }

    // 删除插件文件
    await fs.rm(plugin.path, { recursive: true, force: true })

    // 从注册表移除
    this.plugins.delete(pluginName)

    console.log(chalk.green(`✅ 插件 ${pluginName} 已卸载`))
  }

  /**
   * 执行插件命令
   */
  async executeCommand(commandName: string, args: any): Promise<any> {
    const command = this.commands.get(commandName)
    if (!command) {
      throw new Error(`命令 ${commandName} 未找到`)
    }

    const plugin = this.plugins.get(command.plugin)
    if (!plugin) {
      throw new Error(`插件 ${command.plugin} 未找到`)
    }

    if (plugin.status !== 'active') {
      throw new Error(`插件 ${command.plugin} 未激活`)
    }

    // 执行命令处理器
    const handler = plugin.instance[command.command.handler]
    if (!handler) {
      throw new Error(`处理器 ${command.command.handler} 未找到`)
    }

    return await handler.call(plugin.instance, args)
  }

  /**
   * 触发钩子
   */
  async triggerHook(event: string, data?: any): Promise<void> {
    const hooks = this.hooks.get(event)
    if (!hooks || hooks.length === 0) return

    // 按优先级排序
    const sorted = hooks.sort((a, b) => (b.priority || 0) - (a.priority || 0))

    for (const hook of sorted) {
      const plugin = this.plugins.get(hook.plugin)
      if (!plugin || plugin.status !== 'active') continue

      const handler = plugin.instance[hook.handler]
      if (!handler) continue

      try {
        await handler.call(plugin.instance, data)
      } catch (error) {
        console.error(chalk.red(`钩子执行失败 (${hook.plugin}:${event}):`), error)
      }
    }
  }

  /**
   * 列出已安装的插件
   */
  private async listPlugins(): Promise<void> {
    console.log(chalk.cyan('\n📦 已安装的插件\n'))

    if (this.plugins.size === 0) {
      console.log(chalk.yellow('没有安装任何插件'))
      console.log(chalk.gray('使用 "lgit plugin install" 安装插件'))
      return
    }

    const table = new Table({
      head: [
        chalk.cyan('名称'),
        chalk.cyan('版本'),
        chalk.cyan('状态'),
        chalk.cyan('作者'),
        chalk.cyan('描述')
      ],
      style: {
        head: [],
        border: ['gray']
      },
      colWidths: [20, 10, 10, 20, 40]
    })

    for (const [name, plugin] of this.plugins) {
      const status = this.getStatusBadge(plugin.status)
      const author = typeof plugin.manifest.author === 'string' 
        ? plugin.manifest.author 
        : plugin.manifest.author.name

      table.push([
        name,
        plugin.manifest.version,
        status,
        author,
        plugin.manifest.description.substring(0, 38)
      ])
    }

    console.log(table.toString())

    // 显示统计
    const activeCount = Array.from(this.plugins.values()).filter(p => p.status === 'active').length
    console.log(chalk.cyan('\n📊 统计:'))
    console.log(`  总计: ${chalk.yellow(this.plugins.size)} 个插件`)
    console.log(`  激活: ${chalk.green(activeCount)} 个`)
    console.log(`  停用: ${chalk.gray(this.plugins.size - activeCount)} 个`)
  }

  /**
   * 搜索插件
   */
  private async searchPlugins(): Promise<void> {
    const { keyword } = await inquirer.prompt([
      {
        type: 'input',
        name: 'keyword',
        message: '输入搜索关键词:',
        validate: input => input.length > 0 || '请输入关键词'
      }
    ])

    this.spinner = ora('搜索插件...').start()

    try {
      // 模拟搜索结果（实际应该从插件仓库 API 获取）
      const results = await this.searchPluginRepository(keyword)
      this.spinner.stop()

      if (results.length === 0) {
        console.log(chalk.yellow('没有找到相关插件'))
        return
      }

      console.log(chalk.cyan(`\n🔍 搜索结果 (${results.length} 个)\n`))

      const table = new Table({
        head: [
          chalk.cyan('名称'),
          chalk.cyan('版本'),
          chalk.cyan('下载量'),
          chalk.cyan('评分'),
          chalk.cyan('描述')
        ],
        style: {
          head: [],
          border: ['gray']
        }
      })

      results.forEach(plugin => {
        table.push([
          plugin.name,
          plugin.version,
          plugin.downloads.toLocaleString(),
          `⭐ ${plugin.rating}`,
          plugin.description.substring(0, 40)
        ])
      })

      console.log(table.toString())

      // 选择安装
      const { selected } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selected',
          message: '选择要安装的插件:',
          choices: [
            ...results.map(p => ({ name: p.name, value: p.name })),
            { name: '取消', value: null }
          ]
        }
      ])

      if (selected) {
        await this.installPlugin(`npm:${selected}`)
      }

    } catch (error) {
      this.spinner.fail('搜索失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 创建插件脚手架
   */
  private async createPluginScaffold(): Promise<void> {
    console.log(chalk.cyan('\n🛠️ 创建新插件\n'))

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '插件名称:',
        validate: input => /^[a-z0-9-]+$/.test(input) || '名称只能包含小写字母、数字和连字符'
      },
      {
        type: 'input',
        name: 'version',
        message: '版本号:',
        default: '1.0.0',
        validate: input => semver.valid(input) !== null || '请输入有效的版本号'
      },
      {
        type: 'input',
        name: 'description',
        message: '插件描述:',
        validate: input => input.length > 0 || '请输入描述'
      },
      {
        type: 'input',
        name: 'author',
        message: '作者名称:',
        default: 'Anonymous'
      },
      {
        type: 'input',
        name: 'email',
        message: '作者邮箱:'
      },
      {
        type: 'checkbox',
        name: 'features',
        message: '选择插件功能:',
        choices: [
          { name: '添加命令', value: 'commands' },
          { name: '钩子集成', value: 'hooks' },
          { name: '配置项', value: 'config' },
          { name: 'API 接口', value: 'api' },
          { name: '存储功能', value: 'storage' }
        ]
      },
      {
        type: 'input',
        name: 'outputDir',
        message: '输出目录:',
        default: './my-lgit-plugin'
      }
    ])

    const outputPath = path.resolve(answers.outputDir)
    
    this.spinner = ora('生成插件模板...').start()

    try {
      // 创建目录结构
      await fs.mkdir(outputPath, { recursive: true })
      await fs.mkdir(path.join(outputPath, 'src'), { recursive: true })
      await fs.mkdir(path.join(outputPath, 'test'), { recursive: true })

      // 生成 plugin.json
      const manifest: PluginManifest = {
        name: answers.name,
        version: answers.version,
        description: answers.description,
        author: answers.email 
          ? { name: answers.author, email: answers.email }
          : answers.author,
        main: 'dist/index.js',
        keywords: ['lgit-plugin'],
        engines: {
          node: '>=14.0.0',
          lgit: '>=1.0.0'
        }
      }

      // 添加功能配置
      if (answers.features.includes('commands')) {
        manifest.commands = [
          {
            name: 'example',
            description: 'Example command',
            handler: 'handleExample'
          }
        ]
      }

      if (answers.features.includes('hooks')) {
        manifest.hooks = [
          {
            event: 'pre-commit',
            handler: 'onPreCommit',
            priority: 10
          }
        ]
      }

      if (answers.features.includes('config')) {
        manifest.config = {
          defaults: {
            enabled: true,
            setting: 'default'
          },
          ui: {
            configurable: true
          }
        }
      }

      await fs.writeFile(
        path.join(outputPath, 'plugin.json'),
        JSON.stringify(manifest, null, 2)
      )

      // 生成主文件
      const mainContent = this.generatePluginMainFile(answers.name, answers.features)
      await fs.writeFile(path.join(outputPath, 'src', 'index.ts'), mainContent)

      // 生成 package.json
      const packageJson = {
        name: `lgit-plugin-${answers.name}`,
        version: answers.version,
        description: answers.description,
        main: 'dist/index.js',
        scripts: {
          build: 'tsc',
          test: 'jest',
          lint: 'eslint src/**/*.ts'
        },
        keywords: ['lgit', 'plugin', 'git'],
        author: answers.email 
          ? `${answers.author} <${answers.email}>`
          : answers.author,
        license: 'MIT',
        devDependencies: {
          '@types/node': '^18.0.0',
          'typescript': '^5.0.0',
          'jest': '^29.0.0',
          'eslint': '^8.0.0'
        }
      }

      await fs.writeFile(
        path.join(outputPath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      )

      // 生成 TypeScript 配置
      const tsConfig = {
        compilerOptions: {
          target: 'ES2020',
          module: 'ES2020',
          moduleResolution: 'node',
          lib: ['ES2020'],
          outDir: './dist',
          rootDir: './src',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          declaration: true,
          declarationMap: true,
          sourceMap: true
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist']
      }

      await fs.writeFile(
        path.join(outputPath, 'tsconfig.json'),
        JSON.stringify(tsConfig, null, 2)
      )

      // 生成 README
      const readme = `# ${answers.name}

${answers.description}

## Installation

\`\`\`bash
lgit plugin install ${answers.name}
\`\`\`

## Usage

\`\`\`bash
lgit ${answers.name} [options]
\`\`\`

## Configuration

Configure the plugin using:

\`\`\`bash
lgit plugin config ${answers.name}
\`\`\`

## Development

\`\`\`bash
npm install
npm run build
npm test
\`\`\`

## License

MIT
`

      await fs.writeFile(path.join(outputPath, 'README.md'), readme)

      // 生成 .gitignore
      const gitignore = `node_modules/
dist/
*.log
.DS_Store
.env
coverage/
.vscode/
.idea/
`

      await fs.writeFile(path.join(outputPath, '.gitignore'), gitignore)

      this.spinner.succeed('插件模板生成成功！')

      console.log(chalk.green(`\n✅ 插件已创建在: ${outputPath}`))
      console.log(chalk.cyan('\n下一步:'))
      console.log(`  1. cd ${answers.outputDir}`)
      console.log('  2. npm install')
      console.log('  3. npm run build')
      console.log(`  4. lgit plugin install ${outputPath}`)

    } catch (error) {
      this.spinner.fail('生成失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 生成插件主文件内容
   */
  private generatePluginMainFile(name: string, features: string[]): string {
    let content = `/**
 * ${name} Plugin for lgit
 */

import { PluginContext, PluginInstance } from 'lgit-plugin-types'

export default class ${this.toPascalCase(name)}Plugin implements PluginInstance {
  private context: PluginContext
  private config: any

  constructor(context: PluginContext) {
    this.context = context
    this.config = context.config || {}
  }

  /**
   * Called when plugin is loaded
   */
  async onLoad(): Promise<void> {
    this.context.logger.info('${name} plugin loaded')
  }

  /**
   * Called when plugin is unloaded
   */
  async onUnload(): Promise<void> {
    this.context.logger.info('${name} plugin unloaded')
  }

  /**
   * Called when plugin is activated
   */
  async onActivate(): Promise<void> {
    this.context.logger.info('${name} plugin activated')
  }

  /**
   * Called when plugin is deactivated
   */
  async onDeactivate(): Promise<void> {
    this.context.logger.info('${name} plugin deactivated')
  }
`

    if (features.includes('commands')) {
      content += `
  /**
   * Example command handler
   */
  async handleExample(args: any): Promise<void> {
    const { options } = args
    
    this.context.logger.info('Executing example command')
    
    // Execute git command
    const result = await this.context.api.executeGitCommand('status')
    console.log('Git status:', result)
    
    // Show notification
    this.context.api.showNotification('Example command executed!', 'success')
    
    // Prompt user
    const answers = await this.context.api.promptUser([
      {
        type: 'input',
        name: 'value',
        message: 'Enter a value:'
      }
    ])
    
    console.log('User input:', answers.value)
  }
`
    }

    if (features.includes('hooks')) {
      content += `
  /**
   * Pre-commit hook handler
   */
  async onPreCommit(data: any): Promise<void> {
    this.context.logger.info('Pre-commit hook triggered')
    
    // Validate commit
    const { message, files } = data
    
    if (message.length < 10) {
      throw new Error('Commit message too short')
    }
    
    // Check files
    for (const file of files) {
      this.context.logger.debug(\`Checking file: \${file}\`)
    }
  }
`
    }

    if (features.includes('storage')) {
      content += `
  /**
   * Save data to storage
   */
  async saveData(key: string, value: any): Promise<void> {
    await this.context.storage.set(key, value)
    this.context.logger.debug(\`Saved data: \${key}\`)
  }

  /**
   * Load data from storage
   */
  async loadData(key: string): Promise<any> {
    const value = await this.context.storage.get(key)
    this.context.logger.debug(\`Loaded data: \${key}\`)
    return value
  }
`
    }

    if (features.includes('api')) {
      content += `
  /**
   * Public API method
   */
  async publicMethod(param: string): Promise<string> {
    this.context.logger.debug(\`API method called with: \${param}\`)
    return \`Processed: \${param}\`
  }
`
    }

    content += `}
`

    return content
  }

  // ========== 辅助方法 ==========

  /**
   * 创建插件上下文
   */
  private createPluginContext(pluginName: string): PluginContext {
    const logger: Logger = {
      info: (message) => console.log(chalk.blue(`[${pluginName}]`), message),
      warn: (message) => console.warn(chalk.yellow(`[${pluginName}]`), message),
      error: (message) => console.error(chalk.red(`[${pluginName}]`), message),
      debug: (message) => {
        if (process.env.DEBUG) {
          console.log(chalk.gray(`[${pluginName}]`), message)
        }
      }
    }

    const storage: Storage = {
      get: async (key) => {
        const storagePath = path.join(this.configDir, pluginName, 'storage.json')
        try {
          const content = await fs.readFile(storagePath, 'utf-8')
          const data = JSON.parse(content)
          return data[key]
        } catch {
          return undefined
        }
      },
      set: async (key, value) => {
        const storageDir = path.join(this.configDir, pluginName)
        const storagePath = path.join(storageDir, 'storage.json')
        await fs.mkdir(storageDir, { recursive: true })
        
        let data = {}
        try {
          const content = await fs.readFile(storagePath, 'utf-8')
          data = JSON.parse(content)
        } catch {}
        
        data[key] = value
        await fs.writeFile(storagePath, JSON.stringify(data, null, 2))
      },
      delete: async (key) => {
        const storagePath = path.join(this.configDir, pluginName, 'storage.json')
        try {
          const content = await fs.readFile(storagePath, 'utf-8')
          const data = JSON.parse(content)
          delete data[key]
          await fs.writeFile(storagePath, JSON.stringify(data, null, 2))
        } catch {}
      },
      clear: async () => {
        const storagePath = path.join(this.configDir, pluginName, 'storage.json')
        await fs.writeFile(storagePath, '{}')
      }
    }

    const api: PluginAPI = {
      registerCommand: (command) => this.registerCommand(pluginName, command),
      registerHook: (hook) => this.registerHook(pluginName, hook),
      executeGitCommand: async (command) => {
        const result = await execAsync(`git ${command}`)
        return result.stdout
      },
      showNotification: (message, type = 'info') => {
        const icon = {
          info: 'ℹ️',
          success: '✅',
          warning: '⚠️',
          error: '❌'
        }[type]
        console.log(`${icon} ${message}`)
      },
      promptUser: (questions) => inquirer.prompt(questions),
      getPluginConfig: (name) => this.getPluginConfig(name),
      setPluginConfig: (name, config) => this.setPluginConfig(name, config),
      callPlugin: async (name, method, ...args) => {
        const plugin = this.plugins.get(name)
        if (!plugin) throw new Error(`Plugin ${name} not found`)
        const fn = plugin.instance[method]
        if (!fn) throw new Error(`Method ${method} not found in plugin ${name}`)
        return await fn.apply(plugin.instance, args)
      }
    }

    const config = this.getPluginConfig(pluginName)

    return {
      git: this.git,
      logger,
      storage,
      events: this.events,
      api,
      config
    }
  }

  /**
   * 注册命令
   */
  private registerCommand(pluginName: string, command: PluginCommand): void {
    this.commands.set(command.name, { plugin: pluginName, command })
    
    // 注册别名
    if (command.alias) {
      for (const alias of command.alias) {
        this.commands.set(alias, { plugin: pluginName, command })
      }
    }
  }

  /**
   * 注册钩子
   */
  private registerHook(pluginName: string, hook: PluginHook): void {
    const hooks = this.hooks.get(hook.event) || []
    hooks.push({
      plugin: pluginName,
      handler: hook.handler,
      priority: hook.priority || 0
    })
    this.hooks.set(hook.event, hooks)
  }

  /**
   * 获取插件配置
   */
  private getPluginConfig(pluginName: string): any {
    const configPath = path.join(this.configDir, pluginName, 'config.json')
    try {
      const content = fsSync.readFileSync(configPath, 'utf-8')
      return JSON.parse(content)
    } catch {
      const plugin = this.plugins.get(pluginName)
      return plugin?.manifest.config?.defaults || {}
    }
  }

  /**
   * 设置插件配置
   */
  private async setPluginConfig(pluginName: string, config: any): Promise<void> {
    const configDir = path.join(this.configDir, pluginName)
    const configPath = path.join(configDir, 'config.json')
    await fs.mkdir(configDir, { recursive: true })
    await fs.writeFile(configPath, JSON.stringify(config, null, 2))
  }

  /**
   * 确保必要的目录存在
   */
  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(this.pluginDir, { recursive: true })
    await fs.mkdir(this.configDir, { recursive: true })
  }

  /**
   * 加载已安装的插件
   */
  private async loadInstalledPlugins(): Promise<void> {
    try {
      const entries = await fs.readdir(this.pluginDir, { withFileTypes: true })
      
      for (const entry of entries) {
        if (!entry.isDirectory()) continue
        
        const pluginPath = path.join(this.pluginDir, entry.name)
        try {
          await this.loadPlugin(pluginPath)
        } catch (error) {
          console.error(chalk.red(`加载插件 ${entry.name} 失败:`), error)
        }
      }
    } catch (error) {
      // 目录不存在是正常的
      if (error.code !== 'ENOENT') {
        console.error(chalk.red('加载插件失败:'), error)
      }
    }
  }

  /**
   * 激活自动启动的插件
   */
  private async activateAutoStartPlugins(): Promise<void> {
for (const [name] of this.plugins) {
      const config = this.getPluginConfig(name)
      if (config.autoStart !== false) {
        try {
          await this.activatePlugin(name)
        } catch (error) {
          console.error(chalk.red(`激活插件 ${name} 失败:`), error)
        }
      }
    }
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    // Git 事件映射到插件钩子
    const gitEvents = [
      'pre-commit',
      'post-commit',
      'pre-push',
      'post-push',
      'pre-merge',
      'post-merge',
      'pre-rebase',
      'post-rebase'
    ]

    for (const event of gitEvents) {
      const g: any = this.git as any
      if (g && typeof g.on === 'function') {
        g.on(event, async (data: any) => {
          await this.triggerHook(event, data)
        })
      }
    }
  }

  /**
   * 验证插件
   */
  private async validatePlugin(pluginPath: string): Promise<PluginManifest> {
    const manifestPath = path.join(pluginPath, 'plugin.json')
    
    // 检查 manifest 文件
    try {
      await fs.access(manifestPath)
    } catch {
      throw new Error('插件缺少 plugin.json 文件')
    }

    // 读取并解析 manifest
    const content = await fs.readFile(manifestPath, 'utf-8')
    const manifest: PluginManifest = JSON.parse(content)

    // 验证必要字段
    if (!manifest.name) throw new Error('插件缺少名称')
    if (!manifest.version) throw new Error('插件缺少版本')
    if (!manifest.main) throw new Error('插件缺少主文件')

    // 检查主文件
    const mainPath = path.join(pluginPath, manifest.main)
    try {
      await fs.access(mainPath)
    } catch {
      throw new Error(`插件主文件不存在: ${manifest.main}`)
    }

    return manifest
  }

  /**
   * 检查依赖
   */
  private async checkDependencies(manifest: PluginManifest): Promise<void> {
    // 检查 Node.js 版本
    if (manifest.engines?.node) {
      const currentVersion = process.version
      if (!semver.satisfies(currentVersion, manifest.engines.node)) {
        throw new Error(`Node.js 版本不满足要求: 需要 ${manifest.engines.node}`)
      }
    }

    // 检查 lgit 版本
    if (manifest.engines?.lgit) {
      // TODO: 检查 lgit 版本
    }

    // 检查其他依赖
    if (manifest.dependencies) {
for (const [dep, version] of Object.entries(manifest.dependencies)) {
        void dep; void version
        // TODO: 检查依赖插件
      }
    }
  }

  /**
   * 检查权限
   */
  private async checkPermissions(manifest: PluginManifest): Promise<void> {
    if (!manifest.permissions || manifest.permissions.length === 0) return

    console.log(chalk.yellow('\n⚠️ 该插件请求以下权限:'))
    
    for (const perm of manifest.permissions) {
      console.log(`  • ${chalk.cyan(perm.resource)}: ${perm.actions.join(', ')}`)
      if (perm.reason) {
        console.log(`    ${chalk.gray(perm.reason)}`)
      }
    }

    const { accept } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'accept',
        message: '是否授予这些权限？',
        default: false
      }
    ])

    if (!accept) {
      throw new Error('用户拒绝授予权限')
    }
  }

  /**
   * 下载插件
   */
private async downloadPlugin(url: string): Promise<string> {
    void url
    // TODO: 实现从 URL 下载插件
    throw new Error('URL 安装暂未实现')
  }

  /**
   * 从 npm 安装
   */
  private async installFromNpm(packageName: string): Promise<string> {
    const tempDir = path.join(this.pluginDir, '.temp', packageName)
    await fs.mkdir(tempDir, { recursive: true })

    // 安装包
    await execAsync(`npm install ${packageName}`, { cwd: tempDir })

    // 查找插件目录
    const pluginPath = path.join(tempDir, 'node_modules', packageName)
    return pluginPath
  }

  /**
   * 从 GitHub 安装
   */
  private async installFromGitHub(repo: string): Promise<string> {
    const tempDir = path.join(this.pluginDir, '.temp', repo.replace('/', '-'))
    await fs.mkdir(tempDir, { recursive: true })

    // 克隆仓库
    await execAsync(`git clone https://github.com/${repo}.git .`, { cwd: tempDir })

    return tempDir
  }

  /**
   * 复制插件到目标目录
   */
  private async copyPlugin(source: string, target: string): Promise<void> {
    await fs.mkdir(target, { recursive: true })
    await this.copyDirectory(source, target)
  }

  /**
   * 递归复制目录
   */
  private async copyDirectory(source: string, target: string): Promise<void> {
    const entries = await fs.readdir(source, { withFileTypes: true })

    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name)
      const targetPath = path.join(target, entry.name)

      if (entry.isDirectory()) {
        await fs.mkdir(targetPath, { recursive: true })
        await this.copyDirectory(sourcePath, targetPath)
      } else {
        await fs.copyFile(sourcePath, targetPath)
      }
    }
  }

  /**
   * 搜索插件仓库
   */
private async searchPluginRepository(keyword: string): Promise<any[]> {
    void keyword
    // 模拟搜索结果
    return [
      {
        name: 'lgit-prettier',
        version: '1.2.0',
        description: 'Prettier integration for lgit',
        downloads: 1523,
        rating: 4.5
      },
      {
        name: 'lgit-eslint',
        version: '2.0.1',
        description: 'ESLint integration with auto-fix support',
        downloads: 2341,
        rating: 4.7
      },
      {
        name: 'lgit-changelog',
        version: '1.0.5',
        description: 'Automatic changelog generation',
        downloads: 892,
        rating: 4.2
      }
    ]
  }

  /**
   * 切换插件状态
   */
  private async togglePlugin(): Promise<void> {
    const plugins = Array.from(this.plugins.entries())
    
    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message: '选择要切换状态的插件:',
        choices: plugins.map(([name, plugin]) => ({
          name: `${name} (${plugin.status === 'active' ? '激活' : '停用'})`,
          value: name
        }))
      }
    ])

    const plugin = this.plugins.get(selected)!
    
    if (plugin.status === 'active') {
      await this.deactivatePlugin(selected)
    } else {
      await this.activatePlugin(selected)
    }
  }

  /**
   * 配置插件
   */
  private async configurePlugin(): Promise<void> {
    const plugins = Array.from(this.plugins.keys())
    
    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message: '选择要配置的插件:',
        choices: plugins
      }
    ])

    const plugin = this.plugins.get(selected)!
    const currentConfig = this.getPluginConfig(selected)

    console.log(chalk.cyan('\n当前配置:'))
    console.log(JSON.stringify(currentConfig, null, 2))

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择操作:',
        choices: [
          { name: '编辑配置', value: 'edit' },
          { name: '重置为默认', value: 'reset' },
          { name: '导出配置', value: 'export' },
          { name: '导入配置', value: 'import' }
        ]
      }
    ])

    switch (action) {
      case 'edit':
        const { newConfig } = await inquirer.prompt([
          {
            type: 'editor',
            name: 'newConfig',
            message: '编辑配置 (JSON 格式):',
            default: JSON.stringify(currentConfig, null, 2)
          }
        ])
        
        try {
          const parsed = JSON.parse(newConfig)
          await this.setPluginConfig(selected, parsed)
          console.log(chalk.green('✅ 配置已更新'))
        } catch (error) {
          console.error(chalk.red('配置格式错误'), error)
        }
        break

      case 'reset':
        const defaults = plugin.manifest.config?.defaults || {}
        await this.setPluginConfig(selected, defaults)
        console.log(chalk.green('✅ 配置已重置'))
        break

      case 'export':
        const exportPath = `${selected}-config.json`
        await fs.writeFile(exportPath, JSON.stringify(currentConfig, null, 2))
        console.log(chalk.green(`✅ 配置已导出到: ${exportPath}`))
        break

      case 'import':
        const { importPath } = await inquirer.prompt([
          {
            type: 'input',
            name: 'importPath',
            message: '配置文件路径:'
          }
        ])
        
        try {
          const content = await fs.readFile(importPath, 'utf-8')
          const imported = JSON.parse(content)
          await this.setPluginConfig(selected, imported)
          console.log(chalk.green('✅ 配置已导入'))
        } catch (error) {
          console.error(chalk.red('导入失败'), error)
        }
        break
    }
  }

  /**
   * 卸载插件（交互式）
   */
  private async uninstallPluginInteractive(): Promise<void> {
    const plugins = Array.from(this.plugins.keys())
    
    if (plugins.length === 0) {
      console.log(chalk.yellow('没有可卸载的插件'))
      return
    }

    const { selected } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selected',
        message: '选择要卸载的插件:',
        choices: plugins
      }
    ])

    if (selected.length === 0) return

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `确认卸载 ${selected.length} 个插件？`,
        default: false
      }
    ])

    if (!confirm) return

    for (const pluginName of selected) {
      try {
        await this.uninstallPlugin(pluginName)
      } catch (error) {
        console.error(chalk.red(`卸载 ${pluginName} 失败:`), error)
      }
    }
  }

  /**
   * 安装插件（交互式）
   */
  private async installPluginInteractive(): Promise<void> {
    const { source } = await inquirer.prompt([
      {
        type: 'list',
        name: 'source',
        message: '选择安装源:',
        choices: [
          { name: '从 npm 安装', value: 'npm' },
          { name: '从 GitHub 安装', value: 'github' },
          { name: '从 URL 安装', value: 'url' },
          { name: '从本地路径安装', value: 'local' }
        ]
      }
    ])

    let installSource: string

    switch (source) {
      case 'npm':
        const { npmPackage } = await inquirer.prompt([
          {
            type: 'input',
            name: 'npmPackage',
            message: 'npm 包名:',
            validate: input => input.length > 0 || '请输入包名'
          }
        ])
        installSource = `npm:${npmPackage}`
        break

      case 'github':
        const { githubRepo } = await inquirer.prompt([
          {
            type: 'input',
            name: 'githubRepo',
            message: 'GitHub 仓库 (格式: owner/repo):',
            validate: input => /^[^/]+\/[^/]+$/.test(input) || '格式错误'
          }
        ])
        installSource = `github:${githubRepo}`
        break

      case 'url':
        const { url } = await inquirer.prompt([
          {
            type: 'input',
            name: 'url',
            message: '插件 URL:',
            validate: input => input.startsWith('http') || '请输入有效的 URL'
          }
        ])
        installSource = url
        break

      case 'local':
        const { localPath } = await inquirer.prompt([
          {
            type: 'input',
            name: 'localPath',
            message: '本地路径:'
          }
        ])
        installSource = localPath
        break

      default:
        return
    }

    await this.installPlugin(installSource)
  }

  /**
   * 更新插件
   */
  private async updatePlugins(): Promise<void> {
    console.log(chalk.cyan('🔄 检查插件更新...'))
    
    // TODO: 实现插件更新逻辑
    console.log(chalk.yellow('插件更新功能开发中...'))
  }

  /**
   * 显示插件统计
   */
  private async showPluginStats(): Promise<void> {
    console.log(chalk.cyan('\n📊 插件统计\n'))

    const total = this.plugins.size
    const active = Array.from(this.plugins.values()).filter(p => p.status === 'active').length
    const commands = this.commands.size
    const hooks = Array.from(this.hooks.values()).reduce((sum, h) => sum + h.length, 0)

    console.log(`  插件总数: ${chalk.yellow(total)}`)
    console.log(`  激活插件: ${chalk.green(active)}`)
    console.log(`  注册命令: ${chalk.blue(commands)}`)
    console.log(`  注册钩子: ${chalk.magenta(hooks)}`)

    if (this.plugins.size > 0) {
      console.log(chalk.cyan('\n📦 插件详情:\n'))
      
      for (const [name, plugin] of this.plugins) {
        const commandCount = Array.from(this.commands.values())
          .filter(c => c.plugin === name).length
        const hookCount = Array.from(this.hooks.values())
          .flat()
          .filter(h => h.plugin === name).length

        console.log(`  ${chalk.bold(name)} v${plugin.manifest.version}`)
        console.log(`    状态: ${this.getStatusBadge(plugin.status)}`)
        console.log(`    命令: ${commandCount} 个`)
        console.log(`    钩子: ${hookCount} 个`)
        console.log(`    加载时间: ${plugin.loadTime.toLocaleString()}`)
        console.log()
      }
    }
  }

  // ========== 工具方法 ==========

  private getStatusBadge(status: string): string {
    switch (status) {
      case 'active': return chalk.green('● 激活')
      case 'inactive': return chalk.gray('● 停用')
      case 'loaded': return chalk.yellow('● 已加载')
      case 'error': return chalk.red('● 错误')
      default: return status
    }
  }

  private toPascalCase(str: string): string {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
  }
}
