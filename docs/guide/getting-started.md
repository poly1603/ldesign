# 快速开始

本指南将帮助你快速上手 LDesign 组件库，在几分钟内就能在你的项目中使用我们的组件。

## 安装

### 使用 CDN

最简单的方式是通过 CDN 直接引入：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LDesign 快速开始</title>
  <!-- 引入 LDesign 组件库 -->
  <script type="module" src="https://unpkg.com/@ldesign/component/dist/ldesign/ldesign.esm.js"></script>
</head>
<body>
  <div id="app">
    <ld-button type="primary">Hello LDesign!</ld-button>
  </div>
</body>
</html>
```

### 使用 NPM

如果你使用构建工具，推荐通过 npm 安装：

::: code-group

```bash [pnpm]
pnpm add @ldesign/component
```

```bash [npm]
npm install @ldesign/component
```

```bash [yarn]
yarn add @ldesign/component
```

:::

## 基础用法

### 在原生 HTML 中使用

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://unpkg.com/@ldesign/component/dist/ldesign/ldesign.esm.js"></script>
</head>
<body>
  <!-- 按钮组件 -->
  <ld-button type="primary" size="large">
    主要按钮
  </ld-button>

  <!-- 输入框组件 -->
  <ld-input
    placeholder="请输入内容"
    clearable
    prefix-icon="search">
  </ld-input>

  <!-- 卡片组件 -->
  <ld-card title="卡片标题" shadow="hover">
    <p>这是卡片的内容区域</p>
    <div slot="footer">
      <ld-button type="text">取消</ld-button>
      <ld-button type="primary">确定</ld-button>
    </div>
  </ld-card>
</body>
</html>

### 在 Vue 3 中使用

首先安装 Vue 适配器：

```bash
npm install @ldesign/component-vue
```

然后在你的 Vue 应用中使用：

```vue
<template>
  <div class="demo">
    <h1>LDesign + Vue 3</h1>

    <!-- 按钮组件 -->
    <ld-button
      type="primary"
      @click="handleClick"
      :loading="loading">
      {{ loading ? '加载中...' : '点击我' }}
    </ld-button>

    <!-- 输入框组件 -->
    <ld-input
      v-model="inputValue"
      placeholder="请输入内容"
      clearable
      @input="handleInput">
    </ld-input>

    <!-- 卡片组件 -->
    <ld-card title="用户信息" shadow="always">
      <p>姓名：{{ userInfo.name }}</p>
      <p>邮箱：{{ userInfo.email }}</p>
      <template #footer>
        <ld-button type="text" @click="editUser">编辑</ld-button>
        <ld-button type="primary" @click="saveUser">保存</ld-button>
      </template>
    </ld-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// 响应式数据
const loading = ref(false)
const inputValue = ref('')
const userInfo = reactive({
  name: '张三',
  email: 'zhangsan@example.com'
})

// 事件处理
const handleClick = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}

const handleInput = (event: CustomEvent) => {
  console.log('输入内容：', event.detail)
}

const editUser = () => {
  console.log('编辑用户')
}

const saveUser = () => {
  console.log('保存用户')
}
</script>

<style scoped>
.demo {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.demo > * {
  margin-bottom: 16px;
}
</style>
```
```

### 在 React 中使用

首先安装 React 适配器：

```bash
npm install @ldesign/component-react
```

然后在你的 React 应用中使用：

```jsx
import React, { useState } from 'react'
import { LdButton, LdInput, LdCard } from '@ldesign/component-react'

function App() {
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [userInfo] = useState({
    name: '张三',
    email: 'zhangsan@example.com'
  })

  const handleClick = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  const handleInput = (event) => {
    setInputValue(event.target.value)
    console.log('输入内容：', event.target.value)
  }

  const editUser = () => {
    console.log('编辑用户')
  }

  const saveUser = () => {
    console.log('保存用户')
  }

  return (
    <div className="demo">
      <h1>LDesign + React</h1>

      {/* 按钮组件 */}
      <LdButton
        type="primary"
        loading={loading}
        onClick={handleClick}>
        {loading ? '加载中...' : '点击我'}
      </LdButton>

      {/* 输入框组件 */}
      <LdInput
        value={inputValue}
        placeholder="请输入内容"
        clearable
        onInput={handleInput}
      />

      {/* 卡片组件 */}
      <LdCard title="用户信息" shadow="always">
        <p>姓名：{userInfo.name}</p>
        <p>邮箱：{userInfo.email}</p>
        <div slot="footer">
          <LdButton type="text" onClick={editUser}>编辑</LdButton>
          <LdButton type="primary" onClick={saveUser}>保存</LdButton>
        </div>
      </LdCard>
    </div>
  )
}

export default App
```

## 主题定制

LDesign 提供了丰富的 CSS 变量用于主题定制：

```css
:root {
  /* 主色调 */
  --ld-color-primary: #1976d2;
  --ld-color-success: #4caf50;
  --ld-color-warning: #ff9800;
  --ld-color-error: #f44336;

  /* 字体 */
  --ld-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --ld-font-size-base: 14px;

  /* 间距 */
  --ld-spacing-xs: 4px;
  --ld-spacing-sm: 8px;
  --ld-spacing-md: 16px;
  --ld-spacing-lg: 24px;

  /* 圆角 */
  --ld-border-radius-base: 4px;
  --ld-border-radius-small: 2px;
  --ld-border-radius-large: 8px;
}

```

### 暗色主题

LDesign 内置了暗色主题支持：

```css
/* 暗色主题 */
[data-theme="dark"] {
  --ld-color-bg-base: #1a1a1a;
  --ld-color-text-base: #ffffff;
  --ld-color-border-base: #333333;
}
```

```javascript
// 切换主题
document.documentElement.setAttribute('data-theme', 'dark')
```

## 按需引入

为了减少包体积，你可以只引入需要的组件：

```javascript
// 只引入按钮组件
import { defineCustomElement as defineButton } from '@ldesign/component/dist/components/ld-button'

// 定义自定义元素
defineButton()

// 现在可以使用 <ld-button> 了
```

## TypeScript 支持

LDesign 提供了完整的 TypeScript 类型定义：

```typescript
import type { ButtonType, ButtonSize } from '@ldesign/component'

interface ButtonProps {
  type?: ButtonType
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
}
```

## 下一步

现在你已经了解了 LDesign 的基础用法，接下来可以：

- [查看安装指南](./installation) - 了解更多安装选项
- [浏览组件文档](../components/button) - 探索所有可用组件
- [学习主题定制](./theming) - 深入了解主题系统
- [查看框架集成](./framework-integration) - 了解如何在不同框架中使用

## 常见问题

### Q: LDesign 支持哪些浏览器？

A: LDesign 支持所有现代浏览器：
- Chrome >= 60
- Firefox >= 63
- Safari >= 11
- Edge >= 79

### Q: 如何在现有项目中使用 LDesign？

A: 你可以通过 CDN 或 npm 安装 LDesign，然后直接在项目中使用组件，无需额外配置。

### Q: LDesign 组件是否支持服务端渲染？

A: 是的，LDesign 基于 Web Components 标准，支持服务端渲染和静态生成。

### Q: 如何自定义组件样式？

A: 你可以通过 CSS 变量来自定义组件样式，或者直接覆盖组件的 CSS 类名。

### Q: 是否可以按需引入组件？

A: 是的，LDesign 支持按需引入，你可以只引入需要的组件来减少包体积。
