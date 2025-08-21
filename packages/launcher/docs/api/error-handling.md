# 错误处理

本章详细介绍 Vite Launcher 的错误处理机制和最佳实践。

## 错误类型

### LauncherError

Vite Launcher 使用统一的错误类型：

```typescript
interface LauncherError {
  code: string        // 错误代码
  message: string     // 错误消息
  details?: string    // 详细信息
  suggestion?: string // 建议解决方案
}
```

### 错误代码

| 代码 | 描述 | 解决方案 |
|------|------|----------|
| `PROJECT_EXISTS` | 项目目录已存在 | 使用 `force: true` 选项 |
| `INVALID_PROJECT_TYPE` | 无效的项目类型 | 检查支持的项目类型 |
| `BUILD_FAILED` | 构建失败 | 检查项目配置和依赖 |
| `DEV_SERVER_ERROR` | 开发服务器错误 | 检查端口和配置 |
| `INSTANCE_DESTROYED` | 实例已销毁 | 重新创建实例 |
| `PORT_IN_USE` | 端口被占用 | 使用其他端口 |
| `FILE_NOT_FOUND` | 文件不存在 | 检查文件路径 |
| `PERMISSION_DENIED` | 权限不足 | 检查文件权限 |

## 基本错误处理

### Try-Catch 模式

```typescript
import { ViteLauncher } from '@ldesign/launcher'

const launcher = new ViteLauncher()

try {
  await launcher.create('./my-app', 'vue3')
} catch (error) {
  console.error('创建项目失败:', error.message)
  
  if (error.code === 'PROJECT_EXISTS') {
    console.log('项目已存在，使用 force: true 选项覆盖')
    await launcher.create('./my-app', 'vue3', { force: true })
  }
}
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

## 高级错误处理

### 重试机制

```typescript
async function retryOperation(
  operation: () => Promise<any>, 
  maxRetries = 3,
  delay = 1000
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error
      }
      
      console.log(`重试 ${i + 1}/${maxRetries}:`, error.message)
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }
}

// 使用重试机制
await retryOperation(async () => {
  return await launcher.build('./my-app')
})
```

### 错误恢复

```typescript
async function resilientOperation(operation: () => Promise<any>) {
  try {
    return await operation()
  } catch (error) {
    // 尝试恢复
    if (error.code === 'INSTANCE_DESTROYED') {
      console.log('实例已销毁，重新创建')
      const newLauncher = new ViteLauncher()
      return await operation.call(newLauncher)
    }
    
    throw error
  }
}
```

## 错误处理工具

### 错误格式化

```typescript
function formatError(error: LauncherError): string {
  let message = `[${error.code}] ${error.message}`
  
  if (error.details) {
    message += `\n详细信息: ${error.details}`
  }
  
  if (error.suggestion) {
    message += `\n建议: ${error.suggestion}`
  }
  
  return message
}
```

### 错误日志

```typescript
function logError(error: LauncherError, context?: string) {
  const timestamp = new Date().toISOString()
  const contextInfo = context ? `[${context}]` : ''
  
  console.error(`${timestamp} ${contextInfo} ${formatError(error)}`)
}
```

## 特定场景错误处理

### 项目创建错误

```typescript
async function createProjectSafely(path: string, type: string) {
  try {
    await launcher.create(path, type)
  } catch (error) {
    if (error.code === 'PROJECT_EXISTS') {
      console.log('项目已存在，是否覆盖? (y/n)')
      // 等待用户确认
      const shouldOverwrite = await getUserConfirmation()
      
      if (shouldOverwrite) {
        await launcher.create(path, type, { force: true })
      }
    } else if (error.code === 'INVALID_PROJECT_TYPE') {
      console.log('支持的项目类型:', ['vue3', 'react', 'vanilla'])
      throw error
    } else {
      throw error
    }
  }
}
```

### 构建错误

```typescript
async function buildProjectSafely(path: string) {
  const result = await launcher.build(path)
  
  if (!result.success) {
    console.error('构建失败:')
    result.errors.forEach(error => {
      console.error(`- ${error}`)
    })
    
    // 尝试诊断问题
    await diagnoseBuildIssues(path, result.errors)
  }
  
  return result
}

async function diagnoseBuildIssues(path: string, errors: string[]) {
  // 检查常见问题
  const issues = []
  
  for (const error of errors) {
    if (error.includes('module not found')) {
      issues.push('依赖缺失，请运行 npm install')
    } else if (error.includes('syntax error')) {
      issues.push('语法错误，请检查代码')
    }
  }
  
  if (issues.length > 0) {
    console.log('可能的解决方案:')
    issues.forEach(issue => console.log(`- ${issue}`))
  }
}
```

### 开发服务器错误

```typescript
async function startDevServerSafely(path: string, port: number) {
  try {
    return await launcher.dev(path, { port })
  } catch (error) {
    if (error.code === 'PORT_IN_USE') {
      console.log(`端口 ${port} 被占用，尝试其他端口`)
      
      // 尝试其他端口
      for (let newPort = port + 1; newPort < port + 10; newPort++) {
        try {
          return await launcher.dev(path, { port: newPort })
        } catch (e) {
          if (e.code !== 'PORT_IN_USE') {
            throw e
          }
        }
      }
      
      throw new Error('无法找到可用端口')
    }
    
    throw error
  }
}
```

## 错误处理最佳实践

### 1. 统一错误处理

```typescript
class LauncherErrorHandler {
  static handle(error: LauncherError, context?: string) {
    logError(error, context)
    
    switch (error.code) {
      case 'PROJECT_EXISTS':
        return this.handleProjectExists(error)
      case 'BUILD_FAILED':
        return this.handleBuildFailed(error)
      default:
        return this.handleGenericError(error)
    }
  }
  
  private static handleProjectExists(error: LauncherError) {
    // 处理项目已存在的情况
  }
  
  private static handleBuildFailed(error: LauncherError) {
    // 处理构建失败的情况
  }
  
  private static handleGenericError(error: LauncherError) {
    // 处理通用错误
  }
}
```

### 2. 错误边界

```typescript
function withErrorBoundary<T>(
  operation: () => Promise<T>,
  fallback?: () => T
): Promise<T> {
  return operation().catch(error => {
    console.error('操作失败:', error.message)
    
    if (fallback) {
      return fallback()
    }
    
    throw error
  })
}
```

### 3. 错误监控

```typescript
class ErrorMonitor {
  private errors: LauncherError[] = []
  
  recordError(error: LauncherError) {
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
```

## 调试技巧

### 1. 启用详细日志

```typescript
const launcher = new ViteLauncher({
  logLevel: 'info' // 或 'debug'
})
```

### 2. 错误堆栈跟踪

```typescript
try {
  await launcher.create('./my-app', 'vue3')
} catch (error) {
  console.error('错误堆栈:', error.stack)
  console.error('错误详情:', error)
}
```

### 3. 环境检查

```typescript
async function checkEnvironment() {
  const checks = [
    checkNodeVersion(),
    checkDependencies(),
    checkPermissions(),
    checkDiskSpace()
  ]
  
  const results = await Promise.all(checks)
  const failures = results.filter(result => !result.success)
  
  if (failures.length > 0) {
    console.error('环境检查失败:')
    failures.forEach(failure => {
      console.error(`- ${failure.message}`)
    })
  }
}
```

## 总结

良好的错误处理是构建可靠应用程序的关键。Vite Launcher 提供了统一的错误处理机制，通过合理的错误分类、重试机制和用户友好的错误信息，可以帮助开发者快速定位和解决问题。
