---
title: 基础用法
description: 创建项目、启动/停止开发服务器、构建与预览的基础工作流
---

# 基础用法

本章介绍 Vite Launcher 的基础用法，包括项目创建、开发服务器管理、构建等核心功能。

## 项目创建

### 基本项目创建

```typescript
import { ViteLauncher } from '@ldesign/launcher'

const launcher = new ViteLauncher()

// 创建 Vue 3 项目
await launcher.create('./my-vue-app', 'vue3')

// 创建 React 项目
await launcher.create('./my-react-app', 'react')

// 强制覆盖现有目录
await launcher.create('./my-app', 'vue3', { force: true })
```

## 开发服务器管理

### 启动开发服务器

```typescript
// 启动开发服务器
const server = await launcher.dev('./my-app', {
  port: 3000,
  host: '127.0.0.1',
  open: true
})

// 停止开发服务器
await launcher.stop()
```

## 项目构建

### 基本构建

```typescript
// 构建项目
const result = await launcher.build('./my-app')

if (result.success) {
  console.log('构建成功!')
  console.log('输出文件:', result.outputFiles)
} else {
  console.error('构建失败:', result.errors)
}
```

### 自定义构建配置

```typescript
const result = await launcher.build('./my-app', {
  outDir: 'dist',
  minify: true,
  sourcemap: false
})
```

## 预览服务器

### 启动预览服务器

```typescript
// 启动预览服务器
const server = await launcher.preview('./my-app', {
  port: 4173,
  open: true
})
```

## 配置管理

### 更新配置

```typescript
// 更新启动器配置
launcher.configure({
  server: { port: 3000 },
  build: { outDir: 'dist' }
})

// 获取当前配置
const config = launcher.getConfig()
```

## 项目信息

### 获取项目信息

```typescript
// 获取项目类型
const projectType = launcher.getProjectType()

// 获取详细项目信息
const projectInfo = await launcher.getProjectInfo('./my-app')
console.log('框架:', projectInfo.framework)
console.log('TypeScript:', projectInfo.typescript)
```

## 实例生命周期

### 创建和销毁

```typescript
const launcher = new ViteLauncher()

try {
  await launcher.create('./my-app', 'vue3')
  const server = await launcher.dev('./my-app')
  await launcher.stop()
} finally {
  await launcher.destroy()
}
```

## 错误处理

### 基本错误处理

```typescript
try {
  await launcher.create('./my-app', 'vue3')
} catch (error) {
  if (error.code === 'PROJECT_EXISTS') {
    await launcher.create('./my-app', 'vue3', { force: true })
  }
}
```

## 完整工作流示例

```typescript
import { ViteLauncher } from '@ldesign/launcher'

async function basicWorkflow() {
  const launcher = new ViteLauncher()
  
  try {
    // 创建项目
    await launcher.create('./my-app', 'vue3', { force: true })
    
    // 启动开发服务器
    const server = await launcher.dev('./my-app', { port: 3000 })
    
    // 等待一段时间
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // 停止服务器
    await launcher.stop()
    
    // 构建项目
    const result = await launcher.build('./my-app')
    
    if (result.success) {
      console.log('✅ 工作流程完成!')
    }
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message)
  } finally {
    await launcher.destroy()
  }
}
```

## 最佳实践

1. **错误处理**: 始终使用 try-catch 包装异步操作
2. **资源管理**: 及时停止服务器并销毁实例
3. **配置管理**: 在创建实例后立即配置
4. **日志管理**: 设置合适的日志级别

## 下一步

- [高级用法](./advanced-usage.md) - 学习高级功能
- [配置选项](./configuration.md) - 了解详细配置
- [项目类型](./project-types.md) - 了解支持的项目类型
