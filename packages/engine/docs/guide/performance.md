# 性能管理

Vue3 Engine 提供了全面的性能监控和优化功能，帮助开发者识别性能瓶颈，优化应用性能。

## 基础用法

### 性能监控

```typescript
// 开始性能监控
engine.performance.startMonitoring()

// 停止性能监控
engine.performance.stopMonitoring()

// 获取性能报告
const report = engine.performance.getReport()
console.log('总事件数:', report.summary.totalEvents)
console.log('平均响应时间:', report.summary.averageResponseTime)
console.log('平均FPS:', report.summary.averageFPS)
console.log('内存使用:', report.summary.memoryUsage)
```

### 性能标记

```typescript
// 开始性能事件记录
const eventId = engine.performance.startEvent('api-call', 'fetchUserData')

// 执行一些操作
await someAsyncOperation()

// 结束性能事件记录
engine.performance.endEvent(eventId, {
  userId: 123,
  dataSize: 1024
})

// 或者使用便捷方法记录完整事件
await engine.performance.recordEvent('database-query', async () => {
  return await database.query('SELECT * FROM users')
})
```

### 内存监控

```typescript
// 获取内存使用情况
const memoryInfo = engine.performance.getMemoryInfo()
console.log('已使用内存:', memoryInfo.used)
console.log('总内存:', memoryInfo.total)
console.log('内存限制:', memoryInfo.limit)

// 获取当前性能指标
const metrics = engine.performance.getCurrentMetrics()
console.log('FPS:', metrics.rendering?.fps)
console.log('帧时间:', metrics.rendering?.frameTime)
console.log('网络请求数:', metrics.network?.requests)
```

## 高级功能

### 自动性能分析

```typescript
// 设置性能阈值
engine.performance.setThresholds({
  responseTime: {
    good: 100,
    poor: 1000
  },
  fps: {
    good: 60,
    poor: 30
  },
  memory: {
    warning: 50, // MB
    critical: 100 // MB
  },
  bundleSize: {
    warning: 500, // KB
    critical: 1000 // KB
  }
})
```

### 性能预算

```typescript
// 监听性能违规事件
engine.events.on('performance:violation', (violation) => {
  console.warn('性能违规:', violation.type, violation.message)

  // 根据违规类型采取不同措施
  switch (violation.severity) {
    case 'warning':
      engine.logger.warn('性能警告:', violation.message)
      break
    case 'critical':
      engine.logger.error('严重性能问题:', violation.message)
      // 可能需要降级处理或通知用户
      break
  }
})
```

### 性能警报

```typescript
// 监听性能警报
engine.events.on('performance:budget-exceeded', (metric) => {
  console.warn(`性能预算超标: ${metric.name} = ${metric.value}`)

  // 发送警报通知
  engine.notifications.show({
    type: 'warning',
    title: '性能警告',
    message: `${metric.name} 超出预算 ${metric.budget}`,
    duration: 5000,
  })
})
```

## 性能指标

### 核心 Web 指标

```typescript
// 获取核心 Web 指标
const coreMetrics = engine.performance.getCoreWebVitals()

console.log('首次内容绘制:', coreMetrics.fcp)
console.log('最大内容绘制:', coreMetrics.lcp)
console.log('首次输入延迟:', coreMetrics.fid)
console.log('累积布局偏移:', coreMetrics.cls)
```

### 自定义指标

```typescript
// 定义自定义指标
engine.performance.defineMetric('api-response-time', {
  name: 'API响应时间',
  unit: 'ms',
  target: 500,
  collector: () => {
    // 自定义指标收集逻辑
    return measureApiResponseTime()
  },
})

// 收集自定义指标
const apiMetric = engine.performance.collectMetric('api-response-time')
```

### 资源性能

```typescript
// 监控资源加载性能
engine.performance.monitorResources({
  // 监控的资源类型
  types: ['script', 'stylesheet', 'image', 'fetch'],

  // 性能阈值
  thresholds: {
    script: 1000,
    stylesheet: 500,
    image: 2000,
    fetch: 1000,
  },
})

// 获取资源性能数据
const resourceMetrics = engine.performance.getResourceMetrics()
```

## 性能优化

### 自动优化

```typescript
// 启用自动优化
engine.performance.enableAutoOptimization({
  // 图片懒加载
  lazyImages: true,

  // 代码分割
  codeSplitting: true,

  // 资源预加载
  preloading: true,

  // 缓存优化
  caching: true,

  // 内存清理
  memoryCleanup: true,
})
```

### 手动优化建议

```typescript
// 获取优化建议
const suggestions = engine.performance.getOptimizationSuggestions()

suggestions.forEach((suggestion) => {
  console.log(`建议: ${suggestion.title}`)
  console.log(`描述: ${suggestion.description}`)
  console.log(`影响: ${suggestion.impact}`)
  console.log(`实施难度: ${suggestion.difficulty}`)
})
```

### 性能分析报告

```typescript
// 生成性能分析报告
const report = engine.performance.generateReport({
  // 报告时间范围
  timeRange: {
    start: Date.now() - 3600000, // 1小时前
    end: Date.now(),
  },

  // 包含的指标
  metrics: ['all'],

  // 报告格式
  format: 'detailed',
})

// 导出报告
engine.performance.exportReport(report, 'performance-report.json')
```

## 配置选项

### 性能配置

```typescript
const engine = createEngine({
  performance: {
    // 启用性能监控
    enabled: true,

    // 监控配置
    monitoring: {
      // 自动启动监控
      autoStart: true,

      // 监控间隔
      interval: 1000,

      // 数据保留时间（毫秒）
      retention: 3600000,
    },

    // 性能预算
    budget: {
      fcp: 1500,
      lcp: 2500,
      fid: 100,
      cls: 0.1,
    },

    // 优化配置
    optimization: {
      // 自动优化
      auto: true,

      // 优化策略
      strategies: ['lazy-loading', 'code-splitting', 'caching'],
    },
  },
})
```

## 最佳实践

### 1. 性能监控策略

```typescript
// 分阶段监控
class PerformanceMonitor {
  constructor(private engine: Engine) {
    this.setupMonitoring()
  }

  private setupMonitoring() {
    // 页面加载性能
    this.monitorPageLoad()

    // 用户交互性能
    this.monitorUserInteractions()

    // 资源加载性能
    this.monitorResourceLoading()

    // 内存使用监控
    this.monitorMemoryUsage()
  }

  private monitorPageLoad() {
    window.addEventListener('load', () => {
      const metrics = this.engine.performance.getNavigationMetrics()
      this.engine.logger.info('页面加载完成', metrics)
    })
  }

  private monitorUserInteractions() {
    ;['click', 'scroll', 'input'].forEach((event) => {
      document.addEventListener(event, () => {
        this.engine.performance.mark(`${event}-start`)

        requestIdleCallback(() => {
          this.engine.performance.mark(`${event}-end`)
          this.engine.performance.measure(`${event}-duration`, `${event}-start`, `${event}-end`)
        })
      })
    })
  }
}
```

### 2. 性能优化实施

```typescript
// 渐进式优化
class PerformanceOptimizer {
  constructor(private engine: Engine) {}

  async optimize() {
    // 1. 分析当前性能
    const baseline = await this.analyzePerformance()

    // 2. 实施优化策略
    await this.implementOptimizations(baseline)

    // 3. 验证优化效果
    const optimized = await this.analyzePerformance()

    // 4. 生成优化报告
    this.generateOptimizationReport(baseline, optimized)
  }

  private async implementOptimizations(baseline: any) {
    // 图片优化
    if (baseline.images.loadTime > 2000) {
      await this.optimizeImages()
    }

    // 代码分割
    if (baseline.bundle.size > 1024 * 1024) {
      await this.implementCodeSplitting()
    }

    // 缓存优化
    if (baseline.cache.hitRate < 0.8) {
      await this.optimizeCaching()
    }
  }
}
```

### 3. 性能预算管理

```typescript
// 性能预算监控
class PerformanceBudgetManager {
  constructor(private engine: Engine) {
    this.setupBudgetMonitoring()
  }

  private setupBudgetMonitoring() {
    // 定期检查预算
    setInterval(() => {
      this.checkBudget()
    }, 5000)
  }

  private checkBudget() {
    const metrics = this.engine.performance.getMetrics()
    const budget = this.engine.performance.getBudget()

    Object.keys(budget).forEach((metric) => {
      if (metrics[metric] > budget[metric]) {
        this.handleBudgetExceeded(metric, metrics[metric], budget[metric])
      }
    })
  }

  private handleBudgetExceeded(metric: string, actual: number, budget: number) {
    this.engine.events.emit('performance:budget-exceeded', {
      metric,
      actual,
      budget,
      excess: actual - budget,
    })
  }
}
```

## 性能调试

### 性能分析工具

```typescript
// 性能分析器
class PerformanceProfiler {
  private profiles: Map<string, any> = new Map()

  startProfile(name: string) {
    this.profiles.set(name, {
      startTime: performance.now(),
      startMemory: this.getMemoryUsage(),
    })
  }

  endProfile(name: string) {
    const profile = this.profiles.get(name)
    if (!profile)
      return

    const endTime = performance.now()
    const endMemory = this.getMemoryUsage()

    const result = {
      duration: endTime - profile.startTime,
      memoryDelta: endMemory - profile.startMemory,
      timestamp: new Date().toISOString(),
    }

    this.engine.logger.info(`性能分析 [${name}]:`, result)
    return result
  }

  private getMemoryUsage() {
    return (performance as any).memory?.usedJSHeapSize || 0
  }
}
```

### 性能热点识别

```typescript
// 热点分析
function identifyPerformanceHotspots() {
  const hotspots = engine.performance.getHotspots({
    // 最小执行时间阈值
    minDuration: 10,

    // 最小调用次数阈值
    minCalls: 5,

    // 分析时间窗口
    timeWindow: 60000,
  })

  hotspots.forEach((hotspot) => {
    console.log(`热点: ${hotspot.name}`)
    console.log(`平均耗时: ${hotspot.avgDuration}ms`)
    console.log(`调用次数: ${hotspot.callCount}`)
    console.log(`总耗时: ${hotspot.totalDuration}ms`)
  })
}
```

## 错误处理

```typescript
try {
  engine.performance.startMonitoring()
}
catch (error) {
  engine.logger.error('性能监控启动失败:', error)

  // 降级处理
  engine.performance.enableBasicMonitoring()
}
```

## 与其他系统集成

### 与日志系统集成

```typescript
// 性能日志记录
engine.events.on('performance:metric-collected', (metric) => {
  engine.logger.info('性能指标:', metric)
})
```

### 与通知系统集成

```typescript
// 性能警报通知
engine.events.on('performance:threshold-exceeded', (alert) => {
  engine.notifications.show({
    type: 'warning',
    title: '性能警告',
    message: alert.message,
    duration: 5000,
  })
})
```
