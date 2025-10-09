# Dropdown Panel 下拉面板

移动端下拉面板组件，从触发元素的上方或下方滑出面板，带有部分遮罩效果。

## 何时使用

- 需要在移动端提供下拉选择、筛选等功能时
- 需要在不离开当前页面的情况下显示更多选项
- 需要实现类似电商 App 的商品排序、筛选功能
- 需要从触发器位置弹出面板，而不是全屏遮罩

## 特性

- ✅ 从触发元素的上方或下方滑出
- ✅ 部分遮罩（只遮盖触发器上方或下方区域）
- ✅ 流畅的滑入滑出动画
- ✅ 自动跟随触发器位置
- ✅ 支持触摸滚动
- ✅ 面板打开时自动锁定背景滚动

## 代码演示

### 基础用法

最简单的用法，点击触发器从下方滑出面板。

<div class="demo-container mobile-demo">
  <l-dropdown-panel id="demo1">
    <div slot="trigger" class="demo-trigger">
      <span class="label">全部商品</span>
      <span class="arrow">▼</span>
    </div>
    <div class="demo-panel">
      <div class="demo-menu-item selected">全部商品</div>
      <div class="demo-menu-item">新款商品</div>
      <div class="demo-menu-item">活动商品</div>
    </div>
  </l-dropdown-panel>
</div>

```html
<l-dropdown-panel>
  <div slot="trigger" class="trigger-button">
    <span>全部商品</span>
    <span>▼</span>
  </div>
  <div class="panel-content">
    <div class="menu-item">全部商品</div>
    <div class="menu-item">新款商品</div>
    <div class="menu-item">活动商品</div>
  </div>
</l-dropdown-panel>
```

### 排序选择

实现商品排序选择功能，选择后自动关闭面板。

<div class="demo-container mobile-demo">
  <l-dropdown-panel id="demo2">
    <div slot="trigger" class="demo-trigger">
      <span class="label">默认排序</span>
      <span class="arrow">▼</span>
    </div>
    <div class="demo-panel">
      <div class="demo-menu-item selected" data-sort="default">默认排序</div>
      <div class="demo-menu-item" data-sort="rating">好评排序</div>
      <div class="demo-menu-item" data-sort="sales">销量排序</div>
      <div class="demo-menu-item" data-sort="price-low">价格从低到高</div>
      <div class="demo-menu-item" data-sort="price-high">价格从高到低</div>
    </div>
  </l-dropdown-panel>
</div>

```html
<l-dropdown-panel id="sortPanel">
  <div slot="trigger" class="trigger-button">
    <span class="label">默认排序</span>
    <span>▼</span>
  </div>
  <div class="panel-content">
    <div class="menu-item selected" data-sort="default">默认排序</div>
    <div class="menu-item" data-sort="rating">好评排序</div>
    <div class="menu-item" data-sort="sales">销量排序</div>
  </div>
</l-dropdown-panel>

<script>
  const panel = document.getElementById('sortPanel');
  const items = panel.querySelectorAll('.menu-item');
  const label = panel.querySelector('.label');

  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      label.textContent = item.textContent;
      panel.hide();
    });
  });
</script>
```

### 从上方滑出

通过设置 `placement="top"` 使面板从触发器上方滑出。

<div class="demo-container mobile-demo">
  <l-dropdown-panel id="demo3" placement="top">
    <div slot="trigger" class="demo-trigger">
      <span class="label">向上展开</span>
      <span class="arrow up">▲</span>
    </div>
    <div class="demo-panel">
      <div class="demo-menu-item">选项 1</div>
      <div class="demo-menu-item">选项 2</div>
      <div class="demo-menu-item">选项 3</div>
      <div class="demo-menu-item">选项 4</div>
    </div>
  </l-dropdown-panel>
</div>

```html
<l-dropdown-panel placement="top">
  <div slot="trigger" class="trigger-button">
    <span>向上展开</span>
    <span>▲</span>
  </div>
  <div class="panel-content">
    <div class="menu-item">选项 1</div>
    <div class="menu-item">选项 2</div>
    <div class="menu-item">选项 3</div>
  </div>
</l-dropdown-panel>
```

### 复杂筛选面板

支持复杂的自定义内容，如多选筛选器。

<div class="demo-container mobile-demo">
  <l-dropdown-panel id="demo4" max-height="70vh">
    <div slot="trigger" class="demo-trigger">
      <span class="label">筛选</span>
      <span class="arrow">▼</span>
    </div>
    <div class="demo-panel">
      <div class="filter-group">
        <div class="filter-title">类型</div>
        <div class="filter-options">
          <div class="filter-chip active">全部</div>
          <div class="filter-chip">品牌</div>
          <div class="filter-chip">包邮</div>
          <div class="filter-chip">团购</div>
        </div>
      </div>
      <div class="filter-group">
        <div class="filter-title">价格区间</div>
        <div class="filter-options">
          <div class="filter-chip">0-100</div>
          <div class="filter-chip">100-500</div>
          <div class="filter-chip">500-1000</div>
          <div class="filter-chip">1000+</div>
        </div>
      </div>
      <div class="filter-group">
        <div class="filter-title">品牌</div>
        <div class="filter-options">
          <div class="filter-chip">Apple</div>
          <div class="filter-chip">Samsung</div>
          <div class="filter-chip">Huawei</div>
          <div class="filter-chip">Xiaomi</div>
        </div>
      </div>
    </div>
  </l-dropdown-panel>
</div>

```html
<l-dropdown-panel max-height="70vh">
  <div slot="trigger" class="trigger-button">
    <span>筛选</span>
    <span>▼</span>
  </div>
  <div class="panel-content">
    <div class="filter-group">
      <div class="filter-title">价格区间</div>
      <div class="filter-options">
        <button class="filter-chip">0-100</button>
        <button class="filter-chip">100-500</button>
        <button class="filter-chip">500-1000</button>
      </div>
    </div>
    <div class="filter-group">
      <div class="filter-title">品牌</div>
      <div class="filter-options">
        <button class="filter-chip">品牌A</button>
        <button class="filter-chip">品牌B</button>
      </div>
    </div>
  </div>
</l-dropdown-panel>
```

### 自定义遮罩

可以自定义遮罩层的背景色和透明度。

<div class="demo-container mobile-demo">
  <l-dropdown-panel id="demo5" mask-background="rgba(0, 0, 0, 0.6)">
    <div slot="trigger" class="demo-trigger">
      <span class="label">深色遮罩</span>
      <span class="arrow">▼</span>
    </div>
    <div class="demo-panel">
      <div class="demo-menu-item">选项 1</div>
      <div class="demo-menu-item">选项 2</div>
      <div class="demo-menu-item">选项 3</div>
    </div>
  </l-dropdown-panel>
</div>

```html
<l-dropdown-panel mask-background="rgba(0, 0, 0, 0.6)">
  <div slot="trigger">
    <button>深色遮罩</button>
  </div>
  <div>面板内容</div>
</l-dropdown-panel>
```

### 自定义动画时长

通过 `duration` 属性设置动画持续时间。

<div class="demo-container mobile-demo">
  <l-dropdown-panel id="demo6" duration="500">
    <div slot="trigger" class="demo-trigger">
      <span class="label">慢速动画</span>
      <span class="arrow">▼</span>
    </div>
    <div class="demo-panel">
      <div class="demo-menu-item">选项 1</div>
      <div class="demo-menu-item">选项 2</div>
      <div class="demo-menu-item">选项 3</div>
    </div>
  </l-dropdown-panel>
</div>

```html
<l-dropdown-panel duration="500">
  <div slot="trigger">
    <button>慢速动画</button>
  </div>
  <div>面板内容</div>
</l-dropdown-panel>
```

### 禁止点击遮罩关闭

设置 `mask-closable="false"` 禁止点击遮罩层关闭面板。

<div class="demo-container mobile-demo">
  <l-dropdown-panel id="demo7" mask-closable="false">
    <div slot="trigger" class="demo-trigger">
      <span class="label">禁止遮罩关闭</span>
      <span class="arrow">▼</span>
    </div>
    <div class="demo-panel">
      <div class="demo-menu-item">点击遮罩无法关闭</div>
      <div class="demo-menu-item">需要点击选项才能关闭</div>
      <div class="demo-menu-item close-item">点击关闭</div>
    </div>
  </l-dropdown-panel>
</div>

```html
<l-dropdown-panel mask-closable="false">
  <div slot="trigger">
    <button>禁止遮罩关闭</button>
  </div>
  <div>面板内容</div>
</l-dropdown-panel>
```

### 动画模式 - Scale

默认的 Scale 动画模式，面板从触发器位置展开和收缩。

<div class="demo-container mobile-demo">
  <l-dropdown-panel id="demo8" animation-mode="scale">
    <div slot="trigger" class="demo-trigger">
      <span class="label">Scale 动画</span>
      <span class="arrow">▼</span>
    </div>
    <div class="demo-panel">
      <div class="demo-menu-item">选项 1</div>
      <div class="demo-menu-item">选项 2</div>
      <div class="demo-menu-item">选项 3</div>
      <div class="demo-menu-item">选项 4</div>
    </div>
  </l-dropdown-panel>
</div>

```html
<l-dropdown-panel animation-mode="scale">
  <div slot="trigger">
    <button>Scale 动画</button>
  </div>
  <div>
    <div>选项 1</div>
    <div>选项 2</div>
  </div>
</l-dropdown-panel>
```

### 动画模式 - Slide

Slide 动画模式，面板从触发器位置滑入和滑出（不缩放）。

<div class="demo-container mobile-demo">
  <l-dropdown-panel id="demo9" animation-mode="slide">
    <div slot="trigger" class="demo-trigger">
      <span class="label">Slide 动画</span>
      <span class="arrow">▼</span>
    </div>
    <div class="demo-panel">
      <div class="demo-menu-item">选项 1</div>
      <div class="demo-menu-item">选项 2</div>
      <div class="demo-menu-item">选项 3</div>
      <div class="demo-menu-item">选项 4</div>
    </div>
  </l-dropdown-panel>
</div>

```html
<l-dropdown-panel animation-mode="slide">
  <div slot="trigger">
    <button>Slide 动画</button>
  </div>
  <div>
    <div>选项 1</div>
    <div>选项 2</div>
  </div>
</l-dropdown-panel>
```

### 编程式控制

通过组件方法控制面板的显示和隐藏。

<div class="demo-container mobile-demo">
  <l-dropdown-panel id="demo10">
    <div slot="trigger" class="demo-trigger">
      <span class="label">API 控制</span>
      <span class="arrow">▼</span>
    </div>
    <div class="demo-panel">
      <div class="demo-menu-item">选项 1</div>
      <div class="demo-menu-item">选项 2</div>
      <div class="demo-menu-item">选项 3</div>
    </div>
  </l-dropdown-panel>
  <div class="demo-buttons">
    <button class="demo-button" onclick="document.getElementById('demo10').show()">显示</button>
    <button class="demo-button" onclick="document.getElementById('demo10').hide()">隐藏</button>
    <button class="demo-button" onclick="document.getElementById('demo10').toggle()">切换</button>
  </div>
</div>

```html
<l-dropdown-panel id="myPanel">
  <div slot="trigger">
    <button>触发器</button>
  </div>
  <div>面板内容</div>
</l-dropdown-panel>

<button onclick="document.getElementById('myPanel').show()">显示</button>
<button onclick="document.getElementById('myPanel').hide()">隐藏</button>
<button onclick="document.getElementById('myPanel').toggle()">切换</button>
```

### 监听状态变化

监听面板的显示/隐藏状态变化。

```html
<l-dropdown-panel id="myPanel">
  <div slot="trigger">
    <button>触发器</button>
  </div>
  <div>面板内容</div>
</l-dropdown-panel>

<script>
  const panel = document.getElementById('myPanel');
  
  panel.addEventListener('visibleChange', (e) => {
    if (e.detail) {
      console.log('面板已打开');
    } else {
      console.log('面板已关闭');
    }
  });
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| visible | 面板是否可见 | `boolean` | `false` |
| placement | 面板弹出位置，'auto' 为自动判断 | `'auto' \| 'top' \| 'bottom'` | `'auto'` |
| animation-mode | 动画模式：'scale' 为展开/收缩，'slide' 为滑入/滑出 | `'scale' \| 'slide'` | `'scale'` |
| mask-background | 遮罩层背景色 | `string` | `'rgba(0, 0, 0, 0.3)'` |
| max-height | 面板最大高度 | `string` | `'60vh'` |
| safe-distance | 面板与遮罩边缘的安全距离（像素） | `number` | `16` |
| duration | 动画持续时间（毫秒） | `number` | `300` |
| mask-closable | 点击遮罩层是否关闭 | `boolean` | `true` |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| visibleChange | 面板显示/隐藏时触发 | `(visible: boolean) => void` |

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| show | 显示面板 | - | `Promise<void>` |
| hide | 隐藏面板 | - | `Promise<void>` |
| toggle | 切换面板显示状态 | - | `Promise<void>` |

### Slots

| 名称 | 说明 |
| --- | --- |
| trigger | 触发器内容 |
| default | 面板内容 |

## 样式定制

### CSS 类名

组件提供了以下 CSS 类名供自定义样式：

```css
/* 触发器容器 */
.l-dropdown-panel__trigger {
  /* 自定义样式 */
}

/* 遮罩层 */
.l-dropdown-panel__mask {
  /* 自定义样式 */
}

/* 面板容器 */
.l-dropdown-panel__panel {
  /* 自定义样式 */
}

/* 面板内容 */
.l-dropdown-panel__content {
  /* 自定义样式 */
}

/* 面板可见状态 */
.l-dropdown-panel__panel--visible {
  /* 自定义样式 */
}

/* 从下方滑出 */
.l-dropdown-panel__panel--bottom {
  /* 自定义样式 */
}

/* 从上方滑出 */
.l-dropdown-panel__panel--top {
  /* 自定义样式 */
}
```

### 触发器样式示例

```css
.trigger-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.trigger-button:active {
  background: #f5f5f5;
}

/* 面板打开时的样式 */
l-dropdown-panel[visible] .trigger-button {
  border-color: #1890ff;
}

/* 箭头旋转动画 */
.trigger-button .arrow {
  transition: transform 0.3s;
}

l-dropdown-panel[visible] .trigger-button .arrow {
  transform: rotate(180deg);
}
```

### 菜单项样式示例

```css
.menu-item {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #f5f5f5;
}

.menu-item.selected {
  color: #1890ff;
  position: relative;
}

.menu-item.selected::after {
  content: '✓';
  position: absolute;
  right: 20px;
  color: #1890ff;
}
```

## 最佳实践

### 1. 移动端优化

确保在移动端正确配置 viewport：

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### 2. 触摸反馈

为触发器添加触摸反馈效果：

```css
.trigger-button {
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.trigger-button:active {
  transform: scale(0.98);
}
```

### 3. 避免内容过多

建议控制面板内容高度，避免一次展示过多内容：

```html
<l-dropdown-panel max-height="50vh">
  <!-- 内容 -->
</l-dropdown-panel>
```

### 4. 选择后关闭

在选择选项后主动关闭面板：

```javascript
menuItem.addEventListener('click', async () => {
  // 更新选中状态
  updateSelection();
  // 关闭面板
  await panel.hide();
  // 执行后续操作
  handleChange();
});
```

## 注意事项

1. **移动端专用**：此组件主要为移动端设计，建议在移动设备或移动端视口下使用
2. **触发器必填**：`trigger` slot 必须有内容，不能为空
3. **自动锁定滚动**：面板打开时会自动锁定 body 滚动，关闭时恢复
4. **位置自动更新**：面板会自动跟随触发器位置，即使页面滚动也会保持正确位置
5. **部分遮罩**：遮罩只覆盖触发器上方或下方区域，不会全屏遮罩
6. **性能考虑**：避免在面板中放置过多 DOM 节点，保持面板内容简洁

## 常见问题

### 面板不显示？

检查以下几点：
- 确保 `trigger` slot 有内容
- 确保组件库正确加载
- 检查控制台是否有错误信息

### 如何自定义遮罩透明度？

使用 `mask-background` 属性：

```html
<l-dropdown-panel mask-background="rgba(0, 0, 0, 0.5)">
  <!-- 内容 -->
</l-dropdown-panel>
```

### 如何禁止点击遮罩关闭？

设置 `mask-closable="false"`：

```html
<l-dropdown-panel mask-closable="false">
  <!-- 内容 -->
</l-dropdown-panel>
```

### 面板内容如何滚动？

面板内容超出 `max-height` 时会自动显示滚动，组件已启用流畅滚动支持。

### 如何在 Vue/React 中使用？

参考框架集成文档，组件支持所有现代框架。

<style>
.mobile-demo {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.demo-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
}

.demo-trigger:active {
  background: #f8f8f8;
  transform: scale(0.98);
}

.demo-trigger .label {
  color: #1890ff;
  font-weight: 500;
}

.demo-trigger .arrow {
  font-size: 12px;
  color: #999;
  transition: transform 0.3s;
}

l-dropdown-panel[visible] .demo-trigger {
  border-color: #1890ff;
}

l-dropdown-panel[visible] .demo-trigger .arrow {
  transform: rotate(180deg);
}

l-dropdown-panel[visible] .demo-trigger .arrow.up {
  transform: rotate(0deg);
}

.demo-panel {
  background: white;
}

.demo-menu-item {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.demo-menu-item:last-child {
  border-bottom: none;
}

.demo-menu-item:active {
  background: #f5f5f5;
}

.demo-menu-item.selected {
  color: #1890ff;
  font-weight: 500;
}

.demo-menu-item.selected::after {
  content: '✓';
  position: absolute;
  right: 20px;
  color: #1890ff;
}

.filter-group {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-group:last-child {
  border-bottom: none;
}

.filter-title {
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-chip {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
}

.filter-chip:active {
  transform: scale(0.95);
}

.filter-chip.active {
  background: #1890ff;
  border-color: #1890ff;
  color: white;
}

.demo-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.demo-button {
  flex: 1;
  padding: 10px;
  border: 2px solid #1890ff;
  border-radius: 6px;
  background: white;
  color: #1890ff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.demo-button:active {
  background: #1890ff;
  color: white;
}
</style>

<script>
document.addEventListener('DOMContentLoaded', () => {
  // Demo 2: 排序选择
  const demo2 = document.getElementById('demo2');
  if (demo2) {
    const sortItems = demo2.querySelectorAll('[data-sort]');
    const sortLabel = demo2.querySelector('.label');
    
    sortItems.forEach(item => {
      item.addEventListener('click', () => {
        sortItems.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        sortLabel.textContent = item.textContent;
        demo2.hide();
      });
    });
  }

  // Demo 4: 筛选交互
  const demo4 = document.getElementById('demo4');
  if (demo4) {
    const filterChips = demo4.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('active');
      });
    });
  }

  // Demo 7: 点击选项关闭
  const demo7 = document.getElementById('demo7');
  if (demo7) {
    const closeItem = demo7.querySelector('.close-item');
    if (closeItem) {
      closeItem.addEventListener('click', () => {
        demo7.hide();
      });
    }
  }
});
</script>
