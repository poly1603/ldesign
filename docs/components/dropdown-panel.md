# DropdownPanel 下拉面板

移动端下拉面板组件，从触发元素的上方或下方滑出面板，带有部分遮罩效果。

## 何时使用

- 需要在移动端提供下拉选择、筛选等功能时
- 需要在不离开当前页面的情况下显示更多选项
- 需要实现类似电商 App 的商品排序、筛选功能
- 需要从触发器位置弹出面板，而不是全屏遮罩

## 特性

- ✅ 从触发元素的上方或下方滑出
- ✅ 部分遮罩（只遮盖触发器上方或下方区域）
- ✅ 支持 Scale 和 Slide 两种动画模式
- ✅ 自动判断弹出方向，智能适配屏幕空间
- ✅ 自动跟随触发器位置
- ✅ 支持触摸滚动
- ✅ 面板打开时自动锁定背景滚动

## 代码演示

### 基础用法

最简单的用法，点击触发器从下方滑出面板。

<div class="mobile-demo-container">
  <l-dropdown-panel id="demo1">
    <div slot="trigger" class="dropdown-trigger">
      <span class="label">全部商品</span>
      <span class="arrow">▼</span>
    </div>
    <div class="dropdown-content">
      <div class="dropdown-menu-item selected">全部商品</div>
      <div class="dropdown-menu-item">新款商品</div>
      <div class="dropdown-menu-item">活动商品</div>
    </div>
  </l-dropdown-panel>
</div>

```html
<l-dropdown-panel>
  <div slot="trigger" class="trigger-button">
    <span>全部商品</span>
    <span>▼</span>
  </div>
  <div>
    <div class="menu-item">全部商品</div>
    <div class="menu-item">新款商品</div>
    <div class="menu-item">活动商品</div>
  </div>
</l-dropdown-panel>
```

### Scale 动画模式（默认）

默认的 Scale 动画模式，面板从触发器位置展开和收缩。

<div class="mobile-demo-container">
  <l-dropdown-panel id="demo2" animation-mode="scale">
    <div slot="trigger" class="dropdown-trigger">
      <span class="label">Scale 动画</span>
      <span class="arrow">▼</span>
    </div>
    <div class="dropdown-content">
      <div class="dropdown-menu-item">选项 1</div>
      <div class="dropdown-menu-item">选项 2</div>
      <div class="dropdown-menu-item">选项 3</div>
      <div class="dropdown-menu-item">选项 4</div>
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

### Slide 动画模式

Slide 动画模式，面板从触发器位置滑入和滑出（不缩放）。

<div class="mobile-demo-container">
  <l-dropdown-panel id="demo3" animation-mode="slide">
    <div slot="trigger" class="dropdown-trigger">
      <span class="label">Slide 动画</span>
      <span class="arrow">▼</span>
    </div>
    <div class="dropdown-content">
      <div class="dropdown-menu-item">选项 1</div>
      <div class="dropdown-menu-item">选项 2</div>
      <div class="dropdown-menu-item">选项 3</div>
      <div class="dropdown-menu-item">选项 4</div>
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

### 排序选择

实现商品排序选择功能，选择后自动关闭面板。

<div class="mobile-demo-container">
  <l-dropdown-panel id="demo4">
    <div slot="trigger" class="dropdown-trigger">
      <span class="label">默认排序</span>
      <span class="arrow">▼</span>
    </div>
    <div class="dropdown-content">
      <div class="dropdown-menu-item selected" data-value="default">默认排序</div>
      <div class="dropdown-menu-item" data-value="rating">好评排序</div>
      <div class="dropdown-menu-item" data-value="sales">销量排序</div>
      <div class="dropdown-menu-item" data-value="price-low">价格从低到高</div>
      <div class="dropdown-menu-item" data-value="price-high">价格从高到低</div>
    </div>
  </l-dropdown-panel>
</div>

```html
<l-dropdown-panel id="sortPanel">
  <div slot="trigger" class="trigger-button">
    <span class="label">默认排序</span>
    <span>▼</span>
  </div>
  <div>
    <div class="menu-item selected" data-value="default">默认排序</div>
    <div class="menu-item" data-value="rating">好评排序</div>
    <div class="menu-item" data-value="sales">销量排序</div>
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

<div class="mobile-demo-container">
  <l-dropdown-panel id="demo5" placement="top">
    <div slot="trigger" class="dropdown-trigger">
      <span class="label">向上展开</span>
      <span class="arrow">▲</span>
    </div>
    <div class="dropdown-content">
      <div class="dropdown-menu-item">选项 1</div>
      <div class="dropdown-menu-item">选项 2</div>
      <div class="dropdown-menu-item">选项 3</div>
      <div class="dropdown-menu-item">选项 4</div>
    </div>
  </l-dropdown-panel>
</div>

```html
<l-dropdown-panel placement="top">
  <div slot="trigger">
    <button>向上展开 ▲</button>
  </div>
  <div>
    <div>选项 1</div>
    <div>选项 2</div>
    <div>选项 3</div>
  </div>
</l-dropdown-panel>
```

### 复杂筛选面板

支持复杂的自定义内容，如多选筛选器。

<div class="mobile-demo-container">
  <l-dropdown-panel id="demo6" max-height="70vh">
    <div slot="trigger" class="dropdown-trigger">
      <span class="label">筛选</span>
      <span class="arrow">▼</span>
    </div>
    <div class="dropdown-content">
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
  <div slot="trigger">
    <button>筛选</button>
  </div>
  <div>
    <div class="filter-group">
      <div class="filter-title">价格区间</div>
      <div class="filter-options">
        <button class="filter-chip">0-100</button>
        <button class="filter-chip">100-500</button>
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

### 编程式控制

通过组件方法控制面板的显示和隐藏。

<div class="mobile-demo-container">
  <l-dropdown-panel id="demo7">
    <div slot="trigger" class="dropdown-trigger">
      <span class="label">API 控制</span>
      <span class="arrow">▼</span>
    </div>
    <div class="dropdown-content">
      <div class="dropdown-menu-item">选项 1</div>
      <div class="dropdown-menu-item">选项 2</div>
      <div class="dropdown-menu-item">选项 3</div>
    </div>
  </l-dropdown-panel>
  <div class="control-buttons">
    <button class="control-button" onclick="document.getElementById('demo7').show()">显示</button>
    <button class="control-button" onclick="document.getElementById('demo7').hide()">隐藏</button>
    <button class="control-button" onclick="document.getElementById('demo7').toggle()">切换</button>
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

## 动画模式对比

| 特性 | Scale 模式 | Slide 模式 |
| --- | --- | --- |
| 动画效果 | 从触发器位置缩放展开/收缩 | 从触发器位置平滑移动（不缩放） |
| 视觉关联 | 强调触发器与面板关系 | 同样强调触发器位置 |
| 动画路径 | 缩放效果，更精致 | 平移效果，更流畅 |
| 适用场景 | 简单下拉菜单、选择器 | 需要平滑移动效果的场景 |
| 推荐使用 | 内容较少的场景 | 需要更明显移动效果的场景 |

## 最佳实践

### 1. 移动端优化

确保在移动端正确配置 viewport：

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### 2. 选择合适的动画模式

**使用 Scale 动画（默认）当：**
- 面板内容简单，选项不多
- 需要强调触发器和面板的关联
- 希望动画更加内敛、精致

**使用 Slide 动画当：**
- 需要平滑的滑动效果
- 希望面板保持完整宽度平移
- 需要更直观的移动视觉反馈

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
6. **智能方向**：默认 `placement="auto"`，组件会自动判断最佳弹出方向

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // Demo 4: 排序选择交互
  const demo4 = document.getElementById('demo4');
  if (demo4) {
    const items = demo4.querySelectorAll('.dropdown-menu-item');
    const label = demo4.querySelector('.label');
    
    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        label.textContent = item.textContent;
        demo4.hide();
      });
    });
  }

  // Demo 6: 筛选交互
  const demo6 = document.getElementById('demo6');
  if (demo6) {
    const chips = demo6.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('active');
      });
    });
  }

  // 监听所有面板的状态变化
  document.querySelectorAll('l-dropdown-panel').forEach(panel => {
    panel.addEventListener('visibleChange', (e) => {
      console.log(`面板 ${panel.id} 状态变化:`, e.detail ? '显示' : '隐藏');
    });
  });
});
</script>
