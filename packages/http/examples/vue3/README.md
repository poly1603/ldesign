# @ldesign/http Vue 3 示例

这个示例展示了如何在 Vue 3 项目中使用 `@ldesign/http` 库的各种功能，包括 Composition API 集成。

## 🚀 快速开始

### 安装依赖

```bash
# 在示例目录中安装依赖
pnpm install

# 或者从根目录安装
cd ../../.. && pnpm install
```

### 运行示例

```bash
# 启动开发服务器
pnpm run dev

# 类型检查
pnpm run type-check

# 构建生产版本
pnpm run build

# 预览构建结果
pnpm run preview
```

## 📋 功能演示

### 1. Vue Composition API 集成

- **useQuery**: 自动管理查询状态的响应式 hook
- **useRequest**: 手动触发的请求 hook
- **useMutation**: 用于数据变更的 hook
- **响应式状态**: 自动管理 loading、error、data 状态

### 2. HTTP 客户端功能

- **基础请求**: GET、POST、PUT、DELETE
- **拦截器系统**: 请求/响应拦截器
- **错误处理**: 网络错误、超时错误、HTTP 错误
- **并发控制**: 同时发送多个请求

### 3. 高级特性

- **类型安全**: 完整的 TypeScript 支持
- **自动重试**: 失败请求自动重试
- **请求取消**: 组件卸载时自动取消请求
- **缓存管理**: 智能缓存机制

## 🔧 代码示例

### 基础用法

```vue
<script setup lang="ts">
import { createHttpClient, useQuery } from '@ldesign/http'

// 创建客户端
const http = createHttpClient({
  baseURL: 'https://api.example.com',
})

// 使用 useQuery 获取数据
const { data, loading, error, refresh } = useQuery(http, () => http.get('/users'), {
  immediate: true,
})
</script>

<template>
  <div>
    <div v-if="loading">
      加载中...
    </div>
    <div v-else-if="error">
      错误: {{ error.message }}
    </div>
    <div v-else>
      <div v-for="user in data" :key="user.id">
        {{ user.name }}
      </div>
    </div>
    <button @click="refresh">
      刷新
    </button>
  </div>
</template>
```

### 使用 useMutation

```vue
<script setup lang="ts">
import { useMutation } from '@ldesign/http'

const { mutate, loading, error } = useMutation(http, userData => http.post('/users', userData), {
  onSuccess: (data) => {
    console.log('用户创建成功:', data)
  },
  onError: (error) => {
    console.error('创建失败:', error)
  },
})

function createUser() {
  mutate({
    name: 'John Doe',
    email: 'john@example.com',
  })
}
</script>
```

### 拦截器使用

```vue
<script setup lang="ts">
import { createAuthInterceptor } from '@ldesign/http'

// 添加认证拦截器
const authInterceptor = createAuthInterceptor('Bearer your-token')
http.interceptors.request.use(authInterceptor)

// 添加响应拦截器
http.interceptors.response.use(
  (response) => {
    console.log('请求成功:', response)
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // 处理认证失败
      router.push('/login')
    }
    throw error
  }
)
</script>
```

### 错误处理

```vue
<script setup lang="ts">
const { data, loading, error, execute } = useRequest(http, () => http.get('/users'), {
  immediate: false,
  onError: (error) => {
    if (error.isNetworkError) {
      console.error('网络连接失败')
    }
    else if (error.isTimeoutError) {
      console.error('请求超时')
    }
    else {
      console.error('请求失败:', error.message)
    }
  },
})
</script>
```

## 🎯 Vue 3 特性

### 1. 响应式状态管理

所有 HTTP 状态都是响应式的，自动更新 UI：

```typescript
const { data, loading, error } = useQuery(...)

// 这些状态会自动触发组件重新渲染
watch(loading, (isLoading) => {
  console.log('加载状态:', isLoading)
})
```

### 2. 自动清理

组件卸载时自动取消进行中的请求：

```typescript
// 无需手动清理，useQuery 会自动处理
const { data } = useQuery(http, () => http.get('/users'))
```

### 3. 条件请求

根据条件动态执行请求：

```typescript
const userId = ref(1)
const enabled = computed(() => userId.value > 0)

const { data } = useQuery(http, () => http.get(`/users/${userId.value}`), {
  immediate: true,
  enabled, // 只有当 enabled 为 true 时才执行请求
})
```

## 📊 实时统计

示例应用显示以下统计信息：

- **总请求数**: 发送的请求总数
- **成功数**: 成功完成的请求数
- **错误数**: 失败的请求数
- **缓存命中数**: 从缓存返回的请求数

## 🎨 UI 组件

示例包含以下交互式组件：

- **文章列表**: 使用 useQuery 获取和显示文章
- **文章详情**: 按需获取单篇文章
- **创建文章**: 使用 useMutation 创建新文章
- **拦截器控制**: 动态添加/移除拦截器
- **错误测试**: 测试各种错误场景
- **自定义请求**: 灵活配置请求参数

## 🔗 相关链接

- [完整文档](../../docs/README.md)
- [Vue API 参考](../../docs/vue-api.md)
- [Vanilla JS 示例](../vanilla/README.md)
- [最佳实践](../../docs/best-practices.md)

## 💡 学习要点

1. **Composition API**: 学习如何在 Vue 3 中使用 HTTP hooks
2. **响应式编程**: 理解响应式状态管理
3. **错误边界**: 掌握 Vue 中的错误处理模式
4. **性能优化**: 了解请求缓存和去重
5. **类型安全**: 体验 TypeScript 在 Vue 中的应用

## 🔧 开发提示

- 使用 Vue DevTools 查看响应式状态变化
- 查看浏览器网络面板了解请求详情
- 尝试修改代码测试不同的配置选项
- 参考源码了解 hooks 的实现原理
