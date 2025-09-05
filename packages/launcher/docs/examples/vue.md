---
title: Vue 项目示例
description: Vue 2/3 快速创建、开发与构建实践
---

# Vue 项目示例

## Vue 3 项目

### 创建 Vue 3 项目

```typescript
import { createProject, startDev, buildProject } from '@ldesign/launcher'

async function createVue3Project() {
  try {
    // 创建 Vue 3 项目
    await createProject('./my-vue3-app', 'vue3', { force: true })
    console.log('✅ Vue 3 项目创建成功')
    
    // 启动开发服务器
    const server = await startDev('./my-vue3-app', { 
      port: 3000,
      open: true 
    })
    
    // 构建项目
    const result = await buildProject('./my-vue3-app', {
      outDir: 'dist',
      minify: true
    })
    
    if (result.success) {
      console.log('✅ Vue 3 项目构建成功')
    }
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message)
  }
}
```

### 使用 TypeScript

```typescript
import { createProject } from '@ldesign/launcher'

async function createVue3WithTS() {
  try {
    // 创建 Vue 3 + TypeScript 项目
    await createProject('./my-vue3-ts-app', 'vue3', { 
      template: 'typescript',
      force: true 
    })
    
    console.log('✅ Vue 3 + TypeScript 项目创建成功')
    
  } catch (error) {
    console.error('❌ 创建失败:', error.message)
  }
}
```

## Vue 2 项目

### 创建 Vue 2 项目

```typescript
import { createProject, startDev } from '@ldesign/launcher'

async function createVue2Project() {
  try {
    // 创建 Vue 2 项目
    await createProject('./my-vue2-app', 'vue2', { force: true })
    console.log('✅ Vue 2 项目创建成功')
    
    // 启动开发服务器
    const server = await startDev('./my-vue2-app', { 
      port: 3001,
      open: true 
    })
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message)
  }
}
```

## 使用 ViteLauncher 类

### Vue 项目管理

```typescript
import { ViteLauncher } from '@ldesign/launcher'

async function manageVueProject() {
  const launcher = new ViteLauncher({
    logLevel: 'info',
    mode: 'development'
  })
  
  try {
    // 配置 Vue 特定设置
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
    
    // 创建 Vue 3 项目
    await launcher.create('./my-vue-app', 'vue3', { force: true })
    
    // 获取项目信息
    const projectInfo = await launcher.getProjectInfo('./my-vue-app')
    console.log('项目框架:', projectInfo.framework)
    console.log('TypeScript:', projectInfo.typescript)
    
    // 启动开发服务器
    const server = await launcher.dev('./my-vue-app')
    
    // 构建项目
    const result = await launcher.build('./my-vue-app')
    
  } finally {
    await launcher.destroy()
  }
}
```

## 错误处理

### Vue 特定错误处理

```typescript
import { createProject } from '@ldesign/launcher'

async function createVueWithErrorHandling() {
  try {
    await createProject('./my-vue-app', 'vue3')
  } catch (error) {
    if (error.code === 'PROJECT_EXISTS') {
      console.log('Vue 项目已存在，使用 force: true 选项覆盖')
      await createProject('./my-vue-app', 'vue3', { force: true })
    } else if (error.code === 'INVALID_PROJECT_TYPE') {
      console.log('无效的 Vue 项目类型，支持: vue3, vue2')
    } else {
      console.error('创建 Vue 项目失败:', error.message)
    }
  }
}
```
