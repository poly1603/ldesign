# CLI 命令行工具

CLI 模块提供了命令行工具开发框架，支持参数解析、输出格式化、进度条和交互式界面，帮助快速构建专业的命令行应用。

## 导入方式

```typescript
// 完整导入
import { CLIManager, OutputFormatter, ProgressBar, Spinner } from '@ldesign/kit'

// 按需导入
import { CLIManager } from '@ldesign/kit/cli'

// 单独导入
import { CLIManager, OutputFormatter } from '@ldesign/kit'
```

## CLIManager

CLI 管理器类，提供完整的命令行应用开发功能。

### 创建实例

#### `new CLIManager(options: CLIOptions)`

创建 CLI 管理器实例。

```typescript
const cli = new CLIManager({
  name: 'my-tool',
  version: '1.0.0',
  description: '我的命令行工具',
  usage: 'my-tool <command> [options]',
  helpOption: '-h, --help',
  versionOption: '-v, --version',
  colors: true, // 启用颜色
  suggestions: true, // 启用命令建议
  exitOnError: true, // 错误时退出
})
```

### 命令管理

#### `addCommand(name: string, config: CommandConfig): void`

添加命令。

```typescript
// 基本命令
cli.addCommand('build', {
  description: '构建项目',
  action: async options => {
    console.log('开始构建项目...')
    // 构建逻辑
  },
})

// 带选项的命令
cli.addCommand('deploy', {
  description: '部署应用',
  options: [
    {
      name: 'env',
      description: '部署环境',
      type: 'string',
      required: true,
      choices: ['dev', 'staging', 'production'],
    },
    {
      name: 'force',
      description: '强制部署',
      type: 'boolean',
      alias: 'f',
    },
    {
      name: 'config',
      description: '配置文件路径',
      type: 'string',
      default: './deploy.config.js',
    },
  ],
  action: async options => {
    console.log(`部署到 ${options.env} 环境`)
    if (options.force) {
      console.log('强制部署模式')
    }
  },
})

// 子命令
cli.addCommand('db:migrate', {
  description: '数据库迁移',
  action: async options => {
    console.log('执行数据库迁移...')
  },
})

cli.addCommand('db:seed', {
  description: '数据库填充',
  action: async options => {
    console.log('填充数据库数据...')
  },
})
```

#### `addGlobalOption(option: OptionConfig): void`

添加全局选项。

```typescript
cli.addGlobalOption({
  name: 'verbose',
  description: '详细输出',
  type: 'boolean',
  alias: 'v',
})

cli.addGlobalOption({
  name: 'config',
  description: '配置文件路径',
  type: 'string',
  alias: 'c',
  default: './config.json',
})
```

### 中间件

#### `use(middleware: CLIMiddleware): void`

添加中间件。

```typescript
// 日志中间件
cli.use(async (ctx, next) => {
  console.log(`执行命令: ${ctx.command}`)
  const startTime = Date.now()

  await next()

  const duration = Date.now() - startTime
  console.log(`命令执行完成，耗时: ${duration}ms`)
})

// 配置加载中间件
cli.use(async (ctx, next) => {
  if (ctx.options.config) {
    ctx.config = await loadConfig(ctx.options.config)
  }
  await next()
})

// 权限检查中间件
cli.use(async (ctx, next) => {
  if (ctx.command === 'deploy' && !ctx.options.force) {
    const confirmed = await confirmDeployment()
    if (!confirmed) {
      console.log('部署已取消')
      return
    }
  }
  await next()
})
```

### 解析和执行

#### `parse(argv?: string[]): Promise<void>`

解析命令行参数并执行。

```typescript
// 解析 process.argv
await cli.parse()

// 解析自定义参数
await cli.parse(['node', 'script.js', 'build', '--env', 'production'])
```

#### `parseOptions(argv: string[]): ParsedOptions`

仅解析选项，不执行命令。

```typescript
const parsed = cli.parseOptions(['build', '--env', 'production', '--verbose'])
console.log('命令:', parsed.command)
console.log('选项:', parsed.options)
console.log('参数:', parsed.args)
```

## OutputFormatter

输出格式化类，提供丰富的控制台输出功能。

### 创建实例

#### `create(options?: FormatterOptions): OutputFormatter`

创建输出格式化器。

```typescript
const formatter = OutputFormatter.create({
  colors: true, // 启用颜色
  icons: true, // 启用图标
  timestamp: false, // 显示时间戳
  prefix: '[MyTool]', // 输出前缀
})
```

### 基本输出

#### `log(message: string, level?: LogLevel): void`

基本日志输出。

```typescript
formatter.log('普通消息')
formatter.log('信息消息', 'info')
formatter.log('警告消息', 'warn')
formatter.log('错误消息', 'error')
formatter.log('成功消息', 'success')
```

#### `info(message: string): void`

信息输出。

```typescript
formatter.info('这是一条信息')
formatter.info('ℹ️ 提示：请检查配置文件')
```

#### `success(message: string): void`

成功输出。

```typescript
formatter.success('操作成功完成')
formatter.success('✅ 项目构建成功')
```

#### `warning(message: string): void`

警告输出。

```typescript
formatter.warning('这是一个警告')
formatter.warning('⚠️ 配置文件不存在，使用默认配置')
```

#### `error(message: string): void`

错误输出。

```typescript
formatter.error('操作失败')
formatter.error('❌ 构建过程中发生错误')
```

### 格式化输出

#### `title(text: string): void`

标题输出。

```typescript
formatter.title('项目构建')
formatter.title('🚀 开始部署应用')
```

#### `section(text: string): void`

章节输出。

```typescript
formatter.section('准备阶段')
formatter.section('📦 安装依赖')
```

#### `list(items: string[], options?: ListOptions): void`

列表输出。

```typescript
formatter.list(['检查环境', '安装依赖', '运行测试', '构建项目'])

// 带图标的列表
formatter.list(['✅ 环境检查完成', '📦 依赖安装完成', '🧪 测试通过', '🔨 构建完成'], {
  bullet: '•',
})
```

#### `table(data: any[], options?: TableOptions): void`

表格输出。

```typescript
const data = [
  { name: 'React', version: '18.2.0', size: '42.2 KB' },
  { name: 'Vue', version: '3.3.4', size: '34.1 KB' },
  { name: 'Angular', version: '16.1.0', size: '130 KB' },
]

formatter.table(data, {
  headers: ['框架', '版本', '大小'],
  align: ['left', 'center', 'right'],
})
```

### 交互式输出

#### `spinner(text: string): Spinner`

创建加载动画。

```typescript
const spinner = formatter.spinner('正在安装依赖...')
spinner.start()

// 模拟异步操作
setTimeout(() => {
  spinner.succeed('依赖安装完成')
}, 3000)

// 或者失败
setTimeout(() => {
  spinner.fail('依赖安装失败')
}, 3000)
```

#### `progressBar(options: ProgressBarOptions): ProgressBar`

创建进度条。

```typescript
const progress = formatter.progressBar({
  total: 100,
  format: '进度 [{bar}] {percentage}% | {value}/{total} | ETA: {eta}s',
  width: 40,
})

// 更新进度
for (let i = 0; i <= 100; i++) {
  progress.update(i)
  await new Promise(resolve => setTimeout(resolve, 50))
}
```

## ProgressBar

进度条类，提供进度显示功能。

### 创建实例

#### `create(options: ProgressBarOptions): ProgressBar`

创建进度条实例。

```typescript
const progress = ProgressBar.create({
  total: 100,
  width: 50,
  format: '下载 [{bar}] {percentage}% | {value}/{total} | 速度: {rate}/s | ETA: {eta}s',
  complete: '█',
  incomplete: '░',
  renderThrottle: 16,
})
```

### 进度控制

#### `start(): void`

开始进度条。

```typescript
progress.start()
```

#### `update(value: number, payload?: any): void`

更新进度。

```typescript
// 基本更新
progress.update(50)

// 带额外数据
progress.update(75, {
  filename: 'package.json',
  speed: '1.2 MB/s',
})
```

#### `increment(delta?: number): void`

递增进度。

```typescript
progress.increment() // 增加 1
progress.increment(5) // 增加 5
```

#### `stop(): void`

停止进度条。

```typescript
progress.stop()
```

## Spinner

加载动画类，提供加载状态显示。

### 创建实例

#### `create(options?: SpinnerOptions): Spinner`

创建加载动画实例。

```typescript
const spinner = Spinner.create({
  text: '正在处理...',
  spinner: 'dots', // 动画类型
  color: 'cyan', // 颜色
  hideCursor: true, // 隐藏光标
})
```

### 动画控制

#### `start(text?: string): void`

开始动画。

```typescript
spinner.start()
spinner.start('开始处理数据...')
```

#### `stop(): void`

停止动画。

```typescript
spinner.stop()
```

#### `succeed(text?: string): void`

成功结束。

```typescript
spinner.succeed('处理完成')
```

#### `fail(text?: string): void`

失败结束。

```typescript
spinner.fail('处理失败')
```

#### `warn(text?: string): void`

警告结束。

```typescript
spinner.warn('处理完成但有警告')
```

#### `info(text?: string): void`

信息结束。

```typescript
spinner.info('处理信息')
```

## 实际应用示例

### 文件处理 CLI 工具

```typescript
class FileProcessorCLI {
  private cli = new CLIManager({
    name: 'file-processor',
    version: '1.0.0',
    description: '文件处理工具',
  })

  private formatter = OutputFormatter.create({ colors: true })

  constructor() {
    this.setupCommands()
    this.setupMiddleware()
  }

  private setupCommands() {
    // 压缩命令
    this.cli.addCommand('compress', {
      description: '压缩图片文件',
      options: [
        {
          name: 'input',
          description: '输入目录',
          type: 'string',
          required: true,
          alias: 'i',
        },
        {
          name: 'output',
          description: '输出目录',
          type: 'string',
          required: true,
          alias: 'o',
        },
        {
          name: 'quality',
          description: '压缩质量 (1-100)',
          type: 'number',
          default: 80,
        },
        {
          name: 'recursive',
          description: '递归处理子目录',
          type: 'boolean',
          alias: 'r',
        },
      ],
      action: async options => {
        await this.compressImages(options)
      },
    })

    // 转换命令
    this.cli.addCommand('convert', {
      description: '转换图片格式',
      options: [
        {
          name: 'input',
          description: '输入文件或目录',
          type: 'string',
          required: true,
        },
        {
          name: 'format',
          description: '目标格式',
          type: 'string',
          required: true,
          choices: ['jpg', 'png', 'webp', 'gif'],
        },
      ],
      action: async options => {
        await this.convertImages(options)
      },
    })

    // 信息命令
    this.cli.addCommand('info', {
      description: '显示图片信息',
      options: [
        {
          name: 'file',
          description: '图片文件路径',
          type: 'string',
          required: true,
        },
      ],
      action: async options => {
        await this.showImageInfo(options)
      },
    })
  }

  private setupMiddleware() {
    // 日志中间件
    this.cli.use(async (ctx, next) => {
      this.formatter.info(`执行命令: ${ctx.command}`)
      await next()
    })

    // 验证中间件
    this.cli.use(async (ctx, next) => {
      if (ctx.options.input && !(await FileSystem.exists(ctx.options.input))) {
        this.formatter.error(`输入路径不存在: ${ctx.options.input}`)
        return
      }
      await next()
    })
  }

  private async compressImages(options: any) {
    this.formatter.title('图片压缩')

    const files = await this.getImageFiles(options.input, options.recursive)

    if (files.length === 0) {
      this.formatter.warning('没有找到图片文件')
      return
    }

    this.formatter.info(`找到 ${files.length} 个图片文件`)

    // 确保输出目录存在
    await FileSystem.ensureDir(options.output)

    // 创建进度条
    const progress = ProgressBar.create({
      total: files.length,
      format: '压缩进度 [{bar}] {percentage}% | {value}/{total} 文件 | ETA: {eta}s',
    })

    progress.start()

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        await this.compressImage(file, options.output, options.quality)
        progress.update(i + 1, { current: file })
      } catch (error) {
        this.formatter.error(`压缩失败 ${file}: ${error.message}`)
      }
    }

    progress.stop()
    this.formatter.success(`✅ 成功压缩 ${files.length} 个文件`)
  }

  private async convertImages(options: any) {
    this.formatter.title('图片格式转换')

    const spinner = Spinner.create({
      text: '正在转换图片格式...',
      spinner: 'dots',
    })

    spinner.start()

    try {
      // 实现转换逻辑
      await new Promise(resolve => setTimeout(resolve, 2000)) // 模拟处理

      spinner.succeed('图片转换完成')
    } catch (error) {
      spinner.fail(`转换失败: ${error.message}`)
    }
  }

  private async showImageInfo(options: any) {
    this.formatter.title('图片信息')

    try {
      const stats = await FileSystem.stat(options.file)
      const imageInfo = await this.getImageMetadata(options.file)

      const data = [
        { 属性: '文件大小', 值: this.formatBytes(stats.size) },
        { 属性: '图片尺寸', 值: `${imageInfo.width} x ${imageInfo.height}` },
        { 属性: '图片格式', 值: imageInfo.format },
        { 属性: '颜色深度', 值: `${imageInfo.depth} bit` },
        { 属性: '修改时间', 值: stats.mtime.toLocaleString() },
      ]

      this.formatter.table(data)
    } catch (error) {
      this.formatter.error(`获取图片信息失败: ${error.message}`)
    }
  }

  private async getImageFiles(dir: string, recursive: boolean): Promise<string[]> {
    const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    const files = await FileSystem.readDir(dir, { recursive })
    return files.filter(file => extensions.some(ext => file.toLowerCase().endsWith(ext)))
  }

  private async compressImage(input: string, outputDir: string, quality: number) {
    // 实现图片压缩逻辑
    const filename = FileSystem.basename(input)
    const outputPath = FileSystem.join(outputDir, filename)
    await FileSystem.copy(input, outputPath) // 简化实现
  }

  private async getImageMetadata(file: string) {
    // 实现图片元数据读取
    return {
      width: 1920,
      height: 1080,
      format: 'JPEG',
      depth: 24,
    }
  }

  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`
  }

  run() {
    this.cli.parse()
  }
}

// 启动 CLI
const cli = new FileProcessorCLI()
cli.run()
```

### 项目管理 CLI

```typescript
class ProjectManagerCLI {
  private cli = new CLIManager({
    name: 'pm',
    version: '2.0.0',
    description: '项目管理工具',
  })

  private formatter = OutputFormatter.create({ colors: true })

  constructor() {
    this.setupCommands()
  }

  private setupCommands() {
    // 初始化项目
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
      ],
      action: async options => {
        await this.initProject(options)
      },
    })

    // 构建项目
    this.cli.addCommand('build', {
      description: '构建项目',
      options: [
        {
          name: 'env',
          description: '构建环境',
          type: 'string',
          choices: ['development', 'production'],
          default: 'production',
        },
        {
          name: 'watch',
          description: '监听模式',
          type: 'boolean',
          alias: 'w',
        },
      ],
      action: async options => {
        await this.buildProject(options)
      },
    })

    // 部署项目
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
      ],
      action: async options => {
        await this.deployProject(options)
      },
    })
  }

  private async initProject(options: any) {
    this.formatter.title(`🚀 初始化项目: ${options.name}`)

    const steps = [
      '创建项目目录',
      '初始化 package.json',
      '安装依赖',
      '创建项目结构',
      '配置开发环境',
    ]

    for (let i = 0; i < steps.length; i++) {
      const spinner = Spinner.create({ text: steps[i] })
      spinner.start()

      // 模拟处理时间
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

      spinner.succeed(steps[i])
    }

    this.formatter.success(`✅ 项目 ${options.name} 初始化完成`)

    this.formatter.section('下一步')
    this.formatter.list([`cd ${options.name}`, 'pm build', 'pm deploy staging'])
  }

  private async buildProject(options: any) {
    this.formatter.title('🔨 构建项目')

    const progress = ProgressBar.create({
      total: 100,
      format: '构建进度 [{bar}] {percentage}% | {stage}',
    })

    const stages = [
      { name: '清理输出目录', duration: 500 },
      { name: '编译 TypeScript', duration: 2000 },
      { name: '打包资源', duration: 3000 },
      { name: '优化代码', duration: 1500 },
      { name: '生成 Source Map', duration: 800 },
    ]

    progress.start()
    let currentProgress = 0

    for (const stage of stages) {
      const stageProgress = 100 / stages.length
      const steps = 20

      for (let i = 0; i < steps; i++) {
        await new Promise(resolve => setTimeout(resolve, stage.duration / steps))
        currentProgress += stageProgress / steps
        progress.update(Math.min(currentProgress, 100), { stage: stage.name })
      }
    }

    progress.stop()
    this.formatter.success('✅ 项目构建完成')
  }

  private async deployProject(options: any) {
    this.formatter.title(`🚀 部署到 ${options.target}`)

    if (!options.force) {
      this.formatter.warning('⚠️ 即将部署到生产环境，请确认操作')
      // 这里可以添加确认逻辑
    }

    const deploySteps = ['检查部署权限', '上传文件', '更新配置', '重启服务', '健康检查']

    for (const step of deploySteps) {
      const spinner = Spinner.create({ text: step })
      spinner.start()

      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

      spinner.succeed(step)
    }

    this.formatter.success(`✅ 成功部署到 ${options.target}`)
  }

  run() {
    this.cli.parse()
  }
}
```

## 类型定义

```typescript
interface CLIOptions {
  name: string
  version: string
  description?: string
  usage?: string
  helpOption?: string
  versionOption?: string
  colors?: boolean
  suggestions?: boolean
  exitOnError?: boolean
}

interface CommandConfig {
  description: string
  options?: OptionConfig[]
  action: (options: any, args: string[]) => Promise<void> | void
}

interface OptionConfig {
  name: string
  description: string
  type: 'string' | 'number' | 'boolean'
  required?: boolean
  default?: any
  alias?: string
  choices?: string[]
}

interface ProgressBarOptions {
  total: number
  width?: number
  format?: string
  complete?: string
  incomplete?: string
  renderThrottle?: number
}

interface SpinnerOptions {
  text?: string
  spinner?: string
  color?: string
  hideCursor?: boolean
}

type CLIMiddleware = (ctx: CLIContext, next: () => Promise<void>) => Promise<void>
type LogLevel = 'info' | 'warn' | 'error' | 'success'
```

## 最佳实践

1. **命令设计**: 使用清晰、一致的命令命名
2. **选项验证**: 验证用户输入的选项和参数
3. **错误处理**: 提供友好的错误消息和建议
4. **进度反馈**: 为长时间操作提供进度指示
5. **帮助文档**: 提供详细的帮助信息和示例

## 示例应用

查看 [使用示例](/examples/cli-development) 了解更多 CLI 工具开发的实际应用场景。
