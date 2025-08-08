# RouterLink 组件

RouterLink 是声明式导航的核心组件，提供了智能预加载、灵活样式控制等强大功能。

## 🎯 基础用法

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

```html
<!-- 输入 -->
<RouterLink to="/about">关于我们</RouterLink>

<!-- 输出 -->
<a href="/about" class="">关于我们</a>

<!-- 激活状态 -->
<a href="/about" class="router-link-active router-link-exact-active">关于我们</a>
```

## 🚀 智能预加载

LDesign Router 的独特功能 - 智能预加载：

### 预加载策略

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

### 预加载配置

```vue
<script setup>
const userIsPremium = computed(() => {
  return user.value?.plan === 'premium'
})
</script>

<template>
  <!-- 自定义预加载延迟 -->
  <RouterLink to="/delayed-page" preload="hover" :preload-delay="500"> 延迟预加载 </RouterLink>

  <!-- 条件预加载 -->
  <RouterLink to="/premium-feature" :preload="userIsPremium ? 'hover' : false">
    高级功能
  </RouterLink>
</template>
```

## 🎨 样式控制

### 激活状态

```vue
<template>
  <!-- 自定义激活类名 -->
  <RouterLink to="/dashboard" active-class="nav-active" exact-active-class="nav-exact">
    仪表板
  </RouterLink>
</template>

<style scoped>
.nav-active {
  color: #1890ff;
  font-weight: 500;
}

.nav-exact {
  background: #f0f8ff;
  border-radius: 4px;
  padding: 0.5rem;
}
</style>
```

### 导航菜单

```vue
<script setup>
const navItems = [
  { path: '/', title: '首页', icon: 'home' },
  { path: '/products', title: '产品', icon: 'box' },
  { path: '/about', title: '关于', icon: 'info' },
  { path: '/contact', title: '联系', icon: 'mail' },
]
</script>

<template>
  <nav class="main-nav">
    <RouterLink
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="nav-item"
      active-class="nav-item--active"
    >
      <Icon :name="item.icon" />
      <span>{{ item.title }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.main-nav {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #666;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: #e9ecef;
  color: #333;
}

.nav-item--active {
  background: #1890ff;
  color: white;
}
</style>
```

## 🔧 自定义渲染

### 使用插槽

```vue
<template>
  <RouterLink v-slot="{ href, navigate, isActive, isExactActive }" to="/custom" custom>
    <button
      :class="{
        'btn--active': isActive,
        'btn--exact': isExactActive,
      }"
      class="custom-button btn"
      @click="navigate"
    >
      <Icon name="link" />
      自定义按钮
    </button>
  </RouterLink>
</template>

<style scoped>
.btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.btn--active {
  border-color: #1890ff;
  color: #1890ff;
}

.btn--exact {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}
</style>
```

### 卡片式链接

```vue
<template>
  <RouterLink v-slot="{ href, navigate, isActive }" to="/product/123" custom>
    <article :class="{ active: isActive }" class="clickable-card product-card" @click="navigate">
      <img src="/product-image.jpg" alt="产品图片" />
      <div class="card-content">
        <h3>产品名称</h3>
        <p>产品描述...</p>
        <div class="card-footer">
          <span class="price">¥99</span>
          <span class="link-hint">点击查看详情</span>
        </div>
      </div>

      <!-- 隐藏的链接，保持可访问性 -->
      <a :href="href" class="sr-only">查看产品详情</a>
    </article>
  </RouterLink>
</template>

<style scoped>
.clickable-card {
  display: block;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
}

.clickable-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.clickable-card.active {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.card-content {
  padding: 1rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.price {
  font-size: 1.2rem;
  font-weight: bold;
  color: #f5222d;
}

.link-hint {
  font-size: 0.9rem;
  color: #666;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
```

## 🎯 高级用法

### 条件渲染

```vue
<script setup>
function hasPermission(role) {
  return user.value?.roles?.includes(role)
}
</script>

<template>
  <div class="nav-item">
    <!-- 根据权限显示不同链接 -->
    <RouterLink v-if="hasPermission('admin')" to="/admin" class="admin-link"> 管理后台 </RouterLink>

    <RouterLink v-else-if="hasPermission('user')" to="/dashboard" class="user-link">
      用户中心
    </RouterLink>

    <RouterLink v-else to="/login" class="login-link"> 请登录 </RouterLink>
  </div>
</template>
```

### 外部链接处理

```vue
<script setup>
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
    <Icon v-if="isExternal" name="external-link" class="external-icon" />
  </component>
</template>

<style scoped>
.external-link {
  color: #1890ff;
}

.external-icon {
  margin-left: 0.25rem;
  font-size: 0.8em;
}
</style>
```

### 分析追踪

```vue
<script setup>
const props = defineProps({
  to: [String, Object],
  preload: String,
  trackingCategory: String,
  trackingAction: String,
  trackingLabel: String,
})

function handleClick(event) {
  // 发送点击事件到分析服务
  const destination = typeof props.to === 'string' ? props.to : props.to.path

  // Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', props.trackingAction || 'click', {
      event_category: props.trackingCategory || 'navigation',
      event_label: props.trackingLabel || destination,
    })
  }

  // 自定义分析
  analytics.track('link_click', {
    destination,
    preload_strategy: props.preload,
    category: props.trackingCategory,
    timestamp: Date.now(),
  })
}
</script>

<template>
  <RouterLink :to="to" :preload="preload" class="tracked-link" @click="handleClick">
    <slot />
  </RouterLink>
</template>
```

## 📱 响应式设计

### 移动端优化

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
  <nav class="responsive-nav">
    <RouterLink
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="nav-link"
      :class="[{ 'nav-link--mobile': isMobile }]"
      :preload="isMobile ? 'visible' : 'hover'"
    >
      <Icon :name="item.icon" />
      <span class="nav-text">{{ item.title }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.responsive-nav {
  display: flex;
  gap: 1rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.nav-link--mobile {
  flex-direction: column;
  padding: 0.75rem;
  font-size: 0.9rem;
}

.nav-text {
  white-space: nowrap;
}

@media (max-width: 767px) {
  .responsive-nav {
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-link {
    justify-content: flex-start;
    width: 100%;
  }

  .nav-link--mobile .nav-text {
    margin-top: 0.25rem;
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

### 4. 样式一致性

```vue
<!-- ✅ 推荐：使用一致的样式类 -->
<RouterLink to="/page" class="btn btn-primary" active-class="btn--active">
  页面链接
</RouterLink>

<!-- ✅ 推荐：提供视觉反馈 -->
<RouterLink to="/page" class="nav-link" @mouseenter="showTooltip" @mouseleave="hideTooltip">
  带提示的链接
</RouterLink>
```

RouterLink 是构建导航的核心组件，通过合理使用其各种功能，特别是智能预加载，可以显著提升用户体验。
