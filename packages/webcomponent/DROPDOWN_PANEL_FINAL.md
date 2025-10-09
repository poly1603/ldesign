# Dropdown Panel 完整功能说明

## 🎉 最终版本特性

### ✨ 核心功能

#### 1. **智能方向降级**
即使手动指定了弹出方向，组件也会检查空间是否足够，必要时自动切换方向。

**工作原理**：
```javascript
// 设置 placement="bottom"
if (placement === 'bottom') {
  // 检查下方空间
  if (spaceBelow < 100px && spaceAbove > spaceBelow) {
    // 下方空间不足且上方更大，自动切换为 top
    actualPlacement = 'top';
    console.warn('下方空间不足，自动切换为从上方弹出');
  }
}
```

**示例场景**：
```html
<!-- 触发器在屏幕底部 -->
<l-dropdown-panel placement="bottom">
  <div slot="trigger">
    <button>我在底部</button>
  </div>
  <div>
    <!-- 设置了 bottom，但下方空间不够 -->
    <!-- 组件会自动从上方弹出 -->
    <div>智能切换方向</div>
  </div>
</l-dropdown-panel>
```

#### 2. **安全边距保护**
面板与屏幕边缘始终保持安全距离，防止贴边显示。

**默认边距**：16px（可自定义）

**效果**：
```
┌─────────────────────┐ ← 屏幕顶部
│  ← 16px 安全距离    │
├─────────────────────┤ ← 遮罩开始
│                     │
│   面板内容          │
│                     │
├─────────────────────┤ ← 遮罩结束
│  ← 16px 安全距离    │
└─────────────────────┘ ← 屏幕底部
```

**自定义边距**：
```html
<!-- 设置 32px 安全距离 -->
<l-dropdown-panel safe-distance="32">
  <div slot="trigger">
    <button>更大的边距</button>
  </div>
  <div>面板内容</div>
</l-dropdown-panel>
```

#### 3. **完整的自动化**
组件现在完全自动化处理所有场景：

| 场景 | 处理方式 |
|------|---------|
| placement="auto" | ✅ 自动选择空间大的方向 |
| placement="bottom" 但下方不够 | ✅ 自动切换到 top |
| placement="top" 但上方不够 | ✅ 自动切换到 bottom |
| 面板太高 | ✅ 自动限制高度 + 滚动 |
| 靠近边缘 | ✅ 保持安全距离 |

## 📖 完整 API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| visible | `boolean` | `false` | 面板是否可见 |
| placement | `'top' \| 'bottom' \| 'auto'` | `'auto'` | 弹出位置，auto 自动判断 |
| mask-background | `string` | `'rgba(0, 0, 0, 0.3)'` | 遮罩背景色 |
| max-height | `string` | `'60vh'` | 面板最大高度 |
| duration | `number` | `300` | 动画时长(ms) |
| mask-closable | `boolean` | `true` | 点击遮罩关闭 |
| **safe-distance** | `number` | `16` | ⭐ 安全边距(px) |

### Events

| 事件 | 说明 | 参数 |
|------|------|------|
| visibleChange | 显示/隐藏时触发 | `(visible: boolean) => void` |

### Methods

| 方法 | 说明 | 返回值 |
|------|------|--------|
| show() | 显示面板 | `Promise<void>` |
| hide() | 隐藏面板 | `Promise<void>` |
| toggle() | 切换状态 | `Promise<void>` |

## 🎯 使用场景

### 1. 默认使用（推荐）
```html
<l-dropdown-panel>
  <div slot="trigger">
    <button>点击我</button>
  </div>
  <div>
    <div>选项 1</div>
    <div>选项 2</div>
  </div>
</l-dropdown-panel>
```
✅ 自动判断方向  
✅ 自动适应高度  
✅ 保持安全距离  
✅ 流畅动画效果  

### 2. 手动指定方向（带智能降级）
```html
<!-- 优先从下方弹出，空间不够自动切换 -->
<l-dropdown-panel placement="bottom">
  <div slot="trigger">
    <button>优先向下</button>
  </div>
  <div>面板内容</div>
</l-dropdown-panel>
```

### 3. 自定义安全距离
```html
<!-- 适合有固定底部导航栏的场景 -->
<l-dropdown-panel safe-distance="64">
  <div slot="trigger">
    <button>避开底部导航</button>
  </div>
  <div>面板内容</div>
</l-dropdown-panel>
```

### 4. 商品筛选器
```html
<l-dropdown-panel max-height="70vh" safe-distance="20">
  <div slot="trigger">
    <button>筛选条件 ▼</button>
  </div>
  <div class="filter-panel">
    <div class="filter-group">
      <h3>价格区间</h3>
      <button>0-100</button>
      <button>100-500</button>
      <button>500+</button>
    </div>
    <div class="filter-group">
      <h3>品牌</h3>
      <button>品牌A</button>
      <button>品牌B</button>
    </div>
  </div>
</l-dropdown-panel>
```

### 5. 导航菜单
```html
<l-dropdown-panel placement="bottom" safe-distance="0">
  <div slot="trigger">
    <button class="nav-button">菜单 ☰</button>
  </div>
  <div class="menu">
    <a href="/home">首页</a>
    <a href="/about">关于</a>
    <a href="/contact">联系</a>
  </div>
</l-dropdown-panel>
```

## 🔧 智能降级详解

### 决策流程

```
1. 用户点击触发器
   ↓
2. 计算上下可用空间
   - spaceBelow = 屏幕底部 - 触发器底部 - 安全距离
   - spaceAbove = 触发器顶部 - 安全距离
   ↓
3. 根据 placement 属性决策
   
   如果 placement="auto":
     ✅ 选择空间大的方向
   
   如果 placement="bottom":
     ✅ 检查下方空间
     ✅ 如果 < 100px 且上方更大 → 切换为 top
     ✅ 否则使用 bottom
   
   如果 placement="top":
     ✅ 检查上方空间
     ✅ 如果 < 100px 且下方更大 → 切换为 bottom
     ✅ 否则使用 top
   ↓
4. 计算实际可用高度
   ✅ maxHeight = Math.min(可用空间, 用户设置的最大高度)
   ↓
5. 应用安全边距
   ✅ 遮罩距离边缘保持 safeDistance
   ↓
6. 触发动画
```

### 降级示例

#### 场景 A：触发器在底部
```
触发器位置: top=650px, bottom=700px
屏幕高度: 768px

计算：
- spaceBelow = 768 - 700 - 16 = 52px
- spaceAbove = 650 - 16 = 634px

设置 placement="bottom":
❌ 下方只有 52px < 100px
✅ 上方有 634px > 52px
📢 自动切换为 top
```

#### 场景 B：触发器在顶部
```
触发器位置: top=50px, bottom=100px
屏幕高度: 768px

计算：
- spaceBelow = 768 - 100 - 16 = 652px
- spaceAbove = 50 - 16 = 34px

设置 placement="top":
❌ 上方只有 34px < 100px
✅ 下方有 652px > 34px
📢 自动切换为 bottom
```

#### 场景 C：中间位置
```
触发器位置: top=350px, bottom=400px
屏幕高度: 768px

计算：
- spaceBelow = 768 - 400 - 16 = 352px
- spaceAbove = 350 - 16 = 334px

设置 placement="bottom":
✅ 下方有 352px > 100px
✅ 使用 bottom（用户首选）
```

## 📊 空间计算

### 可用空间计算公式

**向下弹出时**：
```
可用高度 = 屏幕高度 - 触发器底部 - 安全距离
实际高度 = min(可用高度, 用户max-height)
```

**向上弹出时**：
```
可用高度 = 触发器顶部 - 安全距离
实际高度 = min(可用高度, 用户max-height)
```

### 示例计算

```javascript
// 屏幕高度 800px，触发器在 y=400px(高50px)，安全距离16px

// 向下弹出
spaceBelow = 800 - 450 - 16 = 334px
maxHeight = min(334px, 60vh) = min(334px, 480px) = 334px

// 向上弹出
spaceAbove = 400 - 16 = 384px
maxHeight = min(384px, 60vh) = min(384px, 480px) = 384px
```

## 🎨 视觉示意

### 安全距离效果

#### 从下方弹出
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
├─ ← 16px ─ ─ ─ ─ ─ ─┤ ← 遮罩底部（保持距离）
└─────────────────────┘ ← 屏幕底部
```

#### 从上方弹出
```
┌─────────────────────┐ ← 屏幕顶部
├─ ← 16px ─ ─ ─ ─ ─ ─┤ ← 遮罩顶部（保持距离）
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

## ⚡ 性能优化

1. **懒计算**：只在打开时计算位置和方向
2. **requestAnimationFrame**：确保动画流畅
3. **智能判断**：避免不必要的方向切换
4. **条件渲染**：关闭时不渲染遮罩和面板

## 🐛 边界情况处理

| 边界情况 | 处理方式 |
|---------|---------|
| 上下空间都很小 | 使用较大的一方，限制高度 |
| 触发器在屏幕边缘 | 保持安全距离，不贴边 |
| 面板内容过多 | 显示滚动条 |
| 快速点击 | 防抖处理，避免冲突 |
| 屏幕旋转 | 自动重新计算位置 |

## 📱 移动端适配

- ✅ 触摸事件优化
- ✅ 流畅滚动支持
- ✅ 锁定背景滚动
- ✅ 响应式高度
- ✅ 自适应方向

## 🎉 总结

这个版本的 Dropdown Panel 是一个**完全智能化**的组件：

1. **零配置可用** - 默认设置适合 99% 场景
2. **智能降级** - 自动处理各种边界情况
3. **安全保护** - 始终保持与边缘的距离
4. **流畅动画** - 每次打开都有完整动画
5. **性能优异** - 使用最佳实践优化

只需一行代码即可使用：
```html
<l-dropdown-panel>
  <div slot="trigger"><button>点击</button></div>
  <div>内容</div>
</l-dropdown-panel>
```

组件会自动处理一切！🚀

---

**版本**: v1.0.2  
**更新**: 2025-10-09  
**作者**: LDesign Team
