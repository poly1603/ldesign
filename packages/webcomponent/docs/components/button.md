# Button 按钮

按钮用于触发一个操作，如提交表单、打开对话框、取消操作等。

## 基础用法

使用 `type` 属性来定义按钮的样式类型。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary">主要按钮</ldesign-button>
    <ldesign-button type="secondary">次要按钮</ldesign-button>
    <ldesign-button type="outline">边框按钮</ldesign-button>
    <ldesign-button type="text">文字按钮</ldesign-button>
    <ldesign-button type="danger">危险按钮</ldesign-button>
    <ldesign-button type="success">成功</ldesign-button>
    <ldesign-button type="warning">警告</ldesign-button>
    <ldesign-button type="link">链接</ldesign-button>
    <ldesign-button type="dashed">虚线</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary">主要按钮</ldesign-button>
<ldesign-button type="secondary">次要按钮</ldesign-button>
<ldesign-button type="outline">边框按钮</ldesign-button>
<ldesign-button type="text">文字按钮</ldesign-button>
<ldesign-button type="danger">危险按钮</ldesign-button>
<ldesign-button type="success">成功</ldesign-button>
<ldesign-button type="warning">警告</ldesign-button>
<ldesign-button type="link">链接</ldesign-button>
<ldesign-button type="dashed">虚线</ldesign-button>
```

## 按钮尺寸

使用 `size` 属性来定义按钮的大小。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary" size="small">小按钮</ldesign-button>
    <ldesign-button type="primary" size="medium">中按钮</ldesign-button>
    <ldesign-button type="primary" size="large">大按钮</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" size="small">小按钮</ldesign-button>
<ldesign-button type="primary" size="medium">中按钮</ldesign-button>
<ldesign-button type="primary" size="large">大按钮</ldesign-button>
```

## 按钮形状

使用 `shape` 属性来定义按钮的形状。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary" shape="rectangle">矩形按钮</ldesign-button>
    <ldesign-button type="primary" shape="round">圆角按钮</ldesign-button>
    <ldesign-button type="primary" shape="circle" icon="heart" aria-label="喜欢"></ldesign-button>
    <ldesign-button type="primary" shape="square" icon="heart" aria-label="喜欢"></ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" shape="rectangle">矩形按钮</ldesign-button>
<ldesign-button type="primary" shape="round">圆角按钮</ldesign-button>
<ldesign-button type="primary" shape="circle" icon="heart" aria-label="喜欢"></ldesign-button>
<ldesign-button type="primary" shape="square" icon="heart" aria-label="喜欢"></ldesign-button>
```

## 带图标的按钮

使用 `icon` 属性来为按钮添加图标；通过 `icon-position` 控制图标位置。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary" icon="download">下载</ldesign-button>
    <ldesign-button type="secondary" icon="search">搜索</ldesign-button>
    <ldesign-button type="outline" icon="plus">添加</ldesign-button>
    <ldesign-button type="text" icon="heart">收藏</ldesign-button>
    <ldesign-button type="primary" icon="arrow-right" icon-position="right">下一步</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" icon="download">下载</ldesign-button>
<ldesign-button type="secondary" icon="search">搜索</ldesign-button>
<ldesign-button type="outline" icon="plus">添加</ldesign-button>
<ldesign-button type="text" icon="heart">收藏</ldesign-button>
<ldesign-button type="primary" icon="arrow-right" icon-position="right">下一步</ldesign-button>
```

## 按钮状态

按钮有禁用和加载两种状态。

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">禁用状态:</span>
    <ldesign-button type="primary" disabled>主要按钮</ldesign-button>
    <ldesign-button type="secondary" disabled>次要按钮</ldesign-button>
    <ldesign-button type="outline" disabled>边框按钮</ldesign-button>
  </div>
  <div class="demo-row">
    <span class="demo-label">加载状态:</span>
    <ldesign-button type="primary" loading>加载中</ldesign-button>
    <ldesign-button type="secondary" loading>加载中</ldesign-button>
    <ldesign-button type="outline" loading>加载中</ldesign-button>
  </div>
</div>

```html
<!-- 禁用状态 -->
<ldesign-button type="primary" disabled>主要按钮</ldesign-button>
<ldesign-button type="secondary" disabled>次要按钮</ldesign-button>
<ldesign-button type="outline" disabled>边框按钮</ldesign-button>

<!-- 加载状态 -->
<ldesign-button type="primary" loading>加载中</ldesign-button>
<ldesign-button type="secondary" loading>加载中</ldesign-button>
<ldesign-button type="outline" loading>加载中</ldesign-button>
```

## 原生类型

通过 `native-type` 指定原生按钮类型（表单中常用）。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary" native-type="submit">提交</ldesign-button>
    <ldesign-button type="secondary" native-type="reset">重置</ldesign-button>
  </div>
</div>

```html
<form>
  <ldesign-button type="primary" native-type="submit">提交</ldesign-button>
  <ldesign-button type="secondary" native-type="reset">重置</ldesign-button>
</form>
```

## 块级按钮

使用 `block` 属性可以让按钮适合其父容器的宽度。

<div class="demo-container">
  <ldesign-button type="primary" block>块级按钮</ldesign-button>
</div>

```html
<ldesign-button type="primary" block>块级按钮</ldesign-button>
```

## 事件处理

按钮组件会触发 `ldesignClick` 自定义事件。

<div class="demo-container">
  <ldesign-button type="primary" id="event-demo">点击我</ldesign-button>
  <p id="event-result">点击次数: 0</p>
</div>

```html
<ldesign-button type="primary" id="event-demo">点击我</ldesign-button>

<script>
let count = 0
document.getElementById('event-demo').addEventListener('ldesignClick', () => {
  count++
  console.log(`按钮被点击了 ${count} 次`)
})
</script>
```

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  let count = 0
  const button = document.getElementById('event-demo')
  const result = document.getElementById('event-result')
  
  if (button && result) {
    button.addEventListener('ldesignClick', () => {
      count++
      result.textContent = `点击次数: ${count}`
    })
  }
})
</script>

## API

### 属性

|| 属性名 | 类型 | 默认值 | 说明 |
||--------|------|--------|------|
|| `type` | `'primary' \| 'secondary' \| 'outline' \| 'text' \| 'danger' \| 'success' \| 'warning' \| 'link' \| 'dashed'` | `'primary'` | 按钮类型 |
|| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 按钮尺寸 |
|| `shape` | `'rectangle' \| 'round' \| 'circle' \| 'square'` | `'rectangle'` | 按钮形状 |
|| `disabled` | `boolean` | `false` | 是否禁用 |
|| `loading` | `boolean` | `false` | 是否加载中 |
|| `icon` | `string` | - | 图标名称 |
|| `icon-position` | `'left' \| 'right'` | `'left'` | 图标位置 |
|| `native-type` | `'button' \| 'submit' \| 'reset'` | `'button'` | 原生按钮类型 |
|| `block` | `boolean` | `false` | 是否为块级按钮 |

### 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `ldesignClick` | 点击按钮时触发 | `(event: MouseEvent) => void` |

### CSS 变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `--ls-button-height-small` | `40px` | 小按钮高度 |
| `--ls-button-height-medium` | `44px` | 中按钮高度 |
| `--ls-button-height-large` | `48px` | 大按钮高度 |
| `--ls-border-radius-base` | `6px` | 基础圆角 |
| `--ls-border-radius-xl` | `16px` | 大圆角 |
| `--ldesign-brand-color` | `#722ED1` | 主品牌色 |
| `--ldesign-brand-color-hover` | `#7334cb` | 主品牌色悬停态 |
| `--ldesign-brand-color-active` | `#491f84` | 主品牌色激活态 |

## 无障碍

Button 组件遵循 WAI-ARIA 规范：

- 支持键盘导航（Enter 和 Space 键）
- 提供 `aria-disabled` 属性表示禁用状态
- 提供 `aria-busy` 属性表示加载状态
- 支持焦点管理和视觉反馈

## 设计指南

### 何时使用

- 标记了一个（或封装一组）操作命令，响应用户点击行为，触发相应的业务逻辑
- 对于需要用户处理事务，又不希望跳转页面以致打断工作流程的场景，可以使用 Modal 对话框承载相应的操作

### 何时不使用

- 当需要跳转到另一个页面时，使用链接而不是按钮
- 当操作是破坏性的且不可逆时，考虑使用确认对话框

### 最佳实践

- 按钮文字应该清晰地表达按钮的作用
- 在一个界面中，主要按钮只能有一个
- 按钮的排列应该符合用户的操作习惯
- 重要的操作应该使用主要按钮，次要操作使用次要按钮
