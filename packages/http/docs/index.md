---
layout: home

hero:
  name: "@ldesign/http"
  text: "现代化 HTTP 请求库"
  tagline: 功能强大、类型安全、Vue 3 完美集成
  image:
    src: /logo.svg
    alt: ldesign HTTP
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/basic

features:
  - icon: 🚀
    title: 多适配器支持
    details: 支持 fetch、axios、alova 等多种 HTTP 适配器，可根据环境自动选择或手动指定
  - icon: 🔧
    title: 强大的拦截器
    details: 完整的请求/响应拦截器系统，支持异步处理和链式调用
  - icon: 💾
    title: 智能缓存
    details: 内置缓存系统，支持内存和本地存储，可配置缓存策略和过期时间
  - icon: 🔄
    title: 自动重试
    details: 可配置的重试机制，支持指数退避和自定义重试条件
  - icon: ❌
    title: 请求取消
    details: 基于 AbortController 的请求取消功能，支持超时和手动取消
  - icon: ⚡
    title: 并发控制
    details: 内置并发控制和请求去重，防止重复请求和资源浪费
  - icon: 🎯
    title: TypeScript 优先
    details: 完整的 TypeScript 支持，提供类型安全的 API 和智能提示
  - icon: 🌟
    title: Vue 3 集成
    details: 专为 Vue 3 设计的 Composition API hooks，响应式状态管理
  - icon: 🛠️
    title: 高度可配置
    details: 丰富的配置选项，支持全局配置和请求级别配置
---

## 快速体验

```bash
# 安装
pnpm add @ldesign/http

# 或者使用 npm
npm install @ldesign/http
```

```typescript
import { createHttpClient } from '@ldesign/http'

// 创建客户端
const http = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000
})

// 发送请求
const response = await http.get('/users')
console.log(response.data)
```

## Vue 3 集成

```vue
<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <div v-else>{{ data }}</div>
  </div>
</template>

<script setup>
import { useRequest } from '@ldesign/http/vue'

const { data, loading, error } = useRequest({
  url: '/api/users',
  method: 'GET'
})
</script>
```

## 主要特性

### 🎯 类型安全

完整的 TypeScript 支持，提供类型安全的 API：

```typescript
interface User {
  id: number
  name: string
  email: string
}

const response = await http.get<User[]>('/users')
// response.data 的类型是 User[]
```

### 🔧 灵活的拦截器

强大的拦截器系统：

```typescript
// 请求拦截器
http.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${token}`
  return config
})

// 响应拦截器
http.interceptors.response.use(response => {
  return response.data
})
```

### 💾 智能缓存

内置缓存系统：

```typescript
const http = createHttpClient({
  cache: {
    enabled: true,
    ttl: 300000, // 5 分钟
  }
})

// 第二次请求会从缓存返回
await http.get('/users') // 网络请求
await http.get('/users') // 缓存返回
```

### 🔄 自动重试

可配置的重试机制：

```typescript
const http = createHttpClient({
  retry: {
    retries: 3,
    retryDelay: 1000,
    retryCondition: (error) => error.isNetworkError
  }
})
```

## 为什么选择 @ldesign/http？

- **🚀 现代化设计**: 基于最新的 Web 标准，支持 ES2020+ 和现代浏览器
- **🎯 TypeScript 优先**: 完整的类型支持，提供最佳的开发体验
- **🌟 Vue 3 深度集成**: 专为 Vue 3 设计的 hooks 和插件
- **⚡ 高性能**: 智能缓存、请求去重、并发控制
- **🛠️ 高度可扩展**: 插件化架构，支持自定义适配器和拦截器
- **📚 完整文档**: 详细的文档和丰富的示例

立即开始使用 @ldesign/http，体验现代化的 HTTP 请求处理！
