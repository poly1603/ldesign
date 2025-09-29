# 快速开始

本指南将帮助你快速上手 LDesign WebComponent 组件库。

## 安装

使用你喜欢的包管理器安装 LDesign WebComponent：

::: code-group

```bash [npm]
npm install @ldesign/webcomponent
```

```bash [yarn]
yarn add @ldesign/webcomponent
```

```bash [pnpm]
pnpm add @ldesign/webcomponent
```

:::

## 基础用法

### 在 HTML 中使用

最简单的使用方式是直接在 HTML 中引入：

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://unpkg.com/@ldesign/webcomponent/dist/ldesign-webcomponent/ldesign-webcomponent.esm.js"></script>
</head>
<body>
  <ldesign-button type="primary">点击我</ldesign-button>
  <ldesign-input placeholder="请输入内容"></ldesign-input>
</body>
</html>
```

### 在 JavaScript/TypeScript 中使用

```typescript
import { defineCustomElements } from '@ldesign/webcomponent/loader'

// 注册所有组件
defineCustomElements()

// 现在可以在 HTML 中使用组件了
document.body.innerHTML = `
  <ldesign-button type="primary">Hello World</ldesign-button>
`
```

### 按需导入

如果你只需要特定的组件，可以按需导入：

```typescript
// 不含 dist 的按需导入
import '@ldesign/webcomponent/components/ldesign-button'
import '@ldesign/webcomponent/components/ldesign-input'
```

## 框架集成

### React

在 React 中使用 LDesign WebComponent：

```tsx
import React, { useEffect } from 'react'
import { defineCustomElements } from '@ldesign/webcomponent/loader'

// 注册组件
defineCustomElements()

function App() {
  return (
    <div>
      <ldesign-button 
        type="primary" 
        onClick={(e) => console.log('clicked', e)}
      >
        React 中的按钮
      </ldesign-button>
    </div>
  )
}

export default App
```

为了获得更好的 TypeScript 支持，你可以添加类型声明：

```typescript
// types/jsx.d.ts
import { JSX as LocalJSX } from '@ldesign/webcomponent'
import { DetailedHTMLProps, HTMLAttributes } from 'react'

type StencilProps<T> = {
  [P in keyof T]?: Omit<T[P], 'ref'> | HTMLAttributes<T>
}

type ReactProps<T> = {
  [P in keyof T]?: DetailedHTMLProps<HTMLAttributes<T[P]>, T[P]>
}

type StencilToReact<T = LocalJSX.IntrinsicElements, U = HTMLElementTagNameMap> = StencilProps<T> & ReactProps<U>

declare global {
  export namespace JSX {
    interface IntrinsicElements extends StencilToReact {}
  }
}
```

### Vue 3

在 Vue 3 中使用：

```vue
<template>
  <div>
    <ldesign-button 
      type="primary" 
      @ldesignClick="handleClick"
    >
      Vue 中的按钮
    </ldesign-button>
  </div>
</template>

<script setup lang="ts">
import { defineCustomElements } from '@ldesign/webcomponent/loader'

// 注册组件
defineCustomElements()

const handleClick = (event: CustomEvent) => {
  console.log('clicked', event.detail)
}
</script>
```

### Angular

在 Angular 中使用：

```typescript
// app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { defineCustomElements } from '@ldesign/webcomponent/loader'

import { AppComponent } from './app.component'

// 注册组件
defineCustomElements()

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // 允许自定义元素
})
export class AppModule { }
```

```typescript
// app.component.ts
import { Component } from '@angular/core'

@Component({
  selector: 'app-root',
  template: `
    <ldesign-button 
      type="primary" 
      (ldesignClick)="handleClick($event)"
    >
      Angular 中的按钮
    </ldesign-button>
  `
})
export class AppComponent {
  handleClick(event: CustomEvent) {
    console.log('clicked', event.detail)
  }
}
```

## 样式定制

LDesign WebComponent 使用 CSS 变量来支持主题定制。你可以通过覆盖 CSS 变量来自定义样式：

```css
:root {
  /* 主品牌色 */
  --ldesign-brand-color: #1890ff;
  --ldesign-brand-color-hover: #40a9ff;
  --ldesign-brand-color-active: #096dd9;
  
  /* 字体大小 */
  --ls-font-size-base: 16px;
  --ls-font-size-lg: 18px;
  
  /* 间距 */
  --ls-spacing-base: 16px;
  --ls-spacing-lg: 24px;
  
  /* 圆角 */
  --ls-border-radius-base: 4px;
}
```

## 事件处理

LDesign WebComponent 的组件会触发自定义事件，事件名以 `ldesign` 为前缀：

```javascript
// 监听按钮点击事件
document.addEventListener('ldesignClick', (event) => {
  console.log('Button clicked:', event.detail)
})

// 监听输入框变化事件
document.addEventListener('ldesignInput', (event) => {
  console.log('Input changed:', event.detail)
})
```

## 下一步

现在你已经了解了基础用法，可以：

- 查看[完整的组件列表](/components/button)
- 了解[主题定制](/guide/theming)
- 学习[最佳实践](/guide/best-practices)

如果遇到问题，请查看我们的 [FAQ](/guide/faq) 或在 [GitHub](https://github.com/ldesign/webcomponent/issues) 上提出问题。
