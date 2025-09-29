# 安装

本页面将指导你如何在项目中安装和配置 LDesign WebComponent。

## 环境要求

在开始之前，请确保你的开发环境满足以下要求：

- **Node.js**: 版本 16.0 或更高
- **现代浏览器**: 支持 ES2017+ 和 Web Components

## 包管理器安装

### npm

```bash
npm install @ldesign/webcomponent
```

### yarn

```bash
yarn add @ldesign/webcomponent
```

### pnpm

```bash
pnpm add @ldesign/webcomponent
```

## CDN 引入

如果你不想使用包管理器，也可以通过 CDN 直接引入：

### 通过 unpkg

```html
<!-- ES Module -->
<script type="module" src="https://unpkg.com/@ldesign/webcomponent/dist/ldesign-webcomponent/ldesign-webcomponent.esm.js"></script>

<!-- UMD (适用于不支持 ES Module 的浏览器) -->
<script nomodule src="https://unpkg.com/@ldesign/webcomponent/dist/ldesign-webcomponent/ldesign-webcomponent.js"></script>
```

### 通过 jsDelivr

```html
<!-- ES Module -->
<script type="module" src="https://cdn.jsdelivr.net/npm/@ldesign/webcomponent/dist/ldesign-webcomponent/ldesign-webcomponent.esm.js"></script>

<!-- UMD -->
<script nomodule src="https://cdn.jsdelivr.net/npm/@ldesign/webcomponent/dist/ldesign-webcomponent/ldesign-webcomponent.js"></script>
```

## 完整引入

### 在 JavaScript/TypeScript 中

```typescript
import { defineCustomElements } from '@ldesign/webcomponent/loader'

// 注册所有组件
defineCustomElements()
```

### 在 HTML 中

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LDesign WebComponent Demo</title>
  
  <!-- 引入组件库 -->
  <script type="module" src="https://unpkg.com/@ldesign/webcomponent/dist/ldesign-webcomponent/ldesign-webcomponent.esm.js"></script>
  <script nomodule src="https://unpkg.com/@ldesign/webcomponent/dist/ldesign-webcomponent/ldesign-webcomponent.js"></script>
</head>
<body>
  <!-- 使用组件 -->
  <ldesign-button type="primary">Hello World</ldesign-button>
</body>
</html>
```

## 按需引入

如果你只需要使用特定的组件，可以按需引入以减少包体积：

```typescript
// 只引入需要的组件（不含 dist）
import '@ldesign/webcomponent/components/ldesign-button'
import '@ldesign/webcomponent/components/ldesign-input'
import '@ldesign/webcomponent/components/ldesign-icon'
```

## 框架集成

### React 项目

1. 安装组件库：

```bash
npm install @ldesign/webcomponent
```

2. 在应用入口文件中注册组件：

```typescript
// src/index.tsx 或 src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { defineCustomElements } from '@ldesign/webcomponent/loader'
import App from './App'

// 注册 Web Components
defineCustomElements()

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)
```

3. 添加 TypeScript 类型支持（可选）：

```typescript
// src/types/jsx.d.ts
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

### Vue 3 项目

1. 安装组件库：

```bash
npm install @ldesign/webcomponent
```

2. 在 main.ts 中注册组件：

```typescript
// src/main.ts
import { createApp } from 'vue'
import { defineCustomElements } from '@ldesign/webcomponent/loader'
import App from './App.vue'

// 注册 Web Components
defineCustomElements()

const app = createApp(App)
app.mount('#app')
```

3. 配置 Vue 识别自定义元素：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 将所有以 ldesign- 开头的标签视为自定义元素
          isCustomElement: (tag) => tag.startsWith('ldesign-')
        }
      }
    })
  ]
})
```

### Angular 项目

1. 安装组件库：

```bash
npm install @ldesign/webcomponent
```

2. 在 main.ts 中注册组件：

```typescript
// src/main.ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { defineCustomElements } from '@ldesign/webcomponent/loader'
import { AppModule } from './app/app.module'

// 注册 Web Components
defineCustomElements()

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err))
```

3. 在模块中添加 CUSTOM_ELEMENTS_SCHEMA：

```typescript
// src/app/app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { AppComponent } from './app.component'

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // 允许使用自定义元素
})
export class AppModule { }
```

## 样式引入

LDesign WebComponent 的样式已经内置在组件中，无需额外引入 CSS 文件。但如果你想自定义主题，可以通过 CSS 变量来实现：

```css
/* 在你的全局样式文件中 */
:root {
  --ldesign-brand-color: #1890ff;
  --ldesign-brand-color-hover: #40a9ff;
  --ldesign-brand-color-active: #096dd9;
}
```

## 浏览器兼容性

### 现代浏览器

LDesign WebComponent 原生支持所有现代浏览器：

- Chrome 60+
- Firefox 63+
- Safari 11+
- Edge 79+

### 旧版浏览器支持

对于不支持 Web Components 的旧版浏览器，你需要引入 polyfill：

```html
<!-- 在组件库之前引入 polyfill -->
<script src="https://unpkg.com/@webcomponents/webcomponentsjs@2/webcomponents-loader.js"></script>
<script type="module" src="https://unpkg.com/@ldesign/webcomponent/dist/ldesign-webcomponent/ldesign-webcomponent.esm.js"></script>
```

## 验证安装

安装完成后，你可以创建一个简单的页面来验证组件库是否正常工作：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>LDesign WebComponent 测试</title>
  <script type="module" src="https://unpkg.com/@ldesign/webcomponent/dist/ldesign-webcomponent/ldesign-webcomponent.esm.js"></script>
</head>
<body>
  <h1>LDesign WebComponent 测试页面</h1>
  
  <ldesign-button type="primary">主要按钮</ldesign-button>
  <ldesign-button type="secondary">次要按钮</ldesign-button>
  
  <br><br>
  
  <ldesign-icon name="heart" color="red"></ldesign-icon>
  <ldesign-icon name="star" color="orange"></ldesign-icon>
  <ldesign-icon name="download" color="blue"></ldesign-icon>
  
  <script>
    // 测试事件
    document.addEventListener('ldesignClick', (e) => {
      alert('按钮被点击了！')
    })
  </script>
</body>
</html>
```

如果页面正常显示按钮和图标，说明安装成功！

## 下一步

- [快速开始](/guide/getting-started) - 学习基本用法
- [组件总览](/components/button) - 查看所有可用组件
- [主题定制](/guide/theming) - 了解如何自定义主题
