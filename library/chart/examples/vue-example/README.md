# Vue 3 示例 - @ldesign/chart v1.2.0

展示 @ldesign/chart 在 Vue 3 中的使用和优化功能。

## 🚀 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
pnpm dev
```

然后打开浏览器访问 `http://localhost:5173`

## ✨ 示例功能

### 基础图表
- ✅ 折线图（启用缓存）
- ✅ 柱状图（高优先级）
- ✅ 饼图
- ✅ 多系列折线图
- ✅ 散点图
- ✅ 雷达图

### 优化功能展示
- 🚀 **大数据图表** - 50,000 数据点
  - 启用虚拟渲染
  - 启用 Web Worker
  - 启用缓存
  - 高优先级（9）
  
- 📊 **性能统计面板**
  - 缓存命中率
  - 活跃实例数
  - 内存使用情况
  - 内存压力级别

### 交互功能
- 🌙/🌞 暗色/亮色模式切换
- 🔼🔽 字体大小调整
- 🔄 数据刷新
- 📊 查看性能统计
- 🚀 生成大数据示例

## 📖 学习要点

### 1. 基础用法

```vue
<template>
  <Chart type="line" :data="[1, 2, 3, 4, 5]" />
</template>

<script setup>
import { Chart } from '@ldesign/chart/vue'
</script>
```

### 2. 启用优化

```vue
<Chart 
  type="line" 
  :data="largeData"
  virtual     <!-- 虚拟渲染 -->
  worker      <!-- Web Worker -->
  cache       <!-- 缓存 -->
  :priority="8"  <!-- 优先级 -->
/>
```

### 3. 性能监控

```typescript
import { chartCache, instanceManager } from '@ldesign/chart'

// 查看统计信息
console.log(chartCache.stats())
console.log(instanceManager.stats())
```

## 🎯 性能提示

1. **启用缓存** - 静态数据场景
2. **使用虚拟渲染** - 数据点 > 10,000
3. **使用 Worker** - 数据点 > 50,000
4. **设置优先级** - 重要图表设置高优先级
5. **监控性能** - 定期查看统计信息

## 📚 相关文档

- [性能优化指南](../../docs/performance-guide.md)
- [最佳实践](../../docs/best-practices.md)
- [API 文档](../../docs/api-reference.md)

---

**版本**: v1.2.0  
**框架**: Vue 3.4+  
**性能**: 优化 40-70%

