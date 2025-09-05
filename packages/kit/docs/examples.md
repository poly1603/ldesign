# @ldesign/kit 使用示例

本文档提供了 @ldesign/kit 各个模块的实际使用示例。

## 目录

- [文件处理示例](#文件处理示例)
- [缓存应用示例](#缓存应用示例)
- [数据验证示例](#数据验证示例)
- [Git 自动化示例](#git-自动化示例)
- [包管理示例](#包管理示例)
- [SSL 证书示例](#ssl-证书示例)
- [CLI 应用示例](#cli-应用示例)
- [系统通知示例](#系统通知示例)
- [性能监控示例](#性能监控示例)

## 文件处理示例

### 批量文件处理

```typescript
import { FileSystem, StringUtils } from '@ldesign/kit'

async function processMarkdownFiles() {
  // 读取所有 markdown 文件
  const files = await FileSystem.readDir('./docs', {
    recursive: true,
    filter: file => file.endsWith('.md'),
  })

  for (const file of files) {
    const content = await FileSystem.readFile(file)

    // 处理文件内容
    const processedContent = content
      .split('\n')
      .map(line => {
        // 转换标题为 slug 格式
        if (line.startsWith('#')) {
          const title = line.replace(/^#+\s*/, '')
          const slug = StringUtils.slugify(title)
          return `${line} {#${slug}}`
        }
        return line
      })
      .join('\n')

    // 写回文件
    await FileSystem.writeFile(file, processedContent)
  }
}
```

### 文件监听和自动处理

```typescript
import { FileWatcher, FileSystem } from '@ldesign/kit'

function setupFileWatcher() {
  const watcher = FileWatcher.create('./src', {
    recursive: true,
    ignored: /node_modules/,
  })

  watcher.on('change', async filePath => {
    console.log(`文件变更: ${filePath}`)

    if (filePath.endsWith('.ts')) {
      // TypeScript 文件变更，触发编译
      await compileTypeScript(filePath)
    }
  })

  watcher.on('add', async filePath => {
    console.log(`新文件: ${filePath}`)

    if (filePath.endsWith('.md')) {
      // 新增 markdown 文件，生成目录
      await updateTableOfContents()
    }
  })
}
```

## 缓存应用示例

### API 响应缓存

```typescript
import { CacheManager } from '@ldesign/kit'

class APIService {
  private cache = CacheManager.create({
    defaultTTL: 300, // 5分钟
    maxSize: 1000,
  })

  async getUserProfile(userId: string) {
    const cacheKey = `user:profile:${userId}`

    // 尝试从缓存获取
    const cached = await this.cache.get(cacheKey)
    if (cached) {
      return cached
    }

    // 缓存未命中，从 API 获取
    const profile = await this.fetchUserFromAPI(userId)

    // 存入缓存
    await this.cache.set(cacheKey, profile, 600) // 10分钟缓存

    return profile
  }

  async getExpensiveData(key: string) {
    return this.cache.getOrSet(
      `expensive:${key}`,
      async () => {
        // 这个函数只在缓存未命中时执行
        return await this.computeExpensiveData(key)
      },
      3600
    ) // 1小时缓存
  }

  private async fetchUserFromAPI(userId: string) {
    // 模拟 API 调用
    const response = await fetch(`/api/users/${userId}`)
    return response.json()
  }

  private async computeExpensiveData(key: string) {
    // 模拟耗时计算
    await new Promise(resolve => setTimeout(resolve, 2000))
    return { key, result: Math.random() }
  }
}
```

## 数据验证示例

### 用户注册表单验证

```typescript
import { Validator, ValidationRules } from '@ldesign/kit'

class UserRegistrationValidator {
  private validator = Validator.create()

  constructor() {
    this.setupRules()
  }

  private setupRules() {
    // 用户名验证
    this.validator.addRule('username', ValidationRules.required('用户名不能为空'))
    this.validator.addRule('username', ValidationRules.minLength(3, '用户名至少3个字符'))
    this.validator.addRule(
      'username',
      ValidationRules.pattern(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线')
    )

    // 邮箱验证
    this.validator.addRule('email', ValidationRules.required('邮箱不能为空'))
    this.validator.addRule('email', ValidationRules.email('邮箱格式不正确'))

    // 密码验证
    this.validator.addRule('password', ValidationRules.required('密码不能为空'))
    this.validator.addRule('password', ValidationRules.minLength(8, '密码至少8个字符'))
    this.validator.addRule(
      'password',
      ValidationRules.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字')
    )

    // 确认密码验证
    this.validator.addRule('confirmPassword', ValidationRules.required('请确认密码'))
    this.validator.addRule('confirmPassword', (value, data) => {
      return value === data.password ? true : '两次密码输入不一致'
    })

    // 年龄验证
    this.validator.addRule('age', ValidationRules.required('年龄不能为空'))
    this.validator.addRule('age', ValidationRules.range(18, 120, '年龄必须在18-120之间'))
  }

  async validateRegistration(userData: any) {
    const result = await this.validator.validate(userData)

    if (!result.valid) {
      throw new Error(`验证失败: ${result.errors.join(', ')}`)
    }

    return result
  }
}

// 使用示例
async function handleUserRegistration() {
  const validator = new UserRegistrationValidator()

  const userData = {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'SecurePass123',
    confirmPassword: 'SecurePass123',
    age: 25,
  }

  try {
    await validator.validateRegistration(userData)
    console.log('验证通过，可以注册用户')
  } catch (error) {
    console.error('验证失败:', error.message)
  }
}
```

## Git 自动化示例

### 自动化发布流程

```typescript
import { GitManager, PackageManager, NotificationUtils } from '@ldesign/kit'

class ReleaseManager {
  private git = new GitManager()
  private packageManager = new PackageManager()

  async performRelease(versionType: 'patch' | 'minor' | 'major') {
    try {
      // 1. 检查工作区是否干净
      const status = await this.git.status()
      if (!status.clean) {
        throw new Error('工作区不干净，请先提交或暂存更改')
      }

      // 2. 拉取最新代码
      await this.git.pull()

      // 3. 运行测试
      await this.packageManager.runScript('test')

      // 4. 更新版本号
      await this.packageManager.bumpVersion(versionType)
      const pkg = await this.packageManager.readPackageJson()
      const newVersion = pkg.version

      // 5. 构建项目
      await this.packageManager.runScript('build')

      // 6. 提交版本更新
      await this.git.add('.')
      await this.git.commit(`chore: release v${newVersion}`)

      // 7. 创建标签
      await this.git.tag(`v${newVersion}`)

      // 8. 推送到远程
      await this.git.push()
      await this.git.pushTags()

      // 9. 发布到 npm
      await this.packageManager.publish()

      // 10. 发送通知
      await NotificationUtils.success('发布成功', `版本 v${newVersion} 已成功发布`)

      console.log(`✅ 版本 v${newVersion} 发布成功`)
    } catch (error) {
      await NotificationUtils.error('发布失败', error.message)
      throw error
    }
  }
}
```

## 包管理示例

### 项目初始化脚手架

```typescript
import { PackageManager, FileSystem, InquirerUtils } from '@ldesign/kit'

class ProjectScaffold {
  async createProject() {
    // 1. 收集项目信息
    const projectName = await InquirerUtils.input('项目名称:')
    const projectType = await InquirerUtils.select('项目类型:', [
      { name: 'Web 应用', value: 'web' },
      { name: 'Node.js 库', value: 'library' },
      { name: 'CLI 工具', value: 'cli' },
    ])

    const features = await InquirerUtils.multiSelect('选择功能:', [
      { name: 'TypeScript', value: 'typescript' },
      { name: 'ESLint', value: 'eslint' },
      { name: 'Prettier', value: 'prettier' },
      { name: 'Jest', value: 'jest' },
      { name: 'Husky', value: 'husky' },
    ])

    // 2. 创建项目目录
    await FileSystem.ensureDir(projectName)
    const projectPath = `./${projectName}`

    // 3. 初始化 package.json
    const packageManager = new PackageManager(projectPath)
    await packageManager.init({
      name: projectName,
      version: '1.0.0',
      description: '',
      main: projectType === 'library' ? 'dist/index.js' : undefined,
      bin: projectType === 'cli' ? { [projectName]: 'bin/cli.js' } : undefined,
    })

    // 4. 安装依赖
    if (features.includes('typescript')) {
      await packageManager.addDependency('typescript', '^5.0.0', { dev: true })
      await packageManager.addDependency('@types/node', '^20.0.0', { dev: true })
    }

    if (features.includes('eslint')) {
      await packageManager.addDependency('eslint', '^8.0.0', { dev: true })
    }

    if (features.includes('prettier')) {
      await packageManager.addDependency('prettier', '^3.0.0', { dev: true })
    }

    if (features.includes('jest')) {
      await packageManager.addDependency('jest', '^29.0.0', { dev: true })
      if (features.includes('typescript')) {
        await packageManager.addDependency('ts-jest', '^29.0.0', { dev: true })
      }
    }

    // 5. 创建项目文件
    await this.createProjectFiles(projectPath, projectType, features)

    // 6. 添加脚本
    await this.addScripts(packageManager, projectType, features)

    console.log(`✅ 项目 ${projectName} 创建成功`)
  }

  private async createProjectFiles(projectPath: string, type: string, features: string[]) {
    // 创建基本目录结构
    await FileSystem.ensureDir(`${projectPath}/src`)

    if (type === 'web') {
      await FileSystem.ensureDir(`${projectPath}/public`)
    }

    if (features.includes('jest')) {
      await FileSystem.ensureDir(`${projectPath}/tests`)
    }

    // 创建入口文件
    const entryFile = features.includes('typescript') ? 'src/index.ts' : 'src/index.js'
    await FileSystem.writeFile(
      `${projectPath}/${entryFile}`,
      type === 'cli'
        ? '#!/usr/bin/env node\n\nconsole.log("Hello CLI!")\n'
        : 'console.log("Hello World!")\n'
    )

    // 创建 TypeScript 配置
    if (features.includes('typescript')) {
      await FileSystem.writeFile(
        `${projectPath}/tsconfig.json`,
        JSON.stringify(
          {
            compilerOptions: {
              target: 'ES2020',
              module: 'commonjs',
              outDir: './dist',
              rootDir: './src',
              strict: true,
              esModuleInterop: true,
            },
            include: ['src/**/*'],
            exclude: ['node_modules', 'dist'],
          },
          null,
          2
        )
      )
    }
  }

  private async addScripts(packageManager: PackageManager, type: string, features: string[]) {
    if (features.includes('typescript')) {
      await packageManager.addScript('build', 'tsc')
      await packageManager.addScript('dev', 'tsc --watch')
    }

    if (features.includes('jest')) {
      await packageManager.addScript('test', 'jest')
      await packageManager.addScript('test:watch', 'jest --watch')
    }

    if (features.includes('eslint')) {
      await packageManager.addScript('lint', 'eslint src/**/*.{js,ts}')
      await packageManager.addScript('lint:fix', 'eslint src/**/*.{js,ts} --fix')
    }

    if (type === 'web') {
      await packageManager.addScript('start', 'node dist/index.js')
    }
  }
}
```

## SSL 证书示例

### 开发环境 HTTPS 服务器

```typescript
import { SSLUtils, FileSystem } from '@ldesign/kit'
import https from 'https'
import express from 'express'

class HTTPSDevServer {
  async start() {
    // 1. 生成开发用的自签名证书
    const cert = await SSLUtils.generateQuickCertificate({
      commonName: 'localhost',
      organization: 'Development',
      validityDays: 365,
    })

    // 2. 保存证书文件
    await FileSystem.ensureDir('./certs')
    await FileSystem.writeFile('./certs/cert.pem', cert.certificate)
    await FileSystem.writeFile('./certs/key.pem', cert.privateKey)

    // 3. 创建 Express 应用
    const app = express()

    app.get('/', (req, res) => {
      res.json({ message: 'HTTPS 开发服务器运行中' })
    })

    // 4. 创建 HTTPS 服务器
    const server = https.createServer(
      {
        cert: cert.certificate,
        key: cert.privateKey,
      },
      app
    )

    // 5. 启动服务器
    server.listen(3443, () => {
      console.log('HTTPS 开发服务器启动在 https://localhost:3443')
      console.log('注意: 这是自签名证书，浏览器会显示安全警告')
    })

    return server
  }
}
```

## CLI 应用示例

### 文件处理 CLI 工具

```typescript
import { CLIManager, OutputFormatter, ProgressBar, InquirerUtils } from '@ldesign/kit'
import { FileSystem } from '@ldesign/kit'

class FileProcessorCLI {
  private cli = new CLIManager({
    name: 'file-processor',
    version: '1.0.0',
    description: '文件处理工具',
  })

  private formatter = OutputFormatter.create({ colors: true })

  constructor() {
    this.setupCommands()
  }

  private setupCommands() {
    // 压缩命令
    this.cli.addCommand('compress', {
      description: '压缩图片文件',
      options: [
        { name: 'input', description: '输入目录', type: 'string', required: true },
        { name: 'output', description: '输出目录', type: 'string', required: true },
        { name: 'quality', description: '压缩质量 (1-100)', type: 'number', default: 80 },
      ],
      action: async options => {
        await this.compressImages(options.input, options.output, options.quality)
      },
    })

    // 清理命令
    this.cli.addCommand('clean', {
      description: '清理临时文件',
      options: [
        { name: 'path', description: '清理路径', type: 'string', default: '.' },
        { name: 'dry-run', description: '预览模式', type: 'boolean' },
      ],
      action: async options => {
        await this.cleanTempFiles(options.path, options['dry-run'])
      },
    })
  }

  private async compressImages(inputDir: string, outputDir: string, quality: number) {
    try {
      this.formatter.info(`开始压缩图片: ${inputDir} -> ${outputDir}`)

      // 获取所有图片文件
      const files = await FileSystem.readDir(inputDir, {
        recursive: true,
        filter: file => /\.(jpg|jpeg|png|webp)$/i.test(file),
      })

      if (files.length === 0) {
        this.formatter.warning('没有找到图片文件')
        return
      }

      // 确保输出目录存在
      await FileSystem.ensureDir(outputDir)

      // 创建进度条
      const progress = ProgressBar.create({
        total: files.length,
        format: '压缩进度 [{bar}] {percentage}% | {value}/{total} 文件',
      })

      // 处理每个文件
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        await this.compressImage(file, outputDir, quality)
        progress.update(i + 1)
      }

      this.formatter.success(`✅ 成功压缩 ${files.length} 个文件`)
    } catch (error) {
      this.formatter.error(`压缩失败: ${error.message}`)
      process.exit(1)
    }
  }

  private async cleanTempFiles(path: string, dryRun: boolean) {
    const tempPatterns = [
      '**/*.tmp',
      '**/*.temp',
      '**/node_modules/.cache/**',
      '**/.DS_Store',
      '**/Thumbs.db',
    ]

    this.formatter.info(`${dryRun ? '预览' : '清理'}临时文件: ${path}`)

    let totalSize = 0
    let fileCount = 0

    for (const pattern of tempPatterns) {
      const files = await this.findFilesByPattern(path, pattern)

      for (const file of files) {
        const stats = await FileSystem.stat(file)
        totalSize += stats.size
        fileCount++

        if (dryRun) {
          this.formatter.info(`  将删除: ${file} (${this.formatBytes(stats.size)})`)
        } else {
          await FileSystem.remove(file)
          this.formatter.info(`  已删除: ${file}`)
        }
      }
    }

    const action = dryRun ? '将清理' : '已清理'
    this.formatter.success(
      `${action} ${fileCount} 个文件，释放 ${this.formatBytes(totalSize)} 空间`
    )
  }

  private async compressImage(inputFile: string, outputDir: string, quality: number) {
    // 这里应该实现实际的图片压缩逻辑
    // 为了示例，我们只是复制文件
    const fileName = inputFile.split('/').pop()
    const outputFile = `${outputDir}/${fileName}`
    await FileSystem.copy(inputFile, outputFile)
  }

  private async findFilesByPattern(basePath: string, pattern: string): Promise<string[]> {
    // 简化的模式匹配实现
    // 实际项目中应该使用 glob 库
    const allFiles = await FileSystem.readDir(basePath, { recursive: true })
    return allFiles.filter(file => {
      const simplePattern = pattern.replace('**/', '').replace('*', '')
      return file.includes(simplePattern)
    })
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

这些示例展示了如何在实际项目中使用 @ldesign/kit 的各个模块。每个示例都包含了完整的代码和详细的注释，可以直接在项目中使用或作为参考。
