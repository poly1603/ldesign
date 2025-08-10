# 增强的 RouterLink

LDesign Router 提供了功能强大的 RouterLink 组件，在保持与 Vue Router 完全兼容的同时，添加了大量实用
的增强功能。

## 基础用法

增强的 RouterLink 完全兼容标准的 Vue Router RouterLink：

```vue
<template>
  <!-- 基础链接 -->
  <RouterLink to="/home"> 首页 </RouterLink>

  <!-- 命名路由 -->
  <RouterLink :to="{ name: 'User', params: { id: 123 } }"> 用户详情 </RouterLink>

  <!-- 查询参数 -->
  <RouterLink :to="{ path: '/search', query: { q: 'vue' } }"> 搜索结果 </RouterLink>
</template>
```

## 样式变体

### 按钮样式

```vue
<template>
  <!-- 基础按钮 -->
  <RouterLink to="/action" variant="button"> 执行操作 </RouterLink>

  <!-- 不同尺寸 -->
  <RouterLink to="/small" variant="button" size="small"> 小按钮 </RouterLink>
  <RouterLink to="/medium" variant="button" size="medium"> 中按钮 </RouterLink>
  <RouterLink to="/large" variant="button" size="large"> 大按钮 </RouterLink>
</template>
```

### 标签页样式

```vue
<template>
  <nav class="tabs">
    <RouterLink to="/overview" variant="tab"> 概览 </RouterLink>
    <RouterLink to="/details" variant="tab"> 详情 </RouterLink>
    <RouterLink to="/settings" variant="tab"> 设置 </RouterLink>
  </nav>
</template>

<style>
.tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}
</style>
```

### 面包屑样式

```vue
<template>
  <nav class="breadcrumb">
    <RouterLink to="/" variant="breadcrumb"> 首页 </RouterLink>
    <RouterLink to="/products" variant="breadcrumb"> 产品 </RouterLink>
    <RouterLink to="/products/electronics" variant="breadcrumb"> 电子产品 </RouterLink>
    <RouterLink to="/products/electronics/phones" variant="breadcrumb"> 手机 </RouterLink>
  </nav>
</template>
```

### 卡片样式

```vue
<template>
  <div class="card-grid">
    <RouterLink to="/feature-a" variant="card" icon="icon-star">
      <h3>特色功能 A</h3>
      <p>功能描述...</p>
    </RouterLink>

    <RouterLink to="/feature-b" variant="card" icon="icon-heart">
      <h3>特色功能 B</h3>
      <p>功能描述...</p>
    </RouterLink>
  </div>
</template>
```

## 图标和徽章

### 图标支持

```vue
<template>
  <!-- 左侧图标 -->
  <RouterLink to="/messages" icon="icon-message" icon-position="left"> 消息 </RouterLink>

  <!-- 右侧图标 -->
  <RouterLink to="/external" icon="icon-external" icon-position="right" external>
    外部链接
  </RouterLink>
</template>
```

### 徽章系统

```vue
<template>
  <!-- 数字徽章 -->
  <RouterLink to="/notifications" badge="5" badge-variant="count" badge-color="#ff4757">
    通知
  </RouterLink>

  <!-- 圆点徽章 -->
  <RouterLink to="/live" badge-variant="dot" badge-color="#2ed573"> 直播 </RouterLink>

  <!-- 文本徽章 -->
  <RouterLink to="/new-feature" badge="NEW" badge-variant="text" badge-color="#5352ed">
    新功能
  </RouterLink>
</template>
```

## 预加载策略

### 鼠标悬停预加载

```vue
<template>
  <!-- 悬停时预加载，延迟 300ms -->
  <RouterLink to="/heavy-page" preload="hover" preload-delay="300"> 重型页面 </RouterLink>
</template>
```

### 可见时预加载

```vue
<template>
  <!-- 组件进入视口时预加载 -->
  <RouterLink to="/lazy-page" preload="visible"> 懒加载页面 </RouterLink>
</template>
```

### 立即预加载

```vue
<template>
  <!-- 组件挂载时立即预加载 -->
  <RouterLink to="/important-page" preload="immediate"> 重要页面 </RouterLink>
</template>
```

## 权限控制

### 基础权限检查

```vue
<template>
  <!-- 需要特定权限 -->
  <RouterLink to="/admin" permission="admin" fallback-to="/login"> 管理后台 </RouterLink>
</template>
```

### 多权限检查

```vue
<template>
  <!-- 需要多个权限中的任意一个 -->
  <RouterLink to="/settings" :permission="['user', 'admin']"> 设置 </RouterLink>
</template>
```

### 权限失败处理

```vue
<script setup>
function handlePermissionDenied(permission) {
  console.log('权限不足:', permission)
  // 显示升级提示等
}
</script>

<template>
  <!-- 权限检查失败时的处理 -->
  <RouterLink
    to="/premium-feature"
    permission="premium"
    fallback-to="/upgrade"
    @permission-denied="handlePermissionDenied"
  >
    高级功能
  </RouterLink>
</template>
```

## 确认对话框

### 基础确认

```vue
<template>
  <!-- 需要确认的操作 -->
  <RouterLink
    to="/logout"
    confirm-message="确定要退出登录吗？"
    confirm-title="退出确认"
    variant="button"
  >
    退出登录
  </RouterLink>
</template>
```

### 自定义确认处理

```vue
<script setup>
async function customConfirm(message, title) {
  // 使用自定义对话框组件
  return await showCustomDialog({
    title,
    message,
    type: 'warning',
    confirmText: '确定删除',
    cancelText: '取消',
  })
}
</script>

<template>
  <RouterLink to="/delete-account" :confirm-handler="customConfirm" variant="button">
    删除账户
  </RouterLink>
</template>
```

## 外部链接

```vue
<template>
  <!-- 外部链接 -->
  <RouterLink to="https://example.com" external target="_blank" icon="icon-external">
    外部链接
  </RouterLink>

  <!-- 邮件链接 -->
  <RouterLink to="mailto:support@example.com" external icon="icon-mail"> 联系我们 </RouterLink>
</template>
```

## 事件追踪

### 基础事件追踪

```vue
<template>
  <!-- 追踪用户行为 -->
  <RouterLink
    to="/product/123"
    track-event="product_view"
    :track-data="{ productId: '123', category: 'electronics' }"
  >
    查看产品
  </RouterLink>
</template>
```

### 自定义事件处理

```vue
<script setup>
function handleTrack(event, data) {
  // 发送到分析服务
  analytics.track(event, {
    ...data,
    timestamp: Date.now(),
    userId: getCurrentUserId(),
  })
}
</script>

<template>
  <RouterLink to="/download" @track="handleTrack"> 下载文件 </RouterLink>
</template>
```

## 加载状态

### 显示加载状态

```vue
<script setup>
import { ref } from 'vue'

const isSubmitting = ref(false)

async function handleSubmit() {
  isSubmitting.value = true
  try {
    await submitForm()
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <!-- 显示加载指示器 -->
  <RouterLink to="/submit" :loading="isSubmitting" :disabled="isSubmitting" variant="button">
    提交表单
  </RouterLink>
</template>
```

## 状态指示

### 脉冲效果

```vue
<template>
  <!-- 脉冲动画，吸引注意 -->
  <RouterLink to="/new-message" pulse badge="1" badge-variant="dot"> 新消息 </RouterLink>
</template>
```

### 发光效果

```vue
<template>
  <!-- 发光效果，突出重要链接 -->
  <RouterLink to="/special-offer" glow variant="button"> 限时优惠 </RouterLink>
</template>
```

## 键盘快捷键

```vue
<script setup>
function handleShortcut() {
  console.log('快捷键被触发')
}
</script>

<template>
  <!-- 支持键盘快捷键 -->
  <RouterLink to="/search" shortcut="Ctrl+K" @shortcut="handleShortcut"> 搜索 </RouterLink>
</template>
```

## 自定义渲染

### 使用插槽

```vue
<template>
  <RouterLink v-slot="{ navigate, isActive }" to="/custom" custom>
    <button :class="{ active: isActive }" @click="navigate">自定义按钮</button>
  </RouterLink>
</template>
```

### 完全自定义

```vue
<template>
  <RouterLink
    v-slot="{ navigate, isActive, isExactActive, isLoading, hasPermission }"
    to="/advanced"
    custom
  >
    <div
      class="custom-link"
      :class="{
        active: isActive,
        'exact-active': isExactActive,
        loading: isLoading,
        disabled: !hasPermission,
      }"
      @click="hasPermission ? navigate() : showPermissionError()"
    >
      <slot />
    </div>
  </RouterLink>
</template>
```

## 完整示例

```vue
<template>
  <div class="navigation">
    <!-- 主导航 -->
    <nav class="main-nav">
      <RouterLink to="/" variant="tab" icon="icon-home" preload="immediate"> 首页 </RouterLink>

      <RouterLink
        to="/products"
        variant="tab"
        icon="icon-grid"
        preload="hover"
        permission="products.view"
      >
        产品
      </RouterLink>

      <RouterLink
        to="/orders"
        variant="tab"
        icon="icon-list"
        badge="3"
        badge-variant="count"
        permission="orders.view"
      >
        订单
      </RouterLink>
    </nav>

    <!-- 用户菜单 -->
    <div class="user-menu">
      <RouterLink to="/profile" variant="button" size="small" icon="icon-user">
        个人资料
      </RouterLink>

      <RouterLink
        to="/logout"
        variant="button"
        size="small"
        confirm-message="确定要退出登录吗？"
        track-event="user_logout"
      >
        退出
      </RouterLink>
    </div>
  </div>
</template>

<style>
.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.main-nav {
  display: flex;
  gap: 1rem;
}

.user-menu {
  display: flex;
  gap: 0.5rem;
}
</style>
```

## 下一步

- [增强的 RouterView](/guide/enhanced-router-view) - 了解 RouterView 的增强功能
- [权限控制](/guide/permission-control) - 深入学习权限控制
- [API 参考](/api/router-link-props) - 查看完整的 Props 列表
