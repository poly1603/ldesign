# Provider 使用指南

Provider 模式提供了依赖注入的方式来管理状态，让你可以在应用的任何地方访问 Store，而不需要手动传递实
例。

## 基础 Provider 使用

### 设置 StoreProvider

```vue
<!-- App.vue -->
<script setup lang="ts">
import { StoreProvider } from '@ldesign/store/vue'
import { CartStore, SettingsStore, UserStore } from '@/stores'

// 定义要注入的 Store
const stores = {
  user: UserStore,
  cart: CartStore,
  settings: SettingsStore,
}
</script>

<template>
  <StoreProvider :stores="stores">
    <div id="app">
      <Header />
      <RouterView />
      <Footer />
    </div>
  </StoreProvider>
</template>
```

### 在组件中使用

```vue
<!-- UserProfile.vue -->
<script setup lang="ts">
import { useStoreProvider } from '@ldesign/store/vue'
import { ref } from 'vue'

// 获取 Provider 上下文
const { getStore } = useStoreProvider()

// 获取特定的 Store
const userStore = getStore('user')

const email = ref('')
const password = ref('')

async function handleLogin() {
  try {
    await userStore.login({ email: email.value, password: password.value })
    email.value = ''
    password.value = ''
  } catch (error) {
    console.error('登录失败:', error)
  }
}

async function logout() {
  await userStore.logout()
}
</script>

<template>
  <div class="user-profile">
    <div v-if="userStore.isLoggedIn" class="profile-info">
      <img :src="userStore.userAvatar" :alt="userStore.userName" />
      <h2>{{ userStore.userName }}</h2>
      <p>{{ userStore.userEmail }}</p>
      <button @click="logout">退出登录</button>
    </div>

    <div v-else class="login-form">
      <h2>请登录</h2>
      <form @submit.prevent="handleLogin">
        <input v-model="email" type="email" placeholder="邮箱" />
        <input v-model="password" type="password" placeholder="密码" />
        <button type="submit" :disabled="userStore.loading">
          {{ userStore.loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>
```

## 高级 Provider 配置

### 自定义 Provider 配置

```typescript
// stores/index.ts
import { createPinia } from 'pinia'
import { CartStore, ProductStore, SettingsStore, UserStore } from './modules'

// 创建自定义 Pinia 实例
export const pinia = createPinia()

// Store 注册配置
export const storeConfig = {
  // 立即创建的 Store
  immediate: {
    settings: SettingsStore,
    user: UserStore,
  },

  // 懒加载的 Store
  lazy: {
    cart: CartStore,
    products: ProductStore,
  },
}

// 导出所有 Store
export { CartStore, ProductStore, SettingsStore, UserStore }
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { StoreProvider } from '@ldesign/store/vue'
import { pinia, storeConfig } from '@/stores'

const isDev = import.meta.env.DEV

// 合并所有 Store 配置
const allStores = {
  ...storeConfig.immediate,
  ...storeConfig.lazy,
}
</script>

<template>
  <StoreProvider :pinia="pinia" :stores="allStores" :global="true" :devtools="isDev">
    <RouterView />
  </StoreProvider>
</template>
```

### 使用插件方式

```typescript
import { createStoreProviderPlugin } from '@ldesign/store/vue'
// main.ts
import { createApp } from 'vue'
import { pinia, storeConfig } from '@/stores'
import App from './App.vue'

const app = createApp(App)

// 使用 Store Provider 插件
app.use(
  createStoreProviderPlugin({
    pinia,
    stores: {
      ...storeConfig.immediate,
      ...storeConfig.lazy,
    },
    global: true,
    devtools: true,
  })
)

app.mount('#app')
```

## Store 注册和管理

### 动态注册 Store

```typescript
import type { StoreRegistration } from '@ldesign/store/vue'
// stores/registry.ts
import { reactive, ref } from 'vue'

class StoreRegistry {
  private stores = reactive(new Map<string, StoreRegistration>())
  private instances = reactive(new Map<string, any>())

  register(id: string, storeClass: any, options: { lazy?: boolean; singleton?: boolean } = {}) {
    this.stores.set(id, {
      id,
      factory: () => new storeClass(id),
      lazy: options.lazy ?? false,
      singleton: options.singleton ?? true,
    })

    // 如果不是懒加载，立即创建实例
    if (!options.lazy) {
      this.getInstance(id)
    }
  }

  getInstance<T = any>(id: string): T | undefined {
    // 检查是否已有实例
    if (this.instances.has(id)) {
      return this.instances.get(id)
    }

    // 获取注册信息
    const registration = this.stores.get(id)
    if (!registration) {
      console.warn(`Store "${id}" is not registered`)
      return undefined
    }

    // 创建新实例
    try {
      const instance = registration.factory()

      // 如果是单例，缓存实例
      if (registration.singleton) {
        this.instances.set(id, instance)
      }

      return instance
    } catch (error) {
      console.error(`Failed to create store "${id}":`, error)
      return undefined
    }
  }

  unregister(id: string) {
    this.stores.delete(id)
    this.instances.delete(id)
  }

  clear() {
    this.stores.clear()
    this.instances.clear()
  }

  getRegisteredStores() {
    return Array.from(this.stores.keys())
  }
}

export const storeRegistry = new StoreRegistry()
```

### 使用注册表

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { DynamicStore } from '@/stores/DynamicStore'
import { storeRegistry } from '@/stores/registry'

const registeredStores = computed(() => storeRegistry.getRegisteredStores())

function loadStore(storeId: string) {
  const store = storeRegistry.getInstance(storeId)
  console.log(`加载 Store ${storeId}:`, store)
}

function unloadStore(storeId: string) {
  storeRegistry.unregister(storeId)
  console.log(`卸载 Store ${storeId}`)
}

function registerDynamicStore() {
  const dynamicId = `dynamic-${Date.now()}`
  storeRegistry.register(dynamicId, DynamicStore, { lazy: true })
  console.log(`注册动态 Store: ${dynamicId}`)
}
</script>

<template>
  <div>
    <h2>已注册的 Store</h2>
    <ul>
      <li v-for="storeId in registeredStores" :key="storeId">
        {{ storeId }}
        <button @click="loadStore(storeId)">加载</button>
        <button @click="unloadStore(storeId)">卸载</button>
      </li>
    </ul>

    <h2>动态注册新 Store</h2>
    <button @click="registerDynamicStore">注册动态 Store</button>
  </div>
</template>
```

## 组合式 API 集成

### useStore Hook

```typescript
import type { StoreProviderContext } from '@ldesign/store/vue'
import { STORE_PROVIDER_KEY } from '@ldesign/store/vue'
// composables/useStore.ts
import { computed, inject } from 'vue'

export function useStore<T = any>(storeId: string): T {
  const context = inject(STORE_PROVIDER_KEY)

  if (!context) {
    throw new Error('useStore must be used within a StoreProvider')
  }

  const store = context.getStore<T>(storeId)

  if (!store) {
    throw new Error(`Store "${storeId}" not found`)
  }

  return store
}

// 类型安全的 Store Hooks
export const useUserStore = () => useStore<UserStore>('user')
export const useCartStore = () => useStore<CartStore>('cart')
export const useSettingsStore = () => useStore<SettingsStore>('settings')
```

### useState Hook

```typescript
// composables/useState.ts
import { computed } from 'vue'
import { useStore } from './useStore'

export function useState<T = any>(storeId: string, stateKey: string) {
  const store = useStore(storeId)

  const value = computed({
    get: () => (store as any)[stateKey],
    set: newValue => {
      if (typeof (store as any)[`set${capitalize(stateKey)}`] === 'function') {
        ;(store as any)[`set${capitalize(stateKey)}`](newValue)
      } else {
        ;(store as any)[stateKey] = newValue
      }
    },
  })

  return {
    value,
    setValue: (newValue: T) => {
      value.value = newValue
    },
    reset: () => {
      if (typeof (store as any)[`reset${capitalize(stateKey)}`] === 'function') {
        ;(store as any)[`reset${capitalize(stateKey)}`]()
      }
    },
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
```

### useAction Hook

```typescript
// composables/useAction.ts
import { computed, ref } from 'vue'
import { useStore } from './useStore'

export function useAction<T extends (...args: any[]) => any>(storeId: string, actionName: string) {
  const store = useStore(storeId)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<ReturnType<T> | null>(null)

  const execute = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    loading.value = true
    error.value = null

    try {
      const action = (store as any)[actionName]
      if (typeof action !== 'function') {
        throw new TypeError(`Action "${actionName}" not found in store "${storeId}"`)
      }

      const result = await action(...args)
      data.value = result
      return result
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
  }

  return {
    execute: execute as T,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    data: computed(() => data.value),
    reset,
  }
}
```

## 多级 Provider

### 嵌套 Provider

```vue
<!-- App.vue - 全局 Provider -->
<script setup lang="ts">
import { StoreProvider } from '@ldesign/store/vue'
import { SettingsStore, UserStore } from '@/stores'

const globalStores = {
  user: UserStore,
  settings: SettingsStore,
}
</script>

<template>
  <StoreProvider :stores="globalStores">
    <RouterView />
  </StoreProvider>
</template>
```

```vue
<!-- ShoppingPage.vue - 页面级 Provider -->
<script setup lang="ts">
import { StoreProvider } from '@ldesign/store/vue'
import { CartStore, ProductStore } from '@/stores'

const shoppingStores = {
  cart: CartStore,
  products: ProductStore,
}
</script>

<template>
  <StoreProvider :stores="shoppingStores">
    <div class="shopping-page">
      <ProductList />
      <ShoppingCart />
    </div>
  </StoreProvider>
</template>
```

```vue
<!-- ProductList.vue - 可以访问所有层级的 Store -->
<script setup lang="ts">
import { useCartStore, useProductStore, useUserStore } from '@/composables/useStore'

// 可以访问所有层级的 Store
const userStore = useUserStore() // 来自全局 Provider
const cartStore = useCartStore() // 来自页面级 Provider
const productStore = useProductStore() // 来自页面级 Provider

function addToCart(product: Product) {
  cartStore.addItem(product)
}
</script>

<template>
  <div class="product-list">
    <div v-if="userStore.isLoggedIn" class="user-info">欢迎，{{ userStore.userName }}！</div>

    <div class="products">
      <div v-for="product in productStore.products" :key="product.id" class="product-item">
        <h3>{{ product.name }}</h3>
        <p>{{ product.price }}</p>
        <button @click="addToCart(product)">加入购物车</button>
      </div>
    </div>

    <div class="cart-summary">购物车商品数量: {{ cartStore.itemCount }}</div>
  </div>
</template>
```

## 条件 Provider

### 基于路由的 Provider

```vue
<!-- RouterProvider.vue -->
<script setup lang="ts">
import { StoreProvider } from '@ldesign/store/vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { AdminStore, AnalyticsStore, CartStore, ProductStore, UserStore } from '@/stores'

const route = useRoute()

// 根据路由动态提供不同的 Store
const currentStores = computed(() => {
  const baseStores = {
    user: UserStore,
  }

  // 购物相关页面
  if (route.path.startsWith('/shop')) {
    return {
      ...baseStores,
      cart: CartStore,
      products: ProductStore,
    }
  }

  // 管理员页面
  if (route.path.startsWith('/admin')) {
    return {
      ...baseStores,
      admin: AdminStore,
      analytics: AnalyticsStore,
    }
  }

  // 默认只提供基础 Store
  return baseStores
})
</script>

<template>
  <StoreProvider :stores="currentStores">
    <RouterView />
  </StoreProvider>
</template>
```

### 基于权限的 Provider

```vue
<!-- PermissionProvider.vue -->
<script setup lang="ts">
import { StoreProvider } from '@ldesign/store/vue'
import { computed } from 'vue'
import { useUserStore } from '@/composables/useStore'
import { AdminStore, PublicStore, SuperAdminStore, UserStore } from '@/stores'

const userStore = useUserStore()

// 根据用户权限提供不同的 Store
const authorizedStores = computed(() => {
  const stores: Record<string, any> = {
    public: PublicStore,
  }

  if (userStore.isLoggedIn) {
    stores.user = UserStore
  }

  if (userStore.isAdmin) {
    stores.admin = AdminStore
  }

  if (userStore.userRole === 'super-admin') {
    stores.superAdmin = SuperAdminStore
  }

  return stores
})
</script>

<template>
  <StoreProvider :stores="authorizedStores">
    <slot />
  </StoreProvider>
</template>
```

## 最佳实践

### 1. Provider 层次结构

```
App (全局 Store)
├── Layout (布局相关 Store)
├── Pages (页面特定 Store)
│   ├── Shopping (购物相关 Store)
│   ├── Admin (管理相关 Store)
│   └── Profile (用户资料 Store)
└── Components (组件特定 Store)
```

### 2. Store 生命周期管理

```typescript
// stores/lifecycle.ts
export class StoreLifecycleManager {
  private activeStores = new Set<string>()

  activate(storeId: string) {
    this.activeStores.add(storeId)
    console.log(`激活 Store: ${storeId}`)
  }

  deactivate(storeId: string) {
    this.activeStores.delete(storeId)
    console.log(`停用 Store: ${storeId}`)
  }

  cleanup() {
    this.activeStores.forEach(storeId => {
      // 执行清理逻辑
      console.log(`清理 Store: ${storeId}`)
    })
    this.activeStores.clear()
  }

  getActiveStores() {
    return Array.from(this.activeStores)
  }
}
```

### 3. 错误边界

```vue
<!-- StoreErrorBoundary.vue -->
<script setup lang="ts">
import { StoreProvider } from '@ldesign/store/vue'
import { ref } from 'vue'

const props = defineProps<{
  stores: Record<string, any>
}>()

const hasError = ref(false)
const error = ref<string>('')

function handleError(err: Error) {
  hasError.value = true
  error.value = err.message
  console.error('Store Provider 错误:', err)
}

function retry() {
  hasError.value = false
  error.value = ''
}
</script>

<template>
  <div v-if="hasError" class="store-error">
    <h2>Store 加载失败</h2>
    <p>{{ error }}</p>
    <button @click="retry">重试</button>
  </div>
  <StoreProvider v-else :stores="stores" @error="handleError">
    <slot />
  </StoreProvider>
</template>
```

## 下一步

- 学习 [性能优化](/guide/performance) 提升应用性能
- 查看 [最佳实践](/guide/best-practices) 编写更好的代码
- 探索 [API 参考](/api/) 了解详细接口
