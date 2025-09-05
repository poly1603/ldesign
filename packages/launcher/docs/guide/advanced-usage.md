---
title: 高级用法
description: 深度配置、条件插件、性能优化、并行/批量构建与错误重试
---

# 高级用法

本章介绍 Vite Launcher 的高级用法，包括自定义配置、插件管理、性能优化等高级功能。

## 自定义配置

### 深度配置

```typescript
import { ViteLauncher } from '@ldesign/launcher'

const launcher = new ViteLauncher({
  logLevel: 'info',
  mode: 'development',
  autoDetect: true
})

// 深度配置
launcher.configure({
  server: {
    port: 3000,
    host: '127.0.0.1',
    https: false,
    cors: true,
    open: true
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'react']
        }
      }
    }
  },
  plugins: [
    // 自定义插件
  ]
})
```

### 环境特定配置

```typescript
// 开发环境配置
const devConfig = {
  server: { port: 3000 },
  build: { sourcemap: true }
}

// 生产环境配置
const prodConfig = {
  build: { 
    minify: true,
    sourcemap: false,
    outDir: 'dist'
  }
}

// 根据环境应用配置
const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig
launcher.configure(config)
```

## 插件管理

### 自定义插件

```typescript
import { defineConfig } from 'vite'

// 自定义 Vite 插件
const customPlugin = () => ({
  name: 'custom-plugin',
  config(config) {
    // 修改配置
    return config
  },
  transform(code, id) {
    // 转换代码
    return code
  }
})

// 应用自定义插件
launcher.configure({
  plugins: [customPlugin()]
})
```

### 条件插件

```typescript
const plugins = []

// 根据项目类型添加插件
if (projectType === 'vue3') {
  plugins.push(vue())
}

if (projectType === 'react') {
  plugins.push(react())
}

launcher.configure({ plugins })
```

## 性能优化

### 构建优化

```typescript
// 优化构建配置
launcher.configure({
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'react'],
          utils: ['lodash', 'axios']
        }
      }
    }
  }
})
```

### 开发服务器优化

```typescript
// 优化开发服务器
launcher.configure({
  server: {
    hmr: {
      overlay: false
    },
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**']
    }
  }
})
```

## 多项目管理

### 批量操作

```typescript
async function batchProcess(projects: string[]) {
  const launcher = new ViteLauncher()
  
  try {
    for (const project of projects) {
      console.log(`处理项目: ${project}`)
      
      // 构建项目
      const result = await launcher.build(project)
      
      if (result.success) {
        console.log(`✅ ${project} 构建成功`)
      } else {
        console.error(`❌ ${project} 构建失败:`, result.errors)
      }
    }
  } finally {
    await launcher.destroy()
  }
}

// 批量构建多个项目
batchProcess(['./project1', './project2', './project3'])
```

### 并行处理

```typescript
async function parallelProcess(projects: string[]) {
  const launcher = new ViteLauncher()
  
  try {
    // 并行构建多个项目
    const promises = projects.map(async (project) => {
      const result = await launcher.build(project)
      return { project, result }
    })
    
    const results = await Promise.all(promises)
    
    results.forEach(({ project, result }) => {
      if (result.success) {
        console.log(`✅ ${project} 构建成功`)
      } else {
        console.error(`❌ ${project} 构建失败`)
      }
    })
  } finally {
    await launcher.destroy()
  }
}
```

## 错误处理高级技巧

### 重试机制

```typescript
async function retryOperation(operation: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error
      }
      console.log(`重试 ${i + 1}/${maxRetries}:`, error.message)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

// 使用重试机制
await retryOperation(async () => {
  return await launcher.build('./my-app')
})
```

### 错误分类处理

```typescript
async function handleOperation(operation: () => Promise<any>) {
  try {
    return await operation()
  } catch (error) {
    switch (error.code) {
      case 'PROJECT_EXISTS':
        console.log('项目已存在，尝试覆盖')
        return await operation()
        
      case 'BUILD_FAILED':
        console.log('构建失败，尝试清理后重试')
        // 清理构建缓存
        return await operation()
        
      case 'PORT_IN_USE':
        console.log('端口被占用，尝试其他端口')
        return await operation()
        
      default:
        throw error
    }
  }
}
```

## 监控和日志

### 性能监控

```typescript
async function monitorBuild(projectPath: string) {
  const startTime = Date.now()
  
  const result = await launcher.build(projectPath)
  
  const duration = Date.now() - startTime
  
  console.log(`构建耗时: ${duration}ms`)
  console.log(`构建大小: ${result.size} bytes`)
  console.log(`输出文件: ${result.outputFiles.length} 个`)
  
  return result
}
```

### 详细日志

```typescript
const launcher = new ViteLauncher({
  logLevel: 'info'
})

// 自定义日志处理
const originalLog = console.log
console.log = (...args) => {
  const timestamp = new Date().toISOString()
  originalLog(`[${timestamp}]`, ...args)
}
```

## 集成示例

### 与 CI/CD 集成

```typescript
async function ciBuild() {
  const launcher = new ViteLauncher({
    logLevel: 'info',
    mode: 'production'
  })
  
  try {
    // 设置环境变量
    process.env.NODE_ENV = 'production'
    
    // 构建项目
    const result = await launcher.build('./my-app', {
      outDir: 'dist',
      minify: true,
      sourcemap: false
    })
    
    if (result.success) {
      console.log('✅ CI 构建成功')
      process.exit(0)
    } else {
      console.error('❌ CI 构建失败')
      process.exit(1)
    }
  } finally {
    await launcher.destroy()
  }
}
```

### 与开发工具集成

```typescript
class DevelopmentTool {
  private launcher: ViteLauncher
  
  constructor() {
    this.launcher = new ViteLauncher()
  }
  
  async createProject(type: string, path: string) {
    return await this.launcher.create(path, type)
  }
  
  async startDev(path: string) {
    return await this.launcher.dev(path)
  }
  
  async buildProject(path: string) {
    return await this.launcher.build(path)
  }
  
  async destroy() {
    await this.launcher.destroy()
  }
}
```

## 最佳实践

### 1. 配置管理
- 使用环境变量控制配置
- 分离开发和生产配置
- 使用配置文件管理复杂配置

### 2. 性能优化
- 合理使用缓存
- 优化构建配置
- 监控构建性能

### 3. 错误处理
- 实现重试机制
- 分类处理错误
- 提供详细的错误信息

### 4. 资源管理
- 及时清理资源
- 避免内存泄漏
- 合理使用并行处理

## 下一步

- [配置选项](./configuration.md) - 了解详细的配置选项
- [项目类型](./project-types.md) - 了解支持的项目类型
- [API 参考](../api/vite-launcher.md) - 查看完整的 API 文档
