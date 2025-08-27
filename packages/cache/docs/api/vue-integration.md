# Vue 集成 API

## 🎨 useCache 组合式函数

### 基础签名

```typescript
function useCache<T = any>(key: string, options?: UseCacheOptions<T>): UseCacheReturn<T>
```

### 参数

#### `key: string`

缓存键名，用于标识缓存数据。

#### `options?: UseCacheOptions<T>`

```typescript
interface UseCacheOptions<T = any> {
  defaultValue?: T // 默认值
  autoSave?: boolean // 自动保存，默认 false
  immediate?: boolean // 立即加载，默认 true
  ttl?: number // 生存时间（毫秒）
  engine?: StorageEngine // 指定存储引擎
  serializer?: {
    // 自定义序列化
    serialize: (value: T) => string
    deserialize: (value: string) => T
  }
  onError?: (error: Error) => void // 错误处理
  onSuccess?: (value: T) => void // 成功回调
}
```

### 返回值

```typescript
interface UseCacheReturn<T> {
  value: Ref<T | null> // 响应式缓存值
  loading: Ref<boolean> // 加载状态
  error: Ref<Error | null> // 错误信息
  set: (value: T, options?: SetOptions) => Promise<void> // 设置缓存
  get: (options?: GetOptions) => Promise<T | null> // 获取缓存
  remove: () => Promise<void> // 删除缓存
  refresh: () => Promise<void> // 刷新缓存
  clear: () => Promise<void> // 清空缓存
}
```

### 使用示例

#### 基础用法

```vue
<template>
  <div>
    <input v-model="userName" />
    <div v-if="loading">加载中...</div>
    <div v-if="error">错误: {{ error.message }}</div>
  </div>
</template>

<script setup>
import { useCache } from '@ldesign/cache/vue'

const {
  value: userName,
  loading,
  error,
} = useCache('user-name', {
  defaultValue: '',
  autoSave: true,
})
</script>
```

#### 手动操作

```vue
<script setup>
import { useCache } from '@ldesign/cache/vue'

const { value, set, get, remove, refresh } = useCache('user-data')

// 手动设置
const saveData = async () => {
  await set({ name: '张三', age: 30 })
}

// 手动获取
const loadData = async () => {
  const data = await get()
  console.log(data)
}

// 删除缓存
const clearData = async () => {
  await remove()
}

// 刷新缓存
const reloadData = async () => {
  await refresh()
}
</script>
```

#### 类型安全

```vue
<script setup lang="ts">
import { useCache } from '@ldesign/cache/vue'

interface UserProfile {
  id: number
  name: string
  email: string
}

const { value: profile } = useCache<UserProfile>('user-profile', {
  defaultValue: {
    id: 0,
    name: '',
    email: '',
  },
})

// 类型安全的访问
profile.value.name = '新名称' // ✅ 类型正确
profile.value.invalid = 'value' // ❌ TypeScript 错误
</script>
```

## 📊 useCacheStats 性能监控

### 基础签名

```typescript
function useCacheStats(options?: UseCacheStatsOptions): UseCacheStatsReturn
```

### 参数

```typescript
interface UseCacheStatsOptions {
  refreshInterval?: number // 自动刷新间隔（毫秒）
  autoStart?: boolean // 是否自动开始监控，默认 false
  engines?: StorageEngine[] // 监控的引擎列表
}
```

### 返回值

```typescript
interface UseCacheStatsReturn {
  // 格式化的统计信息
  formattedStats: Ref<{
    totalItems: number
    totalSizeFormatted: string
    hitRatePercentage: number
    expiredItems: number
  }>

  // 引擎使用情况
  engineUsage: Ref<
    Array<{
      engine: string
      available: boolean
      itemCount: number
      sizeFormatted: string
      usage: number
    }>
  >

  // 操作方法
  refresh: () => Promise<void>
  startAutoRefresh: (interval?: number) => void
  stopAutoRefresh: () => void

  // 状态
  isRefreshing: Ref<boolean>
  lastRefresh: Ref<Date | null>
}
```

### 使用示例

```vue
<template>
  <div class="cache-monitor">
    <h3>缓存监控</h3>

    <!-- 统计信息 -->
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-value">{{ stats.totalItems }}</div>
        <div class="stat-label">总缓存项</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ stats.totalSizeFormatted }}</div>
        <div class="stat-label">总大小</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ stats.hitRatePercentage }}%</div>
        <div class="stat-label">命中率</div>
      </div>
    </div>

    <!-- 引擎使用情况 -->
    <div class="engine-list">
      <div v-for="engine in engineUsage" :key="engine.engine" class="engine-item">
        <span class="engine-name">{{ engine.engine }}</span>
        <span class="engine-status" :class="{ available: engine.available }">
          {{ engine.available ? '可用' : '不可用' }}
        </span>
        <span class="engine-usage">{{ engine.usage }}%</span>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="controls">
      <button @click="refresh" :disabled="isRefreshing">
        {{ isRefreshing ? '刷新中...' : '手动刷新' }}
      </button>
      <button @click="toggleAutoRefresh">
        {{ autoRefreshActive ? '停止自动刷新' : '开始自动刷新' }}
      </button>
    </div>

    <div v-if="lastRefresh" class="last-refresh">
      最后刷新: {{ lastRefresh.toLocaleTimeString() }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useCacheStats } from '@ldesign/cache/vue'

const {
  formattedStats: stats,
  engineUsage,
  refresh,
  startAutoRefresh,
  stopAutoRefresh,
  isRefreshing,
  lastRefresh,
} = useCacheStats({
  refreshInterval: 5000, // 5秒刷新间隔
})

const autoRefreshActive = ref(false)

const toggleAutoRefresh = () => {
  if (autoRefreshActive.value) {
    stopAutoRefresh()
    autoRefreshActive.value = false
  } else {
    startAutoRefresh()
    autoRefreshActive.value = true
  }
}

onMounted(() => {
  refresh() // 初始刷新
})

onUnmounted(() => {
  if (autoRefreshActive.value) {
    stopAutoRefresh()
  }
})
</script>
```

## 🏪 CacheProvider 全局提供者

### 基础用法

```typescript
import { CacheProvider } from '@ldesign/cache/vue'
// main.ts
import { createApp } from 'vue'

const app = createApp(App)

app.use(CacheProvider, {
  defaultEngine: 'localStorage',
  keyPrefix: 'myapp_',
  strategy: { enabled: true },
})
```

### 配置选项

```typescript
interface CacheProviderOptions extends CacheOptions {
  // 继承所有 CacheOptions
  globalKey?: string // 全局注入键名，默认 'cache'
}
```

### 注入使用

```vue
<script setup>
import { useCacheManager, provideCacheManager } from '@ldesign/cache/vue'

// 获取全局缓存管理器
const globalCache = useCacheManager()

// 在子组件中提供新的缓存实例
const localCache = createCache({ keyPrefix: 'local_' })
provideCacheManager(localCache)
</script>
```

## 🎭 高级组合式函数

### useCacheValue

专门用于单个值的响应式缓存：

```typescript
function useCacheValue<T>(key: string, defaultValue: T, options?: UseCacheValueOptions<T>): Ref<T>
```

**示例:**

```vue
<script setup>
import { useCacheValue } from '@ldesign/cache/vue'

// 直接获取响应式值
const theme = useCacheValue('app-theme', 'light')
const counter = useCacheValue('counter', 0)

// 直接修改会自动保存
theme.value = 'dark' // 自动保存到缓存
counter.value++ // 自动保存到缓存
</script>
```

### useCacheList

专门用于列表数据的缓存管理：

```typescript
function useCacheList<T>(key: string, options?: UseCacheListOptions<T>): UseCacheListReturn<T>
```

**返回值:**

```typescript
interface UseCacheListReturn<T> {
  list: Ref<T[]>
  add: (item: T) => Promise<void>
  remove: (index: number) => Promise<void>
  update: (index: number, item: T) => Promise<void>
  clear: () => Promise<void>
  length: ComputedRef<number>
}
```

**示例:**

```vue
<template>
  <div>
    <div v-for="(todo, index) in list" :key="index">
      <span>{{ todo.text }}</span>
      <button @click="remove(index)">删除</button>
    </div>

    <button @click="addTodo">添加待办</button>
    <div>总数: {{ length }}</div>
  </div>
</template>

<script setup>
import { useCacheList } from '@ldesign/cache/vue'

const { list, add, remove, length } = useCacheList('todo-list', {
  defaultValue: [],
})

const addTodo = () => {
  add({
    id: Date.now(),
    text: `新待办 ${Date.now()}`,
    completed: false,
  })
}
</script>
```

### useCacheObject

专门用于对象数据的缓存管理：

```typescript
function useCacheObject<T extends Record<string, any>>(
  key: string,
  defaultValue: T,
  options?: UseCacheObjectOptions<T>
): UseCacheObjectReturn<T>
```

**返回值:**

```typescript
interface UseCacheObjectReturn<T> {
  data: Ref<T>
  update: (updates: Partial<T>) => Promise<void>
  reset: () => Promise<void>
  merge: (updates: Partial<T>) => Promise<void>
}
```

**示例:**

```vue
<script setup>
import { useCacheObject } from '@ldesign/cache/vue'

const {
  data: userConfig,
  update,
  reset,
} = useCacheObject('user-config', {
  theme: 'light',
  language: 'zh-CN',
  notifications: true,
})

// 部分更新
const updateTheme = (theme: string) => {
  update({ theme })
}

// 重置配置
const resetConfig = () => {
  reset()
}
</script>
```

## 🔧 工具函数

### createCacheComposable

创建自定义缓存组合式函数：

```typescript
function createCacheComposable<T>(key: string, options: UseCacheOptions<T>) {
  return () => useCache(key, options)
}

// 使用
const useUserProfile = createCacheComposable('user-profile', {
  defaultValue: { name: '', email: '' },
  autoSave: true,
})

// 在组件中使用
const { value: profile } = useUserProfile()
```

### withCache

高阶函数，为任意函数添加缓存功能：

```typescript
function withCache<T extends (...args: any[]) => any>(fn: T, options: WithCacheOptions): T

interface WithCacheOptions {
  keyGenerator: (...args: any[]) => string
  ttl?: number
  engine?: StorageEngine
}
```

**示例:**

```typescript
// 为 API 调用添加缓存
const fetchUserData = withCache(
  async (userId: number) => {
    const response = await fetch(`/api/users/${userId}`)
    return response.json()
  },
  {
    keyGenerator: userId => `user-data-${userId}`,
    ttl: 5 * 60 * 1000, // 5分钟缓存
  }
)

// 使用时会自动缓存结果
const userData = await fetchUserData(123)
```

## 📡 事件监听

### useCacheEvents

监听缓存事件的组合式函数：

```typescript
function useCacheEvents(
  events: string | string[],
  handler: (event: CacheEvent) => void,
  options?: UseCacheEventsOptions
): void
```

**示例:**

```vue
<script setup>
import { useCacheEvents } from '@ldesign/cache/vue'

// 监听缓存事件
useCacheEvents(['set', 'get', 'remove'], event => {
  console.log('缓存事件:', event.type, event.key)
})

// 监听特定键的事件
useCacheEvents('set', event => {
  if (event.key === 'user-profile') {
    console.log('用户配置已更新')
  }
})
</script>
```

## 🔄 响应式同步

### useCacheSync

在多个组件间同步缓存状态：

```typescript
function useCacheSync<T>(key: string, options?: UseCacheSyncOptions<T>): Ref<T | null>
```

**示例:**

```vue
<!-- 组件 A -->
<script setup>
import { useCacheSync } from '@ldesign/cache/vue'

const sharedData = useCacheSync('shared-state', {
  defaultValue: { count: 0 },
})

const increment = () => {
  sharedData.value.count++ // 会同步到其他组件
}
</script>

<!-- 组件 B -->
<script setup>
import { useCacheSync } from '@ldesign/cache/vue'

// 自动同步组件 A 的变化
const sharedData = useCacheSync('shared-state')
</script>
```

## 🎯 专用组合式函数

### useLocalStorage

专门用于 localStorage 的组合式函数：

```typescript
function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options?: UseLocalStorageOptions<T>
): Ref<T>
```

**示例:**

```vue
<script setup>
import { useLocalStorage } from '@ldesign/cache/vue'

// 直接使用 localStorage
const theme = useLocalStorage('app-theme', 'light')
const settings = useLocalStorage('app-settings', {})

// 自动持久化
theme.value = 'dark' // 立即保存到 localStorage
</script>
```

### useSessionStorage

专门用于 sessionStorage 的组合式函数：

```typescript
function useSessionStorage<T>(
  key: string,
  defaultValue: T,
  options?: UseSessionStorageOptions<T>
): Ref<T>
```

### useCookie

专门用于 Cookie 的组合式函数：

```typescript
function useCookie<T>(key: string, defaultValue: T, options?: UseCookieOptions<T>): Ref<T>
```

**示例:**

```vue
<script setup>
import { useCookie } from '@ldesign/cache/vue'

// Cookie 配置
const authToken = useCookie('auth-token', '', {
  maxAge: 24 * 60 * 60, // 24小时
  secure: true, // 仅 HTTPS
  sameSite: 'strict', // 防 CSRF
})

// 自动同步到 Cookie
authToken.value = 'new-token'
</script>
```

## 🔧 插件系统

### 创建缓存插件

```typescript
interface CachePlugin {
  name: string
  install: (cache: CacheManager, options?: any) => void
}

// 示例插件：自动备份
const autoBackupPlugin: CachePlugin = {
  name: 'auto-backup',
  install(cache, options = {}) {
    const { interval = 60000 } = options

    setInterval(async () => {
      const data = await cache.exportData()
      localStorage.setItem('cache-backup', JSON.stringify(data))
    }, interval)
  },
}

// 使用插件
const cache = createCache({
  plugins: [autoBackupPlugin],
})
```

### 在 Vue 中使用插件

```typescript
// main.ts
app.use(CacheProvider, {
  plugins: [autoBackupPlugin, compressionPlugin, analyticsPlugin],
})
```

## 🎪 实际应用示例

### 用户认证状态管理

```vue
<template>
  <div>
    <div v-if="isLoggedIn">
      欢迎, {{ user.name }}!
      <button @click="logout">退出登录</button>
    </div>
    <div v-else>
      <button @click="login">登录</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCache } from '@ldesign/cache/vue'

// 用户信息缓存
const {
  value: user,
  set: setUser,
  remove: removeUser,
} = useCache('user-info', {
  defaultValue: null,
  ttl: 24 * 60 * 60 * 1000, // 24小时
})

// 认证令牌缓存
const {
  value: token,
  set: setToken,
  remove: removeToken,
} = useCache('auth-token', {
  defaultValue: '',
  engine: 'cookie', // 使用 Cookie 存储
  ttl: 2 * 60 * 60 * 1000, // 2小时
})

// 计算登录状态
const isLoggedIn = computed(() => {
  return user.value && token.value
})

// 登录
const login = async () => {
  const loginResult = await performLogin()

  await setUser(loginResult.user)
  await setToken(loginResult.token)
}

// 退出登录
const logout = async () => {
  await removeUser()
  await removeToken()
}
</script>
```

### 购物车状态管理

```vue
<template>
  <div class="shopping-cart">
    <h3>购物车 ({{ cartItems.length }})</h3>

    <div v-for="item in cartItems" :key="item.id" class="cart-item">
      <span>{{ item.name }}</span>
      <span>¥{{ item.price }}</span>
      <button @click="removeFromCart(item.id)">删除</button>
    </div>

    <div class="cart-total">总计: ¥{{ totalPrice }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCacheList } from '@ldesign/cache/vue'

// 购物车列表缓存
const {
  list: cartItems,
  add: addToCart,
  remove: removeFromCart,
  clear: clearCart,
} = useCacheList('shopping-cart', {
  defaultValue: [],
  autoSave: true,
  ttl: 7 * 24 * 60 * 60 * 1000, // 7天
})

// 计算总价
const totalPrice = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.price, 0)
})

// 添加商品到购物车
const addProduct = product => {
  addToCart({
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: 1,
    addedAt: Date.now(),
  })
}
</script>
```

## 🔗 相关文档

- [CacheManager API](./cache-manager.md) - 核心 API 文档
- [Vue 集成指南](../guide/vue-integration.md) - 集成使用指南
- [示例项目](/examples/) - 完整示例代码
