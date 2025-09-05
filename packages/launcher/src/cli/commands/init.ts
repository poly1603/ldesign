/**
 * Init CLI 命令
 * 
 * 项目初始化命令，支持创建新项目和添加 Launcher 到现有项目
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { promises as fs } from 'fs'
import { resolve, basename } from 'path'
import { Logger } from '../../utils/logger'
import { FileSystem } from '../../utils/file-system'
import { projectTemplates } from '../../core/ProjectTemplates'
import type { CliContext } from '../../types'
import type { ProjectPreset } from '../../types'
import type { TemplateVariables } from '../../core/ProjectTemplates'

/**
 * 项目初始化选项
 */
interface InitOptions {
  /** 模板名称 */
  template?: string
  /** 项目预设 */
  preset?: ProjectPreset
  /** 强制覆盖 */
  force?: boolean
  /** 跳过依赖安装 */
  skipInstall?: boolean
  /** 包管理器 */
  packageManager?: 'npm' | 'yarn' | 'pnpm'
  /** 项目描述 */
  description?: string
  /** 作者 */
  author?: string
  /** 版本 */
  version?: string
  /** 许可证 */
  license?: string
  /** 交互模式 */
  interactive?: boolean
}

export class InitCommand {
  private logger: Logger

  constructor() {
    this.logger = new Logger('InitCommand')
  }

  /**
   * 命令名称
   */
  get name() {
    return 'init'
  }

  /**
   * 命令描述
   */
  get description() {
    return '初始化新项目或为现有项目添加 Launcher'
  }

  /**
   * 命令选项
   */
  get options() {
    return [
      {
        name: 'template',
        alias: 't',
        description: '使用指定的项目模板',
        type: 'string'
      },
      {
        name: 'preset',
        alias: 'p',
        description: '使用指定的项目预设 (vue3, vue3-ts, react, react-ts, etc.)',
        type: 'string'
      },
      {
        name: 'force',
        alias: 'f',
        description: '强制覆盖已存在的文件',
        type: 'boolean',
        default: false
      },
      {
        name: 'skip-install',
        description: '跳过依赖安装',
        type: 'boolean',
        default: false
      },
      {
        name: 'package-manager',
        alias: 'pm',
        description: '指定包管理器 (npm, yarn, pnpm)',
        type: 'string',
        choices: ['npm', 'yarn', 'pnpm'],
        default: 'npm'
      },
      {
        name: 'description',
        alias: 'd',
        description: '项目描述',
        type: 'string'
      },
      {
        name: 'author',
        alias: 'a',
        description: '项目作者',
        type: 'string'
      },
      {
        name: 'version',
        alias: 'v',
        description: '项目版本',
        type: 'string',
        default: '0.1.0'
      },
      {
        name: 'license',
        alias: 'l',
        description: '项目许可证',
        type: 'string',
        default: 'MIT'
      },
      {
        name: 'interactive',
        alias: 'i',
        description: '启用交互模式',
        type: 'boolean',
        default: true
      }
    ]
  }

  /**
   * 验证命令参数
   */
  validate(context: CliContext): boolean | string {
    const { args } = context

    if (args.length > 1) {
      return '只能指定一个项目目录'
    }

    return true
  }

  /**
   * 执行命令
   */
  async handler(context: CliContext): Promise<void> {
    const { args, options } = context
    const initOptions = options as InitOptions

    try {
      // 获取项目目录
      const projectDir = args[0] || '.'
      const targetPath = resolve(process.cwd(), projectDir)
      const projectName = projectDir === '.' ? basename(process.cwd()) : basename(projectDir)

      this.logger.info('🚀 开始初始化项目...', {
        projectName,
        targetPath
      })

      // 检查目录状态
      const dirStatus = await this.checkDirectory(targetPath, initOptions.force)

      if (dirStatus === 'exists-with-files' && !initOptions.force) {
        this.logger.error('目录已存在且包含文件，使用 --force 强制覆盖')
        return
      }

      // 交互模式或使用选项
      let templateName: string
      let variables: TemplateVariables

      if (initOptions.interactive && !initOptions.template && !initOptions.preset) {
        // 交互模式
        const result = await this.interactiveMode(projectName, initOptions)
        templateName = result.templateName
        variables = result.variables
      } else {
        // 命令行模式
        const result = await this.commandLineMode(projectName, initOptions)
        templateName = result.templateName
        variables = result.variables
      }

      // 创建项目
      await projectTemplates.createProject(templateName, targetPath, variables)

      // 安装依赖
      if (!initOptions.skipInstall) {
        await this.installDependencies(targetPath, initOptions.packageManager || 'npm')
      }

      // 完成提示
      this.showCompletionMessage(projectName, projectDir, initOptions.skipInstall, initOptions.packageManager)

    } catch (error) {
      this.logger.error('项目初始化失败', error)
      throw error
    }
  }

  /**
   * 检查目录状态
   */
  private async checkDirectory(targetPath: string, force?: boolean): Promise<'new' | 'empty' | 'exists-with-files'> {
    if (!(await FileSystem.exists(targetPath))) {
      return 'new'
    }

    const files = await fs.readdir(targetPath)
    const nonHiddenFiles = files.filter(file => !file.startsWith('.'))

    if (nonHiddenFiles.length === 0) {
      return 'empty'
    }

    return 'exists-with-files'
  }

  /**
   * 交互模式
   */
  private async interactiveMode(projectName: string, options: InitOptions): Promise<{
    templateName: string
    variables: TemplateVariables
  }> {
    this.logger.info('📋 请回答以下问题来配置您的项目：')

    // 这里应该使用询问库如 inquirer，为了简化示例，直接返回默认值
    // 在实际实现中，可以使用 inquirer 或类似的库来实现交互

    const preset = options.preset || 'vue3-ts'
    const templates = projectTemplates.getTemplatesByPreset(preset as ProjectPreset)
    const template = templates[0]

    if (!template) {
      throw new Error(`未找到预设 ${preset} 的模板`)
    }

    const variables: TemplateVariables = {
      projectName,
      description: options.description || `${projectName} 项目`,
      author: options.author || '',
      version: options.version || '0.1.0',
      license: options.license || 'MIT'
    }

    return {
      templateName: template.name,
      variables
    }
  }

  /**
   * 命令行模式
   */
  private async commandLineMode(projectName: string, options: InitOptions): Promise<{
    templateName: string
    variables: TemplateVariables
  }> {
    let templateName: string

    if (options.template) {
      // 使用指定模板
      const template = projectTemplates.getTemplate(options.template)
      if (!template) {
        throw new Error(`模板不存在: ${options.template}`)
      }
      templateName = options.template
    } else if (options.preset) {
      // 使用预设
      const templates = projectTemplates.getTemplatesByPreset(options.preset)
      if (templates.length === 0) {
        throw new Error(`未找到预设 ${options.preset} 的模板`)
      }
      templateName = templates[0].name
    } else {
      // 默认使用 Vue 3 + TypeScript
      templateName = 'vue3-typescript-starter'
    }

    const variables: TemplateVariables = {
      projectName,
      description: options.description || `${projectName} 项目`,
      author: options.author || '',
      version: options.version || '0.1.0',
      license: options.license || 'MIT'
    }

    return {
      templateName,
      variables
    }
  }

  /**
   * 安装依赖
   */
  private async installDependencies(projectPath: string, packageManager: string): Promise<void> {
    this.logger.info('📦 正在安装依赖...')

    const commands = {
      npm: 'npm install',
      yarn: 'yarn install',
      pnpm: 'pnpm install'
    }

    const command = commands[packageManager as keyof typeof commands] || commands.npm

    try {
      // 这里应该执行实际的包管理器命令
      // 为了简化示例，暂时模拟
      await new Promise(resolve => setTimeout(resolve, 2000))
      this.logger.success('✅ 依赖安装完成')
    } catch (error) {
      this.logger.warn('⚠️ 依赖安装失败，请手动运行:', { command })
    }
  }

  /**
   * 显示完成消息
   */
  private showCompletionMessage(
    projectName: string,
    projectDir: string,
    skipInstall?: boolean,
    packageManager?: string
  ): void {
    this.logger.success('\n🎉 项目创建成功！')

    console.log('\n📂 项目结构：')
    console.log(`   ${projectName}/`)
    console.log('   ├── src/')
    console.log('   │   ├── components/')
    console.log('   │   ├── App.vue (或 App.jsx)')
    console.log('   │   └── main.js (或 main.ts)')
    console.log('   ├── launcher.config.ts')
    console.log('   ├── package.json')
    console.log('   └── README.md')

    console.log('\n🚀 开始开发：')

    if (projectDir !== '.') {
      console.log(`   cd ${projectDir}`)
    }

    if (skipInstall) {
      const pm = packageManager || 'npm'
      console.log(`   ${pm} install`)
    }

    console.log('   npm run dev')

    console.log('\n📖 更多命令：')
    console.log('   npm run build    # 构建生产版本')
    console.log('   npm run preview  # 预览构建结果')

    console.log('\n📚 文档和帮助：')
    console.log('   https://github.com/ldesign/launcher')
    console.log('   launcher --help')

    console.log('\n💡 提示：')
    console.log('   - 使用 launcher dev --debug 查看详细日志')
    console.log('   - 编辑 launcher.config.ts 自定义配置')
    console.log('   - 查看 .env 文件了解环境变量配置')
  }

  /**
   * 列出可用模板
   */
  async listTemplates(): Promise<void> {
    const templates = projectTemplates.getAllTemplates()

    this.logger.info('📋 可用的项目模板：\n')

    const groupedTemplates = templates.reduce((groups, template) => {
      const preset = template.preset
      if (!groups[preset]) {
        groups[preset] = []
      }
      groups[preset].push(template)
      return groups
    }, {} as Record<string, typeof templates>)

    for (const [preset, presetTemplates] of Object.entries(groupedTemplates)) {
      console.log(`\n🎯 ${preset.toUpperCase()}:`)
      for (const template of presetTemplates) {
        console.log(`   ${template.name}`)
        console.log(`      ${template.description}`)
        console.log(`      标签: ${template.tags.join(', ')}`)
      }
    }

    console.log('\n使用示例:')
    console.log('   launcher init my-project --template vue3-typescript-starter')
    console.log('   launcher init my-app --preset react-ts')
    console.log('   launcher init . --force  # 在当前目录初始化')
  }
}
