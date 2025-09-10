# 安装

本章节将详细介绍如何在不同环境下安装和配置 LDesign Component。

## 环境要求

### 必需依赖

- **Node.js**: >= 18.0.0
- **Vue**: >= 3.3.0

### 推荐依赖

- **TypeScript**: >= 5.0.0
- **Vite**: >= 5.0.0
- **pnpm**: >= 8.0.0

### 浏览器支持

| 浏览器 | 版本 |
|--------|------|
| Chrome | >= 70 |
| Firefox | >= 78 |
| Safari | >= 12 |
| Edge | >= 79 |

## 包管理器安装

### pnpm (推荐)

```bash
# 安装组件库
pnpm add @ldesign/component

# 如果需要图标库
pnpm add @ldesign/icons

# 开发依赖 (可选)
pnpm add -D @ldesign/component-dev-tools
```

### npm

```bash
# 安装组件库
npm install @ldesign/component

# 如果需要图标库
npm install @ldesign/icons
```

### yarn

```bash
# 安装组件库
yarn add @ldesign/component

# 如果需要图标库
yarn add @ldesign/icons
```

## CDN 引入

### 通过 unpkg

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 引入样式 -->
  <link rel="stylesheet" href="https://unpkg.com/@ldesign/component@latest/dist/style.css">
</head>
<body>
  <div id="app">
    <l-button type="primary">Hello LDesign</l-button>
  </div>

  <!-- 引入 Vue 3 -->
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  
  <!-- 引入 LDesign Component -->
  <script src="https://unpkg.com/@ldesign/component@latest/dist/ldesign-component.umd.js"></script>
  
  <script>
    const { createApp } = Vue
    const { LButton } = LDesignComponent
    
    createApp({
      components: {
        LButton
      }
    }).mount('#app')
  </script>
</body>
</html>
```

### 通过 jsDelivr

```html
<!-- 样式 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@ldesign/component@latest/dist/style.css">

<!-- JavaScript -->
<script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@ldesign/component@latest/dist/ldesign-component.umd.js"></script>
```

## 项目配置

### Vite 项目

#### 创建项目

```bash
# 使用 Vite 创建 Vue 3 项目
pnpm create vue@latest my-ldesign-app

# 进入项目目录
cd my-ldesign-app

# 安装依赖
pnpm install

# 安装 LDesign Component
pnpm add @ldesign/component
```

#### 配置 vite.config.ts

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: `@import "@ldesign/component/styles/variables.less";`
      }
    }
  }
})
```

#### 配置 main.ts

```typescript
import { createApp } from 'vue'
import App from './App.vue'

// 引入 LDesign Component
import LDesignComponent from '@ldesign/component'
import '@ldesign/component/styles'

const app = createApp(App)
app.use(LDesignComponent)
app.mount('#app')
```

### Vue CLI 项目

#### 创建项目

```bash
# 安装 Vue CLI
npm install -g @vue/cli

# 创建项目
vue create my-ldesign-app

# 进入项目目录
cd my-ldesign-app

# 安装 LDesign Component
npm install @ldesign/component
```

#### 配置 vue.config.js

```javascript
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          javascriptEnabled: true,
          additionalData: `@import "@ldesign/component/styles/variables.less";`
        }
      }
    }
  }
})
```

### Nuxt 3 项目

#### 安装

```bash
# 创建 Nuxt 3 项目
npx nuxi@latest init my-ldesign-nuxt-app

# 进入项目目录
cd my-ldesign-nuxt-app

# 安装依赖
pnpm install

# 安装 LDesign Component
pnpm add @ldesign/component
```

#### 配置 nuxt.config.ts

```typescript
export default defineNuxtConfig({
  modules: [
    '@ldesign/component/nuxt'
  ],
  css: [
    '@ldesign/component/styles'
  ],
  vite: {
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true
        }
      }
    }
  }
})
```

### Webpack 项目

#### 配置 webpack.config.js

```javascript
const path = require('path')

module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
                additionalData: `@import "@ldesign/component/styles/variables.less";`
              }
            }
          }
        ]
      }
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
}
```

## TypeScript 配置

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["@ldesign/component/global"]
  },
  "include": ["src/**/*.ts", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 全局类型声明

创建 `src/types/global.d.ts`：

```typescript
import type { App } from 'vue'
import type { LDesignComponent } from '@ldesign/component'

declare module '@vue/runtime-core' {
  interface GlobalComponents {
    LButton: typeof import('@ldesign/component')['LButton']
    LInput: typeof import('@ldesign/component')['LInput']
    // 添加其他组件类型...
  }
}

declare global {
  const LDesignComponent: LDesignComponent
}
```

## 样式配置

### 完整引入样式

```typescript
// main.ts
import '@ldesign/component/styles'
```

### 按需引入样式

```typescript
// 只引入需要的组件样式
import '@ldesign/component/styles/button'
import '@ldesign/component/styles/input'
```

### 自定义主题

```less
// styles/theme.less
@import '@ldesign/component/styles/variables.less';

// 覆盖主题变量
:root {
  --ldesign-brand-color: #1890ff;
  --ldesign-success-color: #52c41a;
  --ldesign-warning-color: #faad14;
  --ldesign-error-color: #ff4d4f;
}

// 引入组件样式
@import '@ldesign/component/styles/index.less';
```

## 验证安装

创建一个简单的测试页面验证安装是否成功：

```vue
<template>
  <div class="test-page">
    <h1>LDesign Component 安装测试</h1>
    
    <div class="test-section">
      <h2>按钮组件</h2>
      <l-button type="primary">主要按钮</l-button>
      <l-button type="default">默认按钮</l-button>
      <l-button type="success">成功按钮</l-button>
    </div>
    
    <div class="test-section">
      <h2>输入框组件</h2>
      <l-input v-model="inputValue" placeholder="请输入内容" />
      <p>输入值：{{ inputValue }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const inputValue = ref('')
</script>

<style scoped>
.test-page {
  padding: 20px;
}

.test-section {
  margin-bottom: 30px;
}

.test-section h2 {
  margin-bottom: 10px;
}
</style>
```

如果页面正常显示并且组件功能正常，说明安装成功！

## 常见问题

### 样式不生效

确保正确引入了样式文件：

```typescript
import '@ldesign/component/styles'
```

### TypeScript 类型错误

确保在 `tsconfig.json` 中添加了类型声明：

```json
{
  "compilerOptions": {
    "types": ["@ldesign/component/global"]
  }
}
```

### 构建错误

如果遇到构建错误，请检查：

1. Node.js 版本是否满足要求
2. 依赖版本是否兼容
3. 构建工具配置是否正确

更多问题请查看 [常见问题](/guide/faq) 或在 [GitHub Issues](https://github.com/ldesign/ldesign/issues) 中反馈。
