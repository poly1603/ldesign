# RouterView API

RouterView 是 LDesign Router 的核心组件，负责渲染匹配的路由组件。它提供了灵活的渲染控制和丰富的功能
特性。

## 📋 基础用法

### 简单使用

```vue
<template>
  <div id="app">
    <!-- 基础路由视图 -->
    <RouterView />
  </div>
</template>
```

### 命名视图

```vue
<template>
  <div class="layout">
    <!-- 默认视图 -->
    <main class="main">
      <RouterView />
    </main>

    <!-- 命名视图 -->
    <aside class="sidebar">
      <RouterView name="sidebar" />
    </aside>

    <header class="header">
      <RouterView name="header" />
    </header>
  </div>
</template>
```

对应的路由配置：

```typescript
const routes = [
  {
    path: '/dashboard',
    components: {
      default: Dashboard,
      sidebar: DashboardSidebar,
      header: DashboardHeader,
    },
  },
]
```

## 🎨 Props 属性

### name

指定要渲染的命名视图。

**类型：** `string` **默认值：** `'default'`

```vue
<template>
  <!-- 渲染默认视图 -->
  <RouterView />

  <!-- 渲染命名视图 -->
  <RouterView name="sidebar" />
  <RouterView name="header" />
</template>
```

### route

指定要渲染的路由对象，通常用于测试或特殊场景。

**类型：** `RouteLocationNormalized` **默认值：** 当前路由

```vue
<script setup>
import { ref } from 'vue'

const customRoute = ref({
  path: '/custom',
  name: 'Custom',
  // ... 其他路由属性
})
</script>

<template>
  <!-- 使用当前路由 -->
  <RouterView />

  <!-- 使用指定路由 -->
  <RouterView :route="customRoute" />
</template>
```

## 🎭 插槽 API

### 默认插槽

RouterView 提供了强大的插槽 API，让你完全控制组件的渲染：

```vue
<template>
  <RouterView v-slot="{ Component, route }">
    <!-- 自定义渲染逻辑 -->
    <component :is="Component" :key="route.path" class="page-component" />
  </RouterView>
</template>
```

### 插槽参数

| 参数        | 类型                      | 描述         |
| ----------- | ------------------------- | ------------ |
| `Component` | `Component \| null`       | 要渲染的组件 |
| `route`     | `RouteLocationNormalized` | 当前路由对象 |

```vue
<template>
  <RouterView v-slot="{ Component, route }">
    <div class="page-wrapper">
      <!-- 页面标题 -->
      <h1 class="page-title">
        {{ route.meta.title }}
      </h1>

      <!-- 组件渲染 -->
      <component :is="Component" v-if="Component" :key="route.path" />

      <!-- 无组件时的占位符 -->
      <div v-else class="no-component">页面不存在</div>
    </div>
  </RouterView>
</template>
```

## 🎬 过渡动画

### 基础过渡

```vue
<template>
  <RouterView v-slot="{ Component, route }">
    <transition name="fade" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </RouterView>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

### 动态过渡

根据路由元信息动态选择过渡效果：

```vue
<template>
  <RouterView v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade'" mode="out-in" appear>
      <component :is="Component" :key="route.path" />
    </transition>
  </RouterView>
</template>

<style>
/* 淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滑动效果 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from {
  transform: translateX(100%);
}
.slide-leave-to {
  transform: translateX(-100%);
}

/* 缩放效果 */
.scale-enter-active,
.scale-leave-active {
  transition: transform 0.3s ease;
}
.scale-enter-from,
.scale-leave-to {
  transform: scale(0.8);
}
</style>
```

### 复杂过渡控制

```vue
<script setup>
import { useRoute } from '@ldesign/router'

const route = useRoute()

// 获取过渡名称
function getTransitionName(route) {
  // 根据路由深度决定过渡效果
  const depth = route.matched.length
  if (depth > 2) return 'slide-up'
  if (depth > 1) return 'slide-right'
  return 'fade'
}

// 获取过渡模式
function getTransitionMode(route) {
  return route.meta.transitionMode || 'out-in'
}

// 获取组件 key
function getComponentKey(route) {
  // 对于某些路由，使用完整路径作为 key
  if (route.meta.useFullPathAsKey) {
    return route.fullPath
  }
  return route.path
}

// 过渡钩子
function onBeforeEnter(el) {
  console.log('页面即将进入')
}

function onEnter(el, done) {
  console.log('页面进入中')
  done()
}

function onLeave(el, done) {
  console.log('页面离开中')
  done()
}
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <transition
      :name="getTransitionName(route)"
      :mode="getTransitionMode(route)"
      :appear="route.meta.transitionAppear"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @leave="onLeave"
    >
      <component :is="Component" :key="getComponentKey(route)" />
    </transition>
  </RouterView>
</template>
```

## 🔄 KeepAlive 集成

### 基础缓存

```vue
<template>
  <RouterView v-slot="{ Component, route }">
    <KeepAlive>
      <component :is="Component" :key="route.path" />
    </KeepAlive>
  </RouterView>
</template>
```

### 条件缓存

根据路由元信息决定是否缓存：

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { computed } from 'vue'

const route = useRoute()

// 缓存配置
const cacheInclude = computed(() => route.meta.cacheInclude)
const cacheExclude = computed(() => route.meta.cacheExclude)
const cacheMax = computed(() => route.meta.cacheMax || 10)
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <KeepAlive
      v-if="route.meta.keepAlive"
      :include="cacheInclude"
      :exclude="cacheExclude"
      :max="cacheMax"
    >
      <component :is="Component" :key="route.path" />
    </KeepAlive>

    <component :is="Component" v-else :key="route.path" />
  </RouterView>
</template>
```

### 智能缓存管理

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { computed, ref } from 'vue'

const route = useRoute()
const cachedComponents = ref(new Set())
const maxCacheSize = ref(5)

// 动态包含列表
const dynamicInclude = computed(() => {
  return Array.from(cachedComponents.value)
})

// 判断是否应该缓存
function shouldCache(route) {
  return route.meta.cache !== false && !route.meta.noCache && route.name
}

// 获取组件缓存 key
function getComponentKey(route) {
  return route.meta.cacheKey || route.name || route.path
}

// 组件激活
function onActivated(component) {
  console.log('组件被激活:', component)
}

// 组件失活
function onDeactivated(component) {
  console.log('组件被失活:', component)
}

// 监听路由变化，管理缓存
watch(
  () => route.name,
  newName => {
    if (newName && shouldCache(route.value)) {
      cachedComponents.value.add(newName)

      // 限制缓存数量
      if (cachedComponents.value.size > maxCacheSize.value) {
        const firstItem = cachedComponents.value.values().next().value
        cachedComponents.value.delete(firstItem)
      }
    }
  }
)
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <KeepAlive
      :include="dynamicInclude"
      :max="maxCacheSize"
      @activated="onActivated"
      @deactivated="onDeactivated"
    >
      <component :is="Component" v-if="shouldCache(route)" :key="getComponentKey(route)" />
    </KeepAlive>

    <component :is="Component" v-else :key="route.path" />
  </RouterView>
</template>
```

## 🎯 高级用法

### 错误边界

```vue
<script setup>
import ErrorBoundary from './components/ErrorBoundary.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <ErrorBoundary>
      <Suspense>
        <template #default>
          <component :is="Component" :key="route.path" />
        </template>
        <template #fallback>
          <LoadingSpinner />
        </template>
      </Suspense>
    </ErrorBoundary>
  </RouterView>
</template>
```

### 权限控制

```vue
<script setup>
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 检查权限
function hasPermission(route) {
  const requiredRoles = route.meta.roles
  if (!requiredRoles) return true

  const userRoles = getCurrentUserRoles()
  return requiredRoles.some(role => userRoles.includes(role))
}

// 跳转到登录页
function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <div v-if="hasPermission(route)" class="authorized-content">
      <component :is="Component" :key="route.path" />
    </div>

    <div v-else class="unauthorized-content">
      <h2>访问被拒绝</h2>
      <p>您没有权限访问此页面</p>
      <button @click="goToLogin">去登录</button>
    </div>
  </RouterView>
</template>
```

### 布局切换

```vue
<script setup>
import { useRoute } from '@ldesign/router'
import { computed } from 'vue'
import AdminLayout from './layouts/AdminLayout.vue'
import AuthLayout from './layouts/AuthLayout.vue'
import DefaultLayout from './layouts/DefaultLayout.vue'

const route = useRoute()

// 根据路由选择布局
const layoutComponent = computed(() => {
  const layout = route.meta.layout

  switch (layout) {
    case 'admin':
      return AdminLayout
    case 'auth':
      return AuthLayout
    default:
      return DefaultLayout
  }
})
</script>

<template>
  <component :is="layoutComponent">
    <RouterView v-slot="{ Component, route }">
      <transition :name="route.meta.transition || 'fade'" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </RouterView>
  </component>
</template>
```

## 🎯 最佳实践

### 1. 性能优化

```vue
<!-- ✅ 推荐：使用 key 确保组件正确更新 -->
<RouterView v-slot="{ Component, route }">
  <component
    :is="Component"
    :key="route.path"
  />
</RouterView>

<!-- ❌ 避免：不使用 key 可能导致组件复用问题 -->
<RouterView v-slot="{ Component }">
  <component :is="Component" />
</RouterView>
```

### 2. 错误处理

```vue
<!-- ✅ 推荐：添加错误边界 -->
<RouterView v-slot="{ Component, route }">
  <ErrorBoundary>
    <component
      :is="Component"
      :key="route.path"
      v-if="Component"
    />
    <div v-else class="no-component">
      页面不存在
    </div>
  </ErrorBoundary>
</RouterView>
```

### 3. 加载状态

```vue
<!-- ✅ 推荐：处理加载状态 -->
<RouterView v-slot="{ Component, route }">
  <Suspense>
    <template #default>
      <component
        :is="Component"
        :key="route.path"
      />
    </template>
    <template #fallback>
      <div class="loading">
        <LoadingSpinner />
        <p>页面加载中...</p>
      </div>
    </template>
  </Suspense>
</RouterView>
```

RouterView 是构建路由应用的核心组件，通过合理使用其各种功能，你可以创建出功能丰富、用户体验优秀的应
用界面。
