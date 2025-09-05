---
title: 错误处理示例
description: 常见错误处理、重试机制、分类处理与监控
---

# 错误处理示例

## 基本错误处理

### 项目创建错误

```typescript
import { createProject } from '@ldesign/launcher'

async function createProjectWithErrorHandling() {
  try {
    await createProject('./my-app', 'vue3')
  } catch (error) {
    if (error.code === 'PROJECT_EXISTS') {
      console.log('项目已存在，使用 force: true 选项覆盖')
      await createProject('./my-app', 'vue3', { force: true })
    } else if (error.code === 'INVALID_PROJECT_TYPE') {
      console.log('无效的项目类型，支持的类型: vue3, react, vanilla')
    } else {
      console.error('创建项目失败:', error.message)
    }
  }
}
```

### 构建错误

```typescript
import { buildProject } from '@ldesign/launcher'

async function buildWithErrorHandling() {
  const result = await buildProject('./my-app')
  
  if (result.success) {
    console.log('✅ 构建成功!')
    console.log(`📦 输出文件: ${result.outputFiles.length} 个`)
    console.log(`⏱️  构建时间: ${result.duration}ms`)
  } else {
    console.error('❌ 构建失败:')
    result.errors.forEach(error => {
      console.error(`- ${error}`)
    })
  }
}
```

## 高级错误处理

### 重试机制

```typescript
import { ViteLauncher } from '@ldesign/launcher'

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
const launcher = new ViteLauncher()

try {
  await retryOperation(async () => {
    return await launcher.build('./my-app')
  })
} finally {
  await launcher.destroy()
}
```

### 错误分类处理

```typescript
import { ViteLauncher } from '@ldesign/launcher'

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

const launcher = new ViteLauncher()

try {
  await handleOperation(async () => {
    return await launcher.create('./my-app', 'vue3')
  })
} finally {
  await launcher.destroy()
}
```

## 错误监控

### 错误记录

```typescript
class ErrorMonitor {
  private errors: any[] = []
  
  recordError(error: any) {
    this.errors.push({
      ...error,
      timestamp: new Date().toISOString()
    })
  }
  
  getErrorReport() {
    return {
      total: this.errors.length,
      byCode: this.errors.reduce((acc, error) => {
        acc[error.code] = (acc[error.code] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      recent: this.errors.slice(-10)
    }
  }
}

const monitor = new ErrorMonitor()

try {
  await createProject('./my-app', 'vue3')
} catch (error) {
  monitor.recordError(error)
  console.error('操作失败:', error.message)
}

// 获取错误报告
const report = monitor.getErrorReport()
console.log('错误报告:', report)
```

### 错误格式化

```typescript
function formatError(error: any): string {
  let message = `[${error.code}] ${error.message}`
  
  if (error.details) {
    message += `\n详细信息: ${error.details}`
  }
  
  if (error.suggestion) {
    message += `\n建议: ${error.suggestion}`
  }
  
  return message
}

try {
  await createProject('./my-app', 'vue3')
} catch (error) {
  console.error(formatError(error))
}
```
