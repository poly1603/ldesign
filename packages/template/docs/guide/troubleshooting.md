# 故障排除

本文档帮助你诊断和解决使用 `@ldesign/template` 时遇到的常见问题。

## 🚨 常见错误

### 模板加载失败

#### 错误信息
```
TemplateLoadError: Failed to load template 'login' for device 'desktop'
```

#### 可能原因
1. 模板文件不存在
2. 文件路径配置错误
3. 模板文件语法错误
4. 权限问题

#### 解决方案

**1. 检查文件是否存在**
```bash
# 确认模板文件存在
ls src/templates/login/desktop/LoginForm.vue
```

**2. 验证扫描配置**
```typescript
const manager = new TemplateManager({
  scanner: {
    scanPaths: [
      'src/templates/**/*.vue', // 确保路径正确
    ],
    debug: true // 启用调试日志
  }
})
```

**3. 检查模板语法**
```bash
# 使用 Vue CLI 检查语法
vue-cli-service lint src/templates/
```

### 设备检测不准确

#### 错误现象
- 移动设备显示桌面版模板
- 设备切换不生效
- 检测结果与预期不符

#### 解决方案

**1. 自定义设备检测器**
```typescript
function customDetector() {
  const width = window.innerWidth
  const userAgent = navigator.userAgent

  // 详细的检测逻辑
  if (/iPhone|Android/.test(userAgent) && width <= 480) {
    return 'mobile'
  }

  if (/iPad|Tablet/.test(userAgent) || (width <= 1024 && width > 768)) {
    return 'tablet'
  }

  return 'desktop'
}

const manager = new TemplateManager({
  deviceAdapter: {
    customDetector,
    watchDeviceChange: true
  }
})
```

**2. 调试设备检测**
```typescript
manager.on('device:changed', (oldDevice, newDevice) => {
  console.log('设备变化:', { oldDevice, newDevice })
  console.log('当前窗口尺寸:', window.innerWidth, 'x', window.innerHeight)
  console.log('User Agent:', navigator.userAgent)
})
```

### 缓存问题

#### 错误现象
- 模板更新后仍显示旧版本
- 缓存命中率过低
- 内存使用过高

#### 解决方案

**1. 清空缓存**
```typescript
// 清空所有缓存
manager.clearCache()

// 清空特定模板缓存
manager.clearCache('login', 'desktop')

// 清空过期缓存
manager.clearExpiredCache()
```

**2. 调整缓存配置**
```typescript
const config = {
  cache: {
    enabled: true,
    strategy: 'lru',
    maxSize: 30, // 减少缓存大小
    ttl: 10 * 60 * 1000, // 缩短过期时间
    debug: true // 启用缓存调试
  }
}
```

**3. 监控缓存状态**
```typescript
const stats = manager.getCacheStats()
console.log('缓存统计:', {
  hitRate: stats.hitRate,
  memoryUsage: stats.memoryUsage,
  itemCount: stats.itemCount
})
```

## 🔧 调试技巧

### 启用调试模式

```typescript
const manager = new TemplateManager({
  debug: true, // 启用全局调试
  verbose: true, // 启用详细日志

  scanner: {
    debug: true // 启用扫描器调试
  },

  loader: {
    debug: true // 启用加载器调试
  },

  cache: {
    debug: true // 启用缓存调试
  }
})
```

### 事件监听调试

```typescript
// 监听所有事件
manager.on('*', (eventName, ...args) => {
  console.log(`事件: ${eventName}`, args)
})

// 监听特定事件
manager.on('template:loaded', (data) => {
  console.log('模板加载成功:', data)
})

manager.on('template:error', (error) => {
  console.error('模板加载失败:', error)
})

manager.on('performance:warning', (warning) => {
  console.warn('性能警告:', warning)
})
```

### 性能分析

```typescript
// 启用性能监控
const manager = new TemplateManager({
  performance: {
    enabled: true,
    sampleRate: 1.0, // 100% 采样用于调试
    reportInterval: 10000 // 10秒报告一次
  }
})

// 获取性能报告
const report = manager.getPerformanceReport()
console.log('性能报告:', report)
```

## 🐛 错误诊断

### 错误分类

#### 1. 配置错误
```typescript
// 检查配置有效性
function validateConfig(config: any) {
  const errors = []

  if (!config.scanner?.scanPaths?.length) {
    errors.push('缺少扫描路径配置')
  }

  if (config.cache?.maxSize <= 0) {
    errors.push('缓存大小配置无效')
  }

  return errors
}
```

#### 2. 运行时错误
```typescript
// 全局错误处理
window.addEventListener('error', (event) => {
  if (event.error?.name?.includes('Template')) {
    console.error('模板系统错误:', event.error)
    // 发送错误报告
  }
})

// Promise 错误处理
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('template')) {
    console.error('模板异步错误:', event.reason)
  }
})
```

#### 3. 性能问题
```typescript
// 性能问题检测
function detectPerformanceIssues() {
  const stats = manager.getCacheStats()
  const issues = []

  if (stats.hitRate < 0.5) {
    issues.push('缓存命中率过低')
  }

  if (stats.memoryUsage > 100 * 1024 * 1024) {
    issues.push('内存使用过高')
  }

  const avgLoadTime = manager.getAverageLoadTime()
  if (avgLoadTime > 500) {
    issues.push('平均加载时间过长')
  }

  return issues
}
```

## 🔍 诊断工具

### 健康检查

```typescript
class TemplateHealthChecker {
  async checkHealth() {
    const results = {
      scanner: await this.checkScanner(),
      loader: await this.checkLoader(),
      cache: await this.checkCache(),
      device: await this.checkDeviceAdapter()
    }

    return results
  }

  async checkScanner() {
    try {
      const templates = await manager.scanTemplates()
      return {
        status: 'ok',
        templateCount: templates.length,
        categories: [...new Set(templates.map(t => t.category))]
      }
    }
    catch (error) {
      return {
        status: 'error',
        error: error.message
      }
    }
  }

  async checkLoader() {
    try {
      // 尝试加载一个测试模板
      await manager.loadTemplate('test', 'desktop')
      return { status: 'ok' }
    }
    catch (error) {
      return {
        status: 'error',
        error: error.message
      }
    }
  }

  checkCache() {
    const stats = manager.getCacheStats()
    return {
      status: stats.hitRate > 0.3 ? 'ok' : 'warning',
      hitRate: stats.hitRate,
      memoryUsage: stats.memoryUsage,
      itemCount: stats.itemCount
    }
  }

  checkDeviceAdapter() {
    try {
      const deviceType = manager.getCurrentDevice()
      return {
        status: 'ok',
        currentDevice: deviceType,
        supportedDevices: ['desktop', 'tablet', 'mobile']
      }
    }
    catch (error) {
      return {
        status: 'error',
        error: error.message
      }
    }
  }
}
```

### 自动修复

```typescript
class AutoFixer {
  async fixCommonIssues() {
    const issues = await this.detectIssues()

    for (const issue of issues) {
      switch (issue.type) {
        case 'cache_full':
          manager.clearCache()
          console.log('已清空缓存')
          break

        case 'memory_high':
          manager.clearExpiredCache()
          console.log('已清理过期缓存')
          break

        case 'load_slow':
          await this.optimizePreloading()
          console.log('已优化预加载策略')
          break
      }
    }
  }

  async optimizePreloading() {
    // 分析使用模式，优化预加载
    const usage = manager.getUsageStats()
    const topTemplates = usage
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5)

    await manager.preloadTemplates(topTemplates)
  }
}
```

## 📞 获取支持

### 收集诊断信息

```typescript
function collectDiagnosticInfo() {
  return {
    // 环境信息
    environment: {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      memory: performance.memory
        ? {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
          }
        : null
    },

    // 模板系统状态
    templateSystem: {
      version: manager.getVersion(),
      config: manager.getConfig(),
      stats: manager.getCacheStats(),
      performance: manager.getPerformanceReport()
    },

    // 错误日志
    errors: manager.getErrorLog(),

    // 最近的活动
    recentActivity: manager.getActivityLog()
  }
}
```

### 提交问题报告

当需要提交问题报告时，请包含：

1. **问题描述**：详细描述遇到的问题
2. **复现步骤**：提供完整的复现步骤
3. **预期行为**：说明期望的正确行为
4. **实际行为**：描述实际发生的情况
5. **环境信息**：使用 `collectDiagnosticInfo()` 收集的信息
6. **代码示例**：提供最小化的复现代码

### 社区支持

- **GitHub Issues**: 报告 bug 和功能请求
- **讨论区**: 技术讨论和经验分享
- **文档**: 查看最新的文档和示例
- **FAQ**: 查看常见问题解答
