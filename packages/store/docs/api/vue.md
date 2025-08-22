# Vue 集成 API

@ldesign/store 提供了与 Vue 3 深度集成的 API，让你可以无缝地在 Vue 应用中使用状态管理。

## 安装和配置

### 基础安装

```bash
npm install @ldesign/store pinia vue reflect-metadata
```

### 应用配置

```typescript
import { createStorePlugin } from '@ldesign/store'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
// main.ts
import 'reflect-metadata'

const app = createApp(App)
const pinia = createPinia()

// 安装 Pinia
app.use(pinia)

// 安装 @ldesign/store 插件
app.use(
  createStorePlugin({
    devtools: true,
    persist: {
      storage: 'localStorage',
    },
  })
)

app.mount('#app')
```

## 组件集成

### 在组合式 API 中使用

```vue
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { UserStore } from '@/stores/user'

// 创建 Store 实例
const userStore = new UserStore('user')

// 响应式数据
const newProfile = ref({
  name: '',
  email: '',
})

// 生命周期
onMounted(async () => {
  await userStore.fetchProfile()
})

onUnmounted(() => {
  userStore.$dispose()
})

// 监听状态变化
const unsubscribe = userStore.$subscribe((mutation, state) => {
  console.log('用户状态变化:', mutation.type, state)
})

onUnmounted(() => {
  unsubscribe()
})
</script>

<template>
  <div class="user-profile">
    <h1>{{ userStore.displayName }}</h1>
    <p>邮箱: {{ userStore.email }}</p>
    <p>状态: {{ userStore.isOnline ? '在线' : '离线' }}</p>

    <button @click="userStore.updateProfile(newProfile)">更新资料</button>

    <div v-if="userStore.loading">加载中...</div>
    <div v-if="userStore.error" class="error">
      {{ userStore.error }}
    </div>
  </div>
</template>
```

### 在选项式 API 中使用

```vue
<script lang="ts">
import { defineComponent } from 'vue'
import { CounterStore } from '@/stores/counter'

export default defineComponent({
  name: 'CounterComponent',

  data() {
    return {
      counter: new CounterStore('counter'),
    }
  },

  mounted() {
    // 监听状态变化
    this.unsubscribe = this.counter.$subscribe((mutation, state) => {
      console.log('计数器变化:', state.count)
    })
  },

  beforeUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
    this.counter.$dispose()
  },
})
</script>

<template>
  <div class="counter">
    <h1>{{ counter.displayText }}</h1>
    <button @click="counter.increment">+1</button>
    <button @click="counter.decrement">-1</button>
  </div>
</template>
```

## 响应式集成

### 状态响应性

```typescript
// stores/reactive.ts
import { Action, BaseStore, Getter, State } from '@ldesign/store'
import { computed, ref, watch } from 'vue'

export class ReactiveStore extends BaseStore {
  @State({ default: [] })
  items: Item[] = []

  @State({ default: '' })
  filter: string = ''

  // 在 Store 中使用 Vue 的响应式 API
  private searchQuery = ref('')
  private debouncedQuery = computed(() => {
    // 使用 Vue 的计算属性
    return this.searchQuery.value.toLowerCase()
  })

  constructor(id: string) {
    super(id)

    // 监听 Vue 响应式数据
    watch(this.debouncedQuery, newQuery => {
      this.performSearch(newQuery)
    })
  }

  @Action()
  setSearchQuery(query: string) {
    this.searchQuery.value = query
  }

  @Action()
  private performSearch(query: string) {
    this.filter = query
  }

  @Getter()
  get filteredItems() {
    if (!this.filter) return this.items
    return this.items.filter(item => item.name.toLowerCase().includes(this.filter.toLowerCase()))
  }
}
```

### 与 Vue 响应式系统集成

```vue
<script setup lang="ts">
import { computed, watch } from 'vue'
import { ReactiveStore } from '@/stores/reactive'

const store = new ReactiveStore('reactive')

// Vue 计算属性可以依赖 Store 状态
const hasResults = computed(() => store.filteredItems.length > 0)

// Vue 监听器可以监听 Store 状态
watch(
  () => store.items.length,
  (newLength, oldLength) => {
    console.log(`项目数量从 ${oldLength} 变为 ${newLength}`)
  }
)

// 双向绑定 Store 状态
const searchQuery = computed({
  get: () => store.searchQuery,
  set: value => store.setSearchQuery(value),
})
</script>

<template>
  <div>
    <!-- 直接绑定 Store 状态 -->
    <input v-model="store.searchQuery" placeholder="搜索..." />

    <!-- 使用计算属性 -->
    <div class="results-count">找到 {{ store.filteredItems.length }} 个结果</div>

    <!-- 列表渲染 -->
    <div v-for="item in store.filteredItems" :key="item.id">
      {{ item.name }}
    </div>
  </div>
</template>
```

## 依赖注入

### 提供 Store

```typescript
// composables/useStoreProvider.ts
import { inject, InjectionKey, provide } from 'vue'
import { CartStore } from '@/stores/cart'
import { UserStore } from '@/stores/user'

// 定义注入键
export const UserStoreKey: InjectionKey<UserStore> = Symbol('UserStore')
export const CartStoreKey: InjectionKey<CartStore> = Symbol('CartStore')

// 提供 Store
export function provideStores() {
  const userStore = new UserStore('user')
  const cartStore = new CartStore('cart')

  provide(UserStoreKey, userStore)
  provide(CartStoreKey, cartStore)

  return { userStore, cartStore }
}

// 注入 Store
export function useUserStore() {
  const store = inject(UserStoreKey)
  if (!store) {
    throw new Error('UserStore not provided')
  }
  return store
}

export function useCartStore() {
  const store = inject(CartStoreKey)
  if (!store) {
    throw new Error('CartStore not provided')
  }
  return store
}
```

### 在应用中使用

```vue
<!-- App.vue -->
<script setup lang="ts">
import { provideStores } from '@/composables/useStoreProvider'

// 在根组件提供 Store
const { userStore, cartStore } = provideStores()

// 可以在这里进行全局初始化
userStore.initializeFromToken()
cartStore.loadFromStorage()
</script>

<template>
  <div id="app">
    <Header />
    <router-view />
    <Footer />
  </div>
</template>
```

```vue
<!-- 子组件中注入使用 -->
<script setup lang="ts">
import { useCartStore, useUserStore } from '@/composables/useStoreProvider'

const userStore = useUserStore()
const cartStore = useCartStore()
</script>

<template>
  <div class="user-info">
    <span>{{ userStore.name }}</span>
    <span>购物车: {{ cartStore.itemCount }}</span>
  </div>
</template>
```

## 路由集成

### 路由守卫

```typescript
// router/guards.ts
import { Router } from 'vue-router'
import { AuthStore } from '@/stores/auth'

export function setupRouterGuards(router: Router) {
  const authStore = new AuthStore('auth')

  // 全局前置守卫
  router.beforeEach(async (to, from, next) => {
    // 检查认证状态
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next('/login')
      return
    }

    // 检查权限
    if (to.meta.permissions) {
      const hasPermission = to.meta.permissions.every(permission =>
        authStore.hasPermission(permission)
      )

      if (!hasPermission) {
        next('/403')
        return
      }
    }

    next()
  })

  // 全局后置钩子
  router.afterEach((to, from) => {
    // 记录页面访问
    const analyticsStore = new AnalyticsStore('analytics')
    analyticsStore.trackPageView(to.path)
  })
}
```

### 路由状态同步

```typescript
// stores/router.ts
import { Action, BaseStore, State } from '@ldesign/store'
import { RouteLocationNormalized, Router } from 'vue-router'

export class RouterStore extends BaseStore {
  @State({ default: null })
  currentRoute: RouteLocationNormalized | null = null

  @State({ default: [] })
  history: RouteLocationNormalized[] = []

  @State({ default: false })
  isNavigating: boolean = false

  private router: Router

  constructor(id: string, router: Router) {
    super(id)
    this.router = router
    this.setupRouterSync()
  }

  private setupRouterSync() {
    // 同步当前路由
    this.router.beforeEach((to, from, next) => {
      this.isNavigating = true
      next()
    })

    this.router.afterEach((to, from) => {
      this.currentRoute = to
      this.history.push(to)
      this.isNavigating = false

      // 只保留最近 50 条历史记录
      if (this.history.length > 50) {
        this.history.shift()
      }
    })
  }

  @Action()
  navigateTo(path: string) {
    this.router.push(path)
  }

  @Action()
  goBack() {
    this.router.back()
  }

  @Action()
  goForward() {
    this.router.forward()
  }
}
```

## 插件系统

### 创建插件

```typescript
// plugins/logger.ts
import { StorePlugin } from '@ldesign/store'

export const loggerPlugin: StorePlugin = {
  name: 'logger',

  install(store, options) {
    // 监听所有状态变化
    store.$subscribe((mutation, state) => {
      console.group(`🔄 [${store.$id}] ${mutation.type}`)
      console.log('Payload:', mutation.payload)
      console.log('State:', state)
      console.groupEnd()
    })

    // 监听所有动作执行
    store.$onAction(({ name, args, after, onError }) => {
      const startTime = Date.now()

      console.log(`🚀 [${store.$id}] Action: ${name}`, args)

      after(() => {
        console.log(`✅ [${store.$id}] Action ${name} completed in ${Date.now() - startTime}ms`)
      })

      onError(error => {
        console.error(`❌ [${store.$id}] Action ${name} failed:`, error)
      })
    })
  },
}
```

### 使用插件

```typescript
// main.ts
import { createStorePlugin } from '@ldesign/store'
import { loggerPlugin } from '@/plugins/logger'

app.use(
  createStorePlugin({
    plugins: [loggerPlugin],
  })
)
```

## 开发工具

### Vue DevTools 集成

```typescript
// stores/devtools.ts
import { Action, BaseStore, State } from '@ldesign/store'

export class DevToolsStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  constructor(id: string) {
    super(id)

    // 开发环境下启用 DevTools
    if (process.env.NODE_ENV === 'development') {
      this.setupDevTools()
    }
  }

  private setupDevTools() {
    // 自定义 DevTools 标签
    this.$devtools = {
      label: 'Counter Store',
      color: '#42b883',
    }

    // 添加自定义检查器
    this.$addInspector({
      id: 'counter-inspector',
      label: 'Counter Inspector',
      icon: '🔢',
    })
  }

  @Action()
  increment() {
    this.count++

    // 发送自定义事件到 DevTools
    this.$devtools?.addTimelineEvent({
      layerId: 'counter',
      event: {
        title: 'Counter Incremented',
        subtitle: `New value: ${this.count}`,
        data: { count: this.count },
      },
    })
  }
}
```

### 调试工具

```typescript
// utils/debug.ts
import { BaseStore } from '@ldesign/store'

export function createDebugStore<T extends BaseStore>(
  StoreClass: new (id: string) => T,
  id: string
): T {
  const store = new StoreClass(id)

  if (process.env.NODE_ENV === 'development') {
    // 添加到全局对象以便调试
    ;(window as any)[`${id}Store`] = store

    // 添加调试方法
    ;(store as any).debug = {
      getState: () => store.$state,
      getHistory: () => store.$history,
      reset: () => store.$reset(),
      subscribe: (callback: Function) => store.$subscribe(callback),
    }
  }

  return store
}

// 使用
const userStore = createDebugStore(UserStore, 'user')
```

## 性能优化

### 懒加载 Store

```typescript
// composables/useLazyStore.ts
import { ref, Ref } from 'vue'

export function useLazyStore<T>(factory: () => T, condition?: () => boolean): Ref<T | null> {
  const store = ref<T | null>(null)

  const initialize = () => {
    if (!store.value && (!condition || condition())) {
      store.value = factory()
    }
  }

  // 可以在需要时手动初始化
  return {
    ...store,
    initialize,
  } as Ref<T | null> & { initialize: () => void }
}

// 使用
const lazyUserStore = useLazyStore(
  () => new UserStore('user'),
  () => authStore.isLoggedIn
)

// 在需要时初始化
onMounted(() => {
  if (authStore.isLoggedIn) {
    lazyUserStore.initialize()
  }
})
```

### 组件级 Store

```vue
<script setup lang="ts">
import { onUnmounted } from 'vue'
import { FormStore } from '@/stores/form'

// 组件级 Store，随组件创建和销毁
const formStore = new FormStore(`form-${Date.now()}`)

// 组件销毁时清理 Store
onUnmounted(() => {
  formStore.$dispose()
})
</script>

<template>
  <div class="form-component">
    <input v-model="formStore.name" />
    <input v-model="formStore.email" />
    <button @click="formStore.submit">提交</button>
  </div>
</template>
```

## 测试集成

### 单元测试

```typescript
import { createPinia } from 'pinia'
// tests/stores/user.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from 'vue'
import { UserStore } from '@/stores/user'

describe('UserStore', () => {
  let app: any
  let userStore: UserStore

  beforeEach(() => {
    // 创建测试环境
    app = createApp({})
    app.use(createPinia())

    userStore = new UserStore('test-user')
  })

  it('should initialize with default state', () => {
    expect(userStore.currentUser).toBeNull()
    expect(userStore.isLoggedIn).toBe(false)
  })

  it('should login user successfully', async () => {
    const mockUser = { id: '1', name: 'Test User' }

    // Mock API
    vi.mocked(userApi.login).mockResolvedValue({ user: mockUser })

    await userStore.login({ email: 'test@example.com', password: 'password' })

    expect(userStore.currentUser).toEqual(mockUser)
    expect(userStore.isLoggedIn).toBe(true)
  })
})
```

### 组件测试

```typescript
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
// tests/components/UserProfile.test.ts
import { describe, expect, it } from 'vitest'
import UserProfile from '@/components/UserProfile.vue'
import { UserStore } from '@/stores/user'

describe('UserProfile', () => {
  it('should display user information', async () => {
    const pinia = createPinia()
    const userStore = new UserStore('user')

    // 设置测试数据
    userStore.currentUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    }

    const wrapper = mount(UserProfile, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.text()).toContain('Test User')
    expect(wrapper.text()).toContain('test@example.com')
  })
})
```

## 常见问题

### Q: 如何在 Vue 组件外使用 Store？

A: 确保在 Vue 应用初始化后创建 Store：

```typescript
// utils/api.ts
import { UserStore } from '@/stores/user'

// main.ts
import { initializeStores } from '@/utils/api'

let userStore: UserStore

export function initializeStores() {
  userStore = new UserStore('user')
}

export function getUserStore() {
  if (!userStore) {
    throw new Error('Stores not initialized')
  }
  return userStore
}

const app = createApp(App)
app.use(createPinia())
app.mount('#app')

// 在 Pinia 初始化后创建 Store
initializeStores()
```

### Q: 如何处理 Store 的内存泄漏？

A: 在组件销毁时清理 Store：

```vue
<script setup lang="ts">
import { onUnmounted } from 'vue'

const store = new MyStore('my-store')

onUnmounted(() => {
  store.$dispose()
})
</script>
```

### Q: 如何在 SSR 中使用？

A: 确保在服务端和客户端使用相同的 Store 实例：

```typescript
// plugins/store.client.ts
export default defineNuxtPlugin(() => {
  // 只在客户端初始化
  if (process.client) {
    initializeStores()
  }
})
```

## 下一步

- 学习 [工具函数](/api/utils) 了解辅助工具
- 查看 [类型定义](/api/types) 了解完整的类型系统
- 探索 [实战项目](/examples/real-world/) 查看完整的项目示例
