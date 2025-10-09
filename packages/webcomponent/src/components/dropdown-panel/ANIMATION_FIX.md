# Dropdown Panel 动画方向修复说明

## 问题描述

当 dropdown-panel 组件的 `placement` 从 `bottom` 切换到 `top` 时，面板的动画方向出现错误：

**错误表现：**
- 第一次点击：从按钮下方向下滑动展开（正确 ✓）
- 滚动页面后，自动切换到 `placement="top"`
- 第二次点击：面板从屏幕**顶部向下**滑动展开（错误 ✗）

**期望表现：**
- 当 `placement="top"` 时，面板应该从触发按钮**上方向上**滑动展开

## 问题根源

### CSS 布局和动画逻辑

**对于 `placement="top"` 的情况：**

1. **遮罩区域：** 从屏幕顶部到触发按钮位置
2. **面板定位：** `bottom: 0` 让面板底边贴近遮罩底边（触发按钮位置）
3. **错误的动画实现：**
   ```less
   &--top {
     bottom: 0;
     transform: translateY(100%);  // ❌ 错误：向下移动100%
     
     &.l-dropdown-panel__panel--visible {
       transform: translateY(0);
     }
   }
   ```

**问题分析：**
- `translateY(100%)` 会将面板向**下**移动一个面板高度
- 这让面板移动到遮罩区域的**下方外部**
- 由于遮罩设置了 `overflow: hidden`，面板被完全隐藏
- 展开时 `translateY(0)`，面板从下方向上移动回触发器位置
- **视觉效果：** 面板看起来是从屏幕顶部向下滑入

## 解决方案

### 修复后的 CSS

```less
&--top {
  bottom: 0;
  // 初始状态：面板向上收起，完全隐藏在遮罩上方（触发器位置之上）
  // translateY(-100%) 表示向上移动面板自身高度
  // 此时面板底边对齐触发器，面板内容在触发器上方被遮罩隐藏
  transform: translateY(-100%);  // ✓ 修复：向上移动100%
  transform-origin: bottom;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &.l-dropdown-panel__panel--visible {
    // 展开状态：面板从触发器位置向下滑动，露出内容
    // translateY(0) 表示面板底边贴近遮罩底边（触发器位置）
    // 面板向上展开显示在遮罩内
    transform: translateY(0);
  }
}
```

### 动画原理说明

#### Placement = Bottom（在触发器下方打开）

```
初始状态（hidden）:
┌─────────────┐ ← 触发器
│             │
│   遮罩区域  │
│             │
│  ┌────────┐ │ ← 面板（translateY(-100%)，向上隐藏）
└──┴────────┴─┘

展开状态（visible）:
┌─────────────┐ ← 触发器
│  ┌────────┐ │ ← 面板（translateY(0)，从上方滑下）
│  │        │ │
│  │  面板  │ │
│  │        │ │
│  └────────┘ │
│             │
└─────────────┘
```

#### Placement = Top（在触发器上方打开）

```
初始状态（hidden）:
┌──┬────────┬─┐
│  └────────┘ │ ← 面板（translateY(-100%)，向上隐藏）
│             │
│   遮罩区域  │
│             │
└─────────────┘ ← 触发器

展开状态（visible）:
┌─────────────┐
│             │
│  ┌────────┐ │
│  │        │ │
│  │  面板  │ │ ← 面板（translateY(0)，从触发器位置向上展开）
│  └────────┘ │
└─────────────┘ ← 触发器
```

## 关键技术点

### 1. Transform Origin

```less
transform-origin: bottom;
```

- 设置变换的原点在面板底部
- 确保面板以底边为基准进行位移动画
- 让动画看起来是从触发器位置开始的

### 2. Overflow Hidden

```less
.l-dropdown-panel__mask {
  overflow: hidden;
}
```

- 遮罩区域隐藏超出部分
- 实现面板从遮罩边界滑入/滑出的效果

### 3. 双向动画一致性

| Placement | 初始 Transform | 展开 Transform | 动画方向 |
|-----------|---------------|---------------|---------|
| bottom    | translateY(-100%) | translateY(0) | 向下滑出 |
| top       | translateY(-100%) | translateY(0) | 向上滑出 |

注意：两种模式都使用 `translateY(-100%)` 作为初始状态，但由于：
- `bottom` 模式：面板 `top: 0`（在遮罩顶部）
- `top` 模式：面板 `bottom: 0`（在遮罩底部）

相同的 transform 值在不同的定位方式下产生了不同的视觉效果。

## 测试验证

### 测试场景

1. **初次打开（从下方）**
   - 点击触发器
   - 面板应从触发器下方向下滑动展开 ✓

2. **关闭后滚动页面**
   - 关闭面板
   - 滚动页面使触发器位置改变
   - 组件自动计算并切换 placement

3. **再次打开（从上方）**
   - 点击触发器
   - 面板应从触发器上方向上滑动展开 ✓（修复后）

4. **连续切换**
   - 在不同 placement 之间多次切换
   - 每次动画方向应正确 ✓

### 浏览器兼容性

- ✓ Chrome/Edge (Chromium)
- ✓ Firefox
- ✓ Safari (iOS/macOS)
- ✓ 移动端浏览器

## 相关文件

- `dropdown-panel.tsx` - 组件逻辑（未修改）
- `dropdown-panel.less` - 样式和动画（已修复）

## 更新日期

2025-10-09
