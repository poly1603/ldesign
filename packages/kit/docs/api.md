# API 参考

@ldesign/kit 提供了11个功能强大的模块，涵盖现代 Node.js 开发的各个方面。

## 目录

- [Utils](#utils) - 工具函数集合
- [FileSystem](#filesystem) - 文件系统操作
- [Cache](#cache) - 缓存管理
- [Validation](#validation) - 数据验证
- [Archive](#archive) - 文件压缩归档
- [Git](#git) - Git 操作
- [Package](#package) - 包管理
- [SSL](#ssl) - SSL 证书管理
- [CLI](#cli) - 命令行工具
- [Inquirer](#inquirer) - 交互式询问
- [Notification](#notification) - 系统通知
- [Performance](#performance) - 性能监控

## FileSystem

文件系统操作模块，提供文件和目录的创建、读取、写入、删除等功能。

### 基本用法

```typescript
import { FileSystem } from '@ldesign/kit/filesystem'
```

### API

#### 文件操作

##### `writeFile(filePath: string, content: string | Buffer, options?: WriteFileOptions): Promise<void>`

写入文件内容。

**参数：**

- `filePath` - 文件路径
- `content` - 文件内容
- `options` - 写入选项

**示例：**

```typescript
await FileSystem.writeFile('example.txt', 'Hello, World!')
await FileSystem.writeFile('data.json', JSON.stringify(data), { encoding: 'utf8' })
```

##### `readFile(filePath: string, options?: ReadFileOptions): Promise<string>`

读取文件内容。

**参数：**

- `filePath` - 文件路径
- `options` - 读取选项

**返回：** 文件内容字符串

**示例：**

```typescript
const content = await FileSystem.readFile('example.txt')
const data = JSON.parse(await FileSystem.readFile('data.json'))
```

##### `exists(path: string): Promise<boolean>`

检查文件或目录是否存在。

**参数：**

- `path` - 文件或目录路径

**返回：** 是否存在

**示例：**

```typescript
if (await FileSystem.exists('config.json')) {
  // 文件存在
}
```

#### 目录操作

##### `createDir(dirPath: string, recursive?: boolean): Promise<void>`

创建目录。

**参数：**

- `dirPath` - 目录路径
- `recursive` - 是否递归创建父目录

**示例：**

```typescript
await FileSystem.createDir('uploads')
await FileSystem.createDir('deep/nested/directory', true)
```

##### `readDir(dirPath: string, options?: ReadDirOptions): Promise<string[] | FileInfo[]>`

读取目录内容。

**参数：**

- `dirPath` - 目录路径
- `options` - 读取选项

**返回：** 文件名数组或文件信息数组

**示例：**

```typescript
const files = await FileSystem.readDir('uploads')
const fileInfos = await FileSystem.readDir('uploads', { withFileTypes: true })
```

## Cache

内存缓存管理器，支持 LRU 淘汰策略和 TTL 过期机制。

### 基本用法

```typescript
import { CacheManager } from '@ldesign/kit'

const cache = new CacheManager({
  maxSize: 1000,
  ttl: 60000,
})
```

### API

#### 构造函数

##### `new CacheManager(options?: CacheOptions)`

创建缓存管理器实例。

**参数：**

- `options.maxSize` - 最大缓存项数量，默认 1000
- `options.ttl` - 默认过期时间（毫秒），默认无限制

#### 基本操作

##### `set(key: string, value: any, ttl?: number): void`

设置缓存项。

**参数：**

- `key` - 缓存键
- `value` - 缓存值
- `ttl` - 过期时间（毫秒），可选

**示例：**

```typescript
cache.set('user:123', userData)
cache.set('temp:data', tempData, 30000) // 30秒后过期
```

##### `get(key: string): any`

获取缓存项。

**参数：**

- `key` - 缓存键

**返回：** 缓存值，不存在或已过期返回 undefined

**示例：**

```typescript
const userData = cache.get('user:123')
if (userData) {
  // 缓存命中
}
```

## Utils

实用工具函数集合，包含字符串、数字、数组、对象等操作工具。

### StringUtils

字符串处理工具。

#### `toCamelCase(str: string): string`

转换为驼峰命名。

**示例：**

```typescript
StringUtils.toCamelCase('hello-world') // 'helloWorld'
StringUtils.toCamelCase('hello_world') // 'helloWorld'
```

#### `toKebabCase(str: string): string`

转换为短横线命名。

**示例：**

```typescript
StringUtils.toKebabCase('helloWorld') // 'hello-world'
StringUtils.toKebabCase('HelloWorld') // 'hello-world'
```

#### `isEmail(email: string): boolean`

验证邮箱格式。

**示例：**

```typescript
StringUtils.isEmail('test@example.com') // true
StringUtils.isEmail('invalid-email') // false
```

### NumberUtils

数字处理工具。

#### `format(num: number, decimals?: number): string`

格式化数字，添加千分位分隔符。

**示例：**

```typescript
NumberUtils.format(1234.567, 2) // '1,234.57'
NumberUtils.format(1000) // '1,000'
```

#### `formatBytes(bytes: number, decimals?: number): string`

格式化字节大小。

**示例：**

```typescript
NumberUtils.formatBytes(1024) // '1.00 KB'
NumberUtils.formatBytes(1048576) // '1.00 MB'
```

### ArrayUtils

数组处理工具。

#### `unique<T>(array: T[]): T[]`

数组去重。

**示例：**

```typescript
ArrayUtils.unique([1, 2, 2, 3, 3, 3]) // [1, 2, 3]
ArrayUtils.unique(['a', 'b', 'a', 'c']) // ['a', 'b', 'c']
```

#### `chunk<T>(array: T[], size: number): T[][]`

数组分块。

**示例：**

```typescript
ArrayUtils.chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
```

### ObjectUtils

对象处理工具。

#### `deepClone<T>(obj: T): T`

深度克隆对象。

**示例：**

```typescript
const cloned = ObjectUtils.deepClone(originalObject)
```

#### `get(obj: any, path: string, defaultValue?: any): any`

获取对象嵌套属性值。

**示例：**

```typescript
ObjectUtils.get(obj, 'user.profile.name', 'Unknown')
```

## Git

Git 仓库操作工具，提供版本控制相关功能。

### 基本用法

```typescript
import { GitManager, GitUtils } from '@ldesign/kit/git'

const git = new GitManager('/path/to/repo')
```

### GitManager

#### 构造函数

##### `new GitManager(cwd?: string, options?: GitOptions)`

创建 Git 管理器实例。

**参数：**

- `cwd` - 工作目录，默认当前目录
- `options` - Git 选项

#### 基本操作

##### `init(bare?: boolean): Promise<void>`

初始化 Git 仓库。

##### `add(files?: string | string[]): Promise<void>`

添加文件到暂存区。

##### `commit(message: string, options?: CommitOptions): Promise<string>`

提交更改。

**返回：** 提交哈希

##### `status(): Promise<GitStatus>`

获取仓库状态。

**返回：** 仓库状态信息

## Package

NPM 包管理工具，提供依赖管理和脚本执行功能。

### 基本用法

```typescript
import { PackageManager, PackageUtils } from '@ldesign/kit/package'

const pm = new PackageManager('/path/to/project')
```

### PackageManager

#### 基本操作

##### `install(packages?: string | string[], options?: InstallOptions): Promise<void>`

安装依赖包。

##### `uninstall(packages: string | string[]): Promise<void>`

卸载依赖包。

##### `runScript(scriptName: string, args?: string[]): Promise<string>`

运行 npm 脚本。

## CLI

命令行应用开发工具，提供命令解析、输出格式化等功能。

### 基本用法

```typescript
import { CLIApp, OutputFormatter } from '@ldesign/kit/cli'

const app = new CLIApp({
  name: 'my-cli',
  version: '1.0.0',
})
```

### CLIApp

#### 添加命令

##### `command(options: CommandOptions): void`

添加命令。

**参数：**

- `options.name` - 命令名称
- `options.description` - 命令描述
- `options.action` - 命令处理函数

### OutputFormatter

#### 输出方法

##### `info(message: string): void`

输出信息。

##### `success(message: string): void`

输出成功信息。

##### `error(message: string): void`

输出错误信息。

##### `table(data: any[], options?: TableOptions): void`

输出表格。

## 类型定义

所有模块都提供完整的 TypeScript 类型定义，确保类型安全。

### 通用类型

```typescript
interface FileInfo {
  name: string
  path: string
  size: number
  isFile: boolean
  isDirectory: boolean
  mtime: Date
  ctime: Date
}

interface CacheOptions {
  maxSize?: number
  ttl?: number
}

interface GitStatus {
  staged: string[]
  unstaged: string[]
  untracked: string[]
  conflicted: string[]
  clean: boolean
}
```

## 错误处理

所有异步操作都会抛出适当的错误，建议使用 try-catch 进行错误处理：

```typescript
try {
  await FileSystem.readFile('nonexistent.txt')
} catch (error) {
  console.error('文件读取失败:', error.message)
}
```

## Validation

数据验证模块，提供灵活的验证规则和表单验证功能。

### 基本用法

```typescript
import { Validator, ValidationRules } from '@ldesign/kit'

const validator = Validator.create()
validator.addRule('email', ValidationRules.email())
```

### Validator

#### 静态方法

##### `create(options?: ValidatorOptions): Validator`

创建验证器实例。

#### 实例方法

##### `addRule(field: string, rule: ValidationRule): void`

添加验证规则。

##### `validate(data: object): Promise<ValidationResult>`

验证数据。

**返回：** 验证结果，包含是否有效和错误信息

### ValidationRules

#### 内置规则

##### `required(message?: string): ValidationRule`

必填验证。

##### `email(message?: string): ValidationRule`

邮箱格式验证。

##### `minLength(length: number, message?: string): ValidationRule`

最小长度验证。

##### `maxLength(length: number, message?: string): ValidationRule`

最大长度验证。

##### `range(min: number, max: number, message?: string): ValidationRule`

数值范围验证。

## SSL

SSL 证书管理模块，提供证书生成、验证和管理功能。

### 基本用法

```typescript
import { SSLManager, SSLUtils } from '@ldesign/kit'

const sslManager = new SSLManager({
  keySize: 2048,
  validityDays: 365,
})
```

### SSLManager

#### 构造函数

##### `new SSLManager(options?: SSLOptions)`

创建 SSL 管理器实例。

#### 实例方法

##### `generateKeyPair(): Promise<KeyPair>`

生成密钥对。

##### `generateSelfSignedCertificate(keyPair: KeyPair, request: CertificateRequest): Promise<string>`

生成自签名证书。

##### `verifyCertificate(certificate: string): Promise<SSLValidationResult>`

验证证书。

##### `parseCertificate(certificate: string): CertificateInfo`

解析证书信息。

### SSLUtils

#### 静态方法

##### `generateQuickCertificate(options: QuickCertOptions): Promise<CertificateBundle>`

快速生成证书。

##### `validateDomainMatch(certificate: string, domain: string): boolean`

验证域名匹配。

##### `analyzeCertificateStrength(certificate: string): StrengthAnalysis`

分析证书强度。

## Inquirer

交互式询问模块，提供用户输入和选择界面。

### 基本用法

```typescript
import { InquirerManager, InquirerUtils } from '@ldesign/kit'

const inquirer = InquirerManager.create()
```

### InquirerManager

#### 静态方法

##### `create(options?: InquirerOptions): InquirerManager`

创建询问器实例。

#### 实例方法

##### `input(options: InputOptions): Promise<string>`

文本输入。

##### `password(options: PasswordOptions): Promise<string>`

密码输入。

##### `confirm(options: ConfirmOptions): Promise<boolean>`

确认询问。

##### `select<T>(options: SelectOptions<T>): Promise<T>`

单选列表。

##### `multiSelect<T>(options: MultiSelectOptions<T>): Promise<T[]>`

多选列表。

### InquirerUtils

#### 静态方法

##### `input(message: string, defaultValue?: string): Promise<string>`

快速文本输入。

##### `confirm(message: string, defaultValue?: boolean): Promise<boolean>`

快速确认询问。

##### `select<T>(message: string, choices: ChoiceOption<T>[]): Promise<T>`

快速选择。

## Notification

系统通知模块，提供跨平台的系统通知功能。

### 基本用法

```typescript
import { NotificationManager, NotificationUtils } from '@ldesign/kit'

const notificationManager = NotificationManager.create({
  appName: 'My App',
})
```

### NotificationManager

#### 静态方法

##### `create(config?: NotificationConfig): NotificationManager`

创建通知管理器实例。

#### 实例方法

##### `notify(options: NotificationOptions): Promise<string>`

发送通知。

##### `success(title: string, message?: string): Promise<string>`

发送成功通知。

##### `error(title: string, message?: string): Promise<string>`

发送错误通知。

##### `warning(title: string, message?: string): Promise<string>`

发送警告通知。

##### `info(title: string, message?: string): Promise<string>`

发送信息通知。

### NotificationUtils

#### 静态方法

##### `notify(title: string, message?: string): Promise<string>`

快速发送通知。

##### `success(title: string, message?: string): Promise<string>`

快速发送成功通知。

## Performance

性能监控模块，提供性能测试和监控工具。

### 基本用法

```typescript
import { PerformanceMonitor, PerformanceUtils } from '@ldesign/kit'

const monitor = PerformanceMonitor.create()
```

### PerformanceMonitor

#### 静态方法

##### `create(config?: PerformanceConfig): PerformanceMonitor`

创建性能监控器实例。

#### 实例方法

##### `startTimer(name: string): void`

开始计时。

##### `endTimer(name: string): number`

结束计时，返回耗时（毫秒）。

##### `measureFunction<T>(name: string, fn: () => T): Promise<{ result: T; duration: number }>`

测量函数执行时间。

##### `benchmark(name: string, fn: Function, options?: BenchmarkOptions): Promise<BenchmarkResult>`

运行基准测试。

### PerformanceUtils

#### 静态方法

##### `time<T>(name: string, fn: () => T): T`

快速计时同步函数。

##### `timeAsync<T>(name: string, fn: () => Promise<T>): Promise<T>`

快速计时异步函数。

##### `analyzeMemoryUsage(): MemoryAnalysis`

分析内存使用情况。

## 性能优化

- 使用流式处理大文件
- 缓存频繁访问的数据
- 合理设置缓存大小和过期时间
- 避免同步操作阻塞事件循环
- 使用性能监控工具优化关键路径
