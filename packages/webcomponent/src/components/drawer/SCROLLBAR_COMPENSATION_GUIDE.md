# Drawer 滚动条补偿优化指南

## 问题描述

当 drawer 抽屉组件打开时，页面会设置 `overflow: hidden` 来锁定滚动，这会导致：
1. 滚动条消失，页面内容突然右移（滚动条宽度的距离）
2. 关闭时滚动条重新出现，内容左移
3. 这种视觉上的跳动会影响用户体验

## 优化方案

### 核心原理

通过以下步骤防止页面抖动：

1. **计算滚动条宽度**
   ```typescript
   const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
   ```

2. **补偿 body 的 padding-right**
   ```typescript
   document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
   ```

3. **自动补偿 fixed/sticky 元素**
   - 自动检测所有 `position: fixed` 和 `position: sticky` 的元素
   - 对全宽或右对齐的元素进行补偿
   - 根据元素使用 `right` 定位还是 `padding-right` 来选择补偿方式

### 关键优化点

#### 1. 支持多个 drawer 同时打开

使用计数器机制：
```typescript
// 锁定时增加计数
const lockCount = parseInt(document.body.getAttribute('data-scroll-lock-count') || '0');
document.body.setAttribute('data-scroll-lock-count', (lockCount + 1).toString());

// 解锁时减少计数
const newLockCount = lockCount - 1;
if (newLockCount > 0) return; // 还有其他 drawer 打开，不解锁
```

#### 2. 时序优化

使用 `requestAnimationFrame` 避免瞬间抖动：

**锁定时：**
```typescript
// 先设置 padding，再设置 overflow
document.body.style.paddingRight = `${scrollbarWidth}px`;
requestAnimationFrame(() => {
  document.body.style.overflow = 'hidden';
});
```

**解锁时：**
```typescript
// 先恢复 overflow，再恢复 padding
document.body.style.overflow = originalOverflow;
requestAnimationFrame(() => {
  document.body.style.paddingRight = originalPaddingRight;
});
```

#### 3. 智能补偿 fixed 元素

自动检测需要补偿的元素：
```typescript
// 检查元素位置
const rect = htmlEl.getBoundingClientRect();
const isFullWidth = rect.width >= window.innerWidth - 20;
const isRightAligned = rect.right >= window.innerWidth - 20;

// 选择补偿方式
if (originalRight !== 'auto' && originalRight !== '0px') {
  // 使用 right 定位的元素，调整 right 值
  htmlEl.style.right = `${currentRight + scrollbarWidth}px`;
} else {
  // 使用 padding-right 的元素，调整 padding
  htmlEl.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
}
```

#### 4. iOS 特殊处理

iOS 设备上 `overflow: hidden` 不可靠，使用 `position: fixed`：
```typescript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
if (isIOS) {
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
}
```

## 使用方法

### 1. 基本使用

drawer 组件会自动处理滚动条补偿，无需手动配置：

```html
<ldesign-drawer visible="true" placement="right">
  <p>抽屉内容</p>
</ldesign-drawer>
```

### 2. 为 fixed 元素添加标记（可选）

如果你有特殊的 fixed 元素需要补偿，可以添加属性标记：

```html
<header data-fixed-compensate style="position: fixed; top: 0; width: 100%;">
  固定头部导航
</header>
```

### 3. 禁用滚动锁定

如果你不需要锁定页面滚动：

```html
<ldesign-drawer lock-scroll="false">
  <p>抽屉内容</p>
</ldesign-drawer>
```

## 注意事项

### 1. 自定义容器

如果使用了自定义容器，滚动锁定只作用于该容器：

```html
<ldesign-drawer container="#my-container">
  <p>抽屉内容</p>
</ldesign-drawer>

<div id="my-container" style="position: relative;">
  <!-- 容器内容 -->
</div>
```

### 2. 性能考虑

滚动条补偿会扫描页面所有元素以找到 fixed/sticky 元素。如果页面元素非常多（>1000个），可能会有轻微性能影响。建议：

- 为需要补偿的 fixed 元素显式添加 `data-fixed-compensate` 属性
- 考虑使用自定义容器限制作用范围

### 3. 与其他组件配合

如果页面上有其他组件也锁定滚动（如 modal、loading 等），确保它们也使用相同的机制（计数器）来避免冲突。

## CSS 辅助

你也可以在 CSS 中添加平滑过渡来进一步优化体验：

```css
body {
  transition: padding-right 0.3s ease-in-out;
}

[data-fixed-compensate] {
  transition: padding-right 0.3s ease-in-out, right 0.3s ease-in-out;
}
```

但注意：这可能在某些情况下导致动画不同步，建议谨慎使用。

## 浏览器兼容性

该优化方案兼容：
- ✅ Chrome 60+
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ iOS Safari 12+
- ✅ Android Chrome 60+

## 调试

如果遇到滚动条补偿问题，可以检查以下内容：

1. 检查 body 上的属性：
```javascript
console.log(document.body.getAttribute('data-scroll-lock-count'));
console.log(document.body.getAttribute('data-scrollbar-width'));
```

2. 检查补偿的元素：
```javascript
const compensated = document.querySelectorAll('[data-scroll-compensated="true"]');
console.log('补偿的元素数量:', compensated.length);
```

3. 查看滚动条宽度：
```javascript
const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
console.log('滚动条宽度:', scrollbarWidth + 'px');
```

## 总结

优化后的滚动条补偿机制能够：
- ✅ 完全消除页面抖动
- ✅ 自动处理 fixed/sticky 元素
- ✅ 支持多个 drawer 同时打开
- ✅ 兼容 iOS 设备
- ✅ 无需额外配置
