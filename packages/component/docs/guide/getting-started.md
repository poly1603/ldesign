# 快速开始

本节将介绍如何在项目中使用 LDesign。

## 安装

### 使用包管理器

我们建议您使用包管理器（npm、yarn、pnpm）安装 LDesign，然后您就可以使用打包工具，例如 Vite、webpack。

```bash
# 选择一个你喜欢的包管理器

# npm
npm install @ldesign/components

# yarn
yarn add @ldesign/components

# pnpm
pnpm add @ldesign/components
```

### 浏览器直接引入

直接通过浏览器的 HTML 标签导入 LDesign，然后就可以使用全局变量 `LDesign` 了。

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LDesign 示例</title>
</head>
<body>
  <!-- 引入样式 -->
  <link rel="stylesheet" href="https://unpkg.com/@ldesign/components/dist/ldesign-component/ldesign-component.css">
  
  <!-- 引入组件库 -->
  <script type="module" src="https://unpkg.com/@ldesign/components/dist/ldesign-component/ldesign-component.esm.js"></script>
  
  <!-- 使用组件 -->
  <ld-button type="primary">Hello LDesign!</ld-button>
</body>
</html>
```

## 用法

### 完整引入

如果你对打包后的文件大小不是很在乎，那么使用完整导入会更方便。

```javascript
// main.js
import { defineCustomElements } from '@ldesign/components/loader';

// 注册所有组件
defineCustomElements();
```

### 按需引入

LDesign 支持基于 ES modules 的 tree shaking，直接引入 `@ldesign/components` 即可。

```javascript
// 只引入需要的组件
import { defineCustomElements } from '@ldesign/components/dist/components/ld-button';
import { defineCustomElements as defineInput } from '@ldesign/components/dist/components/ld-input';

// 注册组件
defineCustomElements();
defineInput();
```

## 在不同框架中使用

### React

在 React 项目中使用 LDesign：

```tsx
// App.tsx
import React, { useEffect } from 'react';
import { defineCustomElements } from '@ldesign/components/loader';

// 注册组件
defineCustomElements();

// 类型声明（可选）
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ld-button': any;
      'ld-input': any;
      'ld-card': any;
    }
  }
}

function App() {
  const handleButtonClick = (event: CustomEvent) => {
    console.log('按钮被点击了', event.detail);
  };

  return (
    <div className="App">
      <h1>LDesign + React 示例</h1>
      
      <ld-button 
        type="primary" 
        onLdClick={handleButtonClick}
      >
        主要按钮
      </ld-button>
      
      <ld-input 
        placeholder="请输入内容"
        onLdChange={(e: CustomEvent) => console.log(e.detail)}
      />
      
      <ld-card card-title="React 卡片">
        <p>这是在 React 中使用的 LDesign 卡片组件</p>
      </ld-card>
    </div>
  );
}

export default App;
```

### Vue 3

在 Vue 3 项目中使用 LDesign：

```vue
<!-- App.vue -->
<template>
  <div class="app">
    <h1>LDesign + Vue 3 示例</h1>
    
    <ld-button 
      type="primary" 
      @ldClick="handleButtonClick"
    >
      主要按钮
    </ld-button>
    
    <ld-input 
      :value="inputValue"
      placeholder="请输入内容"
      @ldChange="handleInputChange"
    />
    
    <ld-card card-title="Vue 卡片">
      <p>这是在 Vue 中使用的 LDesign 卡片组件</p>
      <p>输入值：{{ inputValue }}</p>
    </ld-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { defineCustomElements } from '@ldesign/components/loader';

// 注册组件
onMounted(() => {
  defineCustomElements();
});

const inputValue = ref('');

const handleButtonClick = (event: CustomEvent) => {
  console.log('按钮被点击了', event.detail);
};

const handleInputChange = (event: CustomEvent) => {
  inputValue.value = event.detail;
};
</script>
```

### Angular

在 Angular 项目中使用 LDesign：

```typescript
// app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { defineCustomElements } from '@ldesign/components/loader';

import { AppComponent } from './app.component';

// 注册组件
defineCustomElements();

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // 允许使用自定义元素
})
export class AppModule {}
```

```typescript
// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="app">
      <h1>LDesign + Angular 示例</h1>
      
      <ld-button 
        type="primary" 
        (ldClick)="handleButtonClick($event)"
      >
        主要按钮
      </ld-button>
      
      <ld-input 
        [value]="inputValue"
        placeholder="请输入内容"
        (ldChange)="handleInputChange($event)"
      ></ld-input>
      
      <ld-card card-title="Angular 卡片">
        <p>这是在 Angular 中使用的 LDesign 卡片组件</p>
        <p>输入值：{{ inputValue }}</p>
      </ld-card>
    </div>
  `,
})
export class AppComponent {
  inputValue = '';

  handleButtonClick(event: CustomEvent) {
    console.log('按钮被点击了', event.detail);
  }

  handleInputChange(event: CustomEvent) {
    this.inputValue = event.detail;
  }
}
```

## 开始使用

现在你可以启动你的项目了。对于大部分示例，这里都会有一个 Hello world 页面。

<div class="demo-container">
  <div class="demo-title">Hello World</div>
  <div class="demo-description">一个简单的示例</div>
  <div class="demo-showcase">
    <ld-button type="primary">Hello LDesign!</ld-button>
    <ld-input placeholder="输入一些内容..."></ld-input>
    <ld-card card-title="欢迎使用 LDesign" style="width: 300px; margin-top: 16px;">
      <p>🎉 恭喜你成功运行了第一个 LDesign 程序！</p>
      <div slot="footer">
        <ld-button type="primary" size="small">开始探索</ld-button>
      </div>
    </ld-card>
  </div>
</div>

## 下一步

现在你已经把 LDesign 添加到了你的项目中，是时候阅读我们的组件文档来了解更多组件的使用了。

- [Button 按钮](/components/button)
- [Input 输入框](/components/input)  
- [Card 卡片](/components/card)
- [Modal 模态框](/components/modal)
- [Table 表格](/components/table)
- [Form 表单](/components/form)

## 常见问题

### TypeScript 支持

LDesign 使用 TypeScript 编写，提供了完整的类型定义。

### 样式覆盖

如果你想要覆盖组件的样式，可以通过 CSS 变量或者直接覆盖 CSS 类名：

```css
/* 通过 CSS 变量覆盖 */
:root {
  --ld-color-primary: #your-color;
}

/* 直接覆盖样式 */
ld-button {
  --ld-button-primary-bg: #your-color;
}
```

### 浏览器兼容性

LDesign 支持所有现代浏览器。如果你需要支持 IE，请使用相应的 polyfill。
