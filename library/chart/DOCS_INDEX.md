# 📚 文档索引

@ldesign/chart v1.2.0 完整文档导航

---

## 🚀 快速开始

### 新手入门
1. [README.md](./README.md) - 项目介绍和快速开始
2. [docs/quick-start.md](./docs/quick-start.md) - 详细入门教程
3. [README_OPTIMIZATION.md](./README_OPTIMIZATION.md) - 优化版本说明

### 基础使用
- [docs/api-reference.md](./docs/api-reference.md) - API 完整文档
- [docs/data-formats.md](./docs/data-formats.md) - 数据格式说明
- [docs/theming.md](./docs/theming.md) - 主题配置

---

## ⚡ 性能优化

### 必读文档 ⭐
1. [docs/performance-guide.md](./docs/performance-guide.md) - **性能优化指南**
2. [docs/best-practices.md](./docs/best-practices.md) - **最佳实践**
3. [OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md) - **优化总结**

### 详细报告
- [OPTIMIZATION_REPORT.md](./OPTIMIZATION_REPORT.md) - 详细技术实现
- [FINAL_REPORT.md](./FINAL_REPORT.md) - 最终完整报告
- [ACHIEVEMENTS.md](./ACHIEVEMENTS.md) - 成果展示

---

## 📖 技术文档

### 核心技术
- **缓存系统**：`src/memory/cache.ts`
  - LRU 策略
  - 高性能哈希
  - 命中率统计
  
- **实例管理**：`src/core/instance-manager.ts`
  - LRU 淘汰
  - 优先级管理
  - 内存监控

- **渲染调度**：`src/performance/render-scheduler.ts`
  - RAF 调度
  - 批量处理
  - 优先级队列

- **事件管理**：`src/utils/event-manager.ts`
  - 自动清理
  - 循环引用检测
  - 防内存泄漏

- **错误处理**：`src/utils/error-handler.ts`
  - 统一错误系统
  - 恢复建议
  - 性能监控

### 性能模块
- **虚拟渲染**：`src/performance/virtual-render.ts`
- **Web Worker**：`src/performance/web-worker.ts`
- **数据分片**：`src/performance/data-chunk.ts`

### 内存模块
- **对象池**：`src/memory/pool.ts`
- **智能清理**：`src/memory/cleanup.ts`

### 工具模块
- **工具函数**：`src/utils/helpers.ts`（30+ 函数）
- **响应式系统**：`src/utils/resize-observer.ts`

---

## 📝 更新日志

- [CHANGELOG.md](./CHANGELOG.md) - 完整更新历史
  - v1.2.0 - 2025年10月21日 - 重大优化版本
  - v1.0.0 - 2024年1月1日 - 初始版本

---

## 🎯 按使用场景查找

### 大数据场景
👉 [性能优化指南 - 大数据集优化](./docs/performance-guide.md#大数据集优化)
- 虚拟渲染
- Web Worker
- 采样算法

### 内存敏感场景
👉 [性能优化指南 - 内存管理](./docs/performance-guide.md#内存管理)
- 对象池
- 智能清理
- 实例优先级

### 实时更新场景
👉 [性能优化指南 - 实时更新](./docs/performance-guide.md#实时更新优化)
- RAF 调度器
- 批量更新
- 缓存策略

### 移动端场景
👉 [最佳实践 - 响应式设计](./docs/best-practices.md#响应式设计)
- 响应式断点
- 可见性检测
- 内存优化

---

## 🔍 按问题查找

### 性能问题
- 图表初始化慢 → [性能指南 - 初始化优化](./docs/performance-guide.md)
- 渲染卡顿 → [故障排查 - 渲染问题](./docs/performance-guide.md#故障排查)
- 大数据慢 → [大数据优化](./docs/performance-guide.md#大数据集优化)

### 内存问题
- 内存占用高 → [内存管理](./docs/performance-guide.md#内存管理)
- 内存泄漏 → [内存泄漏防护](./OPTIMIZATION_REPORT.md#内存泄漏防护)
- 内存持续增长 → [智能清理](./OPTIMIZATION_REPORT.md#智能清理系统)

### 使用问题
- 如何配置 → [API 文档](./docs/api-reference.md)
- 数据格式 → [数据格式文档](./docs/data-formats.md)
- 主题定制 → [主题文档](./docs/theming.md)

---

## 🎓 学习路径

### 第1天：快速入门
```
1. 阅读 README.md
2. 阅读 quick-start.md
3. 运行示例代码
4. 创建第一个图表
```

### 第2天：深入理解
```
1. 阅读 API 文档
2. 了解数据格式
3. 学习主题系统
4. 实践各种图表类型
```

### 第3天：性能优化
```
1. 阅读 performance-guide.md ⭐
2. 阅读 best-practices.md ⭐
3. 启用性能优化功能
4. 使用监控工具
```

### 第4天：进阶应用
```
1. 阅读优化报告
2. 了解内部机制
3. 自定义优化策略
4. 生产环境部署
```

---

## 📊 文档统计

- **优化文档**：5 个
- **技术文档**：5 个
- **使用指南**：3 个
- **代码示例**：10+ 个
- **总字数**：20,000+ 字

---

## 🎯 推荐阅读顺序

### 新用户
1. README.md
2. docs/quick-start.md
3. README_OPTIMIZATION.md

### 性能优化
1. OPTIMIZATION_SUMMARY.md ⭐
2. docs/performance-guide.md ⭐
3. docs/best-practices.md ⭐
4. OPTIMIZATION_REPORT.md

### 深入学习
1. FINAL_REPORT.md
2. ACHIEVEMENTS.md
3. 源码阅读

---

## ✨ 特别推荐

### 🌟 必读文档
- [性能优化指南](./docs/performance-guide.md) - 最实用
- [最佳实践](./docs/best-practices.md) - 最全面
- [优化总结](./OPTIMIZATION_SUMMARY.md) - 最快速

### 🎯 快速查询
- [CHANGELOG.md](./CHANGELOG.md) - 查看更新历史
- [ACHIEVEMENTS.md](./ACHIEVEMENTS.md) - 查看成果
- [README_OPTIMIZATION.md](./README_OPTIMIZATION.md) - 快速了解优化

---

## 🔗 外部资源

- [ECharts 官方文档](https://echarts.apache.org/)
- [Vue 3 文档](https://vuejs.org/)
- [React 文档](https://react.dev/)
- [Lit 文档](https://lit.dev/)

---

**文档版本**：v1.2.0  
**最后更新**：2025年10月21日  
**维护状态**：✅ 活跃维护

**提示**：建议按照推荐阅读顺序逐步学习，可以更快掌握图表库的使用和优化技巧。

