# InputNumber 数字输入框

用于输入数字，支持最小/最大值、步长、精度控制，并提供步进按钮、键盘操作和可选的鼠标滚轮调整。支持 formatter/parser 自定义格式化与解析。

> 组件标签：`<ldesign-input-number>`

## 基础用法

<div class="demo-block">
  <ldesign-input-number value="3" min="0" max="10" step="1"></ldesign-input-number>
</div>

```html
<ldesign-input-number value="3" min="0" max="10" step="1"></ldesign-input-number>
```

## 尺寸

<div class="demo-block">
  <ldesign-input-number size="large" value="16"></ldesign-input-number>
  <ldesign-input-number value="12"></ldesign-input-number>
  <ldesign-input-number size="small" value="8"></ldesign-input-number>
</div>

```html
<ldesign-input-number size="large" value="16"></ldesign-input-number>
<ldesign-input-number value="12"></ldesign-input-number>
<ldesign-input-number size="small" value="8"></ldesign-input-number>
```

## 最小/最大/步长/精度

<div class="demo-block">
  <ldesign-input-number value="0" min="-5" max="5" step="0.5"></ldesign-input-number>
  <ldesign-input-number value="1.23" step="0.01" precision="2"></ldesign-input-number>
</div>

```html
<ldesign-input-number value="0" min="-5" max="5" step="0.5"></ldesign-input-number>
<ldesign-input-number value="1.23" step="0.01" precision="2"></ldesign-input-number>
```

## 键盘与滚轮

- keyboard：方向键/页键/Home/End 调整（默认启用）
- mouse-wheel：开启后滚轮可增减（聚焦时生效）

<div class="demo-block">
  <ldesign-input-number id="in-wheel" value="100" step="10" mouse-wheel></ldesign-input-number>
</div>

```html
<ldesign-input-number value="100" step="10" mouse-wheel></ldesign-input-number>
```

## 禁用与只读

<div class="demo-block">
  <ldesign-input-number value="6" disabled></ldesign-input-number>
  <ldesign-input-number value="6" readonly></ldesign-input-number>
</div>

```html
<ldesign-input-number value="6" disabled></ldesign-input-number>
<ldesign-input-number value="6" readonly></ldesign-input-number>
```

## 状态样式

<div class="demo-block">
  <ldesign-input-number value="3" status="success"></ldesign-input-number>
  <ldesign-input-number value="-1" status="warning"></ldesign-input-number>
  <ldesign-input-number value="12" status="error"></ldesign-input-number>
</div>

```html
<ldesign-input-number value="3" status="success"></ldesign-input-number>
<ldesign-input-number value="-1" status="warning"></ldesign-input-number>
<ldesign-input-number value="12" status="error"></ldesign-input-number>
```

## 自定义格式化与解析

通过 `formatter` 与 `parser` 可以定制展示格式与输入解析。由于 HTML 属性无法直接传函数，推荐在脚本中赋值。

<div class="demo-block">
  <ldesign-input-number id="in-currency" value="1000" step="100"></ldesign-input-number>
</div>

```html
<ldesign-input-number id="in-currency" value="1000" step="100"></ldesign-input-number>
<script>
  const el = document.getElementById('in-currency');
  el.formatter = (v) => (v == null ? '' : v.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }));
  el.parser = (s) => {
    const n = Number(String(s).replace(/[^\d.-]/g, ''));
    return Number.isNaN(n) ? null : n;
  };
</script>
```

## 事件

```js
const el = document.querySelector('ldesign-input-number');
el.addEventListener('ldesignInput', (e) => {
  console.log('input:', e.detail);
});
el.addEventListener('ldesignChange', (e) => {
  console.log('change:', e.detail);
});
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 当前值（受控） | `number \| null` | `0` |
| min | 最小值（含） | `number` | - |
| max | 最大值（含） | `number` | - |
| step | 步长（用于增减） | `number` | `1` |
| precision | 小数位数（不设则自动推断） | `number` | - |
| size | 尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| status | 状态样式 | `'success' \| 'warning' \| 'error'` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| keyboard | 启用键盘增减 | `boolean` | `true` |
| mouse-wheel | 启用滚轮增减（需聚焦） | `boolean` | `false` |
| placeholder | 占位符 | `string` | - |
| formatter | 自定义显示格式化 | `(value: number | null) => string` | - |
| parser | 自定义解析 | `(input: string) => number | null` | - |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| ldesignInput | 输入时触发（实时） | `(value: number | null)` |
| ldesignChange | 提交时触发（失焦、回车、点击步进） | `(value: number | null)` |
| ldesignFocus | 获得焦点 | `(event: FocusEvent)` |
| ldesignBlur | 失去焦点 | `(event: FocusEvent)` |