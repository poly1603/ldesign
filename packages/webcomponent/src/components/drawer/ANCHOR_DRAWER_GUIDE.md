# 锚点抽屉 - 部分遮罩展开使用指南

## 📖 简介

锚点抽屉（Anchor Drawer）是一种特殊的抽屉模式，它可以从指定的元素位置向某个方向展开，并且**只在展开方向添加遮罩**，未展开的区域可以正常交互。

这种模式非常适合以下场景：
- 📱 移动端下拉菜单/筛选器
- 🛒 电商应用的商品分类、排序
- ⚙️ 设置面板
- 💬 上下文菜单
- 📊 数据面板展开

## 🎯 核心特性

### 1. **从点击位置展开**
抽屉会从触发按钮的位置展开，而不是从屏幕边缘展开。

### 2. **部分遮罩**
只在展开方向添加半透明遮罩，其他区域可以正常点击和交互。

### 3. **自动定位**
根据锚点元素的位置自动计算抽屉的展开位置。

### 4. **响应式跟随**
支持滚动跟随、窗口大小变化自动调整。

## 🚀 快速开始

### 基础用法

```html
<!-- 1. 创建触发按钮 -->
<button id="myButton">点击展开</button>

<!-- 2. 创建抽屉 -->
<ldesign-drawer 
  id="myDrawer"
  placement="bottom"
  anchor-mode="element"
  anchor-element="#myButton"
  anchor-mask-partial="true"
  drawer-title="向下展开"
>
  <div>抽屉内容</div>
</ldesign-drawer>

<!-- 3. JavaScript 控制 -->
<script>
  const button = document.getElementById('myButton');
  const drawer = document.getElementById('myDrawer');
  
  button.addEventListener('click', () => {
    drawer.open();
  });
</script>
```

## 📝 属性配置

### 必需属性

| 属性 | 说明 | 可选值 | 默认值 |
|------|------|--------|--------|
| `anchor-mode` | 启用锚点模式 | `element` / `cursor` / `disabled` | `disabled` |
| `placement` | 展开方向 | `top` / `bottom` / `left` / `right` | `right` |

### 锚点定位属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `anchor-element` | 锚点元素（选择器或元素对象） | `string \| HTMLElement` | - |
| `anchor-mask-partial` | 启用部分遮罩 | `boolean` | `false` |
| `anchor-align` | 对齐方式 | `start` / `center` / `end` / `auto` | `start` |
| `anchor-offset` | 偏移量 | `{ x?: number; y?: number }` | `{ x: 0, y: 0 }` |
| `anchor-flip` | 空间不足时自动翻转 | `boolean` | `true` |
| `anchor-constrain` | 约束在视口内 | `boolean` | `true` |
| `anchor-follow-scroll` | 跟随滚动 | `boolean` | `true` |
| `anchor-auto-update` | 自动更新位置 | `boolean` | `true` |

## 📐 展开方向说明

### Bottom（向下展开）
```html
<ldesign-drawer 
  placement="bottom"
  anchor-mode="element"
  anchor-element="#button"
  anchor-mask-partial="true"
>
```
- ✅ 抽屉从按钮**下方**展开到屏幕底部
- ✅ **下方区域**有遮罩
- ✅ 上方区域可以正常交互

**适用场景：** 顶部导航栏的下拉菜单、筛选器

### Top（向上展开）
```html
<ldesign-drawer 
  placement="top"
  anchor-mode="element"
  anchor-element="#button"
  anchor-mask-partial="true"
>
```
- ✅ 抽屉从按钮**上方**展开到屏幕顶部
- ✅ **上方区域**有遮罩
- ✅ 下方区域可以正常交互

**适用场景：** 底部工具栏的上拉面板

### Left（向左展开）
```html
<ldesign-drawer 
  placement="left"
  anchor-mode="element"
  anchor-element="#button"
  anchor-mask-partial="true"
>
```
- ✅ 抽屉从按钮**左侧**展开到屏幕左边
- ✅ **左侧区域**有遮罩
- ✅ 右侧区域可以正常交互

**适用场景：** 右侧侧边栏的展开菜单

### Right（向右展开）
```html
<ldesign-drawer 
  placement="right"
  anchor-mode="element"
  anchor-element="#button"
  anchor-mask-partial="true"
>
```
- ✅ 抽屉从按钮**右侧**展开到屏幕右边
- ✅ **右侧区域**有遮罩
- ✅ 左侧区域可以正常交互

**适用场景：** 左侧导航栏的详情面板

## 💡 实际应用示例

### 示例 1：电商筛选器

```html
<!-- 顶部筛选栏 -->
<div class="filter-bar">
  <button id="filter-category">全部商品 ▼</button>
  <button id="filter-sort">默认排序 ▼</button>
  <button id="filter-price">价格 ▼</button>
</div>

<!-- 分类筛选抽屉 -->
<ldesign-drawer 
  id="drawer-category"
  placement="bottom"
  anchor-mode="element"
  anchor-mask-partial="true"
  drawer-title="商品分类"
  size="auto"
>
  <div class="filter-options">
    <div class="option">全部商品</div>
    <div class="option">新款商品</div>
    <div class="option">活动商品</div>
  </div>
</ldesign-drawer>

<script>
  document.getElementById('filter-category').addEventListener('click', function() {
    const drawer = document.getElementById('drawer-category');
    drawer.anchorElement = this; // 动态设置锚点
    drawer.open();
  });
</script>
```

### 示例 2：购物车按钮

```html
<!-- 固定定位的购物车按钮 -->
<button id="cart-btn" class="cart-button">
  🛒 <span class="badge">3</span>
</button>

<!-- 购物车抽屉 -->
<ldesign-drawer 
  id="drawer-cart"
  placement="right"
  anchor-mode="element"
  anchor-element="#cart-btn"
  anchor-mask-partial="true"
  drawer-title="购物车"
  size="400px"
>
  <div class="cart-content">
    <!-- 购物车商品列表 -->
  </div>
</ldesign-drawer>

<script>
  document.getElementById('cart-btn').addEventListener('click', function() {
    const drawer = document.getElementById('drawer-cart');
    drawer.open();
  });
</script>
```

### 示例 3：移动端下拉菜单

```html
<button id="menu-btn">菜单</button>

<ldesign-drawer 
  id="menu-drawer"
  placement="bottom"
  anchor-mode="element"
  anchor-mask-partial="true"
  size="60%"
>
  <nav class="menu">
    <a href="#home">首页</a>
    <a href="#products">产品</a>
    <a href="#about">关于</a>
  </nav>
</ldesign-drawer>

<script>
  const menuBtn = document.getElementById('menu-btn');
  const menuDrawer = document.getElementById('menu-drawer');
  
  menuBtn.addEventListener('click', function() {
    menuDrawer.anchorElement = this;
    menuDrawer.open();
  });
</script>
```

## 🎨 对齐方式

使用 `anchor-align` 属性控制抽屉相对于锚点元素的对齐方式：

### Start（起始对齐）
```html
<ldesign-drawer anchor-align="start">
```
- **Bottom/Top:** 抽屉左边缘与按钮左边缘对齐
- **Left/Right:** 抽屉上边缘与按钮上边缘对齐

### Center（居中对齐）
```html
<ldesign-drawer anchor-align="center">
```
- **Bottom/Top:** 抽屉水平居中于按钮
- **Left/Right:** 抽屉垂直居中于按钮

### End（结束对齐）
```html
<ldesign-drawer anchor-align="end">
```
- **Bottom/Top:** 抽屉右边缘与按钮右边缘对齐
- **Left/Right:** 抽屉下边缘与按钮下边缘对齐

### Auto（自动对齐）
```html
<ldesign-drawer anchor-align="auto">
```
- 自动选择最佳对齐方式，优先居中，空间不足时自动调整

## 📏 尺寸设置

### 固定尺寸
```html
<ldesign-drawer size="400px">
<ldesign-drawer size="60%">
<ldesign-drawer size="50vh">
```

### 预设尺寸
```html
<ldesign-drawer size="sm">  <!-- 小 -->
<ldesign-drawer size="md">  <!-- 中 -->
<ldesign-drawer size="lg">  <!-- 大 -->
```

### 自动高度
```html
<ldesign-drawer size="auto">
```
抽屉高度自动适应内容，适合选项列表、菜单等场景。

## 🔧 高级配置

### 偏移量调整
```html
<ldesign-drawer 
  anchor-offset='{"x": 0, "y": 10}'
>
```
从锚点位置额外偏移 10px。

### 禁用自动翻转
```html
<ldesign-drawer 
  anchor-flip="false"
>
```
即使空间不足，也不自动翻转到相反方向。

### 禁用滚动跟随
```html
<ldesign-drawer 
  anchor-follow-scroll="false"
>
```
滚动页面时，抽屉不跟随锚点元素移动。

## 🎯 最佳实践

### 1. 动态设置锚点
```javascript
button.addEventListener('click', function() {
  drawer.anchorElement = this; // 推荐：动态设置
  drawer.open();
});
```

### 2. 响应式尺寸
```html
<!-- 移动端使用更大比例 -->
<ldesign-drawer 
  size="85%"
  @media="(min-width: 768px)"
  size="400px"
>
```

### 3. 合理的遮罩透明度
```css
/* 自定义遮罩样式 */
ldesign-drawer::part(mask) {
  background-color: rgba(0, 0, 0, 0.3);
}
```

### 4. 避免嵌套锚点抽屉
不建议在一个锚点抽屉内再打开另一个锚点抽屉，可能会导致遮罩和定位问题。

## 🐛 常见问题

### Q1: 抽屉位置不正确？
**A:** 确保锚点元素已经渲染完成，并且有正确的位置和尺寸。

```javascript
// 等待元素渲染后再打开
requestAnimationFrame(() => {
  drawer.anchorElement = button;
  drawer.open();
});
```

### Q2: 滚动时抽屉位置不跟随？
**A:** 确保 `anchor-follow-scroll` 设置为 `true`（默认值）。

### Q3: 遮罩覆盖了所有区域？
**A:** 确保 `anchor-mask-partial` 设置为 `true`。

```html
<ldesign-drawer anchor-mask-partial="true">
```

### Q4: 触发按钮被遮罩覆盖？
**A:** 这是正常的。部分遮罩只保留未展开方向的交互，触发按钮在展开方向，因此会被遮罩。

## 📊 性能优化

### 1. 懒加载内容
```html
<ldesign-drawer lazy-load="true">
```

### 2. 禁用不必要的动画
```html
<ldesign-drawer 
  animation="false"
  anchor-follow-scroll="false"
>
```

### 3. 使用 CSS Containment
```css
ldesign-drawer {
  contain: layout style paint;
}
```

## 🔗 相关链接

- [完整示例](../../demo/drawer-anchor-partial-mask.html)
- [API 文档](./readme.md)
- [Drawer 类型定义](./drawer.types.ts)
- [锚点定位工具](./drawer.anchor.ts)

## 📅 更新日志

- **2025-10-04** - 创建锚点抽屉部分遮罩使用指南

---

**现在就试试锚点抽屉吧！** 🎉
