# 配置选项

本页面详细介绍 @ldesign/git 的各种配置选项和使用方法。

## 基础配置

### GitRepositoryOptions

主要的配置接口，用于创建 Git 实例时的配置：

```typescript
interface GitRepositoryOptions {
  baseDir?: string              // 仓库路径
  binary?: string              // Git 可执行文件路径
  maxConcurrentProcesses?: number  // 最大并发数
  timeout?: number             // 超时时间（毫秒）
  debug?: boolean              // 是否启用调试模式
}
```

### 使用配置

```typescript
import { Git } from '@ldesign/git'

const git = new Git('/path/to/repository', {
  timeout: 30000,              // 30 秒超时
  debug: true,                 // 启用调试
  maxConcurrentProcesses: 10,  // 最大 10 个并发进程
  binary: '/usr/local/bin/git' // 自定义 Git 路径
})
```

## 详细配置说明

### baseDir - 仓库路径

指定 Git 仓库的根目录路径。

```typescript
// 使用当前目录
const git = new Git()

// 指定绝对路径
const git = new Git('/home/user/projects/my-repo')

// 指定相对路径
const git = new Git('./my-repo')

// 通过配置对象指定
const git = new Git('.', {
  baseDir: '/path/to/repository'
})
```

**默认值**: 当前工作目录 (`process.cwd()`)

### binary - Git 可执行文件路径

指定 Git 可执行文件的路径，用于自定义 Git 安装位置。

```typescript
const git = new Git('.', {
  binary: '/usr/local/bin/git'        // macOS Homebrew
  // binary: '/usr/bin/git'           // Linux 系统默认
  // binary: 'C:\\Git\\bin\\git.exe'  // Windows
})
```

**默认值**: `'git'` (从 PATH 环境变量查找)

**使用场景**:
- 使用非标准安装的 Git
- 多个 Git 版本共存
- 容器环境中的特定路径

### timeout - 超时时间

设置 Git 命令的超时时间（毫秒）。

```typescript
const git = new Git('.', {
  timeout: 60000  // 60 秒
})
```

**默认值**: `30000` (30 秒)

**建议值**:
- 本地操作: 10000-30000ms
- 网络操作: 60000-120000ms
- 大型仓库: 120000ms+

### maxConcurrentProcesses - 最大并发数

限制同时运行的 Git 进程数量。

```typescript
const git = new Git('.', {
  maxConcurrentProcesses: 5
})
```

**默认值**: `5`

**调优建议**:
- CPU 密集型操作: 设置为 CPU 核心数
- I/O 密集型操作: 可以设置更高
- 内存受限环境: 设置较低值

### debug - 调试模式

启用调试模式，输出详细的执行信息。

```typescript
const git = new Git('.', {
  debug: true
})
```

**默认值**: `false`

**调试信息包括**:
- 执行的 Git 命令
- 命令参数
- 执行时间
- 输出结果

## 环境变量配置

支持通过环境变量进行配置：

```bash
# 设置默认超时时间
export LDESIGN_GIT_TIMEOUT=60000

# 设置 Git 可执行文件路径
export LDESIGN_GIT_BINARY=/usr/local/bin/git

# 启用调试模式
export LDESIGN_GIT_DEBUG=true

# 设置最大并发数
export LDESIGN_GIT_MAX_CONCURRENT=10
```

在代码中使用环境变量：

```typescript
const git = new Git('.', {
  timeout: parseInt(process.env.LDESIGN_GIT_TIMEOUT || '30000'),
  binary: process.env.LDESIGN_GIT_BINARY || 'git',
  debug: process.env.LDESIGN_GIT_DEBUG === 'true',
  maxConcurrentProcesses: parseInt(process.env.LDESIGN_GIT_MAX_CONCURRENT || '5')
})
```

## 动态配置

### 运行时修改配置

```typescript
const git = new Git()

// 获取当前配置
const options = git.getOptions()
console.log('当前超时时间:', options.timeout)

// 修改配置（如果支持）
// 注意：某些配置可能需要重新创建实例
```

### 配置验证

```typescript
function validateConfig(options: GitRepositoryOptions) {
  if (options.timeout && options.timeout < 1000) {
    throw new Error('超时时间不能少于 1 秒')
  }
  
  if (options.maxConcurrentProcesses && options.maxConcurrentProcesses < 1) {
    throw new Error('并发数不能少于 1')
  }
  
  if (options.baseDir && !path.isAbsolute(options.baseDir)) {
    options.baseDir = path.resolve(options.baseDir)
  }
}
```

## 不同环境的配置

### 开发环境

```typescript
const developmentConfig: GitRepositoryOptions = {
  debug: true,
  timeout: 10000,
  maxConcurrentProcesses: 3
}

const git = new Git('.', developmentConfig)
```

### 生产环境

```typescript
const productionConfig: GitRepositoryOptions = {
  debug: false,
  timeout: 60000,
  maxConcurrentProcesses: 10
}

const git = new Git('.', productionConfig)
```

### 测试环境

```typescript
const testConfig: GitRepositoryOptions = {
  debug: false,
  timeout: 5000,
  maxConcurrentProcesses: 1  // 避免测试冲突
}

const git = new Git('.', testConfig)
```

### CI/CD 环境

```typescript
const ciConfig: GitRepositoryOptions = {
  debug: process.env.CI_DEBUG === 'true',
  timeout: 120000,  // CI 环境可能较慢
  maxConcurrentProcesses: 2,
  binary: process.env.GIT_BINARY || 'git'
}

const git = new Git('.', ciConfig)
```

## 配置文件

### 使用配置文件

创建 `git.config.js`:

```javascript
module.exports = {
  development: {
    debug: true,
    timeout: 10000,
    maxConcurrentProcesses: 3
  },
  production: {
    debug: false,
    timeout: 60000,
    maxConcurrentProcesses: 10
  },
  test: {
    debug: false,
    timeout: 5000,
    maxConcurrentProcesses: 1
  }
}
```

使用配置文件：

```typescript
import config from './git.config.js'

const env = process.env.NODE_ENV || 'development'
const git = new Git('.', config[env])
```

### JSON 配置文件

创建 `git.config.json`:

```json
{
  "development": {
    "debug": true,
    "timeout": 10000,
    "maxConcurrentProcesses": 3
  },
  "production": {
    "debug": false,
    "timeout": 60000,
    "maxConcurrentProcesses": 10
  }
}
```

## 性能优化配置

### 大型仓库优化

```typescript
const largeRepoConfig: GitRepositoryOptions = {
  timeout: 300000,  // 5 分钟
  maxConcurrentProcesses: 2,  // 减少并发避免资源竞争
  debug: false  // 关闭调试减少开销
}
```

### 网络环境优化

```typescript
const networkOptimizedConfig: GitRepositoryOptions = {
  timeout: 180000,  // 3 分钟，适应慢网络
  maxConcurrentProcesses: 1,  // 避免网络拥塞
}
```

### 内存受限环境

```typescript
const memoryConstrainedConfig: GitRepositoryOptions = {
  maxConcurrentProcesses: 1,  // 最小并发
  timeout: 60000
}
```

## 故障排除

### 常见配置问题

1. **Git 命令未找到**
   ```typescript
   const git = new Git('.', {
     binary: '/usr/local/bin/git'  // 指定完整路径
   })
   ```

2. **超时问题**
   ```typescript
   const git = new Git('.', {
     timeout: 120000  // 增加超时时间
   })
   ```

3. **权限问题**
   ```typescript
   const git = new Git('.', {
     binary: 'sudo git'  // 使用 sudo（不推荐）
   })
   ```

### 调试配置

启用详细调试信息：

```typescript
const git = new Git('.', {
  debug: true
})

// 监听所有事件
git.repository.on('*', (event, data) => {
  console.log(`事件: ${event}`, data)
})
```

## 最佳实践

1. **环境分离**: 不同环境使用不同配置
2. **安全性**: 不要在代码中硬编码敏感信息
3. **性能**: 根据实际需求调整并发数和超时时间
4. **调试**: 开发时启用调试，生产时关闭
5. **验证**: 对配置参数进行验证
6. **文档**: 为配置选项编写清晰的文档

## 下一步

- 了解 [事件系统](/guide/events) 的使用方法
- 学习 [错误处理](/guide/error-handling) 的最佳实践
- 查看 [API 参考](/api/git) 获取详细接口说明
