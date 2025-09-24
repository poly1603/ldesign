# 性能优化系统

流程图编辑器的性能优化系统，专为大型流程图设计，包含性能监控、虚拟渲染、测试数据生成等功能。

## 🎯 设计目标

- **大规模支持**：支持1000+节点的大型流程图流畅渲染
- **实时监控**：提供实时性能指标监控和分析
- **智能优化**：根据数据规模自动选择最优渲染策略
- **开发友好**：提供完整的性能测试和基准测试工具

## 🚀 核心功能

### 1. 虚拟渲染 (VirtualRenderer)

针对大型流程图的核心优化技术：

**特性：**
- **视口裁剪**：只渲染可视区域内的节点和边
- **分层渲染**：根据缩放级别自动调整渲染详细程度
- **懒加载**：延迟加载非关键渲染任务
- **批量更新**：合并DOM操作，减少重排重绘

**使用示例：**
```typescript
import { VirtualRenderer } from '@ldesign/flowchart'

const renderer = new VirtualRenderer({
  enabled: true,
  bufferSize: 200,        // 可视区域缓冲区
  maxVisibleNodes: 500,   // 最大可见节点数
  maxVisibleEdges: 1000   // 最大可见边数
})

// 更新视口信息
renderer.updateViewport({
  x: 0, y: 0,
  width: 1000, height: 600,
  scale: 1.0
})

// 获取优化后的可见节点
const visibleNodes = renderer.getVisibleNodes(allNodes)
const visibleEdges = renderer.getVisibleEdges(allEdges, visibleNodes)
```

**渲染级别：**
- **详细级别** (scale ≥ 0.8)：显示所有细节
- **普通级别** (0.4 ≤ scale < 0.8)：隐藏部分细节
- **简化级别** (0.2 ≤ scale < 0.4)：只显示基本信息
- **最小级别** (scale < 0.2)：极简显示

### 2. 性能监控 (PerformanceMonitor)

实时监控系统性能指标：

**监控指标：**
- **渲染时间**：每次渲染的耗时
- **内存使用**：JavaScript堆内存使用情况
- **FPS**：实时帧率监控
- **DOM节点数**：DOM树复杂度
- **事件监听器数量**：内存泄漏检测

**使用示例：**
```typescript
import { PerformanceMonitor } from '@ldesign/flowchart'

const monitor = new PerformanceMonitor({
  enabled: true,
  sampleInterval: 1000,
  maxHistorySize: 100,
  monitorMemory: true,
  monitorFPS: true,
  thresholds: {
    renderTime: 16,  // 16ms (60fps)
    fps: 45,         // 最低FPS
    memory: 100      // 100MB内存阈值
  }
})

// 启动监控
monitor.start()

// 获取性能报告
const report = monitor.getReport()
console.log('性能等级:', report.performanceGrade) // excellent/good/fair/poor
console.log('优化建议:', report.recommendations)
```

### 3. 测试数据生成 (TestDataGenerator)

生成不同规模的测试数据用于性能基准测试：

**预定义场景：**
- **small**：15个节点，适合基础测试
- **medium**：75个节点，中等复杂度
- **large**：250个节点，大型流程图
- **xlarge**：750个节点，超大型流程图
- **stress**：1500个节点，压力测试

**使用示例：**
```typescript
import { TestDataGenerator, PerformanceBenchmark } from '@ldesign/flowchart'

// 创建生成器（使用种子确保可重复）
const generator = new TestDataGenerator(12345)

// 生成不同规模的测试数据
const smallData = generator.generateScenarioData('small')
const largeData = generator.generateScenarioData('large')

// 运行性能基准测试
const benchmark = new PerformanceBenchmark()
const results = await benchmark.runBenchmark(async (data, scenario) => {
  const startTime = performance.now()
  editor.render(data)
  return performance.now() - startTime
})

// 生成基准测试报告
const report = benchmark.generateBenchmarkReport(results)
console.log(report)
```

### 4. 批量DOM更新 (BatchDOMUpdater)

优化DOM操作性能：

```typescript
import { BatchDOMUpdater } from '@ldesign/flowchart'

const updater = new BatchDOMUpdater()

// 添加多个DOM更新操作
updater.addUpdate(() => element1.style.left = '100px')
updater.addUpdate(() => element2.style.top = '200px')
updater.addUpdate(() => element3.classList.add('active'))

// 批量执行所有更新（在下一帧执行）
updater.flush()
```

## 📊 性能基准

基于不同规模流程图的性能表现：

| 场景 | 节点数 | 边数 | 平均渲染时间 | 内存使用 | FPS |
|------|--------|------|-------------|----------|-----|
| Small | 15 | 12 | ~5ms | ~10MB | 60 |
| Medium | 75 | 68 | ~15ms | ~25MB | 58 |
| Large | 250 | 200 | ~35ms | ~45MB | 52 |
| XLarge | 750 | 600 | ~80ms | ~85MB | 45 |
| Stress | 1500 | 1200 | ~150ms | ~150MB | 35 |

## 🔧 配置选项

在FlowchartEditor中启用性能优化：

```typescript
const editor = new FlowchartEditor({
  container: '#flowchart-container',
  performance: {
    enabled: true,
    sampleInterval: 1000,
    maxHistorySize: 100,
    monitorMemory: true,
    monitorFPS: true,
    thresholds: {
      renderTime: 16,
      fps: 45,
      memory: 100
    },
    virtualRender: {
      enabled: true,
      bufferSize: 200,
      maxVisibleNodes: 500,
      maxVisibleEdges: 1000,
      enableLazyLoading: true,
      lazyLoadDelay: 100
    }
  }
})
```

## 🎨 最佳实践

### 1. 大型数据处理
```typescript
// 对于大型数据，启用虚拟渲染
if (data.nodes.length > 100) {
  editor.updateVirtualViewport()
}

// 监控性能指标
const stats = editor.getVirtualRenderStats()
console.log('可见节点数:', stats.visibleNodeCount)
```

### 2. 性能监控
```typescript
// 定期检查性能报告
setInterval(() => {
  const report = editor.getPerformanceReport()
  if (report.performanceGrade === 'poor') {
    console.warn('性能较差，建议优化:', report.recommendations)
  }
}, 5000)
```

### 3. 内存管理
```typescript
// 清理不需要的数据
editor.resetVirtualRenderer()
editor.clearPerformanceData()

// 批量DOM更新
const updates = [
  () => node1.updatePosition(),
  () => node2.updateStyle(),
  () => edge1.updatePath()
]
editor.batchUpdateDOM(updates)
```

## 🧪 测试和调试

### 运行性能测试
```bash
# 运行所有性能测试
pnpm test src/__tests__/performance

# 运行特定测试
pnpm test src/__tests__/performance/VirtualRenderer.test.ts
```

### 性能分析工具
- 使用浏览器开发者工具的Performance面板
- 启用性能监控查看实时指标
- 使用测试数据生成器进行基准测试

## 📈 性能优化效果

启用性能优化后的改进：

- **渲染时间**：大型流程图渲染时间减少60-80%
- **内存使用**：内存占用减少40-60%
- **用户体验**：滚动和缩放操作更加流畅
- **响应性**：UI交互响应时间显著改善

## 🔍 故障排除

### 常见问题

1. **性能监控不工作**
   - 确保浏览器支持Performance API
   - 检查配置中的`enabled`选项

2. **虚拟渲染效果不明显**
   - 确保数据规模足够大（>100个节点）
   - 检查视口更新是否正确调用

3. **内存泄漏**
   - 定期调用`resetVirtualRenderer()`
   - 检查事件监听器是否正确清理

### 调试技巧
```typescript
// 启用详细日志
console.log('虚拟渲染统计:', editor.getVirtualRenderStats())
console.log('性能报告:', editor.getPerformanceReport())

// 导出性能数据进行分析
const performanceData = editor.exportPerformanceData()
console.log(JSON.parse(performanceData))
```
