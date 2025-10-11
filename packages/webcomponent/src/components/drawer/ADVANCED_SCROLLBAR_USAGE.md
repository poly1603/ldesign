# 滚动条补偿高级用法

## 目录

- [基础配置](#基础配置)
- [高级配置](#高级配置)
- [性能优化](#性能优化)
- [调试技巧](#调试技巧)
- [常见问题](#常见问题)
- [最佳实践](#最佳实践)

---

## 基础配置

### 1. 默认使用（零配置）

drawer 组件默认启用滚动条补偿，无需任何配置：

```html
<ldesign-drawer visible="true">
  <p>内容</p>
</ldesign-drawer>
```

### 2. 禁用滚动锁定

如果不需要锁定页面滚动：

```html
<ldesign-drawer lock-scroll="false">
  <p>内容</p>
</ldesign-drawer>
```

---

## 高级配置

### 1. 使用配置管理器

```typescript
import { configureScrollbarCompensation } from './scrollbar-compensation.config';

// 全局配置
configureScrollbarCompensation({
  enabled: true,
  autoDetectFixed: true,
  minScrollbarWidth: 5, // 只在滚动条宽度 >= 5px 时补偿
  debug: false,
  maxElementsToScan: 1000, // 最多扫描 1000 个元素
  compensationStrategy: 'auto', // 自动选择补偿策略
});
```

### 2. 手动指定需要补偿的元素

```typescript
import { addFixedSelector } from './scrollbar-compensation.config';

// 添加需要补偿的选择器
addFixedSelector('.my-fixed-header');
addFixedSelector('.my-fixed-sidebar');
addFixedSelector('[data-sticky]');
```

```html
<!-- HTML 中标记 -->
<header class="my-fixed-header" style="position: fixed;">
  导航栏
</header>
```

### 3. 排除某些元素

```typescript
import { addExcludeSelector } from './scrollbar-compensation.config';

// 排除不需要补偿的元素
addExcludeSelector('.no-compensate');
addExcludeSelector('#skip-compensation');
```

```html
<!-- 这个元素不会被补偿 -->
<div class="no-compensate" style="position: fixed;">
  不补偿
</div>
```

### 4. 自定义补偿策略

```typescript
configureScrollbarCompensation({
  compensationStrategy: 'padding', // 强制使用 padding-right
  // 或
  compensationStrategy: 'margin',  // 强制使用 margin-right
  // 或
  compensationStrategy: 'auto',    // 自动选择（默认）
});
```

### 5. 启用调试模式

```typescript
import { enableScrollbarCompensationDebug } from './scrollbar-compensation.config';

// 启用调试
enableScrollbarCompensationDebug(true);
```

在调试模式下：
- 控制台会输出详细日志
- 被补偿的元素会有红色虚线边框
- 显示"已补偿"标签

---

## 性能优化

### 1. 限制扫描元素数量

对于大型页面（DOM 节点 > 1000），建议限制扫描数量：

```typescript
configureScrollbarCompensation({
  maxElementsToScan: 500, // 只扫描前 500 个元素
});
```

### 2. 手动指定固定元素

避免自动检测，手动指定需要补偿的元素：

```typescript
configureScrollbarCompensation({
  autoDetectFixed: false, // 禁用自动检测
  fixedSelectors: [
    '.navbar',
    '.sidebar',
    '.footer',
  ],
});
```

### 3. 使用 CSS 优化

引入 CSS 增强文件：

```html
<link rel="stylesheet" href="./scrollbar-compensation.css">
```

或在组件中导入：

```typescript
import './scrollbar-compensation.css';
```

### 4. 启用平滑过渡

```typescript
// 在 body 上添加类
document.body.classList.add('smooth-scrollbar-compensation');
```

**注意**：平滑过渡可能在快速切换时导致不同步，建议谨慎使用。

---

## 调试技巧

### 1. 查看滚动条宽度

```javascript
const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
console.log('滚动条宽度:', scrollbarWidth + 'px');
```

### 2. 检查锁定状态

```javascript
const lockCount = document.body.getAttribute('data-scroll-lock-count');
console.log('锁定计数:', lockCount);
```

### 3. 查看被补偿的元素

```javascript
const compensated = document.querySelectorAll('[data-scroll-compensated="true"]');
console.log('补偿的元素:', compensated);
compensated.forEach((el, index) => {
  console.log(`元素 ${index + 1}:`, el.tagName, el.className);
});
```

### 4. 监听补偿事件

虽然没有内置事件，但可以使用 MutationObserver：

```javascript
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'data-scroll-compensated') {
      console.log('补偿状态变化:', mutation.target);
    }
  });
});

observer.observe(document.body, {
  attributes: true,
  subtree: true,
  attributeFilter: ['data-scroll-compensated']
});
```

### 5. 使用浏览器开发工具

```javascript
// 在控制台执行，高亮所有被补偿的元素
document.querySelectorAll('[data-scroll-compensated="true"]').forEach(el => {
  el.style.outline = '3px solid red';
});
```

---

## 常见问题

### Q1: 为什么有些元素没有被补偿？

**A:** 可能原因：
1. 元素不是 `fixed` 或 `sticky` 定位
2. 元素宽度小于视口宽度且不在右侧
3. 超过了 `maxElementsToScan` 限制
4. 被 `excludeSelectors` 排除

**解决方案**：
```typescript
// 手动添加选择器
addFixedSelector('.my-element');

// 或直接在元素上添加属性
<div data-fixed-compensate class="my-element">...</div>
```

### Q2: 补偿后元素位置还是有轻微偏移？

**A:** 可能是动画时序问题。

**解决方案**：
```typescript
// 禁用 RAF 优化，立即应用补偿
configureScrollbarCompensation({
  useRequestAnimationFrame: false,
});
```

### Q3: 多个 drawer 同时打开时出现问题？

**A:** 确保使用了最新版本，计数器机制应该能处理多实例。

**调试**：
```javascript
console.log(document.body.getAttribute('data-scroll-lock-count'));
```

### Q4: 在 macOS 上看不到效果？

**A:** macOS 默认使用 overlay 滚动条（悬浮式），不占用空间。

**测试**：在系统设置中将滚动条设置为"始终显示"。

### Q5: 移动端有问题？

**A:** 移动端通常没有滚动条，建议禁用补偿：

```typescript
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if (isMobile) {
  configureScrollbarCompensation({
    enabled: false,
  });
}
```

---

## 最佳实践

### 1. 项目初始化配置

在项目入口文件中进行全局配置：

```typescript
// main.ts 或 app.ts
import { configureScrollbarCompensation } from '@/components/drawer/scrollbar-compensation.config';

configureScrollbarCompensation({
  enabled: true,
  autoDetectFixed: true,
  fixedSelectors: ['.header', '.sidebar', '.footer'],
  excludeSelectors: ['.no-compensate'],
  maxElementsToScan: 500,
  debug: process.env.NODE_ENV === 'development',
});
```

### 2. 为固定元素添加标记

**推荐**：在 HTML 中显式标记需要补偿的元素：

```html
<header class="header" data-fixed-compensate>...</header>
<aside class="sidebar" data-fixed-compensate>...</aside>
```

这样可以：
- 提高性能（无需扫描所有元素）
- 更精确（明确指定需要补偿的元素）
- 易维护（一目了然）

### 3. 条件启用补偿

```typescript
// 只在桌面端启用
const isDesktop = window.innerWidth > 768;
configureScrollbarCompensation({
  enabled: isDesktop,
});

// 响应窗口大小变化
window.addEventListener('resize', () => {
  const isDesktop = window.innerWidth > 768;
  configureScrollbarCompensation({
    enabled: isDesktop,
  });
});
```

### 4. 与 CSS 框架集成

#### Bootstrap

```typescript
addFixedSelector('.navbar-fixed-top');
addFixedSelector('.navbar-fixed-bottom');
addFixedSelector('.affix');
```

#### Tailwind CSS

```typescript
addFixedSelector('.fixed');
addFixedSelector('.sticky');
```

#### Ant Design

```typescript
addFixedSelector('.ant-layout-header');
addFixedSelector('.ant-affix');
```

### 5. 性能监控

```typescript
const perfObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name.includes('scrollbar-compensation')) {
      console.log('补偿耗时:', entry.duration + 'ms');
    }
  }
});

perfObserver.observe({ entryTypes: ['measure'] });

// 在补偿前后添加标记
performance.mark('scrollbar-compensation-start');
// ... 执行补偿
performance.mark('scrollbar-compensation-end');
performance.measure(
  'scrollbar-compensation',
  'scrollbar-compensation-start',
  'scrollbar-compensation-end'
);
```

### 6. 错误处理

```typescript
try {
  configureScrollbarCompensation({
    enabled: true,
    // ... 其他配置
  });
} catch (error) {
  console.error('滚动条补偿配置失败:', error);
  // 降级处理：禁用补偿
  configureScrollbarCompensation({
    enabled: false,
  });
}
```

### 7. TypeScript 类型支持

```typescript
import type { ScrollbarCompensationConfig } from './scrollbar-compensation.config';

// 定义配置对象
const config: Partial<ScrollbarCompensationConfig> = {
  enabled: true,
  autoDetectFixed: true,
  debug: false,
};

configureScrollbarCompensation(config);
```

---

## 示例项目结构

```
src/
├── components/
│   └── drawer/
│       ├── drawer.tsx
│       ├── drawer.utils.ts
│       ├── scrollbar-compensation.config.ts  # 配置文件
│       ├── scrollbar-compensation.css        # CSS 增强
│       └── ADVANCED_SCROLLBAR_USAGE.md       # 本文档
├── main.ts                                    # 入口文件
└── styles/
    └── scrollbar-compensation.css             # 全局样式
```

**在 main.ts 中初始化**：

```typescript
import { configureScrollbarCompensation } from '@/components/drawer/scrollbar-compensation.config';
import '@/components/drawer/scrollbar-compensation.css';

configureScrollbarCompensation({
  enabled: true,
  debug: import.meta.env.DEV,
  fixedSelectors: ['.header', '.sidebar'],
  maxElementsToScan: 500,
});
```

---

## 总结

- ✅ **零配置**：默认开箱即用
- ✅ **灵活配置**：丰富的配置选项
- ✅ **性能优化**：限制扫描、手动指定
- ✅ **调试友好**：详细日志、可视化
- ✅ **兼容性好**：支持主流浏览器和框架

如有问题，请参考 [SCROLLBAR_COMPENSATION_GUIDE.md](./SCROLLBAR_COMPENSATION_GUIDE.md) 或提交 Issue。
