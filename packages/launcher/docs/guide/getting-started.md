---
title: 入门指南
description: 通过 API 和 CLI 创建项目、启动开发服务器、构建与预览
---

# 快速开始

## 安装

### 使用 npm

```bash
npm install @ldesign/launcher
```

### 使用 yarn

```bash
yarn add @ldesign/launcher
```

### 使用 pnpm

```bash
pnpm add @ldesign/launcher
```

## 基本使用

### 1. 导入模块

```typescript
import { ViteLauncher, createProject, startDev, buildProject } from '@ldesign/launcher'
```

### 2. 创建项目

```typescript
// 创建 Vue 3 项目
await createProject('./my-vue-app', 'vue3', { force: true })

// 创建 React 项目
await createProject('./my-react-app', 'react')

// 创建 Vanilla 项目
await createProject('./my-vanilla-app', 'vanilla')
```

### 3. 启动开发服务器

```typescript
// 启动开发服务器
const server = await startDev('./my-vue-app', { 
  port: 3000,
  host: '127.0.0.1',
  open: true 
})

console.log('开发服务器已启动:', server.config.server?.port)
```

### 4. 构建项目

```typescript
// 构建项目
const result = await buildProject('./my-vue-app', {
  outDir: 'dist',
  minify: true,
  sourcemap: false
})

if (result.success) {
  console.log('构建成功!')
  console.log('输出文件:', result.outputFiles)
  console.log('构建时间:', result.duration, 'ms')
} else {
  console.error('构建失败:', result.errors)
}
```

## 完整示例

```typescript
import { ViteLauncher, createProject, startDev, buildProject, stopDev } from '@ldesign/launcher'

async function main() {
  try {
    // 1. 创建项目
    console.log('创建 Vue 3 项目...')
    await createProject('./my-app', 'vue3', { force: true })
    
    // 2. 启动开发服务器
    console.log('启动开发服务器...')
    const server = await startDev('./my-app', { 
      port: 3000,
      open: true 
    })
    
    // 3. 等待一段时间后构建
    console.log('等待 5 秒后开始构建...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // 4. 停止开发服务器
    await stopDev()
    
    // 5. 构建项目
    console.log('开始构建项目...')
    const result = await buildProject('./my-app', {
      outDir: 'dist',
      minify: true
    })
    
    if (result.success) {
      console.log('✅ 项目创建和构建完成!')
      console.log(`📦 输出目录: ${result.outputFiles.length} 个文件`)
      console.log(`⏱️  构建时间: ${result.duration}ms`)
    } else {
      console.error('❌ 构建失败:', result.errors)
    }
    
  } catch (error) {
    console.error('❌ 操作失败:', error)
  }
}

main()
```

## 使用 ViteLauncher 类

如果你需要更多控制，可以直接使用 `ViteLauncher` 类：

```typescript
import { ViteLauncher } from '@ldesign/launcher'

async function advancedUsage() {
  // 创建启动器实例
  const launcher = new ViteLauncher({
    logLevel: 'info',
    mode: 'development',
    autoDetect: true
  })
  
  try {
    // 配置启动器
    launcher.configure({
      server: {
        port: 3000,
        host: '127.0.0.1'
      },
      build: {
        outDir: 'dist',
        sourcemap: true
      }
    })
    
    // 创建项目
    await launcher.create('./my-app', 'vue3', { force: true })
    
    // 启动开发服务器
    const server = await launcher.dev('./my-app')
    
    // 获取项目信息
    const projectInfo = await launcher.getProjectInfo('./my-app')
    console.log('项目信息:', projectInfo)
    
    // 停止服务器
    await launcher.stop()
    
    // 构建项目
    const result = await launcher.build('./my-app')
    console.log('构建结果:', result)
    
  } finally {
    // 销毁实例
    await launcher.destroy()
  }
}

advancedUsage()
```

## 项目类型

Vite Launcher 支持以下项目类型：

| 类型 | 描述 | 框架 |
|------|------|------|
| `vue3` | Vue 3 项目 | Vue 3 |
| `vue2` | Vue 2 项目 | Vue 2 |
| `react` | React 项目 | React |
| `react-next` | Next.js 项目 | React + Next.js |
| `vanilla` | 原生 JavaScript 项目 | 无框架 |
| `vanilla-ts` | TypeScript 项目 | 无框架 |
| `lit` | Lit 项目 | Lit |
| `svelte` | Svelte 项目 | Svelte |
| `angular` | Angular 项目 | Angular |

## 配置选项

### LauncherOptions

```typescript
interface LauncherOptions {
  logLevel?: 'error' | 'warn' | 'info' | 'silent' // 日志级别
  mode?: 'development' | 'production' // 运行模式
  autoDetect?: boolean // 是否启用自动检测
  root?: string // 项目根目录
  configFile?: string // Vite 配置文件路径
}
```

### DevOptions

```typescript
interface DevOptions {
  port?: number // 端口号
  host?: string // 主机地址
  open?: boolean // 是否自动打开浏览器
  https?: boolean // 是否使用 HTTPS
}
```

### BuildOptions

```typescript
interface BuildOptions {
  outDir?: string // 输出目录
  minify?: boolean // 是否压缩
  sourcemap?: boolean // 是否生成 sourcemap
  emptyOutDir?: boolean // 是否清空输出目录
}
```

## 错误处理

Vite Launcher 提供统一的错误处理：

```typescript
import { ViteLauncher } from '@ldesign/launcher'

const launcher = new ViteLauncher()

try {
  await launcher.create('./my-app', 'vue3')
} catch (error) {
  if (error.code === 'PROJECT_EXISTS') {
    console.log('项目已存在，使用 force: true 选项覆盖')
    await launcher.create('./my-app', 'vue3', { force: true })
  } else {
    console.error('创建项目失败:', error.message)
  }
}
```

## 下一步

- [基础用法](./basic-usage.md) - 学习更多基本功能
- [高级用法](./advanced-usage.md) - 探索高级特性
- [配置选项](./configuration.md) - 了解详细配置
- [API 参考](../api/vite-launcher.md) - 查看完整 API 文档
