# 翻转位置 Bug 修复

## 问题描述

当用户点击锚点部分遮罩抽屉按钮时，出现以下错误：

```
Uncaught (in promise) TypeError: anchorElement.getBoundingClientRect is not a function
```

### 错误堆栈
```
at getElementBounds (drawer.anchor.ts:39)
at calculateAnchorPosition (drawer.anchor.ts:150)
at tryFlipPosition (drawer.anchor.ts:390)
at calculateAnchorPosition (drawer.anchor.ts:271)
at setupAnchorPositioning (drawer.tsx:1417)
at handleOpen (drawer.tsx:?)
```

## 根本原因

在 `drawer.anchor.ts` 的 `tryFlipPosition` 函数中（第386-397行），存在一个严重的 bug：

### 问题代码

```typescript
function tryFlipPosition(
  position: AnchorPosition,
  anchorBounds: ElementBounds,  // ❌ 只传入了边界对象，没有传入元素引用
  boundaryBounds: ElementBounds,
  drawerSize: { width: number; height: number },
  config: AnchorConfig
): AnchorPosition {
  // ...
  
  if (shouldFlip) {
    const flippedConfig = { ...config, placement: flippedPlacement, flip: false };
    return calculateAnchorPosition(
      // ❌ 问题：试图通过坐标查找元素，但这个选择器不存在
      document.querySelector(`[data-anchor-id="${anchorBounds.centerX}-${anchorBounds.centerY}"]`) as HTMLElement 
      || anchorBounds as any,  // ❌ 后备方案更糟：把对象当作 HTMLElement 传入！
      drawerSize,
      flippedConfig
    );
  }
}
```

### 问题分析

1. **参数缺失**：`tryFlipPosition` 函数只接收 `anchorBounds`（边界对象），没有接收原始的 `anchorElement`（DOM 元素）

2. **错误的查询逻辑**：
   ```typescript
   document.querySelector(`[data-anchor-id="${anchorBounds.centerX}-${anchorBounds.centerY}"]`)
   ```
   - 试图通过坐标查找一个带有 `data-anchor-id` 属性的元素
   - 但这个属性从未被设置，查询永远返回 `null`

3. **危险的后备方案**：
   ```typescript
   || anchorBounds as any
   ```
   - 当查询失败时，直接把 `anchorBounds` 对象当作 `HTMLElement` 传入
   - `anchorBounds` 是一个普通对象 `{ top, left, width, height, ... }`
   - 它没有 `getBoundingClientRect()` 方法
   - 导致 `TypeError: getBoundingClientRect is not a function`

4. **递归翻转风险**：
   - `flip: false` 被设置来防止递归
   - 但如果翻转后的位置仍然溢出，可能导致问题

## 解决方案

修改 `tryFlipPosition` 函数，传递原始的 `anchorElement` 引用，并添加防止递归翻转的机制。

### 修复 1: 添加内部跳过翻转参数

**文件：** `drawer.anchor.ts`

```typescript
export function calculateAnchorPosition(
  anchorElement: HTMLElement,
  drawerSize: { width: number; height: number },
  config: AnchorConfig,
  _skipFlip: boolean = false  // ✅ 新增：内部参数，防止递归翻转
): AnchorPosition {
  // ...
  
  // 自动翻转位置（如果启用）
  if (config.flip && !_skipFlip) {  // ✅ 添加 !_skipFlip 检查
    position = tryFlipPosition(
      position,
      anchorElement,  // ✅ 传递原始元素
      anchorBounds,
      boundaryBounds,
      drawerSize,
      config
    );
  }
  
  // ...
}
```

### 修复 2: 传递 anchorElement 到 tryFlipPosition

```typescript
function tryFlipPosition(
  position: AnchorPosition,
  anchorElement: HTMLElement,  // ✅ 新增参数：原始锚点元素
  anchorBounds: ElementBounds,
  boundaryBounds: ElementBounds,
  drawerSize: { width: number; height: number },
  config: AnchorConfig
): AnchorPosition {
  const { placement } = position;
  let shouldFlip = false;
  let flippedPlacement: DrawerPlacement = placement;
  
  // 检查是否需要翻转
  switch (placement) {
    case 'top':
      if (position.top < boundaryBounds.top) {
        shouldFlip = true;
        flippedPlacement = 'bottom';
      }
      break;
    case 'bottom':
      if (position.top + drawerSize.height > boundaryBounds.bottom) {
        shouldFlip = true;
        flippedPlacement = 'top';
      }
      break;
    case 'left':
      if (position.left < boundaryBounds.left) {
        shouldFlip = true;
        flippedPlacement = 'right';
      }
      break;
    case 'right':
      if (position.left + drawerSize.width > boundaryBounds.right) {
        shouldFlip = true;
        flippedPlacement = 'left';
      }
      break;
  }
  
  // 如果需要翻转，重新计算位置
  if (shouldFlip) {
    const flippedConfig = { ...config, placement: flippedPlacement };
    // ✅ 使用原始的 anchorElement，并设置 _skipFlip 为 true 防止递归翻转
    return calculateAnchorPosition(
      anchorElement,        // ✅ 使用真正的 DOM 元素
      drawerSize,
      flippedConfig,
      true                  // ✅ 跳过进一步的翻转检查
    );
  }
  
  return position;
}
```

## 工作原理

### 修复前的调用链（错误）

```
calculateAnchorPosition(anchorElement, ...)
  ↓
tryFlipPosition(anchorBounds, ...)  ← 丢失了 anchorElement！
  ↓
calculateAnchorPosition(null || anchorBounds, ...)  ← 传入了错误的对象！
  ↓
getElementBounds(anchorBounds, ...)  ← anchorBounds 不是 HTMLElement
  ↓
anchorBounds.getBoundingClientRect()  ← ❌ TypeError！
```

### 修复后的调用链（正确）

```
calculateAnchorPosition(anchorElement, ..., _skipFlip=false)
  ↓
tryFlipPosition(anchorElement, anchorBounds, ...)  ← 保留了 anchorElement
  ↓ (如果需要翻转)
calculateAnchorPosition(anchorElement, ..., _skipFlip=true)  ← 传入正确的元素，跳过递归翻转
  ↓
getElementBounds(anchorElement, ...)  ← anchorElement 是真正的 HTMLElement
  ↓
anchorElement.getBoundingClientRect()  ← ✅ 正常工作！
```

## 防止递归翻转

添加 `_skipFlip` 参数的原因：

1. **第一次调用**：`_skipFlip = false`（默认），允许翻转
2. **翻转后调用**：`_skipFlip = true`，防止再次翻转

### 为什么需要防止递归？

假设场景：
- 向下展开的抽屉溢出底部边界
- 翻转为向上展开
- 但向上展开又溢出顶部边界
- 如果没有 `_skipFlip`，会再次翻转回向下，形成无限循环

### 解决方案

```typescript
if (config.flip && !_skipFlip) {  // 只在第一次计算时翻转
  position = tryFlipPosition(...);
}
```

翻转后的调用：
```typescript
calculateAnchorPosition(
  anchorElement,
  drawerSize,
  flippedConfig,
  true  // _skipFlip = true，不再进行翻转检查
);
```

## 影响范围

### 修复的功能
- ✅ 锚点定位功能现在可以正常工作
- ✅ 翻转逻辑正确执行（当抽屉溢出边界时）
- ✅ 所有方向（上、下、左、右）均正常
- ✅ 部分遮罩模式正常工作

### 不影响的功能
- ✅ 普通抽屉模式不受影响
- ✅ 非锚点模式不受影响
- ✅ 其他组件功能完全正常

## 测试验证

### 测试步骤

1. **打开文档页面**
   ```
   packages/webcomponent/docs/components/drawer.md
   ```

2. **测试锚点部分遮罩**
   - 点击"向下展开 ▼"按钮
   - 点击"向上展开 ▲"按钮
   - 点击"向左展开 ◀"按钮
   - 点击"向右展开 ▶"按钮

3. **测试翻转功能**
   - 在靠近屏幕顶部时点击"向上展开"，应该自动翻转为向下
   - 在靠近屏幕底部时点击"向下展开"，应该自动翻转为向上
   - 在靠近屏幕左侧时点击"向左展开"，应该自动翻转为向右
   - 在靠近屏幕右侧时点击"向右展开"，应该自动翻转为向左

### 预期结果

✅ **正确的表现：**
- 点击按钮后抽屉正常打开
- 没有控制台错误
- 抽屉显示在正确的位置
- 如果溢出边界，自动翻转到相反方向
- 遮罩只覆盖展开方向

❌ **修复前的错误：**
- 点击按钮后报错 `TypeError: getBoundingClientRect is not a function`
- 抽屉无法打开
- 控制台显示错误堆栈

## 技术细节

### getBoundingClientRect() 方法

这是一个标准的 DOM API，用于获取元素的位置和尺寸：

```typescript
const rect = element.getBoundingClientRect();
// 返回：
// {
//   top: number,      // 元素顶部相对于视口顶部的距离
//   left: number,     // 元素左侧相对于视口左侧的距离
//   right: number,    // 元素右侧相对于视口左侧的距离
//   bottom: number,   // 元素底部相对于视口顶部的距离
//   width: number,    // 元素宽度
//   height: number    // 元素高度
// }
```

**关键点**：这个方法只存在于 `HTMLElement` 对象上，普通 JavaScript 对象没有这个方法。

### TypeScript 类型检查的局限

虽然使用了 TypeScript，但以下代码绕过了类型检查：

```typescript
// ❌ 危险：强制类型转换
anchorBounds as any
```

`as any` 告诉 TypeScript "信任我，这是正确的类型"，跳过类型检查。这在运行时仍然会出错。

**教训**：避免使用 `as any`，除非你完全确定类型是正确的。

## 相关修复

这个 bug 修复是锚点部分遮罩功能完整修复的一部分，相关的其他修复包括：

1. **坐标系统修复** - `ANCHOR_PARTIAL_MASK_POSITIONING_FIX.md`
   - 支持视口和文档两种坐标系统
   - 修复遮罩位置计算

2. **抽屉尺寸修复** - `ANCHOR_PARTIAL_MASK_POSITIONING_FIX.md`
   - 部分遮罩模式下自动铺满展开区域
   - 四个方向的尺寸计算

3. **翻转位置修复** - 本文档
   - 修复 anchorElement 引用丢失
   - 防止递归翻转

## 总结

这次修复解决了锚点定位翻转功能中的一个严重 bug：

- **问题**：`tryFlipPosition` 函数丢失了 `anchorElement` 引用，导致传入错误的对象类型
- **影响**：点击锚点按钮时报错，抽屉无法打开
- **解决**：传递正确的 `anchorElement` 引用，并添加防递归机制
- **结果**：锚点定位和翻转功能现在完全正常工作

修复后，锚点部分遮罩功能在所有场景下都能正常工作：
- ✅ 基础锚点定位
- ✅ 部分遮罩显示
- ✅ 自动翻转（防止溢出）
- ✅ 四个方向展开
- ✅ 抽屉铺满区域
