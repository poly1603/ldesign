# 性能监控系统

流程图编辑器的性能监控系统，用于监控渲染性能、内存使用和用户体验指标，帮助优化大型流程图的性能表现。

## ✨ 主要特性

- **🎯 实时监控**：实时监控渲染时间、内存使用、FPS等关键指标
- **📊 性能报告**：自动生成详细的性能分析报告和优化建议
- **🔍 智能分析**：基于性能数据自动评估性能等级
- **💾 数据导出**：支持性能数据的导出和历史记录管理
- **⚙️ 灵活配置**：支持自定义监控参数和采样策略
- **🎨 用户友好**：提供简洁的API和直观的性能指标

## 🚀 快速开始

### 基本使用

```typescript
import { FlowchartEditor } from '@ldesign/flowchart'

// 创建编辑器实例，启用性能监控
const editor = new FlowchartEditor({
  container: '#flowchart-container',
  performance: {
    enabled: true,
    sampleInterval: 1000, // 1秒采样一次
    monitorMemory: true,
    monitorFPS: true
  }
})

// 获取性能报告
const report = editor.getPerformanceReport()
console.log('性能等级:', report.performanceGrade)
console.log('平均渲染时间:', report.avgRenderTime, 'ms')
console.log('平均FPS:', report.avgFPS)
console.log('优化建议:', report.recommendations)
```

### 独立使用性能监控器

```typescript
import { PerformanceMonitor } from '@ldesign/flowchart'

// 创建性能监控器
const monitor = new PerformanceMonitor({
  enabled: true,
  sampleInterval: 1000,
  maxHistorySize: 100,
  monitorMemory: true,
  monitorFPS: true
})

// 启动监控
monitor.start()

// 标记渲染开始和结束
monitor.markRenderStart()
// ... 执行渲染操作
monitor.markRenderEnd()

// 获取当前性能指标
const metrics = monitor.getCurrentMetrics()
console.log('当前指标:', metrics)

// 获取性能报告
const report = monitor.getReport()
console.log('性能报告:', report)
```

## 📚 API 参考

### PerformanceMonitor

#### 构造函数

```typescript
new PerformanceMonitor(config?: PerformanceMonitorConfig)
```

**配置选项：**

```typescript
interface PerformanceMonitorConfig {
  enabled: boolean          // 是否启用监控
  sampleInterval: number     // 采样间隔（毫秒）
  maxHistorySize: number     // 最大历史记录数量
  monitorMemory: boolean     // 是否监控内存
  monitorFPS: boolean        // 是否监控FPS
  autoReport: boolean        // 是否自动生成报告
  reportInterval: number     // 报告生成间隔（毫秒）
}
```

#### 主要方法

##### 监控控制

```typescript
// 启动监控
monitor.start()

// 停止监控
monitor.stop()

// 标记渲染开始
monitor.markRenderStart()

// 标记渲染结束
monitor.markRenderEnd()

// 记录事件监听器数量变化
monitor.recordEventListener(delta: number)
```

##### 数据获取

```typescript
// 获取当前性能指标
const metrics = monitor.getCurrentMetrics()

// 获取性能报告
const report = monitor.getReport()

// 导出性能数据
const data = monitor.exportData()

// 清空历史数据
monitor.clear()
```

### FlowchartEditor 性能方法

```typescript
// 获取性能监控器
const monitor = editor.getPerformanceMonitor()

// 获取性能报告
const report = editor.getPerformanceReport()

// 控制监控
editor.startPerformanceMonitoring()
editor.stopPerformanceMonitoring()

// 数据管理
editor.clearPerformanceData()
const data = editor.exportPerformanceData()
```

## 📊 性能指标

### 核心指标

- **渲染时间 (renderTime)**：单次渲染操作的耗时（毫秒）
- **内存使用 (memoryUsage)**：JavaScript堆内存使用量（MB）
- **DOM节点数量 (domNodeCount)**：页面中的DOM节点总数
- **事件监听器数量 (eventListenerCount)**：注册的事件监听器数量
- **流程图节点数量 (flowchartNodeCount)**：流程图中的节点数量
- **流程图边数量 (flowchartEdgeCount)**：流程图中的连线数量
- **FPS (fps)**：每秒帧数，衡量动画流畅度

### 性能等级

- **excellent (优秀)**：性能表现优异，用户体验流畅
- **good (良好)**：性能表现良好，基本满足使用需求
- **fair (一般)**：性能表现一般，可能存在轻微卡顿
- **poor (较差)**：性能表现较差，需要优化

### 性能阈值

| 指标 | 优秀 | 良好 | 一般 | 较差 |
|------|------|------|------|------|
| 渲染时间 | < 20ms | < 50ms | < 100ms | ≥ 100ms |
| FPS | ≥ 55 | ≥ 45 | ≥ 30 | < 30 |
| 内存使用 | < 50MB | < 100MB | < 150MB | ≥ 150MB |

## 🔧 配置选项

### 编辑器配置

```typescript
const editor = new FlowchartEditor({
  performance: {
    enabled: true,              // 启用性能监控
    sampleInterval: 1000,       // 1秒采样一次
    maxHistorySize: 100,        // 保留100条历史记录
    monitorMemory: true,        // 监控内存使用
    monitorFPS: true,           // 监控FPS
    thresholds: {               // 性能阈值配置
      renderTime: 50,           // 渲染时间阈值（毫秒）
      fps: 45,                  // FPS阈值
      memory: 100               // 内存使用阈值（MB）
    }
  }
})
```

### 监控器配置

```typescript
const monitor = new PerformanceMonitor({
  enabled: true,
  sampleInterval: 1000,
  maxHistorySize: 100,
  monitorMemory: true,
  monitorFPS: true,
  autoReport: false,
  reportInterval: 30000
})
```

## 📈 性能报告

### 报告结构

```typescript
interface PerformanceReport {
  metrics: PerformanceMetrics[]     // 历史指标数据
  avgRenderTime: number             // 平均渲染时间
  maxRenderTime: number             // 最大渲染时间
  avgMemoryUsage: number            // 平均内存使用
  maxMemoryUsage: number            // 最大内存使用
  avgFPS: number                    // 平均FPS
  minFPS: number                    // 最低FPS
  performanceGrade: string          // 性能等级
  recommendations: string[]         // 优化建议
}
```

### 优化建议

系统会根据性能数据自动生成优化建议：

- **渲染时间过长**：建议启用虚拟滚动或减少同时渲染的节点数量
- **帧率较低**：建议优化动画效果或减少DOM操作频率
- **内存使用过高**：建议检查内存泄漏或优化数据结构
- **内存峰值过高**：建议实现对象池或延迟加载机制

## 🎯 使用场景

### 开发阶段

```typescript
// 开发时启用详细监控
const editor = new FlowchartEditor({
  performance: {
    enabled: true,
    sampleInterval: 500,    // 更频繁的采样
    autoReport: true,       // 自动生成报告
    reportInterval: 10000   // 10秒生成一次报告
  }
})
```

### 生产环境

```typescript
// 生产环境使用轻量级监控
const editor = new FlowchartEditor({
  performance: {
    enabled: true,
    sampleInterval: 5000,   // 较长的采样间隔
    monitorMemory: false,   // 关闭内存监控以减少开销
    autoReport: false       // 手动获取报告
  }
})
```

### 性能测试

```typescript
// 性能测试场景
const monitor = new PerformanceMonitor({
  enabled: true,
  sampleInterval: 100,     // 高频采样
  maxHistorySize: 1000,    // 大容量历史记录
  monitorMemory: true,
  monitorFPS: true
})

// 执行测试
monitor.start()
// ... 执行大量操作
const report = monitor.getReport()
console.log('测试结果:', report)
```

## 🧪 测试

性能监控系统包含完整的单元测试：

```bash
# 运行性能监控测试
pnpm test src/__tests__/performance

# 运行特定测试文件
pnpm test src/__tests__/performance/PerformanceMonitor.test.ts
```

测试覆盖了以下功能：
- ✅ 监控器初始化和配置
- ✅ 渲染时间监控
- ✅ 内存使用监控
- ✅ FPS监控
- ✅ 事件监听器计数
- ✅ 性能报告生成
- ✅ 数据导出和清理
- ✅ 性能等级评估

## 🔍 调试和故障排除

### 常见问题

1. **监控器未启动**
   - 检查 `enabled` 配置是否为 `true`
   - 确认调用了 `start()` 方法

2. **内存监控不工作**
   - 检查浏览器是否支持 `performance.memory` API
   - 确认 `monitorMemory` 配置为 `true`

3. **FPS监控异常**
   - 检查 `requestAnimationFrame` API 是否可用
   - 确认 `monitorFPS` 配置为 `true`

### 调试技巧

```typescript
// 启用调试日志
const monitor = new PerformanceMonitor({
  enabled: true,
  autoReport: true,
  reportInterval: 5000
})

// 监听控制台输出
monitor.start()
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进性能监控系统！
