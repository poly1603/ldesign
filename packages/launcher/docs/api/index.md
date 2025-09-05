# API 参考

@ldesign/launcher 提供了丰富的编程接口，让您可以在代码中灵活使用启动器功能。

## 📚 API 概览

### 核心类

| 类名 | 描述 | 文档链接 |
|------|------|----------|
| `ViteLauncher` | 主启动器类，提供开发、构建、预览功能 | [查看详情](./vite-launcher) |
| `ConfigManager` | 配置管理器，处理配置加载和验证 | [查看详情](./config-manager) |
| `PluginManager` | 插件管理器，管理 Vite 插件 | [查看详情](./plugin-manager) |
| `ErrorHandler` | 错误处理器，统一错误处理 | [查看详情](./error-handler) |

### 工具函数

| 函数 | 描述 | 文档链接 |
|------|------|----------|
| `defineConfig` | 定义配置的辅助函数 | [查看详情](./utils/config) |
| `loadConfigFile` | 加载配置文件 | [查看详情](./utils/config) |
| `validateConfig` | 验证配置 | [查看详情](./utils/config) |
| `mergeConfigs` | 合并配置 | [查看详情](./utils/config) |
| `getServerUrl` | 获取服务器 URL | [查看详情](./utils/server) |
| `analyzeBuildResult` | 分析构建结果 | [查看详情](./utils/build) |

### 类型定义

| 类型 | 描述 | 文档链接 |
|------|------|----------|
| `ViteLauncherConfig` | 启动器配置类型 | [查看详情](./types/config) |
| `LauncherOptions` | 启动器选项类型 | [查看详情](./types/config) |
| `LauncherPlugin` | 插件类型定义 | [查看详情](./types/plugin) |
| `LauncherEvent` | 事件类型定义 | [查看详情](./types/events) |

## 🚀 快速开始

### 基本用法

```typescript
import { ViteLauncher, defineConfig } from '@ldesign/launcher'

// 创建配置
const config = defineConfig({
  server: {
    port: 3000,
    host: 'localhost'
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})

// 创建启动器实例
const launcher = new ViteLauncher({
  cwd: process.cwd(),
  config
})

// 使用启动器
async function main() {
  try {
    // 启动开发服务器
    const devServer = await launcher.startDev()
    console.log(`Dev server running at ${devServer.resolvedUrls?.local?.[0]}`)
    
    // 或者执行构建
    const buildResult = await launcher.build()
    console.log('Build completed:', buildResult)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    // 清理资源
    await launcher.destroy()
  }
}

main()
```

### 事件监听

```typescript
import { ViteLauncher } from '@ldesign/launcher'

const launcher = new ViteLauncher()

// 监听服务器就绪
launcher.onReady(() => {
  console.log('Server is ready!')
})

// 监听错误
launcher.onError((error) => {
  console.error('Launcher error:', error)
})

// 监听关闭
launcher.onClose(() => {
  console.log('Server closed')
})

// 使用通用事件监听器
launcher.on('server-ready', (data) => {
  console.log('Server ready:', data)
})

launcher.on('build-start', (data) => {
  console.log('Build started:', data)
})

launcher.on('build-end', (data) => {
  console.log('Build finished:', data)
})
```

### 高级用法

```typescript
import { 
  ViteLauncher, 
  ConfigManager, 
  loadConfigFile,
  validateConfig
} from '@ldesign/launcher'

async function advancedUsage() {
  // 手动加载和验证配置
  const configPath = './launcher.config.ts'
  const config = await loadConfigFile(configPath)
  
  const validation = validateConfig(config)
  if (!validation.valid) {
    throw new Error(`Invalid config: ${validation.errors.join(', ')}`)
  }
  
  // 创建配置管理器
  const configManager = new ConfigManager({
    configFile: configPath,
    watch: true // 启用配置热重载
  })
  
  // 创建启动器
  const launcher = new ViteLauncher({
    configManager,
    config
  })
  
  // 设置生命周期钩子
  const removeListeners = launcher.setupEventListeners({
    'status-change': ({ from, to }) => {
      console.log(`Status changed from ${from} to ${to}`)
    },
    'config-updated': (newConfig) => {
      console.log('Config updated:', newConfig)
    }
  })
  
  try {
    await launcher.startDev()
    
    // 等待用户输入或其他条件
    await waitForExit()
    
  } finally {
    removeListeners()
    await launcher.destroy()
  }
}
```

## 🔌 插件开发

### 创建自定义插件

```typescript
import type { Plugin } from 'vite'
import type { LauncherPlugin } from '@ldesign/launcher'

// 创建 Vite 插件
function myVitePlugin(): Plugin {
  return {
    name: 'my-vite-plugin',
    configResolved(config) {
      // 插件逻辑
    }
  }
}

// 创建 Launcher 插件
function myLauncherPlugin(): LauncherPlugin {
  return {
    name: 'my-launcher-plugin',
    
    async init(launcher) {
      console.log('Plugin initialized')
    },
    
    async destroy() {
      console.log('Plugin destroyed')
    },
    
    // 可以返回 Vite 插件
    getVitePlugins() {
      return [myVitePlugin()]
    }
  }
}

// 使用插件
const launcher = new ViteLauncher({
  config: {
    plugins: [myVitePlugin()], // Vite 插件
  }
})

// 注册 Launcher 插件
launcher.registerPlugin(myLauncherPlugin())
```

## 📊 性能监控

```typescript
import { ViteLauncher } from '@ldesign/launcher'

const launcher = new ViteLauncher({
  config: {
    launcher: {
      monitoring: {
        performance: true,
        memory: true,
        network: true
      }
    }
  }
})

// 获取性能指标
const metrics = launcher.getPerformanceMetrics()
console.log('Performance metrics:', {
  memory: metrics.memory,
  cpu: metrics.cpu,
  startupTime: metrics.startupTime,
  buildTime: metrics.buildTime
})

// 获取统计信息
const stats = launcher.getStats()
console.log('Statistics:', {
  startCount: stats.startCount,
  buildCount: stats.buildCount,
  errorCount: stats.errorCount,
  averageStartTime: stats.averageStartTime
})
```

## 🔧 配置管理

```typescript
import { 
  ConfigManager, 
  defineConfig, 
  mergeConfigs,
  validateConfig 
} from '@ldesign/launcher'

// 创建基础配置
const baseConfig = defineConfig({
  server: { port: 3000 },
  build: { outDir: 'dist' }
})

// 创建环境特定配置
const devConfig = defineConfig({
  server: { open: true },
  build: { sourcemap: true }
})

const prodConfig = defineConfig({
  build: { 
    minify: true,
    sourcemap: false 
  }
})

// 合并配置
const isDevelopment = process.env.NODE_ENV === 'development'
const config = mergeConfigs(
  baseConfig,
  isDevelopment ? devConfig : prodConfig
)

// 验证配置
const validation = validateConfig(config)
if (!validation.valid) {
  console.error('Config validation errors:', validation.errors)
  process.exit(1)
}

// 创建配置管理器
const configManager = new ConfigManager({
  watch: true,
  validate: true
})

configManager.on('config-changed', (newConfig) => {
  console.log('Configuration changed:', newConfig)
})
```

## 🚨 错误处理

```typescript
import { 
  ViteLauncher, 
  ErrorHandler, 
  LauncherError 
} from '@ldesign/launcher'

// 创建自定义错误处理器
const errorHandler = new ErrorHandler({
  exitOnError: false,
  logger: console,
  onError: (error, context) => {
    // 自定义错误处理逻辑
    console.error(`Error in ${context}:`, error)
    
    // 发送错误报告
    sendErrorReport(error, context)
  }
})

const launcher = new ViteLauncher({
  errorHandler
})

// 捕获并处理错误
try {
  await launcher.startDev()
} catch (error) {
  if (error instanceof LauncherError) {
    console.error('Launcher specific error:', error.code, error.message)
  } else {
    console.error('Generic error:', error)
  }
}
```

## 📖 文档导航

### 按类别浏览

- **核心 API**: 主要的类和接口
  - [ViteLauncher](./vite-launcher) - 主启动器类
  - [ConfigManager](./config-manager) - 配置管理
  - [PluginManager](./plugin-manager) - 插件管理

- **类型定义**: TypeScript 类型定义
  - [配置类型](./types/config) - 配置相关类型
  - [插件类型](./types/plugin) - 插件相关类型
  - [事件类型](./types/events) - 事件相关类型

- **工具函数**: 实用工具函数
  - [配置工具](./utils/config) - 配置处理函数
  - [服务器工具](./utils/server) - 服务器相关函数
  - [构建工具](./utils/build) - 构建相关函数
  - [验证工具](./utils/validation) - 验证相关函数

### 按使用场景浏览

- **开发环境**: [开发服务器 API](./dev-server-api)
- **构建流程**: [构建 API](./build-api) 
- **预览服务**: [预览 API](./preview-api)
- **插件开发**: [插件开发 API](./plugin-development-api)
- **错误处理**: [错误处理 API](./error-handling-api)

---

**开始探索**: 选择一个 API 类别开始深入了解，或查看 [完整示例](../examples/) 了解实际用法。
