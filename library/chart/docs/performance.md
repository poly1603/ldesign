# 性能优化指南

@ldesign/chart 提供了多种性能优化策略，帮助您处理大数据集和提升渲染性能。

## 按需加载

### 自动按需加载

图表库默认启用按需加载，只加载使用的图表类型和组件。

```javascript
// 只会加载折线图相关的模块
<Chart type="line" :data="data" />
```

### 手动按需加载

如果需要预加载某些模块：

```javascript
import { echartsLoader } from '@ldesign/chart'

// 预加载多个图表类型
await Promise.all([
  echartsLoader.loadChart('line'),
  echartsLoader.loadChart('bar'),
  echartsLoader.loadChart('pie')
])
```

## 虚拟渲染

对于大数据集（10,000+ 数据点），启用虚拟渲染。

```javascript
<Chart 
  type="scatter" 
  :data="largeData" 
  virtual 
/>
```

**工作原理：**
- 只渲染可见范围的数据
- 配合 dataZoom 实现数据分片
- 自动管理内存使用

**适用场景：**
- 散点图（10万+ 点）
- 折线图（5万+ 点）
- 柱状图（1万+ 条）

## Web Worker

使用 Web Worker 在后台线程处理数据。

```javascript
<Chart 
  type="line" 
  :data="hugeData" 
  worker 
/>
```

**优势：**
- 不阻塞主线程
- 提升交互响应
- 适合数据密集型操作

**适用场景：**
- 数据转换
- 复杂计算
- 大数据聚合

## 缓存

启用缓存可以避免重复计算配置。

```javascript
<Chart 
  type="bar" 
  :data="data" 
  cache 
/>
```

**缓存策略：**
- 使用弱引用（WeakRef）
- 自动 GC
- 默认 TTL: 5分钟

**配置缓存：**

```javascript
import { chartCache } from '@ldesign/chart'

// 设置最大缓存数量
chartCache.setMaxSize(200)

// 设置默认 TTL
chartCache.setDefaultTTL(10 * 60 * 1000) // 10分钟

// 清理缓存
chartCache.clear()

// 获取统计信息
console.log(chartCache.stats())
```

## 懒加载

延迟图表初始化，提升首屏加载速度。

```javascript
<Chart 
  type="pie" 
  :data="data" 
  lazy 
/>
```

**效果：**
- 禁用动画
- 延迟渲染
- 减少初始化时间

## 数据分片

渐进式加载大数据。

```javascript
import { DataChunker } from '@ldesign/chart'

const chunker = new DataChunker()

// 渐进式加载
for await (const chunk of chunker.loadInChunks(largeData, 5000)) {
  // 处理每个分片
  processChunk(chunk)
}
```

## 响应式优化

### 防抖配置

```javascript
<Chart 
  type="line" 
  :data="data" 
  :responsive="{
    enabled: true,
    debounce: 200  // 防抖延迟 200ms
  }"
/>
```

### 禁用响应式

对于固定尺寸的图表，可以禁用响应式以提升性能。

```javascript
<Chart 
  type="bar" 
  :data="data" 
  :responsive="false" 
/>
```

## 实例管理

### 最大实例数

控制同时存在的图表实例数量。

```javascript
import { instanceManager } from '@ldesign/chart'

// 设置最大实例数
instanceManager.setMaxInstances(100)

// 获取统计信息
console.log(instanceManager.stats())
// {
//   total: 45,
//   active: 45,
//   ids: ['chart-1', 'chart-2', ...]
// }
```

### 手动清理

```javascript
// 销毁指定实例
instanceManager.dispose('chart-1')

// 销毁所有实例
instanceManager.disposeAll()
```

## 内存优化

### 对象池

复用对象减少 GC 压力。

```javascript
import { ObjectPool } from '@ldesign/chart'

const pool = new ObjectPool(
  () => ({ x: 0, y: 0 }),  // 工厂函数
  (obj) => { obj.x = 0; obj.y = 0 },  // 重置函数
  100  // 初始大小
)

// 获取对象
const obj = pool.acquire()

// 使用...

// 释放对象
pool.release(obj)
```

### 自动清理

```javascript
import { cleanupManager } from '@ldesign/chart'

// 启动自动清理
const stopCleanup = cleanupManager.startAutoCleanup(60000) // 每分钟

// 停止清理
stopCleanup()
```

## 性能监控

### 测量渲染时间

```javascript
const chart = createChart(container, config)

console.time('render')
await chart.refresh()
console.timeEnd('render')
```

### 内存使用

```javascript
// 图表实例统计
console.log(instanceManager.stats())

// 缓存统计
console.log(chartCache.stats())
```

## 最佳实践

### 1. 数据量分级处理

```javascript
const dataSize = data.length

if (dataSize < 1000) {
  // 小数据集：默认配置
  return <Chart type="line" data={data} />
} else if (dataSize < 10000) {
  // 中等数据集：启用缓存
  return <Chart type="line" data={data} cache />
} else if (dataSize < 100000) {
  // 大数据集：启用虚拟渲染
  return <Chart type="scatter" data={data} virtual cache />
} else {
  // 超大数据集：启用所有优化
  return <Chart type="scatter" data={data} virtual worker cache lazy />
}
```

### 2. 按需加载策略

```javascript
// 首屏只加载必要的图表
const CommonCharts = lazy(() => import('./CommonCharts'))
const AdvancedCharts = lazy(() => import('./AdvancedCharts'))
```

### 3. 数据更新优化

```javascript
// ❌ 错误：频繁更新
setInterval(() => {
  chart.updateData(newData)
}, 100)

// ✅ 正确：使用防抖
import { debounce } from '@ldesign/chart'

const updateChart = debounce(() => {
  chart.updateData(newData)
}, 500)

setInterval(updateChart, 100)
```

### 4. 使用浅拷贝

```javascript
// ❌ 错误：深度响应
const data = reactive({
  labels: [...],
  datasets: [...]
})

// ✅ 正确：浅响应
const data = shallowReactive({
  labels: [...],
  datasets: [...]
})
```

### 5. 销毁不用的实例

```javascript
// Vue
onUnmounted(() => {
  chartInstance.value?.dispose()
})

// React
useEffect(() => {
  return () => {
    chart?.dispose()
  }
}, [])
```

## 性能基准

| 数据量 | 渲染时间（默认） | 渲染时间（优化后） |
|--------|-----------------|-------------------|
| 1,000 | ~50ms | ~50ms |
| 10,000 | ~200ms | ~150ms |
| 100,000 | ~2000ms | ~500ms |
| 1,000,000 | OOM | ~1500ms |

**优化配置：** `virtual` + `worker` + `cache` + `lazy`

## 故障排查

### 内存泄漏

**症状：** 页面长时间运行后内存持续增长

**解决方案：**
1. 确保图表销毁时调用 `dispose()`
2. 检查事件监听器是否正确移除
3. 使用 Chrome DevTools 内存分析

### 渲染卡顿

**症状：** 图表更新时页面卡顿

**解决方案：**
1. 启用 `virtual` 虚拟渲染
2. 使用 `worker` 处理数据
3. 减少更新频率（防抖）
4. 使用 `lazy` 模式

### 打包体积大

**症状：** 打包后文件过大

**解决方案：**
1. 确保使用按需加载
2. 检查是否完整导入了 echarts
3. 使用 Tree Shaking
4. 按需导入图表类型

```javascript
// ❌ 错误
import * as echarts from 'echarts'

// ✅ 正确
import { Chart } from '@ldesign/chart'
// 库会自动按需加载
```

## 进阶优化

### 自定义 Worker

```javascript
import { ChartWorker } from '@ldesign/chart'

class CustomWorker extends ChartWorker {
  async processData(data, processor) {
    // 自定义处理逻辑
    return super.processData(data, processor)
  }
}
```

### 自定义缓存策略

```javascript
import { ChartCache } from '@ldesign/chart'

class CustomCache extends ChartCache {
  // 实现自定义缓存逻辑
  set(key, value, ttl) {
    // 自定义逻辑
    super.set(key, value, ttl)
  }
}
```

## 总结

选择合适的优化策略：

| 场景 | 推荐配置 |
|------|---------|
| 小数据集 (< 1k) | 默认配置 |
| 中等数据集 (1k-10k) | `cache` |
| 大数据集 (10k-100k) | `virtual` + `cache` |
| 超大数据集 (> 100k) | `virtual` + `worker` + `cache` + `lazy` |
| 实时更新 | 防抖 + `lazy` |
| 首屏加载 | 按需加载 + `lazy` |

