# Vue HTTP 集成

基于 Vue 3 Composition API 的 HTTP 请求库,提供简单直观的 API。

## ✨ 核心特性

- 🚀 **零配置开始** - 开箱即用,无需复杂配置
- 🎯 **完整 TypeScript 支持** - 类型安全,智能提示
- ⚡️ **自动状态管理** - 自动管理 loading、error、data 状态
- 🔄 **智能缓存** - 自动请求去重和缓存
- 🎪 **乐观更新** - 先更新 UI,后发请求,失败自动回滚
- 📦 **丰富功能** - 防抖、节流、队列、分页等

---

## 🚀 快速开始

### 最简单的用法 (推荐)

```vue
<script setup lang="ts">
import { useGet, usePost } from '@ldesign/http'

// GET 请求 - 自动执行
const { data: users, loading, error } = useGet('/api/users')

// POST 请求 - 手动执行
const { data: result, execute: createUser } = usePost('/api/users', {}, { immediate: false })

async function handleCreate() {
  await createUser({ name: 'John', age: 25 })
  console.log('创建成功', result.value)
}
</script>

<template>
  <div v-if="loading">加载中...</div>
  <div v-else-if="error">错误: {{ error.message }}</div>
  <ul v-else>
    <li v-for="user in users" :key="user.id">{{ user.name }}</li>
  </ul>
  <button @click="handleCreate">添加用户</button>
</template>
```

就这么简单！**无需任何配置**,开箱即用。

---

## 📖 核心 API

### 1. 基础 HTTP 方法

最直观的使用方式,推荐用于大多数场景:

```typescript
import { useGet, usePost, usePut, useDelete, usePatch } from '@ldesign/http'

// GET - 自动执行
const { data, loading, error, execute } = useGet('/api/users')

// POST - 手动触发
const { data, execute } = usePost('/api/users', {}, { immediate: false })
await execute({ name: 'John' })

// PUT
const { execute: update } = usePut('/api/users/1', {}, { immediate: false })
await update({ name: 'Jane' })

// DELETE
const { execute: remove } = useDelete('/api/users/1', {}, { immediate: false })
await remove()

// PATCH
const { execute: patch } = usePatch('/api/users/1', {}, { immediate: false })
await patch({ name: 'Bob' })
```

### 2. 资源管理

完整的 CRUD 操作:

```typescript
import { useResource } from '@ldesign/http'

const { data, loading, create, update, remove, refresh } = useResource({
  resource: 'users',
  baseURL: '/api',
})

// 创建
await create({ name: 'John' })

// 更新
await update('1', { name: 'Jane' })

// 删除
await remove('1')

// 刷新
await refresh()
```

### 3. 分页

```typescript
import { usePagination } from '@ldesign/http'

const { data, loading, currentPage, pageSize, total, nextPage, prevPage } = usePagination({
  url: '/api/users',
  pageSize: 10,
})

// 翻页
await nextPage()
await prevPage()
```

---

## 🔥 高级功能

### 防抖搜索

```typescript
import { useDebouncedRequest } from '@ldesign/http'

const searchQuery = ref('')
const { data, loading } = useDebouncedRequest({
  url: '/api/search',
  delay: 500,
})

// 输入时自动防抖
watch(searchQuery, (q) => {
  execute({ params: { q } })
})
```

### 乐观更新

UI 立即更新,请求失败自动回滚:

```typescript
import { useOptimisticList } from '@ldesign/http'

const todos = ref([])
const { add, update, remove } = useOptimisticList(client, todos)

// 点击添加 - UI立即显示,失败自动回滚
await add({ url: '/api/todos', method: 'POST', data: newTodo }, newTodo)
```

### 请求队列

控制并发数量:

```typescript
import { useRequestQueue } from '@ldesign/http'

const queue = useRequestQueue({
  concurrency: 3, // 最多同时3个请求
})

// 批量上传,自动排队
files.forEach(file => {
  queue.add({ url: '/api/upload', method: 'POST', data: file })
})
```

---

## 🔌 全局配置 (可选)

如果需要全局配置 (baseURL、headers 等),可以使用插件:

```typescript
// main.ts
import { createApp } from 'vue'
import { HttpPlugin } from '@ldesign/http'

const app = createApp(App)

app.use(HttpPlugin, {
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    Authorization: 'Bearer token',
  },
})

// 使用依赖注入版本
import { useInjectedHttp } from '@ldesign/http'

const { get, post } = useInjectedHttp()
```

**注意**: 如果不需要全局配置,推荐直接使用 `useGet`、`usePost` 等方法,更简单！

---

## 📚 更多文档

- [完整 API 参考](../../docs/guide/new-features.md)
- [优化最佳实践](../../docs/guide/optimization-report.md)
