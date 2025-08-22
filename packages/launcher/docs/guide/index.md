# 介绍

Vite Launcher 是一个基于 Vite 的前端项目启动器，提供程序化的 API 来简化前端项目的创建、开发和构建流程。

## 主要特性

### 🚀 快速项目创建
支持多种前端框架的项目模板，一键创建完整的项目结构：

- Vue 3/2 项目
- React 项目
- Next.js 项目
- Vanilla JavaScript/TypeScript 项目
- 其他流行框架

### 🔧 程序化 API
提供完整的 TypeScript 类型支持，易于集成到现有工具链：

```typescript
import { ViteLauncher, createProject, startDev } from '@ldesign/launcher'

// 创建项目
await createProject('./my-app', 'vue3')

// 启动开发服务器
const server = await startDev('./my-app', { port: 3000 })
```

### 🎯 智能检测
自动检测项目类型、依赖关系和配置需求：

```typescript
import { detectProject } from '@ldesign/launcher'

const projectInfo = await detectProject('./my-project')
console.log('项目类型:', projectInfo.projectType)
console.log('框架:', projectInfo.framework)
```

### 🛠️ 灵活配置
支持自定义配置，满足不同项目的特殊需求：

```typescript
const launcher = new ViteLauncher({
  logLevel: 'info',
  mode: 'development',
  autoDetect: true
})

launcher.configure({
  server: { port: 3000 },
  build: { outDir: 'dist' }
})
```

## 架构设计

Vite Launcher 采用模块化设计，主要包含以下组件：

### 核心类
- **ViteLauncher**: 主要的启动器类，提供项目创建、开发、构建等核心功能
- **ProjectDetector**: 项目类型检测器，自动识别项目框架和特性
- **ConfigManager**: 配置管理器，处理配置的加载、合并和应用
- **PluginManager**: 插件管理器，管理 Vite 插件的加载和配置
- **ErrorHandler**: 错误处理器，提供统一的错误处理和格式化

### 服务层
- 文件系统操作
- 依赖管理
- 模板生成
- 构建优化

## 使用场景

### 1. 项目脚手架
快速创建各种类型的前端项目，减少重复工作：

```typescript
// 创建 Vue 3 项目
await createProject('./vue-app', 'vue3', { force: true })

// 创建 React 项目
await createProject('./react-app', 'react', { template: 'typescript' })
```

### 2. 开发环境管理
统一管理开发服务器的启动、配置和停止：

```typescript
const server = await startDev('./my-app', {
  port: 3000,
  host: 'localhost',
  open: true
})

// 停止服务器
await stopDev()
```

### 3. 构建流程
标准化构建流程，支持多种输出格式：

```typescript
const result = await buildProject('./my-app', {
  outDir: 'dist',
  minify: true,
  sourcemap: false
})
```

### 4. 工具集成
作为其他工具的核心组件，提供统一的 API：

```typescript
import { ViteLauncher } from '@ldesign/launcher'

class MyTool {
  private launcher = new ViteLauncher()
  
  async createProject(type: string) {
    return this.launcher.create('./project', type)
  }
}
```

## 技术栈

- **TypeScript**: 主要开发语言，提供类型安全
- **Vite**: 底层构建工具，提供快速的开发体验
- **Node.js**: 运行时环境
- **Vitest**: 测试框架
- **tsup**: 打包工具

## 性能指标

- **构建时间**: ~2.5秒 (包含类型生成)
- **包大小**: ~67KB (压缩后)
- **测试覆盖率**: 68.1% (持续改进中)
- **类型覆盖率**: 100%

## 下一步

- [快速开始](./getting-started.md) - 了解如何安装和使用
- [基础用法](./basic-usage.md) - 学习基本的使用方法
- [高级用法](./advanced-usage.md) - 探索高级功能和最佳实践
- [API 参考](../api/vite-launcher.md) - 查看完整的 API 文档
