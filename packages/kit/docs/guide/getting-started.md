# 快速开始

本指南将通过实际示例帮助您快速上手 @ldesign/kit。

## 第一个示例

让我们从一个简单的文件处理示例开始：

```typescript
import { FileSystem, StringUtils } from '@ldesign/kit'

async function processConfigFile() {
  // 读取配置文件
  const configPath = './config.json'

  if (await FileSystem.exists(configPath)) {
    const content = await FileSystem.readFile(configPath)
    const config = JSON.parse(content)

    // 处理配置数据
    config.appName = StringUtils.camelCase(config.appName)
    config.lastUpdated = new Date().toISOString()

    // 写回文件
    await FileSystem.writeFile(configPath, JSON.stringify(config, null, 2))
    console.log('配置文件已更新')
  } else {
    console.log('配置文件不存在')
  }
}

processConfigFile()
```

## 常用功能示例

### 1. 字符串处理

```typescript
import { StringUtils } from '@ldesign/kit'

// 命名转换
console.log(StringUtils.camelCase('hello-world')) // 'helloWorld'
console.log(StringUtils.kebabCase('helloWorld')) // 'hello-world'
console.log(StringUtils.slugify('Hello World!')) // 'hello-world'

// 字符串操作
console.log(StringUtils.truncate('很长的文本内容', 10)) // '很长的文本内容...'
console.log(StringUtils.capitalize('hello world')) // 'Hello World'

// 模板处理
const template = 'Hello {{name}}, welcome to {{app}}!'
const result = StringUtils.template(template, {
  name: 'John',
  app: 'MyApp',
})
console.log(result) // 'Hello John, welcome to MyApp!'
```

### 2. 文件系统操作

```typescript
import { FileSystem } from '@ldesign/kit'

async function fileOperations() {
  // 确保目录存在
  await FileSystem.ensureDir('./data/logs')

  // 写入文件
  await FileSystem.writeFile(
    './data/user.json',
    JSON.stringify({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
    })
  )

  // 读取文件
  const userData = await FileSystem.readFile('./data/user.json')
  console.log('用户数据:', JSON.parse(userData))

  // 复制文件
  await FileSystem.copy('./data/user.json', './backup/user.json')

  // 列出目录内容
  const files = await FileSystem.readDir('./data')
  console.log('数据目录文件:', files)
}
```

### 3. 缓存使用

```typescript
import { CacheManager } from '@ldesign/kit'

async function cacheExample() {
  // 创建缓存实例
  const cache = CacheManager.create({
    defaultTTL: 300, // 5分钟
    maxSize: 1000,
  })

  // 模拟获取用户数据的函数
  async function fetchUserFromAPI(userId: string) {
    console.log(`从 API 获取用户 ${userId}`)
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { id: userId, name: `User ${userId}`, email: `user${userId}@example.com` }
  }

  // 使用缓存
  const userId = '123'
  const cacheKey = `user:${userId}`

  // 第一次调用 - 从 API 获取
  let user = await cache.getOrSet(cacheKey, () => fetchUserFromAPI(userId))
  console.log('第一次获取:', user)

  // 第二次调用 - 从缓存获取
  user = await cache.getOrSet(cacheKey, () => fetchUserFromAPI(userId))
  console.log('第二次获取:', user) // 不会调用 API
}
```

### 4. 数据验证

```typescript
import { Validator, ValidationRules } from '@ldesign/kit'

async function validationExample() {
  // 创建验证器
  const validator = Validator.create()

  // 添加验证规则
  validator.addRule('email', ValidationRules.required('邮箱不能为空'))
  validator.addRule('email', ValidationRules.email('邮箱格式不正确'))
  validator.addRule('password', ValidationRules.required('密码不能为空'))
  validator.addRule('password', ValidationRules.minLength(8, '密码至少8个字符'))
  validator.addRule('age', ValidationRules.range(18, 120, '年龄必须在18-120之间'))

  // 验证数据
  const userData = {
    email: 'user@example.com',
    password: 'securepass123',
    age: 25,
  }

  const result = await validator.validate(userData)

  if (result.valid) {
    console.log('验证通过')
  } else {
    console.log('验证失败:', result.errors)
  }
}
```

### 5. 日期和数字处理

```typescript
import { DateUtils, NumberUtils } from '@ldesign/kit'

// 日期处理
const now = new Date()
console.log(DateUtils.format(now, 'YYYY-MM-DD HH:mm:ss'))
console.log(DateUtils.addDays(now, 7)) // 7天后
console.log(DateUtils.isWeekend(now)) // 是否周末

// 数字处理
console.log(NumberUtils.formatCurrency(1234.56)) // '$1,234.56'
console.log(NumberUtils.clamp(15, 0, 10)) // 10
console.log(NumberUtils.random(1, 100)) // 1-100随机数
console.log(NumberUtils.round(3.14159, 2)) // 3.14
```

## 实际应用场景

### 场景1：配置文件管理器

```typescript
import { FileSystem, ObjectUtils, Validator, ValidationRules } from '@ldesign/kit'

class ConfigManager {
  private configPath: string
  private validator: Validator

  constructor(configPath: string) {
    this.configPath = configPath
    this.validator = Validator.create()
    this.setupValidation()
  }

  private setupValidation() {
    this.validator.addRule('appName', ValidationRules.required())
    this.validator.addRule('port', ValidationRules.range(1000, 65535))
    this.validator.addRule('database.host', ValidationRules.required())
  }

  async load() {
    if (await FileSystem.exists(this.configPath)) {
      const content = await FileSystem.readFile(this.configPath)
      return JSON.parse(content)
    }
    return this.getDefaultConfig()
  }

  async save(config: any) {
    const result = await this.validator.validate(config)
    if (!result.valid) {
      throw new Error(`配置验证失败: ${result.errors.join(', ')}`)
    }

    await FileSystem.writeFile(this.configPath, JSON.stringify(config, null, 2))
  }

  async update(updates: any) {
    const current = await this.load()
    const merged = ObjectUtils.deepMerge(current, updates)
    await this.save(merged)
    return merged
  }

  private getDefaultConfig() {
    return {
      appName: 'MyApp',
      port: 3000,
      database: {
        host: 'localhost',
        port: 5432,
      },
    }
  }
}

// 使用示例
async function useConfigManager() {
  const config = new ConfigManager('./config.json')

  // 加载配置
  const currentConfig = await config.load()
  console.log('当前配置:', currentConfig)

  // 更新配置
  await config.update({
    port: 8080,
    database: { host: 'production-db.example.com' },
  })

  console.log('配置已更新')
}
```

### 场景2：简单的 CLI 工具

```typescript
import { CLIManager, FileSystem, StringUtils } from '@ldesign/kit'

const cli = new CLIManager({
  name: 'file-processor',
  version: '1.0.0',
  description: '文件处理工具',
})

// 添加命令
cli.addCommand('rename', {
  description: '批量重命名文件',
  options: [
    { name: 'dir', description: '目标目录', type: 'string', required: true },
    { name: 'pattern', description: '命名模式', type: 'string', default: 'camelCase' },
  ],
  action: async options => {
    const files = await FileSystem.readDir(options.dir)

    for (const file of files) {
      const oldPath = `${options.dir}/${file}`
      const name = file.split('.')[0]
      const ext = file.split('.').pop()

      let newName: string
      switch (options.pattern) {
        case 'camelCase':
          newName = StringUtils.camelCase(name)
          break
        case 'kebabCase':
          newName = StringUtils.kebabCase(name)
          break
        default:
          newName = name
      }

      const newPath = `${options.dir}/${newName}.${ext}`
      await FileSystem.move(oldPath, newPath)
      console.log(`重命名: ${file} -> ${newName}.${ext}`)
    }
  },
})

// 解析命令行参数
cli.parse()
```

## 错误处理

```typescript
import { FileSystem, CacheManager } from '@ldesign/kit'

async function errorHandlingExample() {
  try {
    // 文件操作错误处理
    const content = await FileSystem.readFile('./nonexistent.txt')
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('文件不存在')
    } else {
      console.error('读取文件失败:', error.message)
    }
  }

  // 缓存操作错误处理
  const cache = CacheManager.create()

  try {
    await cache.set('key', 'value')
  } catch (error) {
    console.error('缓存操作失败:', error.message)
  }
}
```

## 性能优化建议

### 1. 按需导入

```typescript
// ✅ 推荐：按需导入
import { StringUtils } from '@ldesign/kit'

// ❌ 不推荐：完整导入
import * as Kit from '@ldesign/kit'
```

### 2. 缓存重用

```typescript
// ✅ 推荐：重用缓存实例
const cache = CacheManager.create()

// ❌ 不推荐：每次创建新实例
function someFunction() {
  const cache = CacheManager.create() // 避免这样做
}
```

### 3. 异步操作

```typescript
// ✅ 推荐：并行处理
const [file1, file2] = await Promise.all([
  FileSystem.readFile('./file1.txt'),
  FileSystem.readFile('./file2.txt'),
])

// ❌ 不推荐：串行处理
const file1 = await FileSystem.readFile('./file1.txt')
const file2 = await FileSystem.readFile('./file2.txt')
```

## 下一步

现在您已经了解了基本用法，可以：

- 查看 [API 参考文档](/api/) 了解所有可用功能
- 浏览 [使用示例](/examples/) 学习更多实际应用
- 阅读 [最佳实践](/best-practices/) 了解优化建议
- 查看 [集成指南](/guide/integration/) 了解如何在不同项目中使用
