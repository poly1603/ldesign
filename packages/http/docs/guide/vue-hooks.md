# Vue Hooks 详细指南

@ldesign/http 为 Vue 3 提供了一套完整的 Composition API hooks，让你能够以声明式的方式处理 HTTP 请求
。

## 核心 Hooks

### useRequest

用于处理基础 HTTP 请求的 hook。

#### 基础用法

```vue
<script setup lang="ts">
import { useRequest } from '@ldesign/http/vue'

const { data, loading, error, execute } = useRequest(
  {
    url: '/api/users',
    method: 'GET',
  },
  {
    immediate: true, // 立即执行
  }
)
</script>

<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <div v-else-if="data">
      {{ data }}
    </div>
    <button @click="execute">重新请求</button>
  </div>
</template>
```

#### 配置选项

```typescript
interface UseRequestOptions<T> {
  immediate?: boolean // 是否立即执行，默认 true
  initialData?: T // 初始数据
  transform?: (data: any) => T // 数据转换函数
  onSuccess?: (data: T, response: ResponseData<T>) => void // 成功回调
  onError?: (error: HttpError) => void // 错误回调
  onFinally?: () => void // 完成回调
  cancelOnUnmount?: boolean // 组件卸载时是否取消请求，默认 true
}
```

#### 返回值

```typescript
interface UseRequestReturn<T> {
  data: Ref<T | null> // 响应数据
  loading: Ref<boolean> // 加载状态
  error: Ref<HttpError | null> // 错误信息
  finished: Ref<boolean> // 是否已完成
  execute: (config?: RequestConfig) => Promise<ResponseData<T>> // 执行请求
  refresh: () => Promise<ResponseData<T>> // 刷新请求
  cancel: () => void // 取消请求
  reset: () => void // 重置状态
  canCancel: ComputedRef<boolean> // 是否可以取消
}
```

#### 高级用法

```vue
<script setup lang="ts">
import { useRequest } from '@ldesign/http/vue'
import { ref } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

const userId = ref(1)

// 响应式配置
const { data, loading, error, execute } = useRequest<User[]>(
  computed(() => ({
    url: `/api/users/${userId.value}`,
    method: 'GET',
  })),
  {
    immediate: false,
    transform: rawData => {
      // 数据转换
      return rawData.map(user => ({
        ...user,
        displayName: `${user.name} (${user.email})`,
      }))
    },
    onSuccess: data => {
      console.log('请求成功:', data)
    },
    onError: error => {
      console.error('请求失败:', error)
    },
  }
)

// 监听 userId 变化自动重新请求
watch(userId, () => {
  execute()
})
</script>
```

### useQuery

带缓存功能的查询 hook，适用于数据获取场景。

#### 基础用法

```vue
<script setup lang="ts">
import { useQuery } from '@ldesign/http/vue'

const { data, loading, error, isStale } = useQuery(
  'users', // 查询键
  { url: '/api/users', method: 'GET' },
  {
    staleTime: 300000, // 5分钟内数据不过期
    cacheTime: 600000, // 缓存保留10分钟
  }
)
</script>
```

#### 动态查询键

```vue
<script setup lang="ts">
import { useQuery } from '@ldesign/http/vue'
import { computed, ref } from 'vue'

const page = ref(1)
const pageSize = ref(10)

const { data, loading } = useQuery(
  computed(() => ['users', page.value, pageSize.value]), // 动态查询键
  computed(() => ({
    url: '/api/users',
    params: { page: page.value, pageSize: pageSize.value },
  })),
  {
    staleTime: 300000,
    refetchOnWindowFocus: true, // 窗口聚焦时重新获取
  }
)
</script>
```

#### 配置选项

```typescript
interface UseQueryOptions<T> {
  enabled?: MaybeRef<boolean> // 是否启用查询
  staleTime?: number // 数据过期时间
  cacheTime?: number // 缓存保留时间
  refetchOnWindowFocus?: boolean // 窗口聚焦时重新获取
  refetchOnReconnect?: boolean // 网络重连时重新获取
  refetchInterval?: number // 定时重新获取间隔
  retry?: boolean | number | ((retryCount: number, error: HttpError) => boolean)
  retryDelay?: number | ((retryCount: number) => number)
  // ... 其他选项
}
```

### useMutation

用于处理数据变更操作（POST、PUT、DELETE 等）。

#### 基础用法

```vue
<script setup lang="ts">
import { useMutation } from '@ldesign/http/vue'
import { reactive } from 'vue'

const form = reactive({
  name: '',
  email: '',
})

const { mutate, loading, error, data } = useMutation(
  userData => http.post('/api/users', userData),
  {
    onSuccess: data => {
      console.log('创建成功:', data)
      // 重置表单
      form.name = ''
      form.email = ''
    },
    onError: error => {
      console.error('创建失败:', error)
    },
  }
)

function handleSubmit() {
  mutate(form)
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.name" placeholder="姓名" required />
    <input v-model="form.email" type="email" placeholder="邮箱" required />
    <button type="submit" :disabled="loading">
      {{ loading ? '提交中...' : '提交' }}
    </button>
  </form>

  <div v-if="error" class="error">错误: {{ error.message }}</div>

  <div v-if="data" class="success">创建成功: {{ data.name }}</div>
</template>
```

#### 乐观更新

```vue
<script setup lang="ts">
import { useMutation, useQuery } from '@ldesign/http/vue'

const { data: users, invalidate } = useQuery('users', { url: '/api/users' })

const { mutate: updateUser } = useMutation(({ id, data }) => http.put(`/api/users/${id}`, data), {
  onMutate: async ({ id, data }) => {
    // 取消正在进行的查询
    await queryClient.cancelQueries('users')

    // 保存当前数据快照
    const previousUsers = users.value

    // 乐观更新
    if (users.value) {
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...data }
      }
    }

    return { previousUsers }
  },
  onError: (error, variables, context) => {
    // 回滚乐观更新
    if (context?.previousUsers) {
      users.value = context.previousUsers
    }
  },
  onSettled: () => {
    // 重新获取数据
    invalidate()
  },
})
</script>
```

## 便利 Hooks

### useResource

用于 RESTful API 的便利 hook。

```vue
<script setup lang="ts">
import { useResource } from '@ldesign/http/vue'

const userResource = useResource('/api/users')

// 获取列表
const { data: users, loading: listLoading } = userResource.useList({
  page: 1,
  limit: 10,
})

// 获取详情
const { data: user, loading: detailLoading } = userResource.useDetail(1)

// 创建
const { mutate: createUser, loading: createLoading } = userResource.useCreate({
  onSuccess: () => {
    // 自动刷新列表
  },
})

// 更新
const { mutate: updateUser } = userResource.useUpdate({
  onSuccess: () => {
    // 自动刷新相关数据
  },
})

// 删除
const { mutate: deleteUser } = userResource.useDelete({
  onSuccess: () => {
    // 自动刷新列表
  },
})
</script>
```

### usePagination

分页查询的便利 hook。

```vue
<script setup lang="ts">
import { usePagination } from '@ldesign/http/vue'

const {
  data,
  loading,
  error,
  page,
  pageSize,
  total,
  totalPages,
  hasNextPage,
  hasPrevPage,
  nextPage,
  prevPage,
  goToPage,
  setPageSize,
  refresh,
} = usePagination('/api/users', 1, 10)
</script>

<template>
  <div>
    <!-- 数据列表 -->
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <div v-else>
      <div v-for="item in data?.data" :key="item.id">
        {{ item.name }}
      </div>
    </div>

    <!-- 分页控件 -->
    <div class="pagination">
      <button :disabled="!hasPrevPage" @click="prevPage">上一页</button>
      <span>第 {{ page }} 页，共 {{ totalPages }} 页</span>
      <button :disabled="!hasNextPage" @click="nextPage">下一页</button>

      <select v-model="pageSize" @change="setPageSize">
        <option value="10">10 条/页</option>
        <option value="20">20 条/页</option>
        <option value="50">50 条/页</option>
      </select>
    </div>
  </div>
</template>
```

## 高级用法

### 条件查询

```vue
<script setup lang="ts">
import { useQuery } from '@ldesign/http/vue'
import { computed, ref } from 'vue'

const searchTerm = ref('')
const enabled = computed(() => searchTerm.value.length > 2)

const { data, loading } = useQuery(
  computed(() => ['search', searchTerm.value]),
  computed(() => ({
    url: '/api/search',
    params: { q: searchTerm.value },
  })),
  {
    enabled, // 只有当搜索词长度 > 2 时才执行查询
    staleTime: 300000,
  }
)
</script>
```

### 依赖查询

```vue
<script setup lang="ts">
import { useQuery } from '@ldesign/http/vue'

// 先获取用户信息
const { data: user } = useQuery('user', { url: '/api/user/profile' })

// 基于用户信息获取权限
const { data: permissions } = useQuery(
  computed(() => ['permissions', user.value?.id]),
  computed(() => ({
    url: `/api/users/${user.value?.id}/permissions`,
  })),
  {
    enabled: computed(() => !!user.value?.id), // 只有当用户信息存在时才查询权限
  }
)
</script>
```

### 无限滚动

```vue
<script setup lang="ts">
import { useInfiniteQuery } from '@ldesign/http/vue'

const { data, loading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
  'infinite-users',
  ({ pageParam = 1 }) => ({
    url: '/api/users',
    params: { page: pageParam, limit: 10 },
  }),
  {
    getNextPageParam: lastPage => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined
    },
  }
)
</script>

<template>
  <div>
    <div v-for="page in data?.pages" :key="page.page">
      <div v-for="item in page.data" :key="item.id">
        {{ item.name }}
      </div>
    </div>

    <button :disabled="!hasNextPage || isFetchingNextPage" @click="fetchNextPage">
      {{ isFetchingNextPage ? '加载中...' : '加载更多' }}
    </button>
  </div>
</template>
```

## 错误处理

### 全局错误处理

```typescript
import { HttpPlugin } from '@ldesign/http/vue'
// main.ts
import { createApp } from 'vue'

const app = createApp({})

app.use(HttpPlugin, {
  client: httpClient,
  globalErrorHandler: error => {
    if (error.response?.status === 401) {
      // 处理未授权错误
      router.push('/login')
    } else if (error.response?.status >= 500) {
      // 处理服务器错误
      showErrorNotification('服务器错误，请稍后重试')
    }
  },
})
```

### 组件级错误处理

```vue
<script setup lang="ts">
import { useRequest } from '@ldesign/http/vue'

const { data, loading, error, execute } = useRequest(
  { url: '/api/users' },
  {
    onError: error => {
      if (error.isNetworkError) {
        showNotification('网络连接失败', 'error')
      } else if (error.response?.status === 404) {
        showNotification('数据不存在', 'warning')
      } else {
        showNotification('请求失败', 'error')
      }
    },
  }
)
</script>
```

## 最佳实践

### 1. 合理使用查询键

```typescript
// 好的做法：结构化查询键
const queryKey = ['users', { page, limit, search }]

// 避免：字符串拼接
const queryKey = `users-${page}-${limit}-${search}`
```

### 2. 适当的缓存策略

```typescript
// 静态数据：长时间缓存
const { data: config } = useQuery(
  'app-config',
  { url: '/api/config' },
  {
    staleTime: 3600000, // 1小时
    cacheTime: 86400000, // 24小时
  }
)

// 动态数据：短时间缓存
const { data: notifications } = useQuery(
  'notifications',
  { url: '/api/notifications' },
  {
    staleTime: 30000, // 30秒
    cacheTime: 300000, // 5分钟
    refetchInterval: 60000, // 每分钟刷新
  }
)
```

### 3. 组合多个 hooks

```vue
<script setup lang="ts">
// 组合使用多个 hooks
const { data: user } = useQuery('user', { url: '/api/user' })
const { mutate: updateProfile } = useMutation(updateUserProfile)
const { data: posts } = useQuery(
  computed(() => ['user-posts', user.value?.id]),
  computed(() => ({ url: `/api/users/${user.value?.id}/posts` })),
  { enabled: computed(() => !!user.value) }
)
</script>
```

Vue hooks 让 HTTP 请求变得简单而强大，通过合理使用这些 hooks，你可以构建出响应迅速、用户体验优秀的应
用。
