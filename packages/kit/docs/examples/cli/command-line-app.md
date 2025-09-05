# 完整 CLI 应用开发示例

本示例展示如何使用 @ldesign/kit 构建一个功能完整的命令行应用程序 - 项目管理工具。

## 项目结构

```
project-manager-cli/
├── src/
│   ├── commands/
│   │   ├── init.ts
│   │   ├── build.ts
│   │   ├── deploy.ts
│   │   └── status.ts
│   ├── utils/
│   │   ├── config.ts
│   │   ├── logger.ts
│   │   └── validator.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── package.json
└── README.md
```

## 主应用入口

```typescript
// src/index.ts
import { CLIManager, OutputFormatter } from '@ldesign/kit'
import { InitCommand } from './commands/init'
import { BuildCommand } from './commands/build'
import { DeployCommand } from './commands/deploy'
import { StatusCommand } from './commands/status'
import { Logger } from './utils/logger'
import { ConfigManager } from './utils/config'

class ProjectManagerCLI {
  private cli: CLIManager
  private formatter: OutputFormatter
  private logger: Logger
  private config: ConfigManager

  constructor() {
    this.formatter = OutputFormatter.create({ colors: true })
    this.logger = new Logger(this.formatter)
    this.config = new ConfigManager()

    this.cli = new CLIManager({
      name: 'pm',
      version: '1.0.0',
      description: '项目管理命令行工具',
      usage: 'pm <command> [options]',
    })

    this.setupGlobalOptions()
    this.setupCommands()
    this.setupMiddleware()
  }

  private setupGlobalOptions() {
    this.cli.addGlobalOption({
      name: 'verbose',
      description: '详细输出',
      type: 'boolean',
      alias: 'v',
    })

    this.cli.addGlobalOption({
      name: 'config',
      description: '配置文件路径',
      type: 'string',
      alias: 'c',
      default: './pm.config.json',
    })

    this.cli.addGlobalOption({
      name: 'dry-run',
      description: '预览模式，不执行实际操作',
      type: 'boolean',
    })
  }

  private setupCommands() {
    // 初始化项目命令
    this.cli.addCommand('init', {
      description: '初始化新项目',
      options: [
        {
          name: 'name',
          description: '项目名称',
          type: 'string',
          required: true,
        },
        {
          name: 'template',
          description: '项目模板',
          type: 'string',
          choices: ['react', 'vue', 'node', 'express'],
          default: 'node',
        },
        {
          name: 'typescript',
          description: '使用 TypeScript',
          type: 'boolean',
          default: true,
        },
        {
          name: 'git',
          description: '初始化 Git 仓库',
          type: 'boolean',
          default: true,
        },
      ],
      action: async (options, args) => {
        const initCommand = new InitCommand(this.formatter, this.logger, this.config)
        await initCommand.execute(options, args)
      },
    })

    // 构建项目命令
    this.cli.addCommand('build', {
      description: '构建项目',
      options: [
        {
          name: 'env',
          description: '构建环境',
          type: 'string',
          choices: ['development', 'staging', 'production'],
          default: 'production',
        },
        {
          name: 'watch',
          description: '监听模式',
          type: 'boolean',
          alias: 'w',
        },
        {
          name: 'clean',
          description: '清理输出目录',
          type: 'boolean',
          default: true,
        },
      ],
      action: async (options, args) => {
        const buildCommand = new BuildCommand(this.formatter, this.logger, this.config)
        await buildCommand.execute(options, args)
      },
    })

    // 部署项目命令
    this.cli.addCommand('deploy', {
      description: '部署项目',
      options: [
        {
          name: 'target',
          description: '部署目标',
          type: 'string',
          required: true,
          choices: ['staging', 'production'],
        },
        {
          name: 'force',
          description: '强制部署',
          type: 'boolean',
        },
        {
          name: 'rollback',
          description: '回滚到指定版本',
          type: 'string',
        },
      ],
      action: async (options, args) => {
        const deployCommand = new DeployCommand(this.formatter, this.logger, this.config)
        await deployCommand.execute(options, args)
      },
    })

    // 状态查看命令
    this.cli.addCommand('status', {
      description: '查看项目状态',
      options: [
        {
          name: 'detailed',
          description: '显示详细信息',
          type: 'boolean',
          alias: 'd',
        },
        {
          name: 'json',
          description: '以 JSON 格式输出',
          type: 'boolean',
        },
      ],
      action: async (options, args) => {
        const statusCommand = new StatusCommand(this.formatter, this.logger, this.config)
        await statusCommand.execute(options, args)
      },
    })
  }

  private setupMiddleware() {
    // 配置加载中间件
    this.cli.use(async (ctx, next) => {
      if (ctx.options.config) {
        await this.config.load(ctx.options.config)
      }
      await next()
    })

    // 日志中间件
    this.cli.use(async (ctx, next) => {
      if (ctx.options.verbose) {
        this.logger.setLevel('debug')
      }

      this.logger.info(`执行命令: ${ctx.command}`)
      const startTime = Date.now()

      try {
        await next()
        const duration = Date.now() - startTime
        this.logger.info(`命令执行完成，耗时: ${duration}ms`)
      } catch (error) {
        const duration = Date.now() - startTime
        this.logger.error(`命令执行失败，耗时: ${duration}ms`)
        throw error
      }
    })

    // 预览模式中间件
    this.cli.use(async (ctx, next) => {
      if (ctx.options['dry-run']) {
        this.formatter.warning('🔍 预览模式：以下操作将被执行（但不会实际执行）')
      }
      await next()
    })
  }

  async run() {
    try {
      await this.cli.parse()
    } catch (error) {
      this.logger.error('应用执行失败:', error.message)
      process.exit(1)
    }
  }
}

// 启动应用
const app = new ProjectManagerCLI()
app.run()
```

## 初始化命令实现

```typescript
// src/commands/init.ts
import {
  OutputFormatter,
  InquirerManager,
  FileSystem,
  GitManager,
  PackageManager,
} from '@ldesign/kit'
import { Logger } from '../utils/logger'
import { ConfigManager } from '../utils/config'
import { ProjectConfig } from '../types'

export class InitCommand {
  constructor(
    private formatter: OutputFormatter,
    private logger: Logger,
    private config: ConfigManager
  ) {}

  async execute(options: any, args: string[]) {
    this.formatter.title('🚀 项目初始化')

    try {
      // 1. 验证项目名称
      await this.validateProjectName(options.name)

      // 2. 创建项目目录
      const projectPath = await this.createProjectDirectory(options.name)

      // 3. 生成项目配置
      const projectConfig = await this.generateProjectConfig(options)

      // 4. 创建项目结构
      await this.createProjectStructure(projectPath, projectConfig)

      // 5. 初始化包管理
      await this.initializePackageManager(projectPath, projectConfig)

      // 6. 初始化 Git 仓库
      if (options.git) {
        await this.initializeGitRepository(projectPath)
      }

      // 7. 安装依赖
      await this.installDependencies(projectPath, projectConfig)

      this.formatter.success(`✅ 项目 ${options.name} 初始化完成`)
      this.showNextSteps(options.name)
    } catch (error) {
      this.logger.error('项目初始化失败:', error.message)
      throw error
    }
  }

  private async validateProjectName(name: string) {
    if (!name || name.trim().length === 0) {
      throw new Error('项目名称不能为空')
    }

    if (!/^[a-z0-9-_]+$/.test(name)) {
      throw new Error('项目名称只能包含小写字母、数字、连字符和下划线')
    }

    if (await FileSystem.exists(`./${name}`)) {
      throw new Error(`目录 ${name} 已存在`)
    }
  }

  private async createProjectDirectory(name: string): Promise<string> {
    const projectPath = `./${name}`

    this.logger.info(`创建项目目录: ${projectPath}`)
    await FileSystem.ensureDir(projectPath)

    return projectPath
  }

  private async generateProjectConfig(options: any): Promise<ProjectConfig> {
    const inquirer = InquirerManager.create()

    // 如果是交互模式，询问更多配置
    let additionalConfig = {}

    if (!options.template) {
      const template = await inquirer.select({
        message: '选择项目模板:',
        choices: [
          { name: 'React 应用', value: 'react' },
          { name: 'Vue 应用', value: 'vue' },
          { name: 'Node.js 库', value: 'node' },
          { name: 'Express 服务器', value: 'express' },
        ],
      })
      options.template = template
    }

    // 询问其他配置
    const features = await inquirer.multiSelect({
      message: '选择需要的功能:',
      choices: [
        { name: 'ESLint', value: 'eslint', checked: true },
        { name: 'Prettier', value: 'prettier', checked: true },
        { name: 'Jest', value: 'jest' },
        { name: 'Husky', value: 'husky' },
        { name: 'Docker', value: 'docker' },
      ],
    })

    return {
      name: options.name,
      template: options.template,
      typescript: options.typescript,
      features,
      ...additionalConfig,
    }
  }

  private async createProjectStructure(projectPath: string, config: ProjectConfig) {
    this.logger.info('创建项目结构...')

    const directories = this.getDirectoriesForTemplate(config.template)

    for (const dir of directories) {
      await FileSystem.ensureDir(`${projectPath}/${dir}`)
    }

    // 创建基础文件
    await this.createBaseFiles(projectPath, config)
  }

  private getDirectoriesForTemplate(template: string): string[] {
    const commonDirs = ['src', 'tests', 'docs']

    switch (template) {
      case 'react':
        return [...commonDirs, 'public', 'src/components', 'src/hooks', 'src/utils']
      case 'vue':
        return [...commonDirs, 'public', 'src/components', 'src/composables', 'src/utils']
      case 'express':
        return [...commonDirs, 'src/routes', 'src/middleware', 'src/models', 'src/utils']
      default:
        return [...commonDirs, 'src/utils']
    }
  }

  private async createBaseFiles(projectPath: string, config: ProjectConfig) {
    // 创建 README.md
    const readme = this.generateReadme(config)
    await FileSystem.writeFile(`${projectPath}/README.md`, readme)

    // 创建 .gitignore
    const gitignore = this.generateGitignore(config)
    await FileSystem.writeFile(`${projectPath}/.gitignore`, gitignore)

    // 创建配置文件
    if (config.typescript) {
      const tsconfig = this.generateTsConfig(config)
      await FileSystem.writeFile(`${projectPath}/tsconfig.json`, JSON.stringify(tsconfig, null, 2))
    }

    // 创建 ESLint 配置
    if (config.features.includes('eslint')) {
      const eslintConfig = this.generateEslintConfig(config)
      await FileSystem.writeFile(
        `${projectPath}/.eslintrc.json`,
        JSON.stringify(eslintConfig, null, 2)
      )
    }
  }

  private async initializePackageManager(projectPath: string, config: ProjectConfig) {
    this.logger.info('初始化包管理...')

    const packageManager = new PackageManager(projectPath)

    const packageJson = {
      name: config.name,
      version: '1.0.0',
      description: `${config.name} 项目`,
      main: config.typescript ? 'dist/index.js' : 'src/index.js',
      scripts: this.generateScripts(config),
      keywords: [],
      author: '',
      license: 'MIT',
    }

    await packageManager.writePackageJson(packageJson)
  }

  private async initializeGitRepository(projectPath: string) {
    this.logger.info('初始化 Git 仓库...')

    const git = new GitManager(projectPath)
    await git.init()

    // 创建初始提交
    await git.add('.')
    await git.commit('Initial commit')
  }

  private async installDependencies(projectPath: string, config: ProjectConfig) {
    this.logger.info('安装依赖...')

    const packageManager = new PackageManager(projectPath)

    // 根据模板和功能安装依赖
    const dependencies = this.getDependenciesForConfig(config)

    for (const dep of dependencies.production) {
      await packageManager.addDependency(dep)
    }

    for (const dep of dependencies.development) {
      await packageManager.addDependency(dep, undefined, { dev: true })
    }
  }

  private getDependenciesForConfig(config: ProjectConfig) {
    const deps = {
      production: [] as string[],
      development: [] as string[],
    }

    // 基础依赖
    if (config.typescript) {
      deps.development.push('typescript', '@types/node')
    }

    // 模板特定依赖
    switch (config.template) {
      case 'react':
        deps.production.push('react', 'react-dom')
        if (config.typescript) {
          deps.development.push('@types/react', '@types/react-dom')
        }
        break
      case 'vue':
        deps.production.push('vue')
        break
      case 'express':
        deps.production.push('express')
        if (config.typescript) {
          deps.development.push('@types/express')
        }
        break
    }

    // 功能依赖
    if (config.features.includes('eslint')) {
      deps.development.push('eslint')
      if (config.typescript) {
        deps.development.push('@typescript-eslint/parser', '@typescript-eslint/eslint-plugin')
      }
    }

    if (config.features.includes('prettier')) {
      deps.development.push('prettier')
    }

    if (config.features.includes('jest')) {
      deps.development.push('jest')
      if (config.typescript) {
        deps.development.push('ts-jest', '@types/jest')
      }
    }

    return deps
  }

  private generateReadme(config: ProjectConfig): string {
    return `# ${config.name}

${config.name} 项目描述

## 安装

\`\`\`bash
npm install
\`\`\`

## 开发

\`\`\`bash
npm run dev
\`\`\`

## 构建

\`\`\`bash
npm run build
\`\`\`

## 测试

\`\`\`bash
npm test
\`\`\`

## 许可证

MIT
`
  }

  private generateGitignore(config: ProjectConfig): string {
    return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Coverage
coverage/
.nyc_output/
`
  }

  private generateScripts(config: ProjectConfig): Record<string, string> {
    const scripts: Record<string, string> = {}

    if (config.typescript) {
      scripts.build = 'tsc'
      scripts.dev = 'tsc --watch'
    }

    if (config.features.includes('eslint')) {
      scripts.lint = 'eslint src --ext .ts,.js'
      scripts['lint:fix'] = 'eslint src --ext .ts,.js --fix'
    }

    if (config.features.includes('prettier')) {
      scripts.format = 'prettier --write "src/**/*.{ts,js,json}"'
    }

    if (config.features.includes('jest')) {
      scripts.test = 'jest'
      scripts['test:watch'] = 'jest --watch'
      scripts['test:coverage'] = 'jest --coverage'
    }

    return scripts
  }

  private showNextSteps(projectName: string) {
    this.formatter.section('下一步')
    this.formatter.list([`cd ${projectName}`, 'npm run dev', '开始开发你的项目！'])
  }
}
```

## 类型定义

```typescript
// src/types/index.ts
export interface ProjectConfig {
  name: string
  template: 'react' | 'vue' | 'node' | 'express'
  typescript: boolean
  features: string[]
}

export interface BuildConfig {
  env: 'development' | 'staging' | 'production'
  outputDir: string
  sourceMap: boolean
  minify: boolean
}

export interface DeployConfig {
  target: 'staging' | 'production'
  host: string
  port: number
  path: string
  backup: boolean
}
```

## 使用示例

```bash
# 初始化新项目
pm init --name my-app --template react --typescript

# 构建项目
pm build --env production --clean

# 部署到测试环境
pm deploy --target staging

# 查看项目状态
pm status --detailed

# 使用配置文件
pm build --config ./custom.config.json

# 预览模式
pm deploy --target production --dry-run
```

## 总结

这个完整的 CLI 应用示例展示了：

1. **模块化设计**: 将命令分离到独立的类中
2. **中间件系统**: 使用中间件处理通用逻辑
3. **配置管理**: 支持配置文件和命令行选项
4. **错误处理**: 完善的错误处理和用户反馈
5. **交互式界面**: 结合 Inquirer 提供友好的用户体验
6. **进度反馈**: 使用进度条和状态显示
7. **类型安全**: 完整的 TypeScript 类型定义

通过这个示例，您可以学习如何构建专业级的命令行工具，并将其应用到自己的项目中。
