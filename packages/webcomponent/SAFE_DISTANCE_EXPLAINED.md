# 安全距离 (Safe Distance) 功能说明

## 🎯 功能定义

**安全距离**：面板与遮罩边缘之间保持的最小距离。

- ✅ **正确理解**：面板不能触碰到遮罩的边缘
- ❌ **错误理解**：遮罩距离屏幕边缘的距离

## 📐 视觉示意

### 从下方弹出 (placement="bottom")

```
┌─────────────────────┐
│   触发器 [点击]     │
├─────────────────────┤ ← 遮罩顶部（触发器底部）
│                     │
│   ┌───────────┐     │
│   │ 面板内容  │     │
│   │           │     │
│   └───────────┘     │
│                     │
│   ↕ 16px (安全距离) │
├─────────────────────┤ ← 遮罩底部
└─────────────────────┘ ← 屏幕底部
```

### 从上方弹出 (placement="top")

```
┌─────────────────────┐ ← 屏幕顶部
├─────────────────────┤ ← 遮罩顶部
│                     │
│   ↕ 16px (安全距离) │
│                     │
│   ┌───────────┐     │
│   │ 面板内容  │     │
│   │           │     │
│   └───────────┘     │
│                     │
├─────────────────────┤ ← 遮罩底部（触发器顶部）
│   触发器 [点击]     │
└─────────────────────┘
```

## 🔧 工作原理

### 1. 遮罩区域计算

**从下方弹出**：
```javascript
遮罩区域 = 触发器底部 → 屏幕底部
遮罩高度 = window.innerHeight - triggerRect.bottom
```

**从上方弹出**：
```javascript
遮罩区域 = 屏幕顶部 → 触发器顶部
遮罩高度 = triggerRect.top
```

### 2. 面板可用空间

**关键公式**：
```javascript
面板可用空间 = 遮罩高度 - 安全距离
```

**示例**：
- 遮罩高度：400px
- 安全距离：16px
- 面板最大高度：400px - 16px = 384px

### 3. 实际实现

通过 CSS `padding` 实现安全距离：

**从下方弹出**：
```css
.mask {
  top: [触发器底部];
  bottom: 0;
  padding-bottom: 16px; /* 安全距离 */
}
```

**从上方弹出**：
```css
.mask {
  top: 0;
  bottom: [触发器顶部];
  padding-top: 16px; /* 安全距离 */
}
```

## 💡 使用场景

### 1. 默认使用（16px 安全距离）

```html
<l-dropdown-panel>
  <div slot="trigger">
    <button>点击我</button>
  </div>
  <div>
    <!-- 面板内容 -->
  </div>
</l-dropdown-panel>
```

效果：面板与屏幕底部/顶部保持 16px 距离

### 2. 自定义安全距离

```html
<!-- 更大的安全距离（32px） -->
<l-dropdown-panel safe-distance="32">
  <div slot="trigger">
    <button>更大边距</button>
  </div>
  <div>面板内容</div>
</l-dropdown-panel>
```

### 3. 无安全距离（贴边显示）

```html
<!-- 面板可以延伸到屏幕边缘 -->
<l-dropdown-panel safe-distance="0">
  <div slot="trigger">
    <button>贴边显示</button>
  </div>
  <div>面板内容</div>
</l-dropdown-panel>
```

### 4. 适配底部导航栏

```html
<!-- 避开 60px 高的底部导航 -->
<l-dropdown-panel safe-distance="60">
  <div slot="trigger">
    <button>筛选</button>
  </div>
  <div>
    <!-- 面板不会覆盖底部导航 -->
  </div>
</l-dropdown-panel>
```

## 📊 计算示例

### 示例 1：从下方弹出

**场景**：
- 屏幕高度：800px
- 触发器位置：top=100px, bottom=150px
- 安全距离：16px
- 用户设置 max-height：60vh (480px)

**计算过程**：
```javascript
// 1. 遮罩高度
maskHeight = 800 - 150 = 650px

// 2. 面板可用空间
availableSpace = 650 - 16 = 634px

// 3. 实际面板高度
panelMaxHeight = min(634px, 480px) = 480px
```

**结果**：面板高度为 480px，距离屏幕底部 16px

### 示例 2：从上方弹出

**场景**：
- 屏幕高度：800px
- 触发器位置：top=700px, bottom=750px
- 安全距离：20px
- 用户设置 max-height：50vh (400px)

**计算过程**：
```javascript
// 1. 遮罩高度
maskHeight = 700px

// 2. 面板可用空间
availableSpace = 700 - 20 = 680px

// 3. 实际面板高度
panelMaxHeight = min(680px, 400px) = 400px
```

**结果**：面板高度为 400px，距离屏幕顶部 20px

### 示例 3：空间不足时自动限制

**场景**：
- 屏幕高度：800px
- 触发器位置：top=700px, bottom=750px
- 安全距离：16px
- 用户设置 max-height：60vh (480px)

**计算过程**：
```javascript
// 1. 遮罩高度（触发器靠近底部）
maskHeight = 800 - 750 = 50px

// 2. 面板可用空间
availableSpace = 50 - 16 = 34px

// 3. 实际面板高度（被限制）
panelMaxHeight = min(34px, 480px) = 34px

// 4. 空间不足，触发智能降级
// 检查上方空间：700 - 16 = 684px > 34px
// 自动切换为从上方弹出
actualPlacement = 'top'
```

**结果**：自动切换方向，从上方弹出，面板高度 480px

## 🎨 不同安全距离的视觉对比

### safe-distance="0" (无安全距离)
```
├─────────────────────┤ ← 遮罩顶部
│   ┌───────────┐     │
│   │ 面板内容  │     │
│   └───────────┘     │ ← 面板底部紧贴遮罩底部
├─────────────────────┤ ← 遮罩底部
└─────────────────────┘ ← 屏幕底部
```

### safe-distance="16" (默认)
```
├─────────────────────┤ ← 遮罩顶部
│   ┌───────────┐     │
│   │ 面板内容  │     │
│   └───────────┘     │
│   ↕ 16px            │ ← 安全距离
├─────────────────────┤ ← 遮罩底部
└─────────────────────┘ ← 屏幕底部
```

### safe-distance="32" (较大)
```
├─────────────────────┤ ← 遮罩顶部
│   ┌───────────┐     │
│   │ 面板内容  │     │
│   └───────────┘     │
│                     │
│   ↕ 32px            │ ← 安全距离
│                     │
├─────────────────────┤ ← 遮罩底部
└─────────────────────┘ ← 屏幕底部
```

## ✨ 配合其他属性使用

### 1. 配合 max-height

```html
<l-dropdown-panel max-height="70vh" safe-distance="20">
  <div slot="trigger">
    <button>筛选器</button>
  </div>
  <div>
    <!-- 面板最高 70vh，但会扣除 20px 安全距离 -->
    <!-- 实际可用：min(70vh, 遮罩高度 - 20px) -->
  </div>
</l-dropdown-panel>
```

### 2. 配合 placement

```html
<!-- 优先向下，但保持 24px 距离 -->
<l-dropdown-panel placement="bottom" safe-distance="24">
  <div slot="trigger">
    <button>向下弹出</button>
  </div>
  <div>面板内容</div>
</l-dropdown-panel>
```

### 3. 配合 auto 模式

```html
<!-- 自动选择方向，保持 12px 距离 -->
<l-dropdown-panel placement="auto" safe-distance="12">
  <div slot="trigger">
    <button>智能弹出</button>
  </div>
  <div>面板内容</div>
</l-dropdown-panel>
```

## 🔍 调试技巧

### 查看实际生效的值

打开浏览器开发者工具，检查遮罩元素：

```html
<!-- 从下方弹出 -->
<div class="l-dropdown-panel__mask" style="
  top: 150px;
  bottom: 0;
  padding-bottom: 16px;  ← 安全距离
">
  <div class="l-dropdown-panel__panel" style="
    max-height: 634px;  ← 遮罩高度(650px) - 安全距离(16px)
  ">
    <!-- 面板内容 -->
  </div>
</div>
```

### 测试不同安全距离

```javascript
// 在控制台动态修改
const panel = document.querySelector('l-dropdown-panel');
panel.safeDistance = 32; // 改为 32px
panel.toggle(); // 重新打开查看效果
```

## 📝 总结

**安全距离的作用**：
1. ✅ 防止面板内容紧贴屏幕边缘
2. ✅ 提供视觉呼吸空间
3. ✅ 避免覆盖底部导航等固定元素
4. ✅ 提升用户体验

**推荐值**：
- 默认场景：16px
- 有底部导航：导航高度 + 8px
- 需要更多空间：24-32px
- 贴边显示：0px

---

**版本**: v1.0.3  
**更新**: 2025-10-09  
**作者**: LDesign Team
