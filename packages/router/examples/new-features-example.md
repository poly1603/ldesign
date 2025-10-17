# @ldesign/router 新功能使用示例

## 1. 路由国际化（i18n）

### 基本设置

```typescript
import { createRouter, createWebHistory, setupI18nRouter } from '@ldesign/router'

// 创建路由器
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/Home.vue')
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('./views/About.vue')
    },
    {
      path: '/products',
      name: 'Products',
      component: () => import('./views/Products.vue')
    }
  ]
})

// 设置 i18n
const i18nManager = setupI18nRouter(router, {
  defaultLocale: 'en',
  locales: ['en', 'zh', 'ja'],
  detectBrowserLanguage: true,
  strategy: 'non-default', // 仅非默认语言添加前缀
  
  // 路径本地化映射
  pathLocalization: {
    '/about': {
      en: '/about',
      zh: '/关于',
      ja: '/について'
    },
    '/products': {
      en: '/products',
      zh: '/产品',
      ja: '/製品'
    }
  },
  
  onLocaleChange: (newLocale, oldLocale) => {
    console.log(`语言从 ${oldLocale} 切换到 ${newLocale}`)
  }
})
```

### 在组件中使用

```vue
<template>
  <div>
    <!-- 语言切换器 -->
    <LocaleSwitcher mode="dropdown" format="name" />
    
    <!-- 本地化链接 -->
    <RouterLink :to="localizePath('/about')">
      {{ $t('nav.about') }}
    </RouterLink>
    
    <!-- 显示当前语言 -->
    <p>当前语言: {{ locale }}</p>
  </div>
</template>

<script setup>
import { useI18nRoute } from '@ldesign/router'

const { locale, localizePath, setLocale } = useI18nRoute()

// 切换语言
function switchToEnglish() {
  setLocale('en')
}
</script>
```

## 2. 数据预取

### 定义数据加载器

```typescript
import { defineLoader, setupDataFetching } from '@ldesign/router'

// 定义数据加载器
const userLoader = defineLoader(async (route) => {
  const response = await fetch(`/api/users/${route.params.id}`)
  return response.json()
})

const postsLoader = defineLoader(async (route) => {
  const response = await fetch(`/api/users/${route.params.id}/posts`)
  return response.json()
})

// 设置数据预取
setupDataFetching(router, {
  parallel: true, // 并行加载
  
  cache: {
    enabled: true,
    strategy: 'memory',
    ttl: 5 * 60 * 1000, // 5分钟
    maxSize: 50
  },
  
  retry: {
    count: 3,
    delay: 1000,
    backoff: 'exponential'
  },
  
  timeout: 10000, // 10秒超时
  
  prefetch: {
    enabled: true,
    routes: ['UserProfile', 'UserPosts'], // 预取这些路由的数据
    delay: 1000
  },
  
  onLoadingChange: (loading) => {
    // 显示/隐藏加载指示器
    console.log('Loading:', loading)
  },
  
  onError: (error, route) => {
    console.error('数据加载失败:', error, route)
  }
})
```

### 在路由中使用

```typescript
const routes = [
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: () => import('./views/UserProfile.vue'),
    meta: {
      loaders: {
        user: userLoader,
        posts: postsLoader
      }
    }
  }
]
```

### 在组件中使用

```vue
<template>
  <div>
    <!-- 显示加载状态 -->
    <div v-if="loading">加载中...</div>
    
    <!-- 显示错误 -->
    <div v-else-if="error">
      错误: {{ error.message }}
      <button @click="refresh">重试</button>
    </div>
    
    <!-- 显示数据 -->
    <div v-else>
      <h1>{{ data.user.name }}</h1>
      <ul>
        <li v-for="post in data.posts" :key="post.id">
          {{ post.title }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useRouteData } from '@ldesign/router'

const { loading, error, data, refresh } = useRouteData()
</script>
```

## 3. 滚动行为管理

### 设置滚动行为

```typescript
import { createScrollBehavior } from '@ldesign/router'

// 创建滚动管理器
const scrollManager = createScrollBehavior({
  smooth: true, // 平滑滚动
  delay: 100, // 延迟100ms
  savePosition: true, // 保存滚动位置
  maxSavedPositions: 100,
  anchorOffset: -80, // 锚点偏移（用于固定头部）
  
  // 自定义滚动行为
  custom: (to, from, savedPosition) => {
    // 如果有保存的位置，使用它
    if (savedPosition) {
      return savedPosition
    }
    
    // 如果有锚点，滚动到锚点
    if (to.hash) {
      return { el: to.hash, top: 80 }
    }
    
    // 否则滚动到顶部
    return { left: 0, top: 0 }
  }
})

// 在路由器中使用
router.afterEach((to, from) => {
  scrollManager.handleScroll(to, from)
})
```

### 在组件中使用

```vue
<script setup>
import { getScrollManager } from '@ldesign/router'

const scrollManager = getScrollManager()

// 滚动到顶部
function scrollToTop() {
  scrollManager.scrollToTop()
}

// 滚动到底部
function scrollToBottom() {
  scrollManager.scrollToBottom()
}

// 滚动到元素
function scrollToSection() {
  scrollManager.scrollToElement('#section-2', -100) // 100px偏移
}

// 检查滚动位置
const isAtTop = scrollManager.isAtTop()
const isAtBottom = scrollManager.isAtBottom()
const currentPosition = scrollManager.getCurrentPosition()
</script>
```

## 4. 综合示例：多语言电商网站

```typescript
// main.ts
import { createApp } from 'vue'
import { 
  createRouter,
  createWebHistory,
  setupI18nRouter,
  setupDataFetching,
  createScrollBehavior,
  defineLoader
} from '@ldesign/router'

// 创建路由器
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/Home.vue')
    },
    {
      path: '/products',
      name: 'Products',
      component: () => import('./views/Products.vue'),
      meta: {
        loaders: {
          products: defineLoader(async () => {
            const res = await fetch('/api/products')
            return res.json()
          })
        }
      }
    },
    {
      path: '/product/:id',
      name: 'ProductDetail',
      component: () => import('./views/ProductDetail.vue'),
      meta: {
        loaders: {
          product: defineLoader(async (route) => {
            const res = await fetch(`/api/products/${route.params.id}`)
            return res.json()
          }),
          reviews: defineLoader(async (route) => {
            const res = await fetch(`/api/products/${route.params.id}/reviews`)
            return res.json()
          })
        }
      }
    }
  ]
})

// 设置国际化
setupI18nRouter(router, {
  defaultLocale: 'en',
  locales: ['en', 'zh', 'ja'],
  detectBrowserLanguage: true,
  strategy: 'non-default',
  pathLocalization: {
    '/products': {
      en: '/products',
      zh: '/产品',
      ja: '/製品'
    },
    '/cart': {
      en: '/cart',
      zh: '/购物车',
      ja: '/カート'
    },
    '/checkout': {
      en: '/checkout',
      zh: '/结账',
      ja: '/チェックアウト'
    }
  }
})

// 设置数据预取
setupDataFetching(router, {
  parallel: true,
  cache: {
    enabled: true,
    strategy: 'session', // 使用会话存储
    ttl: 10 * 60 * 1000 // 10分钟
  },
  retry: {
    count: 2,
    delay: 500,
    backoff: 'exponential'
  },
  prefetch: {
    enabled: true,
    routes: ['Products'], // 预取产品列表
    delay: 2000
  }
})

// 设置滚动行为
const scrollManager = createScrollBehavior({
  smooth: true,
  savePosition: true,
  anchorOffset: -60 // 固定头部高度
})

router.afterEach((to, from) => {
  scrollManager.handleScroll(to, from)
})

const app = createApp(App)
app.use(router)
app.mount('#app')
```

## 5. 高级功能：表单路由管理（即将推出）

```typescript
// 未来功能预览
import { createFormRouteManager } from '@ldesign/router'

const formManager = createFormRouteManager(router, {
  // 未保存更改警告
  unsavedChangesGuard: true,
  
  // 表单缓存
  cache: {
    enabled: true,
    storage: 'session',
    encrypt: true // 加密敏感数据
  },
  
  // 多步表单
  wizard: {
    routes: ['Step1', 'Step2', 'Step3', 'Confirmation'],
    validation: 'progressive', // 逐步验证
    allowSkip: false,
    onComplete: async (data) => {
      await submitForm(data)
    }
  }
})
```

## 6. 性能优化建议

### 路由懒加载

```typescript
// 使用动态导入
const routes = [
  {
    path: '/heavy-component',
    component: () => import(/* webpackChunkName: "heavy" */ './HeavyComponent.vue')
  }
]
```

### 预加载优化

```typescript
// 在 RouterLink 中使用预加载
<RouterLink 
  :to="/products" 
  :prefetch="true"
  :prefetch-priority="high"
>
  产品列表
</RouterLink>
```

### 缓存策略

```typescript
// 配置智能缓存
setupDataFetching(router, {
  cache: {
    enabled: true,
    strategy: 'memory',
    ttl: 5 * 60 * 1000,
    
    // 基于路由的缓存策略
    routeSpecific: {
      'Products': 10 * 60 * 1000, // 产品列表缓存10分钟
      'UserProfile': 60 * 1000 // 用户资料缓存1分钟
    }
  }
})
```

## 总结

这些新功能极大地增强了 @ldesign/router 的能力：

1. **国际化支持** - 完整的多语言路由解决方案
2. **数据预取** - 智能的路由级数据管理
3. **滚动行为** - 精细的滚动控制
4. **性能优化** - 多层缓存和预加载策略

所有功能都经过精心设计，易于使用，并且相互配合良好。