# Input 输入框

通过鼠标或键盘输入内容，是最基础的表单域的包装。

## 基础用法

基础的输入框用法。

<div class="demo-container">
  <ldesign-input placeholder="请输入内容"></ldesign-input>
</div>

```html
<ldesign-input placeholder="请输入内容"></ldesign-input>
```

## 禁用状态

通过 `disabled` 属性指定是否禁用 input 组件。

<div class="demo-container">
  <ldesign-input placeholder="请输入内容" disabled></ldesign-input>
</div>

```html
<ldesign-input placeholder="请输入内容" disabled></ldesign-input>
```

## 可清空

使用 `clearable` 属性即可得到一个可清空的输入框。

<div class="demo-container">
  <ldesign-input placeholder="请输入内容" clearable></ldesign-input>
</div>

```html
<ldesign-input placeholder="请输入内容" clearable></ldesign-input>
```

## 密码框

使用 `type="password"` 即可得到一个密码框。

<div class="demo-container">
  <ldesign-input type="password" placeholder="请输入密码" show-password></ldesign-input>
</div>

```html
<ldesign-input type="password" placeholder="请输入密码" show-password></ldesign-input>
```

## 带图标的输入框

可以通过 `prefix-icon` 和 `suffix-icon` 属性在 input 组件首部和尾部增加显示图标。

<div class="demo-container">
  <ldesign-input placeholder="请输入内容" prefix-icon="search"></ldesign-input>
  <ldesign-input placeholder="请输入内容" suffix-icon="star"></ldesign-input>
</div>

```html
<ldesign-input placeholder="请输入内容" prefix-icon="search"></ldesign-input>
<ldesign-input placeholder="请输入内容" suffix-icon="star"></ldesign-input>
```

## 尺寸

使用 `size` 属性改变输入框大小。除了默认大小外，还有另外两个选项：`large`，`small`。

<div class="demo-container">
  <ldesign-input placeholder="请输入内容" size="large"></ldesign-input>
  <ldesign-input placeholder="请输入内容" size="medium"></ldesign-input>
  <ldesign-input placeholder="请输入内容" size="small"></ldesign-input>
</div>

```html
<ldesign-input placeholder="请输入内容" size="large"></ldesign-input>
<ldesign-input placeholder="请输入内容" size="medium"></ldesign-input>
<ldesign-input placeholder="请输入内容" size="small"></ldesign-input>
```

## 复合型输入框

可前置或后置元素，一般为标签或按钮。

<div class="demo-container">
  <div style="margin-bottom: 16px;">
    <ldesign-input placeholder="请输入网址">
      <span slot="prepend">https://</span>
    </ldesign-input>
  </div>
  <div style="margin-bottom: 16px;">
    <ldesign-input placeholder="请输入域名">
      <span slot="append">.com</span>
    </ldesign-input>
  </div>
  <div style="margin-bottom: 16px;">
    <ldesign-input placeholder="请输入网站名">
      <span slot="prepend">https://</span>
      <span slot="append">.com</span>
    </ldesign-input>
  </div>
</div>

```html
<ldesign-input placeholder="请输入网址">
  <span slot="prepend">https://</span>
</ldesign-input>

<ldesign-input placeholder="请输入域名">
  <span slot="append">.com</span>
</ldesign-input>

<ldesign-input placeholder="请输入网站名">
  <span slot="prepend">https://</span>
  <span slot="append">.com</span>
</ldesign-input>
```

## 文本域

用于输入多行文本信息，通过将 `type` 属性的值指定为 `textarea`。

<div class="demo-container">
  <ldesign-input type="textarea" placeholder="请输入内容"></ldesign-input>
</div>

```html
<ldesign-input type="textarea" placeholder="请输入内容"></ldesign-input>
```

## 可自适应文本高度的文本域

通过设置 `autosize` 属性可以使得文本域的高度能够根据文本内容自动进行调整。

<div class="demo-container">
  <div style="margin-bottom: 20px;">
    <p style="margin-bottom: 10px;">基础自动高度：</p>
    <ldesign-input type="textarea" placeholder="请输入内容，高度会自动调整" autosize></ldesign-input>
  </div>
  <div style="margin-bottom: 20px;">
    <p style="margin-bottom: 10px;">限制最小和最大行数：</p>
    <ldesign-input 
      type="textarea" 
      placeholder="最少2行，最大5行" 
      id="textarea-limit-demo"
      value="这是第一行&#10;这是第二行"
    ></ldesign-input>
  </div>
</div>

```html
<!-- 基础自动高度 -->
<ldesign-input type="textarea" placeholder="请输入内容" autosize></ldesign-input>

<!-- 限制最小和最大行数 -->
<ldesign-input 
  type="textarea" 
  placeholder="最少2行，最大5行" 
  id="textarea-with-limit"
></ldesign-input>
```

```javascript
// 通过JavaScript设置autosize配置
const textarea = document.getElementById('textarea-with-limit');
textarea.autosize = { minRows: 2, maxRows: 5 };
```


## 字数统计

通过 `show-count` 属性可以显示字数统计，需要配合 `maxlength` 使用。

<div class="demo-container">
  <div style="margin-bottom: 20px;">
    <ldesign-input placeholder="最多20个字符" maxlength="20" show-count></ldesign-input>
  </div>
  <div>
    <ldesign-input type="textarea" placeholder="最多100个字符" maxlength="100" show-count rows="3"></ldesign-input>
  </div>
</div>

```html
<ldesign-input placeholder="最多20个字符" maxlength="20" show-count></ldesign-input>
<ldesign-input type="textarea" placeholder="最多100个字符" maxlength="100" show-count rows="3"></ldesign-input>
```

## 输入框状态

通过 `status` 属性可以设置输入框的状态。

<div class="demo-container">
  <div style="margin-bottom: 16px;">
    <ldesign-input placeholder="错误状态" status="error" value="错误内容"></ldesign-input>
  </div>
  <div style="margin-bottom: 16px;">
    <ldesign-input placeholder="警告状态" status="warning" value="警告内容"></ldesign-input>
  </div>
  <div style="margin-bottom: 16px;">
    <ldesign-input placeholder="成功状态" status="success" value="成功内容"></ldesign-input>
  </div>
</div>

```html
<ldesign-input placeholder="错误状态" status="error" value="错误内容"></ldesign-input>
<ldesign-input placeholder="警告状态" status="warning" value="警告内容"></ldesign-input>
<ldesign-input placeholder="成功状态" status="success" value="成功内容"></ldesign-input>
```

## 输入限制

通过 `allowInput` 属性可以限制输入内容。

<div class="demo-container">
  <div style="margin-bottom: 16px;">
    <p style="margin-bottom: 8px;">只允许输入数字：</p>
    <ldesign-input placeholder="只能输入数字" id="input-number-only"></ldesign-input>
  </div>
  <div style="margin-bottom: 16px;">
    <p style="margin-bottom: 8px;">只允许输入字母：</p>
    <ldesign-input placeholder="只能输入字母" id="input-letter-only"></ldesign-input>
  </div>
</div>

<script>
// 统一的页面初始化脚本
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      // 设置textarea autosize配置
      const textareaDemo = document.getElementById('textarea-limit-demo');
      if (textareaDemo) {
        textareaDemo.autosize = { minRows: 2, maxRows: 5 };
      }
      const textareaLimit = document.getElementById('textarea-with-limit');
      if (textareaLimit) {
        textareaLimit.autosize = { minRows: 2, maxRows: 5 };
      }
      
      // 设置输入限制
      const numberOnly = document.getElementById('input-number-only');
      if (numberOnly) {
        numberOnly.allowInput = /^\d*$/;
      }
      
      const letterOnly = document.getElementById('input-letter-only');
      if (letterOnly) {
        letterOnly.allowInput = /^[a-zA-Z]*$/;
      }
    }, 100);
  });
}
</script>

```javascript
// 使用正则表达式限制
input.allowInput = /^\d*$/; // 只允许数字

// 使用函数限制
input.allowInput = (value) => {
  return value.length <= 10; // 限制长度
};
```

## API

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `type` | `'text' \| 'password' \| 'textarea' \| 'number' \| 'email' \| 'url' \| 'tel'` | `'text'` | 输入框类型 |
| `value` | `string` | `''` | 输入框的值 |
| `placeholder` | `string` | `-` | 输入框占位文本 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `readonly` | `boolean` | `false` | 是否只读 |
| `clearable` | `boolean` | `false` | 是否可清空 |
| `show-password` | `boolean` | `false` | 是否显示切换密码图标 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 输入框尺寸 |
| `prefix-icon` | `string` | `-` | 输入框头部图标 |
| `suffix-icon` | `string` | `-` | 输入框尾部图标 |
| `maxlength` | `number` | `-` | 最大输入长度 |
| `minlength` | `number` | `-` | 最小输入长度 |
| `autosize` | `boolean \| { minRows?: number; maxRows?: number }` | `false` | 自适应内容高度（仅对 textarea 有效） |
| `rows` | `number` | `2` | 输入框行数（仅对 textarea 有效） |
| `show-count` | `boolean` | `false` | 是否显示字数统计 |
| `status` | `'error' \| 'warning' \| 'success'` | `-` | 输入框状态 |
| `allow-input` | `RegExp \| Function` | `-` | 输入限制 |
| `controlled` | `boolean` | `false` | 是否受控组件 |

### 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `ldesignInput` | 输入时触发 | `(event: CustomEvent<string>) => void` |
| `ldesignChange` | 值改变时触发 | `(event: CustomEvent<string>) => void` |
| `ldesignFocus` | 获得焦点时触发 | `(event: FocusEvent) => void` |
| `ldesignBlur` | 失去焦点时触发 | `(event: FocusEvent) => void` |
| `ldesignClear` | 点击清空按钮时触发 | `() => void` |

### 插槽

| 插槽名 | 说明 |
|--------|------|
| `prepend` | 输入框前置内容 |
| `append` | 输入框后置内容 |
| `prefix` | 输入框头部内容 |
| `suffix` | 输入框尾部内容 |

## 无障碍

Input 组件遵循 WAI-ARIA 规范：

- 支持键盘导航
- 提供 `aria-label` 或 `aria-labelledby` 属性
- 支持屏幕阅读器
- 提供适当的焦点管理

## 设计指南

### 何时使用

- 需要用户输入表单域内容时
- 提供组合型输入框，带搜索的输入框，还可以进行大小选择

### 何时不使用

- 当用户输入的内容格式有一定要求时，请使用其他相应组件，如数字输入框、日期选择器等

### 最佳实践

- 输入框应该有清晰的标签
- 使用占位符文本来提示用户应该输入什么内容
- 对于必填字段，应该有明确的标识
- 提供适当的验证反馈
