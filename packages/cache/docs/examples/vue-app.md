# Vue 应用示例

本文档展示如何在 Vue 应用中使用 @ldesign/cache。

## 基础集成

### 1. 安装和配置

```bash
npm install @ldesign/cache
```

### 2. 全局配置

在 `main.ts` 中配置缓存：

```typescript
import { createApp } from 'vue'
import { CacheProvider } from '@ldesign/cache/vue'
import App from './App.vue'

const app = createApp(App)

// 全局缓存配置
const cacheOptions = {
  engines: ['localStorage', 'sessionStorage', 'memory'],
  strategy: 'balanced',
  security: {
    obfuscation: {
      enabled: true,
      algorithm: 'base64',
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

app.mount('#app')
```

### 3. 根组件配置

```vue
<!-- App.vue -->
<template>
  <CacheProvider :options="cacheOptions">
    <div id="app">
      <Header />
      <router-view />
      <Footer />
    </div>
  </CacheProvider>
</template>

<script setup lang="ts">
import { CacheProvider } from '@ldesign/cache/vue'

const cacheOptions = {
  engines: ['localStorage', 'memory'],
  strategy: 'performance',
  debug: true,
}
</script>
```

## 用户管理示例

### 用户信息组件

```vue
<!-- UserProfile.vue -->
<template>
  <div class="user-profile">
    <div v-if="loading" class="loading">
      加载中...
    </div>
    
    <div v-else-if="error" class="error">
      错误: {{ error.message }}
    </div>
    
    <div v-else class="profile">
      <h2>用户信息</h2>
      <form @submit.prevent="saveProfile">
        <div class="field">
          <label>姓名:</label>
          <input v-model="profile.name" type="text" />
        </div>
        
        <div class="field">
          <label>邮箱:</label>
          <input v-model="profile.email" type="email" />
        </div>
        
        <div class="field">
          <label>年龄:</label>
          <input v-model.number="profile.age" type="number" />
        </div>
        
        <button type="submit" :disabled="saving">
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </form>
      
      <div class="actions">
        <button @click="refreshProfile">刷新</button>
        <button @click="clearProfile">清除</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCache } from '@ldesign/cache/vue'

interface UserProfile {
  name: string
  email: string
  age: number
}

const cache = useCache()
const saving = ref(false)

// 使用响应式缓存
const profileCache = cache.useReactiveCache<UserProfile>('user:profile', {
  name: '',
  email: '',
  age: 0,
})

const profile = profileCache.value
const loading = profileCache.loading
const error = profileCache.error

// 监听数据变化，自动保存
watch(profile, async (newProfile) => {
  if (newProfile && (newProfile.name || newProfile.email)) {
    await profileCache.update(newProfile, { ttl: 7 * 24 * 60 * 60 * 1000 }) // 7天
  }
}, { deep: true })

const saveProfile = async () => {
  saving.value = true
  try {
    await profileCache.update(profile.value!, {
      ttl: 7 * 24 * 60 * 60 * 1000, // 7天过期
      encrypt: true, // 加密存储
    })
    console.log('用户信息已保存')
  } catch (err) {
    console.error('保存失败:', err)
  } finally {
    saving.value = false
  }
}

const refreshProfile = async () => {
  await profileCache.refresh()
}

const clearProfile = async () => {
  await profileCache.remove()
  profile.value = { name: '', email: '', age: 0 }
}
</script>

<style scoped>
.user-profile {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.field {
  margin-bottom: 15px;
}

.field label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.field input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.actions {
  margin-top: 20px;
}

.actions button {
  margin-right: 10px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.loading, .error {
  text-align: center;
  padding: 20px;
}

.error {
  color: red;
}
</style>
```

## 设置管理示例

### 应用设置组件

```vue
<!-- AppSettings.vue -->
<template>
  <div class="app-settings">
    <h2>应用设置</h2>
    
    <div class="setting-group">
      <h3>主题设置</h3>
      <label>
        <input 
          v-model="settings.theme" 
          type="radio" 
          value="light"
        />
        浅色主题
      </label>
      <label>
        <input 
          v-model="settings.theme" 
          type="radio" 
          value="dark"
        />
        深色主题
      </label>
    </div>
    
    <div class="setting-group">
      <h3>语言设置</h3>
      <select v-model="settings.language">
        <option value="zh-CN">中文</option>
        <option value="en-US">English</option>
        <option value="ja-JP">日本語</option>
      </select>
    </div>
    
    <div class="setting-group">
      <h3>缓存设置</h3>
      <label>
        <input 
          v-model="settings.cacheEnabled" 
          type="checkbox"
        />
        启用缓存
      </label>
      
      <label>
        自动清理间隔:
        <select v-model="settings.cleanupInterval">
          <option :value="60000">1分钟</option>
          <option :value="300000">5分钟</option>
          <option :value="3600000">1小时</option>
        </select>
      </label>
    </div>
    
    <div class="actions">
      <button @click="resetSettings">重置设置</button>
      <button @click="exportSettings">导出设置</button>
      <button @click="importSettings">导入设置</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useCache } from '@ldesign/cache/vue'

interface AppSettings {
  theme: 'light' | 'dark'
  language: string
  cacheEnabled: boolean
  cleanupInterval: number
}

const cache = useCache()

// 响应式设置
const settingsCache = cache.useReactiveCache<AppSettings>('app:settings', {
  theme: 'light',
  language: 'zh-CN',
  cacheEnabled: true,
  cleanupInterval: 300000,
})

const settings = settingsCache.value

// 启用自动保存
settingsCache.enableAutoSave(1000) // 1秒延迟保存

// 监听主题变化，应用到页面
watch(() => settings.value?.theme, (theme) => {
  if (theme) {
    document.documentElement.setAttribute('data-theme', theme)
  }
}, { immediate: true })

// 监听语言变化
watch(() => settings.value?.language, (language) => {
  if (language) {
    // 这里可以集成 i18n
    console.log('语言切换到:', language)
  }
}, { immediate: true })

const resetSettings = async () => {
  await settingsCache.update({
    theme: 'light',
    language: 'zh-CN',
    cacheEnabled: true,
    cleanupInterval: 300000,
  })
}

const exportSettings = async () => {
  const data = JSON.stringify(settings.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = 'app-settings.json'
  a.click()
  
  URL.revokeObjectURL(url)
}

const importSettings = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const text = await file.text()
      try {
        const importedSettings = JSON.parse(text)
        await settingsCache.update(importedSettings)
        console.log('设置导入成功')
      } catch (error) {
        console.error('设置导入失败:', error)
      }
    }
  }
  
  input.click()
}
</script>
```

## 数据列表示例

### 商品列表组件

```vue
<!-- ProductList.vue -->
<template>
  <div class="product-list">
    <div class="header">
      <h2>商品列表</h2>
      <div class="actions">
        <button @click="refreshProducts">刷新</button>
        <button @click="clearCache">清除缓存</button>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      加载中...
    </div>
    
    <div v-else-if="error" class="error">
      加载失败: {{ error.message }}
      <button @click="refreshProducts">重试</button>
    </div>
    
    <div v-else class="products">
      <div 
        v-for="product in products" 
        :key="product.id" 
        class="product-card"
      >
        <img :src="product.image" :alt="product.name" />
        <h3>{{ product.name }}</h3>
        <p class="price">¥{{ product.price }}</p>
        <p class="description">{{ product.description }}</p>
      </div>
    </div>
    
    <div class="cache-info">
      <p>缓存统计: {{ stats?.totalItems }} 项</p>
      <p>命中率: {{ (stats?.hitRate * 100).toFixed(1) }}%</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCache } from '@ldesign/cache/vue'

interface Product {
  id: number
  name: string
  price: number
  description: string
  image: string
}

const cache = useCache()
const products = ref<Product[]>([])
const loading = ref(false)
const error = ref<Error | null>(null)

// 获取缓存统计
const { stats } = cache

// 模拟 API 调用
const fetchProducts = async (): Promise<Product[]> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return [
    {
      id: 1,
      name: '商品 1',
      price: 99.99,
      description: '这是商品 1 的描述',
      image: '/images/product1.jpg',
    },
    {
      id: 2,
      name: '商品 2',
      price: 199.99,
      description: '这是商品 2 的描述',
      image: '/images/product2.jpg',
    },
  ]
}

const loadProducts = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 先尝试从缓存获取
    let cachedProducts = await cache.get<Product[]>('products')
    
    if (cachedProducts) {
      products.value = cachedProducts
      loading.value = false
      
      // 后台刷新数据
      fetchProducts().then(async (freshProducts) => {
        await cache.set('products', freshProducts, {
          ttl: 5 * 60 * 1000, // 5分钟缓存
        })
        products.value = freshProducts
      })
    } else {
      // 缓存未命中，从 API 获取
      const freshProducts = await fetchProducts()
      await cache.set('products', freshProducts, {
        ttl: 5 * 60 * 1000, // 5分钟缓存
      })
      products.value = freshProducts
    }
  } catch (err) {
    error.value = err as Error
  } finally {
    loading.value = false
  }
}

const refreshProducts = async () => {
  await cache.remove('products')
  await loadProducts()
}

const clearCache = async () => {
  await cache.clear()
  await loadProducts()
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.product-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.products {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.product-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.price {
  font-size: 1.2em;
  font-weight: bold;
  color: #e74c3c;
}

.cache-info {
  margin-top: 20px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
}

.error {
  color: red;
}
</style>
```

## 路由级缓存

### 路由守卫集成

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { createCache } from '@ldesign/cache'

const cache = createCache({
  engines: ['sessionStorage', 'memory'],
  strategy: 'performance',
})

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 路由配置
  ],
})

// 路由缓存中间件
router.beforeEach(async (to, from, next) => {
  // 缓存路由状态
  if (from.name) {
    await cache.set(`route:${from.name}`, {
      scrollPosition: window.scrollY,
      timestamp: Date.now(),
    }, { ttl: 30 * 60 * 1000 }) // 30分钟
  }
  
  next()
})

router.afterEach(async (to) => {
  // 恢复路由状态
  if (to.name) {
    const routeState = await cache.get(`route:${to.name}`)
    if (routeState) {
      setTimeout(() => {
        window.scrollTo(0, routeState.scrollPosition)
      }, 100)
    }
  }
})

export default router
```

这些示例展示了如何在 Vue 应用中有效使用 @ldesign/cache，包括用户管理、设置管理、数据列表和路由级缓存等常见场景。
