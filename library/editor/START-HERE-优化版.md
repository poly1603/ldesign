# 🚀 从这里开始 - 优化版

> 30秒了解极致优化后的编辑器

---

## ⚡ 一行代码创建编辑器

```typescript
import { createLightweightEditor } from '@ldesign/editor'

const editor = await createLightweightEditor('#editor')
```

就这么简单！🎉

---

## 🎯 三种快速开始方式

### 1️⃣ 轻量级（性能优先）

```typescript
const editor = await createLightweightEditor('#editor')
```

- 加载时间：**< 500ms**
- 包体积：**< 100KB**
- 功能：核心编辑+基础格式化

### 2️⃣ 功能完整

```typescript
const editor = await createFullFeaturedEditor('#editor')
```

- 功能：**所有功能**
- 包括：AI、表格、媒体、高级工具

### 3️⃣ 格式化专用

```typescript
const editor = await createFormatOnlyEditor('#editor')
```

- 专注：文字格式化
- 适合：简单文本编辑

---

## 🎨 自定义构建（流式API）

```typescript
const editor = await createEditor()
  .element('#editor')          // 设置容器
  .lightweight()               // 基础功能
  .withMedia()                 // + 图片视频
  .withTable()                 // + 表格
  .theme('dark')               // 深色主题
  .icons('material')           // Material图标
  .build()                     // 构建！
```

---

## 🛠️ 管理功能

### 可视化管理

```typescript
import { showFeatureManager } from '@ldesign/editor'

showFeatureManager()  // 打开功能管理面板
```

在面板中可以：
- ✅ 启用/禁用45个功能
- ✅ 按8个分类管理
- ✅ 导出/导入配置
- ✅ 实时统计

### 代码管理

```typescript
import { getFeatureFlags } from '@ldesign/editor'

const features = getFeatureFlags()

features.disable('video')                    // 禁用视频
features.disableCategory(FeatureCategory.AI) // 禁用AI
features.disableBatch(['video', 'audio'])    // 批量禁用
```

---

## 📊 性能监控

```typescript
import { getPerformanceMonitor } from '@ldesign/editor'

const monitor = getPerformanceMonitor()

// 查看指标
console.log(monitor.getMetrics())

// 生成报告
console.log(monitor.generateReport())
```

---

## 🎨 简化工具

### DOM操作

```typescript
import { $, ui } from '@ldesign/editor'

// 创建元素
const div = $.create('div', { className: 'box' })

// 创建按钮（1行！）
const btn = ui.button('保存', save, 'save')

// 显示提示（1行！）
ui.toast('保存成功！', 'success')
```

### 性能测量

```typescript
import { measure } from '@ldesign/editor'

// 自动测量（1行！）
const result = await measure('operation', doWork)
```

---

## 📈 性能指标

| 指标 | 数值 |
|------|------|
| 初始加载 | **< 500ms** |
| FPS | **55-60** |
| 内存 | **< 60MB** |
| 响应时间 | **< 50ms** |

---

## 📚 文档导航

### 快速上手（5分钟）
- [快速参考](./📖-优化功能快速参考.md) ⭐ 必读
- [高效编码指南](./docs/guide/efficient-coding.md) ⭐ 推荐

### 详细学习（30分钟）
- [README](./README.md) - 完整介绍
- [定制化指南](./docs/guide/customization.md)
- [性能优化指南](./docs/guide/performance-optimization.md)

### 实践练习（1小时）
- [示例代码](./docs/examples/customization-example.md) - 10个示例
- [演示页面](./examples/simplified-usage.html) - 交互式

### 深入研究（半天）
- [完整报告](./🎯-极致优化完成.md) - 优化详情
- [验证指南](./tests/全面功能验证指南.md) - 测试方法

---

## 🎁 核心优势

### 极致简化
- ✅ **1行代码**创建编辑器
- ✅ **1行代码**创建UI组件
- ✅ **1行代码**性能测量

### 极速加载
- ✅ **500ms** 初始加载
- ✅ **按需加载** 减少70%
- ✅ **智能预加载** 优化体验

### 极度灵活
- ✅ **45个功能** 独立配置
- ✅ **3种图标集** 随意切换
- ✅ **3种主题** 自由选择
- ✅ **3种语言** 无缝切换

---

## 🚀 立即开始

### 在浏览器中

打开 http://localhost:9999/ 然后在Console中：

```javascript
// 查看所有功能
getFeatureFlags().getStats()

// 打开功能管理器
showFeatureManager()

// 查看性能
getPerformanceMonitor().generateReport()
```

### 在项目中

```typescript
import { createLightweightEditor } from '@ldesign/editor'

const editor = await createLightweightEditor('#editor')
```

---

## 💡 下一步

1. ✅ **阅读** [快速参考](./📖-优化功能快速参考.md)
2. ✅ **测试** [功能验证](./tests/全面功能验证指南.md)
3. ✅ **学习** [高效编码](./docs/guide/efficient-coding.md)
4. ✅ **实践** [示例代码](./examples/simplified-usage.html)

---

<div align="center">

**从100行代码到1行代码的进化** 🎉

**代码更少 · 功能更强 · 性能更好**

[⬆ 返回顶部](#-从这里开始---优化版)

</div>




