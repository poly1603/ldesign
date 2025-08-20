# 快速开始

LDesign Web Components 是一个基于 StencilJS 构建的跨框架组件库，可以在任何支持 Web Components 的框架中使用。

## 安装

### NPM 安装

```bash
npm install @ldesign/web-components
```

### Yarn 安装

```bash
yarn add @ldesign/web-components
```

### PNPM 安装

```bash
pnpm add @ldesign/web-components
```

## 在 HTML 中使用

### 1. 引入组件

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 引入组件库 -->
  <script type="module" src="https://unpkg.com/@ldesign/web-components@latest/dist/ldesign/ldesign.esm.js"></script>
  <!-- 引入样式 -->
  <link rel="stylesheet" href="https://unpkg.com/@ldesign/web-components@latest/dist/css/index.css">
</head>
<body>
  <!-- 使用组件 -->
  <ldesign-button type="primary">点击我</ldesign-button>
  <ldesign-input placeholder="请输入内容"></ldesign-input>
  <ldesign-card title="卡片标题">
    这是卡片内容
  </ldesign-card>
</body>
</html>
```

### 2. 本地开发

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="/node_modules/@ldesign/web-components/dist/ldesign/ldesign.esm.js"></script>
  <link rel="stylesheet" href="/node_modules/@ldesign/web-components/dist/css/index.css">
</head>
<body>
  <ldesign-button type="primary">点击我</ldesign-button>
</body>
</html>
```

## 在 Vue 3 中使用

### 1. 安装依赖

```bash
npm install @ldesign/web-components
```

### 2. 在 main.ts 中注册

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import '@ldesign/web-components/dist/css/index.css'

const app = createApp(App)
app.mount('#app')
```

### 3. 在组件中使用

```vue
<template>
  <div>
    <ldesign-button type="primary" @click="handleClick">
      点击我
    </ldesign-button>
    
    <ldesign-input 
      v-model="inputValue" 
      placeholder="请输入内容"
      @change="handleChange"
    />
    
    <ldesign-card title="卡片标题">
      这是卡片内容
    </ldesign-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const inputValue = ref('')

const handleClick = () => {
  console.log('按钮被点击')
}

const handleChange = (value: string) => {
  console.log('输入值变化:', value)
}
</script>
```

## 在 React 中使用

### 1. 安装依赖

```bash
npm install @ldesign/web-components
```

### 2. 在入口文件中引入样式

```typescript
// src/main.tsx
import '@ldesign/web-components/dist/css/index.css'
```

### 3. 在组件中使用

```tsx
import React, { useState } from 'react'

function App() {
  const [inputValue, setInputValue] = useState('')

  const handleClick = () => {
    console.log('按钮被点击')
  }

  const handleChange = (event: CustomEvent) => {
    setInputValue(event.detail)
    console.log('输入值变化:', event.detail)
  }

  return (
    <div>
      <ldesign-button type="primary" onClick={handleClick}>
        点击我
      </ldesign-button>
      
      <ldesign-input 
        value={inputValue}
        placeholder="请输入内容"
        onLdChange={handleChange}
      />
      
      <ldesign-card title="卡片标题">
        这是卡片内容
      </ldesign-card>
    </div>
  )
}

export default App
```

## 在 Angular 中使用

### 1. 安装依赖

```bash
npm install @ldesign/web-components
```

### 2. 在 angular.json 中配置

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "node_modules/@ldesign/web-components/dist/css/index.css",
              "src/styles.css"
            ]
          }
        }
      }
    }
  }
}
```

### 3. 在组件中使用

```typescript
// app.component.ts
import { Component } from '@angular/core'

@Component({
  selector: 'app-root',
  template: `
    <ldesign-button type="primary" (click)="handleClick()">
      点击我
    </ldesign-button>
    
    <ldesign-input 
      [value]="inputValue" 
      placeholder="请输入内容"
      (ldChange)="handleChange($event)"
    />
    
    <ldesign-card title="卡片标题">
      这是卡片内容
    </ldesign-card>
  `
})
export class AppComponent {
  inputValue = ''

  handleClick() {
    console.log('按钮被点击')
  }

  handleChange(event: CustomEvent) {
    this.inputValue = event.detail
    console.log('输入值变化:', event.detail)
  }
}
```

## 事件处理

所有组件都支持标准的事件处理方式：

- **HTML**: `onclick`, `onchange` 等
- **Vue**: `@click`, `@change` 等
- **React**: `onClick`, `onChange` 等
- **Angular**: `(click)`, `(change)` 等

## 属性绑定

组件属性支持以下绑定方式：

- **HTML**: 直接设置属性
- **Vue**: `v-bind` 或简写 `:`
- **React**: 直接传递 props
- **Angular**: 属性绑定 `[]`

## 下一步

- 查看 [组件文档](/components/) 了解所有可用组件
- 阅读 [使用指南](/guide/) 了解更多使用技巧
- 查看 [GitHub 仓库](https://github.com/ldesign/ldesign) 获取最新更新
