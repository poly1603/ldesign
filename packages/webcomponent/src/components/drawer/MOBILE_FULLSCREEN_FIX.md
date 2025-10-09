# 移动端全屏模式修复文档

## 📅 修复日期
2025-10-09

## 🐛 问题描述

在移动设备上，当 drawer 抽屉组件设置为全屏模式 (`fullscreen="true"`) 时，并没有真正铺满整个屏幕。

### 症状
- ❌ 全屏抽屉宽度/高度未达到 100vw/100vh
- ❌ 抽屉四周有空隙
- ❌ 可能保留了圆角
- ❌ 移动端响应式样式覆盖了全屏设置

### 预期行为
- ✅ 全屏抽屉应该完全铺满整个视口
- ✅ 宽度 = 100vw，高度 = 100vh
- ✅ 无边距，四边完全对齐屏幕边缘
- ✅ 无圆角 (border-radius: 0)

## 🔍 根本原因分析

### 1. 内联样式不完整

在 `getDrawerStyle()` 方法中，全屏模式的处理不够完善：

```typescript
// ❌ 修复前
if (this.isFullscreen) style['width'] = '100%';

// 问题：
// - 只设置了 width: 100%，但没有设置 height
// - 没有显式设置 max-width/max-height
// - 没有设置 left/right/top/bottom 确保完全对齐
// - 百分比值可能参考错误的父容器
```

### 2. 移动端响应式样式覆盖

在 `drawer.responsive.less` 中，移动端的响应式样式强制覆盖了全屏模式：

```less
// ❌ 问题代码
@media (max-width: 768px) {
  &.drawer-left,
  &.drawer-right {
    .drawer-wrapper {
      // ⚠️ 这会覆盖全屏模式的尺寸！
      width: min(85vw, calc(100vw - 48px)) !important;
      max-width: 100vw !important;
      max-height: 100vh !important;
    }
  }
  
  &.drawer-bottom .drawer-wrapper {
    // ⚠️ 这也会覆盖全屏模式！
    max-height: calc(100vh - 60px) !important;
  }
}
```

**问题分析：**
- CSS 特异性：响应式样式使用了 `!important`，优先级很高
- 没有全屏例外：没有排除 `.drawer-fullscreen` 的情况
- 强制限制尺寸：即使设置了 `fullscreen="true"`，CSS 仍然限制尺寸

### 3. CSS 选择器优先级冲突

```less
// drawer.less 中的全屏样式
.drawer-fullscreen & {
  width: 100% !important;
  height: 100% !important;
  border-radius: 0 !important;
}

// drawer.responsive.less 中的移动端样式（更具体）
@media (max-width: 768px) {
  :host.drawer-left .drawer-wrapper {
    width: min(85vw, calc(100vw - 48px)) !important;
  }
}

// ⚠️ 媒体查询中的选择器特异性更高，会覆盖全屏样式！
```

## ✅ 解决方案

### 1. 增强内联样式处理

修改 `drawer.tsx` 的 `getDrawerStyle()` 方法，在全屏模式下显式设置所有必要属性：

```typescript
// ✅ 修复后
if (this.isFullscreen) {
  // 使用视口单位，确保真正的全屏
  style['width'] = '100vw';
  style['height'] = '100vh';
  style['max-width'] = '100vw';
  style['max-height'] = '100vh';
  
  // 确保四边完全对齐
  style['left'] = '0';
  style['right'] = '0';
  style['top'] = '0';
  style['bottom'] = '0';
} else {
  // 非全屏模式：应用移动端约束
  if (this.isMobileDevice) {
    style['max-width'] = '100vw';
  }
}
```

**修复要点：**
- 使用 `100vw/100vh` 而不是 `100%`，避免父容器参考问题
- 显式设置 `max-width/max-height` 防止被CSS覆盖
- 设置 `left/right/top/bottom` 确保完全对齐
- 区分全屏和非全屏模式的处理逻辑

### 2. 修复响应式 CSS 选择器

修改 `drawer.responsive.less`，为全屏模式添加例外：

```less
// ✅ 修复后
@media (max-width: 768px) {
  :host,
  .ldesign-drawer-container {
    // 添加 :not(.drawer-fullscreen) 排除全屏模式
    &.drawer-left:not(.drawer-fullscreen),
    &.drawer-right:not(.drawer-fullscreen) {
      .drawer-wrapper {
        width: min(85vw, calc(100vw - 48px)) !important;
        max-width: 100vw !important;
        max-height: 100vh !important;
      }
    }
    
    // 顶部/底部抽屉也要排除全屏模式
    &.drawer-top:not(.drawer-fullscreen),
    &.drawer-bottom:not(.drawer-fullscreen) {
      .drawer-wrapper {
        width: 100vw !important;
        max-width: 100vw !important;
        height: auto !important;
        max-height: min(80vh, calc(100vh - 60px)) !important;
      }
    }
    
    // 底部抽屉特殊处理（非全屏）
    &.drawer-bottom:not(.drawer-fullscreen) .drawer-wrapper {
      border-radius: var(--drawer-radius, 12px) var(--drawer-radius, 12px) 0 0;
      max-height: calc(100vh - 60px) !important;
    }
    
    // 顶部抽屉限制（非全屏）
    &.drawer-top:not(.drawer-fullscreen) .drawer-wrapper {
      max-height: calc(100vh - 60px) !important;
    }
  }
}

// 小屏幕设备也要添加例外
@media (max-width: 480px) {
  :host,
  .ldesign-drawer-container {
    &.drawer-left:not(.drawer-fullscreen),
    &.drawer-right:not(.drawer-fullscreen) {
      .drawer-wrapper {
        width: min(90vw, calc(100vw - 32px)) !important;
      }
    }
    
    &.drawer-top:not(.drawer-fullscreen),
    &.drawer-bottom:not(.drawer-fullscreen) {
      .drawer-wrapper {
        max-height: min(85vh, calc(100vh - 40px)) !important;
      }
    }
  }
}
```

**修复要点：**
- 使用 `:not(.drawer-fullscreen)` 排除全屏模式
- 确保所有移动端尺寸限制都不影响全屏模式
- 保持全屏模式的 CSS 样式优先级

## 📁 修改的文件

### `drawer.tsx`
**位置：** 第 1546-1590 行  
**方法：** `getDrawerStyle()`

**修改内容：**
```typescript
// 左右抽屉
if (this.placement === 'left' || this.placement === 'right') {
  style['width'] = this.currentSize;
  
  if (this.isFullscreen) {
    // ✅ 全屏模式：完整设置
    style['width'] = '100vw';
    style['height'] = '100vh';
    style['max-width'] = '100vw';
    style['max-height'] = '100vh';
    style['left'] = '0';
    style['right'] = '0';
    style['top'] = '0';
    style['bottom'] = '0';
  } else {
    // 非全屏模式：移动端约束
    if (this.isMobileDevice) {
      style['max-width'] = '100vw';
    }
  }
}

// 上下抽屉（同样的逻辑）
```

### `drawer.responsive.less`
**位置：** 第 167-314 行  
**修改内容：** 所有移动端响应式选择器

**主要修改：**
1. 第 171-179 行：左右抽屉 - 添加 `:not(.drawer-fullscreen)`
2. 第 194-203 行：上下抽屉 - 添加 `:not(.drawer-fullscreen)`
3. 第 206-227 行：底部抽屉 - 添加 `:not(.drawer-fullscreen)`
4. 第 230-236 行：顶部抽屉 - 添加 `:not(.drawer-fullscreen)`
5. 第 286-301 行：小屏幕样式 - 添加 `:not(.drawer-fullscreen)`

## 🧪 测试验证

### 测试文件
创建了专门的测试文件：`test-mobile-fullscreen.html`

### 测试用例
1. **右侧全屏抽屉** - 验证完全铺满屏幕
2. **左侧全屏抽屉** - 验证从左侧滑入的全屏效果
3. **底部全屏抽屉** - 验证从底部滑入的全屏效果
4. **顶部全屏抽屉** - 验证从顶部滑入的全屏效果
5. **普通抽屉（对比）** - 验证非全屏模式不受影响

### 自动检测功能
测试页面包含自动检测功能，会检查：
- 实际宽度是否等于视口宽度
- 实际高度是否等于视口高度
- 边距是否为 0
- 圆角是否为 0
- 是否通过全屏验证

### 测试设备
- iPhone SE (375px)
- iPhone 12/13 (390px)
- iPhone Pro Max (428px)
- Android 小屏 (360px)
- iPad Mini (768px)
- 竖屏/横屏模式

### 验证清单
- [x] 抽屉宽度 = 100vw
- [x] 抽屉高度 = 100vh
- [x] 左边距 = 0
- [x] 右边距 = 0
- [x] 顶边距 = 0
- [x] 底边距 = 0
- [x] 圆角 = 0
- [x] 遮罩层完全覆盖
- [x] 关闭按钮可见
- [x] 内容可滚动

## 🎯 修复效果对比

### 修复前
```html
<!-- 全屏抽屉 -->
<ldesign-drawer fullscreen="true" placement="right">
  <!-- 实际渲染效果 -->
  <div class="drawer-wrapper" style="width: 100%;">
    <!-- ❌ width: 100% 参考父容器，可能不是视口 -->
    <!-- ❌ 被响应式 CSS 覆盖为 85vw -->
    <!-- ❌ 保留了圆角 -->
  </div>
</ldesign-drawer>

<!-- 计算样式 -->
width: 85vw  /* ❌ 不是 100vw */
height: auto /* ❌ 不是 100vh */
border-radius: 8px /* ❌ 不是 0 */
```

### 修复后
```html
<!-- 全屏抽屉 -->
<ldesign-drawer fullscreen="true" placement="right">
  <!-- 实际渲染效果 -->
  <div class="drawer-wrapper" style="
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
    max-height: 100vh;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  ">
    <!-- ✅ 使用视口单位 -->
    <!-- ✅ 显式设置定位 -->
    <!-- ✅ CSS 不会覆盖（有 :not 例外）-->
  </div>
</ldesign-drawer>

<!-- 计算样式 -->
width: 100vw  /* ✅ 正确 */
height: 100vh /* ✅ 正确 */
border-radius: 0px /* ✅ 正确 */
left: 0px /* ✅ 正确 */
top: 0px /* ✅ 正确 */
```

## 💡 技术要点

### 1. CSS 单位选择

```typescript
// ❌ 错误：使用百分比
style['width'] = '100%';  // 参考父容器，不准确

// ✅ 正确：使用视口单位
style['width'] = '100vw';  // 参考视口，准确
style['height'] = '100vh';
```

### 2. CSS 特异性与 `:not()` 伪类

```less
// 特异性计算
.drawer-left .drawer-wrapper  /* (0, 0, 2, 0) */
.drawer-left:not(.drawer-fullscreen) .drawer-wrapper  /* (0, 0, 3, 0) 更高 */

// 但是全屏样式在基础 CSS 中
.drawer-fullscreen & {
  width: 100% !important;  /* 高优先级 */
}

// 只要响应式 CSS 不覆盖全屏模式，基础 CSS 就生效
```

### 3. 双重保险策略

1. **内联样式**：在 JS 中显式设置全屏尺寸
2. **CSS 例外**：在响应式 CSS 中排除全屏模式
3. **基础 CSS**：保持原有的全屏样式规则

这种三层防护确保全屏模式在任何情况下都能正确工作。

### 4. 为什么需要设置 `left/right/top/bottom`？

```css
/* 只设置宽高可能不够 */
.drawer-wrapper {
  width: 100vw;
  height: 100vh;
  /* 但如果 position 和 定位属性不对，可能会有偏移 */
}

/* 显式设置四边定位 */
.drawer-wrapper {
  width: 100vw;
  height: 100vh;
  left: 0;      /* 确保左边对齐 */
  right: 0;     /* 确保右边对齐 */
  top: 0;       /* 确保顶部对齐 */
  bottom: 0;    /* 确保底部对齐 */
}
```

## 🚨 注意事项

### 1. 全屏模式与锚点模式冲突

全屏模式和锚点模式不应该同时使用：

```typescript
// ❌ 错误用法
<ldesign-drawer 
  fullscreen="true" 
  anchor-mode="element"
  anchor-element="#btn">
  <!-- 这会导致冲突 -->
</ldesign-drawer>

// ✅ 正确用法：只使用其中一种
<ldesign-drawer fullscreen="true">
  <!-- 全屏模式 -->
</ldesign-drawer>

<ldesign-drawer 
  anchor-mode="element"
  anchor-element="#btn">
  <!-- 锚点模式 -->
</ldesign-drawer>
```

### 2. 移动端安全区域

在刘海屏设备上，全屏模式应该注意安全区域：

```typescript
// 将来可能需要添加
if (this.isFullscreen && this.isMobileDevice) {
  style['padding-top'] = 'env(safe-area-inset-top)';
  style['padding-bottom'] = 'env(safe-area-inset-bottom)';
}
```

### 3. 横屏模式

横屏模式下，全屏抽屉应该仍然保持正确：

```less
@media (orientation: landscape) {
  :host.drawer-fullscreen .drawer-wrapper {
    // 确保横屏时也是全屏
    width: 100vw !important;
    height: 100vh !important;
  }
}
```

## 📚 相关文档

- `MOBILE_WIDTH_OVERFLOW_FIX.md` - 移动端宽度超出修复
- `MOBILE_OVERFLOW_FIX.md` - CSS 选择器修复
- `FIX_SUMMARY.md` - 修复总结

## 🔖 版本记录

- **2025-10-09** - 修复移动端全屏模式不能铺满屏幕的问题
  - 增强 `getDrawerStyle()` 方法的全屏处理
  - 修复响应式 CSS 覆盖全屏样式的问题
  - 创建专门的全屏模式测试文件

## 🎉 总结

通过这次修复：
1. ✅ 全屏抽屉在移动端可以正确铺满整个屏幕
2. ✅ 使用视口单位确保准确性
3. ✅ 响应式 CSS 不再覆盖全屏模式
4. ✅ 提供了完善的测试验证工具
5. ✅ 保持了非全屏模式的正常工作

全屏模式现在在移动端和桌面端都能完美工作！🎊
