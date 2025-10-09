# 锚点部分遮罩抽屉按钮修复

## 问题描述

在 `drawer.md` 文档的"锚点定位 - 部分遮罩展开"示例中，四个方向的展开按钮存在问题，无法正常打开对应的抽屉。

### 受影响的按钮

```html
<button id="anchorPartialBtn1">向下展开 ▼</button>
<button id="anchorPartialBtn2">向上展开 ▲</button>
<button id="anchorPartialBtn3">向左展开 ◀</button>
<button id="anchorPartialBtn4">向右展开 ▶</button>
```

## 问题原因

### 1. 重复的事件绑定

按钮同时使用了两种事件绑定方式：

**方式一：内联 onclick 属性**（第1167-1170行，修复前）
```html
<button id="anchorPartialBtn1" onclick="openAnchorPartialDrawer('bottom', this)">向下展开 ▼</button>
```

**方式二：JavaScript 事件监听器**（第97-135行）
```javascript
addEventListenerSafe(anchorPartialBtn1, 'click', function() {
  const drawer = document.getElementById('anchorPartialDrawerBottom')
  if (drawer) {
    drawer.anchorElement = this
    drawer.open()
  }
})
```

### 2. 冗余的全局函数

定义了一个 `openAnchorPartialDrawer` 全局函数（第27-125行，修复前），但这个函数：
- 功能与事件监听器重复
- 包含大量调试代码
- 实际上不再被使用（移除 onclick 后）

### 3. 可能的冲突

两种绑定方式可能导致：
- 同一个按钮点击时触发两次
- 事件处理顺序不确定
- 状态管理混乱

## 解决方案

### 修复 1：移除内联 onclick 属性

**文件：** `drawer.md`，第1165-1172行

**修改前：**
```html
<div class="demo-container">
  <div class="demo-row">
    <button id="anchorPartialBtn1" style="margin: 5px;" onclick="openAnchorPartialDrawer('bottom', this)">向下展开 ▼</button>
    <button id="anchorPartialBtn2" style="margin: 5px;" onclick="openAnchorPartialDrawer('top', this)">向上展开 ▲</button>
    <button id="anchorPartialBtn3" style="margin: 5px;" onclick="openAnchorPartialDrawer('left', this)">向左展开 ◀</button>
    <button id="anchorPartialBtn4" style="margin: 5px;" onclick="openAnchorPartialDrawer('right', this)">向右展开 ▶</button>
  </div>
</div>
```

**修改后：**
```html
<div class="demo-container">
  <div class="demo-row">
    <button id="anchorPartialBtn1" style="margin: 5px;">向下展开 ▼</button>
    <button id="anchorPartialBtn2" style="margin: 5px;">向上展开 ▲</button>
    <button id="anchorPartialBtn3" style="margin: 5px;">向左展开 ◀</button>
    <button id="anchorPartialBtn4" style="margin: 5px;">向右展开 ▶</button>
  </div>
</div>
```

### 修复 2：删除冗余的全局函数

**文件：** `drawer.md`，第26-125行（修复前）

删除了整个 `openAnchorPartialDrawer` 函数定义，包括：
- 函数体（99行代码）
- 调试日志
- DOM 检查代码

这些功能已经被事件监听器正确实现了。

## 工作原理

修复后，按钮的工作流程如下：

1. **页面加载时**（onMounted 钩子）：
   ```javascript
   setTimeout(() => {
     const anchorPartialBtn1 = document.getElementById('anchorPartialBtn1')
     // ... 获取其他按钮
     
     addEventListenerSafe(anchorPartialBtn1, 'click', function() {
       const drawer = document.getElementById('anchorPartialDrawerBottom')
       if (drawer) {
         drawer.anchorElement = this  // 设置锚点为当前按钮
         drawer.open()                // 打开抽屉
       }
     })
     // ... 绑定其他按钮
   }, 500)
   ```

2. **用户点击按钮时**：
   - 触发事件监听器
   - 设置抽屉的 `anchorElement` 属性为当前按钮
   - 调用抽屉的 `open()` 方法
   - 抽屉从按钮位置向指定方向展开

3. **抽屉显示**：
   - 根据 `placement` 属性确定展开方向
   - 根据 `anchorElement` 计算位置
   - 因为 `anchor-mask-partial="true"`，只在展开方向显示遮罩

## 对应的抽屉元素

这四个按钮对应的抽屉定义在文档的第2490-2557行：

```html
<!-- 向下展开 -->
<ldesign-drawer 
  id="anchorPartialDrawerBottom"
  placement="bottom"
  anchor-mode="element"
  anchor-mask-partial="true"
  drawer-title="向下展开"
  size="300px"
  animation="true">
  <!-- 内容 -->
</ldesign-drawer>

<!-- 向上展开 -->
<ldesign-drawer 
  id="anchorPartialDrawerTop"
  placement="top"
  anchor-mode="element"
  anchor-mask-partial="true"
  drawer-title="向上展开"
  size="300px"
  animation="true">
  <!-- 内容 -->
</ldesign-drawer>

<!-- 向左展开 -->
<ldesign-drawer 
  id="anchorPartialDrawerLeft"
  placement="left"
  anchor-mode="element"
  anchor-mask-partial="true"
  drawer-title="向左展开"
  size="320px"
  animation="true">
  <!-- 内容 -->
</ldesign-drawer>

<!-- 向右展开 -->
<ldesign-drawer 
  id="anchorPartialDrawerRight"
  placement="right"
  anchor-mode="element"
  anchor-mask-partial="true"
  drawer-title="向右展开"
  size="320px"
  animation="true">
  <!-- 内容 -->
</ldesign-drawer>
```

## 核心属性说明

| 属性 | 值 | 说明 |
|------|------|------|
| `anchor-mode` | `"element"` | 启用锚点定位模式 |
| `anchor-element` | `HTMLElement` | 通过 JS 动态设置为按钮元素 |
| `anchor-mask-partial` | `true` | 启用部分遮罩（只在展开方向显示） |
| `placement` | `"top"/"bottom"/"left"/"right"` | 展开方向 |

## 验证方法

1. **在浏览器中打开文档**
2. **找到"锚点定位 - 部分遮罩展开"章节**
3. **依次点击四个按钮**：
   - 向下展开 ▼
   - 向上展开 ▲
   - 向左展开 ◀
   - 向右展开 ▶

4. **验证预期效果**：
   - ✅ 抽屉从按钮位置向指定方向展开
   - ✅ 只在展开方向有遮罩层
   - ✅ 未展开的区域保持透明且可交互
   - ✅ 抽屉对齐到按钮边缘

5. **检查控制台**：
   - 应该看到 "Button X clicked!" 的日志
   - 应该看到 "Drawer xxx:" 的日志
   - 不应该有错误信息

## 影响范围

### 修复的功能
- ✅ 四个锚点部分遮罩展开按钮现在可以正常工作
- ✅ 移除了重复的事件绑定，避免冲突
- ✅ 代码更简洁，更易维护

### 不影响的功能
- ✅ 其他抽屉示例保持不变
- ✅ 其他按钮的事件绑定不受影响
- ✅ 抽屉组件本身的功能完全正常

## 最佳实践

基于这次修复，推荐的按钮绑定方式：

```javascript
// ✅ 推荐：使用事件监听器
addEventListenerSafe(button, 'click', function() {
  drawer.anchorElement = this  // 使用 function() 而非箭头函数，以保留 this
  drawer.open()
})

// ❌ 不推荐：内联 onclick
<button onclick="openDrawer()">打开</button>

// ❌ 不推荐：箭头函数（无法正确获取 this）
button.addEventListener('click', () => {
  drawer.anchorElement = button  // 必须显式指定 button
  drawer.open()
})
```

## 相关文件

- `drawer.md` - 组件文档（已修复）
- `drawer.tsx` - 抽屉组件源码（无需修改）

## 总结

这是一个典型的事件绑定冲突问题：
1. **问题**：同一个按钮使用了内联 onclick 和事件监听器两种绑定方式
2. **原因**：代码重构过程中保留了旧的内联代码
3. **修复**：移除内联 onclick，保留更现代和灵活的事件监听器方式
4. **收益**：代码更简洁，功能正常，易于维护

修复后，锚点部分遮罩展开功能将正常工作，为用户提供更好的交互体验。
