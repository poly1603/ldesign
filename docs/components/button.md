# Button 按钮

按钮用于触发一个操作，如提交表单、打开对话框、取消操作或执行删除操作等。

## 基础用法

使用 `type` 属性来定义按钮的类型。

<div class="demo-block">
  <ld-button>默认按钮</ld-button>
  <ld-button type="primary">主要按钮</ld-button>
  <ld-button type="dashed">虚线按钮</ld-button>
  <ld-button type="text">文本按钮</ld-button>
  <ld-button type="link">链接按钮</ld-button>
</div>

```html
<ld-button>默认按钮</ld-button>
<ld-button type="primary">主要按钮</ld-button>
<ld-button type="dashed">虚线按钮</ld-button>
<ld-button type="text">文本按钮</ld-button>
<ld-button type="link">链接按钮</ld-button>
```

## 按钮尺寸

按钮有三种尺寸：大、中（默认）、小。

<div class="demo-block">
  <ld-button size="large" type="primary">大按钮</ld-button>
  <ld-button type="primary">中按钮</ld-button>
  <ld-button size="small" type="primary">小按钮</ld-button>
</div>

```html
<ld-button size="large" type="primary">大按钮</ld-button>
<ld-button type="primary">中按钮</ld-button>
<ld-button size="small" type="primary">小按钮</ld-button>
```

## 按钮状态

按钮支持不同的状态来表达不同的语义。

<div class="demo-block">
  <ld-button status="success">成功按钮</ld-button>
  <ld-button status="warning">警告按钮</ld-button>
  <ld-button status="error">错误按钮</ld-button>
  <ld-button status="danger">危险按钮</ld-button>
</div>

```html
<ld-button status="success">成功按钮</ld-button>
<ld-button status="warning">警告按钮</ld-button>
<ld-button status="error">错误按钮</ld-button>
<ld-button status="danger">危险按钮</ld-button>
```

## 禁用状态

使用 `disabled` 属性来禁用按钮。

<div class="demo-block">
  <ld-button disabled>默认按钮</ld-button>
  <ld-button type="primary" disabled>主要按钮</ld-button>
  <ld-button type="dashed" disabled>虚线按钮</ld-button>
  <ld-button type="text" disabled>文本按钮</ld-button>
</div>

```html
<ld-button disabled>默认按钮</ld-button>
<ld-button type="primary" disabled>主要按钮</ld-button>
<ld-button type="dashed" disabled>虚线按钮</ld-button>
<ld-button type="text" disabled>文本按钮</ld-button>
```

## 加载状态

使用 `loading` 属性来显示加载状态。

<div class="demo-block">
  <ld-button loading>加载中</ld-button>
  <ld-button type="primary" loading>加载中</ld-button>
  <ld-button loading loading-text="处理中...">自定义加载文本</ld-button>
</div>

```html
<ld-button loading>加载中</ld-button>
<ld-button type="primary" loading>加载中</ld-button>
<ld-button loading loading-text="处理中...">自定义加载文本</ld-button>
```

## 图标按钮

使用 `icon` 属性来添加图标。

<div class="demo-block">
  <ld-button icon="search">搜索</ld-button>
  <ld-button type="primary" icon="download">下载</ld-button>
  <ld-button icon="setting"></ld-button>
  <ld-button type="primary" icon="plus" icon-position="right">添加</ld-button>
</div>

```html
<ld-button icon="search">搜索</ld-button>
<ld-button type="primary" icon="download">下载</ld-button>
<ld-button icon="setting"></ld-button>
<ld-button type="primary" icon="plus" icon-position="right">添加</ld-button>
```

## 块级按钮

使用 `block` 属性来创建块级按钮。

<div class="demo-block">
  <ld-button type="primary" block>块级按钮</ld-button>
  <ld-button block>块级按钮</ld-button>
</div>

```html
<ld-button type="primary" block>块级按钮</ld-button>
<ld-button block>块级按钮</ld-button>
```

## 链接按钮

使用 `href` 属性来创建链接按钮。

<div class="demo-block">
  <ld-button type="link" href="https://github.com/ldesign-org/ldesign">GitHub</ld-button>
  <ld-button type="link" href="https://github.com/ldesign-org/ldesign" target="_blank">在新窗口打开</ld-button>
</div>

```html
<ld-button type="link" href="https://github.com/ldesign-org/ldesign">GitHub</ld-button>
<ld-button type="link" href="https://github.com/ldesign-org/ldesign" target="_blank">在新窗口打开</ld-button>
```

## 按钮组

使用 `ld-button-group` 来组合按钮。

<div class="demo-block">
  <ld-button-group>
    <ld-button>左</ld-button>
    <ld-button>中</ld-button>
    <ld-button>右</ld-button>
  </ld-button-group>
  
  <ld-button-group>
    <ld-button type="primary" icon="left">上一页</ld-button>
    <ld-button type="primary" icon="right" icon-position="right">下一页</ld-button>
  </ld-button-group>
</div>

```html
<ld-button-group>
  <ld-button>左</ld-button>
  <ld-button>中</ld-button>
  <ld-button>右</ld-button>
</ld-button-group>

<ld-button-group>
  <ld-button type="primary" icon="left">上一页</ld-button>
  <ld-button type="primary" icon="right" icon-position="right">下一页</ld-button>
</ld-button-group>
```

## API

### Button Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 按钮类型 | `'default' \| 'primary' \| 'dashed' \| 'text' \| 'link'` | `'default'` |
| size | 按钮尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| status | 按钮状态 | `'success' \| 'warning' \| 'error' \| 'danger'` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| loading | 是否加载中 | `boolean` | `false` |
| loading-text | 加载状态文本 | `string` | - |
| icon | 图标名称 | `string` | - |
| icon-position | 图标位置 | `'left' \| 'right'` | `'left'` |
| block | 是否为块级按钮 | `boolean` | `false` |
| href | 链接地址 | `string` | - |
| target | 链接打开方式 | `'_blank' \| '_self' \| '_parent' \| '_top'` | `'_self'` |
| html-type | 原生 button 的 type 属性 | `'button' \| 'submit' \| 'reset'` | `'button'` |

### Button Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击按钮时触发 | `(event: MouseEvent) => void` |
| focus | 获得焦点时触发 | `(event: FocusEvent) => void` |
| blur | 失去焦点时触发 | `(event: FocusEvent) => void` |

### Button Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| focus | 使按钮获得焦点 | - |
| blur | 使按钮失去焦点 | - |

### Button Slots

| 插槽名 | 说明 |
|--------|------|
| default | 按钮内容 |
| icon | 自定义图标 |

## 主题定制

### CSS 变量

```css
:root {
  /* 按钮基础样式 */
  --ld-button-font-size: 14px;
  --ld-button-font-weight: 400;
  --ld-button-line-height: 1.5715;
  --ld-button-border-radius: 6px;
  --ld-button-padding-horizontal: 15px;
  --ld-button-padding-vertical: 4px;
  
  /* 按钮颜色 */
  --ld-button-color: rgba(0, 0, 0, 0.85);
  --ld-button-bg: #fff;
  --ld-button-border: #d9d9d9;
  
  /* 主要按钮 */
  --ld-button-primary-color: #fff;
  --ld-button-primary-bg: #1976d2;
  --ld-button-primary-border: #1976d2;
  
  /* 按钮状态 */
  --ld-button-success-color: #52c41a;
  --ld-button-warning-color: #faad14;
  --ld-button-error-color: #ff4d4f;
  --ld-button-danger-color: #ff4d4f;
}
```

### 自定义样式

```css
/* 自定义按钮样式 */
.my-button {
  --ld-button-bg: #f0f0f0;
  --ld-button-border: #d9d9d9;
  --ld-button-border-radius: 8px;
}
```
