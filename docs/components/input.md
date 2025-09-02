# Input 输入框

通过鼠标或键盘输入内容，是最基础的表单域的包装。

## 基础用法

基本的输入框用法。

<div class="demo-block">
  <ld-input placeholder="请输入内容"></ld-input>
</div>

```html
<ld-input placeholder="请输入内容"></ld-input>
```

## 输入框类型

通过 `type` 属性指定不同的输入类型。

<div class="demo-block">
  <ld-input type="text" placeholder="文本输入"></ld-input>
  <ld-input type="password" placeholder="密码输入"></ld-input>
  <ld-input type="email" placeholder="邮箱输入"></ld-input>
  <ld-input type="number" placeholder="数字输入"></ld-input>
  <ld-input type="tel" placeholder="电话输入"></ld-input>
  <ld-input type="url" placeholder="网址输入"></ld-input>
</div>

```html
<ld-input type="text" placeholder="文本输入"></ld-input>
<ld-input type="password" placeholder="密码输入"></ld-input>
<ld-input type="email" placeholder="邮箱输入"></ld-input>
<ld-input type="number" placeholder="数字输入"></ld-input>
<ld-input type="tel" placeholder="电话输入"></ld-input>
<ld-input type="url" placeholder="网址输入"></ld-input>
```

## 输入框尺寸

使用 `size` 属性改变输入框大小。

<div class="demo-block">
  <ld-input size="large" placeholder="大尺寸"></ld-input>
  <ld-input placeholder="默认尺寸"></ld-input>
  <ld-input size="small" placeholder="小尺寸"></ld-input>
</div>

```html
<ld-input size="large" placeholder="大尺寸"></ld-input>
<ld-input placeholder="默认尺寸"></ld-input>
<ld-input size="small" placeholder="小尺寸"></ld-input>
```

## 输入框状态

使用 `status` 属性设置输入框状态。

<div class="demo-block">
  <ld-input status="success" placeholder="成功状态" value="输入正确"></ld-input>
  <ld-input status="warning" placeholder="警告状态" value="需要注意"></ld-input>
  <ld-input status="error" placeholder="错误状态" value="输入错误"></ld-input>
</div>

```html
<ld-input status="success" placeholder="成功状态" value="输入正确"></ld-input>
<ld-input status="warning" placeholder="警告状态" value="需要注意"></ld-input>
<ld-input status="error" placeholder="错误状态" value="输入错误"></ld-input>
```

## 禁用状态

使用 `disabled` 属性禁用输入框。

<div class="demo-block">
  <ld-input disabled placeholder="禁用状态"></ld-input>
  <ld-input disabled value="禁用状态"></ld-input>
</div>

```html
<ld-input disabled placeholder="禁用状态"></ld-input>
<ld-input disabled value="禁用状态"></ld-input>
```

## 只读状态

使用 `readonly` 属性设置只读状态。

<div class="demo-block">
  <ld-input readonly value="只读状态"></ld-input>
</div>

```html
<ld-input readonly value="只读状态"></ld-input>
```

## 清空功能

使用 `clearable` 属性启用清空功能。

<div class="demo-block">
  <ld-input clearable placeholder="可清空输入框" value="可以清空"></ld-input>
</div>

```html
<ld-input clearable placeholder="可清空输入框" value="可以清空"></ld-input>
```

## 密码输入

密码输入框支持显示/隐藏密码。

<div class="demo-block">
  <ld-input type="password" show-password placeholder="请输入密码"></ld-input>
</div>

```html
<ld-input type="password" show-password placeholder="请输入密码"></ld-input>
```

## 前缀和后缀

使用 `prefix` 和 `suffix` 属性添加前缀和后缀。

<div class="demo-block">
  <ld-input prefix="用户名" placeholder="请输入用户名"></ld-input>
  <ld-input suffix="@qq.com" placeholder="请输入邮箱前缀"></ld-input>
  <ld-input prefix="￥" suffix="元" placeholder="请输入金额"></ld-input>
</div>

```html
<ld-input prefix="用户名" placeholder="请输入用户名"></ld-input>
<ld-input suffix="@qq.com" placeholder="请输入邮箱前缀"></ld-input>
<ld-input prefix="￥" suffix="元" placeholder="请输入金额"></ld-input>
```

## 前缀和后缀图标

使用 `prefix-icon` 和 `suffix-icon` 属性添加图标。

<div class="demo-block">
  <ld-input prefix-icon="user" placeholder="请输入用户名"></ld-input>
  <ld-input suffix-icon="search" placeholder="请输入搜索内容"></ld-input>
  <ld-input prefix-icon="lock" suffix-icon="eye" type="password" placeholder="请输入密码"></ld-input>
</div>

```html
<ld-input prefix-icon="user" placeholder="请输入用户名"></ld-input>
<ld-input suffix-icon="search" placeholder="请输入搜索内容"></ld-input>
<ld-input prefix-icon="lock" suffix-icon="eye" type="password" placeholder="请输入密码"></ld-input>
```

## 字符计数

使用 `show-count` 属性显示字符计数。

<div class="demo-block">
  <ld-input show-count maxlength="20" placeholder="最多输入20个字符"></ld-input>
  <ld-input show-count maxlength="100" type="textarea" placeholder="最多输入100个字符"></ld-input>
</div>

```html
<ld-input show-count maxlength="20" placeholder="最多输入20个字符"></ld-input>
<ld-input show-count maxlength="100" type="textarea" placeholder="最多输入100个字符"></ld-input>
```

## 文本域

使用 `type="textarea"` 创建文本域。

<div class="demo-block">
  <ld-input type="textarea" placeholder="请输入多行文本"></ld-input>
  <ld-input type="textarea" rows="4" placeholder="指定行数的文本域"></ld-input>
  <ld-input type="textarea" autosize placeholder="自动调整高度"></ld-input>
</div>

```html
<ld-input type="textarea" placeholder="请输入多行文本"></ld-input>
<ld-input type="textarea" rows="4" placeholder="指定行数的文本域"></ld-input>
<ld-input type="textarea" autosize placeholder="自动调整高度"></ld-input>
```

## API

### Input Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 输入框类型 | `'text' \| 'password' \| 'email' \| 'number' \| 'tel' \| 'url' \| 'search' \| 'textarea'` | `'text'` |
| value | 输入框内容 | `string` | - |
| placeholder | 输入框占位文本 | `string` | - |
| size | 输入框尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| status | 输入框状态 | `'success' \| 'warning' \| 'error'` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| clearable | 是否可清空 | `boolean` | `false` |
| show-password | 是否显示密码切换按钮 | `boolean` | `false` |
| show-count | 是否显示字符计数 | `boolean` | `false` |
| maxlength | 最大输入长度 | `number` | - |
| minlength | 最小输入长度 | `number` | - |
| prefix | 前缀文本 | `string` | - |
| suffix | 后缀文本 | `string` | - |
| prefix-icon | 前缀图标 | `string` | - |
| suffix-icon | 后缀图标 | `string` | - |
| rows | 文本域行数 | `number` | `3` |
| autosize | 是否自动调整高度 | `boolean` | `false` |
| autocomplete | 自动完成 | `string` | `'off'` |

### Input Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| input | 输入时触发 | `(value: string, event: InputEvent) => void` |
| change | 值改变时触发 | `(value: string, event: Event) => void` |
| focus | 获得焦点时触发 | `(event: FocusEvent) => void` |
| blur | 失去焦点时触发 | `(event: FocusEvent) => void` |
| clear | 点击清空按钮时触发 | `() => void` |
| keydown | 按键按下时触发 | `(event: KeyboardEvent) => void` |
| keyup | 按键释放时触发 | `(event: KeyboardEvent) => void` |

### Input Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| focus | 使输入框获得焦点 | - |
| blur | 使输入框失去焦点 | - |
| select | 选中输入框文本 | - |
| clear | 清空输入框 | - |

### Input Slots

| 插槽名 | 说明 |
|--------|------|
| prefix | 自定义前缀内容 |
| suffix | 自定义后缀内容 |

## 主题定制

### CSS 变量

```css
:root {
  /* 输入框基础样式 */
  --ld-input-font-size: 14px;
  --ld-input-line-height: 1.5715;
  --ld-input-border-radius: 6px;
  --ld-input-padding-horizontal: 11px;
  --ld-input-padding-vertical: 4px;
  
  /* 输入框颜色 */
  --ld-input-color: rgba(0, 0, 0, 0.85);
  --ld-input-bg: #fff;
  --ld-input-border: #d9d9d9;
  --ld-input-border-hover: #40a9ff;
  --ld-input-border-focus: #40a9ff;
  
  /* 输入框状态颜色 */
  --ld-input-success-border: #52c41a;
  --ld-input-warning-border: #faad14;
  --ld-input-error-border: #ff4d4f;
  
  /* 占位符颜色 */
  --ld-input-placeholder-color: #bfbfbf;
  
  /* 禁用状态 */
  --ld-input-disabled-color: rgba(0, 0, 0, 0.25);
  --ld-input-disabled-bg: #f5f5f5;
}
```
