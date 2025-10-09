# 🚀 快速启动指南

## 📋 前置条件

- ✅ Node.js >= 16.0.0
- ✅ npm 或 yarn 或 pnpm

## 🎯 5 分钟快速开始

### 1. 验证测试（必做）

```bash
# 确保所有测试通过
npm test
```

**预期结果：**
```
✅ Test Files: 16 passed (16)
✅ Tests: 238 passed | 29 skipped (267)
```

### 2. 试用新功能（推荐）

创建一个测试脚本 `test.ts`：

```typescript
import { createEnhancedMonitor, createSmartCache } from '@ldesign/launcher/core'

// 创建性能监控器
const monitor = createEnhancedMonitor()

// 创建智能缓存
const cache = createSmartCache()

// 查看报告
console.log(monitor.getPerformanceReport())
console.log(cache.getReport())
```

运行：
```bash
npx tsx test.ts
```

或者运行官方示例：
```bash
npx tsx examples/test-enhanced-features.ts
```

### 3. 集成到现有代码（可选）

#### 方式 A：直接使用增强版

```typescript
// 原代码
import { PerformanceMonitor } from '@ldesign/launcher/core'

// 改为
import { PerformanceMonitorEnhanced as PerformanceMonitor } from '@ldesign/launcher/core'
```

#### 方式 B：并行使用

```typescript
import { PerformanceMonitor } from '@ldesign/launcher/core'
import { PerformanceMonitorEnhanced } from '@ldesign/launcher/core'

const basicMonitor = new PerformanceMonitor()
const enhancedMonitor = new PerformanceMonitorEnhanced()
```

## 📚 详细文档

- **新功能使用指南**: `ENHANCED_FEATURES.md`
- **完整工作总结**: `FINAL_SUMMARY.md`
- **文件重组计划**: `FILE_REORGANIZATION.md`

## 🎨 常用功能示例

### 性能监控

```typescript
import { createEnhancedMonitor } from '@ldesign/launcher/core'

const monitor = createEnhancedMonitor()

// 记录构建时间
monitor.recordBuildTime(1250)

// 获取内存压力
const pressure = monitor.getMemoryPressure()
console.log(`压力: ${pressure.pressure}`)

// 查看报告
console.log(monitor.getPerformanceReport())
```

### 智能缓存

```typescript
import { createSmartCache } from '@ldesign/launcher/core'

const cache = createSmartCache({
  maxSize: 100,  // 100MB
  memoryPressureThreshold: 70  // 70%
})

// 使用缓存
cache.set('key', { data: 'value' }, 'config')
const data = cache.get('key')

// 查看统计
const stats = cache.getStatistics()
console.log(`命中率: ${stats.hitRate}%`)

// 预热缓存
await cache.warmup(async () => ({
  'config1': await loadConfig1(),
  'config2': await loadConfig2()
}))
```

## 🔧 常见问题

### Q: 测试失败怎么办？

A: 确保：
1. 已运行 `npm install`
2. Node.js 版本 >= 16.0.0
3. 查看错误信息，可能需要清理缓存：`npm run clean && npm install`

### Q: 如何查看详细的性能数据？

A: 使用 `monitor.exportMetrics()` 导出 JSON 数据：
```typescript
const data = monitor.exportMetrics()
fs.writeFileSync('metrics.json', data)
```

### Q: 缓存占用太多内存？

A: 调整配置：
```typescript
const cache = createSmartCache({
  maxSize: 50,  // 减小到 50MB
  memoryPressureThreshold: 60,  // 降低阈值
  maxAge: 1800000  // 30 分钟过期
})
```

### Q: 想要关闭内存压力监控？

A: 设置配置：
```typescript
const monitor = createEnhancedMonitor({
  enableMemoryPressureMonitoring: false
})
```

## 💡 最佳实践

### 开发环境配置

```typescript
// 开发环境：更频繁的监控和报告
const devMonitor = createEnhancedMonitor({
  memoryPressureCheckInterval: 3000,  // 3 秒检查
  historyLimit: 50
})

const devCache = createSmartCache({
  maxSize: 100,
  memoryPressureThreshold: 70
})
```

### 生产环境配置

```typescript
// 生产环境：更宽松的配置
const prodMonitor = createEnhancedMonitor({
  memoryPressureCheckInterval: 10000,  // 10 秒检查
  historyLimit: 200
})

const prodCache = createSmartCache({
  maxSize: 200,
  memoryPressureThreshold: 85,
  maxAge: 7200000  // 2 小时
})
```

## 🎓 下一步

1. ✅ 阅读 `ENHANCED_FEATURES.md` 了解所有功能
2. ✅ 运行示例脚本测试功能
3. ✅ 根据需求调整配置参数
4. ✅ 集成到你的项目中

## 📞 获取帮助

- 查看文档：`ENHANCED_FEATURES.md`
- 查看示例：`examples/test-enhanced-features.ts`
- 查看源码注释：所有 API 都有完整的 JSDoc

---

**祝你使用愉快！** 🎉
