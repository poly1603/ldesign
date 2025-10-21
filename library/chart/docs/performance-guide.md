# 性能优化指南

@ldesign/chart 图表库经过深度优化，提供了多种性能优化选项。本指南将帮助你充分利用这些优化功能。

## 📊 性能特性概览

| 特性 | 适用场景 | 性能提升 |
|------|---------|---------|
| 虚拟渲染 | 大数据集（>10k点） | 60%+ |
| Web Worker | 数据处理密集 | 70%+ |
| 缓存系统 | 重复渲染 | 80%+ |
| 对象池 | 频繁创建对象 | 40%+ |
| RAF 调度 | 高频更新 | 50%+ |

## 🚀 快速优化

### 基础配置

```vue
<template>
  <Chart 
    type="line" 
    :data="data"
    cache    <!-- 启用缓存 -->
  />
</template>
```

### 大数据集优化

```vue
<template>
  <Chart 
    type="scatter" 
    :data="largeData"
    virtual   <!-- 虚拟渲染 -->
    worker    <!-- Web Worker -->
    cache     <!-- 缓存 -->
    :chunk-size="2000"  <!-- 自定义分片大小 -->
  />
</template>
```

### 实时更新优化

```typescript
// 使用 RAF 调度器自动批量处理
import { renderScheduler } from '@ldesign/chart';

// 高频更新会自动批处理
setInterval(() => {
  chart.updateData(newData);
}, 16); // 即使每帧更新，也不会造成性能问题
```

## 💡 最佳实践

### 1. 启用缓存

**何时使用**：数据不经常变化，但组件会重新渲染

```vue
<Chart :data="staticData" cache />
```

**效果**：
- 避免重复计算配置
- 减少 50-80% 的初始化时间

### 2. 使用虚拟渲染

**何时使用**：数据点超过 10,000 个

```vue
<Chart :data="hugeData" virtual />
```

**效果**：
- 只渲染可见范围的数据
- 性能提升 60%+
- 内存占用降低 40%

**高级配置**：
```vue
<Chart 
  :data="hugeData" 
  virtual
  :virtual-config="{
    chunkSize: 2000,        // 分片大小
    preloadCount: 2,        // 预加载分片数
    adaptiveChunkSize: true // 自适应调整
  }"
/>
```

### 3. Web Worker 数据处理

**何时使用**：需要对大量数据进行计算或转换

```typescript
import { ChartWorker } from '@ldesign/chart';

const worker = new ChartWorker();

// 采样
const sampled = await worker.processData(largeData, 'sample', {
  method: 'lttb',  // Largest-Triangle-Three-Buckets
  count: 1000      // 采样到 1000 个点
});

// 降采样
const downsampled = await worker.processData(data, 'downsample', {
  window: 10,      // 每 10 个点
  method: 'average' // 取平均值
});
```

**效果**：
- 主线程不阻塞
- 处理速度提升 70%+

### 4. 对象池复用

**何时使用**：频繁创建和销毁对象

```typescript
import { arrayPool, objectPool } from '@ldesign/chart';

function processData() {
  // 从池中获取数组
  const arr = arrayPool.acquire();
  
  // 使用数组
  arr.push(...data);
  
  // 使用完毕，归还给池
  arrayPool.release(arr);
}
```

**效果**：
- GC 压力降低 50%+
- 对象创建开销降低 40%

### 5. 智能清理

**自动启用**，无需配置

```typescript
import { cleanupManager } from '@ldesign/chart';

// 查看清理统计
console.log(cleanupManager.stats());

// 手动触发清理（可选）
cleanupManager.manualCleanup('deep'); // light | medium | deep
```

**效果**：
- 空闲时段自动清理
- 内存使用更平稳
- 避免内存突然增长

## ⚠️ 性能陷阱

### 1. 避免频繁重新创建实例

❌ **不好的做法**：
```vue
<template>
  <div>
    <Chart v-for="item in items" :key="item.id" :data="item.data" />
  </div>
</template>

<script setup>
// 每次 items 变化都会重新创建所有图表
const items = ref([...]);
</script>
```

✅ **好的做法**：
```vue
<template>
  <div>
    <Chart 
      v-for="item in items" 
      :key="item.id" 
      :data="item.data"
      cache  <!-- 启用缓存 -->
      :priority="8"  <!-- 设置高优先级，避免被清理 -->
    />
  </div>
</template>
```

### 2. 合理设置实例优先级

```typescript
import { instanceManager } from '@ldesign/chart';

// 重要图表设置高优先级
instanceManager.setPriority(chartId, 9);

// 临时图表设置低优先级
instanceManager.setPriority(tempChartId, 2);
```

### 3. 避免过度使用 Worker

❌ **不好的做法**：
```vue
<!-- 小数据集不需要 Worker -->
<Chart :data="[1,2,3,4,5]" worker />
```

✅ **好的做法**：
```vue
<!-- 只在大数据集时使用 Worker -->
<Chart :data="hugeData" :worker="data.length > 10000" />
```

## 📈 性能监控

### 使用内置监控工具

```typescript
import { 
  performanceMonitor,
  chartCache,
  instanceManager,
  cleanupManager 
} from '@ldesign/chart';

// 性能统计
const perfStats = performanceMonitor.getStats();
console.log('平均渲染时间:', perfStats.average, 'ms');
console.log('FPS:', perfStats.fps);

// 缓存统计
const cacheStats = chartCache.stats();
console.log('缓存命中率:', (cacheStats.hitRate * 100).toFixed(2), '%');

// 实例统计
const instanceStats = instanceManager.stats();
console.log('活跃实例数:', instanceStats.active);
console.log('内存使用:', (instanceStats.memoryUsage / 1024 / 1024).toFixed(2), 'MB');

// 清理统计
const cleanupStats = cleanupManager.stats();
console.log('内存压力:', cleanupStats.memoryPressure);
```

### 性能分析

```typescript
// 标记性能测量点
performanceMonitor.mark('chart-init-start');

// 创建图表
const chart = new Chart(container, config);

// 测量耗时
const duration = performanceMonitor.measure('chart-init', 'chart-init-start');
console.log('初始化耗时:', duration, 'ms');
```

## 🎯 优化检查清单

在发布到生产环境之前，请确认：

- [ ] 大数据集（>10k）启用了虚拟渲染
- [ ] 数据处理密集场景启用了 Web Worker
- [ ] 静态数据启用了缓存
- [ ] 设置了合理的实例优先级
- [ ] 移除了开发环境的 console.log
- [ ] 使用了压缩后的构建文件
- [ ] 测试了内存使用情况
- [ ] 验证了性能指标

## 🔧 故障排查

### 问题：图表渲染很慢

**可能原因**：
1. 数据量过大，未启用虚拟渲染
2. 缓存未生效
3. 频繁重新创建实例

**解决方案**：
```vue
<Chart 
  :data="data"
  :virtual="data.length > 10000"
  cache
  :priority="8"
/>
```

### 问题：内存持续增长

**可能原因**：
1. 实例未正确销毁
2. 事件监听器未清理
3. 缓存过大

**解决方案**：
```typescript
// 1. 确保组件销毁时清理
onUnmounted(() => {
  chart.dispose();
});

// 2. 检查内存使用
const stats = instanceManager.stats();
if (stats.memoryUsage > 100 * 1024 * 1024) { // 100MB
  cleanupManager.manualCleanup('deep');
}

// 3. 调整缓存大小
chartCache.setMaxSize(50); // 减小缓存
```

### 问题：卡顿和掉帧

**可能原因**：
1. 高频更新未批处理
2. 渲染任务过多

**解决方案**：
```typescript
// 使用 RAF 调度器
import { renderScheduler } from '@ldesign/chart';

// 更新会自动批处理
chart.updateData(newData);

// 检查调度器状态
const stats = renderScheduler.stats();
if (stats.pending > 20) {
  console.warn('待处理任务过多，考虑降低更新频率');
}
```

## 📚 相关资源

- [API 文档](./api-reference.md)
- [优化报告](../OPTIMIZATION_REPORT.md)
- [最佳实践](./best-practices.md)
- [示例代码](../examples/)

---

**提示**：性能优化是一个持续的过程。根据实际使用场景选择合适的优化策略，并定期监控性能指标。

