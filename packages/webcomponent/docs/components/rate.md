# Rate 评分

评分组件，用于展示和收集用户评价。支持整星、半星评价，自定义图标、颜色、提示文字等功能。

## 基础用法

最简单的用法，展示评分。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-rate value="3"></ldesign-rate>
  </div>
</div>

```html
<ldesign-rate value="3"></ldesign-rate>
```

## 半星评价

设置 `allowHalf` 属性支持选中半星。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-rate value="2.5" allowHalf></ldesign-rate>
  </div>
  <div class="demo-row">
    <ldesign-rate value="3.5" allowHalf></ldesign-rate>
  </div>
</div>

```html
<ldesign-rate value="2.5" allowHalf></ldesign-rate>
<ldesign-rate value="3.5" allowHalf></ldesign-rate>
```

## 允许清空

设置 `allowClear` 属性，允许再次点击后清除评分。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-rate value="3" allowClear></ldesign-rate>
    <span style="margin-left: 16px; color: #666;">点击已选中的星星可清空</span>
  </div>
</div>

```html
<ldesign-rate value="3" allowClear></ldesign-rate>
```

## 只读和禁用

通过 `readonly` 和 `disabled` 属性控制组件状态。

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">只读状态:</span>
    <ldesign-rate value="3" readonly></ldesign-rate>
  </div>
  <div class="demo-row">
    <span class="demo-label">禁用状态:</span>
    <ldesign-rate value="3" disabled></ldesign-rate>
  </div>
</div>

```html
<!-- 只读状态 -->
<ldesign-rate value="3" readonly></ldesign-rate>

<!-- 禁用状态 -->
<ldesign-rate value="3" disabled></ldesign-rate>
```

## 自定义图标

通过 `icon` 属性可以自定义评分图标。

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">爱心图标:</span>
    <ldesign-rate value="3" icon="heart"></ldesign-rate>
  </div>
  <div class="demo-row">
    <span class="demo-label">点赞图标:</span>
    <ldesign-rate value="4" icon="thumbs-up"></ldesign-rate>
  </div>
  <div class="demo-row">
    <span class="demo-label">火焰图标:</span>
    <ldesign-rate value="2" icon="fire"></ldesign-rate>
  </div>
</div>

```html
<ldesign-rate value="3" icon="heart"></ldesign-rate>
<ldesign-rate value="4" icon="thumbs-up"></ldesign-rate>
<ldesign-rate value="2" icon="fire"></ldesign-rate>
```

## 自定义字符

使用插槽 `character` 可以自定义评分字符。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-rate value="3">
      <span slot="character" style="font-size: 20px;">好</span>
    </ldesign-rate>
  </div>
  <div class="demo-row">
    <ldesign-rate value="4">
      <span slot="character" style="font-size: 20px;">A</span>
    </ldesign-rate>
  </div>
</div>

```html
<ldesign-rate value="3">
  <span slot="character" style="font-size: 20px;">好</span>
</ldesign-rate>

<ldesign-rate value="4">
  <span slot="character" style="font-size: 20px;">A</span>
</ldesign-rate>
```

## 自定义数量

通过 `count` 属性设置星星总数。

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">3颗星:</span>
    <ldesign-rate value="2" count="3"></ldesign-rate>
  </div>
  <div class="demo-row">
    <span class="demo-label">10颗星:</span>
    <ldesign-rate value="7" count="10"></ldesign-rate>
  </div>
</div>

```html
<ldesign-rate value="2" count="3"></ldesign-rate>
<ldesign-rate value="7" count="10"></ldesign-rate>
```

## 尺寸

通过 `size` 属性设置评分组件的大小。

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">小尺寸:</span>
    <ldesign-rate value="3" size="small"></ldesign-rate>
  </div>
  <div class="demo-row">
    <span class="demo-label">中尺寸:</span>
    <ldesign-rate value="3" size="medium"></ldesign-rate>
  </div>
  <div class="demo-row">
    <span class="demo-label">大尺寸:</span>
    <ldesign-rate value="3" size="large"></ldesign-rate>
  </div>
</div>

```html
<ldesign-rate value="3" size="small"></ldesign-rate>
<ldesign-rate value="3" size="medium"></ldesign-rate>
<ldesign-rate value="3" size="large"></ldesign-rate>
```

## 自定义颜色

通过 `color` 和 `voidColor` 属性或 CSS 变量自定义颜色。

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">橙色:</span>
    <ldesign-rate value="3" color="#f97316"></ldesign-rate>
  </div>
  <div class="demo-row">
    <span class="demo-label">绿色:</span>
    <ldesign-rate value="4" color="#10b981"></ldesign-rate>
  </div>
  <div class="demo-row">
    <span class="demo-label">CSS变量:</span>
    <ldesign-rate value="2" style="--ld-rate-color: #ec4899; --ld-rate-void-color: #fce7f3;"></ldesign-rate>
  </div>
</div>

```html
<!-- 属性方式 -->
<ldesign-rate value="3" color="#f97316"></ldesign-rate>
<ldesign-rate value="4" color="#10b981"></ldesign-rate>

<!-- CSS 变量方式 -->
<ldesign-rate 
  value="2" 
  style="--ld-rate-color: #ec4899; --ld-rate-void-color: #fce7f3;">
</ldesign-rate>
```

## 提示文字

通过 `tooltips` 属性设置每个分值的提示文字。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-rate 
      value="3" 
      allowHalf
      tooltips='["很差","较差","一般","满意","惊喜"]'>
    </ldesign-rate>
  </div>
  <div class="demo-row">
    <ldesign-rate 
      value="4" 
      tooltips="极差|失望|一般|满意|超赞">
    </ldesign-rate>
  </div>
</div>

```html
<!-- JSON 数组格式 -->
<ldesign-rate 
  value="3" 
  allowHalf
  tooltips='["很差","较差","一般","满意","惊喜"]'>
</ldesign-rate>

<!-- 竖线分隔格式 -->
<ldesign-rate 
  value="4" 
  tooltips="极差|失望|一般|满意|超赞">
</ldesign-rate>
```

## 事件处理

评分组件支持 `ldesignChange` 和 `ldesignHoverChange` 事件。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-rate id="rate-event-demo" value="3" allowHalf></ldesign-rate>
    <span id="rate-value" style="margin-left: 16px;">当前值: 3</span>
  </div>
  <div class="demo-row">
    <ldesign-rate id="rate-hover-demo" value="2"></ldesign-rate>
    <span id="hover-value" style="margin-left: 16px;">悬停值: -</span>
  </div>
</div>

```html
<ldesign-rate id="rate-demo" value="3" allowHalf></ldesign-rate>
<span id="rate-value">当前值: 3</span>

<script>
const rateEl = document.getElementById('rate-demo');
const valueEl = document.getElementById('rate-value');

// 监听值变化
rateEl.addEventListener('ldesignChange', (e) => {
  valueEl.textContent = `当前值: ${e.detail}`;
});

// 监听悬停变化
rateEl.addEventListener('ldesignHoverChange', (e) => {
  console.log('悬停值:', e.detail);
});
</script>
```

## 受控模式

设置 `controlled` 属性使组件进入受控模式，配合事件手动控制值的更新。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-rate id="controlled-demo" value="2" controlled></ldesign-rate>
    <ldesign-button type="primary" size="small" id="set-value-btn" style="margin-left: 16px;">设置为4分</ldesign-button>
  </div>
</div>

```html
<ldesign-rate id="controlled-rate" value="2" controlled></ldesign-rate>
<button id="set-btn">设置为4分</button>

<script>
const rate = document.getElementById('controlled-rate');
const btn = document.getElementById('set-btn');

rate.addEventListener('ldesignChange', (e) => {
  // 受控模式下手动更新值
  rate.setAttribute('value', e.detail);
});

btn.addEventListener('click', () => {
  rate.setAttribute('value', '4');
});
</script>
```

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 事件演示
  const rateEventDemo = document.getElementById('rate-event-demo');
  const rateValue = document.getElementById('rate-value');
  
  if (rateEventDemo && rateValue) {
    rateEventDemo.addEventListener('ldesignChange', (e) => {
      rateValue.textContent = `当前值: ${e.detail}`;
    });
  }

  // 悬停演示
  const rateHoverDemo = document.getElementById('rate-hover-demo');
  const hoverValue = document.getElementById('hover-value');
  
  if (rateHoverDemo && hoverValue) {
    rateHoverDemo.addEventListener('ldesignHoverChange', (e) => {
      hoverValue.textContent = e.detail >= 0 ? `悬停值: ${e.detail}` : '悬停值: -';
    });
  }

  // 受控模式演示
  const controlledDemo = document.getElementById('controlled-demo');
  const setValueBtn = document.getElementById('set-value-btn');
  
  if (controlledDemo && setValueBtn) {
    controlledDemo.addEventListener('ldesignChange', (e) => {
      controlledDemo.setAttribute('value', e.detail);
    });
    
    setValueBtn.addEventListener('ldesignClick', () => {
      controlledDemo.setAttribute('value', '4');
    });
  }
})
</script>

## 键盘操作

评分组件支持键盘操作，提供良好的可访问性。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-rate value="3" allowHalf></ldesign-rate>
    <span style="margin-left: 16px; color: #666;">聚焦后可使用键盘操作</span>
  </div>
</div>

### 支持的快捷键

- `←` / `↓` - 减少评分（步进为 1 或 0.5）
- `→` / `↑` - 增加评分
- `Home` - 设置为最小值（0）
- `End` - 设置为最大值
- `Space` / `Enter` - 确认当前悬停值

## API

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `value` | `number` | `0` | 当前评分值 |
| `count` | `number` | `5` | 星星总数 |
| `allowHalf` | `boolean` | `false` | 是否允许半星 |
| `allowClear` | `boolean` | `true` | 是否允许清空 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `readonly` | `boolean` | `false` | 是否只读 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 尺寸大小 |
| `icon` | `string` | `'star'` | 图标名称 |
| `color` | `string` | - | 选中颜色 |
| `voidColor` | `string` | - | 未选中颜色 |
| `tooltips` | `string[] \| string` | - | 提示文字，可为数组或竖线分隔的字符串 |
| `controlled` | `boolean` | `false` | 是否受控模式 |

### 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `ldesignChange` | 评分值变化时触发 | `event.detail: number` |
| `ldesignHoverChange` | 鼠标悬停值变化时触发 | `event.detail: number` |

### 插槽

| 插槽名 | 说明 |
|--------|------|
| `character` | 自定义评分字符 |

### CSS 变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `--ld-rate-color` | 选中颜色 | `#fadb14` |
| `--ld-rate-void-color` | 未选中颜色 | `#f0f0f0` |
| `--ld-rate-gap` | 星星间距 | `4px` |
