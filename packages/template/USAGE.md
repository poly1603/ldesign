# @ldesign/template 使用指南

## 安装

```bash
npm install @ldesign/template
# 或
pnpm add @ldesign/template
# 或
yarn add @ldesign/template
```

## 基本使用

### 1. 在 main.ts 中注册插件

```typescript
import { createApp } from 'vue'
import { createTemplatePlugin } from '@ldesign/template'
// 导入样式
import '@ldesign/template/index.css'
import App from './App.vue'

const app = createApp(App)

// 创建并安装模板插件
const templatePlugin = createTemplatePlugin({
  autoInit: true,      // 自动初始化
  autoDetect: true,    // 自动检测设备
  cache: {
    enabled: true,     // 启用组件缓存
  },
  rememberPreferences: true, // 记住用户偏好
})

app.use(templatePlugin)
app.mount('#app')
```

### 2. 在组件中使用

```vue
<template>
  <TemplateRenderer
    category="login"
    :device="device"
    template="default"
    v-bind="templateProps"
    @submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TemplateRenderer } from '@ldesign/template'
import type { DeviceType } from '@ldesign/template'

const device = ref<DeviceType>('desktop')

const templateProps = {
  title: '欢迎登录',
  subtitle: 'My Application'
}

const handleSubmit = (data: any) => {
  console.log('Form submitted:', data)
}
</script>
```

## 无需任何 alias 配置

与其他库不同，`@ldesign/template` 不需要在 vite.config.ts 或 webpack 中配置任何 alias。直接安装使用即可！

## 样式说明

### 方式一：手动导入（推荐）

在 main.ts 中导入主样式文件：

```typescript
import '@ldesign/template/index.css'
```

### 方式二：自动加载（实验性）

如果不导入样式，插件会尝试自动加载，但在某些构建环境中可能失败。建议始终手动导入以确保样式正确加载。

## 功能特性

- ✅ **零配置** - 无需配置 alias
- ✅ **样式自动加载** - 组件样式按需加载
- ✅ **智能缓存** - 组件缓存优化性能
- ✅ **设备自适应** - 自动检测设备类型
- ✅ **用户偏好** - 记住用户的模板选择
- ✅ **TypeScript 支持** - 完整的类型定义

## API

### createTemplatePlugin(options)

创建模板插件实例。

#### Options

- `autoInit?: boolean` - 自动初始化（默认：true）
- `autoDetect?: boolean` - 自动检测设备（默认：true）
- `cache?: { enabled?: boolean, ttl?: number }` - 缓存配置
- `rememberPreferences?: boolean` - 记住用户偏好（默认：false）
- `defaultDevice?: 'desktop' | 'tablet' | 'mobile'` - 默认设备类型

### TemplateRenderer 组件

渲染指定的模板。

#### Props

- `category: string` - 模板分类（如：'login', 'dashboard'）
- `device: 'desktop' | 'tablet' | 'mobile'` - 设备类型
- `template?: string` - 模板名称（可选，默认使用默认模板）
- 其他 props 会传递给模板组件

#### Events

- 模板组件定义的所有事件（如：submit, cancel 等）

### useTemplate()

组合式 API，用于在组件中管理模板。

```typescript
import { useTemplate } from '@ldesign/template'

const { 
  loadTemplate,
  currentTemplate,
  loading,
  error 
} = useTemplate()

// 加载模板
await loadTemplate('login', 'desktop', 'default')
```

## 开发环境

在开发环境中，模板会从源文件动态加载。在生产环境中，模板会从构建后的文件加载。这一切都是自动的，无需额外配置。

## 常见问题

### Q: 为什么不需要配置 alias？

A: `@ldesign/template` 使用标准的 npm 包导出机制，所有路径都通过 package.json 的 exports 字段正确映射。

### Q: 样式没有加载怎么办？

A: 确保在 main.ts 中导入了 `@ldesign/template/index.css`。

### Q: 如何自定义模板？

A: 可以通过扩展现有模板或创建新的模板目录来添加自定义模板。详见高级文档。

## License

MIT