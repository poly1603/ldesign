---
title: React 项目示例
description: React/Next.js 快速创建、开发与构建实践
---

# React 项目示例

## React 项目

### 创建 React 项目

```typescript
import { createProject, startDev, buildProject } from '@ldesign/launcher'

async function createReactProject() {
  try {
    // 创建 React 项目
    await createProject('./my-react-app', 'react', { force: true })
    console.log('✅ React 项目创建成功')
    
    // 启动开发服务器
    const server = await startDev('./my-react-app', { 
      port: 3000,
      open: true 
    })
    
    // 构建项目
    const result = await buildProject('./my-react-app', {
      outDir: 'dist',
      minify: true
    })
    
    if (result.success) {
      console.log('✅ React 项目构建成功')
    }
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message)
  }
}
```

### 使用 TypeScript

```typescript
import { createProject } from '@ldesign/launcher'

async function createReactWithTS() {
  try {
    // 创建 React + TypeScript 项目
    await createProject('./my-react-ts-app', 'react', { 
      template: 'typescript',
      force: true 
    })
    
    console.log('✅ React + TypeScript 项目创建成功')
    
  } catch (error) {
    console.error('❌ 创建失败:', error.message)
  }
}
```

## Next.js 项目

### 创建 Next.js 项目

```typescript
import { createProject, startDev } from '@ldesign/launcher'

async function createNextProject() {
  try {
    // 创建 Next.js 项目
    await createProject('./my-next-app', 'react-next', { force: true })
    console.log('✅ Next.js 项目创建成功')
    
    // 启动开发服务器
    const server = await startDev('./my-next-app', { 
      port: 3000,
      open: true 
    })
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message)
  }
}
```

## 使用 ViteLauncher 类

### React 项目管理

```typescript
import { ViteLauncher } from '@ldesign/launcher'

async function manageReactProject() {
  const launcher = new ViteLauncher({
    logLevel: 'info',
    mode: 'development'
  })
  
  try {
    // 配置 React 特定设置
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
    
    // 创建 React 项目
    await launcher.create('./my-react-app', 'react', { force: true })
    
    // 获取项目信息
    const projectInfo = await launcher.getProjectInfo('./my-react-app')
    console.log('项目框架:', projectInfo.framework)
    console.log('TypeScript:', projectInfo.typescript)
    
    // 启动开发服务器
    const server = await launcher.dev('./my-react-app')
    
    // 构建项目
    const result = await launcher.build('./my-react-app')
    
  } finally {
    await launcher.destroy()
  }
}
```

## 错误处理

### React 特定错误处理

```typescript
import { createProject } from '@ldesign/launcher'

async function createReactWithErrorHandling() {
  try {
    await createProject('./my-react-app', 'react')
  } catch (error) {
    if (error.code === 'PROJECT_EXISTS') {
      console.log('React 项目已存在，使用 force: true 选项覆盖')
      await createProject('./my-react-app', 'react', { force: true })
    } else if (error.code === 'INVALID_PROJECT_TYPE') {
      console.log('无效的 React 项目类型，支持: react, react-next')
    } else {
      console.error('创建 React 项目失败:', error.message)
    }
  }
}
```
