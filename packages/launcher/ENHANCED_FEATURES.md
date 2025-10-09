# 🚀 增强功能使用指南

## 📦 新增功能模块

本次优化新增了两个强大的增强模块：

1. **PerformanceMonitorEnhanced** - 增强版性能监控器
2. **SmartCacheManager** - 智能缓存管理器

这些模块在现有代码基础上扩展，无需修改原有代码即可使用！

---

## 📊 增强版性能监控器

### 功能特性

✅ **内存压力感知** - 自动监控并警告内存使用情况  
✅ **实时性能指标** - 追踪 CPU、内存、请求等实时数据  
✅ **历史数据追踪** - 记录最近 100 次构建/启动的性能数据  
✅ **性能仪表板** - 生成美观的性能报告  
✅ **自动清理** - 达到阈值时自动触发优化建议  

### 基础使用

```typescript
import { createEnhancedMonitor } from './src/core/PerformanceMonitorEnhanced'

// 创建监控器实例
const monitor = createEnhancedMonitor({
  enableMemoryPressureMonitoring: true,  // 启用内存压力监控
  memoryPressureCheckInterval: 5000,     // 每 5 秒检查一次
  historyLimit: 100,                     // 保留最近 100 条记录
  enableRealtimeMetrics: true            // 启用实时指标
})

// 记录构建时间
monitor.recordBuildTime(1250)  // 1.25 秒

// 记录启动时间
monitor.recordStartupTime(3000)  // 3 秒

// 更新实时指标
monitor.updateRealtimeMetrics({
  requestsPerSecond: 120,
  activeConnections: 45,
  cpuUsage: 35.5
})

// 获取当前内存压力
const pressure = monitor.getMemoryPressure()
console.log(`内存压力: ${pressure.pressure} (${pressure.pressurePercent}%)`)

// 获取性能报告
console.log(monitor.getPerformanceReport())

// 导出 JSON 数据
const jsonData = monitor.exportMetrics()
```

### 性能报告示例

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📊 性能监控报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【实时指标】
  💾 内存使用: 125MB / 256MB (49%)
  🎯 压力级别: ✅ LOW
  📈 CPU 使用: 35.5%
  🔌 活跃连接: 45
  ⚡ 每秒请求: 120

【统计信息】
  🏗️  总构建次数: 15
  ⏱️  平均构建时间: 1180ms
  🚀 总启动次数: 3
  ⏱️  平均启动时间: 2950ms
  💾 平均内存: 118MB
  📊 峰值内存: 142MB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 在 ViteLauncher 中集成

```typescript
import { ViteLauncher } from './src/core/ViteLauncher'
import { createEnhancedMonitor } from './src/core/PerformanceMonitorEnhanced'

class EnhancedViteLauncher extends ViteLauncher {
  private performanceMonitor = createEnhancedMonitor()

  async startDev(options?: any) {
    const startTime = Date.now()
    
    try {
      const result = await super.startDev(options)
      
      // 记录启动时间
      const duration = Date.now() - startTime
      this.performanceMonitor.recordStartupTime(duration)
      
      // 显示性能报告
      console.log(this.performanceMonitor.getPerformanceReport())
      
      return result
    } catch (error) {
      throw error
    }
  }

  async build(options?: any) {
    const startTime = Date.now()
    
    try {
      const result = await super.build(options)
      
      // 记录构建时间
      const duration = Date.now() - startTime
      this.performanceMonitor.recordBuildTime(duration)
      
      return result
    } catch (error) {
      throw error
    }
  }
}
```

---

## 💾 智能缓存管理器

### 功能特性

✅ **内存压力感知清理** - 根据内存使用自动清理缓存  
✅ **改进的 LRU 算法** - 综合考虑访问频率和新鲜度  
✅ **缓存统计追踪** - 详细的命中率和使用情况统计  
✅ **缓存预热** - 支持启动时预加载常用数据  
✅ **渐进式清理** - 定期自动清理过期缓存  
✅ **健康度评估** - 自动评估缓存运行状态  

### 基础使用

```typescript
import { createSmartCache } from './src/core/SmartCacheManager'

// 创建智能缓存实例
const cache = createSmartCache({
  maxSize: 100,                          // 最大 100MB
  enableMemoryPressureCleanup: true,     // 启用内存压力清理
  memoryPressureThreshold: 70,           // 70% 阈值
  maxAge: 3600000,                       // 1 小时过期
  enableStatistics: true,                // 启用统计
  progressiveCleanupInterval: 60000,     // 每分钟清理一次
  cleanupBatchSize: 10                   // 每次清理 10 项
})

// 设置缓存
cache.set('config:app', { port: 3000, host: 'localhost' }, 'config')
cache.set('module:app', moduleData, 'module')

// 获取缓存
const config = cache.get('config:app')

// 获取统计信息
const stats = cache.getStatistics()
console.log(`命中率: ${stats.hitRate}%`)
console.log(`缓存项: ${stats.totalItems}`)

// 查看缓存报告
console.log(cache.getReport())

// 手动清理 20% 的缓存
cache.cleanup(0.2)

// 缓存预热
await cache.warmup(async () => {
  return {
    'config:default': await loadDefaultConfig(),
    'plugin:list': await loadPluginList(),
    // ... 更多预加载数据
  }
})
```

### 缓存报告示例

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  💾 智能缓存报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【统计信息】
  📊 缓存项总数: 156
  💾 内存占用: 42.50MB / 100MB
  🎯 命中率: 87%
  ✅ 命中次数: 1234
  ❌ 未命中次数: 189

【按类型统计】
  ⚙️  配置缓存: 12
  📦 模块缓存: 89
  🔄 转换缓存: 34
  🔗 依赖缓存: 15
  📄 其他缓存: 6

【缓存健康度】
  ✅ 健康 - 缓存运行良好

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 自动清理策略

智能缓存管理器使用改进的 LRU 算法，综合考虑：

1. **访问频率** (60%) - 访问次数越多，优先级越高
2. **新鲜度** (40%) - 最近访问的数据优先级更高

当内存压力或缓存大小达到阈值时，自动清理低优先级项。

---

## 🎯 使用场景

### 场景 1：开发环境性能监控

```typescript
import { createEnhancedMonitor } from './src/core/PerformanceMonitorEnhanced'
import { createSmartCache } from './src/core/SmartCacheManager'

// 初始化
const monitor = createEnhancedMonitor()
const cache = createSmartCache()

// 定期输出性能报告
setInterval(() => {
  console.clear()
  console.log(monitor.getPerformanceReport())
  console.log('\n')
  console.log(cache.getReport())
}, 10000) // 每 10 秒

```

### 场景 2：生产环境优化

```typescript
// 生产环境配置
const cache = createSmartCache({
  maxSize: 200,                     // 更大的缓存
  memoryPressureThreshold: 80,      // 更高的阈值
  maxAge: 7200000,                  // 2 小时过期
  cleanupBatchSize: 20              // 更大的清理批次
})

// 启动时预热常用缓存
await cache.warmup(async () => ({
  'config:routes': await loadRoutes(),
  'config:plugins': await loadPlugins(),
  'assets:manifest': await loadManifest()
}))
```

### 场景 3：CI/CD 性能分析

```typescript
const monitor = createEnhancedMonitor({
  enableMemoryPressureMonitoring: true,
  historyLimit: 1000  // 记录更多历史数据
})

// 构建完成后导出数据
afterBuild(() => {
  const metrics = monitor.exportMetrics()
  fs.writeFileSync('performance-report.json', metrics)
})
```

---

## 📈 性能对比

使用增强功能前后的对比（预估）：

| 指标 | 使用前 | 使用后 | 提升 |
|------|--------|--------|------|
| 缓存命中率 | 65% | 90%+ | +38% |
| 内存使用 | 180MB | 120MB | -33% |
| 构建速度 | 3.2s | 2.4s | +25% |
| 启动速度 | 2.8s | 2.1s | +25% |

---

## 🔧 配置建议

### 开发环境

```typescript
{
  // 性能监控
  enableMemoryPressureMonitoring: true,
  memoryPressureCheckInterval: 5000,
  
  // 缓存管理
  maxSize: 100,
  memoryPressureThreshold: 70,
  progressiveCleanupInterval: 60000
}
```

### 生产环境

```typescript
{
  // 性能监控
  enableMemoryPressureMonitoring: true,
  memoryPressureCheckInterval: 10000,
  
  // 缓存管理
  maxSize: 200,
  memoryPressureThreshold: 85,
  progressiveCleanupInterval: 300000  // 5 分钟
}
```

---

## 🐛 故障排查

### 问题：内存占用仍然很高

**解决方案：**
1. 降低 `maxSize` 配置
2. 降低 `memoryPressureThreshold`
3. 减小 `maxAge`（更快过期）
4. 手动调用 `cache.cleanup(0.5)` 清理 50% 缓存

### 问题：缓存命中率低

**解决方案：**
1. 使用 `cache.warmup()` 预热常用数据
2. 增加 `maxSize` 避免过早清理
3. 增加 `maxAge` 延长缓存有效期
4. 检查缓存键是否正确

### 问题：性能报告不准确

**解决方案：**
1. 确保 `enableRealtimeMetrics: true`
2. 使用 `monitor.updateRealtimeMetrics()` 更新数据
3. 检查是否正确调用 `recordBuildTime()` 和 `recordStartupTime()`

---

## 📚 API 参考

完整的 API 文档请参考：
- `PerformanceMonitorEnhanced.ts` 源代码注释
- `SmartCacheManager.ts` 源代码注释

---

**创建时间**: 2025-10-06  
**版本**: 1.0.0  
**状态**: ✅ 可用（已测试）
