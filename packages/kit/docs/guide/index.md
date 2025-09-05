# 介绍

@ldesign/kit 是一个功能完整的 TypeScript 工具包，专为现代 Node.js 开发而设计。它提供了11个核心模块，涵盖了从基础工具函数到高级系统集成的各个方面。

## 设计理念

### 🎯 开箱即用

每个模块都经过精心设计，提供简洁直观的 API，让您能够快速上手并提高开发效率。

### 🔒 类型安全

100% TypeScript 编写，提供完整的类型定义，在编译时就能发现潜在问题，减少运行时错误。

### 📦 模块化

支持按需导入，您可以只使用需要的功能，保持应用体积最小。

### 🧪 高质量

每个模块都有完整的测试覆盖，确保代码质量和稳定性。

## 核心模块概览

### 基础工具模块

#### Utils - 工具函数集合

提供字符串、数字、日期、对象、数组等常用工具函数：

```typescript
import { StringUtils, DateUtils, ObjectUtils } from '@ldesign/kit'

// 字符串处理
StringUtils.camelCase('hello-world') // 'helloWorld'
StringUtils.slugify('Hello World!') // 'hello-world'

// 日期处理
DateUtils.format(new Date(), 'YYYY-MM-DD') // '2024-01-01'
DateUtils.addDays(new Date(), 7) // 7天后的日期

// 对象处理
ObjectUtils.deepMerge(obj1, obj2) // 深度合并对象
ObjectUtils.get(obj, 'user.profile.name', 'Unknown') // 安全获取属性
```

#### FileSystem - 文件系统操作

完整的文件和目录操作 API：

```typescript
import { FileSystem } from '@ldesign/kit'

// 文件操作
await FileSystem.writeFile('./config.json', JSON.stringify(config))
const content = await FileSystem.readFile('./config.json')
await FileSystem.copy('./src', './backup')

// 目录操作
await FileSystem.ensureDir('./logs')
const files = await FileSystem.readDir('./src', { recursive: true })

// 文件监听
const watcher = FileSystem.createWatcher('./src')
watcher.on('change', path => console.log(`文件变更: ${path}`))
```

#### Cache - 缓存管理

多层缓存系统，支持内存缓存和文件缓存：

```typescript
import { CacheManager } from '@ldesign/kit'

const cache = CacheManager.create({
  defaultTTL: 3600, // 1小时
  maxSize: 1000,
})

// 基本操作
await cache.set('user:123', userData, 3600)
const user = await cache.get('user:123')

// 缓存穿透保护
const data = await cache.getOrSet(
  'expensive:data',
  async () => {
    return await computeExpensiveData()
  },
  7200
)
```

### 验证和安全模块

#### Validation - 数据验证

灵活的验证规则引擎：

```typescript
import { Validator, ValidationRules } from '@ldesign/kit'

const validator = Validator.create()
validator.addRule('email', ValidationRules.email())
validator.addRule('password', ValidationRules.minLength(8))

const result = await validator.validate({
  email: 'user@example.com',
  password: 'securepass',
})
```

#### SSL - SSL 证书管理

SSL 证书生成、验证和管理：

```typescript
import { SSLManager } from '@ldesign/kit'

const sslManager = new SSLManager()
const keyPair = await sslManager.generateKeyPair()
const cert = await sslManager.generateSelfSignedCertificate(keyPair, {
  commonName: 'localhost',
  organization: 'My Company',
})
```

### 开发工具模块

#### Git - Git 操作

完整的 Git 仓库管理功能：

```typescript
import { GitManager } from '@ldesign/kit'

const git = new GitManager('./my-repo')
await git.add('.')
await git.commit('feat: add new feature')
await git.push()
```

#### Package - 包管理

NPM 包管理工具：

```typescript
import { PackageManager } from '@ldesign/kit'

const pkg = new PackageManager('./my-project')
await pkg.addDependency('lodash', '^4.17.21')
await pkg.runScript('build')
```

#### CLI - 命令行工具

命令行工具开发框架：

```typescript
import { CLIManager } from '@ldesign/kit'

const cli = new CLIManager({
  name: 'my-tool',
  version: '1.0.0',
})

cli.addCommand('build', {
  description: '构建项目',
  action: async options => {
    console.log('开始构建...')
  },
})
```

### 用户界面模块

#### Inquirer - 交互式询问

用户输入和选择界面：

```typescript
import { InquirerManager } from '@ldesign/kit'

const inquirer = InquirerManager.create()

const name = await inquirer.input({
  message: '请输入您的姓名:',
  validate: input => input.length > 0,
})

const framework = await inquirer.select({
  message: '选择前端框架:',
  choices: [
    { name: 'React', value: 'react' },
    { name: 'Vue', value: 'vue' },
  ],
})
```

#### Notification - 系统通知

跨平台系统通知：

```typescript
import { NotificationManager } from '@ldesign/kit'

const notificationManager = NotificationManager.create({
  appName: 'My App',
})

await notificationManager.success('操作成功', '数据已保存')
await notificationManager.error('操作失败', '网络连接错误')
```

#### Performance - 性能监控

性能测试和监控工具：

```typescript
import { PerformanceMonitor } from '@ldesign/kit'

const monitor = PerformanceMonitor.create()

// 计时器
monitor.startTimer('database-query')
const users = await fetchUsers()
const duration = monitor.endTimer('database-query')

// 基准测试
const benchmark = await monitor.benchmark(
  'sort-algorithm',
  () => {
    return largeArray.sort()
  },
  { iterations: 100 }
)
```

## 兼容性

- **Node.js**: 16.x, 18.x, 20.x, 21.x
- **TypeScript**: 4.6+
- **操作系统**: Windows, macOS, Linux
- **包管理器**: npm, yarn, pnpm

## 下一步

- [安装指南](./installation.md) - 了解如何安装和配置
- [快速开始](./getting-started.md) - 通过示例快速上手
- [API 参考](/api/) - 查看详细的 API 文档
- [使用示例](/examples/) - 查看实际使用案例
