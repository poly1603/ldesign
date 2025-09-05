# API 参考

@ldesign/kit 提供了11个功能强大的模块，涵盖现代 Node.js 开发的各个方面。

## 模块概览

### 基础工具模块

#### [Utils 工具函数](./utils.md)

提供字符串、数字、日期、对象、数组等常用工具函数。

- **StringUtils**: 字符串处理和转换
- **NumberUtils**: 数字格式化和计算
- **DateUtils**: 日期操作和格式化
- **ObjectUtils**: 对象深度操作
- **ArrayUtils**: 数组处理和分析
- **ValidationUtils**: 基础验证工具

```typescript
import { StringUtils, DateUtils, ObjectUtils } from '@ldesign/kit'
```

#### [FileSystem 文件系统](./filesystem.md)

完整的文件和目录操作 API，支持文件监听和权限管理。

- **FileSystem**: 文件和目录操作
- **FileWatcher**: 文件变化监听
- **PathUtils**: 路径处理工具

```typescript
import { FileSystem, FileWatcher } from '@ldesign/kit'
```

#### [Cache 缓存管理](./cache.md)

多层缓存系统，支持内存缓存、文件缓存和智能驱逐策略。

- **CacheManager**: 缓存管理器
- **MemoryCache**: 内存缓存
- **FileCache**: 文件缓存

```typescript
import { CacheManager } from '@ldesign/kit'
```

#### [Validation 数据验证](./validation.md)

灵活的验证规则引擎，支持同步和异步验证。

- **Validator**: 验证器
- **ValidationRules**: 内置验证规则
- **FormValidator**: 表单验证器

```typescript
import { Validator, ValidationRules } from '@ldesign/kit'
```

### 开发工具模块

#### [Git 版本控制](./git.md)

完整的 Git 仓库管理功能，支持分支操作和远程同步。

- **GitManager**: Git 仓库管理
- **GitUtils**: Git 工具函数

```typescript
import { GitManager } from '@ldesign/kit'
```

#### [Package 包管理](./package.md)

NPM 包管理工具，支持依赖管理和脚本执行。

- **PackageManager**: 包管理器
- **PackageUtils**: 包工具函数

```typescript
import { PackageManager } from '@ldesign/kit'
```

#### [SSL 证书管理](./ssl.md)

SSL 证书生成、验证和管理工具。

- **SSLManager**: SSL 管理器
- **SSLUtils**: SSL 工具函数

```typescript
import { SSLManager, SSLUtils } from '@ldesign/kit'
```

#### [CLI 命令行工具](./cli.md)

命令行工具开发框架，支持参数解析和输出格式化。

- **CLIManager**: CLI 管理器
- **OutputFormatter**: 输出格式化
- **ProgressBar**: 进度条

```typescript
import { CLIManager, OutputFormatter } from '@ldesign/kit'
```

### 用户界面模块

#### [Inquirer 交互询问](./inquirer.md)

用户输入和选择界面，支持多种输入类型。

- **InquirerManager**: 询问管理器
- **InquirerUtils**: 询问工具函数

```typescript
import { InquirerManager, InquirerUtils } from '@ldesign/kit'
```

#### [Notification 系统通知](./notification.md)

跨平台系统通知，支持多种通知类型。

- **NotificationManager**: 通知管理器
- **NotificationUtils**: 通知工具函数

```typescript
import { NotificationManager, NotificationUtils } from '@ldesign/kit'
```

#### [Performance 性能监控](./performance.md)

性能测试和监控工具，支持基准测试和性能分析。

- **PerformanceMonitor**: 性能监控器
- **PerformanceUtils**: 性能工具函数

```typescript
import { PerformanceMonitor, PerformanceUtils } from '@ldesign/kit'
```

## 导入方式

### 完整导入

```typescript
import * as Kit from '@ldesign/kit'

Kit.StringUtils.camelCase('hello-world')
Kit.FileSystem.readFile('./config.json')
```

### 按需导入（推荐）

```typescript
import { StringUtils, FileSystem, CacheManager } from '@ldesign/kit'

StringUtils.camelCase('hello-world')
FileSystem.readFile('./config.json')
CacheManager.create()
```

### 子模块导入

```typescript
import { StringUtils } from '@ldesign/kit/utils'
import { FileSystem } from '@ldesign/kit/filesystem'
import { CacheManager } from '@ldesign/kit/cache'
```

## 类型定义

所有模块都提供完整的 TypeScript 类型定义：

```typescript
import type {
  CacheOptions,
  ValidationResult,
  FileStats,
  GitStatus,
  SSLCertificate,
  NotificationOptions,
} from '@ldesign/kit'
```

## 错误处理

所有异步操作都会抛出标准的 JavaScript 错误：

```typescript
try {
  const content = await FileSystem.readFile('./config.json')
} catch (error) {
  if (error.code === 'ENOENT') {
    console.log('文件不存在')
  } else {
    console.error('读取失败:', error.message)
  }
}
```

## 事件系统

部分模块支持事件监听：

```typescript
const cache = CacheManager.create()

cache.on('hit', key => {
  console.log(`缓存命中: ${key}`)
})

cache.on('miss', key => {
  console.log(`缓存未命中: ${key}`)
})
```

## 配置选项

大多数模块都支持配置选项：

```typescript
const cache = CacheManager.create({
  defaultTTL: 3600,
  maxSize: 1000,
  strategy: 'lru',
})

const validator = Validator.create({
  stopOnFirstError: false,
  locale: 'zh-CN',
})
```

## 兼容性

- **Node.js**: 16.x, 18.x, 20.x, 21.x
- **TypeScript**: 4.6+
- **操作系统**: Windows, macOS, Linux

## 性能考虑

- 所有模块都经过性能优化
- 支持按需导入以减少包体积
- 异步操作使用 Promise/async-await
- 内存使用经过优化

## 下一步

选择您感兴趣的模块查看详细的 API 文档：

- [Utils 工具函数](./utils.md) - 基础工具函数
- [FileSystem 文件系统](./filesystem.md) - 文件操作
- [Cache 缓存管理](./cache.md) - 缓存系统
- [Validation 数据验证](./validation.md) - 数据验证
- [Git 版本控制](./git.md) - Git 操作
- [Package 包管理](./package.md) - 包管理
- [SSL 证书管理](./ssl.md) - SSL 证书
- [CLI 命令行工具](./cli.md) - CLI 开发
- [Inquirer 交互询问](./inquirer.md) - 用户交互
- [Notification 系统通知](./notification.md) - 系统通知
- [Performance 性能监控](./performance.md) - 性能监控
