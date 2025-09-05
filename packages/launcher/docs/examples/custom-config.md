---
title: 自定义配置示例
description: 开发/生产环境差异配置、插件/环境变量与配置合并范例
---

# 自定义配置示例

## 基础配置

### 开发环境配置

```typescript
import { ViteLauncher } from '@ldesign/launcher'

async function developmentConfig() {
  const launcher = new ViteLauncher({
    logLevel: 'info',
    mode: 'development'
  })
  
  // 开发环境配置
  launcher.configure({
    server: {
      port: 3000,
      host: '127.0.0.1',
      open: true,
      cors: true
    },
    build: {
      sourcemap: true,
      minify: false
    }
  })
  
  try {
    await launcher.create('./my-app', 'vue3')
    const server = await launcher.dev('./my-app')
  } finally {
    await launcher.destroy()
  }
}
```

### 生产环境配置

```typescript
import { ViteLauncher } from '@ldesign/launcher'

async function productionConfig() {
  const launcher = new ViteLauncher({
    logLevel: 'silent',
    mode: 'production'
  })
  
  // 生产环境配置
  launcher.configure({
    build: {
      outDir: 'dist',
      minify: 'terser',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'react']
          }
        }
      }
    }
  })
  
  try {
    const result = await launcher.build('./my-app')
    if (result.success) {
      console.log('生产构建成功')
    }
  } finally {
    await launcher.destroy()
  }
}
```

## 高级配置

### 自定义插件配置

```typescript
import { ViteLauncher } from '@ldesign/launcher'

async function customPluginConfig() {
  const launcher = new ViteLauncher()
  
  // 自定义插件配置
  launcher.configure({
    plugins: [
      // 自定义插件
      {
        name: 'custom-plugin',
        config(config) {
          // 修改配置
          return config
        }
      }
    ]
  })
  
  try {
    await launcher.create('./my-app', 'vue3')
    const server = await launcher.dev('./my-app')
  } finally {
    await launcher.destroy()
  }
}
```

### 环境变量配置

```typescript
import { ViteLauncher } from '@ldesign/launcher'

async function envConfig() {
  const isProduction = process.env.NODE_ENV === 'production'
  
  const launcher = new ViteLauncher({
    mode: isProduction ? 'production' : 'development',
    logLevel: isProduction ? 'silent' : 'info'
  })
  
  // 根据环境变量配置
  if (isProduction) {
    launcher.configure({
      build: {
        minify: true,
        sourcemap: false
      }
    })
  } else {
    launcher.configure({
      server: {
        port: parseInt(process.env.PORT || '3000'),
        open: true
      }
    })
  }
  
  return launcher
}
```

## 配置管理

### 配置验证

```typescript
import { ViteLauncher } from '@ldesign/launcher'

async function validateConfig() {
  const launcher = new ViteLauncher()
  
  try {
    // 配置验证
    const config = {
      server: {
        port: 3000,
        host: '127.0.0.1'
      },
      build: {
        outDir: 'dist'
      }
    }
    
    // 应用配置
    launcher.configure(config)
    
    // 获取当前配置
    const currentConfig = launcher.getConfig()
    console.log('当前配置:', currentConfig)
    
  } finally {
    await launcher.destroy()
  }
}
```

### 配置合并

```typescript
import { ViteLauncher } from '@ldesign/launcher'

async function mergeConfig() {
  const launcher = new ViteLauncher()
  
  // 基础配置
  const baseConfig = {
    server: {
      port: 3000,
      host: '127.0.0.1'
    }
  }
  
  // 覆盖配置
  const overrideConfig = {
    server: {
      port: 3001,
      open: true
    }
  }
  
  // 合并配置
  launcher.configure(baseConfig)
  launcher.configure(overrideConfig)
  
  // 最终配置
  const finalConfig = launcher.getConfig()
  console.log('最终端口:', finalConfig.server?.port) // 3001
  console.log('自动打开:', finalConfig.server?.open) // true
  
  try {
    await launcher.create('./my-app', 'vue3')
  } finally {
    await launcher.destroy()
  }
}
```
