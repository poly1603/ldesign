# Button 按钮

按钮用于开始一个即时操作。

## 何时使用

标记了一个（或封装一组）操作命令，响应用户点击行为，触发相应的业务逻辑。

## 按钮系统

Ldesign 的按钮系统基于 Ant Design v5 设计规范，采用 **变体（Variant）** + **颜色（Color）** 的组合系统。

### 按钮变体（Variant）

- **solid** - 实心按钮：用于主要操作，强调性最高
- **outlined** - 描边按钮：默认按钮样式，用于常规操作
- **dashed** - 虚线按钮：用于添加操作
- **filled** - 浅色填充：轻量级强调
- **text** - 文本按钮：用于次级操作
- **link** - 链接按钮：用于链接跳转

### 按钮颜色（Color）

- **default** - 默认颜色
- **primary** - 主色
- **danger** - 危险色
- **success** - 成功色
- **warning** - 警告色
- 以及 13 种预设颜色

### 按钮状态

- **ghost** - 幽灵按钮：用于深色背景
- **disabled** - 禁用状态
- **loading** - 加载状态
- **block** - 块级按钮

## 代码演示

### 基础用法

最简单的用法，包含最常用的按钮类型。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary">Primary</ldesign-button>
    <ldesign-button>Default</ldesign-button>
    <ldesign-button type="dashed">Dashed</ldesign-button>
    <ldesign-button type="text">Text</ldesign-button>
    <ldesign-button type="link">Link</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary">Primary</ldesign-button>
<ldesign-button>Default</ldesign-button>
<ldesign-button type="dashed">Dashed</ldesign-button>
<ldesign-button type="text">Text</ldesign-button>
<ldesign-button type="link">Link</ldesign-button>
```

### Variant + Color 系统

使用 `variant` 和 `color` 属性的组合，可以创建丰富的按钮样式。这是推荐的用法。

<div class="demo-container">
  <h4>Solid 变体（实心）</h4>
  <div class="demo-row">
    <ldesign-button variant="solid" color="primary">Primary</ldesign-button>
    <ldesign-button variant="solid" color="danger">Danger</ldesign-button>
    <ldesign-button variant="solid" color="success">Success</ldesign-button>
    <ldesign-button variant="solid" color="warning">Warning</ldesign-button>
  </div>
  
  <h4>Outlined 变体（描边）</h4>
  <div class="demo-row">
    <ldesign-button variant="outlined" color="default">Default</ldesign-button>
    <ldesign-button variant="outlined" color="primary">Primary</ldesign-button>
    <ldesign-button variant="outlined" color="danger">Danger</ldesign-button>
    <ldesign-button variant="outlined" color="success">Success</ldesign-button>
    <ldesign-button variant="outlined" color="warning">Warning</ldesign-button>
  </div>
  
  <h4>Dashed 变体（虚线）</h4>
  <div class="demo-row">
    <ldesign-button variant="dashed" color="default">Default</ldesign-button>
    <ldesign-button variant="dashed" color="primary">Primary</ldesign-button>
    <ldesign-button variant="dashed" color="danger">Danger</ldesign-button>
  </div>
  
  <h4>Filled 变体（浅色填充）</h4>
  <div class="demo-row">
    <ldesign-button variant="filled" color="default">Default</ldesign-button>
    <ldesign-button variant="filled" color="primary">Primary</ldesign-button>
    <ldesign-button variant="filled" color="danger">Danger</ldesign-button>
    <ldesign-button variant="filled" color="success">Success</ldesign-button>
    <ldesign-button variant="filled" color="warning">Warning</ldesign-button>
  </div>
  
  <h4>Text 变体（文本）</h4>
  <div class="demo-row">
    <ldesign-button variant="text" color="default">Default</ldesign-button>
    <ldesign-button variant="text" color="primary">Primary</ldesign-button>
    <ldesign-button variant="text" color="danger">Danger</ldesign-button>
  </div>
  
  <h4>Link 变体（链接）</h4>
  <div class="demo-row">
    <ldesign-button variant="link" color="default">Default</ldesign-button>
    <ldesign-button variant="link" color="primary">Primary</ldesign-button>
    <ldesign-button variant="link" color="danger">Danger</ldesign-button>
  </div>
</div>

```html
<!-- Solid 变体 -->
<ldesign-button variant="solid" color="primary">Primary</ldesign-button>
<ldesign-button variant="solid" color="danger">Danger</ldesign-button>
<ldesign-button variant="solid" color="success">Success</ldesign-button>
<ldesign-button variant="solid" color="warning">Warning</ldesign-button>

<!-- Outlined 变体 -->
<ldesign-button variant="outlined" color="default">Default</ldesign-button>
<ldesign-button variant="outlined" color="primary">Primary</ldesign-button>

<!-- Dashed 变体 -->
<ldesign-button variant="dashed" color="default">Default</ldesign-button>
<ldesign-button variant="dashed" color="primary">Primary</ldesign-button>

<!-- Filled 变体 -->
<ldesign-button variant="filled" color="primary">Primary</ldesign-button>
<ldesign-button variant="filled" color="danger">Danger</ldesign-button>

<!-- Text 变体 -->
<ldesign-button variant="text" color="primary">Primary</ldesign-button>

<!-- Link 变体 -->
<ldesign-button variant="link" color="primary">Primary</ldesign-button>
```

### 预设颜色

支持 Ant Design 的 13 种预设颜色。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button variant="solid" color="blue">Blue</ldesign-button>
    <ldesign-button variant="solid" color="purple">Purple</ldesign-button>
    <ldesign-button variant="solid" color="cyan">Cyan</ldesign-button>
    <ldesign-button variant="solid" color="green">Green</ldesign-button>
    <ldesign-button variant="solid" color="magenta">Magenta</ldesign-button>
    <ldesign-button variant="solid" color="pink">Pink</ldesign-button>
    <ldesign-button variant="solid" color="red">Red</ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button variant="solid" color="orange">Orange</ldesign-button>
    <ldesign-button variant="solid" color="yellow">Yellow</ldesign-button>
    <ldesign-button variant="solid" color="volcano">Volcano</ldesign-button>
    <ldesign-button variant="solid" color="geekblue">Geekblue</ldesign-button>
    <ldesign-button variant="solid" color="lime">Lime</ldesign-button>
    <ldesign-button variant="solid" color="gold">Gold</ldesign-button>
  </div>
</div>

### 按钮尺寸

按钮有大、中、小三种尺寸。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary" size="large">Large</ldesign-button>
    <ldesign-button type="primary" size="middle">Middle</ldesign-button>
    <ldesign-button type="primary" size="small">Small</ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button variant="outlined" color="primary" size="large">Large</ldesign-button>
    <ldesign-button variant="outlined" color="primary" size="middle">Middle</ldesign-button>
    <ldesign-button variant="outlined" color="primary" size="small">Small</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" size="large">Large</ldesign-button>
<ldesign-button type="primary" size="middle">Middle</ldesign-button>
<ldesign-button type="primary" size="small">Small</ldesign-button>
```

### 按钮形状

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary">Default</ldesign-button>
    <ldesign-button type="primary" shape="round">Round</ldesign-button>
    <ldesign-button type="primary" shape="circle" icon="search"></ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button variant="outlined" color="primary">Default</ldesign-button>
    <ldesign-button variant="outlined" color="primary" shape="round">Round</ldesign-button>
    <ldesign-button variant="outlined" color="primary" shape="circle" icon="search"></ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary">Default</ldesign-button>
<ldesign-button type="primary" shape="round">Round</ldesign-button>
<ldesign-button type="primary" shape="circle" icon="search"></ldesign-button>
```

### 按钮图标

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary" icon="search">搜索</ldesign-button>
    <ldesign-button type="primary" icon="download">下载</ldesign-button>
    <ldesign-button type="primary" icon="cloud-upload">上传</ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button type="primary" icon="arrow-left">返回</ldesign-button>
    <ldesign-button type="primary" icon="arrow-right" icon-position="end">下一步</ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button shape="circle" icon="search"></ldesign-button>
    <ldesign-button shape="circle" icon="home"></ldesign-button>
    <ldesign-button type="primary" shape="circle" icon="download"></ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" icon="search">搜索</ldesign-button>
<ldesign-button type="primary" icon="arrow-right" icon-position="end">下一步</ldesign-button>
<ldesign-button shape="circle" icon="search"></ldesign-button>
```

### 加载状态

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary" loading>加载中</ldesign-button>
    <ldesign-button type="primary" loading>
      <span>Loading</span>
    </ldesign-button>
    <ldesign-button type="primary" loading icon="cloud-download">下载中</ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button variant="outlined" color="primary" loading>Loading</ldesign-button>
    <ldesign-button variant="text" color="primary" loading>Loading</ldesign-button>
    <ldesign-button shape="circle" loading></ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" loading>加载中</ldesign-button>
<ldesign-button type="primary" loading icon="cloud-download">下载中</ldesign-button>
```

### 禁用状态

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary">Primary</ldesign-button>
    <ldesign-button type="primary" disabled>Primary(disabled)</ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button>Default</ldesign-button>
    <ldesign-button disabled>Default(disabled)</ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button type="text">Text</ldesign-button>
    <ldesign-button type="text" disabled>Text(disabled)</ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button type="link">Link</ldesign-button>
    <ldesign-button type="link" disabled>Link(disabled)</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" disabled>Primary(disabled)</ldesign-button>
<ldesign-button disabled>Default(disabled)</ldesign-button>
```

### 危险按钮

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary" danger>删除</ldesign-button>
    <ldesign-button danger>删除</ldesign-button>
    <ldesign-button type="dashed" danger>删除</ldesign-button>
    <ldesign-button type="text" danger>删除</ldesign-button>
    <ldesign-button type="link" danger>删除</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" danger>删除</ldesign-button>
<ldesign-button danger>删除</ldesign-button>
<ldesign-button type="text" danger>删除</ldesign-button>
```

### 幽灵按钮

幽灵按钮将按钮的内容反色，背景变为透明，常用在有色背景上。

<div class="demo-container" style="background: rgb(190, 200, 200); padding: 16px;">
  <div class="demo-row">
    <ldesign-button type="primary" ghost>Primary</ldesign-button>
    <ldesign-button ghost>Default</ldesign-button>
    <ldesign-button type="dashed" ghost>Dashed</ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button variant="solid" color="primary" ghost>Primary</ldesign-button>
    <ldesign-button variant="solid" color="danger" ghost>Danger</ldesign-button>
    <ldesign-button variant="outlined" color="primary" ghost>Outlined</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" ghost>Primary</ldesign-button>
<ldesign-button variant="solid" color="danger" ghost>Danger</ldesign-button>
```

### Block 按钮

`block` 属性将使按钮适合其父宽度。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary" block>Primary</ldesign-button>
    <ldesign-button block>Default</ldesign-button>
    <ldesign-button type="dashed" block>Dashed</ldesign-button>
    <ldesign-button type="link" block>Link</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" block>Primary</ldesign-button>
<ldesign-button block>Default</ldesign-button>
```

## API

### Button Props

| 属性 | 说明 | 类型 | 默认值 | 版本 |
|------|------|------|--------|------|
| **type** | 按钮类型（语法糖） | `primary` \| `dashed` \| `text` \| `link` \| `default` | `default` | - |
| **variant** | 按钮变体 | `solid` \| `outlined` \| `dashed` \| `filled` \| `text` \| `link` | - | 推荐 |
| **color** | 按钮颜色 | `default` \| `primary` \| `danger` \| `success` \| `warning` \| PresetColors | - | 推荐 |
| **size** | 按钮大小 | `large` \| `middle` \| `small` | `middle` | - |
| **shape** | 按钮形状 | `default` \| `circle` \| `round` | `default` | - |
| **icon** | 图标名称 | string | - | - |
| **iconPosition** | 图标位置 | `start` \| `end` | `start` | - |
| **loading** | 加载状态 | boolean | false | - |
| **loadingDelay** | 加载延迟时间（毫秒） | number | - | - |
| **loadingIcon** | 自定义加载图标 | string | - | - |
| **disabled** | 禁用状态 | boolean | false | - |
| **danger** | 危险按钮 | boolean | false | - |
| **ghost** | 幽灵按钮 | boolean | false | - |
| **block** | 块级按钮 | boolean | false | - |
| **href** | 跳转链接 | string | - | - |
| **target** | 链接目标 | string | - | - |
| **htmlType** | 原生 type | `submit` \| `reset` \| `button` | `button` | - |
| **autoInsertSpace** | 自动插入空格 | boolean | true | - |
| **onClick** | 点击事件 | (event: MouseEvent) => void | - | - |

### PresetColors

```typescript
type PresetColors = 
  | 'blue' 
  | 'purple' 
  | 'cyan' 
  | 'green' 
  | 'magenta' 
  | 'pink' 
  | 'red' 
  | 'orange' 
  | 'yellow' 
  | 'volcano' 
  | 'geekblue' 
  | 'lime' 
  | 'gold';
```

## 设计规范

### 推荐用法

1. **优先使用 variant + color 系统**：这提供了更灵活和语义化的按钮样式控制
2. **type 属性作为快捷方式**：对于常见场景，可以直接使用 type 属性
3. **一个操作区域只有一个主按钮**：避免多个强调按钮造成选择困难
4. **合理使用危险按钮**：删除、移除等危险操作应使用 danger 属性

### 最佳实践

```html
<!-- 推荐：使用 variant + color -->
<ldesign-button variant="solid" color="primary">确定</ldesign-button>
<ldesign-button variant="outlined" color="default">取消</ldesign-button>

<!-- 快捷方式：使用 type -->
<ldesign-button type="primary">确定</ldesign-button>
<ldesign-button>取消</ldesign-button>

<!-- 危险操作 -->
<ldesign-button variant="solid" color="danger">删除</ldesign-button>
<ldesign-button type="primary" danger>删除</ldesign-button>
```

## 主题变量（Design Token）

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| --ld-primary | #1677ff | 主色 |
| --ld-primary-hover | #4096ff | 主色悬停态 |
| --ld-primary-active | #0958d9 | 主色激活态 |
| --ld-error | #ff4d4f | 错误色 |
| --ld-error-hover | #ff7875 | 错误色悬停态 |
| --ld-error-active | #d9363e | 错误色激活态 |
| --ld-success | #52c41a | 成功色 |
| --ld-success-hover | #73d13d | 成功色悬停态 |
| --ld-success-active | #389e0d | 成功色激活态 |
| --ld-warning | #faad14 | 警告色 |
| --ld-warning-hover | #ffc53d | 警告色悬停态 |
| --ld-warning-active | #d48806 | 警告色激活态 |
| --ld-text | rgba(0, 0, 0, 0.88) | 文本色 |
| --ld-border | #d9d9d9 | 边框色 |
| --ld-bg | #ffffff | 背景色 |