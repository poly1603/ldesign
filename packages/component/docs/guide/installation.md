# 安装

本节将介绍如何安装和配置 LDesign 组件库。

## 环境要求

在开始之前，请确保你的开发环境满足以下要求：

- **Node.js**: 16.0 或更高版本
- **包管理器**: npm 7+、yarn 1.22+ 或 pnpm 6+
- **浏览器**: 支持 ES2017 和 Web Components 的现代浏览器

## 包管理器安装

### npm

```bash
npm install @ldesign/components
```

### yarn

```bash
yarn add @ldesign/components
```

### pnpm

```bash
pnpm add @ldesign/components
```

## CDN 引入

你也可以通过 CDN 的方式引入 LDesign，适合快速原型开发或简单项目。

### 完整引入

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LDesign CDN 示例</title>
  
  <!-- 引入样式 -->
  <link rel="stylesheet" href="https://unpkg.com/@ldesign/components/dist/ldesign-component/ldesign-component.css">
</head>
<body>
  <!-- 你的 HTML 内容 -->
  <ld-button type="primary">Hello LDesign!</ld-button>
  
  <!-- 引入组件库 -->
  <script type="module" src="https://unpkg.com/@ldesign/components/dist/ldesign-component/ldesign-component.esm.js"></script>
</body>
</html>
```

### 指定版本

建议在生产环境中指定具体版本号：

```html
<!-- 指定版本 1.0.0 -->
<link rel="stylesheet" href="https://unpkg.com/@ldesign/components@1.0.0/dist/ldesign-component/ldesign-component.css">
<script type="module" src="https://unpkg.com/@ldesign/components@1.0.0/dist/ldesign-component/ldesign-component.esm.js"></script>
```

## 项目配置

### TypeScript 配置

如果你使用 TypeScript，需要在 `tsconfig.json` 中添加以下配置：

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "lib": ["dom", "es2017"],
    "types": ["@ldesign/components"]
  }
}
```

### Vite 配置

如果你使用 Vite，可能需要在 `vite.config.js` 中添加以下配置：

```javascript
import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@ldesign/components']
  }
})
```

### Webpack 配置

如果你使用 Webpack，可能需要添加以下配置：

```javascript
module.exports = {
  // ...其他配置
  resolve: {
    alias: {
      '@ldesign/components': '@ldesign/components/dist/ldesign-component/ldesign-component.esm.js'
    }
  }
}
```

## 框架集成

### React 项目

1. 安装组件库：

```bash
npm install @ldesign/components
```

2. 在 `src/index.js` 或 `src/main.jsx` 中注册组件：

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { defineCustomElements } from '@ldesign/components/loader';
import '@ldesign/components/dist/ldesign-component/ldesign-component.css';
import App from './App';

// 注册 LDesign 组件
defineCustomElements();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

3. 在组件中使用：

```jsx
function App() {
  return (
    <div>
      <ld-button type="primary">React + LDesign</ld-button>
    </div>
  );
}
```

### Vue 3 项目

1. 安装组件库：

```bash
npm install @ldesign/components
```

2. 在 `src/main.js` 中注册组件：

```javascript
import { createApp } from 'vue'
import { defineCustomElements } from '@ldesign/components/loader'
import '@ldesign/components/dist/ldesign-component/ldesign-component.css'
import App from './App.vue'

// 注册 LDesign 组件
defineCustomElements()

const app = createApp(App)

// 配置 Vue 以识别自定义元素
app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ld-')

app.mount('#app')
```

3. 在组件中使用：

```vue
<template>
  <div>
    <ld-button type="primary">Vue 3 + LDesign</ld-button>
  </div>
</template>
```

### Angular 项目

1. 安装组件库：

```bash
npm install @ldesign/components
```

2. 在 `src/main.ts` 中注册组件：

```typescript
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { defineCustomElements } from '@ldesign/components/loader';
import { AppModule } from './app/app.module';

// 注册 LDesign 组件
defineCustomElements();

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
```

3. 在 `app.module.ts` 中添加 CUSTOM_ELEMENTS_SCHEMA：

```typescript
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // 添加这一行
})
export class AppModule { }
```

4. 在 `angular.json` 中引入样式：

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "src/styles.css",
              "node_modules/@ldesign/components/dist/ldesign-component/ldesign-component.css"
            ]
          }
        }
      }
    }
  }
}
```

5. 在组件中使用：

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <ld-button type="primary">Angular + LDesign</ld-button>
    </div>
  `
})
export class AppComponent { }
```

## 按需引入

LDesign 支持按需引入，可以减少打包体积。

### 自动按需引入

如果你使用现代打包工具（如 Vite、Webpack 5），通常会自动进行 Tree Shaking：

```javascript
import { defineCustomElements } from '@ldesign/components/loader';

// 只会打包实际使用的组件
defineCustomElements();
```

### 手动按需引入

你也可以手动引入特定组件：

```javascript
// 只引入 Button 组件
import { defineCustomElement } from '@ldesign/components/dist/components/ld-button';

defineCustomElement();
```

## 样式引入

### 完整样式

```javascript
import '@ldesign/components/dist/ldesign-component/ldesign-component.css';
```

### 按需样式

如果你只使用部分组件，可以只引入对应的样式：

```javascript
import '@ldesign/components/dist/components/ld-button/ld-button.css';
import '@ldesign/components/dist/components/ld-input/ld-input.css';
```

## 验证安装

创建一个简单的 HTML 文件来验证安装是否成功：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LDesign 安装验证</title>
  <link rel="stylesheet" href="https://unpkg.com/@ldesign/components/dist/ldesign-component/ldesign-component.css">
</head>
<body>
  <div style="padding: 20px;">
    <h1>LDesign 安装验证</h1>
    
    <div style="margin: 20px 0;">
      <ld-button type="primary">主要按钮</ld-button>
      <ld-button type="default">默认按钮</ld-button>
    </div>
    
    <div style="margin: 20px 0;">
      <ld-input placeholder="请输入内容"></ld-input>
    </div>
    
    <div style="margin: 20px 0;">
      <ld-card card-title="测试卡片" style="width: 300px;">
        <p>如果你能看到这些组件正常显示，说明 LDesign 安装成功！</p>
      </ld-card>
    </div>
  </div>
  
  <script type="module" src="https://unpkg.com/@ldesign/components/dist/ldesign-component/ldesign-component.esm.js"></script>
</body>
</html>
```

## 常见问题

### 1. 组件不显示

**问题**: 组件标签显示但没有样式或功能。

**解决方案**:
- 确保已正确引入 CSS 文件
- 确保已调用 `defineCustomElements()`
- 检查浏览器控制台是否有错误信息

### 2. TypeScript 类型错误

**问题**: TypeScript 报告找不到模块或类型。

**解决方案**:
- 确保已安装 `@ldesign/components`
- 检查 `tsconfig.json` 配置
- 重启 TypeScript 服务

### 3. 构建错误

**问题**: 打包时出现错误。

**解决方案**:
- 检查构建工具配置
- 确保使用兼容的 Node.js 版本
- 查看具体错误信息并搜索解决方案

### 4. 样式冲突

**问题**: 组件样式与项目样式冲突。

**解决方案**:
- 使用 CSS 变量自定义主题
- 调整 CSS 优先级
- 使用作用域样式

## 下一步

安装完成后，你可以：

1. [快速开始](/guide/getting-started) - 学习基本用法
2. [浏览组件](/components/button) - 查看所有可用组件
3. [主题定制](/guide/theming) - 自定义组件主题
