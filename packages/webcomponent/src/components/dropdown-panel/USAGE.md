# Dropdown Panel 组件使用指南

## 📱 简介

`l-dropdown-panel` 是一个专为移动端设计的下拉面板组件，类似于图片中展示的效果：
- ✅ 从触发元素的上方或下方滑出面板
- ✅ 部分遮罩（只遮盖触发器上方或下方区域）
- ✅ 流畅的滑入滑出动画
- ✅ 自动跟随触发器位置
- ✅ 支持触摸滚动
- ✅ 锁定背景滚动

## 🚀 快速开始

### 基础用法

```html
<l-dropdown-panel>
  <div slot="trigger">
    <button>点击展开</button>
  </div>
  <div>
    <div>选项 1</div>
    <div>选项 2</div>
    <div>选项 3</div>
  </div>
</l-dropdown-panel>
```

### 从下方滑出（默认）

```html
<l-dropdown-panel placement="bottom">
  <div slot="trigger">
    <button>全部商品 ▼</button>
  </div>
  <div class="menu">
    <div class="menu-item">全部商品</div>
    <div class="menu-item">新款商品</div>
    <div class="menu-item">活动商品</div>
  </div>
</l-dropdown-panel>
```

### 从上方滑出

```html
<l-dropdown-panel placement="top">
  <div slot="trigger">
    <button>向上展开 ▲</button>
  </div>
  <div class="menu">
    <div class="menu-item">选项 1</div>
    <div class="menu-item">选项 2</div>
  </div>
</l-dropdown-panel>
```

## 🎨 样式定制

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
  border-radius: 6px;
  cursor: pointer;
}

/* 面板打开时改变触发器样式 */
l-dropdown-panel[visible] .trigger-button {
  border-color: #1890ff;
}
```

### 菜单项样式示例

```css
.menu-item {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #f5f5f5;
}

.menu-item.selected {
  color: #1890ff;
}
```

## ⚙️ Props 配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | `boolean` | `false` | 面板是否可见 |
| `placement` | `'top' \| 'bottom'` | `'bottom'` | 面板弹出位置 |
| `mask-background` | `string` | `'rgba(0, 0, 0, 0.3)'` | 遮罩层背景色 |
| `max-height` | `string` | `'60vh'` | 面板最大高度 |
| `duration` | `number` | `300` | 动画持续时间（毫秒） |
| `mask-closable` | `boolean` | `true` | 点击遮罩是否关闭 |

### 使用示例

```html
<l-dropdown-panel
  placement="bottom"
  mask-background="rgba(0, 0, 0, 0.5)"
  max-height="70vh"
  duration="500"
  mask-closable="true"
>
  <div slot="trigger">触发器</div>
  <div>面板内容</div>
</l-dropdown-panel>
```

## 📡 事件

### visibleChange

面板显示/隐藏状态变化时触发

```javascript
const panel = document.getElementById('myPanel');
panel.addEventListener('visibleChange', (e) => {
  console.log('面板状态:', e.detail); // true: 显示, false: 隐藏
});
```

## 🔧 方法

### show()

显示面板

```javascript
const panel = document.getElementById('myPanel');
await panel.show();
```

### hide()

隐藏面板

```javascript
const panel = document.getElementById('myPanel');
await panel.hide();
```

### toggle()

切换面板显示状态

```javascript
const panel = document.getElementById('myPanel');
await panel.toggle();
```

## 💡 实际应用场景

### 1. 商品排序选择器

```html
<l-dropdown-panel id="sortPanel">
  <div slot="trigger" class="sort-trigger">
    <span class="label">默认排序</span>
    <span class="arrow">▼</span>
  </div>
  <div class="sort-menu">
    <div class="sort-item selected" data-value="default">默认排序</div>
    <div class="sort-item" data-value="rating">好评排序</div>
    <div class="sort-item" data-value="sales">销量排序</div>
    <div class="sort-item" data-value="price-asc">价格从低到高</div>
    <div class="sort-item" data-value="price-desc">价格从高到低</div>
  </div>
</l-dropdown-panel>

<script>
  const panel = document.getElementById('sortPanel');
  const sortItems = panel.querySelectorAll('.sort-item');
  const label = panel.querySelector('.label');

  sortItems.forEach(item => {
    item.addEventListener('click', () => {
      // 更新选中状态
      sortItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      
      // 更新显示文本
      label.textContent = item.textContent;
      
      // 关闭面板
      panel.hide();
      
      // 执行排序逻辑
      const sortValue = item.getAttribute('data-value');
      performSort(sortValue);
    });
  });
</script>
```

### 2. 商品筛选器

```html
<l-dropdown-panel id="filterPanel" max-height="70vh">
  <div slot="trigger" class="filter-trigger">
    <span>筛选</span>
    <span>▼</span>
  </div>
  <div class="filter-content">
    <div class="filter-group">
      <h3>价格区间</h3>
      <div class="filter-options">
        <button class="filter-chip">0-100</button>
        <button class="filter-chip">100-500</button>
        <button class="filter-chip">500-1000</button>
      </div>
    </div>
    <div class="filter-group">
      <h3>品牌</h3>
      <div class="filter-options">
        <button class="filter-chip">品牌A</button>
        <button class="filter-chip">品牌B</button>
        <button class="filter-chip">品牌C</button>
      </div>
    </div>
  </div>
</l-dropdown-panel>

<script>
  const filterChips = document.querySelectorAll('.filter-chip');
  
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      // 执行筛选逻辑
      applyFilters();
    });
  });
</script>
```

### 3. 地区选择器

```html
<l-dropdown-panel id="regionPanel">
  <div slot="trigger" class="region-trigger">
    <span>选择地区</span>
    <span>▼</span>
  </div>
  <div class="region-list">
    <div class="region-item" data-region="北京">北京</div>
    <div class="region-item" data-region="上海">上海</div>
    <div class="region-item" data-region="广州">广州</div>
    <div class="region-item" data-region="深圳">深圳</div>
  </div>
</l-dropdown-panel>
```

## 🎯 最佳实践

### 1. 移动端优化

```html
<!-- 添加 viewport meta 标签 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

<!-- 触发器添加触摸反馈 -->
<style>
.trigger-button {
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.trigger-button:active {
  transform: scale(0.98);
  background: #f5f5f5;
}
</style>
```

### 2. 箭头动画

```css
.trigger-arrow {
  transition: transform 0.3s ease;
}

l-dropdown-panel[visible] .trigger-arrow {
  transform: rotate(180deg);
}
```

### 3. 选中状态显示

```css
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

### 4. 滚动优化

面板内容超出时会自动显示滚动，无需额外配置：

```html
<l-dropdown-panel max-height="50vh">
  <div slot="trigger">打开</div>
  <div>
    <!-- 很多内容 -->
    <div class="item">项目 1</div>
    <div class="item">项目 2</div>
    <!-- ... 100 个项目 ... -->
  </div>
</l-dropdown-panel>
```

## ⚠️ 注意事项

1. **移动端专用**：此组件主要为移动端设计，在桌面端请使用 `l-dropdown` 组件
2. **触发器必须有内容**：`trigger` slot 不能为空
3. **面板打开时锁定滚动**：组件会自动锁定 body 滚动，关闭时恢复
4. **位置自动更新**：面板会自动跟随触发器位置，即使页面滚动
5. **遮罩部分覆盖**：遮罩只覆盖触发器上方或下方区域，不会全屏遮罩

## 🔗 相关组件

- `l-dropdown` - 桌面端下拉菜单
- `l-select` - 选择器
- `l-popup` - 弹出层
- `l-modal` - 模态框

## 📦 在框架中使用

### Vue 3

```vue
<template>
  <l-dropdown-panel 
    :visible="visible"
    @visibleChange="handleVisibleChange"
  >
    <div slot="trigger">
      <button>点击展开</button>
    </div>
    <div>
      <div v-for="item in items" :key="item.id">
        {{ item.name }}
      </div>
    </div>
  </l-dropdown-panel>
</template>

<script setup>
import { ref } from 'vue';

const visible = ref(false);
const items = ref([
  { id: 1, name: '选项 1' },
  { id: 2, name: '选项 2' },
]);

const handleVisibleChange = (e) => {
  visible.value = e.detail;
};
</script>
```

### React

```jsx
import { useRef } from 'react';

function MyComponent() {
  const panelRef = useRef(null);

  const handleItemClick = () => {
    panelRef.current?.hide();
  };

  return (
    <l-dropdown-panel ref={panelRef}>
      <div slot="trigger">
        <button>点击展开</button>
      </div>
      <div>
        <div onClick={handleItemClick}>选项 1</div>
        <div onClick={handleItemClick}>选项 2</div>
      </div>
    </l-dropdown-panel>
  );
}
```

## 🐛 常见问题

### Q: 面板不显示？
A: 检查 `trigger` slot 是否有内容，以及组件库是否正确加载。

### Q: 如何自定义遮罩透明度？
A: 使用 `mask-background` 属性，如 `mask-background="rgba(0, 0, 0, 0.5)"`

### Q: 如何禁止点击遮罩关闭？
A: 设置 `mask-closable="false"`

### Q: 面板内容滚动不流畅？
A: 组件已启用 `-webkit-overflow-scrolling: touch`，确保在真机测试

### Q: 如何监听面板关闭后执行操作？
A: 监听 `visibleChange` 事件：
```javascript
panel.addEventListener('visibleChange', (e) => {
  if (!e.detail) {
    // 面板关闭后的操作
  }
});
```

## 📝 更新日志

### v1.0.0
- ✨ 初始版本发布
- ✅ 支持从上方/下方滑出
- ✅ 部分遮罩效果
- ✅ 自动跟随触发器位置
- ✅ 支持编程式控制

---

**技术支持**: [GitHub Issues](https://github.com/your-repo/issues)  
**文档**: [完整文档](https://your-docs-site.com)
