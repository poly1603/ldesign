# 安装指南

本指南将帮助你在项目中安装和配置 @ldesign/store。

## 系统要求

- **Node.js**: >= 16.0.0
- **Vue**: >= 3.3.0
- **Pinia**: >= 2.1.0
- **TypeScript**: >= 4.9.0 (可选，但推荐)

## 包管理器安装

### 使用 pnpm (推荐)

```bash
pnpm add @ldesign/store pinia vue reflect-metadata
```

### 使用 npm

```bash
npm install @ldesign/store pinia vue reflect-metadata
```

### 使用 yarn

```bash
yarn add @ldesign/store pinia vue reflect-metadata
```

## 依赖说明

### 核心依赖

- **@ldesign/store**: 主库
- **pinia**: 状态管理基础库
- **vue**: Vue.js 框架
- **reflect-metadata**: 装饰器元数据支持 (仅在使用装饰器时需要)

### 开发依赖 (可选)

如果你使用 TypeScript，建议安装以下开发依赖：

```bash
# TypeScript 相关
pnpm add -D typescript @types/node

# 构建工具 (根据你的项目选择)
pnpm add -D vite @vitejs/plugin-vue
# 或者
pnpm add -D webpack vue-loader
```

## 项目配置

### TypeScript 配置

如果你使用装饰器功能，需要在 `tsconfig.json` 中启用装饰器支持：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "useDefineForClassFields": false,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true
  }
}
```

### Vite 配置

如果你使用 Vite，在 `vite.config.ts` 中添加：

```typescript
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    include: ['@ldesign/store', 'pinia', 'vue'],
  },
})
```

### Webpack 配置

如果你使用 Webpack，确保正确配置 Vue 和装饰器支持：

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
      },
    ],
  },
}
```

## 应用初始化

### 1. 导入 reflect-metadata

在你的应用入口文件（如 `main.ts`）的最顶部导入：

```typescript
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import 'reflect-metadata' // 必须在最顶部

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

### 2. 创建你的第一个 Store

```typescript
// stores/counter.ts
import { Action, BaseStore, Getter, State } from '@ldesign/store'

export class CounterStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @Action()
  increment() {
    this.count++
  }

  @Getter()
  get doubleCount() {
    return this.count * 2
  }
}
```

### 3. 在组件中使用

```vue
<script setup lang="ts">
import { CounterStore } from '@/stores/counter'

const store = new CounterStore('counter')
</script>

<template>
  <div>
    <p>计数: {{ store.count }}</p>
    <p>双倍: {{ store.doubleCount }}</p>
    <button @click="store.increment">增加</button>
  </div>
</template>
```

## CDN 使用

如果你不使用构建工具，可以通过 CDN 直接使用：

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="https://unpkg.com/pinia@2/dist/pinia.iife.js"></script>
    <script src="https://unpkg.com/reflect-metadata@0.2.1/Reflect.js"></script>
    <script src="https://unpkg.com/@ldesign/store/dist/index.js"></script>
  </head>
  <body>
    <div id="app">
      <p>计数: {{ count }}</p>
      <button @click="increment">增加</button>
    </div>

    <script>
      const { createApp } = Vue
      const { createPinia } = Pinia
      const { BaseStore, State, Action } = LDesignStore

      // 定义 Store
      class CounterStore extends BaseStore {
        constructor(id) {
          super(id)
          this.count = 0
        }

        increment() {
          this.count++
        }
      }

      // 创建应用
      const app = createApp({
        setup() {
          const store = new CounterStore('counter')
          return {
            count: store.count,
            increment: store.increment,
          }
        },
      })

      app.use(createPinia())
      app.mount('#app')
    </script>
  </body>
</html>
```

## 验证安装

创建一个简单的测试文件来验证安装是否成功：

```typescript
import { Action, BaseStore, State } from '@ldesign/store'
// test-installation.ts
import 'reflect-metadata'

class TestStore extends BaseStore {
  @State({ default: 'Hello World' })
  message: string = 'Hello World'

  @Action()
  updateMessage(newMessage: string) {
    this.message = newMessage
  }
}

const store = new TestStore('test')
console.log('初始消息:', store.message) // "Hello World"

store.updateMessage('安装成功！')
console.log('更新后消息:', store.message) // "安装成功！"
```

如果能正常运行并输出预期结果，说明安装成功！

## 常见问题

### Q: 装饰器不工作？

A: 确保在 `tsconfig.json` 中启用了 `experimentalDecorators` 和 `emitDecoratorMetadata`，并且导入了
`reflect-metadata`。

### Q: 构建时出现错误？

A: 检查是否正确配置了构建工具，确保支持装饰器和 Vue 单文件组件。

### Q: 类型提示不正确？

A: 确保安装了 TypeScript 和相关类型定义，并且 IDE 支持 TypeScript。

## 下一步

安装完成后，你可以：

- 阅读 [基本概念](/guide/concepts) 了解核心概念
- 查看 [装饰器指南](/guide/decorators) 学习装饰器用法
- 浏览 [示例](/examples/) 查看实际应用
- 参考 [API 文档](/api/) 了解详细接口
