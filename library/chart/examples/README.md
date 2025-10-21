# @ldesign/chart 示例项目

完整的示例项目，展示 @ldesign/chart v1.2.0 的所有功能和优化特性。

---

## 📂 示例列表

### 1. Vue 3 示例
**目录**: `vue-example/`

展示在 Vue 3 中使用 @ldesign/chart 的完整示例。

**特性**：
- ✅ 6 种基础图表类型
- ✅ 大数据图表（50k 数据点）
- ✅ 性能统计面板
- ✅ 暗色模式切换
- ✅ 优化功能展示

**启动方式**：
```bash
cd vue-example
pnpm install
pnpm dev
```

**文档**：[vue-example/README.md](./vue-example/README.md)

---

### 2. React 示例
**目录**: `react-example/`

展示在 React 中使用 @ldesign/chart 的完整示例。

**特性**：
- ✅ 6 种基础图表类型
- ✅ 大数据图表（50k 数据点）
- ✅ 性能统计面板
- ✅ 暗色模式切换
- ✅ 优化功能展示

**启动方式**：
```bash
cd react-example
pnpm install
pnpm dev
```

**文档**：[react-example/README.md](./react-example/README.md)

---

## 🎯 示例对比

| 特性 | Vue 3 示例 | React 示例 |
|------|-----------|-----------|
| 框架 | Vue 3.4+ | React 18+ |
| 语法 | Composition API | Hooks |
| 图表数量 | 6 + 1 大数据 | 6 + 1 大数据 |
| 性能监控 | ✅ | ✅ |
| 优化展示 | ✅ | ✅ |
| 响应式 | ✅ | ✅ |

---

## ✨ 示例功能

### 基础图表
所有示例都包含以下图表类型：

1. **折线图** - 简单数组数据
2. **柱状图** - 带标签的数据
3. **饼图** - 百分比数据
4. **多系列折线图** - 多个数据集
5. **散点图** - 二维数据
6. **雷达图** - 多维数据

### 优化功能展示

#### 缓存优化
```vue
<Chart :data="data" cache />
```
- 避免重复计算
- 提升 50-80% 性能

#### 虚拟渲染
```vue
<Chart :data="largeData" virtual />
```
- 处理大数据集
- 提升 60%+ 性能

#### Web Worker
```vue
<Chart :data="hugeData" worker />
```
- 后台数据处理
- 主线程不阻塞

#### 高优先级
```vue
<Chart :data="data" :priority="8" />
```
- 重要图表不被清理
- 保持在内存中

### 性能监控

点击"📊 统计"按钮查看：
- **缓存命中率** - 缓存效率
- **活跃实例数** - 当前图表数量
- **内存使用** - 当前内存占用
- **内存压力** - 压力级别

### 大数据示例

点击"🚀 大数据"按钮：
- 生成 50,000 个数据点
- 自动启用所有优化
- 展示实时性能统计

---

## 🎓 学习路径

### 第 1 步：运行示例
```bash
cd vue-example  # 或 react-example
pnpm install
pnpm dev
```

### 第 2 步：查看代码
- 查看 `src/App.vue` 或 `src/App.tsx`
- 理解组件使用方式
- 学习优化配置

### 第 3 步：实验功能
- 尝试切换暗色模式
- 点击"刷新数据"观察缓存效果
- 生成大数据测试性能
- 查看性能统计

### 第 4 步：修改代码
- 调整数据
- 修改图表配置
- 添加新图表
- 实验不同优化组合

---

## 📊 性能对比

### 小数据集
```
数据量: 100 points
普通模式: ~50ms
缓存模式: ~10ms (提升 80%)
```

### 大数据集
```
数据量: 50,000 points
普通模式: ~2,500ms
优化模式: ~750ms (提升 70%)
  - virtual ✅
  - worker ✅
  - cache ✅
```

---

## 🔧 自定义示例

### 添加新图表

**Vue 3**:
```vue
<div class="chart-card">
  <h2>我的图表</h2>
  <Chart 
    type="bar"
    :data="myData"
    cache
    :priority="7"
  />
</div>
```

**React**:
```tsx
<div className="chart-card">
  <h2>My Chart</h2>
  <Chart
    type="bar"
    data={myData}
    cache
    priority={7}
  />
</div>
```

### 自定义优化配置

```typescript
// 根据数据大小动态启用优化
const shouldOptimize = data.length > 10000

<Chart 
  :data="data"
  :virtual="shouldOptimize"
  :worker="shouldOptimize"
  cache
/>
```

---

## 💡 提示

### 开发环境
- 启用所有日志和统计
- 使用性能监控工具
- 观察控制台输出

### 生产环境
- 启用所有优化
- 关闭开发日志
- 设置合理的优先级

---

## 📚 相关资源

- [主项目 README](../../README.md)
- [性能优化指南](../../docs/performance-guide.md)
- [最佳实践](../../docs/best-practices.md)
- [API 文档](../../docs/api-reference.md)
- [优化报告](../../OPTIMIZATION_REPORT.md)

---

## 🎉 尝试一下

1. 启动示例项目
2. 点击"🚀 大数据"按钮
3. 观察性能表现
4. 查看性能统计
5. 体验优化效果

**enjoy！** 🎊

