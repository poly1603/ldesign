---
title: 基本概念
description: @ldesign/launcher 的架构、核心概念、生命周期与扩展机制
---

# 基本概念

在深入使用 @ldesign/launcher 之前，让我们了解一些核心概念，这将帮助您更好地理解和使用这个工具。

## 🏗️ 架构概览

@ldesign/launcher 采用分层架构设计：

```
┌─────────────────┐
│   CLI Layer     │  ← 命令行接口
├─────────────────┤
│   API Layer     │  ← 编程接口
├─────────────────┤
│   Core Layer    │  ← 核心逻辑
├─────────────────┤
│   Vite Layer    │  ← Vite JavaScript API
└─────────────────┘
```

### 核心组件

- **ViteLauncher**: 主启动器类，提供统一的 API 接口
- **ConfigManager**: 配置管理，处理配置文件的加载、验证和合并
- **PluginManager**: 插件管理，负责 Vite 插件的加载和管理
- **SmartPluginManager**: 智能插件管理，自动检测项目类型并加载对应插件
- **ErrorHandler**: 错误处理，提供统一的错误处理和用户友好的错误信息

## 🔧 核心概念

### 1. 配置 (Configuration)

配置是 @ldesign/launcher 的核心概念，它定义了项目的行为方式。

#### 配置层次结构

@ldesign/launcher 使用以下优先级顺序加载配置：

1. **命令行参数** (最高优先级)
2. **环境变量**
3. **项目配置文件**
4. **全局配置文件**
5. **默认配置** (最低优先级)

```typescript
// 配置合并示例
const finalConfig = {
  ...defaultConfig,     // 默认配置
  ...globalConfig,      // 全局配置
  ...projectConfig,     // 项目配置
  ...envConfig,         // 环境变量配置
  ...cliConfig          // 命令行配置
}
```

#### 配置文件格式

支持多种配置文件格式：

```typescript
// launcher.config.ts (推荐)
import { defineConfig } from '@ldesign/launcher'
export default defineConfig({
  server: { port: 3000 }
})

// launcher.config.js
export default {
  server: { port: 3000 }
}

// launcher.config.mjs
export default {
  server: { port: 3000 }
}

// launcher.config.json
{
  "server": { "port": 3000 }
}
```

### 2. 生命周期 (Lifecycle)

@ldesign/launcher 定义了清晰的生命周期阶段：

```
Initialize → Load Config → Setup Plugins → Start/Build/Preview → Cleanup
```

#### 开发服务器生命周期

```typescript
const launcher = new ViteLauncher()

// 1. 初始化阶段
await launcher.initialize()

// 2. 启动前钩子
// beforeStart hook

// 3. 启动服务器
await launcher.startDev()

// 4. 启动后钩子
// afterStart hook

// 5. 运行中 (HMR, 文件监听等)

// 6. 关闭前钩子
// beforeClose hook

// 7. 停止服务器
await launcher.stopDev()

// 8. 关闭后钩子
// afterClose hook

// 9. 清理资源
await launcher.destroy()
```

#### 构建生命周期

```typescript
// 1. 初始化
// 2. 构建前钩子 (beforeBuild)
// 3. 执行构建
// 4. 构建后钩子 (afterBuild)
// 5. 清理
```

### 3. 插件系统 (Plugin System)

插件系统基于 Vite 的插件机制，但提供了额外的功能：

#### 智能插件检测

@ldesign/launcher 可以自动检测项目类型并加载相应的插件：

```typescript
// 自动检测 Vue 3 项目并加载 @vitejs/plugin-vue
// 检测依据：package.json 中的 vue 版本、.vue 文件存在等
```

#### 插件配置

```typescript
export default defineConfig({
  plugins: [
    // 用户显式配置的插件
    vue(),
    
    // 智能检测的插件会自动添加（如果不冲突）
  ]
})
```

### 4. 事件系统 (Event System)

@ldesign/launcher 提供了丰富的事件系统：

```typescript
const launcher = new ViteLauncher()

// 监听服务器就绪事件
launcher.on('server-ready', ({ url, port }) => {
  console.log(`Server running at ${url}`)
})

// 监听构建完成事件
launcher.on('build-end', ({ duration, outputFiles }) => {
  console.log(`Build completed in ${duration}ms`)
})

// 监听错误事件
launcher.on('error', ({ error, context }) => {
  console.error(`Error in ${context}:`, error)
})
```

### 5. 环境模式 (Environment Modes)

支持不同的运行模式：

- **development**: 开发模式（默认用于 `launcher dev`）
- **production**: 生产模式（默认用于 `launcher build`）
- **test**: 测试模式
- **自定义模式**: 可以定义自己的模式

```typescript
// 通过配置指定模式
export default defineConfig({
  mode: 'development'
})

// 通过命令行指定
// launcher dev --mode staging
```

## 🔍 工作原理

### 1. 项目检测

当启动 @ldesign/launcher 时，它会自动检测：

```typescript
// 1. 项目类型检测
const projectType = await detectProjectType(cwd)
// Vue 2/3, React, Svelte, Vanilla 等

// 2. 包管理器检测
const packageManager = await detectPackageManager(cwd)
// pnpm, npm, yarn

// 3. TypeScript 检测
const hasTypeScript = await checkTypeScript(cwd)

// 4. 配置文件检测
const configFile = await findConfigFile(cwd)
```

### 2. 配置加载和合并

```typescript
// 1. 加载默认配置
const defaultConfig = getDefaultConfig()

// 2. 加载项目配置文件
const projectConfig = await loadConfigFile(configFile)

// 3. 应用环境变量
const envConfig = loadEnvConfig()

// 4. 应用命令行参数
const cliConfig = parseCliArgs()

// 5. 深度合并所有配置
const finalConfig = deepMerge(
  defaultConfig,
  projectConfig,
  envConfig,
  cliConfig
)
```

### 3. 插件加载

```typescript
// 1. 加载用户配置的插件
const userPlugins = config.plugins || []

// 2. 智能检测插件
const smartPlugins = await smartPluginManager.getRecommendedPlugins()

// 3. 去重合并插件
const allPlugins = deduplicatePlugins([...smartPlugins, ...userPlugins])

// 4. 应用到 Vite 配置
config.plugins = allPlugins
```

## 📊 性能特性

### 1. 冷启动优化

- **配置缓存**: 缓存已解析的配置文件
- **依赖预构建**: 利用 Vite 的依赖预构建
- **并行加载**: 并行加载插件和配置

### 2. 热更新 (HMR)

- **配置热重载**: 配置文件变更时自动重启
- **智能更新**: 只更新变更的模块
- **状态保持**: 保持应用状态

### 3. 构建优化

- **代码分割**: 自动代码分割优化
- **资源优化**: 图片、字体等资源优化
- **Tree Shaking**: 死代码消除

## 🔐 安全考虑

### 1. 配置验证

所有配置都会经过严格验证：

```typescript
// 配置验证示例
const validation = validateConfig(config)
if (!validation.valid) {
  throw new ValidationError(validation.errors)
}
```

### 2. 插件安全

- **插件白名单**: 只加载可信的插件
- **沙箱执行**: 插件在受控环境中执行
- **权限控制**: 限制插件的文件系统访问

### 3. 环境隔离

- **开发/生产分离**: 不同环境使用不同的配置
- **敏感信息保护**: 防止敏感信息泄露到客户端

## 🚀 扩展性

### 1. 自定义插件

```typescript
// 创建自定义插件
function myPlugin(options = {}) {
  return {
    name: 'my-plugin',
    configResolved(config) {
      // 插件逻辑
    }
  }
}

// 使用自定义插件
export default defineConfig({
  plugins: [myPlugin({ /* options */ })]
})
```

### 2. 自定义钩子

```typescript
export default defineConfig({
  launcher: {
    hooks: {
      beforeStart: async () => {
        console.log('Starting development server...')
      },
      afterStart: async (server) => {
        console.log(`Server started at ${server.url}`)
      }
    }
  }
})
```

### 3. 配置扩展

```typescript
// 基础配置
const baseConfig = defineConfig({
  server: { port: 3000 }
})

// 扩展配置
const extendedConfig = defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), myPlugin()]
})
```

## 📈 监控和调试

### 1. 性能监控

```typescript
const launcher = new ViteLauncher({
  launcher: {
    monitoring: {
      performance: true,
      memory: true,
      network: true
    }
  }
})

// 获取性能指标
const metrics = launcher.getPerformanceMetrics()
```

### 2. 调试模式

```bash
# 启用调试模式
launcher dev --debug

# 详细日志
DEBUG=launcher:* launcher dev
```

### 3. 错误报告

```typescript
launcher.on('error', ({ error, context, stack }) => {
  // 自动错误报告
  reportError({
    error: error.message,
    context,
    stack,
    userAgent: process.version,
    timestamp: Date.now()
  })
})
```

---

**下一步**: [了解配置文件](./config-file) 或 [查看开发服务器](./dev-server)
