---
title: 基础示例
description: 快速创建、开发与构建示例，含错误处理与自定义配置
---

# 基础示例

## 快速开始

### 创建 Vue 3 项目

```typescript
import { createProject, startDev, buildProject } from '@ldesign/launcher'

async function createVueProject() {
  try {
    // 创建项目
    await createProject('./my-vue-app', 'vue3', { force: true })
    console.log('✅ Vue 3 项目创建成功')
    
    // 启动开发服务器
    const server = await startDev('./my-vue-app', { port: 3000 })
    console.log('✅ 开发服务器已启动')
    
    // 构建项目
    const result = await buildProject('./my-vue-app')
    if (result.success) {
      console.log('✅ 项目构建成功')
    }
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message)
  }
}
```

### 使用 ViteLauncher 类

```typescript
import { ViteLauncher } from '@ldesign/launcher'

async function basicUsage() {
  const launcher = new ViteLauncher()
  
  try {
    // 创建项目
    await launcher.create('./my-app', 'vue3', { force: true })
    
    // 启动开发服务器
    const server = await launcher.dev('./my-app', { port: 3000 })
    
    // 构建项目
    const result = await launcher.build('./my-app')
    
  } finally {
    await launcher.destroy()
  }
}
```

## 错误处理

```typescript
import { createProject } from '@ldesign/launcher'

async function createProjectWithErrorHandling() {
  try {
    await createProject('./my-app', 'vue3')
  } catch (error) {
    if (error.code === 'PROJECT_EXISTS') {
      await createProject('./my-app', 'vue3', { force: true })
    } else {
      console.error('创建项目失败:', error.message)
    }
  }
}
```

## 配置示例

```typescript
import { ViteLauncher } from '@ldesign/launcher'

async function customConfiguration() {
  const launcher = new ViteLauncher()
  
  launcher.configure({
    server: { port: 3000, open: true },
    build: { outDir: 'dist', minify: true }
  })
  
  try {
    await launcher.create('./my-app', 'vue3')
    const server = await launcher.dev('./my-app')
  } finally {
    await launcher.destroy()
  }
}
```
