# 移动端抽屉超出屏幕问题修复

## 问题描述

在移动设备上，抽屉组件会超出屏幕边界，导致内容显示不完整，用户体验不佳。

![问题截图](https://user-images.githubusercontent.com/example/drawer-overflow.png)

## 根本原因

### CSS 选择器错误

在 `drawer.responsive.less` 中，移动端响应式样式使用了错误的选择器：

```less
// ❌ 错误的选择器
@media (max-width: 768px) {
  .drawer-wrapper {
    &.drawer-left,
    &.drawer-right {
      width: min(85vw, calc(100vw - 48px)) !important;
    }
  }
}
```

**问题分析：**

1. **实际 DOM 结构：**
   ```html
   <ldesign-drawer class="drawer-left drawer-visible">  <!-- placement 类在这里 -->
     <div class="drawer-wrapper">                       <!-- 没有 placement 类 -->
       <!-- content -->
     </div>
   </ldesign-drawer>
   ```

2. **选择器 `.drawer-wrapper.drawer-left` 期望：**
   - 需要在同一个元素上同时有 `drawer-wrapper` 和 `drawer-left` 类
   - 但实际上 `drawer-left` 在父元素（:host）上
   - 因此选择器不会匹配任何元素

3. **结果：**
   - 移动端的宽度限制样式完全不生效
   - 抽屉使用默认宽度（可能是 400px 或更大）
   - 在小屏幕设备上超出视口

## 解决方案

### 修复 CSS 选择器层级

将选择器从 `.drawer-wrapper.drawer-left` 改为 `.drawer-left .drawer-wrapper`，正确匹配 DOM 结构：

```less
// ✅ 正确的选择器
@media (max-width: 768px) {
  :host,
  .ldesign-drawer-container {
    // 左右侧抽屉的移动端优化
    &.drawer-left,
    &.drawer-right {
      .drawer-wrapper {
        // 使用 min 函数确保不超出屏幕
        width: min(85vw, calc(100vw - 48px)) !important;
        max-width: 100vw !important;
        max-height: 100vh !important;
      }
    }
    
    // iPhone X 等刘海屏适配
    @supports (padding-left: env(safe-area-inset-left)) {
      &.drawer-left .drawer-wrapper {
        padding-left: env(safe-area-inset-left);
        max-width: calc(100vw - env(safe-area-inset-left)) !important;
      }
      &.drawer-right .drawer-wrapper {
        padding-right: env(safe-area-inset-right);
        max-width: calc(100vw - env(safe-area-inset-right)) !important;
      }
    }
    
    // 上下抽屉的移动端优化
    &.drawer-top,
    &.drawer-bottom {
      .drawer-wrapper {
        width: 100vw !important;
        max-width: 100vw !important;
        height: auto !important;
        max-height: min(80vh, calc(100vh - 60px)) !important;
        min-height: 200px;
      }
    }
    
    // 底部抽屉特殊处理
    &.drawer-bottom .drawer-wrapper {
      border-radius: var(--drawer-radius, 12px) var(--drawer-radius, 12px) 0 0;
      max-height: calc(100vh - 60px) !important;
      
      @supports (padding-bottom: env(safe-area-inset-bottom)) {
        max-height: calc(100vh - env(safe-area-inset-bottom) - 20px) !important;
      }
      
      // 支持手势下拉关闭的视觉提示
      &::before {
        content: '';
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        width: 36px;
        height: 4px;
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 2px;
      }
    }
    
    // 顶部抽屉也需要限制
    &.drawer-top .drawer-wrapper {
      max-height: calc(100vh - 60px) !important;
      
      @supports (padding-top: env(safe-area-inset-top)) {
        max-height: calc(100vh - env(safe-area-inset-top) - 20px) !important;
      }
    }
  }
}
```

### 小屏幕设备适配（<480px）

同样修复小屏幕设备的选择器：

```less
@media (max-width: 480px) {
  :host,
  .ldesign-drawer-container {
    &.drawer-left,
    &.drawer-right {
      .drawer-wrapper {
        width: min(90vw, calc(100vw - 32px)) !important;
        max-width: 100vw !important;
      }
    }
    
    &.drawer-top,
    &.drawer-bottom {
      .drawer-wrapper {
        max-height: min(85vh, calc(100vh - 40px)) !important;
      }
    }
  }
}
```

## 修复效果

### 修复前
- ❌ 抽屉宽度超出屏幕
- ❌ 内容被截断
- ❌ 水平滚动条出现
- ❌ 用户无法看到完整的关闭按钮

### 修复后
- ✅ 抽屉宽度适配屏幕（85% - 90%）
- ✅ 左右保留适当间距（24px - 48px）
- ✅ 内容完整可见
- ✅ 关闭按钮可访问
- ✅ 支持安全区域（刘海屏适配）
- ✅ 响应式尺寸调整

## 移动端尺寸策略

### 标准屏幕（768px 以下）
- **左/右侧抽屉：** `min(85vw, calc(100vw - 48px))`
  - 占屏幕宽度的 85%
  - 或者 100vw - 48px（左右各留 24px）
  - 取较小值，确保不超出

- **顶/底部抽屉：** `min(80vh, calc(100vh - 60px))`
  - 占屏幕高度的 80%
  - 或者 100vh - 60px（顶部留空间）
  - 取较小值

### 小屏幕（480px 以下）
- **左/右侧抽屉：** `min(90vw, calc(100vw - 32px))`
  - 小屏幕上占更多空间（90%）
  - 左右各留 16px

- **顶/底部抽屉：** `min(85vh, calc(100vh - 40px))`
  - 占 85% 屏幕高度

### 安全区域适配
```less
// iOS 刘海屏适配
&.drawer-left .drawer-wrapper {
  padding-left: env(safe-area-inset-left);
  max-width: calc(100vw - env(safe-area-inset-left)) !important;
}

&.drawer-right .drawer-wrapper {
  padding-right: env(safe-area-inset-right);
  max-width: calc(100vw - env(safe-area-inset-right)) !important;
}

&.drawer-bottom .drawer-wrapper {
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    max-height: calc(100vh - env(safe-area-inset-bottom) - 20px) !important;
  }
}

&.drawer-top .drawer-wrapper {
  @supports (padding-top: env(safe-area-inset-top)) {
    max-height: calc(100vh - env(safe-area-inset-top) - 20px) !important;
  }
}
```

## CSS 选择器最佳实践

### ❌ 错误模式
```less
// 错误：假设类名在同一元素上
.parent {
  .child {
    &.modifier {  // 期望 .child.modifier
      // 样式
    }
  }
}
```

### ✅ 正确模式
```less
// 正确：根据实际 DOM 结构
.parent {
  &.modifier .child {  // 正确：.parent.modifier .child
    // 样式
  }
}

// 或者
.parent {
  &.modifier {
    .child {
      // 样式
    }
  }
}
```

## 测试检查清单

在修复后，请在以下设备/场景测试：

- [ ] iPhone SE (375px 宽度)
- [ ] iPhone 12/13 (390px 宽度)
- [ ] iPhone 12/13 Pro Max (428px 宽度)
- [ ] Android 小屏手机 (360px - 400px)
- [ ] iPad Mini (768px 宽度)
- [ ] 竖屏模式
- [ ] 横屏模式
- [ ] 有刘海屏的设备
- [ ] 左侧抽屉
- [ ] 右侧抽屉
- [ ] 顶部抽屉
- [ ] 底部抽屉

## 相关文件

- `src/components/drawer/drawer.responsive.less` - 响应式样式（已修复）
- `src/components/drawer/drawer.tsx` - 组件实现
- `src/components/drawer/drawer.less` - 基础样式

## 版本记录

- **2025-10-04** - 修复移动端抽屉超出屏幕问题
- **2025-10-04** - 同时修复移动端关闭按钮点击无响应问题

## 延伸阅读

- [CSS 选择器优先级](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Specificity)
- [Safe Area Insets](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)
- [CSS min() 函数](https://developer.mozilla.org/zh-CN/docs/Web/CSS/min)
- [响应式设计最佳实践](https://web.dev/responsive-web-design-basics/)
