# RouterLink API

RouterLink 是 LDesign Router 的声明式导航组件，提供了丰富的功能和智能预加载能力。

## 📋 基础用法

### 简单链接

```vue
<template>
  <!-- 基础链接 -->
  <RouterLink to="/about"> 关于我们 </RouterLink>

  <!-- 对象形式 -->
  <RouterLink :to="{ path: '/user', query: { id: '123' } }"> 用户页面 </RouterLink>

  <!-- 命名路由 -->
  <RouterLink :to="{ name: 'UserProfile', params: { id: '123' } }"> 用户资料 </RouterLink>
</template>
```

### 渲染结果

RouterLink 默认渲染为 `<a>` 标签：

```html
<!-- 输入 -->
<RouterLink to="/about">关于我们</RouterLink>

<!-- 输出 -->
<a href="/about" class="">关于我们</a>

<!-- 激活状态 -->
<a href="/about" class="router-link-active router-link-exact-active">关于我们</a>
```

## 🎯 Props 属性

### to

目标路由位置，支持字符串和对象形式。

**类型：** `RouteLocationRaw` **必需：** 是

```vue
<template>
  <!-- 字符串路径 -->
  <RouterLink to="/about"> 关于我们 </RouterLink>

  <!-- 对象形式 -->
  <RouterLink :to="{ path: '/user/123' }"> 用户 </RouterLink>

  <!-- 命名路由 -->
  <RouterLink :to="{ name: 'User', params: { id: '123' } }"> 用户资料 </RouterLink>

  <!-- 带查询参数 -->
  <RouterLink :to="{ path: '/search', query: { q: 'vue' } }"> 搜索 </RouterLink>

  <!-- 带锚点 -->
  <RouterLink :to="{ path: '/docs', hash: '#installation' }"> 安装文档 </RouterLink>
</template>
```

### replace

是否使用 `router.replace()` 而不是 `router.push()`。

**类型：** `boolean` **默认值：** `false`

```vue
<template>
  <!-- 普通导航（会在历史中留下记录） -->
  <RouterLink to="/about"> 关于我们 </RouterLink>

  <!-- 替换导航（不会在历史中留下记录） -->
  <RouterLink to="/login" replace> 登录 </RouterLink>
</template>
```

### activeClass

链接激活时的 CSS 类名。

**类型：** `string` **默认值：** `'router-link-active'`

```vue
<template>
  <RouterLink to="/dashboard" active-class="active-link"> 仪表板 </RouterLink>
</template>

<style>
.active-link {
  color: #1890ff;
  font-weight: bold;
}
</style>
```

### exactActiveClass

链接精确激活时的 CSS 类名。

**类型：** `string` **默认值：** `'router-link-exact-active'`

```vue
<template>
  <RouterLink to="/user/profile" exact-active-class="exact-active"> 个人资料 </RouterLink>
</template>

<style>
.exact-active {
  background: #f0f8ff;
  border-radius: 4px;
}
</style>
```

### ariaCurrentValue

当链接激活时 `aria-current` 属性的值。

**类型：** `'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false'` **默认值：** `'page'`

```vue
<template>
  <RouterLink to="/current-step" aria-current-value="step"> 当前步骤 </RouterLink>
</template>
```

## 🚀 智能预加载

LDesign Router 的独特功能 - 智能预加载：

### preload

预加载策略，控制何时预加载目标路由。

**类型：** `'hover' | 'visible' | 'idle' | 'immediate' | false` **默认值：** `false`

```vue
<template>
  <!-- 悬停时预加载 -->
  <RouterLink to="/products" preload="hover"> 产品列表 </RouterLink>

  <!-- 可见时预加载 -->
  <RouterLink to="/heavy-page" preload="visible"> 重型页面 </RouterLink>

  <!-- 空闲时预加载 -->
  <RouterLink to="/background" preload="idle"> 后台页面 </RouterLink>

  <!-- 立即预加载 -->
  <RouterLink to="/important" preload="immediate"> 重要页面 </RouterLink>

  <!-- 禁用预加载 -->
  <RouterLink to="/no-preload" :preload="false"> 不预加载 </RouterLink>
</template>
```

### preloadDelay

预加载延迟时间（毫秒）。

**类型：** `number` **默认值：** `100`

```vue
<template>
  <!-- 悬停 500ms 后预加载 -->
  <RouterLink to="/delayed-page" preload="hover" :preload-delay="500"> 延迟预加载 </RouterLink>
</template>
```

## 🎨 自定义渲染

### custom

启用自定义渲染模式，不渲染 `<a>` 标签。

**类型：** `boolean` **默认值：** `false`

```vue
<template>
  <RouterLink v-slot="{ href, navigate, isActive, isExactActive }" to="/custom" custom>
    <button :class="{ active: isActive }" class="custom-button" @click="navigate">
      <Icon name="link" />
      自定义按钮
    </button>
  </RouterLink>
</template>
```

### 插槽参数

当使用 `custom` 属性时，RouterLink 提供以下插槽参数：

| 参数            | 类型                    | 描述             |
| --------------- | ----------------------- | ---------------- |
| `href`          | `string`                | 解析后的 URL     |
| `route`         | `RouteLocationResolved` | 解析后的路由位置 |
| `navigate`      | `Function`              | 导航函数         |
| `isActive`      | `boolean`               | 是否激活         |
| `isExactActive` | `boolean`               | 是否精确激活     |

```vue
<template>
  <RouterLink v-slot="{ href, route, navigate, isActive, isExactActive }" to="/profile" custom>
    <div class="custom-link" :class="{ active: isActive, exact: isExactActive }">
      <img :src="route.meta.icon" alt="" />
      <span>{{ route.meta.title }}</span>
      <a :href="href" class="hidden-link" @click="navigate">
        <!-- 隐藏的链接，保持可访问性 -->
      </a>
    </div>
  </RouterLink>
</template>
```

## 🎭 高级用法

### 条件渲染

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  userRole: String,
  targetPage: String,
})

const showLink = computed(() => {
  return hasPermission(props.userRole, props.targetPage)
})

const dynamicRoute = computed(() => {
  return `/pages/${props.targetPage}`
})

const linkClass = computed(() => {
  return {
    'premium-link': props.userRole === 'premium',
    'admin-link': props.userRole === 'admin',
  }
})

const preloadStrategy = computed(() => {
  return props.userRole === 'premium' ? 'hover' : 'visible'
})
</script>

<template>
  <RouterLink v-if="showLink" :to="dynamicRoute" :class="linkClass" :preload="preloadStrategy">
    {{ linkText }}
  </RouterLink>
</template>
```

### 外部链接处理

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  to: [String, Object],
  external: Boolean,
})

const isExternal = computed(() => {
  if (props.external) return true
  if (typeof props.to === 'string') {
    return /^https?:\/\//.test(props.to)
  }
  return false
})

const linkClass = computed(() => {
  return {
    'external-link': isExternal.value,
    'internal-link': !isExternal.value,
  }
})
</script>

<template>
  <component
    :is="isExternal ? 'a' : 'RouterLink'"
    :href="isExternal ? to : undefined"
    :to="isExternal ? undefined : to"
    :target="isExternal ? '_blank' : undefined"
    :rel="isExternal ? 'noopener noreferrer' : undefined"
    :class="linkClass"
  >
    <slot />
    <Icon v-if="isExternal" name="external-link" />
  </component>
</template>
```

### 分析追踪

```vue
<script setup>
const props = defineProps({
  to: [String, Object],
  preload: String,
  trackingCategory: String,
  trackingAction: String,
})

function handleClick(event) {
  // 发送点击事件到分析服务
  if (typeof gtag !== 'undefined') {
    gtag('event', props.trackingAction || 'click', {
      event_category: props.trackingCategory || 'navigation',
      event_label: typeof props.to === 'string' ? props.to : props.to.path,
    })
  }

  // 自定义分析
  analytics.track('link_click', {
    destination: typeof props.to === 'string' ? props.to : props.to.path,
    preload_strategy: props.preload,
    timestamp: Date.now(),
  })
}
</script>

<template>
  <RouterLink :to="to" :preload="preload" @click="handleClick">
    <slot />
  </RouterLink>
</template>
```

## 🎯 样式和主题

### 默认样式

```css
/* RouterLink 的默认样式 */
.router-link-active {
  color: #1890ff;
}

.router-link-exact-active {
  color: #1890ff;
  font-weight: bold;
}
```

### 自定义主题

```vue
<template>
  <RouterLink
    to="/dashboard"
    class="nav-link"
    active-class="nav-link--active"
    exact-active-class="nav-link--exact"
  >
    仪表板
  </RouterLink>
</template>

<style scoped>
.nav-link {
  display: inline-block;
  padding: 0.5rem 1rem;
  color: #666;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: #f5f5f5;
  color: #333;
}

.nav-link--active {
  color: #1890ff;
  background: #f0f8ff;
}

.nav-link--exact {
  color: #1890ff;
  background: #e6f7ff;
  font-weight: 600;
}
</style>
```

### 响应式设计

```vue
<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<template>
  <RouterLink
    to="/mobile-page"
    class="nav-link"
    :class="[{ 'nav-link--mobile': isMobile }]"
    :preload="isMobile ? 'visible' : 'hover'"
  >
    移动端页面
  </RouterLink>
</template>

<style scoped>
.nav-link {
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.nav-link--mobile {
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  border-radius: 8px;
}

@media (max-width: 767px) {
  .nav-link {
    display: block;
    width: 100%;
    text-align: center;
  }
}
</style>
```

## 🎯 最佳实践

### 1. 合理使用预加载

```vue
<!-- ✅ 推荐：根据重要性选择预加载策略 -->
<RouterLink to="/dashboard" preload="immediate">
  仪表板（重要页面）
</RouterLink>

<RouterLink to="/products" preload="hover">
  产品列表（常用页面）
</RouterLink>

<RouterLink to="/help" preload="visible">
  帮助页面（偶尔使用）
</RouterLink>

<!-- ❌ 避免：所有链接都立即预加载 -->
<RouterLink to="/rarely-used" preload="immediate">
  很少使用的页面
</RouterLink>
```

### 2. 语义化和可访问性

```vue
<!-- ✅ 推荐：提供有意义的链接文本 -->
<RouterLink to="/user/profile">
  查看个人资料
</RouterLink>

<!-- ✅ 推荐：使用 aria 属性 -->
<RouterLink to="/settings" aria-label="打开用户设置页面">
  设置
</RouterLink>

<!-- ❌ 避免：无意义的链接文本 -->
<RouterLink to="/user/profile">
  点击这里
</RouterLink>
```

### 3. 性能优化

```vue
<!-- ✅ 推荐：为大型组件使用可见预加载 -->
<RouterLink to="/heavy-dashboard" preload="visible">
  重型仪表板
</RouterLink>

<!-- ✅ 推荐：为移动端优化预加载策略 -->
<RouterLink to="/mobile-page" :preload="isMobile ? 'visible' : 'hover'">
  移动端优化页面
</RouterLink>
```

RouterLink 是构建导航的核心组件，通过合理使用其各种功能，特别是智能预加载，可以显著提升用户体验。
