# @ldesign/kit

一个功能强大的 TypeScript 工具包，提供了构建现代应用程序所需的核心功能模块。

## 🚀 特性

### 核心功能
- **🛠️ 工具集合** - 丰富的实用工具函数
- **📁 文件系统** - 完整的文件操作和管理
- **💾 缓存系统** - 多层缓存解决方案
- **✅ 验证系统** - 数据验证和表单验证
- **📦 压缩归档** - 文件压缩和解压缩
- **🔧 Git 操作** - Git 仓库管理和操作
- **📦 包管理** - NPM 包管理和依赖处理
- **🔒 SSL 证书** - SSL 证书生成和管理
- **💻 CLI 工具** - 命令行界面和交互工具
- **❓ 交互询问** - 用户输入和选择界面
- **🔔 系统通知** - 跨平台系统通知
- **⚡ 性能监控** - 性能测试和监控工具
- **🏗️ 脚手架系统** - 项目模板和脚手架管理
- **🎨 控制台 UI** - 进度条、加载动画、状态指示器
- **⚡ 构建工具** - Vite 和 Rollup 构建器封装

### 新增功能 🆕
- **📝 JSON 工具** - 安全解析、深度克隆、对象操作
- **🔐 Base64 工具** - 编码解码、URL安全编码
- **🌍 环境变量** - 类型安全读取、验证、.env支持
- **🗂️ 数据结构** - Queue、Stack、LinkedList、LRU缓存
- **🧪 测试工具** - Mock、Spy、Stub、数据生成
- **🔒 安全工具** - 加密、哈希、Token生成、密码强度
- **❌ 错误处理** - 统一错误系统、错误码、重试机制
- **🚀 Promise 工具** - 并发控制、重试、超时、批处理
- **📐 正则工具** - 常用正则、验证、提取、模糊匹配
- **🎨 格式化工具** - 数字、货币、日期、文件大小格式化
- **✨ 装饰器工具** - 缓存、防抖、节流、重试等装饰器

## 📦 安装

```bash
npm install @ldesign/kit
# 或
yarn add @ldesign/kit
# 或
pnpm add @ldesign/kit
```

## 🎯 快速开始

```typescript
import {
  // 核心工具
  StringUtils,
  FileSystem,
  CacheManager,
  Validator,
  // 新增工具
  JsonUtils,
  Base64Utils,
  EnvUtils,
  ErrorUtils,
  SecurityUtils,
  HashUtils,
  TokenUtils,
  Queue,
  LRUCache,
} from '@ldesign/kit'

// 字符串工具
const slug = StringUtils.slugify('Hello World') // 'hello-world'
const camelCase = StringUtils.camelCase('hello-world') // 'helloWorld'

// 文件系统操作
await FileSystem.ensureDir('./data')
await FileSystem.writeFile('./data/config.json', JSON.stringify({ app: 'test' }))

// JSON 工具 🆕
const config = await JsonUtils.parseFile('./config.json')
const merged = JsonUtils.deepMerge(defaultConfig, userConfig)

// 环境变量 🆕
const port = EnvUtils.getNumber('PORT', 3000)
const debug = EnvUtils.getBoolean('DEBUG', false)
await EnvUtils.load('.env')

// 缓存管理
const cache = CacheManager.create()
await cache.set('user:123', { name: 'John', age: 30 }, 3600)

// LRU 缓存 🆕
const lruCache = new LRUCache<string, User>(1000)
lruCache.set('user:123', user)

// 错误处理 🆕
try {
  await riskyOperation()
} catch (error) {
  await ErrorUtils.handle(error)
}

// 安全工具 🆕
const encrypted = SecurityUtils.encrypt('secret data', 'key')
const hash = await HashUtils.hashPassword('password123')
const token = TokenUtils.generateToken(32)

// Base64 编码 🆕
const encoded = Base64Utils.encode('Hello World')
const tokenData = Base64Utils.encodeObject({ userId: 123 })

// 队列 🆕
const queue = new Queue<Task>()
queue.enqueue(task)
const nextTask = queue.dequeue()

// Promise 工具 🆕
const results = await PromiseUtils.mapLimit(items, 5, async (item) => {
  return await processItem(item)
})

// 正则验证 🆕
const isValid = RegexUtils.isEmail('user@example.com')
const urls = RegexUtils.extractUrls(text)

// 格式化 🆕
const size = FormatUtils.fileSize(1024 * 1024) // '1.00 MB'
const price = FormatUtils.currency(1234.56, 'USD') // '$1,234.56'

// 装饰器 🆕
class MyService {
  @memoize({ ttl: 60000 })
  async fetchData(id: number) {
    return await api.get(`/data/${id}`)
  }
}
```

## 📚 模块文档

### 🛠️ 工具模块 (Utils)

提供各种实用工具函数：

```typescript
import { StringUtils, NumberUtils, DateUtils, ObjectUtils, ArrayUtils } from '@ldesign/kit'

// 字符串工具
StringUtils.camelCase('hello-world') // 'helloWorld'
StringUtils.slugify('Hello World!') // 'hello-world'
StringUtils.truncate('很长的文本内容', 10) // '很长的文本内容...'
StringUtils.capitalize('hello world') // 'Hello World'

// 数字工具
NumberUtils.formatCurrency(1234.56) // '$1,234.56'
NumberUtils.clamp(15, 0, 10) // 10
NumberUtils.random(1, 100) // 随机数 1-100
NumberUtils.round(3.14159, 2) // 3.14

// 日期工具
DateUtils.format(new Date(), 'YYYY-MM-DD') // '2024-01-01'
DateUtils.addDays(new Date(), 7) // 7天后的日期
DateUtils.isWeekend(new Date()) // true/false
DateUtils.diffInDays(date1, date2) // 天数差

// 对象工具
ObjectUtils.deepMerge(obj1, obj2)
ObjectUtils.get(obj, 'user.profile.name')
ObjectUtils.omit(obj, ['password', 'secret'])
ObjectUtils.pick(obj, ['id', 'name', 'email'])

// 数组工具
ArrayUtils.unique([1, 2, 2, 3]) // [1, 2, 3]
ArrayUtils.chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
ArrayUtils.groupBy(users, 'role') // 按角色分组
```

### 📁 文件系统模块 (FileSystem)

完整的文件和目录操作：

```typescript
import { FileSystem, FileWatcher } from '@ldesign/kit'

// 文件操作
await FileSystem.copy('./src', './dist')
await FileSystem.move('./old.txt', './new.txt')
const stats = await FileSystem.stat('./file.txt')
const content = await FileSystem.readFile('./config.json')
await FileSystem.writeFile('./output.txt', 'Hello World')

// 目录操作
await FileSystem.ensureDir('./data/logs')
const files = await FileSystem.readDir('./src', { recursive: true })
await FileSystem.removeDir('./temp')

// 路径操作
const resolved = FileSystem.resolvePath('./relative/path')
const relative = FileSystem.relativePath('/base', '/base/sub/file.txt')

// 权限检查
const canRead = await FileSystem.canRead('./file.txt')
const canWrite = await FileSystem.canWrite('./file.txt')

// 文件监听
const watcher = FileWatcher.create('./src')
watcher.on('change', path => {
  console.log(`文件变更: ${path}`)
})
watcher.on('add', path => {
  console.log(`文件添加: ${path}`)
})
```

### 💾 缓存模块 (Cache)

多层缓存解决方案：

```typescript
import { CacheManager, MemoryCache, FileCache } from '@ldesign/kit'

// 内存缓存
const memoryCache = MemoryCache.create({
  maxSize: 1000,
  ttl: 3600, // 默认1小时过期
})

await memoryCache.set('user:123', { name: 'John', age: 30 })
const user = await memoryCache.get('user:123')

// 文件缓存
const fileCache = FileCache.create({
  cacheDir: './cache',
  maxSize: 100 * 1024 * 1024, // 100MB
})

// 缓存管理器
const cache = CacheManager.create()
cache.addStore('memory', memoryCache)
cache.addStore('file', fileCache)

// 使用缓存
await cache.set('expensive:data', computedData, 7200) // 2小时过期
const data = await cache.get('expensive:data')

// 缓存穿透保护
const result = await cache.getOrSet(
  'user:profile:123',
  async () => {
    return await fetchUserProfile(123)
  },
  1800
) // 30分钟缓存

// 批量操作
await cache.setMany({
  key1: 'value1',
  key2: 'value2',
})
const values = await cache.getMany(['key1', 'key2'])
```

### ✅ 验证模块 (Validation)

数据验证和表单验证：

```typescript
import { Validator, ValidationRules, FormValidator } from '@ldesign/kit'

// 基础验证
const validator = Validator.create()
validator.addRule('email', ValidationRules.email())
validator.addRule(
  'password',
  ValidationRules.password({
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
  })
)

const result = await validator.validate({
  email: 'user@example.com',
  password: 'SecurePass123',
})

// 自定义验证规则
validator.addRule('username', value => {
  if (value.length < 3) return '用户名至少3个字符'
  if (!/^[a-zA-Z0-9_]+$/.test(value)) return '用户名只能包含字母、数字和下划线'
  return true
})

// 表单验证
const formValidator = FormValidator.create()
formValidator.addFieldRule('email', ValidationRules.required())
formValidator.addFieldRule('email', ValidationRules.email())
formValidator.addFieldRule('confirmPassword', ValidationRules.confirmPassword('password'))

const formResult = await formValidator.validateForm({
  email: 'user@example.com',
  password: 'password123',
  confirmPassword: 'password123',
})
```

### 🔧 Git 模块 (Git)

Git 仓库管理和操作：

```typescript
import { GitManager, GitUtils } from '@ldesign/kit'

// Git 管理
const git = new GitManager('./my-project')

// 初始化仓库
await git.init()
await git.setConfig('user.name', 'John Doe')
await git.setConfig('user.email', 'john@example.com')

// 基本操作
await git.add('.')
const commitHash = await git.commit('Initial commit')
await git.push('origin', 'main')

// 分支操作
await git.createBranch('feature/new-feature')
await git.checkout('feature/new-feature')
await git.merge('main')

// 状态查询
const status = await git.status()
console.log('未跟踪文件:', status.untracked)
console.log('已修改文件:', status.unstaged)

// 提交历史
const commits = await git.log({ limit: 10 })
commits.forEach(commit => {
  console.log(`${commit.hash}: ${commit.message}`)
})

// 远程仓库
await git.addRemote('origin', 'https://github.com/user/repo.git')
const remotes = await git.remotes()

// 工具函数
const isRepo = await GitUtils.isRepository('./project')
const root = await GitUtils.findRepositoryRoot('./project/sub/dir')
```

### 📦 包管理模块 (Package)

NPM 包管理和依赖处理：

```typescript
import { PackageManager, PackageUtils } from '@ldesign/kit'

// 包管理
const packageManager = new PackageManager('./my-project')

// 读取和更新 package.json
const pkg = await packageManager.readPackageJson()
await packageManager.updatePackageJson({
  version: '1.1.0',
  description: '更新的描述',
})

// 依赖管理
await packageManager.addDependency('lodash', '^4.17.21')
await packageManager.addDependency('typescript', '^5.0.0', { dev: true })
await packageManager.removeDependency('old-package')

// 脚本管理
await packageManager.addScript('dev', 'vite')
await packageManager.runScript('build')
const scripts = await packageManager.getScripts()

// 版本管理
await packageManager.bumpVersion('patch') // 1.0.0 -> 1.0.1
await packageManager.updateVersion('2.0.0')

// 包安装
await packageManager.install()
await packageManager.installPackage('express')
await packageManager.uninstallPackage('unused-package')

// 工具函数
const parsed = PackageUtils.parsePackageName('@types/node@18.0.0')
const isValid = PackageUtils.isValidVersion('1.0.0')
const comparison = PackageUtils.compareVersions('1.0.0', '1.1.0')
```

### 🔒 SSL 模块 (SSL)

SSL 证书生成和管理：

```typescript
import { SSLManager, SSLUtils } from '@ldesign/kit'

// SSL 管理
const sslManager = new SSLManager({
  keySize: 2048,
  validityDays: 365,
})

// 生成密钥对
const keyPair = await sslManager.generateKeyPair()

// 生成自签名证书
const certificate = await sslManager.generateSelfSignedCertificate(keyPair, {
  subject: {
    commonName: 'localhost',
    organization: 'My Company',
    country: 'US',
  },
})

// 验证证书
const validation = await sslManager.verifyCertificate(certificate)
console.log('证书有效:', validation.valid)

// 快速生成证书
const quickCert = await SSLUtils.generateQuickCertificate({
  commonName: 'example.com',
  organization: 'Example Corp',
})

// 证书分析
const strength = SSLUtils.analyzeCertificateStrength(certificate)
console.log('安全评分:', strength.score)

// 域名验证
const matches = SSLUtils.validateDomainMatch(certificate, 'localhost')
console.log('域名匹配:', matches)
```

### 💻 CLI 模块 (CLI)

命令行界面和交互工具：

```typescript
import { CLIManager, OutputFormatter, ProgressBar, Table } from '@ldesign/kit'

// CLI 管理
const cli = new CLIManager({
  name: 'my-app',
  version: '1.0.0',
  description: '我的命令行应用',
})

// 添加命令
cli.addCommand('build', {
  description: '构建项目',
  options: [
    { name: 'env', description: '环境', type: 'string', default: 'production' },
    { name: 'watch', description: '监听模式', type: 'boolean' },
  ],
  action: async options => {
    console.log(`构建环境: ${options.env}`)
    if (options.watch) {
      console.log('启用监听模式')
    }
  },
})

// 输出格式化
const formatter = OutputFormatter.create({ colors: true })
formatter.success('操作成功完成!')
formatter.error('发生错误:', error.message)
formatter.warning('警告信息')
formatter.info('提示信息')

// 进度条
const progress = ProgressBar.create({
  total: 100,
  format: '进度 [{bar}] {percentage}% | {value}/{total}',
})

for (let i = 0; i <= 100; i++) {
  progress.update(i)
  await new Promise(resolve => setTimeout(resolve, 50))
}

// 表格显示
const table = Table.create({
  head: ['ID', '名称', '状态', '创建时间'],
  colWidths: [10, 20, 10, 20],
})

table.push(['1', 'John Doe', '活跃', '2024-01-01'])
table.push(['2', 'Jane Smith', '禁用', '2024-01-02'])
console.log(table.toString())
```

### ❓ 交互询问模块 (Inquirer)

用户输入和选择界面：

```typescript
import { InquirerManager, InquirerUtils } from '@ldesign/kit'

// 交互管理器
const inquirer = InquirerManager.create()

// 文本输入
const name = await inquirer.input({
  message: '请输入您的姓名:',
  validate: input => (input.length > 0 ? true : '姓名不能为空'),
})

// 密码输入
const password = await inquirer.password({
  message: '请输入密码:',
  mask: '*',
})

// 确认询问
const confirmed = await inquirer.confirm({
  message: '确定要继续吗?',
  default: true,
})

// 单选列表
const framework = await inquirer.select({
  message: '选择前端框架:',
  choices: [
    { name: 'React', value: 'react' },
    { name: 'Vue', value: 'vue' },
    { name: 'Angular', value: 'angular' },
  ],
})

// 多选列表
const features = await inquirer.multiSelect({
  message: '选择需要的功能:',
  choices: [
    { name: 'TypeScript', value: 'typescript' },
    { name: 'ESLint', value: 'eslint' },
    { name: 'Prettier', value: 'prettier' },
  ],
})

// 快速工具函数
const email = await InquirerUtils.input('请输入邮箱:')
const choice = await InquirerUtils.select('选择操作:', ['创建', '更新', '删除'])
```

### 🔔 系统通知模块 (Notification)

跨平台系统通知：

```typescript
import { NotificationManager, NotificationUtils } from '@ldesign/kit'

// 通知管理器
const notificationManager = NotificationManager.create({
  appName: 'My App',
  sound: true,
})

// 发送通知
await notificationManager.notify({
  title: '任务完成',
  message: '所有文件已成功处理',
  type: 'success',
})

// 快速通知
await notificationManager.success('操作成功', '数据已保存')
await notificationManager.error('操作失败', '网络连接错误')
await notificationManager.warning('注意', '磁盘空间不足')
await notificationManager.info('提示', '有新版本可用')

// 通知历史
const history = notificationManager.getHistory(10)
const unreadCount = notificationManager.getUnreadCount()

// 快速工具函数
await NotificationUtils.success('构建完成', '项目构建成功')
await NotificationUtils.error('构建失败', '编译错误')

// 检查通知权限
const permission = await notificationManager.checkPermission()
if (permission !== 'granted') {
  await notificationManager.requestPermission()
}

// 批量通知
await NotificationUtils.notifyBatch([
  { title: '任务1', message: '已完成' },
  { title: '任务2', message: '已完成' },
  { title: '任务3', message: '已完成' },
])
```

### ⚡ 性能监控模块 (Performance)

性能测试和监控工具：

```typescript
import { PerformanceMonitor, PerformanceUtils } from '@ldesign/kit'

// 性能监控器
const monitor = PerformanceMonitor.create({
  maxMetrics: 1000,
  enableMemory: true,
  enableCPU: true,
})

// 计时器
monitor.startTimer('database-query')
const users = await fetchUsers()
const duration = monitor.endTimer('database-query')
console.log(`查询耗时: ${duration}ms`)

// 函数性能测量
const { result, duration: funcDuration } = await monitor.measureFunction('expensive-calc', () => {
  return performExpensiveCalculation()
})

// 基准测试
const benchmark = await monitor.benchmark(
  'array-sort',
  () => {
    const arr = Array.from({ length: 10000 }, () => Math.random())
    return arr.sort()
  },
  { iterations: 100 }
)

console.log(`平均耗时: ${benchmark.averageTime}ms`)
console.log(`每秒操作数: ${benchmark.opsPerSecond}`)

// 内存监控
const memorySnapshot = monitor.getMemorySnapshot()
console.log(`堆内存使用: ${memorySnapshot.heapUsed / 1024 / 1024}MB`)

// 快速工具函数
const quickResult = PerformanceUtils.time('quick-test', () => {
  return someOperation()
})

// 内存分析
const memoryAnalysis = PerformanceUtils.analyzeMemoryUsage()
console.log(`内存使用: ${memoryAnalysis.formatted.heapUsed}`)

// 函数性能比较
const comparison = await PerformanceUtils.compareFunctions(
  [
    { name: 'method1', fn: method1 },
    { name: 'method2', fn: method2 },
  ],
  1000
)

comparison.forEach((result, index) => {
  console.log(`排名 ${result.rank}: ${result.name} - ${result.averageTime}ms`)
})
```

### 🏗️ 脚手架系统

```typescript
import { ScaffoldManager, CliBuilder } from '@ldesign/kit'

// 创建脚手架管理器
const scaffold = new ScaffoldManager({
  name: 'my-cli',
  version: '1.0.0',
  description: '我的项目脚手架',
  environments: ['development', 'production', 'staging'],
  defaultEnvironment: 'development',
})

// 初始化脚手架
await scaffold.initialize()

// 创建项目
const result = await scaffold.createProject({
  name: 'my-project',
  template: 'vue-app',
  environment: 'development',
  interactive: true,
})

// 创建 CLI 工具
const cli = new CliBuilder({
  name: 'my-cli',
  version: '1.0.0',
  description: '我的 CLI 工具',
  scaffoldManager: scaffold,
})

// 解析命令行参数
cli.parse()
```

### 🎨 控制台 UI 组件

```typescript
import {
  ProgressBar,
  LoadingSpinner,
  StatusIndicator,
  MultiProgress,
  ConsoleTheme,
} from '@ldesign/kit'

// 进度条
const progressBar = ProgressBar.createDetailed(100)
progressBar.start()
for (let i = 0; i <= 100; i += 10) {
  progressBar.update(i)
  await new Promise(resolve => setTimeout(resolve, 100))
}
progressBar.complete()

// 加载动画
const spinner = LoadingSpinner.createDots('加载中...')
spinner.start()
await someAsyncOperation()
spinner.succeed('加载完成')

// 状态指示器
const status = StatusIndicator.create()
status.success('操作成功')
status.error('操作失败')
status.warning('警告信息')
status.info('提示信息')

// 多任务进度
const multiProgress = MultiProgress.create()
multiProgress.start()
multiProgress.addTask({ id: 'task1', name: '任务1', total: 100 })
multiProgress.addTask({ id: 'task2', name: '任务2', total: 50 })

// 主题系统
const theme = ConsoleTheme.create('colorful')
console.log(theme.success('成功消息'))
console.log(theme.error('错误消息'))
```

### ⚡ 构建工具模块 (Builder)

强大的 Vite 和 Rollup 构建器封装：

```typescript
import {
  ViteBuilder,
  RollupBuilder,
  BuilderFactory,
  createViteBuilder,
  createRollupBuilder,
  createViteBuilderWithPreset,
  createRollupBuilderWithPreset,
} from '@ldesign/kit'

// Vite 构建器
const viteBuilder = new ViteBuilder({
  entry: 'src/index.ts',
  outDir: 'dist',
  server: {
    port: 3000,
    open: true,
  },
})

// 构建项目
const buildResult = await viteBuilder.build()
console.log('构建结果:', buildResult)

// 启动开发服务器
const devServer = await viteBuilder.dev()
console.log(`开发服务器: ${devServer.url}`)

// 构建库
const libBuilder = new ViteBuilder({
  lib: {
    entry: 'src/index.ts',
    name: 'MyLibrary',
    formats: ['es', 'cjs', 'umd'],
  },
})
await libBuilder.buildLib()

// Rollup 构建器
const rollupBuilder = new RollupBuilder({
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.js', format: 'es' },
    { file: 'dist/index.cjs', format: 'cjs' },
    { file: 'dist/index.umd.js', format: 'umd', name: 'MyLib' },
  ],
})

// 构建多种格式
const results = await rollupBuilder.buildMultiple(['es', 'cjs', 'umd'])
results.forEach((result, index) => {
  console.log(`格式 ${['es', 'cjs', 'umd'][index]}: ${result.success ? '成功' : '失败'}`)
})

// 使用预设创建构建器
const vueBuilder = createViteBuilderWithPreset('vue-app', {
  server: { port: 8080 },
})

const libBuilder2 = createRollupBuilderWithPreset('rollup-library', {
  input: 'src/my-lib.ts',
})

// 工厂方法
const builder1 = BuilderFactory.createViteBuilder({
  entry: 'src/app.ts',
})

const builder2 = BuilderFactory.createRollupBuilder({
  input: 'src/lib.ts',
  output: { file: 'dist/lib.js', format: 'es' },
})

// 监听构建事件
viteBuilder.on('build:start', ({ mode }) => {
  console.log(`开始构建 (${mode})`)
})

viteBuilder.on('build:end', ({ result }) => {
  console.log(`构建完成: ${result.success ? '成功' : '失败'}`)
})

// 监听模式
await viteBuilder.watch() // Vite 监听模式
await rollupBuilder.watch() // Rollup 监听模式

// 清理资源
await viteBuilder.destroy()
await rollupBuilder.destroy()
```

#### 内置预设

```typescript
// Vue 应用预设
const vueApp = createViteBuilderWithPreset('vue-app')

// React 应用预设
const reactApp = createViteBuilderWithPreset('react-app')

// 库开发预设
const library = createViteBuilderWithPreset('library')

// TypeScript 库预设
const tsLibrary = createViteBuilderWithPreset('ts-library')

// Node.js 应用预设
const nodeApp = createViteBuilderWithPreset('node-app')

// Rollup 库预设
const rollupLib = createRollupBuilderWithPreset('rollup-library')

// UMD 库预设
const umdLib = createRollupBuilderWithPreset('umd-library')
```

#### 构建工具函数

```typescript
import { BuilderUtils } from '@ldesign/kit'

// 检测项目类型
const projectType = BuilderUtils.detectProjectType('./my-project')
console.log('项目类型:', projectType) // 'vue', 'react', 'library', etc.

// 查找入口文件
const entryFile = BuilderUtils.findEntryFile('./my-project')
console.log('入口文件:', entryFile)

// 查找多个入口文件
const entries = BuilderUtils.findMultipleEntries('./my-project', 'src/*/index.ts')
console.log('多入口:', entries)

// 生成文件名
const fileName = BuilderUtils.generateFileName('es', 'index', { minify: true })
console.log('文件名:', fileName) // 'index.min.js'

// 格式化构建结果
const formatted = BuilderUtils.formatBuildResult(buildResult)
console.log(formatted)

// 格式化文件大小
const size = BuilderUtils.formatFileSize(1024 * 1024)
console.log('文件大小:', size) // '1 MB'

// 检查依赖
const depCheck = BuilderUtils.checkDependencies('./my-project', ['react', 'vue'])
console.log('已安装:', depCheck.installed)
console.log('缺失:', depCheck.missing)

// 获取推荐配置
const recommendedConfig = BuilderUtils.getRecommendedConfig('./my-project')
console.log('推荐配置:', recommendedConfig)

// 验证配置
const validation = BuilderUtils.validateConfig(config)
console.log('配置有效:', validation.valid)
if (!validation.valid) {
  console.log('错误:', validation.errors)
}
```

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行特定模块测试
npm test -- --testPathPattern=utils

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式运行测试
npm run test:watch
```

## 📖 API 文档

详细的 API 文档请查看各模块的 TypeScript 类型定义和 JSDoc 注释。

## 🤝 贡献

欢迎贡献代码！请查看 [CONTRIBUTING.md](../../CONTRIBUTING.md) 了解详细信息。

## 📄 许可证

MIT License - 查看 [LICENSE](../../LICENSE) 文件了解详细信息。

## 🔗 相关链接

- [GitHub 仓库](https://github.com/ldesign/ldesign)
- [问题反馈](https://github.com/ldesign/ldesign/issues)
- [更新日志](./CHANGELOG.md)
- [新功能指南](./docs/NEW_FEATURES.md) 🆕
- [扩展功能指南](./docs/ADDITIONAL_FEATURES.md) 🆕
- [优化总结](./docs/OPTIMIZATION_SUMMARY.md)
- [使用示例](./examples/)

## ⚡ 新功能亮点

### 第一批功能
查看 [新功能指南](./docs/NEW_FEATURES.md) 了解详细信息：

- **JSON 工具** - 安全的 JSON 解析、深度克隆、对象操作
- **Base64 工具** - 完整的 Base64 编码解码，支持 URL 安全格式
- **环境变量工具** - 类型安全的环境变量读取和验证
- **数据结构** - Queue、Stack、LinkedList、LRU 缓存
- **测试工具** - Mock、Spy、Stub 和测试数据生成
- **安全工具** - 加密、哈希、Token 生成、密码强度验证
- **错误处理** - 统一的错误处理机制和错误码系统

### 第二批功能
查看 [扩展功能指南](./docs/ADDITIONAL_FEATURES.md) 了解详细信息：

- **Promise 工具** - 并发控制、重试、超时、批处理、队列、限流
- **正则工具** - 60+ 预定义正则、验证、提取、高亮、模糊匹配
- **格式化工具** - 文件大小、货币、日期、电话、地址等格式化
- **装饰器工具** - 缓存、防抖、节流、重试、日志、性能监控等装饰器
